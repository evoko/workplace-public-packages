# @bwp-web/styles

Biamp SOLAR design tokens for the web, generated from the same spec as
[`solar_flutter`](../solar_flutter/README.md).

Everything under `src/generated/` is written by `npm run solar:codegen` at the repository root
and must not be edited by hand. See [@bwp-web/codegen](../codegen/README.md).

## MUI

`createSolarThemeOptions` returns plain `ThemeOptions`; this package imports nothing from MUI, so
it stays dependency free.

```ts
import { createTheme } from '@mui/material/styles';
import { createSolarThemeOptions } from '@bwp-web/styles';

const theme = createTheme(createSolarThemeOptions('light'));
```

Stock MUI components render in SOLAR without any per-component work. The theme fills MUI's own
palette slots and typography variants with SOLAR roles: `primary`, `secondary` and `error` from
the `action.*.bg` fills, `warning`, `info` and `success` from `surface.feedback.*.strong`,
`h1`–`h6` from display and title, `body1` from `body.md.regular`, and `button` from `label.md`
without MUI's uppercase. SOLAR does not define this mapping, so it is the `mui.theme` row in
[`spec/deviations.md`](../../spec/deviations.md). The resolved tables are exported as
`solarMuiPalette` and `solarMuiTypography`. The palette holds literal colours rather than
`var(--solar-*)`, because MUI runs `alpha()` and `darken()` on it.

Typography carries both viewports: each text style holds its Desktop values with a nested
`@media (max-width: 767.98px)` block for the Mobile ones, so `createTheme` switches at SOLAR's
tablet boundary without any help from the app. Only `display`, `title` and `code` change size —
body, label, caption and helper text stay put, by design.

## CSS custom properties

```ts
import '@bwp-web/styles/tokens.css';
```

The package lists `*.css` in `sideEffects`, so a bundler keeps this import. With
`"sideEffects": false` webpack drops it silently in production builds, since nothing is imported
from it; a test in `@bwp-web/codegen` fails if a stylesheet export ever goes unlisted again.

Defines every token on `:root`, redefines the mode-varying ones under `[data-theme='dark']`, and
overrides the type scale below the tablet boundary. Dark mode can scope to a subtree, not just
the document:

```html
<aside data-theme="dark">…</aside>
```

## Tailwind

The preset points at the custom properties above, so `tokens.css` must be imported too; Light and
Dark then follow `data-theme` with no Tailwind dark-mode variant.

```ts
import { solarTailwindPreset } from '@bwp-web/styles';

export default { presets: [solarTailwindPreset], content: [...] };
```

It exposes the semantic layer only, so app code cannot reach for a raw palette value. The
exceptions are `motion.*` and the font families, which SOLAR gives no semantic layer, and the
breakpoints, which are real pixel values because a media query cannot read a custom property.

## Raw tokens

| Export                      | Holds                                                                 |
| --------------------------- | --------------------------------------------------------------------- |
| `solarTokens`               | every token by theme mode (`light`, `dark`), at its Desktop value     |
| `solarViewportTokens`       | the type tokens that change with the viewport (`desktop`, `mobile`)   |
| `solarTypography`           | the 47 text styles, per viewport, kept separate for non-MUI consumers |
| `solarResponsiveTypography` | the same styles with the Mobile values nested as a media query        |
| `solarShadows`              | the 9 effect styles, per theme mode                                   |
| `solarZIndex`               | the 7-level layering ladder                                           |
| `solarMuiPalette`           | MUI's palette slots, resolved to SOLAR colours, per theme mode        |
| `solarMuiTypography`        | MUI's built-in variants (`h1`…`caption`), as SOLAR text styles        |

`solarTokens` is keyed by theme alone, so it holds the Desktop value of anything that varies by
viewport; `solarViewportTokens` is the override to apply below the breakpoint, mirroring what the
stylesheet does with its media query.

Names are the SOLAR dot form (`color.text.primary`), the same names used in `docs/` and in
`spec/tokens.json`.
