import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { exactAliases } from './packages/codegen/src/util/workspace-sources.mjs';

// Turbo runs each package's `test` script with the package directory as cwd, so `root`
// must be set explicitly here; otherwise the `include` glob below (relative to `root`)
// would resolve against the wrong directory and silently find no tests.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // Workspace packages resolve to their sources, not their dist/: a suite tests what is
  // committed, and does not depend on a build having run first (the SOLAR workflow's codegen job
  // runs the suites straight after regenerating).
  // One table for every tool that does so (packages/codegen/src/util/workspace-sources.mjs).
  resolve: { alias: exactAliases() },
  test: {
    include: ['packages/*/test/**/*.test.mjs'],
    environment: 'node',
  },
});
