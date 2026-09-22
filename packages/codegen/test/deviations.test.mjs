import { describe, expect, it } from 'vitest';
import { applyDeviation, DEVIATIONS } from '../src/normalize/deviations.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderDeviations } from '../src/report/deviations.mjs';

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

describe('renderDeviations', () => {
  const build = () => {
    const { deviations } = buildTokenSpec(loadContract());
    return { deviations, md: renderDeviations(deviations, '2026-09-20') };
  };

  it('writes one row per deviation, under the header', () => {
    const { deviations, md } = build();
    const rows = md.split('\n').filter((l) => l.startsWith('| `'));
    expect(rows).toHaveLength(deviations.length);
    expect(md).toContain('| Token | Figma value | Why we differ | Action |');
    expect(md).toContain('Figma file version `2026-09-20`');
  });

  it('names every deviating token exactly once', () => {
    const { deviations, md } = build();
    // Task 12 was written against a stale count of 10; the contract on disk yields 13:
    // nine font weights, motion.ease.both, color.border.inverse and the two
    // typography.display.xs.* styles with no Mobile line height.
    expect(deviations).toHaveLength(13);
    for (const d of deviations) {
      const hits = md
        .split('\n')
        .filter((l) => l.startsWith(`| \`${d.token}\` |`));
      expect(hits, d.token).toHaveLength(1);
    }
  });

  it('escapes a pipe in a value so the table survives it', () => {
    const md = renderDeviations(
      [
        {
          token: 'motion.ease.fake',
          figmaValue: 'a | b',
          reason: 'has a | pipe',
          raise: 'raise | it',
        },
      ],
      'test',
    );
    const row = md.split('\n').find((l) => l.startsWith('| `'));
    expect(row).toBe(
      '| `motion.ease.fake` | a \\| b | has a \\| pipe | raise \\| it |',
    );
    expect(row.replaceAll('\\|', '')).toBe(
      '| `motion.ease.fake` | a  b | has a  pipe | raise  it |',
    );
  });

  it('falls back to "no action" when a deviation needs none', () => {
    const md = renderDeviations(
      [{ token: 'a.b', figmaValue: 'x', reason: 'y', raise: null }],
      'test',
    );
    expect(md).toContain('| `a.b` | x | y | no action |');
  });

  it('dedupes by token if a rule ever fires twice', () => {
    const d = { token: 'a.b', figmaValue: 'x', reason: 'y', raise: null };
    const md = renderDeviations([d, { ...d }], 'test');
    expect(md.split('\n').filter((l) => l.startsWith('| `'))).toHaveLength(1);
  });

  it('says so plainly when there is nothing to report', () => {
    expect(renderDeviations([], 'test')).toContain('No deviations.');
  });
});
