# Changelog

## 1.0.0 - 2026-01-01

### Added
- Zero-external build via node build.js
- Hand-written CSS in css/
- Hand-drawn SVG icons, brand marks, illustrations
- Custom PNG encoder using zlib and manual chunk writing
- Custom ICO encoder wrapping multiple PNG sizes
- Custom BMP encoder with 24-bit BGR rows
- Raster generation: favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png, placeholder.png, placeholder.bmp
- VessertID naming enforcement at build time
- Sprite generation with VessertID symbols only
- Entry JS and CJS in dist/
- Hash manifest with content hashes across all formats
- Static server via node serve.js
- Shell build via build.sh

### Removed
- All npm dependencies
- All vendor clones
- All external SVG sources
- Tailwind, PostCSS, SVGO, Sharp
- All font downloads
