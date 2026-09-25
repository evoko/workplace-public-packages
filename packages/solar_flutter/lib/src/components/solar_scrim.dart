/// SOLAR Scrim.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarScrimRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarScrimRecipe]: color.surface.scrim
/// over the whole viewport.
///
/// The translucent layer behind a blocking surface, as the description says, drawn with
/// [SolarLayers] under a [ModalBarrier]: a tap on it calls [onDismiss], where the surface above is
/// dismissible. [showSolarDialog] and [showSolarDrawer] draw its colour as their routes' barrier.
/// Never decorative: it says the user's attention is bound to the layer above it.
library;

import 'package:flutter/material.dart';

import '../generated/components/scrim.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

/// The Scrim's colour, for a route that draws it as its barrier.
Color solarScrimColor(BuildContext context) => SolarScrimRecipe.color(
  solarThemeOf(context),
  'root.background',
  const SolarScrimProps(),
  const {},
);

class SolarScrim extends StatelessWidget {
  const SolarScrim({super.key, this.onDismiss, this.semanticLabel});

  /// Called on a tap, where the surface above it is dismissible; null for one that is not.
  final VoidCallback? onDismiss;

  /// What a screen reader says of it, where it dismisses.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarScrimProps();
    const states = <WidgetState>{};
    return Stack(
      fit: StackFit.expand,
      children: [
        SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarScrimRecipe.lookup(c, p, states),
            dimension: (c) => SolarScrimRecipe.dimension(c, p, states),
            color: (c) => SolarScrimRecipe.color(t, c, p, states),
            shadow: (c) => SolarScrimRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarScrimRecipe.textStyle(t, c, p, states),
            present: (l) => SolarScrimRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: SolarScrimRecipe.tree,
          keyPrefix: 'scrim',
        ).layer('root'),
        ModalBarrier(
          dismissible: onDismiss != null,
          onDismiss: onDismiss,
          semanticsLabel: semanticLabel,
        ),
      ],
    );
  }
}
