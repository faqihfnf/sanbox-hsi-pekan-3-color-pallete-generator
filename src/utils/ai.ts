import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Palette Color Generator",
  },
});

export async function describeColorPalette(palette: string[]) {
  const prompt = `Given this color palette: ${palette.join(
    ", ",
  )}, describe the overall mood it conveys and suggest 2-3 usage scenarios. Please feedback always in Bahasa Indonesia at mood and usage scenarios. Respond only in JSON format like: {"mood":"...", "usage_scenarios":["...","..."]}`;

  const completion = await openai.chat.completions.create({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = completion.choices[0].message.content || "";

  // Ambil hanya bagian JSON dari response
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new Error("Model response does not contain valid JSON.");
  }

  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("JSON parse error:", err);
    throw new Error("Failed to parse JSON response from AI.");
  }
}
