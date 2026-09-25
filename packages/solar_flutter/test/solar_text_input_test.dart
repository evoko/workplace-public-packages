import 'package:flutter/gestures.dart';
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

const colors = SolarTheme.light;

/// The words' ink, as the TextField paints them.
Color? ink(WidgetTester tester) =>
    tester.widget<EditableText>(find.byType(EditableText)).style.color;

/// The field's edge.
Color edge(WidgetTester tester) {
  final box =
      tester
              .widget<Container>(
                find
                    .descendant(
                      of: find.byKey(const Key('textInput.field')),
                      matching: find.byType(Container),
                    )
                    .first,
              )
              .decoration!
          as BoxDecoration;
  return (box.border! as Border).top.color;
}

void main() {
  group('SolarTextInput', () {
    testWidgets('draws its words as the value’s once it holds any', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTextInput(label: 'Name', placeholder: 'Ada'),
      );
      expect(ink(tester), colors.colors.textTertiary);
      await tester.enterText(find.byType(TextField), 'Grace');
      await tester.pump();
      expect(ink(tester), colors.colors.textPrimary);
    });

    testWidgets(
      'focuses its words on a tap anywhere in the field, and rings it',
      (tester) async {
        await pump(tester, const SolarTextInput(label: 'Name'));
        final field = find.byKey(const Key('textInput.field'));
        // In the field's padding, before its words.
        await tester.tapAt(tester.getTopLeft(field) + const Offset(4, 20));
        await tester.pump();
        expect(tester.testTextInput.hasAnyClients, true);
        expect(edge(tester), colors.colors.borderFeedbackFocusStrong);
      },
    );

    testWidgets(
      'an sm field is reached from just above it, within its target',
      (tester) async {
        await pump(
          tester,
          const SolarTextInput(label: 'Name', size: SolarTextInputSize.sm),
        );
        final field = find.byKey(const Key('textInput.field'));
        expect(tester.getSize(field).height, 32);
        // 5px above the drawn field: in the 44px target, in the gap under the label.
        await tester.tapAt(tester.getTopLeft(field) + const Offset(40, -5));
        await tester.pump();
        expect(tester.testTextInput.hasAnyClients, true);
      },
    );

    testWidgets('is hovered as the field is', (tester) async {
      await pump(tester, const SolarTextInput(label: 'Name'));
      final mouse = await tester.createGesture(kind: PointerDeviceKind.mouse);
      await mouse.addPointer(location: Offset.zero);
      addTearDown(mouse.removePointer);
      final field = find.byKey(const Key('textInput.field'));
      await mouse.moveTo(tester.getTopLeft(field) + const Offset(4, 20));
      await tester.pump();
      expect(edge(tester), colors.colors.borderMedium);
    });

    testWidgets('reads as one text field, named by its label and its helper', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarTextInput(
          label: 'Name',
          mandatory: true,
          helper: 'As on your ID',
          trailingIcon: SolarIconButton(
            semanticLabel: 'Clear',
            size: SolarIconButtonSize.sm,
            icon: const Icon(Icons.close),
            onPressed: () {},
          ),
        ),
      );
      // The star, the label and the helper are not read twice, beside the field.
      expect(find.bySemanticsLabel('*'), findsNothing);
      expect(find.bySemanticsLabel('As on your ID'), findsNothing);
      // A control in the field (a clear button) stays its own.
      expect(
        // By its name: the button keeps its own size inside a box that may be wider.
        tester.getSemantics(find.bySemanticsLabel('Clear')),
        matchesSemantics(
          label: 'Clear',
          isButton: true,
          hasTapAction: true,
          hasFocusAction: true,
          isEnabled: true,
          hasEnabledState: true,
          isFocusable: true,
        ),
      );
      expect(
        tester.getSemantics(find.byType(TextField)),
        isSemantics(
          isTextField: true,
          label: 'Name',
          hint: 'As on your ID',
          isEnabled: true,
          hasEnabledState: true,
          isFocusable: true,
          hasTapAction: true,
          hasFocusAction: true,
        ),
      );
      handle.dispose();
    });

    testWidgets('a disabled field takes no focus; one in error says so below', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarTextInput(label: 'Name', helper: 'Required', enabled: false),
      );
      await tester.tap(find.byKey(const Key('textInput.field')));
      await tester.pump();
      expect(tester.testTextInput.hasAnyClients, false);
      await pump(
        tester,
        const SolarTextInput(label: 'Name', helper: 'Required', error: true),
      );
      expect(
        tester.widget<Text>(find.text('Required')).style!.color,
        colors.colors.textFeedbackDanger,
      );
    });

    testWidgets('draws no label, helper or icon where none is given', (
      tester,
    ) async {
      await pump(tester, const SolarTextInput());
      for (final part in ['label', 'helper', 'leadingIcon', 'trailingIcon']) {
        expect(find.byKey(Key('textInput.$part')), findsNothing, reason: part);
      }
    });
  });
}
