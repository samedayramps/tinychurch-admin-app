-- Add this to a new migration
DO $$
BEGIN
    RAISE NOTICE 'Verifying impersonation_sessions table...';
    
    -- Check if table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'impersonation_sessions'
    ) THEN
        RAISE EXCEPTION 'Table impersonation_sessions does not exist!';
    END IF;
    
    -- Check columns
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'impersonation_sessions'
        AND column_name = 'real_user_id'
    ) THEN
        RAISE EXCEPTION 'Column real_user_id is missing!';
    END IF;
    
    -- Check RLS is enabled
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'impersonation_sessions'
        AND rowsecurity = true
    ) THEN
        RAISE EXCEPTION 'RLS is not enabled on impersonation_sessions!';
    END IF;
    
    -- Check policies
    IF NOT EXISTS (
        SELECT FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'impersonation_sessions'
    ) THEN
        RAISE EXCEPTION 'No policies found on impersonation_sessions!';
    END IF;
    
    RAISE NOTICE 'All checks passed!';
END $$; 