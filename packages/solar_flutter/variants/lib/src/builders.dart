// How each generated widget is built in one oracle variant, by its Figma name: shared by the visual
// checks (test/visual/cases/, which add how to measure it) and the Widgetbook app (widgetbook/),
// which lays every variant out. Imports no test library.

import 'package:flutter/widgets.dart';

import 'button.dart';
import 'button_group.dart';
import 'icon_button.dart';
import 'spinner.dart';

/// Builds a widget in one oracle variant: its props from the oracle (the prop states, disabled and
/// loading, among them), every slot filled with a probe, and [states] as its states controller,
/// through which a platform state is forced. [oracle], the component's whole oracle, is for a
/// builder that needs more than the variant (Button Group's slots, shown by a prop).
typedef VariantBuilder = Widget Function(
  Map<String, dynamic> variant,
  WidgetStatesController states, [
  Map<String, dynamic>? oracle,
]);

const builders = <String, VariantBuilder>{
  'Button': buildButton,
  'Button Group': buildButtonGroup,
  'Icon Button': buildIconButton,
  'Spinner': buildSpinner,
};
