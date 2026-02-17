import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', '@mui/material'],
  jsx: 'automatic',
  loader: {
    '.png': 'dataurl',
  },
});
