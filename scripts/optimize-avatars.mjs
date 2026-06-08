import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(rootDir, "data.json");
const sourceDir = path.join(rootDir, "src", "assets", "avatars");
const outputDir = path.join(rootDir, "public", "avatars");
const supportedExtensions = new Set([".avif", ".gif", ".jpg", ".jpeg", ".png", ".svg", ".webp"]);
const force = process.argv.includes("--force");

const outputNameFor = (filename) => `${path.basename(filename, path.extname(filename))}.webp`;

const isFresh = async (sourcePath, outputPath) => {
  if (force) return false;

  try {
    const [sourceStats, outputStats] = await Promise.all([stat(sourcePath), stat(outputPath)]);
    return outputStats.mtimeMs >= sourceStats.mtimeMs;
  } catch {
    return false;
  }
};

const assertSafeAvatarFilename = (avatar) => {
  const extension = path.extname(avatar).toLowerCase();

  if (path.basename(avatar) !== avatar || !supportedExtensions.has(extension)) {
    throw new Error(
      `Avatar "${avatar}" must be a filename in src/assets/avatars with one of: ${[
        ...supportedExtensions,
      ].join(", ")}`,
    );
  }
};

const directory = JSON.parse(await readFile(dataPath, "utf8"));
const avatars = [...new Set(directory.map((person) => person.avatar).filter(Boolean))];

await mkdir(outputDir, { recursive: true });

let optimized = 0;
let skipped = 0;

for (const avatar of avatars) {
  assertSafeAvatarFilename(avatar);

  const sourcePath = path.join(sourceDir, avatar);
  const outputPath = path.join(outputDir, outputNameFor(avatar));

  if (await isFresh(sourcePath, outputPath)) {
    skipped += 1;
    continue;
  }

  await sharp(sourcePath)
    .resize(320, 320, { fit: "cover" })
    .webp({ effort: 5, quality: 82 })
    .toFile(outputPath);

  optimized += 1;
}

console.log(`Avatar optimization complete: ${optimized} optimized, ${skipped} skipped.`);
