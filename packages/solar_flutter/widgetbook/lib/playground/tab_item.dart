// Tab Item's Playground: a tab works only in its strip, so it is drawn first of three in a Tabs of
// its size (a tab takes its strip's), its two sample siblings after it. Its words, icons and state
// from their controls; its Counter, shown by the `counter` toggle, counts the `counter count` extra.
// The strip decides which is selected: `selected` on selects this tab, off the sibling selected last
// (the first at first). Choosing a tab sets `selected`, as choosing this one or a sibling makes it
// true or false. As the web's (stories/playground/tab-item.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// This tab's value (logged as its words), and its sample siblings', which are their words too.
const _item = Object();
const _siblings = ['Activity', 'Settings'];

final tabItemPlayground = SolarPlaygroundBuilder(
  build: (p) => _TabItemPlayground(p: p),
);

/// Keeps the sibling selected last, which the strip shows selected while `selected` is off.
class _TabItemPlayground extends StatefulWidget {
  const _TabItemPlayground({required this.p});

  final SolarPlayground p;

  @override
  State<_TabItemPlayground> createState() => _TabItemPlaygroundState();
}

class _TabItemPlaygroundState extends State<_TabItemPlayground> {
  String _sibling = _siblings.first;

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final selected = p.flag('selected');
    final size = p.choice('size', SolarTabItemSize.values);
    final counter = p.child('counter');
    final count = p.whole('counter count');
    final label = p.text('label');
    return SolarTabs(
      size: SolarTabsSize.values.byName(size.name),
      value: selected ? _item : _sibling,
      onChanged: (value) {
        if (value is String) setState(() => _sibling = value);
        p.set('selected', value == _item);
        p.log('onChanged', value == _item ? label : value);
      },
      children: [
        SolarTabItem(
          value: _item,
          label: label,
          size: size,
          disabled: p.flag('disabled'),
          leadingIcon: p.icon('leadingIcon'),
          trailingIcon: p.icon('trailingIcon'),
          count: counter.shown ? count : null,
        ),
        for (final s in _siblings) SolarTabItem(value: s, label: s, size: size),
      ],
    );
  }
}
