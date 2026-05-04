/**
 * Tracking Utility for Meta Pixel and Analytics
 */

export const TRACKING_EVENTS = {
  PAGE_VIEW: "PageView",
  VIEW_CONTENT: "ViewContent",
  ADD_TO_CART: "AddToCart",
  INITIATE_CHECKOUT: "InitiateCheckout",
  PURCHASE: "Purchase",
  CONTACT: "Contact",
  TIME_ON_PAGE: "TimeOnPage",
  PAGE_SCROLL: "PageScroll",
  WATCH_VIDEO: "WatchVideo",
  INTERNAL_CLICK: "InternalClick",
};

import { supabase } from "@/integrations/supabase/client";

export const trackEvent = async (eventName: string, params: Record<string, any> = {}) => {
  // 1. Meta Pixel Tracking (Client-side)
  if (typeof window !== "undefined" && (window as any).fbq) {
    (window as any).fbq("track", eventName, params);
  }

  // 2. Internal Visitor Tracking (Supabase)
  const sid = typeof window !== "undefined" ? localStorage.getItem("rangao_session_id") : null;
  if (sid) {
    try {
      await supabase.from("visitor_events").insert({
        session_id: sid,
        event_type: eventName,
        event_data: params,
        page_url: typeof window !== "undefined" ? window.location.pathname : ""
      });
    } catch (err) {
      console.error("[Internal Tracking Error]", err);
    }
  }

  // 3. Log to console for debugging in dev
  if (process.env.NODE_ENV === "development") {
    console.log(`[Tracking] ${eventName}`, params);
  }
};

export const initPixel = (pixelId: string, testCode?: string) => {
  if (typeof window === "undefined") return;

  (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  (window as any).fbq("init", pixelId);
  if (testCode) {
    (window as any).fbq('set', 'test_event_code', testCode);
  }
  (window as any).fbq("track", "PageView");
};
