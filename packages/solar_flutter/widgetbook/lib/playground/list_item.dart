// ListItem's Playground: its words the `label` extra; its second line, icon, trailing icon and
// states from their controls, a cleared second line left out. The `avatar` toggle gives it a sample
// SolarAvatar (Dana Scully's initials) in place of its icon, which makes it an avatar row. A tap
// chooses it, as a list's row is chosen: it is logged, and sets `selected`. Disabled (a null
// onPressed), it is inert. It is drawn alone, not in a List, since a List gives its rows its own
// compactness, which would override the `compact` control. As the web's
// (stories/playground/list-item.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final listItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final label = p.text('label');
    return SolarListItem(
      selected: p.flag('selected'),
      compact: p.flag('compact'),
      icon: p.icon('icon'),
      avatar: p.child('avatar').shown
          ? const SolarAvatar(name: 'Dana Scully')
          : null,
      helper: p.words('helper'),
      trailing: p.icon('trailing'),
      label: label,
      onPressed: p.flag('disabled')
          ? null
          : () {
              p.set('selected', true);
              p.log('onPressed', label);
            },
    );
  },
);
