-- 1. Create store_configs table
CREATE TABLE IF NOT EXISTS public.store_configs (
    id TEXT PRIMARY KEY,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create visitor tracking tables
CREATE TABLE IF NOT EXISTS public.visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    country TEXT,
    city TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.visitor_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}'::jsonb,
    page_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create RPC for visitor tracking
CREATE OR REPLACE FUNCTION public.track_visitor_session(
    p_session_id TEXT,
    p_ip_address TEXT DEFAULT NULL,
    p_city TEXT DEFAULT NULL,
    p_device_type TEXT DEFAULT NULL,
    p_browser TEXT DEFAULT NULL,
    p_os TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_utm_source TEXT DEFAULT NULL,
    p_utm_medium TEXT DEFAULT NULL,
    p_utm_campaign TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.visitor_sessions (
        session_id, ip_address, city, device_type, browser, os, referrer, utm_source, utm_medium, utm_campaign, last_active, is_active
    )
    VALUES (
        p_session_id, p_ip_address, p_city, p_device_type, p_browser, p_os, p_referrer, p_utm_source, p_utm_medium, p_utm_campaign, NOW(), TRUE
    )
    ON CONFLICT (session_id)
    DO UPDATE SET
        last_active = NOW(),
        is_active = TRUE,
        ip_address = COALESCE(EXCLUDED.ip_address, public.visitor_sessions.ip_address),
        city = COALESCE(EXCLUDED.city, public.visitor_sessions.city),
        referrer = CASE WHEN EXCLUDED.referrer = 'heartbeat' THEN public.visitor_sessions.referrer ELSE COALESCE(EXCLUDED.referrer, public.visitor_sessions.referrer) END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Enable RLS and set public policies
ALTER TABLE public.store_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

-- Allow public read for store_configs
CREATE POLICY "Allow public read on store_configs" ON public.store_configs FOR SELECT TO anon, authenticated USING (TRUE);

-- Allow public insert for visitor data
CREATE POLICY "Allow public insert on visitor_sessions" ON public.visitor_sessions FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Allow public update on visitor_sessions" ON public.visitor_sessions FOR UPDATE TO anon, authenticated USING (TRUE);
CREATE POLICY "Allow public read on visitor_sessions" ON public.visitor_sessions FOR SELECT TO anon, authenticated USING (TRUE);

CREATE POLICY "Allow public insert on page_views" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
CREATE POLICY "Allow public insert on visitor_events" ON public.visitor_events FOR INSERT TO anon, authenticated WITH CHECK (TRUE);
