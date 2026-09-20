import { describe, expect, it } from 'vitest';

import {
  compareValues,
  formatDifferences,
  MAX_LINES,
  type Difference,
} from './compare';

describe('compareValues', () => {
  it('tolerates sub-pixel drift only for px lengths', () => {
    expect(compareValues('16px', '16.4px')).toBe(true);
    expect(compareValues('16px', '16.6px')).toBe(false);
    expect(compareValues('0.15s', '0.25s')).toBe(false);
    expect(compareValues('0.15s', '0s')).toBe(false);
    expect(compareValues('0.4', '0.85')).toBe(false);
    expect(compareValues('rgb(1, 2, 3)', 'rgb(1, 2, 4)')).toBe(false);
    expect(
      compareValues(
        'rgb(63, 140, 255) 0px 0px 0px 2px',
        'rgb(63, 140, 255) 0px 0px 0px 2.4px',
      ),
    ).toBe(true);
    // A px number never matches the same number in another unit.
    expect(compareValues('16px', '16')).toBe(false);
  });

  it('accepts numbers within half a pixel and rejects beyond', () => {
    expect(compareValues('14px', '14.4px')).toBe(true);
    expect(compareValues('14px', '14.6px')).toBe(false);
    expect(
      compareValues(
        '0px 0px 0px 2px rgb(63, 140, 255)',
        '0px 0px 0px 2.3px rgb(63, 140, 255)',
      ),
    ).toBe(true);
    expect(compareValues('rgb(63, 140, 255)', 'rgb(63, 141, 255)')).toBe(false);
  });

  it('compares everything else exactly', () => {
    expect(compareValues('inline-flex', 'inline-flex')).toBe(true);
    expect(compareValues('inline-flex', 'flex')).toBe(false);
    expect(
      compareValues(
        '"Open Sans", Arial, sans-serif',
        '"Open Sans", Arial, sans-serif',
      ),
    ).toBe(true);
    expect(compareValues('none', 'rgb(0, 0, 0) 0px 0px 0px 0px')).toBe(false);
    expect(compareValues('1e3', '1000')).toBe(true);
  });

  it('formats differences one per line, sorted, with a count', () => {
    const diffs: Difference[] = [
      {
        component: 'chip',
        row: 'tone=loud hover',
        mode: 'light',
        target: 'mui',
        element: 'root',
        property: 'color',
        expected: 'rgb(1, 1, 1)',
        actual: 'rgb(2, 2, 2)',
      },
      {
        component: 'chip',
        row: 'base',
        mode: 'dark',
        target: 'tailwind',
        element: 'icon',
        property: 'width',
        expected: '20px',
        actual: '18px',
      },
    ];
    expect(formatDifferences(diffs)).toBe(
      [
        '2 rendered differences against the css cell:',
        'chip | base | dark | tailwind | icon | width: css 20px vs tailwind 18px',
        'chip | tone=loud hover | light | mui | root | color: css rgb(1, 1, 1) vs mui rgb(2, 2, 2)',
        '2 rendered differences in total',
      ].join('\n'),
    );
  });

  it('lists at most MAX_LINES differences and counts the rest', () => {
    const diffs: Difference[] = Array.from(
      { length: MAX_LINES + 7 },
      (_unused, i) => ({
        component: 'chip',
        row: `r${String(i).padStart(4, '0')}`,
        mode: 'light',
        target: 'mui',
        element: 'root',
        property: 'color',
        expected: 'rgb(1, 1, 1)',
        actual: 'rgb(2, 2, 2)',
      }),
    );
    const lines = formatDifferences(diffs).split('\n');
    expect(lines[0]).toBe(
      `${MAX_LINES + 7} rendered differences against the css cell:`,
    );
    // Header, MAX_LINES differences, the remainder note, the trailer.
    expect(lines).toHaveLength(MAX_LINES + 3);
    expect(lines.at(-2)).toBe('… and 7 more');
    // `verify --rendered` keeps only the tail, so the count is repeated last.
    expect(lines.at(-1)).toBe(
      `${MAX_LINES + 7} rendered differences in total (${MAX_LINES} shown)`,
    );
  });

  it('uses the singular form for one difference', () => {
    const line = formatDifferences([
      {
        component: 'chip',
        row: 'base',
        mode: 'light',
        target: 'mui',
        element: 'root',
        property: 'color',
        expected: 'rgb(1, 1, 1)',
        actual: 'rgb(2, 2, 2)',
      },
    ]).split('\n');
    expect(line[0]).toBe('1 rendered difference against the css cell:');
    expect(line.at(-1)).toBe('1 rendered difference in total');
  });
});
