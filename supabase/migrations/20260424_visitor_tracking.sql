-- Create visitor_activity table for real-time tracking
CREATE TABLE IF NOT EXISTS public.visitor_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_url TEXT,
  user_agent TEXT,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_activity ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public insert visitor_activity" ON public.visitor_activity FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update own visitor_activity" ON public.visitor_activity FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins read visitor_activity" ON public.visitor_activity FOR SELECT TO authenticated USING (true);

-- Index for performance on live count queries
CREATE INDEX IF NOT EXISTS idx_visitor_activity_last_active ON public.visitor_activity(last_active);
CREATE INDEX IF NOT EXISTS idx_visitor_activity_session_id ON public.visitor_activity(session_id);

-- Function to clean up old session data (older than 24h)
CREATE OR REPLACE FUNCTION public.cleanup_old_visitors() 
RETURNS void AS $$
BEGIN
  DELETE FROM public.visitor_activity WHERE last_active < now() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
