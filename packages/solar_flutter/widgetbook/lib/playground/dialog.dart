// Dialog's Playground: an "Open" button opens it, as an app's trigger would, and the `open` extra
// follows it (overlay.dart); its close button, Escape, a tap on the Scrim or either action closes
// it. Its type follows from what it holds, as the widget's does: the picture (`modalImage`) makes
// the image dialog, else the Stepper the wizard, else the default, its icon before its title. The
// image dialog's title is `imageTitle` where that holds words, else `title`, since the widget draws
// one title in either place. Its stepper and actions are samples: five steps, the second active;
// Cancel and Continue in a full-width Button Group, as the README composes them. Its content is a
// neutral placeholder, a SolarSkeleton, since the dialog gives its content no text style of its
// own. As the web's (stories/playground/dialog.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';
import 'samples.dart';

final dialogPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundRoute(
    p: p,
    show: showSolarDialog,
    overlay: (context, close) {
      final image = p.flag('modalImage');
      final imageTitle = p.words('imageTitle');
      final title = p.text('title');
      final stepper = p.child('stepper');
      final actions = p.child('actions');
      Widget action(String name, SolarButtonPrio prio) => SolarButton(
        size: SolarButtonSize.lg,
        prio: prio,
        onPressed: () => close('actions', name),
        child: Text(name),
      );
      return SolarDialog(
        title: (image ? imageTitle : null) ?? title,
        icon: p.icon('icon'),
        image: image ? samplePicture : null,
        description: p.words('description'),
        stepper: stepper.shown
            ? const SolarStepper(
                type: SolarStepperType.lineText,
                steps: ['Step', 'Step', 'Step', 'Step', 'Step'],
                activeStep: 1,
              )
            : null,
        content: p.flag('content') ? const SolarSkeleton() : null,
        actions: actions.shown
            ? SolarButtonGroup(
                type: SolarButtonGroupType.fullWidth,
                children: [
                  action('Cancel', SolarButtonPrio.secondary),
                  action('Continue', SolarButtonPrio.primary),
                ],
              )
            : null,
        onClose: close,
      );
    },
  ),
);
