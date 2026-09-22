import { describe, expect, it } from 'vitest';
import { applyDeviation, DEVIATIONS } from '../src/normalize/deviations.mjs';

describe('applyDeviation', () => {
  it('converts the invalid ease-both keyword to a cubic bezier', () => {
    const r = applyDeviation(
      { doc: 'motion.ease.both', value: 'ease-both' },
      'cubicBezier',
    );
    expect(r.value).toEqual([0.42, 0, 0.58, 1]);
    expect(r.deviation.reason).toMatch(/not a valid CSS/i);
  });

  it('converts the other easing keywords without calling them defects', () => {
    expect(
      applyDeviation({ doc: 'motion.ease.in', value: 'ease-in' }, 'cubicBezier')
        .value,
    ).toEqual([0.42, 0, 1, 1]);
  });

  it('takes the numeric font weight from the token name, not the Figma style name', () => {
    const r = applyDeviation(
      { doc: 'type.font-weight.600', value: 'Semi Bold' },
      'fontWeight',
    );
    expect(r.value).toBe(600);
    expect(r.deviation.figmaValue).toBe('Semi Bold');
  });

  it('leaves everything else untouched and records no deviation', () => {
    const r = applyDeviation(
      { doc: 'color.surface.base', value: '#ffffff' },
      'color',
    );
    expect(r.value).toBe('#ffffff');
    expect(r.deviation).toBeNull();
  });

  it('exports every deviation with a reason', () => {
    for (const d of DEVIATIONS) expect(d.reason.length).toBeGreaterThan(20);
  });
});
