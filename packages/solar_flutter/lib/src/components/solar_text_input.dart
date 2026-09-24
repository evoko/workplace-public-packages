/// SOLAR Text Input.
///
/// Scaffolded once by `npm run solar:scaffold -- --flutter "Text Input"` from
/// spec/components/text-input.json, and owned by developers from then on: change it freely. What it
/// looks like is not here. That is the recipe, [SolarTextInputRecipe]: the field's fill, edge and
/// focus ring by state, its words' and icons' ink, and the label and helper, read cell by cell.
///
/// Single-line text: its [label] above (a [mandatory] one is starred), its [helper] below, which
/// says what is wrong where it is in [error], and an icon either side. The words are a [TextField],
/// undecorated, in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds
/// its words and states); a tap anywhere in the field focuses them. It is drawn filled where its
/// [controller] holds text, and hovered and focused as the field is. It reads as one text field,
/// named by its label and described by its helper. A [placeholder] never replaces the label;
/// validate on blur. For many lines use a SolarTextArea, for numbers a Number Input.
library;

import 'package:flutter/material.dart';

import '../generated/components/text_input.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarTextInput extends StatelessWidget {
  const SolarTextInput({
    super.key,
    this.size = SolarTextInputSize.md,
    this.disabled = false,
    this.error = false,
    this.label,
    this.mandatory = false,
    this.helper,
    this.leadingIcon,
    this.trailingIcon,
    this.onSubmitted,
    this.keyboardType,
    this.textInputAction,
    this.obscureText = false,
    this.controller,
    this.placeholder,
    this.onChanged,
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  });

  final SolarTextInputSize size;
  final bool disabled;
  final bool error;

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// An icon before the words.
  final Widget? leadingIcon;

  /// An icon after the words, or a small control (an icon button that clears it).
  final Widget? trailingIcon;

  /// Called with the words when the keyboard's action submits them.
  final ValueChanged<String>? onSubmitted;

  /// The keyboard it asks for.
  final TextInputType? keyboardType;

  /// The keyboard's action.
  final TextInputAction? textInputAction;

  /// Whether its words are hidden, as a password's are.
  final bool obscureText;

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

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
    'root': ['label', 'field', 'helper'],
    'label': ['labelLabel', 'mandatory'],
    'field': ['leadingIcon', 'fieldLabel', 'trailingIcon'],
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final enabled = !disabled;
    return SolarField(
      controller: controller,
      focusNode: focusNode,
      statesController: statesController,
      builder: (context, field) {
        final states = field.states;
        // Filled where it holds text: its words are then the value's, not the placeholder's.
        final p = SolarTextInputProps(
          size: size,
          disabled: disabled,
          error: error,
          filled: field.text.text.isNotEmpty,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarTextInputRecipe.lookup(c, p, states),
            dimension: (c) => SolarTextInputRecipe.dimension(c, p, states),
            color: (c) => SolarTextInputRecipe.color(t, c, p, states),
            shadow: (c) => SolarTextInputRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarTextInputRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => mandatory,
              'leadingIcon' => leadingIcon != null,
              'trailingIcon' => trailingIcon != null,
              'helper' => helper != null,
              _ => SolarTextInputRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: 'textInput',
          text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
          slots: {'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon},
          wraps: const {'helper': TextAlign.start},
          // The field's words, in the recipe's style.
          fields: {
            'fieldLabel': (style) => field.read(
              TextField(
                controller: field.text,
                focusNode: field.focus,
                enabled: enabled,
                autofocus: autofocus,
                onChanged: onChanged,
                style: style,
                keyboardType: keyboardType,
                textInputAction: textInputAction,
                obscureText: obscureText,
                onSubmitted: onSubmitted,
                maxLines: 1,
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
            'helper': (layer) => ExcludeSemantics(child: layer),
            'field': (layer) => field.area(layer, enabled: enabled),
          },
        ).layer('root');
      },
    );
  }
}
