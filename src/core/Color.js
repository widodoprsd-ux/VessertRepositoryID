/**
 * VessertID Color Model & Tokens
 */

class Color {
  constructor(r = 0, g = 0, b = 0, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static fromHex(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return new Color((num >> 16) & 255, (num >> 8) & 255, num & 255);
  }

  toRgba() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }

  toHex() {
    const toHexVal = (n) => n.toString(16).padStart(2, '0');
    return `#${toHexVal(this.r)}${toHexVal(this.g)}${toHexVal(this.b)}`;
  }
}

export { Color };
