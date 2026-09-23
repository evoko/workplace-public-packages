# @bwp-web/components

SOLAR components for React, built on MUI.

```tsx
import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { Button } from '@bwp-web/components';

<Button variant="secondary" size="sm" iconLeading={<IconArrowLeft />}>
  Back
</Button>;
```

**Requires** React 18 or newer and MUI 9 (`@mui/material` with its Emotion peers), which the app
provides; neither is bundled. The components look right with or without the SOLAR MUI theme
installed, but installing it (`createSolarThemeOptions` from `@bwp-web/styles/mui`) makes stock
MUI components match them.

## Button

| Prop                          | Values                                | Default   |
| ----------------------------- | ------------------------------------- | --------- |
| `variant`                     | `primary` · `secondary` · `tertiary`  | `primary` |
| `size`                        | `md` · `sm` · `lg`                    | `md`      |
| `danger`                      | boolean, for destructive actions only | `false`   |
| `disabled`, `loading`         | boolean                               | `false`   |
| `iconLeading`, `iconTrailing` | an icon, e.g. from `@bwp-web/assets`  |           |
| `counter`                     | a count shown after the label         |           |

Hover, pressed and focus are not props: MUI tracks them, and the recipe styles each. While loading
the label is hidden but keeps its room, and the SOLAR Spinner shows in the variant Figma picks
(inverse on primary); a button both disabled and loading is disabled. Every other MUI Button prop
passes through, and `sx` applies on top of the recipe. An icon-only button needs an
`aria-label`; in development the component warns when one is missing.

`sm` is drawn 32px tall and `md` 40px, below the 44px WCAG touch target. SOLAR asks for the hit
area to be padded in code but publishes no token for the target size, and the descriptions in
Figma give 36px and 44px where the components are drawn 32px and 40px, so this is not done yet: it
is the first question in [the design review](../../docs/solar-review-for-design.md).

## Spinner

| Prop      | Values                | Default   |
| --------- | --------------------- | --------- |
| `size`    | `sm` · `md` · `lg`    | `sm`      |
| `variant` | `default` · `inverse` | `default` |

MUI's CircularProgress with its track, restyled by the recipe; the motion is MUI's, since SOLAR has
no token for a spinner's rotation. Figma calls `variant` `style`, which is React's inline-style prop.
Give it an `aria-label` saying what is loading.

## Checked against Figma

`npm run test:visual` renders every variant of every component here in Chromium, puts each into
its state as a user would, and compares what the browser computes with what Figma draws
(`spec/verify/`). See [test/visual/README.md](test/visual/README.md).

## Generated look, owned behaviour

A component here is two parts, with a hard line between them:

- **The recipe** — what it looks like — is `solarButtonStyle` in `@bwp-web/styles/mui`, generated
  from Figma by `npm run solar:codegen`. It is never edited; a design change arrives through it.
- **The shell** — props, slots, loading, accessibility — is `src/Button.tsx`, written once by
  `npm run solar:scaffold Button` and owned by developers from then on. The scaffolder refuses to
  overwrite it without `--force`, so behaviour someone added is never lost to a design change.

The rule of thumb: **the overlay for a decision about one component, the normalizer for a rule
about the system, the shell for behaviour.**
