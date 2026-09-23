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

  it('decides every finding but the divider’s unrecorded sides, which a sync records', () => {
    expect(deviations.filter((d) => !d.decision).map((d) => d.kind)).toEqual([
      'unrecorded',
    ]);
  });

  it('draws the full-width divider on its top side alone', () => {
    const bar =
      spec.style.root.appearance['orientation=horizontal, fullWidth=true']
        .default;
    expect(bar.borderTopWidth.token).toBe('border.default');
    for (const side of ['Right', 'Bottom', 'Left'])
      expect(bar[`border${side}Width`]).toMatchObject({ none: true });
    expect(bar.borderColor.token).toBe('color.border.subtle');
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

  it('styles one side of the border only, over the uniform none', () => {
    expect(styles.root.borderStyle).toBe('none');
    expect(
      styles.appearances['orientation=horizontal, fullWidth=true'],
    ).toMatchObject({
      borderTopWidth: 'var(--solar-border-default)',
      borderTopStyle: 'solid',
      borderBottomStyle: 'none',
    });
  });

  it('is a recipe alone on Flutter, with no style builder: the widget reads it cell by cell', () => {
    expect(dart).not.toContain('ButtonStyle');
    expect(dart).toContain(
      "'root.borderTopWidth|appearance|orientation=horizontal, fullWidth=true|default': 't:border.default'",
    );
  });
});
