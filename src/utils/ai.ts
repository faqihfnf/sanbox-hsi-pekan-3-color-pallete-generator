import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "Palette Color Generator",
  },
});

function cleanJsonString(str: string): string {
  // Remove common prefixes that AI might add
  str = str.replace(/^.*?(?=\{)/m, "");

  // Remove common suffixes after the JSON
  str = str.replace(/\}.*$/m, "}");

  // Fix common JSON issues
  str = str.replace(/,\s*}/g, "}"); // Remove trailing commas
  str = str.replace(/,\s*]/g, "]"); // Remove trailing commas in arrays

  return str.trim();
}

function extractJsonFromText(text: string): string | null {
  // Try to find JSON block with various patterns
  const patterns = [
    /```json\s*([\s\S]*?)\s*```/i,
    /```\s*([\s\S]*?)\s*```/i,
    /\{[\s\S]*\}/,
    /"mood"[\s\S]*?"usage_scenarios"[\s\S]*?\]/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let jsonStr = match[1] || match[0];

      // If it doesn't start with {, try to wrap it
      if (!jsonStr.trim().startsWith("{")) {
        // Look for mood and usage_scenarios in the text
        const moodMatch = text.match(/"mood"\s*:\s*"([^"]+)"/);
        const usageMatch = text.match(/"usage_scenarios"\s*:\s*\[([\s\S]*?)\]/);

        if (moodMatch && usageMatch) {
          jsonStr = `{"mood":"${moodMatch[1]}","usage_scenarios":[${usageMatch[1]}]}`;
        }
      }

      return cleanJsonString(jsonStr);
    }
  }

  return null;
}

function createFallbackResponse(palette: string[]): {
  mood: string;
  usage_scenarios: string[];
} {
  // Simple fallback based on color analysis
  const colorCount = palette.length;
  const hasWarm = palette.some((color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return r > g && r > b;
  });

  const hasCool = palette.some((color) => {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    return b > r && b > g;
  });

  let mood = "Palet warna yang menarik dengan kombinasi yang harmonis";
  let usage_scenarios = [
    "Desain web atau aplikasi modern",
    "Branding dan identitas visual",
    "Desain grafis dan poster",
  ];

  if (hasWarm && hasCool) {
    mood =
      "Palet yang seimbang dengan perpaduan warna hangat dan dingin, menciptakan kontras yang menarik";
    usage_scenarios = [
      "Website landing page yang eye-catching",
      "Desain UI/UX untuk aplikasi mobile",
      "Material design untuk presentasi bisnis",
    ];
  } else if (hasWarm) {
    mood = "Palet hangat yang memberikan kesan energik dan ramah";
    usage_scenarios = [
      "Branding untuk restoran atau cafe",
      "Website e-commerce yang mengundang",
      "Desain poster event atau festival",
    ];
  } else if (hasCool) {
    mood = "Palet sejuk yang memberikan kesan profesional dan tenang";
    usage_scenarios = [
      "Website corporate atau teknologi",
      "Aplikasi produktivitas dan bisnis",
      "Desain untuk brand kesehatan atau wellness",
    ];
  }

  return { mood, usage_scenarios };
}

export async function describeColorPalette(palette: string[]) {
  try {
    const prompt = `Analisis palet warna berikut: ${palette.join(", ")}

Berikan deskripsi dalam format JSON yang TEPAT seperti contoh ini:
{"mood":"Deskripsi suasana dalam bahasa Indonesia","usage_scenarios":["Skenario 1","Skenario 2","Skenario 3"]}

PENTING:
- Respon HARUS dalam format JSON yang valid
- Gunakan bahasa Indonesia untuk mood dan usage_scenarios
- Berikan 2-3 skenario penggunaan
- Jangan tambahkan teks apapun selain JSON`;

    const completion = await openai.chat.completions.create({
      model: "moonshotai/kimi-k2:free",
      messages: [
        {
          role: "system",
          content:
            "You are a color expert. Always respond with valid JSON only. No explanations, no markdown, just pure JSON",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content || "";
    console.log("Raw AI response:", raw);

    // Try to extract JSON from the response
    const jsonStr = extractJsonFromText(raw);

    if (!jsonStr) {
      console.warn("No valid JSON found in AI response, using fallback");
      return createFallbackResponse(palette);
    }

    try {
      const parsed = JSON.parse(jsonStr);

      // Validate the structure
      if (!parsed.mood || !Array.isArray(parsed.usage_scenarios)) {
        console.warn("Invalid JSON structure, using fallback");
        return createFallbackResponse(palette);
      }

      return parsed;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Attempted to parse:", jsonStr);
      return createFallbackResponse(palette);
    }
  } catch (error) {
    console.error("AI API error:", error);
    return createFallbackResponse(palette);
  }
}
