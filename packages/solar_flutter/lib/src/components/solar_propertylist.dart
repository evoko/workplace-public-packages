/// SOLAR PropertyList.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarPropertyListRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarPropertyListRecipe]: the list's
/// surface, edge and corners, in a card or not, read cell by cell.
///
/// The container of an entity's read-only label–value pairs, drawn from Figma's layer tree with
/// [SolarLayers]: the caller's SolarPropertyRows ([children]), a SolarDivider between each two
/// unless [dividers] is false, read as a list. [inCard] draws it as Figma's in-card list, surfaced
/// and edged, and its rows with it. For editable fields use a form; for tabular data a Table.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/propertylist.dart';
import '../solar_layers.dart';
import 'solar_divider.dart';
import 'solar_theme_of.dart';

/// Marks what is inside a PropertyList: a row takes the list's in-card look.
///
/// Hand written: the list provides it, and the rows read it.
class SolarPropertyListScope extends InheritedWidget {
  const SolarPropertyListScope({
    super.key,
    required this.inCard,
    required super.child,
  });

  /// Whether the list is drawn in a card.
  final bool inCard;

  /// The in-card look of the list around [context]; null outside one.
  static bool? inCardOf(BuildContext context) => context
      .dependOnInheritedWidgetOfExactType<SolarPropertyListScope>()
      ?.inCard;

  @override
  bool updateShouldNotify(SolarPropertyListScope oldWidget) =>
      inCard != oldWidget.inCard;
}

class SolarPropertyList extends StatelessWidget {
  const SolarPropertyList({
    super.key,
    this.inCard = true,
    required this.children,
    this.dividers = true,
  });

  final bool inCard;

  /// The rows: SolarPropertyRows.
  final List<Widget> children;

  /// Whether a SolarDivider goes between each two rows, as Figma draws them.
  final bool dividers;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarPropertyListProps(inCard: inCard);
    const states = <WidgetState>{};
    final items = <Widget>[
      for (final (i, row) in children.indexed) ...[
        if (dividers && i > 0) const ExcludeSemantics(child: SolarDivider()),
        Semantics(role: SemanticsRole.listItem, child: row),
      ],
    ];
    return SolarPropertyListScope(
      inCard: inCard,
      child: Semantics(
        role: SemanticsRole.list,
        explicitChildNodes: true,
        child: SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarPropertyListRecipe.lookup(c, p, states),
            dimension: (c) => SolarPropertyListRecipe.dimension(c, p, states),
            color: (c) => SolarPropertyListRecipe.color(t, c, p, states),
            shadow: (c) => SolarPropertyListRecipe.shadow(t, c, p, states),
            textStyle: (c) =>
                SolarPropertyListRecipe.textStyle(t, c, p, states),
            present: (l) => SolarPropertyListRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: SolarPropertyListRecipe.tree,
          keyPrefix: 'propertyList',
          content: {'items': items},
        ).layer('root'),
      ),
    );
  }
}
