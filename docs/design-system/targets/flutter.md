# Target: Flutter

Status: designed, not yet generated. Plan 5 adds the plugin and the
`bwp_styles` Dart package. The pinned SDK is Flutter 3.47.x stable; the local
SDK must be upgraded to it before Plan 5.

## What it will emit

Under `packages/styles-flutter/lib/src/generated/`:

- `tokens.dart`: `BwpColors`, `BwpSpace`, `BwpRadius`, `BwpText`, and so on,
  with `light` and `dark` constants where values vary and plain constants
  otherwise. `rem` becomes logical pixels using `rootFontSize`.
- `theme.dart`: `BwpTheme.light()` and `BwpTheme.dark()` returning Material 3
  `ThemeData` with component themes; states through
  `WidgetStateProperty.resolveWith`; axes Flutter lacks natively (such as size)
  become named `ButtonStyle` constants.
- `<file>.flutter.json` beside each Dart file: the model the Dart was rendered
  from, used for round-trip verification.

Dart is formatted by construction; `dart format --set-exit-if-changed` runs as
a check when the SDK is present and never rewrites output.

## Manifest hints (reserved)

| Key              | Meaning                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `variantWidgets` | Axis value to Flutter widget, for example `{ "filled": "FilledButton", "outlined": "OutlinedButton" }`. |
| `ignore`         | IR properties intentionally not translated for this component.                                          |
| `excluded`       | Reason string; the component is not mapped to Flutter.                                                  |
