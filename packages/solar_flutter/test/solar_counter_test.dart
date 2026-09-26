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

Color pill(WidgetTester tester) =>
    (tester
                .widget<Container>(
                  find
                      .descendant(
                        of: find.byKey(const Key('counter.root')),
                        matching: find.byType(Container),
                      )
                      .first,
                )
                .decoration!
            as BoxDecoration)
        .color!;

void main() {
  group('SolarCounter', () {
    testWidgets('draws nothing at 0, and caps a long count at max', (
      tester,
    ) async {
      await pump(tester, const SolarCounter(count: 0));
      expect(find.byKey(const Key('counter.root')), findsNothing);
      await pump(tester, const SolarCounter(count: 120));
      expect(find.text('99+'), findsOneWidget);
    });

    testWidgets('given onPressed, it is a button of its own that hovers', (
      tester,
    ) async {
      final states = WidgetStatesController();
      var pressed = 0;
      await pump(
        tester,
        SolarCounter(
          count: 3,
          onPressed: () => pressed++,
          statesController: states,
        ),
      );
      expect(pill(tester), light.actionPrimaryBgDefault);
      states.update(WidgetState.hovered, true);
      await tester.pump();
      expect(pill(tester), light.actionPrimaryBgHover);
      await tester.tap(find.byType(SolarCounter));
      expect(pressed, 1);
    });

    testWidgets('in a SolarButton, it takes the button’s states', (
      tester,
    ) async {
      final states = WidgetStatesController();
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          prio: SolarButtonPrio.secondary,
          statesController: states,
          counter: const SolarCounter(count: 3),
          child: const Text('Inbox'),
        ),
      );
      expect(pill(tester), light.actionPrimaryBgDefault);
      states.update(WidgetState.hovered, true);
      await tester.pump();
      expect(pill(tester), light.actionPrimaryBgHover);
    });

    testWidgets('in a disabled SolarButton, it is disabled too', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarButton(
          onPressed: null,
          prio: SolarButtonPrio.secondary,
          counter: SolarCounter(count: 3),
          child: Text('Inbox'),
        ),
      );
      expect(pill(tester), light.actionPrimaryBgDisabled);
    });

    // Figma draws the Counter in a Button in a type of the Button's: inverted in a primary one,
    // regular in the others. The app passes a plain SolarCounter; the Button gives it the type.
    testWidgets(
      'in a primary SolarButton, it takes the recipe’s inverted type',
      (tester) async {
        await pump(
          tester,
          SolarButton(
            onPressed: () {},
            counter: const SolarCounter(count: 3),
            child: const Text('Inbox'),
          ),
        );
        expect(pill(tester), light.actionSecondaryBgDefault);
        expect(
          tester.widget<SolarCounter>(find.byType(SolarCounter)).type,
          isNull,
        );
      },
    );

    testWidgets('in a primary SolarButton, a type of its own wins', (
      tester,
    ) async {
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          counter: const SolarCounter(count: 3, type: SolarCounterType.danger),
          child: const Text('Inbox'),
        ),
      );
      expect(pill(tester), light.actionPrimaryBgDangerDefault);
    });
  });
}
