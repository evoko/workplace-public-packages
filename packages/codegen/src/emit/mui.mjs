import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { camel } from '../util/naming.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { canonical, entry, letterSpacingEm } from './manifest.mjs';
import { mobileMediaQuery } from './breakpoint.mjs';
import { THEME_ATTRIBUTE } from './css.mjs';
import { cssTextFeatures, featuresOf } from './text-features.mjs';
import { webFontStack } from './fonts.mjs';
import { shadowLayers, shadowToCss } from './shadow.mjs';

const OUT_DIR = join(packagesDir, 'styles', 'src', 'generated', 'mui');

const literal = (type, value) => {
  if (type === 'dimension')
    return typeof value === 'number' ? `${value}px` : value;
  if (type === 'duration')
    return typeof value === 'number' ? `${value}ms` : value;
  if (type === 'cubicBezier') return `cubic-bezier(${value.join(', ')})`;
  if (type === 'fontFamily') return webFontStack(value);
  return value;
};

/**
 * A text style as CSS-valid declarations. Figma states letter spacing as a percentage of the
 * font size, which is not a valid CSS letter-spacing and is dropped by the browser, so it is
 * emitted in em: the same quantity, and the one unit that stays correct when the Mobile scale
 * changes the font size underneath it.
 */
const cssTextStyle = (v, features = {}) => ({
  ...v,
  fontFamily: webFontStack(v.fontFamily),
  letterSpacing: `${letterSpacingEm(v.letterSpacing, canonical.dimension(v.fontSize))}em`,
  ...cssTextFeatures(features),
});

/**
 * What MUI's own palette slots are painted with.
 *
 * Stock MUI components read `palette.primary.main` and friends, not SOLAR names, so without this
 * every unstyled MUI component falls back to MUI's blue. MUI paints `main` as a *fill* -- a
 * contained button's background -- and derives hover from `dark`, so each slot is mapped to the
 * SOLAR role that is used the same way: `action.*.bg` for the buttons, `surface.feedback.*.strong`
 * for the feedback fills, never a `text.*` colour. SOLAR does not define this mapping, so it is
 * reported in spec/deviations.md. Literal values, not `var()`: MUI runs `alpha()` and `darken()`
 * on its palette, which cannot parse a custom property.
 */
export const MUI_PALETTE = {
  primary: {
    main: 'color.action.primary.bg.default',
    dark: 'color.action.primary.bg.hover',
    contrastText: 'color.action.primary.text.default',
  },
  secondary: {
    main: 'color.action.secondary.bg.default',
    dark: 'color.action.secondary.bg.hover',
    contrastText: 'color.action.secondary.text.default',
  },
  error: {
    main: 'color.action.primary.bg.danger.default',
    dark: 'color.action.primary.bg.danger.hover',
    contrastText: 'color.action.primary.text.danger.default',
  },
  warning: {
    main: 'color.surface.feedback.warning.strong',
    contrastText: 'color.text.inverse',
  },
  info: {
    main: 'color.surface.feedback.info.strong',
    contrastText: 'color.text.inverse',
  },
  success: {
    main: 'color.surface.feedback.success.strong',
    contrastText: 'color.text.inverse',
  },
  background: {
    default: 'color.surface.background',
    paper: 'color.surface.base',
  },
  text: {
    primary: 'color.text.primary',
    secondary: 'color.text.secondary',
    disabled: 'color.text.disabled',
  },
  action: {
    disabled: 'color.text.disabled',
    disabledBackground: 'color.action.primary.bg.disabled',
  },
  divider: 'color.border.subtle',
};

/**
 * MUI's built-in typography variants, as SOLAR text styles.
 *
 * `Typography`, `Button` and every other stock component read these names, so leaving them at
 * MUI's defaults ships Roboto at MUI's sizes. `overline` has no SOLAR counterpart and keeps MUI's
 * shape in the SOLAR family. `button` drops MUI's uppercase: SOLAR labels are sentence case.
 */
export const MUI_TYPOGRAPHY = {
  h1: 'display.lg',
  h2: 'display.md',
  h3: 'display.sm',
  h4: 'title.lg',
  h5: 'title.md',
  h6: 'title.sm',
  subtitle1: 'body.lg.medium',
  subtitle2: 'body.md.medium',
  body1: 'body.md.regular',
  body2: 'body.sm.regular',
  button: 'label.md',
  caption: 'caption.xs',
};

/**
 * MUI's own `variantMapping`, restated: the theme's mapping replaces MUI's, so what MUI's variants
 * render as must be said again beside SOLAR's.
 */
const MUI_VARIANT_ELEMENTS = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  subtitle1: 'h6',
  subtitle2: 'h6',
  body1: 'p',
  body2: 'p',
  inherit: 'p',
};

/**
 * The element a SOLAR text style renders as by default, as a Typography variant. A heading style
 * is the element MUI's variant of that style is (`title.lg` is MUI's `h4`, so `titleLg` renders an
 * `h4`), the display and title styles MUI has no variant for the nearest heading below, and the rest
 * by family. Only a default: `component` sets the element a page's outline needs.
 */
function elementOf(style) {
  const heading = Object.entries(MUI_TYPOGRAPHY).find(
    ([variant, s]) => s === style && /^h[1-6]$/.test(variant),
  );
  if (heading) return heading[0];
  const family = style.split('.')[0];
  const element = {
    display: 'h3',
    title: 'h6',
    body: 'p',
    helper: 'p',
    label: 'span',
    caption: 'span',
    link: 'span',
    code: 'code',
  }[family];
  if (!element)
    throw new Error(`text style ${style} has no element for its family`);
  return element;
}

/**
 * MUI's breakpoints, spacing unit and motion, as SOLAR tokens, so an app's
 * `theme.breakpoints.down('sm')` changes where SOLAR's Mobile type does, and a stock component's
 * transition runs at SOLAR's speeds. MUI's `xs` must be 0; SOLAR's own `viewport.xs` (393) stays in
 * the tokens. The spacing unit is SOLAR's smallest inset, of which every inset is a multiple.
 * SOLAR has three durations where MUI names seven, and three easings where MUI names four: each of
 * MUI's is mapped to the nearest SOLAR step (sharp, MUI's in-and-out, to ease.both).
 */
export const MUI_BREAKPOINTS = {
  sm: 'viewport.sm',
  md: 'viewport.md',
  lg: 'viewport.lg',
  xl: 'viewport.xl',
};
export const MUI_SPACING = 'inset.2xs';
export const MUI_DURATIONS = {
  shortest: 'motion.duration.fast',
  shorter: 'motion.duration.fast',
  short: 'motion.duration.normal',
  standard: 'motion.duration.normal',
  complex: 'motion.duration.slow',
  enteringScreen: 'motion.duration.normal',
  leavingScreen: 'motion.duration.fast',
};
export const MUI_EASINGS = {
  easeInOut: 'motion.ease.both',
  easeOut: 'motion.ease.out',
  easeIn: 'motion.ease.in',
  sharp: 'motion.ease.both',
};

/** The text style whose family is the document default. */
const BODY_STYLE = 'body.md.regular';

export const MUI_DEVIATION = {
  token: 'mui.theme',
  figmaValue: 'no mapping to MUI palette slots or typography variants',
  reason:
    "MUI components read palette.primary, body1, button and the like, which SOLAR does not name. The generated theme maps them to the SOLAR roles used the same way (MUI_PALETTE and MUI_TYPOGRAPHY in the MUI emitter): action.*.bg for primary, secondary and error, surface.feedback.*.strong for warning, info and success, display and title for h1 to h6, label.md for button. overline has no counterpart. Its breakpoints are the viewport tokens (xs 0, as MUI requires), its spacing unit inset.2xs, and its seven durations and four easings the nearest of SOLAR's three each (MUI_DURATIONS, MUI_EASINGS).",
  raise:
    'Ask SOLAR to confirm the mapping, or to publish one for MUI-based products.',
};

/**
 * SOLAR's semantic colours, which the palette holds beside MUI's own slots so an app writes them as
 * palette paths (`sx={{ bgcolor: 'surface.raised' }}`). Primitives are left out: SOLAR bans them in
 * components (docs/solar/18-agent-reference.md, rule 1).
 */
const isSemanticColour = (t) =>
  t.name.startsWith('color.') && t.ext?.tier === 'semantic';

/**
 * A semantic colour's path in the palette: SOLAR's own, less `color.`, each segment camelCased as
 * solar_flutter names the same token (`color.surface.feedback.danger.subtle-alpha` →
 * `surface.feedback.danger.subtleAlpha`). A colour that is also a group (`color.border.inverse`,
 * beside `inverse.subtle`) is the group's `main`, MUI's word for a group's own colour, since an
 * object cannot also be a colour.
 */
export function solarPalettePath(name, names) {
  const path = name
    .replace(/^color\./, '')
    .split('.')
    .map(camel);
  return names.some((n) => n.startsWith(`${name}.`)) ? [...path, 'main'] : path;
}

/** Sets a palette path, refusing to change a value already there: MUI's slot and SOLAR's must agree. */
function place(palette, path, value, name) {
  let group = palette;
  for (const key of path.slice(0, -1)) {
    if (typeof group[key] === 'string')
      throw new Error(`${name}: the palette's ${key} is a colour, not a group`);
    group = group[key] ??= {};
  }
  const key = path.at(-1);
  if (group[key] !== undefined && group[key] !== value)
    throw new Error(
      `${name}: the palette's ${path.join('.')} already holds ${JSON.stringify(group[key])}, not ${value}`,
    );
  group[key] = value;
}

/** The keys MUI's own TypeText declares: SOLAR's text group adds the rest beside them. */
const MUI_TEXT_KEYS = new Set(['primary', 'secondary', 'disabled']);

/** A key as a TypeScript property name: quoted where it is not an identifier (`'01'`). */
const tsKey = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`);

/** A palette group as a TypeScript object type, every leaf a colour string. */
function tsShape(group, optional, depth = 1) {
  const pad = '  '.repeat(depth);
  const rows = Object.entries(group).map(
    ([key, value]) =>
      `${pad}  ${tsKey(key)}${optional ? '?' : ''}: ${
        typeof value === 'string'
          ? 'string'
          : tsShape(value, optional, depth + 1)
      };`,
  );
  return `{\n${rows.join('\n')}\n${pad}}`;
}

/**
 * The type augmentation for SOLAR in app code, written into @bwp-web/components, which peers MUI
 * (@bwp-web/styles imports nothing from MUI): SOLAR's palette groups on `Palette`, its text and
 * action roles beside MUI's on `TypeText` and `TypeAction`, and its text styles as Typography
 * variants, so `theme.palette.surface.raised` and `<Typography variant="titleSm">` typecheck and an
 * invented name does not.
 */
function renderAugmentation(solarPalette, variants) {
  const { text = {}, action = {}, ...groups } = solarPalette;
  const own = Object.fromEntries(
    Object.entries(text).filter(([key]) => !MUI_TEXT_KEYS.has(key)),
  );
  const members = (group, optional) =>
    Object.entries(group)
      .map(
        ([key, value]) =>
          `    ${tsKey(key)}${optional ? '?' : ''}: ${tsShape(value, optional, 2)};`,
      )
      .join('\n');
  const leaves = (group) =>
    Object.entries(group)
      .map(([key, value]) =>
        typeof value === 'string'
          ? `    ${tsKey(key)}: string;`
          : `    ${tsKey(key)}: ${tsShape(value, false, 2)};`,
      )
      .join('\n');
  const names = Object.keys(variants);
  return (
    `// Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n` +
    `// SOLAR in an MUI theme's types: its semantic colours as palette groups (theme.palette.surface.raised,\n` +
    `// sx={{ bgcolor: 'surface.raised' }}) and its text styles as Typography variants (variant="titleSm").\n` +
    `// The values are in @bwp-web/styles/mui's createSolarThemeOptions, which SolarProvider installs.\n\n` +
    `import type { CSSProperties } from 'react';\n\n` +
    `declare module '@mui/material/styles' {\n` +
    `  interface Palette {\n${members(groups, false)}\n  }\n\n` +
    `  interface PaletteOptions {\n${members(groups, true)}\n  }\n\n` +
    `  interface TypeText {\n${leaves(own)}\n  }\n\n` +
    `  interface TypeAction {\n${leaves(action)}\n  }\n\n` +
    `  interface TypographyVariants {\n${names.map((n) => `    ${n}: CSSProperties;`).join('\n')}\n  }\n\n` +
    `  interface TypographyVariantsOptions {\n${names.map((n) => `    ${n}?: CSSProperties;`).join('\n')}\n  }\n}\n\n` +
    `declare module '@mui/material/Typography' {\n` +
    `  interface TypographyPropsVariantOverrides {\n${names.map((n) => `    ${n}: true;`).join('\n')}\n  }\n}\n\n` +
    `export {};\n`
  );
}

/** Resolves a table of token names against one mode's values, failing on a missing name. */
function resolveTable(table, values, path = 'palette') {
  return Object.fromEntries(
    Object.entries(table).map(([key, name]) => {
      if (typeof name !== 'string')
        return [key, resolveTable(name, values, `${path}.${key}`)];
      if (!(name in values))
        throw new Error(`${path}.${key} maps to ${name}, which is not a token`);
      return [key, values[name]];
    }),
  );
}

/** Only the declarations the Mobile mode actually changes. */
const overrides = (desktop, mobile) =>
  Object.fromEntries(
    Object.entries(mobile).filter(([k, v]) => desktop[k] !== v),
  );

export function renderMui(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const mq = mobileMediaQuery(index);
  const data = {
    tokens: { light: {}, dark: {} },
    viewport: { desktop: {}, mobile: {} },
    typography: { desktop: {}, mobile: {} },
    responsiveTypography: {},
    zIndex: {},
    shadows: {},
  };
  const manifest = {};

  for (const t of tokens) {
    if (t.name.startsWith('z.')) {
      data.zIndex[t.name.slice(2)] = t.value;
      manifest[t.name] = entry('number', t.value);
      continue;
    }
    if (t.type === 'typography') {
      // The Type collection switches size and line height between Desktop and Mobile, so both
      // are emitted. Dropping mobile here would lose an axis only the CSS media query has.
      const key = t.name.replace(/^typography\./, '');
      const features = featuresOf(t.ext);
      const desktop = cssTextStyle(
        { ...t.value, ...t.ext.modes.desktop },
        features,
      );
      const mobile = cssTextStyle(
        { ...t.value, ...t.ext.modes.mobile },
        features,
      );
      data.typography.desktop[key] = desktop;
      data.typography.mobile[key] = mobile;

      // MUI reads a media query nested in a variant, so one entry carries both viewports and
      // createTheme needs no help from the consumer to switch at the tablet boundary.
      const mobileOnly = overrides(desktop, mobile);
      data.responsiveTypography[key] = Object.keys(mobileOnly).length
        ? { ...desktop, [`@media ${mq}`]: mobileOnly }
        : { ...desktop };

      manifest[t.name] = entry('typography', desktop, desktop, {
        desktop,
        mobile,
      });
      continue;
    }
    if (t.type === 'shadow') {
      const lightLayers = shadowLayers(index, { $value: t.value }, 'light');
      const darkLayers = shadowLayers(index, { $value: t.value }, 'dark');
      const key = t.name.replace(/^shadow\./, '');
      data.shadows[key] = {
        light: shadowToCss(lightLayers),
        dark: shadowToCss(darkLayers),
      };
      manifest[t.name] = entry(
        'shadow',
        shadowToCss(lightLayers),
        lightLayers,
        { light: lightLayers, dark: darkLayers },
      );
      continue;
    }
    const light = literal(
      t.type,
      t.modes?.light ?? t.modes?.desktop ?? t.value,
    );
    const dark = literal(t.type, t.modes?.dark ?? t.modes?.desktop ?? t.value);
    data.tokens.light[t.name] = light;
    data.tokens.dark[t.name] = dark;

    let modes;
    if (t.modes?.light !== undefined) modes = { light, dark };
    else if (t.modes?.desktop !== undefined) {
      // MUI's theme is keyed by theme mode alone, so a viewport-varying token has nowhere to
      // live in solarTokens: both entries hold the Desktop value. The Mobile value is emitted
      // separately rather than dropped, mirroring the CSS media query.
      const mobile = literal(t.type, t.modes.mobile);
      data.viewport.desktop[t.name] = light;
      data.viewport.mobile[t.name] = mobile;
      modes = { desktop: light, mobile };
    }
    manifest[t.name] = entry(t.type, light, light, modes);
  }

  data.palette = {
    light: resolveTable(MUI_PALETTE, data.tokens.light),
    dark: resolveTable(MUI_PALETTE, data.tokens.dark),
  };
  const semantic = tokens.filter(isSemanticColour);
  const semanticNames = semantic.map((t) => t.name);
  // SOLAR's own palette structure, apart from MUI's slots, for the type augmentation.
  data.solarPalette = {};
  for (const t of semantic)
    place(
      data.solarPalette,
      solarPalettePath(t.name, semanticNames),
      data.tokens.light[t.name],
      t.name,
    );
  for (const mode of ['light', 'dark'])
    for (const t of semantic)
      place(
        data.palette[mode],
        solarPalettePath(t.name, semanticNames),
        data.tokens[mode][t.name],
        t.name,
      );
  const px = (name) => {
    const t = index.get(name);
    if (!t)
      throw new Error(`the MUI theme maps to ${name}, which is not a token`);
    return canonical.dimension(t.value);
  };
  const ms = (name) => {
    const v = data.tokens.light[name];
    if (v === undefined)
      throw new Error(`the MUI theme maps to ${name}, which is not a token`);
    return parseFloat(v);
  };
  const css = (name) => {
    const v = data.tokens.light[name];
    if (v === undefined)
      throw new Error(`the MUI theme maps to ${name}, which is not a token`);
    return v;
  };
  data.breakpoints = {
    xs: 0,
    ...Object.fromEntries(
      Object.entries(MUI_BREAKPOINTS).map(([k, n]) => [k, px(n)]),
    ),
  };
  data.spacing = px(MUI_SPACING);
  data.transitions = {
    duration: Object.fromEntries(
      Object.entries(MUI_DURATIONS).map(([k, n]) => [k, ms(n)]),
    ),
    easing: Object.fromEntries(
      Object.entries(MUI_EASINGS).map(([k, n]) => [k, css(n)]),
    ),
  };
  // SOLAR's text styles as Typography variants, camelCased as MUI names its own and as
  // solar_flutter names the same styles (`title.sm` → `titleSm`): a dotted name would reach MUI's
  // generated class name, which a CSS selector reads as two classes.
  data.variants = Object.fromEntries(
    Object.entries(data.responsiveTypography).map(([style, value]) => [
      camel(style),
      value,
    ]),
  );
  data.variantMapping = {
    ...MUI_VARIANT_ELEMENTS,
    ...Object.fromEntries(
      Object.keys(data.responsiveTypography).map((style) => [
        camel(style),
        elementOf(style),
      ]),
    ),
  };
  data.muiTypography = {
    fontFamily: data.typography.desktop[BODY_STYLE].fontFamily,
  };
  for (const [variant, style] of Object.entries(MUI_TYPOGRAPHY)) {
    const value = data.responsiveTypography[style];
    if (!value)
      throw new Error(
        `typography.${variant} maps to ${style}, which is not a text style`,
      );
    data.muiTypography[variant] =
      variant === 'button' ? { ...value, textTransform: 'none' } : value;
  }

  // Two modules. The token data is framework agnostic -- any CSS-in-JS consumer can use it -- so it
  // is the package root and imports nothing. Only the palette slots, MUI's own variants and
  // createSolarThemeOptions are MUI's, and they sit behind @bwp-web/styles/mui, so an app that is
  // not on MUI never loads them.
  const tokensTs =
    `// SOLAR design tokens as JavaScript data. Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n` +
    `// Framework agnostic: this module imports nothing. The MUI theme is in mui/theme.ts.\n\n` +
    `export const solarTokens = ${JSON.stringify(data.tokens, null, 2)} as const;\n\n` +
    `// Mirrors the CSS @media (max-width: 767.98px) override: apply these on top of\n` +
    `// solarTokens[mode] below the sm breakpoint. solarTokens is keyed by theme mode only, so\n` +
    `// it carries the Desktop value of every viewport-varying token in both entries.\n` +
    `export const solarViewportTokens = ${JSON.stringify(data.viewport, null, 2)} as const;\n\n` +
    `export const solarTypography = ${JSON.stringify(data.typography, null, 2)} as const;\n\n` +
    `// One entry per text style carrying both viewports as a nested media query, the shape MUI and\n` +
    `// other CSS-in-JS libraries read. solarTypography above keeps the two viewports separate.\n` +
    `export const solarResponsiveTypography = ${JSON.stringify(data.responsiveTypography, null, 2)} as const;\n\n` +
    `export const solarShadows = ${JSON.stringify(data.shadows, null, 2)} as const;\n\n` +
    `export const solarZIndex = ${JSON.stringify(data.zIndex, null, 2)} as const;\n\n` +
    `export type SolarMode = 'light' | 'dark';\n`;

  const themeTs =
    `// SOLAR theme for MUI. Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n` +
    `// Plain data on purpose: this module imports nothing from MUI, so @bwp-web/styles stays dependency free.\n` +
    `// Pass the result of createSolarThemeOptions() to MUI's createTheme. Light and Dark are both in it,\n` +
    `// switched by the ${THEME_ATTRIBUTE} attribute the tokens switch on, so one attribute changes both.\n\n` +
    `import {\n  solarResponsiveTypography,\n  solarTokens,\n  solarZIndex,\n} from '../tokens.js';\n` +
    `import { solarMuiComponents } from './theme-components.js';\n\n` +
    `// MUI's own palette slots and typography variants, resolved to SOLAR roles, so a stock MUI\n` +
    `// component renders in SOLAR rather than in MUI's defaults. See spec/deviations.md, mui.theme.\n` +
    `export const solarMuiPalette = ${JSON.stringify(data.palette, null, 2)} as const;\n\n` +
    `export const solarMuiTypography = ${JSON.stringify(data.muiTypography, null, 2)} as const;\n\n` +
    `// SOLAR's text styles as Typography variants, by their camelCase names (<Typography variant="titleSm">),\n` +
    `// and the element each renders as by default; MUI's own variants keep theirs.\n` +
    `export const solarMuiVariants = {\n${Object.keys(data.responsiveTypography)
      .map(
        (style) =>
          `  ${camel(style)}: solarResponsiveTypography[${JSON.stringify(style)}],`,
      )
      .join('\n')}\n} as const;\n\n` +
    `export const solarMuiVariantMapping = ${JSON.stringify(data.variantMapping, null, 2)} as const;\n\n` +
    `// MUI's breakpoints, spacing unit and motion, as SOLAR tokens. See spec/deviations.md, mui.theme.\n` +
    `export const solarMuiBreakpoints = ${JSON.stringify(data.breakpoints, null, 2)} as const;\n\n` +
    `export const solarMuiSpacing = ${data.spacing};\n\n` +
    `export const solarMuiTransitions = ${JSON.stringify(data.transitions, null, 2)} as const;\n\n` +
    `/**\n` +
    ` * The theme options for MUI's createTheme: both colour schemes, in MUI's CSS-variables mode, switched\n` +
    ` * by \`${THEME_ATTRIBUTE}\` as the SOLAR tokens are, so \`${THEME_ATTRIBUTE}="dark"\` on any element turns a stock\n` +
    ` * MUI component and a SOLAR one to Dark together. The palette stays literal per scheme: MUI\n` +
    ` * derives channels and shades from it, which a var() cannot give. Native colour mode makes\n` +
    ` * theme.alpha() CSS's relative colour, so it works on every SOLAR colour in both schemes; without it,\n` +
    ` * alpha() reads a channel variable MUI defines only for its own colours.\n` +
    ` */\n` +
    `export function createSolarThemeOptions() {\n` +
    `  return {\n` +
    `    cssVariables: { colorSchemeSelector: '[${THEME_ATTRIBUTE}="%s"]', nativeColor: true },\n` +
    `    colorSchemes: {\n` +
    `      light: { palette: solarMuiPalette.light },\n` +
    `      dark: { palette: solarMuiPalette.dark },\n` +
    `    },\n` +
    `    breakpoints: { values: solarMuiBreakpoints },\n` +
    `    spacing: solarMuiSpacing,\n` +
    `    transitions: solarMuiTransitions,\n` +
    `    shape: { borderRadius: parseFloat(solarTokens.light['radius.control']) },\n` +
    `    zIndex: solarZIndex,\n` +
    `    typography: { ...solarMuiVariants, ...solarMuiTypography },\n` +
    `    // Stock MUI components drawn from SOLAR recipes (spec/overlay/mui-theme.yaml), and Typography's\n` +
    `    // element for each variant.\n` +
    `    components: {\n` +
    `      ...solarMuiComponents,\n` +
    `      MuiTypography: { defaultProps: { variantMapping: solarMuiVariantMapping } },\n` +
    `    },\n` +
    `  };\n` +
    `}\n`;
  const ts = tokensTs + themeTs;
  const augmentationTs = renderAugmentation(data.solarPalette, data.variants);

  return {
    ts,
    tokensTs,
    themeTs,
    augmentationTs,
    manifest,
    data,
    deviations: [{ ...MUI_DEVIATION }],
  };
}

/** Where the type augmentation goes: beside the components' own, in the package that peers MUI. */
export const AUGMENTATION = join(
  packagesDir,
  'components',
  'src',
  'solar-theme.generated.ts',
);

export function emitMui(spec) {
  const { tokensTs, themeTs, augmentationTs, manifest, deviations } =
    renderMui(spec);
  writeGenerated(join(OUT_DIR, '..', 'tokens.ts'), tokensTs);
  writeGenerated(join(OUT_DIR, 'theme.ts'), themeTs);
  writeGenerated(AUGMENTATION, augmentationTs);
  return { count: Object.keys(manifest).length, deviations };
}
