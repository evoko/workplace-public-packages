/**
 * A source file as its code alone: comments and layout gone, so rewording a comment or
 * reformatting a line gives the same text, and any change to the code a different one. What a
 * component's fingerprint hashes, file by file (./fingerprint.mjs).
 */

import ts from 'typescript';

const WORD = /[A-Za-z0-9_$]/;

/**
 * JSX text as React reads it (Babel's rule, which TypeScript's JSX emit follows): each line loses
 * its leading whitespace unless it is the first and its trailing whitespace unless it is the last,
 * a tab counting as a space; the lines left empty go; the rest join with one space. Spaces within
 * a line stay, as React renders them.
 */
function jsxText(text) {
  const lines = text.replace(/\t/g, ' ').split(/\r\n|\n|\r/);
  return lines
    .map((line, i) => {
      let kept = line;
      if (i > 0) kept = kept.replace(/^ +/, '');
      if (i < lines.length - 1) kept = kept.replace(/ +$/, '');
      return kept;
    })
    .filter(Boolean)
    .join(' ');
}

/**
 * A TypeScript or TSX file's tokens, one per line, read off its syntax tree: comments are trivia
 * there, never tokens, and a string, a template or a regular expression is one token, whole. JSX
 * text is read as React reads it (`jsxText`).
 */
export function tsCanon(text, fileName) {
  const file = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    false,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const out = [];
  const visit = (node) => {
    // A doc comment is a node of the tree, but still a comment.
    if (
      node.kind >= ts.SyntaxKind.FirstJSDocNode &&
      node.kind <= ts.SyntaxKind.LastJSDocNode
    )
      return;
    const kids = node.getChildren(file);
    if (kids.length) {
      for (const kid of kids) visit(kid);
      return;
    }
    // getText() starts a JSX text past its leading whitespace, which React may keep: read its
    // whole span.
    const token =
      node.kind === ts.SyntaxKind.JsxText
        ? jsxText(file.text.slice(node.pos, node.end))
        : node.getText(file);
    if (token) out.push(token);
  };
  visit(file);
  return out.join('\n');
}

const isRawStart = (t, i) =>
  (t[i] === 'r' || t[i] === 'R') &&
  (t[i + 1] === "'" || t[i + 1] === '"') &&
  !WORD.test(t[i - 1] ?? '');

/** The index just past a block comment starting at `i`; Dart's nest. */
function blockCommentEnd(t, i) {
  let depth = 0;
  do {
    if (t.startsWith('/*', i)) {
      depth++;
      i += 2;
    } else if (t.startsWith('*/', i)) {
      depth--;
      i += 2;
    } else i++;
  } while (depth > 0 && i < t.length);
  return i;
}

/** The index just past the `}` that closes an interpolation whose code starts at `i`. */
function interpolationEnd(t, i) {
  let depth = 1;
  while (i < t.length) {
    const c = t[i];
    if (c === "'" || c === '"' || isRawStart(t, i)) i = stringEnd(t, i);
    else if (t.startsWith('//', i)) while (i < t.length && t[i] !== '\n') i++;
    else if (t.startsWith('/*', i)) i = blockCommentEnd(t, i);
    else {
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return i + 1;
      i++;
    }
  }
  return i;
}

/** The index just past a Dart string starting at `i`: raw or not, single or triple quoted. */
function stringEnd(t, i) {
  const raw = t[i] === 'r' || t[i] === 'R';
  if (raw) i++;
  const quote = t[i];
  const close = t.startsWith(quote.repeat(3), i) ? quote.repeat(3) : quote;
  i += close.length;
  while (i < t.length) {
    if (!raw && t[i] === '\\') i += 2;
    else if (t.startsWith(close, i)) return i + close.length;
    else if (!raw && t[i] === '$' && t[i + 1] === '{')
      i = interpolationEnd(t, i + 2);
    // An unterminated single-line string ends with its line, as the Dart parser reads it.
    else if (close.length === 1 && t[i] === '\n') return i;
    else i++;
  }
  return i;
}

/** Two characters that read as another token when they touch: two words, `- -`, `+ +`. */
const fuse = (a, b) =>
  (WORD.test(a) && WORD.test(b)) || (a === b && (a === '-' || a === '+'));

/**
 * A Dart file with its comments dropped (line comments, doc comments, nested block comments) and
 * its layout reduced to one space where two tokens would otherwise run together: two words, or
 * two minuses or pluses (`a - --b` is not `a-- - b`). Strings are kept whole, their
 * interpolations and the strings inside those too.
 */
export function dartCanon(t) {
  const out = [];
  let space = false;
  const emit = (s) => {
    if (space && out.length && fuse(out.at(-1).at(-1), s[0])) out.push(' ');
    space = false;
    out.push(s);
  };
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (/\s/.test(c)) {
      space = true;
      i++;
    } else if (t.startsWith('//', i)) {
      while (i < t.length && t[i] !== '\n') i++;
      space = true;
    } else if (t.startsWith('/*', i)) {
      i = blockCommentEnd(t, i);
      space = true;
    } else if (c === "'" || c === '"' || isRawStart(t, i)) {
      const end = stringEnd(t, i);
      emit(t.slice(i, end));
      i = end;
    } else {
      emit(c);
      i++;
    }
  }
  return out.join('');
}
