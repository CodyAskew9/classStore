import type { BodyType } from "./avatar-gender.js";
import { fantasyAccessoryPreviewPath, isFantasyAccessory } from "./avatar-fantasy.js";
import { isFantasyAccessoryForBodyType } from "./avatar-gender.js";

export interface FantasyOutfit {
  id: string;
  label: string;
  description: string;
  bodyTypes: readonly BodyType[];
  pieces: readonly string[];
}

/** Piece order matches layering: back → front, bottom → top */
export const FANTASY_OUTFITS: readonly FantasyOutfit[] = [
  {
    id: "elf-ranger",
    label: "Elf Ranger",
    description: "Green leaf cape, purple shirt, white leggings, and brown boots",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_white_belt.png",
      "shirt_purple_striped.png",
      "gloves_brown.png",
      "boots_brown_green.png",
      "belt_green_striped.png",
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

export function outfitPreviewPaths(outfit: FantasyOutfit, bodyType: BodyType): string[] {
  return resolveOutfitPieces(outfit, bodyType).map(fantasyAccessoryPreviewPath);
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
