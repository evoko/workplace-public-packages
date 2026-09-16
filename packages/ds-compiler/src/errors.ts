export interface SourceLocation {
  /** Path relative to the source root (the directory holding ds.config.json), forward slashes. */
  file: string;
  line: number;
  column: number;
}

export const ERROR_CATALOG = {
  'DS-E001': {
    title: 'Invalid or missing ds.config.json',
    hint: 'Create ds.config.json in the source root with name, prefix, modes, defaultMode, rootFontSize, and modeSelector. See docs/design-system/authoring-guide.md#configuration.',
  },
  'DS-E010': {
    title: 'Disallowed rule in token file',
    hint: 'Token files may only contain `:root { … }` and one block per extra mode using the configured modeSelector. No at-rules, no other selectors.',
  },
  'DS-E011': {
    title: 'Invalid token name',
    hint: 'Token names must be `--<prefix>-<category>-<path>` where <category> equals the file name and <path> is one or more kebab-case segments.',
  },
  'DS-E012': {
    title: 'Invalid token value',
    hint: 'Use a literal of the category type or a `var(--<prefix>-…)` alias. No calc(), no var() fallbacks, no mixed content.',
  },
  'DS-E013': {
    title: 'Alias to unknown token',
    hint: 'Define the referenced token first, in its own category file. Aliases must not form a cycle.',
  },
  'DS-E014': {
    title: 'Alias type mismatch',
    hint: 'An alias must point to a token whose value type is allowed for this category.',
  },
  'DS-E015': {
    title: 'Partial mode coverage',
    hint: 'Define the token in every mode block of the file, or only in :root (mode-invariant).',
  },
  'DS-E016': {
    title: 'Duplicate token',
    hint: 'Each token may be declared once per mode.',
  },
  'DS-E017': {
    title: 'Unknown token category file',
    hint: 'Token files must be named after a category: color, space, radius, font-family, font-size, font-weight, line-height, letter-spacing, shadow, border-width, duration, easing, opacity, z-index, size.',
  },
  'DS-E020': {
    title: 'Invalid manifest',
    hint: 'Fix the listed fields. The schema is packages/ds-compiler/schemas/manifest.schema.json.',
  },
  'DS-E021': {
    title: 'Manifest name mismatch',
    hint: 'manifest.name must equal the component directory name, and the files must be <name>.css and <name>.manifest.json.',
  },
  'DS-E030': {
    title: 'Selector does not match the grammar',
    hint: 'Allowed: `.<prefix>-<name>[data-<axis>="<value>"]:<state>` optionally followed by ` .<prefix>-<name>__<slot>`.',
  },
  'DS-E031': {
    title: 'Unknown axis or axis value',
    hint: 'Declare the axis and its values in manifest.axes.',
  },
  'DS-E032': {
    title: 'Unknown slot',
    hint: 'Declare the slot in manifest.slots.',
  },
  'DS-E033': {
    title: 'Undeclared state',
    hint: 'Add the state to manifest.states, or remove it from the selector.',
  },
  'DS-E034': {
    title: 'Forbidden CSS feature',
    hint: 'Component files may not use element selectors, IDs, !important, nesting, at-rules, or combinators other than a single descendant space. States go on the root compound only.',
  },
  'DS-E040': {
    title: 'Unknown CSS property',
    hint: 'Only properties in the compiler property table are supported. See docs/design-system/authoring-guide.md#properties. To support a new property, add it to src/components/properties.ts.',
  },
  'DS-E041': {
    title: 'Token required',
    hint: 'This property must reference a token: var(--<prefix>-<category>-…). If no token fits, add one to the category file first.',
  },
  'DS-E042': {
    title: 'Literal not allowed',
    hint: 'Use one of the allowed literals for this property, or a token reference.',
  },
  'DS-E043': {
    title: 'Unknown token reference',
    hint: 'The referenced token does not exist. Check the spelling or add the token.',
  },
  'DS-E044': {
    title: 'Token category mismatch',
    hint: 'This property accepts tokens from a different category. Reference a token of an allowed category.',
  },
  'DS-E045': {
    title: 'Forbidden shorthand',
    hint: 'Use the longhand properties instead (for example border-top-width, border-top-style, border-top-color).',
  },
  'DS-E046': {
    title: 'Conflicting declarations',
    hint: 'The same property is set to different values for the same slot, axes, and states. Keep one.',
  },
  'DS-E050': {
    title: 'Unfilled TODO marker',
    hint: 'Replace every TODO left by bwp-ds scaffold with real content, or delete the line.',
  },
  'DS-E060': {
    title: 'Component file set incomplete',
    hint: 'Each directory under src/components needs <name>.css and <name>.manifest.json.',
  },
  'DS-W001': {
    title: 'Root rule missing baseline properties',
    hint: 'Declare the baseline properties on the base root rule so parity does not rest on user-agent defaults. Set "baseline": false in the manifest to opt out.',
  },
} as const;

export type DiagnosticCode = keyof typeof ERROR_CATALOG;
export type Severity = 'error' | 'warning';

export interface Diagnostic {
  code: DiagnosticCode;
  severity: Severity;
  title: string;
  message: string;
  hint: string;
  location?: SourceLocation;
}

export class Diagnostics {
  #items: Diagnostic[] = [];

  get items(): readonly Diagnostic[] {
    return this.#items;
  }

  add(code: DiagnosticCode, message: string, location?: SourceLocation): void {
    const meta = ERROR_CATALOG[code];
    this.#items.push({
      code,
      severity: code.startsWith('DS-W') ? 'warning' : 'error',
      title: meta.title,
      message,
      hint: meta.hint,
      location,
    });
  }

  merge(other: Diagnostics): void {
    this.#items.push(...other.#items);
  }

  get errors(): Diagnostic[] {
    return this.#items.filter((d) => d.severity === 'error');
  }

  get warnings(): Diagnostic[] {
    return this.#items.filter((d) => d.severity === 'warning');
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
}

export function formatDiagnostic(d: Diagnostic): string {
  const loc = d.location
    ? `${d.location.file}:${d.location.line}:${d.location.column} `
    : '';
  return `${loc}${d.severity} ${d.code} ${d.title}: ${d.message}\n  hint: ${d.hint}`;
}
