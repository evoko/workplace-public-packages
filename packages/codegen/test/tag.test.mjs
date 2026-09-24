/**
 * Tag (milestone 4, F4 pioneer): its IR, and the recipe each emitter makes of it. Drawn on both;
 * its type follows from what the caller gives (derive, with props), its dot a StatusIndicator.
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
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Tag',
);

describe('the Tag IR', () => {
  it('takes a status and invert; its type follows from the words, an icon, the dot or onClose', () => {
    expect(Object.keys(spec.api)).toEqual(['status', 'invert']);
    expect(Object.keys(spec.slots).sort()).toEqual(['icon', 'label']);
    expect(spec.derived.type.when.map((w) => w.value)).toEqual([
      'status',
      'closable',
      'icon+text',
      'icon-only',
      'text-only',
    ]);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('reaches each type by filling its slots and setting its props', () => {
    const at = (figma) => oracle.variants.find((v) => v.figma === figma);
    expect(at('status=info, type=status, invert=false').content).toEqual([
      'label',
      'indicator',
    ]);
    expect(at('status=info, type=closable, invert=true').content).toEqual([
      'label',
      'onClose',
    ]);
  });

  it('reads an inverted close button from a variant that draws one, though none is inverted at rest', () => {
    // Figma draws no inverted status tag, the default of the other axes: the recipe reads the
    // inverted close button's 16px from the inverted closable tags, not an icon-only one.
    expect(
      spec.style.iconClose.appearance['status=info, type=closable, invert=true']
        .default.width,
    ).toMatchObject({ token: 'icon.sm' });
    expect(spec.style.iconClose.base.width).toMatchObject({ token: 'icon.xs' });
  });

  it('leaves the dot its own size, a StatusIndicator in the status’s type', () => {
    expect(spec.style.statusIndicator.base.width).toMatchObject({ none: true });
    const { composition } = renderMuiComponent(spec, tokens);
    expect(composition.statusIndicator.base).toMatchObject({
      component: 'StatusIndicator',
      'variant.size': 'xs',
    });
  });
});

describe('derive props', () => {
  it('must name props, not anything', () => {
    const catalog = loadWebCatalog();
    expect(() =>
      buildComponentSpec(loadComponent(catalog, 'Tag'), {
        names: tokenNames(loadContract()),
        fileVersion: catalog.fileVersion,
        overlay: parseOverlay(
          'component: Tag\nderive:\n  type:\n    when:\n      - { value: status, props: [On Close] }\n    reason: r\n',
          'test.yaml',
        ),
      }),
    ).toThrow(/derive.type.status: props must be a list of prop names/);
  });
});
