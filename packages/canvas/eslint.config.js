import { defineConfig } from 'eslint/config';
import baseConfig from '@bwp-web/eslint-config/base';
import reactConfig from '@bwp-web/eslint-config/react';

export default defineConfig(baseConfig, reactConfig);
