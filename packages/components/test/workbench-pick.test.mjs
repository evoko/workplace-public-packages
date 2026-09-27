/**
 * The Inspect dialog's pointing rule (stories/workbench/pick.ts): where a layer is in the preview,
 * and which layer a click there selects, by the inspection's selectors (the recipe's slot table),
 * a case's `data-layer` marks first.
 */

import { describe, expect, it } from 'vitest';
import {
  layerAt,
  layerElement,
  queryOf,
  selectorOf,
} from '../stories/workbench/pick.ts';

/**
 * A stand-in element: its parent, its attributes, and what each query under it finds (the queries
 * pick asks, answered from `found`, keyed by the query).
 */
function el(parent = null, attributes = {}) {
  const node = {
    parentElement: parent,
    found: {},
    hasAttribute: (name) => name in attributes,
    querySelector: (q) => node.found[q]?.[0] ?? null,
    querySelectorAll: (q) => node.found[q] ?? [],
  };
  return node;
}

describe('a layer’s selector', () => {
  it('is the inspection’s, else its class’s, the root’s `&`', () => {
    expect(selectorOf({ name: 'x', className: 'A', selector: '& .MuiX' })).toBe(
      '& .MuiX',
    );
    expect(selectorOf({ name: 'x', className: 'SolarX--x' })).toBe(
      '& .SolarX--x',
    );
    expect(selectorOf({ name: 'root', className: null })).toBe('&');
    expect(selectorOf({ name: 'x', className: null })).toBeNull();
  });

  it('is asked under the root element, `&` being the root itself', () => {
    expect(queryOf('&')).toBeNull();
    expect(queryOf('& .MuiButton-startIcon')).toBe(
      ':scope .MuiButton-startIcon',
    );
    expect(queryOf('& > :nth-child(2)')).toBe(':scope > :nth-child(2)');
  });
});

describe('pointing at Button', () => {
  // Button's root holds its words (the label, `&`), MUI's start icon and the counter.
  const root = el();
  const icon = el(root);
  const glyph = el(icon);
  const counter = el(root);
  root.found[':scope .MuiButton-startIcon'] = [icon];
  root.found[':scope .SolarButton-counter'] = [counter];
  const layers = [
    { name: 'root', className: null, selector: '&' },
    { name: 'iconLeading', className: 'x', selector: '& .MuiButton-startIcon' },
    { name: 'label', className: 'y', selector: '&' },
    { name: 'counter', className: 'z', selector: '& .SolarButton-counter' },
  ];

  it('selects the nearest layer the clicked element or an ancestor is', () => {
    expect(layerAt(glyph, root, layers)).toBe('iconLeading');
    expect(layerAt(counter, root, layers)).toBe('counter');
  });

  it('selects the root where several layers share its element (the label’s words)', () => {
    expect(layerAt(root, root, layers)).toBe('root');
  });

  it('selects the root for a click outside the component', () => {
    const stage = el();
    expect(layerAt(stage, root, layers)).toBe('root');
  });

  it('finds each layer’s element, the label on the root’s', () => {
    expect(layerElement(root, layers[1])).toBe(icon);
    expect(layerElement(root, layers[2])).toBe(root);
  });
});

describe('a case’s marks', () => {
  it('win over the selector, and what is inside a marked child is the child’s', () => {
    const root = el();
    const child = el(root, { 'data-layer': '' });
    const inner = el(child);
    root.found[':scope [data-layer="secondaryCTA"]'] = [child];
    root.found[':scope > *'] = [child];
    root.found[':scope .SolarX--title'] = [inner];
    const layers = [
      { name: 'root', className: null, selector: '&' },
      { name: 'secondaryCTA', className: null, selector: '& > *' },
      { name: 'title', className: null, selector: '& .SolarX--title' },
    ];
    expect(layerElement(root, layers[1])).toBe(child);
    // The title class inside the marked child is the child's own layer, not the parent's.
    expect(layerElement(root, layers[2])).toBeNull();
    expect(layerAt(inner, root, layers)).toBe('secondaryCTA');
  });
});
