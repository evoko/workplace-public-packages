// SolarTheme.of(context) and context.solar: how an app reaches SOLAR's colours and text styles in its
// own widgets, the way Theme.of(context) reaches Material's. Where the app installed no SolarTheme,
// the widgets' own fallback applies: Light or Dark by the app's brightness, at the Desktop scale.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

void main() {
  Future<SolarTheme> read(
    WidgetTester tester,
    ThemeData theme, {
    bool viaContext = false,
  }) async {
    late SolarTheme got;
    await tester.pumpWidget(
      MaterialApp(
        theme: theme,
        home: Builder(
          builder: (context) {
            got = viaContext ? context.solar : SolarTheme.of(context);
            return const SizedBox();
          },
        ),
      ),
    );
    return got;
  }

  testWidgets('is the SolarTheme the app installed', (tester) async {
    final installed = SolarTheme.resolve(
      brightness: Brightness.light,
      width: 400,
    );
    expect(
      await read(tester, ThemeData(extensions: [installed])),
      same(installed),
    );
  });

  // One brightness per test: pumping a second MaterialApp animates its theme from the first, so the
  // first frame would still be the old brightness.
  testWidgets('falls back to Dark for a dark app that installed none', (
    tester,
  ) async {
    expect(
      await read(tester, ThemeData(brightness: Brightness.dark)),
      same(SolarTheme.dark),
    );
  });

  testWidgets('falls back to Light for a light app that installed none', (
    tester,
  ) async {
    expect(await read(tester, ThemeData()), same(SolarTheme.light));
  });

  testWidgets('is what context.solar gives', (tester) async {
    expect(
      await read(
        tester,
        ThemeData(brightness: Brightness.dark),
        viaContext: true,
      ),
      same(SolarTheme.dark),
    );
  });

  testWidgets('reaches SOLAR colours and text styles by their names', (
    tester,
  ) async {
    final theme = await read(tester, ThemeData(), viaContext: true);
    expect(theme.colors.surfaceRaised, SolarColors.light.surfaceRaised);
    expect(theme.typography.titleSm, SolarTypography.desktop.titleSm);
  });
}
