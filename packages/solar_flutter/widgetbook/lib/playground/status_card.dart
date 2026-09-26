// Status Card's Playground: its words, status and states from their controls; its More menu the
// sample actions (cards.dart). Pressable, as an app's card is: its press is logged. As the web's
// (stories/playground/status-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final statusCardPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarStatusCard(
    status: p.choice('status', SolarStatusCardStatus.values),
    disabled: p.flag('disabled'),
    loading: p.flag('loading'),
    title: p.text('title'),
    value: p.text('value'),
    moreItems: sampleMoreItems(p),
    onPressed: () => p.log('onPressed'),
  ),
);
