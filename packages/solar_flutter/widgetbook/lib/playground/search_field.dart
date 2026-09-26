// SearchField's Playground: its query the `value` extra, which typing sets (typing.dart keeps the
// field's controller in step); its size and states from their controls; its filter the icon its
// control picks (Figma's filter icon at first), as Figma draws it, none where `_none`. It shows
// Figma's "Search" while empty, and is named "Search", as the widget names it; the keyboard's
// search action is logged. As the web's (stories/playground/search-field.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

final searchFieldPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final size = p.choice('size', SolarSearchFieldSize.values);
    final enabled = !p.flag('disabled');
    final error = p.flag('error');
    final filter = p.icon('filter');
    return PlaygroundText(
      text: p.text('value'),
      builder: (context, controller) => SolarSearchField(
        size: size,
        enabled: enabled,
        error: error,
        filter: filter,
        placeholder: 'Search',
        controller: controller,
        onChanged: (text) {
          p.set('value', text);
          p.log('onChanged', text);
        },
        onSubmitted: (text) => p.log('onSubmitted', text),
      ),
    );
  },
);
