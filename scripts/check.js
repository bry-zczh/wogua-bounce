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
if (levelCount !== 5) {
  throw new Error(`Expected 5 levels, found ${levelCount}`);
}

const mechanismCount = (html.match(/mechanics: \[/g) || []).length;
if (mechanismCount !== 5) {
  throw new Error(`Expected 5 level mechanism summaries, found ${mechanismCount}`);
}

if (!fs.existsSync(assetPath)) {
  throw new Error("Missing assets/wogua.png");
}

console.log("Static checks passed.");
