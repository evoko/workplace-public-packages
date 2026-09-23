import 'package:flutter/material.dart';

import '../generated/tokens.dart';

/// The ambient [SolarTheme]: the one the app installed as a theme extension, else the Light or
/// Dark theme for the app's brightness, so a SOLAR widget looks right before an app installs one.
SolarTheme solarThemeOf(BuildContext context) {
  final theme = Theme.of(context);
  return theme.extension<SolarTheme>() ??
      (theme.brightness == Brightness.dark
          ? SolarTheme.dark
          : SolarTheme.light);
}
