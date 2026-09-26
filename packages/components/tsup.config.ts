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
    '@mui/material',
    '@bwp-web/assets',
    '@tanstack/react-table',
  ],
  jsx: 'automatic',
  // Every component renders with hooks and MUI's styled(), so the bundle is a client module: a
  // Next.js App Router layout or page, a server component by default, can then import it. One
  // bundle, so one directive at its top (esbuild drops the ones inside the modules it bundles).
  banner: { js: "'use client';" },
});
