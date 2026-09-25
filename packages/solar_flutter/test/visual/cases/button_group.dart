import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'button.dart';

const buttonGroupCase = VisualCase(
  build: buildButtonGroup,
  measure: measureButtonGroup,
);

/// The group's frame, and each Button it holds by its layer, measured as the Button check measures
/// one.
Layers measureButtonGroup(
  WidgetTester tester, {
  Map<String, Finder> buttons = const {},
}) {
  final group = find.byType(SolarButtonGroup);
  final decoration =
      tester
              .widget<DecoratedBox>(
                find
                    .descendant(of: group, matching: find.byType(DecoratedBox))
                    .first,
              )
              .decoration
          as BoxDecoration;
  final border = decoration.border! as Border;
  final padding = tester
      .widget<Padding>(
        find.descendant(of: group, matching: find.byType(Padding)).first,
      )
      .padding
      .resolve(TextDirection.ltr);
  final flex = tester.widget<Flex>(
    find.descendant(of: group, matching: find.byType(Flex)).first,
  );
  double width(BorderSide s) => s.style == BorderStyle.none ? 0.0 : s.width;
  final sides = [border.top, border.right, border.bottom, border.left];
  final drawn = sides.where((s) => s.style != BorderStyle.none);

  // Each Button by its layer's key, or where the caller finds it (a ConfirmationDialog's own).
  Map<String, Object?> child(String layer) {
    final at = buttons[layer] ?? find.byKey(Key(layer));
    return at.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': measureButtonAt(tester, at)};
  }

  return {
    'root': {
      'background': decoration.color ?? Colors.transparent,
      'borderColor': drawn.isEmpty ? Colors.transparent : drawn.first.color,
      'borderWidth': drawn.isEmpty ? 0.0 : width(drawn.first),
      'borderTopWidth': width(border.top),
      'borderRightWidth': width(border.right),
      'borderBottomWidth': width(border.bottom),
      'borderLeftWidth': width(border.left),
      'radius': 0.0,
      'shadow': decoration.boxShadow ?? const <BoxShadow>[],
      'paddingTop': padding.top,
      'paddingRight': padding.right,
      'paddingBottom': padding.bottom,
      'paddingLeft': padding.left,
      'gap': flex.spacing,
    },
    for (final layer in ['tertiaryCTA', 'secondaryCTA', 'button3'])
      layer: child(layer),
  };
}
