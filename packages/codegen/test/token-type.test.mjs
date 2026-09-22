import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
import { dtcgType } from '../src/normalize/token-type.mjs';

const contract = JSON.parse(
  readFileSync(join(repoRoot, 'docs/solar/tokens/css-contract.json'), 'utf8'),
);

describe('dtcgType', () => {
  it.each([
    ['Color', 'surface/background', 'color'],
    ['Primitives', 'color/neutral/50', 'color'],
    ['Primitives', 'type/font-family/inter', 'fontFamily'],
    ['Primitives', 'type/font-weight/100', 'fontWeight'],
    ['Primitives', 'type/font-size/14', 'dimension'],
    ['Primitives', 'spatial/scale/4', 'dimension'],
    ['Primitives', 'viewport/md', 'dimension'],
    ['Primitives', 'motion/duration/fast', 'duration'],
    ['Primitives', 'motion/ease/in', 'cubicBezier'],
    ['Spatial', 'inset/md', 'dimension'],
    ['Type', 'size/body/md', 'dimension'],
    ['Layout', 'grid/columns/lg', 'number'],
    ['Layout', 'grid/gutter/md', 'dimension'],
    ['Layout', 'breakpoint/md', 'dimension'],
  ])('classifies %s %s as %s', (collection, figma, expected) => {
    expect(dtcgType({ collection, figma })).toBe(expected);
  });

  it('classifies every token in the contract without falling through', () => {
    for (const v of contract.variables) {
      expect(() => dtcgType(v), `${v.collection} ${v.figma}`).not.toThrow();
    }
  });
});
