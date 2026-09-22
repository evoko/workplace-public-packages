import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { specDir } from './util/paths.mjs';

export const EXT = 'com.biamp.solar';

export function readSpec() {
  return JSON.parse(readFileSync(join(specDir, 'tokens.json'), 'utf8'));
}

/** Depth-first list of every token leaf, as {name, type, value, modes, ext}. */
export function flattenSpec(spec) {
  const out = [];
  const walk = (node, path) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      const name = path ? `${path}.${key}` : key;
      if (child && typeof child === 'object') {
        // A handful of Figma doc names (e.g. color.border.inverse) are both a value in
        // their own right AND the namespace root for finer variants (…inverse.subtle).
        // Such a node carries $value alongside further, non-$ child keys, so it is
        // pushed as a leaf here and still walked below for those children.
        if ('$value' in child) {
          const ext = child.$extensions?.[EXT] ?? {};
          out.push({
            name,
            type: child.$type,
            value: child.$value,
            modes: ext.modes ?? null,
            ext,
          });
        }
        walk(child, name);
      }
    }
  };
  walk(spec, '');
  return out;
}
