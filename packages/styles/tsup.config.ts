import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/preset.ts'],
  format: ['esm', 'cjs'],
  dts: false, // We use tsc for declarations (see build script)
  sourcemap: true,
  clean: true,
  external: ['tailwindcss', 'clsx', 'tailwind-merge'],
});
