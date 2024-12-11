-- First drop the existing function
DROP FUNCTION IF EXISTS public.get_impersonatable_users();

-- Then create the new function
CREATE OR REPLACE FUNCTION public.get_impersonatable_users()
RETURNS TABLE (
    id uuid,
    email citext,
    full_name varchar(255),
    is_superadmin boolean,
    organization_members jsonb
) 
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_is_superadmin boolean;
BEGIN
    -- Get current user ID
    v_user_id := auth.uid();
    
    -- Log attempt
    RAISE LOG 'get_impersonatable_users called by user: %', v_user_id;
    
    -- First verify the current user is a superadmin
    SELECT profiles.is_superadmin INTO v_is_superadmin
    FROM public.profiles 
    WHERE profiles.id = v_user_id;
    
    -- Log superadmin status
    RAISE LOG 'User % superadmin status: %', v_user_id, v_is_superadmin;
    
    IF NOT v_is_superadmin THEN
        RAISE EXCEPTION 'Only superadmins can view impersonatable users';
    END IF;

    -- Return all users except the current user
    RETURN QUERY
    WITH user_orgs AS (
        SELECT 
            p.id,
            p.email,
            p.full_name,
            p.is_superadmin,
            COALESCE(
                jsonb_agg(
                    jsonb_build_object(
                        'role', om.role,
                        'organization', jsonb_build_object(
                            'id', o.id,
                            'name', o.name
                        )
                    )
                ) FILTER (WHERE om.organization_id IS NOT NULL),
                '[]'::jsonb
            ) as organization_members
        FROM public.profiles p
        LEFT JOIN public.organization_members om ON om.user_id = p.id
        LEFT JOIN public.organizations o ON o.id = om.organization_id
        WHERE p.id != v_user_id  -- Exclude current user
        AND p.is_active = true    -- Only active users
        GROUP BY p.id, p.email, p.full_name, p.is_superadmin
    )
    SELECT * FROM user_orgs;

    -- Log completion
    RAISE LOG 'get_impersonatable_users completed successfully for user: %', v_user_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log any errors
        RAISE LOG 'Error in get_impersonatable_users for user %: % - %', 
            v_user_id, SQLERRM, SQLSTATE;
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_impersonatable_users() TO authenticated; 