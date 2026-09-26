// Dropdown Group Label's Playground: a heading works only in its menu, so it is drawn in a Dropdown
// Menu of its size, in place, over two sample rows, whose taps are logged. Its words the `label`
// extra. As the web's (stories/playground/dropdown-group-label.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The rows under the heading.
const _rows = ['Option 1', 'Option 2'];

final dropdownGroupLabelPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarDropdownGroupLabelSize.values);
    return SolarDropdownMenu(
      size: SolarDropdownMenuSize.values.byName(size.name),
      children: [
        SolarDropdownGroupLabel(size: size, label: p.text('label')),
        for (final row in _rows)
          SolarDropdownItem(
            label: row,
            onPressed: () => p.log('onPressed', row),
          ),
      ],
    );
  },
);
