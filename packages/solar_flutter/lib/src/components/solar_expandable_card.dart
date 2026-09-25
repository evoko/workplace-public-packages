/// SOLAR Expandable Card.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarExpandableCardRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarExpandableCardRecipe]: the card's edge, shadow and focus ring by state, its header and
/// content, collapsed and expanded, read cell by cell.
///
/// A card whose content shows on demand: its header (the [title] and a chevron) is a button that
/// shows and hides the content under it (the [description], in Figma's words' look, then the
/// caller's children), announced expanded or collapsed. The card is hovered and focused as its
/// header is. [expanded] and [onExpandedChanged] hold whether it is expanded. Drawn from Figma's
/// layer tree with [SolarLayers].
library;

import 'package:flutter/material.dart';

import '../generated/components/expandable_card.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarExpandableCard extends StatefulWidget {
  const SolarExpandableCard({
    super.key,
    required this.title,
    this.expanded = false,
    this.onExpandedChanged,
    this.description,
    this.children = const [],
    this.statesController,
  });

  /// What the card is about: its header's words, which name its button.
  final String title;

  final bool expanded;

  /// Called with whether it is to be expanded, as its header is pressed; null disables it.
  final ValueChanged<bool>? onExpandedChanged;

  /// The content's words, in the look Figma draws them.
  final String? description;

  /// The caller's content, after the description.
  final List<Widget> children;

  /// Its header's states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  State<SolarExpandableCard> createState() => _SolarExpandableCardState();
}

class _SolarExpandableCardState extends State<SolarExpandableCard> {
  WidgetStatesController? _own;

  /// The header's states, which the whole card is drawn in.
  WidgetStatesController get _states =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarExpandableCardProps(expanded: w.expanded);
    return ListenableBuilder(
      listenable: _states,
      builder: (context, _) {
        final states = _states.value;
        SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarExpandableCardRecipe.lookup(c, p, states),
            dimension: (c) => SolarExpandableCardRecipe.dimension(c, p, states),
            color: (c) => SolarExpandableCardRecipe.color(t, c, p, states),
            shadow: (c) => SolarExpandableCardRecipe.shadow(t, c, p, states),
            textStyle: (c) =>
                SolarExpandableCardRecipe.textStyle(t, c, p, states),
            // A slot left empty is not drawn.
            present: (l) => l == 'description'
                ? w.description != null &&
                      SolarExpandableCardRecipe.present(l, p, states)
                : SolarExpandableCardRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: SolarExpandableCardRecipe.tree,
          keyPrefix: 'expandableCard',
          text: {'title': w.title, 'description': ?w.description},
          wraps: const {
            'title': TextAlign.start,
            'description': TextAlign.start,
          },
          icons: const {
            'iconChevronDown': SolarIcons.chevronDownOutline,
            'iconChevronUp': SolarIcons.chevronUpOutline,
          },
          content: content,
          builders: {
            // The header is the disclosure's button, in whose states the card is drawn.
            'header': (header) => Semantics(
              expanded: w.expanded,
              child: SolarPressable(
                onPressed: w.onExpandedChanged == null
                    ? null
                    : () => w.onExpandedChanged!(!w.expanded),
                statesController: _states,
                builder: (_, _) => header,
              ),
            ),
          },
        );
        // The content: Figma's description, then the caller's children.
        final figma = layers(const {});
        return layers(
          w.expanded
              ? {
                  'content': [
                    if (w.description != null) figma.layer('description'),
                    ...w.children,
                  ],
                }
              : const {},
        ).layer('root');
      },
    );
  }
}
