import type { ReactNode } from 'react';

/** One oracle variant, as `spec/verify/<name>.json` lists it. */
export interface OracleVariant {
  figma: string;
  props: Record<string, unknown>;
  state: string;
  /** For an axis the API derives from content (FAB's type): the slots to fill. */
  content?: string[];
  /**
   * What Figma draws in each layer: for a composed child, which of its variants (Button's Counter);
   * for a sample Figma draws, its size (ProgressBar's bar, at the variant's value).
   */
  layers?: Record<
    string,
    ({ variant?: Record<string, string> } & Record<string, unknown>) | undefined
  >;
}

/**
 * How the page renders one component: its oracle, and the component in one oracle variant, with
 * its props (prop states among them: disabled, loading, selected) and every slot filled with a
 * probe, so a slot's look is measured whether or not the prop that shows it is on. Platform states
 * are not set here: the spec reaches them as a user does.
 */
export interface VisualCase {
  oracle: { component: string; variants: OracleVariant[] };
  render: (variant: OracleVariant) => ReactNode;
}
