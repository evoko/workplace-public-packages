import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

/// A Number Input that keeps what it is given, as its caller would.
class Held extends StatefulWidget {
  const Held({super.key, this.stepper = SolarNumberInputStepper.inline});

  final SolarNumberInputStepper stepper;

  @override
  State<Held> createState() => HeldState();
}

class HeldState extends State<Held> {
  num? value = 9;

  @override
  Widget build(BuildContext context) => SolarNumberInput(
    stepper: widget.stepper,
    label: 'Seats',
    value: value,
    min: 0,
    max: 10,
    onChanged: (v) => setState(() => value = v),
  );
}

void main() {
  group('SolarNumberInput', () {
    testWidgets('steps with its plus and minus, no further than its max', (
      tester,
    ) async {
      await pump(tester, const Held());
      final state = tester.state<HeldState>(find.byType(Held));
      await tester.tap(find.byKey(const Key('numberInput.fieldIncrement')));
      await tester.pump();
      expect(state.value, 10);
      expect(find.text('10'), findsOneWidget);
      await tester.tap(find.byKey(const Key('numberInput.fieldIncrement')));
      await tester.pump();
      expect(state.value, 10);
      await tester.tap(find.byKey(const Key('numberInput.fieldDecrement')));
      await tester.pump();
      expect(state.value, 9);
    });

    testWidgets('steps with the arrow keys, and takes what is typed', (
      tester,
    ) async {
      await pump(tester, const Held(stepper: SolarNumberInputStepper.side));
      final state = tester.state<HeldState>(find.byType(Held));
      await tester.tap(find.byType(TextField));
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.pump();
      expect(state.value, 8);
      await tester.enterText(find.byType(TextField), '4');
      await tester.pump();
      expect(state.value, 4);
      await tester.tap(find.byKey(const Key('numberInput.stepperIncrement')));
      await tester.pump();
      expect(state.value, 5);
    });

    testWidgets('names its steppers, each its own control', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const Held());
      expect(
        tester.getSemantics(
          find.byKey(const Key('numberInput.fieldIncrement')),
        ),
        isSemantics(label: 'Increase', isButton: true, hasTapAction: true),
      );
      handle.dispose();
    });
  });
}
