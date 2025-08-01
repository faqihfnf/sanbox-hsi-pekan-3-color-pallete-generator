"use server";

import { describeColorPalette } from "@/utils/ai";

export async function describe(palette: string[]) {
  return await describeColorPalette(palette);
}
