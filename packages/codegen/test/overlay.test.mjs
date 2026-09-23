import { describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { loadOverlay, parseOverlay } from '../src/normalize/overlay.mjs';
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
      spec.style.label.combined.xl['prio=tertiary, danger=false'].hover
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
  root.size.xl.shadow: { token: shadow.control, reason: test }
`),
    );
    expect(spec.style.root.size.xl.shadow).toEqual({
      token: 'shadow.control',
      from: 'overlay',
      reason: 'test',
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
  component.button.root.shadow@size=xl: { reason: xl is flat by design }
`),
    );
    const d = deviations.find(
      (x) => x.token === 'component.button.root.shadow@size=xl',
    );
    expect(d.decision).toEqual({
      rule: 'accept',
      reason: 'xl is flat by design',
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
    // xl is flat as Figma draws it, so the shadow follows size too; `accept` would have kept
    // the base shadow on xl, which is the opposite of the decision.
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

  it('applies cleanly, leaving every literal in the recipe allowed or bound', () => {
    const { spec } = build(overlay);
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
    expect(loadOverlay('Tabs')).toBeNull();
  });
});
