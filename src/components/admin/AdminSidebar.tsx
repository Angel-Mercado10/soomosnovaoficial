'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { label: 'Overview', href: '/admin', icon: '▦', exact: true },
  { label: 'Demos / Pendientes', href: '/admin/demos', icon: '⏳', exact: false },
  { label: 'Parejas', href: '/admin/parejas', icon: '💑', exact: false },
  { label: 'Eventos', href: '/admin/eventos', icon: '📅', exact: false },
  { label: 'Pagos', href: '/admin/pagos', icon: '💳', exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean): boolean {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className="w-56 shrink-0 bg-[#111111] border-r border-[#1E1E1E] flex flex-col min-h-screen sticky top-0"
      aria-label="Navegación admin"
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#1E1E1E]">
        <p className="font-cormorant text-xl text-white">
          Soomos<span className="text-[#C9A84C]">Nova</span>
        </p>
        <p className="text-[10px] text-[#C9A84C] uppercase tracking-widest mt-0.5">
          Admin
        </p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[#1A1A1A]'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-5 border-t border-[#1E1E1E] pt-4">
        <Link
          href="/auth/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#9CA3AF] hover:text-red-400 hover:bg-red-400/5 transition-colors w-full"
        >
          <span className="text-base leading-none">↩</span>
          Cerrar sesión
        </Link>
      </div>
    </aside>
  )
}
