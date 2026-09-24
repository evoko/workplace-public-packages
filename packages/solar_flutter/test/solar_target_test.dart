import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, {
  MaterialTapTargetSize tap = MaterialTapTargetSize.padded,
}) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(
      extensions: const [SolarTheme.light],
      materialTapTargetSize: tap,
    ),
    home: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  testWidgets(
    'a control on its own takes a 44 × 44 target on touch, drawn at its own size',
    (tester) async {
      bool? asked;
      await pump(tester, SolarCheckbox(onChanged: (v) => asked = v));
      expect(tester.getSize(find.byType(SolarCheckbox)), const Size(44, 44));
      expect(
        tester.getSize(find.byKey(const Key('checkbox.root'))),
        const Size(16, 16),
      );
      // Near the target's corner, far outside the drawn box: still the checkbox.
      final corner = tester.getTopLeft(find.byType(SolarCheckbox));
      await tester.tapAt(corner + const Offset(2, 2));
      expect(asked, true);
    },
  );

  testWidgets(
    'it takes no more room than it is drawn where the theme does not pad targets',
    (tester) async {
      await pump(
        tester,
        SolarCheckbox(onChanged: (_) {}),
        tap: MaterialTapTargetSize.shrinkWrap,
      );
      expect(tester.getSize(find.byType(SolarCheckbox)), const Size(16, 16));
    },
  );

  testWidgets(
    'a part of another component is hit past its own box, within the component',
    (tester) async {
      var closed = 0;
      await pump(tester, SolarTag(label: 'Room A', onClose: () => closed++));
      final close = tester.getRect(find.byKey(const Key('tag.iconClose')));
      final tag = tester.getRect(find.byKey(const Key('tag.root')));
      // Above the 12px close button, still inside the 24px tag.
      final above = Offset(close.center.dx, (tag.top + close.top) / 2);
      expect(close.contains(above), isFalse);
      await tester.tapAt(above);
      expect(closed, 1);
    },
  );

  test('the target is WCAG’s 44', () => expect(solarTargetSize, 44));
}
