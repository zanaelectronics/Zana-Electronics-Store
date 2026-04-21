import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MOMO_BASE = Deno.env.get("MOMO_BASE_URL") || "https://sandbox.momodeveloper.mtn.com";
const MOMO_ENV = Deno.env.get("MOMO_TARGET_ENVIRONMENT") || "sandbox";
const MOMO_KEY = Deno.env.get("MOMO_PRIMARY_KEY")!;
const MOMO_USER = Deno.env.get("MOMO_API_USER_ID")!;
const MOMO_API_KEY = Deno.env.get("MOMO_API_KEY")!;

async function getToken(): Promise<string> {
  const auth = btoa(`${MOMO_USER}:${MOMO_API_KEY}`);
  const res = await fetch(`${MOMO_BASE}/collection/token/`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Ocp-Apim-Subscription-Key": MOMO_KEY,
      "Content-Length": "0",
    },
  });
  if (!res.ok) throw new Error(`Token failed ${res.status}`);
  return (await res.json()).access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { orderId } = await req.json();
    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_ref, status, user_id")
      .eq("id", orderId)
      .single();

    if (!order || order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.payment_ref) {
      return new Response(JSON.stringify({ status: "PENDING" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();
    const res = await fetch(
      `${MOMO_BASE}/collection/v1_0/requesttopay/${order.payment_ref}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": MOMO_ENV,
          "Ocp-Apim-Subscription-Key": MOMO_KEY,
        },
      },
    );

    const json = await res.json();
    const status = json.status as string; // "PENDING" | "SUCCESSFUL" | "FAILED"

    if (status === "SUCCESSFUL" && order.status !== "paid") {
      await supabase.from("orders").update({ status: "paid" }).eq("id", orderId);
    }

    return new Response(
      JSON.stringify({ status, reason: json.reason }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("momo-status error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
