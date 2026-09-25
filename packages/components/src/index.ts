// The package entry. Its components are listed in components.generated.ts, which
// `npm run solar:codegen` writes from the component list; anything else the package exports goes
// here.
export * from './components.generated.js';
// The SOLAR components' keys in an MUI theme's `components` (its types only).
export type {} from './theme.generated.js';
export { SolarProvider, type SolarProviderProps } from './SolarProvider.js';
