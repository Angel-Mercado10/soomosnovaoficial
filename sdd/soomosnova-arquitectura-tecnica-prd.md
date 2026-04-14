# PRD 2.2 — Arquitectura Técnica · SoomosNova v1.0

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Documento:** 2.2 — Arquitectura Técnica  
**Depende de:** 2.1 — Flujo del Invitado  
**Siguiente documento:** 2.3 — Modelo de Datos  

---

## Principio de diseño

SoomosNova opera sobre tres superficies distintas con usuarios distintos:

- **El dashboard** — usado por la pareja, una vez en la vida, en desktop o móvil.
- **El portal del invitado** — usado por 50–500 personas, en móvil, sin cuenta, sin fricción.
- **La PWA de acceso** — usada por el venue, en móvil, en condiciones de estrés (día del evento, sin tiempo).

Cada superficie tiene requisitos de UX radicalmente distintos. La arquitectura respeta eso: no hay una sola app, hay tres superficies sobre una base de datos compartida.

---

## Las 4 capas del sistema

```
┌──────────────────────────────────────────────────────────┐
│                  CAPA DE PRESENTACIÓN                    │
│  Next.js 14 + TypeScript + Tailwind + Framer Motion      │
│  Dashboard pareja │ Portal invitado │ PWA venue           │
├──────────────────────────────────────────────────────────┤
│                    CAPA DE LÓGICA                        │
│  API Routes de Next.js (server-side) + Make/n8n          │
│  Validaciones │ Generación QR │ Workflows automáticos    │
├──────────────────────────────────────────────────────────┤
│                    CAPA DE DATOS                         │
│  Supabase (PostgreSQL + Auth + Realtime + Storage)       │
│  Cloudinary para media pesada (fotos/video del álbum)   │
├──────────────────────────────────────────────────────────┤
│                 CAPA DE INTEGRACIONES                    │
│  Twilio (WhatsApp) │ Resend (Email) │ Stripe             │
└──────────────────────────────────────────────────────────┘
```

---

## Componentes por módulo

### 1. Base de datos e identidad — Supabase

Supabase cubre tres responsabilidades que en otro stack serían tres servicios separados:

**PostgreSQL** — almacena todas las entidades del sistema. Ver documento 2.3 para el schema completo.

**Supabase Auth** — maneja el registro y login de la pareja. Solo la pareja tiene cuenta. Los invitados no se autentican — se identifican por token en la URL. El venue se identifica por un PIN de evento, no por cuenta personal.

**Supabase Realtime** — alimenta las actualizaciones en vivo del dashboard (contador de confirmaciones) y del álbum (fotos apareciendo en tiempo real). Funciona sobre WebSockets sin que el agente tenga que implementar infraestructura de sockets.

**Supabase Storage** — almacena los QR generados (PNG por invitado). No almacena fotos del álbum — eso va a Cloudinary por razones de performance y transformación de imágenes.

**Row Level Security (RLS)** — cada pareja solo puede ver y modificar sus propios datos. Esta política se implementa a nivel de base de datos, no en el código de la aplicación. Es la protección más importante del sistema y debe ser lo primero que configure el agente después de crear las tablas.

---

### 2. Presentación — Next.js 14

El proyecto Next.js existente (`soomosnova.com`) se extiende con las siguientes rutas. No se crea un proyecto separado — todo vive en el mismo repositorio.

**Rutas del dashboard (pareja autenticada):**

```
/dashboard                    → Vista principal del evento
/dashboard/invitados          → Lista y gestión de invitados
/dashboard/invitados/subir    → Carga de Excel/CSV
/dashboard/confirmaciones     → RSVP en tiempo real
/dashboard/album              → Vista del álbum con moderación
/dashboard/configuracion      → Datos del evento, menús, slug
```

**Rutas públicas del invitado (sin autenticación):**

```
/i/[token]                    → Invitación personalizada con QR
/rsvp/[token]                 → Formulario de confirmación
/evento/[slug]                → Microsite público del evento
/album/[slug]                 → Álbum compartido (lectura + subida)
```

**Rutas de la PWA del venue:**

```
/acceso/[id-evento]           → Escáner QR
/acceso/[id-evento]/aforo     → Panel de aforo en tiempo real
/acceso/[id-evento]/buscar    → Búsqueda manual por nombre
```

**Consideración crítica:** Las rutas `/i/[token]` y `/rsvp/[token]` son las más visitadas del sistema — cada invitado las abre al menos una vez. Deben ser Server Components de Next.js con rendering en servidor, sin depender de JavaScript del cliente para mostrar el contenido. Si el JS falla o es lento, el invitado igual ve su invitación.

---

### 3. Generación de QR — librería qrcode

Cada invitado tiene un QR único. El QR codifica la URL de su invitación personal: `https://soomosnova.com/i/[token]`.

**Función de servidor:**

```
generateQR(invitadoId: string) → PNG buffer → Supabase Storage
```

Esta función se llama en tres momentos:

- Cuando la pareja sube la lista de invitados (generación masiva).
- Cuando se agrega un invitado individual desde el dashboard.
- Cuando la pareja solicita regenerar un QR (invitado perdió el link).

**Almacenamiento:** El QR se guarda como PNG en Supabase Storage con path `qr/[evento-id]/[invitado-id].png`. La URL pública del PNG se guarda en la tabla `invitados` para no regenerar en cada request.

**Librería recomendada:** `qrcode` (npm). Simple, sin dependencias pesadas, produce PNG de alta resolución.

---

### 4. Media del álbum — Cloudinary

Las fotos y videos del álbum no van a Supabase Storage. Van a Cloudinary. La razón es operativa: Cloudinary entrega transformaciones automáticas (thumbnail, compresión, formato WebP) sin que el agente tenga que implementar procesamiento de imágenes.

**Flujo de subida:**

```
Invitado selecciona foto en el navegador
→ Next.js API Route genera un "upload signature" con Cloudinary API
→ El navegador sube directamente a Cloudinary (client-side upload)
→ Cloudinary devuelve la URL pública y el public_id
→ Next.js guarda public_id + URL en tabla fotos de Supabase
→ Supabase Realtime notifica al álbum → foto aparece
```

Este flujo es crítico: la foto va directo del teléfono del invitado a Cloudinary, sin pasar por el servidor de Next.js. Esto elimina el límite de tamaño de los API Routes y no consume el ancho de banda del servidor.

**Organización en Cloudinary:** `soomosnova/[evento-slug]/[timestamp]-[invitado-id]`

**Moderación:** La pareja puede ocultar una foto desde el dashboard. El sistema no elimina el archivo de Cloudinary (es destructivo e irreversible) — solo marca el registro en Supabase como `oculto: true`. El álbum filtra por ese campo.

---

### 5. Automatizaciones — Make

Make maneja todos los workflows que ocurren fuera del ciclo request/response de Next.js. Son procesos que no necesitan respuesta inmediata.

**Workflow 1 — Envío masivo de invitaciones:**

```
Trigger: Webhook desde Next.js (pareja aprueba envío)
→ Make lee la lista de invitados de Supabase
→ Para cada invitado: envía WhatsApp por Twilio con su link único
→ Actualiza estado del invitado a "enviado" en Supabase
→ Si falla el envío: marca como "error_envío" y continúa con el siguiente
```

**Workflow 2 — Recordatorios automáticos:**

```
Trigger: Schedule (corre diariamente a las 10am)
→ Make consulta Supabase: invitados con estado "pendiente" y fecha_envío > 3 días
→ Envía recordatorio por WhatsApp
→ Registra timestamp del recordatorio en Supabase
→ No envía más de 2 recordatorios por invitado
```

**Workflow 3 — Notificación a la pareja por confirmación:**

```
Trigger: Webhook desde Next.js (invitado confirma RSVP)
→ Make envía WhatsApp o email a la pareja
→ Mensaje: "[Nombre] confirmó su asistencia. Menú: [selección]."
```

**Por qué Make y no n8n:** Make tiene una UI más visual y es más rápido de configurar sin programar. n8n es más potente pero requiere self-hosting o una cuenta de pago. Para el MVP, Make en su plan gratuito (1,000 operaciones/mes) cubre los primeros 5–10 eventos sin costo. Si el volumen crece, se migra o se escala el plan.

---

### 6. Mensajería — Twilio + Resend

**Twilio (WhatsApp):** Canal principal para todas las comunicaciones con invitados. Twilio tiene una sandbox de WhatsApp para desarrollo que no requiere aprobación de Meta — el agente puede implementar y probar sin trámites. Para producción, se necesita aprobación de la Business API de WhatsApp, que puede tomar 1–2 semanas. Este trámite debe iniciarse en paralelo con la construcción, no después.

**Resend (Email):** Canal de fallback y para notificaciones a la pareja. Resend es más simple de integrar que SendGrid para proyectos Next.js — tiene un SDK oficial y el tier gratuito cubre 3,000 emails/mes.

**Regla de uso:** WhatsApp para invitados (mayor apertura en México), Email para la pareja (notificaciones de dashboard, resumen diario).

---

### 7. Pagos — Stripe

Stripe para el cobro a la pareja en el momento de activación del evento. La alternativa era Conekta (más penetración en México con OXXO) pero Stripe tiene mejor documentación, SDK más maduro para Next.js, y ya soporta SPEI en México desde 2023.

**Flujo de pago:**

```
Pareja completa el registro y configuración del evento
→ Sistema muestra resumen y precio
→ Stripe Checkout (redirect) maneja el pago
→ Webhook de Stripe notifica a Next.js cuando el pago se completa
→ Next.js activa el evento (estado: "activo")
→ Make envía WhatsApp de bienvenida a la pareja
```

**Para el precio de fundador ($500 MXN):** Se puede crear un link de pago directo en Stripe sin implementar el checkout completo. Suficiente para los primeros 10 clientes y no bloquea la construcción del sistema.

---

## Diagrama de conexiones

```
                        ┌─────────────┐
                        │   PAREJA    │
                        └──────┬──────┘
                               │ HTTPS
                        ┌──────▼──────┐
                        │  Next.js 14  │◄──── Supabase Auth
                        │  /dashboard  │
                        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
       ┌──────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
       │  Supabase   │  │  Cloudinary │  │   Stripe   │
       │  PostgreSQL │  │   (media)   │  │   (pagos)  │
       │  Realtime   │  └─────────────┘  └────────────┘
       │  Storage    │
       └──────┬──────┘
              │ Webhooks
       ┌──────▼──────┐
       │    Make     │
       │  Workflows  │
       └──────┬──────┘
              │
    ┌─────────┼──────────┐
    │                    │
┌───▼───┐          ┌─────▼─────┐
│Twilio │          │  Resend   │
│WhatsApp│         │  (Email)  │
└───┬───┘          └─────┬─────┘
    │                    │
┌───▼────────────────────▼───┐
│         INVITADO           │
│  /i/[token] │ /rsvp/[token]│
│  /album/[slug]             │
└────────────────────────────┘
```

---

## Consideraciones de seguridad

Estas no son opcionales. El agente debe implementarlas desde el inicio, no como mejora posterior.

**1. RLS en Supabase**  
Toda tabla tiene políticas que garantizan que una pareja solo accede a sus propios registros. El agente debe definir las políticas junto con la creación de las tablas en la subfase 4A.

**2. Tokens de invitado**  
Los tokens en las URLs son UUIDs v4 generados por Supabase. No son incrementales — son imposibles de adivinar. Esto previene que alguien enumere invitaciones de otros eventos.

**3. Variables de entorno**  
Ninguna clave de API va en el repositorio. El agente usa `.env.local` para desarrollo y las variables de entorno de Vercel para producción. Las claves públicas (Supabase anon key) van al cliente. Las claves secretas (Supabase service role key, Twilio, Cloudinary, Stripe) son estrictamente del servidor.

**4. Upload signatures de Cloudinary**  
Las subidas de fotos no usan la API key directamente desde el cliente. El servidor genera una firma temporal por cada subida. Esto previene que alguien use las credenciales de Cloudinary fuera de SoomosNova.

**5. Rate limiting en rutas críticas**  
Las rutas `/rsvp/[token]` y `/i/[token]` deben tener rate limiting básico para prevenir abuso. Vercel Edge Middleware cubre esto sin infraestructura adicional.

---

## Stack completo y costos del MVP

| Capa | Herramienta | Plan inicial | Límite antes de pagar |
|---|---|---|---|
| Frontend / Backend | Next.js 14 en Vercel | Hobby (gratis) | 100GB bandwidth/mes |
| Base de datos | Supabase | Free | 500MB DB · 1GB Storage |
| Media del álbum | Cloudinary | Free | 25GB storage · 25GB bandwidth |
| Automatizaciones | Make | Free | 1,000 operaciones/mes |
| WhatsApp | Twilio | Pay-as-you-go | ~$0.005 USD por mensaje |
| Email | Resend | Free | 3,000 emails/mes |
| Pagos | Stripe | Pay-as-you-go | 2.9% + $0.30 por transacción |
| QR | npm qrcode | — | Sin límite |

**Costo operativo real para los primeros 10 eventos:** prácticamente $0 en infraestructura. El único costo variable es Twilio — aproximadamente $0.50 USD por evento con 100 invitados.
