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
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Token failed ${res.status}: ${txt}`);
  }
  const json = await res.json();
  return json.access_token;
}

function normalizePhone(phone: string): string {
  // Strip non-digits
  let p = phone.replace(/\D/g, "");
  // If starts with 0 (Rwanda local), replace with 250
  if (p.startsWith("0")) p = "250" + p.slice(1);
  // If 9 digits (no country code), prepend 250
  if (p.length === 9) p = "250" + p;
  return p;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const orderId = body?.orderId;
    const phone = body?.phone;
    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const phoneRe = /^[0-9+\s-]{7,20}$/;
    if (typeof orderId !== "string" || !uuidRe.test(orderId) ||
        typeof phone !== "string" || !phoneRe.test(phone)) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify order belongs to user & is pending
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, total, status, user_id")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (order.status !== "pending") {
      return new Response(JSON.stringify({ error: "Order already processed" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = await getToken();
    const referenceId = crypto.randomUUID();
    const msisdn = normalizePhone(phone);

    // In sandbox, MTN expects EUR amounts and accepts test MSISDNs.
    // We send the RWF total as the amount; sandbox doesn't actually move money.
    const payload = {
      amount: String(order.total),
      currency: MOMO_ENV === "sandbox" ? "EUR" : "RWF",
      externalId: order.id,
      payer: { partyIdType: "MSISDN", partyId: msisdn },
      payerMessage: `Payment for order ${order.id.slice(0, 8)}`,
      payeeNote: "ZANA Electronics",
    };

    const rtpRes = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Reference-Id": referenceId,
        "X-Target-Environment": MOMO_ENV,
        "Ocp-Apim-Subscription-Key": MOMO_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (rtpRes.status !== 202) {
      const txt = await rtpRes.text();
      console.error("RTP failed:", rtpRes.status, txt);
      return new Response(
        JSON.stringify({ error: "Payment request failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Save reference + phone on order so we can poll later
    await supabase
      .from("orders")
      .update({ payment_ref: referenceId, payment_phone: msisdn })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ success: true, referenceId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("momo-pay error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
