import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  addressOf,
  buildComponentSpec,
  componentOf,
  loadComponent,
  loadWebCatalog,
  namesOf,
} from '../src/normalize/components.mjs';
import { docsDir } from '../src/util/paths.mjs';
import {
  loadDefaults,
  loadOverlay,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { buildOracle } from '../src/verify/oracle.mjs';
import { buildTokenSpec } from '../src/normalize/tokens.mjs';
import {
  BOOLEAN_STATES,
  foldStateAxes,
} from '../src/normalize/component-layers.mjs';
import { statePrecedence } from '../src/emit/flutter-component.mjs';
import { assertDistinct } from '../src/stages/components.mjs';
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
      values: ['md', 'sm', 'lg'],
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
    // SOLAR corrected the variant count in the description on 2026-09-23, so there is no
    // contradiction left for the catalog to record.
    expect(spec.docs.description).toContain('Variants (108)');
    expect(spec.docs.figmaIssues).toEqual([]);
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

// Which sets build an IR at all: every one, since milestone 4's Task M5, with the overlays that
// name what Figma names by a glyph (PIN Input's `|`, Password Input's bullets, Tree Item's
// `|Label`). A change that makes one stop building shows here.
describe('buildComponentSpec over all of SOLAR Web', () => {
  it('builds every set', () => {
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
            buildComponentSpec(
              { entry: {}, set },
              {
                names,
                fileVersion: 'x',
                overlay: loadOverlay(set.name),
                defaults: loadDefaults(),
              },
            );
          } catch (e) {
            failures.push(`${dir}/${set.name}: ${e.message}`);
          }
        }
    expect(total).toBe(119);
    expect(failures).toEqual([]);
  });

  it('names a layer Figma names by a glyph only through an overlay', () => {
    const pin = loadComponent(catalog, 'PIN Input');
    expect(() => buildComponentSpec(pin, { names, fileVersion: 'x' })).toThrow(
      /no letter or digit to name it by; name it with an overlay layerNames rule/,
    );
    const { spec } = buildComponentSpec(pin, {
      names,
      fileVersion: 'x',
      overlay: loadOverlay('PIN Input'),
    });
    expect(spec.layers.caret).toMatchObject({ path: '/Cells/Field/|' });
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'layerNames',
        at: '/Cells/Field/| → caret',
      }),
    );
  });
});

describe('the oracle of a layer whose corners differ', () => {
  it('holds each corner Figma records, clockwise from the top left', () => {
    const loaded = loadComponent(catalog, 'Popover');
    const { spec, deviations } = buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
    });
    const oracle = buildOracle(loaded.set, spec, deviations, {
      tokens: buildTokenSpec(loadContract()).spec,
      names,
      overlay: null,
      fileVersion: catalog.fileVersion,
    });
    const top = oracle.variants.find(
      (v) => v.figma === 'placement=top, size=md',
    ).layers.content;
    expect(top).toMatchObject({
      radiusTopLeft: 8,
      radiusTopRight: 8,
      radiusBottomRight: 8,
      radiusBottomLeft: 0,
    });
    expect(top).not.toHaveProperty('radius');
  });
});

describe('the oracle of layers placed by position', () => {
  const oracleOf = (name) => {
    const loaded = loadComponent(catalog, name);
    const { spec, deviations } = buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
    });
    return buildOracle(loaded.set, spec, deviations, {
      tokens: buildTokenSpec(loadContract()).spec,
      names,
      overlay: null,
      fileVersion: catalog.fileVersion,
    });
  };

  it('measures a placed box where Figma put it, at its drawn size', () => {
    const toggle = oracleOf('Toggle');
    const on = toggle.variants.find(
      (v) => v.figma === 'selected=true, state=default',
    ).layers.thumb;
    expect(on).toMatchObject({ x: 17, y: 3, width: 12, height: 12 });
  });

  it('records a placed shape’s position in its drawing, not as measured properties', () => {
    const status = oracleOf('StatusIndicator');
    const warning = status.variants.find(
      (v) => v.figma === 'type=warning, size=md',
    ).layers.innerPath;
    expect(warning.glyph).toMatchObject({ x: 9, y: 6 });
    expect(warning).not.toHaveProperty('x');
  });
});

describe('standalone components', () => {
  const standalone = catalog.components.filter(
    (c) => c.kind === 'component' && c.section.startsWith('components/'),
  );

  it('are thirteen, and every one builds an IR and an oracle of one variant', () => {
    expect(standalone).toHaveLength(13);
    const tokens = buildTokenSpec(loadContract()).spec;
    for (const entry of standalone) {
      const set = componentOf(entry);
      const { spec, deviations } = buildComponentSpec(
        { entry, set },
        { names, fileVersion: catalog.fileVersion },
      );
      expect(spec.api, entry.name).toEqual({});
      expect(spec.states, entry.name).toEqual([]);
      // No axes, so nothing can differ across one: its findings are raw values only.
      expect(
        deviations.filter((d) => d.kind === 'axis'),
        entry.name,
      ).toEqual([]);
      const oracle = buildOracle(set, spec, deviations, {
        tokens,
        names,
        overlay: null,
        fileVersion: catalog.fileVersion,
      });
      expect(oracle.variants, entry.name).toHaveLength(1);
      expect(oracle.variants[0].props, entry.name).toEqual({});
    }
  });

  it('take their props as slots: Drawer’s title, content and the footer its hasCTA shows', () => {
    const { spec } = buildComponentSpec(loadComponent(catalog, 'Drawer'), {
      names,
      fileVersion: catalog.fileVersion,
    });
    expect(spec.slots.title).toMatchObject({
      type: 'text',
      default: 'Drawer Title',
    });
    expect(spec.slots.content).toMatchObject({ type: 'content' });
    expect(spec.slots.cta).toMatchObject({
      type: 'component',
      component: 'Button Group',
      props: { visible: 'hasCTA' },
    });
    expect(spec.provenance.defaultVariant).toBe('');
    expect(Object.keys(spec.style.root.appearance)).toEqual([]);
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
    expect(BOOLEAN_STATES).toEqual(statePrecedence('Button'));
  });
});

describe('a state value Figma spells otherwise', () => {
  const overlay = (rename) => ({
    component: 'Text Input',
    file: 'spec/overlay/text-input.yaml',
    states: { rename },
  });
  const input = (rules) =>
    buildComponentSpec(loadComponent(catalog, 'Text Input'), {
      names,
      fileVersion: catalog.fileVersion,
      overlay: overlay(rules),
    });

  it('is renamed before the recipe, so the state and every entry under it take the new name', () => {
    const { spec: ir } = input({
      pressed: { to: 'focus', reason: 'Figma: pressed is the focused state' },
    });
    expect(ir.states).toEqual(['default', 'hover', 'focus']);
    expect(JSON.stringify(ir.style)).not.toMatch(/"pressed"/);
    expect(ir.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'states.rename', at: 'pressed → focus' }),
    );
    // The provenance still names the Figma variant it was read from.
    expect(JSON.stringify(ir.style)).toContain('state=pressed');
  });

  it('refuses a value the state axis does not have, or one it already has', () => {
    expect(() => input({ active: { to: 'focus', reason: 'r' } })).toThrow(
      /states.rename.active: the state axis has no active/,
    );
    expect(() => input({ pressed: { to: 'hover', reason: 'r' } })).toThrow(
      /states.rename.pressed: the state axis already has hover/,
    );
  });
});

describe('an image fill', () => {
  const dialog = build('Dialog');

  it('is content: the layer says it holds an image, and the colour beside it is its background', () => {
    // The image layer is the `modalImage` slot, named for the prop that shows it.
    expect(dialog.slots.modalImage).toMatchObject({
      layer: '/image',
      type: 'content',
    });
    const image = dialog.style.modalImage.appearance['type=image'].default;
    expect(image.image).toMatchObject({ value: true });
    expect(image.background).toMatchObject({ token: 'color.surface.muted' });
  });
});

describe('slots from Figma', () => {
  it('makes an icon a boolean shows an icon slot, and text it shows a text slot', () => {
    const { slots } = build('Text Input');
    expect(slots.leadingIcon.type).toBe('icon');
    expect(slots.trailingIcon.type).toBe('icon');
    expect(slots.mandatory.type).toBe('text');
  });

  it('makes a Figma slot a content slot, wherever a variant has it', () => {
    expect(build('Card').slots.content).toMatchObject({ type: 'content' });
    expect(build('Tabs').slots.tabs).toMatchObject({ type: 'content' });
    // Only type=image has the image slot.
    expect(build('Dialog').slots.modalImage).toMatchObject({
      type: 'content',
      optional: true,
    });
  });

  it('makes the layers one prop drives one slot, the first its layer and the rest alternates', () => {
    // The calendar's Day Cell: the inputs page has a set of the same name.
    const dayCell = JSON.parse(
      readFileSync(
        join(
          docsDir,
          'solar-web',
          'raw',
          'components',
          'calendar',
          'day-cell.json',
        ),
        'utf8',
      ),
    ).componentSets.find((s) => s.name === 'Day Cell');
    const { spec: day } = buildComponentSpec(
      { entry: {}, set: dayCell },
      { names, fileVersion: 'x' },
    );
    expect(day.slots.moreEvents).toMatchObject({
      layer: '/Events/Event',
      alternates: ['/Events/Event#3'],
    });
    const card = buildComponentSpec(loadComponent(catalog, 'Action Card'), {
      names,
      fileVersion: catalog.fileVersion,
    }).spec;
    expect(card.slots.secondaryCTA.alternates).toHaveLength(1);
  });
});

describe('slots and axes the overlay decides', () => {
  const tokens = buildTokenSpec(loadContract()).spec;
  const with_ = (name, yaml) => {
    const overlay = parseOverlay(`component: ${name}\n${yaml}`, 'test.yaml');
    const loaded = loadComponent(catalog, name);
    const built = buildComponentSpec(loaded, {
      names,
      fileVersion: catalog.fileVersion,
      overlay,
    });
    return { ...built, loaded, overlay };
  };
  const TAG = `
slots:
  label: { name: label, type: text, reason: r }
  statusIndicator: { name: indicator, type: component, reason: r }
  iconNone: { name: icon, type: icon, reason: r }
  iconPlus: { name: icon, type: icon, reason: r }
  iconClose: { name: close, type: icon, reason: r }
derive:
  type:
    reason: follows from content
    when:
      - { value: closable, given: [label, close] }
      - { value: status, given: [label, indicator] }
      - { value: icon+text, given: [label, icon] }
      - { value: icon-only, given: [icon] }
      - { value: text-only, given: [label] }
`;

  it('declares a layer the caller fills where Figma records no prop', () => {
    const { spec: ib } = with_(
      'Icon Button',
      'slots:\n  iconNone: { name: icon, type: icon, reason: the caller gives the icon }\n',
    );
    expect(ib.slots.icon).toMatchObject({ layer: '/Icon/None', type: 'icon' });
    expect(ib.layers).toHaveProperty('icon');
    expect(ib.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'slots', at: 'iconNone → icon' }),
    );
  });

  it('takes a structural axis out of the API and says which content gives each value', () => {
    const { spec: tag } = with_('Tag', TAG);
    expect(Object.keys(tag.api)).toEqual(['status', 'invert']);
    expect(tag.slots.icon).toMatchObject({
      layer: '/Icon/Plus',
      alternates: ['/Icon/None'],
    });
    expect(tag.derived.type.when[0]).toEqual({
      value: 'closable',
      given: ['label', 'close'],
    });
    // The recipe keeps the axis, keyed as Figma draws it.
    expect(JSON.stringify(tag.style)).toContain('type=icon-only');
  });

  it('reaches each derived value in the oracle by the content that gives it', () => {
    const { spec: tag, deviations, loaded, overlay } = with_('Tag', TAG);
    const oracle = buildOracle(loaded.set, tag, deviations, {
      tokens,
      names,
      overlay,
      fileVersion: 'x',
    });
    const v = oracle.variants.find(
      (x) => x.figma === 'status=danger, type=icon-only, invert=true',
    );
    expect(v.props).toEqual({ status: 'danger', invert: true });
    expect(v.content).toEqual(['icon']);
  });

  it('refuses a slot on a layer the IR lacks, or one Figma already defines', () => {
    expect(() =>
      with_(
        'Icon Button',
        'slots:\n  nope: { name: icon, type: icon, reason: r }\n',
      ),
    ).toThrow(/slots.nope: the IR has no layer nope/);
    expect(() =>
      with_(
        'Button',
        'slots:\n  spinner: { name: label, type: text, reason: r }\n',
      ),
    ).toThrow(/label is already a Figma slot/);
  });

  it('refuses a derived axis that leaves a value out or names a slot that does not exist', () => {
    expect(() =>
      with_(
        'Tag',
        TAG.replace('      - { value: text-only, given: [label] }\n', ''),
      ),
    ).toThrow(/text-only must appear once in when/);
    expect(() => with_('Tag', TAG.replace('[icon]', '[glyph]'))).toThrow(
      /icon-only: Tag has no slot glyph/,
    );
  });
});

describe('glyphs: shapes a component draws itself', () => {
  it('carries Checkbox’s tick and dash as Figma’s paths, under the looks that draw them', () => {
    const { style } = build('Checkbox');
    const tick =
      style.icon.appearance['checked=true, mixed=false'].default.glyph;
    expect(tick.glyph).toMatchObject({ width: 10, height: 7 });
    expect(tick.glyph.fill[0].d).toMatch(/^M3\.61008 4\.85961C/);
    expect(tick.glyph.stroke).toEqual([]);
    const dash =
      style.container.appearance['checked=true, mixed=true'].default.glyph;
    expect(dash.glyph).toMatchObject({ width: 10, height: 2 });
  });

  it('follows every axis, so a shape that changes with size or state is no finding', () => {
    const { spec, deviations } = buildComponentSpec(
      loadComponent(catalog, 'Spinner'),
      {
        names,
        fileVersion: catalog.fileVersion,
      },
    );
    // The ring's stroke outline differs per size.
    const sizes = Object.keys(spec.style.indicator.combined ?? {});
    expect(sizes.length).toBeGreaterThan(0);
    expect(spec.style.indicator.base.glyph.glyph.stroke.length).toBeGreaterThan(
      0,
    );
    expect(deviations.some((d) => d.cell === 'glyph')).toBe(false);
  });
});

// Two sets Figma names Day Cell, since milestone 4's Task M6: each is addressed by its section and
// named for code by its overlay.
describe('components named alike', () => {
  it('refuses a bare name two components share, naming both, and finds each by its section', () => {
    expect(() => loadComponent(catalog, 'Day Cell')).toThrow(
      /Day Cell is the name of inputs\/Day Cell and calendar\/Day Cell/,
    );
    expect(loadComponent(catalog, 'calendar/Day Cell').entry.variantCount).toBe(
      5,
    );
    expect(loadComponent(catalog, 'inputs/Day Cell').entry.variantCount).toBe(
      13,
    );
    const [calendar] = catalog.components.filter(
      (c) => c.name === 'Day Cell' && c.section === 'components/calendar',
    );
    expect(addressOf(catalog, calendar)).toBe('calendar/Day Cell');
    // An unshared name is its own address.
    expect(addressOf(catalog, loadComponent(catalog, 'Button').entry)).toBe(
      'Button',
    );
  });

  it('builds each under its overlay’s code name, which its findings’ tokens carry', () => {
    const on = (address) =>
      buildComponentSpec(loadComponent(catalog, address), {
        names,
        fileVersion: 'x',
        overlay: loadOverlay(address),
      });
    const calendar = on('calendar/Day Cell');
    const picker = on('inputs/Day Cell');
    expect(calendar.spec.component).toBe('Calendar Day Cell');
    expect(picker.spec.component).toBe('Date Picker Day Cell');
    expect(calendar.spec.provenance.figmaName).toBe('Day Cell');
    expect(
      picker.deviations.every((d) =>
        d.token.startsWith('component.date picker day cell.'),
      ),
    ).toBe(true);
    expect(calendar.spec.overlay.rules[0]).toMatchObject({
      rule: 'codeName',
      at: 'Day Cell → Calendar Day Cell',
    });
  });

  it('refuses two components generated under one name', () => {
    expect(() => assertDistinct(['Day Cell', 'Button', 'Day Cell'])).toThrow(
      /two components are generated as Day Cell; give each an overlay codeName/,
    );
  });
});
