/// SOLAR Alert Small.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Alert Small` from
/// spec/components/alert-small.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarAlertSmallRecipe]: each type’s fill, edge
/// and words, filled or outlined, and the StatusIndicator it shows, read cell by cell.
///
/// A callout in the page, of a status: a title, a description and one action, each shown where it
/// is given, beside the StatusIndicator of its type. It is announced as it appears, at once where
/// it warns or reports a danger. The compact callout, for cards and panels where an Alert is too
/// tall. Bespoke: drawn from Figma's layer tree with [SolarLayers].
library;

import 'package:flutter/material.dart';

import '../generated/components/alert_small.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';

class SolarAlertSmall extends StatelessWidget {
  const SolarAlertSmall({
    super.key,
    this.type = SolarAlertSmallType.success,
    this.variant = SolarAlertSmallVariant.filled,
    this.title,
    this.description,
    this.action,
    this.onAction,
  });

  final SolarAlertSmallType type;
  final SolarAlertSmallVariant variant;

  /// What happened, in a few words.
  final String? title;

  /// What it means, and what to do.
  final String? description;

  /// The one action's words, which call [onAction].
  final String? action;

  /// Called by the action.
  final VoidCallback? onAction;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['statusIndicator', 'content', 'action'],
    'content': ['title', 'description'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarAlertSmallProps(type: type, variant: variant);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarAlertSmallRecipe.lookup(c, p, states),
        dimension: (c) => SolarAlertSmallRecipe.dimension(c, p, states),
        color: (c) => SolarAlertSmallRecipe.color(t, c, p, states),
        shadow: (c) => SolarAlertSmallRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarAlertSmallRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'title' => title != null,
          'description' => description != null,
          'action' => action != null,
          _ => SolarAlertSmallRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'alertSmall',
      text: {'title': ?title, 'description': ?description, 'action': ?action},
      builders: {
        'action': (words) => Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(onPressed: onAction, builder: (_, _) => words),
        ),
      },
      composed: {
        'statusIndicator': ExcludeSemantics(
          child: SolarStatusIndicator(
            type: SolarStatusIndicatorType.values.byName(
              SolarAlertSmallRecipe.lookup(
                'statusIndicator.variant.type',
                p,
                states,
              )!.substring(2),
            ),
            size: SolarStatusIndicatorSize.values.byName(
              SolarAlertSmallRecipe.lookup(
                'statusIndicator.variant.size',
                p,
                states,
              )!.substring(2),
            ),
          ),
        ),
      },
    ).layer('root');
    return Semantics(container: true, liveRegion: true, child: mark);
  }
}
