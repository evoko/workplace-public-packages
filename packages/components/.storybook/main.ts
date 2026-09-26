/**
 * Storybook for the SOLAR components: a viewer, generated from the same visual-check cases and
 * oracles the checks measure (test/visual/cases/, spec/verify/), so a component shows here as soon
 * as it has a case, and the gallery cannot drift from what is checked. See stories/README.md.
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { circlesFor } from '../../codegen/src/approvals/status.mjs';
import { STATE_SELECTORS } from '../../codegen/src/emit/mui-component.mjs';
import { NAMES, fileOf } from '../../codegen/src/stages/components.mjs';
import { exactAliases } from '../../codegen/src/util/workspace-sources.mjs';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));

/** Vite's aliases as a list, whichever form Storybook's own configuration gave them in. */
const aliasList = (alias: unknown) =>
  Array.isArray(alias)
    ? alias
    : Object.entries((alias ?? {}) as Record<string, string>).map(
        ([find, replacement]) => ({ find, replacement }),
      );

/**
 * What the stories need from the codegen, as data: which components there are, each one's API from
 * its IR, how its MUI states are marked, and what the last web check found wrong. Served as a module, since the codegen runs in Node
 * and the stories in the browser.
 */
function solarData() {
  const specs = Object.fromEntries(
    NAMES.map((c) => {
      const spec = JSON.parse(
        readFileSync(here(`../../../spec/components/${fileOf(c)}`), 'utf8'),
      );
      return [c, { api: spec.api }];
    }),
  );
  // What the last web check found wrong, per component and mode, where it has run
  // (test/visual/.out/, git-ignored): none of it is data a build needs.
  const report = (name: string) => {
    const path = here(`../test/visual/.out/${name}-failures.json`);
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
  };
  const slug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const failures = Object.fromEntries(
    NAMES.map((c) => [
      c,
      { light: report(slug(c)), dark: report(`${slug(c)}-dark`) },
    ]),
  );
  return `export const COMPONENTS = ${JSON.stringify(NAMES)};
export const SPECS = ${JSON.stringify(specs)};
export const STATES = ${JSON.stringify(STATE_SELECTORS)};
export const FAILURES = ${JSON.stringify(failures)};
`;
}

const config: StorybookConfig = {
  stories: ['../stories/*.stories.tsx'],
  addons: ['@storybook/addon-themes', 'storybook-addon-pseudo-states'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  // Each component's approval circle (spec/approvals.yaml), for the sidebar: worked out here, in
  // Node, when Storybook starts or builds, and handed to the manager as a global (manager.ts).
  managerHead: async (head) => {
    let circles = {};
    try {
      circles = await circlesFor('web');
    } catch (error) {
      // Informational only (`solar:status -- --check` is what blocks): a record YAML cannot read,
      // or a scan that fails, leaves the sidebar without circles rather than Storybook unbuilt.
      // eslint-disable-next-line no-console
      console.warn(
        `storybook: no approval circles (${String((error as Error).message).split('\n')[0]})`,
      );
    }
    return `${head ?? ''}<script>window.SOLAR_APPROVALS = ${JSON.stringify(circles)};</script>`;
  },
  viteFinal: (vite) => ({
    ...vite,
    resolve: {
      ...vite.resolve,
      // Workspace packages from their sources, as the visual checks and unit tests resolve them
      // (one table for all three), so the viewer shows what is committed and needs no build
      // first. Ours come first: Vite takes the first alias that matches.
      alias: [...exactAliases(), ...aliasList(vite.resolve?.alias)],
    },
    // The oracles and the IR live at the repository root, outside this package.
    server: { ...vite.server, fs: { allow: [here('../../..')] } },
    plugins: [
      ...(vite.plugins ?? []),
      {
        name: 'solar-data',
        resolveId: (id) => (id === 'virtual:solar' ? '\0virtual:solar' : null),
        load: (id) => (id === '\0virtual:solar' ? solarData() : null),
      },
    ],
  }),
};

export default config;
