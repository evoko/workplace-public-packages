import 'package:flutter/widgets.dart';

import '../generated/tokens.dart';

/// The ambient [SolarTheme], as the widgets read it: [SolarTheme.of], the one the app installed, else
/// the Light or Dark theme for the app's brightness, so a SOLAR widget looks right before an app
/// installs one.
SolarTheme solarThemeOf(BuildContext context) => SolarTheme.of(context);
