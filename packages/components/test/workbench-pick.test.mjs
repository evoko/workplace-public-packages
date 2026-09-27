/**
 * The workbench bar's pointing rule (stories/workbench/pick.ts): which layer a click in the
 * Playground's box selects.
 */

import { describe, expect, it } from 'vitest';
import { layerAt } from '../stories/workbench/pick.ts';

/** A tiny element tree: each node `{ classList, parentElement }`. */
const el = (classes, parent = null) => ({
  classList: { contains: (c) => classes.includes(c) },
  parentElement: parent,
});

describe('pointing at the component', () => {
  const box = el([]);
  const root = el(['MuiButton-root'], box);
  const label = el(['SolarButton-label'], root);
  const inner = el([], label);
  const classes = {
    label: 'SolarButton-label',
    counter: 'SolarButton-counter',
    root: null,
  };

  it('selects the nearest layer whose class the clicked element or an ancestor carries', () => {
    expect(layerAt(inner, box, classes)).toBe('label');
  });

  it('selects the root for anything inside the box that no layer class claims', () => {
    expect(layerAt(root, box, classes)).toBe('root');
  });

  it('never looks past the box', () => {
    const outside = el(['SolarButton-label']);
    const inBox = el([], outside);
    expect(layerAt(el([], inBox), inBox, classes)).toBe('root');
  });
});
