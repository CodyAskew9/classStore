import type { BodyType } from "./avatar-gender.js";
import { FANTASY_ACCESSORIES, isFantasyAccessory } from "./avatar-fantasy.js";
import { isFantasyAccessoryForBodyType } from "./avatar-gender.js";

/** Reference image showing the three featured fantasy armor sets */
export const FANTASY_OUTFIT_GUIDE = "guideArmor.png";

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
    description: "White & gold plate armor with sword and armored boots",
    bodyTypes: ["male", "female"],
    pieces: [
      "skirt_blue_gold.png",
      "chestplate_white_gold.png",
      "gauntlet_silver_left.png",
      "gauntlet_silver_right.png",
      "boots_white_armored.png",
      "sword_fantasy.png",
    ],
  },
  {
    id: "martial-artist",
    label: "Martial Artist",
    description: "White robe, teal sash, blue pants, and gold sandals",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_grey_green.png",
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
    description: "Map scroll, striped shirt, and navy swirl boots",
    bodyTypes: ["male", "female"],
    pieces: [
      "shorts_white_belt.png",
      "shirt_purple_striped.png",
      "scroll_map.png",
      "boots_navy_gold_swirl.png",
    ],
  },
  {
    id: "barbarian",
    label: "Barbarian",
    description: "Battle axe with rugged shorts and boots",
    bodyTypes: ["male"],
    pieces: [
      "shorts_grey_green.png",
      "belt_green_striped.png",
      "boots_brown_green.png",
      "axe_hand_gold.png",
    ],
  },
  {
    id: "sailor",
    label: "Sailor",
    description: "Orange vest, white shorts, and trident boots",
    bodyTypes: ["male"],
    pieces: [
      "shorts_white_belt.png",
      "vest_white_orange.png",
      "belt_teal_yinyang.png",
      "boots_white_trident.png",
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

export function isOutfitFullyEquipped(
  accessories: readonly string[],
  outfit: FantasyOutfit,
  bodyType: BodyType,
): boolean {
  const pieces = resolveOutfitPieces(outfit, bodyType);
  if (pieces.length === 0) return false;
  const equipped = new Set(accessories);
  return pieces.every((piece) => equipped.has(piece));
}

/** Stable render order for equipped fantasy pieces */
export function sortFantasyAccessories(accessories: readonly string[]): string[] {
  const order = new Map(FANTASY_ACCESSORIES.map((name, index) => [name, index]));
  return [...accessories].sort(
    (a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
}
