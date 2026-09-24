import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 360, child: child)),
    ),
  ),
);

/// A row that says whether its list makes it compact.
class CompactProbe extends StatelessWidget {
  const CompactProbe({super.key});

  @override
  Widget build(BuildContext context) =>
      Text('${SolarListScope.compactOf(context)}');
}

void main() {
  group('SolarList', () {
    testWidgets('puts a divider between each two rows, unless told not', (
      tester,
    ) async {
      final rows = [
        for (final label in ['One', 'Two', 'Three'])
          SolarListItem(label: label, onPressed: () {}),
      ];
      await pump(tester, SolarList(children: rows));
      expect(find.byType(SolarDivider), findsNWidgets(2));
      await pump(tester, SolarList(dividers: false, children: rows));
      expect(find.byType(SolarDivider), findsNothing);
    });

    testWidgets('makes its rows compact outside a card, as Figma draws them', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarList(inCard: false, children: [CompactProbe()]),
      );
      expect(find.text('true'), findsOneWidget);
      await pump(tester, const SolarList(children: [CompactProbe()]));
      expect(find.text('false'), findsOneWidget);
    });
  });

  group('SolarListItem', () {
    testWidgets('calls onPressed, and is announced selected where it is', (
      tester,
    ) async {
      var opened = 0;
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarListItem(
          label: 'Wi-Fi',
          selected: true,
          onPressed: () => opened++,
        ),
      );
      await tester.tap(find.text('Wi-Fi'));
      expect(opened, 1);
      expect(
        tester.getSemantics(find.text('Wi-Fi')),
        isSemantics(isButton: true, isSelected: true),
      );
      handle.dispose();
    });
  });

  group('SolarOptionRow', () {
    testWidgets(
      'a tap on its words is its checkbox’s, and on a toggle row, its toggle’s',
      (tester) async {
        final changes = <bool>[];
        await pump(
          tester,
          SolarOptionRow<String>(
            label: 'Email me',
            supportingText: 'Weekly',
            onChanged: changes.add,
          ),
        );
        await tester.tap(find.text('Email me'));
        expect(changes, [true]);
        await pump(
          tester,
          SolarOptionRow<String>(
            control: SolarOptionRowControl.toggle,
            label: 'Wi-Fi',
            checked: true,
            onChanged: changes.add,
          ),
        );
        await tester.tap(find.text('Wi-Fi'));
        expect(changes, [true, false]);
      },
    );

    testWidgets('a radio row tells its group, which checks it', (tester) async {
      String? chosen;
      await pump(
        tester,
        RadioGroup<String>(
          groupValue: null,
          onChanged: (v) => chosen = v,
          child: const SolarOptionRow<String>(
            control: SolarOptionRowControl.radio,
            label: 'Daily',
            value: 'daily',
          ),
        ),
      );
      await tester.tap(find.text('Daily'));
      expect(chosen, 'daily');
    });
  });

  group('SolarOptionsList', () {
    testWidgets('is a group named by its label', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarOptionsList(
          label: 'Notifications',
          children: [SolarOptionRow<String>(label: 'Email', onChanged: (_) {})],
        ),
      );
      expect(find.bySemanticsLabel('Notifications'), findsOneWidget);
      handle.dispose();
    });
  });
}
