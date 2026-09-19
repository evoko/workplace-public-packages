import { codeUnitCompare } from '../../sources.js';
import type { MuiComponentModel, MuiMappedModel, MuiModel } from './model.js';
import { camelCase, pascalCase } from './names.js';
import {
  muiHeader,
  quoteTs,
  themeFactoryName,
  themeOptionsName,
} from './render-ts.js';

function union(values: readonly string[]): string {
  return values.map(quoteTs).join(' | ');
}

/** `Chip` to `chipClasses`. */
function classesName(c: MuiComponentModel): string {
  return `${camelCase(
    c.exportName
      .replace(/([A-Z])/g, '-$1')
      .toLowerCase()
      .replace(/^-/, ''),
  )}Classes`;
}

function attributeJsx(prop: string, attribute: string): string {
  return attribute === 'disabled'
    ? `${attribute}={${prop}}`
    : `${attribute}={${prop} ? true : undefined}`;
}

/**
 * MUI own props that are also plain DOM attributes of the wrapped element
 * with the same meaning, so the wrapper leaves them as ordinary DOM props
 * (forwarded through `{...other}`) instead of blocking a native attribute
 * merely because MUI redeclares it. `href` is not here: setting it changes
 * MUI's rendered root element from `button` to `a`, which the wrapper's
 * typed contract (fixed to `c.rootElement`) does not account for.
 */
const DOM_PASSTHROUGH_PROPS: ReadonlySet<string> = new Set([
  'tabIndex',
  'type',
]);

export function renderComponentTsx(
  model: MuiModel,
  c: MuiComponentModel,
): string {
  return c.mapped
    ? renderMappedComponentTsx(model, c)
    : renderOwnComponentTsx(model, c);
}

/**
 * One React component per design-system component. The shell carries no
 * styles: `styled` looks them up in `theme.components.<ThemeKey>` through
 * `overridesResolver` and matches `variants` against `ownerState`.
 */
export function renderOwnComponentTsx(
  model: MuiModel,
  c: MuiComponentModel,
): string {
  const P = c.exportName;
  const classes = classesName(c);
  const axisNames = Object.keys(c.axes);
  const axisProps = axisNames.map((a) => c.axes[a].prop);
  const slotNames = Object.keys(c.slots);
  const slotProps = slotNames.filter((s) => s !== c.childrenSlot);
  // React prop names are the camelCase form of the manifest names (`icon-position` -> `iconPosition`).
  // State *attributes* (e.g. `aria-disabled`) are included too, even when
  // they differ from the prop name, so a consumer cannot pass the DOM
  // attribute the component itself sets; a Set dedupes the common case where
  // the attribute equals the prop (`disabled`).
  const owned = [
    ...new Set([
      'children',
      ...axisProps,
      ...c.stateProps.map((p) => p.prop),
      ...c.stateProps.map((p) => p.attribute),
      ...slotProps.map((s) => c.slots[s].prop),
    ]),
  ].sort(codeUnitCompare);

  const lines: string[] = [
    muiHeader(model),
    '',
    "import * as React from 'react';",
    "import { styled, useThemeProps } from '@mui/material/styles';",
    '',
  ];
  for (const axis of axisNames) {
    lines.push(
      `export type ${P}${pascalCase(axis)} = ${union(c.axes[axis].values)};`,
    );
  }
  if (axisNames.length > 0) {
    lines.push('', `export interface ${P}OwnerState {`);
    for (const axis of axisNames) {
      lines.push(`  ${c.axes[axis].prop}: ${P}${pascalCase(axis)};`);
    }
    lines.push('}');
  } else {
    lines.push(`export type ${P}OwnerState = Record<never, never>;`);
  }
  lines.push(
    '',
    `export interface ${P}Props`,
    `  extends Omit<React.ComponentPropsWithoutRef<'${c.rootElement}'>, ${union(owned)}> {`,
  );
  for (const axis of axisNames) {
    lines.push(
      `  /** Axis \`${axis}\`; default \`${c.axes[axis].default}\`. */`,
      `  ${c.axes[axis].prop}?: ${P}${pascalCase(axis)};`,
    );
  }
  for (const state of c.stateProps) {
    lines.push(
      `  /** State \`${state.state}\`; rendered as the \`${state.attribute}\` attribute. */`,
      `  ${state.prop}?: boolean;`,
    );
  }
  lines.push(
    c.childrenSlot
      ? `  /** Slot \`${c.childrenSlot}\`. */`
      : '  /** Content of the root element. */',
    '  children?: React.ReactNode;',
  );
  for (const slot of slotProps) {
    lines.push(
      `  /** Slot \`${slot}\`${c.slots[slot].optional ? ' (optional)' : ''}. */`,
      `  ${c.slots[slot].prop}?: React.ReactNode;`,
    );
  }
  // classes are keyed by prop name so `classes.subTitle` is valid member access
  lines.push(
    '}',
    '',
    `export const ${classes} = {`,
    `  root: '${c.themeKey}-root',`,
  );
  for (const slot of slotNames) {
    lines.push(`  ${c.slots[slot].prop}: '${c.slots[slot].className}',`);
  }
  lines.push(
    '} as const;',
    '',
    `const ${P}Root = styled('${c.rootElement}', {`,
    `  name: '${c.themeKey}',`,
    "  slot: 'Root',",
    '  overridesResolver: (_props, styles) => styles.root,',
    `})<{ ownerState: ${P}OwnerState }>({});`,
    '',
    `export const ${P} = React.forwardRef<React.ComponentRef<'${c.rootElement}'>, ${P}Props>(`,
    `  function ${P}(inProps, ref) {`,
    `    const props = useThemeProps({ props: inProps, name: '${c.themeKey}' });`,
  );
  const destructured = [
    ...axisNames.map(
      (a) => `${c.axes[a].prop} = ${quoteTs(c.axes[a].default)}`,
    ),
    ...c.stateProps.map((p) => `${p.prop} = false`),
    'children',
    ...slotProps.map((s) => c.slots[s].prop),
    'className',
    '...other',
  ];
  lines.push(
    `    const { ${destructured.join(', ')} } = props;`,
    `    const ownerState: ${P}OwnerState = ${axisProps.length === 0 ? '{}' : `{ ${axisProps.join(', ')} }`};`,
    '    return (',
    `      <${P}Root`,
    '        ref={ref}',
    '        ownerState={ownerState}',
    `        className={className ? \`\${${classes}.root} \${className}\` : ${classes}.root}`,
    '        {...other}',
  );
  // Emitted after `{...other}` so the component's own state always wins over
  // whatever the spread forwards.
  for (const state of c.stateProps) {
    lines.push(`        ${attributeJsx(state.prop, state.attribute)}`);
  }
  lines.push('      >');
  if (c.childrenSlot === null) {
    lines.push('        {children}');
  }
  for (const slot of slotNames) {
    const { element, prop } = c.slots[slot];
    if (slot === c.childrenSlot) {
      lines.push(
        `        <${element} className={${classes}.${prop}}>{children}</${element}>`,
      );
    } else {
      lines.push(
        `        {${prop} === undefined ? null : <${element} className={${classes}.${prop}}>{${prop}}</${element}>}`,
      );
    }
  }
  lines.push(`      </${P}Root>`, '    );', '  },', ');', '');
  return lines.join('\n');
}

/**
 * A mapped component is MUI's component with the design system's props:
 * axis props (exact unions) under their design-system names, forwarded to
 * the MUI props they map to; `disabled` to MUI's prop; ARIA states as
 * attributes after the spread; slots under their design-system names,
 * forwarded to MUI's slot props; children per the mapping's children mode.
 * Every MUI own prop is removed from the accepted DOM props, so MUI-only
 * props (`sx`, `fullWidth`, …) are type errors.
 */
export function renderMappedComponentTsx(
  model: MuiModel,
  c: MuiComponentModel,
): string {
  const m = c.mapped!;
  const P = c.exportName;
  const Mui = `Mui${m.component}`;
  const classes = classesName(c);
  const axisNames = Object.keys(c.axes);
  const slotNames = Object.keys(c.slots);
  const slotProps = slotNames.filter((s) => s !== c.childrenSlot);
  const hasChildren = m.children.kind !== 'none';
  const owned = [
    ...new Set([
      'children',
      ...axisNames.map((a) => c.axes[a].prop),
      ...c.stateProps.map((p) => p.prop),
      ...c.stateProps.map((p) => p.attribute),
      ...slotProps.map((s) => c.slots[s].prop),
      ...m.ownProps.filter((p) => !DOM_PASSTHROUGH_PROPS.has(p)),
    ]),
  ].sort(codeUnitCompare);

  const lines: string[] = [
    muiHeader(model),
    '',
    "import * as React from 'react';",
    // A named barrel import, not `import Mui${component} from
    // '@mui/material/${component}'`: MUI's default export interacts badly
    // with Node's ESM->CJS interop under `require()` (the CJS bundle would
    // get the whole module object back as "the component" instead of the
    // component itself, crashing at render time), while the barrel
    // (`@mui/material`) is a plain named export in both module systems and
    // MUI ships it with `sideEffects: false` so bundlers still tree-shake it.
    `import { ${m.component} as ${Mui} } from '@mui/material';`,
    "import '../augmentation.js';",
    '',
  ];
  for (const axis of axisNames) {
    lines.push(
      `export type ${P}${pascalCase(axis)} = ${union(c.axes[axis].values)};`,
    );
  }
  if (axisNames.length > 0) {
    lines.push('');
  }
  lines.push(
    `export interface ${P}Props`,
    `  extends Omit<React.ComponentPropsWithoutRef<'${c.rootElement}'>, ${union(owned)}> {`,
  );
  for (const axis of axisNames) {
    lines.push(
      `  /** Axis \`${axis}\`; default \`${c.axes[axis].default}\`. MUI prop \`${m.axisMap[axis]}\`. */`,
      `  ${c.axes[axis].prop}?: ${P}${pascalCase(axis)};`,
    );
  }
  for (const state of c.stateProps) {
    lines.push(
      state.state === 'disabled'
        ? "  /** State `disabled`; MUI's `disabled` prop. */"
        : `  /** State \`${state.state}\`; rendered as the \`${state.attribute}\` attribute. */`,
      `  ${state.prop}?: boolean;`,
    );
  }
  if (hasChildren) {
    lines.push(
      m.children.kind === 'slot'
        ? `  /** Slot \`${m.children.slot}\`; MUI prop \`${m.children.muiProp}\`. */`
        : '  /** Content of the root element. */',
      '  children?: React.ReactNode;',
    );
  }
  for (const slot of slotProps) {
    lines.push(
      `  /** Slot \`${slot}\`${c.slots[slot].optional ? ' (optional)' : ''}; MUI slot \`${m.slotMap[slot]}\`. */`,
      `  ${c.slots[slot].prop}?: React.ReactNode;`,
    );
  }
  lines.push(
    '}',
    '',
    `export const ${classes} = {`,
    `  root: '${m.component === '' ? '' : `Mui${m.component}-root`}',`,
  );
  for (const slot of slotNames) {
    lines.push(`  ${c.slots[slot].prop}: '${c.slots[slot].className}',`);
  }
  lines.push(
    '} as const;',
    '',
    `/** MUI's \`${m.component}\` with the design system's props; \`theme.components.${c.themeKey}\` carries the styles. */`,
    `export const ${P} = React.forwardRef<React.ComponentRef<'${c.rootElement}'>, ${P}Props>(`,
    `  function ${P}(props, ref) {`,
  );
  const destructured = [
    ...axisNames.map(
      (a) => `${c.axes[a].prop} = ${quoteTs(c.axes[a].default)}`,
    ),
    ...c.stateProps.map((p) => `${p.prop} = false`),
    ...(hasChildren ? ['children'] : []),
    ...slotProps.map((s) => c.slots[s].prop),
    '...other',
  ];
  lines.push(
    `    const { ${destructured.join(', ')} } = props;`,
    '    return (',
    `      <${Mui}`,
    '        ref={ref}',
  );
  for (const axis of axisNames) {
    lines.push(`        ${m.axisMap[axis]}={${c.axes[axis].prop}}`);
  }
  for (const slot of slotProps) {
    lines.push(`        ${m.slotMap[slot]}={${c.slots[slot].prop}}`);
  }
  if (m.children.kind === 'slot') {
    lines.push(`        ${m.children.muiProp}={children}`);
  }
  lines.push('        {...other}');
  // Emitted after `{...other}`, like the own-component path, so the
  // component's own state always wins over whatever the spread forwards.
  for (const state of c.stateProps) {
    lines.push(
      state.state === 'disabled'
        ? `        disabled={${state.prop}}`
        : `        ${state.attribute}={${state.prop} ? true : undefined}`,
    );
  }
  if (m.children.kind === 'children') {
    lines.push('      >', '        {children}', `      </${Mui}>`);
  } else {
    lines.push('      />');
  }
  lines.push('    );', '  },', ');', '');
  return lines.join('\n');
}

export function renderComponentsIndex(model: MuiModel): string {
  const names = Object.values(model.components)
    .map((c) => c.exportName)
    .sort(codeUnitCompare);
  const body =
    names.length === 0
      ? ['export {};']
      : names.map((n) => `export * from './${n}.js';`);
  return [muiHeader(model), '', ...body, ''].join('\n');
}

export function renderIndexTs(model: MuiModel): string {
  return [
    muiHeader(model),
    '',
    "import './augmentation.js';",
    "export * from './components/index.js';",
    `export { ${themeFactoryName(model)}, ${themeOptionsName(model)} } from './theme.js';`,
    '',
  ].join('\n');
}

/** `Chip` to `chip` (the variable stem used by the probe). */
function variableStem(exportName: string): string {
  return exportName[0].toLowerCase() + exportName.slice(1);
}

/**
 * `typecheck.tsx`: compiled by the package's `tsc --noEmit`, never bundled.
 * One accepted usage per component with every axis at a non-default value,
 * every state prop, and every slot; one `@ts-expect-error` per axis with a
 * value outside the manifest; one for an unknown prop. This is how the 1:1
 * typing is verified, not just asserted.
 */
export function renderTypecheckTsx(model: MuiModel): string {
  const components = Object.values(model.components).sort((a, b) =>
    codeUnitCompare(a.exportName, b.exportName),
  );
  const lines: string[] = [
    muiHeader(model),
    '',
    '/* Type-level parity check. Each component accepts exactly the design',
    "   system's axis values, states, and slots; anything else is a type error. */",
  ];
  if (components.length === 0) {
    lines.push('', 'export {};', '');
    return lines.join('\n');
  }
  const mappedComponents = [
    ...new Set(
      components.filter((c) => c.mapped).map((c) => c.mapped!.component),
    ),
  ].sort(codeUnitCompare);
  for (const mc of mappedComponents) {
    // Named barrel import for the same reason as the wrapper component
    // itself (see `renderMappedComponentTsx`): avoids the CJS interop trap
    // of a default export from a deep MUI import.
    lines.push(`import { ${mc} as Mui${mc} } from '@mui/material';`);
  }
  lines.push(
    // No `import * as React from 'react'`: the package uses the react-jsx
    // transform, so plain JSX needs no React identifier in scope.
    `import { ${components.map((c) => c.exportName).join(', ')} } from './components/index.js';`,
    '',
  );
  for (const c of components) {
    const stem = variableStem(c.exportName);
    const attrs = [
      ...Object.entries(c.axes).map(([, def]) => {
        const value = def.values.find((v) => v !== def.default) ?? def.default;
        return `${def.prop}="${value}"`;
      }),
      ...c.stateProps.map((p) => p.prop),
      ...Object.keys(c.slots)
        .filter((s) => s !== c.childrenSlot)
        .map((s) => `${c.slots[s].prop}="${s}"`),
    ];
    const open =
      attrs.length > 0
        ? `<${c.exportName} ${attrs.join(' ')}>`
        : `<${c.exportName}>`;
    lines.push(
      `export const ${stem}Accepted = (`,
      `  ${open}`,
      '    content',
      `  </${c.exportName}>`,
      ');',
    );
    for (const axis of Object.keys(c.axes)) {
      lines.push(
        `// @ts-expect-error ${axis} accepts only the design system values`,
        `export const ${stem}Rejected${pascalCase(axis)} = <${c.exportName} ${c.axes[axis].prop}="__not_a_value__" />;`,
      );
    }
    if (c.mapped) {
      lines.push(...mappedTypecheckProbes(stem, c, c.mapped));
    } else {
      lines.push(
        '// @ts-expect-error unknown props are rejected',
        `export const ${stem}RejectedProp = <${c.exportName} notAProp="x" />;`,
        '',
      );
    }
  }
  return lines.join('\n');
}

/**
 * A member of a union's `defaults` (MUI's own members) that is not among the
 * design system's values for it, picked deterministically since the model
 * does not carry MUI's single current default (only the full member list).
 */
function sortedCandidate(candidates: readonly string[]): string {
  return [...candidates].sort((a, b) => codeUnitCompare(b, a))[0];
}

interface QualifyingAxis {
  axis: string;
  muiProp: string;
  value: string;
}

/**
 * The extra probes for a mapped component: the wrapper rejects a plain MUI
 * value outside its axis prop's union and a real MUI-only prop; the raw MUI
 * component (augmented) rejects the same disabled value and every default of
 * an overridable prop no axis maps to, and accepts one design-system value.
 */
function mappedTypecheckProbes(
  stem: string,
  c: MuiComponentModel,
  m: MuiMappedModel,
): string[] {
  const out: string[] = [];
  const Mui = `Mui${m.component}`;
  const qualifying: QualifyingAxis[] = [];
  for (const axis of Object.keys(c.axes)) {
    const muiProp = m.axisMap[axis];
    const union = m.unions[muiProp];
    const candidates = union.defaults.filter((d) => !union.values.includes(d));
    if (candidates.length > 0) {
      qualifying.push({ axis, muiProp, value: sortedCandidate(candidates) });
    }
  }
  for (const { axis, value } of qualifying) {
    out.push(
      `// @ts-expect-error ${axis} rejects MUI's default "${value}"`,
      `export const ${stem}Rejected${pascalCase(axis)}Default = <${c.exportName} ${c.axes[axis].prop}="${value}" />;`,
    );
  }
  const accepted = new Set([
    ...Object.values(m.axisMap),
    ...Object.values(m.slotMap),
    'disabled',
    'children',
  ]);
  const rejectedOwnProp = m.ownProps.find((p) => !accepted.has(p));
  if (rejectedOwnProp !== undefined) {
    out.push(
      '// @ts-expect-error MUI-only props are rejected on the wrapper',
      `export const ${stem}RejectedMuiProp = <${c.exportName} ${rejectedOwnProp}={undefined} />;`,
    );
  }
  for (const { muiProp, value } of qualifying) {
    out.push(
      `// @ts-expect-error the augmentation narrows MUI's own ${m.component}: "${value}" is disabled`,
      `export const ${stem}MuiRejected${pascalCase(muiProp)} = <${Mui} ${muiProp}="${value}" />;`,
    );
  }
  if (qualifying.length > 0) {
    const { axis, muiProp } = qualifying[0];
    const def = c.axes[axis];
    const dsValue = def.values.find((v) => v !== def.default) ?? def.default;
    out.push(
      `export const ${stem}MuiAccepted = <${Mui} ${muiProp}="${dsValue}" />;`,
    );
  }
  for (const prop of Object.keys(m.unions).sort(codeUnitCompare)) {
    const union = m.unions[prop];
    if (union.values.length > 0 || union.defaults.length === 0) {
      continue;
    }
    const value = sortedCandidate(union.defaults);
    out.push(
      `// @ts-expect-error ${prop} has no design-system values, so it accepts nothing`,
      `export const ${stem}MuiRejected${pascalCase(prop)} = <${Mui} ${prop}="${value}" />;`,
    );
  }
  out.push('');
  return out;
}
