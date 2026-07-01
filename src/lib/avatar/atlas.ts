import type { AvatarThumbCrop } from "./avatar-thumb";
import { SKIN_TONE_HEAD_TOP_SKIP } from "./avatar-thumb";

export const AVATAR_FRAME_WIDTH = 222;
export const AVATAR_FRAME_HEIGHT = 350;
export const AVATAR_FRAME_ASPECT = AVATAR_FRAME_HEIGHT / AVATAR_FRAME_WIDTH;

export interface AtlasFrame {
  x: number;
  y: number;
}

export interface AvatarAtlasManifest {
  version: number;
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  sheetWidth: number;
  sheetHeight: number;
  frameCount: number;
  frames: Record<string, AtlasFrame>;
}

export function atlasSheetUrl(manifest: AvatarAtlasManifest): string {
  return `/assets/${manifest.sheet}`;
}

export function atlasHasFrame(manifest: AvatarAtlasManifest, assetPath: string): boolean {
  return assetPath in manifest.frames;
}

/** CSS background-size/position for a sprite layer (width-fit; height follows frame aspect). */
export function atlasSpriteStyle(
  manifest: AvatarAtlasManifest,
  assetPath: string,
  containerWidthPx: number,
): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } | null {
  const frame = manifest.frames[assetPath];
  if (!frame) return null;

  const scale = containerWidthPx / manifest.frameWidth;
  const sheetDisplayW = manifest.sheetWidth * scale;
  const sheetDisplayH = manifest.sheetHeight * scale;

  return {
    backgroundImage: `url(${atlasSheetUrl(manifest)})`,
    backgroundSize: `${sheetDisplayW}px ${sheetDisplayH}px`,
    backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
  };
}

/** Picker thumbnail: full portrait, or head crop for skin tones. */
export function atlasSpriteThumbStyle(
  manifest: AvatarAtlasManifest,
  assetPath: string,
  widthPx: number,
  crop: AvatarThumbCrop,
): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } | null {
  const frame = manifest.frames[assetPath];
  if (!frame) return null;

  const scale = widthPx / manifest.frameWidth;
  const sheetDisplayW = manifest.sheetWidth * scale;
  const sheetDisplayH = manifest.sheetHeight * scale;

  if (crop === "head-top") {
    return {
      backgroundImage: `url(${atlasSheetUrl(manifest)})`,
      backgroundSize: `${sheetDisplayW}px ${sheetDisplayH}px`,
      backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale - SKIN_TONE_HEAD_TOP_SKIP * manifest.frameHeight * scale}px`,
    };
  }

  return {
    backgroundImage: `url(${atlasSheetUrl(manifest)})`,
    backgroundSize: `${sheetDisplayW}px ${sheetDisplayH}px`,
    backgroundPosition: `${-frame.x * scale}px ${-frame.y * scale}px`,
  };
}

export const AVATAR_STACK_PX = {
  sm: 36,
  md: 100,
  lg: 140,
  xl: 220,
} as const;

export function avatarPortraitHeightPx(widthPx: number): number {
  return Math.round(widthPx * AVATAR_FRAME_ASPECT);
}
