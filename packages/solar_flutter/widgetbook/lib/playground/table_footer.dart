// TableFooter's Playground: its breakpoint from its control; each part shown by the toggle of the
// breakpoint's slot, the widget drawing the one part in whichever the breakpoint draws: how many
// rows a page shows, an md Dropdown (`rowsPerPage` on desktop, `rowsPerPageMobile` on mobile) whose
// choice is the `rows` extra, and its words (`rowsPerPageLabel`, desktop only, a cleared one left
// out); a Pagination of twelve pages (`pagination`, `paginationMobile`) whose page is the `page`
// extra; the action, an md primary Button in the `button label` words on desktop and an md primary
// Icon Button on mobile, each press logged. Choosing a count or a page sets it. As the web's
// (stories/playground/table-footer.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The row counts a page offers, as the `rows` extra's dartOptions name them.
enum _Count { $10, $25, $50 }

String _words(_Count c) => c.name.substring(1);

final tableFooterPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final breakpoint = p.choice(
      'breakpoint',
      SolarTableFooterBreakpoint.values,
    );
    final place = breakpoint == SolarTableFooterBreakpoint.mobile ? 1 : 0;
    final rows = [p.child('rowsPerPage'), p.child('rowsPerPageMobile')];
    final pages = [p.child('pagination'), p.child('paginationMobile')];
    final button = p.child('button');
    return SolarTableFooter(
      breakpoint: breakpoint,
      rowsPerPage: rows[place].shown
          ? SolarDropdown<_Count>(
              size: SolarDropdownSize.md,
              value: p.choice('rows', _Count.values),
              options: [
                for (final c in _Count.values)
                  SolarDropdownOption(value: c, label: _words(c)),
              ],
              onChanged: (c) {
                p.setChoice('rows', c);
                p.log('onChanged', _words(c));
              },
            )
          : null,
      rowsPerPageLabel: p.words('rowsPerPageLabel'),
      pagination: pages[place].shown
          ? SolarPagination(
              count: 12,
              page: p.whole('page'),
              onChanged: (n) {
                p.set('page', n);
                p.log('onChanged', n);
              },
            )
          : null,
      button: button.shown
          ? SolarButton(
              size: SolarButtonSize.md,
              prio: SolarButtonPrio.primary,
              onPressed: () => p.log('onPressed'),
              child: Text(button.text ?? ''),
            )
          : null,
      iconButton: p.child('iconButton').shown
          ? SolarIconButton(
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              prio: SolarIconButtonPrio.primary,
              icon: const SolarIcon(SolarIcons.plusOutline),
              semanticLabel: 'Add',
              onPressed: () => p.log('onPressed'),
            )
          : null,
    );
  },
);
