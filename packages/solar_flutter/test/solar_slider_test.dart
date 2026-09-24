import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 200, child: child)),
    ),
  ),
);

void main() {
  group('SolarSlider', () {
    testWidgets('is announced as a slider at its value', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarSlider(value: 0.3, onChanged: (_) {}, semanticLabel: 'Volume'),
      );
      expect(
        tester.getSemantics(find.byKey(const Key('slider.handle'))),
        isSemantics(
          isSlider: true,
          label: 'Volume',
          value: '30%',
          increasedValue: '40%',
          decreasedValue: '20%',
          hasIncreaseAction: true,
          hasDecreaseAction: true,
        ),
      );
      handle.dispose();
    });

    testWidgets('moves to where it is tapped, and by a step for an arrow key', (
      tester,
    ) async {
      double? asked;
      await pump(tester, SolarSlider(value: 0.5, onChanged: (v) => asked = v));
      final root = tester.getTopLeft(find.byKey(const Key('slider.root')));
      await tester.tapAt(root + const Offset(50, 10));
      expect(asked, closeTo(0.25, 0.001));
      await tester.sendKeyEvent(LogicalKeyboardKey.tab);
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowRight);
      expect(asked, closeTo(0.6, 0.001));
    });

    testWidgets('places the fill and handle at the value, on min to max', (
      tester,
    ) async {
      await pump(
        tester,
        SolarSlider(value: 75, min: 50, max: 100, onChanged: (_) {}),
      );
      expect(tester.getSize(find.byKey(const Key('slider.fill'))).width, 100);
      final root = tester.getTopLeft(find.byKey(const Key('slider.root')));
      final handle = tester.getCenter(find.byKey(const Key('slider.handle')));
      expect(handle.dx - root.dx, 100);
    });

    testWidgets('does nothing, and is drawn disabled, with nothing to do', (
      tester,
    ) async {
      await pump(tester, const SolarSlider(value: 0.5, onChanged: null));
      expect(
        tester.getSize(find.byKey(const Key('slider.handle'))),
        const Size(14, 14),
      );
    });
  });

  group('SolarSliderRange', () {
    testWidgets('moves the end nearest the tap, never past the other', (
      tester,
    ) async {
      RangeValues? asked;
      await pump(
        tester,
        SolarSliderRange(
          values: const RangeValues(0.2, 0.6),
          onChanged: (v) => asked = v,
        ),
      );
      final root = tester.getTopLeft(find.byKey(const Key('sliderRange.root')));
      await tester.tapAt(root + const Offset(180, 10));
      expect(asked!.start, closeTo(0.2, 0.001));
      expect(asked!.end, closeTo(0.9, 0.001));
    });

    testWidgets('announces each end as a slider of its own', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarSliderRange(
          values: const RangeValues(0.2, 0.6),
          onChanged: (_) {},
          semanticLabels: ('Lowest', 'Highest'),
        ),
      );
      expect(
        tester.getSemantics(find.byKey(const Key('sliderRange.handle2'))),
        isSemantics(isSlider: true, label: 'Highest', value: '60%'),
      );
      handle.dispose();
    });
  });
}
