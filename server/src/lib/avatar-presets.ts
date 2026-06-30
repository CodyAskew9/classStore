import type { AvatarConfig } from "./avatar.js";
import type { BodyType } from "./avatar-gender.js";

export type { BodyType };

/** Numbered skin-tone bases shared by boys and girls */
export const SHARED_BODY_COLORS = Array.from(
  { length: 29 },
  (_, i) => `body_${String(i + 1).padStart(2, "0")}.png`,
);

export function isSelectableBody(filename: string): boolean {
  return /^body_\d{2}\.png$/.test(filename);
}

const MODEST_REQUIRED_SLOTS = ["pupils", "eyebrows", "eyelashes", "hair"] as const;

export const BOY_PRESET: AvatarConfig = {
  colorMode: true,
  bodyType: "male",
  body: "body_01.png",
  pupils: "pupils_01.png",
  eyebrows: "eyebrows_01.png",
  eyelashes: "eyelashes_01.png",
  mouth: null,
  beard: null,
  hairBack: null,
  hair: "hair_01.png",
  bangs: null,
  hairBonus: null,
  top: "top_01.png",
  bottom: "bottom_01.png",
  dress: null,
  gloves: null,
  shoes: "shoes_01.png",
  accessories: [],
};

export const GIRL_PRESET: AvatarConfig = {
  colorMode: true,
  bodyType: "female",
  body: "body_01.png",
  pupils: "pupils_01.png",
  eyebrows: "eyebrows_01.png",
  eyelashes: "eyelashes_01.png",
  mouth: null,
  beard: null,
  hairBack: null,
  hair: "hair_02.png",
  bangs: null,
  hairBonus: null,
  top: "top_02.png",
  bottom: "bottom_02.png",
  dress: null,
  gloves: null,
  shoes: "shoes_01.png",
  accessories: [],
};

export function presetForBodyType(bodyType: BodyType): AvatarConfig {
  return bodyType === "female" ? { ...GIRL_PRESET } : { ...BOY_PRESET };
}

export function inferBodyType(_body: string): BodyType {
  return "male";
}

export function bodiesForType(_bodyType: BodyType): readonly string[] {
  return SHARED_BODY_COLORS;
}

/** Students must always appear dressed with hair and a face */
export function ensureModestBase(config: AvatarConfig): AvatarConfig {
  const bodyType = config.bodyType ?? "male";
  const base = presetForBodyType(bodyType);

  let next: AvatarConfig = {
    ...config,
    bodyType,
    body: isSelectableBody(config.body) ? config.body : base.body,
    pupils: config.pupils || base.pupils,
    eyebrows: config.eyebrows || base.eyebrows,
    eyelashes: config.eyelashes || base.eyelashes,
    hair: config.hair || base.hair,
    accessories: Array.isArray(config.accessories)
      ? config.accessories.filter((a) => typeof a === "string")
      : [],
  };

  if (next.dress) {
    next = { ...next, top: null, bottom: null };
  } else {
    next = {
      ...next,
      dress: null,
      top: next.top || base.top,
      bottom: next.bottom || base.bottom,
    };
  }

  if (!next.shoes) {
    next = { ...next, shoes: base.shoes };
  }

  return next;
}

export function isRequiredSlot(slot: string): boolean {
  return (MODEST_REQUIRED_SLOTS as readonly string[]).includes(slot);
}

export function canToggleOff(slot: string, _config: AvatarConfig): boolean {
  if (isRequiredSlot(slot)) return false;
  if (slot === "top" || slot === "bottom") return false;
  if (slot === "dress") return false;
  if (slot === "shoes") return false;
  if (slot === "accessory") return true;
  return true;
}
