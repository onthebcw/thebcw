// api/stripe-webhook.js
import Stripe from "stripe";
import fetch from "node-fetch";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Vercel/Netlify give raw body — ensure you configure the function to get raw body
    const raw = await buffer(req);
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Try to get order metadata (items)
    const itemsJson = session.metadata?.order;
    let items = [];
    try { items = itemsJson ? JSON.parse(itemsJson) : []; } catch(e){ items = []; }

    // shipping info
    const shipping = session.shipping || session.customer_details || {};
    // Prepare Printful order payload
    const recipient = {
      name: (session.customer_details?.name) || "Customer",
      address1: shipping.address?.line1 || shipping.address?.line1 || "",
      address2: shipping.address?.line2 || "",
      city: shipping.address?.city || "",
      state_code: shipping.address?.state || "",
      country_code: (shipping.address?.country) || "",
      zip: shipping.address?.postal_code || ""
    };

    const printfulItems = items.map(it => ({
      variant_id: Number(it.printfulVariantId),
      quantity: Number(it.quantity)
    }));

    if (printfulItems.length) {
      try {
        await createPrintfulOrder(recipient, printfulItems);
        console.log("Printful order created for session:", session.id);
      } catch (err) {
        console.error("Failed to create Printful order:", err);
      }
    }
  }

  res.status(200).json({ received: true });
}

/* Helper: create order at Printful */
async function createPrintfulOrder(recipient, items) {
  const API_KEY = process.env.PRINTFUL_API_KEY;
  if (!API_KEY) throw new Error("Missing PRINTFUL_API_KEY");

  const payload = {
    recipient,
    items
  };

  const resp = await fetch("https://api.printful.com/orders", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const body = await resp.json();
  if (!resp.ok) throw new Error("Printful error: " + JSON.stringify(body));
  return body;
}

/* Helper: read raw body buffer (Vercel recommended pattern) */
async function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
