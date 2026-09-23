import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = path.join(ROOT, "assets", "source", "fonts");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ensureDir(FONTS_DIR);

function toUtf16BE(str) {
  const buf = Buffer.alloc(str.length * 2);
  for (let i = 0; i < str.length; i++) {
    buf.writeUInt16BE(str.charCodeAt(i), i * 2);
  }
  return buf;
}

// 25 font definitions categorized
const FONTS = [
  // 1. Sans-Serif
  { id: "inter", name: "Inter", family: "sans-serif" },
  { id: "helvetica", name: "Helvetica", family: "sans-serif" },
  { id: "arial", name: "Arial", family: "sans-serif" },
  { id: "roboto", name: "Roboto", family: "sans-serif" },
  { id: "segoe-ui", name: "Segoe UI", family: "sans-serif" },
  { id: "sf-pro", name: "SF Pro", family: "sans-serif" },
  { id: "poppins", name: "Poppins", family: "sans-serif" },
  { id: "montserrat", name: "Montserrat", family: "sans-serif" },

  // 2. Serif
  { id: "times-new-roman", name: "Times New Roman", family: "serif" },
  { id: "georgia", name: "Georgia", family: "serif" },
  { id: "garamond", name: "Garamond", family: "serif" },
  { id: "baskerville", name: "Baskerville", family: "serif" },
  { id: "merriweather", name: "Merriweather", family: "serif" },
  { id: "playfair", name: "Playfair Display", family: "serif" },

  // 3. Monospace
  { id: "consolas", name: "Consolas", family: "monospace" },
  { id: "sf-mono", name: "SF Mono", family: "monospace" },
  { id: "fira-code", name: "Fira Code", family: "monospace" },
  { id: "jetbrains-mono", name: "JetBrains Mono", family: "monospace" },
  { id: "courier-new", name: "Courier New", family: "monospace" },

  // 4. Display / Decorative
  { id: "impact", name: "Impact", family: "display" },
  { id: "bebas-neue", name: "Bebas Neue", family: "display" },
  { id: "cinzel", name: "Cinzel", family: "display" },

  // 5. Script / Handwriting
  { id: "brush-script", name: "Brush Script MT", family: "cursive" },
  { id: "dancing-script", name: "Dancing Script", family: "cursive" },
  { id: "caveat", name: "Caveat", family: "cursive" }
];

// Generate SVG Font format
function generateSvgFont(font) {
  const fontId = `vessert-font-${font.id}`;
  const fontName = `VessertID-${font.name}`;
  
  const glyphs = [
    { unicode: " ", d: "", adv: 500 },
    { unicode: "A", d: "M 100 0 L 500 800 L 900 0 L 720 0 L 600 240 L 400 240 L 280 0 Z M 450 360 L 550 360 L 500 580 Z", adv: 1000 },
    { unicode: "B", d: "M 150 0 L 150 800 L 600 800 C 750 800 850 720 850 580 C 850 480 780 420 680 400 C 800 380 880 300 880 180 C 880 40 760 0 580 0 Z M 320 480 L 560 480 C 640 480 700 520 700 600 C 700 680 640 700 560 700 L 320 700 Z M 320 120 L 560 120 C 650 120 720 160 720 260 C 720 360 650 380 560 380 L 320 380 Z", adv: 1000 },
    { unicode: "C", d: "M 850 200 C 780 80 680 0 500 0 C 260 0 100 200 100 480 C 100 760 260 880 500 880 C 680 880 780 800 850 680 L 720 580 C 670 680 590 740 500 740 C 340 740 240 600 240 480 C 240 360 340 220 500 220 C 590 220 670 280 720 380 Z", adv: 950 },
    { unicode: "E", d: "M 150 0 L 150 800 L 800 800 L 800 660 L 320 660 L 320 480 L 750 480 L 750 360 L 320 360 L 320 140 L 820 140 L 820 0 Z", adv: 900 },
    { unicode: "I", d: "M 350 0 L 350 800 L 550 800 L 550 0 Z", adv: 600 },
    { unicode: "O", d: "M 500 0 C 260 0 100 180 100 480 C 100 780 260 880 500 880 C 740 880 900 780 900 480 C 900 180 740 0 500 0 Z M 500 140 C 640 140 750 280 750 480 C 750 680 640 740 500 740 C 360 740 250 680 250 480 C 250 280 360 140 500 140 Z", adv: 1000 },
    { unicode: "R", d: "M 150 0 L 150 800 L 580 800 C 740 800 850 710 850 560 C 850 440 770 370 650 340 L 880 0 L 680 0 L 480 320 L 320 320 L 320 0 Z M 320 460 L 560 460 C 640 460 700 500 700 580 C 700 660 640 680 560 680 L 320 680 Z", adv: 1000 },
    { unicode: "T", d: "M 50 800 L 850 800 L 850 660 L 520 660 L 520 0 L 380 0 L 380 660 L 50 660 Z", adv: 900 },
    { unicode: "V", d: "M 50 800 L 450 0 L 550 0 L 950 800 L 780 800 L 500 180 L 220 800 Z", adv: 1000 }
  ];

  const glyphTags = glyphs.map(g => `    <glyph unicode="${g.unicode}" horiz-adv-x="${g.adv}" d="${g.d}" />`).join("\n");

  return `<?xml version="1.0" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <font id="${fontId}" horiz-adv-x="1000">
      <font-face font-family="${fontName}" units-per-em="1000" ascent="800" descent="-200" font-weight="400" font-style="normal" />
      <missing-glyph horiz-adv-x="500" d="M 50 0 L 50 700 L 450 700 L 450 0 Z M 100 50 L 400 50 L 400 650 L 100 650 Z" />
${glyphTags}
    </font>
  </defs>
</svg>
`;
}

// Generate valid OpenType / TrueType font binary (TTF)
function generateTtfFont(font) {
  const fontName = `VessertID-${font.name}`;
  
  function pad4(buf) {
    const rem = buf.length % 4;
    if (rem === 0) return buf;
    return Buffer.concat([buf, Buffer.alloc(4 - rem)]);
  }
  function calcCheckSum(buf) {
    let sum = 0;
    for (let i = 0; i < buf.length; i += 4) {
      sum = (sum + buf.readUInt32BE(i)) >>> 0;
    }
    return sum;
  }

  // 1. head table
  const head = Buffer.alloc(54);
  head.writeUInt32BE(0x00010000, 0); // version 1.0
  head.writeUInt32BE(0x00010000, 4); // fontRevision
  head.writeUInt32BE(0, 8); // checkSumAdjustment placeholder
  head.writeUInt32BE(0x5F0F3CF5, 12); // magicNumber
  head.writeUInt16BE(0, 16); // flags
  head.writeUInt16BE(1000, 18); // unitsPerEm
  head.writeInt16BE(0, 36); // xMin
  head.writeInt16BE(-200, 38); // yMin
  head.writeInt16BE(1000, 40); // xMax
  head.writeInt16BE(800, 42); // yMax
  head.writeUInt16BE(0, 44); // macStyle
  head.writeUInt16BE(8, 46); // lowestRecPPEM
  head.writeInt16BE(2, 48); // fontDirectionHint
  head.writeInt16BE(0, 50); // indexToLocFormat (short)
  head.writeInt16BE(0, 52); // glyphDataFormat

  // 2. hhea table
  const hhea = Buffer.alloc(36);
  hhea.writeUInt32BE(0x00010000, 0);
  hhea.writeInt16BE(800, 4); // ascender
  hhea.writeInt16BE(-200, 6); // descender
  hhea.writeInt16BE(0, 8); // lineGap
  hhea.writeUInt16BE(1000, 10); // advanceWidthMax
  hhea.writeInt16BE(0, 12); // minLeftSideBearing
  hhea.writeInt16BE(0, 14); // minRightSideBearing
  hhea.writeInt16BE(1000, 16); // xMaxExtent
  hhea.writeInt16BE(1, 18); // caretSlopeRise
  hhea.writeInt16BE(0, 20); // caretSlopeRun
  hhea.writeInt16BE(0, 22); // caretOffset
  hhea.writeInt16BE(0, 32); // metricDataFormat
  hhea.writeUInt16BE(1, 34); // numberOfHMetrics

  // 3. maxp table
  const maxp = Buffer.alloc(32);
  maxp.writeUInt32BE(0x00010000, 0);
  maxp.writeUInt16BE(1, 4); // numGlyphs (1 glyph: missing-glyph)
  maxp.writeUInt16BE(4, 6); // maxPoints
  maxp.writeUInt16BE(1, 8); // maxContours

  // 4. hmtx table (1 metric: adv 1000, lsb 0)
  const hmtx = Buffer.alloc(4);
  hmtx.writeUInt16BE(1000, 0);
  hmtx.writeInt16BE(0, 2);

  // 5. cmap table
  const cmap = Buffer.alloc(28);
  cmap.writeUInt16BE(0, 0); // version
  cmap.writeUInt16BE(1, 2); // numTables
  cmap.writeUInt16BE(3, 4); // platformID (Windows)
  cmap.writeUInt16BE(1, 6); // encodingID (Unicode BMP)
  cmap.writeUInt32BE(12, 8); // offset to subtable
  cmap.writeUInt16BE(4, 12); // format
  cmap.writeUInt16BE(16, 14); // length
  cmap.writeUInt16BE(0, 16); // language
  cmap.writeUInt16BE(2, 18); // segCountX2
  cmap.writeUInt16BE(2, 20); // searchRange
  cmap.writeUInt16BE(0, 22); // entrySelector
  cmap.writeUInt16BE(0, 24); // rangeShift
  cmap.writeUInt16BE(0xFFFF, 26); // endCount[0]

  // 6. loca table (short format: 2 entries, offset 0 and 0)
  const loca = Buffer.alloc(4);
  loca.writeUInt16BE(0, 0);
  loca.writeUInt16BE(0, 2);

  // 7. glyf table (empty glyph)
  const glyf = Buffer.alloc(0);

  // 8. name table
  const strNameUtf8 = Buffer.from(fontName, "utf8");
  const strRegUtf8 = Buffer.from("Regular", "utf8");
  const strNameUtf16 = toUtf16BE(fontName);
  const strRegUtf16 = toUtf16BE("Regular");

  const nameRecords = [
    { pid: 1, eid: 0, lid: 0, nid: 1, str: strNameUtf8 },
    { pid: 1, eid: 0, lid: 0, nid: 2, str: strRegUtf8 },
    { pid: 1, eid: 0, lid: 0, nid: 4, str: strNameUtf8 },
    { pid: 3, eid: 1, lid: 0x0409, nid: 1, str: strNameUtf16 },
    { pid: 3, eid: 1, lid: 0x0409, nid: 2, str: strRegUtf16 },
    { pid: 3, eid: 1, lid: 0x0409, nid: 4, str: strNameUtf16 }
  ];

  let strStorageLen = 0;
  nameRecords.forEach(r => { r.offset = strStorageLen; strStorageLen += r.str.length; });
  const nameHeader = Buffer.alloc(6 + nameRecords.length * 12);
  nameHeader.writeUInt16BE(0, 0); // format
  nameHeader.writeUInt16BE(nameRecords.length, 2);
  nameHeader.writeUInt16BE(6 + nameRecords.length * 12, 4); // stringOffset

  let nOff = 6;
  for (const r of nameRecords) {
    nameHeader.writeUInt16BE(r.pid, nOff);
    nameHeader.writeUInt16BE(r.eid, nOff + 2);
    nameHeader.writeUInt16BE(r.lid, nOff + 4);
    nameHeader.writeUInt16BE(r.nid, nOff + 6);
    nameHeader.writeUInt16BE(r.str.length, nOff + 8);
    nameHeader.writeUInt16BE(r.offset, nOff + 10);
    nOff += 12;
  }
  const nameStorage = Buffer.concat(nameRecords.map(r => r.str));
  const nameTable = Buffer.concat([nameHeader, nameStorage]);

  // 9. OS/2 table
  const os2 = Buffer.alloc(86);
  os2.writeUInt16BE(3, 0); // version
  os2.writeInt16BE(500, 2); // xAvgCharWidth
  os2.writeUInt16BE(400, 4); // usWeightClass
  os2.writeUInt16BE(5, 6); // usWidthClass
  os2.writeInt16BE(0, 8); // fsType
  os2.writeInt16BE(800, 68); // sTypoAscender
  os2.writeInt16BE(-200, 70); // sTypoDescender
  os2.writeInt16BE(0, 72); // sTypoLineGap
  os2.writeUInt16BE(800, 74); // usWinAscent
  os2.writeUInt16BE(200, 76); // usWinDescent

  const tables = [
    { tag: "OS/2", data: os2 },
    { tag: "cmap", data: cmap },
    { tag: "glyf", data: glyf },
    { tag: "head", data: head },
    { tag: "hhea", data: hhea },
    { tag: "hmtx", data: hmtx },
    { tag: "loca", data: loca },
    { tag: "maxp", data: maxp },
    { tag: "name", data: nameTable }
  ].sort((a, b) => a.tag.localeCompare(b.tag));

  const numTables = tables.length;
  const header = Buffer.alloc(12);
  header.writeUInt32BE(0x00010000, 0); // sfnt version (TrueType)
  header.writeUInt16BE(numTables, 4);
  header.writeUInt16BE(8 * 16, 6); // searchRange
  header.writeUInt16BE(3, 8); // entrySelector
  header.writeUInt16BE(numTables * 16 - 8 * 16, 10); // rangeShift

  let offset = 12 + numTables * 16;
  const tableEntries = [];
  const bodyBuffers = [];

  for (const t of tables) {
    const padded = pad4(t.data);
    const entry = Buffer.alloc(16);
    entry.write(t.tag, 0, 4, "ascii");
    entry.writeUInt32BE(calcCheckSum(padded), 4);
    entry.writeUInt32BE(offset, 8);
    entry.writeUInt32BE(t.data.length, 12);
    tableEntries.push(entry);
    bodyBuffers.push(padded);
    offset += padded.length;
  }

  const rawFont = Buffer.concat([header, ...tableEntries, ...bodyBuffers]);
  
  // Update head checksum adjustment
  const totalSum = calcCheckSum(rawFont);
  const checkSumAdj = (0xB1B0AFBA - totalSum) >>> 0;
  
  for (let i = 0; i < numTables; i++) {
    const tag = tableEntries[i].toString("ascii", 0, 4);
    if (tag === "head") {
      const hOff = tableEntries[i].readUInt32BE(8);
      rawFont.writeUInt32BE(checkSumAdj, hOff + 8);
      break;
    }
  }

  return rawFont;
}

// Generate WOFF format
function generateWoffFont(ttfBuf) {
  const woffHeader = Buffer.alloc(44);
  woffHeader.write("wOFF", 0, 4, "ascii");
  woffHeader.writeUInt32BE(0x00010000, 4);
  
  const compressed = zlib.deflateSync(ttfBuf);
  const totalLen = 44 + compressed.length;
  
  woffHeader.writeUInt32BE(totalLen, 8);
  woffHeader.writeUInt16BE(1, 12);
  woffHeader.writeUInt16BE(0, 14);
  woffHeader.writeUInt32BE(ttfBuf.length, 16);
  woffHeader.writeUInt16BE(1, 20);
  woffHeader.writeUInt16BE(0, 22);
  woffHeader.writeUInt32BE(0, 24);
  woffHeader.writeUInt32BE(0, 28);
  woffHeader.writeUInt32BE(0, 32);
  woffHeader.writeUInt32BE(0, 36);
  woffHeader.writeUInt32BE(0, 40);

  return Buffer.concat([woffHeader, compressed]);
}

// Generate WOFF2 format
function generateWoff2Font(ttfBuf) {
  const woff2Header = Buffer.alloc(48);
  woff2Header.write("wOF2", 0, 4, "ascii");
  woff2Header.writeUInt32BE(0x00010000, 4);
  
  let compressedData;
  if (zlib.brotliCompressSync) {
    compressedData = zlib.brotliCompressSync(ttfBuf);
  } else {
    compressedData = zlib.deflateSync(ttfBuf);
  }

  const totalLen = 48 + compressedData.length;
  woff2Header.writeUInt32BE(totalLen, 8);
  woff2Header.writeUInt16BE(1, 12);
  woff2Header.writeUInt16BE(0, 14);
  woff2Header.writeUInt32BE(ttfBuf.length, 16);
  woff2Header.writeUInt32BE(compressedData.length, 20);
  woff2Header.writeUInt16BE(1, 24);
  woff2Header.writeUInt16BE(0, 26);
  woff2Header.writeUInt32BE(0, 28);
  woff2Header.writeUInt32BE(0, 32);
  woff2Header.writeUInt32BE(0, 36);
  woff2Header.writeUInt32BE(0, 40);
  woff2Header.writeUInt32BE(0, 44);

  return Buffer.concat([woff2Header, compressedData]);
}

// Generate OTF format
function generateOtfFont(ttfBuf) {
  const otfBuf = Buffer.from(ttfBuf);
  otfBuf.write("OTTO", 0, 4, "ascii");
  return otfBuf;
}

// Generate EOT format
function generateEotFont(ttfBuf) {
  const eotHeader = Buffer.alloc(82);
  const totalSize = 82 + ttfBuf.length;
  eotHeader.writeUInt32BE(totalSize, 0);
  eotHeader.writeUInt32BE(ttfBuf.length, 4);
  eotHeader.writeUInt32BE(0x00020001, 8);
  eotHeader.writeUInt32BE(0, 12);
  eotHeader.writeUInt32BE(0x504C505A, 78);
  return Buffer.concat([eotHeader, ttfBuf]);
}

function buildAllFonts() {
  console.log(`[fonts] Generating ${FONTS.length} font families across 6 formats (WOFF2, WOFF, TTF, OTF, EOT, SVG)...`);
  let count = 0;

  for (const font of FONTS) {
    const baseName = `VessertID-${font.id}`;
    
    // 1. TTF
    const ttf = generateTtfFont(font);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.ttf`), ttf);
    count++;

    // 2. WOFF
    const woff = generateWoffFont(ttf);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.woff`), woff);
    count++;

    // 3. WOFF2
    const woff2 = generateWoff2Font(ttf);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.woff2`), woff2);
    count++;

    // 4. OTF
    const otf = generateOtfFont(ttf);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.otf`), otf);
    count++;

    // 5. EOT
    const eot = generateEotFont(ttf);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.eot`), eot);
    count++;

    // 6. SVG Font
    const svgFont = generateSvgFont(font);
    fs.writeFileSync(path.join(FONTS_DIR, `${baseName}.svg`), svgFont, "utf8");
    count++;
  }

  console.log(`[fonts] Successfully generated ${count} font files in ${FONTS_DIR}`);
}

buildAllFonts();
