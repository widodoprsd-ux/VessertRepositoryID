/**
 * VessertID Font Registry
 */

export class FontRegistry {
  static supportedFormats = ['woff2', 'woff', 'ttf', 'otf', 'eot', 'svg'];

  static getFontUrl(family, format = 'woff2') {
    return `/assets/source/fonts/${family}.${format}`;
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
