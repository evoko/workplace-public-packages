/**
 * One `set` entry of an overlay file added, replaced or deleted, by splicing the file's text: the
 * entry's own lines change and nothing else, so every comment, every other rule and every folded
 * reason stays byte for byte. The yaml document finds the ranges and renders the one entry; it
 * never re-prints the file, which would re-fold every reason.
 */

import { Document, isMap, isScalar, parse, parseDocument } from 'yaml';

/** The files' width, as Prettier keeps them. */
const WIDTH = 100;

/** The entry at `key` as data, or null. */
export function readSetEntry(text, key) {
  return parse(text || '')?.set?.[key] ?? null;
}

/** The start of the line `offset` is on. */
export const lineStart = (text, offset) =>
  offset === 0 ? 0 : text.lastIndexOf('\n', offset - 1) + 1;

/** Just past the end of the line `offset` is on (its newline included). */
export const lineEnd = (text, offset) => {
  const i = text.indexOf('\n', offset);
  return i === -1 ? text.length : i + 1;
};

/** The start of the line before the one starting at `at`, or -1 at the top. */
const previousLine = (text, at) =>
  at === 0 ? -1 : text.lastIndexOf('\n', at - 2) + 1;

/** A pair's key as data. */
export const keyOf = (pair) => (isScalar(pair.key) ? pair.key.value : pair.key);

/**
 * Just past a pair's last line: the end of its value, never the blank lines after it (a block
 * scalar that keeps its trailing newlines would reach into them).
 */
export function pairEnd(text, pair) {
  const node =
    pair.value && pair.value.range[1] > pair.value.range[0]
      ? pair.value
      : pair.key;
  let to = lineEnd(text, Math.max(node.range[1] - 1, node.range[0]));
  while (to > 0 && /\n[ \t]*\n$/.test(text.slice(0, to)))
    to = text.lastIndexOf('\n', to - 2) + 1;
  return to;
}

/**
 * Where a pair's lines begin, for a deletion: its key line, or the comment written directly above
 * it at its indent, which says something about this pair and would be left describing its
 * neighbour. Never above `floor` (a header written against the first key is not that key's).
 */
export function pairStart(text, pair, floor = 0) {
  let from = lineStart(text, pair.key.range[0]);
  const indent = text.slice(from, pair.key.range[0]);
  for (
    let p = previousLine(text, from);
    p >= floor;
    p = previousLine(text, p)
  ) {
    if (!text.slice(p, lineEnd(text, p)).startsWith(`${indent}#`)) break;
    from = p;
  }
  return from;
}

/**
 * Just past the comments written right after a pair, indented deeper than its key: its own notes,
 * which go with it when it is deleted (the yaml ranges leave them out of the pair).
 */
function notesEnd(text, pair, to) {
  const indent = text.slice(
    lineStart(text, pair.key.range[0]),
    pair.key.range[0],
  );
  const note = new RegExp(`^${indent}[ \\t]+#`);
  while (to < text.length && note.test(text.slice(to, lineEnd(text, to))))
    to = lineEnd(text, to);
  return to;
}

/**
 * The entry as the files write one: two spaces in, its reason folded where it is long. Read back
 * before it is returned: a reason the yaml would not give back exactly is refused.
 */
function render(key, value, reason) {
  const doc = new Document({ [key]: { ...value, reason } });
  const r = doc.getIn([key, 'reason'], true);
  if (isScalar(r) && `    reason: ${reason}`.length > WIDTH)
    r.type = 'BLOCK_FOLDED';
  const out = doc.toString({
    lineWidth: WIDTH - 2,
    indent: 2,
    singleQuote: true,
  });
  if (parse(out)?.[key]?.reason !== reason)
    throw new Error(`set ${key}: its reason would not read back as written.`);
  return out
    .trimEnd()
    .split('\n')
    .map((line) => (line ? `  ${line}` : line))
    .join('\n')
    .concat('\n');
}

/**
 * The text joined at `at` (a line start) where lines were cut out, blank lines as Prettier keeps
 * them: none at the top, the end or the start of a section (`first`), and never two in a row.
 */
export function tidyJoin(text, at, first = false) {
  const before = text.slice(0, at);
  const after = text.slice(at);
  const trimmed = after.replace(/^(?:[ \t]*\n)+/, '');
  if (!before.trim()) return trimmed;
  if (!after.trim()) return before.replace(/(?:\n[ \t]*)+$/, '\n');
  return first || /(?:^|\n)[ \t]*\n$/.test(before)
    ? before + trimmed
    : before + after;
}

/**
 * The rules that borrow the reason of the set entry at `key` (`reason: { as: set <key> }`, quoted
 * or not), as `<section> <address>` (`set attendee.base.height`): replacing the entry changes
 * their reason too, and deleting it would leave them naming no rule. Read from the parsed file, as
 * the overlay reader resolves them, so a comment that mentions one is not one.
 * @param {string} text the overlay file
 * @param {string} key the set key
 * @returns {string[]}
 */
export function borrowersOf(text, key) {
  const data = parse(text || '') ?? {};
  const out = [];
  for (const [section, rules] of Object.entries(data))
    if (rules && typeof rules === 'object')
      for (const [address, rule] of Object.entries(rules))
        if (rule?.reason?.as === `set ${key}`)
          out.push(`${section} ${address}`);
  return out;
}

/**
 * @param {string} text the overlay file ('' where there is none)
 * @param {string} key the set key (`root.base.width`)
 * @param {object | null} value `{ token }`, `{ keyword }`, `{ none: true }`, or null to delete
 * @param {string} [reason] required unless deleting; trimmed
 * @returns {string} the new text
 */
export function writeSetEntry(text, key, value, reason) {
  let source = text ?? '';
  if (source && !source.endsWith('\n')) source += '\n';
  const why = typeof reason === 'string' ? reason.trim() : '';
  if (value !== null && !why) throw new Error('A set rule needs a reason.');
  const doc = parseDocument(source);
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  const setPair = isMap(doc.contents)
    ? doc.contents.items.find((p) => keyOf(p) === 'set')
    : undefined;
  const set = setPair?.value;
  if (isMap(set) && set.flow && set.items.length)
    throw new Error(
      'The overlay writes set as a flow map; write it as a block.',
    );
  const pair = isMap(set) ? set.items.find((p) => keyOf(p) === key) : undefined;

  if (value === null) {
    if (!pair) return source;
    const borrowers = borrowersOf(source, key);
    if (borrowers.length)
      throw new Error(
        `set ${key}: another rule borrows its reason (reason: { as: set ${key} }); change that rule first: ${borrowers.join('; ')}`,
      );
    // An empty section says nothing: `set:` goes with its last entry.
    const from =
      set.items.length > 1
        ? pairStart(source, pair)
        : lineStart(source, setPair.key.range[0]);
    return tidyJoin(
      source.slice(0, from) +
        source.slice(notesEnd(source, pair, pairEnd(source, pair))),
      from,
      set.items.length > 1 && pair === set.items[0],
    );
  }

  const entry = render(key, value, why);
  if (pair) {
    const from = lineStart(source, pair.key.range[0]);
    return source.slice(0, from) + entry + source.slice(pairEnd(source, pair));
  }
  if (isMap(set) && set.items.length) {
    const at = pairEnd(source, set.items.at(-1));
    return source.slice(0, at) + entry + source.slice(at);
  }
  if (setPair) {
    // `set:` is there with nothing under it (`set:` or `set: {}`): its line becomes the section.
    const from = lineStart(source, setPair.key.range[0]);
    const to = pairEnd(source, setPair);
    return `${source.slice(0, from)}set:\n${entry}${source.slice(to)}`;
  }
  const base = source.trimEnd();
  return `${base}${base ? '\n\n' : ''}set:\n${entry}`;
}
