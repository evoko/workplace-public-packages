# Target: MUI

Status: generated. `bwp-ds generate --target mui` writes
`packages/styles-mui/src/generated/`, and `bwp-ds verify` checks drift,
round-trip, and coverage for it. Components that map onto MUI's own components
(`Button`, `Chip`, …) and the browser-defaults catalog are the next plan;
today every mapped component becomes its own React component.

## What is emitted

MUI 9.4.x with Emotion. Every file starts with a header naming the compiler
version and the IR's source hash (`theme.model.json` carries it as its first
key).

- `theme.model.json`: the model everything else is rendered from. The package
  test asserts `theme.ts` deep-equals it, so verifying the model verifies the
  theme.
- `theme.ts`: `<prefix>ThemeOptions` (a `createTheme` options object) and
  `create<Prefix>Theme(options?)`, which deep-merges `options` on top.
- `augmentation.ts`: module augmentation of `@mui/material/styles`: exact token
  keys on `Palette`, `Theme`, `ThemeOptions`, and `ThemeVars`; one
  `Components` entry per design-system component. Importing the package
  augments `@mui/material/styles` for the whole application: MUI's
  `CssThemeVariables` flag is enabled (so `theme.vars`, `generateStyleSheets`,
  and `getColorSchemeSelector` are typed) and the design system's token keys
  become required on `Palette` and `Theme`. Use `create<Prefix>Theme` for
  every theme in the app; a theme created without CSS variables would satisfy
  the types but lack `vars` at runtime.
- `components/<Pascal>.tsx`: one React component per design-system component.
- `typecheck.tsx`: a type-level probe compiled by the package's `tsc`, never
  bundled. It accepts each component with the design system's values and has
  a `@ts-expect-error` line per axis with a value outside the manifest.

## Tokens

| Category        | Theme path                                     | CSS variable                               |
| --------------- | ---------------------------------------------- | ------------------------------------------ |
| `color`         | `colorSchemes.<mode>.palette.tokens["<path>"]` | `--<prefix>-palette-tokens-<path>`         |
| everything else | `tokens.<camelCategory>["<path>"]`             | `--<prefix>-tokens-<camelCategory>-<path>` |

`<path>` is the token path joined with `-`: `--bwp-color-text-default` becomes
`palette.tokens["text-default"]` and `--bwp-palette-tokens-text-default`;
`--bwp-font-weight-semibold` becomes `tokens.fontWeight.semibold` and
`--bwp-tokens-fontWeight-semibold`. Every value is a string (MUI appends `px`
to bare numbers). Aliases stay `var()` references. A non-color token whose
value varies by mode is `DS-E084`: MUI has no per-scheme home for it. Every
color scheme lists every color token, so the dark block restates unchanged
colors too; the CSS package overrides only the ones that vary. Both compute
the same values.

`cssVarPrefix` is the design-system prefix. `colorSchemeSelector` is derived
from `modeSelector`: `:root[data-bwp-theme="{mode}"]` becomes
`data-bwp-theme`, so `<html data-bwp-theme="dark">` switches both the CSS
package and the MUI theme. A class-form selector (`.x-{mode}`) works too;
anything else is `DS-E084`.

MUI's own semantic slots (`palette.primary`, typography variants, `spacing`,
`shape`, `shadows`) keep MUI's defaults: MUI's internals read them, and the
design system's components do not. Narrowing MUI's own prop unions belongs
with framework-mapped components.

## Components

Each mapped component `<name>` becomes `theme.components.<Prefix><Name>` and a
React component `<Name>`:

- The base root rule is `styleOverrides.root`.
- Every other rule, in the compiler's cascade order, is one `variants` entry
  `{ props: { <axis>: <value>, … }, style: { <key>: { … } } }`. `<key>`
  repeats `&` once per selected axis (`&&` for one axis), then the states as
  the design system renders them (`:hover`, `:disabled` or
  `[aria-disabled="true"]`, `[aria-pressed="true"]`, …), then
  ` .<Prefix><Name>-<slot>` for a slot. `&&` doubles the Emotion class, so the
  specificity equals the CSS target's, and Emotion emits `styleOverrides`
  before `variants` in array order, so ties resolve identically.
- The component is a thin shell: a `styled(<root element>)` root registered
  under the theme key with `ownerState` = the axis values, one plain element
  per slot with class `<Prefix><Name>-<slot>`, `useThemeProps` for
  `defaultProps`. It has no styles of its own; wrap the app in
  `ThemeProvider`.
- Props: one optional prop per axis, typed as the manifest's values; a
  `boolean` per state that needs an attribute (`disabled` renders the
  `disabled` attribute on form controls and `aria-disabled` elsewhere;
  `pressed`, `selected`, `expanded`, `checked` render `aria-*`); `children`
  fill the `label` slot if there is one, else the first required slot, else
  the root; every other slot is a `ReactNode` prop; the root element's DOM
  props are forwarded.

A component whose states, elements, or slot names a React shell cannot express
is `DS-E085`; the manifest fixes it or excludes the component.

## Manifest hints

`targets.mui` accepts `{}` (generate an own component) or
`{ "ignore": ["<property>", …] }`. Ignored properties are left out of the
theme and of the round-trip comparison, and coverage reports `partial`.
`{ "excluded": "<reason>" }` opts out.

## Round-trip

`reparse` reads the freshly generated `theme.model.json` (drift, not
round-trip, guards the committed copy), rewrites the token variables to
source names, and feeds each category through the compiler's token parser; it
reconstructs every `styleOverrides.root` and `variants` entry into a rule in
the design system's selector grammar, parses those with the component parser,
and checks that the variant order and every selector key equal the canonical
form. Any difference is `DS-E081` at `theme.model.json` and points at a
generator or reparser bug, never at the output.

## Regenerating

`npm run ds -- generate --target mui` from the repo root, then
`npm run verify`. Never edit files under `src/generated/`; a generation bug
that makes the package's `tsc` or `eslint` fail is fixed in
`packages/ds-compiler/src/targets/mui/`.
