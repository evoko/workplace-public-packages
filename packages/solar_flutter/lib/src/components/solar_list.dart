/// SOLAR List.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarListRecipe.tree]. What
/// it looks like is not here. That is the recipe, [SolarListRecipe]: the container's edge, corners
/// and shadow, in a card or not, and its rows' compactness, read cell by cell.
///
/// The container of SolarListItems, drawn from Figma's layer tree with [SolarLayers] and announced
/// as a list, a SolarDivider between each two unless [dividers] is false. [inCard] draws it as
/// Figma draws its in-card list; its rows take its compactness, as Figma draws them. For
/// navigation, settings and pickers; for data in columns, use a Table.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/list.dart';
import '../solar_layers.dart';
import '../solar_list.dart';
import 'solar_divider.dart';
import 'solar_theme_of.dart';

class SolarList extends StatelessWidget {
  const SolarList({
    super.key,
    this.inCard = true,
    required this.children,
    this.dividers = true,
  });

  final bool inCard;

  /// The rows: SolarListItems.
  final List<Widget> children;

  /// Whether a SolarDivider goes between each two rows, as Figma draws them.
  final bool dividers;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarListProps(inCard: inCard);
    const states = <WidgetState>{};
    // The rows' compactness, as the recipe says Figma draws them in this list.
    final compact =
        SolarListRecipe.lookup('listItem.variant.compact', p, states) ==
        'k:true';
    final items = <Widget>[
      for (final (i, row) in children.indexed) ...[
        Semantics(role: SemanticsRole.listItem, child: row),
        if (dividers && i < children.length - 1)
          const ExcludeSemantics(child: SolarDivider()),
      ],
    ];
    return SolarListScope(
      compact: compact,
      child: Semantics(
        role: SemanticsRole.list,
        explicitChildNodes: true,
        child: SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarListRecipe.lookup(c, p, states),
            dimension: (c) => SolarListRecipe.dimension(c, p, states),
            color: (c) => SolarListRecipe.color(t, c, p, states),
            shadow: (c) => SolarListRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarListRecipe.textStyle(t, c, p, states),
            present: (l) => SolarListRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: SolarListRecipe.tree,
          keyPrefix: 'list',
          content: {'items': items},
        ).layer('root'),
      ),
    );
  }
}
