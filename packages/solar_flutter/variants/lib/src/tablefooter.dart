import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarTableFooter in one oracle variant, named as the web case is: each breakpoint with what
/// Figma draws in it: the bare md Dropdown (a page of 10 rows) and its words, Pagination's first of
/// twelve pages, and the md primary action, a Button on desktop and an Icon Button on mobile, each
/// keyed as the layer it is drawn in.
Widget buildTableFooter(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final breakpoint = enumNamed(
    SolarTableFooterBreakpoint.values,
    props['breakpoint'] as String,
  );
  return SizedBox(
    width: breakpoint == SolarTableFooterBreakpoint.mobile ? 377 : 1020,
    child: SolarTableFooter(
      breakpoint: breakpoint,
      rowsPerPage: SolarDropdown<String>(
        size: SolarDropdownSize.md,
        value: '10',
        options: const [
          SolarDropdownOption(value: '10', label: '10'),
          SolarDropdownOption(value: '25', label: '25'),
        ],
        onChanged: (_) {},
      ),
      rowsPerPageLabel: 'rows per page',
      pagination: SolarPagination(count: 12, page: 1, onChanged: (_) {}),
      button: KeyedSubtree(
        key: const ValueKey('tableFooter.buttonCase'),
        child: SolarButton(
          size: SolarButtonSize.md,
          onPressed: () {},
          child: const Text('Button'),
        ),
      ),
      iconButton: KeyedSubtree(
        key: const ValueKey('tableFooter.iconButtonCase'),
        child: SolarIconButton(
          onPressed: () {},
          icon: const IconProbe(key: Key('icon')),
          semanticLabel: 'Action',
          size: SolarIconButtonSize.md,
          prio: SolarIconButtonPrio.primary,
        ),
      ),
    ),
  );
}
