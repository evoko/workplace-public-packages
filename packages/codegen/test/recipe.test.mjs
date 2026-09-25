import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveVariants } from '../src/normalize/component-layers.mjs';
import { deriveRecipe, tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { docsDir } from '../src/util/paths.mjs';

const names = tokenNames(loadContract());
const buttonSet = JSON.parse(
  readFileSync(
    join(docsDir, 'solar-web', 'raw', 'components', 'buttons', 'button.json'),
    'utf8',
  ),
).componentSets.find((s) => s.name === 'Button');
const recipe = deriveRecipe(resolveVariants(buttonSet), { names });
const root = recipe.style['/'];
const label = recipe.style['/Label'];
const appearance = (prio, danger = 'false') =>
  root.appearance[`prio=${prio}, danger=${danger}`];
const deviation = (layer, cell, where) =>
  recipe.deviations.find(
    (d) =>
      d.layer === layer &&
      d.cell === cell &&
      (where === undefined ||
        JSON.stringify(d.where) === JSON.stringify(where)),
  );

describe('tokenNames', () => {
  it('maps a bound variable to its SOLAR doc name through the contract', () => {
    expect(names.variable('Spatial:radius/control')).toBe('radius.control');
    expect(names.variable('Color:action/primary/bg/hover')).toBe(
      'color.action.primary.bg.hover',
    );
    expect(names.variable('Type:size/label/md')).toBe('type.size.label.md');
  });

  it('maps text and effect styles to their tokens', () => {
    expect(names.textStyle('label/md')).toBe('typography.label.md');
    expect(names.effectStyle('shadow/control')).toBe('shadow.control');
  });

  it('returns null for a name that is not a SOLAR token, rather than guessing', () => {
    expect(names.variable('Sematic:surface/raised')).toBeNull();
    expect(names.textStyle('heading/huge')).toBeNull();
  });
});

describe('deriveRecipe: axis roles', () => {
  it('reads size, state and the rest as appearance, by name', () => {
    expect(recipe.axes.size.role).toBe('size');
    expect(recipe.axes.state.role).toBe('state');
    expect(recipe.axes.prio.role).toBe('appearance');
    expect(recipe.axes.danger.role).toBe('appearance');
  });

  it('accepts roles given explicitly, for a component whose axes are named differently', () => {
    const r = deriveRecipe(resolveVariants(buttonSet), {
      names,
      roles: {
        size: 'size',
        prio: 'appearance',
        state: 'state',
        danger: 'appearance',
      },
    });
    expect(r.axes.prio.role).toBe('appearance');
    expect(() =>
      deriveRecipe(resolveVariants(buttonSet), {
        names,
        roles: { prio: 'colour' },
      }),
    ).toThrow(/prio: unknown role colour/);
  });
});

describe('deriveRecipe on Button: the recipe', () => {
  it('holds geometry in token names, not pixels', () => {
    expect(root.base.radius).toMatchObject({ token: 'radius.control' });
    expect(root.base.borderWidth).toMatchObject({ token: 'border.default' });
    expect(root.base.gap).toMatchObject({ token: 'inset.xs' });
    expect(root.base.paddingLeft).toMatchObject({ token: 'inset.sm' });
    expect(root.base.radius).not.toHaveProperty('literal');
  });

  it('holds paint and type in token names', () => {
    expect(root.base.background).toMatchObject({
      token: 'color.action.primary.bg.default',
    });
    expect(root.base.shadow).toMatchObject({ token: 'shadow.control' });
    expect(label.base.color).toMatchObject({
      token: 'color.action.primary.text.default',
    });
    expect(label.base.typography).toMatchObject({
      token: 'typography.label.md',
    });
  });

  it('reads each icon’s colour from the icon itself, not from the root', () => {
    for (const icon of ['/Icon/None', '/Icon/None#2']) {
      const at = recipe.style[icon];
      expect(at.base.color).toMatchObject({
        token: 'color.action.primary.icon.default',
      });
      expect(
        at.appearance['prio=primary, danger=false'].hover.color,
      ).toMatchObject({
        token: 'color.action.primary.icon.hover',
      });
    }
    expect(JSON.stringify(recipe.style['/'])).not.toContain('iconColor');
  });

  it('gives each size only what differs from the base', () => {
    expect(root.size.sm.paddingLeft).toMatchObject({ token: 'inset.xs' });
    expect(root.size.sm).not.toHaveProperty('radius');
    expect(label.size.sm.typography).toMatchObject({
      token: 'typography.label.sm',
    });
    expect(root.size).not.toHaveProperty('md');
  });

  it('keys paint by appearance, then state', () => {
    expect(appearance('primary').hover.background).toMatchObject({
      token: 'color.action.primary.bg.hover',
    });
    expect(appearance('primary', 'true').default.background).toMatchObject({
      token: 'color.action.primary.bg.danger.default',
    });
    expect(appearance('secondary').default.background).toMatchObject({
      token: 'color.action.secondary.bg.default',
    });
  });

  it('records where every entry was read from', () => {
    expect(root.base.radius.from).toBe(buttonSet.defaultVariant);
    expect(appearance('primary').hover.background.from).toBe(
      'size=md, prio=primary, state=hover, danger=false',
    );
    // Geometry is read with the colour axes at their defaults, never from a hover variant.
    expect(root.size.sm.paddingLeft.from).toBe(
      'size=sm, prio=primary, state=default, danger=false',
    );
  });

  it('says a paint is absent rather than omitting it', () => {
    // tertiary has no background in the reference variant (md), which is different from
    // "inherits the base background", so it is stated.
    expect(appearance('tertiary').default.background).toEqual({
      none: true,
      from: 'size=md, prio=tertiary, state=default, danger=false',
    });
  });

  it('models which layers are present, per state', () => {
    expect(recipe.style['/Spinner'].base.present).toMatchObject({
      value: false,
    });
    expect(
      recipe.style['/Spinner'].appearance['prio=primary, danger=false'].loading
        .present,
    ).toMatchObject({ value: true });
    expect(
      label.appearance['prio=primary, danger=false'].loading.present,
    ).toMatchObject({
      value: false,
    });
  });

  it('keeps a composed child to its own props, not the child component’s internals', () => {
    const counter = recipe.style['/Counter'];
    expect(counter.base['variant.type']).toMatchObject({ keyword: 'inverted' });
    // Counter's padding and radius belong to the Counter recipe; Button only picks the variant.
    expect(counter.base).not.toHaveProperty('radius');
    expect(counter.base).not.toHaveProperty('paddingLeft');
  });

  it('lists the layer tree the style is keyed by', () => {
    expect(recipe.layers['/']).toEqual({ parent: null, type: 'COMPONENT' });
    expect(recipe.layers['/Icon/None#2']).toEqual({
      parent: '/',
      type: 'INSTANCE',
    });
  });
});

describe('deriveRecipe on Button: deviations', () => {
  it('reports the secondary button that loses its background at sm, not silently', () => {
    const d = deviation('/', 'background', { size: 'sm' });
    expect(d).toBeDefined();
    const names = d.variants.map((v) => v.variant);
    expect(names).toContain(
      'size=sm, prio=secondary, state=default, danger=false',
    );
    const one = d.variants.find(
      (v) =>
        v.variant === 'size=sm, prio=secondary, state=default, danger=false',
    );
    expect(one.expected).toMatchObject({
      token: 'color.action.secondary.bg.default',
    });
    expect(one.found).toEqual({ none: true });
    // The recipe keeps the reference value: sm does not get to override it.
    expect(recipe.style['/'].size.sm).not.toHaveProperty('background');
  });

  it('reports the lg shadow as one systematic finding, not twenty', () => {
    const d = deviation('/', 'shadow', { size: 'lg' });
    expect(d.variants).toHaveLength(20);
    expect(d.variants.every((v) => v.found.none)).toBe(true);
    expect(
      recipe.deviations.filter((x) => x.layer === '/' && x.cell === 'shadow'),
    ).toHaveLength(1);
  });

  it('finds no lg label colour of its own, since Figma drew the disabled one as the others', () => {
    // Until 2026-09-25 the lg disabled secondary label borrowed the danger colour, a finding.
    expect(
      recipe.deviations.some((d) => d.token.includes('/Label.color@size=lg')),
    ).toBe(false);
  });

  it('reports the tertiary hover underline as a disagreement for a human, not a rule', () => {
    // Grouped by the three axes typography should not follow. All three sizes switch to a link
    // style there, and lg picks a different one (link/md/default, not hover), which is exactly
    // the inconsistency a human has to rule on.
    const d = deviation('/Label', 'typography', {
      prio: 'tertiary',
      state: 'hover',
      danger: 'false',
    });
    expect(d.variants.map((v) => [v.variant, v.found.token])).toEqual([
      [
        'size=md, prio=tertiary, state=hover, danger=false',
        'typography.link.md.hover',
      ],
      [
        'size=sm, prio=tertiary, state=hover, danger=false',
        'typography.link.sm.hover',
      ],
      [
        'size=lg, prio=tertiary, state=hover, danger=false',
        'typography.link.md.default',
      ],
    ]);
  });

  it('flags a value bound to no variable, and a missing token as a governance gap', () => {
    const height = deviation('/', 'height');
    expect(height.kind).toBe('unbound');
    expect(root.base.height).toMatchObject({ literal: 40 });
    expect(height.raise).toMatch(/no control height token/i);
    // A zero that equals inset.none is still not bound to it; the match is offered, not applied.
    const top = deviation('/', 'paddingTop');
    expect(top.kind).toBe('unbound');
    expect(top.suggest).toContain('inset.none');
    expect(root.base.paddingTop).toEqual({
      literal: 0,
      from: buttonSet.defaultVariant,
    });
  });

  it('names each deviation in the governance report shape', () => {
    for (const d of recipe.deviations) {
      expect(d.token).toMatch(/^component\.button\./);
      expect(typeof d.figmaValue).toBe('string');
      expect(d.reason.length).toBeGreaterThan(20);
      expect(d.raise).toBeTruthy();
    }
  });

  it('is deterministic', () => {
    const again = deriveRecipe(resolveVariants(buttonSet), { names });
    expect(JSON.stringify(again)).toBe(JSON.stringify(recipe));
  });
});

describe('deriveRecipe on a synthetic orthogonal component', () => {
  // Geometry that follows size only and paint that follows tone and state only: the model
  // holds everywhere, so there is nothing to report.
  const paint = {
    a: 'Color:action/primary/bg/default',
    b: 'Color:action/secondary/bg/default',
  };
  const hover = {
    a: 'Color:action/primary/bg/hover',
    b: 'Color:action/secondary/bg/hover',
  };
  const pad = { md: 'Spatial:inset/sm', sm: 'Spatial:inset/xs' };
  const variants = [];
  for (const size of ['md', 'sm'])
    for (const tone of ['a', 'b'])
      for (const state of ['default', 'hover']) {
        const fill = `{${(state === 'hover' ? hover : paint)[tone]}}`;
        variants.push({
          variant: `size=${size}, tone=${tone}, state=${state}`,
          size: [80, 40],
          overrides:
            size === 'md' && tone === 'a' && state === 'default'
              ? undefined
              : {
                  changed: {
                    '/': {
                      fills: [fill],
                      vars: { paddingLeft: pad[size] },
                    },
                  },
                },
        });
      }
  const set = {
    name: 'Orthogonal',
    defaultVariant: 'size=md, tone=a, state=default',
    props: {
      size: { type: 'VARIANT', default: 'md', options: ['md', 'sm'] },
      tone: { type: 'VARIANT', default: 'a', options: ['a', 'b'] },
      state: {
        type: 'VARIANT',
        default: 'default',
        options: ['default', 'hover'],
      },
    },
    defaultVariantTree: {
      name: 'size=md, tone=a, state=default',
      type: 'COMPONENT',
      fills: [`{${paint.a}}`],
      layout: {
        dir: 'HORIZONTAL',
        gap: 8,
        pad: [0, 12, 0, 12],
        sizing: 'HUG/HUG',
      },
      vars: {
        itemSpacing: 'Spatial:inset/xs',
        paddingLeft: pad.md,
        paddingRight: 'Spatial:inset/sm',
        paddingTop: 'Spatial:inset/none',
        paddingBottom: 'Spatial:inset/none',
      },
    },
    variants,
  };
  const r = deriveRecipe(resolveVariants(set), { names });

  it('produces no deviations', () => {
    expect(r.deviations).toEqual([]);
  });

  it('still splits geometry and paint by axis', () => {
    expect(r.style['/'].size.sm.paddingLeft).toMatchObject({
      token: 'inset.xs',
    });
    expect(r.style['/'].appearance['tone=b'].hover.background).toMatchObject({
      token: 'color.action.secondary.bg.hover',
    });
  });

  it('reports a binding to a variable that is not a SOLAR token', () => {
    const bad = structuredClone(set);
    bad.defaultVariantTree.vars.itemSpacing = 'Legacy Spatial:Spacing/8';
    const d = deriveRecipe(resolveVariants(bad), { names }).deviations.find(
      (x) => x.cell === 'gap',
    );
    expect(d.kind).toBe('unknown-token');
    expect(d.figmaValue).toContain('Legacy Spatial:Spacing/8');
  });

  it('reads a combination Figma never drew from the variant it did, and says so', () => {
    // Avatar has 114 of its 540 combinations. Here size=sm exists only with tone=b, so there is no
    // variant that defines sm with tone at its default.
    const sparse = structuredClone(set);
    sparse.variants = sparse.variants.filter(
      (v) => !v.variant.startsWith('size=sm, tone=a'),
    );
    const r = deriveRecipe(resolveVariants(sparse), { names });
    expect(r.style['/'].size.sm.paddingLeft).toEqual({
      token: 'inset.xs',
      from: 'size=sm, tone=b, state=default',
    });
    const d = r.deviations.filter((x) => x.kind === 'sparse');
    expect(d).toHaveLength(1);
    expect(d[0].where).toBe('size=sm');
    expect(d[0].reason).toMatch(/read from size=sm, tone=b, state=default/);
  });
});

describe('deriveRecipe: an icon drawn in more than one colour', () => {
  const withIcons = (fills) => {
    const resolved = resolveVariants(buttonSet);
    for (const v of resolved.variants)
      for (const [, layer] of v.layers)
        if (layer.iconFills) layer.iconFills = fills;
    return deriveRecipe(resolved, { names });
  };

  it('is a cell when the icon’s vectors share one colour, repeated or not', () => {
    const r = withIcons([
      '{Color:action/primary/icon/default}',
      '{Color:action/primary/icon/default}',
    ]);
    expect(r.style['/Icon/None'].base.color).toMatchObject({
      token: 'color.action.primary.icon.default',
    });
    expect(r.deviations.some((d) => d.kind === 'unattributed')).toBe(false);
  });

  it('is no cell and one finding per icon, never a guess or a failed build', () => {
    const r = withIcons([
      '{Color:action/primary/icon/default}',
      '{Color:action/secondary/icon/default}',
    ]);
    expect(r.style['/Icon/None'].base).not.toHaveProperty('color');
    const found = r.deviations.filter((d) => d.kind === 'unattributed');
    expect(found.map((d) => d.token)).toEqual([
      'component.button.Icon/None#2.color#unattributed',
      'component.button.Icon/None.color#unattributed',
    ]);
  });
});

describe('deriveRecipe on Spinner: strokes', () => {
  const spinnerSet = JSON.parse(
    readFileSync(
      join(
        docsDir,
        'solar-web',
        'raw',
        'components',
        'feedback',
        'spinner.json',
      ),
      'utf8',
    ),
  ).componentSets[0];
  const r = deriveRecipe(resolveVariants(spinnerSet), { names });

  it('reads a uniform stroke binding, not only per-side ones', () => {
    expect(r.style['/SpinnerRing/Track'].base.borderWidth).toMatchObject({
      token: 'border.strong',
    });
  });

  it('reports a colour bound to a variable that is not a colour, and never paints it', () => {
    // The indicator as Figma drew it until 2026-09-25: its colour bound to a width variable.
    const slip = structuredClone(spinnerSet);
    const indicator = (n) =>
      n.name === 'Indicator'
        ? n
        : (n.children ?? []).map(indicator).find(Boolean);
    indicator(slip.defaultVariantTree).strokes = ['{Spatial:border/strong}'];
    const r = deriveRecipe(resolveVariants(slip), { names });
    const cell = r.style['/SpinnerRing/Indicator'].base.borderColor;
    expect(cell).not.toHaveProperty('token');
    expect(cell).toMatchObject({ misbound: true });
    const d = r.deviations.find((x) => x.kind === 'misbound');
    expect(d).toMatchObject({
      token: 'component.spinner.SpinnerRing/Indicator.borderColor#misbound',
      figmaValue: 'bound to Spatial:border/strong',
    });
  });

  it('does not call a primitive colour misbound: it is a colour, used where a semantic one belongs', () => {
    const avatar = JSON.parse(
      readFileSync(
        join(
          docsDir,
          'solar-web',
          'raw',
          'components',
          'data-display',
          'avatar.json',
        ),
        'utf8',
      ),
    ).componentSets.find((s) => s.name === 'Avatar');
    const a = deriveRecipe(resolveVariants(avatar), { names });
    expect(a.deviations.some((d) => d.kind === 'misbound')).toBe(false);
  });

  it('refuses a glyph whose path a target cannot draw, naming the layer', () => {
    const set = {
      name: 'X',
      defaultVariant: 'tone=a',
      props: { tone: { type: 'VARIANT', default: 'a', options: ['a'] } },
      defaultVariantTree: {
        name: 'tone=a',
        type: 'COMPONENT',
        children: [
          {
            name: 'Mark',
            type: 'VECTOR',
            size: [10, 10],
            geometry: [
              { path: 'M0 0 A5 5 0 0 1 10 10', windingRule: 'NONZERO' },
            ],
          },
        ],
      },
      variants: [{ variant: 'tone=a' }],
    };
    expect(() => deriveRecipe(resolveVariants(set), { names })).toThrow(
      /X \/Mark.glyph fill/,
    );
  });

  it('settles disagreeing bindings by the value Figma draws, where one names it', () => {
    const layer = {
      // A stroke to draw: a weight with no stroke paint is no border.
      strokes: ['{Color:border/medium}'],
      strokeWeight: 2,
      vars: {
        strokeWeight: 'Spatial:border/strong',
        strokeTopWeight: 'Spatial:border/default',
      },
    };
    const set = {
      name: 'X',
      defaultVariant: 'tone=a',
      props: { tone: { type: 'VARIANT', default: 'a', options: ['a'] } },
      defaultVariantTree: {
        name: 'tone=a',
        type: 'COMPONENT',
        children: [{ name: 'Ring', type: 'FRAME', ...layer }],
      },
      variants: [{ variant: 'tone=a' }],
    };
    const x = deriveRecipe(resolveVariants(set), { names });
    expect(x.style['/Ring'].base.borderWidth).toMatchObject({
      token: 'border.strong',
    });
    // Drawn at a width neither names: still two values for one cell.
    set.defaultVariantTree.children[0].strokeWeight = 3;
    expect(() => deriveRecipe(resolveVariants(set), { names })).toThrow(
      /binds Spatial:border\/strong and Spatial:border\/default/,
    );
  });
});

// A guard on the whole corpus, not only Button: a change that makes the recipe throw on a shape
// it used to handle shows up here, where Button's own suite would stay green. The three sets that
// do not derive throw on shapes the recipe does not model yet: a side bound to two variables
// (Weekday Header, Popover), and a layer with two stacked colours (Insight Card). Dialog left the
// list when an image fill became content rather than a second paint.
describe('deriveRecipe over all of SOLAR Web', () => {
  it('derives every set', async () => {
    const { readdirSync } = await import('node:fs');
    const root = join(docsDir, 'solar-web', 'raw', 'components');
    const failures = [];
    const unattributed = [];
    let total = 0;
    for (const dir of readdirSync(root))
      for (const file of readdirSync(join(root, dir)))
        for (const set of JSON.parse(
          readFileSync(join(root, dir, file), 'utf8'),
        ).componentSets) {
          total++;
          try {
            const r = deriveRecipe(resolveVariants(set), { names });
            if (r.deviations.some((d) => d.kind === 'unattributed'))
              unattributed.push(`${dir}/${set.name}`);
          } catch {
            failures.push(`${dir}/${set.name}`);
          }
        }
    // Every one, since milestone 4's Task M5: Insight Card's stacked paints are the top one, and
    // Popover's corners cells of their own (Weekday Header's sides since 3b-2 Task B2).
    expect(failures.sort()).toEqual([]);
    // Every icon colour in SOLAR Web is one colour on one icon.
    expect(unattributed).toEqual([]);
    expect(total).toBe(119);
  });
});

describe('deriveRecipe: a border whose sides differ', () => {
  // Button Group's full-width bar: a divider along the top only, bound on that side.
  const set = (weights) => ({
    name: 'Bar',
    defaultVariant: 'tone=a',
    props: { tone: { type: 'VARIANT', default: 'a', options: ['a'] } },
    defaultVariantTree: {
      name: 'tone=a',
      type: 'COMPONENT',
      strokes: ['{Color:border/subtle}'],
      strokeWeight: 'mixed',
      ...(weights ? { strokeWeights: weights } : {}),
      vars: { strokeTopWeight: 'Spatial:border/default' },
      children: [],
    },
    variants: [{ variant: 'tone=a' }],
  });

  it('gives each side a cell of its own from the weights Figma records', () => {
    const r = deriveRecipe(resolveVariants(set([1, 0, 0, 0])), { names });
    const root = r.style['/'].base;
    expect(root.borderTopWidth).toMatchObject({ token: 'border.default' });
    for (const side of ['Right', 'Bottom', 'Left'])
      expect(root[`border${side}Width`]).toMatchObject({ none: true });
    expect(root).not.toHaveProperty('borderWidth');
    expect(r.deviations.some((d) => d.kind === 'unrecorded')).toBe(false);
  });

  it('without recorded weights, draws the bound side, marks it inferred and reports it', () => {
    const r = deriveRecipe(resolveVariants(set(null)), { names });
    const root = r.style['/'].base;
    expect(root.borderTopWidth).toMatchObject({
      token: 'border.default',
      inferred: true,
    });
    expect(root.borderBottomWidth).toMatchObject({
      none: true,
      inferred: true,
    });
    expect(r.deviations).toContainEqual(
      expect.objectContaining({
        kind: 'unrecorded',
        token: 'component.bar.root.borderWidth#unrecorded',
      }),
    );
  });
});

describe('deriveRecipe: a cell one variant has and another lacks', () => {
  // Two variants of one layer, `tone=b` changing it by `change`: Checkbox's box is an auto-layout
  // frame in some states only, StatusIndicator's shapes are sized in some, Tab Item's border has
  // sides in some.
  const set = (box, change) => ({
    name: 'Mark',
    defaultVariant: 'tone=a',
    props: { tone: { type: 'VARIANT', default: 'a', options: ['a', 'b'] } },
    defaultVariantTree: {
      name: 'tone=a',
      type: 'COMPONENT',
      children: [{ name: 'Box', type: 'FRAME', size: [16, 16], ...box }],
    },
    variants: [
      { variant: 'tone=a' },
      { variant: 'tone=b', overrides: { changed: { '/Box': change } } },
    ],
  });
  const derive = (box, change) =>
    deriveRecipe(resolveVariants(set(box, change)), { names });
  const layout = {
    dir: 'HORIZONTAL',
    align: 'CENTER/CENTER',
    gap: 4,
    pad: [2, 2, 2, 2],
    sizing: 'FIXED/FIXED',
  };
  const on = (r, cell) =>
    r.deviations.filter((d) => d.kind === 'axis' && d.cell === cell);

  it('reads no auto-layout as a layout of none, and reports the difference', () => {
    const r = derive({ layout }, { layout: null });
    const box = r.style['/Box'];
    expect(box.base.gap).toMatchObject({ literal: 4 });
    // The difference is geometry across an appearance axis: a finding, with none as what tone=b has.
    expect(on(r, 'gap')).toHaveLength(1);
    expect(on(r, 'gap')[0].variants[0].found).toEqual({ none: true });
    expect(on(r, 'direction')[0].figmaValue).toContain('none where HORIZONTAL');
  });

  it('writes the none where the layout follows the axis, so the lookup cannot fall back to the base', () => {
    const r = deriveRecipe(resolveVariants(set({ layout }, { layout: null })), {
      names,
      follows: { '/Box': { gap: ['tone'], direction: ['tone'] } },
    });
    const b = r.style['/Box'].appearance['tone=b'].default;
    expect(b.gap).toMatchObject({ none: true });
    expect(b.direction).toMatchObject({ none: true });
  });

  it('reads no recorded sizing as the size the layer is drawn at', () => {
    const r = derive(
      { sizing: 'FIXED/FIXED' },
      { sizing: null, size: [12, 12] },
    );
    expect(on(r, 'width')).toHaveLength(1);
    expect(on(r, 'width')[0].variants[0].found).toMatchObject({ literal: 12 });
  });

  it('reads one border width as that width on every side, where another variant has sides', () => {
    const r = derive(
      {
        strokes: ['{Color:border/subtle}'],
        strokeWeight: 1,
        vars: { strokeWeight: 'Spatial:border/default' },
      },
      {
        strokeWeight: 'mixed',
        strokeWeights: [0, 0, 1, 0],
        vars: { strokeBottomWeight: 'Spatial:border/default' },
      },
    );
    const base = r.style['/Box'].base;
    expect(base).not.toHaveProperty('borderWidth');
    for (const side of ['Top', 'Right', 'Bottom', 'Left'])
      expect(base[`border${side}Width`]).toMatchObject({
        token: 'border.default',
      });
    // tone=b drops three sides: three findings, the bottom agreeing.
    expect(on(r, 'borderTopWidth')).toHaveLength(1);
    expect(on(r, 'borderBottomWidth')).toHaveLength(0);
  });

  it('reports a cell it cannot give a meaning, rather than skipping it', () => {
    // No sizing and no size either: nothing to read the width as.
    const r = derive({ sizing: 'FIXED/FIXED' }, { sizing: null, size: null });
    expect(on(r, 'width')).toHaveLength(1);
    expect(on(r, 'width')[0].figmaValue).toContain('no value where');
  });

  it('leaves a layer whose variants agree on their cells as it was', () => {
    const r = derive({}, { name: 'Box' });
    expect(r.deviations).toEqual([]);
    expect(r.style['/Box'].base).not.toHaveProperty('gap');
  });
});

describe('deriveRecipe over SOLAR Web’s standalone components', () => {
  it('derives every one, all in the base, with nothing that differs across an axis', async () => {
    const { componentOf, loadWebCatalog } =
      await import('../src/normalize/components.mjs');
    const catalog = loadWebCatalog();
    const standalone = catalog.components.filter(
      (c) => c.kind === 'component' && c.section.startsWith('components/'),
    );
    expect(standalone).toHaveLength(13);
    for (const entry of standalone) {
      const r = deriveRecipe(resolveVariants(componentOf(entry)), { names });
      expect(r.axes, entry.name).toEqual({});
      for (const s of Object.values(r.style)) {
        expect(s.appearance, entry.name).toEqual({});
        expect(s.size, entry.name).toEqual({});
      }
      expect(r.deviations.filter((d) => d.kind === 'axis')).toEqual([]);
    }
  });
});

describe('deriveRecipe: corners of their own', () => {
  // Popover's content: a square corner where its arrow meets it, bound corner by corner.
  const set = (radius, vars, second) => ({
    name: 'Tip',
    defaultVariant: 'side=a',
    props: { side: { type: 'VARIANT', default: 'a', options: ['a', 'b'] } },
    defaultVariantTree: {
      name: 'side=a',
      type: 'COMPONENT',
      children: [
        { name: 'Body', type: 'FRAME', size: [100, 40], radius, vars },
      ],
    },
    variants: [
      { variant: 'side=a' },
      {
        variant: 'side=b',
        ...(second ? { overrides: { changed: { '/Body': second } } } : {}),
      },
    ],
  });
  const corners = {
    topLeftRadius: 'Spatial:radius/container',
    topRightRadius: 'Spatial:radius/container',
    bottomRightRadius: 'Spatial:radius/container',
    bottomLeftRadius: 'Spatial:radius/none',
  };

  it('gives each corner a cell, clockwise from the top left, from its own binding', () => {
    const r = deriveRecipe(resolveVariants(set([8, 8, 8, 0], corners)), {
      names,
    });
    const body = r.style['/Body'].base;
    expect(body).not.toHaveProperty('radius');
    expect(body.radiusTopLeft).toMatchObject({ token: 'radius.container' });
    expect(body.radiusBottomRight).toMatchObject({ token: 'radius.container' });
    expect(body.radiusBottomLeft).toMatchObject({ token: 'radius.none' });
  });

  it('reads corners that agree, in value and binding, as one radius', () => {
    const same = Object.fromEntries(
      Object.keys(corners).map((k) => [k, 'Spatial:radius/container']),
    );
    const r = deriveRecipe(resolveVariants(set([8, 8, 8, 8], same)), { names });
    expect(r.style['/Body'].base.radius).toMatchObject({
      token: 'radius.container',
    });
  });

  it('reads one radius as that radius on every corner, where another variant has corners', () => {
    const r = deriveRecipe(
      resolveVariants(
        set(
          8,
          {
            topLeftRadius: 'Spatial:radius/container',
            topRightRadius: 'Spatial:radius/container',
            bottomLeftRadius: 'Spatial:radius/container',
            bottomRightRadius: 'Spatial:radius/container',
          },
          {
            radius: [8, 8, 8, 0],
            vars: corners,
          },
        ),
      ),
      { names },
    );
    const body = r.style['/Body'];
    expect(body.base).not.toHaveProperty('radius');
    expect(body.base.radiusBottomLeft).toMatchObject({
      token: 'radius.container',
    });
    // side=b squares one corner: geometry across an appearance axis, so a finding.
    expect(
      r.deviations.filter(
        (d) => d.kind === 'axis' && d.cell === 'radiusBottomLeft',
      ),
    ).toHaveLength(1);
  });
});

describe('deriveRecipe: a cell painted twice', () => {
  it('draws the top paint and reports the one it covers (Insight Card’s selected card)', async () => {
    const { loadComponent, loadWebCatalog } =
      await import('../src/normalize/components.mjs');
    const { set } = loadComponent(loadWebCatalog(), 'Insight Card');
    const r = deriveRecipe(resolveVariants(set), { names });
    const covered = r.deviations.filter((d) => d.kind === 'covered');
    expect(covered).toHaveLength(1);
    expect(covered[0]).toMatchObject({
      layer: '/',
      cell: 'background',
      figmaValue: 'surface/background over surface/base in 5 variants',
    });
  });
});

describe('deriveRecipe: a layer placed by position', () => {
  // Toggle's thumb: in a frame with no auto layout, at 3 when off and 17 when on.
  const set = {
    name: 'Switch',
    defaultVariant: 'on=false',
    props: {
      on: { type: 'VARIANT', default: 'false', options: ['false', 'true'] },
    },
    defaultVariantTree: {
      name: 'on=false',
      type: 'COMPONENT',
      size: [32, 18],
      children: [
        { name: 'Thumb', type: 'FRAME', size: [12, 12], position: [3, 3] },
      ],
    },
    variants: [
      { variant: 'on=false' },
      {
        variant: 'on=true',
        overrides: { changed: { '/Thumb': { position: [17, 3] } } },
      },
    ],
  };
  const r = deriveRecipe(resolveVariants(set), { names });
  const thumb = r.style['/Thumb'];

  it('gives it x and y, which follow every axis, as part of the drawing', () => {
    expect(thumb.base.x).toMatchObject({ position: 3 });
    expect(thumb.base.y).toMatchObject({ position: 3 });
    expect(thumb.appearance['on=true'].default.x).toMatchObject({
      position: 17,
    });
    // No finding: a position differing by axis is the drawing moving, and it is no spacing literal.
    expect(
      r.deviations.filter((d) => d.cell === 'x' || d.cell === 'y'),
    ).toEqual([]);
  });

  it('reads no position, where another variant has one, as placed by auto layout', () => {
    const laid = structuredClone(set);
    laid.variants[1].overrides.changed['/Thumb'] = { position: null };
    const r2 = deriveRecipe(resolveVariants(laid), { names });
    expect(r2.style['/Thumb'].appearance['on=true'].default.x).toMatchObject({
      none: true,
    });
  });
});

describe('deriveRecipe: a text that fills its row', () => {
  it('records Figma’s FILL as layout, and hugs where another variant does not fill', () => {
    // md and sm fill the button; lg spreads its label and icons, the label hugging its words.
    expect(label.base.width).toMatchObject({ keyword: 'FILL' });
    expect(label.size.lg.width).toMatchObject({ keyword: 'HUG' });
  });
});
