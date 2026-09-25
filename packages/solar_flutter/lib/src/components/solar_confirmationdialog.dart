/// SOLAR ConfirmationDialog.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarConfirmationDialogRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarConfirmationDialogRecipe]: the surface, its padding and its words' text styles, read cell
/// by cell.
///
/// A dialog for an action that needs explicit approval, as the description says, drawn from Figma's
/// layer tree with [SolarLayers]: its [title], its [description], and its own two lg SolarButtons in
/// a full-width SolarButtonGroup, [cancelLabel] (secondary, [onCancel]) and [confirmLabel]
/// (primary, [onConfirm]), the confirm Button danger where the [intent] is. Shown modally by
/// [showSolarDialog], read as an alert dialog named by its title.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/button.dart';
import '../generated/components/button_group.dart';
import '../generated/components/confirmationdialog.dart';
import '../solar_layers.dart';
import 'solar_button.dart';
import 'solar_button_group.dart';
import 'solar_theme_of.dart';

class SolarConfirmationDialog extends StatelessWidget {
  const SolarConfirmationDialog({
    super.key,
    this.intent = SolarConfirmationDialogIntent.$default,
    required this.title,
    this.description,
    this.confirmLabel = 'Continue',
    this.cancelLabel = 'Cancel',
    required this.onConfirm,
    required this.onCancel,
  });

  final SolarConfirmationDialogIntent intent;

  /// What it asks.
  final String title;

  /// What happens if the action goes ahead.
  final String? description;

  /// Its confirm Button's words.
  final String confirmLabel;

  /// Its cancel Button's words.
  final String cancelLabel;

  /// Called when the action is confirmed.
  final VoidCallback? onConfirm;

  /// Called when it is cancelled, by its cancel Button.
  final VoidCallback? onCancel;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarConfirmationDialogProps(intent: intent);
    const states = <WidgetState>{};
    final surface = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarConfirmationDialogRecipe.lookup(c, p, states),
        dimension: (c) => SolarConfirmationDialogRecipe.dimension(c, p, states),
        color: (c) => SolarConfirmationDialogRecipe.color(t, c, p, states),
        shadow: (c) => SolarConfirmationDialogRecipe.shadow(t, c, p, states),
        textStyle: (c) =>
            SolarConfirmationDialogRecipe.textStyle(t, c, p, states),
        present: (l) => l == 'description'
            ? description != null
            : SolarConfirmationDialogRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarConfirmationDialogRecipe.tree,
      keyPrefix: 'confirmationDialog',
      text: {'title': title, 'description': ?description},
      wraps: const {'title': TextAlign.start, 'description': TextAlign.start},
      composed: {
        'buttonGroup': SolarButtonGroup(
          type: SolarButtonGroupType.fullWidth,
          children: [
            SolarButton(
              size: SolarButtonSize.lg,
              prio: SolarButtonPrio.secondary,
              onPressed: onCancel,
              child: Text(cancelLabel),
            ),
            SolarButton(
              size: SolarButtonSize.lg,
              prio: SolarButtonPrio.primary,
              danger: intent == SolarConfirmationDialogIntent.danger,
              onPressed: onConfirm,
              child: Text(confirmLabel),
            ),
          ],
        ),
      },
      clips: const {'root'},
    ).layer('root');
    return Semantics(
      role: SemanticsRole.alertDialog,
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: title,
      child: Material(type: MaterialType.transparency, child: surface),
    );
  }
}
