# SoomosNova — Landing Page

Landing page estática de presentación para **SoomosNova**, el sistema de gestión digital premium para bodas en México. Orientada a conversión: agenda de demo vía Google Calendar y contacto directo por WhatsApp.

---

## Stack

| Categoría | Tecnología |
|---|---|
| Framework | Next.js 15 · App Router · TypeScript estricto |
| Estilos | Tailwind CSS v4 |
| Animaciones | Framer Motion (`whileInView`, `AnimatePresence`) |
| Fuentes | Cormorant Garamond + Geist Sans vía `next/font/google` |
| Deploy | Vercel · `soomosnova.com` |

---

## Requisitos

- Node.js 20+
- npm 10+

---

## Instalación

```bash
# Clonar el repositorio
git clone git@github.com:Angel-Mercado10/soomosnovaoficial.git
cd soomosnovaoficial

# Instalar dependencias
npm install

# Correr en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con hot reload |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción local |
| `npm run lint` | Lint con ESLint |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx          — Fonts, metadata global, html lang="es-MX"
│   ├── page.tsx            — Composición de secciones (sin lógica propia)
│   └── globals.css         — Reset, design tokens (@theme Tailwind v4), scroll-behavior
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      — Logo, links, hamburger menu, useScrolled
│   │   └── Footer.tsx      — Logo, tagline, columnas contacto y redes sociales
│   ├── sections/
│   │   ├── Hero.tsx        — Headline, subheadline, CTAs con animación de entrada
│   │   ├── Benefits.tsx    — 5 cards con número, título, descripción, tag y mockup placeholder
│   │   ├── Testimonials.tsx — Card centrado con cita placeholder
│   │   ├── FinalCTA.tsx    — Eyebrow, título, subtítulo, botón WhatsApp
│   │   └── WhatsAppFloat.tsx — Botón fijo inferior derecho, dispara Modal
│   └── ui/
│       ├── Button.tsx      — Variantes: primary, secondary, ghost. Acepta as="a" o as="button"
│       └── Modal.tsx       — Dialog accesible con focus trap y cierre con Escape
├── hooks/
│   ├── useScrolled.ts      — Boolean: scroll > 80px (navbar transparente → negro)
│   └── useModal.ts         — Estado open/close para el modal de WhatsApp
├── lib/
│   └── constants.ts        — SITE_CONFIG, NAV_LINKS, BENEFITS, SOCIAL_LINKS, META_CONFIG
└── types/
    └── index.ts            — Tipos TypeScript exportados: SiteConfig, BenefitCard, etc.
```

---

## Design System

Todos los tokens viven en `src/app/globals.css` bajo `@theme inline` (Tailwind v4).

| Token | Clase Tailwind | Valor |
|---|---|---|
| Fondo principal | `bg-nova-black` | `#0A0A0A` |
| Texto principal | `text-nova-white` | `#FFFFFF` |
| Texto secundario | `text-nova-gray` | `#9CA3AF` |
| Acento dorado | `text-nova-gold` / `bg-nova-gold` | `#C9A84C` |
| Superficie card | `bg-nova-card` | `#1A1A1A` |
| Borde | `border-nova-border` | `#2A2A2A` |
| Headline font | `font-cormorant` | Cormorant Garamond |
| Body font | `font-sans` | Geist Sans |

---

## Contenido editable

Todo el contenido editable está centralizado en **`src/lib/constants.ts`**. No hay variables de entorno — todo es público en v1.

### Cambiar el número de WhatsApp

```ts
// src/lib/constants.ts
export const SITE_CONFIG: SiteConfig = {
  whatsappNumber: '5255995 8257',   // ← reemplazar aquí
  whatsappUrl: 'https://wa.me/5255995 8257', // ← y aquí (sin espacios en la URL)
}
```

### Cambiar el link de Google Calendar

```ts
export const SITE_CONFIG: SiteConfig = {
  calendarUrl: 'https://calendar.app.google/JgHUuWfwyhUqsLV3A', // ← reemplazar aquí
}
```

### Agregar testimonios reales

Editar `src/components/sections/Testimonials.tsx` — el texto placeholder está marcado como cita `<em>`.

### Agregar mockups de beneficios

En `src/components/sections/Benefits.tsx`, cada `BenefitItem` tiene un `div` placeholder con `aspect-ratio: 16/9`. Reemplazarlo con un componente `<Image>` de Next.js cuando los assets estén listos.

---

## Integraciones externas

| Integración | Detalles |
|---|---|
| Google Calendar | Link directo en nueva pestaña. URL en `SITE_CONFIG.calendarUrl`. |
| WhatsApp | Link `wa.me` en nueva pestaña. Número en `SITE_CONFIG.whatsappUrl`. El número actual es de prueba. |
| Google Fonts | Cargadas en `layout.tsx` vía `next/font/google`. Sin request externo en runtime. |
| Vercel | Deploy automático desde `main`. Dominio: `soomosnova.com`. Sin variables de entorno en v1. |

---

## OG Image

Colocar el logo de la marca como `public/og-image.png` (fallback temporal hasta tener imagen OG real).  
Dimensiones recomendadas: **1200 × 630 px**.

Verificar con: [Meta OG Debugger](https://developers.facebook.com/tools/debug/)

---

## Deploy en Vercel

1. Importar el repositorio en [vercel.com](https://vercel.com)
2. Framework: **Next.js** (detectado automáticamente)
3. Build command: `npm run build` (por defecto)
4. Output directory: `.next` (por defecto)
5. No hay variables de entorno en v1
6. Asignar dominio `soomosnova.com` desde la configuración del proyecto

---

## Criterios de aceptación

- [ ] Corre en `localhost:3000` sin errores de TypeScript ni ESLint
- [ ] Lighthouse Performance ≥ 90 en desktop y mobile
- [ ] Lighthouse Accessibility ≥ 90
- [ ] Todos los CTAs de WhatsApp abren `wa.me` en nueva pestaña
- [ ] Botón "Agenda tu demo gratis" abre Google Calendar en nueva pestaña
- [ ] Modal tiene focus trap y cierra con Escape
- [ ] Navbar hace transición transparente → negro+blur al superar 80px de scroll
- [ ] Hamburger menu funciona en viewport < 768px con animación suave
- [ ] Todas las secciones animan entrada al entrar al viewport
- [ ] Sin `any` en TypeScript · sin `console.log` en producción
- [ ] Responsive verificado en 375px, 768px y 1280px
- [ ] Meta tags OG correctos

---

## Licencia

Propiedad de SoomosNova. Todos los derechos reservados.
