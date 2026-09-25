import { describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  applyDefaults,
  loadDefaults,
  loadOverlay,
  parseDefaults,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const names = tokenNames(loadContract());
const catalog = loadWebCatalog();
const button = loadComponent(catalog, 'Button');
const build = (overlay) =>
  buildComponentSpec(button, {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
  });
const yaml = (text) => parseOverlay(text, 'test.yaml');

const plain = build(null);

describe('parseOverlay', () => {
  it('reads a rule set', () => {
    const o = yaml(`
component: Button
rename:
  prio:
    to: variant
    reason: the spec's own name for it
`);
    expect(o.rename.prio).toEqual({
      to: 'variant',
      reason: "the spec's own name for it",
    });
  });

  it('refuses a rule without a reason, because an unexplained override is drift', () => {
    expect(() =>
      yaml(`
component: Button
rename:
  prio:
    to: variant
`),
    ).toThrow(/test.yaml: rename.prio has no reason/);
  });

  it('checks a state rename has a target and a reason, and nothing else', () => {
    expect(() =>
      yaml('component: X\nstates:\n  rename:\n    pressed: { reason: r }\n'),
    ).toThrow(/states.rename.pressed names no value to rename to/);
    expect(() =>
      yaml('component: X\nstates:\n  rename:\n    pressed: { to: focus }\n'),
    ).toThrow(/states.rename.pressed has no reason/);
    expect(() =>
      yaml('component: X\nstates:\n  drop:\n    active: { reason: r }\n'),
    ).toThrow(/states: unknown section drop/);
  });

  it('refuses a key it does not know, rather than ignoring it', () => {
    expect(() => yaml('component: Button\nrenames: {}\n')).toThrow(
      /test.yaml: unknown section renames/,
    );
    expect(() =>
      yaml(`
component: Button
rename:
  prio:
    to: variant
    becase: typo
    reason: x
`),
    ).toThrow(/rename.prio: unknown field becase/);
  });

  it('refuses the same rule twice', () => {
    expect(() =>
      yaml(`
component: Button
rename:
  prio: { to: variant, reason: a }
  prio: { to: tone, reason: b }
`),
    ).toThrow(/unique/);
  });
});

describe('the overlay applied to Button', () => {
  it('renames an axis in the API and in the style keys', () => {
    const { spec } = build(
      yaml(`
component: Button
rename:
  prio: { to: variant, reason: the design spec calls it variant }
`),
    );
    expect(spec.api).toHaveProperty('variant');
    expect(spec.api).not.toHaveProperty('prio');
    expect(Object.keys(spec.style.root.appearance)).toContain(
      'variant=primary, danger=false',
    );
    expect(
      Object.keys(spec.style.root.appearance).some((k) => k.includes('prio=')),
    ).toBe(false);
  });

  it('sets the base components to wrap', () => {
    const { spec } = build(
      yaml(`
component: Button
base:
  mui: Button
  flutter: FilledButton
  reason: closest stock control on each platform
`),
    );
    expect(spec.base).toEqual({ mui: 'Button', flutter: 'FilledButton' });
  });

  it('makes a declared axis interaction a recipe entry instead of a deviation', () => {
    const { spec, deviations } = build(
      yaml(`
component: Button
follows:
  label.typography:
    axes: [size, prio, state, danger]
    reason: owner decision, follow Figma exactly
`),
    );
    const tertiary =
      spec.style.label.combined.md['prio=tertiary, danger=false'].hover;
    expect(tertiary.typography).toMatchObject({
      token: 'typography.link.md.hover',
    });
    expect(
      spec.style.label.combined.lg['prio=tertiary, danger=false'].hover
        .typography,
    ).toMatchObject({ token: 'typography.link.md.default' });
    expect(
      deviations.some((d) =>
        d.token.startsWith('component.button.label.typography@'),
      ),
    ).toBe(false);
    expect(
      plain.deviations.some((d) =>
        d.token.startsWith('component.button.label.typography@'),
      ),
    ).toBe(true);
  });

  it('binds a literal to the token of the same value, marked as the overlay’s', () => {
    const { spec, deviations } = build(
      yaml(`
component: Button
bind:
  root.paddingTop:
    literal: 0
    token: inset.none
    reason: same value, governed token
`),
    );
    expect(spec.style.root.base.paddingTop).toEqual({
      token: 'inset.none',
      from: 'overlay',
      reason: 'same value, governed token',
    });
    const d = deviations.find(
      (x) => x.token === 'component.button.root.paddingTop#unbound',
    );
    expect(d.decision).toEqual({
      rule: 'bind',
      reason: 'same value, governed token',
    });
  });

  it('refuses to bind a token whose value differs, because that would be a silent redesign', () => {
    expect(() =>
      build(
        yaml(`
component: Button
bind:
  root.paddingTop: { literal: 0, token: inset.xs, reason: wrong on purpose }
`),
      ),
    ).toThrow(/bind root.paddingTop: inset.xs is 8, not 0/);
  });

  it('sets a value at one address, and says it did', () => {
    const { spec } = build(
      yaml(`
component: Button
set:
  root.size.lg.shadow: { token: shadow.control, reason: test }
`),
    );
    // What the lookup found there before, the base's shadow, is kept beside the decision.
    expect(spec.style.root.size.lg.shadow).toEqual({
      token: 'shadow.control',
      from: 'overlay',
      reason: 'test',
      replaced: { token: 'shadow.control' },
    });
  });

  it('allows a listed literal and marks it, leaving any other literal unmarked', () => {
    const { spec } = build(
      yaml(`
component: Button
allowLiteral:
  root.height: { reason: SOLAR has no control height token }
`),
    );
    expect(spec.style.root.base.height).toMatchObject({
      literal: 40,
      allowed: 'SOLAR has no control height token',
    });
    expect(spec.style.root.size.sm.height).toMatchObject({
      literal: 32,
      allowed: expect.any(String),
    });
    expect(spec.style.root.base.paddingTop).not.toHaveProperty('allowed');
  });

  it('accepts a named deviation, which stays in the report with the decision', () => {
    const { deviations } = build(
      yaml(`
component: Button
accept:
  component.button.root.shadow@size=lg: { reason: lg is flat by design }
`),
    );
    const d = deviations.find(
      (x) => x.token === 'component.button.root.shadow@size=lg',
    );
    expect(d.decision).toEqual({
      rule: 'accept',
      reason: 'lg is flat by design',
    });
  });

  it('records every rule it applied in the IR, with its reason', () => {
    const { spec } = build(
      yaml(`
component: Button
rename:
  prio: { to: variant, reason: r1 }
allowLiteral:
  root.height: { reason: r2 }
`),
    );
    expect(spec.overlay.rules).toEqual([
      { rule: 'rename', at: 'prio', reason: 'r1' },
      { rule: 'allowLiteral', at: 'root.height', reason: 'r2' },
    ]);
  });

  it('is order independent', () => {
    const a = build(
      yaml(`
component: Button
allowLiteral:
  root.height: { reason: r }
rename:
  prio: { to: variant, reason: r }
`),
    );
    const b = build(
      yaml(`
component: Button
rename:
  prio: { to: variant, reason: r }
allowLiteral:
  root.height: { reason: r }
`),
    );
    const { overlay: _a, ...sa } = a.spec;
    const { overlay: _b, ...sb } = b.spec;
    expect(sa).toEqual(sb);
  });
});

describe('the overlay refuses anything it cannot apply', () => {
  const fails = (text, message) =>
    expect(() => build(yaml(text))).toThrow(message);

  it('a rule for another component', () => {
    fails('component: Tabs\n', /test.yaml is for Tabs, not Button/);
  });

  it('a property the IR does not have', () => {
    fails(
      'component: Button\nallowLiteral:\n  root.colour: { reason: x }\n',
      /allowLiteral root.colour: the IR has no such cell/,
    );
    fails(
      'component: Button\nset:\n  root.size.xxl.gap: { token: inset.xs, reason: x }\n',
      /set root.size.xxl.gap: the IR has no size xxl/,
    );
    fails(
      'component: Button\nrename:\n  tone: { to: variant, reason: x }\n',
      /rename tone: Button has no axis tone/,
    );
  });

  it('a literal allowance where there is no literal, which would be a stale rule', () => {
    fails(
      'component: Button\nallowLiteral:\n  root.radius: { reason: x }\n',
      /allowLiteral root.radius: no literal to allow/,
    );
  });

  it('a bind that finds no such literal, which would be a stale rule', () => {
    // root.radius is bound to radius.control everywhere; there is no literal 6 left to bind.
    fails(
      'component: Button\nbind:\n  root.radius: { literal: 6, token: radius.control, reason: x }\n',
      /bind root.radius: no literal 6 to bind/,
    );
  });

  it('a deviation that does not exist', () => {
    fails(
      'component: Button\naccept:\n  component.button.root.nothing: { reason: x }\n',
      /accept component.button.root.nothing: no such deviation/,
    );
  });

  it('a token that does not exist', () => {
    fails(
      'component: Button\nset:\n  root.base.shadow: { token: shadow.gigantic, reason: x }\n',
      /set root.base.shadow: shadow.gigantic is not a SOLAR token/,
    );
  });
});

describe('spec/overlay/button.yaml', () => {
  const overlay = loadOverlay('Button');

  it('exists and parses', () => {
    expect(overlay.component).toBe('Button');
  });

  it('carries the three owner decisions of 2026-09-23 and the base', () => {
    expect(overlay.follows['label.typography'].axes).toEqual([
      'size',
      'prio',
      'state',
      'danger',
    ]);
    expect(overlay.allowLiteral).toHaveProperty(['root.height']);
    // lg is flat as Figma draws it, so the shadow follows size too; `accept` would have kept
    // the base shadow on lg, which is the opposite of the decision.
    expect(overlay.follows['root.shadow'].axes).toEqual([
      'size',
      'prio',
      'state',
      'danger',
    ]);
    expect(overlay.base).toMatchObject({
      mui: 'Button',
      flutter: 'FilledButton',
    });
  });

  it('applies cleanly with the shared defaults, leaving every literal allowed or bound', () => {
    const { spec } = buildComponentSpec(button, {
      names,
      fileVersion: catalog.fileVersion,
      overlay,
      defaults: loadDefaults(),
    });
    const literals = [];
    const walk = (node, at) => {
      if (node && typeof node === 'object') {
        if ('literal' in node && !node.allowed) literals.push(at);
        for (const [k, v] of Object.entries(node)) walk(v, `${at}.${k}`);
      }
    };
    walk(spec.style, 'style');
    expect(literals).toEqual([]);
  });

  it('returns null for a component with no overlay', () => {
    expect(loadOverlay('No Such Component')).toBeNull();
  });
});

describe('the overlay forms 3b-2 wave B added', () => {
  const on = (component, text) =>
    buildComponentSpec(loadComponent(catalog, component), {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(`component: ${component}\n${text}`, 'test.yaml'),
    });

  it('binds several literals of one cell, and refuses one it would leave behind', () => {
    const slot = 'slots:\n  iconNone: { name: icon, type: icon, reason: r }\n';
    const { spec } = on(
      'Icon Button',
      `${slot}bind:\n  icon.width: { tokens: { 12: icon.xs, 16: icon.sm, 20: icon.md }, reason: r }\n`,
    );
    expect(spec.style.icon.size.lg.width.token).toBe('icon.md');
    expect(() =>
      on(
        'Icon Button',
        `${slot}bind:\n  icon.width: { tokens: { 12: icon.xs, 16: icon.sm }, reason: r }\n`,
      ),
    ).toThrow(/bind icon.width: leaves 20 unbound/);
    expect(() =>
      on(
        'Icon Button',
        `${slot}bind:\n  icon.width: { tokens: { 12: icon.sm }, reason: r }\n`,
      ),
    ).toThrow(/icon.sm is 16, not 12/);
    expect(() =>
      yaml(
        'component: X\nbind:\n  a.b: { literal: 0, token: inset.none, tokens: { 0: inset.none }, reason: r }\n',
      ),
    ).toThrow(/give literal and token, or tokens, not both/);
  });

  it('renames a two-valued axis to a boolean, and refuses a value it does not map', () => {
    const { spec } = on(
      'Button Group',
      "rename:\n  type: { to: fullWidth, values: { regular: 'false', full-width: 'true' }, reason: r }\n",
    );
    expect(spec.api.fullWidth).toEqual({ type: 'boolean', default: false });
    expect(Object.keys(spec.style.root.appearance)).toContain(
      'orientation=horizontal, fullWidth=true',
    );
    expect(() =>
      on(
        'Button Group',
        "rename:\n  type: { to: fullWidth, values: { regular: 'false' }, reason: r }\n",
      ),
    ).toThrow(/rename type: values gives nothing for full-width/);
  });

  it('sets a sizing keyword, and only FILL or HUG', () => {
    const { spec } = on(
      'Button Group',
      'set:\n  tertiaryCTA.base.width: { keyword: FILL, reason: r }\n',
    );
    expect(spec.style.tertiaryCTA.base.width).toMatchObject({
      keyword: 'FILL',
      from: 'overlay',
    });
    expect(() =>
      on(
        'Button Group',
        'set:\n  tertiaryCTA.base.width: { keyword: GROW, reason: r }\n',
      ),
    ).toThrow(/keyword must be FILL or HUG/);
  });
});

describe('the shared defaults (spec/overlay/defaults.yaml)', () => {
  const defaults = loadDefaults();
  const withDefaults = (overlay, d = defaults) =>
    buildComponentSpec(button, {
      names,
      fileVersion: catalog.fileVersion,
      overlay,
      defaults: d,
    });

  it('binds an inset Figma leaves at 0 to inset.none, in every layer, and decides its finding', () => {
    expect(defaults.bind['zero-insets']).toMatchObject({
      literal: 0,
      token: 'inset.none',
    });
    expect(defaults.bind['zero-gaps'].token).toEqual({
      HORIZONTAL: 'inset.none',
      VERTICAL: 'stack.none',
    });
    const { spec, deviations } = withDefaults(null);
    expect(spec.style.root.base.paddingTop).toMatchObject({
      token: 'inset.none',
      from: 'defaults',
    });
    expect(
      deviations.find(
        (d) => d.token === 'component.button.root.paddingTop#unbound',
      ).decision,
    ).toMatchObject({ rule: 'bind', default: 'zero-insets' });
    // Recorded among the rules, with the file it came from.
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'bind',
        default: 'zero-insets',
        from: 'spec/overlay/defaults.yaml',
      }),
    );
  });

  it('leaves a cell the component rules on to the component', () => {
    const own = yaml(`
component: Button
allowLiteral:
  root.paddingTop:
    reason: kept raw, for this test
`);
    const { spec, deviations } = withDefaults(own);
    expect(spec.style.root.base.paddingTop).toMatchObject({
      literal: 0,
      allowed: 'kept raw, for this test',
    });
    expect(
      deviations.find(
        (d) => d.token === 'component.button.root.paddingTop#unbound',
      ).decision.rule,
    ).toBe('allowLiteral');
  });

  it('decides a finding only once no raw value is left in the cell', () => {
    // Button's gap is 12 in Figma, unbound: a default for 0 has nothing to bind there.
    const { deviations } = withDefaults(null);
    expect(
      deviations.find((d) => d.token === 'component.button.root.gap#unbound')
        .decision,
    ).toBeUndefined();
  });

  it('answers a 0 only a variant the recipe does not keep draws, which leaves nothing to bind', () => {
    // .Tree Indent's gap is 0 and unbound in variants compared against its reference, so the
    // recipe never holds the 0; the finding is Figma's, and the default still decides it.
    const indent = buildComponentSpec(loadComponent(catalog, '.Tree Indent'), {
      names,
      fileVersion: catalog.fileVersion,
      defaults,
    });
    const gap = indent.deviations.find(
      (d) => d.token === 'component..tree indent.root.gap#unbound',
    );
    expect(gap.literals).toEqual([0]);
    expect(gap.decision).toMatchObject({ default: 'zero-gaps' });
  });

  it('binds a zero gap to its direction’s none: a vertical one’s is stack.none', () => {
    // Spinner's root is a vertical auto layout; Icon Button's is horizontal.
    const on = (name) =>
      buildComponentSpec(loadComponent(catalog, name), {
        names,
        fileVersion: catalog.fileVersion,
        overlay: loadOverlay(name),
        defaults,
      }).spec.style.root.base.gap;
    expect(on('Spinner')).toMatchObject({ token: 'stack.none' });
    expect(on('Icon Button')).toMatchObject({ token: 'inset.none' });
  });

  it('reads a grid’s gap from its row gap, which Figma binds, and leaves it no default to decide', () => {
    const picker = buildComponentSpec(
      loadComponent(catalog, 'Date Picker Open'),
      { names, fileVersion: catalog.fileVersion, defaults },
    );
    const grid = picker.spec.style.dayGrid.base;
    expect(grid.direction).toMatchObject({ keyword: 'GRID' });
    expect(grid.gap).toMatchObject({ token: 'inset.2xs' });
    expect(
      picker.deviations.find(
        (d) => d.token === 'component.date picker open.dayGrid.gap#unbound',
      ),
    ).toBeUndefined();
  });

  it('leaves open a finding that holds another raw value besides 0', () => {
    const d = parseDefaults(
      `bind:\n  z:\n    cells: [gap]\n    literal: 0\n    token: inset.none\n    reason: r\n`,
      'd.yaml',
    );
    const spec = { component: 'X', style: { root: { base: {} } } };
    const found = [
      {
        kind: 'unbound',
        token: 'component.x.root.gap#unbound',
        literals: [0, 2],
      },
    ];
    const r = applyDefaults(spec, found, d, { names, overlay: null });
    expect(r.deviations[0].decision).toBeUndefined();
  });

  it('is not an error where it finds nothing, unlike a component rule', () => {
    const d = parseDefaults(
      `bind:\n  none-here:\n    cells: [gap]\n    literal: 999\n    token: inset.none\n    reason: test\n`,
      'test.yaml',
    );
    // inset.none is 0, not 999: the token must have the value it binds.
    expect(() => withDefaults(null, d)).toThrow(/inset.none is 0, not 999/);
    const fine = parseDefaults(
      `bind:\n  none-here:\n    cells: [radius]\n    literal: 0\n    token: inset.none\n    reason: test\n`,
      'test.yaml',
    );
    expect(() => withDefaults(null, fine)).not.toThrow();
  });

  it('refuses a rule without a reason or its cells', () => {
    expect(() =>
      parseDefaults(
        `bind:\n  x:\n    cells: [gap]\n    literal: 0\n    token: inset.none\n`,
        'd.yaml',
      ),
    ).toThrow(/bind.x has no reason/);
    expect(() =>
      parseDefaults(
        `bind:\n  x:\n    cells: []\n    literal: 0\n    token: inset.none\n    reason: r\n`,
        'd.yaml',
      ),
    ).toThrow(/cells must list/);
    expect(() => parseDefaults(`follows: {}\n`, 'd.yaml')).toThrow(
      /unknown section follows/,
    );
  });

  it('changes nothing when there are none', () => {
    const { spec, deviations } = build(null);
    const again = applyDefaults(spec, deviations, null, {
      names,
      overlay: null,
    });
    expect(again.spec).toEqual(spec);
  });
});

describe('layerNames', () => {
  it('addresses a layer by its Figma path and names it in words', () => {
    expect(() =>
      yaml(`
component: X
layerNames:
  Cells/Field:
    name: caret
    reason: r
`),
    ).toThrow(/address a layer by its Figma path, from \//);
    expect(() =>
      yaml(`
component: X
layerNames:
  /Field/|:
    name: "|"
    reason: r
`),
    ).toThrow(/name must be words of letters and digits/);
  });

  it('fails where the component has no such layer, as every rule does', () => {
    expect(() =>
      build(
        yaml(`
component: Button
layerNames:
  /Nowhere:
    name: ghost
    reason: r
`),
      ),
    ).toThrow(/layerNames \/Nowhere: the component has no such layer/);
  });

  it('gives the layer its name, and refuses a slot’s layer, whose name is the slot’s', () => {
    const group = loadComponent(catalog, 'Button Group');
    const on = (text) =>
      buildComponentSpec(group, {
        names,
        fileVersion: catalog.fileVersion,
        overlay: yaml(`component: Button Group\n${text}`),
      });
    const { spec } = on(`layerNames:
  /Button#3:
    name: third button
    reason: r
`);
    expect(spec.layers.thirdButton).toMatchObject({ path: '/Button#3' });
    expect(() =>
      on(`layerNames:
  /Button#2:
    name: other
    reason: r
`),
    ).toThrow(/the layer is slot secondaryCTA's, whose name is the slot's/);
  });
});

describe('codeName', () => {
  it('is capitalised words with a reason', () => {
    expect(() =>
      yaml(`component: X\ncodeName:\n  name: dayCell\n  reason: r\n`),
    ).toThrow(/codeName: name must be capitalised words/);
    expect(() => yaml(`component: X\ncodeName:\n  name: Day Cell\n`)).toThrow(
      /codeName has no reason/,
    );
  });

  it('is for the component its address names, and no other', () => {
    const picker = loadComponent(catalog, 'inputs/Day Cell');
    const on = (component) =>
      buildComponentSpec(picker, {
        names,
        fileVersion: 'x',
        overlay: yaml(
          `component: ${component}\ncodeName:\n  name: Date Picker Day Cell\n  reason: r\n`,
        ),
      });
    expect(on('inputs/Day Cell').spec.component).toBe('Date Picker Day Cell');
    expect(() => on('calendar/Day Cell')).toThrow(
      /is for calendar\/Day Cell, not Date Picker Day Cell/,
    );
  });
});

describe('controlDraws', () => {
  it('names a layer the component has, and is recorded as a decision', () => {
    expect(() =>
      build(
        yaml(`
component: Button
controlDraws:
  ghost:
    reason: r
`),
      ),
    ).toThrow(/controlDraws ghost: the IR has no layer ghost/);
    const { spec } = build(
      yaml(`
component: Button
controlDraws:
  spinner:
    reason: MUI's loading indicator draws itself
`),
    );
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'controlDraws', at: 'spinner' }),
    );
  });
});

describe('drawing, and an allowLiteral of some values', () => {
  it('refuses a drawing without a reason, and an allowLiteral with values that are not numbers', () => {
    expect(() => yaml(`component: X\ndrawing: {}\n`)).toThrow(
      /drawing has no reason/,
    );
    expect(() =>
      yaml(
        `component: X\nallowLiteral:\n  root.width:\n    values: [a]\n    reason: r\n`,
      ),
    ).toThrow(/values must list the numbers it allows/);
  });

  it('makes every cell follow every axis, so no axis finding is left', () => {
    const { deviations } = build(
      yaml(
        `component: Button\ndrawing:\n  reason: every variant its own drawing\n`,
      ),
    );
    expect(deviations.filter((d) => d.kind === 'axis')).toEqual([]);
    expect(plain.deviations.some((d) => d.kind === 'axis')).toBe(true);
  });

  it('lets a bind leave the values an allowLiteral names, and allows those alone', () => {
    // Button's heights are 32, 40 and 48; bind 40 (as if it had a token) and allow the rest.
    const on = (values) =>
      build(
        yaml(`component: Button
bind:
  root.height:
    tokens: { 40: inset.3xl }
    reason: r
allowLiteral:
  root.height:
    values: [${values}]
    reason: r
`),
      );
    const { spec } = on('32, 48');
    expect(spec.style.root.base.height).toMatchObject({ token: 'inset.3xl' });
    expect(() => on('32')).toThrow(/leaves 48 unbound/);
  });
});

describe('samples and caller: a colour the caller gives (F1, Avatar)', () => {
  const avatar = loadComponent(catalog, 'Avatar');
  const on = (text) =>
    buildComponentSpec(avatar, {
      names,
      fileVersion: catalog.fileVersion,
      overlay: yaml(text),
    });

  it('refuses a caller rule with both a prop and a from, or a from no prop rule gives', () => {
    expect(() =>
      yaml(
        `component: X\ncaller:\n  root.background:\n    prop: color\n    from: color\n    reason: r\n`,
      ),
    ).toThrow(/give prop or from, one of them/);
    expect(() =>
      on(`component: Avatar
caller:
  ds.color:
    from: color
    reason: r
`),
    ).toThrow(/from color, which no caller rule gives/);
  });

  it('drops a sampled axis, keeping one variant per combination, or refuses', () => {
    const { spec } = on(`component: Avatar
samples:
  color:
    keep: [neutral]
    reason: samples
  shade:
    keep: [Light, Image, Logo]
    reason: samples
`);
    expect(Object.keys(spec.api)).toEqual(['size', 'type']);
    // Light and Dark kept together are two text avatars at one size.
    expect(() =>
      on(`component: Avatar
samples:
  color:
    keep: [neutral]
    reason: samples
  shade:
    keep: [Light, Dark, Image, Logo]
    reason: samples
`),
    ).toThrow(/keep two variants at lg, text/);
  });

  it('makes a caller’s cell a colour prop, and says which cells take it or follow it', () => {
    const { spec } = on(`component: Avatar
samples:
  color:
    keep: [neutral]
    reason: samples
  shade:
    keep: [Light, Image, Logo]
    reason: samples
caller:
  root.background:
    prop: color
    reason: the caller's
  ds.color:
    from: color
    reason: follows it
`);
    expect(spec.api.color).toEqual({ type: 'color', default: null });
    expect(spec.callers).toEqual({
      'root.background': { prop: 'color', reason: "the caller's" },
      'ds.color': { from: 'color', reason: 'follows it' },
    });
  });
});

describe('set keeps what Figma had beside the decision', () => {
  it('so the oracle excuses only the variants that draw what it replaced', () => {
    const { spec } = build(
      yaml(`component: Button
set:
  root.base.shadow:
    none: true
    reason: r
`),
    );
    expect(spec.style.root.base.shadow).toMatchObject({
      none: true,
      replaced: { token: expect.stringMatching(/^shadow\./) },
    });
  });
});

describe('set, where the IR keeps no entry for a state', () => {
  it('adds one for a state the component has, and refuses any other', () => {
    const on = (state) =>
      build(
        yaml(`component: Button
set:
  root.appearance.prio=primary, danger=false.${state}.borderColor:
    token: color.border.medium
    reason: r
`),
      );
    // Button draws focus with an entry of its own; loading, for the border, it does not.
    expect(
      on('loading').spec.style.root.appearance['prio=primary, danger=false']
        .loading.borderColor,
    ).toMatchObject({ token: 'color.border.medium', from: 'overlay' });
    expect(() => on('asleep')).toThrow(/the IR has no appearance asleep/);
  });
});

describe('patterns and reason references, which save repeating a decision', () => {
  const stepper = loadComponent(catalog, 'Stepper');
  const buildStepper = (text) =>
    buildComponentSpec(stepper, {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(text, 'stepper.yaml'),
    });

  it('expands a patterned layer into every layer it names, with the rule’s reason', () => {
    const { spec } = buildStepper(`
component: Stepper
allowLiteral:
  rectangle*.height:
    reason: the line's thickness
`);
    const lines = Object.keys(spec.layers).filter((l) =>
      /^rectangle\d*$/.test(l),
    );
    expect(lines.length).toBeGreaterThan(1);
    for (const l of lines)
      expect(spec.style[l].base.height).toMatchObject({
        allowed: "the line's thickness",
      });
  });

  it('fails a pattern that matches no layer, as a stale rule does', () => {
    expect(() =>
      buildStepper(`
component: Stepper
allowLiteral:
  nope*.height: { reason: r }
`),
    ).toThrow(/allowLiteral nope\*\.height: the pattern matches no layer/);
  });

  it('lets an address given in full win over a pattern on the same cell', () => {
    const { spec } = buildStepper(`
component: Stepper
allowLiteral:
  rectangle*.height: { reason: every line }
  rectangle1.height: { reason: the first line }
`);
    expect(spec.style.rectangle1.base.height.allowed).toBe('the first line');
    expect(spec.style.rectangle2.base.height.allowed).toBe('every line');
  });

  it('resolves a reason that is another rule’s to its sentence', () => {
    const o = parseOverlay(
      `
component: Button
allowLiteral:
  root.height: { reason: SOLAR has no control height token }
  label.height: { reason: { as: allowLiteral root.height } }
`,
      'test.yaml',
    );
    expect(o.allowLiteral['label.height'].reason).toBe(
      'SOLAR has no control height token',
    );
  });

  it('fails a reason naming no rule, or one that refers back to itself', () => {
    expect(() =>
      parseOverlay(
        'component: Button\nallowLiteral:\n  root.height: { reason: { as: set nope.width } }\n',
        'test.yaml',
      ),
    ).toThrow(/its reason is set nope.width's, which is no rule of this file/);
    expect(() =>
      parseOverlay(
        `
component: Button
allowLiteral:
  root.height: { reason: { as: allowLiteral root.width } }
  root.width: { reason: { as: allowLiteral root.height } }
`,
        'test.yaml',
      ),
    ).toThrow(/refers back to itself/);
  });
});
