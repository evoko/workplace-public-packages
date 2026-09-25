/// SOLAR Split Dialog.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarSplitDialogRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarSplitDialogRecipe]: the surface, its
/// header, its panes and its foot, read cell by cell.
///
/// A dialog with two panes, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]: its [title] (and an [icon] before it), the caller's [left] and [right] content,
/// and its [actions] (a SolarButtonGroup) across its foot, or, for [SolarSplitDialogCta.regular],
/// under the left pane. Shown modally by [showSolarDialog], read as a dialog named by its title;
/// its close button drawn where it is given [onClose].
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/split_dialog.dart';
import '../solar_layers.dart';
import 'solar_dialog.dart';
import 'solar_theme_of.dart';

class SolarSplitDialog extends StatelessWidget {
  const SolarSplitDialog({
    super.key,
    this.cta = SolarSplitDialogCta.fullWidth,
    required this.title,
    this.icon,
    this.left,
    this.right,
    this.actions,
    this.onClose,
    this.closeLabel = 'Close',
  });

  final SolarSplitDialogCta cta;

  /// Its title, which names it.
  final String title;

  /// An icon before its title.
  final Widget? icon;

  /// The left pane's content: a navigation, a list, a form.
  final Widget? left;

  /// The right pane's content: results, a summary, help.
  final Widget? right;

  /// Its actions: a SolarButtonGroup, full-width across its foot, or regular under the left pane.
  final Widget? actions;

  /// Called to close it: its close button. Given, its close button shows.
  final VoidCallback? onClose;

  /// What its close button says to a screen reader.
  final String closeLabel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSplitDialogProps(cta: cta);
    const states = <WidgetState>{};
    bool drawn(String l) => SolarSplitDialogRecipe.present(l, p, states);
    final surface = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSplitDialogRecipe.lookup(c, p, states),
        dimension: (c) => SolarSplitDialogRecipe.dimension(c, p, states),
        color: (c) => SolarSplitDialogRecipe.color(t, c, p, states),
        shadow: (c) => SolarSplitDialogRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSplitDialogRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn; its close button only where it can close.
        present: (l) => switch (l) {
          'icon' || 'leading' => icon != null && drawn(l),
          'close' => onClose != null && drawn(l),
          'actions' || 'actionsRegular' => actions != null && drawn(l),
          _ => drawn(l),
        },
        glyph: (_) => null,
      ),
      tree: SolarSplitDialogRecipe.tree,
      keyPrefix: 'splitDialog',
      text: {'title': title},
      wraps: const {'title': TextAlign.start},
      slots: {'icon': ?icon},
      content: {
        'left': [?left],
        'leftRegular': [?left],
        'right': [?right],
      },
      composed: {
        'close': solarCloseButton(onPressed: onClose, label: closeLabel),
        'actions': ?actions,
        'actionsRegular': ?actions,
      },
      clips: const {'root'},
    ).layer('root');
    return Semantics(
      role: SemanticsRole.dialog,
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: title,
      child: Material(type: MaterialType.transparency, child: surface),
    );
  }
}
