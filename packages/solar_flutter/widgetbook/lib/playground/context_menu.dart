// Context Menu's Playground: an "Open" button opens it at itself, as an app opens it at the object
// it acts on, and the `open` extra follows it (overlay.dart's PlaygroundMenu); Escape, a tap
// outside or choosing an action closes it. Its content, sample actions with their shortcuts (the
// last, Delete, destructive, after a Divider), shown by the `content` toggle (off, the menu is
// empty). Choosing an action is logged with its words. As the web's
// (stories/playground/context-menu.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'overlay.dart';
import 'playground.dart';
import 'samples.dart';

final contextMenuPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final content = p.flag('content');
    return PlaygroundMenu(
      p: p,
      menu: (close) => SolarContextMenu(
        children: [
          if (content) ...[
            for (final (label, shortcut) in sampleActions)
              SolarContextMenuItem(
                label: label,
                shortcut: shortcut,
                onPressed: () => close('onPressed', label),
              ),
            const SolarDivider(),
            SolarContextMenuItem(
              label: 'Delete',
              destructive: true,
              onPressed: () => close('onPressed', 'Delete'),
            ),
          ],
        ],
      ),
    );
  },
);
