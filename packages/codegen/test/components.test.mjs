import { describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
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
