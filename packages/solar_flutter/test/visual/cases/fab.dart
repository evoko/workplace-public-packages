import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'spinner.dart';

const fabCase = VisualCase(build: buildFAB, measure: measureFAB);

/// Every oracle layer, measured from the pumped SolarFAB, as SolarButton's are.
Layers measureFAB(WidgetTester tester) {
  final inButton = find.byType(FilledButton);
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
  Visibility visibilityOf(Finder f) => tester.widget<Visibility>(
    find.ancestor(of: f, matching: find.byType(Visibility)).first,
  );
  final label = find.text('Label');
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
      // Between the icon and the label; an icon FAB spaces nothing.
      'gap': label.evaluate().isEmpty
          ? 0.0
          : tester.getRect(label).left - tester.getRect(probe).right,
      'width': root.width,
      'height': root.height,
    },
    'icon': {
      'color': painted.color,
      'width': tester.getSize(probe).width,
      'height': tester.getSize(probe).height,
      'drawn': visibilityOf(probe).visible,
    },
    if (label.evaluate().isNotEmpty)
      'label': {
        ...textValues(tester.renderObject<RenderParagraph>(label).text.style!),
        'drawn': visibilityOf(label).visible,
      },
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
