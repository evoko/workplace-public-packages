/// SOLAR EmptyState.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter EmptyState` from
/// spec/components/emptystate.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarEmptyStateRecipe]: the stack’s spacing, the
/// icon’s size and colour, and the words’ text styles, read cell by cell.
///
/// Bespoke: a placeholder for a view with nothing to show, drawn from Figma's layer tree with
/// [SolarLayers]: an icon, a title, a description and one action, a SolarButton at sm, each where
/// it is given. The words carry the meaning: say why it is empty and what to do next. For something
/// still loading, use a SolarSkeleton or a SolarSpinner.
library;

import 'package:flutter/material.dart';

import '../generated/components/emptystate.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarEmptyState extends StatelessWidget {
  const SolarEmptyState({
    super.key,
    this.icon,
    this.title,
    this.description,
    this.action,
  });

  /// What is empty.
  final Widget? icon;

  /// Why it is empty, in a few words.
  final String? title;

  /// What to do next.
  final String? description;

  /// One SolarButton, secondary at sm, that does it.
  final Widget? action;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['icon', 'textContent', 'action'],
    'textContent': ['title', 'description'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarEmptyStateProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarEmptyStateRecipe.lookup(c, p, states),
        dimension: (c) => SolarEmptyStateRecipe.dimension(c, p, states),
        color: (c) => SolarEmptyStateRecipe.color(t, c, p, states),
        shadow: (c) => SolarEmptyStateRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarEmptyStateRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'icon' => icon != null,
          'title' => title != null,
          'description' => description != null,
          'action' => action != null,
          _ => SolarEmptyStateRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'emptyState',
      text: {'title': ?title, 'description': ?description},
      slots: {'icon': ?icon, 'action': ?action},
      wraps: {'title': TextAlign.center, 'description': TextAlign.center},
    ).layer('root');
    return mark;
  }
}
