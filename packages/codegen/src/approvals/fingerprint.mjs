/**
 * A component's fingerprint on one platform: a SHA-256 of every file it ships, each read as its
 * code alone (./lex.mjs), and on the web of the value, in every mode, of every token those files
 * name, since a recipe names a token and tokens.css holds its value, and of tokens.css's other
 * declarations (the reduced-motion rule), which reach every component. Flutter's files include
 * tokens.dart itself. An approval holds while the fingerprint does (./status.mjs).
 */

import { join } from 'node:path';
import { sha256 } from '../util/digest.mjs';
import { packagesDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { rel } from './graph.mjs';
import { dartCanon, tsCanon } from './lex.mjs';

export const tokensCss = rel(
  join(packagesDir, 'styles', 'src', 'generated', 'css', 'tokens.css'),
);

/** The key under which tokens.css's declarations that are not tokens sit, all together. */
export const OTHER_RULES = '*';

/**
 * Every declaration in tokens.css: a `--solar-*` property to its `<blocks>=<value>` lines, the
 * blocks being the selectors and media queries it sits in (`:root`, `[data-theme='dark']`…), and
 * every other declaration (the reduced-motion rule) under `OTHER_RULES` as
 * `<blocks>=<property>: <value>`. Read statement by statement, not line by line: Prettier wraps a
 * long value (a shadow, a font stack, an rgba()) onto the lines after its property. Layout inside
 * a value is collapsed, so rewrapping one changes nothing.
 */
export function tokenValues(css) {
  const values = new Map();
  const blocks = [];
  const add = (key, line) =>
    values.set(key, [...(values.get(key) ?? []), line]);
  const statements = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .matchAll(/([^{};]*)([{};])/g);
  for (const [, raw, end] of statements) {
    const text = raw
      .replace(/\s+/g, ' ')
      .replace(/\( /g, '(')
      .replace(/ \)/g, ')')
      .trim();
    if (end === '{') {
      blocks.push(text);
      continue;
    }
    const m = /^([^:]+?) ?: ?(.*)$/.exec(text);
    if (m && /^--solar-[a-z0-9-]+$/.test(m[1]))
      add(m[1], `${blocks.join(' ')}=${m[2]}`);
    else if (text)
      add(OTHER_RULES, `${blocks.join(' ')}=${m ? `${m[1]}: ${m[2]}` : text}`);
    if (end === '}') blocks.pop();
  }
  return values;
}

/** One file as its code alone. */
export const canonOf = (path, text) =>
  path.endsWith('.dart') ? dartCanon(text) : tsCanon(text, path);

/**
 * The tokens a file's code names, read from its code alone so a comment naming one counts for
 * nothing. A name a template completes (`var(--solar-icon-${size})`) is read as `--solar-icon-`,
 * a prefix: it names every token that starts with it.
 */
const TOKEN = /--solar-[a-z0-9-]+/g;

/**
 * The fingerprint of a component that ships `files` (repository paths, sorted). `read` gives a
 * file's text, `tokens` the web's token values (`tokenValues`), `cache` a per-scan cache of each
 * file's hash and the tokens it names. On the web it always covers `OTHER_RULES` too.
 */
export function fingerprint(
  platform,
  files,
  { read, tokens, cache = new Map() },
) {
  const scan = (f) => {
    if (!cache.has(f)) {
      const canon = canonOf(f, read(f));
      cache.set(f, {
        hash: sha256(canon),
        names: [...new Set(canon.match(TOKEN) ?? [])],
      });
    }
    return cache.get(f);
  };
  const lines = files.map((f) => `${f} ${scan(f).hash}`);
  if (platform === 'web') {
    const named = new Set();
    for (const f of files)
      for (const name of scan(f).names)
        if (name.endsWith('-')) {
          for (const token of tokens.keys())
            if (token.startsWith(name)) named.add(token);
        } else named.add(name);
    for (const name of [...named, OTHER_RULES].sort(byCodeUnit))
      for (const value of tokens.get(name) ?? [])
        lines.push(`${name} ${value}`);
  }
  return `sha256:${sha256(lines.join('\n'))}`;
}
