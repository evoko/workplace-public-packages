// Timestamp's Playground: its format, size and emphasis; its words the `text` extra, and, for
// `combined`, the absolute time they abbreviate the `detail` extra, shown as a tooltip. As the
// web's (stories/playground/timestamp.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final timestampPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final format = p.choice('format', SolarTimestampFormat.values);
    final detail = p.words('detail');
    return SolarTimestamp(
      format: format,
      size: p.choice('size', SolarTimestampSize.values),
      emphasis: p.choice('emphasis', SolarTimestampEmphasis.values),
      text: p.text('text'),
      detail: format == SolarTimestampFormat.combined ? detail : null,
    );
  },
);
