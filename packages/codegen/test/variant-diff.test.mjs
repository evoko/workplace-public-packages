/**
 * What the SOLAR Web fetcher records of a variant beyond its tree (docs/solar-web/raw/
 * variant-diff.mjs), and how the codegen reads it: each hidden layer by its path, into composed
 * children, and where a layer one variant adds sits among its siblings. Before the fetcher
 * recorded either, the overlays said so by hand (`hides`, `places`); a rule the export makes
 * redundant fails as stale.
 */

import { describe, expect, it } from 'vitest';
import {
  hiddenPathsOf,
  overrides,
} from '../../../docs/solar-web/raw/variant-diff.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { loadDefaults, loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { hideInComposed } from '../src/verify/oracle.mjs';

describe('the fetcher', () => {
  it('records every hidden layer by its path, into an instance, siblings of one name apart', () => {
    const variant = {
      name: 'tone=a',
      children: [
        { name: 'Label', visible: false },
        {
          name: 'Field',
          type: 'INSTANCE',
          children: [{ name: 'Label', visible: false }, { name: 'Icon' }],
        },
        { name: 'Label' },
        { name: 'Label', visible: false },
      ],
    };
    expect(hiddenPathsOf(variant)).toEqual([
      '/Field/Label',
      '/Label',
      '/Label#3',
    ]);
  });

  it('records where a layer one variant adds sits among its siblings', () => {
    const base = {
      name: 'loading=false',
      children: [{ name: 'Content' }, { name: 'Footer' }],
    };
    const loading = {
      name: 'loading=true',
      children: [{ name: 'Skeleton' }, { name: 'Content' }, { name: 'Footer' }],
    };
    expect(overrides(base, loading).added).toEqual([
      { path: '/Skeleton', parent: '/', index: 0, layer: { name: 'Skeleton' } },
    ]);
  });
});

describe('a composed child’s hidden layers, by path', () => {
  // A component whose own words are named `Label`, as its child's hidden label is.
  const spec = {
    layers: {
      root: { path: '/', parent: null, type: 'COMPONENT' },
      label: { path: '/Label', parent: 'root', type: 'TEXT' },
      field: { path: '/Field', parent: 'root', type: 'INSTANCE' },
    },
  };
  const specs = {
    Child: {
      layers: {
        root: { path: '/', parent: null, type: 'COMPONENT' },
        label: { path: '/Label', parent: 'root', type: 'TEXT' },
        icon: { path: '/Icon', parent: 'root', type: 'INSTANCE' },
      },
    },
  };
  const oracle = () => ({
    variants: [
      {
        figma: 'tone=a',
        layers: { root: {}, label: {}, field: { component: 'Child' } },
      },
    ],
  });
  const set = (record) => ({
    defaultVariant: 'tone=a',
    variants: [{ variant: 'tone=a', ...record }],
  });

  it('are the child’s own, where a name alone is the component’s too', () => {
    const byPath = oracle();
    hideInComposed(
      byPath,
      spec,
      set({ hidden: ['Label'], hiddenPaths: ['/Field/Label'] }),
      specs,
    );
    expect(byPath.variants[0].layers.field.hides).toEqual(['label']);
    // By name alone, the component's own `Label` hides the name, and the child's goes unseen.
    const byName = oracle();
    hideInComposed(byName, spec, set({ hidden: ['Label'] }), specs);
    expect(byName.variants[0].layers.field.hides).toBeUndefined();
  });

  it('leave an overlay’s hides stale where Figma records none of them hidden', () => {
    expect(() =>
      hideInComposed(
        oracle(),
        spec,
        set({ hidden: ['Label'], hiddenPaths: ['/Field/Label'] }),
        specs,
        { file: 'test.yaml', hides: { field: { not: ['icon'] } } },
      ),
    ).toThrow(/Figma records no icon of it hidden, by its path/);
  });
});

describe('a layer one variant adds, where Figma records its place', () => {
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  const defaults = loadDefaults();
  // Card's raw set as the fetcher now records it: the loading card's title placeholder first of
  // the root's children (its title removed), before the content, as Figma draws it.
  const loaded = structuredClone(loadComponent(catalog, 'Card'));
  for (const v of loaded.set.variants)
    for (const added of v.overrides?.added ?? [])
      if (added.path === '/Skeleton') added.index = 0;
  const build = (overlay) =>
    buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
      overlay,
      defaults,
    });

  it('sits there with no overlay rule', () => {
    const overlay = structuredClone(loadOverlay('Card'));
    delete overlay.places;
    const paths = Object.values(build(overlay).spec.layers)
      .filter((l) => l.parent === 'root')
      .map((l) => l.path);
    expect(paths.indexOf('/Skeleton')).toBe(paths.indexOf('/Content') - 1);
  });

  it('leaves the overlay’s places stale', () => {
    expect(() => build(loadOverlay('Card'))).toThrow(
      /places \/Skeleton: the layer is already before \/Content, as Figma's export records it/,
    );
  });
});
