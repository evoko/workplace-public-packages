/// SOLAR Drawer.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarDrawerRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarDrawerRecipe]: the panel, its header
/// and its content's padding, read cell by cell.
///
/// A panel for a secondary task that keeps the page in context, as the description says, drawn from
/// Figma's layer tree with [SolarLayers]: its [title] and close button (drawn where it is given
/// [onClose]), the caller's [content], and an optional footer, [actions] (a SolarButtonGroup).
/// [showSolarDrawer] slides it in from the end edge over the Scrim's colour, the focus held in it
/// and Escape closing it; it serves as a Scaffold's end drawer too. Read as a dialog named by its
/// title.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/drawer.dart';
import '../generated/components/icon_button.dart';
import '../generated/tokens.dart';
import '../solar_layers.dart';
import 'solar_dialog.dart';
import 'solar_scrim.dart';
import 'solar_theme_of.dart';

/// Slides [builder]'s SolarDrawer in from the end edge, over the Scrim's colour, over
/// motion.duration.normal (at once where the platform asks for less motion); a tap on the Scrim
/// closes it where [dismissible]. Completes with what the drawer pops.
Future<T?> showSolarDrawer<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  bool dismissible = true,
  String? barrierLabel,
}) => showGeneralDialog<T>(
  context: context,
  barrierColor: solarScrimColor(context),
  barrierDismissible: dismissible,
  barrierLabel:
      barrierLabel ??
      MaterialLocalizations.of(context).modalBarrierDismissLabel,
  transitionDuration: MediaQuery.disableAnimationsOf(context)
      ? SolarMotion.durationInstant
      : SolarMotion.durationNormal,
  pageBuilder: (context, _, _) =>
      Align(alignment: AlignmentDirectional.centerEnd, child: builder(context)),
  transitionBuilder: (context, animation, _, child) => SlideTransition(
    position: Tween(
      begin: const Offset(1, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: animation, curve: SolarMotion.easeOut)),
    child: child,
  ),
);

class SolarDrawer extends StatelessWidget {
  const SolarDrawer({
    super.key,
    required this.title,
    this.content,
    this.actions,
    this.onClose,
    this.closeLabel = 'Close',
  });

  /// Its title, which names it.
  final String title;

  /// Its content.
  final Widget? content;

  /// Its footer: a SolarButtonGroup (full-width).
  final Widget? actions;

  /// Called to close it: its close button. Given, its close button shows.
  final VoidCallback? onClose;

  /// What its close button says to a screen reader.
  final String closeLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarDrawerProps();
    const states = <WidgetState>{};
    final panel = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDrawerRecipe.lookup(c, p, states),
        dimension: (c) => SolarDrawerRecipe.dimension(c, p, states),
        color: (c) => SolarDrawerRecipe.color(t, c, p, states),
        shadow: (c) => SolarDrawerRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDrawerRecipe.textStyle(t, c, p, states),
        // Its close button only where it can close; its footer where it is given one.
        present: (l) => switch (l) {
          'close' => onClose != null,
          'cta' => actions != null,
          _ => SolarDrawerRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarDrawerRecipe.tree,
      keyPrefix: 'drawer',
      text: {'title': title},
      wraps: const {'title': TextAlign.start},
      content: {
        'content': [?content],
      },
      composed: {
        'close': solarCloseButton(
          onPressed: onClose,
          label: closeLabel,
          shape: SolarIconButtonShape.square,
        ),
        'cta': ?actions,
      },
      clips: const {'root'},
    ).layer('root');
    return Semantics(
      role: SemanticsRole.dialog,
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: title,
      child: Material(type: MaterialType.transparency, child: panel),
    );
  }
}
