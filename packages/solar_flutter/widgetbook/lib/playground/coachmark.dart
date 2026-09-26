// Coachmark's Playground: one step of a tour, about the "Open" button, which starts it, as an app's
// tour starts at its element, and the `open` extra follows it; Escape or its close button ends it
// (`onClose`). Its side, title, words and counter from their controls, a cleared body or counter
// left out; its actions, shown by the `actions` toggle, Back and Next in a regular Button Group of
// md Buttons, as Figma composes them, each press logged with its words (the tour is the app's). As
// the web's (stories/playground/coachmark.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final coachmarkPlayground = SolarPlaygroundBuilder(
  build: (p) {
    Widget action(String name, SolarButtonPrio prio) => SolarButton(
      size: SolarButtonSize.md,
      prio: prio,
      onPressed: () => p.log('onPressed', name),
      child: Text(name),
    );
    return SolarCoachmark(
      side: p.choice('side', SolarCoachmarkSide.values),
      title: p.text('title'),
      body: p.words('body'),
      counter: p.words('counter'),
      actions: p.child('actions').shown
          ? SolarButtonGroup(
              children: [
                action('Back', SolarButtonPrio.secondary),
                action('Next', SolarButtonPrio.primary),
              ],
            )
          : null,
      open: p.flag('open'),
      onClose: () {
        p.set('open', false);
        p.log('onClose');
      },
      child: SolarButton(
        onPressed: () => p.set('open', true),
        child: const Text('Open'),
      ),
    );
  },
);
