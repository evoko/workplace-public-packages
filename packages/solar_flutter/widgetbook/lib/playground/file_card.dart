// File Card's Playground: its type from its control; a file's name, when it changed and its type's
// icon, or the create tile's words (`label`, the widget's title for the tile), from theirs; its More
// menu the sample actions (cards.dart). Pressable, as an app's file grid is: its press is logged. As
// the web's (stories/playground/file-card.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'cards.dart';
import 'playground.dart';

final fileCardPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final create =
        p.choice('type', SolarFileCardType.values) == SolarFileCardType.create;
    final title = p.text('title');
    final meta = p.text('meta');
    final label = p.text('label');
    return SolarFileCard(
      type: create ? SolarFileCardType.create : SolarFileCardType.file,
      title: create ? label : title,
      meta: create ? null : meta,
      fileIcon: p.icon('fileIcon'),
      moreItems: sampleMoreItems(p),
      onPressed: () => p.log('onPressed'),
    );
  },
);
