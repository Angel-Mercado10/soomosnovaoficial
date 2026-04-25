import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * In-memory rate limiter — Edge-compatible (no Node.js modules).
 * Stores IP → { count, resetTime } per route group.
 * NOTE: This is per-instance; in a multi-instance deployment use Redis or Upstash.
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Returns true if the request should be rate-limited (i.e., limit exceeded).
 * @param key     Unique key per IP+route-group
 * @param limit   Max requests allowed in the window
 * @param windowMs  Window duration in milliseconds
 */
function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    return false
  }

  if (entry.count >= limit) {
    return true
  }

  entry.count++
  return false
}

/** Extract client IP from standard headers (works on Vercel, Cloudflare, etc.) */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

/**
 * Middleware de Next.js que:
 * 1. Aplica rate limiting por IP en rutas públicas sensibles.
 * 2. Refresca la sesión de Supabase en cada request.
 * 3. Protege todas las rutas /dashboard/* — redirige al login si no hay sesión.
 * 4. Redirige al dashboard si una sesión activa intenta acceder a /auth/*.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)

  // ─── Rate Limiting ─────────────────────────────────────────────────────────

  // /i/[token] y /rsvp/[token] páginas públicas: 30 req/min
  if (pathname.startsWith('/i/') || pathname.startsWith('/rsvp/')) {
    if (isRateLimited(`page:${ip}`, 30, RATE_LIMIT_WINDOW_MS)) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': '60',
        },
      })
    }
  }

  // /api/rsvp/confirmar: 10 req/min
  if (pathname === '/api/rsvp/confirmar') {
    if (isRateLimited(`api:rsvp:${ip}`, 10, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Demasiadas solicitudes. Intentá en un minuto.' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      )
    }
  }

  // /api/album/*: 20 req/min
  if (pathname.startsWith('/api/album/')) {
    if (isRateLimited(`api:album:${ip}`, 20, RATE_LIMIT_WINDOW_MS)) {
      return NextResponse.json(
        { success: false, error: 'Demasiadas solicitudes al álbum. Intentá en un minuto.' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      )
    }
  }

  // ─── Supabase session refresh ───────────────────────────────────────────────

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Evita romper todo el sitio si faltan variables en el runtime de Vercel
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({
      request,
    })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANTE: no ejecutar código entre createServerClient y getUser.
  // getUser refresca el token automáticamente.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Rutas del dashboard requieren autenticación
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone()
      loginUrl.pathname = '/auth/login'
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Rutas de auth redirigen al dashboard si ya hay sesión
  if (pathname.startsWith('/auth/') && pathname !== '/auth/callback') {
    if (user) {
      const dashboardUrl = request.nextUrl.clone()
      dashboardUrl.pathname = '/dashboard'
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/auth/:path*',
    '/api/:path*',
    '/i/:path*',
    '/rsvp/:path*',
  ],
}
