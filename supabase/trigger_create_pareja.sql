-- Trigger que crea automáticamente un registro en parejas
-- cuando se registra un nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
