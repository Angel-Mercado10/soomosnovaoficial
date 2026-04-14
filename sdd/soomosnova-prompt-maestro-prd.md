# PRD 2.4 — Prompt Maestro del MVP · SoomosNova v1.0

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Documento:** 2.4 — Prompt Maestro  
**Consolida:** 2.1 · 2.2 · 2.3  
**Uso:** Entregar íntegro al agente constructor como primer mensaje. Sin contexto adicional.

---

## Instrucciones para el agente

Eres el arquitecto técnico encargado de construir SoomosNova, un sistema integral de gestión de bodas para el mercado mexicano. Este documento contiene todo lo que necesitas para construir el MVP completo. Léelo en su totalidad antes de escribir la primera línea de código.

**Reglas de trabajo:**
- No inventes decisiones de arquitectura que no estén aquí. Si algo no está especificado, pregunta antes de asumir.
- Construye en el orden exacto de las subfases. No avances a la siguiente hasta que la anterior pase su criterio de validación.
- Cada componente que construyas debe tener su responsabilidad claramente separada. Sin lógica de negocio en los componentes de UI, sin queries de base de datos fuera de las funciones de servidor.
- Aplica RLS en Supabase desde el primer día. No es una mejora posterior, es un requisito de seguridad base.
- Usa TypeScript estricto. Sin `any`. Sin `as unknown`.

---

## 1. Qué es SoomosNova

SoomosNova es una plataforma web que digitaliza la gestión completa de una boda: desde el envío de invitaciones hasta la memoria permanente del evento.

**Propuesta de valor en una oración:** La pareja sube su lista de invitados, el sistema envía invitaciones personalizadas por WhatsApp, gestiona confirmaciones automáticamente, controla el acceso el día del evento con QR, y construye un álbum compartido que dura 5 años.

**Diferenciador principal:** El álbum permanente. A diferencia de grupos de WhatsApp o historias de Instagram que desaparecen, SoomosNova conserva las fotos, videos y dedicatorias de todos los invitados durante 5 años en una URL pública y permanente.

---

## 2. Actores del sistema

**Pareja** — cliente pagador. Tiene cuenta en el sistema. Configura el evento, sube la lista de invitados, aprueba el envío de invitaciones, monitorea confirmaciones en tiempo real desde el dashboard, y modera el álbum. Usa el sistema principalmente desde desktop o móvil, con tiempo y sin presión.

**Invitado** — usuario sin cuenta. Se identifica únicamente por un token único en la URL de su invitación. Confirma asistencia, selecciona menú, accede al microsite del evento, y sube fotos o dedicatorias al álbum. Usa el sistema exclusivamente desde móvil, en condiciones de poco tiempo y poca paciencia. La fricción cero es un requisito, no una aspiración.

**Venue** — operador del acceso el día del evento. Sin cuenta. Se identifica con un PIN de 6 dígitos por evento. Usa la PWA de escaneo en su smartphone para validar QR en la entrada. Opera bajo presión alta: el día del evento, con invitados esperando en fila.

---

## 3. Stack tecnológico

No hay decisiones de stack que tomar. Todo está definido.

| Capa | Herramienta | Notas |
|---|---|---|
| Frontend / Backend | Next.js 14 · App Router · TypeScript · Tailwind · Framer Motion | El proyecto ya existe — se extiende, no se crea |
| Base de datos | Supabase (PostgreSQL + Auth + Realtime + Storage) | Storage solo para QR PNG |
| Media del álbum | Cloudinary | Client-side upload con firma generada en servidor |
| Automatizaciones | Make (Integromat) | Conectado a Next.js por webhooks |
| WhatsApp | Twilio | Sandbox para dev, Business API para producción |
| Email | Resend | SDK oficial para Next.js |
| Pagos | Stripe | Checkout + webhook de activación |
| Generación QR | `qrcode` (npm) | PNG en servidor → Supabase Storage |
| Deploy | Vercel | Variables de entorno en Vercel para producción |

**Design system existente:** fondo `#0A0A0A`, acento dorado `#C9A84C`, tipografía serif Cormorant Garamond en headlines, sans-serif en body. No modificar. Las nuevas interfaces respetan esta paleta.

---

## 4. Arquitectura de rutas

```
/ (sitio público existente — no tocar)

── DASHBOARD (pareja autenticada) ──────────────────────────────────
/dashboard                        Vista principal del evento
/dashboard/invitados              Lista de invitados con estados
/dashboard/invitados/subir        Carga masiva de Excel o CSV
/dashboard/confirmaciones         RSVP en tiempo real
/dashboard/album                  Vista del álbum con moderación
/dashboard/configuracion          Datos del evento, menús, slug

── PORTAL DEL INVITADO (sin autenticación) ─────────────────────────
/i/[token]                        Invitación personalizada con QR
/rsvp/[token]                     Formulario de confirmación RSVP
/evento/[slug]                    Microsite público del evento
/album/[slug]                     Álbum compartido (ver + subir)

── PWA DEL VENUE (PIN de evento) ───────────────────────────────────
/acceso/[id-evento]               Escáner QR
/acceso/[id-evento]/aforo         Panel de aforo en tiempo real
/acceso/[id-evento]/buscar        Búsqueda manual por nombre

── API ROUTES (servidor) ───────────────────────────────────────────
/api/invitados/subir              Procesa Excel/CSV, crea registros
/api/invitados/[id]/qr            Genera o regenera QR
/api/rsvp/confirmar               Procesa confirmación del invitado
/api/album/upload-signature       Genera firma de Cloudinary
/api/album/guardar-foto           Guarda metadatos post-upload
/api/acceso/validar-qr            Valida QR en tiempo real
/api/webhooks/stripe              Activa evento al pago completado
/api/webhooks/make                Recibe triggers de Make
```

**Regla crítica de rendering:** Las rutas `/i/[token]` y `/rsvp/[token]` deben ser Server Components. El invitado ve su invitación aunque JavaScript falle o sea lento. No usar Client Components en el renderizado inicial de estas rutas.

---

## 5. Modelo de datos completo

Ejecutar este SQL en el orden exacto en el SQL Editor de Supabase antes de escribir cualquier código de aplicación.

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PAREJAS ──────────────────────────────────────────────────────
CREATE TABLE parejas (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_1        text NOT NULL,
  nombre_2        text NOT NULL,
  email           text NOT NULL,
  telefono        text,
  plan            text NOT NULL DEFAULT 'fundador'
                    CHECK (plan IN ('fundador','starter','premium')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

-- ── EVENTOS ───────────────────────────────────────────────────────
CREATE TABLE eventos (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  pareja_id           uuid NOT NULL REFERENCES parejas(id) ON DELETE RESTRICT,
  nombre_evento       text NOT NULL,
  slug                text NOT NULL UNIQUE,
  fecha_evento        date NOT NULL,
  hora_evento         time,
  lugar_nombre        text,
  lugar_direccion     text,
  lugar_maps_url      text,
  dress_code          text,
  cuenta_regalo       text,
  opciones_menu       jsonb NOT NULL DEFAULT '["Pollo","Res","Vegetariano"]',
  permite_acompanante boolean NOT NULL DEFAULT false,
  album_activo        boolean NOT NULL DEFAULT false,
  album_expira_at     timestamptz,
  pin_venue           text,
  estado_pago         text NOT NULL DEFAULT 'pendiente'
                        CHECK (estado_pago IN ('pendiente','pagado')),
  stripe_session_id   text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);

-- ── INVITADOS ─────────────────────────────────────────────────────
CREATE TABLE invitados (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id             uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre                text NOT NULL,
  telefono              text,
  email                 text,
  token                 uuid NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  estado_envio          text NOT NULL DEFAULT 'pendiente_envio'
                          CHECK (estado_envio IN ('pendiente_envio','enviado','error_envio')),
  estado_confirmacion   text NOT NULL DEFAULT 'pendiente'
                          CHECK (estado_confirmacion IN
                            ('pendiente','confirmado','rechazo','pendiente_decision')),
  qr_url                text,
  enviado_at            timestamptz,
  recordatorio_1_at     timestamptz,
  recordatorio_2_at     timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

-- ── QR CODES ──────────────────────────────────────────────────────
CREATE TABLE qr_codes (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id     uuid NOT NULL UNIQUE REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  public_url      text NOT NULL,
  generado_at     timestamptz NOT NULL DEFAULT now(),
  regenerado_at   timestamptz
);

-- ── CONFIRMACIONES ────────────────────────────────────────────────
CREATE TABLE confirmaciones (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id         uuid NOT NULL UNIQUE REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id           uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  asiste              boolean NOT NULL,
  opcion_menu         text,
  lleva_acompanante   boolean,
  nombre_acompanante  text,
  confirmed_at        timestamptz NOT NULL DEFAULT now()
);

-- ── INGRESOS ──────────────────────────────────────────────────────
CREATE TABLE ingresos (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id     uuid NOT NULL REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  ingresado_at    timestamptz NOT NULL DEFAULT now(),
  duplicado       boolean NOT NULL DEFAULT false,
  metodo          text NOT NULL DEFAULT 'qr' CHECK (metodo IN ('qr','manual')),
  registrado_por  text
);

-- ── FOTOS ─────────────────────────────────────────────────────────
CREATE TABLE fotos (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id             uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  invitado_id           uuid REFERENCES invitados(id) ON DELETE SET NULL,
  cloudinary_public_id  text NOT NULL,
  url_original          text NOT NULL,
  url_thumbnail         text NOT NULL,
  tipo                  text NOT NULL CHECK (tipo IN ('foto','video')),
  oculto                boolean NOT NULL DEFAULT false,
  subido_at             timestamptz NOT NULL DEFAULT now()
);

-- ── DEDICATORIAS ──────────────────────────────────────────────────
CREATE TABLE dedicatorias (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id     uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  invitado_id   uuid REFERENCES invitados(id) ON DELETE SET NULL,
  tipo          text NOT NULL CHECK (tipo IN ('texto','dibujo')),
  contenido     text NOT NULL,
  oculto        boolean NOT NULL DEFAULT false,
  creado_at     timestamptz NOT NULL DEFAULT now()
);

-- ── ÍNDICES ───────────────────────────────────────────────────────
CREATE INDEX idx_invitados_evento_id       ON invitados(evento_id);
CREATE INDEX idx_invitados_token           ON invitados(token);
CREATE INDEX idx_confirmaciones_evento_id  ON confirmaciones(evento_id);
CREATE INDEX idx_ingresos_evento_id        ON ingresos(evento_id);
CREATE INDEX idx_fotos_evento_id           ON fotos(evento_id);
CREATE INDEX idx_dedicatorias_evento_id    ON dedicatorias(evento_id);
CREATE INDEX idx_eventos_slug              ON eventos(slug);

-- ── TRIGGER: album_expira_at automático ───────────────────────────
CREATE OR REPLACE FUNCTION set_album_expira()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.fecha_evento IS NOT NULL AND NEW.album_expira_at IS NULL THEN
    NEW.album_expira_at := (NEW.fecha_evento + INTERVAL '5 years')::timestamptz;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_album_expira
BEFORE INSERT OR UPDATE ON eventos
FOR EACH ROW EXECUTE FUNCTION set_album_expira();
```

---

## 6. Políticas RLS — implementar antes de cualquier otra cosa

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE parejas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitados      ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedicatorias   ENABLE ROW LEVEL SECURITY;

-- Pareja ve y modifica solo sus propios datos
CREATE POLICY "pareja_su_registro"
ON parejas FOR ALL
USING (auth_user_id = auth.uid());

CREATE POLICY "pareja_su_evento"
ON eventos FOR ALL
USING (pareja_id = (
  SELECT id FROM parejas WHERE auth_user_id = auth.uid()
));

CREATE POLICY "pareja_sus_invitados"
ON invitados FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- La misma lógica se replica para qr_codes, confirmaciones,
-- ingresos, fotos y dedicatorias usando evento_id como pivote.
-- Implementar con el mismo patrón para cada tabla.

-- Acceso anónimo para el portal del invitado (lectura por token)
-- Este acceso se maneja en el servidor con el service role key,
-- nunca exponiendo el token a una query client-side directa.
-- El API Route valida el token y devuelve solo los datos necesarios.
```

---

## 7. Flujos principales a implementar

### Flujo A — Registro y configuración del evento

```
Pareja se registra con email y contraseña (Supabase Auth)
→ Sistema crea registro en tabla `parejas` con auth_user_id
→ Pareja completa formulario de configuración del evento
→ Sistema genera slug único a partir de nombres + fecha
→ Sistema genera PIN de venue de 6 dígitos
→ Pareja paga vía Stripe Checkout
→ Webhook de Stripe recibe confirmación
→ Sistema actualiza eventos.estado_pago = 'pagado'
→ Pareja es redirigida al dashboard
```

### Flujo B — Carga y envío de invitaciones

```
Pareja sube archivo Excel (.xlsx) o CSV desde /dashboard/invitados/subir
→ API Route /api/invitados/subir parsea el archivo (librería: xlsx de npm)
→ Valida columnas mínimas: nombre, telefono o email
→ Crea registros en tabla invitados (token se genera automáticamente)
→ Para cada invitado: llama a /api/invitados/[id]/qr para generar el PNG
→ Sube el PNG a Supabase Storage en path: qr/[evento-id]/[invitado-id].png
→ Guarda URL pública en qr_codes y en invitados.qr_url
→ Dashboard muestra lista con estado 'pendiente_envio'
→ Pareja revisa lista y aprueba el envío
→ Next.js dispara webhook a Make con: evento_id, lista de invitados
→ Make envía WhatsApp a cada invitado con su link /i/[token]
→ Make actualiza estado_envio = 'enviado' vía API Route
```

### Flujo C — RSVP del invitado

```
Invitado abre link /i/[token] en su móvil
→ Server Component consulta invitado por token (service role)
→ Renderiza invitación con nombre, fecha, lugar y QR
→ Invitado toca "Confirmar asistencia"
→ Navega a /rsvp/[token]
→ Completa: asiste (sí/no), menú, acompañante
→ POST a /api/rsvp/confirmar con token y selecciones
→ API crea registro en `confirmaciones`
→ Actualiza invitados.estado_confirmacion
→ Dispara webhook a Make → Make notifica a la pareja por WhatsApp
→ Supabase Realtime notifica al dashboard → contadores se actualizan
```

### Flujo D — Control de acceso QR (día del evento)

```
Venue abre /acceso/[id-evento] en su smartphone
→ Sistema pide PIN de venue
→ Valida PIN contra eventos.pin_venue
→ Activa cámara para escaneo QR
→ Invitado presenta QR (screenshot o link abierto)
→ PWA decodifica el QR → obtiene URL con token
→ POST a /api/acceso/validar-qr con token y evento_id
→ API consulta invitado por token
→ Si válido y primer ingreso: crea registro en `ingresos`, responde verde + nombre
→ Si ya ingresó: crea registro con duplicado=true, responde naranja + hora previa
→ Si no existe: responde rojo
→ Supabase Realtime actualiza panel de aforo en tiempo real
```

### Flujo E — Álbum compartido

```
Invitado abre /album/[slug]
→ Server Component carga fotos y dedicatorias del evento (oculto=false)
→ Renderiza galería masonry
→ Invitado toca "Agregar al álbum"
→ Selector de archivo del navegador (foto o video)
→ Preview de la selección
→ POST a /api/album/upload-signature con evento_id
→ API genera firma de Cloudinary (server-side, nunca expone API secret)
→ Cliente sube directamente a Cloudinary con la firma
→ Cloudinary devuelve public_id y url
→ POST a /api/album/guardar-foto con metadatos
→ API crea registro en tabla `fotos`
→ Supabase Realtime notifica al álbum → foto aparece sin recargar
```

---

## 8. Orden de construcción — subfases

Construir en este orden exacto. No saltar subfases.

### Subfase 4A — Núcleo de datos e identidad

1. Ejecutar el SQL completo en Supabase. Verificar que todas las tablas e índices existen.
2. Implementar todas las políticas RLS.
3. Configurar Supabase Auth en el proyecto Next.js. Instalar `@supabase/ssr`.
4. Crear el cliente de Supabase separado por contexto:
   - `lib/supabase/server.ts` — usa `createServerClient` con cookies
   - `lib/supabase/client.ts` — usa `createBrowserClient`
   - `lib/supabase/admin.ts` — usa `createClient` con service role key. Solo para API Routes que necesitan bypass de RLS.
5. Implementar registro y login de la pareja en `/auth/registro` y `/auth/login`.
6. Implementar middleware de Next.js que protege todas las rutas `/dashboard/*`.
7. Implementar la función `generateQR(invitadoId, token)` en `lib/qr.ts`. Devuelve buffer PNG.

**Criterio de avance 4A:** La pareja puede registrarse, autenticarse, y el sistema genera un QR de prueba que aparece en Supabase Storage sin errores.

---

### Subfase 4B — Panel de la pareja

1. `/dashboard` — muestra: nombre del evento, fecha, total invitados, confirmados, pendientes, rechazos. Supabase Realtime para contadores en vivo.
2. `/dashboard/invitados/subir` — acepta `.xlsx` y `.csv`. Parsea con librería `xlsx`. Valida columnas. Crea registros en bulk. Genera QR para cada uno. Muestra progreso en tiempo real.
3. `/dashboard/invitados` — tabla con todos los invitados: nombre, estado de envío, estado de confirmación, menú seleccionado. Filtros por estado. Exportar a Excel.
4. `/dashboard/confirmaciones` — tabla enfocada en RSVP. Filtro: todos / confirmados / pendientes / rechazos. Contador por opción de menú.
5. `/dashboard/configuracion` — formulario para editar los datos del evento.

**Criterio de avance 4B:** La pareja sube un CSV de 10 invitados y ve el dashboard actualizado con sus estados y los QR generados.

---

### Subfase 4C — Invitación digital y portal del invitado

1. `/i/[token]` — Server Component. Carga invitado por token con admin client. Renderiza: nombres de la pareja, fecha, lugar, QR como imagen, botón "Confirmar asistencia", botón "Ver detalles del evento".
2. `/rsvp/[token]` — formulario de confirmación. Máximo 3 campos visibles. Submit a `/api/rsvp/confirmar`. Pantalla de confirmación con QR descargable.
3. `/evento/[slug]` — microsite público. Renderiza: historia de la pareja, fecha y lugar, Google Maps, dress code, cuenta regalo, countdown a la fecha.
4. `/album/[slug]` — galería masonry. Carga inicial desde servidor. Realtime para fotos nuevas. Botón "Agregar al álbum" con flujo de subida a Cloudinary.

**Criterio de avance 4C:** Un invitado real puede abrir el link, ver su invitación, confirmar asistencia con selección de menú, y la pareja lo ve reflejado en el dashboard en tiempo real.

---

**Subfases 4D, 4E, 4F** — Automatizaciones (Make), Control de acceso QR (PWA del venue), y Álbum completo con dedicatorias y dibujos. Se construyen en este orden después de validar 4A–4C con la primera demo real.

---

## 9. Variables de entorno requeridas

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=           # Solo servidor. Nunca al cliente.

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=               # Solo servidor.

# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_FROM=                # Formato: whatsapp:+14155238886 (sandbox)

# Resend
RESEND_API_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Make
MAKE_WEBHOOK_INVITACIONES=           # URL del webhook de Make para envío masivo
MAKE_WEBHOOK_CONFIRMACION=           # URL del webhook de Make para notif a pareja

# App
NEXT_PUBLIC_APP_URL=                 # https://soomosnova.com en producción
```

---

## 10. Criterios de calidad — no negociables

### Seguridad

- Service role key de Supabase nunca sale del servidor.
- API secret de Cloudinary nunca sale del servidor.
- Tokens de invitados son UUIDs v4 generados por Supabase — nunca IDs incrementales.
- Rate limiting en `/i/[token]` y `/rsvp/[token]` con Vercel Edge Middleware.
- Todas las rutas `/dashboard/*` protegidas por middleware de Next.js.

### Performance

- Las rutas del invitado (`/i/[token]`, `/rsvp/[token]`, `/album/[slug]`) cargan el contenido crítico en el servidor. El tiempo hasta que el invitado ve su nombre debe ser menor a 1.5 segundos en una conexión 4G mexicana promedio.
- Las fotos del álbum siempre se sirven desde la URL thumbnail de Cloudinary en la galería. La URL original solo se carga en la vista expandida.
- El dashboard usa Supabase Realtime para actualizaciones — no polling.

### Mantenibilidad

- Estructura de carpetas respeta la convención App Router: `app/`, `components/`, `lib/`, `types/`.
- Los tipos de TypeScript de todas las entidades de Supabase se generan con `supabase gen types typescript` y se colocan en `types/database.ts`.
- Toda lógica de negocio vive en `lib/` — no en los componentes ni en los API Routes directamente. Los API Routes solo validan input, llaman a funciones de `lib/`, y formatean la respuesta.

---

## 11. Fuera del scope del MVP

Si el contexto o el usuario pide construir alguna de estas funcionalidades, rechazar y señalar que son versiones futuras:

- Mapa de mesas interactivo
- Suscripción del venue (el venue es gratuito en el MVP)
- Menú avanzado con imágenes y descripciones
- Asistente de IA para preguntas de invitados
- App móvil nativa (iOS / Android)
- Renovación automática del álbum al año 5
- Multi-evento por pareja (en el MVP, una pareja tiene un evento)
- Panel de administración de SoomosNova (gestión interna de clientes)
