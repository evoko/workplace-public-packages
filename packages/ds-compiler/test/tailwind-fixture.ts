import { join } from 'node:path';
import { buildIR } from '../src/build.js';
import type { DsConfig } from '../src/config.js';
import type { DesignIR } from '../src/ir/types.js';
import type { PluginContext } from '../src/targets/plugin.js';
import { makeRoot, withEntry } from './helpers.js';

// Pretty-printed (not compact) so the collision test below can locate and
// replace `"prefix": "fx"` as a literal substring.
export const TW_CONFIG = JSON.stringify(
  {
    name: 'Fictional',
    prefix: 'fx',
    modes: ['light', 'dark'],
    defaultMode: 'light',
    targets: { tailwind: { outDir: 'out/tailwind' } },
    coverageFile: 'out/coverage.md',
  },
  null,
  2,
);

function manifest(extra: Record<string, unknown>): string {
  return JSON.stringify({ displayName: 'X', baseline: false, ...extra });
}

export const TW_FILES: Record<string, string> = {
  'ds.config.json': TW_CONFIG,
  'src/tokens/color.css': [
    ':root {',
    '  --fx-color-neutral-900: #111111;',
    '  --fx-color-text-default: var(--fx-color-neutral-900);',
    '}',
    ':root[data-fx-theme="dark"] {',
    '  --fx-color-text-default: #ffffff;',
    '}',
    '',
  ].join('\n'),
  'src/tokens/space.css': ':root {\n  --fx-space-2: 8px;\n}\n',
  'src/tokens/font-family.css':
    ":root {\n  --fx-font-family-body: 'Open Sans', Arial, sans-serif;\n}\n",
  'src/tokens/shadow.css':
    ':root {\n  --fx-shadow-focus: 0 0 0 2px var(--fx-color-neutral-900);\n}\n',
  'src/components/chip/chip.manifest.json': manifest({
    name: 'chip',
    displayName: 'Chip',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: { root: { element: 'button' }, icon: { element: 'span' } },
    targets: { tailwind: {} },
  }),
  'src/components/chip/chip.css': [
    '.fx-chip {',
    '  display: inline-flex;',
    '  padding: var(--fx-space-2);',
    '  color: var(--fx-color-text-default);',
    '  font-family: var(--fx-font-family-body);',
    '}',
    '.fx-chip:hover {',
    '  box-shadow: var(--fx-shadow-focus);',
    '}',
    '.fx-chip:disabled {',
    '  opacity: 0.4;',
    '}',
    '.fx-chip[data-tone="loud"] {',
    '  min-width: 44px;',
    '}',
    '.fx-chip .fx-chip__icon {',
    '  width: 20px;',
    '}',
    '',
  ].join('\n'),
  // div root: disabled must render as [aria-disabled="true"]; opacity is ignored for tailwind
  'src/components/tag/tag.manifest.json': manifest({
    name: 'tag',
    states: ['disabled'],
    targets: { tailwind: { ignore: ['opacity'] } },
  }),
  'src/components/tag/tag.css':
    '.fx-tag {\n  display: inline-block;\n  opacity: 0.4;\n}\n.fx-tag[aria-disabled="true"] {\n  opacity: 0.4;\n}\n',
  'src/components/pill/pill.manifest.json': manifest({
    name: 'pill',
    targets: { tailwind: { excluded: 'starter content' } },
  }),
  'src/components/pill/pill.css': '.fx-pill {\n  display: inline-block;\n}\n',
};

/** Same as TW_FILES but every component is mapped for tailwind (no unmapped ones). */
export function twRoot(extraFiles: Record<string, string> = {}): string {
  return withEntry(makeRoot({ ...TW_FILES, ...extraFiles }));
}

export function twBuild(root: string): { ir: DesignIR; config: DsConfig } {
  const result = buildIR(root);
  if (!result.ir || !result.config) {
    throw new Error(
      `fixture did not build: ${result.diagnostics.errors.map((d) => `${d.code} ${d.message}`).join('; ')}`,
    );
  }
  return { ir: result.ir, config: result.config };
}

export function twContext(root: string, config: DsConfig): PluginContext {
  return {
    rootDir: root,
    config,
    compilerVersion: '0.0.0-test',
    outDir: join(root, 'out', 'tailwind'),
  };
}

/** Drops the one-line header and the blank line after it. */
export function body(text: string): string {
  return text.slice(text.indexOf('\n') + 2);
}
