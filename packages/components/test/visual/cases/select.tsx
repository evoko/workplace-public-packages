import oracle from '../../../../../spec/verify/select.json';
import { DropdownItem } from '../../../src/DropdownItem.js';
import { Select, type SelectProps } from '../../../src/Select.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = {
  component?: string;
  variant?: Record<string, string | undefined>;
};

/** The rows Figma draws in the open panel, in its order, each with its layer. */
const rows = (v: OracleVariant) =>
  Object.entries((v.layers ?? {}) as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === 'Dropdown Item',
  );

// Every slot filled so its look is measured: the label, starred, and the helper; open where Figma
// draws it open, with Figma's rows, each disabled where Figma draws it so. An open panel stays in
// the page without taking it over: no backdrop, no focus of its own, and the pointer passing
// through, so the other cases are reached as a user reaches them.
export default {
  oracle,
  render: (v) => (
    <Select
      {...(v.props as Pick<
        SelectProps,
        'size' | 'open' | 'disabled' | 'error'
      >)}
      label="Label"
      mandatory
      helper="Helper text"
      placeholder="Select…"
      MenuProps={{
        hideBackdrop: true,
        autoFocus: false,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true,
        disableScrollLock: true,
        slotProps: { root: { style: { pointerEvents: 'none' } } },
      }}
    >
      {rows(v).map(([name, l], i) => (
        <DropdownItem
          key={name}
          data-layer={name}
          value={`option-${i}`}
          disabled={l.variant?.state === 'disabled'}
        >
          Option
        </DropdownItem>
      ))}
    </Select>
  ),
} satisfies VisualCase;
