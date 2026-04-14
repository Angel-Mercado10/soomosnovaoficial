-- ============================================================
-- SoomosNova v1.0 — Políticas RLS
-- Ejecutar DESPUÉS de schema.sql
-- ============================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE parejas        ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitados      ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes       ENABLE ROW LEVEL SECURITY;
ALTER TABLE confirmaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingresos       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE dedicatorias   ENABLE ROW LEVEL SECURITY;

-- ── PAREJAS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_su_registro" ON parejas;
CREATE POLICY "pareja_su_registro"
ON parejas FOR ALL
USING (auth_user_id = auth.uid());

-- ── EVENTOS ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_su_evento" ON eventos;
CREATE POLICY "pareja_su_evento"
ON eventos FOR ALL
USING (pareja_id = (
  SELECT id FROM parejas WHERE auth_user_id = auth.uid()
));

-- ── INVITADOS ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_invitados" ON invitados;
CREATE POLICY "pareja_sus_invitados"
ON invitados FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- ── QR CODES ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_qr_codes" ON qr_codes;
CREATE POLICY "pareja_sus_qr_codes"
ON qr_codes FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- ── CONFIRMACIONES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_confirmaciones" ON confirmaciones;
CREATE POLICY "pareja_sus_confirmaciones"
ON confirmaciones FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- ── INGRESOS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_ingresos" ON ingresos;
CREATE POLICY "pareja_sus_ingresos"
ON ingresos FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- ── FOTOS ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_fotos" ON fotos;
CREATE POLICY "pareja_sus_fotos"
ON fotos FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- Acceso de lectura anónimo al álbum (invitados ven fotos no ocultas)
DROP POLICY IF EXISTS "invitado_lee_fotos_publicas" ON fotos;
CREATE POLICY "invitado_lee_fotos_publicas"
ON fotos FOR SELECT
USING (oculto = false);

-- ── DEDICATORIAS ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "pareja_sus_dedicatorias" ON dedicatorias;
CREATE POLICY "pareja_sus_dedicatorias"
ON dedicatorias FOR ALL
USING (evento_id IN (
  SELECT id FROM eventos WHERE pareja_id = (
    SELECT id FROM parejas WHERE auth_user_id = auth.uid()
  )
));

-- Acceso de lectura anónimo a dedicatorias públicas
DROP POLICY IF EXISTS "invitado_lee_dedicatorias_publicas" ON dedicatorias;
CREATE POLICY "invitado_lee_dedicatorias_publicas"
ON dedicatorias FOR SELECT
USING (oculto = false);
