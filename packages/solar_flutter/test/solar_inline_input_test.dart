import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 280, child: child)),
    ),
  ),
);

void main() {
  group('SolarInlineInput', () {
    testWidgets('opens on a tap, and Enter confirms what is typed', (
      tester,
    ) async {
      String? confirmed;
      await pump(
        tester,
        SolarInlineInput(
          value: 'Room 4',
          label: 'name',
          onConfirm: (v) {
            confirmed = v;
            return null;
          },
        ),
      );
      expect(find.byType(TextField), findsNothing);
      await tester.tap(find.text('Room 4'));
      await tester.pump();
      expect(find.byType(TextField), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'Room 5');
      await tester.testTextInput.receiveAction(TextInputAction.done);
      await tester.pump();
      expect(confirmed, 'Room 5');
      expect(find.byType(TextField), findsNothing);
    });

    testWidgets(
      'stays open where the caller rejects it, and Esc discards the edit',
      (tester) async {
        var cancelled = 0;
        await pump(
          tester,
          SolarInlineInput(
            value: 'Room 4',
            defaultEditing: true,
            onConfirm: (_) => false,
            onCancel: () => cancelled++,
          ),
        );
        await tester.tap(find.bySemanticsLabel('Confirm'));
        await tester.pump();
        expect(find.byType(TextField), findsOneWidget);
        await tester.tap(find.byType(TextField));
        await tester.sendKeyEvent(LogicalKeyboardKey.escape);
        await tester.pump();
        expect(cancelled, 1);
        expect(find.byType(TextField), findsNothing);
        expect(find.text('Room 4'), findsOneWidget);
      },
    );

    testWidgets('names its edit button for what it edits', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarInlineInput(
          value: 'Room 4',
          label: 'name',
          onConfirm: (_) => null,
        ),
      );
      expect(find.bySemanticsLabel('Edit name'), findsOneWidget);
      handle.dispose();
    });
  });
}
