// Drawer's Playground: an "Open" button opens it, as an app's trigger would, and the `open` extra
// follows it (overlay.dart); its close button, Escape, a tap on the Scrim or either action closes
// it. Its title from its control; its content a neutral placeholder, a SolarSkeleton, as the
// Dialog's, shown by the `content` toggle; its footer, shown by the `cta` toggle, Cancel and
// Continue in a full-width Button Group, each closing it, logged with its words. As the web's
// (stories/playground/drawer.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';

final drawerPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundRoute(
    p: p,
    show: showSolarDrawer,
    overlay: (context, close) {
      Widget action(String name, SolarButtonPrio prio) => SolarButton(
        size: SolarButtonSize.lg,
        prio: prio,
        onPressed: () => close('onPressed', name),
        child: Text(name),
      );
      return SolarDrawer(
        title: p.text('title'),
        content: p.flag('content') ? const SolarSkeleton() : null,
        actions: p.child('cta').shown
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
