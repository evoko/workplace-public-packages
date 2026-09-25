/**
 * StatusIndicator (milestone 4, F1's pioneer): its IR, and the recipe each emitter makes of it. A
 * drawing: each type is its own shape from other layers, so every cell follows type and size, a
 * layer is a glyph in one variant and a box in another, and its marks are placed by position.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'StatusIndicator',
);
const { styles, composition } = renderMuiComponent(spec, tokens);
const { cells } = renderFlutterComponent(spec, tokens);

describe('the StatusIndicator IR', () => {
  it('takes a type and a size, and has no states', () => {
    expect(spec.api).toEqual({
      type: {
        values: [
          'success',
          'info',
          'warning',
          'danger',
          'neutral',
          'help',
          'private',
        ],
        default: 'success',
      },
      size: { values: ['md', 'sm', 'xs'], default: 'md' },
    });
    expect(spec.states).toEqual([]);
  });

  it('is a drawing, and every finding is decided', () => {
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'drawing' }),
    );
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
    expect(deviations.filter((d) => d.kind === 'axis')).toEqual([]);
  });

  it('is an icon size at md and sm, and 8px, allowed, at xs', () => {
    expect(spec.style.root.base.width).toMatchObject({ token: 'icon.md' });
    expect(
      spec.style.root.combined.sm['type=success'].default.width,
    ).toMatchObject({ token: 'icon.sm' });
    expect(
      spec.style.root.combined.xs['type=success'].default.width,
    ).toMatchObject({ literal: 8, allowed: expect.any(String) });
  });

  it('draws help’s unknown border as border.medium, and no glyph’s shadow', () => {
    expect(
      spec.style.container.combined.md['type=help'].default.borderColor,
    ).toMatchObject({ token: 'color.border.medium', from: 'overlay' });
    expect(spec.style.innerPath.base.shadow).toMatchObject({ none: true });
  });

  it('measures the warning mark where Figma placed it in its triangle', () => {
    const warning = oracle.variants.find(
      (v) => v.figma === 'type=warning, size=md',
    );
    expect(warning.layers.innerPath).toMatchObject({ x: 9, y: 6 });
    expect(warning.layers.union).toMatchObject({ x: 0, y: 1.44 });
  });
});

describe('the StatusIndicator recipe', () => {
  it('fills a glyph’s outlines, and boxes a frame, the same layer by type', () => {
    const danger =
      styles.combined.md['type=danger']['& .SolarStatusIndicator--container'];
    expect(danger).toMatchObject({
      fill: 'var(--solar-color-surface-feedback-danger-strong)',
      stroke: 'var(--solar-color-border-medium)',
      '& .SolarGlyph-stroke': { fill: 'var(--solar-color-border-medium)' },
    });
    const neutral =
      styles.combined.md['type=neutral']['& .SolarStatusIndicator--container'];
    expect(neutral).toMatchObject({
      backgroundColor: 'var(--solar-color-surface-feedback-neutral-strong)',
      borderRadius: 'var(--solar-radius-pill)',
    });
    expect(neutral).not.toHaveProperty('fill');
  });

  it('keeps each glyph and its position in the composition, for the shell', () => {
    expect(
      composition.innerPath.combined.md['type=warning'].default,
    ).toMatchObject({
      x: 9,
      y: 6,
    });
    expect(composition.innerPath.base.glyph.fill.length).toBeGreaterThan(0);
  });

  it('is a recipe read cell by cell on Flutter, with the glyphs as data', () => {
    expect(cells['innerPath.glyph|base']).toMatch(/^g:\d+$/);
    expect(cells['innerPath.x|combined|md|type=warning|default']).toBe('px:9');
  });
});
