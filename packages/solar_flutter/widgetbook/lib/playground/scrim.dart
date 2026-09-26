// Scrim's Playground: the layer behind a blocking surface, shown alone: an "Open" button shows it,
// as the surface's trigger would, and the `open` extra follows it (overlay.dart). A tap on it
// dismisses it (`onDismiss`, as a dismissible surface above it takes it); Escape, which the surface
// above it would take, hides it too, logged `onClose`. It is shown in a route of its own over the
// page, with no barrier of the route's: the Scrim is the barrier. As the web's
// (stories/playground/scrim.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';

/// Shows [builder]'s Scrim over the page in a route that draws nothing of its own, which Escape
/// pops, as the route of the surface above it would be.
Future<Object?> _showScrim({
  required BuildContext context,
  required WidgetBuilder builder,
}) => Navigator.of(context).push<Object?>(
  PageRouteBuilder<Object?>(
    opaque: false,
    barrierDismissible: true,
    pageBuilder: (context, _, _) => builder(context),
  ),
);

final scrimPlayground = SolarPlaygroundBuilder(
  build: (p) => PlaygroundRoute(
    p: p,
    show: _showScrim,
    overlay: (context, close) =>
        SolarScrim(onDismiss: () => close('onDismiss'), semanticLabel: 'Close'),
  ),
);
