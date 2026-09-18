import { mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { extractMuiProps } from '../src/targets/mui/extract-props.js';
import { makeRoot } from './helpers.js';

const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);
const MUI_DIR = dirname(
  createRequire(join(REAL_OUT_DIR, 'x.cjs')).resolve(
    '@mui/material/package.json',
  ),
);

describe('extractMuiProps', () => {
  // Button's variant/size/color unions are all inline string literals, so
  // this exercises the fast AST-only path (no ts.Program is created).
  it('reads Button: unions, defaults, ButtonBase props, root element', () => {
    const button = extractMuiProps(MUI_DIR, 'Button')!;
    expect(button.rootElement).toBe('button');
    expect(button.props.variant).toEqual({
      kind: 'union',
      type: expect.stringContaining('OverridableStringUnion'),
      default: 'text',
      values: ['text', 'outlined', 'contained'],
      overrides: 'ButtonPropsVariantOverrides',
    });
    expect(button.props.size.values).toEqual(['small', 'medium', 'large']);
    expect(button.props.color.default).toBe('primary');
    expect(button.props.disabled).toEqual({
      kind: 'other',
      type: 'boolean | undefined',
      default: 'false',
    });
    expect(button.props.startIcon.type).toBe('React.ReactNode');
    // inherited from ButtonBaseOwnProps
    expect(button.props.disableRipple.kind).toBe('other');
    expect(button.props.focusRipple.default).toBe('false');
    expect(Object.keys(button.props)).toEqual(
      [...Object.keys(button.props)].sort(),
    );
  });

  // Chip's variant union ('filled' | 'outlined') is also all inline string
  // literals: fast path.
  it('reads Chip: div root, children typed null', () => {
    const chip = extractMuiProps(MUI_DIR, 'Chip')!;
    expect(chip.rootElement).toBe('div');
    expect(chip.props.children.type).toBe('null | undefined');
    expect(chip.props.variant.values).toEqual(['filled', 'outlined']);
    expect(chip.props.disableRipple).toBeUndefined();
  });

  // Typography's `variant` union is `TypographyVariant | 'inherit'` (a type
  // alias, not an inline literal) and `color` is a union that includes a
  // template-literal member (`` `text${Capitalize<keyof TypeText>}` ``):
  // neither is resolvable by the fast AST path, so this exercises the
  // type-checker fallback (a lazily created ts.Program). `variantMapping`
  // (`Partial<Record<OverridableStringUnion<...>, string>>`) merely uses
  // the union as a lookup key and must not be picked up as a union prop
  // itself: unions are exactly `color` and `variant`.
  it('reads Typography: aliased and template-literal unions via the type checker', () => {
    const typography = extractMuiProps(MUI_DIR, 'Typography')!;
    expect(typography.props.variant.kind).toBe('union');
    expect(typography.props.variant.overrides).toBe(
      'TypographyPropsVariantOverrides',
    );
    expect(typography.props.variant.values).toContain('h1');
    expect(typography.props.variant.values).toContain('body1');
    expect(typography.props.variant.values).toContain('inherit');
    expect(typography.props.color.kind).toBe('union');
    expect(typography.props.color.values).toContain('textPrimary');
    expect(
      Object.keys(typography.props).filter(
        (k) => typography.props[k].kind === 'union',
      ),
    ).toEqual(['color', 'variant']);
    expect(typography.props.variantMapping.kind).toBe('other');
  });

  // Alert.iconMapping is `Partial<Record<OverridableStringUnion<AlertColor,
  // AlertPropsColorOverrides>, React.ReactNode>>`: the union is nested
  // inside Partial<Record<...>>'s type arguments, not iconMapping's own
  // top-level type, so it must not be treated as an overridable union.
  it("reads Alert: iconMapping is not an overridable union (the OverridableStringUnion is Record's key, not iconMapping's own type)", () => {
    const alert = extractMuiProps(MUI_DIR, 'Alert')!;
    expect(alert.props.iconMapping.kind).toBe('other');
    expect(alert.props.severity.kind).toBe('union');
  });

  it('returns null for an unknown component', () => {
    expect(extractMuiProps(MUI_DIR, 'Nope')).toBeNull();
  });

  it('falls back to <Component>Props and reads multi-line @default tags', () => {
    const dir = makeRoot({});
    mkdirSync(join(dir, 'Thing'));
    writeFileSync(
      join(dir, 'Thing', 'Thing.d.ts'),
      [
        "import { OverridableStringUnion } from '@mui/types';",
        'export interface ThingPropsToneOverrides {}',
        'export interface ThingProps {',
        '  /**',
        '   * The tone.',
        "   * @default 'soft'",
        '   */',
        "  tone?: OverridableStringUnion<'soft' | 'loud', ThingPropsToneOverrides>;",
        '  /** @default <Foo /> */',
        '  icon?: React.ReactNode;',
        '  plain: string;',
        '}',
        "export interface ThingTypeMap<AdditionalProps = {}, RootComponent extends React.ElementType = 'span'> {",
        '  props: AdditionalProps & ThingProps;',
        '  defaultComponent: RootComponent;',
        '}',
        '',
      ].join('\n'),
    );
    const thing = extractMuiProps(dir, 'Thing')!;
    expect(thing.rootElement).toBe('span');
    expect(thing.props.tone).toEqual({
      kind: 'union',
      type: "OverridableStringUnion<'soft' | 'loud', ThingPropsToneOverrides>",
      default: 'soft',
      values: ['soft', 'loud'],
      overrides: 'ThingPropsToneOverrides',
    });
    expect(thing.props.icon.default).toBe('<Foo />');
    expect(thing.props.plain).toEqual({
      kind: 'other',
      type: 'string',
      default: null,
    });
  });

  it('resolves to an empty union when a member is an unresolvable import', () => {
    const dir = makeRoot({});
    mkdirSync(join(dir, 'Widget'));
    writeFileSync(
      join(dir, 'Widget', 'Widget.d.ts'),
      [
        "import { OverridableStringUnion } from '@mui/types';",
        "import { WidgetKind } from 'nonexistent-widget-types-package';",
        'export interface WidgetPropsKindOverrides {}',
        'export interface WidgetOwnProps {',
        '  kind?: OverridableStringUnion<WidgetKind, WidgetPropsKindOverrides>;',
        '}',
        '',
      ].join('\n'),
    );
    const widget = extractMuiProps(dir, 'Widget')!;
    expect(widget.props.kind).toEqual({
      kind: 'union',
      type: 'OverridableStringUnion<WidgetKind, WidgetPropsKindOverrides>',
      default: null,
      values: [],
      overrides: 'WidgetPropsKindOverrides',
    });
  });
});
