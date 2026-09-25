# @bwp-web/styles

Biamp SOLAR design tokens for the web, generated from the same spec as
[`solar_flutter`](../solar_flutter/README.md).

Everything under `src/generated/` is written by `npm run solar:codegen` at the repository root
and must not be edited by hand. See [@bwp-web/codegen](../codegen/README.md).

## Take only what you use

Each way of building a web app has its own entry, and none of them loads another's code:

| You use        | Import                                                    | Brings no                 |
| -------------- | --------------------------------------------------------- | ------------------------- |
| plain CSS      | `@bwp-web/styles/tokens.css`                              | JavaScript, Tailwind, MUI |
| Tailwind CSS 4 | `@bwp-web/styles/tailwind.css` (includes `tokens.css`)    | JavaScript, MUI           |
| MUI            | `@bwp-web/styles/mui`, plus `@bwp-web/styles/tokens.css`  | Tailwind                  |
| any JavaScript | `@bwp-web/styles`: the tokens as data, e.g. for CSS-in-JS | MUI, Tailwind             |
| any of these   | `@bwp-web/styles/fonts.css` for SOLAR's fonts             |                           |

The package has no peer dependencies, so a Tailwind or plain-CSS app never needs MUI or React.
Flutter apps use [`solar_flutter`](../solar_flutter/README.md) instead, which needs nothing from npm.

## Plain CSS

```ts
import '@bwp-web/styles/tokens.css';
```

Defines every token on `:root`, redefines the mode-varying ones under `[data-theme='dark']`, and
overrides the type scale below the tablet boundary. Dark mode can scope to a subtree, not just
the document:

```html
<aside data-theme="dark">…</aside>
```

The package lists `*.css` in `sideEffects`, so a bundler keeps this import. With
`"sideEffects": false` webpack drops it silently in production builds, since nothing is imported
from it; a test in `@bwp-web/codegen` fails if a stylesheet export ever goes unlisted again.

## Tailwind CSS 4

```css
@import 'tailwindcss';
@import '@bwp-web/styles/tailwind.css';
```

Tailwind 4 is configured in CSS, so this is a stylesheet rather than a JavaScript preset. It brings
`tokens.css` with it and registers SOLAR in Tailwind's theme with `@theme inline`, so every
utility is a reference to a SOLAR custom property and Light and Dark follow `data-theme` with no
Tailwind dark-mode variant:

| Utility                                      | From                                |
| -------------------------------------------- | ----------------------------------- |
| `bg-surface-background`, `text-text-primary` | `color.*`                           |
| `p-inset-md`, `gap-stack-lg`                 | `inset.*`, `stack.*`                |
| `rounded-control`, `shadow-control`          | `radius.*`, `shadow.*`              |
| `text-display-lg`, `font-inter`              | `type.size.*`, `type.font-family.*` |
| `ease-out`, `duration-fast`                  | `motion.*`                          |
| `border-default`, `z-dialog`                 | `border.*`, `z.*`                   |
| `sm:` `md:` `lg:` `xl:`                      | SOLAR's breakpoints, in pixels      |

It exposes the semantic layer only, so app code cannot reach for a raw palette value; the
exceptions are `motion.*` and the font families, which SOLAR gives no semantic layer. Font weights
are not re-registered, because SOLAR's 100 to 900 are Tailwind's own scale. SOLAR's `border.none`
has no utility, because Tailwind's `border-none` already means `border-style: none`; use
`border-0`.

## MUI

```ts
import '@bwp-web/styles/tokens.css';
import { createTheme } from '@mui/material/styles';
import { createSolarThemeOptions, solarButtonStyle } from '@bwp-web/styles/mui';

const theme = createTheme(createSolarThemeOptions());
```

`createSolarThemeOptions` returns plain `ThemeOptions`; nothing here imports MUI, so this package
does not depend on it. In React, `SolarProvider` from `@bwp-web/components` installs it.

**One switch for Dark.** The theme holds both colour schemes in MUI's CSS-variables mode, switched
by the attribute the tokens switch on: `data-theme="dark"` on any element turns the stock MUI
components and the SOLAR ones under it to Dark together, and nothing else needs to change (no
`palette.mode`, no second theme). Where an app lets MUI set the attribute itself
(`useColorScheme`), render MUI's `InitColorSchemeScript` on the server to avoid a flash; where the
app sets `data-theme`, as for the tokens alone, it is not needed.

**Breakpoints, spacing and motion** come from the tokens too: MUI's `sm`, `md`, `lg` and `xl` are
SOLAR's `viewport.*` (`xs` is 0, as MUI requires), so `theme.breakpoints.down('sm')` is where the
type turns Mobile; `theme.spacing(n)` is n × SOLAR's 4px `inset.2xs`; and MUI's durations and
easings are SOLAR's nearest `motion.*`. The tables are exported as `solarMuiBreakpoints`,
`solarMuiSpacing` and `solarMuiTransitions`.

Stock MUI components render in SOLAR without any per-component work. The theme fills MUI's own
palette slots and typography variants with SOLAR roles: `primary`, `secondary` and `error` from
the `action.*.bg` fills, `warning`, `info` and `success` from `surface.feedback.*.strong`,
`h1`–`h6` from display and title, `body1` from `body.md.regular`, and `button` from `label.md`
without MUI's uppercase. SOLAR does not define this mapping, so it is the `mui.theme` row in
[`spec/deviations.md`](../../spec/deviations.md). The resolved tables are exported as
`solarMuiPalette` and `solarMuiTypography`. The palette holds literal colours, one set per scheme,
rather than `var(--solar-*)`, because MUI derives channels and shades from it (`alpha()`,
`darken()`).

The component recipes are here too: `solarButtonStyle(props)` is the complete style for one set of
Button props, for `sx` or `styleOverrides.root`, with every value a `var(--solar-*)`.

## Fonts

```ts
import '@bwp-web/styles/fonts.css';
```

Loads Inter, Montserrat and IBM Plex Mono at the weights SOLAR's text styles use, from Fontsource
(installed with this package, SIL OFL 1.1). Each is split per script, so a page downloads only the
glyphs it uses. Gotham, SOLAR's commercially licensed brand typeface, is not shipped; SOLAR's
display styles use Montserrat, its open substitute.

The font-family tokens are stacks, not bare names: `--solar-type-font-family-inter` is
`"Inter", "Open Sans", system-ui, sans-serif`, SOLAR's own named fallback then the system font. So
a font that has not loaded, or an app that does not import `fonts.css`, degrades to a sans-serif
rather than to the browser's default serif. `fonts.css` imports its files by package name, which
webpack, Vite and esbuild resolve; a plain `<link>` to the file does not.

## Tokens as data

`@bwp-web/styles` holds the tokens as JavaScript, for anything that styles from code:

| Export                      | Holds                                                               |
| --------------------------- | ------------------------------------------------------------------- |
| `solarTokens`               | every token by theme mode (`light`, `dark`), at its Desktop value   |
| `solarViewportTokens`       | the type tokens that change with the viewport (`desktop`, `mobile`) |
| `solarTypography`           | the 47 text styles, per viewport                                    |
| `solarResponsiveTypography` | the same styles with the Mobile values nested as a media query      |
| `solarShadows`              | the 9 effect styles, per theme mode                                 |
| `solarZIndex`               | the 7-level layering ladder                                         |

`solarTokens` is keyed by theme alone, so it holds the Desktop value of anything that varies by
viewport; `solarViewportTokens` is the override to apply below the breakpoint, mirroring what the
stylesheet does with its media query.

Names are the SOLAR dot form (`color.text.primary`), the same names used in `docs/` and in
`spec/tokens.json`.
