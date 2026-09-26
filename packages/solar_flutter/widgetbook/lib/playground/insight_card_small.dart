// Insight Card Small's Playground: its words, severity and state from their controls, a cleared
// description left out. Pressable, as an app's card is: its press is logged. As the web's
// (stories/playground/insight-card-small.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final insightCardSmallPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarInsightCardSmall(
    severity: p.choice('severity', SolarInsightCardSmallSeverity.values),
    loading: p.flag('loading'),
    title: p.text('title'),
    description: p.words('description'),
    onPressed: () => p.log('onPressed'),
  ),
);
