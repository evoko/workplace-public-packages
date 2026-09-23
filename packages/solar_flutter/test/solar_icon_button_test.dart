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
BoxDecoration face(WidgetTester tester) =>
    tester
            .widget<DecoratedBox>(
              find
                  .descendant(
                    of: find.byType(IconButton),
                    matching: find.byType(DecoratedBox),
                  )
                  .first,
            )
            .decoration
        as BoxDecoration;

const icon = Icon(Icons.add, key: Key('icon'));

void main() {
  group('SolarIconButton', () {
    testWidgets('draws primary from the recipe, square and 32 at sm', (
      tester,
    ) async {
      await pump(
        tester,
        SolarIconButton(onPressed: () {}, icon: icon, semanticLabel: 'Add'),
      );
      expect(face(tester).color, light.actionPrimaryBgDefault);
      expect(
        face(tester).borderRadius,
        BorderRadius.circular(SolarRadius.control),
      );
      expect(
        tester.getSize(find.byType(DecoratedBox).first),
        const Size(32, 32),
      );
    });

    testWidgets('is a pill when round, and 48 at lg', (tester) async {
      await pump(
        tester,
        SolarIconButton(
          onPressed: () {},
          icon: icon,
          semanticLabel: 'Add',
          shape: SolarIconButtonShape.round,
          size: SolarIconButtonSize.lg,
        ),
      );
      expect(
        face(tester).borderRadius,
        BorderRadius.circular(SolarRadius.pill),
      );
      expect(
        tester.getSize(find.byType(DecoratedBox).first),
        const Size(48, 48),
      );
    });

    testWidgets('gives the icon the recipe’s colour and size', (tester) async {
      await pump(
        tester,
        SolarIconButton(
          onPressed: () {},
          icon: icon,
          semanticLabel: 'Add',
          size: SolarIconButtonSize.md,
          variant: SolarIconButtonVariant.secondary,
        ),
      );
      final theme = IconTheme.of(tester.element(find.byKey(const Key('icon'))));
      expect(theme.size, SolarIconSize.sm);
      expect(theme.color, light.actionSecondaryIconDefault);
    });

    testWidgets('is named for a screen reader, and can still be activated', (
      tester,
    ) async {
      final handle = tester.ensureSemantics();
      var taps = 0;
      await pump(
        tester,
        SolarIconButton(
          onPressed: () => taps++,
          icon: icon,
          semanticLabel: 'Delete',
        ),
      );
      expect(
        tester.getSemantics(find.byType(SolarIconButton)),
        matchesSemantics(
          label: 'Delete',
          isButton: true,
          hasTapAction: true,
          hasFocusAction: true,
          hasEnabledState: true,
          isEnabled: true,
          isFocusable: true,
        ),
      );
      await tester.tap(find.byType(SolarIconButton));
      expect(taps, 1);
      handle.dispose();
    });

    testWidgets(
      'loading shows the Spinner Figma picks, keeping the icon’s room',
      (tester) async {
        await pump(
          tester,
          SolarIconButton(
            onPressed: () {},
            icon: icon,
            semanticLabel: 'Save',
            loading: true,
          ),
        );
        expect(
          tester.widget<SolarSpinner>(find.byType(SolarSpinner)).variant,
          SolarSpinnerVariant.inverse,
        );
        expect(
          tester
              .widget<Visibility>(
                find.ancestor(
                  of: find.byKey(const Key('icon')),
                  matching: find.byType(Visibility),
                ),
              )
              .visible,
          isFalse,
        );
      },
    );

    testWidgets('disabled wins over loading: disabled colours, no spinner', (
      tester,
    ) async {
      await pump(
        tester,
        SolarIconButton(
          onPressed: () {},
          icon: icon,
          semanticLabel: 'Save',
          disabled: true,
          loading: true,
        ),
      );
      expect(face(tester).color, light.actionPrimaryBgDisabled);
      expect(find.byType(SolarSpinner), findsNothing);
    });
  });
}
