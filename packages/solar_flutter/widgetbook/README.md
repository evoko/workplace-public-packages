# SOLAR Widgetbook — the Flutter review surface

```sh
npm run widgetbook                      # from the repository root: opens it in Chrome
node scripts/widgetbook.mjs build       # a web build, into build/web (CI does this)
```

A viewer for `solar_flutter`'s widgets (hand-written shells over generated recipes), the twin of the React Storybook
(`packages/components/stories/`). Nothing in it is written per component:

- **Playground**: one widget with a knob per prop. A prop's options are the values Figma draws
  for it, from the oracle; the first variant's are selected. Hover, press and tab to it to see its
  states.
- **Variants**: every variant Figma draws (`spec/verify/<name>.json`), labelled with Figma's name,
  built by the same builder the visual checks use, with its platform state forced through the
  widget's `WidgetStatesController` (a pressed one hovered too).
- **Light and Dark** from the Theme addon: the app installs `SolarTheme.light` or `.dark`, as an app
  does. The visual checks measure both modes; this is where a person looks at them.

How a widget is built in a variant lives in `../variants/` (`solar_flutter_variants`), a small
package shared with the visual checks in `../test/visual/`, so both show a widget the same way. A
component appears here once its builder exists there (`solar:codegen` registers it, in
`variants/lib/src/registry.dart`) and its oracle does; the visual checks already require both.

The oracles are copied into `assets/verify/` (git-ignored) by `scripts/widgetbook.mjs` on every run,
because Flutter bundles no asset from outside the app. Run it through the script, not a bare
`flutter run`, or the copy is missing.

Each component's name in the sidebar follows its approval circle, 🟢 🟡 🔴
([workflows.md, Approve a component](../../../docs/engineering/workflows.md#approve-a-component)),
which the script writes beside the oracles, to `assets/verify/approvals.status`, before each run.
A build without the generator's npm packages (CI's) has none. The circle is part of the
component's name, so it is part of its URL, and a link changes with its colour. The charts (under
one Charts entry) and the components checked as another's state show no circle;
`npm run solar:status` has their colours.

It is a web app: Widgetbook's interface is built for it, and nothing here is measured. The native
widget tests remain the check (`flutter test` in `solar_flutter`).
