/**
 * The sidebar: each component's name after its approval circle, 🟢 approved, 🟡 ready to review,
 * 🔴 waiting on a component it uses (docs/engineering/workflows.md, Approve a component). The
 * circles are worked out in main.ts.
 */

import { addons } from 'storybook/manager-api';

const circles =
  (globalThis as { SOLAR_APPROVALS?: Record<string, string> })
    .SOLAR_APPROVALS ?? {};

addons.setConfig({
  sidebar: {
    renderLabel: (item) =>
      item.type === 'component' && circles[item.name]
        ? `${circles[item.name]} ${item.name}`
        : item.name,
  },
});
