import { z } from 'zod';
import { FORM_CONTROL_ELEMENTS } from '../../components/render-selector.js';
import { ARIA_TRUE_STATES, PSEUDO_STATES } from '../../components/states.js';
import type { Diagnostics } from '../../errors.js';
import type { ComponentIR, DesignIR, Token, TokenId } from '../../ir/types.js';
import { stableStringify } from '../../ir/serialize.js';
import { codeUnitCompare } from '../../sources.js';
import { renderTokenValue } from '../css-values.js';
import type { PluginContext } from '../plugin.js';
import {
  CATALOG_AT,
  type MuiCatalog,
  type MuiCatalogComponent,
} from './catalog.js';
import { HTML_ELEMENTS, SVG_ELEMENTS, VOID_ELEMENTS } from './html-elements.js';
export { MUI_PACKAGE, MUI_RANGE } from './framework.js';
import { MUI_PACKAGE, MUI_RANGE } from './framework.js';
import { ignoredForMui, isMappedForMui, muiMapping } from './hints.js';
import type { MuiScalar } from './hints.js';
import {
  manifestLocation,
  planMapping,
  type ChildrenMode,
  type MappingPlan,
  type MappingUnion,
} from './mapping.js';
import {
  camelCategory,
  colorSchemeSelectorFor,
  muiPropertyKey,
  muiVarName,
  pascalCase,
  propNameFor,
  slotClassName,
  specificityKey,
  themeKeyFor,
} from './names.js';
import { computeResets } from './resets.js';
import { muiValue } from './values.js';

export { muiValue } from './values.js';

/** camelCase property to CSS text. Every value is a string: Emotion appends `px` to bare numbers. */
export type MuiDeclarations = Record<string, string>;

/** One selector key to declarations, or one `@media …` key to exactly one selector key. */
export type MuiVariantStyle = Record<
  string,
  MuiDeclarations | Record<string, MuiDeclarations>
>;

export interface MuiVariant {
  /** Prop name to value (`ownerState` matching); `{}` matches every instance. Design-system prop names for own components, MUI prop names for mapped ones. */
  props: Record<string, string>;
  style: MuiVariantStyle;
}

export interface MuiComponentTheme {
  /** Mapped components only: parity props, axis defaults, manifest defaultProps. */
  defaultProps?: Record<string, MuiScalar>;
  styleOverrides: { root: MuiDeclarations };
  /** Mapped components: `resetCount` reset entries first, then the design system's rules. */
  variants: MuiVariant[];
}

/** Exactly the object `theme.ts` exports; key order is the rendering order. */
export interface MuiThemeOptions {
  cssVariables: { cssVarPrefix: string; colorSchemeSelector: string };
  defaultColorScheme: string;
  colorSchemes: Record<string, { palette: { tokens: Record<string, string> } }>;
  tokens: Record<string, Record<string, string>>;
  components: Record<string, MuiComponentTheme>;
}

export interface MuiSlotModel {
  element: string;
  optional: boolean;
  className: string;
  /** The React prop name (camelCase of the slot name), when the slot is not the children slot. */
  prop: string;
}

/** An axis as the React shell sees it: its declared values plus the camelCase prop name. */
export interface MuiAxisModel {
  values: string[];
  default: string;
  prop: string;
}

/** A state that needs a prop on the React shell (pseudo-class states need none). */
export interface MuiStateProp {
  state: string;
  prop: string;
  /** `disabled`, `aria-disabled`, or `aria-<state>`. */
  attribute: string;
}

export interface MuiMappedModel {
  component: string;
  axisMap: Record<string, string>;
  slotMap: Record<string, string>;
  defaultProps: Record<string, MuiScalar>;
  children: ChildrenMode;
  ownProps: string[];
  unions: Record<string, MappingUnion>;
  resetCount: number;
}

export interface MuiComponentModel {
  name: string;
  exportName: string;
  /** `<Prefix><Name>` for an own component, `Mui<Component>` for a mapped one. */
  themeKey: string;
  rootElement: string;
  axes: Record<string, MuiAxisModel>;
  stateProps: MuiStateProp[];
  /** Non-root slots in manifest order; `className` is the own-component class or MUI's slot class. */
  slots: Record<string, MuiSlotModel>;
  /** The slot that renders `children`, or null. For a mapped component, null also when children go to MUI's children (see `mapped.children`). */
  childrenSlot: string | null;
  kind: 'own' | 'mapped';
  mapped: MuiMappedModel | null;
}

export interface MuiModel {
  /** The header text; JSON has no comments, so it is the first key. */
  generated: string;
  prefix: string;
  framework: {
    name: typeof MUI_PACKAGE;
    range: string;
    version: string | null;
  };
  themeOptions: MuiThemeOptions;
  /** By design-system component name, sorted. */
  components: Record<string, MuiComponentModel>;
}

const declarations = z.record(z.string(), z.string());
const scalar = z.union([z.string(), z.number(), z.boolean()]);

const variantStyle = z
  .record(
    z.string(),
    z.union([declarations, z.record(z.string(), declarations)]),
  )
  .refine((style) => {
    const keys = Object.keys(style);
    if (keys.length !== 1) {
      return false;
    }
    const value = style[keys[0]] as Record<string, unknown>;
    const nested = Object.values(value).some((v) => typeof v === 'object');
    if (keys[0].startsWith('@media ')) {
      return nested && Object.keys(value).length === 1;
    }
    return !nested;
  }, 'exactly one selector key, or one @media key holding exactly one selector key');

/** Shape check for `theme.model.json` before `reparse` trusts it. */
export const muiModelSchema = z.strictObject({
  generated: z.string(),
  prefix: z.string(),
  framework: z.strictObject({
    name: z.literal(MUI_PACKAGE),
    range: z.string(),
    version: z.string().nullable(),
  }),
  themeOptions: z.strictObject({
    cssVariables: z.strictObject({
      cssVarPrefix: z.string(),
      colorSchemeSelector: z.string(),
    }),
    defaultColorScheme: z.string(),
    colorSchemes: z.record(
      z.string(),
      z.strictObject({ palette: z.strictObject({ tokens: declarations }) }),
    ),
    tokens: z.record(z.string(), declarations),
    components: z.record(
      z.string(),
      z.strictObject({
        defaultProps: z.record(z.string(), scalar).optional(),
        styleOverrides: z.strictObject({ root: declarations }),
        variants: z.array(
          z.strictObject({
            props: z.record(z.string(), z.string()),
            style: variantStyle,
          }),
        ),
      }),
    ),
  }),
  components: z.record(
    z.string(),
    z.strictObject({
      name: z.string(),
      exportName: z.string(),
      themeKey: z.string(),
      rootElement: z.string(),
      axes: z.record(
        z.string(),
        z.strictObject({
          values: z.array(z.string()),
          default: z.string(),
          prop: z.string(),
        }),
      ),
      stateProps: z.array(
        z.strictObject({
          state: z.string(),
          prop: z.string(),
          attribute: z.string(),
        }),
      ),
      slots: z.record(
        z.string(),
        z.strictObject({
          element: z.string(),
          optional: z.boolean(),
          className: z.string(),
          prop: z.string(),
        }),
      ),
      childrenSlot: z.string().nullable(),
      kind: z.enum(['own', 'mapped']),
      mapped: z
        .strictObject({
          component: z.string(),
          axisMap: z.record(z.string(), z.string()),
          slotMap: z.record(z.string(), z.string()),
          defaultProps: z.record(z.string(), scalar),
          children: z.union([
            z.strictObject({ kind: z.literal('children') }),
            z.strictObject({
              kind: z.literal('slot'),
              slot: z.string(),
              muiProp: z.string(),
            }),
            z.strictObject({ kind: z.literal('none') }),
          ]),
          ownProps: z.array(z.string()),
          unions: z.record(
            z.string(),
            z.strictObject({
              overrides: z.string(),
              defaults: z.array(z.string()),
              values: z.array(z.string()),
            }),
          ),
          resetCount: z.number().int().nonnegative(),
        })
        .nullable(),
    }),
  ),
});

export function muiHeaderText(ir: DesignIR, ctx: PluginContext): string {
  return `Generated by @bwp-web/ds-compiler ${ctx.compilerVersion} for target mui from design.ir.json (source hash ${ir.meta.sourceHash}). Do not edit; run bwp-ds generate.`;
}

function tokenText(
  token: Token,
  mode: string,
  refName: (id: TokenId) => string,
): string {
  if (token.modeInvariant) {
    return token.alias
      ? `var(${refName(token.alias)})`
      : renderTokenValue(token.$value, token.$type, refName);
  }
  const alias = token.alias?.[mode];
  return alias
    ? `var(${refName(alias)})`
    : renderTokenValue(token.$value[mode], token.$type, refName);
}

const RESERVED_PROPS: ReadonlySet<string> = new Set([
  'children',
  'className',
  'style',
  'ref',
  'key',
  'sx',
  'component',
  'as',
  'ownerState',
  'theme',
  'classes',
]);

function ariaAttributeFor(state: string): string | null {
  const entry = Object.entries(ARIA_TRUE_STATES).find(([, s]) => s === state);
  return entry ? entry[0] : null;
}

export interface ComponentModelResult {
  model: MuiComponentModel;
  resets: MuiVariant[];
}

/**
 * Builds the React-shell or wrapper model together with the resets computed
 * for a mapped component (so they are computed exactly once and shared with
 * `componentTheme`, and reused by the reparser instead of recomputing them a
 * second time from the mapping). Null after reporting every DS-E085/DS-E086
 * for the component.
 */
export function buildComponentModel(
  ir: DesignIR,
  component: ComponentIR,
  catalog: MuiCatalog | null,
  diag: Diagnostics,
): ComponentModelResult | null {
  const before = diag.errors.length;
  const prefix = ir.meta.prefix;
  const at = manifestLocation(component);
  const fail = (message: string): void => {
    diag.add('DS-E085', `mui: ${component.name}: ${message}`, at);
  };
  const hints = muiMapping(component);
  let plan: MappingPlan | null = null;
  let catalogEntry: MuiCatalogComponent | null = null;
  if (hints) {
    if (!catalog) {
      diag.add(
        'DS-E086',
        `mui: ${component.name} is mapped onto ${hints.component} but ${CATALOG_AT.file} is missing; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    const framework = catalog.frameworkComponents[hints.component];
    if (!framework) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog has no entry for ${hints.component}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    const entry = catalog.components[component.name];
    if (!entry || entry.component !== hints.component) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog entry is ${entry ? 'stale (the mapping changed)' : 'missing'}; run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    // The probe facts (rendered root element, ButtonBase root) were captured
    // for this mapping's defaultProps and live on the component's entry.
    plan = planMapping(component, hints, framework, entry, diag);
    if (!plan) {
      return null;
    }
    const recorded = {
      axisMap: entry.axisMap,
      slotMap: entry.slotMap,
      defaultProps: entry.defaultProps,
    };
    const planned = {
      axisMap: plan.axisMap,
      slotMap: plan.slotMap,
      defaultProps: plan.defaultProps,
    };
    if (stableStringify(recorded) !== stableStringify(planned)) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: the catalog entry is stale (the mapping changed); run bwp-ds capture-defaults --target mui`,
        at,
      );
      return null;
    }
    catalogEntry = entry;
  }
  const rootElement = component.slots.root?.element ?? 'div';
  const themeKey = plan ? plan.themeKey : themeKeyFor(prefix, component.name);
  for (const slot of component.slotOrder) {
    const def = component.slots[slot];
    const el = def.element;
    if (!HTML_ELEMENTS.has(el) && !SVG_ELEMENTS.has(el)) {
      fail(`slot "${slot}" uses element "${el}", which is not an HTML element`);
      continue;
    }
    if (VOID_ELEMENTS.has(el)) {
      fail(
        `slot "${slot}" uses void element "${el}", which cannot hold content`,
      );
      continue;
    }
    if (
      SVG_ELEMENTS.has(el) &&
      !HTML_ELEMENTS.has(el) &&
      rootElement !== 'svg'
    ) {
      fail(
        `slot "${slot}" uses SVG element "${el}" but the root is "${rootElement}", not svg`,
      );
    }
  }
  const axisNames = component.axisOrder;
  for (const axis of axisNames) {
    if (RESERVED_PROPS.has(propNameFor(axis))) {
      fail(`axis "${axis}" collides with a reserved React prop`);
    }
  }
  const stateProps: MuiStateProp[] = [];
  for (const state of component.states) {
    if (state === 'disabled') {
      stateProps.push({
        state,
        prop: propNameFor(state),
        // A mapped component hands `disabled` to MUI's prop; an own shell renders the attribute.
        attribute:
          plan || FORM_CONTROL_ELEMENTS.has(rootElement)
            ? 'disabled'
            : 'aria-disabled',
      });
    } else if (ariaAttributeFor(state)) {
      stateProps.push({
        state,
        prop: propNameFor(state),
        attribute: ariaAttributeFor(state)!,
      });
    } else if (!Object.hasOwn(PSEUDO_STATES, state)) {
      // A pseudo-class state (hover, focus-visible, active) needs no prop,
      // so it cannot collide with an axis or slot of the same name.
      fail(
        `state "${state}" cannot be expressed as a React prop or a pseudo-class`,
      );
    }
  }
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  const childrenSlot = plan
    ? plan.children.kind === 'slot'
      ? plan.children.slot
      : null
    : nonRoot.includes('label')
      ? 'label'
      : (nonRoot.find((s) => !component.slots[s].optional) ?? null);
  // Checked unconditionally, including the children slot: a reserved-word
  // slot name is inexpressible regardless of how it is rendered.
  for (const slot of nonRoot) {
    if (RESERVED_PROPS.has(propNameFor(slot))) {
      fail(`slot "${slot}" collides with a reserved React prop`);
    }
  }
  // Two different axis, state, or slot names can camelCase to the same React
  // prop (e.g. "a-1b" and "a1b"); every one of them must be unique.
  const propNames: { name: string; prop: string }[] = [
    ...axisNames.map((a) => ({ name: a, prop: propNameFor(a) })),
    ...stateProps.map((s) => ({ name: s.state, prop: s.prop })),
    ...nonRoot.map((s) => ({ name: s, prop: propNameFor(s) })),
  ];
  const firstNameForProp = new Map<string, string>();
  for (const { name, prop } of propNames) {
    const first = firstNameForProp.get(prop);
    if (first === undefined) {
      firstNameForProp.set(prop, name);
    } else {
      fail(
        `props "${first}" and "${name}" both become the React prop "${prop}"`,
      );
    }
  }
  if (diag.errors.length > before) {
    return null;
  }
  const model: MuiComponentModel = {
    name: component.name,
    exportName: pascalCase(component.name),
    themeKey,
    rootElement,
    axes: Object.fromEntries(
      axisNames.map((a) => [
        a,
        {
          values: [...component.axes[a].values],
          default: component.axes[a].default,
          prop: propNameFor(a),
        },
      ]),
    ),
    stateProps,
    slots: Object.fromEntries(
      nonRoot.map((s) => [
        s,
        {
          element: component.slots[s].element,
          optional: component.slots[s].optional,
          className: plan ? plan.slotClasses[s] : slotClassName(themeKey, s),
          prop: propNameFor(s),
        },
      ]),
    ),
    childrenSlot,
    kind: plan ? 'mapped' : 'own',
    mapped: null,
  };
  let resets: MuiVariant[] = [];
  if (plan && catalogEntry) {
    const computed = computeResets(ir, component, plan, catalogEntry, diag, at);
    if (!computed) {
      return null;
    }
    resets = computed;
    model.mapped = {
      component: plan.component,
      axisMap: plan.axisMap,
      slotMap: plan.slotMap,
      defaultProps: plan.defaultProps,
      children: plan.children,
      ownProps: plan.ownProps,
      unions: plan.unions,
      resetCount: resets.length,
    };
  }
  return { model, resets };
}

/** The React-shell or wrapper description, or null after reporting every DS-E085/DS-E086 for the component. */
export function componentModel(
  ir: DesignIR,
  component: ComponentIR,
  catalog: MuiCatalog | null,
  diag: Diagnostics,
): MuiComponentModel | null {
  return buildComponentModel(ir, component, catalog, diag)?.model ?? null;
}

/**
 * The base root rule becomes `styleOverrides.root`; every other rule, in the
 * IR's canonical order, becomes one variant keyed by `specificityKey`, so
 * Emotion resolves the cascade exactly as the CSS target does. Ignored
 * properties are dropped, and a rule left empty by that is skipped. For a
 * mapped component, the resets (already computed by `buildComponentModel`)
 * precede the design system's own variants and `defaultProps` is set.
 */
function componentTheme(
  ir: DesignIR,
  component: ComponentIR,
  model: MuiComponentModel,
  resets: MuiVariant[],
): MuiComponentTheme {
  const ignored = ignoredForMui(component);
  const axisOrder = component.axisOrder;
  let root: MuiDeclarations = {};
  const variants: MuiVariant[] = [];
  for (const rule of component.rules) {
    const props = Object.keys(rule.declarations)
      .filter((p) => !ignored.has(p))
      .sort(codeUnitCompare);
    if (props.length === 0) {
      continue;
    }
    const decls: MuiDeclarations = Object.fromEntries(
      props.map((p) => [muiPropertyKey(p), muiValue(ir, rule.declarations[p])]),
    );
    const axesCount = Object.keys(rule.axes).length;
    if (rule.slot === 'root' && axesCount === 0 && rule.states.length === 0) {
      root = decls;
      continue;
    }
    const variantProps = Object.fromEntries(
      axisOrder
        .filter((a) => Object.hasOwn(rule.axes, a))
        .map((a) => [
          model.mapped ? model.mapped.axisMap[a] : propNameFor(a),
          rule.axes[a],
        ]),
    );
    const key = specificityKey(
      axesCount,
      rule.states,
      model.rootElement,
      rule.slot === 'root' ? null : model.slots[rule.slot].className,
    );
    variants.push({ props: variantProps, style: { [key]: decls } });
  }
  if (model.mapped) {
    return {
      defaultProps: model.mapped.defaultProps,
      styleOverrides: { root },
      variants: [...resets, ...variants],
    };
  }
  return { styleOverrides: { root }, variants };
}

/**
 * Builds the model, reporting DS-E084 (configuration MUI cannot express) and
 * DS-E085/DS-E086 (a component or its mapping a React shell cannot express)
 * on `diag`. Returns null when it reported anything.
 */
export function buildMuiModel(
  ir: DesignIR,
  catalog: MuiCatalog | null,
  ctx: PluginContext,
  diag: Diagnostics,
): MuiModel | null {
  const before = diag.errors.length;
  const prefix = ir.meta.prefix;
  const selector = colorSchemeSelectorFor(ir.meta.modeSelector);
  if (selector === null) {
    diag.add(
      'DS-E084',
      `mui: modeSelector "${ir.meta.modeSelector}" cannot be expressed as an MUI colorSchemeSelector`,
      { file: 'ds.config.json', line: 1, column: 1 },
    );
  }
  // MUI's `createTheme` seeds only the `light` and `dark` color schemes; any
  // other scheme name throws at runtime (`Cannot use 'in' operator to search
  // for 'defaultChannel'`), so a design system with a differently named mode
  // cannot be expressed at all.
  for (const mode of ir.meta.modes) {
    if (mode !== 'light' && mode !== 'dark') {
      diag.add(
        'DS-E084',
        `mui: mode "${mode}" cannot be expressed; MUI color schemes are "light" and "dark"`,
        { file: 'ds.config.json', line: 1, column: 1 },
      );
    }
  }
  const themeOptions: MuiThemeOptions = {
    cssVariables: { cssVarPrefix: prefix, colorSchemeSelector: selector ?? '' },
    defaultColorScheme: ir.meta.defaultMode,
    colorSchemes: Object.fromEntries(
      ir.meta.modes.map((m) => [
        m,
        { palette: { tokens: {} as Record<string, string> } },
      ]),
    ),
    tokens: {},
    components: {},
  };
  const refName = (id: TokenId): string => muiVarName(prefix, ir.tokens[id]);
  const byCategory = new Map<string, Record<string, string>>();
  for (const id of Object.keys(ir.tokens).sort(codeUnitCompare)) {
    const token = ir.tokens[id];
    const key = token.path.join('-');
    if (token.category === 'color') {
      for (const mode of ir.meta.modes) {
        themeOptions.colorSchemes[mode].palette.tokens[key] = tokenText(
          token,
          mode,
          refName,
        );
      }
    } else if (!token.modeInvariant) {
      diag.add(
        'DS-E084',
        `mui: "${token.cssName}" varies by mode; MUI can only vary color tokens per color scheme`,
        token.source,
      );
    } else {
      const category = camelCategory(token.category);
      const bucket = byCategory.get(category) ?? {};
      byCategory.set(category, bucket);
      bucket[key] = tokenText(token, ir.meta.defaultMode, refName);
    }
  }
  for (const category of [...byCategory.keys()].sort(codeUnitCompare)) {
    themeOptions.tokens[category] = byCategory.get(category)!;
  }
  const components: Record<string, MuiComponentModel> = {};
  // Tracks which design-system component first claimed each theme key, so a
  // second component mapped onto the same MUI component (two components
  // both writing `theme.components.MuiButton`) is rejected instead of
  // silently overwriting the first one's theme entry.
  const themeKeyOwners = new Map<string, string>();
  for (const name of Object.keys(ir.components).sort(codeUnitCompare)) {
    const component = ir.components[name];
    if (!isMappedForMui(component)) {
      continue;
    }
    const built = buildComponentModel(ir, component, catalog, diag);
    if (!built) {
      continue;
    }
    const { model, resets } = built;
    if (model.mapped) {
      const owner = themeKeyOwners.get(model.themeKey);
      if (owner !== undefined) {
        diag.add(
          'DS-E085',
          `mui: ${name}: ${model.mapped.component} is already mapped by "${owner}"; one design-system component per MUI component`,
          manifestLocation(component),
        );
        continue;
      }
    }
    themeKeyOwners.set(model.themeKey, name);
    themeOptions.components[model.themeKey] = componentTheme(
      ir,
      component,
      model,
      resets,
    );
    components[name] = model;
  }
  if (diag.errors.length > before) {
    return null;
  }
  return {
    generated: muiHeaderText(ir, ctx),
    prefix,
    framework: {
      name: MUI_PACKAGE,
      range: MUI_RANGE,
      version: catalog?.framework.version ?? null,
    },
    themeOptions,
    components,
  };
}
