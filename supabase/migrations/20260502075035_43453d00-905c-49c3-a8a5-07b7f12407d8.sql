-- Revoke public execute on internal SECURITY DEFINER helpers.
-- These remain callable from RLS / triggers (they run with definer privileges)
-- but external clients (anon/authenticated) can no longer invoke them directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
