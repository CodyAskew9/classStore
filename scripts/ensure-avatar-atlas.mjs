import { existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = join(root, "assets/avatar-atlas/manifest.json");
const atlas = join(root, "assets/avatar-atlas/atlas.webp");
const avatarRoot = join(root, "assets/avatar");
const colorRoot = join(root, "assets/color");

function walkMtime(dir) {
  let max = 0;
  if (!existsSync(dir)) return 0;
  for (const ent of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, ent.name);
    if (ent.isDirectory()) max = Math.max(max, walkMtime(p));
    else if (ent.name.endsWith(".png")) max = Math.max(max, statSync(p).mtimeMs);
  }
  return max;
}

const sourceMtime = Math.max(walkMtime(avatarRoot), walkMtime(colorRoot));
const needsBuild =
  !existsSync(manifest) ||
  !existsSync(atlas) ||
  sourceMtime > statSync(manifest).mtimeMs;

if (needsBuild) {
  console.log("Building avatar sprite atlas…");
  const r = spawnSync("node", ["scripts/build-avatar-atlas.mjs"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
  });
  process.exit(r.status ?? 1);
}
