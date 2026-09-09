// Función segura de Supabase (Edge Function).
// Guarda la clave SECRETA de Stripe escondida y crea la sesión de pago.
// El navegador NUNCA ve la clave secreta.

import Stripe from "https://esm.sh/stripe@16?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
  apiVersion: "2024-06-20",
});

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const origin = req.headers.get("origin") ?? "https://pmrindustries.github.io";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "Tareas PMR · Premium" },
          unit_amount: 500, // 5,00 € (en céntimos)
        },
        quantity: 1,
      }],
      success_url: `${origin}/MIS-TAREAS/?pago=ok`,
      cancel_url: `${origin}/MIS-TAREAS/?pago=cancelado`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...cors, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
