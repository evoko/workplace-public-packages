# solar_flutter

Biamp SOLAR design tokens and icons for Flutter, generated from the same specs as the web
packages: `spec/tokens.json` and `spec/icons.json`.

Consume it by git dependency:

    dependencies:
      solar_flutter:
        git:
          url: https://github.com/evoko/workplace-public-packages.git
          path: packages/solar_flutter
          ref: v2-SOLAR

It needs Flutter 3.47 or later (Dart 3.13), the version CI pins in `.github/workflows/solar.yml`.

Everything in `lib/src/generated` is produced by `npm run solar:codegen` at the repository
root. Do not edit it. The types, the widgets and the SVG path parser beside it are hand written.
See [the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## Tokens

Mode-varying tokens are instances, one per mode: `SolarColors.light` / `.dark`, `SolarShadows`
the same, and `SolarType` / `SolarTypography` as `.desktop` / `.mobile`. Mode-invariant ones are
`static const` fields — `SolarInset.md`, `SolarRadius.control`, `SolarMotion.durationFast`. The
`SolarTheme` extension bundles the mode-varying sets so widgets read them from the ambient theme.

```dart
MaterialApp(
  builder: (context, child) => Theme(
    data: Theme.of(context).copyWith(extensions: [
      SolarTheme.resolve(
        brightness: Theme.of(context).brightness,
        width: MediaQuery.sizeOf(context).width,
      ),
    ]),
    child: child!,
  ),
)
```

**Follow the viewport with `SolarTheme.resolve`.** Below `SolarViewport.sm` (768) it picks the
Mobile type scale, at the same width the web's `@media (max-width: 767.98px)` switches, because
both are derived from the one `viewport.sm` token. `SolarTheme.light` and `SolarTheme.dark` are
constants for the Desktop scale, for when the viewport does not matter. SOLAR changes only
`display`, `title` and `code` between the two; body, label, caption and helper text stay put.

## Components

`SolarButton`, `SolarIconButton`, `SolarButtonGroup`, `SolarSpinner` and `SolarStatusIndicator` take
the same props as the React components (a group takes its buttons as `children`, and asserts against the vertical
full-width group Figma does not draw):

```dart
SolarButton(
  variant: SolarButtonVariant.secondary,
  size: SolarButtonSize.sm,
  loading: saving,
  onPressed: save,
  child: const Text('Save changes'),
)
```

Each is a widget scaffolded once (`npm run solar:scaffold -- --flutter <Name>`) and then hand-owned,
styled by a generated recipe it never copies values from. They read the `SolarTheme` the app
installed, or Light or Dark for the app's brightness if it installed none. An icon-only
`SolarButton` needs a `semanticLabel`, and `SolarIconButton` requires one; either way the name and
the button's tap action are one node for a screen reader. While loading the label keeps its room and its semantics
but is not drawn, and the spinner Figma picks for the variant shows; disabled wins over loading.

The recipe can also style a stock control directly. `SolarButtonRecipe.style(theme, props)` is a
`ButtonStyle` that makes a `FilledButton` draw SOLAR's Button, resolving hover, pressed, focus and
disabled through `WidgetState`, including states that hold together (a mouse press is hovered and
pressed at once, and draws Figma's pressed look):

```dart
FilledButton(
  style: SolarButtonRecipe.style(
    Theme.of(context).extension<SolarTheme>()!,
    const SolarButtonProps(variant: SolarButtonVariant.secondary, size: SolarButtonSize.sm),
  ),
  onPressed: save,
  child: const Text('Save changes'),
)
```

The recipe is generated from `spec/components/button.json` and regenerates on every run. The
background and shadow are painted in `backgroundBuilder`, because `ButtonStyle` has no box shadow.
Presence (the spinner while loading, the label hidden) is `SolarButtonRecipe.present`, and which
Spinner is `SolarButtonRecipe.lookup('spinner.variant.size', …)`, for the widget that composes the
button's content, as `SolarButton` does.

A shape a component draws itself (Spinner's ring, StatusIndicator's marks, and in later components
Checkbox's tick) is a `SolarGlyph`: Figma's path data for the fill and for the stroke's outline, read
from the recipe with `Solar<Name>Recipe.glyph(layer, props, states)`. `SolarGlyphView` draws one at
its own size, the fill's outline in the fill colour and the stroke's in the stroke colour, by
`SolarVectorPainter` as the icons are. `SolarStatusIndicator` walks Figma's layer tree, drawing each
layer as a `SolarGlyphView` or a box, and placing it at the recipe's `x` and `y` where its parent has
no auto layout; decorative unless given a `label`, which it announces as an image.

Every variant of both widgets is checked against what Figma draws (`spec/verify/`) by
`flutter test`: see [test/visual/README.md](test/visual/README.md). To look at them instead,
`npm run widgetbook` from the repository root: every Figma variant with its state forced, in Light
and Dark, and a playground with a knob per prop ([widgetbook/README.md](widgetbook/README.md)). How
a widget is built in one variant is shared by both, in the small `variants/` package
(`solar_flutter_variants`), a dev dependency only.

## Fonts

Inter, Montserrat and IBM Plex Mono ship inside the package, at the weights SOLAR's text styles
use, so an app renders in them with no font setup of its own. The `SolarTypography` styles already
name the package (`package: 'solar_flutter'`), which is how Flutter finds a font a package
bundles. Building a style from a `SolarFont` family yourself, pass `solarFontPackage`:

```dart
TextStyle(fontFamily: SolarFont.fontFamilyInter, package: solarFontPackage)
```

All three are SIL OFL 1.1. Gotham, SOLAR's commercially licensed brand typeface, is not shipped
and no text style uses it. Sources, licences and checksums are in [fonts/README.md](fonts/README.md).

## Icons

340 SOLAR icons, each as two `SolarVector` constants — `chevronRightOutline` and
`chevronRightSolid` — on `SolarIcons`, drawn by the `SolarIcon` widget.

```dart
const SolarIcon(SolarIcons.chevronRightOutline)
```

There is deliberately no `Map<String, SolarVector>`: Dart tree-shakes static fields
individually, so taking one icon costs one icon, while a map would reference every field and
retain all 358 KB of path data.

**Colour is inherited, never baked in.** No icon carries a colour of its own — the same contract
as `currentColor` on the web. The first of these that is set wins:

1. the explicit `color` argument;
2. the ambient `SolarTheme` extension's `colors.iconPrimary`;
3. `IconTheme.of(context).color`, so an icon inside a button or a list tile matches the Material
   icons beside it;
4. black, reached only if a caller has removed the default icon theme.

```dart
SolarIcon(SolarIcons.deleteSolid, color: Theme.of(context).colorScheme.error)
```

**Size** is the side of a square box and defaults to `SolarIconSize.lg` (24). The drawing is
scaled to fit with its aspect ratio kept, so an icon drawn off the 24 grid is letterboxed rather
than squashed.

**Semantics.** `semanticLabel` names the icon for assistive technology. Without one it is
excluded from the semantics tree, which is right for an icon sitting beside a label that already
says what it means.

## Logos

`SolarLogos` carries `biampDarkSm`, `biampLightSm`, `osGoogle` and `osMicrosoft`, drawn by
`SolarLogo`.

```dart
const SolarLogo(SolarLogos.biampDarkSm)
```

Two things differ from `SolarIcon`, and both are enforced by the type rather than by a comment:

- **`SolarLogo` takes no `color`.** Every path carries the colour SOLAR drew it in, and a tinted
  brand mark is a brand violation.
- **`size` sets the height**, and the width follows the mark's ratio. The Biamp wordmark is
  36 × 12; one length on both axes would squash it. SOLAR publishes no logo scale, so the
  default is `SolarIconSize.lg`.

**The Teams variant is deliberately absent.** `os-logo/teams` is drawn with 11 radial gradients,
one linear gradient and per-path opacity, which the vector data this package ships cannot
represent; redrawing it in a hand-written painter is disproportionate for one third-party mark,
and flattening it would invent a brand colour. The web targets carry it, so this is the one
asset the platforms do not share — recorded as the `logo.os-logo.teams` row in
[`spec/deviations.md`](../../spec/deviations.md), where the other four icon findings live too.
The emitter asserts it is the only variant it skipped, so a second one fails the build.
