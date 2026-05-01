import type { SiteConfig, BenefitCard, NavLink, SocialLink, MetaConfig } from '@/types'

export const SITE_CONFIG: SiteConfig = {
  siteName: 'SoomosNova',
  domain: 'soomosnova.com',
  calendarUrl: 'https://calendar.app.google/JgHUuWfwyhUqsLV3A',
  whatsappNumber: '525569695490',
  whatsappUrl: 'https://wa.me/525569695490',
  email: 'hola@soomosnova.com',
  phone: '+52 55 5995 8257',
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Beneficios', href: '#beneficios' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Contáctanos', href: '#contacto' },
]

export const BENEFITS: BenefitCard[] = [
  {
    id: 1,
    title: 'Invitación premium desde el primer contacto',
    description: 'Confirmaciones rápidas y sin seguimiento manual.',
    tag: 'MENOS FRICCIÓN · MÁS CONTROL',
    mockupAlt: 'Vista de invitación digital premium',
  },
  {
    id: 2,
    title: 'Acceso QR preciso en segundos',
    description: 'Cada invitado entra con validación única y segura.',
    tag: 'SIN FILAS LARGAS · SIN ACCESOS NO AUTORIZADOS',
    mockupAlt: 'Vista del sistema de validación QR',
  },
  {
    id: 3,
    title: 'La memoria de tu boda, para siempre',
    description:
      'Un álbum compartido donde tus invitados suben fotos, videos y dedicatorias. Disponible por 5 años.',
    tag: 'ORDEN TOTAL · PRIVACIDAD REAL',
    mockupAlt: 'Vista del álbum compartido',
  },
  {
    id: 4,
    title: 'Decisiones claras antes y durante el evento',
    description: 'Visualiza asistencia en tiempo real y ajusta logística al instante.',
    tag: 'INFORMACIÓN ACCIONABLE · TRANQUILIDAD OPERATIVA',
    mockupAlt: 'Vista del dashboard de asistencia',
  },
  {
    id: 5,
    title: 'RSVP automático sin perseguir a nadie',
    description:
      'El sistema manda recordatorios a los que no han confirmado. Tú no haces nada.',
    tag: 'AUTOMATIZACIÓN REAL · CERO ESFUERZO MANUAL',
    mockupAlt: 'Vista del sistema de recordatorios RSVP',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'instagram',
    url: 'https://www.instagram.com/soomosnova',
    ariaLabel: 'Seguir a SoomosNova en Instagram',
  },
  {
    platform: 'facebook',
    url: 'https://www.facebook.com/profile.php?id=61588124897380',
    ariaLabel: 'Seguir a SoomosNova en Facebook',
  },
]

export const META_CONFIG: MetaConfig = {
  title: 'SoomosNova — Gestión digital premium para bodas en México',
  description:
    'Invitaciones digitales con QR, RSVP automático, control de acceso y álbum compartido permanente. Todo en un solo sistema.',
  ogImage: '/og-image.png',
  canonical: 'https://soomosnova.com',
  twitterCard: 'summary_large_image',
}
