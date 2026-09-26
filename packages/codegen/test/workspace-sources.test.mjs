import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir, repoRoot } from '../src/util/paths.mjs';
import {
  WORKSPACE_SOURCES,
  exactAliases,
} from '../src/util/workspace-sources.mjs';

// The unit tests, the web visual check and Storybook read the workspace packages from their
// sources, so each runs on a fresh checkout with no build first. An entry a component imports
// that the table lacks resolves through the package's `exports` to dist/ instead: it passes on a
// machine that has built the packages and fails on a CI runner that has not, which is how the web
// visual check failed for many commits once the shells imported `@bwp-web/assets`.

const components = join(packagesDir, 'components');
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? e.name === '.out'
        ? []
        : walk(join(dir, e.name))
      : [join(dir, e.name)],
  );

/** Every `@bwp-web/*` entry a file under the components' sources, stories or cases imports. */
const imported = () => {
  const files = ['src', 'stories', '.storybook', 'test/visual']
    .flatMap((d) => walk(join(components, d)))
    .filter((f) => /\.(tsx?|mjs)$/.test(f));
  const entries = new Map();
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(
      /(?:from\s+|import\s+|import\()\s*['"](@bwp-web\/[^'"]+)['"]/g,
    )) {
      if (!entries.has(m[1])) entries.set(m[1], relative(repoRoot, file));
    }
  }
  return entries;
};

describe('workspace sources', () => {
  it('names every workspace entry the components, their stories and their cases import', () => {
    const missing = [...imported()]
      .filter(([entry]) => !(entry in WORKSPACE_SOURCES))
      .map(([entry, file]) => `${entry} (imported by ${file})`);
    expect(missing).toEqual([]);
  });

  it('points every entry at a committed source file, never at dist/', () => {
    for (const [entry, path] of Object.entries(WORKSPACE_SOURCES)) {
      expect(existsSync(path), entry).toBe(true);
      expect(relative(repoRoot, path), entry).toMatch(
        /^packages\/[a-z]+\/src\//,
      );
    }
  });

  it('gives Vite and Vitest exact aliases, so an entry never catches another as a subpath', () => {
    const aliases = exactAliases();
    const hit = (spec) => aliases.filter((a) => a.find.test(spec));
    for (const entry of Object.keys(WORKSPACE_SOURCES)) {
      expect(hit(entry).map((a) => a.replacement)).toEqual([
        WORKSPACE_SOURCES[entry],
      ]);
    }
    expect(hit('@bwp-web/styles/tailwind.css')).toEqual([]);
  });

  it('is the table the unit tests, the visual check and Storybook all take their aliases from', async () => {
    const vitest = (await import('../../../vitest.config.mjs')).default;
    expect(vitest.resolve.alias).toEqual(exactAliases());
    for (const file of [
      'packages/components/test/visual/build.mjs',
      'packages/components/.storybook/main.ts',
    ]) {
      expect(readFileSync(join(repoRoot, file), 'utf8'), file).toMatch(
        /from '[./a-z]*\/util\/workspace-sources\.mjs'/,
      );
    }
  });
});
