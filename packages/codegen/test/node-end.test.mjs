/**
 * Node End (milestone 4, F1): its IR, and the recipe each emitter makes of it. Two ellipses placed
 * by position, drawn as round boxes at their drawn size, the halo translucent.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Node End',
);

describe('the Node End IR', () => {
  it('draws each ellipse at its size, round, and every finding is decided', () => {
    expect(spec.style.dot.base).toMatchObject({
      width: { literal: 6 },
      height: { literal: 6 },
      radius: { token: 'radius.pill', ellipse: true },
      x: { position: 3 },
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('grows the halo with the prop, at 20% opacity', () => {
    expect(spec.style.halo.base.opacity).toMatchObject({
      literal: 0.2,
      allowed: expect.any(String),
    });
    expect(spec.style.halo.appearance['halo=true'].default.width).toMatchObject(
      { literal: 14 },
    );
  });

  it('measures an ellipse as round, its corner half its size', () => {
    const halo = oracle.variants.find((v) => v.figma === 'halo=true').layers
      .halo;
    expect(halo).toMatchObject({ radius: 7, width: 14, opacity: 0.2, x: -1 });
  });
});

describe('the Node End recipe', () => {
  it('draws the halo translucent, and Flutter reads the opacity as a number', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root['& .SolarNodeEnd-halo']).toMatchObject({
      opacity: '0.2',
      borderRadius: 'var(--solar-radius-pill)',
    });
    expect(
      renderFlutterComponent(spec, tokens).cells['halo.opacity|base'],
    ).toBe('px:0.2');
  });
});
