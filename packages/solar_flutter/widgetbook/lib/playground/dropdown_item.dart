// Dropdown Item's Playground: a row works only in its menu, so it is drawn in a Dropdown Menu of
// its size, in place. Its words the `label` extra, its second line, icon, checkbox and states from
// their controls, a cleared second line left out. A tap chooses it, as a menu's row is chosen:
// with its checkbox, a choice of several, it flips `selected`; without, it sets it. Disabled (a
// null onPressed), it is inert. As the web's (stories/playground/dropdown-item.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final dropdownItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarDropdownItemSize.values);
    final selected = p.flag('selected');
    final disabled = p.flag('disabled');
    final checkbox = p.child('checkbox').shown;
    final label = p.text('label');
    return SolarDropdownMenu(
      size: SolarDropdownMenuSize.values.byName(size.name),
      children: [
        SolarDropdownItem(
          size: size,
          selected: selected,
          checkbox: checkbox,
          icon: p.icon('icon'),
          helper: p.words('helper'),
          label: label,
          onPressed: disabled
              ? null
              : () {
                  p.set('selected', checkbox ? !selected : true);
                  p.log('onPressed', label);
                },
        ),
      ],
    );
  },
);
