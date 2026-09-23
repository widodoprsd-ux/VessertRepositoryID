/**
 * VessertID Entry Point (ES Module)
 * Core runtime and design system module
 */

import { VessertID } from './core/VessertID.js';
import { Color } from './core/Color.js';
import { Typography } from './core/Typography.js';
import { IconRegistry } from './icons/IconRegistry.js';
import { FontRegistry } from './fonts/FontRegistry.js';

const VERSION = '1.0.0';

export {
  VERSION,
  VessertID,
  Color,
  Typography,
  IconRegistry,
  FontRegistry
};
