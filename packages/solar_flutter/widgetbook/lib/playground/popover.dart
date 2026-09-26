// Popover's Playground: an "Open" button opens it beside itself, its tip pointing at it, as an
// app's trigger would, and the `open` extra follows it; Escape or a tap outside it closes it
// (`onClose`). Its size and placement from their controls; its title and words the `title` and
// `body` extras (the IR holds no text slot), a cleared body left out. As the web's
// (stories/playground/popover.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final popoverPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarPopover(
    size: p.choice('size', SolarPopoverSize.values),
    placement: p.choice('placement', SolarPopoverPlacement.values),
    title: p.text('title'),
    body: p.words('body'),
    open: p.flag('open'),
    onClose: () {
      p.set('open', false);
      p.log('onClose');
    },
    child: SolarButton(
      onPressed: () => p.set('open', true),
      child: const Text('Open'),
    ),
  ),
);
