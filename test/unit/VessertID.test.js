/**
 * VessertID Core Unit Tests
 */

import { VessertID, Color, Typography, IconRegistry, FontRegistry } from '../../src/VessertID.js';

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
console.log('✓ FontRegistry verified');

console.log('All unit tests passed successfully!\n');
