const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const assetPath = path.join(root, "assets", "wogua.png");
const html = fs.readFileSync(indexPath, "utf8");
const expectedLevels = 10;

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
  "class MiniSquash",
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
  'id="skillScreen"',
  'id="levelGrid"',
  'id="codexTabs"',
  'id="codexContent"',
  'id="skillList"',
  'id="skillsBtn"',
  'id="hintBtn"',
  'id="hintBox"',
  'id="menuBtn"',
  'id="overlayMenuBtn"',
  "renderLevelSelect()",
  "renderSkillScreen()",
  "renderCodex()",
  "CODEX_SECTIONS",
  "SKILLS",
  "spawnSplitSquashes",
  "drawRouteHint"
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
if (levelCount !== expectedLevels) {
  throw new Error(`Expected ${expectedLevels} levels, found ${levelCount}`);
}

if (mechanismCount !== expectedLevels) {
  throw new Error(`Expected ${expectedLevels} level mechanism summaries, found ${mechanismCount}`);
}

if (!html.includes('name: "Level 6"') || !html.includes("hint:")) {
  throw new Error("Level 6 must include route hint data");
}

for (let level = 7; level <= expectedLevels; level += 1) {
  if (!html.includes(`name: "Level ${level}"`)) {
    throw new Error(`Missing Level ${level}`);
  }
}

const routeHintCount = (html.match(/route: \[/g) || []).length;
if (routeHintCount < 5) {
  throw new Error(`Expected route hints for Levels 6-10, found ${routeHintCount}`);
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
const pngBitDepth = asset[24];
const pngColorType = asset[25];
if (pngWidth !== 90 || pngHeight !== 94) {
  throw new Error(`Expected wogua image to be 90x94, found ${pngWidth}x${pngHeight}`);
}

if (pngBitDepth !== 8 || pngColorType !== 6) {
  throw new Error("Wogua image must be an 8-bit RGBA PNG with transparent background");
}

if (!html.includes("this.squashSprite = image")) {
  throw new Error("Wogua sprite must use the original image object directly");
}

function decodeRgbaPng(buffer) {
  let offset = 8;
  const idat = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (type === "IDAT") idat.push(buffer.subarray(dataStart, dataEnd));
    if (type === "IEND") break;
    offset = dataEnd + 4;
  }

  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const stride = pngWidth * 4;
  const pixels = Buffer.alloc(pngHeight * stride);
  let inputOffset = 0;

  for (let y = 0; y < pngHeight; y += 1) {
    const filter = inflated[inputOffset];
    inputOffset += 1;
    const row = inflated.subarray(inputOffset, inputOffset + stride);
    inputOffset += stride;
    const outOffset = y * stride;
    const prevOffset = (y - 1) * stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= 4 ? pixels[outOffset + x - 4] : 0;
      const up = y > 0 ? pixels[prevOffset + x] : 0;
      const upLeft = y > 0 && x >= 4 ? pixels[prevOffset + x - 4] : 0;
      let value = row[x];

      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter ${filter}`);
      }

      pixels[outOffset + x] = value & 255;
    }
  }

  return pixels;
}

function alphaAt(pixels, x, y) {
  return pixels[(y * pngWidth + x) * 4 + 3];
}

const pixels = decodeRgbaPng(asset);
const cornerAlphas = [
  alphaAt(pixels, 0, 0),
  alphaAt(pixels, pngWidth - 1, 0),
  alphaAt(pixels, 0, pngHeight - 1),
  alphaAt(pixels, pngWidth - 1, pngHeight - 1)
];

if (cornerAlphas.some((alpha) => alpha !== 0)) {
  throw new Error(`Wogua background corners must be transparent, found alphas ${cornerAlphas.join(",")}`);
}

if (alphaAt(pixels, 45, 54) !== 255) {
  throw new Error("Wogua green body must remain fully opaque");
}

console.log("Static checks passed.");
