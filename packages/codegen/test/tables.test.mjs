/**
 * Tables and properties (milestone 4, F11): their IRs, and the machinery they brought: a gradient
 * paint (Table's mobile fade) read from Figma to both recipes and the oracle, a hover a description
 * asks for where Figma draws none (Row's), and a cell's type following from its content.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';
import { parseGradient, runOf } from '../src/normalize/gradient.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);

describe('a linear gradient', () => {
  const figma =
    'linear-gradient(0,0.68 → 1,0.68: {Primitives:color/alpha/transparent} 0%, {Color:surface/base} 100%)';

  it('is read as its handles and its stops, each at its place', () => {
    expect(parseGradient(figma)).toEqual({
      from: [0, 0.68],
      to: [1, 0.68],
      stops: [
        { paint: '{Primitives:color/alpha/transparent}', position: 0 },
        { paint: '{Color:surface/base}', position: 1 },
      ],
    });
    expect(parseGradient('{Color:surface/base}')).toBeNull();
  });

  it('runs across or down its box, its stops placed from edge to edge', () => {
    const across = runOf({ from: [0.25, 0.5], to: [0.75, 0.5] }, 'here');
    expect(across.direction).toBe('to right');
    expect(across.place(0)).toBe(0.25);
    expect(across.place(1)).toBe(0.75);
    const up = runOf({ from: [0.5, 1], to: [0.5, 0] }, 'here');
    expect(up.direction).toBe('to top');
    expect(up.place(0)).toBe(0);
    expect(() => runOf({ from: [0, 0], to: [1, 1] }, 'here')).toThrow(
      /neither across nor down/,
    );
  });
});

describe('the Table IR', () => {
  const { spec, deviations, oracle } = of('Table');
  const fade =
    spec.style.dimming.appearance[
      'breakpoint=mobile, expandable=true, selectable=true'
    ].default;

  it('paints the mobile fade with the surface colour, faded out, no primitive in it', () => {
    expect(fade.background.gradient).toEqual({
      from: [0, 0.68],
      to: [1, 0.68],
      stops: [
        { token: 'color.surface.base', position: 0, alpha: 0 },
        { token: 'color.surface.base', position: 1 },
      ],
    });
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('pins the fade to the table’s right edge, as Figma constrains it', () => {
    expect(fade.right).toMatchObject({ position: 0 });
    expect(fade.x).toBeUndefined();
  });

  it('expects the fade Figma draws in the oracle, a stop with no alpha transparent', () => {
    const mobile = oracle.variants.find((v) => v.props.breakpoint === 'mobile');
    expect(mobile.layers.dimming.background).toBe(
      'linear-gradient(to right, transparent 0%, #ffffff 100%)',
    );
  });

  it('draws it as CSS, the faded stop transparent, and clears it where the layer is a colour', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    const css = JSON.stringify(styles);
    expect(css).toContain(
      'linear-gradient(to right, transparent 0%, var(--solar-color-surface-base) 100%)',
    );
  });

  it('draws it in Flutter as a LinearGradient between Figma’s handles', () => {
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain(
      "'lg:0' => LinearGradient(begin: const Alignment(-1.00, 0.36), end: const Alignment(1.00, 0.36), colors: [c.surfaceBase.withValues(alpha: 0.00), c.surfaceBase], stops: const [0.00, 1.00]),",
    );
    // A recipe with no gradient has none of this.
    expect(renderFlutterComponent(of('Row').spec, tokens).dart).not.toContain(
      'Gradient',
    );
  });
});

describe('the Row IR', () => {
  const { spec } = of('Row');

  it('draws a hover its description asks for, where Figma draws none', () => {
    expect(spec.states).toContain('hover');
    expect(
      spec.style.root.appearance['type=top'].hover.background,
    ).toMatchObject({ token: 'color.surface.hover' });
    // The header row has none.
    expect(spec.style.root.appearance['type=title']?.hover).toBeUndefined();
  });

  it('reads Figma’s five sample cells as one, its first', () => {
    expect(spec.layers.columnItem.repeat).toBe(5);
    expect(spec.layers.columnItem2).toBeUndefined();
  });
});

describe('the cells’ IRs', () => {
  it('derive a Column Item’s type, and a PropertyRow’s trailing, from their content', () => {
    expect(Object.keys(of('Column Item').spec.api)).toEqual(['header']);
    expect(of('Column Item').spec.derived.type).toBeDefined();
    expect(Object.keys(of('PropertyRow').spec.api)).toEqual(['inCard']);
    expect(of('PropertyRow').spec.derived.trailing).toBeDefined();
  });

  it('decide every finding in the family', () => {
    for (const name of [
      'Column Item',
      'RowSelect',
      'Row',
      'Table',
      'TableHeader',
      'TableFooter',
      'PropertyRow',
      'PropertyList',
    ])
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
  });
});
