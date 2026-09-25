/// SOLAR PropertyRow.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarPropertyRowRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarPropertyRowRecipe]: the row's padding
/// and gaps, its words' text styles, read cell by cell.
///
/// One label–value row of a PropertyList, drawn from Figma's layer tree with [SolarLayers]: an
/// optional [leading] icon, its [label] and a [description], and the control the caller gives it,
/// which carries its own states: a SolarButton ([button]), SolarToggle ([toggle]), SolarSelect
/// ([select]), SolarIconButton ([iconButton]), SolarSegmentedControl ([segmentedControl]) or
/// SolarTag ([tag]); what it is given decides its trailing, as a Column Item's content does. In a
/// SolarPropertyList it takes the list's in-card look.
library;

import 'package:flutter/material.dart';

import '../generated/components/propertyrow.dart';
import '../solar_layers.dart';
import 'solar_propertylist.dart';
import 'solar_theme_of.dart';

class SolarPropertyRow extends StatelessWidget {
  const SolarPropertyRow({
    super.key,
    this.inCard = false,
    required this.label,
    this.description,
    this.leading,
    this.button,
    this.toggle,
    this.select,
    this.iconButton,
    this.segmentedControl,
    this.tag,
  });

  final bool inCard;

  /// The property's name.
  final String label;

  /// More about it, under its name.
  final String? description;

  /// An icon before its words.
  final Widget? leading;

  /// A SolarButton (md, secondary): an action row.
  final Widget? button;

  /// A SolarToggle: a setting row.
  final Widget? toggle;

  /// A SolarSelect (md): a choice row.
  final Widget? select;

  /// A SolarIconButton (md, square, secondary): an icon row.
  final Widget? iconButton;

  /// A SolarSegmentedControl (md): a mode row.
  final Widget? segmentedControl;

  /// A SolarTag: a status row, its value.
  final Widget? tag;

  SolarPropertyRowTrailing get _trailing => button != null
      ? SolarPropertyRowTrailing.action
      : toggle != null
      ? SolarPropertyRowTrailing.toggle
      : select != null
      ? SolarPropertyRowTrailing.select
      : iconButton != null
      ? SolarPropertyRowTrailing.iconButton
      : segmentedControl != null
      ? SolarPropertyRowTrailing.segmentedControl
      : tag != null
      ? SolarPropertyRowTrailing.tag
      : SolarPropertyRowTrailing.none;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarPropertyRowProps(
      inCard: SolarPropertyListScope.inCardOf(context) ?? inCard,
      trailing: _trailing,
    );
    const states = <WidgetState>{};
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPropertyRowRecipe.lookup(c, p, states),
        dimension: (c) => SolarPropertyRowRecipe.dimension(c, p, states),
        color: (c) => SolarPropertyRowRecipe.color(t, c, p, states),
        shadow: (c) => SolarPropertyRowRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarPropertyRowRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'leading' => leading != null,
          'description' => description != null,
          _ => SolarPropertyRowRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarPropertyRowRecipe.tree,
      keyPrefix: 'propertyRow',
      text: {'label': label, 'description': ?description},
      // Its words wrap where they run out of room.
      wraps: const {'label': TextAlign.start, 'description': TextAlign.start},
      slots: {'leading': ?leading},
      composed: {
        'button': ?button,
        'toggle': ?toggle,
        'select': ?select,
        'iconButton': ?iconButton,
        'segmentedControl': ?segmentedControl,
        'tag': ?tag,
      },
    ).layer('root');
  }
}
