import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { muiMapping } from '../src/targets/mui/hints.js';
import { manifestLocation, planMapping } from '../src/targets/mui/mapping.js';
import {
  computeResets,
  effectiveValue,
  parseContext,
  SHORTHAND_LONGHANDS,
} from '../src/targets/mui/resets.js';
import { BTN_FILES, FX_CATALOG } from './mui-mapped-fixture.js';
import { twBuild, twRoot } from './tailwind-fixture.js';

const SLOTS = { 'MuiButton-startIcon': 'icon' };

describe('parseContext', () => {
  it.each([
    ['&', { slot: 'root', states: [], specificity: 1 }],
    ['&:hover', { slot: 'root', states: ['hover'], specificity: 2 }],
    ['&.Mui-disabled', { slot: 'root', states: ['disabled'], specificity: 2 }],
    [
      '&.Mui-focusVisible:active',
      { slot: 'root', states: ['focus-visible', 'active'], specificity: 3 },
    ],
    [
      '&[aria-pressed="true"]',
      { slot: 'root', states: ['pressed'], specificity: 2 },
    ],
    ['&.MuiButton-loading', { slot: 'root', states: [], specificity: 2 }],
    ['&::-moz-focus-inner', { slot: null, states: [], specificity: 1 }],
    ['& .MuiButton-startIcon', { slot: 'icon', states: [], specificity: 2 }],
    [
      '&:hover .MuiButton-startIcon',
      { slot: 'icon', states: ['hover'], specificity: 3 },
    ],
    [
      '& .MuiButton-startIcon:hover',
      { slot: 'icon', states: [], specificity: 3 },
    ],
    [
      '& .MuiButton-startIcon::before',
      { slot: null, states: [], specificity: 2 },
    ],
    ['& > *:nth-of-type(1)', { slot: null, states: [], specificity: 2 }],
    ['& .MuiOther-thing', { slot: null, states: [], specificity: 2 }],
    [
      '& .MuiButton-startIcon > svg',
      { slot: null, states: [], specificity: 2 },
    ],
    ['&:not(.a.b)', { slot: 'root', states: [], specificity: 3 }],
    ['&:is(.a, .b)', { slot: 'root', states: [], specificity: 2 }],
    ['&:where(.a)', { slot: 'root', states: [], specificity: 1 }],
    ['&&', { slot: 'root', states: [], specificity: 2 }],
    [
      '& .MuiButton-startIcon>*:nth-of-type(1)',
      { slot: null, states: [], specificity: 3 },
    ],
    ['& button', { slot: null, states: [], specificity: 1 }],
  ])('%s', (selector, expected) => {
    expect(parseContext(selector, SLOTS)).toEqual(expected);
  });
});

function resetsFor(files = BTN_FILES, catalog = FX_CATALOG) {
  const { ir } = twBuild(twRoot(files));
  const component = ir.components.btn;
  const plan = planMapping(
    component,
    muiMapping(component)!,
    catalog.frameworkComponents.Button,
    catalog.components.btn,
    new Diagnostics(),
  )!;
  const diag = new Diagnostics();
  const resets = computeResets(
    ir,
    component,
    plan,
    catalog.components.btn,
    diag,
    manifestLocation(component),
  );
  return { resets, diag, ir };
}

describe('computeResets', () => {
  it('knows the shorthands MUI emits', () => {
    expect(SHORTHAND_LONGHANDS.border).toHaveLength(12);
    expect(SHORTHAND_LONGHANDS.transition).toEqual([
      'transition-property',
      'transition-duration',
      'transition-timing-function',
      'transition-delay',
    ]);
    expect(SHORTHAND_LONGHANDS.padding).toEqual([
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
    ]);
  });

  it('reverts what the design system never sets, restates lower-specificity values, skips the rest', () => {
    const { resets, diag } = resetsFor();
    expect(diag.errors).toEqual([]);
    expect(resets).toEqual([
      {
        props: { variant: 'quiet' },
        style: {
          '&': {
            WebkitTapHighlightColor: 'revert',
            minWidth: 'revert',
            textTransform: 'revert',
            transitionDelay: 'revert',
            transitionDuration: 'revert',
            transitionProperty: 'revert',
            transitionTimingFunction: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '&:hover': {
            textDecorationColor: 'revert',
            textDecorationLine: 'revert',
            textDecorationStyle: 'revert',
            textDecorationThickness: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '&.Mui-disabled': {
            color: 'var(--fx-palette-tokens-text-default)',
            pointerEvents: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '@media (hover: hover)': {
            '&:hover': { '--variant-containedBg': 'revert' },
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: {
          '& .MuiButton-startIcon': {
            display: 'revert',
            marginRight: 'revert',
          },
        },
      },
      {
        props: { variant: 'quiet' },
        style: { '& .MuiButton-startIcon::before': { content: 'none' } },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&': {
            WebkitTapHighlightColor: 'revert',
            textTransform: 'revert',
            transitionDelay: 'revert',
            transitionDuration: 'revert',
            transitionProperty: 'revert',
            transitionTimingFunction: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&:hover': {
            textDecorationColor: 'revert',
            textDecorationLine: 'revert',
            textDecorationStyle: 'revert',
            textDecorationThickness: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '&.Mui-disabled': {
            color: 'var(--fx-palette-tokens-text-default)',
            pointerEvents: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '@media (hover: hover)': {
            '&:hover': { '--variant-containedBg': 'revert' },
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: {
          '& .MuiButton-startIcon': {
            display: 'revert',
            marginRight: 'revert',
          },
        },
      },
      {
        props: { variant: 'loud' },
        style: { '& .MuiButton-startIcon::before': { content: 'none' } },
      },
    ]);
  });

  it('restates a base value that MUI overrides in a state, and reverts a property the design system sets only elsewhere', () => {
    // text-decoration-line in the base rule: MUI's `&:hover { text-decoration: none }` must restate it.
    // box-shadow only in :hover: MUI's base `box-shadow` must revert (the DS hover variant wins later).
    const files = {
      ...BTN_FILES,
      'src/components/btn/btn.css': BTN_FILES[
        'src/components/btn/btn.css'
      ].replace(
        '  cursor: pointer;\n',
        '  cursor: pointer;\n  text-decoration-line: underline;\n',
      ),
    };
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules[0].declarations['box-shadow'] =
      'none';
    const { resets, diag } = resetsFor(files, catalog);
    expect(diag.errors).toEqual([]);
    expect(resets![0].style['&']).toMatchObject({ boxShadow: 'revert' });
    expect(resets![1].style['&:hover']).toEqual({
      textDecorationColor: 'revert',
      textDecorationLine: 'underline',
      textDecorationStyle: 'revert',
      textDecorationThickness: 'revert',
    });
  });

  it('drops legacy flexbox spellings when the standard property is present', () => {
    const catalog = structuredClone(FX_CATALOG);
    const base = catalog.components.btn.renders[0].rules[0].declarations;
    base['-ms-flex-align'] = 'center';
    base['-webkit-box-align'] = 'center';
    base['align-items'] = 'center';
    base['-ms-flex-pack'] = 'center';
    const { resets } = resetsFor(BTN_FILES, catalog);
    const keys = Object.keys(resets![0].style['&']);
    expect(keys).toContain('alignItems');
    expect(keys).not.toContain('MsFlexAlign');
    expect(keys).not.toContain('WebkitBoxAlign');
    // no standard twin in the rule: kept and reverted under its PascalCase key
    expect(keys).toContain('MsFlexPack');
  });

  it('honours ignore: an ignored property is never restated', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      targets: { mui: Record<string, unknown> };
    };
    m.targets.mui.ignore = ['color'];
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { resets } = resetsFor(files);
    expect(resets![0].style['&']).toMatchObject({ color: 'revert' });
    expect(resets![2].style['&.Mui-disabled']).toEqual({
      color: 'revert',
      pointerEvents: 'revert',
    });
  });

  it('reports a missing permutation and an unexpandable shorthand as DS-E086', () => {
    const missing = structuredClone(FX_CATALOG);
    missing.components.btn.renders = missing.components.btn.renders.slice(0, 1);
    const a = resetsFor(BTN_FILES, missing);
    expect(a.resets).toBeNull();
    expect(a.diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
    expect(a.diag.errors[0].message).toContain('no render for tone=loud');

    const shorthand = structuredClone(FX_CATALOG);
    shorthand.components.btn.renders[0].rules[0].declarations.animation =
      'spin 1s';
    const b = resetsFor(BTN_FILES, shorthand);
    expect(b.resets).toBeNull();
    expect(b.diag.errors[0].message).toContain('shorthand "animation"');
  });

  it('skips a catalog rule that leaves nothing to reset', () => {
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules.push({
      media: null,
      selector: '&',
      declarations: { color: 'red' },
    });
    const { resets } = resetsFor(BTN_FILES, catalog);
    // the appended rule merges into nothing new for quiet: color is provided at equal specificity
    expect(resets!.filter((r) => r.props.variant === 'quiet')).toHaveLength(6);
  });

  it('consults overflow when the design system sets it, for its longhands overflow-x/overflow-y', () => {
    const files = {
      ...BTN_FILES,
      'src/components/btn/btn.css': BTN_FILES[
        'src/components/btn/btn.css'
      ].replace(
        '  cursor: pointer;\n',
        '  cursor: pointer;\n  overflow: hidden;\n',
      ),
    };
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules[0].declarations.overflow = 'hidden';
    const { resets, diag } = resetsFor(files, catalog);
    expect(diag.errors).toEqual([]);
    expect(resets![0].style['&']).not.toHaveProperty('overflowX');
    expect(resets![0].style['&']).not.toHaveProperty('overflowY');
  });

  it('reverts overflow-x/overflow-y through their overflow parent when the design system sets nothing', () => {
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules[0].declarations.overflow = 'hidden';
    const { resets, diag } = resetsFor(BTN_FILES, catalog);
    expect(diag.errors).toEqual([]);
    expect(resets![0].style['&']).toMatchObject({
      overflowX: 'revert',
      overflowY: 'revert',
    });
  });

  it('reports an unknown shorthand (mask) as DS-E086', () => {
    const catalog = structuredClone(FX_CATALOG);
    catalog.components.btn.renders[0].rules[0].declarations.mask = 'none';
    const { resets, diag } = resetsFor(BTN_FILES, catalog);
    expect(resets).toBeNull();
    expect(diag.errors.every((e) => e.code === 'DS-E086')).toBe(true);
    expect(diag.errors[0].message).toContain('shorthand "mask"');
  });
});

describe('effectiveValue', () => {
  it('picks the highest-specificity candidate, not the last one visited in IR order', () => {
    // compareRules sorts by axis count before state count, so the 0-axis/
    // 2-state rule below (spec 3) sorts *before* the 1-axis/0-state rule
    // (spec 2) in `component.rules`; effectiveValue must not assume the
    // last-visited match is the most specific one.
    const files = {
      ...BTN_FILES,
      'src/components/btn/btn.css': BTN_FILES[
        'src/components/btn/btn.css'
      ].replace(
        '.fx-btn[data-tone="loud"] {\n  min-width: 44px;\n}\n',
        '.fx-btn[data-tone="loud"] {\n  min-width: 44px;\n  cursor: help;\n}\n.fx-btn:hover:disabled {\n  cursor: wait;\n}\n',
      ),
    };
    const { ir } = twBuild(twRoot(files));
    const component = ir.components.btn;
    const context = {
      slot: 'root',
      states: ['hover', 'disabled'],
      specificity: 4,
    };
    const provided = effectiveValue(
      ir,
      component,
      new Set(),
      context,
      { tone: 'loud' },
      'cursor',
    );
    // Candidates: base `.fx-btn` (cursor: pointer, spec 1), `.fx-btn:disabled`
    // (cursor: not-allowed, spec 2), `.fx-btn[data-tone="loud"]` (cursor:
    // help, spec 2), and `.fx-btn:hover:disabled` (cursor: wait, spec 3) —
    // the true winner is the 2-state rule, even though it sorts earlier.
    expect(provided).toEqual({ value: 'wait', specificity: 3 });
  });
});
