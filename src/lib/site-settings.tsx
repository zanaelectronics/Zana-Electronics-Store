import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ContactSettings { email: string; phone: string; address: string; }
export interface DeliverySettings { kigali: string; provinces: string; freeThreshold: number; }
export interface PaymentSettings { momoNumber: string; provider: string; }
export interface HeroSettings { image: string; useDefaultImage: boolean; }
export interface AISettings { systemPrompt: string; }

export interface SiteSettings {
  contact: ContactSettings;
  delivery: DeliverySettings;
  payment: PaymentSettings;
  hero: HeroSettings;
  ai: AISettings;
}

const defaults: SiteSettings = {
  contact: { email: "info@zana.rw", phone: "+250 780 000 000", address: "Kigali, Rwanda" },
  delivery: { kigali: "Same-day delivery in Kigali", provinces: "2-3 days to provinces", freeThreshold: 100000 },
  payment: { momoNumber: "*182*8*1*ZANA#", provider: "MTN MoMo Pay" },
  hero: { image: "", useDefaultImage: true },
  ai: { systemPrompt: "You are ZANA Assistant, a friendly helper for ZANA Electronics in Rwanda." },
};

interface SiteSettingsContext {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  update: <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => Promise<{ error?: string }>;
}

const Ctx = createContext<SiteSettingsContext | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaults);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const next = { ...defaults };
      for (const row of data) {
        if (row.key in next) (next as any)[row.key] = { ...(next as any)[row.key], ...(row.value as any) };
      }
      setSettings(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const update = useCallback(async <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    const { error } = await supabase.from("site_settings").upsert({ key: key as string, value: value as any });
    if (error) return { error: error.message };
    setSettings((s) => ({ ...s, [key]: value }));
    return {};
  }, []);

  return <Ctx.Provider value={{ settings, loading, refresh, update }}>{children}</Ctx.Provider>;
}

export function useSiteSettings() {
  const c = useContext(Ctx);
  if (!c) {
    return {
      settings: defaults,
      loading: false,
      refresh: async () => {},
      update: async () => ({ error: "Provider not mounted" }),
    } as SiteSettingsContext;
  }
  return c;
}
