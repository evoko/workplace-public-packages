/**
 * Slider and Slider Range (milestone 4, F3): their IR, and the recipes each emitter makes of them.
 * MUI's Slider on the web, drawn in Flutter; the value places the fill and handles (controlDraws
 * with cells), the recipe draws the rest.
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
const of = (name) => built.find((b) => b.spec.component === name);

describe('the Slider IR', () => {
  const { spec, deviations } = of('Slider');

  it('takes disabled, filled and error, which Figma draws as at rest, and fills its container', () => {
    expect(Object.keys(spec.api).sort()).toEqual([
      'disabled',
      'error',
      'filled',
    ]);
    expect(spec.states).toEqual(['default', 'hover', 'pressed', 'focus']);
    expect(spec.style.root.base.width).toMatchObject({ keyword: 'FILL' });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws a disabled handle smaller and flat', () => {
    const disabled = spec.style.handle.appearance.default.disabled;
    expect(disabled.width).toMatchObject({ literal: 14 });
    expect(disabled.borderWidth).toMatchObject({ token: 'border.default' });
  });
});

describe('the Slider recipe', () => {
  const { spec, oracle } = of('Slider');
  const { styles } = renderMuiComponent(spec, tokens);

  it('leaves where the fill ends and the handle sits to MUI, and places the rest', () => {
    const handle = styles.root['& .MuiSlider-thumb'];
    expect(handle).not.toHaveProperty('left');
    expect(handle.top).toBe('calc(2px - var(--solar-placed-top, 0px))');
    expect(handle.width).toBe('16px');
    expect(styles.root['& .MuiSlider-track']).not.toHaveProperty('width');
    expect(styles.root['& .MuiSlider-track'].height).toBe('4px');
  });

  it('excuses only the cells the control decides', () => {
    const rest = oracle.variants[0].excused.filter(
      (e) => e.decision === 'controlDraws',
    );
    expect(rest.map((e) => `${e.layer}.${e.property}`).sort()).toEqual([
      'fill.width',
      'fill.x',
      'handle.x',
    ]);
  });
});

describe('the Slider Range IR', () => {
  const { spec, deviations } = of('Slider Range');

  it('takes disabled, with a handle for each end, and rings its handles as Figma draws', () => {
    // Figma drew no focus until 2026-09-25, when the overlay ringed the whole slider; it rings
    // the handles since.
    expect(Object.keys(spec.api)).toEqual(['disabled']);
    expect(spec.states).toContain('focus');
    for (const handle of ['handle', 'handle2'])
      expect(spec.style[handle].appearance.default.focus.shadow.token).toBe(
        'shadow.focus.default',
      );
    expect(spec.style.root.appearance?.default?.focus).toBeUndefined();
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('styles each of MUI’s thumbs as its own handle', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root).toHaveProperty(['& .MuiSlider-thumb[data-index="1"]']);
  });
});

describe('controlDraws cells', () => {
  it('refuses a cell that is not part of a box', () => {
    const catalog = loadWebCatalog();
    expect(() =>
      buildComponentSpec(loadComponent(catalog, 'Slider'), {
        names: tokenNames(loadContract()),
        fileVersion: catalog.fileVersion,
        overlay: parseOverlay(
          'component: Slider\ncontrolDraws:\n  handle: { cells: [radius], reason: r }\n',
          'test.yaml',
        ),
      }),
    ).toThrow(
      /controlDraws handle: radius is not one of x, y, right, bottom, width, height/,
    );
  });
});
