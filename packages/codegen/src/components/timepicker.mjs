/**
 * SOLAR TimePicker, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A typed picker (`src/shells/typed.mjs`): a time typed on the locale's clock, or picked from a
 * TimePicker Dropdown floating under the field, opened by its clock icon (owner decisions
 * 2026-09-24: typed and picked; one list of times).
 */

import {
  requireTyped,
  TYPED_FLUTTER_STATES,
  typedFlutter,
  typedReact,
  typedResets,
  typedStates,
} from '../shells/typed.mjs';

const ICON = 'iconClock';

export default {
  name: 'TimePicker',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, its clock icon a button.
    slots: 'drawn',
    resets: typedResets('TimePicker', ICON),
    states: typedStates('TimePicker'),
    overlaps: { focus: ['hover'], 'error-focused': ['hover'] },
  },
  flutter: { states: TYPED_FLUTTER_STATES },
  shells: {
    label: 'label',
    // Figma's showRequired is a field's `mandatory`, as Text Input names it.
    slots: { required: 'mandatory' },
  },
  templates: {
    react: (spec) => {
      requireTyped(spec, ICON);
      return typedReact(spec, {
        icon: ICON,
        about: `A time of day, typed or picked: its \`label\` above (a \`mandatory\` one is starred, and the input
required), its \`helper\` below, which says what is wrong where it is in \`error\`. The field is
MUI's InputBase, taking the time on the locale's clock (\`9:30 AM\`, \`21:30\`; either clock is
read), read on Enter and as the focus leaves; its clock button, or the down arrow, opens a
TimePickerDropdown under it, the chosen time in sight, where a click or Enter picks one and
Escape closes it. \`value\` and \`onChange\` hold the time, \`HH:mm\` (\`09:30\`), or null for none;
words that are no time leave it as it was, for the caller to flag with \`error\`. \`step\`, \`min\`
and \`max\` say which times the list offers; \`dropdownProps\` reach it. For a date and a time
together, put a DatePicker beside it.`,
        imports: `import {
  TimePickerDropdown,
  type TimePickerDropdownProps,
} from './TimePickerDropdown.js';
import {
  hhmmOf,
  parseHhmm,
  parseTimeWords,
  timeWords,
} from './internal/clock.js';`,
        valueType: 'string',
        docs: {
          value:
            'The time, `HH:mm` (`09:30`), where the caller keeps it; null for none.',
          defaultValue: 'The time it starts with, where `value` does not say.',
          onChange:
            'Called with the time typed or picked, `HH:mm`, or null where the words are cleared.',
        },
        props: `/** The locale its times are written in, on its clock; the page's by default. */
locale?: string;
/** The minutes between one time and the next in the list. */
step?: number;
/** The earliest and latest times the list offers, \`HH:mm\`. */
min?: string;
max?: string;
/** More of the list's props. */
dropdownProps?: Partial<TimePickerDropdownProps>;`,
        destructure: `locale,
step,
min,
max,
dropdownProps,`,
        words: `const time = parseHhmm(value);
const words = time ? timeWords(time, locale) : '';`,
        read: `const t = parseTimeWords(typed, locale);
return t ? hhmmOf(t) : null;`,
        openLabel: 'Choose time',
        popup: 'listbox',
        panel: `<TimePickerDropdown
  size={size}
  step={step}
  min={min}
  max={max}
  locale={locale}
  {...dropdownProps}
  sx={[
    { marginTop: gap },
    ...(Array.isArray(dropdownProps?.sx) ? dropdownProps.sx : [dropdownProps?.sx]),
  ]}
  anchorEl={field.current}
  open
  onClose={hide}
  value={value}
  onChange={(time) => {
    choose(time);
    hide();
    input.current?.focus();
  }}
/>`,
      });
    },
    flutter: (spec) => {
      requireTyped(spec, ICON);
      return typedFlutter(spec, {
        icon: ICON,
        about: `A time of day, typed or picked: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error]. Its words are a [TextField], undecorated, taking the time on the platform's clock, as MaterialLocalizations writes it (\`9:30 AM\`, \`21:30\`; either clock is read), read on submit and as the focus leaves; its clock icon, or the down arrow, opens a SolarTimePickerDropdown under the field, the chosen time in sight, where a tap or Enter picks one and Escape closes it. [value] and [onTimeChanged] hold the time, or null for none; words that are no time leave it as it was, for the caller to flag with [error]. [step], [first] and [last] say which times the list offers. It reads as one text field, named by its label and described by its helper.`,
        imports: `import '../generated/components/timepicker_dropdown.dart';
import '../solar_time.dart';
import 'solar_timepicker_dropdown.dart';`,
        valueType: 'TimeOfDay',
        onChanged: 'onTimeChanged',
        docs: {
          value: 'The time; null for none.',
          onChanged:
            'Called with the time typed or picked, or null where the words are cleared.',
        },
        params: `this.step = 30,
this.first,
this.last,`,
        fields: `/// The minutes between one time and the next in the list.
final int step;

/// The earliest and latest times the list offers.
final TimeOfDay? first, last;`,
        iconLabel: 'l.timePickerDialHelpText',
        format:
          'l.formatTimeOfDay(v, alwaysUse24HourFormat: MediaQuery.alwaysUse24HourFormatOf(context))',
        parse: 'parseSolarTime(typed, l)',
        same: 'a == b',
        panel: `SolarTimePickerDropdown(
  size: SolarTimePickerDropdownSize.values.byName(p.size.name),
  value: p.value,
  step: p.step,
  first: p.first,
  last: p.last,
  onChanged: choose,
)`,
      });
    },
  },
};
