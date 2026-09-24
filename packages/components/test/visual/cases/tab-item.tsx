import MuiTabs from '@mui/material/Tabs';
import oracle from '../../../../../spec/verify/tab-item.json';
import { TabItem, type TabItemProps } from '../../../src/TabItem.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// A tab lives in a Tabs (MUI's Tab needs one), here a bare MUI Tabs of no size, its indicator
// hidden, which selects the tab where Figma draws it selected; the case marks the tab as the root.
// Every slot shown: both icons probes, and a count.
export default {
  oracle,
  render: (v) => {
    const props = v.props as Pick<
      TabItemProps,
      'size' | 'disabled' | 'selected'
    >;
    return (
      <MuiTabs
        value={props.selected ? 'tab' : false}
        sx={{ minHeight: 0, '& .MuiTabs-indicator': { display: 'none' } }}
      >
        <TabItem
          {...props}
          value="tab"
          data-case-root
          label="Tab"
          leadingIcon={icon}
          trailingIcon={icon}
          count={3}
        />
      </MuiTabs>
    );
  },
} satisfies VisualCase;
