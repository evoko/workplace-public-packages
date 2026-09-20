import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type TargetId = 'css' | 'tailwind' | 'mui';

export type ModeSwitch =
  | { kind: 'attribute'; name: string }
  | { kind: 'class'; prefix: string; suffix: string };

/** Mirrors the compiler's `StoriesConfig`; generated into `src/generated/config.ts`. */
export interface StoriesConfig {
  prefix: string;
  name: string;
  modes: string[];
  defaultMode: string;
  mode: ModeSwitch;
  tokenCategories: string[];
  parityProperties: string[];
  /** Absent when no component is mapped for MUI. */
  muiPackage?: string;
  muiThemeFactory: string;
}

export interface CompareAxis {
  name: string;
  values: string[];
  default: string;
}

export type CompareState =
  | { name: string; kind: 'hover' | 'focus-visible' | 'active' }
  | {
      name: string;
      kind: 'attribute';
      attributes: Record<string, string>;
      muiProp: string;
    };

export interface CompareSlot {
  name: string;
  element: string;
  content: string;
}

export interface CompareRow {
  axes: Record<string, string>;
  /** A state name, or null for the base row. */
  state: string | null;
}

export interface MuiCellSpec {
  rootClass: string;
  slotClasses: Record<string, string>;
  theme: Theme;
  render: (row: CompareRow) => ReactNode;
}

export interface CompareSpec {
  name: string;
  displayName: string;
  rootElement: string;
  axes: CompareAxis[];
  states: CompareState[];
  /** Non-root slots in manifest order, the label slot excluded. */
  slots: CompareSlot[];
  label: string;
  labelSlot: string | null;
  labelElement: string;
  tailwind: boolean;
  mui: MuiCellSpec | null;
}

export interface TokenSpec {
  id: string;
  path: string[];
  cssVar: string;
  tailwindVar: string;
  muiVar: string;
  modeInvariant: boolean;
}

/** Every axis permutation (last axis fastest) times base and each state. */
export function rowsFor(spec: CompareSpec): CompareRow[] {
  let axes: Record<string, string>[] = [{}];
  for (const axis of spec.axes) {
    axes = axes.flatMap((partial) =>
      axis.values.map((v) => ({ ...partial, [axis.name]: v })),
    );
  }
  return axes.flatMap((a) => [
    { axes: a, state: null },
    ...spec.states.map((s) => ({ axes: a, state: s.name })),
  ]);
}

/** `tone=loud size=sm hover`, `tone=loud size=sm base`, or `base`. */
export function rowKey(row: CompareRow): string {
  const axes = Object.entries(row.axes).map(([k, v]) => `${k}=${v}`);
  return [...axes, row.state ?? 'base'].join(' ');
}

export function cellId(target: TargetId, row: CompareRow): string {
  return `${target}|${rowKey(row)}`;
}

/** The columns a spec renders: css always, then the targets it is mapped for. */
export function targetsFor(spec: CompareSpec): TargetId[] {
  const out: TargetId[] = ['css'];
  if (spec.tailwind) {
    out.push('tailwind');
  }
  if (spec.mui) {
    out.push('mui');
  }
  return out;
}
