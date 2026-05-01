export const VALID_TEMPLATES = [
  'clasica',
  'art-deco',
  'celestial',
  'botanical',
  'romantica',
] as const

export type Template = (typeof VALID_TEMPLATES)[number]

export interface InvitadoDemoInput {
  nombre: string
  email?: string
  telefono?: string
}

export interface CrearDemoInput {
  nombre_1: string
  nombre_2: string
  email_contacto: string
  telefono?: string
  plan: 'fundador' | 'starter' | 'premium'
  nombre_evento: string
  fecha_evento: string
  hora_evento?: string
  lugar_nombre?: string
  lugar_direccion?: string
  dress_code?: string
  template: Template
  crear_paquete: boolean
  invitados: InvitadoDemoInput[]
}

export interface EventoCreado {
  id: string
  slug: string
  template: Template
  invitados: { nombre: string; token: string }[]
}

export interface CrearDemoResult {
  success: boolean
  error?: string
  eventos?: EventoCreado[]
  pareja_id?: string
}
