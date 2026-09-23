export const version = "1.0.0";
export const sprite = "/vessert-sprite.svg";
export const css = "/internal.min.css";
export function icon(id, cls = "vessert-icon") {
  return '<svg class="' + cls + '" aria-hidden="true"><use href="' + sprite + "#" + id + '"></use></svg>';
}
export default { version, sprite, css, icon };
