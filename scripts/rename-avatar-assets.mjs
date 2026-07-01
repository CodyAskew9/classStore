/**
 * Renames avatar PNGs from numbered names (1.png, 10b.png) to prefixed semantic names
 * (body_01.png, bangs_10b.png). Run once: node scripts/rename-avatar-assets.mjs
 */
import { existsSync, readdirSync, renameSync, writeFileSync } from "fs";
import { basename, dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const AVATAR_ROOT = join(__dirname, "../assets/avatar");
const MANIFEST_PATH = join(__dirname, "../assets/avatar-rename-manifest.json");

const FOLDER_PREFIX = {
  body: "body",
  bottom: "bottom",
  dress: "dress",
  shoes: "shoes",
  top: "top",
  gloves: "gloves",
  hair_back: "hair_back",
  hair: "hair",
  bangs: "bangs",
  hair_bonus: "hair_bonus",
  PUPILS: "pupils",
  EYEBROWS: "eyebrows",
  EYELASHES: "eyelashes",
  MOUTH: "mouth",
  BEARD: "beard",
  COLOR: null,
  color: null,
  colors: null,
  COLORS: null,
};

function isPng(name) {
  return name.toLowerCase().endsWith(".png");
}

function categoryFromPath(filePath) {
  const rel = filePath.replace(AVATAR_ROOT, "").replace(/\\/g, "/");
  const parts = rel.split("/").filter(Boolean);
  for (const part of parts) {
    if (FOLDER_PREFIX[part] !== undefined && FOLDER_PREFIX[part] !== null) {
      return part;
    }
  }
  return parts[0] ?? "unknown";
}

function toSemanticName(categoryFolder, filename) {
  const prefix = FOLDER_PREFIX[categoryFolder] ?? categoryFolder.toLowerCase();
  const stem = filename.replace(/\.png$/i, "");

  if (filename.startsWith(`${prefix}_`)) {
    return filename;
  }

  if (/^\d+[a-z]?$/i.test(stem)) {
    const match = stem.match(/^(\d+)([a-z])?$/i);
    const num = match[1].padStart(2, "0");
    const variant = match[2] ?? "";
    return `${prefix}_${num}${variant}.png`;
  }

  return `${prefix}_${stem}.png`;
}

function walkPngFiles(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPngFiles(full, files);
    } else if (isPng(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

const manifest = { renames: {}, defaults: {} };
const defaultSlots = {
  body: "body",
  pupils: "pupils",
  eyebrows: "eyebrows",
  eyelashes: "eyelashes",
};

const files = walkPngFiles(AVATAR_ROOT);
let renamed = 0;
let skipped = 0;

for (const filePath of files) {
  const dir = dirname(filePath);
  const oldName = basename(filePath);
  const category = categoryFromPath(filePath);
  const newName = toSemanticName(category, oldName);

  if (newName === oldName) {
    skipped++;
    continue;
  }

  const newPath = join(dir, newName);
  if (existsSync(newPath)) {
    console.warn(`Skip ${filePath}: target exists (${newName})`);
    skipped++;
    continue;
  }

  renameSync(filePath, newPath);
  const relOld = filePath.replace(AVATAR_ROOT, "").replace(/\\/g, "/");
  const relNew = newPath.replace(AVATAR_ROOT, "").replace(/\\/g, "/");
  manifest.renames[relOld] = relNew;
  console.log(`${relOld} → ${relNew}`);
  renamed++;
}

for (const [slot, prefix] of Object.entries(defaultSlots)) {
  manifest.defaults[slot] = `${prefix}_01.png`;
}

writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
console.log(`\nDone. Renamed ${renamed}, skipped ${skipped}. Manifest: assets/avatar-rename-manifest.json`);
