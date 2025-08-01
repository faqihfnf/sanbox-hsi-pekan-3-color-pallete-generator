"use client";

import { describe } from "@/actions/describe";
import { generatorRandomHexColor } from "@/utils/color-generator";
import React, { useState } from "react";

function ColorPallete() {
  const [pallete, setPallete] = useState<string[]>([]);
  const [description, setDescription] = useState<{
    mood: string;
    usage_scenarios: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePallete = () => {
    const newPallete = Array.from({ length: 6 }, () =>
      generatorRandomHexColor(),
    );
    setPallete(newPallete);
    setDescription(null);
    setError(null);
  };

  const handleCopyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    alert(`Warna ${color} disalin!`);
  };

  const handleDescribePalette = async () => {
    if (pallete.length === 0) return;
    setLoading(true);
    setError(null);
    setDescription(null);

    try {
      const result = await describe(pallete);
      setDescription(result);
    } catch (err: any) {
      console.error("AI error:", err);
      setError("Gagal mendapatkan deskripsi AI.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Generator Palet Warna</h1>
        <p className="mt-2 text-slate-400">
          Klik tombol untuk mendapatkan kombinasi warna baru.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <button
          onClick={handleGeneratePallete}
          className="cursor-pointer rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700"
        >
          Generate Palette
        </button>

        <button
          onClick={handleDescribePalette}
          disabled={pallete.length === 0 || loading}
          className="cursor-pointer rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-purple-700"
        >
          {loading ? "⏳ Generating..." : "✨ Generate AI"}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        {pallete.map((color) => (
          <div
            key={color}
            style={{ backgroundColor: color }}
            className="h-24 w-24 cursor-pointer rounded-md"
            onClick={() => handleCopyToClipboard(color)}
          />
        ))}
      </div>

      {error && <p className="mb-4 text-center text-red-400">{error}</p>}

      {description && (
        <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 text-center text-white shadow-lg">
          <h2 className="mb-2 text-2xl font-bold">Deskripsi Palet</h2>
          <p className="mb-4 text-justify">
            <strong className="mb-6">Suasana:</strong>
            <br />
            {description.mood}
          </p>
          <p className="text-justify">
            <strong className="mb-6">Penggunaan:</strong>
          </p>
          <ul className="list-inside list-disc text-justify">
            {description.usage_scenarios.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default ColorPallete;
