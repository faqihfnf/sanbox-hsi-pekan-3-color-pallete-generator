import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Pallete Color Generator",
  },
});

export async function describeColorPalette(palette: string[]) {
  const prompt = `Given this color palette: ${palette.join(", ")}, describe the overall mood it conveys and suggest 2-3 usage scenarios. Please feedback in Bahasa Indonesia. Respond in JSON format like this: {"mood":"...", "usage_scenarios":["...","..."]}`;

  const completion = await openai.chat.completions.create({
    model: "mistralai/mistral-7b-instruct:free",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const raw = completion.choices[0].message.content || "{}";
  return JSON.parse(raw);
}
