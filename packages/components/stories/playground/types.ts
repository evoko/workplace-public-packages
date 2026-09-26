/**
 * What a Playground builder gets and gives, on the web: the same members as Flutter's
 * (widgetbook/lib/playground/playground.dart), independent of Storybook, so a builder is tested
 * with a fake and the adapter is the only code that knows the viewer. Also the shape of the data
 * the codegen serves (`virtual:solar`'s PLAYGROUND, from packages/codegen/src/playground/).
 */

import type { ReactNode } from 'react';

export type ControlValue = string | number | boolean | null;

/** What a control holds, and so how a viewer draws it (controls.mjs, extras.mjs). */
export type ControlKind =
  | 'select'
  | 'boolean'
  | 'color'
  | 'text'
  | 'icon'
  | 'child'
  | 'childText'
  | 'content'
  | 'width'
  | 'number'
  | 'integer';

/** A Playground control, from packages/codegen/src/playground/controls.mjs. */
export interface PlaygroundControl {
  name: string;
  kind: ControlKind;
  default: ControlValue;
  /** A select's values. */
  options?: string[];
  /** A text slot the caller may leave out. */
  optional?: boolean;
  /** A component slot's child, where the IR names it. */
  component?: string | null;
  /** A child's words control: the component slot it belongs to. */
  slot?: string;
  /** A number or integer extra's bounds and step. */
  min?: number;
  max?: number;
  step?: number;
}

/** The fixed values both viewers' adapters use (packages/codegen/src/playground/values.mjs). */
export interface PlaygroundValues {
  iconNone: string;
  iconSample: string;
  iconSolid: string;
  widths: string[];
  logLength: number;
}

/**
 * Every component's Playground controls, the icon stems the icon controls offer, each icon's
 * @bwp-web/assets component name by stem, and the fixed values.
 */
export interface PlaygroundData {
  components: Record<string, PlaygroundControl[]>;
  icons: string[];
  iconComponents: Record<string, string>;
  values: PlaygroundValues;
}

/**
 * The interface a builder renders from. Every member takes a control's name and throws for a name
 * that is not one of the component's controls, or (the typed accessors, `icon`, `child`) one of
 * another kind, so a misspelt or misread control fails at once.
 */
export interface Playground {
  /** A control's current value, for a kind no typed accessor covers (a colour). */
  value(name: string): ControlValue;
  /** A boolean, a component slot's toggle or a content toggle: on or off. */
  flag(name: string): boolean;
  /** A text control's words; '' where it holds none. */
  text(name: string): string;
  /** A text control's words, or undefined where it holds none: for an optional text slot. */
  words(name: string): string | undefined;
  /** A number or integer control as a whole number within its bounds; its default if cleared. */
  whole(name: string): number;
  /** A select's value, one of its options. */
  choice<T extends string = string>(name: string): T;
  /**
   * Sets a control: the component's own change reaches the panel. The value must fit the
   * control: a boolean for a toggle, a string for words, one of a select's options, an integer
   * within an integer's bounds, a string or null for a colour.
   */
  set(name: string, value: ControlValue): void;
  /**
   * Adds a line to the event log (and Storybook's Actions): the event's name, and `: <detail>` in
   * JSON unless the detail is null or undefined. Name the event as the component's callback is
   * named on this platform (`onChange`).
   */
  log(event: string, detail?: unknown): void;
  /** The icon an icon slot's control picked, as an element, or undefined (`_none`, or no icon). */
  icon(slot: string): ReactNode | undefined;
  /** A component slot's toggle and, where it has one, its words. */
  child(slot: string): { shown: boolean; text: string | undefined };
}

/**
 * A component's Playground on the web. `render` is called while a component renders (the
 * adapter's `BuilderHost`), so it may use React hooks, as a function component does; its extra
 * controls are the codegen's (packages/codegen/src/playground/extras.mjs), not the builder's.
 */
export interface PlaygroundBuilder {
  render(p: Playground): ReactNode;
}
