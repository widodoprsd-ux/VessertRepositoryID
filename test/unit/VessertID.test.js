/**
 * VessertID Core Unit Tests
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { VessertID, Color, Typography, IconRegistry, FontRegistry } from '../../src/VessertID.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running VessertID Unit Tests ---');

// Test 1: VessertID Info
const info = VessertID.info();
assert(info.version === '1.0.0', 'Version should match 1.0.0');
assert(info.mode === 'zero-external', 'Mode should be zero-external');
console.log('✓ VessertID metadata verified');

// Test 2: Color Class
const red = Color.fromHex('#ff0000');
assert(red.r === 255 && red.g === 0 && red.b === 0, 'Hex parsing #ff0000 should equal rgb(255,0,0)');
assert(red.toHex() === '#ff0000', 'toHex should produce #ff0000');
console.log('✓ Color class verified');

// Test 3: Typography Scale
assert(Typography.scale.base === '1rem', 'Base typography should be 1rem');
assert(Typography.families.length >= 7, 'Families should include primary fonts');
console.log('✓ Typography scale verified');

// Test 4: Icon Registry
const iconMarkup = IconRegistry.renderSvg('heart-line');
assert(iconMarkup.includes('vessert-icon-heart-line'), 'Icon rendering should include prefix');
console.log('✓ IconRegistry verified');

// Test 5: Font Registry
const fontFace = FontRegistry.generateFontFace('VessertID-inter', 'woff2');
assert(fontFace.includes('@font-face'), 'FontFace should generate CSS rule');
const typefaceUrl = FontRegistry.getTypefaceUrl('VessertID-inter');
assert(typefaceUrl.endsWith('.typeface.json'), 'getTypefaceUrl should produce .typeface.json path');
console.log('✓ FontRegistry verified');

// Test 6: Three.js Typeface JSON Specification
const sampleTypefacePath = path.resolve(__dirname, '../../src/fonts/typeface/VessertID-inter.typeface.json');
assert(fs.existsSync(sampleTypefacePath), 'VessertID-inter.typeface.json must exist');
const sampleJson = JSON.parse(fs.readFileSync(sampleTypefacePath, 'utf8'));
assert(sampleJson.schemaVersion === 1, 'Typeface JSON must have schemaVersion 1');
assert(sampleJson.familyName === 'VessertID-Inter', 'Typeface JSON familyName matches');
assert(sampleJson.glyphs && sampleJson.glyphs['A'], 'Typeface JSON contains glyph for character A');
assert(typeof sampleJson.glyphs['A'].o === 'string' && sampleJson.glyphs['A'].o.startsWith('m '), 'Glyph outline format complies with Three.js FontLoader bezier format');
console.log('✓ Three.js Typeface JSON specification compliance verified');

console.log('\nAll unit tests passed successfully!\n');
