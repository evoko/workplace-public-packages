import { codeUnitCompare } from '../../sources.js';
import type { MuiComponentModel, MuiModel } from './model.js';
import { camelCase, pascalCase } from './names.js';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export function quoteTs(text: string): string {
  return `'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

function renderKey(key: string): string {
  return IDENTIFIER.test(key) ? key : quoteTs(key);
}

/**
 * A TypeScript object literal for JSON-compatible data, two-space indented,
 * trailing commas, keys in insertion order (the model's order is the cascade
 * order, so it must survive). Evaluating the text yields the input again.
 */
export function renderTsLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const inner = '  '.repeat(indent + 1);
  if (typeof value === 'string') {
    return quoteTs(value);
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]';
    }
    const items = value.map(
      (v) => `${inner}${renderTsLiteral(v, indent + 1)},`,
    );
    return `[\n${items.join('\n')}\n${pad}]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return '{}';
    }
    const lines = entries.map(
      ([k, v]) => `${inner}${renderKey(k)}: ${renderTsLiteral(v, indent + 1)},`,
    );
    return `{\n${lines.join('\n')}\n${pad}}`;
  }
  throw new Error(`cannot render a ${typeof value} as a TypeScript literal`);
}

export function muiHeader(model: MuiModel): string {
  return `// ${model.generated}`;
}

export function themeOptionsName(model: MuiModel): string {
  return `${camelCase(model.prefix)}ThemeOptions`;
}

export function themeFactoryName(model: MuiModel): string {
  return `create${pascalCase(model.prefix)}Theme`;
}

/** `theme.model.json`: the model as pretty JSON, `generated` first. */
export function renderModelJson(model: MuiModel): string {
  return `${JSON.stringify(model, null, 2)}\n`;
}

export function renderThemeTs(model: MuiModel): string {
  const options = themeOptionsName(model);
  return [
    muiHeader(model),
    '',
    "import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';",
    "import './augmentation.js';",
    '',
    '/** Theme options rendered from theme.model.json; the package test asserts the two are deep-equal. */',
    `export const ${options} = ${renderTsLiteral(model.themeOptions)} satisfies ThemeOptions;`,
    '',
    "/** The design system's MUI theme. `options` are deep-merged into the design system's options before the theme is created; arrays such as `components.<Key>.variants` are replaced, not merged. */",
    `export function ${themeFactoryName(model)}(options: ThemeOptions = {}): Theme {`,
    `  return createTheme(${options}, options);`,
    '}',
    '',
  ].join('\n');
}

function union(keys: readonly string[]): string {
  return keys.length === 0 ? 'never' : keys.map(quoteTs).join(' | ');
}

export function renderAugmentationTs(model: MuiModel): string {
  const { themeOptions } = model;
  const components = Object.values(model.components);
  const ownComponents = components.filter((c) => !c.mapped);
  const colorKeys = Object.keys(
    themeOptions.colorSchemes[themeOptions.defaultColorScheme]?.palette
      .tokens ?? {},
  ).sort(codeUnitCompare);
  const categories = Object.keys(themeOptions.tokens);

  const lines: string[] = [muiHeader(model), ''];
  if (ownComponents.length > 0) {
    lines.push(
      "import type { ComponentsOverrides, ComponentsProps, ComponentsVariants } from '@mui/material/styles';",
    );
    for (const c of ownComponents) {
      lines.push(
        `import type { ${c.exportName}Props } from './components/${c.exportName}.js';`,
      );
    }
    lines.push('');
  }
  lines.push(`type ColorTokenKey = ${union(colorKeys)};`);
  if (categories.length === 0) {
    lines.push(
      'type DsTokens = Record<never, never>;',
      'type DsTokenOptions = Record<never, never>;',
    );
  } else {
    lines.push('type DsTokens = {');
    for (const category of categories) {
      const keys = Object.keys(themeOptions.tokens[category]).sort(
        codeUnitCompare,
      );
      lines.push(`  ${category}: Record<${union(keys)}, string>;`);
    }
    lines.push('};', 'type DsTokenOptions = {');
    for (const category of categories) {
      const keys = Object.keys(themeOptions.tokens[category]).sort(
        codeUnitCompare,
      );
      lines.push(`  ${category}?: Partial<Record<${union(keys)}, string>>;`);
    }
    lines.push('};');
  }
  lines.push(
    '',
    "declare module '@mui/material/styles' {",
    '  // MUI types theme.vars, generateStyleSheets, and getColorSchemeSelector only when this flag is on.',
    '  interface CssThemeVariables {',
    '    enabled: true;',
    '  }',
    '  interface Palette {',
    '    tokens: Record<ColorTokenKey, string>;',
    '  }',
    '  interface PaletteOptions {',
    '    tokens?: Partial<Record<ColorTokenKey, string>>;',
    '  }',
    '  interface Theme {',
    '    tokens: DsTokens;',
    '  }',
    '  interface ThemeOptions {',
    '    tokens?: DsTokenOptions;',
    '  }',
    '  interface ThemeVars {',
    '    tokens: DsTokens;',
    '  }',
  );
  if (ownComponents.length > 0) {
    lines.push('  interface ComponentsPropsList {');
    for (const c of ownComponents) {
      lines.push(`    ${c.themeKey}: ${c.exportName}Props;`);
    }
    lines.push('  }', '  interface ComponentNameToClassKey {');
    for (const c of ownComponents) {
      lines.push(
        `    ${c.themeKey}: ${union(['root', ...Object.values(c.slots).map((s) => s.prop)])};`,
      );
    }
    lines.push('  }', '  interface Components<Theme = unknown> {');
    for (const c of ownComponents) {
      lines.push(
        `    ${c.themeKey}?: {`,
        `      defaultProps?: ComponentsProps['${c.themeKey}'];`,
        `      styleOverrides?: ComponentsOverrides<Theme>['${c.themeKey}'];`,
        `      variants?: ComponentsVariants<Theme>['${c.themeKey}'];`,
        '    };',
      );
    }
    lines.push('  }');
  }
  lines.push('}', '');
  const mappedLines = renderMappedOverrides(components);
  if (mappedLines.length > 0) {
    lines.push(...mappedLines, '');
  }
  lines.push('export {};', '');
  return lines.join('\n');
}

/**
 * One `declare module '@mui/material/<Component>' { ... }` block per distinct
 * MUI component a design-system component maps onto: MUI's default union
 * members are disabled, the design system's are enabled, and an overridable
 * prop no axis maps to has every default disabled (its union becomes `never`).
 */
function renderMappedOverrides(
  components: readonly MuiComponentModel[],
): string[] {
  const overrides = new Map<string, Map<string, Map<string, boolean>>>();
  for (const c of components) {
    if (!c.mapped) {
      continue;
    }
    const byInterface = overrides.get(c.mapped.component) ?? new Map();
    overrides.set(c.mapped.component, byInterface);
    for (const union of Object.values(c.mapped.unions)) {
      const members =
        byInterface.get(union.overrides) ?? new Map<string, boolean>();
      byInterface.set(union.overrides, members);
      for (const d of union.defaults) {
        if (!members.has(d)) {
          members.set(d, false);
        }
      }
      for (const v of union.values) {
        members.set(v, true);
      }
    }
  }
  if (overrides.size === 0) {
    return [];
  }
  const lines: string[] = [
    "// Mapped components: MUI's default values are disabled, the design system's enabled; a prop no axis maps to accepts nothing.",
  ];
  for (const component of [...overrides.keys()].sort(codeUnitCompare)) {
    const byInterface = overrides.get(component)!;
    lines.push('', `declare module '@mui/material/${component}' {`);
    for (const iface of [...byInterface.keys()].sort(codeUnitCompare)) {
      const members = byInterface.get(iface)!;
      lines.push(`  interface ${iface} {`);
      for (const member of [...members.keys()].sort(codeUnitCompare)) {
        lines.push(`    ${renderKey(member)}: ${members.get(member)};`);
      }
      lines.push('  }');
    }
    lines.push('}');
  }
  return lines;
}
