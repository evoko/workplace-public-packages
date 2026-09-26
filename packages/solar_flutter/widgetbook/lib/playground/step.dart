// Step's Playground: a step works only in its Stepper, which makes its Steps and gives each its
// status, so it is drawn second of three in a Stepper, its words the `label` extra, its siblings
// sample steps. Its `status` places the Stepper's active (and error) step so that this one has it;
// its `type` picks the Stepper that draws it (round Steps `with label`, horizontal ones
// `line+text`). A completed step goes back to it, as `onStepClick` lets an app: this one's status
// follows (active, or upcoming where the first is chosen), set and logged. As the web's
// (stories/playground/step.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The Stepper's active step, and its error step, that give the second step each status.
const _placed = {
  SolarStepStatus.upcoming: (0, null),
  SolarStepStatus.active: (1, null),
  SolarStepStatus.complete: (2, null),
  SolarStepStatus.error: (1, 1),
};

final stepPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final (active, error) =
        _placed[p.choice('status', SolarStepStatus.values)]!;
    return SolarStepper(
      type: p.choice('type', SolarStepType.values) == SolarStepType.round
          ? SolarStepperType.withLabel
          : SolarStepperType.lineText,
      steps: ['Account', p.text('label'), 'Confirm'],
      activeStep: active,
      errorStep: error,
      onStepClick: (i) {
        p.setChoice(
          'status',
          i == 0 ? SolarStepStatus.upcoming : SolarStepStatus.active,
        );
        p.log('onStepClick', i);
      },
    );
  },
);
