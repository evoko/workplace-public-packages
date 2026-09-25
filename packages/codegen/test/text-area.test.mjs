/**
 * Text Area (milestone 4, F5): its IR, the recipe the MUI emitter makes of it, and the machinery
 * it brought: a layer placed in a parent that grows, pinned to the parent's nearer edge.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { farEdgesOf, placementOf } from '../src/normalize/placement.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Text Area',
);

describe('the Text Area IR', () => {
  it('takes a size, disabled and error, and derives filled, as Text Input does', () => {
    expect(Object.keys(spec.api)).toEqual(['size', 'disabled', 'error']);
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(spec.derived.filled.type).toBe('boolean');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('pins the send button to the field’s right, the attachment to its left', () => {
    expect(spec.style.cta.base).toMatchObject({
      right: { position: 8 },
      y: { position: 80 },
    });
    expect(spec.style.cta.base.x).toBeUndefined();
    expect(spec.style.attachment.base).toMatchObject({
      x: { position: 8 },
      y: { position: 80 },
    });
    const md = oracle.variants.find(
      (v) => v.figma === 'size=md, state=default',
    );
    expect(md.layers.cta).toMatchObject({ right: 8, y: 80 });
    expect(md.layers.attachment).toMatchObject({ x: 8, y: 80 });
  });

  it('rings the field alone when focused, as Figma draws it', () => {
    // Figma ringed the whole component too until 2026-09-25, which the overlay removed.
    expect(
      spec.style.root.appearance?.default?.focus?.shadow?.token,
    ).toBeUndefined();
  });
});

describe('the Text Area recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('places the buttons from the field’s edges inside its border', () => {
    const field = styles.root['& .SolarTextArea--field'];
    expect(field['--solar-placed-right']).toBe('var(--solar-border-default)');
    expect(styles.root['& .SolarTextArea-cta']).toMatchObject({
      position: 'absolute',
      right: 'calc(8px - var(--solar-placed-right, 0px))',
      top: 'calc(80px - var(--solar-placed-top, 0px))',
    });
    expect(styles.root['& .SolarTextArea-attachment'].left).toBe(
      'calc(8px - var(--solar-placed-left, 0px))',
    );
  });
});

describe('a layer placed in a parent that grows', () => {
  const parent = { size: [280, 120], layout: { sizing: 'FILL/FIXED' } };
  const at = (x, y) => ({ position: [x, y], size: [32, 32] });

  it('keeps its distance from the nearer edge along an axis the parent grows on', () => {
    expect(placementOf(at(240, 80), parent, [true, false])).toEqual({
      right: 8,
      y: 80,
    });
    expect(placementOf(at(8, 80), parent, [false, false])).toEqual({
      x: 8,
      y: 80,
    });
  });

  it('is pinned far only where every variant places it nearer that edge', () => {
    const variant = (x) => ({
      layers: new Map([
        ['/F', parent],
        ['/F/B', at(x, 80)],
      ]),
      parents: new Map([['/F/B', '/F']]),
    });
    expect(farEdgesOf([variant(240), variant(236)], '/F/B')).toEqual([
      true,
      false,
    ]);
    expect(farEdgesOf([variant(240), variant(8)], '/F/B')).toEqual([
      false,
      false,
    ]);
    // A fixed parent keeps every place from its left and top.
    const fixed = variant(240);
    fixed.layers.set('/F', { ...parent, layout: { sizing: 'FIXED/FIXED' } });
    expect(farEdgesOf([fixed], '/F/B')).toEqual([false, false]);
  });
});
