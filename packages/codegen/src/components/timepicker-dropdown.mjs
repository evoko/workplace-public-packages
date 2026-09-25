/**
 * SOLAR TimePicker Dropdown, beyond its IR: where MUI draws each layer, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A menu's surface (`src/shells/menu.mjs`) whose rows are its own: the times of the day a step
 * apart, as Dropdown Items, the chosen one selected and in sight (owner decision 2026-09-24: one
 * list of times). Floats where it is anchored, as a Dropdown Menu does.
 */

import { drawnFlutter, drawnResets } from '../shells/drawn.mjs';
import { menuReact, menuResets } from '../shells/menu.mjs';

const requireLayers = (spec) => {
  if (spec.layers.content?.type !== 'SLOT')
    throw new Error('TimePicker Dropdown: the IR has no content slot');
  if (!spec.api.size)
    throw new Error('TimePicker Dropdown: the IR has no size');
};

export default {
  name: 'TimePicker Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('TimePicker Dropdown', {
      flexDirection: 'column',
      ...menuResets('TimePicker Dropdown'),
    }),
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Its rows are its times, which the shell builds.
  api: {
    react: { content: null },
    flutter: { content: null },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return menuReact(spec, {
        look: 'the surface’s fill, edge, corners and shadow',
        about: `The times a TimePicker picks from, one list, drawn from Figma's layer tree
(\`internal/layers.tsx\`) around MUI's MenuList as a listbox: every \`step\` minutes (30 by
default) from \`min\` to \`max\` (the whole day), each a DropdownItem, as the locale writes it,
on its 12- or 24-hour clock, the \`value\` selected and in sight as it opens. The arrow keys move
from time to time, Home and End to the ends; a click or Enter calls \`onChange\` with the time,
\`HH:mm\` (\`09:30\`), with no date. Given \`anchorEl\`, it floats under it while \`open\`, in MUI's
Popover: Escape, a click outside or Tab call \`onClose\`. Without one, it draws in place. Past
300px its rows scroll, as a Dropdown Menu's.`,
        // Its rows are Dropdown Items, which take the size of the Dropdown Menu around them.
        sizedBy: 'DropdownMenuSizeContext',
        rows: '',
        rowsFrom: 'rows',
        role: 'listbox',
        listRef: 'list',
        react: ['useLayoutEffect', 'useRef'],
        imports: `import { DropdownItem, type DropdownItemProps } from './DropdownItem.js';
import { DropdownMenuSizeContext } from './DropdownMenu.js';
import {
  hhmmOf,
  minutesOf,
  parseHhmm,
  timesOf,
  timeWords,
} from './internal/clock.js';`,
        props: `/** The time chosen, \`HH:mm\` (\`09:30\`); null for none. */
value?: string | null;
/** Called with the time chosen, \`HH:mm\`. */
onChange?: (value: string) => void;
/** The minutes between one time and the next. */
step?: number;
/** The earliest and latest times, \`HH:mm\`. */
min?: string;
max?: string;
/** The locale its times are written in, on its clock; the page's by default. */
locale?: string;
/** More of a row's props, over those the list gives it, by its time (\`HH:mm\`): a test id. */
optionProps?: (time: string) => Partial<DropdownItemProps> | undefined;`,
        own: [
          'value = null',
          'onChange',
          'step = 30',
          'min',
          'max',
          'locale',
          'optionProps',
        ],
        prelude: `const chosen = parseHhmm(value);
const list = useRef<HTMLUListElement>(null);
// The chosen time in sight as the list first draws: scrolled within the list, not the page.
useLayoutEffect(() => {
  const at = list.current;
  const row = at?.querySelector<HTMLElement>('[aria-selected="true"]');
  if (at && row)
    at.scrollTop += row.getBoundingClientRect().top - at.getBoundingClientRect().top;
}, []);
const rows = timesOf(step, parseHhmm(min), parseHhmm(max)).map((t) => (
  <DropdownItem
    key={hhmmOf(t)}
    role="option"
    selected={chosen !== null && minutesOf(chosen) === minutesOf(t)}
    onClick={() => onChange?.(hhmmOf(t))}
    {...optionProps?.(hhmmOf(t))}
  >
    {timeWords(t, locale)}
  </DropdownItem>
));`,
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return (
        drawnFlutter(spec, {
          look: 'the surface’s fill, edge, corners and shadow, read cell by cell',
          about: `Bespoke: the times a SolarTimePicker picks from, one list, drawn from Figma's layer tree with [SolarLayers] around a [SolarMenuList]: every [step] minutes (30 by default) from [first] to [last] (the whole day), each a SolarDropdownItem, as MaterialLocalizations writes it on the platform's clock, the [value] selected and in sight as it is first built. The arrow keys move from time to time, and a tap or Enter calls [onChanged] with the time. It draws where it is put; to float it under a field, give it to a [SolarMenuAnchor]. Past 300 its rows scroll, as a Dropdown Menu's.`,
          params: `this.value,
this.onChanged,
this.step = 30,
this.first,
this.last,
this.optionBuilder,
this.maxHeight = solarMenuMaxHeight,`,
          fields: `/// The time chosen; null for none.
final TimeOfDay? value;

/// Called with the time chosen.
final ValueChanged<TimeOfDay>? onChanged;

/// The minutes between one time and the next.
final int step;

/// The earliest and latest times.
final TimeOfDay? first, last;

/// What each time's row is drawn as, given its time and the row the list builds for it (a test's
/// key); the row by default.
final Widget Function(TimeOfDay time, SolarDropdownItem row)? optionBuilder;

/// The tallest it grows before its rows scroll.
final double maxHeight;`,
          prelude: `final l = MaterialLocalizations.of(context);
final clock = MediaQuery.alwaysUse24HourFormatOf(context);`,
          content: `{
        'content': [
          SolarMenuList(
            size: size.name,
            maxHeight: maxHeight,
            children: [
              for (final time in solarTimesOf(step, first: first, last: last))
                _InSight(
                  shown: time == value,
                  child: Builder(
                    builder: (context) {
                      final row = SolarDropdownItem(
                        label: l.formatTimeOfDay(time, alwaysUse24HourFormat: clock),
                        selected: time == value,
                        onPressed: () => onChanged?.call(time),
                      );
                      return optionBuilder?.call(time, row) ?? row;
                    },
                  ),
                ),
            ],
          ),
        ],
      }`,
          imports: `import '../solar_menu.dart';
import '../solar_time.dart';
import 'solar_dropdown_item.dart';`,
        }) +
        `
/// A row brought into sight in the list as it is first built, where [shown] (the chosen time).
class _InSight extends StatefulWidget {
  const _InSight({required this.shown, required this.child});

  final bool shown;
  final Widget child;

  @override
  State<_InSight> createState() => _InSightState();
}

class _InSightState extends State<_InSight> {
  @override
  void initState() {
    super.initState();
    if (widget.shown) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) Scrollable.ensureVisible(context);
      });
    }
  }

  @override
  Widget build(BuildContext context) => widget.child;
}
`
      );
    },
  },
};
