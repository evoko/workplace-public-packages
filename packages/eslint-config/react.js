import { fixupPluginRules } from '@eslint/compat';
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslintPluginJsxA11y.flatConfigs.recommended,
  {
    ...eslintPluginReact.configs.flat.recommended,
    rules: {
      ...eslintPluginReact.configs.flat.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      ...eslintPluginReact.configs.flat.recommended.rules.settings,
      react: {
        version: 'detect',
      },
    },
  },
  {
    plugins: {
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
    },
    rules: {
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
);
