/**
 * ProgressBar (milestone 4, F1): its IR, and the recipe each emitter makes of it. Each platform's
 * determinate progress bar, whose bar the control draws and moves itself.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'ProgressBar',
);

describe('the ProgressBar IR', () => {
  it('wraps each platform’s progress bar, and every finding is decided', () => {
    expect(spec.base).toEqual({
      mui: 'LinearProgress',
      flutter: 'LinearProgressIndicator',
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('excuses the bar’s box, which the control draws at the value', () => {
    const v = oracle.variants.find((x) => x.figma === 'feedback=info');
    expect(v.layers.indicator.width).toBe(120);
    expect(
      v.excused
        .filter((e) => e.layer === 'indicator')
        .map((e) => e.property)
        .sort(),
    ).toEqual(['height', 'radius', 'width', 'x', 'y']);
  });
});

describe('the ProgressBar recipe', () => {
  const { styles } = renderMuiComponent(spec, tokens);

  it('fills its container, and declares nothing of the bar’s box', () => {
    expect(styles.root.width).toBe('100%');
    expect(styles.root['& .MuiLinearProgress-bar']).not.toHaveProperty('width');
    expect(styles.root['& .MuiLinearProgress-bar']).not.toHaveProperty('left');
  });

  it('colours the bar by feedback', () => {
    expect(
      styles.appearances['feedback=danger']['& .MuiLinearProgress-bar'],
    ).toEqual({
      backgroundColor: 'var(--solar-color-surface-feedback-danger-strong)',
    });
  });

  it('gives Flutter one radius and one height for the track and the bar', () => {
    const { cells } = renderFlutterComponent(spec, tokens);
    expect(cells['root.radius|base']).toBe(cells['indicator.radius|base']);
    expect(cells['root.height|base']).toBe('px:6');
  });
});
