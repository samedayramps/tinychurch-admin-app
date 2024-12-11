-- Drop existing policies first
DROP POLICY IF EXISTS "Superadmins can access impersonation sessions" ON public.impersonation_sessions;
DROP POLICY IF EXISTS "Users can see their own impersonation sessions" ON public.impersonation_sessions;

-- Add more permissive policies for testing
CREATE POLICY "Anyone can read impersonation sessions"
ON public.impersonation_sessions
FOR SELECT
USING (true);

CREATE POLICY "Superadmins can manage impersonation sessions"
ON public.impersonation_sessions
FOR ALL
USING (
    EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.is_superadmin = true
    )
); 