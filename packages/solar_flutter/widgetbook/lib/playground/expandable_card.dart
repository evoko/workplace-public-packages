// Expandable Card's Playground: its words and state from their controls; its content, the
// `description` words, shown by the `content` toggle (a cleared description left out). Its header
// expands and collapses it, as in an app: `expanded` is set, and the change logged. As the web's
// (stories/playground/expandable-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final expandableCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final description = p.words('description');
    return SolarExpandableCard(
      expanded: p.flag('expanded'),
      title: p.text('title'),
      description: p.flag('content') ? description : null,
      onExpandedChanged: (expanded) {
        p.set('expanded', expanded);
        p.log('onExpandedChanged', expanded);
      },
    );
  },
);
