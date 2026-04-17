'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrolled } from '@/hooks/useScrolled'
import { NAV_LINKS, SITE_CONFIG } from '@/lib/constants'

function scrollTo(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  el?.scrollIntoView({ behavior: 'smooth' })
}

export function Navbar() {
  const scrolled = useScrolled(80)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleNavClick = (href: string) => {
    scrollTo(href)
    setMenuOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'bg-nova-black/95 backdrop-blur-xl border-b border-nova-border shadow-[0_1px_0_rgba(201,168,76,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" aria-label="SoomosNova — inicio" className="flex items-center gap-0 group">
          <span className="font-cormorant text-[1.375rem] font-semibold tracking-wide text-white group-hover:text-white/90 transition-colors duration-200">
            Soomos
          </span>
          <span className="font-cormorant text-[1.375rem] font-semibold tracking-wide text-nova-gold group-hover:text-nova-gold-bright transition-colors duration-200">
            Nova
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="text-[0.8125rem] text-white/55 hover:text-white/90 transition-colors duration-200 cursor-pointer tracking-wide"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-[0.8125rem] text-white/55 hover:text-white/90 transition-colors duration-200 tracking-wide px-3 py-2"
          >
            Iniciar sesión
          </Link>
          <a
            href={SITE_CONFIG.calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-nova-gold/50 bg-nova-gold/[0.08] px-5 py-2 text-[0.8125rem] font-medium text-nova-gold hover:border-nova-gold hover:bg-nova-gold/[0.15] hover:text-nova-gold-bright transition-all duration-300"
          >
            Agenda demo
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 cursor-pointer"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`block h-px w-6 bg-white/80 transition-transform duration-300 origin-center ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
          />
          <span
            className={`block h-px w-6 bg-white/80 transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-px w-6 bg-white/80 transition-transform duration-300 origin-center ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden border-t border-nova-border bg-nova-black/98 backdrop-blur-xl"
          >
            <ul className="flex flex-col px-6 py-5 gap-1" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left text-base text-white/65 hover:text-white transition-colors duration-200 py-2.5 cursor-pointer border-b border-nova-border-subtle last:border-0"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-3 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center text-sm text-white/55 hover:text-white/90 transition-colors duration-200 py-2"
                >
                  Iniciar sesión
                </Link>
                <a
                  href={SITE_CONFIG.calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center rounded-full border border-nova-gold/50 bg-nova-gold/[0.08] px-5 py-2.5 text-sm font-medium text-nova-gold hover:border-nova-gold hover:bg-nova-gold/[0.15] transition-all duration-300"
                >
                  Agenda tu demo gratis
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
