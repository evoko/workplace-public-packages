// BackButton's Playground: its label where it holds words ("Back", or a destination); cleared, the
// arrow alone, which the widget names "Back". As the web's (stories/playground/back-button.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final backButtonPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final label = p.words('label');
    return SolarBackButton(
      size: p.choice('size', SolarBackButtonSize.values),
      loading: p.flag('loading'),
      onPressed: p.flag('disabled') ? null : () => p.log('onPressed'),
      child: label == null ? null : Text(label),
    );
  },
);
