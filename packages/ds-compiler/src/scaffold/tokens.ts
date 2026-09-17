import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { TOKENS_DIR } from '../build.js';
import { modeSelectorFor, type DsConfig } from '../config.js';
import type { TokenCategory } from '../tokens/categories.js';

export class ScaffoldError extends Error {}

/**
 * Writes a file that must not already exist. Translates a concurrent
 * writer's EEXIST (the `wx` flag) into the same ScaffoldError message the
 * caller's own existsSync pre-check throws.
 */
export function writeNewFile(path: string, contents: string): void {
  try {
    writeFileSync(path, contents, { flag: 'wx' });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
      throw new ScaffoldError(
        `${path} already exists; scaffold never overwrites`,
      );
    }
    throw err;
  }
}

export const CATEGORY_EXAMPLES: Record<TokenCategory, string> = {
  color: '#1863d3',
  space: '8px',
  radius: '6px',
  'font-family': "'Open Sans', Arial, sans-serif",
  'font-size': '1rem',
  'font-weight': '600',
  'line-height': '1.5',
  'letter-spacing': '-0.02em',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  'border-width': '1px',
  duration: '150ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: '0.4',
  'z-index': '100',
  size: '44px',
};

export function renderTokenScaffold(
  category: TokenCategory,
  config: DsConfig,
): string {
  const lines = [
    `/* ${config.name} tokens: ${category}`,
    ` * Only :root and the mode blocks below are allowed. Every declaration is`,
    ` * --${config.prefix}-${category}-<path>; values are literals or var() aliases.`,
    ` * Docs: docs/design-system/authoring-guide.md#tokens */`,
    '',
    ':root {',
    `  /* example: --${config.prefix}-${category}-example: ${CATEGORY_EXAMPLES[category]}; */`,
    `  /* TODO: add ${category} tokens */`,
    '}',
  ];
  for (const mode of config.modes) {
    if (mode === config.defaultMode) {
      continue;
    }
    lines.push(
      '',
      `${modeSelectorFor(config, mode)} {`,
      `  /* TODO: add ${mode} values for tokens that vary by mode, or delete this block */`,
      '}',
    );
  }
  return `${lines.join('\n')}\n`;
}

export function scaffoldTokens(
  rootDir: string,
  category: TokenCategory,
  config: DsConfig,
): { path: string } {
  const path = join(rootDir, TOKENS_DIR, `${category}.css`);
  if (existsSync(path)) {
    throw new ScaffoldError(
      `${path} already exists; scaffold never overwrites`,
    );
  }
  mkdirSync(dirname(path), { recursive: true });
  writeNewFile(path, renderTokenScaffold(category, config));
  return { path };
}
