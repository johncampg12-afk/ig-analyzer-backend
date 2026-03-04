import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: "IG Analyzer PRO - Lifetime"
            },
            unit_amount: 1500 // 15€
          },
          quantity: 1
        }
      ],
      success_url: "https://tudominio.com/success",
      cancel_url: "https://tudominio.com/cancel"
    });

    res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Stripe error: " + err.message });
  }
}