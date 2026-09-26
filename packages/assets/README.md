# @bwp-web/assets

The SOLAR icon set and brand marks for React, generated from the same spec as
[`solar_flutter`](../solar_flutter/README.md): 340 icons in outline and solid, the Biamp and OS
logos, and the five app icons.

Everything under `src/generated/` is written by `npm run solar:codegen` at the repository root
and must not be edited by hand. See [@bwp-web/codegen](../codegen/README.md).

## Icons

Every icon is its own component, named after its SOLAR component (`Icon/Chevron right` →
`IconChevronRight`), and its own module behind the barrel. The package is `sideEffects: false`,
so importing one icon bundles one icon — **1,454 bytes gzipped** for the first, including the
shared shell.

```tsx
import { IconChevronRight } from '@bwp-web/assets';

<IconChevronRight />;
```

| Prop      | Takes                                                              | Default     |
| --------- | ------------------------------------------------------------------ | ----------- |
| `size`    | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'`, or any CSS length | `'lg'`      |
| `variant` | `'outline' \| 'solid'`                                             | `'outline'` |
| `title`   | the accessible name                                                | none        |

Anything else is passed to the `<svg>`.

**Size comes from a token.** A named step resolves to `var(--solar-icon-<step>)` — the SOLAR
`icon.xs`…`icon.2xl` ladder, 12, 16, 20, 24, 28 and 32px — so a token change moves the rendered
icon and nothing here hard-codes a pixel. Anything outside the ladder is your own CSS length and
passes through untouched, which is the escape hatch for `1em` or a percentage.

```tsx
<IconChevronRight size="sm" />      // var(--solar-icon-sm)
<IconChevronRight size="1em" />     // yours
```

**Colour is inherited.** Every path is drawn with `fill="currentColor"` and no icon carries a
colour of its own, so an icon takes the CSS `color` of whatever contains it. Tint it with a
`color.icon.*` token:

```css
.toolbar-icon {
  color: var(--solar-color-icon-secondary);
}
```

That also means Light and Dark need nothing here: `--solar-color-icon-*` is reassigned under
`[data-theme='dark']` by [`@bwp-web/styles`](../styles/README.md) and the icon follows.

**Accessibility.** An icon with a `title` is an image: it renders `role="img"` and an
`aria-labelledby` pointing at a `<title>`. Without one it is decoration — `aria-hidden="true"`
and `focusable="false"` — which is right beside a label that already says what it means.

```tsx
<button>
  <IconDelete title="Delete" />
</button>
```

## Logos

`LogoBiamp` (`'dark-sm' | 'light-sm'`) and `LogoOs` (`'google' | 'microsoft' | 'teams'`) pick a
mark with `variant`. They take `title` like an icon, but they are not icons, and two rules differ.

```tsx
import { LogoOs } from '@bwp-web/assets';

<LogoOs variant="microsoft" size="xl" title="Microsoft" />;
```

- **A logo is never tintable.** Every path carries the colour SOLAR drew it in, and `color` and
  `fill` are omitted from `LogoProps`, so `<LogoOs fill="red" />` does not compile. The types
  refuse it rather than a comment asking you not to. `currentColor` appears nowhere in a logo.
- **`size` sets the height alone**, and the width follows the mark's own ratio — the Biamp
  wordmark is 36 × 12, and one length on both axes would squash it. ⚠️ SOLAR publishes no
  `logo.*` scale, so a named step reuses the `icon.*` ladder; that reuse is recorded as the
  `logo.size` deviation.

The five app icons are raster, so they are data rather than components: base64 PNG data URLs
ready for an `<img src>`, a CSS `background-image` or a web-app manifest. Import one by name;
`appIcons` is the whole map and pulls in all five.

```tsx
import { appIconWorkplace, appIcons, type AppIconName } from '@bwp-web/assets';

<img src={appIconWorkplace} alt="Workplace" width={64} height={64} />;
```

## Raw SVG files

The same 685 drawings also ship as standalone files, for an `<img>`, a sprite build or a CSS
`mask-image` — no React involved.

```ts
import chevronRight from '@bwp-web/assets/svg/icons/chevron-right-outline.svg';
```

The `./svg/*` export resolves `svg/icons/<stem>-<outline|solid>.svg` for the 680 icon variants
and `svg/logos/<set>-<variant>.svg` for the 5 marks; what your build does with the file — an
asset import like the one above, a copy step, a sprite — is its own business. Each file carries
a `width` and `height` taken from its viewBox, so it has an intrinsic size for an `<img>`. Icon
paths are `fill="currentColor"` and inherit as usual; a CSS mask ignores the fill entirely and
paints with `background-color`.

These are serialized from the spec, not copied out of `docs/`, so they are a fourth rendering of
one source rather than a fourth source.

## Where the artwork comes from

`npm run solar:codegen` reads `docs/solar-icons/` into `spec/icons.json` and emits these
components, those SVG files and the Dart in `solar_flutter` from it. A parity suite proves all
three carry the same geometry for every variant.

Two things about the source are worth knowing, and both are recorded in
[`spec/deviations.md`](../../spec/deviations.md) rather than patched in `docs/`:

- The Teams mark is gradient-filled. React and the raw SVG render it faithfully; Flutter omits it.
- SOLAR has no logo size scale, so a logo's named size borrows the `icon.*` ladder.

A missing icon variant or an off-grid outline is handled by the normalizer and recorded in
`spec/deviations.md` when it occurs.
