/// SOLAR Insight Card Small.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarInsightCardSmallRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarInsightCardSmallRecipe]: the surface’s edge, shadow and focus ring by state, the
/// severity’s tile, its words, the StatusIndicator it shows, and the placeholders, read cell by
/// cell.
///
/// One insight, in a narrow panel or a summary: the StatusIndicator of its [severity] in a tile,
/// named by [severityLabel] (its severity's word by default), and its [title] and [description].
/// Given [onPressed], it is pressable: its title is the button or link, and its hit area the whole
/// card; it is hovered and focused only then. [loading] draws Figma's placeholders, announced busy.
/// For one with a menu, selectable in a list, use an Insight Card. Drawn from Figma's layer tree
/// with [SolarLayers]; pressable, the whole card is its button, named by its title, and its own
/// controls are controls of their own inside it.
library;

import 'package:flutter/material.dart';

import '../generated/components/insight_card_small.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';

class SolarInsightCardSmall extends StatelessWidget {
  const SolarInsightCardSmall({
    super.key,
    required this.title,
    this.severity = SolarInsightCardSmallSeverity.success,
    this.loading = false,
    this.description,
    this.severityLabel,
    this.onPressed,
    this.statesController,
  });

  final SolarInsightCardSmallSeverity severity;

  final bool loading;

  /// What the insight is, in a few words; its action’s name where it is pressable.
  final String title;

  /// What it means.
  final String? description;

  /// The severity’s name, which the StatusIndicator announces; its word by default.
  final String? severityLabel;

  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Figma draws a loading one, with no status: its look is the same for all.
    final p = SolarInsightCardSmallProps(
      severity: loading ? SolarInsightCardSmallSeverity.info : severity,
      loading: loading,
    );
    // Pressable while it loads too, as Figma draws a loading card hovered.
    final pressable = onPressed != null;
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => SolarInsightCardSmallRecipe.lookup(c, p, states),
        dimension: (c) => SolarInsightCardSmallRecipe.dimension(c, p, states),
        color: (c) => SolarInsightCardSmallRecipe.color(t, c, p, states),
        shadow: (c) => SolarInsightCardSmallRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarInsightCardSmallRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'description' =>
            description != null &&
                SolarInsightCardSmallRecipe.present(l, p, states),
          _ => SolarInsightCardSmallRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: SolarInsightCardSmallRecipe.tree,
        keyPrefix: 'insightCardSmall',
        text: {'title': title, 'description': ?description},
        content: content,
        composed: {
          // The mark is a StatusIndicator, in the type the recipe names, named by the severity's word.
          'statusIndicator': SolarStatusIndicator(
            type: SolarStatusIndicatorType.values.byName(
              SolarInsightCardSmallRecipe.lookup(
                'statusIndicator.variant.type',
                p,
                states,
              )!.substring(2),
            ),
            size: SolarStatusIndicatorSize.values.byName(
              SolarInsightCardSmallRecipe.lookup(
                'statusIndicator.variant.size',
                p,
                states,
              )!.substring(2),
            ),
            label:
                severityLabel ??
                '${severity.name[0].toUpperCase()}${severity.name.substring(1)}',
          ),
        },
      );
      return layers(const {}).layer('root');
    }

    final Widget mark = pressable
        ? SolarPressable(
            onPressed: onPressed,
            statesController: statesController,
            builder: (_, states) => Semantics(
              // Loading, where its title is not drawn (Card's; a Device Card's is), the button is
              // named by it all the same.
              label:
                  loading &&
                      !['title'].any(
                        (l) =>
                            SolarInsightCardSmallRecipe.present(l, p, states),
                      )
                  ? title
                  : null,
              child: draw(states),
            ),
          )
        : draw({});
    return Semantics(
      container: true,
      // Loading, it says so, as the web's aria-busy does.
      label: loading ? 'Loading' : null,
      child: mark,
    );
  }
}
