/**
 * Packs all avatar PNGs into one WebP sprite sheet + manifest.
 * Run: npm run build:atlas
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ASSETS = join(ROOT, "assets");
const OUT_DIR = join(ASSETS, "avatar-atlas");
/** Half-resolution cells keep the combined sheet under WebP dimension limits. */
const FRAME_W = 222;
const FRAME_H = 350;

function walkPngs(dir, baseRel) {
  const entries = [];
  if (!existsSync(dir)) return entries;

  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, ent.name);
    const rel = baseRel ? `${baseRel}/${ent.name}` : ent.name;
    if (ent.isDirectory()) {
      entries.push(...walkPngs(abs, rel));
    } else if (ent.name.toLowerCase().endsWith(".png")) {
      entries.push({ abs, key: rel.replace(/\\/g, "/") });
    }
  }
  return entries;
}

async function main() {
  const files = [
    ...walkPngs(join(ASSETS, "avatar"), "avatar"),
    ...walkPngs(join(ASSETS, "color"), "color"),
  ].sort((a, b) => a.key.localeCompare(b.key));

  if (files.length === 0) {
    console.error("No PNG files found under assets/avatar or assets/color");
    process.exit(1);
  }

  const cols = Math.ceil(Math.sqrt(files.length));
  const rows = Math.ceil(files.length / cols);
  const sheetW = cols * FRAME_W;
  const sheetH = rows * FRAME_H;

  const composites = [];
  const frames = {};

  for (let i = 0; i < files.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * FRAME_W;
    const y = row * FRAME_H;

    const resized = await sharp(files[i].abs)
      .resize(FRAME_W, FRAME_H, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    composites.push({ input: resized, left: x, top: y });
    frames[files[i].key] = { x, y };
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const sheetPath = join(OUT_DIR, "atlas.webp");
  await sharp({
    create: {
      width: sheetW,
      height: sheetH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(sheetPath);

  const manifest = {
    version: 1,
    sheet: "avatar-atlas/atlas.webp",
    frameWidth: FRAME_W,
    frameHeight: FRAME_H,
    sheetWidth: sheetW,
    sheetHeight: sheetH,
    frameCount: files.length,
    frames,
  };

  writeFileSync(join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));

  const { size } = await sharp(sheetPath).metadata();
  const stat = await import("node:fs/promises").then((fs) => fs.stat(sheetPath));
  console.log(
    `Avatar atlas: ${files.length} frames, ${cols}×${rows} grid, ${(stat.size / 1024 / 1024).toFixed(2)} MB WebP`,
  );
  console.log(`  → ${relative(ROOT, sheetPath)}`);
  console.log(`  → ${relative(ROOT, join(OUT_DIR, "manifest.json"))}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
