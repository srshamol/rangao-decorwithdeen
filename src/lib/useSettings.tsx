import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "rangao_settings_v2";
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const SettingsContext = createContext<{ settings: any; loading: boolean; error: string | null }>({
  settings: {},
  loading: true,
  error: null,
});

function getFromCache(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
  return null;
}

function saveToCache(data: any) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

/** Call this from admin settings pages after saving changes */
export function invalidateSettingsCache() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {}
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const cachedData = getFromCache();
  const [settings, setSettings] = useState<any>(cachedData || {});
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const setupRealtime = () => {
      if (channelRef.current) return;
      channelRef.current = supabase
        .channel("global-store-configs")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "store_configs" },
          (payload) => {
            if (!isMounted) return;
            if (payload.new && "id" in payload.new && "value" in payload.new) {
              setSettings((prev: any) => {
                const next = {
                  ...prev,
                  [(payload.new as any).id]: (payload.new as any).value,
                };
                saveToCache(next);
                return next;
              });
            }
          }
        )
        .subscribe();
    };

    // If we already have valid cache, skip the network fetch
    const fromCache = getFromCache();
    if (fromCache) {
      setSettings(fromCache);
      setLoading(false);
      setupRealtime();
      return () => {
        isMounted = false;
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    }

    // Safety timeout to prevent global loading block
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    async function fetchSettings() {
      try {
        const { data, error: fetchError } = await supabase
          .from("store_configs")
          .select("*");

        if (!isMounted) return;

        if (fetchError) {
          console.error("Supabase Config Error:", fetchError.message);
          setError(fetchError.message || "Database connection failure");
        } else if (data) {
          const settingsMap = data.reduce((acc: any, item: any) => {
            acc[item.id] = item.value;
            return acc;
          }, {});
          setSettings(settingsMap || {});
          saveToCache(settingsMap);
        }
      } catch (e: any) {
        if (!isMounted) return;
        console.error("Unexpected Settings Error:", e);
        setError(e.message);
      } finally {
        if (isMounted) {
          setLoading(false);
          setupRealtime();
          clearTimeout(safetyTimeout);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings: settings || {}, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    return { settings: {}, loading: false, error: null };
  }
  return {
    ...context,
    settings: context.settings || {},
  };
}
