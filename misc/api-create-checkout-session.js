// api/create-checkout-session.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, success_url, cancel_url } = req.body;

    if (!items || !Array.isArray(items) || !items.length) {
      return res.status(400).json({ error: "No items provided" });
    }

    // Build Stripe line_items
    const line_items = items.map(it => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: it.name
        },
        unit_amount: Number(it.unit_price)
      },
      quantity: Number(it.quantity)
    }));

    // Store order payload as JSON string in metadata.
    // NOTE: metadata has size limits. For larger carts you should persist to DB and reference by id.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      shipping_address_collection: { allowed_countries: ["US"] },
      // put order json in metadata so webhook can read items (not ideal for huge carts)
      metadata: {
        order: JSON.stringify(items)
      },
      success_url: success_url || `${process.env.DOMAIN || "https://example.com"}?checkout=success`,
      cancel_url: cancel_url || `${process.env.DOMAIN || "https://example.com"}?checkout=cancel`
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
}
