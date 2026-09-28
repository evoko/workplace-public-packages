# SOLAR Widgetbook — the Flutter review surface

```sh
npm run widgetbook                      # from the repository root: opens it in Chrome
node scripts/widgetbook.mjs build       # a web build, into build/web (CI does this)
```

A viewer for `solar_flutter`'s widgets (hand-written shells over generated recipes), the twin of
the React Storybook (`packages/components/stories/`): every variant the checks measure, and each
widget live. Nothing in the Variants is written per component; each Playground is a small
builder written by hand per component, which never touches the checks:

- **Playground**: the widget live and two-way under knobs generated from its IR
  ([below](#playground)).
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

Under `npm run widgetbook`, the **workbench bar** above each Playground acts for Flutter: Inspect
opens a full-screen dialog that sets a look to a SOLAR token as an overlay rule (a tap on a part
of the component in its preview chooses the layer, where `SolarLayers` draws it), Report and Send to agent save notes for
`/solar-feedback`, and Approve and Undo approval write `spec/approvals.yaml` for the person
pressing them. It is drawn only where the script gives the workbench service's URL
(`--dart-define=SOLAR_WORKBENCH`), from `lib/workbench/` (`bar.dart`, `inspect_dialog.dart`,
`preview.dart`, `blocks.dart`, `client.dart`, `models.dart`), and the service hot-restarts the app
after each regeneration; how to use it:
[workflows.md, Fix a component in the viewer](../../../docs/engineering/workflows.md#fix-a-component-in-the-viewer).

It is a web app: Widgetbook's interface is built for it, and nothing here is measured. The native
widget tests remain the check (`flutter test` in `solar_flutter`).

## Playground

Each component's Playground is the real widget, working as it does in an app, under a knob for
every axis and boolean, its words, every SOLAR icon (outline or solid) in an icon slot, a composed
part's show/hide toggle and its words, a content slot's placeholder, the width of the box it sits
in, and the component's own extras (a Text Input's typed `value`, an overlay's `open`). It is
two-way: tapping, typing, choosing and opening change the widget and the knobs follow, and a knob
changes the widget. An overlay opens from an "Open" button beside it. Above it, **Reset** returns
every knob to its default; below it, the **event log** shows its last five callbacks by their
Flutter names (`onPressed`, `onChanged: true`). A number knob with both bounds is a slider; with
one or none it is an input whose description states them, and the builder's `whole` clamps it. How
the knobs are derived, the builder interface and the rules for a builder are shared with the
Storybook: [architecture.md, The viewers](../../../docs/engineering/architecture.md#the-viewers).

The builders are `lib/playground/<file>.dart`, one per component, listed by the generated
`registry.dart`. Beside them: the interface (`playground.dart`), the viewer-free core
(`core.dart`), the Widgetbook adapter (`adapter.dart`), an overlay's route or menu
(`overlay.dart`), a field's controller (`typing.dart`) and sample content (`samples.dart`,
`dates.dart`, `cards.dart`, `charts.dart`, `tables.dart`). `controls.dart` and `icons.dart` are
generated too, and read directly, so the app needs no npm package to build.

Widgetbook keeps every knob's value in the URL's `knobs` query group, and has no API to set a knob
(3.25 has no `updateKnobValue`). So `set` writes the value there,
`WidgetbookState.of(context).updateQueryField(group: 'knobs', …)`, encoded as the knob's own field
would write it, and the use case is rebuilt with the knob reading it; Reset writes only the knobs
that differ from their defaults. Widgetbook builds a use case afresh whenever its URL changes, so
each component's view has a `GlobalKey` of its own, which moves it into the new tree with its event
log and the builder's state (a field's focus and cursor while the tester types); leaving the use
case drops them. One limitation: a knob's text box in the panel does not visibly update when the
widget changes its words, though the value and the widget are right; Widgetbook gives no way to
redraw it.

`flutter test` here tests the adapter and every builder (`test/`), and the workbench bar: its
client (`workbench_client_test.dart`), what is Flutter's own in the bar (`workbench_bar_test.dart`)
and in the Inspect dialog (`workbench_dialog_test.dart`), and every
scenario both bars share (`workbench_scenarios_test.dart`, which reads
`../../codegen/src/workbench/bar-scenarios.json`;
[architecture.md, The workbench](../../../docs/engineering/architecture.md#the-workbench)).
