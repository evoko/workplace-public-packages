import { createRequire } from 'node:module';
import { ThemeProvider, type Theme } from '@mui/material/styles';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

/**
 * Smoke-tests the *built* package, not the source: `npm run build` must run
 * before this file (turbo wires `@bwp-web/styles-mui#test` to depend on its
 * own `build`, not only on its dependencies' `^build`), and both `require`
 * and `import` must not throw. This is the failure mode source-level tests
 * (`theme.test.ts`, `render.test.tsx`, which import `../src/index.js`) can
 * never catch: a mapped component's wrapper importing MUI's default export
 * from a deep path (`import MuiButton from '@mui/material/Button'`) compiles
 * and round-trips correctly under Vite/ESM, but tsup's CJS output turns that
 * into `__toESM(require('@mui/material/Button'), 1).default`, and Node's
 * ESM->CJS interop hands that expression the whole module object rather than
 * the component, crashing at render time ("Element type is invalid").
 *
 * Neither test below may be skipped when `dist/` is missing; a missing
 * bundle must fail loudly here, not silently pass.
 */

interface Exports {
  createBwpTheme: (options?: unknown) => Theme;
  Button: React.ComponentType<Record<string, unknown>>;
}

function renderButton(exports: Exports): string {
  const theme = exports.createBwpTheme();
  return renderToStaticMarkup(
    React.createElement(
      ThemeProvider,
      { theme },
      React.createElement(
        exports.Button,
        { variant: 'ghost', size: 'sm' },
        'x',
      ),
    ),
  );
}

describe('built package bundles', () => {
  it('CJS: createBwpTheme has parity defaults and Button renders without throwing', () => {
    const require = createRequire(import.meta.url);
    // Throws (failing the test) if dist/index.cjs was never built.
    const cjs = require('../dist/index.cjs') as Exports;
    const theme = cjs.createBwpTheme();
    expect(
      (theme.components?.MuiButton?.defaultProps as { disableRipple?: unknown })
        ?.disableRipple,
    ).toBe(true);
    let html = '';
    expect(() => {
      html = renderButton(cjs);
    }).not.toThrow();
    expect(html).toContain('MuiButton-root');
  });

  it('ESM: createBwpTheme has parity defaults and Button renders without throwing', async () => {
    // Throws (failing the test) if dist/index.js was never built.
    const esm = (await import('../dist/index.js')) as unknown as Exports;
    const theme = esm.createBwpTheme();
    expect(
      (theme.components?.MuiButton?.defaultProps as { disableRipple?: unknown })
        ?.disableRipple,
    ).toBe(true);
    let html = '';
    expect(() => {
      html = renderButton(esm);
    }).not.toThrow();
    expect(html).toContain('MuiButton-root');
  });
});
