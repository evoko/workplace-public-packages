// Banner's Playground: its type, message and text action from their controls; its Buttons,
// SolarButtons at sm (primary, secondary), shown by their toggles with their words; a close button
// while the `close` icon control shows one (the widget draws SOLAR's close icon, whichever is
// picked). Every tap is logged: a Button's with its slot, the text action's, the close button's. It
// fills its container, the width box. As the web's (stories/playground/banner.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final bannerPlayground = SolarPlaygroundBuilder(
  build: (p) {
    Widget? button(String slot, SolarButtonPrio prio) {
      final (:shown, :text) = p.child(slot);
      if (!shown) return null;
      final label = text == null || text.isEmpty ? null : text;
      return SolarButton(
        size: SolarButtonSize.sm,
        prio: prio,
        semanticLabel: label == null ? 'Label' : null,
        onPressed: () => p.log('onPressed', slot),
        child: label == null ? null : Text(label),
      );
    }

    return SolarBanner(
      type: p.choice('type', SolarBannerType.values),
      description: p.text('description'),
      primaryButton: button('primaryButton', SolarButtonPrio.primary),
      secondaryButton: button('secondaryButton', SolarButtonPrio.secondary),
      action: p.words('action'),
      onAction: () => p.log('onAction'),
      onClose: p.icon('close') == null ? null : () => p.log('onClose'),
    );
  },
);
