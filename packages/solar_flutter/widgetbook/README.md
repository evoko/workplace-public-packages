# SOLAR Widgetbook — the Flutter review surface

```sh
npm run widgetbook                      # from the repository root: opens it in Chrome
node scripts/widgetbook.mjs build       # a web build, into build/web (CI does this)
```

A viewer for `solar_flutter`'s generated widgets, the twin of the React Storybook
(`packages/components/stories/`). Nothing in it is written per component:

- **Playground**: one widget with a knob per prop. A prop's options are the values Figma draws
  for it, from the oracle; the first variant's are selected. Hover, press and tab to it to see its
  states.
- **Variants**: every variant Figma draws (`spec/verify/<name>.json`), labelled with Figma's name,
  built by the same builder the visual checks use, with its platform state forced through the
  widget's `WidgetStatesController` (a pressed one hovered too).
- **Light and Dark** from the Theme addon: the app installs `SolarTheme.light` or `.dark`, as an app
  does. The visual checks measure Light only, so Dark is where this surface sees what they cannot.

How a widget is built in a variant lives in `../variants/` (`solar_flutter_variants`), a small
package shared with the visual checks in `../test/visual/`, so both show a widget the same way. A
component appears here once its builder is registered there and its oracle exists; the visual
checks already require both.

The oracles are copied into `assets/verify/` (git-ignored) by `scripts/widgetbook.mjs` on every run,
because Flutter bundles no asset from outside the app. Run it through the script, not a bare
`flutter run`, or the copy is missing.

It is a web app: Widgetbook's interface is built for it, and nothing here is measured. The native
widget tests remain the check (`flutter test` in `solar_flutter`).
