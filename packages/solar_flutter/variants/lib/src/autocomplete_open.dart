import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// An open SolarAutocomplete, as Figma composes Autocomplete Open (no widget of its own): its
/// frame, from its recipe, the Autocomplete at rest and the SolarDropdownMenu under it by the
/// frame's gap, which a SolarAutocomplete floats its suggestions by; the menu's heading and rows as
/// Figma's Dropdown Menu draws them, each keyed by its layer.
Widget buildAutocompleteOpen(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  return KeyedSubtree(
    key: const Key('autocompleteOpen'),
    child: Builder(
      builder: (context) {
        final t = Theme.of(context).extension<SolarTheme>() ?? SolarTheme.light;
        const p = SolarAutocompleteOpenProps();
        const states = <WidgetState>{};
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarAutocompleteOpenRecipe.lookup(c, p, states),
            dimension: (c) =>
                SolarAutocompleteOpenRecipe.dimension(c, p, states),
            color: (c) => SolarAutocompleteOpenRecipe.color(t, c, p, states),
            shadow: (c) => SolarAutocompleteOpenRecipe.shadow(t, c, p, states),
            textStyle: (c) =>
                SolarAutocompleteOpenRecipe.textStyle(t, c, p, states),
            present: (l) => SolarAutocompleteOpenRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: const {
            'root': ['autocomplete', 'dropdownMenu'],
          },
          keyPrefix: 'autocompleteOpen',
          composed: {
            'autocomplete': SolarAutocomplete<String>(
              options: const [],
              label: 'Label',
              mandatory: true,
              helper: 'Helper text',
              placeholder: 'Search',
              leadingIcon: const IconProbe(),
              trailingIcon: const IconProbe(),
            ),
            'dropdownMenu': SolarDropdownMenu(
              children: [
                const KeyedSubtree(
                  key: Key('dropdownGroupLabel'),
                  child: SolarDropdownGroupLabel(label: 'Group Label'),
                ),
                for (final name in [
                  'dropdownItem',
                  'dropdownItem2',
                  'dropdownItem3',
                  'dropdownItem4',
                  'dropdownItem5',
                  'dropdownItem6',
                ])
                  KeyedSubtree(
                    key: Key(name),
                    child: SolarDropdownItem(label: 'Label', onPressed: () {}),
                  ),
              ],
            ),
          },
        ).layer('root');
      },
    ),
  );
}
