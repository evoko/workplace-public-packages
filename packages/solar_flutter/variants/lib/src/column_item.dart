import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'probes.dart';

/// SolarColumnItem in one oracle variant, named as the web case is: each type with what Figma
/// draws in it (the oracle's content): the words, a user's Avatar and name, a status Tag, an icon
/// probe, a bare sm Text Input and Dropdown, an sm secondary Button, a Toggle off.
Widget buildColumnItem(
  Map<String, dynamic> v,
  WidgetStatesController _, [
  Map<String, dynamic>? _,
]) {
  final props = v['props'] as Map<String, dynamic>;
  final content = ((v['content'] as List?) ?? const []).cast<String>();
  final layers = (v['layers'] as Map?)?.cast<String, dynamic>() ?? const {};
  final tag = ((layers['tag'] as Map?)?['variant'] as Map?) ?? const {};
  final user = content.contains('avatar');
  return SolarColumnItem(
    header: props['header'] as bool,
    label: user ? 'Daniel Salmonsson' : 'Label',
    avatar: user
        ? const SolarAvatar(
            size: SolarAvatarSize.sm,
            type: SolarAvatarType.text,
            name: 'Daniel Salmonsson',
          )
        : null,
    tag: content.contains('tag')
        ? SolarTag(
            status: enumNamed(SolarTagStatus.values, tag['status'] as String),
            label: 'Label',
          )
        : null,
    icon: content.contains('icon') ? const IconProbe() : null,
    textInput: content.contains('textInput')
        ? const SolarTextInput(size: SolarTextInputSize.sm, placeholder: 'Text')
        : null,
    dropdown: content.contains('dropdown')
        ? SolarDropdown<String>(
            size: SolarDropdownSize.sm,
            placeholder: 'Label',
            options: const [SolarDropdownOption(value: 'one', label: 'Option')],
            onChanged: (_) {},
          )
        : null,
    button: content.contains('button')
        ? SolarButton(
            size: SolarButtonSize.sm,
            prio: SolarButtonPrio.secondary,
            onPressed: () {},
            child: const Text('Button'),
          )
        : null,
    toggle: content.contains('toggle')
        ? SolarToggle(onChanged: (_) {}, semanticLabel: 'On')
        : null,
  );
}
