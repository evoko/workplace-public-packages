// Stepper's Playground: two sample steps and the three its step toggles show, of its type; the
// active one is the `activeStep` extra, kept within the steps shown (written back where a toggle
// leaves it past the last). Under it, an app's Back and Next Buttons, the flow's (the Stepper has
// none of its own), move it; a completed step goes back to it, as `onStepClick` lets an app; each is
// set and logged. As the web's (stories/playground/stepper.tsx).

import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final stepperPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final toggles = [
      for (final s in ['step3', 'step4', 'step5']) p.child(s).shown,
    ];
    final labels = [
      for (final (i, s) in sampleSteps.indexed)
        if (i < 2 || toggles[i - 2]) s,
    ];
    final last = labels.length - 1;
    final wanted = p.whole('activeStep');
    final active = math.min(wanted, last);
    if (active != wanted) {
      // Not while building: the write rebuilds the Playground.
      WidgetsBinding.instance.addPostFrameCallback(
        (_) => p.set('activeStep', active),
      );
    }
    void go(int step, String event, Object detail) {
      p.set('activeStep', step);
      p.log(event, detail);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: SolarStack.md,
      children: [
        SolarStepper(
          type: p.choice('type', SolarStepperType.values),
          steps: labels,
          activeStep: active,
          onStepClick: (i) => go(i, 'onStepClick', i),
        ),
        Row(
          spacing: SolarStack.xs,
          children: [
            SolarButton(
              size: SolarButtonSize.sm,
              prio: SolarButtonPrio.secondary,
              onPressed: active == 0
                  ? null
                  : () => go(active - 1, 'onPressed', 'Back'),
              child: const Text('Back'),
            ),
            SolarButton(
              size: SolarButtonSize.sm,
              onPressed: active == last
                  ? null
                  : () => go(active + 1, 'onPressed', 'Next'),
              child: const Text('Next'),
            ),
          ],
        ),
      ],
    );
  },
);
