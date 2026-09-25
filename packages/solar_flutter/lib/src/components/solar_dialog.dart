/// SOLAR Dialog.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarDialogRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarDialogRecipe]: the surface, its
/// header and footer, and its words' text styles, read cell by cell.
///
/// A dialog's surface, drawn from Figma's layer tree with [SolarLayers]; [showSolarDialog] shows it
/// modally, centred over the Scrim's colour, Escape and a tap on the Scrim closing it and the focus
/// returning to where it was, as the description says. Read as a dialog named by its [title]. Its
/// type follows from what it is given (owner decision 2026-09-25): an [image] makes the image
/// dialog, its title and [description] under the picture; a [stepper] (a SolarStepper) the wizard;
/// neither the default, its [icon] before its title. Its [content] is the caller's, its footer
/// [actions] (a SolarButtonGroup), and its close button its own, drawn where it is given [onClose].
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/dialog.dart';
import '../generated/components/icon_button.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_layers.dart';
import 'solar_icon_button.dart';
import 'solar_scrim.dart';
import 'solar_theme_of.dart';

/// Shows [builder]'s SolarDialog modally, centred over the Scrim's colour; a tap on the Scrim
/// closes it where [dismissible]. Completes with what the dialog pops.
Future<T?> showSolarDialog<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  bool dismissible = true,
}) => showDialog<T>(
  context: context,
  barrierColor: solarScrimColor(context),
  barrierDismissible: dismissible,
  builder: (context) => Center(child: builder(context)),
);

/// A dialog's or a drawer's close button: an md tertiary SolarIconButton showing Icon/Close, named
/// [label] for a screen reader; round, as a dialog's, or [shape] square, as a drawer's.
Widget solarCloseButton({
  required VoidCallback? onPressed,
  required String label,
  SolarIconButtonShape shape = SolarIconButtonShape.round,
}) => SolarIconButton(
  onPressed: onPressed,
  size: SolarIconButtonSize.md,
  shape: shape,
  prio: SolarIconButtonPrio.tertiary,
  semanticLabel: label,
  icon: Builder(
    builder: (context) {
      final theme = IconTheme.of(context);
      return SolarIcon(
        SolarIcons.closeOutline,
        size: theme.size,
        color: theme.color,
      );
    },
  ),
);

class SolarDialog extends StatelessWidget {
  const SolarDialog({
    super.key,
    required this.title,
    this.icon,
    this.stepper,
    this.image,
    this.description,
    this.content,
    this.actions,
    this.onClose,
    this.closeLabel = 'Close',
  });

  /// Its title, which names it.
  final String title;

  /// An icon before its title.
  final Widget? icon;

  /// A SolarStepper (line+text) under its title: a wizard.
  final Widget? stepper;

  /// A picture over its content: an image dialog, its title under it.
  final ImageProvider? image;

  /// An image dialog's words under its title.
  final String? description;

  /// Its content.
  final Widget? content;

  /// Its footer: a SolarButtonGroup (full-width).
  final Widget? actions;

  /// Called to close it: its close button. Given, its close button shows.
  final VoidCallback? onClose;

  /// What its close button says to a screen reader.
  final String closeLabel;

  SolarDialogType get _type => image != null
      ? SolarDialogType.image
      : stepper != null
      ? SolarDialogType.wizard
      : SolarDialogType.$default;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarDialogProps(type: _type);
    const states = <WidgetState>{};
    Widget close() => solarCloseButton(onPressed: onClose, label: closeLabel);
    bool drawn(String l) => SolarDialogRecipe.present(l, p, states);
    // The caller's content follows the image dialog's own title and words, drawn by these layers.
    late final SolarLayers layers;
    Widget own(String layer) => Builder(builder: (_) => layers.layer(layer));
    layers = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarDialogRecipe.lookup(c, p, states),
        dimension: (c) => SolarDialogRecipe.dimension(c, p, states),
        color: (c) => SolarDialogRecipe.color(t, c, p, states),
        shadow: (c) => SolarDialogRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarDialogRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn; its close button only where it can close.
        present: (l) => switch (l) {
          'icon' || 'leading' => icon != null && drawn(l),
          'close' || 'imageClose' => onClose != null && drawn(l),
          'description' => description != null && drawn(l),
          'actions' => actions != null && drawn(l),
          _ => drawn(l),
        },
        glyph: (_) => null,
      ),
      tree: SolarDialogRecipe.tree,
      keyPrefix: 'dialog',
      text: {'title': title, 'imageTitle': title, 'description': ?description},
      wraps: const {
        'title': TextAlign.start,
        'imageTitle': TextAlign.center,
        'description': TextAlign.center,
      },
      slots: {'icon': ?icon},
      images: {
        if (image != null)
          'modalImage': DecorationImage(image: image!, fit: BoxFit.cover),
      },
      content: {
        'content': [
          if (drawn('imageTitle')) own('imageTitle'),
          if (description != null && drawn('description')) own('description'),
          ?content,
        ],
      },
      composed: {
        'close': close(),
        'imageClose': close(),
        'stepper': ?stepper,
        'actions': ?actions,
      },
      clips: const {'root'},
    );
    final surface = layers.layer('root');
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
