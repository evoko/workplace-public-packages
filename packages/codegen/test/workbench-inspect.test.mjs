import { beforeAll, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { inspect } from '../src/workbench/inspect.mjs';

let build;
beforeAll(() => {
  build = stage.build();
});

describe('a component’s inspection', () => {
  it('lists its variants and, for the one asked, each layer’s cells', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    expect(i.component).toBe('Button');
    expect(i.variants[0]).toMatchObject({
      index: 0,
      name: build.built.find((b) => b.spec.component === 'Button').oracle
        .variants[0].figma,
    });
    const root = i.layers.find((l) => l.name === 'root');
    expect(root.className).toBeNull();
    const bg = root.cells.find((c) => c.cell === 'background');
    expect(bg.entry).toMatch(/^color\./);
    expect(bg.at).toBeTruthy();
    expect(bg.scopes[0].key).toBe('root.base.background');
    expect(bg.choices.length).toBeGreaterThan(10);
    expect(bg.keywords).toEqual([]);
  });

  it('reads a text style as one cell, not six properties', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const label = i.layers.find((l) => l.name === 'label');
    expect(label.cells.filter((c) => c.cell === 'typography')).toHaveLength(1);
    expect(label.className).toBe('SolarButton-label');
  });

  it('offers FILL and HUG on a width', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const w = i.layers.flatMap((l) => l.cells).find((c) => c.cell === 'width');
    expect(w).toBeDefined();
    expect(w.keywords).toEqual(['FILL', 'HUG']);
  });

  it('offers nothing on a raw value the overlay allows, and says to Report it', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const counter = i.layers.find((l) => l.name === 'counter');
    const height = counter.cells.find((c) => c.cell === 'height');
    expect(height.entry).toMatch(/literal/);
    expect(height).toMatchObject({
      choices: [],
      keywords: [],
      none: false,
      note: 'a raw value the overlay allows (allowLiteral): use Report',
    });
    const bg = i.layers
      .find((l) => l.name === 'root')
      .cells.find((c) => c.cell === 'background');
    expect(bg.none).toBe(true);
    expect(bg.note).toBeUndefined();
  });

  it('carries the overlay file’s revision, for refusing a stale write', () => {
    const a = inspect(build, 'Button', 0, { overlayText: 'a' });
    const b = inspect(build, 'Button', 0, { overlayText: 'b' });
    expect(a.revision).not.toBe(b.revision);
  });

  it('fails for a component that does not exist', () => {
    expect(() => inspect(build, 'Nope', 0, { overlayText: '' })).toThrow(
      /no component Nope/,
    );
  });
});

describe('where the web draws each layer', () => {
  const layerOf = (i, name) => i.layers.find((l) => l.name === name);

  it('finds a text MUI draws in the root by the root, and an icon by MUI’s slot', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    expect(layerOf(i, 'root').selector).toBe('&');
    expect(layerOf(i, 'label').selector).toBe('&');
    expect(layerOf(i, 'iconLeading').selector).toBe('& .MuiButton-startIcon');
    expect(layerOf(i, 'iconTrailing').selector).toBe('& .MuiButton-endIcon');
    expect(layerOf(i, 'counter').selector).toBe('& .SolarButton-counter');
  });

  it('finds a drawn component’s layers by their classes', () => {
    const i = inspect(build, 'Option Card', 0, { overlayText: '' });
    for (const l of i.layers)
      expect(l.selector, l.name).toBe(
        l.name === 'root' ? '&' : `& .${l.className}`,
      );
  });

  // Every component, twice: slow beside the whole suite, so it has longer.
  it('gives every layer of every component a selector', () => {
    const missing = [];
    for (const { spec, oracle } of build.built)
      for (const index of new Set([0, oracle.variants.length - 1])) {
        const i = inspect(build, spec.component, index, { overlayText: '' });
        for (const l of i.layers) {
          // Null only for a layer the variant hides, which the case then does not draw.
          if (l.selector === null && l.hidden) continue;
          if (typeof l.selector !== 'string' || !/^&/.test(l.selector))
            missing.push(`${spec.component}.${l.name}`);
        }
      }
    expect(missing).toEqual([]);
  }, 20_000);
});

describe('the dialog’s fields', () => {
  it('names the axes and each variant’s parts', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    expect(i.axes.map((a) => a.name)).toEqual([
      'size',
      'prio',
      'state',
      'danger',
    ]);
    expect(i.axes.find((a) => a.name === 'size').values).toContain('md');
    expect(i.variants[0].parts).toEqual({
      size: 'md',
      prio: 'primary',
      state: 'default',
      danger: 'false',
    });
    // Every variant's parts are one value of each axis.
    for (const v of i.variants)
      for (const a of i.axes) expect(a.values).toContain(v.parts[a.name]);
  });

  it('gives each layer its parent, nested as Figma nests them', () => {
    const i = inspect(build, 'Option Card', 0, { overlayText: '' });
    const parent = Object.fromEntries(i.layers.map((l) => [l.name, l.parent]));
    expect(parent.root).toBeNull();
    expect(parent.container).toBe('root');
    expect(parent.iconPlus).toBe('container');
    expect(parent.label).toBe('root');
  });

  it('nests a layer in the nearest one the variant draws, so the tree has no gap', () => {
    // Stepper Indicator's check sits in an icon frame its first variant does not draw.
    const i = inspect(build, 'Stepper Indicator', 0, { overlayText: '' });
    const names = new Set(i.layers.map((l) => l.name));
    expect(names.has('icon')).toBe(false);
    expect(i.layers.find((l) => l.name === 'iconCheck').parent).toBe('root');
    for (const l of i.layers)
      if (l.parent !== null) expect(names.has(l.parent), l.name).toBe(true);
  });

  it('gives each cell its value, its origin and the rule’s reason', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const root = i.layers.find((l) => l.name === 'root').cells;
    const bg = root.find((c) => c.cell === 'background');
    expect(bg.value).toMatch(/#/);
    expect(bg.origin).toBe('figma');
    expect(bg.reason).toBeNull();
    const all = i.layers.flatMap((l) => l.cells);
    for (const origin of ['rule', 'defaults'])
      expect(
        all.some(
          (c) =>
            c.origin === origin &&
            typeof c.reason === 'string' &&
            c.reason.length > 0,
        ),
        origin,
      ).toBe(true);
    for (const c of all) {
      if (c.origin === 'figma') expect(c.reason).toBeNull();
      for (const s of c.scopes) expect(s.count).toBeGreaterThan(0);
    }
  });

  it('says which entry overrides a scope in the variant in view', () => {
    const i = inspect(build, 'Button', 1, { overlayText: '' });
    const bg = i.layers
      .find((l) => l.name === 'root')
      .cells.find((c) => c.cell === 'background');
    expect(bg.at).toMatch(/^appearance /);
    expect(bg.scopes[0]).toMatchObject({ label: 'every variant', wins: bg.at });
    expect(bg.scopes.at(-1).wins).toBeNull();
  });

  const cellOf = (i, layer, cell) =>
    i.layers.find((l) => l.name === layer).cells.find((c) => c.cell === cell);

  it('names each scope in plain words, and how many variants draw the layer', () => {
    const labels = (index) =>
      cellOf(
        inspect(build, 'Button', index, { overlayText: '' }),
        'root',
        'radius',
      ).scopes.map((s) => s.label);
    expect(labels(0)).toEqual([
      'every variant',
      'every md',
      'primary · at rest',
      'md · primary · at rest',
    ]);
    expect(labels(1)).toEqual([
      'every variant',
      'every md',
      'primary, danger · at rest',
      'md · primary, danger · at rest',
    ]);
    // Variant 18: md, primary, hover.
    expect(labels(18).slice(2)).toEqual([
      'primary · hover',
      'md · primary · hover',
    ]);
    expect(
      cellOf(inspect(build, 'Button', 0, { overlayText: '' }), 'root', 'radius')
        .total,
    ).toBe(108);
  });

  it('names the entry that wins in plain words, and marks the scope holding today’s entry', () => {
    const at = (index) =>
      cellOf(
        inspect(build, 'Button', index, { overlayText: '' }),
        'root',
        'background',
      ).scopes.map(({ label, winsLabel, current }) => [
        label,
        winsLabel,
        current,
      ]);
    expect(at(0)).toEqual([
      ['every variant', null, true],
      ['every md', null, false],
      ['primary · at rest', null, false],
      ['md · primary · at rest', null, false],
    ]);
    expect(at(1)).toEqual([
      ['every variant', 'primary, danger · at rest', false],
      ['every md', 'primary, danger · at rest', false],
      ['primary, danger · at rest', null, true],
      ['md · primary, danger · at rest', null, false],
    ]);
  });

  it('tells apart the layers that share one selector, in the order the case draws them', () => {
    const selectors = (index) =>
      Object.fromEntries(
        inspect(build, 'Button Group', index, { overlayText: '' })
          .layers.filter((l) => l.name !== 'root')
          .map((l) => [l.name, l.selector]),
      );
    // At rest Figma hides the tertiary, a slot the case draws; the vertical group hides button3.
    expect(selectors(0)).toEqual({
      tertiaryCTA: '& > :nth-child(1)',
      secondaryCTA: '& > :nth-child(2)',
      button3: '& > :nth-child(3)',
    });
    expect(selectors(1)).toEqual({
      tertiaryCTA: '& > :nth-child(1)',
      secondaryCTA: '& > :nth-child(2)',
      button3: null,
    });
    // Each finds its own child: the nth element child of the group's root, as pick.ts reads it.
    const children = ['tertiaryCTA', 'secondaryCTA', 'button3'];
    for (const [layer, selector] of Object.entries(selectors(0)))
      expect(
        children[Number(/:nth-child\((\d+)\)/.exec(selector)[1]) - 1],
      ).toBe(layer);
  });
});
