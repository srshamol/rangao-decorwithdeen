-- Fix RLS for tracking tables to allow anonymous visitors
-- This ensures "Live Now" and "Visitor Insights" work correctly

-- 1. visitor_sessions
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert sessions" ON public.visitor_sessions;
CREATE POLICY "Public insert sessions" ON public.visitor_sessions 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Public update sessions" ON public.visitor_sessions;
CREATE POLICY "Public update sessions" ON public.visitor_sessions 
FOR UPDATE TO anon, authenticated 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read sessions" ON public.visitor_sessions;
CREATE POLICY "Admins read sessions" ON public.visitor_sessions 
FOR SELECT TO authenticated 
USING (true);

-- 2. page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert page_views" ON public.page_views;
CREATE POLICY "Public insert page_views" ON public.page_views 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read page_views" ON public.page_views;
CREATE POLICY "Admins read page_views" ON public.page_views 
FOR SELECT TO authenticated 
USING (true);

-- 3. visitor_events
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert events" ON public.visitor_events;
CREATE POLICY "Public insert events" ON public.visitor_events 
FOR INSERT TO anon, authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read events" ON public.visitor_events;
CREATE POLICY "Admins read events" ON public.visitor_events 
FOR SELECT TO authenticated 
USING (true);

-- 4. Enable Realtime for visitor_sessions if not already
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'visitor_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;
  END IF;
END $$;
