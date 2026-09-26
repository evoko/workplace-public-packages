/**
 * TableHeader's Playground: its breakpoint from its control; its SearchField (md), shown by the
 * `search` toggle, holding the `query` extra, which typing sets; its Segmented Control (md) of
 * sample views, shown by the toggle of the breakpoint's slot (`segmentedControl` on desktop,
 * `segmentedControlMobile` on mobile, the shell drawing the one control in whichever), the chosen
 * view the `view` extra, which choosing sets; its actions, three md secondary Icon Buttons (Filter,
 * Download, More), shown by the breakpoint's content toggle (`actions`, `actionsMobile`), each
 * press logged with its name.
 */

import { IconDownload, IconFilter, IconMore } from '@bwp-web/assets';
import { IconButton } from '../../src/IconButton.js';
import { SearchField } from '../../src/SearchField.js';
import { SegmentedControl } from '../../src/SegmentedControl.js';
import { SegmentedControlItem } from '../../src/SegmentedControlItem.js';
import { TableHeader, type TableHeaderProps } from '../../src/TableHeader.js';
import type { PlaygroundBuilder } from './types.js';

/** The sample views, the `view` extra's options (packages/codegen/src/playground/extras.mjs). */
const VIEWS = ['All', 'Online', 'Offline'];

const ACTIONS = [
  ['Filter', <IconFilter key="filter" />],
  ['Download', <IconDownload key="download" />],
  ['More', <IconMore key="more" />],
] as const;

export default {
  render: (p) => {
    const breakpoint =
      p.choice<NonNullable<TableHeaderProps['breakpoint']>>('breakpoint');
    const mobile = breakpoint === 'mobile';
    const desktopViews = p.child('segmentedControl').shown;
    const mobileViews = p.child('segmentedControlMobile').shown;
    const desktopActions = p.flag('actions');
    const mobileActions = p.flag('actionsMobile');
    const view = p.choice('view');
    return (
      <TableHeader
        breakpoint={breakpoint}
        search={
          p.child('search').shown ? (
            <SearchField
              size="md"
              placeholder="Search"
              aria-label="Search"
              value={p.text('query')}
              onChange={(event) => {
                p.set('query', event.target.value);
                p.log('onChange', event.target.value);
              }}
            />
          ) : undefined
        }
        segmentedControl={
          (mobile ? mobileViews : desktopViews) ? (
            <SegmentedControl
              size="md"
              value={view}
              onChange={(_, value) => {
                p.set('view', value);
                p.log('onChange', value);
              }}
            >
              {VIEWS.map((v) => (
                <SegmentedControlItem key={v} value={v} size="md">
                  {v}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          ) : undefined
        }
      >
        {(mobile ? mobileActions : desktopActions)
          ? ACTIONS.map(([name, icon]) => (
              <IconButton
                key={name}
                size="md"
                shape="square"
                prio="secondary"
                icon={icon}
                aria-label={name}
                onClick={() => p.log('onClick', name)}
              />
            ))
          : null}
      </TableHeader>
    );
  },
} satisfies PlaygroundBuilder;
