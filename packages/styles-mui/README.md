# @bwp-web/styles-mui

The design system as an MUI theme plus one React component per design-system
component. Generated from `@bwp-web/styles-css` by the compiler; only
`src/generated/` is generated, everything else in the package is hand-written.

## Install

```bash
npm install @mui/material @emotion/react @emotion/styled @bwp-web/styles-mui
```

## Use

```tsx
import { ThemeProvider } from '@mui/material/styles';
import { createBwpTheme, Example } from '@bwp-web/styles-mui';

const theme = createBwpTheme();

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <Example tone="accent" size="sm" icon={<PlusIcon />}>
        Save
      </Example>
    </ThemeProvider>
  );
}
```

Each component's props are exactly the design system's axes (typed as the
manifest's values), one boolean per state that needs an attribute
(`disabled`, `pressed`, …), one `ReactNode` per slot, and the root element's
DOM props. Pseudo-class states (`hover`, `focus-visible`, `active`) come from
the browser; only states that need an attribute are props.

Set the color mode on the root element: `<html data-bwp-theme="dark">`. The
theme's CSS variables switch with it; no re-render is needed.

Tokens are theme CSS variables: `theme.vars.palette.tokens['accent-default']`
for colors (per color scheme) and `theme.vars.tokens.space['2']`,
`theme.vars.tokens.fontWeight.semibold`, … for everything else. Component rules
reference them, so `sx` and `styled` can too. The generated components do not
accept `sx` themselves (it is reserved); wrap them or use `styled`.

`createBwpTheme(options)` deep-merges `options` on top of the generated theme.
MUI's own components keep MUI's defaults; the design system's components are
fully specified by the theme.

## Type augmentation

Importing the package augments `@mui/material/styles` for the whole
application: MUI's `CssThemeVariables` flag is enabled (so `theme.vars`,
`generateStyleSheets`, and `getColorSchemeSelector` are typed) and the design
system's token keys become required on `Palette` and `Theme`. Use
`createBwpTheme` for every theme in the app; a theme created without CSS
variables would satisfy the types but lack `vars` at runtime.

## What is inside

| File                             | Content                                                                     |
| -------------------------------- | --------------------------------------------------------------------------- |
| `src/generated/theme.ts`         | `bwpThemeOptions` and `createBwpTheme()`.                                   |
| `src/generated/theme.model.json` | The model the TypeScript was rendered from; `bwp-ds verify` round-trips it. |
| `src/generated/augmentation.ts`  | Module augmentation: token keys, component theme entries.                   |
| `src/generated/components/*.tsx` | One component per design-system component.                                  |
| `src/generated/typecheck.tsx`    | Type-level probe compiled by `tsc`, never shipped.                          |

## Regenerate

From the repository root: `npm run ds -- generate --target mui`, then
`npm run verify`. CI fails when the committed output differs from a fresh
generation.
