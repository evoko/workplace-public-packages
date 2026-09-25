// The SOLAR buttons' component themes (lib/src/solar_button_themes.dart): an app's style, in its
// ThemeData's extensions, is merged over the recipe, what it sets winning and what it leaves unset
// staying the recipe's.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(
  WidgetTester tester,
  Widget child, [
  List<ThemeExtension<dynamic>> more = const [],
]) async {
  await tester.pumpWidget(
    MaterialApp(
      theme: ThemeData(extensions: [SolarTheme.light, ...more]),
      home: Scaffold(body: Center(child: child)),
    ),
  );
  // Past MaterialApp's animation from one theme to the next.
  await tester.pumpAndSettle();
}

const red = Color(0xFFFF0000);

void main() {
  testWidgets(
    'a SolarButton takes the app’s SolarButtonThemeData over its recipe',
    (tester) async {
      final button = SolarButton(onPressed: () {}, child: const Text('Go'));
      await pump(tester, button);
      final recipe = tester
          .widget<FilledButton>(find.byType(FilledButton))
          .style!;
      await pump(tester, button, [
        const SolarButtonThemeData(
          style: ButtonStyle(backgroundColor: WidgetStatePropertyAll(red)),
        ),
      ]);
      final themed = tester
          .widget<FilledButton>(find.byType(FilledButton))
          .style!;
      expect(themed.backgroundColor!.resolve({}), red);
      // What the app leaves unset is the recipe's.
      expect(themed.padding!.resolve({}), recipe.padding!.resolve({}));
      expect(
        themed.foregroundColor!.resolve({}),
        recipe.foregroundColor!.resolve({}),
      );
    },
  );

  testWidgets('an Icon Button, a FAB and a BackButton take theirs', (
    tester,
  ) async {
    for (final (widget, theme) in [
      (
        SolarIconButton(
          onPressed: () {},
          icon: const SolarIcon(SolarIcons.plusOutline),
          semanticLabel: 'Add',
        ),
        const SolarIconButtonThemeData(
          style: ButtonStyle(backgroundColor: WidgetStatePropertyAll(red)),
        ),
      ),
      (
        SolarFAB(
          onPressed: () {},
          icon: const SolarIcon(SolarIcons.plusOutline),
          semanticLabel: 'Add',
        ),
        const SolarFABThemeData(
          style: ButtonStyle(backgroundColor: WidgetStatePropertyAll(red)),
        ),
      ),
      (
        SolarBackButton(onPressed: () {}),
        const SolarBackButtonThemeData(
          style: ButtonStyle(backgroundColor: WidgetStatePropertyAll(red)),
        ),
      ),
    ]) {
      await pump(tester, widget, [theme as ThemeExtension<dynamic>]);
      final style = tester
          .widget<ButtonStyleButton>(
            find.byWidgetPredicate((w) => w is ButtonStyleButton),
          )
          .style!;
      expect(style.backgroundColor!.resolve({}), red, reason: '$widget');
    }
  });
}
