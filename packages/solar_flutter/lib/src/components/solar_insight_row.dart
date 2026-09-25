/// SOLAR Insight Row.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarInsightRowRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarInsightRowRecipe]: the surface’s edge, shadow and focus ring by state, the severity’s bar,
/// its words, and the placeholders, read cell by cell.
///
/// One insight on a line, in a feed or a panel (stack them in a List): its [severity]'s bar, named
/// by [severityLabel] (its severity's word by default) so it is read, not only seen, its [title]
/// and [meta] each cut short on one line, and the caller's [action] (a SOLAR Button, sm and
/// secondary as Figma draws it). Given [onPressed], it is pressable: its title is the button or
/// link, and its hit area the whole row, the action reachable above it; it is hovered and focused
/// only then. [loading] draws Figma's placeholders, announced busy. For the same as a card of its
/// own use an Insight Card. Drawn from Figma's layer tree with [SolarLayers]; pressable, the whole
/// card is its button, named by its title, and its own controls are controls of their own inside
/// it.
library;

import 'package:flutter/material.dart';

import '../generated/components/insight_row.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarInsightRow extends StatelessWidget {
  const SolarInsightRow({
    super.key,
    required this.title,
    this.severity = SolarInsightRowSeverity.success,
    this.loading = false,
    this.meta,
    this.action,
    this.severityLabel,
    this.onPressed,
    this.statesController,
  });

  final SolarInsightRowSeverity severity;

  final bool loading;

  /// What the insight is, in a few words; its action’s name where it is pressable.
  final String title;

  /// Its details, in a line.
  final String? meta;

  /// The caller’s action: a SOLAR Button, sm and secondary as Figma draws it.
  final Widget? action;

  /// The severity’s name, read where the bar is seen; its word by default.
  final String? severityLabel;

  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Figma draws a loading one, with no status: its look is the same for all.
    final p = SolarInsightRowProps(
      severity: loading ? SolarInsightRowSeverity.info : severity,
      loading: loading,
    );
    // Pressable while it loads too, as Figma draws a loading card hovered.
    final pressable = onPressed != null;
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => SolarInsightRowRecipe.lookup(c, p, states),
        dimension: (c) => SolarInsightRowRecipe.dimension(c, p, states),
        color: (c) => SolarInsightRowRecipe.color(t, c, p, states),
        shadow: (c) => SolarInsightRowRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarInsightRowRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'meta' => meta != null && SolarInsightRowRecipe.present(l, p, states),
          'action' =>
            action != null && SolarInsightRowRecipe.present(l, p, states),
          _ => SolarInsightRowRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: SolarInsightRowRecipe.tree,
        keyPrefix: 'insightRow',
        text: {'title': title, 'meta': ?meta},
        slots: {'action': ?action},
        content: content,
        truncates: const {'title', 'meta'},
        builders: {
          // The severity's bar, named by its word.
          'severityBar': (bar) => Semantics(
            label:
                severityLabel ??
                '${severity.name[0].toUpperCase()}${severity.name.substring(1)}',
            child: bar,
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
                      ![
                        'title',
                      ].any((l) => SolarInsightRowRecipe.present(l, p, states))
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
