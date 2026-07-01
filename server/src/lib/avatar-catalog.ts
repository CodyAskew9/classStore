import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import path from "path";
import {
  BOY_PRESET,
  GIRL_PRESET,
  SHARED_BODY_COLORS,
  isSelectableBody,
  type BodyType,
} from "./avatar-presets.js";
import {
  getFantasyOutfitsForBodyType,
  outfitPreviewPaths,
} from "./avatar-fantasy-outfits.js";
import {
  filterAssetsForBodyType,
  isSlotVisibleForBodyType,
} from "./avatar-gender.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const AVATAR_ROOT = path.resolve(__dirname, "../../../assets/avatar");

const COLOR_DIR_NAMES = ["COLOR", "color", "colors", "COLORS"] as const;

export type AvatarSlot =
  | "body"
  | "pupils"
  | "eyebrows"
  | "eyelashes"
  | "mouth"
  | "beard"
  | "hairBack"
  | "hair"
  | "bangs"
  | "hairBonus"
  | "top"
  | "bottom"
  | "dress"
  | "gloves"
  | "shoes"
  | "accessory";

export interface CategoryDef {
  slot: AvatarSlot;
  folder: string;
  label: string;
  required: boolean;
  toggle: boolean;
}

export interface CatalogAsset {
  filename: string;
  previewPath: string;
}

export const AVATAR_CATEGORIES: CategoryDef[] = [
  { slot: "body", folder: "body", label: "Skin tone", required: true, toggle: false },
  { slot: "top", folder: "top", label: "Tops", required: true, toggle: false },
  { slot: "bottom", folder: "bottom", label: "Bottoms", required: true, toggle: false },
  { slot: "dress", folder: "dress", label: "Dresses", required: false, toggle: false },
  { slot: "shoes", folder: "shoes", label: "Shoes", required: true, toggle: false },
  { slot: "gloves", folder: "gloves", label: "Gloves", required: false, toggle: true },
  { slot: "hairBack", folder: "hair_back", label: "Hair back", required: false, toggle: true },
  { slot: "pupils", folder: "PUPILS", label: "Eyes", required: true, toggle: false },
  { slot: "eyebrows", folder: "EYEBROWS", label: "Eyebrows", required: true, toggle: false },
  { slot: "eyelashes", folder: "EYELASHES", label: "Eyelashes", required: true, toggle: false },
  { slot: "mouth", folder: "MOUTH", label: "Mouth", required: false, toggle: true },
  { slot: "beard", folder: "BEARD", label: "Beard", required: false, toggle: true },
  { slot: "hair", folder: "hair", label: "Hair", required: true, toggle: false },
  { slot: "bangs", folder: "bangs", label: "Bangs", required: false, toggle: true },
  { slot: "hairBonus", folder: "hair_bonus", label: "Hair extras", required: false, toggle: true },
  { slot: "accessory", folder: "color", label: "Fantasy gear", required: false, toggle: true },
];

/** Bottom → top */
export const RENDER_ORDER: AvatarSlot[] = [
  "hairBack",
  "body",
  "bottom",
  "dress",
  "top",
  "shoes",
  "gloves",
  "eyebrows",
  "pupils",
  "eyelashes",
  "mouth",
  "beard",
  "hair",
  "bangs",
  "hairBonus",
];

/** Slots shown in the student avatar picker */
export const STUDENT_VISIBLE_SLOTS: AvatarSlot[] = [
  "body",
  "hair",
  "hairBack",
  "bangs",
  "hairBonus",
  "pupils",
  "eyebrows",
  "eyelashes",
  "mouth",
  "beard",
  "top",
  "bottom",
  "dress",
  "shoes",
  "gloves",
];

function isPng(name: string): boolean {
  return name.toLowerCase().endsWith(".png");
}

function naturalSort(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function findColorSubdir(categoryPath: string): string | null {
  for (const name of COLOR_DIR_NAMES) {
    if (existsSync(join(categoryPath, name))) return name;
  }
  return null;
}

export function listCategoryAssets(folder: string, preferColor = true): string[] {
  const categoryPath = join(AVATAR_ROOT, folder);
  if (!existsSync(categoryPath)) return [];

  let scanPath = categoryPath;
  if (preferColor) {
    const colorSub = findColorSubdir(categoryPath);
    if (colorSub) scanPath = join(categoryPath, colorSub);
  }

  try {
    return readdirSync(scanPath)
      .filter(isPng)
      .sort(naturalSort);
  } catch {
    return [];
  }
}

function filterAssets(slot: AvatarSlot, assets: string[]): string[] {
  if (slot === "body") {
    return assets.filter(isSelectableBody);
  }
  return assets;
}

export function getCategoryBySlot(slot: AvatarSlot): CategoryDef {
  const cat = AVATAR_CATEGORIES.find((c) => c.slot === slot);
  if (!cat) throw new Error(`Unknown slot: ${slot}`);
  return cat;
}

export function buildCatalog(preferColor = true, bodyType: BodyType = "male") {
  return {
    bodyTypes: {
      male: { label: "Boy", preset: BOY_PRESET, bodies: [...SHARED_BODY_COLORS] },
      female: { label: "Girl", preset: GIRL_PRESET, bodies: [...SHARED_BODY_COLORS] },
    },
    fantasyOutfits: getFantasyOutfitsForBodyType(bodyType).map((outfit) => ({
      id: outfit.id,
      label: outfit.label,
      description: outfit.description,
      previewPaths: outfitPreviewPaths(outfit, bodyType),
    })),
    categories: AVATAR_CATEGORIES.filter(
      (c) => STUDENT_VISIBLE_SLOTS.includes(c.slot) && isSlotVisibleForBodyType(c.slot, bodyType),
    ).map((cat) => ({
      slot: cat.slot,
      label: cat.label,
      required: cat.required,
      toggle: cat.toggle,
      assets: filterAssetsForBodyType(
        cat.slot,
        filterAssets(cat.slot, listCategoryAssets(cat.folder, preferColor)),
        bodyType,
      ).map((filename) => ({
        filename,
        previewPath: resolveAssetUrlPath(cat.folder, filename, preferColor),
      })),
    })),
  };
}

export function resolveAssetUrlPath(
  folder: string,
  filename: string,
  preferColor = true,
): string {
  const categoryPath = join(AVATAR_ROOT, folder);
  if (preferColor) {
    const colorSub = findColorSubdir(categoryPath);
    if (colorSub && existsSync(join(categoryPath, colorSub, filename))) {
      return `avatar/${folder}/${colorSub}/${filename}`;
    }
  }
  if (existsSync(join(categoryPath, filename))) {
    return `avatar/${folder}/${filename}`;
  }
  return `avatar/${folder}/${filename}`;
}

export function slotSelectionLabel(filename: string): string {
  return filename
    .replace(/\.png$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
