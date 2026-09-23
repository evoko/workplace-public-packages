import { defineConfig } from 'tsup';

export default defineConfig({
  // One entry per audience, so an app that is not on MUI never loads the MUI theme.
  entry: ['src/index.ts', 'src/mui.ts'],
  format: ['esm', 'cjs'],
  dts: false, // We use tsc for declarations (see build script)
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@mui/material', '@bwp-web/assets'],
  jsx: 'automatic',
});
