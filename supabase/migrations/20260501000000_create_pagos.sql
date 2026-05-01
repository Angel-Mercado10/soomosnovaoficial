-- =============================================================================
-- Migration: create_pagos
-- Descripción: Tabla de pagos con lifecycle completo, RLS, trigger updated_at
-- Idempotente: sí (usa IF NOT EXISTS / DO $$ blocks)
-- =============================================================================

-- 1. Enum pago_status (idempotente)
DO $$ BEGIN
  CREATE TYPE public.pago_status AS ENUM (
    'pending',
    'succeeded',
    'failed',
    'refunded'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 2. Helper update_updated_at_column (idempotente)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 3. Tabla pagos
CREATE TABLE IF NOT EXISTS public.pagos (
  id                      uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id               uuid          NOT NULL REFERENCES public.eventos(id) ON DELETE RESTRICT,
  pareja_id               uuid          NOT NULL REFERENCES public.parejas(id) ON DELETE RESTRICT,
  stripe_payment_intent_id text          UNIQUE,
  stripe_session_id       text,
  amount_cents            integer       NOT NULL CHECK (amount_cents >= 0),
  currency                text          NOT NULL DEFAULT 'mxn' CHECK (char_length(currency) = 3),
  status                  public.pago_status NOT NULL DEFAULT 'pending',
  is_manual               boolean       NOT NULL DEFAULT false,
  paid_at                 timestamptz,
  raw_event               jsonb,
  created_at              timestamptz   NOT NULL DEFAULT now(),
  updated_at              timestamptz   NOT NULL DEFAULT now()
);

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_pagos_evento_id   ON public.pagos (evento_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pareja_id   ON public.pagos (pareja_id);
CREATE INDEX IF NOT EXISTS idx_pagos_status       ON public.pagos (status);
CREATE INDEX IF NOT EXISTS idx_pagos_created_at   ON public.pagos (created_at DESC);

-- Unique parcial para stripe_session_id (solo filas con valor)
CREATE UNIQUE INDEX IF NOT EXISTS uidx_pagos_stripe_session_id
  ON public.pagos (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- 5. Trigger updated_at
DROP TRIGGER IF EXISTS trg_pagos_updated_at ON public.pagos;
CREATE TRIGGER trg_pagos_updated_at
  BEFORE UPDATE ON public.pagos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RLS
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Pareja puede leer sus propios pagos
DROP POLICY IF EXISTS "pareja_select_own_pagos" ON public.pagos;
CREATE POLICY "pareja_select_own_pagos"
  ON public.pagos
  FOR SELECT
  USING (
    pareja_id IN (
      SELECT id FROM public.parejas
      WHERE auth_user_id = auth.uid()
    )
  );

-- Super admin puede leer todo
DROP POLICY IF EXISTS "admin_select_all_pagos" ON public.pagos;
CREATE POLICY "admin_select_all_pagos"
  ON public.pagos
  FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
  );

-- 7. Backfill: una fila sintética por evento con estado_pago = 'pagado'
--    Usamos COALESCE con fallback a now() para evitar errores si columna updated_at no existe en eventos.
--    Como la columna updated_at puede no estar en eventos, usamos solo created_at con fallback.
INSERT INTO public.pagos (
  evento_id,
  pareja_id,
  stripe_session_id,
  amount_cents,
  currency,
  status,
  is_manual,
  paid_at,
  raw_event
)
SELECT
  e.id,
  e.pareja_id,
  e.stripe_session_id,
  299900,
  'mxn',
  'succeeded',
  true,
  COALESCE(e.created_at, now()),
  '{"backfill": true}'::jsonb
FROM public.eventos e
WHERE
  e.estado_pago = 'pagado'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagos p WHERE p.evento_id = e.id
  );
