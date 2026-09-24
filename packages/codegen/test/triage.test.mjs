/**
 * The planning survey (`npm run solar:triage`): what it reports about the corpus, and how it
 * counts findings. Its numbers move with Figma, so these pin its shape and a few facts the plan
 * leans on, not the totals.
 */

import { describe, expect, it } from 'vitest';
import { loadWebCatalog } from '../src/normalize/components.mjs';
import { loadDefaults, loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { COMPONENTS } from '../src/stages/components.mjs';
import {
  classify,
  levels,
  renderTriage,
  triage,
} from '../src/report/triage.mjs';

const catalog = loadWebCatalog();
const rows = triage(catalog, {
  names: tokenNames(loadContract()),
  done: new Set(COMPONENTS),
  defaults: loadDefaults(),
  overlayOf: loadOverlay,
});
const row = (name) => rows.find((r) => r.name === name);

describe('the triage of SOLAR Web', () => {
  it('surveys the components section, sets and standalone ones, marking the generated ones', () => {
    expect(rows.every((r) => r.section.startsWith('components/'))).toBe(true);
    expect(rows.filter((r) => r.kind === 'set')).toHaveLength(119);
    expect(
      rows
        .filter((r) => r.done)
        .map((r) => r.name)
        .sort(),
    ).toEqual([...COMPONENTS].sort());
  });

  it('builds every component, sets and standalone ones, since milestone 4’s Task M5', () => {
    expect(rows.filter((r) => !r.builds)).toEqual([]);
  });

  it('reports why a component does not build', () => {
    // Without its overlay, PIN Input's caret, a layer named `|`, has no name.
    const [pin] = triage(
      {
        ...catalog,
        components: catalog.components.filter((c) => c.name === 'PIN Input'),
      },
      { names: tokenNames(loadContract()), done: new Set() },
    );
    expect(pin.builds).toBe(false);
    expect(pin.error).toContain('no letter or digit to name it by');
  });

  it('counts what the defaults and a built component’s overlay decide apart', () => {
    expect(row('Button').findings.decided).toBeGreaterThan(0);
    expect(row('Icon Button').findings.axis ?? 0).toBe(0);
  });

  it('knows what each composes, and orders the levels by it', () => {
    expect(row('Button Group').composes).toEqual(['Button']);
    expect(row('Button').level).toBe(1);
    expect(row('Button Group').level).toBe(2);
    // Icons are instances too, but not components of the catalog.
    expect(row('Card').composes).toEqual(['Tag']);
    // A shared name resolves to the composer's own section: the date picker's Day Cell.
    expect(row('Date Picker Open').composes).toEqual(['inputs/Day Cell']);
    expect(row('calendar/Day Cell').composes).toEqual(['Event Chip']);
  });

  it('describes what a set is made of', () => {
    expect(row('Checkbox').features).toContain('glyph');
    expect(row('Tabs').features).toContain('sides');
    // Without its overlay too: since milestone 4's Task M2 a border one variant has per side is
    // read per side in every variant, not dropped.
    expect(row('Button Group').features).toContain('sides');
    expect(row('Card').slots).toMatchObject({ content: 1, component: 1 });
  });

  it('renders a row per component under the totals', () => {
    const md = renderTriage(rows, { fileVersion: catalog.fileVersion });
    expect(md).toContain(`\`${catalog.fileVersion}\``);
    expect(md.match(/^\| (?!Component|---)/gm)).toHaveLength(rows.length);
    expect(md).toContain('| **Button** (done) |');
  });
});

describe('counting findings', () => {
  it('tells a zero inset from a boundable value and a governance gap', () => {
    const unbound = (cell, figmaValue, suggest) => ({
      kind: 'unbound',
      cell,
      figmaValue,
      suggest,
    });
    expect(
      classify(unbound('gap', '0, bound to no variable', ['inset.none'])),
    ).toBe('zeroInset');
    expect(
      classify(unbound('width', '20, bound to no variable', ['icon.md'])),
    ).toBe('boundable');
    expect(classify(unbound('height', '36, bound to no variable', []))).toBe(
      'noToken',
    );
    expect(classify({ kind: 'axis' })).toBe('axis');
  });

  it('stops at a cycle instead of following it', () => {
    const [a, b] = levels([
      { name: 'A', composes: ['B'] },
      { name: 'B', composes: ['A'] },
    ]);
    expect(a.level).toBe(Infinity);
    expect(b.level).toBe(Infinity);
  });
});

describe('a component left out of the flow', () => {
  it('is no candidate, and the build refuses a descriptor for it', async () => {
    const { parseExcluded, loadExcluded } =
      await import('../src/normalize/overlay.mjs');
    expect(loadExcluded()).toHaveProperty('Cursor');
    expect(() => parseExcluded('Cursor: {}\n', 'x.yaml')).toThrow(
      /Cursor has no reason/,
    );
    const { loadWebCatalog } = await import('../src/normalize/components.mjs');
    const { tokenNames } = await import('../src/normalize/recipe.mjs');
    const { loadContract } = await import('../src/normalize/tokens.mjs');
    const { triage } = await import('../src/report/triage.mjs');
    const rows = triage(loadWebCatalog(), {
      names: tokenNames(loadContract()),
      done: new Set(),
      excluded: { Cursor: 'test' },
      scope: 'components/utility',
    });
    expect(rows.map((r) => r.name)).not.toContain('Cursor');
  });
});
