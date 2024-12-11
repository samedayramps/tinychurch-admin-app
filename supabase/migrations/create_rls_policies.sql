-- First, enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
-- ... (repeat for all tables)

-- Create superadmin policy for each table
-- This uses the is_superadmin() function from your database

-- Profiles table
CREATE POLICY "Superadmins have full access to profiles" ON public.profiles
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Organizations table
CREATE POLICY "Superadmins have full access to organizations" ON public.organizations
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Organization members table
CREATE POLICY "Superadmins have full access to organization members" ON public.organization_members
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Groups table
CREATE POLICY "Superadmins have full access to groups" ON public.groups
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Group members table
CREATE POLICY "Superadmins have full access to group members" ON public.group_members
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Messages table
CREATE POLICY "Superadmins have full access to messages" ON public.messages
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Calendar events table
CREATE POLICY "Superadmins have full access to calendar events" ON public.calendar_events
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Email logs table
CREATE POLICY "Superadmins have full access to email logs" ON public.email_logs
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Message templates table
CREATE POLICY "Superadmins have full access to message templates" ON public.message_templates
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- User activity logs table
CREATE POLICY "Superadmins have full access to user activity logs" ON public.user_activity_logs
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Organization settings table
CREATE POLICY "Superadmins have full access to organization settings" ON public.organization_settings
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Organization limits table
CREATE POLICY "Superadmins have full access to organization limits" ON public.organization_limits
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Organization usage table
CREATE POLICY "Superadmins have full access to organization usage" ON public.organization_usage
    USING (is_superadmin())
    WITH CHECK (is_superadmin());

-- Messaging settings table
CREATE POLICY "Superadmins have full access to messaging settings" ON public.messaging_settings
    USING (is_superadmin())
    WITH CHECK (is_superadmin()); 