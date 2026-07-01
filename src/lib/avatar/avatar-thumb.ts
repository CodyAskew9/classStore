import type { AvatarSlot } from "./avatar-catalog";

/** Picker card width in px (height follows crop mode). */
export const AVATAR_PICKER_THUMB_PX = 120;

/**
 * Skin-tone head framing (measured on body_XX sprites: hair ~20%, chin ~55%).
 * Top-align after skipping empty frame padding; card height shows ~56% of frame.
 */
export const SKIN_TONE_HEAD_TOP_SKIP = 0.06;
export const SKIN_TONE_HEAD_ASPECT = 0.88;

export type AvatarThumbCrop = "portrait" | "head-top";

export function thumbCropForSlot(slot: AvatarSlot): AvatarThumbCrop {
  return slot === "body" ? "head-top" : "portrait";
}
