# VessertRepositoryID

> **Zero-External, Self-Contained Design & Asset System**  
> Pure Node.js built-ins. Zero npm runtime dependencies. Hand-crafted modular CSS, SVG Icon Sprites, Binary Raster Encoders (PNG, ICO, BMP), and 25 VessertID Font Families across 6 formats (WOFF2, WOFF, TTF, OTF, EOT, SVG).

GitHub Repository: [https://github.com/widodoprsd-ux/VessertRepositoryID](https://github.com/widodoprsd-ux/VessertRepositoryID)

---

## ⚡ jsDelivr CDN Integration

You can deliver any asset, CSS, SVG sprite, or font directly via **jsDelivr CDN** without installing any npm packages.

Base URL format:
```text
https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/{path}
```

### 1. CSS & Stylesheets

Include minified or unminified internal UI stylesheets:

```html
<!-- Minified Production CSS (32KB) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal.min.css">

<!-- Or from dist/ directory -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/internal.min.css">
```

### 2. SVG Sprite & Icons

Load the VessertID SVG icon sprite (48 hand-drawn symbols):

```html
<!-- Full Sprite -->
<svg style="display:none" aria-hidden="true">
  <use href="https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/vessert-sprite.svg#vessert-icon-home-line"></use>
</svg>

<!-- Direct Symbol Embed via SVG Image tag -->
<img src="https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/svg/brand/vessert-logo-mark.svg" alt="VessertID Logo" width="48" height="48">
<img src="https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/svg/brand/vessert-wordmark.svg" alt="VessertID Wordmark" height="32">
```

### 3. VessertID Font Collection (25 Families &times; 6 Formats)

All font binaries are accessible directly across `woff2`, `woff`, `ttf`, `otf`, `eot`, and `svg`.

#### Example: Inter (`VessertID-inter`)
```css
@font-face {
  font-family: 'VessertID-Inter';
  src: url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-inter.woff2') format('woff2'),
       url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-inter.woff') format('woff'),
       url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-inter.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

#### Example: JetBrains Mono (`VessertID-jetbrains-mono`)
```css
@font-face {
  font-family: 'VessertID-JetBrainsMono';
  src: url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-jetbrains-mono.woff2') format('woff2'),
       url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-jetbrains-mono.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

#### Example: Times New Roman (`VessertID-times-new-roman`)
```css
@font-face {
  font-family: 'VessertID-TimesNewRoman';
  src: url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-times-new-roman.woff2') format('woff2'),
       url('https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-times-new-roman.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 4. JavaScript Modules (ESM & CJS)

```html
<!-- ESM Module -->
<script type="module">
  import { icon, version } from "https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/internal.js";
  console.log("Internal UI Version:", version);
</script>
```

---

## 📦 Directory Reference for jsDelivr

| Resource | jsDelivr URL |
| :--- | :--- |
| **Stylesheet (Min)** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal.min.css` |
| **SVG Sprite** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/vessert-sprite.svg` |
| **Logo Mark** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/svg/brand/vessert-logo-mark.svg` |
| **Wordmark** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/svg/brand/vessert-wordmark.svg` |
| **Favicon ICO** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/raster/favicon.ico` |
| **Font Inter (.woff2)** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/assets/source/fonts/VessertID-inter.woff2` |
| **Manifest** | `https://cdn.jsdelivr.net/gh/widodoprsd-ux/VessertRepositoryID@main/internal-ui/dist/vessert-manifest.json` |

---

## 🛠 Local Development & Testing

VessertRepositoryID provides a dedicated standalone HTTP server and test suite with **zero external dependencies**:

### 1. Run Local HTTP Server (Port 8080)
```bash
# Start standalone HTTP server on port 8080 (accessible from Localhost and HP via Wi-Fi IP)
npm run server
# or directly:
node utils/server.js -p 8080
```
When running, the server outputs:
```text
  Local          : http://localhost:8080/
  Network (HP)   : http://192.168.x.x:8080/
```

### 2. Automated Visual & E2E Testing with Puppeteer
```bash
# Run headless browser test suite
npm run test-e2e

# Capture full-page screenshot
npm run make-screenshot
```

### 3. Code Quality & Linting (ESLint Flat Config)
```bash
# Lint JavaScript source and utilities
npm run lint

# Auto-fix linting issues
npm run lint-fix
```

### 4. Build Assets
```bash
# Generate font assets, raster binaries, CSS bundle, and SVG sprites
npm run build
```
