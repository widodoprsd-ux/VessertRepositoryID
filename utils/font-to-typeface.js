/**
 * Convert SVG Font format to Three.js Typeface JSON specification
 * Follows the exact facetype.js specification used by Three.js FontLoader
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS_SRC = path.join(ROOT, "internal-ui", "dist", "assets", "source", "fonts");
const TYPEFACE_SRC_DIR = path.join(ROOT, "src", "fonts", "typeface");
const TYPEFACE_DIST_DIR = path.join(ROOT, "dist", "assets", "typeface");
const TYPEFACE_INTERNAL_DIR = path.join(ROOT, "internal-ui", "dist", "assets", "typeface");

[TYPEFACE_SRC_DIR, TYPEFACE_DIST_DIR, TYPEFACE_INTERNAL_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

function parseSvgPathToFacetypeActions(d) {
  if (!d) return [];
  const commands = d.match(/([a-df-z]|[\d.-]+)/gi) || [];
  const actions = [];
  let i = 0;
  let currentCmd = '';

  while (i < commands.length) {
    const token = commands[i];
    if (/^[a-df-z]$/i.test(token)) {
      currentCmd = token;
      i++;
    }

    if (currentCmd === 'M') {
      const x = parseFloat(commands[i++]);
      const y = parseFloat(commands[i++]);
      actions.push({ action: 'm', x, y });
    } else if (currentCmd === 'L') {
      const x = parseFloat(commands[i++]);
      const y = parseFloat(commands[i++]);
      actions.push({ action: 'l', x, y });
    } else if (currentCmd === 'C') {
      const x1 = parseFloat(commands[i++]);
      const y1 = parseFloat(commands[i++]);
      const x2 = parseFloat(commands[i++]);
      const y2 = parseFloat(commands[i++]);
      const x = parseFloat(commands[i++]);
      const y = parseFloat(commands[i++]);
      actions.push({ action: 'b', x1, y1, x2, y2, x, y });
    } else if (currentCmd === 'Q') {
      const x1 = parseFloat(commands[i++]);
      const y1 = parseFloat(commands[i++]);
      const x = parseFloat(commands[i++]);
      const y = parseFloat(commands[i++]);
      actions.push({ action: 'q', x1, y1, x, y });
    } else if (currentCmd === 'Z' || currentCmd === 'z') {
      // End contour
      currentCmd = '';
    } else {
      i++;
    }
  }

  // Convert to Three.js facetype string format: "m x y l x y b x1 y1 x2 y2 x y"
  return actions.map(act => {
    if (act.action === 'm' || act.action === 'l') {
      return `${act.action} ${act.x} ${act.y}`;
    }
    if (act.action === 'b') {
      return `b ${act.x1} ${act.y1} ${act.x2} ${act.y2} ${act.x} ${act.y}`;
    }
    if (act.action === 'q') {
      return `q ${act.x1} ${act.y1} ${act.x} ${act.y}`;
    }
    return '';
  }).join(' ');
}

export function convertSvgFontToTypeface(svgContent) {
  const fontFaceMatch = svgContent.match(/<font-face([^>]+)\/>/);
  const fontFamilyMatch = fontFaceMatch ? fontFaceMatch[1].match(/font-family="([^"]+)"/) : null;
  const unitsPerEmMatch = fontFaceMatch ? fontFaceMatch[1].match(/units-per-em="([^"]+)"/) : null;
  const ascentMatch = fontFaceMatch ? fontFaceMatch[1].match(/ascent="([^"]+)"/) : null;
  const descentMatch = fontFaceMatch ? fontFaceMatch[1].match(/descent="([^"]+)"/) : null;
  const weightMatch = fontFaceMatch ? fontFaceMatch[1].match(/font-weight="([^"]+)"/) : null;

  const familyName = fontFamilyMatch ? fontFamilyMatch[1] : "VessertID";
  const resolution = unitsPerEmMatch ? parseInt(unitsPerEmMatch[1], 10) : 1000;
  const ascender = ascentMatch ? parseInt(ascentMatch[1], 10) : 800;
  const descender = descentMatch ? parseInt(descentMatch[1], 10) : -200;
  const cssFontWeight = weightMatch ? weightMatch[1] : "normal";

  const glyphRegex = /<glyph\s+unicode="([^"]*)"\s+horiz-adv-x="([^"]*)"(?:\s+d="([^"]*)")?\s*\/>/g;
  const glyphs = {};
  let match;

  while ((match = glyphRegex.exec(svgContent)) !== null) {
    const unicode = match[1];
    const ha = parseInt(match[2], 10) || 500;
    const d = match[3] || "";
    const o = parseSvgPathToFacetypeActions(d);

    glyphs[unicode] = {
      ha,
      x_min: 0,
      x_max: ha,
      o
    };
  }

  // Always ensure space character exists
  if (!glyphs[" "]) {
    glyphs[" "] = {
      ha: 500,
      x_min: 0,
      x_max: 500,
      o: ""
    };
  }

  return {
    schemaVersion: 1,
    creator: "VessertID Typeface Generator (Facetype Standard)",
    familyName,
    ascender,
    descender,
    underlinePosition: -100,
    underlineThickness: 50,
    boundingBox: {
      yMin: descender,
      xMin: 0,
      yMax: ascender,
      xMax: 1000
    },
    resolution,
    original_font_information: {
      postscript_name: familyName.replace(/\s+/g, '-'),
      version_string: "Version 1.0",
      vendor_url: "https://github.com/widodoprsd-ux/VessertRepositoryID",
      full_font_name: familyName,
      font_family_name: familyName,
      font_subfamily_name: cssFontWeight === "bold" || cssFontWeight === "700" ? "Bold" : "Regular"
    },
    cssFontWeight,
    cssFontStyle: "normal",
    glyphs
  };
}

export function generateAllTypefaces() {
  if (!fs.existsSync(FONTS_SRC)) {
    console.error("Fonts directory not found: " + FONTS_SRC);
    return;
  }

  const svgFiles = fs.readdirSync(FONTS_SRC)
    .filter(f => f.startsWith("VessertID-") && f.endsWith(".svg") && !f.includes("."));

  // Also include standard clean name files if exists
  const targetFiles = fs.readdirSync(FONTS_SRC).filter(f => /^VessertID-[a-z0-9-]+\.svg$/.test(f));
  const uniqueBases = [...new Set(targetFiles.map(f => f.replace('.svg', '')))];

  let generatedCount = 0;
  for (const base of uniqueBases) {
    const svgPath = path.join(FONTS_SRC, `${base}.svg`);
    if (!fs.existsSync(svgPath)) continue;

    const svgContent = fs.readFileSync(svgPath, "utf8");
    const typefaceJson = convertSvgFontToTypeface(svgContent);
    const jsonString = JSON.stringify(typefaceJson, null, 2);

    // Save to src/fonts/typeface and dist directories
    fs.writeFileSync(path.join(TYPEFACE_SRC_DIR, `${base}.typeface.json`), jsonString, "utf8");
    fs.writeFileSync(path.join(TYPEFACE_DIST_DIR, `${base}.typeface.json`), jsonString, "utf8");
    fs.writeFileSync(path.join(TYPEFACE_INTERNAL_DIR, `${base}.typeface.json`), jsonString, "utf8");
    generatedCount++;
  }

  console.log(`[typeface] Successfully generated ${generatedCount} Three.js typeface.json fonts!`);
}

// Self-run check
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  generateAllTypefaces();
}
