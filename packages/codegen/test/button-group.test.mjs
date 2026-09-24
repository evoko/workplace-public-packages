/**
 * Button Group (3b-2 Task B2): its IR, and the recipe each emitter makes of it. A layout of the
 * caller's Buttons: what is particular to it is a boolean renamed from a two-valued axis, a layout
 * that follows orientation and type, children styled together, and a divider on one side only.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Button Group',
);
const { styles } = renderMuiComponent(spec, tokens);
const { dart } = renderFlutterComponent(spec, tokens);

describe('the Button Group IR', () => {
  it('has orientation, and Figma’s regular/full-width type as a fullWidth boolean', () => {
    expect(spec.api).toEqual({
      orientation: {
        values: ['horizontal', 'vertical'],
        default: 'horizontal',
      },
      fullWidth: { type: 'boolean', default: false },
    });
    expect(spec.states).toEqual([]);
    expect(spec.base).toEqual({ mui: null, flutter: null });
    expect(Object.keys(spec.style.root.appearance).sort()).toEqual([
      'orientation=horizontal, fullWidth=true',
      'orientation=vertical, fullWidth=false',
    ]);
    // The oracle reaches each variant through the boolean, as the API does.
    expect(
      oracle.variants.find(
        (v) => v.figma === 'orientation=horizontal, type=full-width',
      ).props,
    ).toEqual({ orientation: 'horizontal', fullWidth: true });
  });

  it('decides every finding, now that the sync has recorded the divider’s sides', () => {
    expect(deviations.length).toBeGreaterThan(0);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
    expect(deviations.some((d) => d.kind === 'unrecorded')).toBe(false);
  });

  it('draws the full-width divider on its top side alone', () => {
    const bar =
      spec.style.root.appearance['orientation=horizontal, fullWidth=true']
        .default;
    expect(bar.borderTopWidth.token).toBe('border.default');
    // The other sides are the base's: every variant's border is read side by side, since one
    // variant has sides of its own, so the regular group's "no border" is none on each side.
    const base = spec.style.root.base;
    expect(base).not.toHaveProperty('borderWidth');
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      expect(base[`border${side}Width`]).toMatchObject({ none: true });
    for (const side of ['Right', 'Bottom', 'Left'])
      expect(bar).not.toHaveProperty(`border${side}Width`);
    expect(bar.borderColor.token).toBe('color.border.subtle');
    // Read from the weights Figma records per side, not inferred from the bindings.
    expect(JSON.stringify(bar)).not.toContain('inferred');
    const figma = oracle.variants.find(
      (v) => v.figma === 'orientation=horizontal, type=full-width',
    ).layers.root;
    expect(figma).toMatchObject({
      borderTopWidth: 1,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderLeftWidth: 0,
    });
    expect(figma).not.toHaveProperty('borderWidth');
  });

  it('lets every child fill the group, and leaves its height to the Button', () => {
    for (const layer of ['tertiaryCTA', 'secondaryCTA', 'button3']) {
      expect(spec.style[layer].base.width.keyword, layer).toBe('FILL');
      expect(spec.style[layer].base.height, layer).toMatchObject({
        none: true,
      });
    }
  });
});

describe('the Button Group recipe', () => {
  it('lays out a flex row, padded and spaced by insets, its children at full width', () => {
    expect(styles.reset).toEqual({ display: 'flex' });
    expect(styles.root).toMatchObject({
      flexDirection: 'row',
      gap: 'var(--solar-inset-xs)',
      paddingTop: 'var(--solar-inset-sm)',
      '& > *': { width: '100%' },
    });
    expect(
      styles.appearances['orientation=vertical, fullWidth=false'],
    ).toMatchObject({
      flexDirection: 'column',
    });
  });

  it('styles the border side by side: none on each at rest, the top alone at full width', () => {
    expect(styles.root).not.toHaveProperty('borderStyle');
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      expect(styles.root[`border${side}Style`]).toBe('none');
    const bar = styles.appearances['orientation=horizontal, fullWidth=true'];
    expect(bar).toMatchObject({
      borderTopWidth: 'var(--solar-border-default)',
      borderTopStyle: 'solid',
    });
    expect(bar).not.toHaveProperty('borderBottomStyle');
  });

  it('is a recipe alone on Flutter, with no style builder: the widget reads it cell by cell', () => {
    expect(dart).not.toContain('ButtonStyle');
    expect(dart).toContain(
      "'root.borderTopWidth|appearance|orientation=horizontal, fullWidth=true|default': 't:border.default'",
    );
  });
});
