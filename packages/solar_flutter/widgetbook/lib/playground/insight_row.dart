// Insight Row's Playground: its words, severity and state from their controls; its action, shown by
// the `action` toggle, a SolarButton, sm and secondary as Figma draws it, in Figma's words, its tap
// logged with the slot (`onPressed: "action"`). Pressable, as an app's row is: its press is logged.
// As the web's (stories/playground/insight-row.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final insightRowPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarInsightRow(
    severity: p.choice('severity', SolarInsightRowSeverity.values),
    loading: p.flag('loading'),
    title: p.text('title'),
    meta: p.text('meta'),
    action: p.child('action').shown
        ? SolarButton(
            size: SolarButtonSize.sm,
            prio: SolarButtonPrio.secondary,
            onPressed: () => p.log('onPressed', 'action'),
            child: const Text('Label'),
          )
        : null,
    onPressed: () => p.log('onPressed'),
  ),
);
