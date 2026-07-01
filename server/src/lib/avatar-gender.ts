import type { AvatarSlot } from "./avatar-catalog.js";

export type BodyType = "male" | "female";

const MALE_ONLY_SLOTS: readonly AvatarSlot[] = ["beard"];
const FEMALE_ONLY_SLOTS: readonly AvatarSlot[] = ["dress"];

const SPLIT_BY_INDEX_SLOTS: readonly AvatarSlot[] = [
  "hair",
  "bangs",
  "hairBack",
  "hairBonus",
  "top",
  "bottom",
  "shoes",
  "gloves",
];

const FEMALE_FANTASY_PATTERNS = [/skirt_green/, /necklace_braided/];
const MALE_FANTASY_PATTERNS = [
  /chestplate_/,
  /gauntlet_/,
  /sword_/,
  /shoulder_pauldron_/,
  /^arm_/,
  /vest_/,
  /jacket_/,
];

/** Armor pieces from the fantasy pack that any character can wear */
const UNISEX_FANTASY = new Set([
  "skirt_blue_gold.png",
  "toga_white_gold.png",
  "necklace_collar_gem.png",
  "capelet_green_leaf.png",
  "shirt_purple_striped.png",
  "shorts_white_belt.png",
  "shorts_grey_green.png",
  "gloves_brown.png",
  "boots_brown_green.png",
  "belt_green_striped.png",
  "belt_teal_yinyang.png",
  "sleeves_white_gold.png",
  "shoes_orange_gold.png",
  "boots_navy_gold_swirl.png",
  "shoulder_pauldron_gold.png",
  "shoulder_pauldron_white_gold.png",
  "shoulder_pauldron_buckle_gold.png",
  "greaves_white_trident.png",
]);

function assetIndex(filename: string): number | null {
  const match = filename.match(/_(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

export function isSlotVisibleForBodyType(slot: AvatarSlot, bodyType: BodyType): boolean {
  if ((MALE_ONLY_SLOTS as readonly string[]).includes(slot)) return bodyType === "male";
  if ((FEMALE_ONLY_SLOTS as readonly string[]).includes(slot)) return bodyType === "female";
  return true;
}

export function isAssetForBodyType(
  filename: string,
  slot: AvatarSlot,
  bodyType: BodyType,
): boolean {
  if (!isSlotVisibleForBodyType(slot, bodyType)) return false;

  if (slot === "accessory") {
    return isFantasyAccessoryForBodyType(filename, bodyType);
  }

  if (!(SPLIT_BY_INDEX_SLOTS as readonly string[]).includes(slot)) {
    return true;
  }

  const index = assetIndex(filename);
  if (index === null) return true;

  return bodyType === "male" ? index % 2 === 1 : index % 2 === 0;
}

export function isFantasyAccessoryForBodyType(filename: string, bodyType: BodyType): boolean {
  if (UNISEX_FANTASY.has(filename)) return true;
  const female = FEMALE_FANTASY_PATTERNS.some((p) => p.test(filename));
  const male = MALE_FANTASY_PATTERNS.some((p) => p.test(filename));
  if (female && male) return true;
  if (female) return bodyType === "female";
  if (male) return bodyType === "male";
  return true;
}

export function filterAssetsForBodyType(
  slot: AvatarSlot,
  assets: string[],
  bodyType: BodyType,
): string[] {
  return assets.filter((filename) => isAssetForBodyType(filename, slot, bodyType));
}
