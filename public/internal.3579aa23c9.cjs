"use strict";
const version = "1.0.0";
const sprite = "/vessert-sprite.svg";
const css = "/internal.min.css";
function icon(id, cls) {
  cls = cls || "vessert-icon";
  return '<svg class="' + cls + '" aria-hidden="true"><use href="' + sprite + "#" + id + '"></use></svg>';
}
module.exports = { version, sprite, css, icon };
module.exports.default = module.exports;
