// Breadcrumb Item's Playground: an item works only in its trail, so it is drawn in a Breadcrumbs
// after a sample Home. The trail decides its type by its place, so `type` places it: a link is an
// ancestor, a sample current page after it; the current page is the trail's last. Its words are the
// `label` extra; a disabled one is text. Each link's tap is logged with its words. As the web's
// (stories/playground/breadcrumb-item.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final breadcrumbItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final type = p.choice('type', SolarBreadcrumbItemType.values);
    final disabled = p.flag('disabled');
    final label = p.text('label');
    return SolarBreadcrumbs(
      children: [
        SolarBreadcrumbItem(
          label: 'Home',
          onPressed: () => p.log('onPressed', 'Home'),
        ),
        SolarBreadcrumbItem(
          type: type,
          disabled: disabled,
          label: label,
          onPressed: disabled ? null : () => p.log('onPressed', label),
        ),
        if (type == SolarBreadcrumbItemType.link)
          const SolarBreadcrumbItem(label: 'Current page'),
      ],
    );
  },
);
