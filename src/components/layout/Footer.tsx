import Link from 'next/link'
import { SITE_CONFIG, SOCIAL_LINKS } from '@/lib/constants'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer className="border-t border-nova-border bg-nova-black px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" aria-label="SoomosNova — inicio">
              <span className="font-cormorant text-2xl font-semibold text-white">Soomos</span>
              <span className="font-cormorant text-2xl font-semibold text-nova-gold">Nova</span>
            </Link>
            <p className="mt-3 text-sm text-nova-gray leading-relaxed max-w-xs">
              Gestión digital premium para invitados en bodas de alta gama.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-widest text-white/50 uppercase">
              Contacto
            </h3>
            <ul className="space-y-2 text-sm text-nova-gray">
              <li>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {SITE_CONFIG.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone.replace(/\s/g, '')}`}
                  className="hover:text-white transition-colors duration-200"
                >
                  {SITE_CONFIG.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-xs font-semibold tracking-widest text-white/50 uppercase">
              Redes
            </h3>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  aria-label={link.ariaLabel}
                  className="text-nova-gray hover:text-white transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.platform === 'instagram' ? (
                    <InstagramIcon className="h-5 w-5" />
                  ) : (
                    <FacebookIcon className="h-5 w-5" />
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-nova-border pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} SoomosNova. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
