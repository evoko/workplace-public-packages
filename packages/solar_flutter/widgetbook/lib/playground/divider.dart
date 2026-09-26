// Divider's Playground: its orientation and type; a labelled divider's words the `label` extra. A
// divider fills what it separates, so it is drawn between two sample words, as in an app: a
// horizontal one between two lines, as wide as the width box; a vertical one between two words on
// a line, as tall as the line, which gives it a height to fill. Figma draws a vertical divider full
// only, so a vertical divider is full, and the builder writes `full` back to `type`, so the panel
// shows the divider the widget draws. As the web's (stories/playground/divider.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final dividerPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final orientation = p.choice('orientation', SolarDividerOrientation.values);
    final wanted = p.choice('type', SolarDividerType.values);
    final vertical = orientation == SolarDividerOrientation.vertical;
    final type = vertical ? SolarDividerType.full : wanted;
    if (type != wanted) {
      // Not while building: the write rebuilds the Playground.
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => p.setChoice('type', type),
      );
    }
    final label = p.words('label');
    final divider = SolarDivider(
      orientation: orientation,
      type: type,
      label: type == SolarDividerType.withLabel ? label : null,
    );
    return vertical
        ? IntrinsicHeight(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [const Text('Text'), divider, const Text('Text')],
            ),
          )
        : Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [const Text('Text'), divider, const Text('Text')],
          );
  },
);
