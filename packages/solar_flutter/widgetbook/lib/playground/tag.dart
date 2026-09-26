// Tag's Playground: its status, inversion, words and icon from their controls; the `indicator`
// extra shows its status dot (never on an inverted tag, which Figma does not draw, so it is left
// off there), and `closable` gives it a close button, whose tap is logged. Its type follows from
// these, as the widget derives it. Without words it is an icon tag, named "Label". As the web's
// (stories/playground/tag.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final tagPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final indicator = p.flag('indicator');
    final invert = p.flag('invert');
    final label = p.words('label');
    return SolarTag(
      status: p.choice('status', SolarTagStatus.values),
      invert: invert,
      indicator: indicator && !invert,
      label: label,
      icon: p.icon('icon'),
      onClose: p.flag('closable') ? () => p.log('onClose') : null,
      semanticLabel: label == null ? 'Label' : null,
    );
  },
);
