# Target: MUI

Status: generated. `bwp-ds generate --target mui` writes
`packages/styles-mui/src/generated/`, and `bwp-ds verify` checks drift,
round-trip, and coverage for it. A component's manifest may map it onto one of
MUI's own components (`targets.mui.component: "Button"`) instead of becoming
its own React component; see "Mapped components" below. Flutter and the
Storybook comparison view arrive in later plans.

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

## Mapped components

A component can map onto one of MUI's own components instead of getting its
own React shell. `targets.mui` gains four fields for this: `component` (the
MUI export name, PascalCase), `axisMap` (design-system axis → MUI prop; every
axis must appear, and every target must be an overridable union prop of that
component), `slotMap` (design-system slot → MUI's class key for that slot,
e.g. `startIcon`; every non-root slot must appear), and `defaultProps` (extra
MUI props with JSON scalar values). A `defaultProps` entry is rejected
(`DS-E085`) if it targets: a prop already covered by `axisMap` or `slotMap`;
one of the parity props (`disableRipple`, `disableTouchRipple`, `focusRipple`,
`disableFocusRipple`, `disableElevation`) — those are always set by the
generator and cannot be overridden; `children`; any _other_ overridable union
prop of the component (`color` on `Button`, which no axis maps to for
`button`) — map an axis onto it instead of defaulting it, since an unmapped
union is emptied to `never` by the augmentation and a default for it would be
unreachable; or one of the reserved DOM/React props `sx`, `classes`,
`className`, `style`, `ref`, `key`, `component`, `slots`, `slotProps`. The
starter `button` component
(`packages/styles-css/src/components/button/button.manifest.json`) is the
worked example:

```json
"mui": {
  "component": "Button",
  "axisMap": { "variant": "variant", "size": "size" },
  "slotMap": { "icon": "startIcon" }
}
```

The root element declared in `slots.root.element` must equal the element MUI
actually renders for that component (`button` for `Button`); a mismatch, or
any axis/slot/default that does not fit the component, is `DS-E085`. One
design-system component may map onto a given MUI component; a second mapping
onto the same one is also `DS-E085`.

### What is emitted for a mapped component

A mapped component still becomes `theme.components.Mui<Component>`, but its
shape differs from an own component's: `defaultProps` is always set, to the
parity props the component declares (see below) plus each axis's default
value under its MUI prop name, then the manifest's own `defaultProps`;
`styleOverrides.root` is the design system's base rule, exactly as for an own
component; and `variants` opens with a block of **resets** — one entry per
axis permutation _and_ per selector context the catalog recorded MUI styling
for that permutation (`&`, `&:hover`, `&.Mui-disabled`, `& .MuiButton-startIcon`,
…), each holding every property in that context MUI's own styling sets that
the design system does not restate at equal or higher specificity — followed
by the design system's own variants in the usual cascade order.
`mapped.resetCount` on the model records how many leading entries are
resets, so a reader (or a test) can slice them off. For `button`,
`resetCount` is 38: 4 axis permutations × up to 10 selector contexts each
(the `filled` permutations have all 10; `ghost` has only 9, because MUI's
`&.MuiButton-loading` context sets nothing but `color`, and `ghost`'s own
unconditioned `color` variant already provides it at equal specificity, so
that whole context is left with no properties to reset and the entry is
dropped entirely). An abbreviated reset entry from the `button` catalog,
keyed by MUI's own selector so its specificity matches exactly (the real
entry resets every property MUI's base style sets in that context that this
rule does not restate, not just these two):

```json
{
  "props": { "variant": "filled", "size": "sm" },
  "style": {
    "&": {
      "minWidth": "revert",
      "WebkitTapHighlightColor": "revert",
      "...": "revert"
    }
  }
}
```

MUI's own `text-transform: uppercase` on `Button`'s root is one property the
resets do _not_ touch: the design system's `styleOverrides.root` already sets
`text-transform: none` at the same `&` specificity as MUI's own base style,
and theme `styleOverrides` for a component are emitted after that component's
built-in styles, so the design system's value already wins the cascade
without needing an explicit reset first.

Parity `defaultProps`: the generator always sets `disableRipple`,
`disableTouchRipple`, and `focusRipple` when the component's own props
declare them or the root turns out to be a `ButtonBase` (a clickable Chip
gets ripple parity even though `Chip`'s own props do not declare
`disableRipple`), and `disableFocusRipple`/`disableElevation` only when the
component declares them itself. Ripples add DOM and animation the design
system does not have; elevation adds shadows the design system does not
specify.

### The defaults catalog

The resets above are computed from a captured record of what MUI actually
styles, `packages/styles-css/catalogs/mui.json`, produced by
`bwp-ds capture-defaults --target mui`. It renders every mapped component in
every axis permutation with the target package's own installed React,
Emotion, and MUI (no browser), and records MUI's emitted CSS per selector
context, plus MUI's prop unions read from its `.d.ts` files. The catalog is
committed like any other generated artefact and is deterministic: capturing
it twice with nothing else changed produces byte-identical output.

`bwp-ds generate` and `bwp-ds verify` require the catalog to exist, to have an
entry for every mapped component and every axis permutation, and to have been
captured with the same `axisMap`/`slotMap`/`defaultProps` currently in the
manifest; any mismatch is `DS-E086` (missing, unreadable, wrong schema, stale
mapping). They also require the catalog's recorded MUI version to exactly
equal the `@mui/material` resolved from the target package's `node_modules`
(patch versions can move defaults); a mismatch fails with `DS-E086` unless
`--allow-catalog-mismatch` is passed, in which case it downgrades to the
warning `DS-W004`. When MUI cannot be resolved at all from the target's
`outDir` (a bare test root), `DS-W004` says the version is unverified. Run
`capture-defaults` again after adding or changing a mapped component's
`axisMap`/`slotMap`/`defaultProps`, or after upgrading `@mui/material`.

### The reset rule

For each property MUI sets on an element in some selector context: if no
design-system rule sets that property on that same element in that context,
the reset is `revert` — roll the cascaded value back to the user-agent
default, undoing MUI's styling with nothing left in its place. If a
design-system rule of **lower** specificity than MUI's own selector does
provide a value, the reset restates that value at MUI's specificity, so it
still wins once the design system's own (lower-specificity) rule is added
after it. If a design-system rule of **equal or higher** specificity already
provides it, nothing is emitted for that property: the design system's own
variant, which is emitted after every reset, wins outright. `revert` is used
rather than the spec's original `unset`: `unset` resolves to the CSS-wide
_initial_ value for a non-inherited property (`display: inline` for a
`<button>`), not the user-agent default, so it would leave the element
differently laid out than the plain-CSS target computes for the same markup;
`revert` rolls back to exactly the browser's built-in stylesheet, which is
what "MUI sets nothing here" should mean. One exception: a `content` property
is reset to `none`, not `revert` — Emotion's development build throws on any
unquoted `content` value outside `normal|none|initial|inherit|unset`, and for
a generated `::before`/`::after` both produce the same "no box" result as the
user-agent default.

### The typed wrapper

`import { Button } from '@bwp-web/styles-mui'` gives a `forwardRef` component
whose props are exactly the design system's: one optional prop per axis under
its design-system name and values (`variant`, `size`), one boolean per state
that needs an attribute (`disabled`), `children`, one `ReactNode` prop per
other slot under its design-system name (`icon`, filling MUI's `startIcon`),
`className`, and the root element's DOM props — including `tabIndex` and
`type`, which the wrapper keeps even though MUI's own props re-declare them,
but excluding `href` (accepting it would let a consumer change Button's root
element, which the capture and the resets assume is fixed). MUI's own props
that the design system does not expose (`sx`, `classes`, `color`, `loading`,
`fullWidth`, `disableRipple`, …) are not part of `ButtonProps` at all, so
passing one is a compile-time type error, not a prop that is silently
ignored. MUI's own `Button`, imported from `@mui/material/Button`, still does
the rendering and still receives the theme.

### Augmenting MUI's own component

Importing `@bwp-web/styles-mui` also narrows MUI's own component types for
the whole application, not just the wrapper's. For every mapped axis, the
generator adds `<mui default value>: false` for every one of MUI's own
defaults the design system does not use and `<design-system value>: true` for
each design-system value to the matching `…PropsVariantOverrides`/`…PropsSizeOverrides`/…
interface (`ButtonPropsVariantOverrides`, `ButtonPropsColorOverrides`, …); a
prop no axis maps to (`color`, for `button`) gets every one of its own
defaults set to `false`, so its union becomes `never` and it cannot be passed
at all. The practical effect: `<MuiButton variant="contained">`, imported
directly from `@mui/material/Button` anywhere in the app, fails to type-check,
because `"contained"` was set to `false` in `ButtonPropsVariantOverrides` —
the augmentation is global, not scoped to the wrapper.

### Known limits

An MUI element that no slot maps to (an internal wrapper span MUI always
renders) is refused at `capture-defaults` time with the element's class name
in the message; add a slot for it or exclude the component. MUI's
`.Mui-focusVisible` class is treated as the design system's `focus-visible`
state when it appears in a captured selector. MUI's own utility classes
(`MuiButton-sizeSm`, `MuiButton-colorPrimary`, `MuiButton-disableElevation`,
…) still appear in the rendered DOM — MUI computes them from `ownerState`
regardless of styling — but carry no rules of their own once the resets and
the design system's variants are applied; do not rely on their presence or
absence to mean anything.

## Manifest hints

`targets.mui` accepts `{}` (generate an own component), the mapping fields
above (`component`, `axisMap`, `slotMap`, `defaultProps`), or
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
generator or reparser bug, never at the output. For a mapped component, the
leading reset entries are first recomputed from the IR and the catalog with
the same pure function and compared for deep equality (a stale or hand-edited
catalog fails here as `DS-E086`, before reparse ever runs), then stripped, and
the remaining variants round-trip exactly as for an own component.

## Regenerating

`npm run ds -- generate --target mui` from the repo root, then
`npm run verify`. Run `npm run ds -- capture-defaults --target mui` first
whenever a mapped component is added, its `axisMap`/`slotMap`/`defaultProps`
change, or `@mui/material` is upgraded, and commit the resulting
`packages/styles-css/catalogs/mui.json` alongside the regenerated output.
Never edit files under `src/generated/` or the catalog by hand; a generation
bug that makes the package's `tsc` or `eslint` fail is fixed in
`packages/ds-compiler/src/targets/mui/`.
