import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(
      body: Center(child: SizedBox(width: 600, child: child)),
    ),
  ),
);

void main() {
  testWidgets('SolarAlert draws what it is given, and calls onAction', (
    tester,
  ) async {
    var acted = 0;
    await pump(
      tester,
      SolarAlert(title: 'Saved', action: 'Undo', onAction: () => acted++),
    );
    expect(find.text('Saved'), findsOneWidget);
    expect(find.byKey(const Key('alert.description')), findsNothing);
    expect(find.byType(SolarStatusIndicator), findsOneWidget);
    await tester.tap(find.text('Undo'));
    expect(acted, 1);
  });

  testWidgets(
    'SolarBanner shows a close button named Dismiss where onClose is given',
    (tester) async {
      final handle = tester.ensureSemantics();
      var closed = 0;
      await pump(
        tester,
        SolarBanner(
          description: 'Maintenance tonight',
          onClose: () => closed++,
        ),
      );
      expect(find.bySemanticsLabel('Dismiss'), findsOneWidget);
      await tester.tap(find.byKey(const Key('banner.close')));
      expect(closed, 1);
      handle.dispose();
    },
  );

  testWidgets('SolarToast draws its Tag on its own surface', (tester) async {
    await pump(
      tester,
      const SolarToast(
        status: SolarToastStatus.info,
        message: 'Saved',
        tag: 'Room A',
      ),
    );
    final pill =
        tester
                .widget<Container>(
                  find
                      .descendant(
                        of: find.byKey(const Key('tag.root')),
                        matching: find.byType(Container),
                      )
                      .first,
                )
                .decoration!
            as BoxDecoration;
    expect(pill.color, SolarColors.light.surfaceOverlay);
    expect(find.text('Room A'), findsOneWidget);
  });

  testWidgets('SolarEmptyState wraps its words, centred', (tester) async {
    await pump(
      tester,
      const SolarEmptyState(
        title: 'No rooms yet',
        description: 'Add one to begin.',
      ),
    );
    final text = tester.widget<Text>(find.text('Add one to begin.'));
    expect(text.softWrap, isTrue);
    expect(text.textAlign, TextAlign.center);
  });
}
