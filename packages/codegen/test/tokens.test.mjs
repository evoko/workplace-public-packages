import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';

const { spec, deviations } = buildTokenSpec(loadContract());
const flat = new Map(flattenSpec(spec).map((t) => [t.name, t]));

describe('buildTokenSpec', () => {
  it('nests doc names into a DTCG tree', () => {
    expect(spec.color.surface.background.$type).toBe('color');
    expect(spec.color.surface.background.$value).toBe('#f5f5f5');
  });

  it('carries Light and Dark as modes for colour', () => {
    expect(
      spec.color.surface.background.$extensions['com.biamp.solar'].modes,
    ).toEqual({
      light: '#f5f5f5',
      dark: '#111111',
    });
  });

  it('carries Desktop and Mobile as modes for type', () => {
    expect(spec.type.size.body.md.$extensions['com.biamp.solar'].modes).toEqual(
      {
        desktop: '14px',
        mobile: '14px',
      },
    );
  });

  it('includes the SOLAR Web Layout collection', () => {
    expect(flat.get('layout.grid.columns.lg').value).toBe(12);
    expect(flat.get('layout.grid.gutter.md').value).toBe('20px');
  });

  it('emits easings as cubic beziers, not CSS keywords', () => {
    expect(flat.get('motion.ease.both').value).toEqual([0.42, 0, 0.58, 1]);
  });

  it('emits numeric font weights and keeps the Figma style name', () => {
    const w = flat.get('type.font-weight.600');
    expect(w.value).toBe(600);
    expect(w.ext.figmaStyleName).toBe('Semi Bold');
  });

  it('adds shadows, typography and the z-index ladder', () => {
    expect(flat.get('shadow.control').type).toBe('shadow');
    expect(flat.get('typography.label.md').type).toBe('typography');
    expect(flat.get('z.dialog').value).toBe(400);
  });

  it('skips the utility text styles that live inside the Figma file', () => {
    expect([...flat.keys()].some((k) => k.includes('utility'))).toBe(false);
  });

  it('covers every variable in the contract', () => {
    const contract = loadContract();
    for (const v of contract.variables)
      expect(flat.has(v.doc), v.doc).toBe(true);
  });

  it('does not depend on the order the variables arrive in', () => {
    // color.border.inverse is both a value and the namespace root of .subtle and .strong.
    // If the parent is written after its children, a naive assignment drops them.
    const contract = loadContract();
    const reversed = buildTokenSpec({
      ...contract,
      variables: [...contract.variables].reverse(),
    });
    expect(flattenSpec(reversed.spec).length).toBe(flattenSpec(spec).length);
    const names = new Set(flattenSpec(reversed.spec).map((t) => t.name));
    expect(names.has('color.border.inverse')).toBe(true);
    expect(names.has('color.border.inverse.subtle')).toBe(true);
    expect(names.has('color.border.inverse.strong')).toBe(true);
  });

  it('reports the deviations it applied', () => {
    expect(deviations.length).toBeGreaterThan(0);
    for (const d of deviations) expect(d.reason).toBeTruthy();
  });
});
