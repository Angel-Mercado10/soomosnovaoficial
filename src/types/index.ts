export type SiteConfig = {
  siteName: string
  domain: string
  calendarUrl: string
  whatsappNumber: string
  whatsappUrl: string
  email: string
  phone: string
}

export type BenefitCard = {
  id: number
  title: string
  description: string
  tag: string
  mockupAlt: string
}

export type NavLink = {
  label: string
  href: string
}

export type SocialLink = {
  platform: 'instagram' | 'facebook'
  url: string
  ariaLabel: string
}

export type MetaConfig = {
  title: string
  description: string
  ogImage: string
  canonical: string
  twitterCard: string
}

export type ModalState = {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}
