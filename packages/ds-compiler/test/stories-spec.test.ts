import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { buildMuiModel } from '../src/targets/mui/model.js';
import {
  buildStoriesModel,
  modeSwitchFor,
} from '../src/targets/stories/spec.js';
import { BTN_FILES, FX_CATALOG } from './mui-mapped-fixture.js';
import {
  BLOB_FILES,
  CHIP_REQUIRED_ICON,
  NO_MUI_FILES,
  twBuild,
  twContext,
  twRoot,
} from './tailwind-fixture.js';

function model(extra: Record<string, string> = {}, catalog = FX_CATALOG) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);
  const mui = buildMuiModel(ir, catalog, ctx, new Diagnostics())!;
  const diag = new Diagnostics();
  const stories = buildStoriesModel(
    ir,
    mui,
    config.targets.stories?.options ?? {},
    diag,
  );
  return { ir, stories, diag };
}

describe('buildStoriesModel', () => {
  it('derives the config: prefix, mode attribute, categories, parity properties', () => {
    const { stories, diag } = model();
    expect(diag.items).toEqual([]);
    expect(stories!.config).toEqual({
      prefix: 'fx',
      name: 'Fictional',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      mode: { kind: 'attribute', name: 'data-fx-theme' },
      tokenCategories: ['color', 'font-family', 'shadow', 'space'],
      parityProperties: expect.arrayContaining([
        'background-color',
        'min-width',
        'text-transform',
        'transition-duration',
      ]),
      muiPackage: '@fx/styles-mui',
      muiThemeFactory: 'createFxTheme',
    });
    expect(stories!.config.parityProperties).toEqual(
      [...stories!.config.parityProperties].sort(),
    );
  });

  it('describes an own component: css and mui cells, label slot, attribute states', () => {
    const { stories } = model();
    const chip = stories!.components.find((c) => c.name === 'chip')!;
    expect(chip).toEqual({
      name: 'chip',
      displayName: 'Chip',
      exportName: 'Chip',
      rootElement: 'button',
      axes: [{ name: 'tone', values: ['quiet', 'loud'], default: 'quiet' }],
      states: [
        { name: 'hover', kind: 'hover' },
        {
          name: 'disabled',
          kind: 'attribute',
          attributes: { disabled: '' },
          muiProp: 'disabled',
        },
      ],
      slots: [{ name: 'icon', element: 'span', content: 'icon' }],
      label: 'Chip',
      labelSlot: null,
      labelElement: 'span',
      tailwind: true,
      mui: {
        rootClass: 'FxChip-root',
        slotClasses: { icon: 'FxChip-icon' },
        axisProps: { tone: 'tone' },
        slotProps: { icon: 'icon' },
        children: 'children',
      },
    });
  });

  it('describes a mapped component with MUI slot classes and props, and an aria state', () => {
    const { stories } = model(BTN_FILES);
    const btn = stories!.components.find((c) => c.name === 'btn')!;
    expect(btn.mui).toEqual({
      rootClass: 'MuiButton-root',
      slotClasses: { icon: 'MuiButton-startIcon' },
      axisProps: { tone: 'tone' },
      slotProps: { icon: 'icon' },
      children: 'children',
    });
    expect(btn.states).toEqual([
      { name: 'hover', kind: 'hover' },
      {
        name: 'disabled',
        kind: 'attribute',
        attributes: { disabled: '' },
        muiProp: 'disabled',
      },
    ]);
  });

  it('omits cells for excluded targets and uses aria-disabled on a div root', () => {
    const { stories } = model();
    const tag = stories!.components.find((c) => c.name === 'tag')!;
    expect(tag.tailwind).toBe(true);
    expect(tag.mui).not.toBeNull();
    expect(tag.states).toEqual([
      {
        name: 'disabled',
        kind: 'attribute',
        attributes: { 'aria-disabled': 'true' },
        muiProp: 'disabled',
      },
    ]);
    const pill = stories!.components.find((c) => c.name === 'pill')!;
    expect(pill.tailwind).toBe(false);
    expect(pill.mui).toBeNull();
  });

  it('lists tokens per category with the three variable names', () => {
    const { stories } = model();
    expect(stories!.tokens.color!.map((t) => t.id)).toEqual([
      'color.neutral.900',
      'color.text.default',
    ]);
    expect(stories!.tokens.color![1]).toEqual({
      id: 'color.text.default',
      path: ['text', 'default'],
      cssVar: '--fx-color-text-default',
      tailwindVar: '--color-fx-text-default',
      muiVar: '--fx-palette-tokens-text-default',
      modeInvariant: false,
    });
    expect(stories!.tokens.space![0].tailwindVar).toBe('--spacing-fx-2');
    expect(stories!.tokens.space![0].muiVar).toBe('--fx-tokens-space-2');
  });

  it('reports DS-E084 without a muiPackage option when a component is mapped for mui, and for a mode selector the browser cannot toggle', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const mui = buildMuiModel(
      ir,
      FX_CATALOG,
      twContext(root, config),
      new Diagnostics(),
    )!;
    const diag = new Diagnostics();
    expect(buildStoriesModel(ir, mui, {}, diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E084']);
    expect(diag.errors[0].message).toContain(
      'targets.stories.options.muiPackage',
    );
  });

  it('renders a state outside the pseudo-class and ARIA sets as a data-state attribute instead of crashing (H1)', () => {
    const { stories, diag } = model(BLOB_FILES);
    expect(diag.items).toEqual([]);
    const blob = stories!.components.find((c) => c.name === 'blob')!;
    expect(blob.states).toEqual([
      {
        name: 'loading',
        kind: 'attribute',
        attributes: { 'data-state': 'loading' },
        muiProp: 'loading',
      },
    ]);
    expect(blob.mui).toBeNull();
  });

  it('uses the mui children slot as the label slot when it is not literally named "label" (H3)', () => {
    const { stories } = model(CHIP_REQUIRED_ICON);
    const chip = stories!.components.find((c) => c.name === 'chip')!;
    expect(chip.labelSlot).toBe('icon');
    expect(chip.labelElement).toBe('span');
    // The mui children slot is excluded from the plain slot list too (it is
    // rendered as the label, not as a separate slot prop).
    expect(chip.slots).toEqual([]);
    expect(chip.mui!.slotProps).toEqual({});
  });

  it('omits muiPackage from the config when no component is mapped for mui (L5)', () => {
    const { stories, diag } = model(NO_MUI_FILES);
    expect(diag.items).toEqual([]);
    expect(stories!.config.muiPackage).toBeUndefined();
    expect(stories!.config).not.toHaveProperty('muiPackage');
    for (const component of stories!.components) {
      expect(component.mui).toBeNull();
    }
  });
});

describe('modeSwitchFor', () => {
  it('recognizes the attribute form, with or without a leading :root', () => {
    expect(modeSwitchFor(':root[data-fx-theme="{mode}"]')).toEqual({
      kind: 'attribute',
      name: 'data-fx-theme',
    });
    expect(modeSwitchFor('[data-x="{mode}"]')).toEqual({
      kind: 'attribute',
      name: 'data-x',
    });
  });

  it('normalizes single quotes before matching', () => {
    expect(modeSwitchFor(":root[data-fx-theme='{mode}']")).toEqual({
      kind: 'attribute',
      name: 'data-fx-theme',
    });
  });

  it('recognizes the class form, with an optional prefix and suffix', () => {
    expect(modeSwitchFor('.x-{mode}')).toEqual({
      kind: 'class',
      prefix: 'x-',
      suffix: '',
    });
    expect(modeSwitchFor(':root.{mode}-theme')).toEqual({
      kind: 'class',
      prefix: '',
      suffix: '-theme',
    });
  });

  it('returns null for a selector neither form can express', () => {
    expect(modeSwitchFor('html[data-theme="{mode}"]')).toBeNull();
  });
});
