import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'controls.dart';
import 'probes.dart';

/// SolarPropertyRow in one oracle variant, named as the web case is: each trailing with the control
/// Figma draws in it, in a card and not.
Widget buildPropertyRow(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final trailing = RegExp(r'trailing=([a-z-]+)')
      .firstMatch(v['figma'] as String)![1]!;
  return propertyRow(trailing, inCard: props['inCard'] as bool);
}

/// A row given the control its [trailing] names, as Figma draws each, with a leading icon probe,
/// its words and a description; each composed control keyed by its layer so its own check measures
/// it. Shared with the PropertyList builder.
Widget propertyRow(String trailing, {bool inCard = false}) {
  Widget keyed(String layer, Widget child) =>
      KeyedSubtree(key: ValueKey('propertyRow.${layer}Case'), child: child);
  return SolarPropertyRow(
    inCard: inCard,
    label: 'Label',
    description: 'Description text',
    leading: const IconProbe(),
    button: trailing == 'action'
        ? keyed(
            'button',
            SolarButton(
              size: SolarButtonSize.md,
              prio: SolarButtonPrio.secondary,
              onPressed: () {},
              child: const Text('Button'),
            ),
          )
        : null,
    toggle: trailing == 'toggle'
        ? SolarToggle(onChanged: (_) {}, semanticLabel: 'On')
        : null,
    select: trailing == 'select'
        ? SolarSelect<String>(
            size: SolarSelectSize.md,
            placeholder: 'Select…',
            options: const [SolarSelectOption(value: 'one', label: 'Option')],
            onChanged: (_) {},
          )
        : null,
    iconButton: trailing == 'icon-button'
        ? keyed(
            'iconButton',
            SolarIconButton(
              onPressed: () {},
              icon: const IconProbe(key: Key('icon')),
              semanticLabel: 'Action',
              size: SolarIconButtonSize.md,
              prio: SolarIconButtonPrio.secondary,
            ),
          )
        : null,
    segmentedControl: trailing == 'segmented-control'
        ? segmentedControlMd()
        : null,
    tag: trailing == 'tag'
        ? const SolarTag(status: SolarTagStatus.neutral, label: 'Label')
        : null,
  );
}
