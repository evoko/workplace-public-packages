// Section Nav Item's Playground: its words, icon and state from their controls. Choosing it makes it
// the current page, as a section nav rail does: a tap sets `selected`, and is logged. A disabled one
// has no callback, and stays inert. As the web's (stories/playground/section-nav-item.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final sectionNavItemPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarSectionNavItem(
    selected: p.flag('selected'),
    label: p.text('label'),
    icon: p.icon('icon') ?? const SizedBox.shrink(),
    onPressed: p.flag('disabled')
        ? null
        : () {
            p.set('selected', true);
            p.log('onPressed');
          },
  ),
);
