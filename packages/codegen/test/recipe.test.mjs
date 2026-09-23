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

  it('reads the icon colour from the variant digest, since icons are instances', () => {
    expect(root.base.iconColor).toMatchObject({
      token: 'color.action.primary.icon.default',
    });
    expect(appearance('primary').hover.iconColor).toMatchObject({
      token: 'color.action.primary.icon.hover',
    });
    // Loading removes both icons, so there is no icon colour to state there.
    expect(appearance('primary').loading ?? {}).not.toHaveProperty('iconColor');
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

  it('reports the xl shadow as one systematic finding, not twenty', () => {
    const d = deviation('/', 'shadow', { size: 'xl' });
    expect(d.variants).toHaveLength(20);
    expect(d.variants.every((v) => v.found.none)).toBe(true);
    expect(
      recipe.deviations.filter((x) => x.layer === '/' && x.cell === 'shadow'),
    ).toHaveLength(1);
  });

  it('pins the one xl disabled label that borrows the danger colour', () => {
    const d = deviation('/Label', 'color', { size: 'xl' });
    expect(d.variants).toEqual([
      {
        variant: 'size=xl, prio=secondary, state=disabled, danger=false',
        expected: expect.objectContaining({
          token: 'color.action.secondary.text.disabled',
        }),
        found: expect.objectContaining({
          token: 'color.action.secondary.text.danger.disabled',
        }),
      },
    ]);
  });

  it('reports the tertiary hover underline as a disagreement for a human, not a rule', () => {
    // Grouped by the three axes typography should not follow. All three sizes switch to a link
    // style there, and xl picks a different one (link/md/default, not hover), which is exactly
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
        'size=xl, prio=tertiary, state=hover, danger=false',
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
