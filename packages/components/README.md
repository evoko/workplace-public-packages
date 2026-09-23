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
| `size`                        | `md` · `sm` · `xl`                    | `md`      |
| `danger`                      | boolean, for destructive actions only | `false`   |
| `disabled`, `loading`         | boolean                               | `false`   |
| `iconLeading`, `iconTrailing` | an icon, e.g. from `@bwp-web/assets`  |           |
| `counter`                     | a count shown after the label         |           |

Hover, pressed and focus are not props: MUI tracks them, and the recipe styles each. Every other MUI
Button prop passes through, and `sx` applies on top of the recipe. An icon-only button needs an
`aria-label`; in development the component warns when one is missing.

`sm` is drawn 32px tall, below the 44px WCAG touch target. SOLAR asks for the hit area to be padded
in code but publishes no token for the target size, so this is not done yet: it is question 5 in
[the design review](../../docs/solar-review-for-design.md).

## Generated look, owned behaviour

A component here is two parts, with a hard line between them:

- **The recipe** — what it looks like — is `solarButtonStyle` in `@bwp-web/styles/mui`, generated
  from Figma by `npm run solar:codegen`. It is never edited; a design change arrives through it.
- **The shell** — props, slots, loading, accessibility — is `src/Button.tsx`, written once by
  `npm run solar:scaffold Button` and owned by developers from then on. The scaffolder refuses to
  overwrite it without `--force`, so behaviour someone added is never lost to a design change.

The rule of thumb: **the overlay for a decision about one component, the normalizer for a rule
about the system, the shell for behaviour.**
