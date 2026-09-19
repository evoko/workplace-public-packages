import { PROPERTY_TABLE } from '../../components/properties.js';
import { FORM_CONTROL_ELEMENTS } from '../../components/render-selector.js';
import { ARIA_TRUE_STATES } from '../../components/states.js';
import type { Diagnostics } from '../../errors.js';
import type { ComponentIR, DesignIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { TokenCategory } from '../../tokens/categories.js';
import { normalizeQuotes } from '../../tokens/parse-tokens.js';
import { isMappedForMui } from '../mui/hints.js';
import type { MuiModel } from '../mui/model.js';
import { muiVarName, propNameFor } from '../mui/names.js';
import { themeFactoryName } from '../mui/render-ts.js';
import { isMappedForTailwind } from '../tailwind/hints.js';
import { tailwindVarName } from '../tailwind/names.js';

export type ModeSwitch =
  | { kind: 'attribute'; name: string }
  | { kind: 'class'; prefix: string; suffix: string };

/** Data the harness needs about the design system; rendered into `config.ts`. */
export interface StoriesConfig {
  prefix: string;
  name: string;
  modes: string[];
  defaultMode: string;
  mode: ModeSwitch;
  tokenCategories: TokenCategory[];
  parityProperties: string[];
  /** Absent when no component is mapped for mui, so no story imports it. */
  muiPackage?: string;
  muiThemeFactory: string;
}

export interface SpecAxis {
  name: string;
  values: string[];
  default: string;
}

export type SpecState =
  | { name: string; kind: 'hover' | 'focus-visible' | 'active' }
  | {
      name: string;
      kind: 'attribute';
      attributes: Record<string, string>;
      muiProp: string;
    };

export interface SpecSlot {
  name: string;
  element: string;
  content: string;
}

export interface MuiCell {
  rootClass: string;
  slotClasses: Record<string, string>;
  /** Design-system axis name to React prop name. */
  axisProps: Record<string, string>;
  /** Design-system slot name to React prop name (the label slot excluded when it takes children). */
  slotProps: Record<string, string>;
  /** Where the label text goes: `children`, a slot prop name, or null (no text). */
  children: 'children' | string | null;
}

export interface ComponentSpec {
  name: string;
  displayName: string;
  exportName: string;
  rootElement: string;
  axes: SpecAxis[];
  states: SpecState[];
  slots: SpecSlot[];
  label: string;
  labelSlot: string | null;
  /** Element of the label slot (`span` when there is none). */
  labelElement: string;
  tailwind: boolean;
  mui: MuiCell | null;
}

export interface TokenSpec {
  id: string;
  path: string[];
  cssVar: string;
  tailwindVar: string;
  muiVar: string;
  modeInvariant: boolean;
}

export interface StoriesModel {
  config: StoriesConfig;
  components: ComponentSpec[];
  tokens: Partial<Record<TokenCategory, TokenSpec[]>>;
}

const ATTRIBUTE = /^(?::root)?\[(data-[a-z][a-z0-9-]*)="\{mode\}"\]$/;
const CLASS = /^(?::root)?\.([a-z][a-z0-9-]*-)?\{mode\}(-?[a-z0-9-]*)$/;

/** The document-level switch a browser applies for a mode, or null when the selector is neither form. */
export function modeSwitchFor(modeSelector: string): ModeSwitch | null {
  const selector = normalizeQuotes(modeSelector.trim());
  const attribute = ATTRIBUTE.exec(selector);
  if (attribute) {
    return { kind: 'attribute', name: attribute[1] };
  }
  const cls = CLASS.exec(selector);
  if (cls) {
    return { kind: 'class', prefix: cls[1] ?? '', suffix: cls[2] };
  }
  return null;
}

function stateSpec(state: string, rootElement: string): SpecState {
  if (state === 'hover' || state === 'focus-visible' || state === 'active') {
    return { name: state, kind: state };
  }
  if (state === 'disabled') {
    return {
      name: state,
      kind: 'attribute',
      attributes: FORM_CONTROL_ELEMENTS.has(rootElement)
        ? { disabled: '' }
        : { 'aria-disabled': 'true' },
      muiProp: 'disabled',
    };
  }
  const aria = Object.entries(ARIA_TRUE_STATES).find(([, s]) => s === state);
  if (aria) {
    return {
      name: state,
      kind: 'attribute',
      attributes: { [aria[0]]: 'true' },
      muiProp: propNameFor(state),
    };
  }
  // A state outside the pseudo-class and ARIA sets is DS-E085 for MUI (so a
  // component using it can never have a `mui` cell), but it is legal for a
  // CSS-only component: `render-selector.ts`/`stateForAttribute` render and
  // parse it as `[data-state="<state>"]`.
  return {
    name: state,
    kind: 'attribute',
    attributes: { 'data-state': state },
    muiProp: propNameFor(state),
  };
}

function componentSpec(component: ComponentIR, mui: MuiModel): ComponentSpec {
  const rootElement = component.slots.root?.element ?? 'div';
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  const defaultLabelSlot = nonRoot.includes('label') ? 'label' : null;
  const muiMeta = mui.components[component.name];
  // When this component has a mui cell, the label text must go wherever
  // MUI's own model renders `children` (`muiMeta.childrenSlot`), which is
  // not always the slot literally named "label" (an own component with no
  // `label` slot uses its first required slot instead; see
  // `buildComponentModel` in `../mui/model.js`). A component with no mui
  // cell keeps the simple "a `label` slot, if any" rule.
  const labelSlot = muiMeta
    ? (muiMeta.childrenSlot ?? defaultLabelSlot)
    : defaultLabelSlot;
  const label = component.preview.label ?? component.displayName;
  let cell: MuiCell | null = null;
  if (muiMeta) {
    const slotProps: Record<string, string> = {};
    for (const slot of Object.keys(muiMeta.slots)) {
      if (slot !== muiMeta.childrenSlot) {
        slotProps[slot] = muiMeta.slots[slot].prop;
      }
    }
    const children =
      muiMeta.mapped && muiMeta.mapped.children.kind === 'none'
        ? null
        : 'children';
    cell = {
      rootClass: muiMeta.mapped
        ? `Mui${muiMeta.mapped.component}-root`
        : `${muiMeta.themeKey}-root`,
      slotClasses: Object.fromEntries(
        Object.entries(muiMeta.slots).map(([s, def]) => [s, def.className]),
      ),
      axisProps: Object.fromEntries(
        Object.entries(muiMeta.axes).map(([a, def]) => [a, def.prop]),
      ),
      slotProps,
      children,
    };
  }
  return {
    name: component.name,
    displayName: component.displayName,
    exportName: muiMeta?.exportName ?? component.name,
    rootElement,
    axes: component.axisOrder.map((a) => ({
      name: a,
      values: [...component.axes[a].values],
      default: component.axes[a].default,
    })),
    states: component.states.map((s) => stateSpec(s, rootElement)),
    slots: nonRoot
      .filter((s) => s !== labelSlot)
      .map((s) => ({
        name: s,
        element: component.slots[s].element,
        content: component.preview[s] ?? s,
      })),
    label,
    labelSlot,
    labelElement: labelSlot ? component.slots[labelSlot].element : 'span',
    tailwind: isMappedForTailwind(component),
    mui: cell,
  };
}

/**
 * Everything the story generator renders, derived from the IR and the MUI
 * model. `DS-E084` when the mode selector has no browser switch or when a
 * component is mapped for MUI but `targets.stories.options.muiPackage` is
 * missing.
 */
export function buildStoriesModel(
  ir: DesignIR,
  mui: MuiModel,
  options: Record<string, string>,
  diag: Diagnostics,
): StoriesModel | null {
  const at = { file: 'ds.config.json', line: 1, column: 1 };
  const mode = modeSwitchFor(ir.meta.modeSelector);
  if (!mode) {
    diag.add(
      'DS-E084',
      `stories: modeSelector "${ir.meta.modeSelector}" cannot be toggled from a browser; use :root[data-x="{mode}"] or .x-{mode}`,
      at,
    );
  }
  const names = Object.keys(ir.components).sort(codeUnitCompare);
  const anyMui = names.some((n) => isMappedForMui(ir.components[n]));
  const muiPackage = options.muiPackage;
  if (anyMui && !muiPackage) {
    diag.add(
      'DS-E084',
      'stories: targets.stories.options.muiPackage (the import specifier of the generated MUI package) is required because a component is mapped for mui',
      at,
    );
  }
  if (!mode || (anyMui && !muiPackage)) {
    return null;
  }
  const tokens: Partial<Record<TokenCategory, TokenSpec[]>> = {};
  for (const id of Object.keys(ir.tokens).sort(codeUnitCompare)) {
    const token = ir.tokens[id];
    const list = tokens[token.category] ?? [];
    tokens[token.category] = list;
    list.push({
      id,
      path: [...token.path],
      cssVar: token.cssName,
      tailwindVar: tailwindVarName(token.category, token.path, ir.meta.prefix),
      muiVar: muiVarName(ir.meta.prefix, token),
      modeInvariant: token.modeInvariant,
    });
  }
  const tokenCategories = (Object.keys(tokens) as TokenCategory[]).sort(
    codeUnitCompare,
  );
  return {
    config: {
      prefix: ir.meta.prefix,
      name: ir.meta.name,
      modes: [...ir.meta.modes],
      defaultMode: ir.meta.defaultMode,
      mode,
      tokenCategories,
      parityProperties: Object.keys(PROPERTY_TABLE).sort(codeUnitCompare),
      // Omitted (not just falsy) when no component is mapped for mui, even
      // if the option was supplied, so a story never imports an mui package
      // it has no use for.
      ...(anyMui && muiPackage ? { muiPackage } : {}),
      muiThemeFactory: themeFactoryName(mui),
    },
    components: names.map((n) => componentSpec(ir.components[n], mui)),
    tokens: Object.fromEntries(tokenCategories.map((c) => [c, tokens[c]!])),
  };
}
