/// SOLAR Tab Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTabItemRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTabItemRecipe]: the tab’s underline
/// and focus ring by state, and its words’ and icons’ ink, read cell by cell.
///
/// Bespoke: one tab of a SolarTabs strip, drawn from Figma's layer tree with [SolarLayers],
/// pressable, and focusable in the strip's order, announced as a tab, selected where it is. Its
/// [label], an icon either side and a [count], a SolarCounter in the variant Figma draws for the
/// tab's state. A focused tab draws Figma's focus, the selected underline and the ring. Inside a
/// SolarTabs it takes the strip's size, is selected where its [value] is the strip's, and selects
/// it when pressed; outside one, [selected] and [onPressed] say.
library;

import 'package:flutter/material.dart';

import '../generated/components/tab_item.dart';
import '../solar_layers.dart';
import '../solar_states.dart';

import 'package:flutter/semantics.dart';

import '../generated/components/counter.dart';
import '../solar_tabs.dart';
import 'solar_counter.dart';
import 'solar_theme_of.dart';

class SolarTabItem extends StatelessWidget {
  const SolarTabItem({
    super.key,
    this.size = SolarTabItemSize.md,
    this.disabled = false,
    this.selected = false,
    required this.label,
    this.value,
    this.onPressed,
    this.leadingIcon,
    this.trailingIcon,
    this.count,
    this.statesController,
  });

  final SolarTabItemSize size;
  final bool disabled;
  final bool selected;

  /// The tab's words.
  final String label;

  /// What the strip it is in selects when it is pressed, and is selected by.
  final Object? value;

  /// Called when it is pressed, outside a strip; null there draws it as it is, not pressable.
  final VoidCallback? onPressed;

  /// An icon before the words.
  final Widget? leadingIcon;

  /// An icon after the words.
  final Widget? trailingIcon;

  /// A count after the words, a SolarCounter; none at 0 or below.
  final int? count;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// In a strip, the strip's choice of it; outside one, its own [onPressed].
  VoidCallback? _pressed(BuildContext context) {
    final strip = SolarTabsScope.maybeOf(context);
    if (disabled) return null;
    if (strip == null || value == null) return onPressed;
    return () => strip.onChanged?.call(value);
  }

  /// In a strip, whether its value is the strip's; outside one, [selected].
  bool _selected(BuildContext context) {
    final strip = SolarTabsScope.maybeOf(context);
    return strip == null || value == null ? selected : strip.value == value;
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarTabItemProps(
      size: SolarTabsScope.sizeOf(context, SolarTabItemSize.values) ?? size,
      disabled: disabled,
      selected: _selected(context),
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarTabItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarTabItemRecipe.dimension(c, p, states),
        color: (c) => SolarTabItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarTabItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarTabItemRecipe.textStyle(t, c, p, states),
        present: (l) => switch (l) {
          'leadingIcon' => leadingIcon != null,
          'trailingIcon' => trailingIcon != null,
          'counter' => count != null && count! > 0,
          _ => SolarTabItemRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: SolarTabItemRecipe.tree,
      keyPrefix: 'tabItem',
      text: {'label': label},
      slots: {'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon},
      composed: {
        if (count != null && count! > 0)
          'counter': SolarStatesScope(
            builder: (_, _) => SolarCounter(
              count: count!,
              type: SolarCounterType.values.byName(
                SolarTabItemRecipe.lookup(
                  'counter.variant.type',
                  p,
                  states,
                )!.substring(2),
              ),
            ),
          ),
      },
    ).layer('root');
    final mark = SolarPressable(
      onPressed: _pressed(context),
      statesController: statesController,
      role: SemanticsRole.tab,
      selected: p.selected,
      target: true,
      builder: (_, states) => draw(states),
    );
    return mark;
  }
}
