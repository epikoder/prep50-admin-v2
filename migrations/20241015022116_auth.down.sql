DROP FUNCTION IF EXISTS public.refresh_token;

DROP FUNCTION IF EXISTS public.login;

DROP FUNCTION IF EXISTS public.generate_jwt_token;

DROP TRIGGER IF EXISTS encrypt_password ON auth.users;

DROP FUNCTION IF EXISTS auth.encrypt_password;

DROP TRIGGER IF EXISTS update_user_updated_at ON auth.users;

DROP FUNCTION IF EXISTS auth.update_updated_at_column;

DROP TABLE IF EXISTS auth.tokens;

DROP TYPE IF EXISTS public.token_pair;

DROP TABLE IF EXISTS auth.users;

DROP FUNCTION IF EXISTS auth.check_role_exists;

DO $$
BEGIN
  -- Check if the 'anon' role exists before revoking usage on the 'public' schema
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'anon'
  ) THEN
    REVOKE USAGE ON SCHEMA public FROM anon;
  END IF;

  -- Check if the 'authenticated' role exists before revoking usage on the 'public' schema
  IF EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'authenticated'
  ) THEN
    REVOKE USAGE ON SCHEMA public FROM authenticated;
  END IF;
END $$;

DROP ROLE IF EXISTS authenticated;

DROP ROLE IF EXISTS anon;

DROP SCHEMA IF EXISTS "auth";