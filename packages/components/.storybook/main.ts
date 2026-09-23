/**
 * Storybook for the SOLAR components: a viewer, generated from the same visual-check cases and
 * oracles the checks measure (test/visual/cases/, spec/verify/), so a component shows here as soon
 * as it has a case, and the gallery cannot drift from what is checked. See stories/README.md.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { STATE_SELECTORS } from '../../codegen/src/emit/mui-component.mjs';
import { COMPONENTS, fileOf } from '../../codegen/src/stages/components.mjs';

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const styles = (path: string) => here(`../../styles/src/${path}`);

/**
 * What the stories need from the codegen, as data: which components there are, each one's API from
 * its IR, and how its MUI states are marked. Served as a module, since the codegen runs in Node
 * and the stories in the browser.
 */
function solarData() {
  const specs = Object.fromEntries(
    COMPONENTS.map((c) => {
      const spec = JSON.parse(
        readFileSync(here(`../../../spec/components/${fileOf(c)}`), 'utf8'),
      );
      return [c, { api: spec.api }];
    }),
  );
  return `export const COMPONENTS = ${JSON.stringify(COMPONENTS)};
export const SPECS = ${JSON.stringify(specs)};
export const STATES = ${JSON.stringify(STATE_SELECTORS)};
`;
}

const config: StorybookConfig = {
  stories: ['../stories/*.stories.tsx'],
  addons: ['@storybook/addon-themes', 'storybook-addon-pseudo-states'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  viteFinal: (vite) => ({
    ...vite,
    resolve: {
      ...vite.resolve,
      // Workspace packages from their sources, as the visual checks and unit tests resolve them,
      // so the viewer shows what is committed and needs no build first.
      alias: {
        ...(vite.resolve?.alias as Record<string, string>),
        '@bwp-web/styles/mui': styles('mui.ts'),
        '@bwp-web/styles/tokens.css': styles('generated/css/tokens.css'),
        '@bwp-web/styles/fonts.css': styles('fonts.css'),
      },
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
