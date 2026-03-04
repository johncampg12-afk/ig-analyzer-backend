import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { licenseKey } = req.body;

    if (!licenseKey) {
      return res.status(200).json({ valid: false });
    }

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data } = await supabase
      .from("licenses")
      .select("*")
      .eq("license_key", licenseKey)
      .single();

    if (!data || data.status !== "active") {
      return res.status(200).json({ valid: false });
    }

    return res.status(200).json({ valid: true });

  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}