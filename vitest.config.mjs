import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Turbo runs each package's `test` script with the package directory as cwd, so `root`
// must be set explicitly here; otherwise the `include` glob below (relative to `root`)
// would resolve against the wrong directory and silently find no tests.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['packages/*/test/**/*.test.mjs'],
    environment: 'node',
  },
});
