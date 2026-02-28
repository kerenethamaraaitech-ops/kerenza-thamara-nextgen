export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { message } = req.body ?? {};
    if (!message) return res.status(400).json({ error: "Missing message" });

    const MODEL = "HuggingFaceH4/zephyr-7b-beta";
    
    const hfRes = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `Réponds en français, court, et utile. Message: ${message}`,
        parameters: { max_new_tokens: 120 }
      }),
    });

    const data = await hfRes.json();

    if (!hfRes.ok) {
      return res.status(hfRes.status).json({ error: "HF error", details: data });
    }

    const reply =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : (data?.generated_text ?? JSON.stringify(data));

    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ error: "Server error", details: String(e) });
  }
}
