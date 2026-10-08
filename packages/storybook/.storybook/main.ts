import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.stories.@(ts|tsx)',
    '../../components/src/**/*.stories.@(ts|tsx)',
    '../../canvas/src/**/*.stories.@(ts|tsx)',
  ],
  staticDirs: ['../public'],
  addons: [
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-vitest'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
  viteFinal: async (viteConfig) => {
    const userOnLog = viteConfig.build?.rolldownOptions?.onLog;
    return {
      ...viteConfig,
      build: {
        ...viteConfig.build,
        rolldownOptions: {
          ...viteConfig.build?.rolldownOptions,
          // MUI and others ship "use client" banners. They are meaningless in
          // this client-only bundle, and Vite 8 (Rolldown) logs ~11k of them,
          // which makes turbo builds take minutes.
          onLog(level, log, defaultHandler) {
            if (log.code === 'MODULE_LEVEL_DIRECTIVE') return;
            if (userOnLog) userOnLog(level, log, defaultHandler);
            else defaultHandler(level, log);
          },
        },
      },
    };
  },
};

export default config;

function getAbsolutePath(value: string): any {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
