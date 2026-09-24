import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

const light = SolarColors.light;

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  group('SolarLink', () {
    testWidgets('is announced as a link, and follows it when tapped', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var followed = 0;
      await pump(
        tester,
        SolarLink(label: 'Release notes', onPressed: () => followed++),
      );
      expect(
        tester.getSemantics(find.byType(SolarLink)),
        matchesSemantics(
          isLink: true,
          hasEnabledState: true,
          isEnabled: true,
          hasTapAction: true,
          hasFocusAction: true,
          isFocusable: true,
          label: 'Release notes',
        ),
      );
      await tester.tap(find.text('Release notes'));
      expect(followed, 1);
      handle.dispose();
    });

    testWidgets(
      'draws its words in the link colour, and an icon only where given',
      (tester) async {
        await pump(tester, SolarLink(label: 'Docs', onPressed: () {}));
        expect(
          tester.widget<Text>(find.text('Docs')).style!.color,
          light.textLinkDefault,
        );
        expect(find.byKey(const Key('link.trailingIcon')), findsNothing);
        await pump(
          tester,
          SolarLink(
            label: 'Docs',
            onPressed: () {},
            trailingIcon: const Icon(Icons.open_in_new),
          ),
        );
        expect(find.byKey(const Key('link.trailingIcon')), findsOneWidget);
      },
    );
  });
}
