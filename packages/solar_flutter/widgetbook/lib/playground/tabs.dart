// Tabs' Playground: a strip of three sample tabs (Overview, Activity, Settings) of its size, shown
// by the `tabs` toggle (off, an empty strip). Which is selected is the `selected` extra, which
// choosing a tab sets, as the arrow keys and Enter do. As the web's (stories/playground/tabs.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final tabsPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final shown = p.flag('tabs');
    final selected = p.choice('selected', SampleTab.values);
    return SolarTabs(
      size: p.choice('size', SolarTabsSize.values),
      value: shown ? selected : null,
      onChanged: (value) {
        if (value is! SampleTab) return;
        p.setChoice('selected', value);
        p.log('onChanged', sampleTabWords(value));
      },
      children: [
        if (shown)
          for (final tab in SampleTab.values)
            SolarTabItem(value: tab, label: sampleTabWords(tab)),
      ],
    );
  },
);
