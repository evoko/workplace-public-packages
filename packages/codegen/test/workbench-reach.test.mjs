import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import { lookupCell, lookupOrder } from '../src/explain/index.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  loadDefaults,
  overlayDir,
  overlayFileOf,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import * as stage from '../src/stages/components.mjs';
import { inspect } from '../src/workbench/inspect.mjs';
import { winsOver } from '../src/workbench/reach.mjs';
import { scopesFor } from '../src/workbench/scopes.mjs';

let build;
let built;
const find = (n) => built.find((b) => b.spec.component === n);
const addressOf = (name) => stage.COMPONENTS[stage.NAMES.indexOf(name)];
const overlayTextOf = (name) =>
  readFileSync(join(overlayDir, overlayFileOf(addressOf(name))), 'utf8');
beforeAll(() => {
  build = stage.build();
  ({ built } = build);
});

/** Button's first variant whose root background sits above base, so a broader scope loses. */
const aboveBase = (b) =>
  b.oracle.variants.find(
    (v) => lookupCell(b.spec, 'root', 'background', v).at !== 'base',
  );

describe("a scope's reach", () => {
  // Each count here is the number of variants a real build of the set changes (the round trip
  // below builds these variants' sets and proves every count they offer).
  const countsOf = (name, index, layer, cell) =>
    inspect(build, name, index, { overlayText: '' })
      .layers.find((l) => l.name === layer)
      .cells.find((c) => c.cell === cell)
      .scopes.map((s) => s.count);

  it('counts, per cell, the variants a set would change, not those its key matches', () => {
    // Button md primary at rest: base holds its background for 9 of its 108 variants, the rest
    // drawn by narrower entries; a narrower scope is not always fewer (9, 3, 9, 3).
    expect(find('Button').oracle.variants).toHaveLength(108);
    expect(countsOf('Button', 0, 'root', 'background')).toEqual([9, 3, 9, 3]);
    // Text Input's field border: 4 of its variants read base.
    const t = find('Text Input');
    expect(t.oracle.variants.length).toBeGreaterThan(4);
    expect(countsOf('Text Input', 0, 'field', 'borderColor')[0]).toBe(4);
  });

  it('counts only the variants that draw the layer', () => {
    // Accordion draws its title in the 3 collapsed variants of 6.
    const a = find('Accordion');
    const drawing = a.oracle.variants.filter((v) => 'title' in v.layers);
    expect(drawing).toHaveLength(3);
    const index = a.oracle.variants.indexOf(drawing[0]);
    expect(countsOf('Accordion', index, 'title', 'typography')[0]).toBe(3);
  });

  it('counts the variant in view wherever nothing overrides the scope there', () => {
    const b = find('Option Card');
    for (const index of b.oracle.variants.keys())
      for (const layer of inspect(build, 'Option Card', index, {
        overlayText: '',
      }).layers)
        for (const c of layer.cells)
          for (const s of c.scopes)
            if (s.wins === null)
              expect(
                s.count,
                `${index} ${layer.name}.${c.cell} ${s.key}`,
              ).toBeGreaterThanOrEqual(1);
  });
});

describe('what overrides a scope in the variant in view', () => {
  it('a broader scope is overridden where a narrower entry wins; the winning one is not', () => {
    const b = find('Button');
    const v = aboveBase(b);
    const scopes = scopesFor(b.spec, null, 'root', 'background', v);
    const results = scopes.map((s) =>
      winsOver(b.spec, 'root', 'background', v, s.path),
    );
    // The narrowest scope is never overridden.
    expect(results.at(-1)).toBeNull();
    // Some broader scope is overridden by the entry that wins today (Button's danger background
    // sits in an appearance entry, not base), and it is named as the lookup names it.
    const { at } = lookupCell(b.spec, 'root', 'background', v);
    expect(results[0]).toBe(at);
    expect(results.some((r) => r === null)).toBe(true);
  });

  it('ranks the recipe positions as the lookup does: a holding state, then rest, size, base', () => {
    const b = find('Button');
    const hover = b.oracle.variants.find(
      (x) => x.figma === 'size=md, prio=primary, state=hover, danger=false',
    );
    const look = 'prio=primary, danger=false';
    expect(lookupOrder(b.spec, hover).map((p) => p.path)).toEqual([
      ['combined', 'md', look, 'hover'],
      ['appearance', look, 'hover'],
      ['combined', 'md', look, 'default'],
      ['appearance', look, 'default'],
      ['size', 'md'],
      ['base'],
    ]);
  });
});

describe('every scope offered, set in memory', () => {
  // For each cell Inspect lets a person set, every scope it offers, set to `none` in the
  // component's own overlay and built: a scope with no `wins` is what the variant then draws, and
  // one with `wins` leaves the entry it names winning; a scope's count is the number of variants
  // drawing the layer that then draw the set entry. The lookup of a cell reads that cell's
  // entries alone, so one build sets every cell under one kind of scope. Each case says whether
  // some scope it offers is overridden (at rest, a variant may draw every cell from base).
  const CASES = [
    ['Button', /state=default, danger=false$/, false],
    ['Button', /size=md, prio=primary, state=default, danger=true/, true],
    ['Button', /state=pressed/, true],
    ['Text Input', /^size=md, state=default$/, false],
    ['Text Input', /state=pressed/, true],
    ['Accordion', /^state=default, expanded=false$/, false],
    ['Dropdown', /state=pressed/, true],
    ['Option Card', /state=hover/, true],
    ['Option Card', /state=selected/, true],
    ['Calendar Day Cell', /state=today-column/, true],
  ];
  it.each(CASES)(
    'holds for %s %s',
    (name, pick, overrides) => {
      const catalog = loadWebCatalog();
      const names = tokenNames(loadContract());
      const defaults = loadDefaults();
      const text = overlayTextOf(name);
      const { spec, oracle } = find(name);
      const index = oracle.variants.findIndex((v) => pick.test(v.figma));
      expect(index).toBeGreaterThanOrEqual(0);
      const variant = oracle.variants[index];
      const order = lookupOrder(spec, variant);
      const atOf = (path) =>
        order.find((p) => p.path.join('|') === path.join('|')).at;
      const doc = parse(text);
      // Each offered scope, by its kind (base, size, appearance, combined).
      const byKind = new Map();
      for (const layer of inspect(build, name, index, { overlayText: text })
        .layers)
        for (const cell of layer.cells)
          if (cell.none)
            scopesFor(spec, doc, layer.name, cell.cell, variant).forEach(
              ({ key, path }, i) => {
                const kind = path[0];
                byKind.set(kind, [
                  ...(byKind.get(kind) ?? []),
                  {
                    layer: layer.name,
                    cell: cell.cell,
                    key,
                    path,
                    wins: cell.scopes[i].wins,
                    count: cell.scopes[i].count,
                  },
                ]);
              },
            );
      const loaded = loadComponent(catalog, addressOf(name));
      const wrong = [];
      let overridden = 0;
      for (const scopes of byKind.values()) {
        const edited = parse(text);
        edited.set = { ...edited.set };
        for (const { key } of scopes)
          edited.set[key] = { none: true, reason: 'the round trip' };
        const { spec: after } = buildComponentSpec(loaded, {
          names,
          fileVersion: catalog.fileVersion,
          overlay: parseOverlay(stringify(edited), 'x.yaml'),
          defaults,
        });
        for (const s of scopes) {
          const now = lookupCell(after, s.layer, s.cell, variant);
          const drawn =
            now?.at === atOf(s.path) &&
            now.entry.none === true &&
            now.entry.reason === 'the round trip';
          // The variants drawing the layer that draw the set entry, at the scope's place.
          const changed = oracle.variants.filter((u) => {
            if (!(s.layer in u.layers)) return false;
            const place = lookupOrder(after, u).find(
              (p) => p.path.join('|') === s.path.join('|'),
            );
            const hit = lookupCell(after, s.layer, s.cell, u);
            return (
              place !== undefined &&
              hit?.at === place.at &&
              hit.entry.none === true &&
              hit.entry.reason === 'the round trip'
            );
          }).length;
          if (s.count !== changed)
            wrong.push(
              `${s.key}: count ${s.count}, the set changes ${changed}`,
            );
          if (s.wins === null && s.count < 1)
            wrong.push(`${s.key}: not overridden, yet counts no variant`);
          // Where an entry wins, it is still the one drawn, at the place it names.
          const kept = s.wins !== null && now?.at === s.wins;
          if (s.wins !== null) overridden += 1;
          if (s.wins === null ? !drawn : !kept)
            wrong.push(`${s.key}: wins ${s.wins}, drawn ${now?.at}`);
        }
      }
      expect(wrong).toEqual([]);
      expect(byKind.size).toBeGreaterThan(1);
      expect(overridden > 0).toBe(overrides);
    },
    30_000,
  );
});
