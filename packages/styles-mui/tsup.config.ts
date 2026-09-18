import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // declarations come from tsc (see the build script)
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', /^@mui\//, /^@emotion\//],
  jsx: 'automatic',
});
