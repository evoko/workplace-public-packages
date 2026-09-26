// Toast's Playground: its status, message and action from their controls, a cleared action left
// out, the action's tap logged; its Tag shown by its toggle, with the `tag label` extra's words; a
// chevron after the action while the `chevron` icon control shows one (the widget draws SOLAR's
// chevron, whichever is picked). Where it appears, and for how long, is the app's ScaffoldMessenger,
// so here it is drawn in place. As the web's (stories/playground/toast.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final toastPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final tagLabel = p.text('tag label');
    return SolarToast(
      status: p.choice('status', SolarToastStatus.values),
      message: p.text('message'),
      tag: p.child('tag').shown ? tagLabel : null,
      action: p.words('action'),
      onAction: () => p.log('onAction'),
      chevron: p.icon('chevron') != null,
    );
  },
);
