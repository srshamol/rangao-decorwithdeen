-- Function to handle visitor session upsert gracefully
CREATE OR REPLACE FUNCTION public.track_visitor_session(
  p_session_id TEXT,
  p_ip_address TEXT,
  p_city TEXT,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_referrer TEXT,
  p_utm_source TEXT DEFAULT NULL,
  p_utm_medium TEXT DEFAULT NULL,
  p_utm_campaign TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.visitor_sessions (
    session_id,
    ip_address,
    city,
    device_type,
    browser,
    os,
    referrer,
    utm_source,
    utm_medium,
    utm_campaign,
    last_active,
    is_active
  )
  VALUES (
    p_session_id,
    p_ip_address,
    p_city,
    p_device_type,
    p_browser,
    p_os,
    p_referrer,
    p_utm_source,
    p_utm_medium,
    p_utm_campaign,
    now(),
    true
  )
  ON CONFLICT (session_id)
  DO UPDATE SET
    last_active = now(),
    is_active = true,
    ip_address = EXCLUDED.ip_address,
    city = EXCLUDED.city,
    device_type = EXCLUDED.device_type,
    browser = EXCLUDED.browser,
    os = EXCLUDED.os;
END;
$$;

-- Grant access to anon and authenticated
GRANT EXECUTE ON FUNCTION public.track_visitor_session TO anon, authenticated;
