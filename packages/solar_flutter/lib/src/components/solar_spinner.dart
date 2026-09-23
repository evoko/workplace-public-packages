/// SOLAR Spinner.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Spinner` from
/// spec/components/spinner.json, and owned by developers from then on. Its look is the recipe,
/// [SolarSpinnerRecipe]: the ring's size, its stroke width, and the track and indicator colours.
///
/// It wraps Flutter's CircularProgressIndicator, which supplies the motion and the semantics.
library;

import 'package:flutter/material.dart';

import '../generated/components/spinner.dart';
import 'solar_theme_of.dart';

class SolarSpinner extends StatelessWidget {
  const SolarSpinner({
    super.key,
    this.size = SolarSpinnerSize.sm,
    this.variant = SolarSpinnerVariant.$default,
    this.semanticsLabel,
  });

  final SolarSpinnerSize size;
  final SolarSpinnerVariant variant;

  /// What is loading, for a screen reader.
  final String? semanticsLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSpinnerProps(size: size, variant: variant);
    const rest = <WidgetState>{};
    return SizedBox.square(
      dimension: SolarSpinnerRecipe.dimension('spinnerRing.width', p, rest),
      child: CircularProgressIndicator(
        // The ring inside its box, as the web draws it.
        strokeAlign: CircularProgressIndicator.strokeAlignInside,
        strokeWidth:
            SolarSpinnerRecipe.dimension('indicator.borderWidth', p, rest)!,
        color: SolarSpinnerRecipe.color(t, 'indicator.borderColor', p, rest),
        backgroundColor:
            SolarSpinnerRecipe.color(t, 'track.borderColor', p, rest),
        semanticsLabel: semanticsLabel,
      ),
    );
  }
}
