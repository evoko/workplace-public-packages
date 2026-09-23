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

/// The face the recipe paints: the DecoratedBox ButtonStyle.backgroundBuilder returns.
BoxDecoration face(WidgetTester tester) => tester
    .widget<DecoratedBox>(find
        .descendant(
          of: find.byType(FilledButton),
          matching: find.byType(DecoratedBox),
        )
        .first)
    .decoration as BoxDecoration;

void main() {
  group('SolarButton', () {
    const cases = {
      (SolarButtonVariant.primary, false): 'actionPrimaryBgDefault',
      (SolarButtonVariant.primary, true): 'actionPrimaryBgDangerDefault',
      (SolarButtonVariant.secondary, false): 'actionSecondaryBgDefault',
      (SolarButtonVariant.secondary, true): 'actionSecondaryBgDangerDefault',
    };
    final expected = {
      'actionPrimaryBgDefault': light.actionPrimaryBgDefault,
      'actionPrimaryBgDangerDefault': light.actionPrimaryBgDangerDefault,
      'actionSecondaryBgDefault': light.actionSecondaryBgDefault,
      'actionSecondaryBgDangerDefault': light.actionSecondaryBgDangerDefault,
    };
    for (final MapEntry(key: (variant, danger), value: colour)
        in cases.entries) {
      testWidgets(
          'draws ${variant.name}${danger ? ' danger' : ''} from the recipe',
          (tester) async {
        await pump(
          tester,
          SolarButton(
            onPressed: () {},
            variant: variant,
            danger: danger,
            child: const Text('Save'),
          ),
        );
        expect(face(tester).color, expected[colour]);
      });
    }

    testWidgets('tertiary has no face, not the Material fill', (tester) async {
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          variant: SolarButtonVariant.tertiary,
          child: const Text('Skip'),
        ),
      );
      expect(face(tester).color, Colors.transparent);
    });

    testWidgets('takes its size from the recipe', (tester) async {
      for (final (size, height) in [
        (SolarButtonSize.sm, 32.0),
        (SolarButtonSize.md, 40.0),
        (SolarButtonSize.lg, 48.0),
      ]) {
        await pump(
          tester,
          SolarButton(onPressed: () {}, size: size, child: const Text('Save')),
        );
        final box = find
            .descendant(
              of: find.byType(FilledButton),
              matching: find.byType(DecoratedBox),
            )
            .first;
        expect(tester.getSize(box).height, height, reason: size.name);
      }
    });

    testWidgets(
        'loading shows the spinner Figma picks, keeps its size and its own colours',
        (tester) async {
      await pump(tester,
          SolarButton(onPressed: () {}, child: const Text('Save changes')));
      final resting = tester.getSize(find.byType(FilledButton));

      var pressed = false;
      await pump(
        tester,
        SolarButton(
          onPressed: () => pressed = true,
          loading: true,
          child: const Text('Save changes'),
        ),
      );
      // Flutter marks a button with no onPressed disabled; loading must still look like loading.
      expect(face(tester).color, light.actionPrimaryBgDefault);
      expect(tester.getSize(find.byType(FilledButton)), resting);
      final spinner = tester.widget<SolarSpinner>(find.byType(SolarSpinner));
      expect(spinner.size, SolarSpinnerSize.sm);
      expect(spinner.variant, SolarSpinnerVariant.inverse);
      // The label keeps its room and its semantics, but is not drawn.
      final label = tester.widget<Visibility>(find.ancestor(
          of: find.text('Save changes'), matching: find.byType(Visibility)));
      expect(label.visible, isFalse);
      expect(label.maintainSemantics, isTrue);
      await tester.tap(find.byType(FilledButton));
      expect(pressed, isFalse);
    });

    testWidgets('secondary loading shows the default spinner, lg the md one',
        (tester) async {
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          loading: true,
          variant: SolarButtonVariant.secondary,
          child: const Text('Save'),
        ),
      );
      expect(tester.widget<SolarSpinner>(find.byType(SolarSpinner)).variant,
          SolarSpinnerVariant.$default);
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          loading: true,
          size: SolarButtonSize.lg,
          child: const Text('Save'),
        ),
      );
      expect(tester.widget<SolarSpinner>(find.byType(SolarSpinner)).size,
          SolarSpinnerSize.md);
    });

    testWidgets('disabled wins over loading: disabled colours, no spinner',
        (tester) async {
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          disabled: true,
          loading: true,
          child: const Text('Save'),
        ),
      );
      expect(face(tester).color, light.actionPrimaryBgDisabled);
      expect(find.byType(SolarSpinner), findsNothing);
    });

    testWidgets('hover reads the recipe’s hover colour', (tester) async {
      final states = WidgetStatesController();
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          statesController: states,
          child: const Text('Save'),
        ),
      );
      states.update(WidgetState.hovered, true);
      await tester.pump();
      expect(face(tester).color, light.actionPrimaryBgHover);
    });

    testWidgets('spaces its icons, label and counter by the recipe’s gap',
        (tester) async {
      await pump(
        tester,
        SolarButton(
          onPressed: () {},
          iconLeading: const SizedBox(width: 16, height: 16),
          counter: const Text('3'),
          child: const Text('Inbox'),
        ),
      );
      final gaps = tester
          .widgetList<SizedBox>(find.descendant(
              of: find.byType(Row), matching: find.byType(SizedBox)))
          .where((b) => b.height == null)
          .map((b) => b.width);
      expect(gaps, [SolarInset.xs, SolarInset.xs]);
    });

    test('an icon-only button needs a semantic label', () {
      expect(
        () => SolarButton(onPressed: () {}, iconLeading: const SizedBox()),
        throwsAssertionError,
      );
      expect(
        SolarButton(
          onPressed: () {},
          iconLeading: const SizedBox(),
          semanticLabel: 'Delete',
        ),
        isA<SolarButton>(),
      );
    });
  });

  group('SolarSpinner', () {
    testWidgets('draws the ring, track and indicator from the recipe',
        (tester) async {
      for (final (size, px) in [
        (SolarSpinnerSize.sm, 16.0),
        (SolarSpinnerSize.md, 24.0),
        (SolarSpinnerSize.lg, 32.0),
      ]) {
        await pump(tester, SolarSpinner(size: size));
        expect(tester.getSize(find.byType(SolarSpinner)), Size.square(px));
      }
      final ring = tester.widget<CircularProgressIndicator>(
          find.byType(CircularProgressIndicator));
      expect(ring.strokeWidth, SolarBorder.strong);
      expect(ring.color, light.borderStrong);
      expect(ring.backgroundColor, light.borderSubtle);
      expect(ring.strokeAlign, CircularProgressIndicator.strokeAlignInside);
    });

    testWidgets('inverse uses the inverse border colours', (tester) async {
      await pump(
          tester, const SolarSpinner(variant: SolarSpinnerVariant.inverse));
      final ring = tester.widget<CircularProgressIndicator>(
          find.byType(CircularProgressIndicator));
      expect(ring.color, light.borderInverseStrong);
      expect(ring.backgroundColor, light.borderInverseSubtle);
    });

    testWidgets('follows the app’s brightness when no SolarTheme is installed',
        (tester) async {
      await tester.pumpWidget(MaterialApp(
        theme: ThemeData(brightness: Brightness.dark),
        home: const Center(child: SolarSpinner()),
      ));
      final ring = tester.widget<CircularProgressIndicator>(
          find.byType(CircularProgressIndicator));
      expect(ring.color, SolarColors.dark.borderStrong);
    });
  });
}
