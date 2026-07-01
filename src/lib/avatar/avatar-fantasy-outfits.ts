import {
  RENDER_ORDER,
  getCategoryBySlot,
  resolveAssetUrlPath,
  type AvatarSlot,
} from "./avatar-catalog";
import type { BodyType } from "./avatar-gender";
import { fantasyAccessoryPreviewPath, isFantasyAccessory } from "./avatar-fantasy";
import { isFantasyAccessoryForBodyType } from "./avatar-gender";
import { presetForBodyType } from "./avatar-presets";

export interface FantasyOutfit {
  id: string;
  label: string;
  description: string;
  bodyTypes: readonly BodyType[];
  pieces: readonly string[];
}

const CLOTHING_SLOTS = new Set<AvatarSlot>(["top", "bottom", "dress", "shoes", "gloves"]);

/** Piece order matches layering: back → front, bottom → top */
export const FANTASY_OUTFITS: readonly FantasyOutfit[] = [
  {
    id: "elf-ranger",
    label: "Elf Ranger",
    description: "Green hood & leaf cape, purple shirt, white leggings, brown boots",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_white_belt.png",
      "shirt_purple_striped.png",
      "jacket_green_gold.png",
      "belt_green_striped.png",
      "gloves_brown.png",
      "boots_brown_green.png",
      "capelet_green_leaf.png",
    ],
  },
  {
    id: "knight",
    label: "Knight",
    description: "Plate armor, leggings, pauldrons, shin guards, gauntlets, and sword",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_grey_green.png",
      "shorts_white_belt.png",
      "skirt_blue_gold.png",
      "chestplate_white_gold.png",
      "shoulder_pauldron_gold.png",
      "shoulder_pauldron_white_gold.png",
      "shoulder_pauldron_buckle_gold.png",
      "gauntlet_silver_left.png",
      "gauntlet_silver_right.png",
      "greaves_white_trident.png",
      "boots_white_armored.png",
      "sword_fantasy.png",
    ],
  },
  {
    id: "martial-artist",
    label: "Martial Artist",
    description: "White robe over shirt, teal sash, blue pants, and gold sandals",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_grey_green.png",
      "shirt_purple_striped.png",
      "toga_white_gold.png",
      "sleeves_white_gold.png",
      "necklace_collar_gem.png",
      "belt_teal_yinyang.png",
      "shoes_orange_gold.png",
    ],
  },
  {
    id: "adventurer",
    label: "Adventurer",
    description: "Striped shirt, white shorts, and navy swirl boots",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_white_belt.png",
      "shirt_purple_striped.png",
      "boots_navy_gold_swirl.png",
    ],
  },
  {
    id: "barbarian",
    label: "Barbarian",
    description: "Striped shirt, rugged shorts, belt, and boots",
    bodyTypes: ["male"],
    pieces: [
      "shorts_grey_green.png",
      "shirt_purple_striped.png",
      "belt_green_striped.png",
      "boots_brown_green.png",
    ],
  },
  {
    id: "sailor",
    label: "Sailor",
    description: "Orange vest, white shorts, and navy boots",
    bodyTypes: ["male"],
    pieces: [
      "shorts_white_belt.png",
      "vest_white_orange.png",
      "belt_teal_yinyang.png",
      "boots_navy_gold_swirl.png",
    ],
  },
  {
    id: "royal-gown",
    label: "Royal Gown",
    description: "Blue & gold skirt with braided necklace",
    bodyTypes: ["female"],
    pieces: [
      "skirt_blue_gold.png",
      "sleeves_white_gold.png",
      "necklace_braided_pendant.png",
      "shoes_orange_gold.png",
    ],
  },
];

export function resolveOutfitPieces(outfit: FantasyOutfit, bodyType: BodyType): string[] {
  return outfit.pieces.filter(
    (piece) => isFantasyAccessory(piece) && isFantasyAccessoryForBodyType(piece, bodyType),
  );
}

/** Fantasy layer counts as a modest shirt/top (required for student avatars). */
const TORSO_COVERAGE = /shirt_|chestplate_|toga_|vest_|jacket_/;

export function fantasyOutfitCoversTorso(outfit: FantasyOutfit, bodyType: BodyType): boolean {
  return resolveOutfitPieces(outfit, bodyType).some((piece) => TORSO_COVERAGE.test(piece));
}

export function outfitPreviewPaths(outfit: FantasyOutfit, bodyType: BodyType): string[] {
  return resolveOutfitPieces(outfit, bodyType).map(fantasyAccessoryPreviewPath);
}

/** Full-character preview: body, face, hair + fantasy set (no default clothes). */
export function getOutfitPreviewRenderPaths(outfit: FantasyOutfit, bodyType: BodyType): string[] {
  const preset = presetForBodyType(bodyType);
  const coversTorso = fantasyOutfitCoversTorso(outfit, bodyType);
  const paths: string[] = [];

  for (const slot of RENDER_ORDER) {
    if (CLOTHING_SLOTS.has(slot)) {
      if (slot === "top" && !coversTorso) {
        const top = preset.top;
        if (!top) continue;
        const { folder } = getCategoryBySlot(slot);
        paths.push(resolveAssetUrlPath(folder, top, preset.colorMode));
      }
      continue;
    }
    const filename = preset[slot];
    if (!filename) continue;
    const { folder } = getCategoryBySlot(slot);
    paths.push(resolveAssetUrlPath(folder, filename, preset.colorMode));
  }

  for (const piece of resolveOutfitPieces(outfit, bodyType)) {
    paths.push(fantasyAccessoryPreviewPath(piece));
  }

  return paths;
}

export function getFantasyOutfitsForBodyType(bodyType: BodyType): FantasyOutfit[] {
  return FANTASY_OUTFITS.filter((outfit) => outfit.bodyTypes.includes(bodyType))
    .map((outfit) => ({
      ...outfit,
      pieces: resolveOutfitPieces(outfit, bodyType),
    }))
    .filter((outfit) => outfit.pieces.length > 0);
}

export function getFantasyOutfitById(id: string): FantasyOutfit | undefined {
  return FANTASY_OUTFITS.find((outfit) => outfit.id === id);
}

export function findOutfitIdForAccessories(
  accessories: readonly string[],
  bodyType: BodyType,
): string | null {
  if (accessories.length === 0) return null;

  for (const outfit of FANTASY_OUTFITS) {
    if (!outfit.bodyTypes.includes(bodyType)) continue;
    const pieces = resolveOutfitPieces(outfit, bodyType);
    if (pieces.length === 0) continue;
    const equipped = new Set(accessories);
    if (pieces.length === accessories.length && pieces.every((piece) => equipped.has(piece))) {
      return outfit.id;
    }
  }

  return null;
}

export function isOutfitEquipped(fantasyOutfitId: string | null, outfitId: string): boolean {
  return fantasyOutfitId === outfitId;
}
