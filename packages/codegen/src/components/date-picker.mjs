/**
 * SOLAR DatePicker, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A typed picker (`src/shells/typed.mjs`): a date typed in the locale's figures, or picked from a
 * Date Picker Open floating under the field, opened by its calendar icon (owner decision
 * 2026-09-24: typed and picked).
 */

import {
  requireTyped,
  TYPED_FLUTTER_STATES,
  typedFlutter,
  typedReact,
  typedResets,
  typedStates,
} from '../shells/typed.mjs';

const ICON = 'iconCalendar';

export default {
  name: 'DatePicker',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, its calendar icon a button.
    slots: 'drawn',
    resets: typedResets('DatePicker', ICON),
    states: typedStates('DatePicker'),
    overlaps: { focus: ['hover'], 'error-focused': ['hover'] },
  },
  flutter: { states: TYPED_FLUTTER_STATES },
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Figma's showRequired is a field's `mandatory`, as Text Input names it.
  api: {
    react: { label: 'label', required: 'mandatory' },
    flutter: { required: 'mandatory' },
  },
  templates: {
    react: (spec) => {
      requireTyped(spec, ICON);
      return typedReact(spec, {
        icon: ICON,
        about: `A date, typed or picked: its \`label\` above (a \`mandatory\` one is starred, and the input
required), its \`helper\` below, which says what is wrong where it is in \`error\`. The field is
MUI's InputBase, taking the date in the locale's figures (\`24/04/2026\`, \`04/24/2026\` in the
US), read on Enter and as the focus leaves; its calendar button, or the down arrow, opens a
DatePickerOpen under it, the focus on the chosen day, where a click or Enter picks one and
Escape closes it. \`value\` and \`onChange\` hold the date, an ISO string (\`2026-04-24\`), or null
for none; words that are no date leave it as it was, for the caller to flag with \`error\`.
\`min\`, \`max\` and \`isDateDisabled\` refuse dates in the calendar; \`calendarProps\` reach it.`,
        imports: `import {
  DatePickerOpen,
  type DatePickerOpenProps,
} from './DatePickerOpen.js';
import {
  dateOf,
  isoOf,
  parseIso,
  parseShortDate,
  shortDate,
} from './internal/calendar.js';`,
        valueType: 'string',
        docs: {
          value:
            'The date, ISO (`2026-04-24`), where the caller keeps it; null for none.',
          defaultValue: 'The date it starts with, where `value` does not say.',
          onChange:
            'Called with the date typed or picked, ISO, or null where the words are cleared.',
        },
        props: `/** The locale its figures, months and weekdays are written in; the page's by default. */
locale?: string;
/** The earliest and latest dates the calendar takes, ISO. */
min?: string;
max?: string;
/** Whether the calendar refuses a date, ISO (a weekend, a booked day). */
isDateDisabled?: (date: string) => boolean;
/** The week's first day, 0 for Sunday to 6 for Saturday; the locale's by default. */
weekStartsOn?: number;
/** More of the calendar's props (\`type="double"\`, \`today\`). */
calendarProps?: Partial<DatePickerOpenProps>;`,
        destructure: `locale,
min,
max,
isDateDisabled,
weekStartsOn,
calendarProps,`,
        words: `const day = parseIso(value);
const words = day ? shortDate(day, locale) : '';`,
        read: `const d = parseShortDate(typed, locale);
return d ? isoOf(dateOf(d)) : null;`,
        openLabel: 'Choose date',
        popup: 'dialog',
        panel: `<DatePickerOpen
  locale={locale}
  min={min}
  max={max}
  isDateDisabled={isDateDisabled}
  weekStartsOn={weekStartsOn}
  {...calendarProps}
  sx={[
    { marginTop: gap },
    ...(Array.isArray(calendarProps?.sx) ? calendarProps.sx : [calendarProps?.sx]),
  ]}
  anchorEl={field.current}
  open
  onClose={hide}
  value={value}
  onChange={(iso) => {
    choose(iso);
    hide();
    input.current?.focus();
  }}
  // eslint-disable-next-line jsx-a11y/no-autofocus -- a date picker's dialog focuses its day as it opens, as the pattern asks
  autoFocus
/>`,
      });
    },
    flutter: (spec) => {
      requireTyped(spec, ICON);
      return typedFlutter(spec, {
        icon: ICON,
        about: `A date, typed or picked: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error]. Its words are a [TextField], undecorated, taking the date in the locale's figures (MaterialLocalizations' compact date, \`04/24/2026\` in the US), read on submit and as the focus leaves; its calendar icon, or the down arrow, opens a SolarDatePickerOpen under the field, the focus on the chosen day, where a tap or Enter picks one and Escape closes it. [value] and [onDateChanged] hold the date, its time ignored, or null for none; words that are no date leave it as it was, for the caller to flag with [error]. [firstDate], [lastDate] and [selectableDayPredicate] refuse dates in the calendar. It reads as one text field, named by its label and described by its helper.`,
        imports: "import 'solar_date_picker_open.dart';",
        valueType: 'DateTime',
        onChanged: 'onDateChanged',
        docs: {
          value: 'The date; null for none. Its time is ignored.',
          onChanged:
            'Called with the date typed or picked, at midnight, or null where the words are cleared.',
        },
        params: `this.firstDate,
this.lastDate,
this.selectableDayPredicate,
this.weekStartsOn,`,
        fields: `/// The earliest and latest dates the calendar takes.
final DateTime? firstDate, lastDate;

/// Whether the calendar lets a date be chosen (a weekend, a booked day).
final bool Function(DateTime date)? selectableDayPredicate;

/// The week's first day, 0 for Sunday to 6 for Saturday; the locale's by default.
final int? weekStartsOn;`,
        iconLabel: 'l.datePickerHelpText',
        format: 'l.formatCompactDate(v)',
        parse: 'l.parseCompactDate(typed)',
        same: 'DateUtils.isSameDay(a, b)',
        panel: `SolarDatePickerOpen(
  value: p.value,
  firstDate: p.firstDate,
  lastDate: p.lastDate,
  selectableDayPredicate: p.selectableDayPredicate,
  weekStartsOn: p.weekStartsOn,
  autofocus: true,
  onChanged: choose,
)`,
      });
    },
  },
};
