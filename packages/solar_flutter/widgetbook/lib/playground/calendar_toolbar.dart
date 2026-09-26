// Calendar Toolbar's Playground: its range from its control; its own previous, next and Today
// buttons, each press logged (which range they go to is the app's); its view switcher, shown by the
// `views` toggle, an sm Segmented Control of the sample views (Day, Week, Month, Agenda), the chosen
// one the `view` extra, which choosing sets; its action, shown by the `action` toggle, an sm
// secondary "New event" Button, its press logged. As the web's
// (stories/playground/calendar-toolbar.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The sample views, as the `view` extra's dartOptions name them.
enum _View { day, week, month, agenda }

const _viewWords = ['Day', 'Week', 'Month', 'Agenda'];

final calendarToolbarPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarCalendarToolbar(
    range: p.text('range'),
    onPrevious: () => p.log('onPrevious'),
    onNext: () => p.log('onNext'),
    onToday: () => p.log('onToday'),
    views: p.child('views').shown
        ? SolarSegmentedControl<_View>(
            size: SolarSegmentedControlSize.sm,
            groupValue: p.choice('view', _View.values),
            onChanged: (value) {
              if (value == null) return;
              p.setChoice('view', value);
              p.log('onChanged', _viewWords[value.index]);
            },
            children: [
              for (final v in _View.values)
                SolarSegmentedControlItem<_View>(
                  value: v,
                  label: _viewWords[v.index],
                  size: SolarSegmentedControlItemSize.sm,
                ),
            ],
          )
        : null,
    action: p.child('action').shown
        ? SolarButton(
            size: SolarButtonSize.sm,
            prio: SolarButtonPrio.secondary,
            onPressed: () => p.log('onPressed', 'New event'),
            child: const Text('New event'),
          )
        : null,
  ),
);
