/// SOLAR Breadcrumbs.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarBreadcrumbsRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarBreadcrumbsRecipe]: the trail's gaps and its chevrons' size and ink, read cell by cell.
///
/// Where a page sits in its app: its ancestors, SolarBreadcrumbItems given onPressed, and the page
/// itself last, drawn as the current page, no link, a chevron between each two, excluded from
/// semantics. Past [maxItems] (5) the middle collapses to an ellipsis that opens a
/// SolarDropdownMenu of the pages it hides, as SOLAR's description says. For progress through steps
/// use a Stepper.
library;

import 'package:flutter/material.dart';

import '../generated/components/breadcrumb_item.dart';
import '../generated/components/breadcrumbs.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import 'solar_breadcrumb_item.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';
import 'solar_theme_of.dart';

class SolarBreadcrumbs extends StatelessWidget {
  const SolarBreadcrumbs({
    super.key,
    required this.children,
    this.maxItems = 5,
    this.expandLabel = 'Show the hidden pages',
  });

  /// The trail: SolarBreadcrumbItems, the page's ancestors from the top, and the page itself last.
  final List<SolarBreadcrumbItem> children;

  /// The longest trail shown whole; past it, the middle collapses to an ellipsis.
  final int maxItems;

  /// The ellipsis's name, for a screen reader.
  final String expandLabel;

  /// The layer Figma draws each item in by its place, and each chevron by its.
  static const _items = ['item1', 'item2', 'item3', 'item4'];
  static const _chevrons = [
    'iconChevronRight',
    'iconChevronRight2',
    'iconChevronRight3',
    'iconChevronRight4',
  ];

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarBreadcrumbsProps();
    const states = <WidgetState>{};
    // Past its longest, the first page, an ellipsis for the middle, and the current page.
    final collapsed = children.length > (maxItems < 2 ? 2 : maxItems);
    final hidden = collapsed
        ? children.sublist(1, children.length - 1)
        : const <SolarBreadcrumbItem>[];
    final current = children.last;
    final shown = <Widget>[
      if (collapsed) ...[
        children.first,
        SolarMenuAnchor(
          menu: SolarDropdownMenu(
            children: [
              for (final page in hidden)
                SolarDropdownItem(label: page.label, onPressed: page.onPressed),
            ],
          ),
          builder: (context, menu) => Semantics(
            label: expandLabel,
            child: SolarBreadcrumbItem(label: '…', onPressed: menu.open),
          ),
        ),
      ] else
        ...children.take(children.length - 1),
      SolarBreadcrumbItem(
        type: SolarBreadcrumbItemType.current,
        label: current.label,
      ),
    ];
    final last = shown.length - 1;
    String itemAt(int i) => i == last
        ? 'current'
        : _items[i < _items.length ? i : _items.length - 1];
    String chevronAt(int i) =>
        _chevrons[i < _chevrons.length ? i : _chevrons.length - 1];
    // Each item drawn in the layer Figma draws at its place, and each chevron in its.
    final parts = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarBreadcrumbsRecipe.lookup(c, p, states),
        dimension: (c) => SolarBreadcrumbsRecipe.dimension(c, p, states),
        color: (c) => SolarBreadcrumbsRecipe.color(t, c, p, states),
        shadow: (c) => SolarBreadcrumbsRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarBreadcrumbsRecipe.textStyle(t, c, p, states),
        present: (_) => true,
        glyph: (_) => null,
      ),
      tree: SolarBreadcrumbsRecipe.tree,
      keyPrefix: 'breadcrumbs',
      icons: const {
        'iconChevronRight': SolarIcons.chevronRightOutline,
        'iconChevronRight2': SolarIcons.chevronRightOutline,
        'iconChevronRight3': SolarIcons.chevronRightOutline,
        'iconChevronRight4': SolarIcons.chevronRightOutline,
      },
      composed: {for (var i = 0; i < shown.length; i++) itemAt(i): shown[i]},
    );
    return SolarLayers(
      recipe: parts.recipe,
      tree: SolarBreadcrumbsRecipe.tree,
      keyPrefix: 'breadcrumbs',
      content: {
        'root': [
          for (var i = 0; i < shown.length; i++) ...[
            if (i > 0) ExcludeSemantics(child: parts.layer(chevronAt(i - 1))),
            parts.layer(itemAt(i)),
          ],
        ],
      },
    ).layer('root');
  }
}
