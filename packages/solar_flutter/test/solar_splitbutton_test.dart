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

Color face(WidgetTester tester) =>
    (tester
                .widget<Container>(
                  find
                      .descendant(
                        of: find.byKey(const Key('splitButton.root')),
                        matching: find.byType(Container),
                      )
                      .first,
                )
                .decoration!
            as BoxDecoration)
        .color!;

void main() {
  group('SolarSplitButton', () {
    testWidgets(
      'runs the action from one half and opens the menu from the other',
      (tester) async {
        var saved = 0;
        var menus = 0;
        await pump(
          tester,
          SolarSplitButton(
            label: 'Save',
            onPressed: () => saved++,
            onMenuPressed: () => menus++,
          ),
        );
        await tester.tap(find.text('Save'));
        await tester.tap(find.byKey(const Key('splitButton.trigger')));
        expect((saved, menus), (1, 1));
      },
    );

    testWidgets('the whole control takes the state of the half hovered', (
      tester,
    ) async {
      final states = WidgetStatesController();
      await pump(
        tester,
        SolarSplitButton(
          label: 'Save',
          onPressed: () {},
          onMenuPressed: () {},
          statesController: states,
        ),
      );
      expect(face(tester), light.actionPrimaryBgDefault);
      states.update(WidgetState.hovered, true);
      await tester.pump();
      expect(face(tester), light.actionPrimaryBgHover);
    });

    testWidgets('keeps its size while loading', (tester) async {
      await pump(
        tester,
        SolarSplitButton(label: 'Save', onPressed: () {}, onMenuPressed: () {}),
      );
      final resting = tester.getSize(find.byKey(const Key('splitButton.root')));
      await pump(
        tester,
        SolarSplitButton(
          label: 'Save',
          onPressed: () {},
          onMenuPressed: () {},
          loading: true,
        ),
      );
      expect(
        tester.getSize(find.byKey(const Key('splitButton.root'))),
        resting,
      );
      expect(find.byType(SolarSpinner), findsOneWidget);
    });
  });
}
