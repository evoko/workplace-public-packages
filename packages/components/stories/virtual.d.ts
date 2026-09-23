/** Served by the `solar-data` plugin in .storybook/main.ts, from the codegen. */
declare module 'virtual:solar' {
  type Axis =
    | { type: 'boolean'; default: boolean }
    | { values: string[]; default: string; type?: undefined };
  export const COMPONENTS: string[];
  export const SPECS: Record<string, { api: Record<string, Axis> }>;
  export const STATES: Record<string, Record<string, string | null>>;
}
