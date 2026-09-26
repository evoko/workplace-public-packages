// PaginationItem's Playground: a page works only in its row, so it is drawn first of three, its two
// sample siblings the pages after it. Its number is the `page` words' (1 where they are no whole
// number). The row decides which is current: `selected` on makes this page current, off the sibling
// chosen last (the first at first). Choosing a page sets `selected` and is logged with its number. A
// disabled page has no callback, and stays inert. As the web's
// (stories/playground/pagination-item.tsx).

import 'dart:math' as math;

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// A page's number from words: a whole number from 1, or 1.
int _pageOf(String words) {
  final n = RegExp(r'^\s*\d+\s*$').hasMatch(words)
      ? int.parse(words.trim())
      : 1;
  return math.max(1, n);
}

final paginationItemPlayground = SolarPlaygroundBuilder(
  build: (p) => _PaginationItemPlayground(p: p),
);

/// Keeps the sibling chosen last, which the row shows current while `selected` is off.
class _PaginationItemPlayground extends StatefulWidget {
  const _PaginationItemPlayground({required this.p});

  final SolarPlayground p;

  @override
  State<_PaginationItemPlayground> createState() =>
      _PaginationItemPlaygroundState();
}

class _PaginationItemPlaygroundState extends State<_PaginationItemPlayground> {
  int _sibling = 0;

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final page = _pageOf(p.text('page'));
    final selected = p.flag('selected');
    final disabled = p.flag('disabled');
    return Row(
      mainAxisSize: MainAxisSize.min,
      spacing: SolarStack.$2xs,
      children: [
        SolarPaginationItem(
          page: page,
          selected: selected,
          onPressed: disabled
              ? null
              : () {
                  p.set('selected', true);
                  p.log('onPressed', page);
                },
        ),
        for (final (i, n) in [page + 1, page + 2].indexed)
          SolarPaginationItem(
            page: n,
            selected: !selected && _sibling == i,
            onPressed: () {
              setState(() => _sibling = i);
              p.set('selected', false);
              p.log('onPressed', n);
            },
          ),
      ],
    );
  }
}
