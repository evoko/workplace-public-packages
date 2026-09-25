/**
 * SOLAR Tabs, beyond its IR: where MUI draws each layer. Its shells are files of their own, written
 * by hand. One file per component, so adding one edits nothing shared; `src/components/index.mjs`
 * finds them.
 *
 * A drawn strip whose tabs layer holds the caller's Tab Items in place of Figma's examples: MUI's
 * Tabs on the web, its moving indicator hidden, `SolarTabList` in Flutter. The arrow keys move the
 * focus, Enter or Space selects (owner decision 2026-09-24).
 */

import { drawnResets } from './shared/drawn.mjs';

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
};
