// Split Dialog's Playground: an "Open" button opens it, as an app's trigger would, and the `open`
// extra follows it (overlay.dart); its close button, Escape, a tap on the Scrim or either action
// closes it. Its icon and title from their controls. Its `cta` decides where its left pane and its
// actions go, so each is shown by the toggle of the slot the cta draws (`left` and `actions` across
// its foot; `leftRegular` and `actionsRegular` with the actions under the left pane), the widget
// drawing the one content in whichever. Its panes hold a neutral placeholder, a SolarSkeleton each,
// as the Dialog's content does; its actions Cancel and Continue in a Button Group of the cta's type,
// each closing it, logged with its words. As the web's (stories/playground/split-dialog.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';

final splitDialogPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundRoute(
    p: p,
    show: showSolarDialog,
    overlay: (context, close) {
      final cta = p.choice('cta', SolarSplitDialogCta.values);
      final regular = cta == SolarSplitDialogCta.regular;
      final left = [p.flag('left'), p.flag('leftRegular')];
      final actions = [p.child('actions'), p.child('actionsRegular')];
      final place = regular ? 1 : 0;
      Widget action(String name, SolarButtonPrio prio) => SolarButton(
        size: SolarButtonSize.lg,
        prio: prio,
        onPressed: () => close('onPressed', name),
        child: Text(name),
      );
      return SolarSplitDialog(
        cta: cta,
        icon: p.icon('icon'),
        title: p.text('title'),
        left: left[place] ? const SolarSkeleton() : null,
        right: p.flag('right') ? const SolarSkeleton() : null,
        actions: actions[place].shown
            ? SolarButtonGroup(
                type: regular
                    ? SolarButtonGroupType.regular
                    : SolarButtonGroupType.fullWidth,
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
