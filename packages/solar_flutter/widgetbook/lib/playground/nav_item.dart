// Nav Item's Playground: its words, icon and state from their controls. Choosing it makes it the
// current page, as an app's sidebar does: a tap sets `selected`, and is logged. An icon control at
// `_none` gives the required icon an empty box. As the web's (stories/playground/nav-item.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final navItemPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarNavItem(
    selected: p.flag('selected'),
    expanded: p.flag('expanded'),
    label: p.text('label'),
    iconOutline: p.icon('iconOutline') ?? const SizedBox.shrink(),
    onPressed: () {
      p.set('selected', true);
      p.log('onPressed');
    },
  ),
);
