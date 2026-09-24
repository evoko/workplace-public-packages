import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

void main() {
  group('SolarToggle', () {
    testWidgets(
      'is announced as a switch, and asks for the other value when tapped',
      (tester) async {
        final handle = tester.ensureSemantics();
        bool? asked;
        await pump(
          tester,
          SolarToggle(onChanged: (v) => asked = v, semanticLabel: 'Wi-Fi'),
        );
        expect(
          tester.getSemantics(find.byType(SolarToggle)),
          matchesSemantics(
            hasToggledState: true,
            isToggled: false,
            hasEnabledState: true,
            isEnabled: true,
            hasTapAction: true,
            hasFocusAction: true,
            isFocusable: true,
            label: 'Wi-Fi',
          ),
        );
        await tester.tap(find.byType(SolarToggle));
        expect(asked, true);
        handle.dispose();
      },
    );

    testWidgets(
      'moves its thumb across when on, and rings the track on focus',
      (tester) async {
        final states = WidgetStatesController();
        await pump(
          tester,
          SolarToggle(
            selected: true,
            onChanged: (_) {},
            statesController: states,
          ),
        );
        final track = tester.getTopLeft(find.byKey(const Key('toggle.root')));
        final thumb = tester.getTopLeft(find.byKey(const Key('toggle.thumb')));
        expect(thumb - track, const Offset(17, 3));
        states.update(WidgetState.focused, true);
        await tester.pump();
        final ring =
            tester
                    .widget<Container>(
                      find
                          .descendant(
                            of: find.byKey(const Key('toggle.root')),
                            matching: find.byType(Container),
                          )
                          .first,
                    )
                    .decoration!
                as BoxDecoration;
        expect(ring.boxShadow, isNotEmpty);
      },
    );
  });
}
