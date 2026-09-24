import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarAutocomplete in one oracle variant, named as the web case is: every slot filled so its look
/// is measured, the label, starred, the helper and both icon probes; holding words where Figma
/// draws it filled (the oracle's content).
Widget buildAutocomplete(
  Map<String, dynamic> v,
  WidgetStatesController states, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  return SolarAutocomplete<String>(
    size: enumNamed(SolarAutocompleteSize.values, props['size'] as String),
    disabled: props['disabled'] as bool,
    error: props['error'] as bool,
    options: const ['One', 'Two'],
    controller: TextEditingController(
      text: content.contains('inputValue') ? 'Search' : '',
    ),
    focusNode: FocusNode(),
    label: 'Label',
    mandatory: true,
    helper: 'Helper text',
    placeholder: 'Search',
    leadingIcon: const IconProbe(),
    trailingIcon: const IconProbe(),
    statesController: states,
  );
}
