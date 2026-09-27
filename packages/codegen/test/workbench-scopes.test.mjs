import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
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
import { figmaSpelling, scopesFor, stateOf } from '../src/workbench/scopes.mjs';

let build;
let built;
const find = (name) => built.find((b) => b.spec.component === name);
const addressOf = (name) => stage.COMPONENTS[stage.NAMES.indexOf(name)];
const overlayTextOf = (name) =>
  readFileSync(join(overlayDir, overlayFileOf(addressOf(name))), 'utf8');
const overlayOf = (name) => parse(overlayTextOf(name));
const keysOf = (name, variant, layer, cell) =>
  scopesFor(find(name).spec, overlayOf(name), layer, cell, variant).map(
    (s) => s.key,
  );
beforeAll(() => {
  build = stage.build();
  ({ built } = build);
});

describe('the scopes a set rule may be keyed on', () => {
  it('run from every variant to the one in view, for Button md primary at rest', () => {
    const b = find('Button');
    const v = b.oracle.variants.find(
      (x) => x.figma === 'size=md, prio=primary, state=default, danger=false',
    );
    const keys = scopesFor(
      b.spec,
      overlayOf('Button'),
      'root',
      'background',
      v,
    ).map((s) => s.key);
    expect(keys[0]).toBe('root.base.background');
    expect(keys).toContain('root.size.md.background');
    expect(keys).toContain(
      'root.appearance.prio=primary, danger=false.default.background',
    );
    expect(keys).toContain(
      'root.combined.md.prio=primary, danger=false.default.background',
    );
  });

  it('carry the IR path beside each key, for reading the entry there', () => {
    const b = find('Button');
    const v = b.oracle.variants.find(
      (x) => x.figma === 'size=md, prio=primary, state=default, danger=false',
    );
    const scopes = scopesFor(
      b.spec,
      overlayOf('Button'),
      'root',
      'background',
      v,
    ).map(({ key, path }) => ({ key, path }));
    const look = 'prio=primary, danger=false';
    expect(scopes).toEqual([
      { key: 'root.base.background', path: ['base'] },
      { key: 'root.size.md.background', path: ['size', 'md'] },
      {
        key: `root.appearance.${look}.default.background`,
        path: ['appearance', look, 'default'],
      },
      {
        key: `root.combined.md.${look}.default.background`,
        path: ['combined', 'md', look, 'default'],
      },
    ]);
  });

  it('spell a state as the IR does, since states.rename applies before the recipe', () => {
    const b = find('Text Input');
    const pressed = b.oracle.variants.find(
      (x) => x.figma === 'size=md, state=pressed',
    );
    const keys = keysOf('Text Input', pressed, 'field', 'borderColor');
    expect(keys).toContain('field.appearance.default.focus.borderColor');
    expect(keys.some((k) => k.includes('pressed'))).toBe(false);
  });

  it('offer no size and no combined look for a component without a size axis', () => {
    const b = find('Calendar Day Cell');
    expect('size' in b.spec.api).toBe(false);
    const v = b.oracle.variants.find((x) => x.figma === 'state=today-column');
    const keys = keysOf('Calendar Day Cell', v, 'root', 'background');
    expect(keys).toEqual([
      'root.base.background',
      'root.appearance.default.todayColumn.background',
    ]);
  });

  it('offer only a look the build takes: none a layer lacks and may not be given', () => {
    const b = find('Button');
    const v = b.oracle.variants.find(
      (x) => x.figma === 'size=md, prio=primary, state=default, danger=false',
    );
    // Button's label has no per-size entry of its own for primary at rest, and a set never adds a
    // combined size or look.
    expect(
      keysOf('Button', v, 'label', 'color').some((k) =>
        k.startsWith('label.combined.'),
      ),
    ).toBe(false);
  });

  it('spell a renamed axis as Figma does: All-Day Bar’s variant is Figma’s style', () => {
    const doc = overlayOf('All-Day Bar');
    expect(figmaSpelling(doc, 'variant=solid, span=end')).toBe(
      'style=solid, span=end',
    );
  });

  it('name the state that holds in the variant, or default', () => {
    const b = find('Button');
    const hover = b.oracle.variants.find((x) => x.state === 'hover');
    expect(stateOf(b.spec, hover)).toBe('hover');
    expect(stateOf(b.spec, b.oracle.variants[0])).toBe('default');
  });
});

describe('every scope offered', () => {
  // Each key Inspect offers, for every cell of every layer, set to `none` in the component's own
  // overlay, is one the build takes: never "the IR has no …" or "is not a style section". Whether a
  // set is taken is the layer's and the look's, not the cell's, so one build sets every cell a
  // layer offers under one look.
  const COMPONENTS = [
    ['Button', /state=pressed/],
    ['Text Input', /state=pressed/],
    ['Dropdown', /state=pressed/],
    ['All-Day Bar', null],
    ['SplitButton', /state=hover/],
    ['Number Input', /state=focus/],
    ['Spinner', null],
    ['Calendar Day Cell', /state=today-column/],
  ];
  it.each(COMPONENTS)(
    'builds, for %s',
    (name, special) => {
      const catalog = loadWebCatalog();
      const names = tokenNames(loadContract());
      const defaults = loadDefaults();
      const text = overlayTextOf(name);
      const { oracle } = find(name);
      const last = oracle.variants.length - 1;
      const picked = oracle.variants.findIndex((v) => special?.test(v.figma));
      // Each offered key, by the look it is keyed on (the key without its cell).
      const looks = new Map();
      for (const index of new Set([0, picked < 0 ? last : picked]))
        for (const layer of inspect(build, name, index, { overlayText: text })
          .layers)
          for (const cell of layer.cells)
            if (cell.none)
              for (const { key } of cell.scopes) {
                const look = key.slice(0, -(cell.cell.length + 1));
                looks.set(look, new Set([...(looks.get(look) ?? []), key]));
              }
      expect(looks.size).toBeGreaterThan(0);
      const loaded = loadComponent(catalog, addressOf(name));
      const refused = [];
      for (const keys of looks.values()) {
        const doc = parse(text);
        doc.set = { ...doc.set };
        for (const key of keys)
          doc.set[key] = { none: true, reason: 'the round trip' };
        try {
          buildComponentSpec(loaded, {
            names,
            fileVersion: catalog.fileVersion,
            overlay: parseOverlay(stringify(doc), 'x.yaml'),
            defaults,
          });
        } catch (e) {
          refused.push(e.message);
        }
      }
      expect(refused).toEqual([]);
    },
    30_000,
  );
});
