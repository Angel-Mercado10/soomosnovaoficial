-- =============================================================================
-- RLS Fix: fotos & dedicatorias must filter by evento_id to prevent cross-event leaks
-- Issue: MEDIUM 23 — Without evento_id filter, anonymous SELECT could return photos
--        from OTHER events if a client issues a query without the filter.
-- Apply these policies in Supabase Dashboard > Authentication > Policies
-- or via `supabase db push` with migrations.
-- =============================================================================

-- ─── TABLE: fotos ─────────────────────────────────────────────────────────────

-- Drop existing overly-broad public SELECT policy if it exists
DROP POLICY IF EXISTS "fotos_public_select" ON fotos;
DROP POLICY IF EXISTS "Public can view non-hidden photos" ON fotos;

-- New policy: public SELECT must always filter by evento_id AND oculto = false
-- This means the client MUST provide evento_id in the query; otherwise RLS blocks it.
CREATE POLICY "fotos_public_select_by_evento"
ON fotos
FOR SELECT
TO anon, authenticated
USING (
  oculto = false
  AND evento_id IS NOT NULL
  -- Enforce that the evento referenced actually has album_activo = true
  AND EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = fotos.evento_id
      AND eventos.album_activo = true
      AND eventos.deleted_at IS NULL
  )
);

-- Authenticated insert policy: invitado can only insert into their own evento
-- (API layer also validates this, but defense in depth)
DROP POLICY IF EXISTS "fotos_insert_by_invitado" ON fotos;

CREATE POLICY "fotos_insert_by_invitado"
ON fotos
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- The evento must have album_activo = true
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = fotos.evento_id
      AND eventos.album_activo = true
      AND eventos.deleted_at IS NULL
  )
);

-- Pareja (owner) can manage all their fotos
DROP POLICY IF EXISTS "fotos_owner_all" ON fotos;

CREATE POLICY "fotos_owner_all"
ON fotos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos
    JOIN parejas ON parejas.id = eventos.pareja_id
    WHERE eventos.id = fotos.evento_id
      AND parejas.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos
    JOIN parejas ON parejas.id = eventos.pareja_id
    WHERE eventos.id = fotos.evento_id
      AND parejas.auth_user_id = auth.uid()
  )
);


-- ─── TABLE: dedicatorias ──────────────────────────────────────────────────────

-- Drop existing overly-broad public SELECT policy if it exists
DROP POLICY IF EXISTS "dedicatorias_public_select" ON dedicatorias;
DROP POLICY IF EXISTS "Public can view non-hidden dedications" ON dedicatorias;

-- New policy: public SELECT must filter by evento_id AND oculto = false
CREATE POLICY "dedicatorias_public_select_by_evento"
ON dedicatorias
FOR SELECT
TO anon, authenticated
USING (
  oculto = false
  AND evento_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = dedicatorias.evento_id
      AND eventos.deleted_at IS NULL
  )
);

-- Insert: only allowed when evento exists and is not deleted
DROP POLICY IF EXISTS "dedicatorias_insert" ON dedicatorias;

CREATE POLICY "dedicatorias_insert"
ON dedicatorias
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos
    WHERE eventos.id = dedicatorias.evento_id
      AND eventos.deleted_at IS NULL
  )
);

-- Pareja (owner) can manage all their dedicatorias
DROP POLICY IF EXISTS "dedicatorias_owner_all" ON dedicatorias;

CREATE POLICY "dedicatorias_owner_all"
ON dedicatorias
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM eventos
    JOIN parejas ON parejas.id = eventos.pareja_id
    WHERE eventos.id = dedicatorias.evento_id
      AND parejas.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM eventos
    JOIN parejas ON parejas.id = eventos.pareja_id
    WHERE eventos.id = dedicatorias.evento_id
      AND parejas.auth_user_id = auth.uid()
  )
);

-- =============================================================================
-- IMPORTANT: After applying these policies, verify that all application queries
-- against fotos and dedicatorias ALWAYS include a .eq('evento_id', ...) filter.
-- Queries without the filter will return 0 rows (not an error) for anon users.
-- =============================================================================
