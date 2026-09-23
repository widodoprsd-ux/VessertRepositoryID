/**
 * VessertID Icon Registry Helper
 */

export class IconRegistry {
  static prefix = 'vessert-icon-';

  static getSymbolId(name) {
    if (name.startsWith(this.prefix)) {
      return name;
    }
    return `${this.prefix}${name}`;
  }

  static renderSvg(name, className = 'vessert-icon') {
    const symbolId = this.getSymbolId(name);
    return `<svg class="${className}"><use href="/vessert-sprite.svg#${symbolId}"></use></svg>`;
  }
}
