// Tree Item's Playground: its words (the `label` extra) at the `depth` extra, its icons, state and
// parts from their controls. Its chevron control stands for whether it has children, since the
// widget draws its own chevron: `_none` makes it a leaf. Its checkbox, shown by the `checkbox`
// toggle, is checked by the `checked` extra; its status a success StatusIndicator; its Tag the `tag
// label` words; its Counter the `counter count` extra; its actions (more and add) shown by
// `buttons`. Live as in an app's tree: a tap selects it, the chevron and the arrow keys expand and
// collapse it, the checkbox checks it, and in `edit` submitting renames it (`label`), Escape
// cancels; each is set and logged. The widget has no F2 to start a rename (the web's
// `onRenameStart`), so `edit` starts one here. As the web's (stories/playground/tree-item.tsx).

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

final treeItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final checkbox = p.child('checkbox');
    final status = p.child('status');
    final tag = p.child('tag');
    final counter = p.child('counter');
    final buttons = p.child('buttons');
    final checked = p.flag('checked');
    final count = p.whole('counter count');
    final tagText = tag.text ?? '';
    return SolarTreeItem(
      selected: p.flag('selected'),
      expanded: p.flag('expanded'),
      edit: p.flag('edit'),
      label: p.text('label'),
      depth: p.whole('depth'),
      expandable: p.icon('chevron') != null,
      onExpandedChange: (expanded) {
        p.set('expanded', expanded);
        p.log('onExpandedChange', expanded);
      },
      onSelect: () {
        p.set('selected', true);
        p.log('onSelect');
      },
      checked: checkbox.shown ? checked : null,
      onCheckedChange: (next) {
        p.set('checked', next);
        p.log('onCheckedChange', next);
      },
      leadingIcon: p.icon('leadingIcon'),
      trailingIcon: p.icon('trailingIcon'),
      status: status.shown ? SolarStatusIndicatorType.success : null,
      tag: tag.shown && tagText.isNotEmpty ? SolarTag(label: tagText) : null,
      count: counter.shown ? count : null,
      onMore: buttons.shown ? () => p.log('onMore') : null,
      onAdd: buttons.shown ? () => p.log('onAdd') : null,
      onRename: (name) {
        p.set('label', name);
        p.set('edit', false);
        p.log('onRename', name);
      },
      onRenameCancel: () {
        p.set('edit', false);
        p.log('onRenameCancel');
      },
    );
  },
);
