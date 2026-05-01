-- Migración: soporte de admin
-- Segura e idempotente — puede ejecutarse varias veces sin error.
-- Ejecutar en Supabase SQL Editor (o via supabase db push).

-- 1. Agregar columna role a parejas (solo si no existe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'parejas'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE public.parejas ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
      CHECK (role IN ('user', 'super_admin'));
  END IF;
END
$$;

-- 2. Modificar trigger para que NO cree fila en parejas cuando role='super_admin' en app_metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el usuario tiene role=super_admin en app_metadata, NO crear fila en parejas.
  -- Usamos raw_app_meta_data (no raw_user_meta_data) — el usuario puede modificar user_meta.
  IF (NEW.raw_app_meta_data->>'role') = 'super_admin' THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.parejas (auth_user_id, nombre_1, nombre_2, email, plan)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_1', ''),
    COALESCE(NEW.raw_user_meta_data->>'nombre_2', ''),
    NEW.email,
    'fundador'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- El trigger ya existe (se reemplazó la función, no hace falta DROP/CREATE del trigger)
