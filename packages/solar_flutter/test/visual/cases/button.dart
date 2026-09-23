import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'spinner.dart';

const buttonCase = VisualCase(
  build: buildButton,
  measure: measureButton,
  layersAt: measureButtonAt,
);

/// Every oracle layer, measured from the pumped SolarButton.
Layers measureButton(WidgetTester tester) =>
    measureButtonAt(tester, find.byType(SolarButton));

/// Every oracle layer of the SolarButton at [at], alone or inside another widget (Button Group's).
Layers measureButtonAt(WidgetTester tester, Finder at) {
  Finder inside(Finder f) => find.descendant(of: at, matching: f);
  final inButton = inside(find.byType(FilledButton));
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
  final lead = tester.getRect(inside(find.byKey(const Key('lead'))));
  final label = tester.getRect(inside(find.text('Label')));
  Map<String, Object?> icon(String key) {
    final finder = inside(find.byKey(Key(key)));
    final painted = tester.widget<ColoredBox>(
      find.descendant(of: finder, matching: find.byType(ColoredBox)),
    );
    final size = tester.getSize(finder);
    return {'color': painted.color, 'width': size.width, 'height': size.height};
  }

  final visibility = tester.widget<Visibility>(
    find.ancestor(
      of: inside(find.text('Label')),
      matching: find.byType(Visibility),
    ),
  );
  final spinners = inside(find.byType(SolarSpinner));

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
      'gap': label.left - lead.right,
      'width': root.width,
      'height': root.height,
    },
    'label': {
      ...textValues(
        tester
            .renderObject<RenderParagraph>(inside(find.text('Label')))
            .text
            .style!,
      ),
      'drawn': visibility.visible,
    },
    'iconLeading': icon('lead'),
    'iconTrailing': icon('trail'),
    // The slot's box, which the recipe sizes, as the web measures .SolarButton-counter.
    'counter': {
      'height': tester
          .getSize(
            find
                .ancestor(
                  of: inside(find.byKey(const Key('counter'))),
                  matching: find.byType(SizedBox),
                )
                .first,
          )
          .height,
    },
    // A composed Spinner: its own layers, which the harness checks against the Spinner oracle.
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
