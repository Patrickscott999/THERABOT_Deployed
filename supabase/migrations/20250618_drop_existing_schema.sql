-- Drop script to remove existing schema objects
-- Created: 2025-06-18

-- Drop policies first to avoid dependency issues
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Dropped policy % on table %', pol.policyname, pol.tablename;
    END LOOP;
END
$$;

-- Drop triggers
DO $$
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT trigger_name, event_object_table FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.%I', trig.trigger_name, trig.event_object_table);
        RAISE NOTICE 'Dropped trigger % on table %', trig.trigger_name, trig.event_object_table;
    END LOOP;
END
$$;

-- Drop functions
DO $$
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT routine_name, routine_type FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
    LOOP
        EXECUTE format('DROP FUNCTION IF EXISTS public.%I CASCADE', func.routine_name);
        RAISE NOTICE 'Dropped function %', func.routine_name;
    END LOOP;
END
$$;

-- Drop tables with dependencies in the correct order
DROP TABLE IF EXISTS public.privacy_consents CASCADE;
DROP TABLE IF EXISTS public.journal_entries CASCADE;
DROP TABLE IF EXISTS public.insights CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.user_activities CASCADE;
DROP TABLE IF EXISTS public.user_goals CASCADE;
DROP TABLE IF EXISTS public.user_feedback CASCADE;
DROP TABLE IF EXISTS public.emotional_journey CASCADE;
DROP TABLE IF EXISTS public.coping_strategies CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Drop any other tables in case they exist with different names
DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP TABLE IF EXISTS public.%I CASCADE', tbl.tablename);
        RAISE NOTICE 'Dropped table %', tbl.tablename;
    END LOOP;
END
$$;

-- Report completion
DO $$
BEGIN
    RAISE NOTICE 'Schema cleanup completed successfully';
END
$$;
