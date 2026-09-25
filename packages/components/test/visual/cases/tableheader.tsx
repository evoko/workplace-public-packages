import oracle from '../../../../../spec/verify/tableheader.json';
import { IconButton } from '../../../src/IconButton.js';
import { SearchField } from '../../../src/SearchField.js';
import {
  TableHeader,
  type TableHeaderProps,
} from '../../../src/TableHeader.js';
import { segmentedControlMd } from './controls.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { component?: string; variant?: Record<string, string> };

/** The layers of a variant Figma draws as one component. */
const drawn = (v: OracleVariant, component: string) =>
  Object.entries(v.layers as Record<string, ChildLayer>).filter(
    ([, l]) => l.component === component,
  );

// Each breakpoint with what Figma draws in it: the bare md SearchField (its filter hidden), the md
// Segmented Control with no label or helper (as the instance hides them) and the six segments its
// own check draws (Figma's instance holds two), and three md secondary Icon Buttons, each marked as
// the layer Figma draws it in.
export default {
  oracle,
  render: (v) => (
    <TableHeader
      {...(v.props as Pick<TableHeaderProps, 'breakpoint'>)}
      // Wider than Figma's sample on mobile: its six-segment control at its own size.
      style={{
        width:
          (v.props as { breakpoint?: string }).breakpoint === 'mobile'
            ? 600
            : 1020,
      }}
      search={
        <SearchField
          size="md"
          placeholder="Search"
          value=""
          onChange={() => {}}
          aria-label="Search"
        />
      }
      segmentedControl={segmentedControlMd()}
    >
      {drawn(v, 'Icon Button').map(([layer]) => (
        <IconButton
          key={layer}
          data-layer={layer}
          icon={icon}
          aria-label="Action"
          size="md"
          prio="secondary"
        />
      ))}
    </TableHeader>
  ),
} satisfies VisualCase;
