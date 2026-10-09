import eslintReact from '@eslint-react/eslint-plugin';
import eslintPluginJsxA11yX from 'eslint-plugin-jsx-a11y-x';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslintPluginJsxA11yX.configs.recommended,
  eslintReact.configs['recommended-typescript'],
  eslintPluginReactHooks.configs.flat.recommended,
  {
    // react-hooks (the React team's plugin) owns the hooks and compiler rules;
    // turn off @eslint-react's overlapping copies so each issue reports once.
    rules: {
      '@eslint-react/error-boundaries': 'off',
      '@eslint-react/exhaustive-deps': 'off',
      '@eslint-react/purity': 'off',
      '@eslint-react/rules-of-hooks': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/set-state-in-render': 'off',
      '@eslint-react/static-components': 'off',
      '@eslint-react/unsupported-syntax': 'off',
      '@eslint-react/use-memo': 'off',
    },
  },
);
