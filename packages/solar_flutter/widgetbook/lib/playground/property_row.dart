// PropertyRow's Playground: a row is drawn in its PropertyList, which gives it its in-card look, so
// the row's `inCard` control is the list's. Its leading icon, words and description from their
// controls, a cleared description left out. Its control is shown while `trailing` and the control's
// own toggle are on, the first of the shown ones in the widget's order deciding its trailing
// (button, toggle, select, icon button, segmented control, tag), each a sample as Figma draws it: an
// md secondary Button, a Toggle, an md Select of the sample options, an md secondary Icon Button, an
// md Segmented Control, a neutral Tag. Their values are the entity's, which the Playground holds
// none of: a press, a switch and a choice are logged, and kept by none. As the web's
// (stories/playground/property-row.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

enum _Segment { day, week, month }

const _segmentWords = ['Day', 'Week', 'Month'];

final propertyRowPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final trailing = p.child('trailing').shown;
    bool on(String slot) => p.child(slot).shown && trailing;
    final button = on('button');
    final toggle = on('toggle');
    final select = on('select');
    final iconButton = on('iconButton');
    final segmentedControl = on('segmentedControl');
    final tag = on('tag');
    return SolarPropertyList(
      inCard: p.flag('inCard'),
      children: [
        SolarPropertyRow(
          leading: p.icon('leading'),
          label: p.text('label'),
          description: p.words('description'),
          button: button
              ? SolarButton(
                  size: SolarButtonSize.md,
                  prio: SolarButtonPrio.secondary,
                  onPressed: () => p.log('onPressed'),
                  child: const Text('Button'),
                )
              : null,
          toggle: toggle
              ? SolarToggle(
                  onChanged: (value) => p.log('onChanged', value),
                  semanticLabel: 'On',
                )
              : null,
          select: select
              ? SolarSelect<SampleOption>(
                  size: SolarSelectSize.md,
                  placeholder: 'Select…',
                  options: [
                    for (final o in sampleOptions)
                      SolarSelectOption(value: o, label: sampleOptionWords(o)),
                  ],
                  onChanged: (o) => p.log('onChanged', sampleOptionWords(o)),
                )
              : null,
          iconButton: iconButton
              ? SolarIconButton(
                  size: SolarIconButtonSize.md,
                  shape: SolarIconButtonShape.square,
                  prio: SolarIconButtonPrio.secondary,
                  icon: const SolarIcon(SolarIcons.moreOutline),
                  semanticLabel: 'More',
                  onPressed: () => p.log('onPressed'),
                )
              : null,
          segmentedControl: segmentedControl
              ? SolarSegmentedControl<_Segment>(
                  size: SolarSegmentedControlSize.md,
                  groupValue: _Segment.day,
                  onChanged: (value) {
                    if (value != null) {
                      p.log('onChanged', _segmentWords[value.index]);
                    }
                  },
                  children: [
                    for (final s in _Segment.values)
                      SolarSegmentedControlItem<_Segment>(
                        value: s,
                        label: _segmentWords[s.index],
                        size: SolarSegmentedControlItemSize.md,
                      ),
                  ],
                )
              : null,
          tag: tag
              ? const SolarTag(status: SolarTagStatus.neutral, label: 'Label')
              : null,
        ),
      ],
    );
  },
);
