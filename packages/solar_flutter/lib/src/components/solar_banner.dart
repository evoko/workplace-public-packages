/// SOLAR Banner.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter Banner` from
/// spec/components/banner.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarBannerRecipe]: each type’s fill and icon, and
/// the message’s and action’s text styles, read cell by cell.
///
/// Bespoke: a bold, full-width message for a page or the app, more urgent than an Alert, drawn from
/// Figma's layer tree with [SolarLayers]: one line, with SOLAR's icon for its type. Offer at most
/// one action, a SolarButton ([primaryButton] or [secondaryButton], at sm) or the text [action],
/// and a close button where [onClose] is given. It is announced as it appears.
library;

import 'package:flutter/material.dart';

import '../generated/components/banner.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_icon.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarBanner extends StatelessWidget {
  const SolarBanner({
    super.key,
    this.type = SolarBannerType.neutral,
    required this.description,
    this.primaryButton,
    this.secondaryButton,
    this.action,
    this.onAction,
    this.onClose,
    this.closeLabel = 'Dismiss',
  });

  final SolarBannerType type;

  /// The message, on one line.
  final String description;

  /// A SolarButton, primary at sm, as the one action.
  final Widget? primaryButton;

  /// A SolarButton, secondary at sm, as the one action.
  final Widget? secondaryButton;

  /// The one action's words, as a link, which call [onAction].
  final String? action;

  /// Called by the text action.
  final VoidCallback? onAction;

  /// Shows a close button, which calls it.
  final VoidCallback? onClose;

  /// The close button's name.
  final String closeLabel;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': [
      'iconInfo',
      'description',
      'actionGroup',
      'close',
      'iconSuccess',
      'iconWarning',
      'iconDanger',
    ],
    'actionGroup': ['primaryButton', 'secondaryButton', 'action'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarBannerProps(type: type);
    const states = <WidgetState>{};
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarBannerRecipe.lookup(c, p, states),
        dimension: (c) => SolarBannerRecipe.dimension(c, p, states),
        color: (c) => SolarBannerRecipe.color(t, c, p, states),
        shadow: (c) => SolarBannerRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarBannerRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'primaryButton' => primaryButton != null,
          'secondaryButton' => secondaryButton != null,
          'action' => action != null,
          'close' => onClose != null,
          _ => SolarBannerRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'banner',
      text: {'description': description, 'action': ?action},
      slots: {
        'primaryButton': ?primaryButton,
        'secondaryButton': ?secondaryButton,
        // The close button, in the colour and size the recipe gives its layer.
        'close': ?(onClose == null
            ? null
            : Builder(
                builder: (context) => SolarIcon(
                  SolarIcons.closeOutline,
                  size: IconTheme.of(context).size,
                  color: IconTheme.of(context).color,
                ),
              )),
      },
      builders: {
        'action': (words) => Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
            onPressed: onAction,
            link: true,
            builder: (_, _) => words,
          ),
        ),
        'close': (close) => Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
            onPressed: onClose,
            builder: (_, _) => Semantics(
              label: closeLabel,
              excludeSemantics: true,
              child: close,
            ),
          ),
        ),
      },
      icons: const {
        'iconInfo': SolarIcons.infoOutline,
        'iconSuccess': SolarIcons.successOutline,
        'iconWarning': SolarIcons.warningOutline,
        'iconDanger': SolarIcons.dangerOutline,
      },
    ).layer('root');
    return Semantics(container: true, liveRegion: true, child: mark);
  }
}
