import 'package:flutter/material.dart';
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
  group('SolarTextArea', () {
    testWidgets('counts what is typed against its maxLength, and is filled', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTextArea(label: 'Notes', charCount: true, maxLength: 500),
      );
      expect(find.text('0/500'), findsOneWidget);
      await tester.enterText(find.byType(TextField), 'Hello');
      await tester.pump();
      expect(find.text('5/500'), findsOneWidget);
      expect(
        tester.widget<EditableText>(find.byType(EditableText)).style.color,
        SolarTheme.light.colors.textPrimary,
      );
    });

    testWidgets('its words fill the field, many lines tall', (tester) async {
      await pump(tester, const SolarTextArea(label: 'Notes'));
      final field = tester.getRect(find.byKey(const Key('textArea.field')));
      final words = tester.getRect(find.byType(TextField));
      expect(field.height, 120);
      // Inside the field's border and padding.
      expect(words.height, 120 - 2 * 12 - 2 * 1);
    });

    testWidgets(
      'pins the caller’s buttons in its bottom corners, each its own control',
      (tester) async {
        var sent = 0;
        await pump(
          tester,
          SolarTextArea(
            label: 'Message',
            cta: SolarIconButton(
              key: const Key('send'),
              semanticLabel: 'Send',
              size: SolarIconButtonSize.sm,
              icon: const Icon(Icons.send),
              onPressed: () => sent++,
            ),
            attachment: SolarIconButton(
              key: const Key('attach'),
              semanticLabel: 'Attach',
              prio: SolarIconButtonPrio.secondary,
              size: SolarIconButtonSize.sm,
              icon: const Icon(Icons.attach_file),
              onPressed: () {},
            ),
          ),
        );
        final field = tester.getRect(find.byKey(const Key('textArea.field')));
        // Where Figma draws them, 32 square, though Material pads each to 48 on touch: centred.
        final send = tester.getRect(find.byKey(const Key('textArea.cta')));
        final attach = tester.getRect(
          find.byKey(const Key('textArea.attachment')),
        );
        expect(send.size, const Size(32, 32));
        expect(tester.getCenter(find.byKey(const Key('send'))), send.center);
        expect(field.right - send.right, 8);
        expect(field.bottom - send.bottom, 8);
        expect(attach.left - field.left, 8);
        // Its target reaches past the drawn box, within the field: 5px below it.
        await tester.tapAt(send.bottomCenter + const Offset(0, 5));
        expect(sent, 1);
        await tester.tap(find.byKey(const Key('send')));
        expect(sent, 2);
        expect(tester.testTextInput.hasAnyClients, false);
      },
    );
  });
}
