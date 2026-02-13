import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // We use tsc for declarations (see build script)
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@mui/material', '@bwp-web/components'],
  jsx: 'automatic',
});
