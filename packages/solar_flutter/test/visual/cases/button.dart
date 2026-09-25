import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../harness.dart';
import 'counter.dart';
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
  // The check's probes (a lead icon, Figma's "Label"), or a button a component draws itself with
  // its label alone (FileUpload's Browse).
  final leads = inside(find.byKey(const Key('lead')));
  final words = inside(find.text('Label')).evaluate().isNotEmpty
      ? inside(find.text('Label'))
      : inside(find.byType(Text)).first;
  final label = tester.getRect(words);
  // A label alone is spaced from nothing: its gap is the one the button spaces its parts by.
  double gap() {
    if (leads.evaluate().isNotEmpty) {
      return label.left - tester.getRect(leads).right;
    }
    final b = tester.widget<SolarButton>(inside(find.byType(SolarButton)));
    return SolarButtonRecipe.dimension(
          'root.gap',
          SolarButtonProps(size: b.size, variant: b.variant, danger: b.danger),
          const {},
        ) ??
        0;
  }

  Map<String, Object?> icon(String key) {
    final finder = inside(find.byKey(Key(key)));
    final painted = tester.widget<ColoredBox>(
      find.descendant(of: finder, matching: find.byType(ColoredBox)),
    );
    final size = tester.getSize(finder);
    return {'color': painted.color, 'width': size.width, 'height': size.height};
  }

  final visibility = tester.widget<Visibility>(
    find.ancestor(of: words, matching: find.byType(Visibility)).first,
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
      'gap': gap(),
      'width': root.width,
      'height': root.height,
    },
    'label': {
      ...paragraphValues(tester.renderObject<RenderParagraph>(words)),
      'drawn': visibility.visible,
    },
    // Where the button holds none (FileUpload's Browse), an icon or a counter is not drawn.
    'iconLeading': leads.evaluate().isEmpty ? {'drawn': false} : icon('lead'),
    'iconTrailing': inside(find.byKey(const Key('trail'))).evaluate().isEmpty
        ? {'drawn': false}
        : icon('trail'),
    // A composed Counter: its own layers, which the harness checks against the Counter oracle,
    // and the slot's box, which the recipe sizes, as the web measures .SolarButton-counter.
    'counter': inside(find.byType(SolarCounter)).evaluate().isEmpty
        ? {'drawn': false}
        : {
            'drawn': true,
            'layers': counterLayers(tester, inside(find.byType(SolarCounter))),
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
