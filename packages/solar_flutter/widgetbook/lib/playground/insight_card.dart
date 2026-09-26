// Insight Card's Playground: its words, severity and states from their controls, a cleared
// description left out; its More menu the sample actions (cards.dart). Pressing it makes it the
// current one of its set, as an app's list of insights does: `selected` is set, and the press
// logged. As the web's (stories/playground/insight-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final insightCardPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarInsightCard(
    severity: p.choice('severity', SolarInsightCardSeverity.values),
    selected: p.flag('selected'),
    loading: p.flag('loading'),
    title: p.text('title'),
    description: p.words('description'),
    moreItems: sampleMoreItems(p),
    onPressed: () {
      p.set('selected', true);
      p.log('onPressed');
    },
  ),
);
