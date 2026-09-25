import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'visual/harness.dart' show loadBundledFonts;

Future<void> pump(WidgetTester tester, Widget child) => tester.pumpWidget(
  MaterialApp(
    theme: ThemeData(extensions: const [SolarTheme.light]),
    home: Scaffold(body: Center(child: child)),
  ),
);

/// The words the app is in: en-US, MaterialApp's own.
MaterialLocalizations words(WidgetTester tester) =>
    MaterialLocalizations.of(tester.element(find.byType(Scaffold)));

/// The pages a pagination draws, in order, each gap null.
List<int?> drawnPages(WidgetTester tester) => [
  for (final w in tester.widgetList(
    find.byWidgetPredicate(
      (w) => w is SolarPaginationItem || w is SolarPaginationEllipsis,
    ),
  ))
    w is SolarPaginationItem ? w.page : null,
];

/// The statuses of the Steps drawn, in order.
List<SolarStepStatus> statusesOf(WidgetTester tester) => [
  for (final step in tester.widgetList<SolarStep>(find.byType(SolarStep)))
    step.status,
];

/// A stepper of three steps, the second active: one step of each status.
Widget stepper(
  SolarStepperType type, {
  int? errorStep,
  ValueChanged<int>? onStepClick,
}) => SolarStepper(
  type: type,
  steps: const ['A', 'B', 'C'],
  activeStep: 1,
  errorStep: errorStep,
  onStepClick: onStepClick,
);

void main() {
  // Pages 10 to 12 fit their 24px box in Inter, not in the test's own square glyphs.
  setUpAll(loadBundledFonts);

  group('solarPagesOf', () {
    test('near the start, shows the first three and the last', () {
      expect(solarPagesOf(1, 12), [1, 2, 3, null, 12]);
      expect(solarPagesOf(2, 12), [1, 2, 3, null, 12]);
      expect(solarPagesOf(3, 12), [1, 2, 3, 4, null, 12]);
    });

    test('in the middle, shows the first, the current ± 1 and the last', () {
      expect(solarPagesOf(6, 12), [1, null, 5, 6, 7, null, 12]);
      expect(solarPagesOf(5, 12), [1, null, 4, 5, 6, null, 12]);
      // A gap of one page before the current ± 1 is that page, not an ellipsis.
      expect(solarPagesOf(4, 12), [1, 2, 3, 4, 5, null, 12]);
      expect(solarPagesOf(9, 12), [1, null, 8, 9, 10, 11, 12]);
    });

    test('near the end, shows the first and the last three', () {
      expect(solarPagesOf(11, 12), [1, null, 10, 11, 12]);
      expect(solarPagesOf(12, 12), [1, null, 10, 11, 12]);
      expect(solarPagesOf(10, 12), [1, null, 9, 10, 11, 12]);
    });

    test('a few pages are all shown, a one-page gap filled', () {
      expect(solarPagesOf(1, 1), [1]);
      expect(solarPagesOf(1, 2), [1, 2]);
      expect(solarPagesOf(2, 3), [1, 2, 3]);
      expect(solarPagesOf(1, 5), [1, 2, 3, 4, 5]);
      expect(solarPagesOf(3, 5), [1, 2, 3, 4, 5]);
    });
  });

  group('SolarPagination', () {
    testWidgets('a single page draws nothing', (tester) async {
      await pump(tester, SolarPagination(count: 1, page: 1, onChanged: (_) {}));
      expect(find.byType(SolarPaginationItem), findsNothing);
      expect(find.byType(SolarPaginationNav), findsNothing);
    });

    testWidgets('draws the pages of solarPagesOf, an ellipsis in the gap', (
      tester,
    ) async {
      await pump(
        tester,
        SolarPagination(count: 12, page: 1, onChanged: (_) {}),
      );
      for (final page in ['1', '2', '3', '12']) {
        expect(find.text(page), findsOneWidget);
      }
      expect(find.text('4'), findsNothing);
      expect(find.byType(SolarPaginationEllipsis), findsOneWidget);
      expect(find.text('…'), findsOneWidget);
      expect(find.byType(SolarPaginationNav), findsNWidgets(2));
    });

    testWidgets('a tap on a page chooses it, and the arrows step by one', (
      tester,
    ) async {
      final chosen = <int>[];
      await pump(
        tester,
        SolarPagination(count: 12, page: 1, onChanged: chosen.add),
      );
      final previous = find.bySemanticsLabel(words(tester).previousPageTooltip);
      final next = find.bySemanticsLabel(words(tester).nextPageTooltip);
      await tester.tap(find.text('3'));
      await tester.tap(find.text('12'));
      // At the first page, the previous arrow is disabled.
      await tester.tap(previous, warnIfMissed: false);
      await tester.tap(next);
      expect(chosen, [3, 12, 2]);
    });

    testWidgets('at the last page, the next arrow is disabled', (tester) async {
      final chosen = <int>[];
      await pump(
        tester,
        SolarPagination(count: 12, page: 12, onChanged: chosen.add),
      );
      await tester.tap(
        find.bySemanticsLabel(words(tester).nextPageTooltip),
        warnIfMissed: false,
      );
      await tester.tap(
        find.bySemanticsLabel(words(tester).previousPageTooltip),
      );
      expect(chosen, [11]);
    });

    testWidgets('its pages are named "Page N" and its arrows by Material', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarPagination(count: 12, page: 1, onChanged: (_) {}),
      );
      for (final page in [1, 2, 3, 12]) {
        expect(find.bySemanticsLabel('Page $page'), findsOneWidget);
      }
      expect(find.bySemanticsLabel('Page 4'), findsNothing);
      expect(find.bySemanticsLabel('Previous page'), findsOneWidget);
      expect(find.bySemanticsLabel('Next page'), findsOneWidget);
      handle.dispose();
    });

    testWidgets('in the middle, draws the current ± 1, a gap either side', (
      tester,
    ) async {
      // Repeated layers (the middle pages, two gaps) are drawn side by side without clashing.
      for (final (page, pages) in [
        (3, [1, 2, 3, 4, null, 12]),
        (4, [1, 2, 3, 4, 5, null, 12]),
        (6, [1, null, 5, 6, 7, null, 12]),
        (9, [1, null, 8, 9, 10, 11, 12]),
      ]) {
        await pump(
          tester,
          SolarPagination(count: 12, page: page, onChanged: (_) {}),
        );
        expect(tester.takeException(), isNull, reason: 'page $page');
        expect(drawnPages(tester), pages, reason: 'page $page');
      }
    });

    testWidgets('the current page is announced as a selected button', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarPagination(count: 12, page: 1, onChanged: (_) {}),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Page 1')),
        isSemantics(
          label: 'Page 1',
          isButton: true,
          isSelected: true,
          hasTapAction: true,
        ),
      );
      expect(
        tester.getSemantics(find.bySemanticsLabel('Page 2')),
        isSemantics(
          label: 'Page 2',
          isButton: true,
          isSelected: false,
          hasTapAction: true,
        ),
      );
      handle.dispose();
    });
  });

  group('SolarPaginationItem', () {
    testWidgets('draws its number; a tap calls onPressed', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarPaginationItem(page: 7, onPressed: () => pressed++),
      );
      expect(find.text('7'), findsOneWidget);
      await tester.tap(find.text('7'));
      expect(pressed, 1);
    });

    testWidgets('a disabled one is not pressed', (tester) async {
      var pressed = 0;
      await pump(tester, const SolarPaginationItem(page: 7, onPressed: null));
      await tester.tap(find.text('7'), warnIfMissed: false);
      expect(pressed, 0);
    });
  });

  group('SolarPaginationNav', () {
    testWidgets('a tap calls onPressed; a disabled one is not pressed', (
      tester,
    ) async {
      var pressed = 0;
      Widget nav({required bool disabled}) => SolarPaginationNav(
        direction: SolarPaginationNavDirection.next,
        onPressed: disabled ? null : () => pressed++,
      );
      await pump(tester, nav(disabled: false));
      await tester.tap(find.byType(SolarPaginationNav));
      expect(pressed, 1);
      await pump(tester, nav(disabled: true));
      await tester.tap(find.byType(SolarPaginationNav), warnIfMissed: false);
      expect(pressed, 1);
    });

    testWidgets('a disabled one is announced as a disabled button', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(tester, const SolarPaginationNav(onPressed: null));
      expect(
        tester.getSemantics(find.bySemanticsLabel('Previous page')),
        isSemantics(
          isButton: true,
          hasEnabledState: true,
          isEnabled: false,
          hasTapAction: false,
        ),
      );
      handle.dispose();
    });

    testWidgets('its chevron is mirrored in a right-to-left layout', (
      tester,
    ) async {
      double flipOf() => tester
          .widget<Transform>(
            find
                .descendant(
                  of: find.byType(SolarPaginationNav),
                  matching: find.byType(Transform),
                )
                .first,
          )
          .transform
          .entry(0, 0);
      Widget nav(TextDirection direction) => Directionality(
        textDirection: direction,
        child: SolarPaginationNav(onPressed: () {}),
      );
      await pump(tester, nav(TextDirection.ltr));
      expect(flipOf(), 1);
      await pump(tester, nav(TextDirection.rtl));
      expect(flipOf(), -1);
    });
  });

  group('SolarPaginationEllipsis', () {
    testWidgets('draws "…", and is not a control', (tester) async {
      await pump(tester, const SolarPaginationEllipsis());
      expect(find.text('…'), findsOneWidget);
      expect(find.byType(SolarPressable), findsNothing);
    });
  });

  group('SolarPageNavigator', () {
    testWidgets('shows where the reader is, "3 of 10" by default', (
      tester,
    ) async {
      await pump(
        tester,
        SolarPageNavigator(count: 10, page: 3, onChanged: (_) {}),
      );
      expect(find.text('3 of 10'), findsOneWidget);
      await pump(
        tester,
        SolarPageNavigator(
          count: 10,
          page: 3,
          onChanged: (_) {},
          indicator: (page, count) => 'Step $page, $count in all',
        ),
      );
      expect(find.text('Step 3, 10 in all'), findsOneWidget);
      expect(find.text('3 of 10'), findsNothing);
    });

    testWidgets('next and previous step by one', (tester) async {
      final chosen = <int>[];
      await pump(
        tester,
        SolarPageNavigator(count: 10, page: 3, onChanged: chosen.add),
      );
      expect(find.text('Previous'), findsOneWidget);
      expect(find.text('Next'), findsOneWidget);
      await tester.tap(find.text('Next'));
      await tester.tap(find.text('Previous'));
      expect(chosen, [4, 2]);
    });

    testWidgets('previous is disabled at the first page, next at the last', (
      tester,
    ) async {
      final chosen = <int>[];
      await pump(
        tester,
        SolarPageNavigator(count: 10, page: 1, onChanged: chosen.add),
      );
      await tester.tap(find.text('Previous'), warnIfMissed: false);
      expect(chosen, isEmpty);
      await pump(
        tester,
        SolarPageNavigator(count: 10, page: 10, onChanged: chosen.add),
      );
      await tester.tap(find.text('Next'), warnIfMissed: false);
      expect(chosen, isEmpty);
      await tester.tap(find.text('Previous'));
      expect(chosen, [9]);
    });

    testWidgets('where the reader is, is announced as it changes', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        SolarPageNavigator(count: 10, page: 3, onChanged: (_) {}),
      );
      expect(
        tester.getSemantics(find.text('3 of 10')),
        isSemantics(label: '3 of 10', isLiveRegion: true),
      );
      handle.dispose();
    });
  });

  group('SolarPageNavButton', () {
    testWidgets(
      'reads "Previous" or "Next" by its direction; label overrides',
      (tester) async {
        var pressed = 0;
        await pump(tester, SolarPageNavButton(onPressed: () => pressed++));
        expect(find.text('Previous'), findsOneWidget);
        await pump(
          tester,
          SolarPageNavButton(
            direction: SolarPageNavButtonDirection.next,
            onPressed: () => pressed++,
          ),
        );
        expect(find.text('Next'), findsOneWidget);
        await pump(
          tester,
          SolarPageNavButton(label: 'Back', onPressed: () => pressed++),
        );
        expect(find.text('Back'), findsOneWidget);
        expect(find.text('Previous'), findsNothing);
        await tester.tap(find.text('Back'));
        expect(pressed, 1);
      },
    );

    testWidgets('a disabled one is not pressed', (tester) async {
      var pressed = 0;
      await pump(tester, const SolarPageNavButton(onPressed: null));
      await tester.tap(find.text('Previous'), warnIfMissed: false);
      expect(pressed, 0);
    });
  });

  group('SolarStepperIndicator', () {
    testWidgets('draws its number when active or upcoming, "!" in error', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarStepperIndicator(
          number: 2,
          status: SolarStepperIndicatorStatus.active,
        ),
      );
      expect(find.text('2'), findsOneWidget);
      expect(find.byType(SolarIcon), findsNothing);
      await pump(
        tester,
        const SolarStepperIndicator(
          number: 3,
          status: SolarStepperIndicatorStatus.upcoming,
        ),
      );
      expect(find.text('3'), findsOneWidget);
      await pump(
        tester,
        const SolarStepperIndicator(
          number: 3,
          status: SolarStepperIndicatorStatus.error,
        ),
      );
      expect(find.text('!'), findsOneWidget);
      expect(find.text('3'), findsNothing);
    });

    testWidgets('draws a tick when completed, and not its number', (
      tester,
    ) async {
      await pump(
        tester,
        const SolarStepperIndicator(
          number: 1,
          status: SolarStepperIndicatorStatus.completed,
        ),
      );
      expect(find.byType(SolarIcon), findsOneWidget);
      expect(find.text('1'), findsNothing);
    });

    testWidgets('is excluded from semantics', (tester) async {
      final handle = tester.ensureSemantics();
      await pump(
        tester,
        const SolarStepperIndicator(
          number: 2,
          status: SolarStepperIndicatorStatus.active,
        ),
      );
      expect(find.text('2'), findsOneWidget);
      expect(find.bySemanticsLabel('2'), findsNothing);
      handle.dispose();
    });
  });

  group('SolarStep', () {
    testWidgets('horizontal, draws its numbered label', (tester) async {
      await pump(
        tester,
        const SolarStep(
          type: SolarStepType.horizontal,
          label: 'Setup',
          number: 1,
        ),
      );
      expect(find.text('1. Setup'), findsOneWidget);
    });

    testWidgets('with onPressed, is a control: a tap calls it', (tester) async {
      var pressed = 0;
      await pump(
        tester,
        SolarStep(label: 'Setup', number: 1, onPressed: () => pressed++),
      );
      expect(find.byType(SolarPressable), findsOneWidget);
      await tester.tap(find.byType(SolarStep));
      expect(pressed, 1);
      // Without it, it is no control of its own.
      await pump(tester, const SolarStep(label: 'Setup', number: 1));
      expect(find.byType(SolarPressable), findsNothing);
    });
  });

  group('SolarStepper', () {
    testWidgets(
      'those before the active step are complete, those after upcoming',
      (tester) async {
        for (final type in [
          SolarStepperType.withLabel,
          SolarStepperType.lineText,
        ]) {
          await pump(tester, stepper(type));
          expect(statusesOf(tester), [
            SolarStepStatus.complete,
            SolarStepStatus.active,
            SolarStepStatus.upcoming,
          ], reason: '$type');
        }
      },
    );

    testWidgets('with label, draws any mix of statuses', (tester) async {
      // Steps of the same status are drawn side by side without clashing.
      const c = SolarStepStatus.complete;
      const a = SolarStepStatus.active;
      const u = SolarStepStatus.upcoming;
      const e = SolarStepStatus.error;
      for (final (n, active, error, statuses) in [
        (3, 0, null, [a, u, u]),
        (3, 2, null, [c, c, a]),
        (5, 3, null, [c, c, c, a, u]),
        (3, 1, 2, [c, a, e]),
      ]) {
        await pump(
          tester,
          SolarStepper(
            steps: [for (var i = 0; i < n; i++) 'Step ${i + 1}'],
            activeStep: active,
            errorStep: error,
          ),
        );
        final reason = '$n steps, active $active, error $error';
        expect(tester.takeException(), isNull, reason: reason);
        expect(statusesOf(tester), statuses, reason: reason);
      }
    });

    testWidgets('errorStep puts that step in error', (tester) async {
      await pump(tester, stepper(SolarStepperType.lineText, errorStep: 2));
      expect(statusesOf(tester), [
        SolarStepStatus.complete,
        SolarStepStatus.active,
        SolarStepStatus.error,
      ]);
    });

    testWidgets('no label draws each step as an indicator of its status', (
      tester,
    ) async {
      await pump(tester, stepper(SolarStepperType.noLabel, errorStep: 2));
      expect(find.byType(SolarStep), findsNothing);
      expect(
        [
          for (final indicator in tester.widgetList<SolarStepperIndicator>(
            find.byType(SolarStepperIndicator),
          ))
            indicator.status,
        ],
        [
          SolarStepperIndicatorStatus.completed,
          SolarStepperIndicatorStatus.active,
          SolarStepperIndicatorStatus.error,
        ],
      );
    });

    testWidgets('with onStepClick, a completed step is pressable, no other', (
      tester,
    ) async {
      for (final type in [
        SolarStepperType.withLabel,
        SolarStepperType.lineText,
      ]) {
        final clicked = <int>[];
        await pump(tester, stepper(type, onStepClick: clicked.add));
        final steps = find.byType(SolarStep);
        await tester.tap(steps.at(0));
        await tester.tap(steps.at(1), warnIfMissed: false);
        await tester.tap(steps.at(2), warnIfMissed: false);
        expect(clicked, [0], reason: '$type');
      }
    });

    testWidgets('where a type draws no words, each step\'s label is read', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      for (final type in [SolarStepperType.noLabel, SolarStepperType.line]) {
        await pump(tester, stepper(type));
        expect(find.text('A'), findsNothing, reason: '$type');
        SemanticsNode step(String label) =>
            tester.getSemantics(find.bySemanticsLabel(label));
        expect(step('A'), isSemantics(label: 'A', isSelected: false));
        expect(step('B'), isSemantics(label: 'B', isSelected: true));
        expect(step('C'), isSemantics(label: 'C', isSelected: false));
      }
      handle.dispose();
    });

    testWidgets('with label, the bar is filled to the active step', (
      tester,
    ) async {
      await pump(tester, stepper(SolarStepperType.withLabel));
      final fill = tester.widget<FractionallySizedBox>(
        find.descendant(
          of: find.byType(SolarStepper),
          matching: find.byType(FractionallySizedBox),
        ),
      );
      expect(fill.widthFactor, 0.5);
    });
  });
}
