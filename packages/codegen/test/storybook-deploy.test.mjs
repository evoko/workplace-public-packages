import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir } from '../src/util/paths.mjs';

// The Vercel project deploys every branch from the root directory packages/storybook, with its
// framework defaults: install at the repository root, `turbo run build` there, publish `dist`.
// The V1 branches keep their own Storybook package in that place; on this branch
// packages/storybook is a package of nothing but that build, which writes the components'
// Storybook into its dist/. So the settings serve V1 and V2 alike, and none may need to change.
// Vercel skips a deployment when nothing it depends on changed, so the package must name every
// workspace package the Storybook build reads.

const pkg = () =>
  JSON.parse(
    readFileSync(join(packagesDir, 'storybook', 'package.json'), 'utf8'),
  );

describe('the Storybook deployment', () => {
  it('is the package Vercel builds, under V1’s name, and published nowhere', () => {
    expect(pkg().name).toBe('@bwp-web/storybook');
    expect(pkg().private).toBe(true);
  });

  it('builds the components’ Storybook into its own dist/, where Vercel publishes it', () => {
    expect(pkg().scripts.build).toBe(
      'npm run build-storybook -w @bwp-web/components -- -o ../storybook/dist',
    );
    const components = JSON.parse(
      readFileSync(join(packagesDir, 'components', 'package.json'), 'utf8'),
    );
    expect(components.scripts['build-storybook']).toMatch(/^storybook build /);
  });

  it('depends on every workspace package the Storybook build reads', () => {
    const deps = Object.keys({
      ...pkg().dependencies,
      ...pkg().devDependencies,
    });
    for (const name of [
      '@bwp-web/components',
      '@bwp-web/styles',
      '@bwp-web/assets',
      '@bwp-web/codegen',
    ]) {
      expect(deps, name).toContain(name);
    }
  });

  it('keeps its build output out of git', () => {
    expect(existsSync(join(packagesDir, 'storybook', 'README.md'))).toBe(true);
    const ignore = readFileSync(join(packagesDir, '..', '.gitignore'), 'utf8');
    expect(ignore).toMatch(/^\/?dist\/?$/m);
  });
});
