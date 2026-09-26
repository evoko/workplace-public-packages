// EmptyState's Playground: its icon, title and description from their controls, each cleared part
// left out; its action a SolarButton, secondary at sm as the README composes it, shown by its toggle
// with its words, its tap logged. As the web's (stories/playground/empty-state.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final emptyStatePlayground = SolarPlaygroundBuilder(
  build: (p) {
    final (:shown, :text) = p.child('action');
    final label = text == null || text.isEmpty ? null : text;
    return SolarEmptyState(
      icon: p.icon('icon'),
      title: p.words('title'),
      description: p.words('description'),
      action: shown
          ? SolarButton(
              prio: SolarButtonPrio.secondary,
              size: SolarButtonSize.sm,
              semanticLabel: label == null ? 'Label' : null,
              onPressed: () => p.log('onPressed'),
              child: label == null ? null : Text(label),
            )
          : null,
    );
  },
);
