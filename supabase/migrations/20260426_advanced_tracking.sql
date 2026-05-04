-- Expand tracking system for actual data
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  country TEXT DEFAULT 'Bangladesh',
  city TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  is_active BOOLEAN DEFAULT true,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.visitor_sessions(session_id),
  page_url TEXT NOT NULL,
  page_title TEXT,
  duration INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES public.visitor_sessions(session_id),
  event_type TEXT NOT NULL, -- VIEW, CART, CHECKOUT, ORDER
  event_data JSONB,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  risk_level TEXT NOT NULL, -- safe, suspicious, high
  reason TEXT,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public insert sessions" ON public.visitor_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update sessions" ON public.visitor_sessions FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Admins read sessions" ON public.visitor_sessions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public insert page_views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read page_views" ON public.page_views FOR SELECT TO authenticated USING (true);

CREATE POLICY "Public insert events" ON public.visitor_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins read events" ON public.visitor_events FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage fraud" ON public.fraud_flags FOR ALL TO authenticated USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_flags;
