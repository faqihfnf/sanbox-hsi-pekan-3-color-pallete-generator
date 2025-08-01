"use client";

import { describe } from "@/actions/describe";
import { generatorRandomHexColor } from "@/utils/color-generator";
import { Copy, Check, Lock, Unlock } from "lucide-react";
import React, { useState } from "react";

function ColorPallete() {
  const [pallete, setPallete] = useState<string[]>([]);
  const [lockedColors, setLockedColors] = useState<boolean[]>([]);
  const [copiedStates, setCopiedStates] = useState<boolean[]>([]);
  const [tooltipStates, setTooltipStates] = useState<{ [key: number]: string }>(
    {},
  );
  const [description, setDescription] = useState<{
    mood: string;
    usage_scenarios: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePallete = () => {
    const newPallete = Array.from({ length: 6 }, (_, index) => {
      // Jika warna dikunci, pertahankan warna lama
      if (lockedColors[index] && pallete[index]) {
        return pallete[index];
      }
      return generatorRandomHexColor();
    });

    setPallete(newPallete);

    // Inisialisasi locked colors jika pertama kali generate
    if (lockedColors.length === 0) {
      setLockedColors(new Array(6).fill(false));
    }

    // Reset copied states
    setCopiedStates(new Array(6).fill(false));
    setTooltipStates({});

    setDescription(null);
    setError(null);
  };

  const handleCopyToClipboard = async (color: string, index: number) => {
    try {
      await navigator.clipboard.writeText(color);

      // Update copied state dan tooltip untuk index tertentu
      const newCopiedStates = [...copiedStates];
      newCopiedStates[index] = true;
      setCopiedStates(newCopiedStates);

      // Show tooltip
      setTooltipStates((prev) => ({ ...prev, [index]: "Warna disalin!" }));

      // Reset copied state dan tooltip setelah 2 detik
      setTimeout(() => {
        setCopiedStates((prev) => {
          const updated = [...prev];
          updated[index] = false;
          return updated;
        });
        setTooltipStates((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to copy color:", err);
      setTooltipStates((prev) => ({ ...prev, [index]: "Gagal menyalin" }));
      setTimeout(() => {
        setTooltipStates((prev) => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }, 2000);
    }
  };

  const handleToggleLock = (index: number) => {
    const newLockedColors = [...lockedColors];
    newLockedColors[index] = !newLockedColors[index];
    setLockedColors(newLockedColors);

    // Show tooltip
    const message = newLockedColors[index] ? "Warna dikunci" : "Warna dibuka";
    setTooltipStates((prev) => ({ ...prev, [index]: message }));

    // Reset tooltip setelah 1.5 detik
    setTimeout(() => {
      setTooltipStates((prev) => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }, 1500);
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
          className="cursor-pointer rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-md shadow-teal-400 transition-transform hover:scale-105 hover:bg-indigo-700"
        >
          Generate Palette
        </button>

        <button
          onClick={handleDescribePalette}
          disabled={pallete.length === 0 || loading}
          className="cursor-pointer rounded-lg bg-purple-600 px-8 py-3 text-lg font-semibold text-white shadow-md shadow-teal-400 transition-transform hover:scale-105 hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "⏳ Generating..." : "✨ Generate AI"}
        </button>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-4">
        {pallete.map((color, index) => (
          <div
            key={`${color}-${index}`}
            style={{ backgroundColor: color }}
            className="group relative h-24 w-24 rounded-md shadow-lg transition-shadow duration-200 hover:shadow-xl"
          >
            {/* Copy Icon */}
            <button
              onClick={() => handleCopyToClipboard(color, index)}
              className="hover:bg-opacity-20 absolute top-1 right-1 cursor-pointer rounded-lg p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-indigo-500"
            >
              {copiedStates[index] ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </button>

            {/* Lock/Unlock Icon */}
            <button
              onClick={() => handleToggleLock(index)}
              className="hover:bg-opacity-20 absolute top-1 left-1 cursor-pointer rounded-lg p-1 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-indigo-500"
            >
              {lockedColors[index] ? (
                <Lock className="h-4 w-4 text-white" />
              ) : (
                <Unlock className="h-4 w-4 text-white" />
              )}
            </button>

            {/* Tooltip */}
            {tooltipStates[index] && (
              <div className="absolute top-8 left-1/2 z-10 -translate-x-1/2 transform rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white shadow-lg">
                {tooltipStates[index]}
                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 transform bg-gray-900"></div>
              </div>
            )}

            {/* Color Code Display */}
            <div className="bg-opacity-40 absolute right-1 bottom-1 left-1 rounded px-1 py-0.5 text-center text-sm text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {color.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mb-4 text-center text-red-400">{error}</p>}

      {description && (
        <div className="w-full max-w-2xl rounded-lg bg-slate-800 p-6 text-center text-white shadow-md shadow-teal-400">
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
