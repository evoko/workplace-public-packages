import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'spinner.dart';

const backButtonCase = VisualCase(
  build: buildBackButton,
  measure: measureBackButton,
);

/// Every oracle layer, measured from the pumped SolarBackButton, as SolarButton's are.
Layers measureBackButton(WidgetTester tester) {
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
  final arrow = find.byKey(const Key('iconArrowLeft'));
  final icon = tester.widget<SolarIcon>(
    find.descendant(of: arrow, matching: find.byType(SolarIcon)),
  );
  Visibility visibilityOf(Finder f) => tester.widget<Visibility>(
    find.ancestor(of: f, matching: find.byType(Visibility)).first,
  );
  final label = find.text('Back');
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
      'gap': tester.getRect(label).left - tester.getRect(arrow).right,
      'width': root.width,
      'height': root.height,
    },
    'iconArrowLeft': {
      'color': icon.color,
      'width': tester.getSize(arrow).width,
      'height': tester.getSize(arrow).height,
      'drawn': visibilityOf(arrow).visible,
    },
    'label': {
      ...paragraphValues(tester.renderObject<RenderParagraph>(label)),
      'drawn': visibilityOf(label).visible,
    },
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
