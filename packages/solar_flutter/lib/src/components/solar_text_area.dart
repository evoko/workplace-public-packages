/// SOLAR Text Area.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTextAreaRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTextAreaRecipe]: the field's fill,
/// edge and focus ring by state, its words' ink, the label and the footer, read cell by cell.
///
/// Text of many lines (descriptions, notes, feedback): its [label] above (a [mandatory] one is
/// starred), its [helper] below, which says what is wrong where it is in [error], beside the count
/// of characters ([charCount], against [maxLength] where given). The words are a [TextField],
/// undecorated and the field's height, whose lines scroll within it, drawn from Figma's layer tree
/// with [SolarLayers] ([SolarField] holds its words and states); a tap anywhere in the field
/// focuses them. [cta] (a send or save SolarIconButton, primary at sm) and [attachment] (an attach
/// one, secondary at sm) sit in its bottom corners. It is drawn filled where its [controller] holds
/// text, and hovered and focused as the field is. It reads as one text field, named by its label
/// and described by its helper. For one line use a SolarTextInput.
library;

import 'package:flutter/material.dart';

import '../generated/components/text_area.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTextArea extends StatelessWidget {
  const SolarTextArea({
    super.key,
    this.size = SolarTextAreaSize.md,
    this.enabled = true,
    this.error = false,
    this.label,
    this.mandatory = false,
    this.helper,
    this.charCount = false,
    this.maxLength,
    this.cta,
    this.attachment,
    this.controller,
    this.placeholder,
    this.onChanged,
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  });

  final SolarTextAreaSize size;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;
  final bool error;

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// Whether it counts its characters, below at the end: against [maxLength] where given.
  final bool charCount;

  /// The most characters it takes, which the count shows.
  final int? maxLength;

  /// The field's action, in its bottom right: a SolarIconButton, primary at sm (send, save).
  final Widget? cta;

  /// An attachment's button, in its bottom left: a SolarIconButton, secondary at sm.
  final Widget? attachment;

  /// Its words, where the caller keeps them; one of its own, empty, otherwise.
  final TextEditingController? controller;

  /// What it shows while empty, in its words' place.
  final String? placeholder;

  /// Called with the words as they change.
  final ValueChanged<String>? onChanged;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    Widget field([TextEditingController? text, FocusNode? focus]) => SolarField(
      controller: text ?? controller,
      focusNode: focus ?? focusNode,
      statesController: statesController,
      builder: (context, field) {
        final states = field.states;
        final words = field.text.text;
        // Filled where it holds text: its words are then the value's, not the placeholder's.
        final p = SolarTextAreaProps(
          size: size,
          disabled: disabled,
          error: error,
          filled: field.text.text.isNotEmpty,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarTextAreaRecipe.lookup(c, p, states),
            dimension: (c) => SolarTextAreaRecipe.dimension(c, p, states),
            color: (c) => SolarTextAreaRecipe.color(t, c, p, states),
            shadow: (c) => SolarTextAreaRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarTextAreaRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => mandatory,
              'cta' => cta != null,
              'attachment' => attachment != null,
              'footer' => helper != null || charCount,
              'helper' => helper != null,
              'charCount' => charCount,
              _ => SolarTextAreaRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: SolarTextAreaRecipe.tree,
          keyPrefix: 'textArea',
          text: {
            'labelLabel': ?label,
            'mandatory': '*',
            'helper': ?helper,
            'charCount': maxLength == null
                ? '${words.length}'
                : '${words.length}/$maxLength',
          },
          slots: {'cta': ?cta, 'attachment': ?attachment},
          wraps: const {'helper': TextAlign.start},
          // The field's words, in the recipe's style.
          fields: {
            'enterText': (style) => field.read(
              TextField(
                controller: field.text,
                focusNode: field.focus,
                enabled: enabled,
                autofocus: autofocus,
                onChanged: onChanged,
                style: style,
                keyboardType: TextInputType.multiline,
                maxLength: maxLength,
                buildCounter: (
                  _, {
                  required currentLength,
                  required isFocused,
                  maxLength,
                }) => null,
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                decoration: InputDecoration.collapsed(
                  hintText: placeholder,
                  hintStyle: style,
                ),
              ),
              label: label,
              hint: helper,
            ),
          },
          builders: {
            'label': (layer) => ExcludeSemantics(child: layer),
            'footer': (layer) => ExcludeSemantics(child: layer),
            'field': (layer) => field.area(layer, enabled: enabled),
          },
        ).layer('root');
      },
    );
    return field();
  }
}
