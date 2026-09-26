// ConfirmationDialog's Playground: an "Open" button opens it, as an app's trigger would, and the
// `open` extra follows it (overlay.dart); its intent, title and description from their controls.
// Its own Buttons close it: Continue logged `onConfirm`, Cancel `onCancel`, and Escape or a tap on
// the Scrim `onCancel` too, as the web's shell calls it for them. As the web's
// (stories/playground/confirmation-dialog.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';

final confirmationDialogPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundRoute(
    p: p,
    show: showSolarDialog,
    dismissEvent: 'onCancel',
    overlay: (context, close) => SolarConfirmationDialog(
      intent: p.choice('intent', SolarConfirmationDialogIntent.values),
      title: p.text('title'),
      description: p.words('description'),
      onConfirm: () => close('onConfirm'),
      onCancel: () => close('onCancel'),
    ),
  ),
);
