# VessertID API Reference

Welcome to the **VessertID** developer API documentation.

## Core Modules

### `VessertID`
The core namespace providing metadata and environment configuration.

```javascript
import { VessertID } from 'vessertid';

console.log(VessertID.info());
// { name: 'vessertid', version: '1.0.0', mode: 'zero-external', fonts: 25, icons: 48 }
```

### `Color`
Zero-dependency color representation and hex/rgba conversions.

```javascript
import { Color } from 'vessertid';

const brandColor = Color.fromHex('#2563eb');
console.log(brandColor.toRgba()); // rgba(37, 99, 235, 1)
```

### `Typography`
Typography scale definitions and font families.

```javascript
import { Typography } from 'vessertid';

console.log(Typography.scale.base); // 1rem
```

### `IconRegistry`
Utility for programmatically generating SVG sprite `<use>` references.

```javascript
import { IconRegistry } from 'vessertid';

const markup = IconRegistry.renderSvg('star-solid');
```

### `FontRegistry`
Utility to generate runtime `@font-face` rules for any of the 25 embedded font families across 6 formats.

```javascript
import { FontRegistry } from 'vessertid';

const cssRule = FontRegistry.generateFontFace('VessertID-inter', 'woff2');
```
