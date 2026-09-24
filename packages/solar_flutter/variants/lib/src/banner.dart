import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarBanner in one oracle variant, every slot filled so each look is measured: both Buttons as
/// Figma draws them (built as the Button check builds one), the text action and the close button,
/// with Figma's own words.
Widget buildBanner(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final layers = v['layers'] as Map<String, dynamic>;
  Widget button(String layer) {
    final b =
        (layers[layer] as Map<String, dynamic>)['variant']
            as Map<String, dynamic>;
    return buildButton({
      'props': {
        'size': b['size'],
        'variant': b['prio'],
        'danger': b['danger'] == 'true',
        'disabled': false,
        'loading': false,
      },
    }, WidgetStatesController());
  }

  // Room for both Buttons with every probe (both icons, a counter): the banner fills whatever it
  // is given, and its width is the caller's (the overlay's).
  return SizedBox(
    width: 800,
    child: SolarBanner(
      type: enumNamed(SolarBannerType.values, props['type'] as String),
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      primaryButton: button('primaryButton'),
      secondaryButton: button('secondaryButton'),
      action: 'Action',
      onAction: () {},
      onClose: () {},
    ),
  );
}
