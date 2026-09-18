import type { Diagnostics, SourceLocation } from '../../errors.js';
import type { ComponentIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { MuiFrameworkComponent } from './catalog.js';
import type { MuiMappingHints, MuiScalar } from './hints.js';
import { muiThemeKeyFor } from './names.js';

/**
 * Set on every mapped component that has the prop: ripples add DOM and
 * animation the design system does not have; elevation adds shadows.
 */
export const PARITY_DEFAULT_PROPS: Readonly<Record<string, boolean>> = {
  disableElevation: true,
  disableFocusRipple: true,
  disableRipple: true,
  disableTouchRipple: true,
  focusRipple: false,
};

/** Props a `defaultProps` entry may never target, regardless of the component. */
const RESERVED_DEFAULT_PROPS: ReadonlySet<string> = new Set([
  'sx',
  'classes',
  'className',
  'style',
  'ref',
  'key',
  'component',
  'slots',
  'slotProps',
]);

const SCALAR_TYPE_PATTERNS: Record<'string' | 'number' | 'boolean', RegExp> = {
  string: /\bstring\b/,
  number: /\bnumber\b/,
  boolean: /\bboolean\b/,
};

export type ChildrenMode =
  | { kind: 'children' }
  | { kind: 'slot'; slot: string; muiProp: string }
  | { kind: 'none' };

export interface MappingUnion {
  overrides: string;
  /** MUI's default members. */
  defaults: string[];
  /** The design-system values mapped onto this prop, or [] when no axis maps to it. */
  values: string[];
}

export interface MappingPlan {
  component: string;
  themeKey: string;
  rootElement: string;
  /** Axis → MUI prop, in manifest axis order. */
  axisMap: Record<string, string>;
  /** Non-root slot → MUI class key (also the MUI prop that fills it), in manifest slot order. */
  slotMap: Record<string, string>;
  /** Non-root slot → the class MUI puts on that element (`MuiButton-startIcon`). */
  slotClasses: Record<string, string>;
  /** Parity props, axis defaults under their MUI prop names, then the manifest's defaultProps; keys sorted. */
  defaultProps: Record<string, MuiScalar>;
  children: ChildrenMode;
  /** Every own prop name of the MUI component, sorted. */
  ownProps: string[];
  /** Every overridable union prop of the MUI component by prop name, sorted. */
  unions: Record<string, MappingUnion>;
}

export function manifestLocation(component: ComponentIR): SourceLocation {
  return {
    file: `src/components/${component.name}/${component.name}.manifest.json`,
    line: 1,
    column: 1,
  };
}

/** Validates the manifest's mapping against the catalog's facts about the MUI component. Null after reporting every problem. */
export function planMapping(
  component: ComponentIR,
  hints: MuiMappingHints,
  framework: MuiFrameworkComponent,
  diag: Diagnostics,
): MappingPlan | null {
  const before = diag.errors.length;
  const at = manifestLocation(component);
  const fail = (message: string): void => {
    diag.add('DS-E085', `mui: ${component.name}: ${message}`, at);
  };
  const unionProps = Object.keys(framework.props)
    .filter((p) => framework.props[p].kind === 'union')
    .sort(codeUnitCompare);
  // A slot target must be an element slot MUI actually renders content into:
  // its class key must also be a prop, and that prop's type must accept a
  // node, not merely share a name with a class key (`disabled`'s class is
  // `Mui-disabled`, but `disabled` is a boolean prop, not a slot).
  const slotKeys = Object.keys(framework.classes)
    .filter((k) => k !== 'root')
    .filter((k) => {
      const prop = framework.props[k];
      return prop !== undefined && /React(?:Node|Element)/.test(prop.type);
    })
    .sort(codeUnitCompare);

  const axisMap: Record<string, string> = {};
  for (const axis of component.axisOrder) {
    const prop = hints.axisMap[axis];
    if (prop === undefined) {
      fail(
        `axis "${axis}" has no axisMap entry; ${hints.component} exposes ${unionProps.join(', ') || 'no overridable props'}`,
      );
      continue;
    }
    if (!unionProps.includes(prop)) {
      fail(
        `axisMap.${axis}: "${prop}" is not an overridable prop of ${hints.component} (${unionProps.join(', ') || 'none'})`,
      );
      continue;
    }
    axisMap[axis] = prop;
  }
  for (const axis of Object.keys(hints.axisMap)) {
    if (!Object.hasOwn(component.axes, axis)) {
      fail(`axisMap.${axis}: the manifest has no axis "${axis}"`);
    }
  }
  const axisTargets = Object.values(axisMap);
  for (const prop of new Set(axisTargets)) {
    if (axisTargets.filter((p) => p === prop).length > 1) {
      fail(`axisMap maps more than one axis onto "${prop}"`);
    }
  }

  const slotMap: Record<string, string> = {};
  const slotClasses: Record<string, string> = {};
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  for (const slot of nonRoot) {
    const key = hints.slotMap[slot];
    if (key === undefined) {
      fail(
        `slot "${slot}" has no slotMap entry; ${hints.component} renders ${slotKeys.join(', ') || 'no slots'}`,
      );
      continue;
    }
    if (!slotKeys.includes(key)) {
      fail(
        `slotMap.${slot}: "${key}" is not a slot of ${hints.component} (${slotKeys.join(', ') || 'none'})`,
      );
      continue;
    }
    slotMap[slot] = key;
    slotClasses[slot] = framework.classes[key];
  }
  for (const slot of Object.keys(hints.slotMap)) {
    if (slot === 'root' || !Object.hasOwn(component.slots, slot)) {
      fail(`slotMap.${slot}: the manifest has no slot "${slot}"`);
    }
  }
  const slotTargets = Object.values(slotMap);
  for (const key of new Set(slotTargets)) {
    if (slotTargets.filter((k) => k === key).length > 1) {
      fail(`slotMap maps more than one slot onto "${key}"`);
    }
  }

  const rootElement = component.slots.root?.element ?? 'div';
  if (rootElement !== framework.rootElement) {
    fail(
      `root element is "${rootElement}" but ${hints.component} renders "${framework.rootElement}"`,
    );
  }

  // Other states are checked once, for both kinds, in componentModel.
  if (
    component.states.includes('disabled') &&
    !Object.hasOwn(framework.props, 'disabled')
  ) {
    fail(
      `state "disabled" needs a disabled prop, which ${hints.component} lacks`,
    );
  }

  for (const [key, value] of Object.entries(hints.defaultProps)) {
    if (Object.hasOwn(PARITY_DEFAULT_PROPS, key)) {
      fail(
        `defaultProps.${key} is set by the compiler for parity and cannot be overridden`,
      );
    } else if (!Object.hasOwn(framework.props, key)) {
      fail(`defaultProps.${key}: ${hints.component} has no prop "${key}"`);
    } else if (axisTargets.includes(key) || slotTargets.includes(key)) {
      fail(`defaultProps.${key} is already mapped from an axis or a slot`);
    } else if (key === 'children') {
      fail('defaultProps.children is not allowed');
    } else if (RESERVED_DEFAULT_PROPS.has(key)) {
      fail(`defaultProps.${key} is not allowed`);
    } else if (framework.props[key].kind === 'union') {
      // Unmapped union props become `never` in the augmentation, so a
      // default value for one is unreachable; a mapped one is already
      // rejected above as "already mapped from an axis".
      fail(
        `defaultProps.${key}: "${key}" is an overridable prop; map an axis onto it instead`,
      );
    } else {
      const kind = typeof value as 'string' | 'number' | 'boolean';
      const type = framework.props[key].type;
      // A string also fits a plain string-literal union (`'submit' |
      // 'reset' | 'button'`) when the value is one of its quoted members,
      // even though the type text never contains the word "string".
      const fits =
        kind === 'string'
          ? SCALAR_TYPE_PATTERNS.string.test(type) ||
            type.includes(`'${value as string}'`)
          : SCALAR_TYPE_PATTERNS[kind].test(type);
      if (!fits) {
        fail(`defaultProps.${key}: a ${kind} does not fit "${type}"`);
      }
    }
  }

  let children: ChildrenMode = { kind: 'none' };
  if (nonRoot.includes('label') && slotMap.label !== undefined) {
    children = { kind: 'slot', slot: 'label', muiProp: slotMap.label };
  } else if (
    Object.hasOwn(framework.props, 'children') &&
    /ReactNode/.test(framework.props.children.type)
  ) {
    children = { kind: 'children' };
  }

  if (diag.errors.length > before) {
    return null;
  }

  const defaultProps: Record<string, MuiScalar> = {};
  for (const [key, value] of Object.entries(PARITY_DEFAULT_PROPS)) {
    if (Object.hasOwn(framework.props, key)) {
      defaultProps[key] = value;
    }
  }
  for (const axis of component.axisOrder) {
    defaultProps[axisMap[axis]] = component.axes[axis].default;
  }
  Object.assign(defaultProps, hints.defaultProps);
  const sortedDefaults = Object.fromEntries(
    Object.keys(defaultProps)
      .sort(codeUnitCompare)
      .map((k) => [k, defaultProps[k]]),
  );

  const unions: Record<string, MappingUnion> = {};
  for (const prop of unionProps) {
    const spec = framework.props[prop];
    const axis = component.axisOrder.find((a) => axisMap[a] === prop);
    unions[prop] = {
      overrides: spec.overrides ?? '',
      defaults: [...(spec.values ?? [])],
      values: axis ? [...component.axes[axis].values] : [],
    };
  }

  return {
    component: hints.component,
    themeKey: muiThemeKeyFor(hints.component),
    rootElement,
    axisMap,
    slotMap,
    slotClasses,
    defaultProps: sortedDefaults,
    children,
    ownProps: Object.keys(framework.props).sort(codeUnitCompare),
    unions,
  };
}
