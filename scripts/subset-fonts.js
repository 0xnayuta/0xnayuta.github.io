/* eslint-disable no-console */
import fs from "node:fs";
import path from "node:path";
import subsetFont from "subset-font";

const RAW_DIR = "src/assets/fonts/raw";
const OUT_DIR = "src/assets/fonts";
const IS_DRY_RUN = process.argv.includes("--dry-run");

function walkFiles(dir, predicate, result = []) {
  if (!fs.existsSync(dir)) return result;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, result);
    } else if (predicate(fullPath)) {
      result.push(fullPath);
    }
  }
  return result;
}

function stripMarkdownNoise(content) {
  return content
    .replace(/^---[\s\S]*?---\n?/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/[\r\t]/g, " ");
}

function collectDisplayText() {
  const sources = [
    ...walkFiles("src/content", (p) => p.endsWith(".md")),
    ...walkFiles("src/i18n/lang", (p) => p.endsWith(".ts")),
    "astro-paper.config.ts",
  ].filter((p) => fs.existsSync(p));

  let merged = "";
  for (const file of sources) {
    const raw = fs.readFileSync(file, "utf-8");
    merged += file.endsWith(".md") ? stripMarkdownNoise(raw) : raw;
  }

  const uniqueChars = [...new Set([...merged])].join("");
  return uniqueChars;
}

function getRawFonts() {
  if (!fs.existsSync(RAW_DIR)) {
    throw new Error(`Raw font directory not found: ${RAW_DIR}`);
  }
  const fonts = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith(".ttf"));
  if (fonts.length === 0) {
    throw new Error(`No TTF fonts found in: ${RAW_DIR}`);
  }
  return fonts;
}

function ensureOutDir() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
}

async function subsetSingleFont(fontName, text) {
  const rawPath = path.join(RAW_DIR, fontName);
  const outPath = path.join(OUT_DIR, fontName);

  const source = fs.readFileSync(rawPath);
  const subset = await subsetFont(source, text, { targetFormat: "sfnt" });
  fs.writeFileSync(outPath, subset);

  const rawSize = fs.statSync(rawPath).size;
  const outSize = fs.statSync(outPath).size;
  const ratio = ((outSize / rawSize) * 100).toFixed(2);

  console.log(
    `${fontName}: ${(rawSize / 1024).toFixed(1)} KB -> ${(outSize / 1024).toFixed(1)} KB (${ratio}%)`,
  );
}

async function main() {
  const rawFonts = getRawFonts();
  const text = collectDisplayText();

  if (!text.trim()) {
    throw new Error("No characters collected from content sources.");
  }

  console.log(`Mode: ${IS_DRY_RUN ? "dry-run" : "write"}`);
  console.log(`Input fonts (${rawFonts.length}): ${rawFonts.join(", ")}`);
  console.log(`Collected unique characters: ${text.length}`);

  if (IS_DRY_RUN) {
    console.log("Dry run complete. No font files were written.");
    return;
  }

  ensureOutDir();

  for (const fontName of rawFonts) {
    await subsetSingleFont(fontName, text);
  }

  console.log("Font subsetting completed.");
}

main().catch((error) => {
  console.error("Font subsetting failed:", error);
  process.exit(1);
});
