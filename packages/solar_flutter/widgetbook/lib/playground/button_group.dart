// Button Group's Playground: its Buttons as Figma lays them out, the primary Button always, the
// secondary and tertiary where their controls show them, each with its words (the primary's are
// Figma's, "Label", since the IR gives it no slot); horizontally the primary last, vertically
// first, as Figma draws both. A full-width group's Buttons are `lg`, as Figma draws them and the
// README composes a dialog's actions; a regular group's the Button's default. Figma draws no
// vertical full-width group, so a vertical group is regular, and the builder writes `regular` back
// to `type`, so the panel shows the group the widget draws. Each press is logged with the Button's
// layer name. As the web's (stories/playground/button-group.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final buttonGroupPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final orientation = p.choice(
      'orientation',
      SolarButtonGroupOrientation.values,
    );
    final wanted = p.choice('type', SolarButtonGroupType.values);
    final vertical = orientation == SolarButtonGroupOrientation.vertical;
    final type = vertical ? SolarButtonGroupType.regular : wanted;
    if (type != wanted) {
      // Not while building: the write rebuilds the Playground.
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => p.setChoice('type', type),
      );
    }
    final tertiary = p.child('tertiaryCTA');
    final secondary = p.child('secondaryCTA');
    final size = type == SolarButtonGroupType.fullWidth
        ? SolarButtonSize.lg
        : SolarButtonSize.md;
    Widget button(String layer, SolarButtonPrio prio, String? label) =>
        SolarButton(
          size: size,
          prio: prio,
          semanticLabel: label == null ? 'Label' : null,
          onPressed: () => p.log('onPressed', layer),
          child: label == null ? null : Text(label),
        );
    final buttons = [
      if (tertiary.shown)
        button('tertiaryCTA', SolarButtonPrio.tertiary, _words(tertiary.text)),
      if (secondary.shown)
        button(
          'secondaryCTA',
          SolarButtonPrio.secondary,
          _words(secondary.text),
        ),
      button('button3', SolarButtonPrio.primary, 'Label'),
    ];
    return SolarButtonGroup(
      orientation: orientation,
      type: type,
      children: vertical ? buttons.reversed.toList() : buttons,
    );
  },
);

/// A child's words, or null where it holds none (an icon-only Button).
String? _words(String? text) => text == null || text.isEmpty ? null : text;
