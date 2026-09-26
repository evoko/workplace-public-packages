// Segmented Control Item's Playground: a segment works only in its control, so it is drawn first of
// three in a Segmented Control of its size, its two sample siblings after it. Its words are the
// `label` extra, its icons and size from their controls. The control decides which is chosen:
// `selected` on chooses this segment, off the sibling chosen last (the first sibling at first).
// Choosing a segment sets `selected`, as a tap on this one or a sibling makes it true or false. As
// the web's (stories/playground/segmented-control-item.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// This segment's value, and its sample siblings', which are their words too.
const _item = 'Day';
const _siblings = ['Week', 'Month'];

final segmentedControlItemPlayground = SolarPlaygroundBuilder(
  build: (p) => _ItemPlayground(p: p),
);

/// Keeps the sibling chosen last, which the control shows chosen while `selected` is off.
class _ItemPlayground extends StatefulWidget {
  const _ItemPlayground({required this.p});

  final SolarPlayground p;

  @override
  State<_ItemPlayground> createState() => _ItemPlaygroundState();
}

class _ItemPlaygroundState extends State<_ItemPlayground> {
  String _sibling = _siblings.first;

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final selected = p.flag('selected');
    final size = p.choice('size', SolarSegmentedControlItemSize.values);
    return SolarSegmentedControl<String>(
      size: SolarSegmentedControlSize.values.byName(size.name),
      groupValue: selected ? _item : _sibling,
      onChanged: (value) {
        if (value == null) return;
        if (value != _item) setState(() => _sibling = value);
        p.set('selected', value == _item);
        p.log('onChanged', value);
      },
      children: [
        SolarSegmentedControlItem<String>(
          value: _item,
          label: p.text('label'),
          size: size,
          iconLeading: p.icon('iconLeading'),
          iconTrailing: p.icon('iconTrailing'),
        ),
        for (final s in _siblings)
          SolarSegmentedControlItem<String>(value: s, label: s, size: size),
      ],
    );
  }
}
