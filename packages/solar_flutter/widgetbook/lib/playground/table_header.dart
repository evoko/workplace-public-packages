// TableHeader's Playground: its breakpoint from its control; its SearchField (md), shown by the
// `search` toggle, holding the `query` extra, which typing sets (typing.dart keeps the field's
// controller in step); its Segmented Control (md) of sample views, shown by the toggle of the
// breakpoint's slot (`segmentedControl` on desktop, `segmentedControlMobile` on mobile, the widget
// drawing the one control in whichever), the chosen view the `view` extra, which choosing sets; its
// actions, three md secondary Icon Buttons (Filter, Download, More), shown by the breakpoint's
// content toggle (`actions`, `actionsMobile`), each press logged with its name. As the web's
// (stories/playground/table-header.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'typing.dart';

/// The sample views, as the `view` extra's dartOptions name them.
enum _View { all, online, offline }

const _viewWords = ['All', 'Online', 'Offline'];

const _actions = [
  ('Filter', SolarIcons.filterOutline),
  ('Download', SolarIcons.downloadOutline),
  ('More', SolarIcons.moreOutline),
];

final tableHeaderPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final breakpoint = p.choice(
      'breakpoint',
      SolarTableHeaderBreakpoint.values,
    );
    final mobile = breakpoint == SolarTableHeaderBreakpoint.mobile;
    final desktopViews = p.child('segmentedControl').shown;
    final mobileViews = p.child('segmentedControlMobile').shown;
    final desktopActions = p.flag('actions');
    final mobileActions = p.flag('actionsMobile');
    final view = p.choice('view', _View.values);
    final query = p.text('query');
    return SolarTableHeader(
      breakpoint: breakpoint,
      search: p.child('search').shown
          ? PlaygroundText(
              text: query,
              builder: (context, controller) => SolarSearchField(
                size: SolarSearchFieldSize.md,
                placeholder: 'Search',
                controller: controller,
                onChanged: (text) {
                  p.set('query', text);
                  p.log('onChanged', text);
                },
              ),
            )
          : null,
      segmentedControl: (mobile ? mobileViews : desktopViews)
          ? SolarSegmentedControl<_View>(
              size: SolarSegmentedControlSize.md,
              groupValue: view,
              onChanged: (value) {
                if (value == null) return;
                p.setChoice('view', value);
                p.log('onChanged', _viewWords[value.index]);
              },
              children: [
                for (final v in _View.values)
                  SolarSegmentedControlItem<_View>(
                    value: v,
                    label: _viewWords[v.index],
                    size: SolarSegmentedControlItemSize.md,
                  ),
              ],
            )
          : null,
      actions: [
        if (mobile ? mobileActions : desktopActions)
          for (final (name, icon) in _actions)
            SolarIconButton(
              size: SolarIconButtonSize.md,
              shape: SolarIconButtonShape.square,
              prio: SolarIconButtonPrio.secondary,
              icon: SolarIcon(icon),
              semanticLabel: name,
              onPressed: () => p.log('onPressed', name),
            ),
      ],
    );
  },
);
