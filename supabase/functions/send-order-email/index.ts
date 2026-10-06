// Socyn Crest — send-order-email edge function.
//
// Sends a branded order-confirmation receipt through Resend after checkout.
// Called from the storefront (fire-and-forget) with { order_id }.
//
// Security:
//   - verify_jwt is enabled (see supabase/config.toml), so only signed-in
//     users can invoke this function.
//   - The order is fetched with the service-role key and we check that
//     order.customer_id matches the caller's user id before sending.
//
// Deploy:  supabase functions deploy send-order-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx
//          (optional) supabase secrets set RESEND_FROM="Socyn Crest <orders@socyncrest.com>"
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("RESEND_FROM") ?? "Socyn Crest <orders@socyncrest.com>";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://ecomchris.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const money = (n: number) => `$${Number(n).toFixed(2)}`;
const esc = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface OrderItem { name: string; price: number; qty: number }
interface Order {
  id: string; seq: number; customer_name: string; email: string;
  subtotal: number; shipping: number; shipping_method: string; total: number;
  address: { name: string; phone?: string; street: string; city: string; state: string; zip: string };
  created_at: string; order_items: OrderItem[];
}

function receiptHtml(order: Order): string {
  const number = `SC-${String(order.seq).padStart(4, "0")}`;
  const a = order.address || {};
  const rows = (order.order_items || []).map((i) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e2e8dd;">${esc(i.name)}<br>
        <span style="color:#75857b;font-size:13px;">Qty ${i.qty}</span></td>
      <td align="right" style="padding:10px 0;border-bottom:1px solid #e2e8dd;">${money(i.price * i.qty)}</td>
    </tr>`).join("");
  const methodLabel = order.shipping_method === "express" ? "Express (2 business days)" : "Standard (3–5 business days)";
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f7f8f4;font-family:Georgia,'Times New Roman',serif;color:#163638;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <div style="background:#163638;color:#f7f8f4;padding:28px 32px;text-align:center;">
      <div style="font-size:22px;letter-spacing:3px;">SOCYN CREST</div>
      <div style="font-size:12px;letter-spacing:2px;color:#dceaae;margin-top:6px;">CLOTHING &amp; TEXTILES</div>
    </div>
    <div style="background:#ffffff;padding:32px;">
      <h1 style="font-size:22px;margin:0 0 8px;">Thank you, ${esc(order.customer_name)}.</h1>
      <p style="margin:0 0 20px;color:#5e7569;">Your order <strong style="color:#163638;">${number}</strong> is confirmed. We'll email you again when it ships.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;">${rows}</table>
      <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;margin-top:12px;">
        <tr><td style="padding:4px 0;color:#5e7569;">Subtotal</td><td align="right" style="padding:4px 0;">${money(order.subtotal)}</td></tr>
        <tr><td style="padding:4px 0;color:#5e7569;">Shipping — ${methodLabel}</td><td align="right" style="padding:4px 0;">${order.shipping === 0 ? "FREE" : money(order.shipping)}</td></tr>
        <tr><td style="padding:10px 0 0;font-weight:bold;font-size:17px;">Total</td><td align="right" style="padding:10px 0 0;font-weight:bold;font-size:17px;">${money(order.total)}</td></tr>
      </table>
      <div style="margin-top:24px;padding:16px;background:#f7f8f4;font-size:14px;line-height:1.6;">
        <strong>Shipping to</strong><br>
        ${esc(a.name)}<br>${esc(a.street)}<br>${esc(a.city)}, ${esc(a.state)} ${esc(a.zip)}
      </div>
      <p style="margin:20px 0 0;font-size:13px;color:#75857b;">Questions about your order? Reply to this email or call us at +1 (507) 696-9852, Monday–Friday, 9am–5pm CT.</p>
      <p style="margin:16px 0 0;"><a href="${SITE_URL}/account" style="display:inline-block;background:#163638;color:#dceaae;text-decoration:none;padding:12px 28px;font-size:14px;letter-spacing:1px;">TRACK YOUR ORDER</a></p>
    </div>
    <div style="text-align:center;padding:20px;font-size:12px;color:#75857b;">
      Socyn Crest LLC · 4660 90th Ave SE, Eyota, MN 55934<br>
      <a href="${SITE_URL}" style="color:#75857b;">ecomchris.vercel.app</a>
    </div>
  </div></body></html>`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set on this function.");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const authHeader = req.headers.get("Authorization") ?? "";
    const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userErr } = await caller.auth.getUser();
    if (userErr || !user) throw new Error("Not authenticated.");

    const { order_id } = await req.json();
    if (!order_id) throw new Error("order_id is required.");

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: order, error: orderErr } = await admin
      .from("orders").select("*, order_items(*)").eq("id", order_id).single();
    if (orderErr || !order) throw new Error("Order not found.");
    if (order.customer_id !== user.id) throw new Error("That order does not belong to this account.");

    const number = `SC-${String(order.seq).padStart(4, "0")}`;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: [order.email],
        subject: `Your Socyn Crest order ${number} is confirmed`,
        html: receiptHtml(order as Order),
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Resend rejected the email (${res.status}): ${detail.slice(0, 200)}`);
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
