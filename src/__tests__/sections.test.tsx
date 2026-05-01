import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop: string) => {
      const Component = ({ children, ...rest }: Record<string, unknown>) => {
        const filtered: Record<string, unknown> = {}
        const skip = new Set(['whileInView', 'whileHover', 'whileTap', 'viewport', 'initial', 'animate', 'exit', 'transition', 'variants'])
        for (const [k, v] of Object.entries(rest)) {
          if (!skip.has(k)) filtered[k] = v
        }
        const Tag = prop as keyof React.JSX.IntrinsicElements
        return <Tag {...filtered}>{children as React.ReactNode}</Tag>
      }
      Component.displayName = `motion.${prop}`
      return Component
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props
    void fill; void priority
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...rest} />
  },
}))

import { Hero } from '@/components/sections/Hero'
import { Benefits } from '@/components/sections/Benefits'
import { Testimonials } from '@/components/sections/Testimonials'
import { FinalCTA } from '@/components/sections/FinalCTA'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { SITE_CONFIG, BENEFITS } from '@/lib/constants'

describe('Hero', () => {
  it('renders headline', () => {
    render(<Hero />)
    expect(screen.getByText(/Tu boda, sin caos/)).toBeInTheDocument()
    expect(screen.getByText(/Tu recuerdo, para siempre/)).toBeInTheDocument()
  })

  it('has calendar CTA with correct href', () => {
    render(<Hero />)
    const link = screen.getByRole('link', { name: 'Agenda tu demo gratis' })
    expect(link).toHaveAttribute('href', SITE_CONFIG.calendarUrl)
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('has WhatsApp CTA as a button that opens preview modal', () => {
    render(<Hero />)
    const btn = screen.getByRole('button', { name: 'Chatea por WhatsApp' })
    expect(btn).toBeInTheDocument()
  })
})

describe('Benefits', () => {
  it('renders all 5 benefit cards', () => {
    render(<Benefits />)
    for (const card of BENEFITS) {
      expect(screen.getByText(card.title)).toBeInTheDocument()
    }
  })

  it('renders mockup images for each card', () => {
    render(<Benefits />)
    for (const card of BENEFITS) {
      const img = screen.getByAltText(card.mockupAlt)
      expect(img).toHaveAttribute('src', expect.stringContaining(`mockup${card.id}.png`))
    }
  })

  it('has beneficios section id', () => {
    const { container } = render(<Benefits />)
    expect(container.querySelector('#beneficios')).toBeInTheDocument()
  })
})

describe('Testimonials', () => {
  it('renders section heading', () => {
    render(<Testimonials />)
    expect(screen.getByText('Confianza que se percibe desde el primer vistazo.')).toBeInTheDocument()
  })

  it('has testimonios section id', () => {
    const { container } = render(<Testimonials />)
    expect(container.querySelector('#testimonios')).toBeInTheDocument()
  })
})

describe('FinalCTA', () => {
  it('has WhatsApp CTA as a button that opens preview modal', () => {
    render(<FinalCTA />)
    const btn = screen.getByRole('button', { name: 'Chatea por WhatsApp' })
    expect(btn).toBeInTheDocument()
  })

  it('has contacto section id', () => {
    const { container } = render(<FinalCTA />)
    expect(container.querySelector('#contacto')).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('renders contact info', () => {
    render(<Footer />)
    const footer = screen.getByRole('contentinfo')
    expect(within(footer).getByText(SITE_CONFIG.email)).toBeInTheDocument()
    expect(within(footer).getByText(SITE_CONFIG.phone)).toBeInTheDocument()
  })

  it('renders copyright', () => {
    render(<Footer />)
    expect(screen.getByText(/SoomosNova\. Todos los derechos reservados/)).toBeInTheDocument()
  })

  it('renders social links with aria labels', () => {
    render(<Footer />)
    expect(screen.getByLabelText('Seguir a SoomosNova en Instagram')).toBeInTheDocument()
    expect(screen.getByLabelText('Seguir a SoomosNova en Facebook')).toBeInTheDocument()
  })
})

describe('Navbar', () => {
  it('renders logo', () => {
    render(<Navbar />)
    expect(screen.getByLabelText('SoomosNova — inicio')).toBeInTheDocument()
  })

  it('renders nav links', () => {
    render(<Navbar />)
    const buttons = screen.getAllByRole('button')
    const labels = buttons.map((b) => b.textContent)
    expect(labels).toContain('Beneficios')
    expect(labels).toContain('Testimonios')
    expect(labels).toContain('Contáctanos')
  })

  it('renders hamburger button', () => {
    render(<Navbar />)
    expect(screen.getByLabelText('Abrir menú')).toBeInTheDocument()
  })
})
