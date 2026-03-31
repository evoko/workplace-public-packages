import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // We use tsc for declarations (see build script)
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    '@bwp-web/assets',
    '@bwp-web/styles',
    '@tanstack/react-table',
  ],
  jsx: 'automatic',
});
