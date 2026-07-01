import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MANIFEST_PATH = path.resolve(__dirname, "../../../assets/avatar-manifest.json");
const COLOR_ROOT = path.resolve(__dirname, "../../../assets/color");

/** Bases and eyes handled elsewhere; silhouettes are internal */
const SKIP_ACCESSORIES = new Set([
  "body_chibi.png",
  "body_muscular.png",
  "body_elf.png",
  "eyes_brown.png",
  "eyes_blue.png",
  "eyes_heterochrom.png",
  "eyes_amber.png",
  "overlay_silhouette_male.png",
  "overlay_silhouette_female.png",
]);

function loadManifestAccessories(): string[] {
  try {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
      renames: Record<string, string>;
    };
    return Object.values(manifest.renames)
      .filter((name) => !SKIP_ACCESSORIES.has(name))
      .filter((name) => existsSync(join(COLOR_ROOT, name)))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  } catch {
    return [];
  }
}

export const FANTASY_ACCESSORIES: readonly string[] = loadManifestAccessories();

export function fantasyAccessoryPreviewPath(filename: string): string {
  return `color/${filename}`;
}

export function isFantasyAccessory(filename: string): boolean {
  return (FANTASY_ACCESSORIES as readonly string[]).includes(filename);
}
