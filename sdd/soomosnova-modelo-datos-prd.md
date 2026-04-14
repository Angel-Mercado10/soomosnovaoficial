# PRD 2.3 — Modelo de Datos · SoomosNova v1.0

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Documento:** 2.3 — Modelo de Datos  
**Depende de:** 2.1 — Flujo del Invitado · 2.2 — Arquitectura Técnica  
**Siguiente documento:** 2.4 — Prompt Maestro  

---

## Principios de diseño

**Aislamiento por evento.** Ningún dato de una boda es visible desde otra. Se garantiza con Row Level Security (RLS) en Supabase, no solo en código de aplicación.

**Trazabilidad de estados.** Cada entidad que cambia de estado en el tiempo tiene un timestamp asociado. Permite auditar sin logs externos.

**Eliminación suave.** Nada se elimina físicamente. Los registros se marcan `deleted_at` o `oculto = true`. Protege integridad referencial y permite recuperación ante errores.

---

## Entidades y relaciones

```
parejas ──(1:1)── eventos ──(1:N)── invitados ──(1:1)── qr_codes
                     │                  │
                     │                  └──(1:N)── confirmaciones
                     │                  └──(1:N)── ingresos
                     │
                     └──(1:N)── fotos
                     └──(1:N)── dedicatorias
```

Una pareja tiene un evento. Un evento tiene muchos invitados. Cada invitado tiene un QR único, una confirmación, y puede generar múltiples contribuciones al álbum.

---

## Tabla: `parejas`

Almacena las credenciales y datos de la pareja. Es la única entidad con cuenta de usuario real en Supabase Auth. El `auth_user_id` hace el puente entre la tabla de Supabase Auth y los datos del negocio.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK, generado por Supabase |
| `auth_user_id` | `uuid` | NO | FK → `auth.users.id` de Supabase |
| `nombre_1` | `text` | NO | Nombre del primer integrante |
| `nombre_2` | `text` | NO | Nombre del segundo integrante |
| `email` | `text` | NO | Email de contacto principal |
| `telefono` | `text` | YES | WhatsApp de la pareja |
| `plan` | `text` | NO | `fundador` \| `starter` \| `premium` |
| `created_at` | `timestamptz` | NO | Default: `now()` |
| `deleted_at` | `timestamptz` | YES | Null = activa |

---

## Tabla: `eventos`

Un evento es una boda específica. Toda la operación del sistema gira alrededor de este registro. El `slug` es el identificador público que aparece en las URLs del microsite y del álbum.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `pareja_id` | `uuid` | NO | FK → `parejas.id` |
| `nombre_evento` | `text` | NO | Ej: "Boda Ana y Luis" |
| `slug` | `text` | NO | Único. Ej: `ana-y-luis-jun-2025` |
| `fecha_evento` | `date` | NO | Fecha del evento |
| `hora_evento` | `time` | YES | Hora de inicio |
| `lugar_nombre` | `text` | YES | Nombre del venue |
| `lugar_direccion` | `text` | YES | Dirección completa |
| `lugar_maps_url` | `text` | YES | Link de Google Maps |
| `dress_code` | `text` | YES | Indicaciones de vestimenta |
| `cuenta_regalo` | `text` | YES | CLABE o info bancaria para regalo |
| `opciones_menu` | `jsonb` | NO | Array de opciones. Default: `["Pollo","Res","Vegetariano"]` |
| `permite_acompanante` | `boolean` | NO | Default: `false` |
| `album_activo` | `boolean` | NO | Default: `false`. La pareja activa el álbum cuando quiere |
| `album_expira_at` | `timestamptz` | YES | Se calcula: `fecha_evento + 5 años` |
| `pin_venue` | `text` | YES | PIN de 6 dígitos para acceso de venue |
| `estado_pago` | `text` | NO | `pendiente` \| `pagado` |
| `stripe_session_id` | `text` | YES | Para reconciliar con Stripe |
| `created_at` | `timestamptz` | NO | Default: `now()` |
| `deleted_at` | `timestamptz` | YES | Null = activo |

**Constraint crítico:** `slug` debe ser `UNIQUE` a nivel de tabla. Se genera automáticamente a partir de los nombres y la fecha, con sufijo numérico si hay colisión.

---

## Tabla: `invitados`

Un registro por persona invitada. El `token` es el identificador público que va codificado en la URL de la invitación. Nunca se expone el `id` interno en las URLs.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `evento_id` | `uuid` | NO | FK → `eventos.id` |
| `nombre` | `text` | NO | Nombre completo del invitado |
| `telefono` | `text` | YES | WhatsApp para envío |
| `email` | `text` | YES | Email de fallback |
| `token` | `uuid` | NO | UUID v4 único. Generado en inserción |
| `estado_envio` | `text` | NO | `pendiente_envio` \| `enviado` \| `error_envio` |
| `estado_confirmacion` | `text` | NO | `pendiente` \| `confirmado` \| `rechazo` \| `pendiente_decision` |
| `qr_url` | `text` | YES | URL pública del PNG en Supabase Storage |
| `enviado_at` | `timestamptz` | YES | Timestamp del primer envío exitoso |
| `recordatorio_1_at` | `timestamptz` | YES | Timestamp del primer recordatorio |
| `recordatorio_2_at` | `timestamptz` | YES | Timestamp del segundo recordatorio |
| `created_at` | `timestamptz` | NO | Default: `now()` |
| `deleted_at` | `timestamptz` | YES | Eliminación suave |

**Constraints:**
- `token` debe ser `UNIQUE`.
- Si no tiene `telefono` ni `email`, el sistema lo marca con `estado_envio = 'error_envio'` en el momento de la carga.

---

## Tabla: `confirmaciones`

Una confirmación por invitado. Relación 1:1 con `invitados`. Se crea cuando el invitado completa el formulario RSVP. Si el invitado no ha respondido, no existe el registro — se infiere del `estado_confirmacion` en la tabla `invitados`.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `invitado_id` | `uuid` | NO | FK → `invitados.id`. `UNIQUE` |
| `evento_id` | `uuid` | NO | FK → `eventos.id` (desnormalizado para queries eficientes) |
| `asiste` | `boolean` | NO | `true` = confirma, `false` = rechaza |
| `opcion_menu` | `text` | YES | Null si `asiste = false` |
| `lleva_acompanante` | `boolean` | YES | Null si el evento no permite acompañantes |
| `nombre_acompanante` | `text` | YES | Opcional si lleva acompañante |
| `confirmed_at` | `timestamptz` | NO | Timestamp de la confirmación |

**Nota de diseño:** `evento_id` está desnormalizado intencionalmente. El dashboard hace queries frecuentes de "todas las confirmaciones de mi evento" — tener el `evento_id` directo evita un JOIN innecesario con `invitados` en cada carga.

---

## Tabla: `qr_codes`

Un QR por invitado. Relación 1:1 con `invitados`. Se almacena separado para no inflar la tabla de invitados con datos de storage y para facilitar la regeneración.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `invitado_id` | `uuid` | NO | FK → `invitados.id`. `UNIQUE` |
| `evento_id` | `uuid` | NO | FK → `eventos.id` |
| `storage_path` | `text` | NO | Path en Supabase Storage. Ej: `qr/[evento-id]/[invitado-id].png` |
| `public_url` | `text` | NO | URL pública del PNG |
| `generado_at` | `timestamptz` | NO | Default: `now()` |
| `regenerado_at` | `timestamptz` | YES | Si se regeneró por pérdida |

---

## Tabla: `ingresos`

Un registro por cada escaneo el día del evento. Si el QR es escaneado dos veces, hay dos registros — el segundo con `duplicado = true`. Permite auditar intentos de reingreso.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `invitado_id` | `uuid` | NO | FK → `invitados.id` |
| `evento_id` | `uuid` | NO | FK → `eventos.id` |
| `ingresado_at` | `timestamptz` | NO | Default: `now()` |
| `duplicado` | `boolean` | NO | Default: `false`. `true` si ya había un ingreso previo |
| `metodo` | `text` | NO | `qr` \| `manual` (búsqueda por nombre) |
| `registrado_por` | `text` | YES | Identificador del dispositivo del venue que escaneó |

---

## Tabla: `fotos`

Cada foto o video subido al álbum. El archivo físico vive en Cloudinary — aquí solo se guardan los metadatos y referencias.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `evento_id` | `uuid` | NO | FK → `eventos.id` |
| `invitado_id` | `uuid` | YES | FK → `invitados.id`. Null si la subió la pareja |
| `cloudinary_public_id` | `text` | NO | ID único en Cloudinary. Para transformaciones y eliminación |
| `url_original` | `text` | NO | URL de la versión original |
| `url_thumbnail` | `text` | NO | URL del thumbnail generado por Cloudinary |
| `tipo` | `text` | NO | `foto` \| `video` |
| `oculto` | `boolean` | NO | Default: `false`. La pareja puede ocultar sin eliminar |
| `subido_at` | `timestamptz` | NO | Default: `now()` |

---

## Tabla: `dedicatorias`

Mensajes de texto o dibujos a mano que los invitados dejan en el álbum. Se separan de `fotos` porque son texto o SVG, no archivos binarios pesados.

| Campo | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | `uuid` | NO | PK |
| `evento_id` | `uuid` | NO | FK → `eventos.id` |
| `invitado_id` | `uuid` | YES | FK → `invitados.id`. Null si la dejó la pareja |
| `tipo` | `text` | NO | `texto` \| `dibujo` |
| `contenido` | `text` | NO | Texto libre o SVG del dibujo como string |
| `oculto` | `boolean` | NO | Default: `false` |
| `creado_at` | `timestamptz` | NO | Default: `now()` |

---

## Resumen de relaciones y Foreign Keys

| Tabla origen | Relación | Tabla destino | Campo FK | On delete |
|---|---|---|---|---|
| `parejas` | 1:1 | `auth.users` | `auth_user_id` | CASCADE |
| `eventos` | N:1 | `parejas` | `pareja_id` | RESTRICT |
| `invitados` | N:1 | `eventos` | `evento_id` | CASCADE |
| `confirmaciones` | 1:1 | `invitados` | `invitado_id` | CASCADE |
| `confirmaciones` | N:1 | `eventos` | `evento_id` | CASCADE |
| `qr_codes` | 1:1 | `invitados` | `invitado_id` | CASCADE |
| `ingresos` | N:1 | `invitados` | `invitado_id` | CASCADE |
| `ingresos` | N:1 | `eventos` | `evento_id` | CASCADE |
| `fotos` | N:1 | `eventos` | `evento_id` | CASCADE |
| `fotos` | N:1 | `invitados` | `invitado_id` | SET NULL |
| `dedicatorias` | N:1 | `eventos` | `evento_id` | CASCADE |
| `dedicatorias` | N:1 | `invitados` | `invitado_id` | SET NULL |

**Por qué `SET NULL` en fotos y dedicatorias hacia invitados:** si se elimina un invitado (soft delete aparte), sus contribuciones al álbum permanecen — pertenecen al evento, no a la persona. La pareja no pierde el contenido.

---

## Políticas RLS requeridas (Supabase)

El agente debe implementar estas políticas en la subfase 4A antes de cualquier otra cosa. Sin RLS, cualquier pareja autenticada podría leer datos de otras bodas.

```sql
-- Una pareja solo ve su propio evento
CREATE POLICY "pareja_ve_su_evento"
ON eventos FOR ALL
USING (pareja_id = (
  SELECT id FROM parejas WHERE auth_user_id = auth.uid()
));

-- Los invitados de un evento solo son visibles para la pareja dueña
CREATE POLICY "pareja_ve_sus_invitados"
ON invitados FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- Acceso anónimo al invitado por token (para el portal del invitado)
CREATE POLICY "acceso_por_token"
ON invitados FOR SELECT
USING (token = current_setting('request.jwt.claims', true)::jsonb->>'token');
```

La política de acceso por token requiere que el API Route de Next.js inyecte el token del invitado como claim en el JWT de la sesión anónima de Supabase. El agente debe implementar este mecanismo en la subfase 4C cuando construya el portal del invitado.

---

## Schema SQL completo para Supabase

SQL listo para ejecutar directamente en el SQL Editor de Supabase.

```sql
-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PAREJAS ──────────────────────────────────────────────────────
CREATE TABLE parejas (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id    uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_1        text NOT NULL,
  nombre_2        text NOT NULL,
  email           text NOT NULL,
  telefono        text,
  plan            text NOT NULL DEFAULT 'fundador' CHECK (plan IN ('fundador','starter','premium')),
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
  estado_pago         text NOT NULL DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente','pagado')),
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
                          CHECK (estado_confirmacion IN ('pendiente','confirmado','rechazo','pendiente_decision')),
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
