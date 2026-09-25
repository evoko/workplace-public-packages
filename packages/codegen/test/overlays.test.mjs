/**
 * Overlays and dialogs (milestone 4, F12): their IRs, and the machinery they brought: a vector's
 * outline turned as Figma turns it (Tooltip's side arrows), a layer pinned to its parent's centre
 * (Tooltip's arrow, Coachmark's title), Figma's sample content read as the caller's (`examples`,
 * Split Dialog's panes), a variant laying its children out in another order (Popover's tip), and
 * a layer placed from one edge in one variant and another in the next (Coachmark's connector).
 */

import { describe, expect, it } from 'vitest';
import { drawnPath } from '../../../docs/solar-web/raw/drawn-path.mjs';
import { overrides } from '../../../docs/solar-web/raw/variant-diff.mjs';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';
import { ordersOf } from '../src/normalize/placement.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);

describe('a vector’s outline', () => {
  it('is Figma’s own where the layer is not turned', () => {
    const n = {
      relativeTransform: [
        [1, 0, 4],
        [0, 1, 2],
      ],
      size: { x: 7, y: 3 },
    };
    expect(drawnPath('M0 0L7 0L3.5 3Z', n)).toBe('M0 0L7 0L3.5 3Z');
  });

  it('is turned as Figma turns the layer, back in its box, H and V as lines', () => {
    // Half a turn: a 10 × 10 triangle's corner at the origin lands at the far corner.
    const half = {
      relativeTransform: [
        [-1, 0, 10],
        [0, -1, 10],
      ],
      size: { x: 10, y: 10 },
    };
    expect(drawnPath('M0 0L10 0L0 10Z', half)).toBe('M10 10L0 10L10 0Z');
    // A quarter turn of a 7 × 3 arrow is 3 × 7.
    const quarter = {
      relativeTransform: [
        [0, -1, 0],
        [1, 0, 0],
      ],
      size: { x: 7, y: 3 },
    };
    expect(drawnPath('M0 0H7V3Z', quarter)).toBe('M3 0L3 7L0 7Z');
  });
});

describe('the fetcher’s order', () => {
  const base = {
    name: 'placement=top',
    children: [{ name: 'Content' }, { name: 'Tip' }],
  };

  it('records a layer a variant draws in another place among the siblings both share', () => {
    const bottom = {
      name: 'placement=bottom',
      children: [{ name: 'Tip' }, { name: 'Content' }],
    };
    const { changed } = overrides(base, bottom);
    expect(changed['/Tip'].order).toBe(0);
    expect(changed['/Content'].order).toBe(1);
  });

  it('records none where only an added sibling moves the others', () => {
    const more = {
      name: 'placement=top',
      children: [{ name: 'Header' }, { name: 'Content' }, { name: 'Tip' }],
    };
    expect(overrides(base, more).changed ?? {}).toEqual({});
  });
});

describe('a laid-out layer’s rank', () => {
  const variant = (name, order, placed = {}) => ({
    name,
    layers: new Map([
      ['/', {}],
      ...order.map((p) => [p, placed[p] ? { position: [0, 0] } : {}]),
    ]),
    parents: new Map([['/', null], ...order.map((p) => [p, '/'])]),
  });

  it('is given where variants lay a parent’s children out in different orders', () => {
    const ranks = ordersOf([
      variant('top', ['/Content', '/Tip']),
      variant('bottom', ['/Tip', '/Content']),
    ]);
    expect(Object.fromEntries(ranks.get('/Tip'))).toEqual({
      top: 1,
      bottom: 0,
    });
    expect(Object.fromEntries(ranks.get('/Content'))).toEqual({
      top: 0,
      bottom: 1,
    });
  });

  it('is not given for a layer placed by position, whatever Figma lists first', () => {
    const ranks = ordersOf([
      variant('top', ['/Content', '/arrow'], { '/arrow': true }),
      variant('bottom', ['/arrow', '/Content'], { '/arrow': true }),
    ]);
    expect(ranks.size).toBe(0);
  });
});

describe('the Popover IR', () => {
  const { spec, deviations, oracle } = of('Popover');

  it('puts its tip before the bubble where it points up or left, as Figma draws it', () => {
    expect(spec.style.tip.base.order).toMatchObject({ position: 1 });
    expect(
      spec.style.tip.appearance['placement=bottom'].default.order,
    ).toMatchObject({ position: 0 });
    expect(
      spec.style.content.appearance['placement=right'].default.order,
    ).toMatchObject({ position: 1 });
    const bottom = oracle.variants.find((v) => v.props.placement === 'bottom');
    expect(bottom.layers.tip.order).toBe(0);
    expect(bottom.layers.content.order).toBe(1);
  });

  it('draws the order on both platforms', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(JSON.stringify(styles)).toContain('"order":0');
    expect(renderFlutterComponent(spec, tokens).dart).toContain(
      "'tip.order|base': 'px:1',",
    );
  });

  it('decides every finding', () => {
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });
});

describe('the Coachmark IR', () => {
  const { spec, oracle } = of('Coachmark');
  const connector = spec.style.connector;

  it('pins its connector to the edge it leaves, AUTO from the other', () => {
    expect(connector.base.right).toMatchObject({ position: -100 });
    expect(connector.base.x).toMatchObject({ keyword: 'AUTO' });
    const left = connector.appearance['side=left'].default;
    expect(left.x).toMatchObject({ position: -100 });
    expect(left.right).toMatchObject({ keyword: 'AUTO' });
    // The oracle has Figma's edges alone.
    const right = oracle.variants.find((v) => v.props.side === 'right');
    expect(right.layers.connector.x).toBeUndefined();
  });

  it('draws AUTO as no edge: auto on the web, absent in Flutter', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(JSON.stringify(styles)).toContain('"left":"auto"');
    expect(renderFlutterComponent(spec, tokens).dart).toContain(
      "'connector.x|base': 'k:AUTO',",
    );
  });

  it('centres its title in its header, as Figma pins it', () => {
    expect(spec.style.title.base.centerX).toMatchObject({ position: 0.5 });
    expect(spec.style.title.base.centerY).toMatchObject({ position: 0 });
  });
});

describe('the ConfirmationDialog IR', () => {
  it('is the 400 Figma draws, where Figma records its frame hugging what all fills', () => {
    const { spec } = of('ConfirmationDialog');
    expect(spec.style.root.base.width).toMatchObject({
      literal: 400,
      from: 'overlay',
      replaced: { keyword: 'HUG' },
    });
    expect(renderFlutterComponent(spec, tokens).dart).toContain(
      "'root.width|base': 'px:400',",
    );
  });
});

describe('Figma’s sample content', () => {
  it('is the caller’s: a Split Dialog’s panes hold no layers of Figma’s', () => {
    const { spec } = of('Split Dialog');
    for (const pane of ['/Body/left', '/Body/right', '/Body/Container/left'])
      expect(
        Object.values(spec.layers).filter((l) => l.path.startsWith(`${pane}/`)),
        pane,
      ).toEqual([]);
    expect(spec.slots.left.type).toBe('content');
  });
});

describe('the family’s IRs', () => {
  it('decide every finding', () => {
    for (const name of [
      'Dialog',
      'Scrim',
      'ConfirmationDialog',
      'Split Dialog',
      'Drawer',
      'Tooltip',
      'Popover',
      'Coachmark',
    ])
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
  });
});
