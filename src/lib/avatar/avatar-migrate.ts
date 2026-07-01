import type { AvatarSlot } from "./avatar-catalog";
import { getCategoryBySlot } from "./avatar-catalog";

const FOLDER_PREFIX: Record<string, string> = {
  body: "body",
  bottom: "bottom",
  dress: "dress",
  shoes: "shoes",
  top: "top",
  gloves: "gloves",
  hair_back: "hair_back",
  hair: "hair",
  bangs: "bangs",
  hair_bonus: "hair_bonus",
  PUPILS: "pupils",
  EYEBROWS: "eyebrows",
  EYELASHES: "eyelashes",
  MOUTH: "mouth",
  BEARD: "beard",
};

/** Migrate old numbered filenames (e.g. 1.png) to prefixed names per slot */
export function migrateSlotFilename(slot: AvatarSlot, filename: string): string {
  if (!filename || filename.includes("_")) {
    return filename;
  }

  const folder = getCategoryBySlot(slot).folder;
  const prefix = FOLDER_PREFIX[folder] ?? folder.toLowerCase();
  const stem = filename.replace(/\.png$/i, "");

  if (/^\d+[a-z]?$/i.test(stem)) {
    const match = stem.match(/^(\d+)([a-z])?$/i);
    if (!match) return filename;
    const num = match[1].padStart(2, "0");
    const variant = match[2] ?? "";
    return `${prefix}_${num}${variant}.png`;
  }

  return `${prefix}_${stem}.png`;
}
