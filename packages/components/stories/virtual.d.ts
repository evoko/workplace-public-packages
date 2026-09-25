/** Served by the `solar-data` plugin in .storybook/main.ts, from the codegen. */
declare module 'virtual:solar' {
  type Axis =
    | { type: 'boolean'; default: boolean }
    | { values: string[]; default: string; type?: undefined };
  export const COMPONENTS: string[];
  export const SPECS: Record<string, { api: Record<string, Axis> }>;
  export const STATES: Record<string, Record<string, string | null>>;
  /** The last web check's failures, per component and mode; null where it has not run. */
  export const FAILURES: Record<
    string,
    Record<
      'light' | 'dark',
      Array<{ variant: string; layer: string; property: string }> | null
    >
  >;
}
