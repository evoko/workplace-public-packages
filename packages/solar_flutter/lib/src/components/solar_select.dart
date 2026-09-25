/// SOLAR Select.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarSelectRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarSelectRecipe]: the field's fill, edge
/// and focus ring by state, the panel's surface, and the label and helper, read cell by cell.
///
/// One choice from a list of about seven or fewer, SOLAR says (beyond that, an Autocomplete): its
/// [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where
/// it is in [error], and the field showing the choice, or the [placeholder]. A tap, Enter or the
/// down arrow opens its panel of [options] under the field, drawn as Figma draws Select's, as wide
/// as the field, each a SolarDropdownItem, where the arrow keys move, Enter chooses and Escape
/// closes. [open] opens it as it is first built.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/select.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import '../solar_states.dart';
import 'solar_dropdown_item.dart';
import 'solar_theme_of.dart';

/// One row of a SolarSelect: the value it stands for, and its words.
class SolarSelectOption<T> {
  const SolarSelectOption({
    required this.value,
    required this.label,
    this.helper,
    this.icon,
    this.enabled = true,
    this.key,
  });

  /// The value it stands for, which the picker's value is where it is chosen.
  final T value;

  /// Its words, which the field shows once it is chosen.
  final String label;

  /// A second line under its words.
  final String? helper;

  /// An icon before its words.
  final Widget? icon;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;

  /// The row's key, where the caller keys it.
  final Key? key;
}

class SolarSelect<T> extends StatefulWidget {
  const SolarSelect({
    super.key,
    this.size = SolarSelectSize.md,
    this.open = false,
    this.enabled = true,
    this.error = false,
    required this.options,
    this.value,
    this.onChanged,
    this.label,
    this.mandatory = false,
    this.helper,
    this.placeholder,
    this.statesController,
  });

  final SolarSelectSize size;
  final bool open;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;
  final bool error;

  /// Its rows, in order.
  final List<SolarSelectOption<T>> options;

  /// The chosen row's value; null for none.
  final T? value;

  /// Called with the row chosen's value; null disables it.
  final ValueChanged<T>? onChanged;

  /// What it asks for, above it.
  final String? label;

  /// Whether a choice must be made, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// What the field says before a choice is made.
  final String? placeholder;

  /// The field's states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarSelect<T>> createState() => _SolarSelectState<T>();
}

class _SolarSelectState<T> extends State<SolarSelect<T>> {
  final _menu = MenuController();
  final _field = GlobalKey();
  WidgetStatesController? _own;
  var _open = false;
  var _width = 0.0;

  WidgetStatesController get _states =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  bool get _enabled => !widget.disabled && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    // Open as it is first built, where it is asked to be.
    if (widget.open) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _show();
      });
    }
  }

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  void _show() {
    _width = _field.currentContext?.size?.width ?? 0;
    _menu.open();
  }

  void _toggle() => _menu.isOpen ? _menu.close() : _show();

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarSelectProps(
      size: w.size,
      open: _open,
      disabled: w.disabled || w.onChanged == null,
      error: w.error,
    );
    final shown = SolarSelectProps(
      size: w.size,
      open: true,
      disabled: w.disabled || w.onChanged == null,
      error: w.error,
    );
    final chosen = [
      for (final option in w.options)
        if (option.value == w.value) option,
    ].firstOrNull;
    final rows = [
      for (final option in w.options)
        KeyedSubtree(
          key: option.key,
          child: SolarDropdownItem(
            label: option.label,
            helper: option.helper,
            icon: option.icon,
            selected: option.value == w.value,
            onPressed: option.disabled
                ? null
                : () {
                    _menu.close();
                    w.onChanged?.call(option.value);
                  },
          ),
        ),
    ];
    return SolarMenuAnchor(
      controller: _menu,
      onOpen: () => setState(() => _open = true),
      onClose: () => setState(() => _open = false),
      // As wide as the field, as Figma draws it.
      menu: ConstrainedBox(
        constraints: BoxConstraints(minWidth: _width),
        child: SolarLayers(
          // Drawn while open alone, so read as open: Figma draws the panel in the open variants.
          recipe: SolarLayerRecipe(
            lookup: (c) =>
                SolarSelectRecipe.lookup(c, shown, const <WidgetState>{}),
            dimension: (c) =>
                SolarSelectRecipe.dimension(c, shown, const <WidgetState>{}),
            color: (c) =>
                SolarSelectRecipe.color(t, c, shown, const <WidgetState>{}),
            shadow: (c) =>
                SolarSelectRecipe.shadow(t, c, shown, const <WidgetState>{}),
            textStyle: (c) =>
                SolarSelectRecipe.textStyle(t, c, shown, const <WidgetState>{}),
            present: (l) =>
                SolarSelectRecipe.present(l, shown, const <WidgetState>{}),
            glyph: (_) => null,
          ),
          tree: SolarSelectRecipe.tree,
          keyPrefix: 'select',
          content: {
            'dropdownMenu': [SolarMenuList(size: w.size.name, children: rows)],
          },
        ).layer('dropdownMenu'),
      ),
      builder: (context, _) => ListenableBuilder(
        listenable: _states,
        builder: (context, _) {
          final states = {..._states.value};
          return SolarLayers(
            recipe: SolarLayerRecipe(
              lookup: (c) => SolarSelectRecipe.lookup(c, p, states),
              dimension: (c) => SolarSelectRecipe.dimension(c, p, states),
              color: (c) => SolarSelectRecipe.color(t, c, p, states),
              shadow: (c) => SolarSelectRecipe.shadow(t, c, p, states),
              textStyle: (c) => SolarSelectRecipe.textStyle(t, c, p, states),
              present: (l) => switch (l) {
                'label' || 'labelLabel' => w.label != null,
                'mandatory' => w.mandatory,
                'helper' => w.helper != null,
                'dropdownMenu' => false,
                _ => SolarSelectRecipe.present(l, p, states),
              },
              glyph: (_) => null,
            ),
            tree: SolarSelectRecipe.tree,
            keyPrefix: 'select',
            text: {
              'labelLabel': ?w.label,
              'mandatory': '*',
              'helper': ?w.helper,
              'placeholder': chosen?.label ?? w.placeholder ?? '',
            },
            icons: const {'trailingIcon': SolarIcons.chevronDownOutline},
            // The field is the control: a tap, Enter, Space or the down arrow opens the panel. It is
            // read as a button named by the label, its value the choice.
            builders: {
              // The label and helper are read with the field, as its name and hint, not again.
              'label': (layer) => ExcludeSemantics(child: layer),
              'helper': (layer) => ExcludeSemantics(child: layer),
              'field': (field) => KeyedSubtree(
                key: _field,
                child: Semantics(
                  label: w.label ?? w.placeholder,
                  value: chosen?.label,
                  hint: w.helper,
                  expanded: _open,
                  child: CallbackShortcuts(
                    bindings: {
                      const SingleActivator(LogicalKeyboardKey.arrowDown): () {
                        if (_enabled && !_menu.isOpen) _show();
                      },
                    },
                    child: SolarPressable(
                      onPressed: _enabled ? _toggle : null,
                      statesController: _states,
                      target: true,
                      // Its words are its value, read as such, not again as its name.
                      builder: (_, _) => ExcludeSemantics(child: field),
                    ),
                  ),
                ),
              ),
            },
          ).layer('root');
        },
      ),
    );
  }
}
