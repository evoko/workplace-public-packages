import baseConfig from '@bwp-web/eslint-config/base';
import reactConfig from '@bwp-web/eslint-config/react';

/** @type {import('typescript-eslint').Config} */
export default [...baseConfig, ...reactConfig];
