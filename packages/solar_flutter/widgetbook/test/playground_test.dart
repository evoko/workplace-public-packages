// Every Playground builder, from the generated registry: it renders at its controls' defaults (the
// generated controls.dart) through the real Widgetbook adapter; it reads every control but the
// width, through a recording Playground (the web's is
// packages/components/test/playground.test.mjs); and an overlay (an `open` extra), a route, a menu
// or a floating surface, opens and closes without an error. The interactions are
// playground_pilots_test.dart's and the other playground_*_test.dart.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/main.dart' show solarTheme;
import 'package:solar_widgetbook/playground/controls.dart';
import 'package:solar_widgetbook/playground/core.dart';
import 'package:solar_widgetbook/playground/playground.dart';
import 'package:solar_widgetbook/playground/registry.dart';

import 'helpers.dart';

const _toggles = {'boolean', 'child', 'content'};

/// Builds [builder] over [values] with a recording Playground, lets an overlay's route show where
/// `open` holds, and returns every control it read.
Future<Set<String>> _reads(
  WidgetTester tester,
  String component,
  SolarPlaygroundBuilder builder,
  Map<String, Object?> values,
) async {
  final read = <String>{};
  final p = ControlledPlayground(
    controls: controlsOf(component),
    read: (name) => values[name],
    write: (_, _) {},
    onLog: (_, _) {},
    onRead: read.add,
  );
  await tester.pumpWidget(
    MaterialApp(
      theme: solarTheme(SolarTheme.light, Brightness.light),
      home: Scaffold(body: Builder(builder: (_) => builder.build(p))),
    ),
  );
  await settle(tester);
  await tester.pumpWidget(const SizedBox());
  await tester.pump();
  expect(tester.takeException(), isNull);
  return read;
}

void main() {
  setUpAll(loadBundledFonts);

  test(
    'every component with Playground controls has a builder, and no other',
    () {
      expect(
        playgroundBuilders.keys.where(
          (c) => !playgroundControls.containsKey(c),
        ),
        isEmpty,
      );
      expect(
        playgroundControls.keys.where(
          (c) => !playgroundBuilders.containsKey(c),
        ),
        isEmpty,
      );
    },
  );

  for (final MapEntry(key: component, value: builder)
      in playgroundBuilders.entries) {
    testWidgets('$component renders at its controls\' defaults', (
      tester,
    ) async {
      final state = await pumpPlayground(tester, component, builder);
      await tester.pump();
      expect(tester.takeException(), isNull);
      // The adapter registered a knob for every control, each still at its default.
      expect(
        state.knobs.keys,
        unorderedEquals([
          for (final c in playgroundControls[component]!) c['name']! as String,
        ]),
      );
      expect(find.text('Reset'), findsOneWidget);
    });

    testWidgets('$component reads every control but the width', (tester) async {
      final controls = controlsOf(component);
      final defaults = {for (final c in controls) c.name: c.initial};
      // Every toggle flipped (an overlay's `open` among them), so what a hidden part holds is read.
      final flipped = {
        for (final c in controls)
          c.name: _toggles.contains(c.kind) ? c.initial != true : c.initial,
      };
      final read = {
        ...await _reads(tester, component, builder, defaults),
        ...await _reads(tester, component, builder, flipped),
      };
      expect([
        for (final c in controls)
          if (c.kind != 'width' && !read.contains(c.name)) c.name,
      ], isEmpty);
    });

    if (playgroundControls[component]!.any((c) => c['name'] == 'open')) {
      testWidgets('$component opens and closes from its `open` control', (
        tester,
      ) async {
        final state = await pumpPlayground(tester, component, builder);
        final routes = find.byType(ModalBarrier).evaluate().length;
        final floating = find.byType(CompositedTransformFollower).evaluate();
        // Shown: a route over the page (a dialog, a drawer, the Scrim), a menu open from its
        // anchor, or a surface floating beside its trigger (a tooltip, a popover, a coachmark).
        bool shown() =>
            find.byType(ModalBarrier).evaluate().length > routes ||
            find
                .byType(MenuAnchor)
                .evaluate()
                .any(
                  (e) => (e.widget as MenuAnchor).controller?.isOpen ?? false,
                ) ||
            find.byType(CompositedTransformFollower).evaluate().length >
                floating.length;
        expect(shown(), isFalse);
        state.updateQueryField(group: 'knobs', field: 'open', value: 'true');
        await settle(tester);
        expect(tester.takeException(), isNull);
        expect(shown(), isTrue);
        state.updateQueryField(group: 'knobs', field: 'open', value: 'false');
        await settle(tester);
        expect(tester.takeException(), isNull);
        expect(shown(), isFalse);
      });
    }
  }
}
