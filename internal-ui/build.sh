#!/usr/bin/env bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
DIST="$ROOT/dist"
CSS_DIR="$ROOT/css"
SVG_DIR="$ROOT/svg"

rm -rf "$DIST"
mkdir -p "$DIST"

echo "[build] css"
: > "$DIST/internal.css"
for f in "$CSS_DIR"/*.css; do
  echo "/* === $(basename "$f") === */" >> "$DIST/internal.css"
  cat "$f" >> "$DIST/internal.css"
  echo "" >> "$DIST/internal.css"
done

sed -e 's:/\*[^*]*\*\+\([^/*][^*]*\*\+\)*/::g' \
    -e 's/[[:space:]]\+/ /g' \
    -e 's/[[:space:]]*\([{}:;,>]\)[[:space:]]*/\1/g' \
    -e 's/;}/}/g' \
    "$DIST/internal.css" | tr -d '\n' > "$DIST/internal.min.css"

echo "[build] sprite"
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">'
  for f in "$SVG_DIR"/icons/*.svg "$SVG_DIR"/brand/*.svg "$SVG_DIR"/illus/*.svg; do
    [ -f "$f" ] || continue
    id="$(basename "$f" .svg)"
    viewBox="$(grep -o 'viewBox="[^"]*"' "$f" | head -1 | sed 's/viewBox="//; s/"//')"
    fill="$(grep -o ' fill="[^"]*"' "$f" | head -1 | sed 's/ fill="//; s/"//')"
    stroke="$(grep -o ' stroke="[^"]*"' "$f" | head -1 | sed 's/ stroke="//; s/"//')"
    sw="$(grep -o ' stroke-width="[^"]*"' "$f" | head -1 | sed 's/ stroke-width="//; s/"//')"
    inner="$(sed -e 's/<svg[^>]*>//' -e 's:</svg>::' "$f" | tr -d '\n')"
    printf '<symbol id="%s" viewBox="%s"' "$id" "$viewBox"
    [ -n "$fill" ] && printf ' fill="%s"' "$fill"
    [ -n "$stroke" ] && printf ' stroke="%s"' "$stroke"
    [ -n "$sw" ] && printf ' stroke-width="%s"' "$sw"
    printf '>%s</symbol>\n' "$inner"
  done
  echo '</svg>'
} > "$DIST/vessert-sprite.svg"

sed -e 's/>[[:space:]]*</></g' -e 's/[[:space:]]\{2,\}/ /g' \
  "$DIST/vessert-sprite.svg" > "$DIST/vessert-sprite.min.svg"

echo "[build] assets"
[ -d "$ROOT/assets" ] && cp -R "$ROOT/assets" "$DIST/assets"
[ -d "$ROOT/public" ] && cp -R "$ROOT/public"/. "$DIST/"

echo "[build] done"
