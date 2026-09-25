// The component themes of the SOLAR widgets that wrap a Flutter button, the Flutter way: a
// ThemeExtension an app adds to its ThemeData, whose [ButtonStyle] is merged over the SOLAR recipe
// (docs/superpowers/specs/2026-09-25-two-libraries-one-contract.md, "theming follows the
// platform"). What the app's style sets wins; what it leaves null is the recipe's, which is what
// Figma draws.
//
//   ThemeData(extensions: [
//     SolarTheme.light,
//     const SolarButtonThemeData(
//       style: ButtonStyle(minimumSize: WidgetStatePropertyAll(Size(120, 40))),
//     ),
//   ])
//
// Flutter's own filledButtonTheme would not do: a FilledButton's own style, the recipe, wins over
// it, so an app could only fill what the recipe leaves unset.

import 'package:flutter/material.dart';

/// The recipe's style under the app's override from [ThemeData.extensions], the override winning.
ButtonStyle _over(ButtonStyle recipe, ButtonStyle? app) =>
    app == null ? recipe : app.merge(recipe);

/// A [SolarButton]'s theme: [style], merged over its recipe.
@immutable
class SolarButtonThemeData extends ThemeExtension<SolarButtonThemeData> {
  const SolarButtonThemeData({this.style});

  /// What the app sets over the recipe; null properties are the recipe's.
  final ButtonStyle? style;

  /// [recipe] under the theme's style, where the app's theme has one.
  static ButtonStyle styled(BuildContext context, ButtonStyle recipe) =>
      _over(recipe, Theme.of(context).extension<SolarButtonThemeData>()?.style);

  @override
  SolarButtonThemeData copyWith({ButtonStyle? style}) =>
      SolarButtonThemeData(style: style ?? this.style);

  @override
  SolarButtonThemeData lerp(SolarButtonThemeData? other, double t) =>
      SolarButtonThemeData(style: ButtonStyle.lerp(style, other?.style, t));
}

/// A [SolarIconButton]'s theme: [style], merged over its recipe.
@immutable
class SolarIconButtonThemeData
    extends ThemeExtension<SolarIconButtonThemeData> {
  const SolarIconButtonThemeData({this.style});

  /// What the app sets over the recipe; null properties are the recipe's.
  final ButtonStyle? style;

  /// [recipe] under the theme's style, where the app's theme has one.
  static ButtonStyle styled(BuildContext context, ButtonStyle recipe) => _over(
    recipe,
    Theme.of(context).extension<SolarIconButtonThemeData>()?.style,
  );

  @override
  SolarIconButtonThemeData copyWith({ButtonStyle? style}) =>
      SolarIconButtonThemeData(style: style ?? this.style);

  @override
  SolarIconButtonThemeData lerp(SolarIconButtonThemeData? other, double t) =>
      SolarIconButtonThemeData(style: ButtonStyle.lerp(style, other?.style, t));
}

/// A [SolarFAB]'s theme: [style], merged over its recipe.
@immutable
class SolarFABThemeData extends ThemeExtension<SolarFABThemeData> {
  const SolarFABThemeData({this.style});

  /// What the app sets over the recipe; null properties are the recipe's.
  final ButtonStyle? style;

  /// [recipe] under the theme's style, where the app's theme has one.
  static ButtonStyle styled(BuildContext context, ButtonStyle recipe) =>
      _over(recipe, Theme.of(context).extension<SolarFABThemeData>()?.style);

  @override
  SolarFABThemeData copyWith({ButtonStyle? style}) =>
      SolarFABThemeData(style: style ?? this.style);

  @override
  SolarFABThemeData lerp(SolarFABThemeData? other, double t) =>
      SolarFABThemeData(style: ButtonStyle.lerp(style, other?.style, t));
}

/// A [SolarBackButton]'s theme: [style], merged over its recipe.
@immutable
class SolarBackButtonThemeData
    extends ThemeExtension<SolarBackButtonThemeData> {
  const SolarBackButtonThemeData({this.style});

  /// What the app sets over the recipe; null properties are the recipe's.
  final ButtonStyle? style;

  /// [recipe] under the theme's style, where the app's theme has one.
  static ButtonStyle styled(BuildContext context, ButtonStyle recipe) => _over(
    recipe,
    Theme.of(context).extension<SolarBackButtonThemeData>()?.style,
  );

  @override
  SolarBackButtonThemeData copyWith({ButtonStyle? style}) =>
      SolarBackButtonThemeData(style: style ?? this.style);

  @override
  SolarBackButtonThemeData lerp(SolarBackButtonThemeData? other, double t) =>
      SolarBackButtonThemeData(style: ButtonStyle.lerp(style, other?.style, t));
}
