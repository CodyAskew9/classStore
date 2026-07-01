import { readFileSync, renameSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const manifest = JSON.parse(readFileSync(join(root, "assets/avatar-manifest.json"), "utf8"));

for (const folder of ["color", "bw"]) {
  const dir = join(root, "assets", folder);
  for (const [oldName, newName] of Object.entries(manifest.renames)) {
    const from = join(dir, oldName);
    const to = join(dir, newName);
    if (!existsSync(from)) continue;
    if (existsSync(to)) {
      console.warn(`Skip ${folder}/${oldName}: ${newName} already exists`);
      continue;
    }
    renameSync(from, to);
    console.log(`${folder}/${oldName} → ${newName}`);
  }
}

console.log("Done.");
