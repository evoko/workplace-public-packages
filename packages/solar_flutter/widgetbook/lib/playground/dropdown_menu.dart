// Dropdown Menu's Playground: an "Open" button opens it under itself, as an app's trigger would,
// and the `open` extra follows it (overlay.dart's PlaygroundMenu); Escape, a tap outside or
// choosing a row closes it. Its size from its control; its content, a heading over three sample
// rows, shown by the `content` toggle (off, the menu is empty). Choosing a row is logged with its
// words. As the web's (stories/playground/dropdown-menu.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';
import 'samples.dart';

final dropdownMenuPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarDropdownMenuSize.values);
    final content = p.flag('content');
    return PlaygroundMenu(
      p: p,
      menu: (close) => SolarDropdownMenu(
        size: size,
        children: [
          if (content) ...[
            const SolarDropdownGroupLabel(label: 'Group Label'),
            for (final o in sampleOptions)
              SolarDropdownItem(
                label: sampleOptionWords(o),
                onPressed: () => close('onPressed', sampleOptionWords(o)),
              ),
          ],
        ],
      ),
    );
  },
);
