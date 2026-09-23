import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, "dist");
const CSS_DIR = path.join(ROOT, "css");
const SVG_DIR = path.join(ROOT, "svg");
const ASSETS_SRC = path.join(ROOT, "assets", "source");
const ASSETS_RASTER = path.join(ROOT, "assets", "raster");
const ASSETS_VECTOR = path.join(ROOT, "assets", "vector");
const ASSETS_TYPEFACE = path.join(ROOT, "dist", "assets", "typeface");
const PUBLIC_DIR = path.join(ROOT, "public");

const VESSERT_ID_REGEX =
  /^vessert-(icon-[a-z0-9-]+-(line|solid|duotone|brand|mono)|logo-[a-z0-9-]+|illus-[a-z0-9-]+|brand-[a-z0-9-]+|wordmark)$/;

const FORBIDDEN = [
  "lucide", "heroicon", "tabler", "fontawesome", "feather",
  "material-symbol", "data-icon", 'class="', 'id="icon', 'id="svg'
];

let CRC_TABLE = null;
function makeCrcTable() {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
}
function crc32(buf) {
  if (!CRC_TABLE) CRC_TABLE = makeCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", compressed),
    pngChunk("IEND", Buffer.alloc(0))
  ]);
}

function encodeICO(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  const dirs = [];
  let offset = 6 + 16 * entries.length;
  for (const e of entries) {
    const dir = Buffer.alloc(16);
    dir[0] = e.size === 256 ? 0 : e.size;
    dir[1] = e.size === 256 ? 0 : e.size;
    dir[2] = 0;
    dir[3] = 0;
    dir.writeUInt16LE(1, 4);
    dir.writeUInt16LE(32, 6);
    dir.writeUInt32LE(e.png.length, 8);
    dir.writeUInt32LE(offset, 12);
    dirs.push(dir);
    offset += e.png.length;
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.png)]);
}

function encodeBMP(width, height, rgba) {
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 54 + pixelDataSize;
  const buf = Buffer.alloc(fileSize);
  buf.write("BM", 0, "ascii");
  buf.writeUInt32LE(fileSize, 2);
  buf.writeUInt32LE(0, 6);
  buf.writeUInt32LE(54, 10);
  buf.writeUInt32LE(40, 14);
  buf.writeInt32LE(width, 18);
  buf.writeInt32LE(height, 22);
  buf.writeUInt16LE(1, 26);
  buf.writeUInt16LE(24, 28);
  buf.writeUInt32LE(0, 30);
  buf.writeUInt32LE(pixelDataSize, 34);
  buf.writeInt32LE(2835, 38);
  buf.writeInt32LE(2835, 42);
  buf.writeUInt32LE(0, 46);
  buf.writeUInt32LE(0, 50);
  let p = 54;
  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      buf[p++] = rgba[i + 2];
      buf[p++] = rgba[i + 1];
      buf[p++] = rgba[i + 0];
    }
    while ((p - 54) % rowSize !== 0) buf[p++] = 0;
  }
  return buf;
}

function makeCanvas(w, h) {
  return Buffer.alloc(w * h * 4, 0);
}

function setPixel(buf, w, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= w) return;
  const i = (y * w + x) * 4;
  if (i < 0 || i + 3 >= buf.length) return;
  if (a === 255) {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = 255;
    return;
  }
  const na = a / 255;
  const ia = 1 - na;
  buf[i] = Math.round(r * na + buf[i] * ia);
  buf[i + 1] = Math.round(g * na + buf[i + 1] * ia);
  buf[i + 2] = Math.round(b * na + buf[i + 2] * ia);
  buf[i + 3] = Math.min(255, buf[i + 3] + a);
}

function fillRect(buf, w, h, x0, y0, rw, rh, color) {
  const [r, g, b, a] = color;
  for (let y = y0; y < y0 + rh; y++) {
    for (let x = x0; x < x0 + rw; x++) {
      setPixel(buf, w, x, y, r, g, b, a);
    }
  }
}

function fillCircle(buf, w, h, cx, cy, rad, color) {
  const [r, g, b, a] = color;
  const r2 = rad * rad;
  for (let y = cy - rad; y <= cy + rad; y++) {
    for (let x = cx - rad; x <= cx + rad; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) setPixel(buf, w, x, y, r, g, b, a);
    }
  }
}

function fillRoundedRect(buf, w, h, x0, y0, rw, rh, radius, color) {
  const [r, g, b, a] = color;
  for (let y = y0; y < y0 + rh; y++) {
    for (let x = x0; x < x0 + rw; x++) {
      const dx = Math.min(x - x0, x0 + rw - 1 - x);
      const dy = Math.min(y - y0, y0 + rh - 1 - y);
      if (dx < radius && dy < radius) {
        const cx = radius - dx;
        const cy = radius - dy;
        if (cx * cx + cy * cy > radius * radius) continue;
      }
      setPixel(buf, w, x, y, r, g, b, a);
    }
  }
}

function fillTriangle(buf, w, h, x1, y1, x2, y2, x3, y3, color) {
  const [r, g, b, a] = color;
  const minX = Math.max(0, Math.floor(Math.min(x1, x2, x3)));
  const maxX = Math.min(w - 1, Math.ceil(Math.max(x1, x2, x3)));
  const minY = Math.max(0, Math.floor(Math.min(y1, y2, y3)));
  const maxY = Math.min(h - 1, Math.ceil(Math.max(y1, y2, y3)));
  const sign = (ax, ay, bx, by, cx, cy) =>
    (ax - cx) * (by - cy) - (bx - cx) * (ay - cy);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const d1 = sign(x, y, x1, y1, x2, y2);
      const d2 = sign(x, y, x2, y2, x3, y3);
      const d3 = sign(x, y, x3, y3, x1, y1);
      const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
      const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
      if (!(hasNeg && hasPos)) setPixel(buf, w, x, y, r, g, b, a);
    }
  }
}

function drawVessertMark(size, bg, fg, mark) {
  const canvas = makeCanvas(size, size);
  const s = size;
  fillRoundedRect(canvas, s, s, 0, 0, s, s, Math.round(s * 0.22), bg);

  // Shield base silhouette
  const midX = Math.round(s / 2);
  const shTop = Math.round(s * 0.15);
  const shBot = Math.round(s * 0.85);
  const shW = Math.round(s * 0.32);
  fillTriangle(canvas, s, s, midX, shBot, midX - shW, shTop, midX + shW, shTop, [255, 255, 255, 60]);

  // Sharp V form (downward pointing)
  const vTop = Math.round(s * 0.32);
  const vBot = Math.round(s * 0.72);
  const vL = Math.round(s * 0.28);
  const vR = Math.round(s * 0.72);
  const vThick = Math.max(2, Math.round(s * 0.12));

  // Left arm of V
  for (let y = vTop; y <= vBot; y++) {
    const progress = (y - vTop) / (vBot - vTop);
    const cx = Math.round(vL + progress * (midX - vL));
    for (let dx = -Math.round(vThick / 2); dx <= Math.round(vThick / 2); dx++) {
      setPixel(canvas, s, cx + dx, y, mark[0], mark[1], mark[2], mark[3]);
    }
  }

  // Right arm of V (folding into D arc)
  for (let y = vTop; y <= vBot; y++) {
    const progress = (y - vTop) / (vBot - vTop);
    const cx = Math.round(midX + progress * (vR - midX));
    for (let dx = -Math.round(vThick / 2); dx <= Math.round(vThick / 2); dx++) {
      setPixel(canvas, s, cx + dx, y, mark[0], mark[1], mark[2], Math.round(mark[3] * 0.8));
    }
  }

  // ID verification dot / accent
  if (size >= 32) {
    fillCircle(canvas, s, s, Math.round(s * 0.62), Math.round(s * 0.44), Math.max(2, Math.round(s * 0.05)), [255, 255, 255, 240]);
  }
  return canvas;
}

function generateRasterAssets() {
  ensureDir(ASSETS_RASTER);
  const brandBlue = [37, 99, 235, 255];
  const white = [255, 255, 255, 255];

  const icoSizes = [16, 32, 48];
  const icoEntries = icoSizes.map((size) => {
    const canvas = drawVessertMark(size, brandBlue, white, white);
    return { size, png: encodePNG(size, size, canvas) };
  });
  fs.writeFileSync(path.join(ASSETS_RASTER, "favicon.ico"), encodeICO(icoEntries));
  console.log("[raster] favicon.ico 16/32/48");

  {
    const size = 180;
    const canvas = drawVessertMark(size, brandBlue, white, white);
    fs.writeFileSync(path.join(ASSETS_RASTER, "apple-touch-icon.png"), encodePNG(size, size, canvas));
    console.log("[raster] apple-touch-icon.png 180x180");
  }
  {
    const size = 192;
    const canvas = drawVessertMark(size, brandBlue, white, white);
    fs.writeFileSync(path.join(ASSETS_RASTER, "icon-192.png"), encodePNG(size, size, canvas));
    console.log("[raster] icon-192.png 192x192");
  }
  {
    const size = 512;
    const canvas = drawVessertMark(size, brandBlue, white, white);
    fs.writeFileSync(path.join(ASSETS_RASTER, "icon-512.png"), encodePNG(size, size, canvas));
    console.log("[raster] icon-512.png 512x512");
  }
  {
    const w = 1200;
    const h = 630;
    const canvas = makeCanvas(w, h);
    fillRect(canvas, w, h, 0, 0, w, h, brandBlue);
    const mx = 240;
    const my = 315;
    const scale = 120;
    fillTriangle(canvas, w, h, mx, my - scale, mx - scale, my + scale, mx + scale, my + scale, [255, 255, 255, 40]);
    fillRect(canvas, w, h, 80, 220, 8, 190, white);
    fillRect(canvas, w, h, 120, 230, 620, 70, white);
    fillRect(canvas, w, h, 120, 330, 480, 40, [219, 234, 254, 255]);
    fs.writeFileSync(path.join(ASSETS_RASTER, "og-image.png"), encodePNG(w, h, canvas));
    console.log("[raster] og-image.png 1200x630");
  }
  {
    const w = 800;
    const h = 600;
    const canvas = makeCanvas(w, h);
    fillRect(canvas, w, h, 0, 0, w, h, [243, 244, 246, 255]);
    const border = [209, 213, 219, 255];
    fillRect(canvas, w, h, 40, 40, w - 80, 4, border);
    fillRect(canvas, w, h, 40, h - 44, w - 80, 4, border);
    fillRect(canvas, w, h, 40, 40, 4, h - 80, border);
    fillRect(canvas, w, h, w - 44, 40, 4, h - 80, border);
    for (let i = 0; i < Math.min(w, h) - 80; i++) {
      const x = 40 + i;
      const y = 40 + i;
      setPixel(canvas, w, x, y, 156, 163, 175, 255);
      setPixel(canvas, w, x + 1, y, 156, 163, 175, 255);
      setPixel(canvas, w, x, y + 1, 156, 163, 175, 255);
    }
    fs.writeFileSync(path.join(ASSETS_RASTER, "placeholder.png"), encodePNG(w, h, canvas));
    console.log("[raster] placeholder.png 800x600");
  }
  {
    const w = 400;
    const h = 300;
    const canvas = makeCanvas(w, h);
    fillRect(canvas, w, h, 0, 0, w, h, [243, 244, 246, 255]);
    fillRect(canvas, w, h, 20, 20, w - 40, 4, [209, 213, 219, 255]);
    fillRect(canvas, w, h, 20, h - 24, w - 40, 4, [209, 213, 219, 255]);
    fs.writeFileSync(path.join(ASSETS_RASTER, "placeholder.bmp"), encodeBMP(w, h, canvas));
    console.log("[raster] placeholder.bmp 400x300");
  }
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

function walk(dir, ext, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, ext, list);
    else if (ext === "" || e.name.endsWith(ext)) list.push(full);
  }
  return list;
}

function readCss() {
  const files = fs.readdirSync(CSS_DIR).filter((f) => f.endsWith(".css")).sort();
  return files.map((f) => {
    return "/* === " + f + " === */\n" +
      fs.readFileSync(path.join(CSS_DIR, f), "utf8").trim() + "\n";
  }).join("\n");
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function buildCss() {
  const css = readCss();
  fs.writeFileSync(path.join(DIST, "internal.css"), css, "utf8");
  fs.writeFileSync(path.join(DIST, "internal.min.css"), minifyCss(css), "utf8");
  console.log("[build] css ok " + css.length + " bytes");
}

function validateSvg(file, raw) {
  const name = path.basename(file, ".svg");
  const errs = [];
  if (!VESSERT_ID_REGEX.test(name)) errs.push("VessertID invalid: " + name);
  const low = raw.toLowerCase();
  for (const m of FORBIDDEN) {
    if (low.includes(m.toLowerCase())) errs.push("Forbidden marker: " + m);
  }
  if (!raw.includes('xmlns="http://www.w3.org/2000/svg"')) errs.push("Missing xmlns");
  if (!raw.includes("viewBox=")) errs.push("Missing viewBox");
  if (/<svg[^>]*\swidth=/.test(raw)) errs.push("Remove width");
  if (/<svg[^>]*\sheight=/.test(raw)) errs.push("Remove height");
  return errs;
}

function toSymbol(file) {
  const id = path.basename(file, ".svg");
  const raw = fs.readFileSync(file, "utf8");
  const root = (raw.match(/<svg([^>]*)>/) || [null, ""])[1];
  const get = (re) => (root.match(re) || [null, null])[1];
  const viewBox = get(/viewBox="([^"]+)"/) || "0 0 24 24";
  const fill = get(/\sfill="([^"]+)"/);
  const stroke = get(/\sstroke="([^"]+)"/);
  const sw = get(/\sstroke-width="([^"]+)"/);
  const lc = get(/\sstroke-linecap="([^"]+)"/);
  const lj = get(/\sstroke-linejoin="([^"]+)"/);
  const attrs = [`id="${id}"`, `viewBox="${viewBox}"`];
  if (fill) attrs.push(`fill="${fill}"`);
  if (stroke) attrs.push(`stroke="${stroke}"`);
  if (sw) attrs.push(`stroke-width="${sw}"`);
  if (lc) attrs.push(`stroke-linecap="${lc}"`);
  if (lj) attrs.push(`stroke-linejoin="${lj}"`);
  const inner = raw.replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "").trim();
  return `<symbol ${attrs.join(" ")}>${inner}</symbol>`;
}

function minifySvg(svg) {
  return svg.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
}

function buildSprite() {
  const files = [
    ...walk(path.join(SVG_DIR, "icons"), ".svg"),
    ...walk(path.join(SVG_DIR, "brand"), ".svg"),
    ...walk(path.join(SVG_DIR, "illus"), ".svg")
  ];
  let failed = 0;
  for (const f of files) {
    const errs = validateSvg(f, fs.readFileSync(f, "utf8"));
    if (errs.length) {
      failed++;
      console.error("[svg] " + path.relative(ROOT, f));
      errs.forEach((e) => console.error("      " + e));
    }
  }
  if (failed) {
    console.error("[build] failed " + failed + " svg rejected");
    process.exit(1);
  }
  const symbols = files.map(toSymbol).join("\n");
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n${symbols}\n</svg>\n`;
  fs.writeFileSync(path.join(DIST, "vessert-sprite.svg"), sprite, "utf8");
  fs.writeFileSync(path.join(DIST, "vessert-sprite.min.svg"), minifySvg(sprite), "utf8");
  console.log("[build] sprite ok " + files.length + " symbols");
}

const COPY_MAP = [
  { src: ASSETS_SRC, dest: path.join(DIST, "assets", "source") },
  { src: ASSETS_RASTER, dest: path.join(DIST, "assets", "raster") },
  { src: ASSETS_VECTOR, dest: path.join(DIST, "assets", "vector") }
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  ensureDir(dest);
  let count = 0;
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) count += copyDir(s, d);
    else {
      fs.copyFileSync(s, d);
      count++;
    }
  }
  return count;
}

function copyAllAssets() {
  let total = 0;
  for (const m of COPY_MAP) total += copyDir(m.src, m.dest);
  console.log("[assets] copied " + total + " files");
}

function minifyHtml(html) {
  return html
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/\n\s*/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function copyPublic() {
  if (!fs.existsSync(PUBLIC_DIR)) return;
  for (const f of fs.readdirSync(PUBLIC_DIR)) {
    const src = path.join(PUBLIC_DIR, f);
    const dest = path.join(DIST, f);
    if (!fs.statSync(src).isFile()) continue;
    if (f.endsWith(".html")) {
      fs.writeFileSync(dest, minifyHtml(fs.readFileSync(src, "utf8")), "utf8");
    } else {
      fs.copyFileSync(src, dest);
    }
  }
  console.log("[build] public ok");
}

function writeEntry() {
  const js = `export const version = "1.0.0";
export const sprite = "/vessert-sprite.svg";
export const css = "/internal.min.css";
export function icon(id, cls = "vessert-icon") {
  return '<svg class="' + cls + '" aria-hidden="true"><use href="' + sprite + "#" + id + '"></use></svg>';
}
export default { version, sprite, css, icon };
`;
  const cjs = `"use strict";
const version = "1.0.0";
const sprite = "/vessert-sprite.svg";
const css = "/internal.min.css";
function icon(id, cls) {
  cls = cls || "vessert-icon";
  return '<svg class="' + cls + '" aria-hidden="true"><use href="' + sprite + "#" + id + '"></use></svg>';
}
module.exports = { version, sprite, css, icon };
module.exports.default = module.exports;
`;
  fs.writeFileSync(path.join(DIST, "internal.js"), js, "utf8");
  fs.writeFileSync(path.join(DIST, "internal.cjs"), cjs, "utf8");
  console.log("[build] entry ok");
}

function hashFile(f) {
  return crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex").slice(0, 10);
}

function hashDist() {
  const manifest = { generatedAt: new Date().toISOString(), files: {} };
  const EXTS = [
    ".css", ".js", ".cjs", ".mjs",
    ".svg", ".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif",
    ".bmp", ".ico", ".ppm", ".pgm",
    ".woff", ".woff2", ".ttf", ".otf", ".eot",
    ".mp4", ".webm", ".ogg", ".mp3", ".wav",
    ".json", ".webmanifest", ".xml", ".txt", ".pdf"
  ];
  const files = walk(DIST, "").filter((f) => EXTS.includes(path.extname(f).toLowerCase()));
  for (const f of files) {
    if (f.endsWith("vessert-manifest.json")) continue;
    const h = hashFile(f);
    const ext = path.extname(f);
    const base = path.basename(f, ext);
    const dir = path.dirname(f);
    const hashed = path.join(dir, `${base}.${h}${ext}`);
    fs.copyFileSync(f, hashed);
    const rel = path.relative(DIST, f).replace(/\\/g, "/");
    const relH = path.relative(DIST, hashed).replace(/\\/g, "/");
    manifest.files[rel] = relH;
  }
  fs.writeFileSync(
    path.join(DIST, "vessert-manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
  console.log("[build] hash ok " + files.length + " files");
}

function main() {
  if (fs.existsSync(DIST)) fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);
  ensureDir(ASSETS_RASTER);
  generateRasterAssets();
  buildCss();
  buildSprite();
  copyAllAssets();
  copyPublic();
  writeEntry();
  hashDist();
  console.log("[build] complete");
}

main();
