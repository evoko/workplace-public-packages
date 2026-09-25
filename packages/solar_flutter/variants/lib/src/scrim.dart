import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// SolarScrim in its one oracle variant, named as the web case is: over a box of Figma's
/// proportions, dismissing on a tap.
Widget buildScrim(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SizedBox(width: 480, height: 320, child: SolarScrim(onDismiss: () {}));
