/// SOLAR Launch Card Full Screen.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarLaunchCardFullScreenRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarLaunchCardFullScreenRecipe]: the page’s fill, radius and padding, its image’s frame, and
/// its words’ ink, read cell by cell.
///
/// An app's page, where it is chosen from a launcher: its [image] beside its [appIcon] and
/// [favourite] (the caller's Icon Button, md, round and tertiary), its [name], its [intro], up to
/// three [features], each a paragraph, and the caller's [action] (a SOLAR Button, md, "Open") at
/// the foot of its words. Bespoke: drawn from Figma's layer tree with [SolarLayers].
library;

import 'package:flutter/material.dart';

import '../generated/components/launch_card_full_screen.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarLaunchCardFullScreen extends StatelessWidget {
  const SolarLaunchCardFullScreen({
    super.key,
    required this.name,
    this.intro,
    this.features = const [],
    this.image,
    this.appIcon,
    this.favourite,
    this.action,
  });

  /// The app's name.
  final String name;

  /// What the app is, its first paragraph.
  final String? intro;

  /// What it does, up to three paragraphs, as Figma draws them.
  final List<String> features;

  /// The picture beside its words.
  final ImageProvider? image;

  /// The app's icon: an App Icon of the assets, as an image.
  final Widget? appIcon;

  /// The caller's favourite: an Icon Button, md, round and tertiary.
  final Widget? favourite;

  /// The caller's action: a SOLAR Button, md (“Open”).
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    assert(
      features.length <= 3,
      'A page draws up to three features, as Figma does.',
    );
    final t = solarThemeOf(context);
    const p = SolarLaunchCardFullScreenProps();
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarLaunchCardFullScreenRecipe.lookup(c, p, states),
        dimension: (c) =>
            SolarLaunchCardFullScreenRecipe.dimension(c, p, states),
        color: (c) => SolarLaunchCardFullScreenRecipe.color(t, c, p, states),
        shadow: (c) => SolarLaunchCardFullScreenRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarLaunchCardFullScreenRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'intro' =>
            intro != null &&
                SolarLaunchCardFullScreenRecipe.present(l, p, states),
          'feature' =>
            features.isNotEmpty &&
                SolarLaunchCardFullScreenRecipe.present(l, p, states),
          'feature2' =>
            features.length > 1 &&
                SolarLaunchCardFullScreenRecipe.present(l, p, states),
          'feature3' =>
            features.length > 2 &&
                SolarLaunchCardFullScreenRecipe.present(l, p, states),
          'appIcon' => appIcon != null,
          'favourite' => favourite != null,
          'action' => action != null,
          _ => SolarLaunchCardFullScreenRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarLaunchCardFullScreenRecipe.tree,
      keyPrefix: 'launchCardFullScreen',
      text: {
        'name': name,
        'intro': ?intro,
        'feature': ?(features.isNotEmpty ? features[0] : null),
        'feature2': ?(features.length > 1 ? features[1] : null),
        'feature3': ?(features.length > 2 ? features[2] : null),
      },
      slots: {'appIcon': ?appIcon, 'favourite': ?favourite, 'action': ?action},
      wraps: const {
        'name': TextAlign.start,
        'intro': TextAlign.start,
        'feature': TextAlign.start,
        'feature2': TextAlign.start,
        'feature3': TextAlign.start,
      },
      clips: const {'image'},
      images: {
        if (image != null)
          'image': DecorationImage(image: image!, fit: BoxFit.cover),
      },
    ).layer('root');
    return mark;
  }
}
