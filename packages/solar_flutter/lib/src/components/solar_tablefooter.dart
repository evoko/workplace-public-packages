/// SOLAR TableFooter.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTableFooterRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTableFooterRecipe]: the strip's
/// padding and gaps, and the words' text style, read cell by cell.
///
/// The strip under a Table, drawn from Figma's layer tree with [SolarLayers]: how many rows a page
/// shows (the caller's SolarDropdown, [rowsPerPage], and on desktop its words,
/// [rowsPerPageLabel]), the caller's SolarPagination ([pagination]), and an optional action: a
/// SolarButton on desktop ([button]), a SolarIconButton on mobile ([iconButton]), as Figma draws
/// each. The [breakpoint] is the app's to give (owner decision 2026-09-25). Paging is the caller's.
library;

import 'package:flutter/material.dart';

import '../generated/components/tablefooter.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTableFooter extends StatelessWidget {
  const SolarTableFooter({
    super.key,
    this.breakpoint = SolarTableFooterBreakpoint.desktop,
    this.rowsPerPage,
    this.rowsPerPageLabel,
    this.pagination,
    this.button,
    this.iconButton,
  });

  final SolarTableFooterBreakpoint breakpoint;

  /// A SolarDropdown (md): how many rows a page shows.
  final Widget? rowsPerPage;

  /// The Dropdown's words, "rows per page" in the app's language; desktop only, as Figma draws it.
  final String? rowsPerPageLabel;

  /// A SolarPagination: which page.
  final Widget? pagination;

  /// A SolarButton (md, primary): the table's action, on desktop.
  final Widget? button;

  /// A SolarIconButton (md, square, primary): the table's action, on mobile.
  final Widget? iconButton;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTableFooterProps(breakpoint: breakpoint);
    const states = <WidgetState>{};
    bool drawn(String l) => SolarTableFooterRecipe.present(l, p, states);
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTableFooterRecipe.lookup(c, p, states),
        dimension: (c) => SolarTableFooterRecipe.dimension(c, p, states),
        color: (c) => SolarTableFooterRecipe.color(t, c, p, states),
        shadow: (c) => SolarTableFooterRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTableFooterRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'rowsPerPage' ||
          'rowsPerPageMobile' => rowsPerPage != null && drawn(l),
          'rowsPerPageLabel' => rowsPerPageLabel != null && drawn(l),
          'pagination' || 'paginationMobile' => pagination != null && drawn(l),
          'button' => button != null && drawn(l),
          'iconButton' => iconButton != null && drawn(l),
          _ => drawn(l),
        },
        glyph: (_) => null,
      ),
      tree: SolarTableFooterRecipe.tree,
      keyPrefix: 'tableFooter',
      text: {'rowsPerPageLabel': ?rowsPerPageLabel},
      composed: {
        'rowsPerPage': ?rowsPerPage,
        'rowsPerPageMobile': ?rowsPerPage,
        'pagination': ?pagination,
        'paginationMobile': ?pagination,
        'button': ?button,
        'iconButton': ?iconButton,
      },
    ).layer('root');
  }
}
