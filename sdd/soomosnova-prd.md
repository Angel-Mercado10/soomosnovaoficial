# PRD — SoomosNova Landing Page

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Scope:** Landing page estática  
**Ejecutor:** Claude Code  

---

## Objetivo del sistema

Construir la landing page pública de SoomosNova: una página estática de presentación orientada a conversión que comunique la propuesta de valor del sistema de gestión de bodas, genere leads calificados vía Google Calendar y WhatsApp, y establezca el posicionamiento premium de la marca.

**Resultado esperado:** Visitante llega → entiende el valor → agenda una demo o inicia conversación por WhatsApp.

**Fuera de scope:** Backend, autenticación, panel de parejas, portal de invitados, base de datos.

---

## Stack y restricciones técnicas

| Categoría | Decisión |
|---|---|
| Framework | Next.js 14+ App Router · TypeScript estricto |
| Estilos | Tailwind CSS · Sin librerías UI externas (no shadcn, no MUI) |
| Animación | Framer Motion · `whileInView` para scroll |
| Fuentes | Google Fonts vía `next/font/google`: Cormorant Garamond + Geist Sans |
| Deploy | Vercel · dominio: `soomosnova.com` |
| Breakpoints | sm 640 · md 768 · lg 1024 · xl 1280 (estándar Tailwind) |

---

## Design system

| Token | Valor |
|---|---|
| Fondo | `#0A0A0A` |
| Texto principal | `#FFFFFF` |
| Texto secundario | `#9CA3AF` |
| Acento dorado | `#C9A84C` |
| Cards / superficies | `#1A1A1A` con border `#2A2A2A` |
| Border radius cards | `12px` |
| Border radius pills/CTA | `999px` |
| Tipografía headlines | Cormorant Garamond (serif) |
| Tipografía body | Geist Sans |

---

## Actores del sistema

**Visitante anónimo**  
Usuario que llega a la landing. Puede ser pareja, wedding planner o curioso. No autenticado. Interactúa con CTAs.

**Asesor SoomosNova**  
Recibe leads por Google Calendar y WhatsApp. No interactúa con la landing directamente.

**Operador técnico**  
Mantiene y despliega la landing. Actualiza contenido vía constantes en `lib/constants.ts`.

---

## Flujos principales

### F-01 · Visitante agenda demo (conversión primaria)

1. Visitante llega a `soomosnova.com` — página carga con SSG desde Vercel CDN.
2. Navbar visible — scroll activa fondo negro con blur vía `useScrolled`.
3. Hero anima entrada — fade up escalonado: headline → subheadline → botones.
4. Visitante hace clic en **"Agenda tu demo gratis"**.
5. Abre `calendar.app.google/JgHUuWfwyhUqsLV3A` en **nueva pestaña** — sin modal intermedio.
6. Visitante agenda desde Google Calendar — flujo externo, fuera del scope.

### F-02 · Visitante contacta por WhatsApp

1. Visitante hace clic en **"Chatea por WhatsApp"** (hero, CTA final) o en el **botón flotante**.
2. **Si viene del botón flotante:** se abre Modal de confirmación "Atención Privada" con dos acciones.
3. **Si viene de hero o CTA final:** redirige directamente a `wa.me/5255995 8257` en nueva pestaña.
4. En modal: clic en **"Continuar a WhatsApp"** → abre WhatsApp en nueva pestaña.
5. En modal: clic en **"Cancelar"** → modal se cierra, usuario permanece en la página.

### F-03 · Navegación por secciones

1. Visitante hace clic en link del navbar: Beneficios / Testimonios / Contáctanos.
2. Scroll suave al anchor correspondiente vía `element.scrollIntoView({ behavior: 'smooth' })`.
3. Cada sección anima entrada vía Framer Motion `whileInView` con threshold 0.15.

### F-04 · Navegación móvil (hamburger menu)

1. En viewport < 768px, links del navbar se ocultan — aparece ícono hamburger.
2. Clic en hamburger → menú desplegable anima entrada (Framer Motion: y -20→0, opacity 0→1).
3. Clic en cualquier link → cierra menú + scroll suave al anchor.
4. Clic fuera del menú o en X → cierra menú.

---

## Flujos alternativos y edge cases

| Caso | Manejo |
|---|---|
| WhatsApp no disponible | `wa.me` abre WhatsApp Web si no hay app instalada. Comportamiento nativo, sin manejo especial. |
| Google Calendar bloqueado | El link simplemente no carga. Sin fallback en este scope — limitación documentada. |
| Modal abierto + resize de ventana | Usar `position: fixed + inset-0` con z-index controlado. El modal debe mantenerse centrado en cualquier orientación. |
| JavaScript desactivado | La página debe ser legible sin JS. Todos los CTAs deben funcionar como `<a href>` puros. Las animaciones simplemente no ocurren. |
| Doble clic en botón flotante | El estado del modal es booleano — si ya está abierto, el segundo clic no tiene efecto. |
| FOUT en fuentes | Configurar `font-display: swap`. Definir fallback serif en Tailwind (`Georgia, serif`). `next/font` inyecta la fuente en el critical CSS — no hay request externo en runtime. |

---

## Entidades de datos

No hay base de datos. Las entidades son tipados TypeScript que centralizan el contenido editable en `lib/constants.ts` y los tipos en `types/index.ts`.

### SiteConfig
```typescript
type SiteConfig = {
  siteName: string
  domain: string
  calendarUrl: string
  whatsappNumber: string   // sin espacios: '5255995 8257'
  whatsappUrl: string      // 'https://wa.me/5255995 8257'
  email: string
  phone: string
}
```

### BenefitCard
```typescript
type BenefitCard = {
  id: number              // 1–5
  title: string
  description: string
  tag: string
  mockupAlt: string
}
```

### NavLink
```typescript
type NavLink = {
  label: string
  href: string            // anchor: '#beneficios', '#testimonios', etc.
}
```

### SocialLink
```typescript
type SocialLink = {
  platform: 'instagram' | 'facebook'
  url: string             // placeholder '#' hasta go-live
  ariaLabel: string
}
```

### MetaConfig
```typescript
type MetaConfig = {
  title: string
  description: string
  ogImage: string         // '/og-image.png' (logo como fallback temporal)
  canonical: string
  twitterCard: string
}
```

### ModalState (hook interno)
```typescript
type ModalState = {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}
```

---

## Arquitectura de componentes

```
src/
├── app/
│   ├── layout.tsx          — fonts, metadata global, html lang="es-MX"
│   ├── page.tsx            — composición de secciones, sin lógica propia
│   └── globals.css         — reset, variables CSS, scroll-behavior
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx      — logo, links, hamburger menu, useScrolled
│   │   └── Footer.tsx      — logo, tagline, columnas contacto y redes
│   ├── sections/
│   │   ├── Hero.tsx        — headline, subheadline, dos CTAs, animación entrada
│   │   ├── Benefits.tsx    — 5 cards con número, título, descripción, tag, mockup
│   │   ├── Testimonials.tsx — card centrado con placeholder elegante
│   │   ├── FinalCTA.tsx    — eyebrow, título, subtítulo, botón WhatsApp
│   │   └── WhatsAppFloat.tsx — botón fijo, dispara useModal
│   └── ui/
│       ├── Button.tsx      — variantes: primary, secondary, ghost
│       └── Modal.tsx       — dialog accesible, focus trap, cierre con Escape
├── hooks/
│   ├── useScrolled.ts      — boolean: scroll > 80px para navbar
│   └── useModal.ts         — estado open/close + handlers (no está en spec original, es necesario)
├── lib/
│   └── constants.ts        — SITE_CONFIG, NAV_LINKS, BENEFITS, SOCIAL_LINKS, META_CONFIG
└── types/
    └── index.ts            — todos los tipos exportados
```

---

## Integraciones externas

### Google Calendar
- Link directo en nueva pestaña (`target="_blank" rel="noopener noreferrer"`).
- Sin iframe ni embed.
- URL: `https://calendar.app.google/JgHUuWfwyhUqsLV3A`
- Almacenada en `SITE_CONFIG.calendarUrl`.

### WhatsApp
- Link `wa.me` en nueva pestaña.
- Sin API, sin SDK.
- Número: `5255995 8257` (sin espacios en la URL).
- Almacenado en `SITE_CONFIG.whatsappNumber` y `SITE_CONFIG.whatsappUrl`.
- Número actual es de prueba — cambio en una sola línea en `constants.ts`.

### Google Fonts
- Cargadas en `layout.tsx` vía `next/font/google`.
- Cormorant Garamond: weights 400, 600, 700 (incluir `italic`).
- Geist Sans: weights 400, 500.
- `font-display: swap` configurado por defecto en `next/font`.

### Vercel
- Deploy automático desde rama `main`.
- Dominio: `soomosnova.com`.
- Variables de entorno: ninguna en v1 (todo el contenido es público).

---

## SEO y meta tags

| Campo | Valor |
|---|---|
| `<html lang>` | `es-MX` |
| `title` | SoomosNova — Gestión digital premium para bodas en México |
| `description` | Invitaciones digitales con QR, RSVP automático, control de acceso y álbum compartido permanente. Todo en un solo sistema. |
| `canonical` | `https://soomosnova.com` |
| `og:type` | `website` |
| `og:image` | `/og-image.png` — logo de la marca como fallback temporal |
| `twitter:card` | `summary_large_image` |

---

## Secciones de la página (orden y contenido)

### 1. Navbar (fijo)
- Logo: "Soomos" en blanco + "Nova" en `#C9A84C`.
- Links: Beneficios · Testimonios · Contáctanos (anchors a secciones).
- Fondo: transparente → negro con backdrop-blur al superar 80px de scroll.
- Móvil: hamburger menu con animación Framer Motion.

### 2. Hero
- Headline: *"Tu boda, sin caos. Tu recuerdo, para siempre."* (Cormorant Garamond, grande).
- Subheadline: *"Invitaciones digitales, confirmaciones automáticas y un álbum que nunca desaparece. Todo en un solo sistema."*
- CTA primario: "Agenda tu demo gratis" → abre Google Calendar en nueva pestaña.
- CTA secundario: "Chatea por WhatsApp" → `wa.me/5255995 8257` en nueva pestaña.
- Animación: fade up escalonado con delay entre headline, subheadline y botones.

### 3. Beneficios
- Eyebrow: "BENEFICIOS"
- Título: "Resultados claros. Sin complejidad operativa."
- 5 cards en scroll vertical:

| # | Título | Descripción | Tag |
|---|---|---|---|
| 01 | Invitación premium desde el primer contacto | Confirmaciones rápidas y sin seguimiento manual. | MENOS FRICCIÓN · MÁS CONTROL |
| 02 | Acceso QR preciso en segundos | Cada invitado entra con validación única y segura. | SIN FILAS LARGAS · SIN ACCESOS NO AUTORIZADOS |
| 03 | La memoria de tu boda, para siempre | Un álbum compartido donde tus invitados suben fotos, videos y dedicatorias. Disponible por 5 años. | ORDEN TOTAL · PRIVACIDAD REAL |
| 04 | Decisiones claras antes y durante el evento | Visualiza asistencia en tiempo real y ajusta logística al instante. | INFORMACIÓN ACCIONABLE · TRANQUILIDAD OPERATIVA |
| 05 | RSVP automático sin perseguir a nadie | El sistema manda recordatorios a los que no han confirmado. Tú no haces nada. | AUTOMATIZACIÓN REAL · CERO ESFUERZO MANUAL |

- Cada card incluye un div placeholder para mockup (aspect-ratio 16/9, fondo `#1A1A1A`, texto "Mockup próximamente").

### 4. Testimonios
- Eyebrow: "TESTIMONIOS"
- Título: "Confianza que se percibe desde el primer vistazo."
- Card centrado con comillas decorativas en `#C9A84C` y texto placeholder en itálica.
- Sin nombre ni atribución por ahora.

### 5. CTA Final
- Eyebrow: "ACCIÓN FINAL"
- Título: "Una sola conversación puede cambiarlo todo."
- Subtítulo: "Escríbenos por WhatsApp y te mostramos cómo elevar la gestión de invitados con una experiencia verdaderamente premium."
- Botón: "Chatea por WhatsApp" → `wa.me/5255995 8257` en nueva pestaña.

### 6. Footer
- Logo SoomosNova.
- Tagline: "Gestión digital premium para invitados en bodas de alta gama."
- Columna Contacto: `hola@soomosnova.com` · `+52 55 5995 8257`
- Columna Redes: íconos Instagram y Facebook (links `#` placeholder, con `aria-label`).
- Copyright: "© 2026 SoomosNova. Todos los derechos reservados."

### 7. Botón WhatsApp flotante
- Fijo en esquina inferior derecha (`position: fixed`).
- Ícono de WhatsApp (SVG inline o lucide-react).
- Al hacer clic: abre Modal de confirmación.
- Modal: título "Atención Privada" · texto informativo · botón "Continuar a WhatsApp" · botón "Cancelar".

---

## Animaciones

| Elemento | Comportamiento |
|---|---|
| Todas las secciones | `whileInView` fade up al entrar al viewport (threshold 0.15) |
| Hero (entrada) | Fade up escalonado: headline → subheadline → botones (delay 0.1s entre cada uno) |
| Cards de beneficios | Fade up individual al entrar al viewport |
| Hover en cards | `scale(1.02)` + border cambia a `#C9A84C` |
| Hover en botones | Transición de opacidad suave |
| Hamburger menu | `y: -20 → 0`, `opacity: 0 → 1`, duration 0.3s |
| Modal | `opacity: 0 → 1` + ligero scale up, `AnimatePresence` para salida |
| Duración general | 0.6s, easing `ease-out` |

---

## Riesgos técnicos

| Severidad | Riesgo | Mitigación |
|---|---|---|
| 🔴 Alto | CLS por fuentes — Cormorant Garamond puede llegar tarde y causar layout shift | `next/font/google` inyecta la fuente en critical CSS. Sin request externo en runtime. Fallback: `Georgia, serif`. |
| 🔴 Alto | Bundle de Framer Motion (~100KB) rompe Performance score | Importar solo `{ motion, AnimatePresence }` desde `framer-motion`. Nunca el bundle completo. |
| 🟡 Medio | Modal sin accesibilidad baja Accessibility score | Modal debe tener `role="dialog"`, `aria-modal="true"`, focus trap, y cierre con tecla Escape. |
| 🟡 Medio | `scroll-behavior: smooth` no funciona en Safari < 15.4 | Usar `element.scrollIntoView({ behavior: 'smooth' })` en el handler del NavLink, no CSS puro. |
| 🟡 Medio | Hydration mismatch con `whileInView` en SSR | Todos los componentes con animaciones Framer Motion deben ser `'use client'`. |
| 🟢 Bajo | Número de WhatsApp hardcodeado en múltiples componentes | Centralizar en `SITE_CONFIG.whatsappNumber` — cambio en una sola línea cuando se reemplace el número de prueba. |

---

## Criterios de aceptación

- [ ] Proyecto corre en `localhost:3000` sin errores de TypeScript ni ESLint.
- [ ] Lighthouse Performance ≥ 90 en desktop y mobile.
- [ ] Lighthouse Accessibility ≥ 90.
- [ ] Todos los CTAs de WhatsApp abren `wa.me` en nueva pestaña.
- [ ] Botón "Agenda tu demo gratis" abre Google Calendar en nueva pestaña.
- [ ] Modal del botón flotante tiene focus trap y cierra con Escape.
- [ ] Navbar hace transición transparente → negro+blur al superar 80px de scroll.
- [ ] Hamburger menu funciona en viewport < 768px con animación suave.
- [ ] Todas las secciones animan entrada al entrar al viewport.
- [ ] Sin `any` en TypeScript. Sin `console.log` en producción.
- [ ] Responsive verificado en 375px, 768px y 1280px.
- [ ] Deploy exitoso en Vercel con dominio `soomosnova.com`.
- [ ] Meta tags OG correctos — verificables con og:debugger de Meta.
- [ ] README con instrucciones de instalación y estructura del proyecto.

---

## Notas para Claude Code

- No hay variables de entorno en v1 — todo el contenido es público y vive en `lib/constants.ts`.
- El número de WhatsApp actual (`5255995 8257`) es de prueba. Centralizado para cambio fácil.
- La imagen OG es el logo de la marca como fallback temporal — colocar en `/public/og-image.png`.
- Los links de Instagram y Facebook van como `#` placeholder con `aria-label` descriptivo.
- `useModal.ts` no está en la estructura del documento original pero es necesario para evitar prop drilling del estado del modal desde `WhatsAppFloat` hacia `Modal`.
- El número en la URL de WhatsApp debe ir **sin espacios**: `wa.me/5255995 8257` → correcto es `wa.me/5255995 8257`.
- Todos los componentes que usen Framer Motion, `window`, o `document` deben declarar `'use client'` al inicio del archivo.
