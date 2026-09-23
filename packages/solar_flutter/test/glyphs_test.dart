import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';
import 'package:solar_flutter/src/svg_path.dart';

void main() {
  test('every generated glyph path parses', () {
    for (final glyph in SolarSpinnerRecipe.glyphs) {
      for (final path in [...glyph.fill, ...glyph.stroke]) {
        expect(() => parseSvgPath(path.d), returnsNormally, reason: path.d);
      }
      expect(glyph.width, greaterThan(0));
    }
  });

  test('a layer’s glyph follows its props', () {
    const rest = <WidgetState>{};
    final sm = SolarSpinnerRecipe.glyph(
      'indicator',
      const SolarSpinnerProps(size: SolarSpinnerSize.sm),
      rest,
    );
    final lg = SolarSpinnerRecipe.glyph(
      'indicator',
      const SolarSpinnerProps(size: SolarSpinnerSize.lg),
      rest,
    );
    expect(sm, isNotNull);
    expect(lg!.width, greaterThan(sm!.width));
    expect(
      SolarSpinnerRecipe.glyph('track', const SolarSpinnerProps(), rest),
      isNull,
    );
  });

  testWidgets('a glyph paints with the icons’ painter', (tester) async {
    final glyph = SolarSpinnerRecipe.glyphs.first;
    await tester.pumpWidget(
      Center(
        child: CustomPaint(
          size: const Size.square(24),
          painter: SolarVectorPainter(
            glyph.strokeVector,
            const Color(0xff000000),
          ),
        ),
      ),
    );
    expect(tester.takeException(), isNull);
  });
}
