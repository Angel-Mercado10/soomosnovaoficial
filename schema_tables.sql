-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PAREJAS
CREATE TABLE IF NOT EXISTS parejas (
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

-- EVENTOS
CREATE TABLE IF NOT EXISTS eventos (
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

-- INVITADOS
CREATE TABLE IF NOT EXISTS invitados (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id             uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nombre                text NOT NULL,
  telefono              text,
  email                 text,
  token                 uuid NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
  estado_envio          text NOT NULL DEFAULT 'pendiente_envio' CHECK (estado_envio IN ('pendiente_envio','enviado','error_envio')),
  estado_confirmacion   text NOT NULL DEFAULT 'pendiente' CHECK (estado_confirmacion IN ('pendiente','confirmado','rechazo','pendiente_decision')),
  qr_url                text,
  enviado_at            timestamptz,
  recordatorio_1_at     timestamptz,
  recordatorio_2_at     timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);

-- QR CODES
CREATE TABLE IF NOT EXISTS qr_codes (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id     uuid NOT NULL UNIQUE REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  storage_path    text NOT NULL,
  public_url      text NOT NULL,
  generado_at     timestamptz NOT NULL DEFAULT now(),
  regenerado_at   timestamptz
);

-- CONFIRMACIONES
CREATE TABLE IF NOT EXISTS confirmaciones (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id         uuid NOT NULL UNIQUE REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id           uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  asiste              boolean NOT NULL,
  opcion_menu         text,
  lleva_acompanante   boolean,
  nombre_acompanante  text,
  confirmed_at        timestamptz NOT NULL DEFAULT now()
);

-- INGRESOS
CREATE TABLE IF NOT EXISTS ingresos (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitado_id     uuid NOT NULL REFERENCES invitados(id) ON DELETE CASCADE,
  evento_id       uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  ingresado_at    timestamptz NOT NULL DEFAULT now(),
  duplicado       boolean NOT NULL DEFAULT false,
  metodo          text NOT NULL DEFAULT 'qr' CHECK (metodo IN ('qr','manual')),
  registrado_por  text
);

-- FOTOS
CREATE TABLE IF NOT EXISTS fotos (
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

-- DEDICATORIAS
CREATE TABLE IF NOT EXISTS dedicatorias (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  evento_id     uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  invitado_id   uuid REFERENCES invitados(id) ON DELETE SET NULL,
  tipo          text NOT NULL CHECK (tipo IN ('texto','dibujo')),
  contenido     text NOT NULL,
  oculto        boolean NOT NULL DEFAULT false,
  creado_at     timestamptz NOT NULL DEFAULT now()
);
