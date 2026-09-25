import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// The SOLAR controls a composing builder draws where Figma composes them, as each one's own check
/// measures it: shared by the builders of the components that hold them (TableHeader, PropertyRow, Calendar Toolbar).

/// The md Segmented Control's segments, as its own oracle draws them: Figma's six, in order.
const segmentedControlMdSegments = [
  'segmentedControlItem',
  'segmentedControlItem2',
  'segmentedControlItem3',
  'segmentedControlItem4',
  'segmentedControlItem5',
  'segmentedControlItem6',
];

/// A Segmented Control with no label or helper (as a composing instance hides them) and the six
/// segments its own check draws, each keyed by its layer, the first chosen; its segments are named
/// alike at either size.
Widget segmentedControlOf(
  SolarSegmentedControlSize size,
  SolarSegmentedControlItemSize itemSize,
) => SolarSegmentedControl<String>(
  size: size,
  groupValue: segmentedControlMdSegments.first,
  onChanged: (_) {},
  children: [
    for (final name in segmentedControlMdSegments)
      KeyedSubtree(
        key: Key(name),
        child: SolarSegmentedControlItem<String>(
          value: name,
          label: 'Label',
          size: itemSize,
        ),
      ),
  ],
);

/// The md one, as TableHeader and PropertyRow compose it.
Widget segmentedControlMd() => segmentedControlOf(
  SolarSegmentedControlSize.md,
  SolarSegmentedControlItemSize.md,
);
