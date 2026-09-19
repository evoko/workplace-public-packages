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
    targets: {
      tailwind: { outDir: 'out/tailwind' },
      mui: { outDir: 'out/mui' },
      stories: {
        outDir: 'out/stories',
        options: { muiPackage: '@fx/styles-mui' },
      },
    },
    coverageFile: 'out/coverage.md',
  },
  null,
  2,
);

/** `TW_CONFIG` with `overrides` merged in at the top level, re-stringified. */
export function twConfigWith(overrides: Record<string, unknown>): string {
  return JSON.stringify(
    { ...(JSON.parse(TW_CONFIG) as Record<string, unknown>), ...overrides },
    null,
    2,
  );
}

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
    slots: {
      root: { element: 'button' },
      icon: { element: 'span', optional: true },
    },
    targets: { tailwind: {}, mui: {} },
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
    targets: {
      tailwind: { ignore: ['opacity'] },
      mui: { ignore: ['opacity'] },
    },
  }),
  'src/components/tag/tag.css':
    '.fx-tag {\n  display: inline-block;\n  opacity: 0.4;\n}\n.fx-tag[aria-disabled="true"] {\n  opacity: 0.4;\n}\n',
  'src/components/pill/pill.manifest.json': manifest({
    name: 'pill',
    targets: {
      tailwind: { excluded: 'starter content' },
      mui: { excluded: 'starter content' },
    },
  }),
  'src/components/pill/pill.css': '.fx-pill {\n  display: inline-block;\n}\n',
};

/**
 * A CSS-only component with a state outside the pseudo-class and ARIA sets
 * (`loading`), rendered as `[data-state="loading"]`. Not mapped for mui
 * (such a state is DS-E085 for mui), so it exercises `stateSpec`'s fallback
 * branch for the stories plugin (H1).
 */
export const BLOB_FILES: Record<string, string> = {
  'src/components/blob/blob.manifest.json': manifest({
    name: 'blob',
    states: ['loading'],
    targets: { tailwind: {} },
  }),
  'src/components/blob/blob.css': [
    '.fx-blob {',
    '  display: inline-block;',
    '}',
    '.fx-blob[data-state="loading"] {',
    '  opacity: 0.5;',
    '}',
    '',
  ].join('\n'),
};

/**
 * `chip` with its optional `icon` slot made required, so MUI's own-component
 * model picks `icon` (not "label") as the slot that receives `children`
 * (H3).
 */
export const CHIP_REQUIRED_ICON: Record<string, string> = {
  'src/components/chip/chip.manifest.json': manifest({
    name: 'chip',
    displayName: 'Chip',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: {
      root: { element: 'button' },
      icon: { element: 'span', optional: false },
    },
    targets: { tailwind: {}, mui: {} },
  }),
};

/** TW_FILES with every component excluded from mui, so no component has a mui cell (L5). */
export const NO_MUI_FILES: Record<string, string> = {
  'src/components/chip/chip.manifest.json': manifest({
    name: 'chip',
    displayName: 'Chip',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: {
      root: { element: 'button' },
      icon: { element: 'span', optional: true },
    },
    targets: { tailwind: {}, mui: { excluded: 'no mui cell for this test' } },
  }),
  'src/components/tag/tag.manifest.json': manifest({
    name: 'tag',
    states: ['disabled'],
    targets: {
      tailwind: { ignore: ['opacity'] },
      mui: { excluded: 'no mui cell for this test' },
    },
  }),
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
    allowCatalogMismatch: false,
  };
}

/** Drops the one-line header and the blank line after it. */
export function body(text: string): string {
  return text.slice(text.indexOf('\n') + 2);
}
