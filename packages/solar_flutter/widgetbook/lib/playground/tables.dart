// What the table Playground builders share: the sample header row's cells and a sample device's
// cells, words alone (samples.dart), and the rows a comma-separated text names. As the web's
// (stories/playground/tables.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'samples.dart';

/// The header row's cells: the sample columns' names.
List<Widget> headerCells() => [
  for (final name in sampleColumns) SolarColumnItem(header: true, label: name),
];

/// A sample device's cells, its words by column.
List<Widget> deviceCells((String, String, String) device) => [
  for (final words in [device.$1, device.$2, device.$3])
    SolarColumnItem(label: words),
];

/// The names a comma-separated text holds, trimmed.
Set<String> namedIn(String text) => {
  for (final name in text.split(',')) name.trim(),
};
