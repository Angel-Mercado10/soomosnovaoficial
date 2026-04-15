import type { Evento } from '@/types/database'
import type { ReactElement } from 'react'
import { PlantillaClasica } from './PlantillaClasica'
import { PlantillaArtDeco } from './PlantillaArtDeco'
import { PlantillaCelestial } from './PlantillaCelestial'
import { PlantillaBotanical } from './PlantillaBotanical'
import { PlantillaRomantica } from './PlantillaRomantica'
import { PageTransition } from '@/components/ui/PageTransition'
import type { InvitationTemplateProps } from './types'

export type InvitationTemplate = NonNullable<Evento['template']>

export const TEMPLATES: Record<InvitationTemplate, { label: string; description: string; previewColors: string[] }> = {
  clasica: {
    label: 'Clásica',
    description: 'Elegancia atemporal. Fondo negro, tipografía serif y detalles dorados.',
    previewColors: ['#0A0A0A', '#C9A84C', '#1A1A1A'],
  },
  'art-deco': {
    label: 'Art Déco',
    description: 'Glamour de los años 20. Ornamentos geométricos y dorado intenso.',
    previewColors: ['#080605', '#D4A017', '#110D08'],
  },
  celestial: {
    label: 'Celestial',
    description: 'Magia nocturna. Azul profundo, plata y estrellas animadas.',
    previewColors: ['#060814', '#A8B8E8', '#0D1128'],
  },
  botanical: {
    label: 'Botanical',
    description: 'Naturaleza viva. Verde oscuro con ilustraciones botánicas doradas.',
    previewColors: ['#060C08', '#6B9E6B', '#0C1610'],
  },
  romantica: {
    label: 'Romántica',
    description: 'Amor en flor. Tonos rojizos, rosas y ornamentos florales.',
    previewColors: ['#0C0608', '#C97A9A', '#1A0C10'],
  },
}

export function InvitacionTemplate(props: InvitationTemplateProps) {
  const template = props.evento.template ?? 'clasica'

  let content: ReactElement
  switch (template) {
    case 'art-deco':  content = <PlantillaArtDeco {...props} />; break
    case 'celestial': content = <PlantillaCelestial {...props} />; break
    case 'botanical': content = <PlantillaBotanical {...props} />; break
    case 'romantica': content = <PlantillaRomantica {...props} />; break
    default:          content = <PlantillaClasica {...props} />
  }

  return <PageTransition>{content}</PageTransition>
}
