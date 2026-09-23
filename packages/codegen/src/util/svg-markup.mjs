/**
 * The markup scanning shared by the vector reader and the logo JSX converter.
 *
 * Both are deliberately narrow readers of Figma's own SVG exports, not general XML parsers, and
 * both must agree on what a tag and an attribute are: a file one accepts and the other misreads
 * would ship as different artwork on two targets.
 */

const TAG_SOURCE = /<(\/?)([a-zA-Z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/
  .source;
const ATTR = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/**
 * A fresh global tag pattern: `[, closing, name, attrText]` per match. A new instance per caller,
 * because a shared global RegExp carries `lastIndex` between whoever used it last.
 */
export const tagPattern = () => new RegExp(TAG_SOURCE, 'g');

export function parseAttrs(text) {
  const attrs = {};
  for (const m of text.matchAll(ATTR)) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

export function fail(file, detail) {
  throw new Error(`${file}: ${detail}`);
}
