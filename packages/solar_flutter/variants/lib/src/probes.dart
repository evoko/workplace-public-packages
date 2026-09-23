// Stand-ins the builders fill slots with, and the helpers that read an oracle variant. Imports no
// test library, so the Widgetbook app can use them as the visual checks do.

import 'package:flutter/material.dart';

/// A stand-in icon that paints what the control's IconTheme gives it, so the colour and size an
/// icon would take are what is measured.
class IconProbe extends StatelessWidget {
  const IconProbe({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = IconTheme.of(context);
    return SizedBox.square(
      dimension: theme.size,
      child: ColoredBox(color: theme.color!),
    );
  }
}

/// The enum value an oracle names: by its Dart name, or by [figma] where the value is escaped.
T enumNamed<T extends Enum>(
  List<T> values,
  String name, [
  String Function(T)? figma,
]) => values.firstWhere((v) => v.name == name || figma?.call(v) == name);

/// The platform states, as Flutter tracks them.
const platformStates = {
  'hover': WidgetState.hovered,
  'pressed': WidgetState.pressed,
  'focus': WidgetState.focused,
};

/// The states to force for an oracle variant's platform state: a pointer pressing a control is over
/// it, so a pressed one is hovered too.
Set<WidgetState> statesFor(String? state) => {
  if (state == 'pressed') WidgetState.hovered,
  ?platformStates[state],
};
