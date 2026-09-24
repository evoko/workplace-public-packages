/**
 * SOLAR Tabs, beyond its IR: where MUI draws each layer, and the two shell templates, rendered into
 * the shells by \`solar:codegen\` on every run. One file per component, so adding one edits nothing
 * shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn strip whose tabs layer holds the caller's Tab Items in place of Figma's examples: MUI's
 * Tabs on the web, its moving indicator hidden, `SolarTabList` in Flutter. The arrow keys move the
 * focus, Enter or Space selects (owner decision 2026-09-24).
 */

import { drawnFlutter, drawnResets } from '../shells/drawn.mjs';

const P = 'SolarTabs';

const requireLayers = (spec) => {
  if (spec.layers.tabs?.type !== 'SLOT')
    throw new Error('Tabs: the IR has no tabs slot');
  if (!spec.api.size) throw new Error('Tabs: the IR has no size');
};

export default {
  name: 'Tabs',
  mui: {
    // The shell draws every layer itself: the root is MUI's Tabs, its tabs layer Tabs' list.
    slots: 'drawn',
    // Tabs' own look gives way to the recipe's: its minimum height and its indicator, as each Tab
    // Item draws its own underline; nothing clipped, so the focused tab's ring shows.
    resets: drawnResets('Tabs', {
      display: 'flex',
      minHeight: '0',
      overflow: 'visible',
      borderStyle: 'solid',
      '& .MuiTabs-scroller': { overflow: 'visible !important' },
      '& .MuiTabs-indicator': { display: 'none' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const fallback = spec.api.size.default;
      return `/**
 * SOLAR Tabs.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTabsStyle\` and \`solarTabsCompose\` in \`@bwp-web/styles/mui\`: the strip's
 * edge under its tabs.
 *
 * Two to seven TabItems of its size, one selected: MUI's Tabs, a tablist. The arrow keys move the
 * focus from tab to tab, Home and End to the ends, and Enter or Space selects the focused one, as
 * SOLAR's description says ("arrow keys move focus and aria-selected marks the current tab"); the
 * selected tab is the one Tab reaches. \`value\` and \`onChange\` hold the selected tab's \`value\`
 * (its index where it has none). Name it with \`aria-label\` or \`aria-labelledby\`, and tie each tab
 * to its panel (\`id\`, \`aria-controls\`). It does not scroll. For an ordered flow use a Stepper; for
 * two to five choices in a form, a Segmented Control. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

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
export const TabsSizeContext = createContext<SolarTabsProps['size'] | undefined>(undefined);

/** The size of the Tabs around a tab, which the tab takes; undefined outside one. */
export const useTabsSize = () => useContext(TabsSizeContext);

export interface TabsProps
  extends SolarTabsProps,
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
  /** The selected tab's \`value\`, where the caller keeps it; false for none. */
  value?: unknown;
  /** The tab it starts with, where \`value\` does not say. */
  defaultValue?: unknown;
  /** Called with the \`value\` of the tab chosen. */
  onChange?: (event: SyntheticEvent, value: unknown) => void;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { size, children, value: valueProp, defaultValue = false, onChange, slotProps, sx, ...rest },
  ref,
) {
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
    <TabsSizeContext.Provider value={size ?? '${fallback}'}>
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
          list: { className: '${P}-tabs ${P}-box' },
        }}
        sx={[solarTabsStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {children}
      </MuiTabs>
    </TabsSizeContext.Provider>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the strip’s edge under its tabs, read cell by cell',
        about: `Bespoke: a strip of two to seven SolarTabItems of its size, one selected, drawn from Figma's layer tree with [SolarLayers] around its [children]: the arrow keys move the focus from tab to tab, and Enter or Space selects the focused one, as SOLAR's description says; it is announced as a tab bar. [value] is the selected tab's value, and [onChanged] is called with the value of the tab chosen. It does not scroll.`,
        params: `required this.children,
this.value,
this.onChanged,`,
        fields: `/// Two to seven SolarTabItems, each with a value.
final List<Widget> children;

/// The selected tab's value; null for none.
final Object? value;

/// Called with the value of the tab chosen.
final ValueChanged<Object?>? onChanged;`,
        content: "{'tabs': children}",
        builders: "{'tabs': (layer) => SolarTabList(child: layer)}",
        wrap: `SolarTabsScope(
      size: size.name,
      value: value,
      onChanged: onChanged,
      child: mark,
    )`,
        imports: "import '../solar_tabs.dart';",
      });
    },
  },
};
