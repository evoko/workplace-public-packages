// ProgressBar's Playground: its feedback, and how far along it is, the `value` extra in percent
// (the widget takes 0 to 1), shown above it, as SOLAR asks an app to say it. It fills its
// container, the width box. As the web's (stories/playground/progress-bar.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final progressBarPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final value = p.whole('value');
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text('$value%'),
        SolarProgressBar(
          feedback: p.choice('feedback', SolarProgressBarFeedback.values),
          value: value / 100,
          semanticsLabel: 'Progress',
        ),
      ],
    );
  },
);
