// Accordion's Playground: its words and states from their controls; its content, the `description`
// words, shown by the `content` toggle (a cleared description left out). Its header expands and
// collapses it, as in an app: `expanded` is set, and the change logged. A disabled one stays inert.
// As the web's (stories/playground/accordion.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final accordionPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final description = p.words('description');
    return SolarAccordion(
      disabled: p.flag('disabled'),
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
