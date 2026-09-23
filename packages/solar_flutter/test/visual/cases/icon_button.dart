import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'spinner.dart';

const iconButtonCase = VisualCase(
  build: buildIconButton,
  measure: measureIconButton,
);

/// Every oracle layer, measured from the pumped SolarIconButton.
Layers measureIconButton(WidgetTester tester) {
  final inButton = find.byType(IconButton);
  final faceFinder = find
      .descendant(of: inButton, matching: find.byType(DecoratedBox))
      .first;
  final face =
      tester.widget<DecoratedBox>(faceFinder).decoration as BoxDecoration;
  final shape =
      tester
              .widget<Material>(
                find
                    .descendant(of: inButton, matching: find.byType(Material))
                    .first,
              )
              .shape!
          as OutlinedBorder;
  final padding = tester
      .widgetList<Padding>(
        find.descendant(of: inButton, matching: find.byType(Padding)),
      )
      .firstWhere((p) => p.child is Align)
      .padding
      .resolve(TextDirection.ltr);
  final root = tester.getRect(faceFinder);
  final probe = find.byKey(const Key('icon'));
  final painted = tester.widget<ColoredBox>(
    find.descendant(of: probe, matching: find.byType(ColoredBox)),
  );
  final visibility = tester.widget<Visibility>(
    find.ancestor(of: probe, matching: find.byType(Visibility)),
  );
  final spinners = find.byType(SolarSpinner);

  return {
    'root': {
      'background': face.color ?? Colors.transparent,
      'borderColor': shape.side.color,
      'borderWidth': shape.side.style == BorderStyle.none
          ? 0.0
          : shape.side.width,
      'radius': (face.borderRadius as BorderRadius?)?.topLeft.x ?? 0.0,
      'shadow': face.boxShadow ?? const <BoxShadow>[],
      'paddingTop': padding.top,
      'paddingRight': padding.right,
      'paddingBottom': padding.bottom,
      'paddingLeft': padding.left,
      // One child, so nothing is spaced: what is drawn between children is nothing.
      'gap': 0.0,
      'width': root.width,
      'height': root.height,
    },
    'icon': {
      'color': painted.color,
      'width': tester.getSize(probe).width,
      'height': tester.getSize(probe).height,
      'drawn': visibility.visible,
    },
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
