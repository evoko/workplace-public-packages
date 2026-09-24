/**
 * FAB (milestone 4, F2's pioneer): its IR, and the recipe each emitter makes of it. On Button's
 * machinery; its type is derived from its label (the overlay's `derive`), and its focus draws the
 * ring Figma leaves off (a `set` that adds the state's entry).
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'FAB',
);

describe('the FAB IR', () => {
  it('takes a size, disabled and loading, its type following from its label', () => {
    expect(spec.api).toEqual({
      size: { values: ['sm', 'md'], default: 'sm' },
      disabled: { type: 'boolean', default: false },
      loading: { type: 'boolean', default: false },
    });
    expect(spec.derived.type).toMatchObject({
      values: ['icon', 'extended'],
      default: 'icon',
      when: [
        { value: 'extended', given: ['label'] },
        { value: 'icon', given: [] },
      ],
    });
    expect(Object.keys(spec.slots).sort()).toEqual(['icon', 'label']);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('draws the focus ring Figma leaves off, in a focus entry the IR did not have', () => {
    expect(spec.style.root.appearance['type=icon'].focus.shadow).toMatchObject({
      token: 'shadow.focus.default',
      replaced: { token: 'shadow.overlay' },
    });
    const focus = oracle.variants.find(
      (v) => v.figma === 'type=icon, size=sm, state=focus',
    );
    expect(
      focus.excused
        .filter((e) => e.property === 'shadow')
        .map((e) => e.decision),
    ).toEqual(['set']);
  });

  it('keeps its size while loading, where Figma narrows the extended one', () => {
    const loading = oracle.variants.find(
      (v) => v.figma === 'type=extended, size=sm, state=loading',
    );
    expect(loading.content).toEqual(['label']);
    expect(
      loading.excused
        .filter((e) => e.layer === 'root')
        .map((e) => [e.property, e.decision])
        .sort(),
    ).toEqual([
      ['paddingRight', 'accept'],
      ['width', 'accept'],
    ]);
  });
});

describe('the FAB recipe', () => {
  it('keys its style by the derived type, which the shell sets, and no prop exposes', () => {
    const { ts } = renderMuiComponent(spec, tokens);
    expect(ts).toContain(
      'export interface SolarFABRecipeProps extends SolarFABProps {\n  type?: SolarFABType;\n}',
    );
    expect(ts).toContain(
      'export function solarFABStyle(props: SolarFABRecipeProps = {})',
    );
    expect(ts).not.toMatch(/interface SolarFABProps \{[^}]*type\?/);
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain('this.type = SolarFABType.icon,');
  });

  it('leaves the foreground unset where an icon FAB has no label', () => {
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain(
      "foregroundColor: by((s) => lookup('label.color', p, s) == null ? null : color(t, 'label.color', p, s)),",
    );
  });
});
