import { migrateSlotFilename } from "./avatar-migrate";
import {
  AVATAR_CATEGORIES,
  RENDER_ORDER,
  buildCatalog,
  getCategoryBySlot,
  resolveAssetUrlPath,
  slotSelectionLabel,
  type AvatarSlot,
} from "./avatar-catalog";
import { fantasyAccessoryPreviewPath } from "./avatar-fantasy";
import {
  findOutfitIdForAccessories,
  fantasyOutfitCoversTorso,
  getFantasyOutfitById,
  resolveOutfitPieces,
} from "./avatar-fantasy-outfits";
import { isAssetForBodyType, type BodyType } from "./avatar-gender";
import {
  BOY_PRESET,
  canToggleOff,
  ensureModestBase,
  inferBodyType,
  isSelectableBody,
  presetForBodyType,
} from "./avatar-presets";

export type { AvatarSlot, BodyType };

export interface AvatarConfig {
  colorMode: boolean;
  bodyType: BodyType;
  body: string;
  pupils: string;
  eyebrows: string;
  eyelashes: string;
  mouth: string | null;
  beard: string | null;
  hairBack: string | null;
  hair: string | null;
  bangs: string | null;
  hairBonus: string | null;
  top: string | null;
  bottom: string | null;
  dress: string | null;
  gloves: string | null;
  shoes: string | null;
  fantasyOutfitId: string | null;
}

export const AVATAR_DEFAULTS: AvatarConfig = { ...BOY_PRESET };

function pickGenderedSlot(
  slot: AvatarSlot,
  value: string | null,
  fallback: string | null,
  bodyType: BodyType,
): string | null {
  if (!value) return fallback;
  return isAssetForBodyType(value, slot, bodyType) ? value : fallback;
}

function normalizeFantasyOutfitId(id: string | null, bodyType: BodyType): string | null {
  if (!id) return null;
  const outfit = getFantasyOutfitById(id);
  if (!outfit || !outfit.bodyTypes.includes(bodyType)) return null;
  if (resolveOutfitPieces(outfit, bodyType).length === 0) return null;
  return id;
}

export function ensureModestConfig(config: AvatarConfig): AvatarConfig {
  const bodyType = config.bodyType ?? "male";
  const base = presetForBodyType(bodyType);
  const modest = ensureModestBase(config);

  return {
    ...modest,
    beard: bodyType === "female" ? null : pickGenderedSlot("beard", modest.beard, null, bodyType),
    dress: bodyType === "male" ? null : pickGenderedSlot("dress", modest.dress, null, bodyType),
    hair: pickGenderedSlot("hair", modest.hair, base.hair, bodyType) ?? base.hair,
    bangs: pickGenderedSlot("bangs", modest.bangs, null, bodyType),
    hairBack: pickGenderedSlot("hairBack", modest.hairBack, null, bodyType),
    hairBonus: pickGenderedSlot("hairBonus", modest.hairBonus, null, bodyType),
    top: pickGenderedSlot("top", modest.top, base.top, bodyType) ?? base.top,
    bottom: pickGenderedSlot("bottom", modest.bottom, base.bottom, bodyType) ?? base.bottom,
    shoes: pickGenderedSlot("shoes", modest.shoes, base.shoes, bodyType) ?? base.shoes,
    gloves: pickGenderedSlot("gloves", modest.gloves, null, bodyType),
    fantasyOutfitId: normalizeFantasyOutfitId(modest.fantasyOutfitId, bodyType),
  };
}

function slotValue(config: AvatarConfig, slot: AvatarSlot): string | null {
  if (slot === "accessory") return null;
  return config[slot] as string | null;
}

function migrateConfigField(slot: AvatarSlot, value: string | null): string | null {
  if (value === null) return null;
  return migrateSlotFilename(slot, value);
}

export function normalizeAvatarConfig(raw: unknown): AvatarConfig {
  if (!raw || typeof raw !== "object") return { ...AVATAR_DEFAULTS };

  const data = raw as Record<string, unknown>;

  if ("eyes" in data || "layers" in data) {
    return { ...AVATAR_DEFAULTS };
  }

  const str = (key: keyof AvatarConfig, fallback: string | null): string | null => {
    const v = data[key];
    if (v === null) return null;
    return typeof v === "string" ? v : fallback;
  };

  const body =
    migrateConfigField("body", str("body", AVATAR_DEFAULTS.body) ?? AVATAR_DEFAULTS.body) ??
    AVATAR_DEFAULTS.body;
  const bodyType: BodyType =
    data.bodyType === "female" || data.bodyType === "male"
      ? data.bodyType
      : inferBodyType(body);

  let fantasyOutfitId =
    typeof data.fantasyOutfitId === "string" ? data.fantasyOutfitId : null;

  if (!fantasyOutfitId && Array.isArray(data.accessories)) {
    const legacy = data.accessories.filter((a): a is string => typeof a === "string");
    fantasyOutfitId = findOutfitIdForAccessories(legacy, bodyType);
  }

  const draft: AvatarConfig = {
    colorMode: data.colorMode !== false,
    bodyType,
    body,
    pupils:
      migrateConfigField("pupils", str("pupils", AVATAR_DEFAULTS.pupils) ?? AVATAR_DEFAULTS.pupils) ??
      AVATAR_DEFAULTS.pupils,
    eyebrows:
      migrateConfigField(
        "eyebrows",
        str("eyebrows", AVATAR_DEFAULTS.eyebrows) ?? AVATAR_DEFAULTS.eyebrows,
      ) ?? AVATAR_DEFAULTS.eyebrows,
    eyelashes:
      migrateConfigField(
        "eyelashes",
        str("eyelashes", AVATAR_DEFAULTS.eyelashes) ?? AVATAR_DEFAULTS.eyelashes,
      ) ?? AVATAR_DEFAULTS.eyelashes,
    mouth: migrateConfigField("mouth", str("mouth", null)),
    beard: migrateConfigField("beard", str("beard", null)),
    hairBack: migrateConfigField("hairBack", str("hairBack", null)),
    hair: migrateConfigField("hair", str("hair", null)),
    bangs: migrateConfigField("bangs", str("bangs", null)),
    hairBonus: migrateConfigField("hairBonus", str("hairBonus", null)),
    top: migrateConfigField("top", str("top", null)),
    bottom: migrateConfigField("bottom", str("bottom", null)),
    dress: migrateConfigField("dress", str("dress", null)),
    gloves: migrateConfigField("gloves", str("gloves", null)),
    shoes: migrateConfigField("shoes", str("shoes", null)),
    fantasyOutfitId,
  };

  return ensureModestConfig(draft);
}

export function getAvatarCatalog(bodyType: BodyType = "male") {
  return {
    defaults: AVATAR_DEFAULTS,
    renderOrder: RENDER_ORDER,
    ...buildCatalog(true, bodyType),
  };
}

const FANTASY_REPLACES_CLOTHING: readonly AvatarSlot[] = [
  "top",
  "bottom",
  "dress",
  "shoes",
  "gloves",
];

export function getAvatarRenderPaths(config: AvatarConfig): string[] {
  const modest = ensureModestConfig(config);
  const paths: string[] = [];
  const fantasyActive = !!modest.fantasyOutfitId;
  const fantasyOutfit = modest.fantasyOutfitId
    ? getFantasyOutfitById(modest.fantasyOutfitId)
    : null;
  const fantasyCoversTorso =
    fantasyOutfit != null && fantasyOutfitCoversTorso(fantasyOutfit, modest.bodyType);

  for (const slot of RENDER_ORDER) {
    if (fantasyActive && (FANTASY_REPLACES_CLOTHING as readonly string[]).includes(slot)) {
      if (slot === "top" && !fantasyCoversTorso) {
        // Keep base top when fantasy set has no shirt/armor layer
      } else {
        continue;
      }
    }
    const filename = slotValue(modest, slot);
    if (!filename) continue;
    const { folder } = getCategoryBySlot(slot);
    paths.push(resolveAssetUrlPath(folder, filename, modest.colorMode));
  }

  if (modest.fantasyOutfitId) {
    const outfit = fantasyOutfit ?? getFantasyOutfitById(modest.fantasyOutfitId);
    if (outfit) {
      for (const piece of resolveOutfitPieces(outfit, modest.bodyType)) {
        paths.push(fantasyAccessoryPreviewPath(piece));
      }
    }
  }

  return paths;
}

export function isAssetSelected(
  config: AvatarConfig,
  slot: AvatarSlot,
  filename: string,
): boolean {
  return slotValue(config, slot) === filename;
}

export function applyBodyType(config: AvatarConfig, bodyType: BodyType): AvatarConfig {
  const preset = presetForBodyType(bodyType);
  const body = isSelectableBody(config.body) ? config.body : preset.body;

  return ensureModestConfig({
    ...config,
    bodyType,
    body,
    hair: preset.hair,
    top: preset.top,
    bottom: preset.bottom,
    dress: null,
    beard: null,
    shoes: preset.shoes,
    bangs: null,
    hairBack: null,
    hairBonus: null,
    gloves: null,
    fantasyOutfitId: null,
  });
}

export function applyFantasyOutfit(config: AvatarConfig, outfitId: string): AvatarConfig {
  const modest = ensureModestConfig(config);
  const outfit = getFantasyOutfitById(outfitId);
  if (!outfit || !outfit.bodyTypes.includes(modest.bodyType)) return modest;

  const pieces = resolveOutfitPieces(outfit, modest.bodyType);
  if (pieces.length === 0) return modest;

  if (modest.fantasyOutfitId === outfitId) {
    return ensureModestConfig({ ...modest, fantasyOutfitId: null });
  }

  return ensureModestConfig({ ...modest, fantasyOutfitId: outfitId });
}

export function applySlotSelection(
  config: AvatarConfig,
  slot: AvatarSlot,
  filename: string,
): AvatarConfig {
  const modest = ensureModestConfig(config);

  if (slot === "accessory") return modest;

  const cat = getCategoryBySlot(slot);
  const assets =
    buildCatalog(modest.colorMode, modest.bodyType).categories.find((c) => c.slot === slot)
      ?.assets ?? [];

  if (!assets.some((a) => a.filename === filename)) return modest;

  const current = slotValue(modest, slot);
  if (cat.toggle && current === filename && canToggleOff(slot, modest)) {
    return ensureModestConfig({ ...modest, [slot]: null });
  }

  let next: AvatarConfig = { ...modest, [slot]: filename };

  if (slot === "dress") {
    next = { ...next, top: null, bottom: null, fantasyOutfitId: null };
  } else if (slot === "top" || slot === "bottom") {
    next = { ...next, dress: null, fantasyOutfitId: null };
  } else if (slot === "shoes" || slot === "gloves") {
    next = { ...next, fantasyOutfitId: null };
  }

  return ensureModestConfig(next);
}

export { slotSelectionLabel, AVATAR_CATEGORIES };
