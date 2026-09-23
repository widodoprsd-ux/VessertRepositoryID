/**
 * VessertID Font Registry
 * Supports standard web font formats + Three.js Typeface JSON standard
 */

class FontRegistry {
  static supportedFormats = ['woff2', 'woff', 'ttf', 'otf', 'eot', 'svg', 'typeface.json'];

  static getFontUrl(family, format = 'woff2') {
    if (format === 'typeface.json' || format === 'typeface') {
      return `/assets/typeface/${family}.typeface.json`;
    }
    return `/assets/source/fonts/${family}.${format}`;
  }

  static getTypefaceUrl(family) {
    return `/assets/typeface/${family}.typeface.json`;
  }

  static generateFontFace(family, format = 'woff2', weight = 400, style = 'normal') {
    const url = this.getFontUrl(family, format);
    const formatString = format === 'eot' ? 'embedded-opentype' : format;
    return `@font-face {
  font-family: '${family}';
  src: url('${url}') format('${formatString}');
  font-weight: ${weight};
  font-style: ${style};
  font-display: swap;
}`;
  }
}

export { FontRegistry };
