const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const assetPath = path.join(root, "assets", "wogua.png");
const html = fs.readFileSync(indexPath, "utf8");

const scriptMatches = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
if (scriptMatches.length === 0) {
  throw new Error("No inline script found in index.html");
}

for (const match of scriptMatches) {
  new Function(match[1]);
}

const requiredClasses = [
  "class Game",
  "class Squash",
  "class Monster",
  "class Crate",
  "class Bomb",
  "class Spring",
  "class Particle"
];

const requiredUiTokens = [
  'id="mainMenu"',
  'id="levelSelect"',
  'id="codexScreen"',
  'id="levelGrid"',
  'id="codexTabs"',
  'id="codexContent"',
  'id="menuBtn"',
  'id="overlayMenuBtn"',
  "renderLevelSelect()",
  "renderCodex()",
  "CODEX_SECTIONS"
];

for (const token of requiredClasses) {
  if (!html.includes(token)) {
    throw new Error(`Missing ${token}`);
  }
}

for (const token of requiredUiTokens) {
  if (!html.includes(token)) {
    throw new Error(`Missing UI token ${token}`);
  }
}

const levelCount = (html.match(/name: "Level /g) || []).length;
const mechanismCount = (html.match(/mechanics: \[/g) || []).length;
if (levelCount !== 6) {
  throw new Error(`Expected 6 levels, found ${levelCount}`);
}

if (mechanismCount !== 6) {
  throw new Error(`Expected 6 level mechanism summaries, found ${mechanismCount}`);
}

const forbiddenSpriteTransforms = [
  "createTransparentPixelSprite",
  "getImageData",
  "putImageData",
  "mix-blend-mode"
];

for (const token of forbiddenSpriteTransforms) {
  if (html.includes(token)) {
    throw new Error(`Forbidden wogua image transform found: ${token}`);
  }
}

if (!fs.existsSync(assetPath)) {
  throw new Error("Missing assets/wogua.png");
}

const asset = fs.readFileSync(assetPath);
const pngWidth = asset.readUInt32BE(16);
const pngHeight = asset.readUInt32BE(20);
if (pngWidth !== 90 || pngHeight !== 94) {
  throw new Error(`Expected original wogua image to be 90x94, found ${pngWidth}x${pngHeight}`);
}

if (!html.includes("this.squashSprite = image")) {
  throw new Error("Wogua sprite must use the original image object directly");
}

console.log("Static checks passed.");
