import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Supabase's gateway already verifies the Bearer token (anon key or user JWT)
    // before this function runs. We just require its presence as a sanity check.
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cap message size to prevent prompt-stuffing abuse
    const { messages } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const totalLen = messages.reduce((a: number, m: any) => a + (typeof m?.content === "string" ? m.content.length : 0), 0);
    if (totalLen > 8000) {
      return new Response(JSON.stringify({ error: "Message too long" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Pull live products + admin-editable settings to give the AI fresh context
    const [{ data: products }, { data: settingsRows }] = await Promise.all([
      supabase.from("products").select("name, description, price, category, stock"),
      supabase.from("site_settings").select("key, value"),
    ]);

    const settingsMap: Record<string, any> = {};
    for (const row of settingsRows ?? []) settingsMap[row.key] = row.value;

    const adminPrompt = settingsMap.ai?.systemPrompt ||
      "You are ZANA Assistant, a friendly helper for ZANA Electronics in Rwanda.";

    const productList = (products ?? []).slice(0, 50).map((p: any) =>
      `- ${p.name} (${p.category}) — ${p.price.toLocaleString()} RWF, stock: ${p.stock}${p.description ? ` — ${p.description}` : ""}`
    ).join("\n");

    const contact = settingsMap.contact || {};
    const delivery = settingsMap.delivery || {};
    const payment = settingsMap.payment || {};

    const systemContent = `${adminPrompt}

# Live store information

Contact: ${contact.email || "info@zana.rw"} · ${contact.phone || "+250 780 000 000"} · ${contact.address || "Kigali, Rwanda"}
Delivery: ${delivery.kigali || ""} | ${delivery.provinces || ""} | Free over ${(delivery.freeThreshold ?? 100000).toLocaleString()} RWF
Payment: ${payment.provider || "MTN MoMo Pay"} (${payment.momoNumber || ""})

# Current catalog (${products?.length ?? 0} products)
${productList || "(No products yet)"}

Always answer in the language the user writes in. Prices are RWF. Be concise.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemContent }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
