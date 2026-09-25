/// SOLAR TableHeader.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTableHeaderRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTableHeaderRecipe]: the strip's
/// padding and gaps, read cell by cell.
///
/// The toolbar above a Table, drawn from Figma's layer tree with [SolarLayers]: on desktop the
/// caller's SolarSearchField ([search]), SolarSegmentedControl ([segmentedControl]) and [actions]
/// (SolarIconButtons for filters and bulk actions), spread across it; on mobile the Segmented
/// Control and the actions alone, as Figma draws it. The [breakpoint] is the app's to give (owner
/// decision 2026-09-25). What each control does is the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/tableheader.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTableHeader extends StatelessWidget {
  const SolarTableHeader({
    super.key,
    this.breakpoint = SolarTableHeaderBreakpoint.desktop,
    this.search,
    this.segmentedControl,
    this.actions = const [],
  });

  final SolarTableHeaderBreakpoint breakpoint;

  /// A SolarSearchField (md): what the table shows, filtered; desktop only, as Figma draws it.
  final Widget? search;

  /// A SolarSegmentedControl (md): which view of the table.
  final Widget? segmentedControl;

  /// The actions: SolarIconButtons (md, square, secondary) for filters and bulk actions.
  final List<Widget> actions;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTableHeaderProps(breakpoint: breakpoint);
    const states = <WidgetState>{};
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTableHeaderRecipe.lookup(c, p, states),
        dimension: (c) => SolarTableHeaderRecipe.dimension(c, p, states),
        color: (c) => SolarTableHeaderRecipe.color(t, c, p, states),
        shadow: (c) => SolarTableHeaderRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTableHeaderRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'search' =>
            search != null && SolarTableHeaderRecipe.present(l, p, states),
          'segmentedControl' || 'segmentedControlMobile' =>
            segmentedControl != null &&
                SolarTableHeaderRecipe.present(l, p, states),
          _ => SolarTableHeaderRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarTableHeaderRecipe.tree,
      keyPrefix: 'tableHeader',
      composed: {
        'search': ?search,
        'segmentedControl': ?segmentedControl,
        'segmentedControlMobile': ?segmentedControl,
      },
      content: {'actions': actions, 'actionsMobile': actions},
    ).layer('root');
  }
}
