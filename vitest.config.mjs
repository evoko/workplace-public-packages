import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Turbo runs each package's `test` script with the package directory as cwd, so `root`
// must be set explicitly here; otherwise the `include` glob below (relative to `root`)
// would resolve against the wrong directory and silently find no tests.
const src = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // Workspace packages resolve to their sources, not their dist/: a suite tests what is
  // committed, and does not depend on a build having run first (the SOLAR workflow's codegen job
  // runs the suites straight after regenerating).
  resolve: {
    alias: [
      {
        find: /^@bwp-web\/styles\/mui$/,
        replacement: src('packages/styles/src/mui.ts'),
      },
      {
        find: /^@bwp-web\/styles$/,
        replacement: src('packages/styles/src/index.ts'),
      },
    ],
  },
  test: {
    include: ['packages/*/test/**/*.test.mjs'],
    environment: 'node',
  },
});
