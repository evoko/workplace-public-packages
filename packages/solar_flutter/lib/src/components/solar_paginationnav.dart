/// SOLAR PaginationNav.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarPaginationNavRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarPaginationNavRecipe]: the arrow’s fill and ring by state, and its chevron’s ink, read cell
/// by cell.
///
/// Bespoke: the previous or next arrow of a SolarPagination, drawn from Figma's layer tree with
/// [SolarLayers], pressable and focusable, named for a screen reader by MaterialLocalizations
/// ("Previous page", "Next page"), disabled at the first and the last page rather than hidden. Its
/// chevron points the way it goes, mirrored in a right-to-left layout. Its own 24 × 24 box is its
/// target.
library;

import 'package:flutter/material.dart';

import '../generated/components/paginationnav.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarPaginationNav extends StatelessWidget {
  const SolarPaginationNav({
    super.key,
    this.direction = SolarPaginationNavDirection.previous,
    required this.onPressed,
    this.statesController,
  });

  final SolarPaginationNavDirection direction;

  /// Called when it is chosen; null disables it.
  final VoidCallback? onPressed;

  /// Whether it is disabled: by a null [onPressed], as Flutter's own controls are, not a
  /// parameter of its own.
  bool get disabled => onPressed == null;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarPaginationNavProps(direction: direction, disabled: disabled);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPaginationNavRecipe.lookup(c, p, states),
        dimension: (c) => SolarPaginationNavRecipe.dimension(c, p, states),
        color: (c) => SolarPaginationNavRecipe.color(t, c, p, states),
        shadow: (c) => SolarPaginationNavRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarPaginationNavRecipe.textStyle(t, c, p, states),
        present: (l) => SolarPaginationNavRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarPaginationNavRecipe.tree,
      keyPrefix: 'paginationNav',
      icons: {
        'icon': switch (direction) {
          SolarPaginationNavDirection.next => SolarIcons.chevronRightOutline,
          SolarPaginationNavDirection.previous => SolarIcons.chevronLeftOutline,
        },
      },
    ).layer('root');
    final mark = SolarPressable(
      onPressed: disabled ? null : onPressed,
      statesController: statesController,
      target: false,
      builder: (_, states) => draw(states),
    );
    return Semantics(
      label: direction == SolarPaginationNavDirection.next
          ? MaterialLocalizations.of(context).nextPageTooltip
          : MaterialLocalizations.of(context).previousPageTooltip,
      child: Transform.flip(
        flipX: Directionality.of(context) == TextDirection.rtl,
        child: mark,
      ),
    );
  }
}
