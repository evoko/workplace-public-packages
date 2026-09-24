import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  explainVariant,
  formatSummary,
  formatVariant,
  loadReports,
  lookupCell,
  pickVariants,
  recipeProps,
} from '../src/explain/index.mjs';

const { built, tokens } = stage.build();
const of = (name) => {
  const b = built.find((x) => x.spec.component === name);
  return { spec: b.spec, oracle: b.oracle, tokens, reports: {} };
};
const variant = (ctx, figma) =>
  ctx.oracle.variants.find((v) => v.figma === figma);

describe('lookupCell', () => {
  it('finds the entry the recipe applies: a state that holds beats the resting value', () => {
    const ctx = of('Text Input');
    const focus = variant(ctx, 'size=sm, state=pressed');
    expect(lookupCell(ctx.spec, 'field', 'borderColor', focus)).toEqual({
      at: 'appearance default · focus',
      entry: expect.objectContaining({
        token: 'color.border.feedback.focus.strong',
      }),
    });
    expect(lookupCell(ctx.spec, 'field', 'paddingLeft', focus).at).toBe(
      'size sm',
    );
    expect(lookupCell(ctx.spec, 'field', 'radius', focus).at).toBe('base');
  });

  it('keys the appearance by the recipe’s axes, and a per-size entry beats it', () => {
    const ctx = of('Button');
    const v = variant(ctx, 'size=md, prio=tertiary, state=focus, danger=false');
    expect(lookupCell(ctx.spec, 'root', 'shadow', v)).toEqual({
      at: 'combined md · variant=tertiary, danger=false · focus',
      entry: expect.objectContaining({ token: 'shadow.focus.default' }),
    });
  });

  it('reads a derived state from the content the oracle fills the variant with', () => {
    const ctx = of('Text Input');
    expect(
      recipeProps(ctx.spec, variant(ctx, 'size=md, state=filled')).filled,
    ).toBe(true);
    expect(
      recipeProps(ctx.spec, variant(ctx, 'size=md, state=hover')).filled,
    ).toBe(false);
  });
});

describe('explainVariant', () => {
  it('chains Figma’s value, the recipe’s, the excuse and the platforms’ reports', () => {
    const ctx = of('Text Input');
    const focus = variant(ctx, 'size=sm, state=pressed');
    ctx.reports = {
      web: {
        failures: [],
        gaps: [
          {
            variant: focus.figma,
            layer: 'field',
            property: 'paddingLeft',
            rendered: '8px',
          },
        ],
        at: new Date(0),
      },
    };
    const [row] = explainVariant(ctx, focus, {
      layer: 'field',
      property: 'paddingLeft',
    });
    expect(row).toMatchObject({
      figma: 12,
      recipe: 8,
      agrees: false,
      entry: { token: 'inset.xs' },
      excuse: {
        finding: 'component.text input.field.paddingLeft@state=focus',
        decision: null,
      },
      web: { status: 'excused', value: '8px' },
      flutter: null,
    });
    const text = formatVariant(ctx, focus, [row], { full: true });
    expect(text).toContain('recipe   inset.xs = 8, from size sm  ≠ Figma');
    expect(text).toContain('web drew 8px (excused); Flutter not run');
  });

  it('draws the caller’s colour where the variant gives one, and caps a corner at half its box', () => {
    const avatar = of('Avatar');
    const dark = variant(
      avatar,
      'size=lg, type=text, color=neutral, shade=Dark',
    );
    const [bg] = explainVariant(avatar, dark, {
      layer: 'root',
      property: 'background',
    });
    expect(bg).toMatchObject({
      recipe: '#222222',
      agrees: true,
      caller: { prop: 'color' },
    });
    const slider = of('Slider');
    const [handle] = explainVariant(slider, slider.oracle.variants[0], {
      layer: 'handle',
      property: 'radius',
    });
    expect(handle).toMatchObject({ recipe: 9999, agrees: true });
  });

  // The strongest check of the lookup: it is the recipe's own precedence, so wherever Figma and
  // the code are not excused from agreeing, the entry it finds resolves to Figma's value.
  it('agrees with Figma wherever nothing excuses a difference, in every component', () => {
    const disagree = [];
    for (const b of built) {
      const ctx = { spec: b.spec, oracle: b.oracle, tokens, reports: {} };
      for (const v of b.oracle.variants)
        for (const r of explainVariant(ctx, v))
          if (r.agrees === false && !r.excuse && !v.layers[r.layer]?.hidden)
            disagree.push(
              `${b.spec.component} · ${v.figma} · ${r.layer}.${r.property}`,
            );
    }
    expect(disagree).toEqual([]);
  });
});

describe('pickVariants', () => {
  it('picks by number, by Figma’s name, or by parts that all hold', () => {
    const ctx = of('Text Input');
    expect(pickVariants(ctx.oracle, '5').map((v) => v.figma)).toEqual([
      'size=sm, state=pressed',
    ]);
    expect(pickVariants(ctx.oracle, 'size=md, state=hover')).toHaveLength(1);
    expect(pickVariants(ctx.oracle, 'state=hover')).toHaveLength(2);
    expect(pickVariants(ctx.oracle, 'state=nope')).toEqual([]);
  });
});

describe('the summary and the reports', () => {
  it('lists the variants and groups the excused differences by why', () => {
    const text = formatSummary(of('Text Input'));
    expect(text).toContain('Text Input: 12 variants');
    expect(text).toContain('last web check: not run');
    expect(text).toMatch(/root\.width {2}decided \(set\)/);
    expect(text).toContain('Failures in the last runs\n  none');
  });

  it('reads each platform’s failures and gaps, and leaves out a check that has not run', () => {
    const files = {
      'text-input-failures.json':
        '[{"variant":"v","layer":"l","property":"p"}]',
      'text-input-gaps.json': '[]',
    };
    const name = (p) => p.split('/').pop();
    const reports = loadReports('Text Input', {
      exists: (p) => name(p) in files && p.includes('/.out/'),
      read: (p) => files[name(p)],
      stat: () => ({ mtime: new Date(0) }),
    });
    expect(Object.keys(reports)).toEqual(['web']);
    expect(reports.web.failures).toHaveLength(1);
  });
});
