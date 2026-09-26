// What the Playground tests share: a Playground pumped through the real Widgetbook adapter, and the
// knobs' values read back from Widgetbook's URL state.

import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_widgetbook/main.dart' show solarTheme;
import 'package:solar_widgetbook/playground/adapter.dart';
import 'package:solar_widgetbook/playground/playground.dart';
import 'package:widgetbook/widgetbook.dart';

/// Pumps [component]'s Playground from [builder] inside a Widgetbook state, with the knobs panel's
/// inputs under it, much as Widgetbook's own knob tests do; returns the state. Where [shown] is
/// given, the use case is in the tree only while it holds, as a tester choosing another use case
/// takes it out while the app and its navigator stay.
Future<WidgetbookState> pumpPlayground(
  WidgetTester tester,
  String component,
  SolarPlaygroundBuilder builder, {
  ValueListenable<bool>? shown,
}) async {
  final state = WidgetbookState(
    queryParams: {},
    root: WidgetbookRoot(children: []),
  );
  final visible = shown ?? ValueNotifier(true);
  await tester.pumpWidget(
    MaterialApp(
      theme: solarTheme(SolarTheme.light, Brightness.light),
      home: Scaffold(
        body: WidgetbookScope(
          state: state,
          child: Builder(
            builder: (context) => SingleChildScrollView(
              // A Column builds its children in order, so the panel sees the knobs the use case
              // registered.
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Keyed by the URL, as Widgetbook's UseCaseBuilder is: every knob change
                  // builds the use case afresh.
                  ValueListenableBuilder(
                    valueListenable: visible,
                    builder: (context, visible, _) => visible
                        ? KeyedSubtree(
                            key: ValueKey(WidgetbookState.of(context).uri),
                            child: Builder(
                              builder: (context) =>
                                  solarPlayground(context, component, builder),
                            ),
                          )
                        : const SizedBox.shrink(),
                  ),
                  // The knobs panel's inputs, without its themed frame (WidgetbookTheme is
                  // private).
                  Builder(
                    builder: (context) => Column(
                      children: [
                        for (final knob in WidgetbookState.of(
                          context,
                        ).knobs.values)
                          for (final field in knob.fields)
                            field.build(context, 'knobs'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    ),
  );
  return state;
}

Map<String, String> knobsOf(WidgetbookState state) =>
    FieldCodec.decodeQueryGroup(state.queryParams['knobs']);

/// Lets a route's transition finish, in fixed steps: pumpAndSettle would not return while an
/// overlay's Skeleton pulses.
Future<void> settle(WidgetTester tester) async {
  for (var i = 0; i < 10; i++) {
    await tester.pump(const Duration(milliseconds: 100));
  }
}

/// Every font solar_flutter bundles, from the font manifest, under the name a style asks for it by
/// (`packages/solar_flutter/Inter`), as the visual checks load them (test/visual/harness.dart).
/// Without them a test lays text out in its own font, whose every glyph is a square, so a part of a
/// fixed width (a Time Axis Label's rail, a Calendar Day Cell's date pill) overflows where SOLAR's
/// font fits.
Future<void> loadBundledFonts() async {
  final manifest =
      jsonDecode(await rootBundle.loadString('FontManifest.json')) as List;
  for (final family in manifest.cast<Map<String, dynamic>>()) {
    final name = family['family'] as String;
    if (!name.startsWith('packages/solar_flutter/')) continue;
    final loader = FontLoader(name);
    for (final font in (family['fonts'] as List).cast<Map<String, dynamic>>()) {
      loader.addFont(rootBundle.load(font['asset'] as String));
    }
    await loader.load();
  }
}
