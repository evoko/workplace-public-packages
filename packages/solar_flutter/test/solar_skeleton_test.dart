import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

const light = SolarColors.light;

Future<void> pump(WidgetTester tester, Widget child, {bool still = false}) =>
    tester.pumpWidget(
      MaterialApp(
        theme: ThemeData(extensions: const [SolarTheme.light]),
        home: MediaQuery(
          data: MediaQueryData(disableAnimations: still),
          child: Scaffold(body: Center(child: child)),
        ),
      ),
    );

Finder root() => find.byKey(const Key('skeleton.root'));

void main() {
  group('SolarSkeleton', () {
    testWidgets('is Figma’s size for its type, or the content’s', (
      tester,
    ) async {
      await pump(tester, const SolarSkeleton(type: SolarSkeletonType.circle));
      expect(tester.getSize(root()), const Size(24, 24));
      await pump(tester, const SolarSkeleton(width: 64));
      expect(tester.getSize(root()), const Size(64, 12));
    });

    testWidgets('pulses, and not at all where animation is disabled', (
      tester,
    ) async {
      FadeTransition fade() => tester.widget<FadeTransition>(
        find.descendant(
          of: find.byType(SolarSkeleton),
          matching: find.byType(FadeTransition),
        ),
      );
      await pump(tester, const SolarSkeleton());
      await tester.pump(SolarMotion.durationSlower ~/ 2);
      expect(fade().opacity.value, lessThan(1));
      await pump(tester, const SolarSkeleton(), still: true);
      await tester.pump(SolarMotion.durationSlower ~/ 2);
      expect(fade().opacity.value, 1);
    });
  });
}
