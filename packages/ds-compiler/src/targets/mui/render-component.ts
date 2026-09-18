import { codeUnitCompare } from '../../sources.js';
import type { MuiComponentModel, MuiModel } from './model.js';
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
 * One React component per design-system component. The shell carries no
 * styles: `styled` looks them up in `theme.components.<ThemeKey>` through
 * `overridesResolver` and matches `variants` against `ownerState`.
 */
export function renderComponentTsx(
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
    lines.push(
      '// @ts-expect-error unknown props are rejected',
      `export const ${stem}RejectedProp = <${c.exportName} notAProp="x" />;`,
      '',
    );
  }
  return lines.join('\n');
}
