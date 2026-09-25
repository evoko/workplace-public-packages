/// SOLAR FileUpload.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarFileUploadRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarFileUploadRecipe]: the drop zone's fill, edge and focus ring by state, its file's ink, and
/// the label and helper, read cell by cell.
///
/// A file to upload: its [label] above (a [mandatory] one is starred), its [helper] below (the
/// limits: "Max 10MB, .jpg .png"), which says what is wrong where it is in [error]. Flutter has no
/// file picker of its own, so the app's does the choosing: Browse and replace call [onBrowse], for
/// the app to open one (the file_picker package, say) and give back what was chosen as [value], the
/// files' names, which it shows, with replace and remove ([onRemove]) buttons. Drawn from Figma's
/// layer tree with [SolarLayers]; its Browse is a SolarButton, and replace and remove are
/// SolarIconButtons.
library;

import 'package:flutter/material.dart';

import '../generated/components/button.dart';
import '../generated/components/fileupload.dart';
import '../generated/components/icon_button.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_layers.dart';
import 'solar_button.dart';
import 'solar_icon_button.dart';
import 'solar_theme_of.dart';

class SolarFileUpload extends StatefulWidget {
  const SolarFileUpload({
    super.key,
    this.error = false,
    this.enabled = true,
    this.label,
    this.mandatory = false,
    this.helper,
    this.value = const [],
    required this.onBrowse,
    this.onRemove,
    this.placeholder = 'Select a file…',
    this.browseLabel = 'Browse',
    this.statesController,
  });

  final bool error;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;

  /// What it asks for, above it ("Upload a file").
  final String? label;

  /// Whether a file is required, which stars the label.
  final bool mandatory;

  /// More about it, below (the limits); where it is in [error], what is wrong.
  final String? helper;

  /// The names of the files the app's picker chose.
  final List<String> value;

  /// Opens the app's file picker, from Browse or replace; null disables it.
  final VoidCallback? onBrowse;

  /// Removes the files chosen.
  final VoidCallback? onRemove;

  /// What the zone says while no file is chosen.
  final String placeholder;

  /// Browse's words.
  final String browseLabel;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarFileUpload> createState() => _SolarFileUploadState();
}

class _SolarFileUploadState extends State<SolarFileUpload> {
  /// Hovered as its drop zone is, focused as a button in it is.
  final _states = WidgetStatesController();

  @override
  void dispose() {
    _states.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = widget.label;
    final helper = widget.helper;
    final enabled = !widget.disabled && widget.onBrowse != null;
    final forced = widget.statesController;
    // A SOLAR icon in the size and ink the button gives its icon.
    Widget icon(SolarVector vector) => Builder(
      builder: (context) {
        final theme = IconTheme.of(context);
        return SolarIcon(vector, size: theme.size, color: theme.color);
      },
    );
    return ListenableBuilder(
      listenable: Listenable.merge([_states, ?forced]),
      builder: (context, _) {
        final states = {..._states.value, ...?forced?.value};
        // Filled where it holds a file.
        final p = SolarFileUploadProps(
          error: widget.error,
          disabled: widget.disabled,
          filled: widget.value.isNotEmpty,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarFileUploadRecipe.lookup(c, p, states),
            dimension: (c) => SolarFileUploadRecipe.dimension(c, p, states),
            color: (c) => SolarFileUploadRecipe.color(t, c, p, states),
            shadow: (c) => SolarFileUploadRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarFileUploadRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => widget.mandatory,
              'helper' => helper != null,
              _ => SolarFileUploadRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: SolarFileUploadRecipe.tree,
          keyPrefix: 'fileUpload',
          text: {
            'uploadAFile': ?label,
            'mandatory': '*',
            'fileName': widget.value.isEmpty
                ? widget.placeholder
                : widget.value.join(', '),
            'helper': ?helper,
          },
          truncates: const {'fileName'},
          wraps: const {'helper': TextAlign.start},
          icons: const {'iconFile': SolarIcons.fileOutline},
          composed: {
            'button': SolarButton(
              prio: SolarButtonPrio.secondary,
              size: SolarButtonSize.md,
              onPressed: widget.disabled
                  ? null
                  : enabled
                  ? widget.onBrowse
                  : null,
              child: Text(widget.browseLabel),
            ),
            'iconButton': SolarIconButton(
              prio: SolarIconButtonPrio.secondary,
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              icon: icon(SolarIcons.refreshOutline),
              semanticLabel: 'Replace file',
              onPressed: enabled ? widget.onBrowse : null,
            ),
            'iconButton2': SolarIconButton(
              prio: SolarIconButtonPrio.secondary,
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              icon: icon(SolarIcons.deleteOutline),
              semanticLabel: 'Remove file',
              onPressed: widget.disabled ? null : widget.onRemove,
            ),
          },
          builders: {
            // The star is the label's mark, not words to read.
            'mandatory': (star) => ExcludeSemantics(child: star),
            // Hovered as a whole, and focused where a button in it has the keyboard's focus.
            'field': (field) => MouseRegion(
              onEnter: (_) => _states.update(WidgetState.hovered, true),
              onExit: (_) => _states.update(WidgetState.hovered, false),
              child: Focus(
                canRequestFocus: false,
                skipTraversal: true,
                onFocusChange: (on) => _states.update(WidgetState.focused, on),
                child: field,
              ),
            ),
          },
        ).layer('root');
      },
    );
  }
}
