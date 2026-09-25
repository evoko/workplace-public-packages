/**
 * SearchField (milestone 4, F5): its IR and recipe, and the `set` forms it brought: a size entry a
 * layer lacks, and an axis finding decided where the set draws what its variants draw.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { parseOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const { built, tokens } = stage.build();
const { spec, deviations } = built.find(
  (b) => b.spec.component === 'SearchField',
);

describe('the SearchField IR', () => {
  it('is all field: a size, disabled and error, filled derived, and a filter slot', () => {
    expect(Object.keys(spec.api)).toEqual(['error', 'disabled', 'size']);
    expect(spec.derived.filled.type).toBe('boolean');
    expect(Object.keys(spec.slots)).toEqual(['filter']);
  });

  it('leaves nothing open', () => {
    // Figma's centred error field, open until 2026-09-25, is aligned as the others since.
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws the sm field flat, its icons icon.xs, and every hovered field edged', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    const at = (state) => styles.combined.sm.default[state] ?? {};
    expect(styles.root.boxShadow).toBe('var(--solar-shadow-control)');
    expect(
      styles.combined.sm.default.boxShadow ?? at('&:hover').boxShadow,
    ).toBe('none');
    expect(styles.sizes.sm['& .SolarSearchField--iconSearch']).toMatchObject({
      width: 'var(--solar-icon-xs)',
      height: 'var(--solar-icon-xs)',
    });
    expect(styles.appearances.default['&:hover'].borderColor).toBe(
      'var(--solar-color-border-medium)',
    );
  });
});

describe('set, beyond the entries the IR has', () => {
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  // The set as Figma drew it until 2026-09-25: the resting sm field kept md's 16px search icon,
  // where its five other states drew 12, so the recipe had no sm size for the icon.
  const loaded = structuredClone(loadComponent(catalog, 'SearchField'));
  for (const v of loaded.set.variants)
    if (v.variant === 'state=default, size=sm')
      delete v.overrides.changed['/Icon/Search'];
  const on = (text) =>
    buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(`component: SearchField\n${text}`, 'test.yaml'),
    });

  it('adds a size a layer draws as at rest, and decides the findings it now draws', () => {
    const before = on('');
    expect(before.spec.style.iconSearch.size.sm).toBeUndefined();
    expect(
      before.deviations.filter((d) =>
        d.token.startsWith('component.searchfield.iconSearch.height@'),
      ),
    ).toHaveLength(5);
    const after = on(
      'set:\n  iconSearch.size.sm.height: { token: icon.xs, reason: r }\n',
    );
    expect(after.spec.style.iconSearch.size.sm.height.token).toBe('icon.xs');
    const heights = after.deviations.filter((d) =>
      d.token.startsWith('component.searchfield.iconSearch.height@'),
    );
    expect(heights.every((d) => d.decision?.rule === 'set')).toBe(true);
  });

  it('decides no finding whose variants draw otherwise, and refuses a size there is none of', () => {
    const other = on(
      'set:\n  iconSearch.size.sm.height: { token: icon.md, reason: r }\n',
    );
    expect(
      other.deviations
        .filter((d) =>
          d.token.startsWith('component.searchfield.iconSearch.height@'),
        )
        .some((d) => d.decision),
    ).toBe(false);
    expect(() =>
      on('set:\n  iconSearch.size.lg.height: { token: icon.xs, reason: r }\n'),
    ).toThrow(/the IR has no size lg/);
  });
});
