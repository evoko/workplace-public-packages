import oracle from '../../../../../spec/verify/timepicker-dropdown.json';
import {
  TimePickerDropdown,
  type TimePickerDropdownProps,
} from '../../../src/TimePickerDropdown.js';
import type { DropdownItemProps } from '../../../src/DropdownItem.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string };

/** The rows Figma draws, in its order, by their layers. */
const rows = (v: OracleVariant) =>
  Object.entries(v.layers as Record<string, ChildLayer>)
    .filter(([, l]) => l.component === 'Dropdown Item')
    .map(([name]) => name);

/** Minutes from midnight as `HH:mm`. */
const hhmm = (m: number) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

// Figma's six rows, in place (no anchor): the times from midnight half an hour apart, the first
// chosen, as Figma draws its first row selected; each row keyed by its layer.
export default {
  oracle,
  render: (v) => {
    const layers = rows(v);
    return (
      <TimePickerDropdown
        {...(v.props as Pick<TimePickerDropdownProps, 'size'>)}
        value="00:00"
        min="00:00"
        max={hhmm((layers.length - 1) * 30)}
        locale="en-US"
        optionProps={(time) => {
          const [h, m] = time.split(':').map(Number);
          return {
            'data-layer': layers[(h * 60 + m) / 30],
          } as Partial<DropdownItemProps>;
        }}
      />
    );
  },
} satisfies VisualCase;
