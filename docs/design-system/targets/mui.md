# Target: MUI

Status: designed, not yet generated. Plan 3 adds the plugin, the defaults
catalog, and the `@bwp-web/styles-mui` package.

## What it will emit

MUI 9.x with Emotion. Under `packages/styles-mui/src/generated/`:

- `theme.ts` exporting `createBwpTheme()`: `createTheme` with CSS variables
  and one color scheme per mode; palette, typography, spacing, shape, and
  shadows from tokens; per component `defaultProps`, `styleOverrides`,
  `variants` (one per axis value and combination), and a reset for every
  framework default the IR does not define.
- `augmentation.d.ts`: adds the design system's axis values to the component's
  prop overrides and disables listed MUI variants.
- `theme.model.json`: the model the TypeScript was rendered from, used for
  round-trip verification.

## Defaults catalog

`bwp-ds capture-defaults --target mui` renders every mapped component in
headless Chromium and records the default theme and computed styles into
`packages/ds-compiler/catalogs/mui@<version>.json`. The generator refuses to
run against a different installed version unless told to.

## Manifest hints (reserved)

| Key                      | Meaning                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| `component`              | MUI component name, for example `Button`.                                 |
| `axisMap`                | Axis to MUI prop, for example `{ "variant": "variant", "size": "size" }`. |
| `slotMap`                | Slot to MUI slot class or prop, for example `{ "icon": "startIcon" }`.    |
| `disableDefaultVariants` | MUI variant values to disable in the augmentation.                        |
| `defaultProps`           | Extra `defaultProps`, for example `{ "disableRipple": true }`.            |
| `ignore`                 | IR properties intentionally not translated for this component.            |
| `excluded`               | Reason string; the component is not mapped to MUI.                        |
