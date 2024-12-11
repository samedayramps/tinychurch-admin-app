-- Create impersonation sessions table
CREATE TABLE public.impersonation_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    real_user_id uuid NOT NULL REFERENCES auth.users(id),
    target_user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now() NOT NULL,
    expires_at timestamptz NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    CONSTRAINT different_users CHECK (real_user_id != target_user_id)
);

-- Enable RLS
ALTER TABLE public.impersonation_sessions ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX idx_impersonation_real_user ON public.impersonation_sessions(real_user_id);
CREATE INDEX idx_impersonation_target_user ON public.impersonation_sessions(target_user_id);
CREATE INDEX idx_impersonation_expires_at ON public.impersonation_sessions(expires_at);

-- Add policies
CREATE POLICY "Superadmins can access impersonation sessions"
ON public.impersonation_sessions
FOR ALL USING (
    (SELECT is_superadmin FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Users can see their own impersonation sessions"
ON public.impersonation_sessions
FOR SELECT USING (
    real_user_id = auth.uid() OR
    target_user_id = auth.uid()
);

-- Add helper functions
CREATE OR REPLACE FUNCTION public.start_impersonation(
    p_real_user_id uuid,
    p_target_user_id uuid
) RETURNS uuid AS $$
DECLARE
    v_session_id uuid;
BEGIN
    -- Verify real user is superadmin
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = p_real_user_id 
        AND is_superadmin = true
    ) THEN
        RAISE EXCEPTION 'Only superadmins can impersonate users';
    END IF;

    -- Create new session
    INSERT INTO public.impersonation_sessions (
        real_user_id,
        target_user_id,
        expires_at
    ) VALUES (
        p_real_user_id,
        p_target_user_id,
        now() + interval '24 hours'
    )
    RETURNING id INTO v_session_id;

    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.end_impersonation(
    p_session_id uuid
) RETURNS boolean AS $$
BEGIN
    UPDATE public.impersonation_sessions
    SET expires_at = now()
    WHERE id = p_session_id
    AND expires_at > now();

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check active impersonation
CREATE OR REPLACE FUNCTION public.get_active_impersonation(
    p_user_id uuid
) RETURNS TABLE (
    session_id uuid,
    real_user_id uuid,
    target_user_id uuid
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        id,
        real_user_id,
        target_user_id
    FROM public.impersonation_sessions
    WHERE (real_user_id = p_user_id OR target_user_id = p_user_id)
    AND expires_at > now()
    ORDER BY created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 