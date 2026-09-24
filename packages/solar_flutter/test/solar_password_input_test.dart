import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 240, child: child)),
    ),
  ),
);

bool obscured(WidgetTester tester) =>
    tester.widget<EditableText>(find.byType(EditableText)).obscureText;

void main() {
  group('SolarPasswordInput', () {
    testWidgets(
      'hides its words until the eye shows them, and hides them again',
      (tester) async {
        await pump(tester, const SolarPasswordInput(label: 'Password'));
        expect(obscured(tester), true);
        await tester.tap(find.byKey(const Key('passwordInput.icon')));
        await tester.pump();
        expect(obscured(tester), false);
        await tester.tap(find.byKey(const Key('passwordInput.icon')));
        await tester.pump();
        expect(obscured(tester), true);
      },
    );

    testWidgets('announces its eye as a toggle, and its link as a link', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var reset = 0;
      await pump(
        tester,
        SolarPasswordInput(
          label: 'Password',
          forgotPassword: 'Forgot password?',
          onForgotPassword: () => reset++,
        ),
      );
      expect(
        tester.getSemantics(find.byKey(const Key('passwordInput.icon'))),
        isSemantics(
          label: 'Show password',
          hasToggledState: true,
          isToggled: false,
        ),
      );
      expect(
        tester.getSemantics(find.text('Forgot password?')),
        isSemantics(label: 'Forgot password?', isLink: true),
      );
      await tester.tap(find.text('Forgot password?'));
      expect(reset, 1);
      handle.dispose();
    });
  });
}
