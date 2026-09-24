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
Layers measureIconButton(WidgetTester tester) =>
    measureIconButtonAt(tester, find.byType(SolarIconButton));

/// Every oracle layer of the SolarIconButton [at] (one of a Text Area's), measured from it.
Layers measureIconButtonAt(WidgetTester tester, Finder at) {
  Finder inside(Finder f) => find.descendant(of: at, matching: f);
  final inButton = inside(find.byType(IconButton));
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
  // The check's probe, painted in the colour the button gives its icon; or a SOLAR icon, which a
  // component drawing Icon Buttons of its own gives it (Inline Input's), in its icon theme's.
  final probed = inside(find.byKey(const Key('icon')));
  final probe = probed.evaluate().isNotEmpty
      ? probed
      : inside(find.byType(SolarIcon)).first;
  final colour = probed.evaluate().isNotEmpty
      ? tester
            .widget<ColoredBox>(
              find.descendant(of: probe, matching: find.byType(ColoredBox)),
            )
            .color
      : tester.widget<SolarIcon>(probe).color ??
            IconTheme.of(tester.element(probe)).color;
  // The button's own, the nearest: a component around it may hide it too (Inline Input's edit).
  final visibility = tester.widget<Visibility>(
    find.ancestor(of: probe, matching: find.byType(Visibility)).first,
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
      // One child, so nothing is spaced: what is drawn between children is nothing.
      'gap': 0.0,
      'width': root.width,
      'height': root.height,
    },
    'icon': {
      'color': colour,
      'width': tester.getSize(probe).width,
      'height': tester.getSize(probe).height,
      'drawn': visibility.visible,
    },
    'spinner': spinners.evaluate().isEmpty
        ? {'drawn': false}
        : {'drawn': true, 'layers': spinnerLayers(tester, spinners)},
  };
}
