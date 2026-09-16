import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE_MINI = fileURLToPath(
  new URL('./fixtures/mini/', import.meta.url),
);

/** Writes files (relative path -> contents) into a fresh temp root and returns it. */
export function makeRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'ds-root-'));
  for (const [rel, contents] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, contents);
  }
  return root;
}

export const MINI_CONFIG = JSON.stringify({
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
});

export const BASELINE_CSS = `
  appearance: none;
  box-sizing: border-box;
  background-color: transparent;
  color: var(--fx-color-text-default);
  font-family: var(--fx-font-family-body);
  font-size: var(--fx-font-size-md);
  line-height: var(--fx-line-height-tight);
  border-style: none;
`;
