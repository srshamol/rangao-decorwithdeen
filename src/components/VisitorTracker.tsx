import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";

export function VisitorTracker() {
  const pathname = usePathname();
  const sessionIdRef = useRef<string | null>(null);
  const visitorDataRef = useRef<any>(null);

  useEffect(() => {
    // 1. Initialize or get Session ID
    let sid = localStorage.getItem("rangao_session_id");
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("rangao_session_id", sid);
    }
    sessionIdRef.current = sid;

    // 2. Capture Initial Session Info
    const captureSession = async () => {
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
      const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
      
      const deviceType = isTablet ? "tablet" : (isMobile ? "mobile" : "desktop");
      const browser = userAgent.includes("Chrome") ? "Chrome" : (userAgent.includes("Safari") ? "Safari" : (userAgent.includes("Firefox") ? "Firefox" : "Other"));
      const os = userAgent.includes("Windows") ? "Windows" : (userAgent.includes("Mac") ? "MacOS" : (userAgent.includes("Android") ? "Android" : (userAgent.includes("iOS") ? "iOS" : "Linux")));

      const urlParams = new URLSearchParams(window.location.search);
      
      // Try to get IP and Location (simple fetch)
      let ip = "unknown";
      let city = "Dhaka"; // Default for Rangao.bd
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        ip = ipData.ip;

        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
        const geoData = await geoRes.json();
        if (geoData.city) city = geoData.city;
      } catch (e) {
        console.warn("Geo lookup failed, using defaults", e);
      }
      
      const data = {
        p_session_id: sid,
        p_ip_address: ip,
        p_city: city,
        p_device_type: deviceType,
        p_browser: browser,
        p_os: os,
        p_referrer: document.referrer || "direct",
        p_utm_source: urlParams.get("utm_source"),
        p_utm_medium: urlParams.get("utm_medium"),
        p_utm_campaign: urlParams.get("utm_campaign")
      };

      visitorDataRef.current = data;

      // Use the RPC function for graceful handling of upserts and RLS
      const { error: sessionError } = await supabase.rpc("track_visitor_session" as any, data);

      if (sessionError) {
        console.error("Session tracking error (Full):", sessionError);
        console.error("Session tracking error message:", sessionError.message || "Unknown tracking error");
      }
    };

    captureSession();

    // 3. Heartbeat to keep session active
    const heartbeat = setInterval(async () => {
      if (sessionIdRef.current && visitorDataRef.current) {
        // Reuse the same RPC for heartbeat to ensure all fields stay synced and last_active updates
        await supabase.rpc("track_visitor_session" as any, {
          ...visitorDataRef.current,
          p_referrer: "heartbeat" // Marker for internal update
        });
      }
    }, 30000); // Every 30s

    return () => clearInterval(heartbeat);
  }, []);

  // 4. Track Page Views
  useEffect(() => {
    if (!sessionIdRef.current) return;

    const trackPageView = async () => {
      await supabase.from("page_views").insert({
        session_id: sessionIdRef.current!,
        page_url: pathname,
        page_title: document.title,
      });

      // Also log as an event
      await supabase.from("visitor_events").insert({
        session_id: sessionIdRef.current!,
        event_type: "VIEW",
        page_url: pathname,
        event_data: { title: document.title }
      });
    };

    trackPageView();
  }, [pathname]);

  return null;
}

// Helper to track custom events (like Add to Cart)
export const trackEvent = async (type: string, data: any = {}) => {
  const sid = localStorage.getItem("rangao_session_id");
  if (!sid) return;

  await supabase.from("visitor_events").insert({
    session_id: sid,
    event_type: type,
    event_data: data,
    page_url: window.location.pathname
  });
};
