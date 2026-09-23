# VessertID Naming Convention

Every internal SVG carries a VessertID. The VessertID replaces any
external id, class, color, or namespace.

## Format

    vessert-<family>-<name>-<variant>

## Fields

- family: icon | logo | illus | brand | pictogram
- name: kebab-case, descriptive
- variant: line | solid | duotone | brand | mono

## Rules

1. Never keep vendor id.
2. Never keep vendor class.
3. Never keep vendor color.
4. Always use currentColor for stroke and fill where possible.
5. Always use viewBox="0 0 24 24" for icons unless shape requires otherwise.
6. Always remove width and height attributes from root svg.
7. Always add focusable="false" and aria-hidden="true" for decorative icons.
8. Every VessertID must pass build.js validation.
9. Build fails on any forbidden vendor marker.
10. Line variant uses fill="none", stroke="currentColor", stroke-width="1.75", rounded caps and joins.

## Forbidden markers

    lucide
    heroicon
    tabler
    fontawesome
    feather
    material-symbol
    data-icon
    class="
    id="icon
    id="svg

## Examples

    vessert-icon-menu-line
    vessert-icon-menu-solid
    vessert-icon-user-line
    vessert-logo-mark
    vessert-illus-empty-state
    vessert-brand-wordmark
