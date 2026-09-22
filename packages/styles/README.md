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

Typography carries both viewports: each text style holds its Desktop values with a nested
`@media (max-width: 767.98px)` block for the Mobile ones, so `createTheme` switches at SOLAR's
tablet boundary without any help from the app. Only `display`, `title` and `code` change size —
body, label, caption and helper text stay put, by design.

## CSS custom properties

```ts
import '@bwp-web/styles/tokens.css';
```

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

`solarTokens` is keyed by theme alone, so it holds the Desktop value of anything that varies by
viewport; `solarViewportTokens` is the override to apply below the breakpoint, mirroring what the
stylesheet does with its media query.

Names are the SOLAR dot form (`color.text.primary`), the same names used in `docs/` and in
`spec/tokens.json`.
