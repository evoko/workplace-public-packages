/**
 * F8, the navigation family (milestone 4): Tab Item and Tabs, Nav Item, Section Nav Item and its
 * group header, Breadcrumb Item and Breadcrumbs, and Tree Item. What they brought: a sampled axis
 * that drops Figma's default variant, a Counter at rest inside a tab, and the focus states and
 * widths their overlays decide; and what their descriptors and shells say.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { DESCRIPTORS } from '../src/components/index.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  loadDefaults,
  loadOverlay,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { FLUTTER_TEMPLATES, TEMPLATES } from '../src/shells/index.mjs';
import { apiOf } from '../src/shells/api.mjs';
import { packagesDir, specDir } from '../src/util/paths.mjs';

const { built } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const committed = (dir, file) =>
  JSON.parse(readFileSync(join(specDir, dir, `${file}.json`), 'utf8'));
const recipe = (file) =>
  readFileSync(
    join(packagesDir, 'styles/src/generated/mui/components', `${file}.ts`),
    'utf8',
  );
const descriptor = (name) => DESCRIPTORS.find((d) => d.name === name);

const names = tokenNames(loadContract());
const catalog = loadWebCatalog();
const defaults = loadDefaults();
const build = (component, overlay) =>
  buildComponentSpec(loadComponent(catalog, component), {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
const yaml = (text) => parseOverlay(text, 'test.yaml');
// The build's findings no overlay rule decides.
const open = ({ deviations }) =>
  deviations.filter((d) => !d.decision).map((d) => d.token);

const F8 = [
  'Tab Item',
  'Tabs',
  'Nav Item',
  'Section Nav Item',
  'Section Nav Group Header',
  'Breadcrumb Item',
  'Breadcrumbs',
  'Tree Item',
];

describe('F8', () => {
  it('builds every member with each finding decided', () => {
    for (const name of F8) expect(open(of(name)), name).toEqual([]);
  });
});

describe('samples that drop Figma’s default variant', () => {
  const TRAIL = [
    'root',
    'item1',
    'iconChevronRight',
    'item2',
    'iconChevronRight2',
    'current',
    'item3',
    'iconChevronRight3',
    'item4',
    'iconChevronRight4',
  ];

  it('build Breadcrumbs from its 5-item trail, which names every item and chevron', () => {
    // Figma's default is items=multiple, which the overlay's samples drop.
    expect(build('Breadcrumbs', null).spec.provenance.defaultVariant).toBe(
      'items=multiple',
    );
    const { spec } = build('Breadcrumbs', loadOverlay('Breadcrumbs'));
    expect(spec.provenance.defaultVariant).toBe('items=5');
    expect(spec.api).toEqual({});
    expect(Object.keys(spec.layers)).toEqual(TRAIL);
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'samples', at: 'items: 5' }),
    );
    expect(committed('components', 'breadcrumbs').api).toEqual({});
  });

  it('read the rest against the one variant kept, whichever it is', () => {
    const overlay = structuredClone(loadOverlay('Breadcrumbs'));
    overlay.samples.items.keep = ['4'];
    // A 4-item trail has three chevrons: the fourth's bind no longer matches the IR.
    delete overlay.bind['iconChevronRight4.width'];
    const { spec } = build('Breadcrumbs', overlay);
    expect(spec.provenance.defaultVariant).toBe('items=4');
    expect(Object.keys(spec.layers)).toEqual(TRAIL.slice(0, 8));
  });

  it('pick the kept variant at every other axis’s default', () => {
    // Tab Item's default is size=md; keeping sm leaves size=sm at the state axis's default.
    const { spec } = build(
      'Tab Item',
      yaml(
        'component: Tab Item\nsamples:\n  size:\n    keep: [sm]\n    reason: r\n',
      ),
    );
    expect(spec.provenance.defaultVariant).toBe('size=sm, state=default');
    expect(spec.api.size).toBeUndefined();
    expect(spec.api.selected).toEqual({ type: 'boolean', default: false });
  });

  it('leave the oracle every trail, each reached as Figma draws it', () => {
    const variants = committed('verify', 'breadcrumbs').variants;
    expect(variants.map((v) => v.figma).sort()).toEqual([
      'items=2',
      'items=3',
      'items=4',
      'items=5',
      'items=multiple',
    ]);
    // The trail's layers grow two at a time: an item and a chevron.
    const count = Object.fromEntries(
      variants.map((v) => [v.figma, Object.keys(v.layers).length]),
    );
    expect(count).toEqual({
      'items=2': 4,
      'items=3': 6,
      'items=4': 8,
      'items=5': 10,
      'items=multiple': 6,
    });
    expect(
      Object.keys(variants.find((v) => v.figma === 'items=5').layers).sort(),
    ).toEqual([...TRAIL].sort());
    for (const v of variants) expect(v.props, v.figma).toEqual({});
  });
});

describe('a Counter in a tab', () => {
  const states = descriptor('Counter').mui.states;

  it('takes a button’s hover, press and disabled around it, never a tab’s', () => {
    expect(states.hover).toBe(
      '&:is(button):not(:disabled):hover, button:not(:disabled):not([role="tab"]):hover &',
    );
    expect(states.pressed).toBe(
      '&:is(button):not(:disabled):active, button:not(:disabled):not([role="tab"]):active &',
    );
    expect(states.disabled).toBe(
      '&.SolarCounter-disabled, button:not([role="tab"]):disabled &, .Mui-disabled:not([role="tab"]) &',
    );
    // Every selector reaching out to a control around it excludes a tab; its own does not.
    for (const [state, selector] of Object.entries(states)) {
      if (!selector) continue;
      for (const part of selector.split(', '))
        if (part.endsWith(' &'))
          expect(part, `${state}: ${part}`).toContain(':not([role="tab"])');
    }
    // A tab alone: without its exclusion, each is the selector a Button's counter took before.
    const without = (s) => s.replaceAll(':not([role="tab"])', '');
    expect(without(states.hover)).toBe(
      '&:is(button):not(:disabled):hover, button:not(:disabled):hover &',
    );
    expect(without(states.pressed)).toBe(
      '&:is(button):not(:disabled):active, button:not(:disabled):active &',
    );
    expect(without(states.disabled)).toBe(
      '&.SolarCounter-disabled, button:disabled &, .Mui-disabled &',
    );
  });

  it('is drawn so in the committed recipe, for every type', () => {
    const counter = recipe('counter');
    for (const selector of Object.values(states).filter(Boolean))
      expect(counter).toContain(`'${selector}'`);
    // The selector before, a Button's and a tab's alike, is gone.
    expect(counter).not.toContain("button:not(:disabled):hover &'");
    expect(counter).not.toContain('button:disabled &');
  });

  it('is drawn by the tab’s state, in the variant Figma names for it', () => {
    const counter = of('Tab Item').spec.style.counter;
    expect(counter.base['variant.type'].keyword).toBe('idle');
    for (const state of ['selected', 'focus', 'disabled'])
      expect(
        counter.appearance.default[state]['variant.type'].keyword,
        state,
      ).toBe('regular');
  });
});

describe('Tab Item', () => {
  const { spec } = of('Tab Item');

  it('draws the focused tab’s underline in color.border.strong, where Figma binds a width', () => {
    const focus = spec.style.root.appearance.default.focus;
    expect(focus.borderColor).toMatchObject({
      token: 'color.border.strong',
      from: 'overlay',
      replaced: { literal: '{Spatial:border/strong}' },
    });
    expect(focus.shadow.token).toBe('shadow.focus.default');
    const misbound = of('Tab Item').deviations.find(
      (d) => d.token === 'component.tab item.root.borderColor#misbound',
    );
    expect(misbound.decision.rule).toBe('set');
    // Without the rule, the misbound colour is an open finding.
    const overlay = structuredClone(loadOverlay('Tab Item'));
    delete overlay.set['root.appearance.default.focus.borderColor'];
    expect(open(build('Tab Item', overlay))).toEqual([
      'component.tab item.root.borderColor#misbound',
    ]);
  });

  it('underlines the selected and the focused tab, 2px of border.strong, and none at rest', () => {
    const root = spec.style.root;
    expect(root.base.borderBottomWidth.none).toBe(true);
    for (const state of ['selected', 'focus'])
      expect(
        root.appearance.default[state].borderBottomWidth.token,
        state,
      ).toBe('border.strong');
    const committedRoot = committed('components', 'tab-item').style.root;
    expect(committedRoot.base.borderBottomWidth.none).toBe(true);
    expect(
      committedRoot.appearance.default.selected.borderBottomWidth.token,
    ).toBe('border.strong');
    // Without follows, the state's width is an axis finding.
    const overlay = structuredClone(loadOverlay('Tab Item'));
    delete overlay.follows;
    expect(open(build('Tab Item', overlay))).toEqual([
      'component.tab item.root.borderBottomWidth@state=focus',
      'component.tab item.root.borderBottomWidth@state=selected',
    ]);
  });

  it('names its counter a count, and draws its words in MUI’s Tab label, rippleless', () => {
    const api = apiOf(of('Tab Item').spec);
    expect([api.react.counter, api.flutter.counter]).toEqual([
      'count',
      'count',
    ]);
    const react = TEMPLATES['Tab Item'](spec);
    expect(react).toContain(
      "import Tab, { type TabProps } from '@mui/material/Tab';",
    );
    expect(react).toContain("label={drawChildren('root', {");
    expect(react).toContain('disableRipple');
    expect(react).toContain("import { useTabsSize } from './Tabs.js';");
  });

  it('announces itself a tab in Flutter, its counter at rest in a scope of its own', () => {
    const widget = FLUTTER_TEMPLATES['Tab Item'](spec);
    expect(widget).toContain('role: SemanticsRole.tab,');
    expect(widget).toContain("'counter': SolarStatesScope(");
    expect(widget).toContain('SolarTabsScope.maybeOf(context)');
  });
});

describe('Tabs', () => {
  const { spec } = of('Tabs');
  const react = TEMPLATES.Tabs(spec);

  it('is MUI’s standard Tabs, its tabs layer the list, its indicator hidden', () => {
    expect(react).toContain('variant="standard"');
    expect(react).toContain(
      "list: { className: 'SolarTabs-tabs SolarTabs-box' },",
    );
    expect(descriptor('Tabs').mui.resets['& .MuiTabs-indicator']).toEqual({
      display: 'none',
    });
    expect(recipe('tabs')).toContain("'& .MuiTabs-indicator': {");
  });

  it('exports its size’s context, defaulting to the IR’s default', () => {
    expect(spec.api.size.default).toBe('sm');
    expect(react).toContain('export const TabsSizeContext = createContext<');
    expect(react).toContain(
      'export const useTabsSize = () => useContext(TabsSizeContext);',
    );
    expect(react).toContain("<TabsSizeContext.Provider value={size ?? 'sm'}>");
    const md = structuredClone(spec);
    md.api.size.default = 'md';
    expect(TEMPLATES.Tabs(md)).toContain(
      "<TabsSizeContext.Provider value={size ?? 'md'}>",
    );
  });

  it('wraps its strip in SolarTabsScope in Flutter, its tabs layer in SolarTabList', () => {
    const widget = FLUTTER_TEMPLATES.Tabs(spec);
    expect(widget).toContain('return SolarTabsScope(');
    expect(widget).toContain("{'tabs': (layer) => SolarTabList(child: layer)}");
  });

  it('checks its Tab Items with their icons and counter hidden, as Figma draws them', () => {
    const entries = committed('verify', 'tabs').variants.flatMap((v) =>
      Object.values(v.layers).filter((e) => e.component === 'Tab Item'),
    );
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries)
      expect(e.hides).toEqual(['counter', 'leadingIcon', 'trailingIcon']);
  });
});

describe('Nav Item', () => {
  const { spec } = of('Nav Item');
  const appearance = spec.style.root.appearance;

  it('follows expanded for its gap, padding and width', () => {
    for (const at of [
      'root.gap',
      'root.paddingLeft',
      'root.paddingRight',
      'root.width',
    ])
      expect(spec.overlay.rules, at).toContainEqual(
        expect.objectContaining({ rule: 'follows', at }),
      );
    // Collapsed, the icon alone: no gap, no padding, a 40px square.
    expect(spec.style.root.base.gap.token).toBe('inset.none');
    expect(spec.style.root.base.paddingLeft.token).toBe('inset.none');
    expect(spec.style.root.base.width).toMatchObject({ literal: 40 });
    expect(spec.style.root.base.width.allowed).toMatch(/40px square/);
    for (const key of [
      'selected=false, expanded=true',
      'selected=true, expanded=true',
    ]) {
      const expanded = appearance[key].default;
      expect(expanded.gap.token, key).toBe('inset.sm');
      expect(expanded.paddingLeft.token, key).toBe('inset.sm');
      expect(expanded.paddingRight.token, key).toBe('inset.sm');
      expect(expanded.width, key).toMatchObject({
        keyword: 'FILL',
        from: 'overlay',
        replaced: { literal: 182 },
      });
    }
    // Without follows, each expanded cell is an axis finding.
    const overlay = structuredClone(loadOverlay('Nav Item'));
    delete overlay.follows;
    const findings = open(build('Nav Item', overlay));
    expect(findings).toHaveLength(16);
    for (const prop of ['gap', 'paddingLeft', 'paddingRight', 'width'])
      expect(findings).toContain(
        `component.nav item.root.${prop}@selected=false, state=default, expanded=true`,
      );
  });

  it('adds focus as a state, SOLAR’s ring in every appearance', () => {
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(committed('components', 'nav-item').states).toContain('focus');
    expect(Object.keys(appearance)).toHaveLength(4);
    for (const [key, cells] of Object.entries(appearance))
      expect(cells.focus.shadow, key).toMatchObject({
        token: 'shadow.focus.default',
        from: 'overlay',
      });
    // Figma draws it none: without the rules, the item has no focus state.
    const overlay = structuredClone(loadOverlay('Nav Item'));
    for (const at of Object.keys(overlay.set))
      if (at.endsWith('.focus.shadow')) delete overlay.set[at];
    expect(build('Nav Item', overlay).spec.states).toEqual([
      'default',
      'hover',
    ]);
  });

  it('pads a 44 × 44 target around it', () => {
    expect(descriptor('Nav Item').mui.resets).toHaveProperty('&::after');
    expect(recipe('nav-item')).toContain("'&::after': {");
    expect(FLUTTER_TEMPLATES['Nav Item'](spec)).toContain('target: true,');
  });
});

describe('Section Nav Item and its group header', () => {
  const { spec } = of('Section Nav Item');

  it('spans its rail, the 220 Figma draws in every state but rest accepted, its words filling it', () => {
    expect(spec.style.root.base.width).toMatchObject({
      keyword: 'FILL',
      from: 'overlay',
      replaced: { keyword: 'HUG' },
    });
    expect(spec.style.label.base.width).toMatchObject({
      keyword: 'FILL',
      from: 'overlay',
      replaced: { keyword: 'HUG' },
    });
    const accepted = of('Section Nav Item')
      .deviations.filter((d) => d.decision?.rule === 'accept')
      .map((d) => d.token);
    expect(accepted).toEqual(
      ['disabled', 'focus', 'hover', 'selected'].map(
        (s) => `component.section nav item.root.width@state=${s}`,
      ),
    );
    const overlay = structuredClone(loadOverlay('Section Nav Item'));
    delete overlay.accept;
    expect(open(build('Section Nav Item', overlay))).toEqual(accepted);
  });

  it('pads no target, its rows touching, on either platform', () => {
    const resets = descriptor('Section Nav Item').mui.resets;
    expect(resets).not.toHaveProperty('&::after');
    expect(resets).not.toHaveProperty('&');
    expect(recipe('section-nav-item')).not.toContain('::after');
    expect(FLUTTER_TEMPLATES['Section Nav Item'](spec)).toContain(
      'target: false,',
    );
  });

  it('announces a group header as a heading of its level', () => {
    const header = of('Section Nav Group Header').spec;
    const react = TEMPLATES['Section Nav Group Header'](header);
    expect(react).toContain('role="heading"');
    expect(react).toContain('aria-level={level}');
    expect(react).toContain('level = 3');
    expect(FLUTTER_TEMPLATES['Section Nav Group Header'](header)).toContain(
      'Semantics(header: true, headingLevel: level, child: mark)',
    );
  });
});

describe('Breadcrumb Item', () => {
  const { spec } = of('Breadcrumb Item');

  it('adds focus as a state, SOLAR’s ring on a link alone', () => {
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(spec.style.root.appearance).toEqual({
      'type=link': {
        focus: {
          shadow: expect.objectContaining({
            token: 'shadow.focus.default',
            from: 'overlay',
          }),
        },
      },
    });
    const overlay = structuredClone(loadOverlay('Breadcrumb Item'));
    delete overlay.set;
    expect(build('Breadcrumb Item', overlay).spec.states).toEqual([
      'default',
      'hover',
    ]);
  });

  it('is a link, a button or the words alone, the current page announced so', () => {
    const react = TEMPLATES['Breadcrumb Item'](spec);
    expect(react).toContain('const control = !current && !disabled;');
    expect(react).toContain(
      "const as = !control ? 'span' : href !== undefined ? 'a' : 'button';",
    );
    expect(react).toContain("href={as === 'a' ? href : undefined}");
    expect(react).toContain("type={as === 'button' ? 'button' : undefined}");
    expect(react).toContain("aria-current={current ? 'page' : undefined}");
  });
});

describe('Tree Item', () => {
  const { spec } = of('Tree Item');
  const appearance = spec.style.root.appearance;

  it('names its rename field renameInput, where Figma names it a second label', () => {
    expect(spec.layers.renameInput).toMatchObject({
      path: '/|Label',
      type: 'TEXT',
    });
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'layerNames',
        at: '/|Label → rename input',
      }),
    );
    const overlay = structuredClone(loadOverlay('Tree Item'));
    delete overlay.layerNames;
    expect(() => build('Tree Item', overlay)).toThrow(
      /layers \/Label and \/\|Label are all named label/,
    );
  });

  it('adds focus as a state, drawn with edit’s edge and ring in all four appearances', () => {
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(Object.keys(appearance)).toEqual([
      'selected=false, expanded=false',
      'selected=false, expanded=true',
      'selected=true, expanded=false',
      'selected=true, expanded=true',
    ]);
    for (const [key, { focus, edit }] of Object.entries(appearance)) {
      expect(focus, key).toMatchObject({
        borderColor: { token: 'color.border.feedback.focus.strong' },
        borderWidth: { token: 'border.default' },
        shadow: { token: 'shadow.focus.default' },
      });
      // Edit's own, as Figma draws it.
      for (const prop of ['borderColor', 'borderWidth', 'shadow'])
        expect(focus[prop].token, `${key} ${prop}`).toBe(edit[prop].token);
      // Its fill is its own, not edit's.
      expect(focus.background, key).toBeUndefined();
    }
  });

  it('accepts the edit rows’ padding, bound to stack.none where the others take inset.none', () => {
    const accepted = of('Tree Item')
      .deviations.filter((d) => d.decision?.rule === 'accept')
      .map((d) => d.token);
    expect(accepted).toHaveLength(8);
    for (const token of accepted)
      expect(token).toMatch(
        /^component\.tree item\.root\.padding(Top|Bottom)@selected=(true|false), expanded=(true|false), state=edit$/,
      );
    const overlay = structuredClone(loadOverlay('Tree Item'));
    delete overlay.accept;
    expect(open(build('Tree Item', overlay)).sort()).toEqual(
      [...accepted].sort(),
    );
  });

  it('maps Figma’s slots to what the shells take, its actions its own', () => {
    for (const platform of ['react', 'flutter'])
      expect(apiOf(of('Tree Item').spec)[platform]).toMatchObject({
        chevron: 'expandable',
        checkbox: 'checked',
        counter: 'count',
        buttons: null,
      });
  });
});
