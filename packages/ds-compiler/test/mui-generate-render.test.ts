import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { captureMuiDefaults } from '../src/targets/mui/capture.js';
import { loadComponent, loadRuntime } from '../src/targets/mui/capture.js';
import type { MuiCatalog } from '../src/targets/mui/catalog.js';
import { generateMui } from '../src/targets/mui/generate.js';
import { manifestLocation } from '../src/targets/mui/mapping.js';
import { BTN_FILES } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

/**
 * The real generated package's `outDir`: the same react/react-dom/emotion/
 * MUI actually shipped to consumers, not a hand-written fixture. This is
 * the test that would have caught Emotion's development build throwing on
 * `content: revert` (its value validator accepts only
 * normal|none|initial|inherit|unset or a quoted/functional value) — the
 * fixture-based `mui-resets.test.ts` never renders anything for real, so it
 * could not.
 */
const REAL_OUT_DIR = fileURLToPath(
  new URL('../../styles-mui/src/generated/', import.meta.url),
);

describe('mapped Button: real render smoke test', () => {
  it('renders under real MUI/Emotion without throwing, applying the resets and the design-system rules', async () => {
    const root = twRoot(BTN_FILES);
    const { ir, config } = twBuild(root);
    const ctx = { ...twContext(root, config), outDir: REAL_OUT_DIR };

    const captureDiag = new Diagnostics();
    const captured = await captureMuiDefaults(ir, ctx, captureDiag);
    expect(captureDiag.errors).toEqual([]);
    const catalog = JSON.parse(captured!.contents) as MuiCatalog;

    const generateDiag = new Diagnostics();
    const files = generateMui(ir, catalog, ctx, generateDiag);
    expect(generateDiag.errors).toEqual([]);
    const modelFile = files.find((f) => f.path === 'theme.model.json')!;
    const model = JSON.parse(modelFile.contents) as {
      themeOptions: Record<string, unknown>;
    };

    const runtime = loadRuntime(REAL_OUT_DIR, new Diagnostics());
    expect(runtime).not.toBeNull();
    const at = manifestLocation(ir.components.btn);
    const button = loadComponent(runtime!, 'Button', at, new Diagnostics());
    expect(button).not.toBeNull();

    const { React } = runtime!;
    const theme = runtime!.createTheme(model.themeOptions);
    const cache = runtime!.createCache({ key: 'probe' });

    let html = '';
    expect(() => {
      html = runtime!.renderToStaticMarkup(
        React.createElement(
          runtime!.CacheProvider,
          { value: cache },
          React.createElement(
            runtime!.ThemeProvider,
            { theme },
            React.createElement(
              button!.Component,
              {
                variant: 'quiet',
                startIcon: React.createElement('i', null),
              },
              'x',
            ),
          ),
        ),
      );
    }).not.toThrow();

    expect(html).not.toContain('MuiTouchRipple');
    expect(html).toContain('min-width:revert');
    expect(html).toContain('content:none');
    expect(html).toContain('padding-top:var(--fx-tokens-space-2)');
  });
});
