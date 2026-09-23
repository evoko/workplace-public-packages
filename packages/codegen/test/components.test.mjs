import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
  namesOf,
} from '../src/normalize/components.mjs';
import { docsDir } from '../src/util/paths.mjs';
import {
  BOOLEAN_STATES,
  foldStateAxes,
} from '../src/normalize/component-layers.mjs';
import { STATE_PRECEDENCE } from '../src/emit/flutter-component.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const names = tokenNames(loadContract());
const catalog = loadWebCatalog();
const { spec, deviations } = buildComponentSpec(
  loadComponent(catalog, 'Button'),
  {
    names,
    fileVersion: catalog.fileVersion,
  },
);

describe('buildComponentSpec on Button: the public API', () => {
  it('keeps the size and appearance axes as props, with their defaults', () => {
    expect(spec.api.size).toEqual({
      values: ['md', 'sm', 'xl'],
      default: 'md',
    });
    // Figma's name; the overlay renames prio to variant (task 4).
    expect(spec.api.prio).toEqual({
      values: ['primary', 'secondary', 'tertiary'],
      default: 'primary',
    });
  });

  it('turns a false/true axis into a boolean', () => {
    expect(spec.api.danger).toEqual({ type: 'boolean', default: false });
  });

  it('demotes the state axis: platform states are not props, disabled and loading are', () => {
    expect(spec.states).toEqual(['default', 'hover', 'pressed', 'focus']);
    expect(spec.api.disabled).toEqual({ type: 'boolean', default: false });
    expect(spec.api.loading).toEqual({ type: 'boolean', default: false });
    expect(spec.api).not.toHaveProperty('state');
    for (const s of spec.states) expect(spec.api).not.toHaveProperty(s);
  });
});

describe('buildComponentSpec on Button: slots', () => {
  it('derives the slots from the layer tree, so the two icon slots are told apart', () => {
    expect(Object.keys(spec.slots)).toEqual([
      'iconLeading',
      'label',
      'iconTrailing',
      'counter',
    ]);
    expect(spec.slots.iconLeading.layer).toBe('/Icon/None');
    expect(spec.slots.iconTrailing.layer).toBe('/Icon/None#2');
  });

  it('carries the seven Figma props that drive them', () => {
    const props = Object.values(spec.slots).flatMap((s) =>
      Object.values(s.props),
    );
    expect(props.sort()).toEqual(
      [
        'Label',
        'hasCounter',
        'hasIconLeading',
        'hasIconTrailing',
        'hasLabel',
        'icon-leading',
        'icon-trailing',
      ].sort(),
    );
  });

  it('types each slot by what fills it, and says whether it shows by default', () => {
    expect(spec.slots.iconLeading).toMatchObject({
      type: 'icon',
      optional: true,
      visible: false,
    });
    expect(spec.slots.label).toMatchObject({
      type: 'text',
      optional: true,
      visible: true,
      default: 'Label',
    });
    expect(spec.slots.counter).toMatchObject({
      type: 'component',
      component: 'Counter',
      optional: true,
      visible: false,
    });
  });
});

describe('buildComponentSpec on Button: style', () => {
  it('names layers by slot, then by layer name, with root for the component itself', () => {
    expect(Object.keys(spec.layers)).toEqual([
      'root',
      'iconLeading',
      'spinner',
      'label',
      'iconTrailing',
      'counter',
    ]);
    expect(spec.layers.label).toEqual({
      path: '/Label',
      parent: 'root',
      type: 'TEXT',
    });
  });

  it('carries the recipe in token names under those names', () => {
    expect(spec.style.root.base.radius).toMatchObject({
      token: 'radius.control',
    });
    expect(spec.style.root.size.sm.paddingLeft).toMatchObject({
      token: 'inset.xs',
    });
    expect(spec.style.label.base.typography).toMatchObject({
      token: 'typography.label.md',
    });
  });

  it('keys appearance by the combination of appearance axes, then state', () => {
    const primary = spec.style.root.appearance['prio=primary, danger=false'];
    expect(primary.hover.background).toMatchObject({
      token: 'color.action.primary.bg.hover',
    });
    expect(
      spec.style.root.appearance['prio=primary, danger=true'].default
        .background,
    ).toMatchObject({ token: 'color.action.primary.bg.danger.default' });
  });

  it('files disabled and loading under the props they became, not under states', () => {
    const primary = spec.style.root.appearance['prio=primary, danger=false'];
    expect(primary).toHaveProperty('disabled');
    expect(primary.disabled.background).toMatchObject({
      token: 'color.action.primary.bg.disabled',
    });
    expect(
      spec.style.spinner.appearance['prio=primary, danger=false'].loading
        .present,
    ).toMatchObject({ value: true });
  });
});

describe('buildComponentSpec on Button: provenance and findings', () => {
  it('records where it came from', () => {
    expect(spec.component).toBe('Button');
    expect(spec.provenance).toEqual({
      page: 'components/buttons',
      pageId: '2049:578',
      figmaNode: '2087:2544',
      defaultVariant: 'size=md, prio=primary, state=default, danger=false',
      fileVersion: catalog.fileVersion,
    });
  });

  it('leaves the base unchosen: that is the overlay’s decision', () => {
    expect(spec.base).toEqual({ mui: null, flutter: null });
  });

  it('keeps Figma’s own description and the issues it contradicts itself with', () => {
    expect(spec.docs.description).toMatch(/^Triggers an action/);
    expect(spec.docs.figmaIssues).toContain(
      'Description says 96 variants; the set has 108.',
    );
  });

  it('returns the recipe deviations beside the spec, not inside it', () => {
    expect(spec).not.toHaveProperty('deviations');
    expect(deviations.length).toBeGreaterThan(0);
    expect(
      deviations.every((d) => d.token.startsWith('component.button.')),
    ).toBe(true);
  });

  it('reports deviations under the IR layer names, keeping the Figma path beside them', () => {
    const d = deviations.find((x) =>
      x.token.startsWith('component.button.iconTrailing.'),
    );
    expect(d.layer).toBe('/Icon/None#2');
    expect(deviations.some((x) => x.token.includes('Icon/None'))).toBe(false);
  });

  it('refuses a component the catalog does not have', () => {
    expect(() => loadComponent(catalog, 'Buton')).toThrow(
      /no component named Buton/,
    );
  });
});

const build = (name) =>
  buildComponentSpec(loadComponent(catalog, name), {
    names,
    fileVersion: catalog.fileVersion,
  }).spec;
const pathsOf = (ir) =>
  Object.fromEntries(Object.entries(ir.layers).map(([n, l]) => [n, l.path]));

describe('layer names that cannot collide', () => {
  it('qualifies two same-named layers by their parents, keeping a top-level one bare', () => {
    const input = pathsOf(build('Text Input'));
    expect(input.label).toBe('/Label');
    expect(input.fieldLabel).toBe('/Field/Label');
    expect(input.labelLabel).toBe('/Label/Label');
  });

  it('keeps repeated siblings in their Figma order, and qualifies them as one series', () => {
    expect(pathsOf(build('Tabs'))).toMatchObject({
      tabItem: '/Tabs/Tab Item',
      tabItem2: '/Tabs/Tab Item#2',
      tabItem8: '/Tabs/Tab Item#8',
    });
    expect(pathsOf(build('Card'))).toMatchObject({
      skeleton: '/Skeleton',
      contentSkeleton: '/Content/Skeleton',
      contentSkeleton2: '/Content/Skeleton#2',
      contentSkeleton3: '/Content/Skeleton#3',
    });
  });

  it('qualifies a slot’s layer while the slot, and so the prop, keeps Figma’s name', () => {
    const card = build('Card');
    expect(card.slots.title.layer).toBe('/Title/Title');
    expect(pathsOf(card)).toMatchObject({
      title: '/Title',
      titleTitle: '/Title/Title',
    });
  });

  it('leaves Button’s names as they were', () => {
    expect(Object.keys(spec.layers)).toEqual([
      'root',
      'iconLeading',
      'spinner',
      'label',
      'iconTrailing',
      'counter',
    ]);
  });

  it('names from the set of paths, whatever order they were seen in', () => {
    const parents = [
      ['/', null],
      ['/Label', '/'],
      ['/Field', '/'],
      ['/Field/Label', '/Field'],
      ['/Field/Icon/None', '/Field'],
      ['/Field/Icon/None#2', '/Field'],
      ['/Icon/None', '/'],
    ];
    const forward = namesOf(new Map(parents), {}, 'X');
    const backward = namesOf(new Map([...parents].reverse()), {}, 'X');
    expect(Object.fromEntries(backward)).toEqual(Object.fromEntries(forward));
    expect(Object.fromEntries(forward)).toMatchObject({
      '/Label': 'label',
      '/Field/Label': 'fieldLabel',
      '/Icon/None': 'iconNone',
      '/Field/Icon/None': 'fieldIconNone',
      '/Field/Icon/None#2': 'fieldIconNone2',
    });
  });

  it('refuses a layer with nothing to name it by, and names that qualifying cannot separate', () => {
    expect(() =>
      namesOf(
        new Map([
          ['/', null],
          ['/|', '/'],
        ]),
        {},
        'X',
      ),
    ).toThrow(/layer \/\| has no letter or digit/);
    expect(() =>
      namesOf(
        new Map([
          ['/', null],
          ['/Label', '/'],
          ['/|Label', '/'],
        ]),
        {},
        'X',
      ),
    ).toThrow(/\/Label and \/\|Label are all named label/);
  });
});

describe('a slot drawn by a frame and the text inside it', () => {
  it('is one slot: the frame is shown, the text is filled', () => {
    expect(build('Text Input').slots.label).toEqual({
      layer: '/Label',
      contentLayer: '/Label/Label',
      props: { visible: 'show label', content: 'label' },
      type: 'text',
      default: 'Label',
      optional: true,
      visible: true,
    });
  });

  it('strips the verb from a `show …` prop as from a `has…` one', () => {
    const { slots } = build('Text Input');
    expect(Object.keys(slots)).toEqual([
      'label',
      'mandatory',
      'leadingIcon',
      'trailingIcon',
      'helper',
    ]);
  });
});

// Which sets build an IR at all. A change that makes one stop building shows here; the ones
// left fail on shapes named in the plan: Figma layers named by a glyph, a prop that shows
// two sibling layers, and the recipe's four.
describe('buildComponentSpec over all of SOLAR Web', () => {
  it('builds every set but the eight known ones', () => {
    const root = join(docsDir, 'solar-web', 'raw', 'components');
    const failures = [];
    let total = 0;
    for (const dir of readdirSync(root))
      for (const file of readdirSync(join(root, dir)))
        for (const set of JSON.parse(
          readFileSync(join(root, dir, file), 'utf8'),
        ).componentSets) {
          total++;
          try {
            buildComponentSpec({ entry: {}, set }, { names, fileVersion: 'x' });
          } catch {
            failures.push(`${dir}/${set.name}`);
          }
        }
    expect(total).toBe(119);
    expect(failures.sort()).toEqual([
      'calendar/Weekday Header',
      'cards/Insight Card',
      'dialogs/Dialog',
      'feedback/Banner',
      'inputs/PIN Input',
      'inputs/Password Input',
      'navigation/Tree Item',
      'overlays/Popover',
    ]);
  });
});

describe('states drawn as false/true axes', () => {
  const checkbox = buildComponentSpec(loadComponent(catalog, 'Checkbox'), {
    names,
    fileVersion: catalog.fileVersion,
  });

  it('folds them into one state axis: hover and focus are states, disabled a prop', () => {
    expect(checkbox.spec.api).toEqual({
      checked: { type: 'boolean', default: false },
      disabled: { type: 'boolean', default: false },
      mixed: { type: 'boolean', default: false },
    });
    expect(checkbox.spec.states).toEqual(['default', 'focus', 'hover']);
  });

  it('reads a variant with two states at once as the stronger, and says so once', () => {
    const found = checkbox.deviations.filter(
      (d) => d.kind === 'compound-state',
    );
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({
      token: 'component.checkbox.state#compound',
      variants: [
        {
          variant:
            'checked=true, disabled=true, hover=true, mixed=true, focus=false',
        },
      ],
      figmaValue: 'disabled + hover',
    });
  });

  it('drops such a variant, reported, where another already draws the stronger state', () => {
    const resolved = {
      name: 'X',
      axes: {
        disabled: { default: 'false', options: ['false', 'true'] },
        hover: { default: 'false', options: ['false', 'true'] },
      },
      variants: [
        ['false', 'false'],
        ['true', 'false'],
        ['false', 'true'],
        ['true', 'true'],
      ].map(([disabled, hover]) => ({
        name: `disabled=${disabled}, hover=${hover}`,
        props: { disabled, hover },
      })),
    };
    const { resolved: folded, findings } = foldStateAxes(resolved);
    expect(folded.axes).toEqual({
      state: { default: 'default', options: ['default', 'disabled', 'hover'] },
    });
    expect(folded.variants.map((v) => v.props.state)).toEqual([
      'default',
      'disabled',
      'hover',
    ]);
    expect(findings).toMatchObject([
      {
        token: 'component.x.state#compound-dropped',
        variants: [{ variant: 'disabled=true, hover=true' }],
      },
    ]);
  });

  it('leaves a component that draws its states as one axis as it was', () => {
    expect(spec.states).toEqual(['default', 'hover', 'pressed', 'focus']);
    // Card's loading, beside its state axis, is a prop as before.
    expect(build('Card').api.loading).toEqual({
      type: 'boolean',
      default: false,
    });
  });

  it('refuses a platform state drawn both as a state value and as an axis of its own', () => {
    const axes = {
      state: { default: 'default', options: ['default', 'disabled'] },
      hover: { default: 'false', options: ['false', 'true'] },
    };
    expect(() => foldStateAxes({ name: 'X', axes, variants: [] })).toThrow(
      /both as a state axis and as hover/,
    );
  });

  it('resolves two states in the order both emitters apply them', () => {
    expect(BOOLEAN_STATES).toEqual(STATE_PRECEDENCE);
  });
});
