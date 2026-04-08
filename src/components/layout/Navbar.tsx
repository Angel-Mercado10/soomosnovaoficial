'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrolled } from '@/hooks/useScrolled'
import { NAV_LINKS } from '@/lib/constants'

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
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-md border-b border-nova-border' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" aria-label="SoomosNova — inicio" className="flex items-center">
          <span className="font-cormorant text-2xl font-semibold tracking-wide text-white">
            Soomos
          </span>
          <span className="font-cormorant text-2xl font-semibold tracking-wide text-nova-gold">
            Nova
          </span>
        </a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2 cursor-pointer"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`}
          />
          <span
            className={`block h-0.5 w-6 bg-white transition-transform duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden border-t border-nova-border bg-black/95 backdrop-blur-md"
          >
            <ul className="flex flex-col px-6 py-4 gap-4" role="list">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => handleNavClick(link.href)}
                    className="w-full text-left text-base text-white/80 hover:text-white transition-colors duration-200 py-1 cursor-pointer"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
