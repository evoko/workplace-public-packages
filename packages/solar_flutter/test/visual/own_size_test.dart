// A widget keeps its own size where its parent stretches it. A ListView makes every child as wide
// as the list, a Column with CrossAxisAlignment.stretch as wide as the column, a SizedBox as big as
// itself: a Checkbox there is still 16px and a Tag still hugs its words, as Figma draws them. The
// visual check pumps each case where it is free to size itself, and cannot see this; this pumps
// each variant again in a parent that forces a size on it, and asks for the same root, on every
// axis the component does not fill (Figma's FILL, in its IR).

import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'cases/cases.dart';
import 'harness.dart';

final oracles = loadOracles();

/// `Icon Button` to `icon-button`, as the IR files are named.
String irFileOf(String component) =>
    component.toLowerCase().replaceAll(RegExp('[^a-z0-9]+'), '-');

/// Whether any entry of the IR sizes the root to fill [cell] (`width`, `height`).
bool fills(String component, String cell) {
  final ir = jsonDecode(
    File('../../spec/components/${irFileOf(component)}.json')
        .readAsStringSync(),
  ) as Map<String, dynamic>;
  final root = (ir['style'] as Map<String, dynamic>)['root'] as Map?;
  var found = false;
  void walk(Object? node) {
    if (node is! Map) return;
    final entry = node[cell];
    if (entry is Map && entry['keyword'] == 'FILL') found = true;
    for (final v in node.values) {
      walk(v);
    }
  }

  walk(root);
  return found;
}

void main() {
  setUpAll(loadBundledFonts);

  for (final component in oracles.keys.where(cases.containsKey)) {
    testWidgets('$component keeps its own size where its parent stretches it', (
      tester,
    ) async {
      tester.view.physicalSize = const Size(2400, 2400);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      final kase = cases[component]!;
      final oracle = oracles[component]!;
      // Every widget, those on Flutter's own buttons too, which Flutter would stretch (owner
      // decision 2026-09-25: Figma's size wherever it is put).
      final width = !fills(component, 'width');
      final height = !fills(component, 'height');
      final wrong = <String>[];
      for (final v
          in (oracle['variants'] as List).cast<Map<String, dynamic>>()) {
        Future<Map<String, Object?>?> rootIn(
          Widget Function(Widget) put,
        ) async {
          await pump(
            tester,
            put(kase.build(v, WidgetStatesController(), oracle)),
          );
          return kase.measure(tester)['root'];
        }

        final free = await rootIn((w) => w);
        if (free == null) continue;
        // As big as a list or a stretched column makes it, larger than any SOLAR component, on the
        // axes it does not fill; on one it fills, the size it has free, so a card's words wrap
        // as they did.
        final forced = await rootIn(
          (w) => SizedBox(
            width: width ? 2000 : free['width'] as double?,
            height: height ? 2000 : free['height'] as double?,
            child: w,
          ),
        );
        if (forced == null) continue;
        for (final (axis, keeps) in [('width', width), ('height', height)]) {
          if (!keeps) continue;
          final a = free[axis] as double?;
          final b = forced[axis] as double?;
          if (a != null && b != null && (a - b).abs() > 0.5) {
            wrong.add('${v['figma']}: $axis $a, stretched $b');
          }
        }
      }
      expect(wrong, isEmpty, reason: wrong.join('\n'));
    });
  }
}
