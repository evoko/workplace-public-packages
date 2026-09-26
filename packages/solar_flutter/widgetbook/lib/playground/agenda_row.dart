// Agenda Row's Playground: its state, density, category and words from their controls, a cleared
// one left out (the comfortable row draws `start` and `end`, the compact one `range`); its
// attendee, shown by the `attendee` toggle, an md Avatar with a sample name. Pressable, as an app's
// agenda is: a press shows the event, making it the selected one (`selected` set), and is logged.
// As the web's (stories/playground/agenda-row.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final agendaRowPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarAgendaRow(
    selected: p.flag('selected'),
    density: p.choice('density', SolarAgendaRowDensity.values),
    category: p.choice('category', SolarAgendaRowCategory.values),
    title: p.text('title'),
    start: p.words('start'),
    end: p.words('end'),
    range: p.words('range'),
    meta: p.words('meta'),
    attendee: p.child('attendee').shown
        ? const SolarAvatar(
            size: SolarAvatarSize.md,
            type: SolarAvatarType.text,
            name: 'Dana Scully',
          )
        : null,
    onPressed: () {
      p.set('selected', true);
      p.log('onPressed');
    },
  ),
);
