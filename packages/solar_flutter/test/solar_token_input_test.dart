import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 400, child: child)),
    ),
  ),
);

/// A Token Input that keeps its entries, as its caller would.
class Held extends StatefulWidget {
  const Held({super.key});

  @override
  State<Held> createState() => HeldState();
}

class HeldState extends State<Held> {
  var value = <String>['Ada'];

  @override
  Widget build(BuildContext context) => SolarTokenInput(
    label: 'People',
    value: value,
    onChanged: (v) => setState(() => value = v),
  );
}

void main() {
  group('SolarTokenInput', () {
    testWidgets(
      'adds what is typed, and removes an entry by its close button',
      (tester) async {
        await pump(tester, const Held());
        final state = tester.state<HeldState>(find.byType(Held));
        await tester.enterText(find.byType(TextField), 'Grace');
        await tester.testTextInput.receiveAction(TextInputAction.done);
        await tester.pump();
        expect(state.value, ['Ada', 'Grace']);
        expect(find.byType(SolarTag), findsNWidgets(2));
        await tester.tap(find.bySemanticsLabel(RegExp('Remove.*Ada')));
        await tester.pump();
        expect(state.value, ['Grace']);
      },
    );

    testWidgets('Backspace in the empty input removes the last entry', (
      tester,
    ) async {
      await pump(tester, const Held());
      final state = tester.state<HeldState>(find.byType(Held));
      await tester.tap(find.byType(TextField));
      await tester.sendKeyEvent(LogicalKeyboardKey.backspace);
      await tester.pump();
      expect(state.value, isEmpty);
    });

    testWidgets(
      'counts the entries past maxVisible, and read-only draws no input',
      (tester) async {
        await pump(
          tester,
          const SolarTokenInput(
            value: ['a', 'b', 'c'],
            maxVisible: 1,
            readonly: true,
          ),
        );
        expect(find.byType(SolarTag), findsOneWidget);
        expect(find.byType(SolarCounter), findsOneWidget);
        expect(find.byType(TextField), findsNothing);
      },
    );
  });
}
