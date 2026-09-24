/**
 * Cursor (milestone 4, F1): its IR, and the recipe each emitter makes of it. A drawing: 22 pointer
 * glyphs, each its own layers, placed by position in a root no auto layout sizes.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { slotsOf } from '../src/emit/mui-component.mjs';

const { built } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Cursor',
);

describe('the Cursor IR', () => {
  it('is a drawing of 22 types, and every finding is decided', () => {
    expect(spec.api.type.values).toHaveLength(22);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('is the size Figma draws each glyph at, its root having no auto layout', () => {
    expect(spec.style.root.base.width).toMatchObject({ literal: 12 });
    const progress = oracle.variants.find((v) => v.figma === 'type=Progress');
    expect(progress.layers.root).toMatchObject({ width: 22, height: 24 });
  });

  it('draws no box shadow, and excuses Figma’s where it had one', () => {
    expect(spec.style.root.base.shadow).toMatchObject({
      none: true,
      replaced: { token: 'shadow.raised' },
    });
    const excused = (figma) =>
      (oracle.variants.find((v) => v.figma === figma).excused ?? [])
        .filter((e) => e.layer === 'root' && e.property === 'shadow')
        .map((e) => e.decision);
    expect(excused('type=Default')).toEqual(['set']);
    expect(excused('type=Pointer')).toEqual([]);
  });

  it('names no primitive colour, keeping the two Figma used beside their decisions', () => {
    const drawn = JSON.stringify(spec.style, (k, v) =>
      k === 'replaced' ? undefined : v,
    );
    expect(drawn).not.toMatch(/"token":"color\.(green|blue)\.\d+"/);
    expect(
      spec.style.oval3.appearance['type=Copy'].default.background,
    ).toMatchObject({
      token: 'color.surface.feedback.success.strong',
      replaced: { token: 'color.green.400' },
    });
  });

  it('draws a boolean operation as its one outline, its operands no layers of their own', () => {
    expect(spec.layers.importedLayersCopy4).toMatchObject({
      type: 'BOOLEAN_OPERATION',
    });
    expect(
      Object.values(spec.layers).filter(
        (l) => l.parent === 'importedLayersCopy4',
      ),
    ).toEqual([]);
  });
});

describe('the Cursor recipe', () => {
  it('gives every one of its layers a class of its own, from the IR', () => {
    const slots = slotsOf(spec);
    expect(Object.keys(slots)).toHaveLength(Object.keys(spec.layers).length);
    expect(slots.rectangle237).toBe('& .SolarCursor-rectangle237');
    expect(slots.root).toBe('&');
  });
});
