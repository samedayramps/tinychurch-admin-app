-- Create the is_superadmin function
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND is_superadmin = true
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_superadmin() TO authenticated;

-- Add type definitions for impersonation_sessions
COMMENT ON TABLE public.impersonation_sessions IS 'Table storing user impersonation sessions';
COMMENT ON COLUMN public.impersonation_sessions.id IS 'Unique identifier for the impersonation session';
COMMENT ON COLUMN public.impersonation_sessions.real_user_id IS 'ID of the superadmin user doing the impersonation';
COMMENT ON COLUMN public.impersonation_sessions.target_user_id IS 'ID of the user being impersonated';
COMMENT ON COLUMN public.impersonation_sessions.created_at IS 'Timestamp when the impersonation session was created';
COMMENT ON COLUMN public.impersonation_sessions.expires_at IS 'Timestamp when the impersonation session expires';
COMMENT ON COLUMN public.impersonation_sessions.metadata IS 'Additional metadata about the impersonation session'; 