/// SOLAR Autocomplete.
///
/// Written by hand, and never regenerated; its layer tree is the IR's,
/// [SolarAutocompleteRecipe.tree]. What it looks like is not here. That is the recipe,
/// [SolarAutocompleteRecipe]: the field's fill, edge and focus ring by state, its words' and icons'
/// ink, and the label and helper, read cell by cell.
///
/// A field that suggests matching [options] as the user types, for a large list or a search with
/// hints (for about eight or fewer fixed choices, a SolarSelect): its [label] above (a [mandatory]
/// one is starred), its [helper] below, which says what is wrong where it is in [error], and an
/// icon either side (a search icon before, SOLAR says; a clear button after, once there is text).
/// Built on RawAutocomplete: the suggestions are a SolarDropdownMenu of SolarDropdownItems under
/// the field, by Autocomplete Open's gap, which the words keep the focus for, the arrow keys moving
/// the highlight and Enter choosing; [onSelected] is told the option chosen. Give it both a
/// [controller] and a [focusNode], or neither. It is drawn filled while it holds words.
library;

import 'package:flutter/material.dart';

import '../generated/components/autocomplete.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import '../generated/components/autocomplete_open.dart';
import '../generated/components/dropdown_menu.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';
import 'solar_theme_of.dart';

class SolarAutocomplete<T extends Object> extends StatelessWidget {
  const SolarAutocomplete({
    super.key,
    this.size = SolarAutocompleteSize.md,
    this.enabled = true,
    this.error = false,
    required this.options,
    this.onSelected,
    this.displayStringForOption = RawAutocomplete.defaultStringForOption,
    this.label,
    this.mandatory = false,
    this.helper,
    this.leadingIcon,
    this.trailingIcon,
    this.controller,
    this.placeholder,
    this.onChanged,
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  });

  final SolarAutocompleteSize size;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;
  final bool error;

  /// Every option, of which those the words match are suggested.
  final List<T> options;

  /// Called with the option chosen.
  final ValueChanged<T>? onSelected;

  /// An option's words, which the suggestions show and the field takes once it is chosen.
  final String Function(T option) displayStringForOption;

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// An icon before the words: a search icon, SOLAR says.
  final Widget? leadingIcon;

  /// An icon after the words, or a small control (a clear button, once there is text).
  final Widget? trailingIcon;

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
        // Filled where it holds text: its words are then the value's, not the placeholder's.
        final p = SolarAutocompleteProps(
          size: size,
          disabled: disabled,
          error: error,
          filled: field.text.text.isNotEmpty,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarAutocompleteRecipe.lookup(c, p, states),
            dimension: (c) => SolarAutocompleteRecipe.dimension(c, p, states),
            color: (c) => SolarAutocompleteRecipe.color(t, c, p, states),
            shadow: (c) => SolarAutocompleteRecipe.shadow(t, c, p, states),
            textStyle: (c) =>
                SolarAutocompleteRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'labelLabel' => label != null,
              'mandatory' => mandatory,
              'leadingIcon' => leadingIcon != null,
              'trailingIcon' => trailingIcon != null,
              'helper' => helper != null,
              _ => SolarAutocompleteRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: SolarAutocompleteRecipe.tree,
          keyPrefix: 'autocomplete',
          text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
          slots: {'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon},
          wraps: const {'helper': TextAlign.start},
          // The field's words, in the recipe's style.
          fields: {
            'search': (style) => field.read(
              TextField(
                controller: field.text,
                focusNode: field.focus,
                enabled: enabled,
                autofocus: autofocus,
                onChanged: onChanged,
                style: style,
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
            'labelLabel': (layer) => ExcludeSemantics(child: layer),
            'mandatory': (layer) => ExcludeSemantics(child: layer),
            'helper': (layer) => ExcludeSemantics(child: layer),
            'field': (layer) => field.area(layer, enabled: enabled),
          },
        ).layer('root');
      },
    );
    return RawAutocomplete<T>(
      textEditingController: controller,
      focusNode: focusNode,
      displayStringForOption: displayStringForOption,
      // The options whose words hold what is typed, none where nothing is.
      optionsBuilder: (value) {
        final words = value.text.toLowerCase();
        if (words.isEmpty) return const Iterable.empty();
        return options.where(
          (o) => displayStringForOption(o).toLowerCase().contains(words),
        );
      },
      onSelected: onSelected,
      fieldViewBuilder: (context, text, focus, _) => field(text, focus),
      // Under the field by Autocomplete Open's gap, as wide as it, the highlighted row drawn hovered.
      optionsViewBuilder: (context, onSelected, matches) {
        final highlighted = AutocompleteHighlightedOption.of(context);
        final gap =
            SolarAutocompleteOpenRecipe.dimension(
              'root.gap',
              const SolarAutocompleteOpenProps(),
              const {},
            ) ??
            0;
        return Align(
          alignment: AlignmentDirectional.topStart,
          child: Padding(
            padding: EdgeInsets.only(top: gap),
            child: SolarDropdownMenu(
              size: SolarDropdownMenuSize.values.byName(size.name),
              children: [
                for (final (i, option) in matches.indexed)
                  SolarDropdownItem(
                    label: displayStringForOption(option),
                    statesController: i == highlighted
                        ? (WidgetStatesController({WidgetState.hovered}))
                        : null,
                    onPressed: () => onSelected(option),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
