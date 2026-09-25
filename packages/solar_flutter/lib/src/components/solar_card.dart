/// SOLAR Card.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarCardRecipe.tree]. What
/// it looks like is not here. That is the recipe, [SolarCardRecipe]: the surface’s fill, edge,
/// shadow and focus ring by status and state, its words’ and icons’ ink, the Tag it shows, and the
/// placeholders, read cell by cell.
///
/// The raised surface of the card family, for a titled piece of content: its [title], an [icon]
/// before it and a [helper] after it, the content (the [description], in Figma's words' look, then
/// the caller's children), a [tag] (a SOLAR Tag's words, in the status's look), and a More menu of
/// [moreItems]. Given [onPressed], it is pressable: its title is the button or link, named by its
/// words, and its hit area the whole card, so the More menu and the content's own controls stay
/// reachable above it; it is hovered and focused only then. [loading] draws Figma's placeholders,
/// announced busy. For a whole-surface action with a call to action use an Action Card; for a
/// grouping inside a larger surface, a Container. Drawn from Figma's layer tree with [SolarLayers];
/// pressable, the whole card is its button, named by its title, and its own controls are controls
/// of their own inside it.
library;

import 'package:flutter/material.dart';

import '../generated/components/card.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';
import '../generated/components/tag.dart';
import 'solar_tag.dart';
import 'solar_theme_of.dart';

/// One action of a card's More menu (a SolarCard's, and every card's with one).
class SolarCardMoreItem {
  const SolarCardMoreItem({
    required this.label,
    required this.onSelected,
    this.disabled = false,
    this.icon,
  });

  /// Its words.
  final String label;

  /// Called when it is chosen; the menu closes first.
  final VoidCallback onSelected;

  final bool disabled;

  /// An icon before its words.
  final Widget? icon;
}

class SolarCard extends StatelessWidget {
  const SolarCard({
    super.key,
    required this.title,
    this.disabled = false,
    this.status = SolarCardStatus.none,
    this.loading = false,
    this.icon,
    this.helper,
    this.description,
    this.tag,
    this.children = const [],
    this.moreItems,
    this.moreLabel = 'More actions',
    this.onPressed,
    this.statesController,
  });

  final bool disabled;

  final SolarCardStatus status;

  final bool loading;

  /// What the card is, in a few words; its action’s name where it is pressable.
  final String title;

  /// An icon before the title.
  final Widget? icon;

  /// A word after the title (a count, a date).
  final String? helper;

  /// The content’s words, in the look Figma draws them.
  final String? description;

  /// A SOLAR Tag’s words, drawn in the status’s look.
  final String? tag;

  /// The caller's content, after the description.
  final List<Widget> children;

  /// The More menu's actions: a button opens them.
  final List<SolarCardMoreItem>? moreItems;

  /// The More button's accessible name.
  final String moreLabel;

  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final rows = moreItems;
    if (rows == null || rows.isEmpty) return _card(context, null);
    // Its own menu, under the More button.
    return SolarMenuAnchor(
      menu: SolarDropdownMenu(
        children: [
          for (final item in rows)
            Builder(
              builder: (context) => SolarDropdownItem(
                label: item.label,
                icon: item.icon,
                onPressed: item.disabled
                    ? null
                    : () {
                        MenuController.maybeOf(context)?.close();
                        item.onSelected();
                      },
              ),
            ),
        ],
      ),
      builder: (context, controller) => _card(
        context,
        () => controller.isOpen ? controller.close() : controller.open(),
      ),
    );
  }

  Widget _card(BuildContext context, VoidCallback? onMore) {
    final t = solarThemeOf(context);
    // Figma draws a loading card, and a disabled one, with no status: its look is the same for all.
    final p = SolarCardProps(
      disabled: disabled,
      status: loading || disabled ? SolarCardStatus.none : status,
      loading: loading,
    );
    // Pressable while it loads too, as Figma draws a loading card hovered.
    final pressable = onPressed != null && !disabled;
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => SolarCardRecipe.lookup(c, p, states),
        dimension: (c) => SolarCardRecipe.dimension(c, p, states),
        color: (c) => SolarCardRecipe.color(t, c, p, states),
        shadow: (c) => SolarCardRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCardRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn, and one Figma hides at rest is drawn where it is given.
        present: (l) => switch (l) {
          'icon' => icon != null,
          'helper' => helper != null,
          'description' =>
            description != null && SolarCardRecipe.present(l, p, states),
          'tag' => tag != null && SolarCardRecipe.present(l, p, states),
          'more' => onMore != null && SolarCardRecipe.present(l, p, states),
          _ => SolarCardRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: SolarCardRecipe.tree,
        keyPrefix: 'card',
        text: {
          'titleTitle': title,
          'helper': ?helper,
          'description': ?description,
        },
        wraps: const {
          'titleTitle': TextAlign.start,
          'description': TextAlign.start,
        },
        slots: {'icon': ?icon},
        icons: const {'more': SolarIcons.moreOutline},
        content: content,
        builders: {
          'more': (glyph) => SolarTarget.inside(
            child: Semantics(
              // A node of its own, so the control keeps its name inside the card's.
              container: true,
              child: SolarPressable(
                onPressed: disabled ? null : onMore,
                builder: (_, _) => Semantics(
                  label: moreLabel,
                  excludeSemantics: true,
                  child: glyph,
                ),
              ),
            ),
          ),
        },
        composed: {
          // A SOLAR Tag, in the variant the recipe names, on the fill it draws it on; loading, it is the
          // Tag's placeholder, its words drawn in no ink, keeping their room.
          'tag': ExcludeSemantics(
            excluding: loading,
            child: SolarTag(
              status: SolarTagStatus.values.byName(
                (SolarCardRecipe.lookup('tag.variant.status', p, states) ??
                        'k:neutral')
                    .substring(2),
              ),
              invert:
                  SolarCardRecipe.lookup('tag.variant.invert', p, states) ==
                  'k:true',
              label: tag,
              restyle: {
                'root.background': SolarCardRecipe.color(
                  t,
                  'tag.background',
                  p,
                  states,
                ),
                if (loading) 'label.color': Colors.transparent,
              },
            ),
          ),
        },
      );
      final figma = layers(const {});
      return layers(
        loading
            ? const {}
            : {
                'content': [
                  if (description != null) figma.layer('description'),
                  ...children,
                ],
              },
      ).layer('root');
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
                      !['titleTitle']
                          .any((l) => SolarCardRecipe.present(l, p, states))
                  ? title
                  : null,
              child: draw(states),
            ),
          )
        : draw({if (disabled) WidgetState.disabled});
    return Semantics(
      container: true,
      // Loading, it says so, as the web's aria-busy does.
      label: loading ? 'Loading' : null,
      // Disabled, it says so, as the web's aria-disabled does.
      enabled: disabled ? false : null,
      child: mark,
    );
  }
}
