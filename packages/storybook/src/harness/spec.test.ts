import { describe, expect, it } from 'vitest';

import { cellId, rowKey, rowsFor, type CompareSpec } from './spec';

export const SPEC: CompareSpec = {
  name: 'chip',
  displayName: 'Chip',
  rootElement: 'button',
  axes: [
    { name: 'tone', values: ['quiet', 'loud'], default: 'quiet' },
    { name: 'size', values: ['sm', 'md'], default: 'md' },
  ],
  states: [
    { name: 'hover', kind: 'hover' },
    {
      name: 'disabled',
      kind: 'attribute',
      attributes: { disabled: '' },
      muiProp: 'disabled',
    },
  ],
  slots: [{ name: 'icon', element: 'span', content: 'plus' }],
  label: 'Chip',
  labelSlot: null,
  labelElement: 'span',
  tailwind: true,
  mui: null,
};

describe('rowsFor', () => {
  it('enumerates every axis permutation times base and each state, last axis fastest', () => {
    const rows = rowsFor(SPEC);
    expect(rows).toHaveLength(4 * 3);
    expect(rows.slice(0, 3)).toEqual([
      { axes: { tone: 'quiet', size: 'sm' }, state: null },
      { axes: { tone: 'quiet', size: 'sm' }, state: 'hover' },
      { axes: { tone: 'quiet', size: 'sm' }, state: 'disabled' },
    ]);
    expect(rows[11]).toEqual({
      axes: { tone: 'loud', size: 'md' },
      state: 'disabled',
    });
    expect(rowsFor({ ...SPEC, axes: [], states: [] })).toEqual([
      { axes: {}, state: null },
    ]);
  });

  it('keys rows and cells stably', () => {
    expect(rowKey({ axes: { tone: 'loud', size: 'sm' }, state: 'hover' })).toBe(
      'tone=loud size=sm hover',
    );
    expect(rowKey({ axes: { tone: 'loud', size: 'sm' }, state: null })).toBe(
      'tone=loud size=sm base',
    );
    expect(rowKey({ axes: {}, state: null })).toBe('base');
    expect(cellId('mui', { axes: { tone: 'loud' }, state: null })).toBe(
      'mui|tone=loud base',
    );
  });
});
