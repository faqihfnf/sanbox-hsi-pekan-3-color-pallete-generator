"use client";

import { generatorRandomHexColor } from "@/utils/color-generator";
import React, { useState } from "react";

function ColorPallete() {
  const [pallete, setPallete] = useState<string[]>([]);

  const handleGeneratePallete = () => {
    const newPallete = [
      generatorRandomHexColor(),
      generatorRandomHexColor(),
      generatorRandomHexColor(),
      generatorRandomHexColor(),
      generatorRandomHexColor(),
      generatorRandomHexColor(),
    ];
    setPallete(newPallete);
  };

  const handleCopyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    alert(`Warna ${color} disalin!`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-4 font-sans">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Generator Palet Warna</h1>
        <p className="mt-2 text-slate-400">
          Klik tombol untuk mendapatkan kombinasi warna baru.
        </p>
      </div>

      {/* Tombol yang menjadi 'pemicu' */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <button
          onClick={handleGeneratePallete}
          className="cursor-pointer rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-105 hover:bg-indigo-700"
        >
          Generate Palette
        </button>
      </div>

      {/* Daftar warna */}
      <div className="flex flex-wrap justify-center gap-4">
        {pallete.map((color) => (
          <div
            key={color}
            style={{ backgroundColor: color }}
            className="h-24 w-24 rounded-md"
            onClick={() => handleCopyToClipboard(color)}
          />
        ))}
      </div>
    </main>
  );
}

export default ColorPallete;
