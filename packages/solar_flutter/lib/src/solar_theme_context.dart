import 'package:flutter/widgets.dart';

import 'generated/tokens.dart';

/// `context.solar`: the SOLAR theme around this context, as [SolarTheme.of] gives it, the way an
/// app reaches SOLAR's colours and text styles in its own widgets
/// (`context.solar.colors.surfaceRaised`, `context.solar.typography.titleSm`).
extension SolarThemeContext on BuildContext {
  SolarTheme get solar => SolarTheme.of(this);
}
