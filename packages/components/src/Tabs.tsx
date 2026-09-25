/**
 * SOLAR Tabs.
 *
 * Written by hand, and never regenerated. What it looks like is not here. That is the recipe,
 * `solarTabsStyle` and `solarTabsCompose` in `@bwp-web/styles/mui`: the strip's edge under its
 * tabs.
 *
 * Two to seven TabItems of its size, one selected: MUI's Tabs, a tablist. The arrow keys move the
 * focus from tab to tab, Home and End to the ends, and Enter or Space selects the focused one, as
 * SOLAR's description says ("arrow keys move focus and aria-selected marks the current tab"); the
 * selected tab is the one Tab reaches. `value` and `onChange` hold the selected tab's `value`
 * (its index where it has none). Name it with `aria-label` or `aria-labelledby`, and tie each tab
 * to its panel (`id`, `aria-controls`). It does not scroll. For an ordered flow use a Stepper; for
 * two to five choices in a form, a Segmented Control. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiTabs, { type TabsProps as MuiTabsProps } from '@mui/material/Tabs';
import { useControlled } from '@mui/material/utils';
import {
  createContext,
  forwardRef,
  useContext,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import {
  solarTabsCompose,
  solarTabsStyle,
  type SolarTabsProps,
} from '@bwp-web/styles/mui';

/** The strip's size, which its tabs take. */
export const TabsSizeContext = createContext<
  SolarTabsProps['size'] | undefined
>(undefined);

/** The size of the Tabs around a tab, which the tab takes; undefined outside one. */
export const useTabsSize = () => useContext(TabsSizeContext);

export interface TabsProps
  extends
    SolarTabsProps,
    Omit<
      MuiTabsProps,
      | keyof SolarTabsProps
      | 'children'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'variant'
      | 'scrollButtons'
      | 'allowScrollButtonsMobile'
      | 'orientation'
      | 'centered'
      | 'indicatorColor'
      | 'textColor'
      | 'ref'
    > {
  /** Two to seven TabItems. */
  children: ReactNode;
  /** The selected tab's `value`, where the caller keeps it; false for none. */
  value?: unknown;
  /** The tab it starts with, where `value` does not say. */
  defaultValue?: unknown;
  /** Called with the `value` of the tab chosen. */
  onChange?: (event: SyntheticEvent, value: unknown) => void;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTabs), under the caller's own.
    const {
      size,
      children,
      value: valueProp,
      defaultValue = false,
      onChange,
      slotProps,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarTabs');
    const [value, setValue] = useControlled<unknown>({
      controlled: valueProp,
      default: defaultValue,
      name: 'Tabs',
      state: 'value',
    });
    const look = { size };
    // The recipe's composition, read for its presence alone: the strip draws the caller's tabs.
    void solarTabsCompose(look);
    return (
      <TabsSizeContext.Provider value={size ?? 'sm'}>
        <MuiTabs
          ref={ref}
          {...rest}
          value={value}
          onChange={(event, next) => {
            setValue(next);
            onChange?.(event, next);
          }}
          variant="standard"
          // The tabs layer is Tabs' list, as Figma lays the tabs out in it.
          slotProps={{
            ...slotProps,
            list: { className: 'SolarTabs-tabs SolarTabs-box' },
          }}
          sx={[solarTabsStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
        >
          {children}
        </MuiTabs>
      </TabsSizeContext.Provider>
    );
  },
);
