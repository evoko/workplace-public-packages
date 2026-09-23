import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

const light = SolarTheme.light;
const primary = SolarButtonProps();

Color background(SolarButtonProps p, Set<WidgetState> s,
        [SolarTheme t = light]) =>
    SolarButtonRecipe.color(t, 'root.background', p, s);

void main() {
  group('state resolution', () {
    test('resting and hover read their own backgrounds', () {
      expect(background(primary, {}), SolarColors.light.actionPrimaryBgDefault);
      expect(background(primary, {WidgetState.hovered}),
          SolarColors.light.actionPrimaryBgHover);
      expect(background(primary, {WidgetState.pressed}),
          SolarColors.light.actionPrimaryBgActive);
    });

    test(
        'disabled wins over hover and pressed, as CSS order decides on the web',
        () {
      const states = {
        WidgetState.hovered,
        WidgetState.pressed,
        WidgetState.disabled
      };
      expect(background(primary, states),
          SolarColors.light.actionPrimaryBgDisabled);
      // The prop alone disables too, for a shell that disables without removing onPressed.
      expect(
          background(
              const SolarButtonProps(disabled: true), {WidgetState.hovered}),
          SolarColors.light.actionPrimaryBgDisabled);
    });

    test('the precedence is the MUI recipe’s, read backwards', () {
      expect(SolarButtonRecipe.statePrecedence,
          ['disabled', 'loading', 'focus', 'pressed', 'hover']);
    });

    test('a missing background is transparent, not the Material default', () {
      expect(
          background(
              const SolarButtonProps(variant: SolarButtonVariant.tertiary), {}),
          Colors.transparent);
    });

    test('danger switches the colour set', () {
      expect(background(const SolarButtonProps(danger: true), {}),
          SolarColors.light.actionPrimaryBgDangerDefault);
    });

    test('dark resolves against the dark colours, with no change to the recipe',
        () {
      expect(background(primary, {}, SolarTheme.dark),
          SolarColors.dark.actionPrimaryBgDefault);
    });
  });

  group('the recipe, per size', () {
    double? dim(String cell, SolarButtonProps p) =>
        SolarButtonRecipe.dimension(cell, p, const {});

    test('md is the base, sm and lg override it in tokens', () {
      expect(dim('root.paddingLeft', primary), SolarInset.sm);
      expect(
          dim('root.paddingLeft',
              const SolarButtonProps(size: SolarButtonSize.sm)),
          SolarInset.xs);
      expect(dim('root.radius', primary), SolarRadius.control);
      expect(
          dim('root.radius', const SolarButtonProps(size: SolarButtonSize.lg)),
          SolarRadius.none);
    });

    test(
        'heights are the literals the overlay allowed, and md hugs its content',
        () {
      expect(dim('root.height', primary), 40);
      expect(
          dim('root.height', const SolarButtonProps(size: SolarButtonSize.sm)),
          32);
      expect(dim('root.width', primary), isNull);
      expect(
          dim('root.width', const SolarButtonProps(size: SolarButtonSize.lg)),
          200);
    });

    test('lg is flat as Figma draws it, but keeps its focus ring', () {
      const lg = SolarButtonProps(size: SolarButtonSize.lg);
      expect(SolarButtonRecipe.shadow(light, 'root.shadow', lg, {}), isEmpty);
      expect(
          SolarButtonRecipe.shadow(
              light, 'root.shadow', lg, {WidgetState.focused}),
          SolarShadows.light.focusDefault);
      expect(SolarButtonRecipe.shadow(light, 'root.shadow', primary, {}),
          SolarShadows.light.control);
    });
  });

  group('the label', () {
    TextStyle? label(SolarButtonProps p, Set<WidgetState> s) =>
        SolarButtonRecipe.textStyle(light, 'label.typography', p, s);

    test('tertiary hover underlines it, and rest does not', () {
      const tertiary = SolarButtonProps(variant: SolarButtonVariant.tertiary);
      expect(label(tertiary, {WidgetState.hovered})?.decoration,
          TextDecoration.underline);
      expect(label(tertiary, {})?.decoration, isNot(TextDecoration.underline));
      expect(label(primary, {WidgetState.hovered}),
          SolarTypography.desktop.labelMd);
    });

    test('loading hides the label and shows the spinner', () {
      const loading = SolarButtonProps(loading: true);
      expect(SolarButtonRecipe.present('label', loading, {}), isFalse);
      expect(SolarButtonRecipe.present('spinner', loading, {}), isTrue);
      expect(SolarButtonRecipe.present('spinner', primary, {}), isFalse);
    });
  });

  testWidgets('a FilledButton styled by the recipe draws SOLAR primary at 40px',
      (tester) async {
    await tester.pumpWidget(MaterialApp(
      home: Scaffold(
        body: Center(
          child: FilledButton(
            style: SolarButtonRecipe.style(light),
            onPressed: () {},
            child: const Text('Save'),
          ),
        ),
      ),
    ));
    final box = tester.widget<DecoratedBox>(find
        .descendant(
          of: find.byType(FilledButton),
          matching: find.byType(DecoratedBox),
        )
        .first);
    final decoration = box.decoration as BoxDecoration;
    expect(decoration.color, SolarColors.light.actionPrimaryBgDefault);
    expect(decoration.boxShadow, SolarShadows.light.control);
    expect(decoration.borderRadius, BorderRadius.circular(SolarRadius.control));
    // The drawn box is 40 tall; Material still pads the hit area to 48, as SOLAR asks for sm.
    expect(tester.getSize(find.byWidget(box)).height, 40);
    final text = tester.widget<DefaultTextStyle>(find
        .descendant(
          of: find.byType(FilledButton),
          matching: find.byType(DefaultTextStyle),
        )
        .last);
    expect(text.style.color, SolarColors.light.actionPrimaryTextDefault);
    expect(text.style.fontFamily, 'packages/solar_flutter/Inter');
  });
}
