/// SOLAR Launch Card.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarLaunchCardRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarLaunchCardRecipe]: the card’s fill, edge, radius and focus ring, its image’s frame, and
/// its words’ ink, read cell by cell.
///
/// An app to open, on a launcher: its [image] (a picture across its top), its [appIcon] and [name],
/// a [tag] (a SOLAR Tag's words), its [body], and the caller's [actions] (a SOLAR Button Group:
/// Open and Learn more, or Request access). Its [favourite] (the caller's Icon Button, sm, round
/// and tertiary) sits on the image, or beside its name where it has none. Given [onClick] or
/// [href], it is pressable: its name is the button or link, and its hit area the whole card, its
/// actions and favourite reachable above it; it is focused only then. Drawn from Figma's layer tree
/// with [SolarLayers]; pressable, the whole card is its button, named by its name, and its own
/// controls are controls of their own inside it.
library;

import 'package:flutter/material.dart';

import '../generated/components/launch_card.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../generated/components/tag.dart';
import 'solar_tag.dart';
import 'solar_theme_of.dart';

class SolarLaunchCard extends StatelessWidget {
  const SolarLaunchCard({
    super.key,
    required this.name,

    this.body,
    this.appIcon,
    this.tag,
    this.actions,
    this.favourite,
    this.image,
    this.onPressed,
    this.statesController,
  });

  /// The app’s name; its action’s name where it is pressable.
  final String name;

  /// What it does, in a few lines.
  final String? body;

  /// The app’s icon: an App Icon of the assets, as an image.
  final Widget? appIcon;

  /// A SOLAR Tag’s words (“New”).
  final String? tag;

  /// The caller’s actions: a SOLAR Button Group, horizontal.
  final Widget? actions;

  /// The caller’s favourite, an Icon Button (sm, round, tertiary): on the image, or beside the name where it has none.
  final Widget? favourite;

  /// The picture across its top, by its address.
  final ImageProvider? image;

  /// Makes it pressable: the whole card is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarLaunchCardProps();
    final pressable = onPressed != null;
    Widget draw(Set<WidgetState> states) {
      final recipe = SolarLayerRecipe(
        lookup: (c) => SolarLaunchCardRecipe.lookup(c, p, states),
        dimension: (c) => SolarLaunchCardRecipe.dimension(c, p, states),
        color: (c) => SolarLaunchCardRecipe.color(t, c, p, states),
        shadow: (c) => SolarLaunchCardRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarLaunchCardRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn, and one Figma hides at rest is drawn where it is given.
        present: (l) => switch (l) {
          'bodyText' =>
            body != null && SolarLaunchCardRecipe.present(l, p, states),
          'appIcon' =>
            appIcon != null && SolarLaunchCardRecipe.present(l, p, states),
          'tag' => tag != null,
          'actions' =>
            actions != null && SolarLaunchCardRecipe.present(l, p, states),
          'image' =>
            image != null && SolarLaunchCardRecipe.present(l, p, states),
          'favourite' => favourite != null && image != null,
          'favouriteNoImage' => favourite != null && image == null,
          _ => SolarLaunchCardRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      );
      SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
        recipe: recipe,
        tree: SolarLaunchCardRecipe.tree,
        keyPrefix: 'launchCard',
        text: {'name': name, 'bodyText': ?body},
        wraps: const {'bodyText': TextAlign.start},
        slots: {'appIcon': ?appIcon, 'actions': ?actions},
        content: content,
        images: {
          if (image != null)
            'image': DecorationImage(image: image!, fit: BoxFit.cover),
        },
        clips: const {'root'},
        composed: {
          // The favourite, the caller's Icon Button, on the image or beside the name.
          'favourite': ?favourite,
          'favouriteNoImage': ?favourite,
          // A SOLAR Tag, as Figma draws it here: success, its words alone.
          'tag': SolarTag(status: SolarTagStatus.success, label: tag),
        },
      );
      return layers(const {}).layer('root');
    }

    final Widget mark = pressable
        ? SolarPressable(
            onPressed: onPressed,
            statesController: statesController,
            builder: (_, states) => draw(states),
          )
        : draw({});
    return Semantics(container: true, child: mark);
  }
}
