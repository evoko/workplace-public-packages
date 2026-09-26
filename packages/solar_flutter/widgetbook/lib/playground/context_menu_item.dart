// Context Menu Item's Playground: an action works only in its menu, so it is drawn in a Context
// Menu, in place. Its words, shortcut, icons and states from their controls, a cleared shortcut
// left out. A tap is logged; disabled (a null onPressed), it is inert. As the web's
// (stories/playground/context-menu-item.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final contextMenuItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final label = p.text('label');
    return SolarContextMenu(
      children: [
        SolarContextMenuItem(
          destructive: p.flag('destructive'),
          leadingIcon: p.icon('leadingIcon'),
          trailingIcon: p.icon('trailingIcon'),
          shortcut: p.words('shortcut'),
          label: label,
          onPressed: p.flag('disabled')
              ? null
              : () => p.log('onPressed', label),
        ),
      ],
    );
  },
);
