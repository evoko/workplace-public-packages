import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveVariants } from '../src/normalize/component-layers.mjs';
import { docsDir } from '../src/util/paths.mjs';

const buttonSet = JSON.parse(
  readFileSync(
    join(docsDir, 'solar-web', 'raw', 'components', 'buttons', 'button.json'),
    'utf8',
  ),
).componentSets.find((s) => s.name === 'Button');

const button = resolveVariants(buttonSet);
const find = (props) =>
  button.variants.find((v) =>
    Object.entries(props).every(([k, value]) => v.props[k] === value),
  );
const DEFAULT = {
  size: 'md',
  prio: 'primary',
  state: 'default',
  danger: 'false',
};

/** A minimal component set: a root with a label, in two variants. */
function synthetic({ tree, variants, props }) {
  return {
    name: 'Synthetic',
    defaultVariant: variants[0].variant,
    props: props ?? {
      tone: { type: 'VARIANT', default: 'a', options: ['a', 'b'] },
    },
    defaultVariantTree: tree,
    variants,
  };
}

const TREE = {
  name: 'tone=a',
  type: 'COMPONENT',
  fills: ['{Color:x/a}'],
  radius: 6,
  layout: { dir: 'HORIZONTAL', gap: 8, pad: [0, 12, 0, 12] },
  vars: { itemSpacing: 'Spatial:inset/xs', paddingLeft: 'Spatial:inset/sm' },
  children: [
    { name: 'Label', type: 'TEXT', fills: ['{Color:t/a}'] },
    { name: 'Dot', type: 'INSTANCE' },
    { name: 'Dot', type: 'INSTANCE', hidden: true },
  ],
};

describe('resolveVariants on Button', () => {
  it('resolves all 108 variants over the four axes', () => {
    expect(button.variants).toHaveLength(108);
    expect(button.axes).toEqual({
      size: { default: 'md', options: ['md', 'sm', 'lg'] },
      prio: {
        default: 'primary',
        options: ['primary', 'secondary', 'tertiary'],
      },
      state: {
        default: 'default',
        options: [
          'default',
          'hover',
          'pressed',
          'disabled',
          'focus',
          'loading',
        ],
      },
      danger: { default: 'false', options: ['false', 'true'] },
    });
    const names = new Set(button.variants.map((v) => v.name));
    expect(names.size).toBe(108);
  });

  it('resolves the default variant to the tree unchanged', () => {
    const v = find(DEFAULT);
    expect(v.name).toBe(buttonSet.defaultVariant);
    const { children, ...root } = buttonSet.defaultVariantTree;
    expect(v.layers.get('/')).toEqual({ ...root, size: [80, 40] });
    expect(v.layers.get('/Label')).toEqual(
      (({ children: _, ...rest }) => rest)(children[2]),
    );
  });

  it('keys layers by the paths the overrides use, including a repeated name', () => {
    // Both icon slots are named Icon/None; the second one is #2, exactly as `removed` spells it.
    expect([...find(DEFAULT).layers.keys()]).toEqual([
      '/',
      '/Icon/None',
      '/Spinner',
      '/Label',
      '/Icon/None#2',
      '/Counter',
    ]);
  });

  it('applies a changed fill: secondary carries the secondary background', () => {
    const v = find({ ...DEFAULT, prio: 'secondary' });
    expect(v.layers.get('/').fills).toEqual([
      '{Color:action/secondary/bg/default}',
    ]);
  });

  it('keeps the tree value on a layer no override touches', () => {
    const v = find({ ...DEFAULT, prio: 'secondary' });
    expect(v.layers.get('/Spinner')).toEqual(
      find(DEFAULT).layers.get('/Spinner'),
    );
    expect(v.layers.get('/').radius).toBe(6);
  });

  it('keeps vars beside the literal, so a token name survives to the recipe', () => {
    const md = find(DEFAULT).layers.get('/');
    expect(md.radius).toBe(6);
    expect(md.vars.topLeftRadius).toBe('Spatial:radius/control');
    // sm changes only the two padding bindings; the rest of vars is inherited, not dropped.
    const sm = find({ ...DEFAULT, size: 'sm' }).layers.get('/');
    expect(sm.vars.paddingLeft).toBe('Spatial:inset/xs');
    expect(sm.vars.topLeftRadius).toBe('Spatial:radius/control');
    expect(sm.layout.pad).toEqual([0, 8, 0, 8]);
    expect(sm.layout.gap).toBe(8);
  });

  it('carries a cleared fill through as absent rather than correcting it', () => {
    // secondary / default / false has no background at sm while md and lg do. That is a
    // finding for the recipe stage to report; resolution must not paper over it.
    const sm = find({
      size: 'sm',
      prio: 'secondary',
      state: 'default',
      danger: 'false',
    });
    expect(sm.layers.get('/')).not.toHaveProperty('fills');
    const md = find({
      size: 'md',
      prio: 'secondary',
      state: 'default',
      danger: 'false',
    });
    expect(md.layers.get('/').fills).toEqual([
      '{Color:action/secondary/bg/default}',
    ]);
  });

  it('drops the layers a variant removes: loading has no label, icons or counter', () => {
    const v = find({ ...DEFAULT, state: 'loading' });
    expect([...v.layers.keys()]).toEqual(['/', '/Spinner']);
    expect(v.removed).toEqual([
      '/Icon/None',
      '/Label',
      '/Icon/None#2',
      '/Counter',
    ]);
  });

  it('takes the root size from the variant, where the fetcher keeps it', () => {
    expect(find({ ...DEFAULT, size: 'lg' }).layers.get('/').size).toEqual(
      buttonSet.variants.find(
        (v) =>
          v.variant === 'size=lg, prio=primary, state=default, danger=false',
      ).size,
    );
  });

  it('does not mutate its input', () => {
    const before = JSON.stringify(buttonSet);
    resolveVariants(buttonSet);
    expect(JSON.stringify(buttonSet)).toBe(before);
  });
});

describe('resolveVariants on the diff rules', () => {
  const set = synthetic({
    tree: TREE,
    variants: [
      { variant: 'tone=a', size: [80, 40] },
      {
        variant: 'tone=b',
        size: [80, 40],
        overrides: {
          changed: {
            '/': {
              radius: null,
              layout: { gap: 4, dir: null },
              vars: { itemSpacing: null, paddingRight: 'Spatial:inset/sm' },
            },
            '/Dot#2': { hidden: null },
            '/Label': { vars: { fontSize: 'Type:size/label/sm' } },
          },
        },
      },
    ],
  });
  const [, b] = resolveVariants(set).variants;

  it('reads null as "the variant does not have it"', () => {
    expect(b.layers.get('/')).not.toHaveProperty('radius');
    expect(b.layers.get('/Dot#2')).not.toHaveProperty('hidden');
  });

  it('merges a vars or layout patch into the default object, deleting its nulls', () => {
    expect(b.layers.get('/').layout).toEqual({ gap: 4, pad: [0, 12, 0, 12] });
    expect(b.layers.get('/').vars).toEqual({
      paddingLeft: 'Spatial:inset/sm',
      paddingRight: 'Spatial:inset/sm',
    });
  });

  it('takes a vars object whole where the default had none', () => {
    expect(b.layers.get('/Label').vars).toEqual({
      fontSize: 'Type:size/label/sm',
    });
  });

  it('resolves an added layer like any other, under its parent', () => {
    const badge = { type: 'FRAME', fills: ['{Color:surface/primary}'] };
    const [a, added] = resolveVariants(
      synthetic({
        tree: TREE,
        variants: [
          { variant: 'tone=a' },
          {
            variant: 'tone=b',
            overrides: {
              added: [{ path: '/Label/Badge', parent: '/Label', layer: badge }],
            },
          },
        ],
      }),
    ).variants;
    expect(added.layers.get('/Label/Badge')).toEqual(badge);
    expect(added.parents.get('/Label/Badge')).toBe('/Label');
    expect(a.layers.has('/Label/Badge')).toBe(false);
  });
});

describe('resolveVariants refuses data it cannot trust', () => {
  const base = (variants, extra) =>
    synthetic({ tree: TREE, variants, ...extra });

  it('refuses an added layer recorded by path alone, or under a parent it lacks', () => {
    expect(() =>
      resolveVariants(
        base([
          { variant: 'tone=a' },
          { variant: 'tone=b', overrides: { added: ['/Badge'] } },
        ]),
      ),
    ).toThrow(/added layer without a path or properties/);
    expect(() =>
      resolveVariants(
        base([
          { variant: 'tone=a' },
          {
            variant: 'tone=b',
            overrides: {
              added: [
                {
                  path: '/Nope/Badge',
                  parent: '/Nope',
                  layer: { type: 'FRAME' },
                },
              ],
            },
          },
        ]),
      ),
    ).toThrow(/adds \/Nope\/Badge under \/Nope, which it does not have/);
  });

  it('a changed path the default tree does not have', () => {
    expect(() =>
      resolveVariants(
        base([
          { variant: 'tone=a' },
          {
            variant: 'tone=b',
            overrides: { changed: { '/Ghost': { fills: [] } } },
          },
        ]),
      ),
    ).toThrow(
      /tone=b: changes \/Ghost, which the default variant does not have/,
    );
  });

  it('a removed path the default tree does not have', () => {
    expect(() =>
      resolveVariants(
        base([
          { variant: 'tone=a' },
          { variant: 'tone=b', overrides: { removed: ['/Ghost'] } },
        ]),
      ),
    ).toThrow(/tone=b: removes \/Ghost/);
  });

  it('a variant name that is not one value per axis', () => {
    expect(() =>
      resolveVariants(base([{ variant: 'tone=a' }, { variant: 'tone=c' }])),
    ).toThrow(/tone=c: tone=c is not one of a, b/);
    expect(() =>
      resolveVariants(base([{ variant: 'tone=a' }, { variant: 'shade=b' }])),
    ).toThrow(/shade=b: missing tone/);
  });

  it('two variants with the same axis values', () => {
    expect(() =>
      resolveVariants(base([{ variant: 'tone=a' }, { variant: 'tone=a' }])),
    ).toThrow(/tone=a appears twice/);
  });

  it('a default variant that carries overrides of its own', () => {
    expect(() =>
      resolveVariants(
        base([
          { variant: 'tone=a', overrides: { changed: { '/': { radius: 2 } } } },
          { variant: 'tone=b' },
        ]),
      ),
    ).toThrow(/default variant tone=a carries overrides/);
  });

  it('a set whose variants were truncated by the fetcher', () => {
    expect(() =>
      resolveVariants({
        ...base([{ variant: 'tone=a' }, { variant: 'tone=b' }]),
        variantsTruncated: true,
      }),
    ).toThrow(/Synthetic: the fetcher truncated its variants/);
  });
});

describe('resolveVariants: a component Figma drew with no variants', () => {
  const tree = {
    name: 'Scrim',
    type: 'COMPONENT',
    fills: ['{Color:surface/scrim}'],
    children: [],
  };

  it('resolves a standalone component as one variant, named empty, with no axes', () => {
    const r = resolveVariants({
      name: 'Scrim',
      standalone: true,
      props: {},
      defaultVariant: '',
      defaultVariantTree: tree,
      variants: [{ variant: '' }],
    });
    expect(r.axes).toEqual({});
    expect(r.variants).toHaveLength(1);
    expect(r.variants[0]).toMatchObject({ name: '', props: {} });
    expect(r.variants[0].layers.has('/')).toBe(true);
  });

  it('still refuses a component set with no axes, which is a fetch gone wrong', () => {
    expect(() =>
      resolveVariants({
        name: 'Broken',
        props: {},
        defaultVariant: '',
        defaultVariantTree: tree,
        variants: [{ variant: '' }],
      }),
    ).toThrow(/Broken: has no variant axes/);
  });
});

describe('a boolean operation', () => {
  it('is one shape, its outline Figma’s; its operands are no layers of the component', () => {
    const [v] = resolveVariants(
      synthetic({
        tree: {
          name: 'tone=a',
          type: 'COMPONENT',
          children: [
            {
              name: 'Mark',
              type: 'BOOLEAN_OPERATION',
              fills: ['{Color:icon/primary}'],
              children: [
                { name: 'Path', type: 'VECTOR' },
                { name: 'Path', type: 'VECTOR' },
              ],
            },
          ],
        },
        variants: [{ variant: 'tone=a' }, { variant: 'tone=b' }],
      }),
    ).variants;
    expect([...v.layers.keys()]).toEqual(['/', '/Mark']);
    expect(v.parents.has('/Mark/Path')).toBe(false);
  });
});
