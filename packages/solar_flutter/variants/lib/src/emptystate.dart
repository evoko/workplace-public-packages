import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'button.dart';
import 'probes.dart';

/// SolarEmptyState in its one variant, every slot filled with Figma's own content: an icon probe,
/// its words, and its sm secondary Button (built as the Button check builds one).
Widget buildEmptyState(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) => SolarEmptyState(
  icon: const IconProbe(),
  title: 'No items found',
  description: 'Try adjusting your search or filters.',
  action: buildButton({
    'props': {
      'size': 'sm',
      'variant': 'secondary',
      'danger': false,
      'disabled': false,
      'loading': false,
    },
  }, WidgetStatesController()),
);
