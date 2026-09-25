import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadComponent, loadWebCatalog } from '../src/normalize/components.mjs';
import { loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import * as stage from '../src/stages/components.mjs';
import { packagesDir, specDir } from '../src/util/paths.mjs';
import { buildOracle, hex, withDark } from '../src/verify/oracle.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const button = of('Button');
const oracle = button.oracle;
const variant = (figma) => oracle.variants.find((v) => v.figma === figma);

describe('the Button oracle', () => {
  it('has every one of the 108 variants, each reachable through the API once', () => {
    expect(oracle.variants).toHaveLength(108);
    const reached = new Set(
      oracle.variants.map((v) => JSON.stringify([v.props, v.state])),
    );
    expect(reached.size).toBe(108);
    const hover = variant('size=md, prio=primary, state=hover, danger=false');
    expect(hover.props).toEqual({
      size: 'md',
      prio: 'primary',
      disabled: false,
      loading: false,
      danger: false,
    });
    expect(hover.state).toBe('hover');
    expect(
      variant('size=md, prio=primary, state=loading, danger=true').props,
    ).toMatchObject({ loading: true, danger: true });
  });

  it('resolves what Figma draws to Light values', () => {
    const rest = variant('size=md, prio=primary, state=default, danger=false');
    expect(rest.layers.root).toMatchObject({
      background: '#111111',
      borderWidth: 1,
      radius: 6,
      paddingLeft: 12,
      paddingRight: 12,
      height: 40,
      shadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.05)',
    });
    expect(rest.layers.label).toMatchObject({
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: -0.28,
      textDecoration: 'none',
    });
    // The label's width follows its text, so there is none to expect; lg is fixed at 200.
    expect(rest.layers.root).not.toHaveProperty('width');
    expect(
      variant('size=lg, prio=primary, state=default, danger=false').layers.root
        .width,
    ).toBe(200);
    expect(
      variant('size=md, prio=tertiary, state=hover, danger=false').layers.label
        .textDecoration,
    ).toBe('underline');
  });

  it('keeps a hidden slot’s look, since a prop can show it', () => {
    const rest = variant('size=md, prio=primary, state=default, danger=false');
    expect(rest.layers.iconLeading).toMatchObject({ hidden: true, width: 16 });
    expect(rest.layers.iconLeading.color).toMatch(/^#[0-9a-f]{6}$/);
    expect(rest.layers.spinner).toMatchObject({
      hidden: true,
      variant: { size: 'sm', style: 'default' },
    });
  });

  it('names the layers a prop shows, so a hidden slot is not mistaken for a hidden state', () => {
    expect(oracle.slots).toEqual({
      iconLeading: 'hasIconLeading',
      label: 'hasLabel',
      iconTrailing: 'hasIconTrailing',
      counter: 'hasCounter',
    });
    // The spinner is shown by the loading state, not by a prop.
    expect(oracle.slots).not.toHaveProperty('spinner');
  });

  it('excuses the secondary sm background as an open finding, with Figma’s value', () => {
    expect(
      variant('size=sm, prio=secondary, state=default, danger=false').excused,
    ).toEqual([
      expect.objectContaining({
        layer: 'root',
        property: 'background',
        figma: 'transparent',
        finding: 'component.button.root.background@size=sm',
        decision: null,
      }),
    ]);
  });

  it('excuses nothing no finding names, and every excuse names a real one', () => {
    const findings = new Set(button.deviations.map((d) => d.token));
    const excused = oracle.variants.flatMap((v) => v.excused ?? []);
    // The three open axis findings: 1 + 8 + 9 variants.
    expect(excused).toHaveLength(18);
    for (const e of excused) expect(findings).toContain(e.finding);
    expect(
      variant('size=md, prio=primary, state=default, danger=false'),
    ).not.toHaveProperty('excused');
  });

  it('is read from Figma, never from the recipe', () => {
    // A recipe changed out of all recognition leaves the oracle as it was.
    const scrambled = structuredClone(button.spec);
    for (const s of Object.values(scrambled.style)) {
      s.base = {};
      s.size = {};
      s.appearance = {};
      delete s.combined;
    }
    const catalog = loadWebCatalog();
    // In both modes: Light, and what Dark draws otherwise beside it.
    const at = (mode) =>
      buildOracle(
        loadComponent(catalog, 'Button').set,
        scrambled,
        button.deviations,
        {
          tokens,
          names: tokenNames(loadContract()),
          overlay: loadOverlay('Button'),
          fileVersion: catalog.fileVersion,
          mode,
        },
      );
    const again = withDark(at('light'), at('dark'));
    expect(again).toEqual(oracle);
    // And it imports no recipe or emitter.
    const source = readFileSync(
      join(packagesDir, 'codegen', 'src', 'verify', 'oracle.mjs'),
      'utf8',
    );
    expect(source).not.toMatch(/from '\.\.\/normalize\/recipe\.mjs'/);
    expect(source).not.toMatch(
      /from '\.\.\/emit\/(mui|flutter)(-component)?\.mjs'/,
    );
  });

  it('is what spec/verify/button.json holds', () => {
    expect(
      JSON.parse(readFileSync(join(specDir, 'verify', 'button.json'), 'utf8')),
    ).toEqual(oracle);
  });
});

describe('the Spinner oracle', () => {
  const { oracle: spinner } = of('Spinner');

  it('records a colour Figma binds to no colour as unreadable, excused by the overlay', () => {
    const v = spinner.variants.find(
      (x) => x.figma === 'size=sm, style=default',
    );
    expect(v.props).toEqual({ size: 'sm', variant: 'default' });
    expect(v.layers.indicator.borderColor).toBeNull();
    expect(
      v.excused.filter(
        (e) => e.layer === 'indicator' && e.property === 'borderColor',
      ),
    ).toEqual([
      expect.objectContaining({
        layer: 'indicator',
        property: 'borderColor',
        decision: 'set',
      }),
    ]);
    const inverse = spinner.variants.find(
      (x) => x.figma === 'size=sm, style=inverse',
    );
    expect(inverse.layers.indicator.borderColor).toBe('#ffffff');
    expect(inverse.excused.every((e) => e.decision === 'controlDraws')).toBe(
      true,
    );
  });

  it('excuses the box and roundness of a layer the base control draws, by the overlay’s controlDraws', () => {
    // Spinner's track: placed at [0, 0] in the ring, drawn by CircularProgress in its view box.
    const v = spinner.variants.find(
      (x) => x.figma === 'size=sm, style=default',
    );
    expect(v.layers.track).toMatchObject({ x: 0, y: 0, width: 16, height: 16 });
    expect(
      v.excused
        .filter((e) => e.layer === 'track')
        .map((e) => [e.property, e.decision]),
    ).toEqual([
      ['x', 'controlDraws'],
      ['y', 'controlDraws'],
      ['width', 'controlDraws'],
      ['height', 'controlDraws'],
      ['radius', 'controlDraws'],
    ]);
  });
});

describe('hex', () => {
  it('spells every colour form one way', () => {
    expect(hex('#ABC')).toBe('#aabbcc');
    expect(hex('#111111')).toBe('#111111');
    expect(hex('#111111ff')).toBe('#111111');
    expect(hex('#00000033')).toBe('#00000033');
    expect(hex('#000000 a=0.2')).toBe('#00000033');
    expect(hex('rgba(0, 0, 0, 0.2)')).toBe('#00000033');
    expect(hex('rgb(255 255 255)')).toBe('#ffffff');
    expect(() => hex('blue')).toThrow(/not a colour/);
  });
});

describe('what a set replaced', () => {
  it('is excused where Figma draws it, and compared where it does not', () => {
    // Button's primary has a resting shadow and its lg is flat: taking the shadow away excuses the
    // variants that draw it, and leaves the flat ones compared, as they agree with the decision.
    const catalog = loadWebCatalog();
    const loaded = loadComponent(catalog, 'Button');
    const overlay = {
      ...loadOverlay('Button'),
      set: {
        ...loadOverlay('Button').set,
        'root.base.shadow': { none: true, reason: 'test' },
      },
    };
    const spec = structuredClone(button.spec);
    spec.style.root.base.shadow = {
      none: true,
      replaced: { ...button.spec.style.root.base.shadow },
    };
    delete spec.style.root.base.shadow.replaced.from;
    const o = buildOracle(loaded.set, spec, button.deviations, {
      tokens,
      names: tokenNames(loadContract()),
      overlay,
      fileVersion: catalog.fileVersion,
    });
    const shadowExcuse = (figma) =>
      (o.variants.find((v) => v.figma === figma).excused ?? []).filter(
        (e) => e.layer === 'root' && e.property === 'shadow',
      );
    expect(
      shadowExcuse('size=md, prio=primary, state=default, danger=false'),
    ).toEqual([expect.objectContaining({ decision: 'set' })]);
    expect(
      shadowExcuse('size=lg, prio=primary, state=default, danger=false'),
    ).toEqual([]);
  });
});

describe('a finding several set rules decide', () => {
  it('names, in each variant, the rule that reaches it, not the last one applied', () => {
    // Text Input's width: the base rule decides md, the sm rule sm.
    const input = of('Text Input');
    const overlay = loadOverlay('Text Input');
    const width = (figma) =>
      input.oracle.variants
        .find((v) => v.figma === figma)
        .excused.find((e) => e.layer === 'root' && e.property === 'width');
    expect(width('size=md, state=default').reason).toBe(
      overlay.set['root.base.width'].reason,
    );
    expect(width('size=sm, state=hover').reason).toBe(
      overlay.set['root.size.sm.width'].reason,
    );
  });
});
