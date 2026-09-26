// Column Item's Playground: a cell is drawn in its Row, in a Table: a header in the header row, a
// data cell in a row. What it holds decides its type, as the widget derives it, the first of its
// shown parts in the widget's order (avatar, tag, icon, text input, dropdown, button, toggle), else
// its words; its words the `name` control (Figma's user's name). Its parts are samples: an sm
// Avatar named by the words, an "Online" Tag, the icon its control picks, an sm Text Input, an sm
// Dropdown of the sample options, an sm secondary Button, a Toggle. Their values are the row's data,
// which the Playground holds none of: a choice, a press and a switch are logged, and kept by none.
// A header sorts: its press is logged. As the web's (stories/playground/column-item.tsx).

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';
import 'samples.dart';

final columnItemPlayground = SolarPlaygroundBuilder(
  build: (p) {
    final header = p.flag('header');
    final name = p.text('name');
    bool shown(String slot) => p.child(slot).shown;
    final avatar = shown('avatar');
    final tag = shown('tag');
    final icon = p.icon('icon');
    final textInput = shown('textInput');
    final dropdown = shown('dropdown');
    final button = shown('button');
    final toggle = shown('toggle');
    final item = SolarColumnItem(
      header: header,
      label: name,
      avatar: avatar
          ? SolarAvatar(
              size: SolarAvatarSize.sm,
              type: SolarAvatarType.text,
              name: name,
            )
          : null,
      tag: tag
          ? const SolarTag(status: SolarTagStatus.success, label: 'Online')
          : null,
      icon: icon,
      textInput: textInput
          ? const SolarTextInput(
              size: SolarTextInputSize.sm,
              placeholder: 'Text',
            )
          : null,
      dropdown: dropdown
          ? SolarDropdown<SampleOption>(
              size: SolarDropdownSize.sm,
              placeholder: 'Label',
              options: [
                for (final o in sampleOptions)
                  SolarDropdownOption(value: o, label: sampleOptionWords(o)),
              ],
              onChanged: (o) => p.log('onChanged', sampleOptionWords(o)),
            )
          : null,
      button: button
          ? SolarButton(
              size: SolarButtonSize.sm,
              prio: SolarButtonPrio.secondary,
              onPressed: () => p.log('onPressed'),
              child: const Text('Button'),
            )
          : null,
      toggle: toggle
          ? SolarToggle(
              onChanged: (on) => p.log('onChanged', on),
              semanticLabel: 'On',
            )
          : null,
      onSort: header ? () => p.log('onSort') : null,
    );
    return header
        ? SolarTable(
            header: SolarRow(type: SolarRowType.title, cells: [item]),
          )
        : SolarTable(
            rows: [
              SolarRow(cells: [item]),
            ],
          );
  },
);
