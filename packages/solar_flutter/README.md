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

Everything in `lib/src/generated` is produced by `npm run solar:codegen` at the repository
root. Do not edit it. The types, the widgets and the SVG path parser beside it are hand written.
See [the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## Icons

341 SOLAR icons, each as two `SolarVector` constants — `chevronRightOutline` and
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
scaled to fit with its aspect ratio kept, which is what keeps `zone` — the one icon drawn on a
`0 0 24 25` viewBox — letterboxed rather than squashed.

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
