/** Served by the `solar-data` plugin in .storybook/main.ts, from the codegen. */
declare module 'virtual:solar' {
  export const COMPONENTS: string[];
  export const STATES: Record<string, Record<string, string | null>>;
  /** The last web check's failures, per component and mode; null where it has not run. */
  export const FAILURES: Record<
    string,
    Record<
      'light' | 'dark',
      Array<{ variant: string; layer: string; property: string }> | null
    >
  >;
  /**
   * Every component's Playground controls (extras included), the icon stems the icon controls
   * offer, each icon's @bwp-web/assets component name by stem, and the fixed values, from
   * packages/codegen/src/playground/controls.mjs `playgroundData`.
   */
  export const PLAYGROUND: import('./playground/types.js').PlaygroundData;
}
