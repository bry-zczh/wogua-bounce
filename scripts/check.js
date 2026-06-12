const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const root = path.resolve(__dirname, "..");
const indexPath = path.join(root, "index.html");
const assetPath = path.join(root, "assets", "wogua.png");
const manifestPath = path.join(root, "manifest.webmanifest");
const serviceWorkerPath = path.join(root, "sw.js");
const capacitorConfigPath = path.join(root, "capacitor.config.json");
const androidManifestPath = path.join(root, "android", "app", "src", "main", "AndroidManifest.xml");
const iosInfoPlistPath = path.join(root, "ios", "App", "App", "Info.plist");
const apkWorkflowPath = path.join(root, "docs", "build-apk-workflow.yml");
const iconPaths = [
  { path: path.join(root, "assets", "icon-192.png"), width: 192, height: 192 },
  { path: path.join(root, "assets", "icon-512.png"), width: 512, height: 512 }
];
const html = fs.readFileSync(indexPath, "utf8");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const expectedLevels = 15;

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
  "class Portal",
  "class WindZone",
  "class Particle"
];

const requiredUiTokens = [
  'id="mainMenu"',
  'id="levelSelect"',
  'id="codexScreen"',
  'id="skillScreen"',
  'id="levelGrid"',
  'id="levelPager"',
  'id="prevLevelPageBtn"',
  'id="nextLevelPageBtn"',
  'id="levelPageText"',
  'id="codexTabs"',
  'id="codexContent"',
  'id="skillList"',
  'id="skillsBtn"',
  'id="hintBtn"',
  'id="hintBox"',
  'id="menuBtn"',
  'id="overlayMenuBtn"',
  "LEVELS_PER_PAGE",
  "changeLevelPage",
  "renderLevelSelect()",
  "renderSkillScreen()",
  "renderCodex()",
  "CODEX_SECTIONS",
  "SKILLS",
  "manifest.webmanifest",
  "serviceWorker.register",
  "spawnSplitSquashes",
  "drawRouteHint",
  "handlePortals",
  "applyWind",
  "传送门",
  "风道"
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
if (routeHintCount < 10) {
  throw new Error(`Expected route hints for Levels 6-15, found ${routeHintCount}`);
}

if (html.includes("{ x: 112, y: 596, width: 256, height: 24")) {
  throw new Error("Level 7 bottom spring blocks the route hint");
}

if (!fs.existsSync(manifestPath)) {
  throw new Error("Missing manifest.webmanifest");
}

if (!fs.existsSync(serviceWorkerPath)) {
  throw new Error("Missing sw.js");
}

for (const file of [capacitorConfigPath, androidManifestPath, iosInfoPlistPath, apkWorkflowPath]) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${path.relative(root, file)}`);
  }
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.display !== "standalone" || manifest.orientation !== "portrait") {
  throw new Error("PWA manifest must be standalone portrait");
}

for (const size of ["192x192", "512x512"]) {
  if (!manifest.icons.some((icon) => icon.sizes === size)) {
    throw new Error(`Missing PWA icon ${size}`);
  }
}

const serviceWorker = fs.readFileSync(serviceWorkerPath, "utf8");
for (const token of ["install", "activate", "fetch", "CACHE_NAME"]) {
  if (!serviceWorker.includes(token)) {
    throw new Error(`Missing service worker token ${token}`);
  }
}

const capacitorConfig = JSON.parse(fs.readFileSync(capacitorConfigPath, "utf8"));
if (capacitorConfig.appName !== "Angry Melon" || capacitorConfig.appId !== "com.bryzczh.angrymelon") {
  throw new Error("Capacitor app metadata must be Angry Melon");
}

if (capacitorConfig.webDir !== "www") {
  throw new Error("Capacitor webDir must be www");
}

for (const script of ["build", "mobile:sync", "android:sync", "ios:sync"]) {
  if (!pkg.scripts?.[script]) {
    throw new Error(`Missing npm script ${script}`);
  }
}

const androidManifest = fs.readFileSync(androidManifestPath, "utf8");
if (!androidManifest.includes('android:screenOrientation="portrait"')) {
  throw new Error("Android app must be locked to portrait");
}

const iosInfoPlist = fs.readFileSync(iosInfoPlistPath, "utf8");
if (!iosInfoPlist.includes("Angry Melon") || iosInfoPlist.includes("UIInterfaceOrientationLandscape")) {
  throw new Error("iOS app metadata must be Angry Melon portrait only");
}

const apkWorkflow = fs.readFileSync(apkWorkflowPath, "utf8");
for (const token of ["assembleDebug", "angry-melon-debug-apk", "actions/upload-artifact"]) {
  if (!apkWorkflow.includes(token)) {
    throw new Error(`Missing APK workflow token ${token}`);
  }
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

for (const icon of iconPaths) {
  if (!fs.existsSync(icon.path)) {
    throw new Error(`Missing ${path.relative(root, icon.path)}`);
  }
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

for (const icon of iconPaths) {
  const buffer = fs.readFileSync(icon.path);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer[25];
  if (width !== icon.width || height !== icon.height || colorType !== 6) {
    throw new Error(`Invalid PWA icon ${path.relative(root, icon.path)}`);
  }
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
