# Design-System Compiler Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `@bwp-web/ds-compiler` with `lint`, `build`, and `scaffold`, the `@bwp-web/styles-css` source package with starting content, and the agent and human documentation, so a hand-written CSS design system compiles to a validated `design.ir.json`.

**Architecture:** A Node CLI (`bwp-ds`) reads `ds.config.json`, parses token CSS files and component CSS plus JSON manifests with PostCSS, validates them against a strict grammar and property table, and emits a typed, sorted, versioned IR. Every rule violation is a diagnostic with a stable `DS-E…` code, location, and fix hint. `scaffold` writes files that already satisfy the grammar so agents fill in values instead of inventing structure.

**Tech Stack:** TypeScript 5.9, Node 22, npm workspaces + Turbo, tsup, Vitest 4, PostCSS 8 (`postcss`, `postcss-selector-parser`, `postcss-value-parser`), Zod 4, culori 4, commander 15, tsx.

**Spec:** `docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md`, sections 5, 6, 7, 8, 12, 13, 15, and item 1 of 16.

**Repo rules that override the usual plan template:**
- **Never run any git command that writes** (no `git add`, `git commit`, `git tag`, `git branch`). The user handles version control. Where a normal plan would say "Commit", this plan says **Checkpoint**: run the listed verification and report the changed files. `git status`, `git diff`, and `git log` are fine for reading.
- Prettier config is `.prettierrc.json` at the root: 2 spaces, single quotes, trailing commas. All code below follows it.
- The design system is called SOLAR today but nothing in code, package names, file names, or identifiers may say "solar". The name is data in `ds.config.json`.

---

## File structure

### New package `packages/ds-compiler` (`@bwp-web/ds-compiler`, private)

| File | Responsibility |
| --- | --- |
| `package.json`, `tsconfig.json`, `tsconfig.build.json`, `tsup.config.ts`, `eslint.config.js`, `vitest.config.ts` | Package plumbing. Bin `bwp-ds` → `dist/cli.js`. |
| `src/index.ts` | Public API re-exports (types, `buildIR`, `lint`, `scaffold*`, `Diagnostics`). |
| `src/cli.ts` | commander program: `lint`, `build`, `scaffold tokens`, `scaffold component`. |
| `src/errors.ts` | Error catalog (`DS-E…`, `DS-W…`), `Diagnostic`, `Diagnostics` collector, `formatDiagnostic`. |
| `src/config.ts` | `ds.config.json` Zod schema and loader. |
| `src/ir/types.ts` | `DesignIR`, `Token`, `ComponentIR`, `Rule`, `IRValue`, `SourceLocation`. |
| `src/ir/serialize.ts` | Stable JSON serialization (sorted keys) and `sourceHash`. |
| `src/tokens/categories.ts` | Fixed category list, category → token types, token name parsing. |
| `src/tokens/values.ts` | Literal value parsers per token type, `var()` reference parsing, color normalization. |
| `src/tokens/parse-tokens.ts` | One token CSS file → `RawToken[]` (structure rules). |
| `src/tokens/resolve-tokens.ts` | `RawToken[]` → `Record<TokenId, Token>` (duplicates, mode coverage, values, aliases). |
| `src/components/manifest.ts` | Manifest Zod schema, loader, JSON-schema export. |
| `src/components/states.ts` | Pseudo-class and attribute → state name mapping, canonical state order. |
| `src/components/selector.ts` | Selector grammar parser → `{ slot, axes, states }`. |
| `src/components/properties.ts` | Property table, shorthand expansion, baseline set, literal parsing for properties. |
| `src/components/rules.ts` | Rule keying, merging, and deterministic ordering. |
| `src/components/parse-component.ts` | Component CSS + manifest + tokens → `ComponentIR`. |
| `src/build.ts` | Orchestrates config, tokens, components, TODO scan, baseline warning → `DesignIR`; writes `design.ir.json`. |
| `src/lint.ts` | `lint(rootDir)` = build without writing. |
| `src/scaffold/tokens.ts`, `src/scaffold/component.ts` | Scaffold generators. |
| `src/report.ts` | Console and JSON reporters. |
| `scripts/emit-manifest-schema.ts` | Writes `schemas/manifest.schema.json` from the Zod schema. |
| `schemas/manifest.schema.json` | Generated JSON schema (committed). |
| `test/fixtures/mini/**` | A fictional, complete mini design system used by tests. |
| `test/*.test.ts` | One test file per module plus `build.test.ts`, `lint.test.ts`, `scaffold.test.ts`, `cli.test.ts`. |

### New package `packages/styles-css` (`@bwp-web/styles-css`)

| File | Responsibility |
| --- | --- |
| `package.json`, `postcss.config.js`, `.prettierignore` | Build = `bwp-ds build` + PostCSS bundle to `dist/styles.css`. |
| `ds.config.json` | Design-system config (name SOLAR, prefix `bwp`). |
| `src/index.css` | `@import` list in deterministic order. |
| `src/tokens/<category>.css` × 15 | Starting token content. |
| `src/components/example/example.css`, `example.manifest.json` | Starting example component. |
| `src/tokens/MAPPING.md` | Figma → token mapping log (empty table headers). |
| `design.ir.json` | Generated by `bwp-ds build`, committed. |
| `README.md` | Install and usage. |

### Removed

`packages/styles/**` (V1 MUI theme package, already emptied).

### Modified

| File | Change |
| --- | --- |
| `package.json` (root) | Add `ds` and `test` scripts. |
| `turbo.json` | Add `test` task. |
| `packages/components/package.json`, `packages/canvas/package.json`, `packages/storybook/package.json` | Drop `@bwp-web/styles` dependencies. |
| `packages/components/src/index.ts`, `packages/canvas/src/index.ts`, `packages/assets/src/index.ts` | Point stub comment at the new spec. |
| `README.md` (root) | Package table rows. |

### New documentation

`AGENTS.md`, `CLAUDE.md`, `docs/design-system/authoring-guide.md`, `docs/design-system/figma-mapping.md`, `docs/design-system/ir.md`, `docs/design-system/errors.md`, `docs/design-system/verification.md` (skeleton), `docs/design-system/targets/tailwind.md`, `mui.md`, `flutter.md` (skeletons).

---

## Task 1: Compiler package skeleton

**Files:**
- Create: `packages/ds-compiler/package.json`
- Create: `packages/ds-compiler/tsconfig.json`
- Create: `packages/ds-compiler/tsconfig.build.json`
- Create: `packages/ds-compiler/tsup.config.ts`
- Create: `packages/ds-compiler/eslint.config.js`
- Create: `packages/ds-compiler/vitest.config.ts`
- Create: `packages/ds-compiler/src/index.ts`
- Create: `packages/ds-compiler/test/smoke.test.ts`

- [ ] **Step 1: Create `packages/ds-compiler/package.json`**

```json
{
  "name": "@bwp-web/ds-compiler",
  "version": "2.0.0-alpha.0",
  "private": true,
  "description": "Compiles a CSS design system into a validated intermediate representation and target theme layers",
  "type": "module",
  "bin": {
    "bwp-ds": "./bin/bwp-ds.js"
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "files": [
    "dist",
    "schemas"
  ],
  "scripts": {
    "build": "tsup && tsc -p tsconfig.build.json",
    "build:types": "tsc -p tsconfig.build.json",
    "dev": "tsx src/cli.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint",
    "format": "prettier --check . --ignore-path ../../.gitignore",
    "clean": "rm -rf dist node_modules .turbo",
    "schema": "tsx scripts/emit-manifest-schema.ts"
  },
  "dependencies": {
    "commander": "^15.0.0",
    "culori": "^4.0.2",
    "postcss": "^8.5.28",
    "postcss-selector-parser": "^7.1.6",
    "postcss-value-parser": "^4.2.0",
    "zod": "^4.6.5"
  },
  "devDependencies": {
    "@bwp-web/eslint-config": "*",
    "@types/culori": "^4.0.1",
    "@types/node": "^20.19.0",
    "eslint": "^9.39.2",
    "prettier": "^3.8.3",
    "tsup": "^8.5.0",
    "tsx": "^4.23.0",
    "typescript": "^5.9.2",
    "vitest": "^4.1.4"
  },
  "engines": {
    "node": ">=22"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create `packages/ds-compiler/tsconfig.json`**

```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "lib": ["ESNext"],
    "types": ["node"],
    "jsx": "preserve",
    "outDir": "dist",
    "noEmit": true
  },
  "include": ["src", "test", "scripts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `packages/ds-compiler/tsconfig.build.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "emitDeclarationOnly": true,
    "declaration": true,
    "declarationMap": true
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Create `packages/ds-compiler/tsup.config.ts`**

```ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  platform: 'node',
  target: 'node22',
});
```

The CLI entry gets its `#!/usr/bin/env node` line in `src/cli.ts` (Task 15); tsup keeps a leading shebang in the output.

- [ ] **Step 5: Create `packages/ds-compiler/eslint.config.js`**

```js
import baseConfig from '@bwp-web/eslint-config/base';

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    files: ['src/cli.ts', 'src/report.ts', 'scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
];
```

- [ ] **Step 6: Create `packages/ds-compiler/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 7: Create `packages/ds-compiler/src/index.ts` (placeholder export, grown in later tasks)**

```ts
export const COMPILER_NAME = '@bwp-web/ds-compiler';
```

- [ ] **Step 8: Create `packages/ds-compiler/test/smoke.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { COMPILER_NAME } from '../src/index.js';

describe('package', () => {
  it('exports the compiler name', () => {
    expect(COMPILER_NAME).toBe('@bwp-web/ds-compiler');
  });
});
```

- [ ] **Step 9: Install and run**

Run from the repo root:

```bash
npm install
npm run test -w packages/ds-compiler
npm run typecheck -w packages/ds-compiler
npm run lint -w packages/ds-compiler
```

Expected: `npm install` links the workspace and adds the new dependencies to `package-lock.json`. Vitest reports `1 passed`. Typecheck and lint print no errors.

- [ ] **Step 10: Checkpoint**

Report: `packages/ds-compiler/**` created, `package-lock.json` updated.

---

## Task 2: Error catalog and diagnostics

**Files:**
- Create: `packages/ds-compiler/src/errors.ts`
- Test: `packages/ds-compiler/test/errors.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  Diagnostics,
  ERROR_CATALOG,
  formatDiagnostic,
} from '../src/errors.js';

describe('Diagnostics', () => {
  it('records an error with catalog title, hint, and location', () => {
    const diag = new Diagnostics();
    diag.add('DS-E040', 'Unknown property "colr"', {
      file: 'src/components/button/button.css',
      line: 4,
      column: 3,
    });
    expect(diag.hasErrors()).toBe(true);
    expect(diag.errors).toHaveLength(1);
    expect(diag.warnings).toHaveLength(0);
    const d = diag.errors[0];
    expect(d.code).toBe('DS-E040');
    expect(d.severity).toBe('error');
    expect(d.title).toBe(ERROR_CATALOG['DS-E040'].title);
    expect(d.hint).toBe(ERROR_CATALOG['DS-E040'].hint);
  });

  it('classifies W codes as warnings', () => {
    const diag = new Diagnostics();
    diag.add('DS-W001', 'Missing baseline: color');
    expect(diag.hasErrors()).toBe(false);
    expect(diag.warnings).toHaveLength(1);
  });

  it('formats a diagnostic on two lines with location, code, title, message, and hint', () => {
    const diag = new Diagnostics();
    diag.add('DS-E040', 'Unknown property "colr"', {
      file: 'a.css',
      line: 4,
      column: 3,
    });
    const text = formatDiagnostic(diag.items[0]);
    expect(text).toBe(
      `a.css:4:3 error DS-E040 Unknown CSS property: Unknown property "colr"\n  hint: ${ERROR_CATALOG['DS-E040'].hint}`,
    );
  });

  it('formats without a location', () => {
    const diag = new Diagnostics();
    diag.add('DS-E001', 'ds.config.json not found');
    expect(formatDiagnostic(diag.items[0]).startsWith('error DS-E001 ')).toBe(
      true,
    );
  });

  it('merges another collector', () => {
    const a = new Diagnostics();
    const b = new Diagnostics();
    a.add('DS-E001', 'x');
    b.add('DS-W001', 'y');
    a.merge(b);
    expect(a.items).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/errors.test.ts` from `packages/ds-compiler`
Expected: FAIL, cannot resolve `../src/errors.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/errors.ts`**

```ts
export interface SourceLocation {
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
  'DS-E061': {
    title: 'CSS syntax error',
    hint: 'Fix the CSS at the reported position; the parser could not read the file.',
  },
  'DS-W001': {
    title: 'Root rule missing baseline properties',
    hint: 'Declare the baseline properties on the base root rule so parity does not rest on user-agent defaults. Set "baseline": false in the manifest to opt out.',
  },
  'DS-W002': {
    title: 'Empty source root',
    hint: 'No token files under src/tokens and no component directories under src/components were found. Check --root, or scaffold your first token file.',
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
  readonly items: Diagnostic[] = [];

  add(code: DiagnosticCode, message: string, location?: SourceLocation): void {
    const meta = ERROR_CATALOG[code];
    this.items.push({
      code,
      severity: code.startsWith('DS-W') ? 'warning' : 'error',
      title: meta.title,
      message,
      hint: meta.hint,
      location,
    });
  }

  merge(other: Diagnostics): void {
    this.items.push(...other.items);
  }

  get errors(): Diagnostic[] {
    return this.items.filter((d) => d.severity === 'error');
  }

  get warnings(): Diagnostic[] {
    return this.items.filter((d) => d.severity === 'warning');
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/errors.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/errors.ts`, `test/errors.test.ts` created.

---

## Task 3: Configuration loader

**Files:**
- Create: `packages/ds-compiler/src/config.ts`
- Test: `packages/ds-compiler/test/config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';

function tmpRoot(): string {
  return mkdtempSync(join(tmpdir(), 'ds-config-'));
}

describe('loadConfig', () => {
  it('loads a valid config and fills defaults', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light', 'dark'],
        defaultMode: 'light',
      }),
    );
    const diag = new Diagnostics();
    const config = loadConfig(root, diag);
    expect(diag.hasErrors()).toBe(false);
    expect(config).toEqual({
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 16,
      modeSelector: ':root[data-fx-theme="{mode}"]',
    });
  });

  it('reports DS-E001 when the file is missing', () => {
    const root = tmpRoot();
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('ds.config.json');
  });

  it('reports DS-E001 when defaultMode is not in modes', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'dark',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
    expect(diag.errors[0].message).toContain('defaultMode');
  });

  it('reports DS-E001 for an invalid prefix or a modeSelector without {mode}', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'X',
        prefix: 'Bad Prefix',
        modes: ['light'],
        defaultMode: 'light',
        modeSelector: ':root.dark',
      }),
    );
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].message).toContain('prefix');
    expect(diag.errors[0].message).toContain('modeSelector');
  });

  it('reports DS-E001 for malformed JSON', () => {
    const root = tmpRoot();
    writeFileSync(join(root, 'ds.config.json'), '{ not json');
    const diag = new Diagnostics();
    expect(loadConfig(root, diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E001');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/config.test.ts`
Expected: FAIL, cannot resolve `../src/config.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/config.ts`**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import type { Diagnostics } from './errors.js';

export const CONFIG_FILE = 'ds.config.json';

const rawConfigSchema = z.strictObject({
  name: z.string().min(1),
  prefix: z
    .string()
    .regex(/^[a-z][a-z0-9]*$/, 'prefix must be lowercase letters and digits, starting with a letter'),
  modes: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/)).min(1),
  defaultMode: z.string(),
  rootFontSize: z.number().positive().default(16),
  modeSelector: z
    .string()
    .refine((s) => s.includes('{mode}'), 'modeSelector must contain {mode}')
    .optional(),
});

export interface DsConfig {
  name: string;
  prefix: string;
  modes: string[];
  defaultMode: string;
  rootFontSize: number;
  modeSelector: string;
}

export function defaultModeSelector(prefix: string): string {
  return `:root[data-${prefix}-theme="{mode}"]`;
}

export function loadConfig(rootDir: string, diag: Diagnostics): DsConfig | null {
  const file = join(rootDir, CONFIG_FILE);
  if (!existsSync(file)) {
    diag.add('DS-E001', `${CONFIG_FILE} not found in ${rootDir}`);
    return null;
  }
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, 'utf8'));
  } catch (err) {
    diag.add('DS-E001', `${CONFIG_FILE} is not valid JSON: ${(err as Error).message}`, {
      file,
      line: 1,
      column: 1,
    });
    return null;
  }
  const parsed = rawConfigSchema.safeParse(json);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('; ');
    diag.add('DS-E001', `${CONFIG_FILE} is invalid: ${issues}`, {
      file,
      line: 1,
      column: 1,
    });
    return null;
  }
  const raw = parsed.data;
  if (!raw.modes.includes(raw.defaultMode)) {
    diag.add(
      'DS-E001',
      `${CONFIG_FILE} is invalid: defaultMode "${raw.defaultMode}" is not one of modes [${raw.modes.join(', ')}]`,
      { file, line: 1, column: 1 },
    );
    return null;
  }
  return {
    name: raw.name,
    prefix: raw.prefix,
    modes: raw.modes,
    defaultMode: raw.defaultMode,
    rootFontSize: raw.rootFontSize,
    modeSelector: raw.modeSelector ?? defaultModeSelector(raw.prefix),
  };
}

export function modeSelectorFor(config: DsConfig, mode: string): string {
  return config.modeSelector.replace('{mode}', mode);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/config.test.ts`
Expected: PASS, 5 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/config.ts`, `test/config.test.ts` created.

---

## Task 4: IR types and stable serialization

**Files:**
- Create: `packages/ds-compiler/src/ir/types.ts`
- Create: `packages/ds-compiler/src/ir/serialize.ts`
- Test: `packages/ds-compiler/test/serialize.test.ts`

Note: `ir/types.ts` imports types from `tokens/categories.ts` and `tokens/values.ts`, which Tasks 5 and 6 create. Create `types.ts` in this task anyway; the test for this task only needs `serialize.ts`. Run the full typecheck after Task 6.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { sourceHash, stableStringify } from '../src/ir/serialize.js';

describe('stableStringify', () => {
  it('sorts object keys recursively and keeps array order', () => {
    const out = stableStringify({ b: 1, a: { d: [3, { z: 1, y: 2 }], c: 'x' } });
    expect(out).toBe(
      [
        '{',
        '  "a": {',
        '    "c": "x",',
        '    "d": [',
        '      3,',
        '      {',
        '        "y": 2,',
        '        "z": 1',
        '      }',
        '    ]',
        '  },',
        '  "b": 1',
        '}',
      ].join('\n'),
    );
  });

  it('drops undefined properties like JSON.stringify does', () => {
    expect(stableStringify({ a: undefined, b: 1 })).toBe('{\n  "b": 1\n}');
  });
});

describe('sourceHash', () => {
  it('is independent of input order and sensitive to content', () => {
    const a = sourceHash([
      { path: 'x.css', contents: '1' },
      { path: 'y.css', contents: '2' },
    ]);
    const b = sourceHash([
      { path: 'y.css', contents: '2' },
      { path: 'x.css', contents: '1' },
    ]);
    const c = sourceHash([
      { path: 'x.css', contents: '1' },
      { path: 'y.css', contents: '3' },
    ]);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/serialize.test.ts` from `packages/ds-compiler`
Expected: FAIL, cannot resolve `../src/ir/serialize.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/ir/types.ts`**

```ts
import type { SourceLocation } from '../errors.js';
import type { TokenCategory } from '../tokens/categories.js';
import type {
  DimensionValue,
  TokenType,
  TokenValue,
} from '../tokens/values.js';

export const IR_VERSION = 1 as const;

export type Mode = string;

/** Dot-separated path, category first: "color.primary.default". */
export type TokenId = string;

export interface Token {
  $type: TokenType;
  /** Single value when modeInvariant, otherwise one value per mode. Aliases are resolved. */
  $value: TokenValue | Record<Mode, TokenValue>;
  modeInvariant: boolean;
  category: TokenCategory;
  path: string[];
  /** The custom property name in the source CSS, e.g. "--bwp-color-primary-default". */
  cssName: string;
  /** Present when the source used var(): the referenced token id, per mode when not invariant. */
  alias?: TokenId | Partial<Record<Mode, TokenId>>;
  source: SourceLocation;
}

export interface IRValueToken {
  kind: 'token';
  ref: TokenId;
}

export interface IRValueLiteral {
  kind: 'literal';
  type: 'color' | 'dimension' | 'keyword' | 'number' | 'string';
  value: string | number | DimensionValue;
}

export type IRValue = IRValueToken | IRValueLiteral;

export interface Rule {
  slot: string;
  axes: Record<string, string>;
  states: string[];
  declarations: Record<string, IRValue>;
  source: SourceLocation;
}

export type TargetHints = { excluded: string } | Record<string, unknown>;

export type ManifestTargets = Record<string, TargetHints>;

export interface AxisIR {
  values: string[];
  default: string;
}

export interface SlotIR {
  element: string;
  optional: boolean;
}

export interface ComponentIR {
  name: string;
  displayName: string;
  description?: string;
  axes: Record<string, AxisIR>;
  states: string[];
  slots: Record<string, SlotIR>;
  preview: Record<string, string>;
  rules: Rule[];
  targets: ManifestTargets;
}

export interface DesignIR {
  irVersion: typeof IR_VERSION;
  meta: {
    name: string;
    prefix: string;
    modes: Mode[];
    defaultMode: Mode;
    rootFontSize: number;
    sourceHash: string;
  };
  tokens: Record<TokenId, Token>;
  components: Record<string, ComponentIR>;
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/ir/serialize.ts`**

```ts
import { createHash } from 'node:crypto';
import type { DesignIR } from './types.js';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (obj[key] !== undefined) {
        out[key] = sortValue(obj[key]);
      }
    }
    return out;
  }
  return value;
}

/** JSON.stringify with recursively sorted object keys and 2-space indent. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value), null, 2);
}

export function serializeIR(ir: DesignIR): string {
  return `${stableStringify(ir)}\n`;
}

export interface SourceFile {
  /** Path relative to the source root, using forward slashes. */
  path: string;
  contents: string;
}

/** SHA-256 over all source files, ordered by path so the result is order-independent. */
export function sourceHash(files: SourceFile[]): string {
  const hash = createHash('sha256');
  for (const f of [...files].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(f.path);
    hash.update('\n');
    hash.update(f.contents);
    hash.update('\n--\n');
  }
  return hash.digest('hex');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/serialize.test.ts`
Expected: PASS, 3 tests.

- [ ] **Step 6: Checkpoint**

Report: `src/ir/types.ts`, `src/ir/serialize.ts`, `test/serialize.test.ts` created.

---

## Task 5: Token categories and name parsing

**Files:**
- Create: `packages/ds-compiler/src/tokens/categories.ts`
- Test: `packages/ds-compiler/test/categories.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  CATEGORY_TYPES,
  TOKEN_CATEGORIES,
  isTokenCategory,
  parseTokenName,
  tokenIdToCssName,
} from '../src/tokens/categories.js';

describe('categories', () => {
  it('has 15 fixed categories, each with at least one value type', () => {
    expect(TOKEN_CATEGORIES).toHaveLength(15);
    for (const c of TOKEN_CATEGORIES) {
      expect(CATEGORY_TYPES[c].length).toBeGreaterThan(0);
    }
    expect(isTokenCategory('color')).toBe(true);
    expect(isTokenCategory('colour')).toBe(false);
  });
});

describe('parseTokenName', () => {
  it('parses category and path for a single-word category', () => {
    expect(parseTokenName('--fx-color-primary-default', 'fx')).toEqual({
      category: 'color',
      path: ['primary', 'default'],
      id: 'color.primary.default',
    });
  });

  it('parses a hyphenated category before splitting the path', () => {
    expect(parseTokenName('--fx-font-family-heading', 'fx')).toEqual({
      category: 'font-family',
      path: ['heading'],
      id: 'font-family.heading',
    });
  });

  it('accepts numeric path segments', () => {
    expect(parseTokenName('--fx-space-4', 'fx')?.id).toBe('space.4');
  });

  it('rejects the wrong prefix, a missing path, an unknown category, and bad casing', () => {
    expect(parseTokenName('--other-color-primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color', 'fx')).toBeNull();
    expect(parseTokenName('--fx-colour-primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color-Primary', 'fx')).toBeNull();
    expect(parseTokenName('--fx-color-primary--default', 'fx')).toBeNull();
    expect(parseTokenName('color-primary', 'fx')).toBeNull();
  });
});

describe('tokenIdToCssName', () => {
  it('round-trips with parseTokenName', () => {
    const name = tokenIdToCssName('font-size.body.1', 'fx');
    expect(name).toBe('--fx-font-size-body-1');
    expect(parseTokenName(name, 'fx')?.id).toBe('font-size.body.1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/categories.test.ts`
Expected: FAIL, cannot resolve `../src/tokens/categories.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/tokens/categories.ts`**

```ts
import type { TokenId } from '../ir/types.js';
import type { TokenType } from './values.js';

export const TOKEN_CATEGORIES = [
  'color',
  'space',
  'radius',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
  'letter-spacing',
  'shadow',
  'border-width',
  'duration',
  'easing',
  'opacity',
  'z-index',
  'size',
] as const;

export type TokenCategory = (typeof TOKEN_CATEGORIES)[number];

/** Value types a category accepts, tried in order when parsing a literal. */
export const CATEGORY_TYPES: Record<TokenCategory, readonly TokenType[]> = {
  color: ['color'],
  space: ['dimension'],
  radius: ['dimension'],
  'font-family': ['fontFamily'],
  'font-size': ['dimension'],
  'font-weight': ['fontWeight'],
  'line-height': ['number', 'dimension'],
  'letter-spacing': ['dimension'],
  shadow: ['shadow'],
  'border-width': ['dimension'],
  duration: ['duration'],
  easing: ['cubicBezier'],
  opacity: ['number'],
  'z-index': ['number'],
  size: ['dimension'],
};

export function isTokenCategory(value: string): value is TokenCategory {
  return (TOKEN_CATEGORIES as readonly string[]).includes(value);
}

export interface ParsedTokenName {
  category: TokenCategory;
  path: string[];
  id: TokenId;
}

const PATH_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Longest category first so "font-family" wins over any shorter overlap.
const CATEGORIES_BY_LENGTH = [...TOKEN_CATEGORIES].sort(
  (a, b) => b.length - a.length,
);

/** Parses "--<prefix>-<category>-<path>" into its parts, or null when it does not match. */
export function parseTokenName(
  name: string,
  prefix: string,
): ParsedTokenName | null {
  const lead = `--${prefix}-`;
  if (!name.startsWith(lead)) {
    return null;
  }
  const rest = name.slice(lead.length);
  for (const category of CATEGORIES_BY_LENGTH) {
    if (rest.startsWith(`${category}-`)) {
      const pathText = rest.slice(category.length + 1);
      if (!PATH_PATTERN.test(pathText)) {
        return null;
      }
      const path = pathText.split('-');
      return { category, path, id: [category, ...path].join('.') };
    }
  }
  return null;
}

/** "color.primary.default" -> "--<prefix>-color-primary-default". */
export function tokenIdToCssName(id: TokenId, prefix: string): string {
  return `--${prefix}-${id.split('.').join('-')}`;
}

export function categoryOfTokenId(id: TokenId): TokenCategory | null {
  const first = id.split('.')[0];
  return isTokenCategory(first) ? first : null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/categories.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/tokens/categories.ts`, `test/categories.test.ts` created.

---

## Task 6: Value parsing

**Files:**
- Create: `packages/ds-compiler/src/tokens/values.ts`
- Test: `packages/ds-compiler/test/values.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  normalizeColor,
  parseCubicBezier,
  parseDimension,
  parseDuration,
  parseFontFamily,
  parseFontWeight,
  parseLiteral,
  parseLiteralForTypes,
  parseNumber,
  parseShadow,
  parseVarRef,
} from '../src/tokens/values.js';

describe('normalizeColor', () => {
  it('normalizes hex, rgb, and named colors to #rrggbbaa', () => {
    expect(normalizeColor('#fff')).toBe('#ffffffff');
    expect(normalizeColor('#1863D3')).toBe('#1863d3ff');
    expect(normalizeColor('rgb(0 0 0 / 50%)')).toBe('#00000080');
    expect(normalizeColor('rgba(255, 0, 0, 0.5)')).toBe('#ff000080');
    expect(normalizeColor('white')).toBe('#ffffffff');
  });
  it('returns null for non-colors', () => {
    expect(normalizeColor('notacolor')).toBeNull();
    expect(normalizeColor('12px')).toBeNull();
    expect(normalizeColor('')).toBeNull();
  });
});

describe('parseDimension', () => {
  it('parses px, rem, em, and %', () => {
    expect(parseDimension('12px')).toEqual({ value: 12, unit: 'px' });
    expect(parseDimension('0.875rem')).toEqual({ value: 0.875, unit: 'rem' });
    expect(parseDimension('-.5em')).toEqual({ value: -0.5, unit: 'em' });
    expect(parseDimension('100%')).toEqual({ value: 100, unit: '%' });
  });
  it('treats unitless zero as 0px and rejects other unitless numbers', () => {
    expect(parseDimension('0')).toEqual({ value: 0, unit: 'px' });
    expect(parseDimension('12')).toBeNull();
    expect(parseDimension('12pt')).toBeNull();
    expect(parseDimension('auto')).toBeNull();
  });
});

describe('parseFontFamily', () => {
  it('splits families and strips quotes', () => {
    expect(parseFontFamily("'Open Sans', Arial, sans-serif")).toEqual({
      families: ['Open Sans', 'Arial', 'sans-serif'],
    });
  });
  it('rejects empty input', () => {
    expect(parseFontFamily('')).toBeNull();
  });
});

describe('parseFontWeight', () => {
  it('parses numbers and keywords', () => {
    expect(parseFontWeight('600')).toEqual({ weight: 600 });
    expect(parseFontWeight('normal')).toEqual({ weight: 400 });
    expect(parseFontWeight('bold')).toEqual({ weight: 700 });
  });
  it('rejects out-of-range and unknown values', () => {
    expect(parseFontWeight('0')).toBeNull();
    expect(parseFontWeight('1001')).toBeNull();
    expect(parseFontWeight('bolder')).toBeNull();
  });
});

describe('parseNumber / parseDuration / parseCubicBezier', () => {
  it('parses numbers', () => {
    expect(parseNumber('1.5')).toEqual({ value: 1.5 });
    expect(parseNumber('-2')).toEqual({ value: -2 });
    expect(parseNumber('1px')).toBeNull();
  });
  it('parses durations to ms', () => {
    expect(parseDuration('200ms')).toEqual({ ms: 200 });
    expect(parseDuration('0.3s')).toEqual({ ms: 300 });
    expect(parseDuration('200')).toBeNull();
  });
  it('parses easing keywords and cubic-bezier()', () => {
    expect(parseCubicBezier('ease-in-out')).toEqual({
      points: [0.42, 0, 0.58, 1],
    });
    expect(parseCubicBezier('cubic-bezier(0.4, 0, 0.2, 1)')).toEqual({
      points: [0.4, 0, 0.2, 1],
    });
    expect(parseCubicBezier('steps(4)')).toBeNull();
  });
});

describe('parseShadow', () => {
  it('parses a single layer with a literal color', () => {
    expect(parseShadow('0 1px 2px rgba(0, 0, 0, 0.2)', 'fx')).toEqual({
      layers: [
        {
          inset: false,
          offsetX: { value: 0, unit: 'px' },
          offsetY: { value: 1, unit: 'px' },
          blur: { value: 2, unit: 'px' },
          spread: { value: 0, unit: 'px' },
          color: { hex: '#00000033' },
        },
      ],
    });
  });
  it('parses multiple layers, inset, and a var() color', () => {
    const v = parseShadow(
      'inset 0 0 0 1px var(--fx-color-border-default), 0 4px 8px 0 #0000001a',
      'fx',
    );
    expect(v?.layers).toHaveLength(2);
    expect(v?.layers[0].inset).toBe(true);
    expect(v?.layers[0].color).toEqual({ ref: 'color.border.default' });
    expect(v?.layers[1].color).toEqual({ hex: '#0000001a' });
  });
  it('parses none as zero layers and rejects malformed layers', () => {
    expect(parseShadow('none', 'fx')).toEqual({ layers: [] });
    expect(parseShadow('1px red', 'fx')).toBeNull();
    expect(parseShadow('0 0 0 0 0 red', 'fx')).toBeNull();
    expect(parseShadow('0 1px 2px', 'fx')).toBeNull();
  });
});

describe('parseVarRef', () => {
  it('returns null for non-var values', () => {
    expect(parseVarRef('#fff', 'fx')).toBeNull();
  });
  it('parses a valid reference', () => {
    expect(parseVarRef('var(--fx-color-primary-default)', 'fx')).toEqual({
      ok: true,
      id: 'color.primary.default',
      name: '--fx-color-primary-default',
    });
    expect(parseVarRef('var( --fx-space-2 )', 'fx')).toEqual({
      ok: true,
      id: 'space.2',
      name: '--fx-space-2',
    });
  });
  it('rejects fallbacks, wrong prefixes, and var() inside expressions', () => {
    expect(parseVarRef('var(--fx-space-2, 8px)', 'fx')).toMatchObject({
      ok: false,
    });
    expect(parseVarRef('var(--other-space-2)', 'fx')).toMatchObject({
      ok: false,
    });
    expect(parseVarRef('calc(var(--fx-space-2) * 2)', 'fx')).toMatchObject({
      ok: false,
    });
  });
});

describe('parseLiteral / parseLiteralForTypes', () => {
  it('dispatches on type', () => {
    expect(parseLiteral('#000', 'color', 'fx')).toEqual({ hex: '#000000ff' });
    expect(parseLiteral('8px', 'dimension', 'fx')).toEqual({
      value: 8,
      unit: 'px',
    });
    expect(parseLiteral('8px', 'color', 'fx')).toBeNull();
  });
  it('tries types in order and reports which matched', () => {
    expect(parseLiteralForTypes('1.5', ['number', 'dimension'], 'fx')).toEqual({
      type: 'number',
      value: { value: 1.5 },
    });
    expect(parseLiteralForTypes('24px', ['number', 'dimension'], 'fx')).toEqual(
      { type: 'dimension', value: { value: 24, unit: 'px' } },
    );
    expect(parseLiteralForTypes('x', ['number', 'dimension'], 'fx')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/values.test.ts`
Expected: FAIL, cannot resolve `../src/tokens/values.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/tokens/values.ts`**

```ts
import { formatHex8, parse as parseCuloriColor } from 'culori';
import valueParser from 'postcss-value-parser';
import type { TokenId } from '../ir/types.js';
import { parseTokenName } from './categories.js';

export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'number'
  | 'duration'
  | 'cubicBezier'
  | 'shadow';

export interface ColorValue {
  /** Always "#rrggbbaa", lowercase. */
  hex: string;
}
export type DimensionUnit = 'px' | 'rem' | 'em' | '%';
export interface DimensionValue {
  value: number;
  unit: DimensionUnit;
}
export interface FontFamilyValue {
  families: string[];
}
export interface FontWeightValue {
  weight: number;
}
export interface NumberValue {
  value: number;
}
export interface DurationValue {
  ms: number;
}
export interface CubicBezierValue {
  points: [number, number, number, number];
}
export interface ShadowLayer {
  inset: boolean;
  offsetX: DimensionValue;
  offsetY: DimensionValue;
  blur: DimensionValue;
  spread: DimensionValue;
  color: ColorValue | { ref: TokenId };
}
export interface ShadowValue {
  layers: ShadowLayer[];
}

export type TokenValue =
  | ColorValue
  | DimensionValue
  | FontFamilyValue
  | FontWeightValue
  | NumberValue
  | DurationValue
  | CubicBezierValue
  | ShadowValue;

const ZERO: DimensionValue = { value: 0, unit: 'px' };

export function normalizeColor(raw: string): string | null {
  const text = raw.trim();
  if (text === '') {
    return null;
  }
  const parsed = parseCuloriColor(text);
  if (!parsed) {
    return null;
  }
  return formatHex8(parsed).toLowerCase();
}

const DIMENSION = /^(-?(?:\d+\.?\d*|\.\d+))(px|rem|em|%)$/;
const ZERO_TEXT = /^-?0+(\.0+)?$/;

export function parseDimension(raw: string): DimensionValue | null {
  const text = raw.trim();
  if (ZERO_TEXT.test(text)) {
    return { ...ZERO };
  }
  const m = DIMENSION.exec(text);
  if (!m) {
    return null;
  }
  return { value: Number(m[1]), unit: m[2] as DimensionUnit };
}

export function parseFontFamily(raw: string): FontFamilyValue | null {
  const families: string[] = [];
  let current: string[] = [];
  const flush = (): void => {
    const name = current.join(' ').trim();
    if (name !== '') {
      families.push(name);
    }
    current = [];
  };
  for (const node of valueParser(raw).nodes) {
    if (node.type === 'div' && node.value === ',') {
      flush();
    } else if (node.type === 'string' || node.type === 'word') {
      current.push(node.value);
    }
  }
  flush();
  return families.length > 0 ? { families } : null;
}

const FONT_WEIGHT_KEYWORDS: Record<string, number> = { normal: 400, bold: 700 };

export function parseFontWeight(raw: string): FontWeightValue | null {
  const text = raw.trim();
  if (text in FONT_WEIGHT_KEYWORDS) {
    return { weight: FONT_WEIGHT_KEYWORDS[text] };
  }
  if (!/^\d+$/.test(text)) {
    return null;
  }
  const weight = Number(text);
  return weight >= 1 && weight <= 1000 ? { weight } : null;
}

const NUMBER = /^-?(?:\d+\.?\d*|\.\d+)$/;

export function parseNumber(raw: string): NumberValue | null {
  const text = raw.trim();
  return NUMBER.test(text) ? { value: Number(text) } : null;
}

const DURATION = /^(\d+\.?\d*|\.\d+)(ms|s)$/;

export function parseDuration(raw: string): DurationValue | null {
  const m = DURATION.exec(raw.trim());
  if (!m) {
    return null;
  }
  const n = Number(m[1]);
  return { ms: m[2] === 's' ? n * 1000 : n };
}

const EASING_KEYWORDS: Record<string, [number, number, number, number]> = {
  linear: [0, 0, 1, 1],
  ease: [0.25, 0.1, 0.25, 1],
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
};
const CUBIC =
  /^cubic-bezier\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/;

export function parseCubicBezier(raw: string): CubicBezierValue | null {
  const text = raw.trim();
  if (text in EASING_KEYWORDS) {
    const [a, b, c, d] = EASING_KEYWORDS[text];
    return { points: [a, b, c, d] };
  }
  const m = CUBIC.exec(text);
  if (!m) {
    return null;
  }
  return { points: [Number(m[1]), Number(m[2]), Number(m[3]), Number(m[4])] };
}

export type VarRefResult =
  | { ok: true; id: TokenId; name: string }
  | { ok: false; reason: string };

const VAR_ONLY = /^var\(\s*(--[a-zA-Z0-9-]+)\s*\)$/;

/**
 * Returns null when the value is not a var() expression at all,
 * ok:true for a clean reference to a token of this prefix,
 * ok:false when var() is present but not in an allowed form.
 */
export function parseVarRef(raw: string, prefix: string): VarRefResult | null {
  const text = raw.trim();
  if (!text.includes('var(')) {
    return null;
  }
  const m = VAR_ONLY.exec(text);
  if (!m) {
    return {
      ok: false,
      reason:
        'var() must be the whole value with no fallback and no surrounding expression',
    };
  }
  const name = m[1];
  const parsed = parseTokenName(name, prefix);
  if (!parsed) {
    return {
      ok: false,
      reason: `"${name}" is not a token name for prefix "${prefix}" (expected --${prefix}-<category>-<path>)`,
    };
  }
  return { ok: true, id: parsed.id, name };
}

export function parseShadow(raw: string, prefix: string): ShadowValue | null {
  const text = raw.trim();
  if (text === 'none') {
    return { layers: [] };
  }
  const layersNodes: valueParser.Node[][] = [[]];
  for (const node of valueParser(text).nodes) {
    if (node.type === 'div' && node.value === ',') {
      layersNodes.push([]);
    } else if (node.type !== 'space' && node.type !== 'comment') {
      layersNodes[layersNodes.length - 1].push(node);
    }
  }
  const layers: ShadowLayer[] = [];
  for (const nodes of layersNodes) {
    let inset = false;
    const dims: DimensionValue[] = [];
    let color: ShadowLayer['color'] | null = null;
    for (const node of nodes) {
      if (node.type === 'word' && node.value === 'inset') {
        inset = true;
        continue;
      }
      if (node.type === 'function' && node.value === 'var') {
        const ref = parseVarRef(valueParser.stringify(node), prefix);
        if (!ref || !ref.ok || color) {
          return null;
        }
        color = { ref: ref.id };
        continue;
      }
      if (node.type === 'word') {
        const dim = parseDimension(node.value);
        if (dim) {
          dims.push(dim);
          continue;
        }
      }
      const hex = normalizeColor(valueParser.stringify(node));
      if (hex && !color) {
        color = { hex };
        continue;
      }
      return null;
    }
    if (dims.length < 2 || dims.length > 4 || !color) {
      return null;
    }
    layers.push({
      inset,
      offsetX: dims[0],
      offsetY: dims[1],
      blur: dims[2] ?? { ...ZERO },
      spread: dims[3] ?? { ...ZERO },
      color,
    });
  }
  return { layers };
}

export function parseLiteral(
  raw: string,
  type: TokenType,
  prefix: string,
): TokenValue | null {
  switch (type) {
    case 'color': {
      const hex = normalizeColor(raw);
      return hex ? { hex } : null;
    }
    case 'dimension':
      return parseDimension(raw);
    case 'fontFamily':
      return parseFontFamily(raw);
    case 'fontWeight':
      return parseFontWeight(raw);
    case 'number':
      return parseNumber(raw);
    case 'duration':
      return parseDuration(raw);
    case 'cubicBezier':
      return parseCubicBezier(raw);
    case 'shadow':
      return parseShadow(raw, prefix);
  }
}

export interface TypedValue {
  type: TokenType;
  value: TokenValue;
}

export function parseLiteralForTypes(
  raw: string,
  types: readonly TokenType[],
  prefix: string,
): TypedValue | null {
  for (const type of types) {
    const value = parseLiteral(raw, type, prefix);
    if (value) {
      return { type, value };
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/values.test.ts`
Expected: PASS, 16 tests. culori rounds alpha 0.5 to `80`, and 0.2 to `33`, which the expectations assume. If culori returns `#0000004d` or similar for 0.2, fix the expectation to what culori produced after confirming it is a rounding difference and not a parsing failure.

- [ ] **Step 5: Typecheck the package**

Run: `npm run typecheck -w packages/ds-compiler`
Expected: no errors. `ir/types.ts` now resolves both of its imports.

- [ ] **Step 6: Checkpoint**

Report: `src/tokens/values.ts`, `test/values.test.ts` created.

---

## Task 7: Token file parsing (structure rules)

**Files:**
- Create: `packages/ds-compiler/src/tokens/parse-tokens.ts`
- Test: `packages/ds-compiler/test/parse-tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { parseTokenFile } from '../src/tokens/parse-tokens.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
};

describe('parseTokenFile', () => {
  it('parses :root and mode blocks into raw tokens with locations', () => {
    const css = `
:root {
  --fx-color-primary-default: #1863d3;
  --fx-color-primary-hover: var(--fx-color-primary-default);
}

:root[data-fx-theme="dark"] {
  --fx-color-primary-default: #3f8cff;
}
`;
    const diag = new Diagnostics();
    const raws = parseTokenFile('src/tokens/color.css', css, config, diag);
    expect(diag.items).toEqual([]);
    expect(raws).toEqual([
      {
        id: 'color.primary.default',
        category: 'color',
        path: ['primary', 'default'],
        cssName: '--fx-color-primary-default',
        mode: 'light',
        raw: '#1863d3',
        location: { file: 'src/tokens/color.css', line: 3, column: 3 },
      },
      {
        id: 'color.primary.hover',
        category: 'color',
        path: ['primary', 'hover'],
        cssName: '--fx-color-primary-hover',
        mode: 'light',
        raw: 'var(--fx-color-primary-default)',
        location: { file: 'src/tokens/color.css', line: 4, column: 3 },
      },
      {
        id: 'color.primary.default',
        category: 'color',
        path: ['primary', 'default'],
        cssName: '--fx-color-primary-default',
        mode: 'dark',
        raw: '#3f8cff',
        location: { file: 'src/tokens/color.css', line: 8, column: 3 },
      },
    ]);
  });

  it('accepts single-quoted mode selectors (Prettier output)', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile(
      'src/tokens/space.css',
      ":root[data-fx-theme='dark'] { --fx-space-1: 4px; }",
      config,
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(raws[0].mode).toBe('dark');
  });

  it('reports DS-E017 for a file not named after a category', () => {
    const diag = new Diagnostics();
    const raws = parseTokenFile('src/tokens/colours.css', ':root {}', config, diag);
    expect(raws).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E017']);
  });

  it('reports DS-E010 for at-rules, unknown selectors, and nested rules', () => {
    const css = `
@media (min-width: 600px) { :root { --fx-space-1: 4px; } }
.theme-dark { --fx-space-1: 4px; }
:root { --fx-space-1: 4px; .nested { --fx-space-2: 8px; } }
`;
    const diag = new Diagnostics();
    parseTokenFile('src/tokens/space.css', css, config, diag);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E010',
      'DS-E010',
      'DS-E010',
    ]);
    expect(diag.errors[1].message).toContain('.theme-dark');
  });

  it('reports DS-E011 for non-custom properties, wrong prefix, wrong category, and bad casing', () => {
    const css = `
:root {
  color: red;
  --other-space-1: 4px;
  --fx-color-primary: #000;
  --fx-space-Large: 4px;
}
`;
    const diag = new Diagnostics();
    const raws = parseTokenFile('src/tokens/space.css', css, config, diag);
    expect(raws).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E011',
      'DS-E011',
      'DS-E011',
      'DS-E011',
    ]);
    expect(diag.errors[2].message).toContain('category "color"');
  });

  it('reports DS-E061 with the error line for a CSS syntax error', () => {
    const diag = new Diagnostics();
    parseTokenFile('src/tokens/space.css', ':root {\n  --fx-space-1: 4px;\n', config, diag);
    expect(diag.errors[0].code).toBe('DS-E061');
    expect(diag.errors[0].message).toContain('syntax');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/parse-tokens.test.ts`
Expected: FAIL, cannot resolve `../src/tokens/parse-tokens.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/tokens/parse-tokens.ts`**

```ts
import { basename } from 'node:path';
import postcss, { CssSyntaxError, type ChildNode, type Root } from 'postcss';
import { modeSelectorFor, type DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { Mode, TokenId } from '../ir/types.js';
import {
  isTokenCategory,
  parseTokenName,
  type TokenCategory,
} from './categories.js';

export interface RawToken {
  id: TokenId;
  category: TokenCategory;
  path: string[];
  cssName: string;
  mode: Mode;
  raw: string;
  location: SourceLocation;
}

interface Positioned {
  source?: { start?: { line: number; column: number } };
}

export function locationOf(file: string, node: Positioned): SourceLocation {
  return {
    file,
    line: node.source?.start?.line ?? 1,
    column: node.source?.start?.column ?? 1,
  };
}

/** Parses CSS text, reporting a syntax error as DS-E061 at its position. */
export function parseCss(
  filePath: string,
  css: string,
  diag: Diagnostics,
): Root | null {
  try {
    return postcss.parse(css, { from: filePath });
  } catch (err) {
    if (err instanceof CssSyntaxError) {
      diag.add('DS-E061', `CSS syntax error: ${err.reason}`, {
        file: filePath,
        line: err.line ?? 1,
        column: err.column ?? 1,
      });
    } else {
      diag.add('DS-E061', `CSS syntax error: ${(err as Error).message}`, {
        file: filePath,
        line: 1,
        column: 1,
      });
    }
    return null;
  }
}

export function categoryFromFile(filePath: string): TokenCategory | null {
  const base = basename(filePath, '.css');
  return isTokenCategory(base) ? base : null;
}

/** Quote style is irrelevant: Prettier may rewrite [a="b"] as [a='b']. */
function normalizeQuotes(selector: string): string {
  return selector.replace(/'/g, '"');
}

export function modeForSelector(selector: string, config: DsConfig): Mode | null {
  const wanted = normalizeQuotes(selector);
  if (wanted === ':root') {
    return config.defaultMode;
  }
  for (const mode of config.modes) {
    if (
      mode !== config.defaultMode &&
      normalizeQuotes(modeSelectorFor(config, mode)) === wanted
    ) {
      return mode;
    }
  }
  return null;
}

export function parseTokenFile(
  filePath: string,
  css: string,
  config: DsConfig,
  diag: Diagnostics,
): RawToken[] {
  const category = categoryFromFile(filePath);
  if (!category) {
    diag.add(
      'DS-E017',
      `"${basename(filePath)}" is not named after a token category`,
      { file: filePath, line: 1, column: 1 },
    );
    return [];
  }
  const root = parseCss(filePath, css, diag);
  if (!root) {
    return [];
  }
  const out: RawToken[] = [];
  root.each((node: ChildNode) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type !== 'rule') {
      const what =
        node.type === 'atrule' ? `@${node.name}` : `${node.type} node`;
      diag.add(
        'DS-E010',
        `Unexpected ${what} in token file; only :root and mode blocks are allowed`,
        locationOf(filePath, node),
      );
      return;
    }
    const selector = node.selector.trim();
    const mode = modeForSelector(selector, config);
    if (mode === null) {
      diag.add(
        'DS-E010',
        `Selector "${selector}" is not :root or a configured mode selector`,
        locationOf(filePath, node),
      );
      return;
    }
    node.each((child) => {
      if (child.type === 'comment') {
        return;
      }
      if (child.type !== 'decl') {
        diag.add(
          'DS-E010',
          `Unexpected ${child.type === 'rule' ? `nested rule "${child.selector}"` : child.type} inside "${selector}"`,
          locationOf(filePath, child),
        );
        return;
      }
      const parsed = child.prop.startsWith('--')
        ? parseTokenName(child.prop, config.prefix)
        : null;
      if (!parsed) {
        diag.add(
          'DS-E011',
          `"${child.prop}" does not match --${config.prefix}-${category}-<path>`,
          locationOf(filePath, child),
        );
        return;
      }
      if (parsed.category !== category) {
        diag.add(
          'DS-E011',
          `"${child.prop}" belongs to category "${parsed.category}" but is declared in ${basename(filePath)}`,
          locationOf(filePath, child),
        );
        return;
      }
      out.push({
        id: parsed.id,
        category,
        path: parsed.path,
        cssName: child.prop,
        mode,
        raw: child.value.trim(),
        location: locationOf(filePath, child),
      });
    });
  });
  return out;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/parse-tokens.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/tokens/parse-tokens.ts`, `test/parse-tokens.test.ts` created.

---

## Task 8: Token resolution (duplicates, modes, values, aliases)

**Files:**
- Create: `packages/ds-compiler/src/tokens/resolve-tokens.ts`
- Test: `packages/ds-compiler/test/resolve-tokens.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { parseTokenFile } from '../src/tokens/parse-tokens.js';
import { resolveTokens } from '../src/tokens/resolve-tokens.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
};

function resolve(files: Record<string, string>) {
  const diag = new Diagnostics();
  const raws = Object.entries(files).flatMap(([file, css]) =>
    parseTokenFile(`src/tokens/${file}`, css, config, diag),
  );
  const tokens = resolveTokens(raws, config, diag);
  return { tokens, diag };
}

describe('resolveTokens', () => {
  it('produces invariant and per-mode tokens with resolved aliases', () => {
    const { tokens, diag } = resolve({
      'color.css': `
:root {
  --fx-color-neutral-900: #111111;
  --fx-color-text-default: var(--fx-color-neutral-900);
  --fx-color-bg-default: #ffffff;
}
:root[data-fx-theme="dark"] {
  --fx-color-bg-default: #111111;
}`,
    });
    expect(diag.items).toEqual([]);
    expect(Object.keys(tokens)).toEqual([
      'color.bg.default',
      'color.neutral.900',
      'color.text.default',
    ]);
    expect(tokens['color.neutral.900']).toMatchObject({
      $type: 'color',
      $value: { hex: '#111111ff' },
      modeInvariant: true,
      category: 'color',
      path: ['neutral', '900'],
      cssName: '--fx-color-neutral-900',
    });
    expect(tokens['color.text.default']).toMatchObject({
      $value: { hex: '#111111ff' },
      modeInvariant: true,
      alias: 'color.neutral.900',
    });
    expect(tokens['color.bg.default']).toMatchObject({
      $value: { light: { hex: '#ffffffff' }, dark: { hex: '#111111ff' } },
      modeInvariant: false,
    });
    expect(tokens['color.bg.default'].alias).toBeUndefined();
  });

  it('makes a :root-only alias per-mode when its target varies by mode', () => {
    const { tokens } = resolve({
      'color.css': `
:root {
  --fx-color-bg-default: #ffffff;
  --fx-color-surface-default: var(--fx-color-bg-default);
}
:root[data-fx-theme="dark"] {
  --fx-color-bg-default: #111111;
}`,
    });
    expect(tokens['color.surface.default']).toMatchObject({
      modeInvariant: false,
      $value: { light: { hex: '#ffffffff' }, dark: { hex: '#111111ff' } },
      alias: { light: 'color.bg.default' },
    });
  });

  it('accepts cross-category aliases when the value type matches', () => {
    const { tokens, diag } = resolve({
      'space.css': ':root { --fx-space-4: 16px; }',
      'radius.css': ':root { --fx-radius-md: var(--fx-space-4); }',
    });
    expect(diag.items).toEqual([]);
    expect(tokens['radius.md']).toMatchObject({
      $type: 'dimension',
      $value: { value: 16, unit: 'px' },
      alias: 'space.4',
    });
  });

  it('reports DS-E014 for an alias whose type does not fit the category', () => {
    const { diag } = resolve({
      'color.css': ':root { --fx-color-x: #fff; }',
      'space.css': ':root { --fx-space-1: var(--fx-color-x); }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E014']);
  });

  it('reports DS-E013 for unknown alias targets and cycles', () => {
    const { diag } = resolve({
      'color.css': `
:root {
  --fx-color-a: var(--fx-color-missing);
  --fx-color-b: var(--fx-color-c);
  --fx-color-c: var(--fx-color-b);
}`,
    });
    const codes = diag.errors.map((e) => e.code);
    expect(codes).toContain('DS-E013');
    expect(diag.errors.some((e) => e.message.includes('missing'))).toBe(true);
    expect(diag.errors.some((e) => e.message.includes('cycle'))).toBe(true);
  });

  it('reports DS-E012 for a value that fits no type of the category', () => {
    const { diag } = resolve({
      'space.css': ':root { --fx-space-1: red; --fx-space-2: calc(1px + 2px); }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E012', 'DS-E012']);
  });

  it('reports DS-E015 for partial mode coverage', () => {
    const { diag, tokens } = resolve({
      'color.css': `
:root { --fx-color-a: #000; }
:root[data-fx-theme="dark"] { --fx-color-b: #fff; }`,
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E015']);
    expect(diag.errors[0].message).toContain('color.b');
    expect(tokens['color.a']).toBeDefined();
    expect(tokens['color.b']).toBeUndefined();
  });

  it('reports DS-E016 for duplicates within one mode', () => {
    const { diag } = resolve({
      'color.css': ':root { --fx-color-a: #000; --fx-color-a: #111; }',
    });
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E016']);
    expect(diag.errors[0].location?.line).toBe(1);
  });

  it('parses line-height as number first, then dimension', () => {
    const { tokens } = resolve({
      'line-height.css': ':root { --fx-line-height-body: 1.5; --fx-line-height-fixed: 24px; }',
    });
    expect(tokens['line-height.body']).toMatchObject({
      $type: 'number',
      $value: { value: 1.5 },
    });
    expect(tokens['line-height.fixed']).toMatchObject({
      $type: 'dimension',
      $value: { value: 24, unit: 'px' },
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/resolve-tokens.test.ts`
Expected: FAIL, cannot resolve `../src/tokens/resolve-tokens.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/tokens/resolve-tokens.ts`**

```ts
import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { Mode, Token, TokenId } from '../ir/types.js';
import { CATEGORY_TYPES, type TokenCategory } from './categories.js';
import type { RawToken } from './parse-tokens.js';
import {
  parseLiteralForTypes,
  parseVarRef,
  type TokenType,
  type TokenValue,
} from './values.js';

type Entry =
  | { kind: 'literal'; type: TokenType; value: TokenValue; location: SourceLocation }
  | { kind: 'alias'; ref: TokenId; location: SourceLocation };

interface Pending {
  id: TokenId;
  category: TokenCategory;
  path: string[];
  cssName: string;
  /** True when declared only in :root. */
  declaredInvariant: boolean;
  entries: Map<Mode, Entry>;
  location: SourceLocation;
}

interface Resolved {
  type: TokenType;
  value: TokenValue;
}

export function resolveTokens(
  raws: RawToken[],
  config: DsConfig,
  diag: Diagnostics,
): Record<TokenId, Token> {
  const grouped = groupAndValidate(raws, config, diag);
  const pending = parseEntries(grouped, config, diag);
  const reported = new Set<string>();

  const resolveEntry = (
    id: TokenId,
    mode: Mode,
    stack: TokenId[],
  ): Resolved | null => {
    const token = pending.get(id);
    if (!token) {
      return null;
    }
    const entry =
      token.entries.get(mode) ??
      (token.declaredInvariant ? token.entries.get(config.defaultMode) : undefined);
    if (!entry) {
      return null;
    }
    if (entry.kind === 'literal') {
      return { type: entry.type, value: entry.value };
    }
    const key = `${id}@${mode}`;
    if (stack.includes(entry.ref)) {
      if (!reported.has(key)) {
        reported.add(key);
        diag.add(
          'DS-E013',
          `Alias cycle: ${[...stack, id, entry.ref].join(' -> ')}`,
          entry.location,
        );
      }
      return null;
    }
    if (!pending.has(entry.ref)) {
      if (!reported.has(key)) {
        reported.add(key);
        diag.add(
          'DS-E013',
          `"${token.cssName}" references unknown token "${entry.ref}"`,
          entry.location,
        );
      }
      return null;
    }
    const target = resolveEntry(entry.ref, mode, [...stack, id]);
    if (!target) {
      return null;
    }
    if (!CATEGORY_TYPES[token.category].includes(target.type)) {
      if (!reported.has(key)) {
        reported.add(key);
        diag.add(
          'DS-E014',
          `"${token.cssName}" (category ${token.category}) aliases "${entry.ref}" of type ${target.type}; allowed: ${CATEGORY_TYPES[token.category].join(', ')}`,
          entry.location,
        );
      }
      return null;
    }
    return target;
  };

  const tokens: Record<TokenId, Token> = {};
  for (const id of [...pending.keys()].sort()) {
    const token = pending.get(id)!;
    const perMode: Record<Mode, TokenValue> = {};
    let type: TokenType | null = null;
    let failed = false;
    for (const mode of config.modes) {
      const resolved = resolveEntry(id, mode, []);
      if (!resolved) {
        failed = true;
        break;
      }
      perMode[mode] = resolved.value;
      type = resolved.type;
    }
    if (failed || !type) {
      continue;
    }
    const serialized = config.modes.map((m) => stableStringify(perMode[m]));
    const invariant = serialized.every((s) => s === serialized[0]);
    const aliasByMode: Partial<Record<Mode, TokenId>> = {};
    for (const [mode, entry] of token.entries) {
      if (entry.kind === 'alias') {
        aliasByMode[mode] = entry.ref;
      }
    }
    const hasAlias = Object.keys(aliasByMode).length > 0;
    const base = {
      $type: type,
      category: token.category,
      path: token.path,
      cssName: token.cssName,
      source: token.location,
    };
    // Token is a discriminated union on modeInvariant, so build each arm explicitly.
    if (invariant) {
      const out: Token = {
        ...base,
        modeInvariant: true,
        $value: perMode[config.defaultMode],
      };
      if (hasAlias) {
        out.alias = aliasByMode[config.defaultMode];
      }
      tokens[id] = out;
    } else {
      const out: Token = { ...base, modeInvariant: false, $value: perMode };
      if (hasAlias) {
        out.alias = aliasByMode;
      }
      tokens[id] = out;
    }
  }
  return tokens;
}

function groupAndValidate(
  raws: RawToken[],
  config: DsConfig,
  diag: Diagnostics,
): Map<TokenId, { raw: RawToken; byMode: Map<Mode, RawToken> }> {
  const grouped = new Map<TokenId, { raw: RawToken; byMode: Map<Mode, RawToken> }>();
  for (const raw of raws) {
    const group = grouped.get(raw.id) ?? { raw, byMode: new Map() };
    if (group.byMode.has(raw.mode)) {
      diag.add(
        'DS-E016',
        `"${raw.cssName}" is declared twice for mode "${raw.mode}"`,
        raw.location,
      );
      continue;
    }
    group.byMode.set(raw.mode, raw);
    grouped.set(raw.id, group);
  }
  for (const [id, group] of grouped) {
    const modes = [...group.byMode.keys()];
    const onlyDefault = modes.length === 1 && modes[0] === config.defaultMode;
    const all = config.modes.every((m) => group.byMode.has(m));
    if (!onlyDefault && !all) {
      const missing = config.modes.filter((m) => !group.byMode.has(m));
      diag.add(
        'DS-E015',
        `"${group.raw.cssName}" (${id}) is missing in mode(s): ${missing.join(', ')}. Declare it in every mode or only in :root.`,
        group.raw.location,
      );
      grouped.delete(id);
    }
  }
  return grouped;
}

function parseEntries(
  grouped: Map<TokenId, { raw: RawToken; byMode: Map<Mode, RawToken> }>,
  config: DsConfig,
  diag: Diagnostics,
): Map<TokenId, Pending> {
  const pending = new Map<TokenId, Pending>();
  for (const [id, group] of grouped) {
    const entries = new Map<Mode, Entry>();
    let ok = true;
    for (const [mode, raw] of group.byMode) {
      const ref = parseVarRef(raw.raw, config.prefix);
      if (ref) {
        if (!ref.ok) {
          diag.add('DS-E012', `"${raw.cssName}": ${ref.reason}`, raw.location);
          ok = false;
          continue;
        }
        entries.set(mode, { kind: 'alias', ref: ref.id, location: raw.location });
        continue;
      }
      const types = CATEGORY_TYPES[raw.category];
      const literal = parseLiteralForTypes(raw.raw, types, config.prefix);
      if (!literal) {
        diag.add(
          'DS-E012',
          `"${raw.cssName}": "${raw.raw}" is not a valid ${types.join(' or ')} value`,
          raw.location,
        );
        ok = false;
        continue;
      }
      entries.set(mode, {
        kind: 'literal',
        type: literal.type,
        value: literal.value,
        location: raw.location,
      });
    }
    if (!ok) {
      continue;
    }
    pending.set(id, {
      id,
      category: group.raw.category,
      path: group.raw.path,
      cssName: group.raw.cssName,
      declaredInvariant:
        group.byMode.size === 1 && group.byMode.has(config.defaultMode),
      entries,
      location: group.raw.location,
    });
  }
  return pending;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/resolve-tokens.test.ts`
Expected: PASS, 9 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/tokens/resolve-tokens.ts`, `test/resolve-tokens.test.ts` created.

---

## Task 9: Manifest schema and loader

**Files:**
- Create: `packages/ds-compiler/src/components/manifest.ts`
- Create: `packages/ds-compiler/scripts/emit-manifest-schema.ts`
- Create: `packages/ds-compiler/schemas/manifest.schema.json` (generated by the script)
- Test: `packages/ds-compiler/test/manifest.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import {
  loadManifest,
  manifestJsonSchema,
  parseManifest,
} from '../src/components/manifest.js';

const valid = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'focus-visible', 'disabled'],
  slots: { root: { element: 'button' }, icon: { optional: true } },
  preview: { label: 'Button' },
  targets: { tailwind: {}, mui: { excluded: 'not yet' } },
};

describe('parseManifest', () => {
  it('accepts a valid manifest and applies defaults', () => {
    const diag = new Diagnostics();
    const m = parseManifest(valid, 'button.manifest.json', 'button', diag);
    expect(diag.items).toEqual([]);
    expect(m).toEqual({
      name: 'button',
      displayName: 'Button',
      axes: valid.axes,
      states: ['hover', 'focus-visible', 'disabled'],
      slots: {
        root: { element: 'button', optional: false },
        icon: { element: 'span', optional: true },
      },
      preview: { label: 'Button' },
      targets: { tailwind: {}, mui: { excluded: 'not yet' } },
    });
  });

  it('adds an implicit root slot with element div when missing', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'card', displayName: 'Card' },
      'card.manifest.json',
      'card',
      diag,
    );
    expect(m?.slots).toEqual({ root: { element: 'div', optional: false } });
    expect(m?.axes).toEqual({});
    expect(m?.states).toEqual([]);
    expect(m?.targets).toEqual({});
  });

  it('reports DS-E020 for missing displayName, unknown keys, and non-kebab identifiers', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      { name: 'button', colour: 'x', slots: { Icon: {} } },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('displayName');
    expect(diag.errors[0].message).toContain('colour');
    expect(diag.errors[0].message).toContain('Icon');
  });

  it('reports DS-E020 for a bad axis default and duplicate states when the shape is valid', () => {
    const diag = new Diagnostics();
    const m = parseManifest(
      {
        name: 'button',
        displayName: 'B',
        axes: { size: { values: ['sm'], default: 'lg' } },
        states: ['hover', 'hover'],
      },
      'button.manifest.json',
      'button',
      diag,
    );
    expect(m).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E020');
    expect(diag.errors[0].message).toContain('default');
    expect(diag.errors[0].message).toContain('hover');
  });

  it('reports DS-E021 when the name does not match the directory', () => {
    const diag = new Diagnostics();
    expect(parseManifest(valid, 'x/button.manifest.json', 'btn', diag)).toBeNull();
    expect(diag.errors[0].code).toBe('DS-E021');
  });
});

describe('loadManifest', () => {
  it('reads and validates a file, reporting DS-E020 for bad JSON', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ds-manifest-'));
    const good = join(dir, 'button.manifest.json');
    writeFileSync(good, JSON.stringify(valid));
    const bad = join(dir, 'bad.manifest.json');
    writeFileSync(bad, '{');
    const diag = new Diagnostics();
    expect(loadManifest(good, 'button', diag)?.name).toBe('button');
    expect(loadManifest(bad, 'bad', diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E020']);
  });
});

describe('manifestJsonSchema', () => {
  it('exports a JSON schema with the top-level properties', () => {
    const schema = manifestJsonSchema() as {
      properties: Record<string, unknown>;
      required: string[];
    };
    expect(Object.keys(schema.properties)).toEqual(
      expect.arrayContaining(['name', 'displayName', 'axes', 'states', 'slots', 'targets']),
    );
    expect(schema.required).toEqual(expect.arrayContaining(['name', 'displayName']));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/manifest.test.ts`
Expected: FAIL, cannot resolve `../src/components/manifest.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/components/manifest.ts`**

```ts
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import type { Diagnostics } from '../errors.js';
import type { ManifestTargets } from '../ir/types.js';

export const identifier = z
  .string()
  .regex(
    /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
    'must be kebab-case: lowercase letters and digits separated by single hyphens',
  );

const axisSchema = z.strictObject({
  values: z.array(identifier).min(1),
  default: identifier,
});

const slotSchema = z.strictObject({
  element: z
    .string()
    .regex(/^[a-z][a-z0-9-]*$/, 'must be an HTML element name')
    .default('span'),
  optional: z.boolean().default(false),
});

const excludedSchema = z.strictObject({ excluded: z.string().min(1) });

export const manifestSchema = z.strictObject({
  $schema: z.string().optional(),
  name: identifier,
  displayName: z.string().min(1),
  description: z.string().optional(),
  axes: z.record(identifier, axisSchema).default({}),
  states: z.array(identifier).default([]),
  slots: z.record(identifier, slotSchema).default({}),
  preview: z.record(z.string(), z.string()).default({}),
  baseline: z.union([z.literal(false), z.array(z.string())]).optional(),
  targets: z
    .record(identifier, z.union([excludedSchema, z.record(z.string(), z.unknown())]))
    .default({}),
});

export type Manifest = Omit<z.infer<typeof manifestSchema>, '$schema' | 'targets'> & {
  targets: ManifestTargets;
};

export const MANIFEST_SUFFIX = '.manifest.json';

/** Validates already-parsed JSON. `expectedName` is the component directory name. */
export function parseManifest(
  json: unknown,
  filePath: string,
  expectedName: string,
  diag: Diagnostics,
): Manifest | null {
  const location = { file: filePath, line: 1, column: 1 };
  const parsed = manifestSchema.safeParse(json);
  const problems: string[] = [];
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      problems.push(`${issue.path.join('.') || '(root)'}: ${issue.message}`);
    }
  }
  if (parsed.success) {
    const m = parsed.data;
    for (const [axis, def] of Object.entries(m.axes)) {
      if (!def.values.includes(def.default)) {
        problems.push(
          `axes.${axis}.default: "${def.default}" is not one of [${def.values.join(', ')}]`,
        );
      }
      if (new Set(def.values).size !== def.values.length) {
        problems.push(`axes.${axis}.values: duplicate values`);
      }
    }
    const seen = new Set<string>();
    for (const s of m.states) {
      if (seen.has(s)) {
        problems.push(`states: duplicate state "${s}"`);
      }
      seen.add(s);
    }
  }
  if (problems.length > 0) {
    diag.add('DS-E020', problems.join('; '), location);
    return null;
  }
  const data = parsed.data!;
  if (data.name !== expectedName) {
    diag.add(
      'DS-E021',
      `manifest.name "${data.name}" does not match component directory "${expectedName}"`,
      location,
    );
    return null;
  }
  const { $schema: _schema, ...rest } = data;
  const root = rest.slots.root ?? { element: 'div', optional: false };
  const otherSlots = Object.fromEntries(
    Object.entries(rest.slots).filter(([k]) => k !== 'root'),
  );
  return {
    ...rest,
    slots: { root, ...otherSlots },
    targets: rest.targets as ManifestTargets,
  };
}

export function loadManifest(
  filePath: string,
  expectedName: string,
  diag: Diagnostics,
): Manifest | null {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    diag.add('DS-E020', `not valid JSON: ${(err as Error).message}`, {
      file: filePath,
      line: 1,
      column: 1,
    });
    return null;
  }
  return parseManifest(json, filePath, expectedName, diag);
}

export function manifestJsonSchema(): Record<string, unknown> {
  return {
    $id: 'https://github.com/evoko/workplace-public-packages/packages/ds-compiler/schemas/manifest.schema.json',
    title: 'Design-system component manifest',
    ...z.toJSONSchema(manifestSchema, { target: 'draft-2020-12' }),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/manifest.test.ts`
Expected: PASS, 7 tests. If `z.toJSONSchema` complains about `z.unknown()` inside a record, pass `{ target: 'draft-2020-12', unrepresentable: 'any' }`.

- [ ] **Step 5: Create `packages/ds-compiler/scripts/emit-manifest-schema.ts`**

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestJsonSchema } from '../src/components/manifest.js';
import { stableStringify } from '../src/ir/serialize.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'schemas', 'manifest.schema.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${stableStringify(manifestJsonSchema())}\n`);
console.log(`wrote ${out}`);
```

- [ ] **Step 6: Generate the schema file**

Run: `npm run schema -w packages/ds-compiler`
Expected: prints `wrote …/schemas/manifest.schema.json`. Open the file and confirm it contains `"title": "Design-system component manifest"` and a `properties.name` entry.

- [ ] **Step 7: Checkpoint**

Report: `src/components/manifest.ts`, `scripts/emit-manifest-schema.ts`, `schemas/manifest.schema.json`, `test/manifest.test.ts` created.

---

## Task 10: State mapping and selector grammar

**Files:**
- Create: `packages/ds-compiler/src/components/states.ts`
- Create: `packages/ds-compiler/src/components/selector.ts`
- Test: `packages/ds-compiler/test/selector.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import type { Manifest } from '../src/components/manifest.js';
import { parseSelector } from '../src/components/selector.js';
import { sortStates } from '../src/components/states.js';
import { Diagnostics } from '../src/errors.js';

const manifest: Manifest = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'focus-visible', 'active', 'disabled', 'pressed', 'open'],
  slots: {
    root: { element: 'button', optional: false },
    icon: { element: 'span', optional: true },
  },
  preview: {},
  targets: {},
};

const loc = { file: 'button.css', line: 1, column: 1 };

function parse(selector: string) {
  const diag = new Diagnostics();
  const result = parseSelector(selector, manifest, 'fx', loc, diag);
  return { result, codes: diag.errors.map((e) => e.code), diag };
}

describe('sortStates', () => {
  it('orders known states canonically and unknown ones alphabetically after', () => {
    expect(sortStates(['disabled', 'zeta', 'hover', 'alpha', 'active'])).toEqual([
      'hover',
      'active',
      'disabled',
      'alpha',
      'zeta',
    ]);
  });
});

describe('parseSelector', () => {
  it('parses the bare root', () => {
    expect(parse('.fx-button').result).toEqual({ slot: 'root', axes: {}, states: [] });
  });

  it('parses axes, states, and a slot', () => {
    expect(
      parse('.fx-button[data-variant="outline"][data-size="sm"]:hover .fx-button__icon')
        .result,
    ).toEqual({
      slot: 'icon',
      axes: { variant: 'outline', size: 'sm' },
      states: ['hover'],
    });
  });

  it('maps attribute states and sorts them canonically', () => {
    expect(parse('.fx-button[aria-pressed="true"]:disabled:hover').result).toEqual({
      slot: 'root',
      axes: {},
      states: ['hover', 'pressed', 'disabled'],
    });
    expect(parse('.fx-button[disabled]').result?.states).toEqual(['disabled']);
    expect(parse('.fx-button[aria-disabled="true"]').result?.states).toEqual(['disabled']);
    expect(parse('.fx-button[data-state="open"]').result?.states).toEqual(['open']);
  });

  it('dedupes a state expressed twice', () => {
    expect(parse('.fx-button:disabled[disabled]').result?.states).toEqual(['disabled']);
  });

  it('reports DS-E030 for a wrong root class, extra classes, and unknown pseudo-classes', () => {
    expect(parse('.fx-btn').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button.primary').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button:visited').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button[title="x"]').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button .fx-button__icon.extra').codes).toEqual(['DS-E030']);
    expect(parse('.fx-button .fx-other__icon').codes).toEqual(['DS-E030']);
  });

  it('reports DS-E031 for unknown axes and values', () => {
    expect(parse('.fx-button[data-tone="loud"]').codes).toEqual(['DS-E031']);
    expect(parse('.fx-button[data-variant="ghost"]').codes).toEqual(['DS-E031']);
    expect(parse('.fx-button[data-variant]').codes).toEqual(['DS-E031']);
  });

  it('reports DS-E032 for an unknown slot and for targeting root as a slot', () => {
    expect(parse('.fx-button .fx-button__label').codes).toEqual(['DS-E032']);
    expect(parse('.fx-button .fx-button__root').codes).toEqual(['DS-E032']);
  });

  it('reports DS-E033 for a state not declared in the manifest', () => {
    expect(parse('.fx-button[aria-selected="true"]').codes).toEqual(['DS-E033']);
    expect(parse('.fx-button[data-state="closed"]').codes).toEqual(['DS-E033']);
  });

  it('reports DS-E034 for forbidden features', () => {
    expect(parse('button.fx-button').codes).toEqual(['DS-E034']);
    expect(parse('#id.fx-button').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button > .fx-button__icon').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button + .fx-button').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button::before').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button .fx-button__icon:hover').codes).toEqual(['DS-E034']);
    expect(parse('.fx-button .fx-button__icon .fx-button__icon').codes).toEqual(['DS-E034']);
    expect(parse('*').codes).toEqual(['DS-E034']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/selector.test.ts`
Expected: FAIL, cannot resolve `../src/components/selector.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/components/states.ts`**

```ts
/** Pseudo-class name (without the colon) to state name. */
export const PSEUDO_STATES: Record<string, string> = {
  hover: 'hover',
  active: 'active',
  'focus-visible': 'focus-visible',
  disabled: 'disabled',
};

const ARIA_TRUE_STATES: Record<string, string> = {
  'aria-pressed': 'pressed',
  'aria-selected': 'selected',
  'aria-expanded': 'expanded',
  'aria-checked': 'checked',
};

/** Attribute selector to state name, or null when the attribute is not a state. */
export function stateForAttribute(
  attribute: string,
  value: string | undefined,
): string | null {
  if (attribute === 'disabled' && value === undefined) {
    return 'disabled';
  }
  if (attribute === 'aria-disabled' && value === 'true') {
    return 'disabled';
  }
  if (attribute in ARIA_TRUE_STATES && value === 'true') {
    return ARIA_TRUE_STATES[attribute];
  }
  if (attribute === 'data-state' && value !== undefined && value !== '') {
    return value;
  }
  return null;
}

/** Canonical cascade order. States not listed sort after these, alphabetically. */
export const STATE_ORDER = [
  'hover',
  'focus-visible',
  'active',
  'pressed',
  'selected',
  'expanded',
  'checked',
  'disabled',
] as const;

export function compareStates(a: string, b: string): number {
  const ia = STATE_ORDER.indexOf(a as (typeof STATE_ORDER)[number]);
  const ib = STATE_ORDER.indexOf(b as (typeof STATE_ORDER)[number]);
  if (ia !== -1 && ib !== -1) {
    return ia - ib;
  }
  if (ia !== -1) {
    return -1;
  }
  if (ib !== -1) {
    return 1;
  }
  return a.localeCompare(b);
}

export function sortStates(states: readonly string[]): string[] {
  return [...new Set(states)].sort(compareStates);
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/components/selector.ts`**

```ts
import selectorParser, {
  type Node as SelectorNode,
  type Root as SelectorRoot,
} from 'postcss-selector-parser';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { Manifest } from './manifest.js';
import { PSEUDO_STATES, sortStates, stateForAttribute } from './states.js';

export interface ParsedSelector {
  slot: string;
  axes: Record<string, string>;
  states: string[];
}

/**
 * Parses one selector (no commas) against the grammar:
 *   .<prefix>-<name>[data-<axis>="<value>"]*<state>*  [ .<prefix>-<name>__<slot> ]
 * Reports exactly one diagnostic and returns null on the first violation.
 */
export function parseSelector(
  selector: string,
  manifest: Manifest,
  prefix: string,
  location: SourceLocation,
  diag: Diagnostics,
): ParsedSelector | null {
  const fail = (
    code: 'DS-E030' | 'DS-E031' | 'DS-E032' | 'DS-E033' | 'DS-E034',
    message: string,
  ): null => {
    diag.add(code, `"${selector}": ${message}`, location);
    return null;
  };

  let ast: SelectorRoot;
  try {
    ast = selectorParser().astSync(selector);
  } catch (err) {
    return fail('DS-E030', `cannot parse selector (${(err as Error).message})`);
  }
  if (ast.nodes.length !== 1) {
    return fail('DS-E030', 'expected a single selector');
  }

  const compounds: SelectorNode[][] = [[]];
  for (const node of ast.nodes[0].nodes) {
    if (node.type === 'combinator') {
      if (node.value.trim() !== '') {
        return fail('DS-E034', `combinator "${node.value.trim()}" is not allowed; only a descendant space`);
      }
      compounds.push([]);
      continue;
    }
    compounds[compounds.length - 1].push(node);
  }
  if (compounds.length > 2) {
    return fail('DS-E034', 'at most one descendant combinator (root then slot) is allowed');
  }

  const rootClass = `${prefix}-${manifest.name}`;
  let foundRoot = false;
  const axes: Record<string, string> = {};
  const states: string[] = [];

  for (const node of compounds[0]) {
    switch (node.type) {
      case 'class': {
        if (node.value === rootClass && !foundRoot) {
          foundRoot = true;
          break;
        }
        return fail('DS-E030', `unexpected class ".${node.value}"; the root compound may only contain .${rootClass}`);
      }
      case 'attribute': {
        const attr = node.attribute;
        const value = node.value;
        if (attr.startsWith('data-') && attr !== 'data-state') {
          const axis = attr.slice('data-'.length);
          const def = manifest.axes[axis];
          if (!def) {
            return fail('DS-E031', `unknown axis "${axis}"; declared axes: ${Object.keys(manifest.axes).join(', ') || '(none)'}`);
          }
          if (value === undefined || !def.values.includes(value)) {
            return fail('DS-E031', `axis "${axis}" has no value "${value ?? ''}"; allowed: ${def.values.join(', ')}`);
          }
          if (axis in axes) {
            return fail('DS-E030', `axis "${axis}" selected twice`);
          }
          axes[axis] = value;
          break;
        }
        const state = stateForAttribute(attr, value);
        if (!state) {
          return fail('DS-E030', `attribute [${attr}${value === undefined ? '' : `="${value}"`}] is not a recognized state`);
        }
        states.push(state);
        break;
      }
      case 'pseudo': {
        if (node.value.startsWith('::')) {
          return fail('DS-E034', `pseudo-element "${node.value}" is not allowed`);
        }
        const state = PSEUDO_STATES[node.value.slice(1)];
        if (!state) {
          return fail('DS-E030', `pseudo-class "${node.value}" is not a recognized state; allowed: ${Object.keys(PSEUDO_STATES).map((p) => `:${p}`).join(', ')}`);
        }
        states.push(state);
        break;
      }
      case 'tag':
        return fail('DS-E034', `element selector "${node.value}" is not allowed`);
      case 'id':
        return fail('DS-E034', `id selector "#${node.value}" is not allowed`);
      case 'universal':
        return fail('DS-E034', 'universal selector "*" is not allowed');
      case 'nesting':
        return fail('DS-E034', 'nesting selector "&" is not allowed');
      default:
        return fail('DS-E030', `unexpected selector part "${node.toString()}"`);
    }
  }
  if (!foundRoot) {
    return fail('DS-E030', `selector must start with .${rootClass}`);
  }

  let slot = 'root';
  if (compounds[1]) {
    const nodes = compounds[1];
    if (nodes.some((n) => n.type === 'pseudo' || n.type === 'attribute')) {
      return fail('DS-E034', 'states and axes go on the root compound, not on the slot');
    }
    if (nodes.length !== 1 || nodes[0].type !== 'class') {
      return fail('DS-E030', 'the slot compound must be exactly one class');
    }
    const cls = nodes[0].value;
    const slotPrefix = `${rootClass}__`;
    if (!cls.startsWith(slotPrefix)) {
      return fail('DS-E030', `slot class ".${cls}" must start with .${slotPrefix}`);
    }
    slot = cls.slice(slotPrefix.length);
    if (slot === 'root' || !manifest.slots[slot]) {
      return fail('DS-E032', `unknown slot "${slot}"; declared slots: ${Object.keys(manifest.slots).filter((s) => s !== 'root').join(', ') || '(none)'}`);
    }
  }

  for (const state of states) {
    if (!manifest.states.includes(state)) {
      return fail('DS-E033', `state "${state}" is not declared in manifest.states [${manifest.states.join(', ')}]`);
    }
  }

  return { slot, axes, states: sortStates(states) };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/selector.test.ts`
Expected: PASS, 10 tests. If postcss-selector-parser reports `[data-variant]` with `value` as `undefined`, the DS-E031 expectation holds; if it reports an empty string, the `value === undefined ||` check still catches it through `includes('')`.

- [ ] **Step 6: Checkpoint**

Report: `src/components/states.ts`, `src/components/selector.ts`, `test/selector.test.ts` created.

---

## Task 11: Property table, shorthand expansion, and literal parsing for properties

**Files:**
- Create: `packages/ds-compiler/src/components/properties.ts`
- Test: `packages/ds-compiler/test/properties.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import {
  BASELINE_PROPERTIES,
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
} from '../src/components/properties.js';

describe('PROPERTY_TABLE', () => {
  it('marks design-value properties as token-required and layout properties as keyword-only', () => {
    expect(PROPERTY_TABLE['color'].tokenRequired).toBe(true);
    expect(PROPERTY_TABLE['color'].categories).toEqual(['color']);
    expect(PROPERTY_TABLE['padding-top'].categories).toEqual(['space']);
    expect(PROPERTY_TABLE['border-top-left-radius'].categories).toEqual(['radius']);
    expect(PROPERTY_TABLE['display'].tokenRequired).toBe(false);
    expect(PROPERTY_TABLE['display'].literals).toContain('inline-flex');
    expect(PROPERTY_TABLE['width'].literalKinds).toContain('dimension');
    expect(PROPERTY_TABLE['border']).toBeUndefined();
    expect(PROPERTY_TABLE['colr']).toBeUndefined();
  });

  it('has no overlap between the table and forbidden shorthands', () => {
    for (const p of FORBIDDEN_SHORTHANDS) {
      expect(PROPERTY_TABLE[p]).toBeUndefined();
    }
  });

  it('baseline properties are all in the table', () => {
    for (const p of BASELINE_PROPERTIES) {
      expect(PROPERTY_TABLE[p]).toBeDefined();
    }
  });
});

describe('expandShorthand', () => {
  it('returns null for non-shorthands', () => {
    expect(expandShorthand('color', 'red')).toBeNull();
  });
  it('expands padding and margin with 1 to 4 values', () => {
    expect(expandShorthand('padding', 'var(--fx-space-2)')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'var(--fx-space-2)',
        'padding-right': 'var(--fx-space-2)',
        'padding-bottom': 'var(--fx-space-2)',
        'padding-left': 'var(--fx-space-2)',
      },
    });
    expect(expandShorthand('margin', '0 auto')).toEqual({
      ok: true,
      declarations: {
        'margin-top': '0',
        'margin-right': 'auto',
        'margin-bottom': '0',
        'margin-left': 'auto',
      },
    });
    expect(expandShorthand('padding', 'a b c')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'a',
        'padding-right': 'b',
        'padding-bottom': 'c',
        'padding-left': 'b',
      },
    });
    expect(expandShorthand('padding', 'a b c d')).toEqual({
      ok: true,
      declarations: {
        'padding-top': 'a',
        'padding-right': 'b',
        'padding-bottom': 'c',
        'padding-left': 'd',
      },
    });
  });
  it('expands border-radius corners, border sides, and gap', () => {
    expect(expandShorthand('border-radius', 'var(--fx-radius-md)')).toMatchObject({
      ok: true,
      declarations: {
        'border-top-left-radius': 'var(--fx-radius-md)',
        'border-bottom-left-radius': 'var(--fx-radius-md)',
      },
    });
    expect(expandShorthand('border-style', 'solid')).toMatchObject({
      ok: true,
      declarations: { 'border-top-style': 'solid', 'border-left-style': 'solid' },
    });
    expect(expandShorthand('gap', 'a b')).toEqual({
      ok: true,
      declarations: { 'row-gap': 'a', 'column-gap': 'b' },
    });
    expect(expandShorthand('gap', 'a')).toEqual({
      ok: true,
      declarations: { 'row-gap': 'a', 'column-gap': 'a' },
    });
  });
  it('rejects wrong value counts', () => {
    expect(expandShorthand('padding', 'a b c d e')).toEqual({
      ok: false,
      reason: 'expected 1 to 4 values, got 5',
    });
    expect(expandShorthand('gap', 'a b c')).toEqual({
      ok: false,
      reason: 'expected 1 to 2 values, got 3',
    });
  });
});

describe('parseLiteralForProperty', () => {
  it('accepts listed keywords', () => {
    expect(parseLiteralForProperty('display', 'flex')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'flex',
    });
    expect(parseLiteralForProperty('display', 'flexbox')).toBeNull();
  });
  it('accepts dimension and number literals where allowed', () => {
    expect(parseLiteralForProperty('width', '100%')).toEqual({
      kind: 'literal',
      type: 'dimension',
      value: { value: 100, unit: '%' },
    });
    expect(parseLiteralForProperty('width', 'auto')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'auto',
    });
    expect(parseLiteralForProperty('flex-grow', '1')).toEqual({
      kind: 'literal',
      type: 'number',
      value: 1,
    });
    expect(parseLiteralForProperty('opacity', '0.5')).toEqual({
      kind: 'literal',
      type: 'number',
      value: 0.5,
    });
  });
  it('accepts identifier lists for transition-property', () => {
    expect(parseLiteralForProperty('transition-property', 'color,  background-color')).toEqual({
      kind: 'literal',
      type: 'string',
      value: 'color, background-color',
    });
  });
  it('rejects literals for token-required properties except the listed escape hatches', () => {
    expect(parseLiteralForProperty('color', '#fff')).toBeNull();
    expect(parseLiteralForProperty('color', 'transparent')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: 'transparent',
    });
    expect(parseLiteralForProperty('padding-top', '8px')).toBeNull();
    expect(parseLiteralForProperty('padding-top', '0')).toEqual({
      kind: 'literal',
      type: 'keyword',
      value: '0',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/properties.test.ts`
Expected: FAIL, cannot resolve `../src/components/properties.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/components/properties.ts`**

```ts
import valueParser from 'postcss-value-parser';
import type { IRValueLiteral } from '../ir/types.js';
import type { TokenCategory } from '../tokens/categories.js';
import { normalizeColor, parseDimension, parseNumber } from '../tokens/values.js';

export type LiteralKind = 'dimension' | 'number' | 'color' | 'identifier-list';

export interface PropertySpec {
  /** Token categories accepted via var(). Empty when the property never takes a token. */
  categories: readonly TokenCategory[];
  /** When true, only a token reference or one of `literals` is accepted. */
  tokenRequired: boolean;
  /** Exact keyword literals accepted. */
  literals: readonly string[];
  /** Free-form literal kinds accepted (only meaningful when tokenRequired is false). */
  literalKinds: readonly LiteralKind[];
}

const token = (
  categories: readonly TokenCategory[],
  literals: readonly string[] = [],
): PropertySpec => ({ categories, tokenRequired: true, literals, literalKinds: [] });

const keyword = (literals: readonly string[]): PropertySpec => ({
  categories: [],
  tokenRequired: false,
  literals,
  literalKinds: [],
});

const free = (
  categories: readonly TokenCategory[],
  literalKinds: readonly LiteralKind[],
  literals: readonly string[] = [],
): PropertySpec => ({ categories, tokenRequired: false, literals, literalKinds });

const COLOR_ESCAPES = ['transparent', 'currentColor', 'inherit'] as const;
const SIDES = ['top', 'right', 'bottom', 'left'] as const;
const CORNERS = ['top-left', 'top-right', 'bottom-right', 'bottom-left'] as const;
const SIZE_KEYWORDS = ['auto', 'none', 'fit-content', 'max-content', 'min-content'] as const;
const ALIGN = ['stretch', 'center', 'flex-start', 'flex-end', 'start', 'end', 'baseline'] as const;
const JUSTIFY = [
  'center', 'flex-start', 'flex-end', 'start', 'end',
  'space-between', 'space-around', 'space-evenly', 'stretch',
] as const;

export const PROPERTY_TABLE: Record<string, PropertySpec> = {
  // colors
  color: token(['color'], COLOR_ESCAPES),
  'background-color': token(['color'], COLOR_ESCAPES),
  'outline-color': token(['color'], COLOR_ESCAPES),
  'caret-color': token(['color'], COLOR_ESCAPES),
  'text-decoration-color': token(['color'], COLOR_ESCAPES),
  fill: token(['color'], COLOR_ESCAPES),
  stroke: token(['color'], COLOR_ESCAPES),
  ...Object.fromEntries(SIDES.map((s) => [`border-${s}-color`, token(['color'], COLOR_ESCAPES)])),
  // spacing
  ...Object.fromEntries(SIDES.map((s) => [`padding-${s}`, token(['space'], ['0'])])),
  ...Object.fromEntries(SIDES.map((s) => [`margin-${s}`, token(['space'], ['0', 'auto'])])),
  'row-gap': token(['space'], ['0']),
  'column-gap': token(['space'], ['0']),
  'outline-offset': token(['space'], ['0']),
  'text-underline-offset': token(['space'], ['auto']),
  ...Object.fromEntries(SIDES.map((s) => [s, token(['space', 'size'], ['0', 'auto'])])),
  // radius
  ...Object.fromEntries(CORNERS.map((c) => [`border-${c}-radius`, token(['radius'], ['0'])])),
  // borders and outlines
  ...Object.fromEntries(SIDES.map((s) => [`border-${s}-width`, token(['border-width'], ['0'])])),
  ...Object.fromEntries(SIDES.map((s) => [`border-${s}-style`, keyword(['none', 'solid', 'dashed', 'dotted'])])),
  'outline-width': token(['border-width'], ['0']),
  'outline-style': keyword(['none', 'solid', 'dashed', 'dotted', 'auto']),
  'stroke-width': free(['border-width'], ['number', 'dimension']),
  'text-decoration-thickness': token(['border-width'], ['auto', 'from-font']),
  // typography
  'font-family': token(['font-family']),
  'font-size': token(['font-size']),
  'font-weight': token(['font-weight']),
  'line-height': token(['line-height'], ['normal']),
  'letter-spacing': token(['letter-spacing'], ['normal']),
  'font-style': keyword(['normal', 'italic']),
  'text-align': keyword(['left', 'right', 'center', 'start', 'end', 'justify']),
  'vertical-align': keyword(['baseline', 'middle', 'top', 'bottom', 'text-top', 'text-bottom']),
  'text-transform': keyword(['none', 'uppercase', 'lowercase', 'capitalize']),
  'text-decoration-line': keyword(['none', 'underline', 'line-through']),
  'text-decoration-style': keyword(['solid', 'dashed', 'dotted', 'wavy']),
  'white-space': keyword(['normal', 'nowrap', 'pre', 'pre-wrap', 'pre-line']),
  'text-overflow': keyword(['clip', 'ellipsis']),
  // effects and motion
  'box-shadow': token(['shadow'], ['none']),
  opacity: free(['opacity'], ['number']),
  'transition-property': free([], ['identifier-list'], ['none', 'all']),
  'transition-duration': token(['duration']),
  'transition-delay': token(['duration']),
  'transition-timing-function': token(['easing']),
  // sizing
  width: free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  height: free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'min-width': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'min-height': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'max-width': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'max-height': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'flex-basis': free(['size', 'space'], ['dimension'], SIZE_KEYWORDS),
  'flex-grow': free([], ['number']),
  'flex-shrink': free([], ['number']),
  order: free([], ['number']),
  'z-index': free(['z-index'], ['number'], ['auto']),
  // layout
  display: keyword(['none', 'block', 'inline', 'inline-block', 'flex', 'inline-flex', 'grid', 'inline-grid', 'contents']),
  position: keyword(['static', 'relative', 'absolute', 'fixed', 'sticky']),
  'box-sizing': keyword(['border-box', 'content-box']),
  'align-items': keyword(ALIGN),
  'align-self': keyword([...ALIGN, 'auto']),
  'align-content': keyword(JUSTIFY),
  'justify-content': keyword(JUSTIFY),
  'justify-items': keyword(JUSTIFY),
  'justify-self': keyword([...JUSTIFY, 'auto']),
  'flex-direction': keyword(['row', 'row-reverse', 'column', 'column-reverse']),
  'flex-wrap': keyword(['nowrap', 'wrap', 'wrap-reverse']),
  overflow: keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  'overflow-x': keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  'overflow-y': keyword(['visible', 'hidden', 'clip', 'scroll', 'auto']),
  visibility: keyword(['visible', 'hidden', 'collapse']),
  'object-fit': keyword(['contain', 'cover', 'fill', 'none', 'scale-down']),
  'border-collapse': keyword(['collapse', 'separate']),
  'list-style-type': keyword(['none', 'disc', 'decimal']),
  'background-image': keyword(['none']),
  // interaction
  cursor: keyword(['auto', 'default', 'pointer', 'not-allowed', 'text', 'move', 'grab', 'grabbing', 'wait', 'progress', 'help', 'crosshair', 'none']),
  appearance: keyword(['none', 'auto']),
  'pointer-events': keyword(['none', 'auto']),
  'user-select': keyword(['none', 'auto', 'text', 'all']),
  resize: keyword(['none', 'both', 'horizontal', 'vertical']),
};

/** Shorthands whose expansion is ambiguous for translation. Using them is DS-E045. */
export const FORBIDDEN_SHORTHANDS: ReadonlySet<string> = new Set([
  'border', 'border-top', 'border-right', 'border-bottom', 'border-left',
  'border-block', 'border-inline', 'background', 'font', 'transition',
  'animation', 'outline', 'flex', 'inset', 'text-decoration', 'place-items',
  'place-content', 'grid', 'grid-template', 'grid-area', 'columns',
  'list-style', 'overflow-block', 'overflow-inline',
]);

interface Expansion {
  longhands: readonly string[];
  /** Maps N provided values to one per longhand, or null when N is invalid. */
  spread: (values: string[]) => string[] | null;
  range: string;
}

function fourSides(values: string[]): string[] | null {
  switch (values.length) {
    case 1:
      return [values[0], values[0], values[0], values[0]];
    case 2:
      return [values[0], values[1], values[0], values[1]];
    case 3:
      return [values[0], values[1], values[2], values[1]];
    case 4:
      return values;
    default:
      return null;
  }
}

function twoValues(values: string[]): string[] | null {
  switch (values.length) {
    case 1:
      return [values[0], values[0]];
    case 2:
      return values;
    default:
      return null;
  }
}

const EXPANSIONS: Record<string, Expansion> = {
  padding: { longhands: SIDES.map((s) => `padding-${s}`), spread: fourSides, range: '1 to 4' },
  margin: { longhands: SIDES.map((s) => `margin-${s}`), spread: fourSides, range: '1 to 4' },
  'border-width': { longhands: SIDES.map((s) => `border-${s}-width`), spread: fourSides, range: '1 to 4' },
  'border-style': { longhands: SIDES.map((s) => `border-${s}-style`), spread: fourSides, range: '1 to 4' },
  'border-color': { longhands: SIDES.map((s) => `border-${s}-color`), spread: fourSides, range: '1 to 4' },
  'border-radius': { longhands: CORNERS.map((c) => `border-${c}-radius`), spread: fourSides, range: '1 to 4' },
  gap: { longhands: ['row-gap', 'column-gap'], spread: twoValues, range: '1 to 2' },
};

export type ExpansionResult =
  | { ok: true; declarations: Record<string, string> }
  | { ok: false; reason: string };

/** Splits a value on top-level whitespace, keeping function calls like var( --x ) intact. */
export function splitTopLevel(value: string): string[] {
  const parts: string[] = [];
  for (const node of valueParser(value).nodes) {
    if (node.type === 'space' || node.type === 'comment') {
      continue;
    }
    parts.push(valueParser.stringify(node));
  }
  return parts;
}

/** Returns null when `prop` is not an expandable shorthand. */
export function expandShorthand(prop: string, value: string): ExpansionResult | null {
  const expansion = EXPANSIONS[prop];
  if (!expansion) {
    return null;
  }
  const values = splitTopLevel(value);
  const spread = expansion.spread(values);
  if (!spread) {
    return { ok: false, reason: `expected ${expansion.range} values, got ${values.length}` };
  }
  const declarations: Record<string, string> = {};
  expansion.longhands.forEach((longhand, i) => {
    declarations[longhand] = spread[i];
  });
  return { ok: true, declarations };
}

/** Properties a base root rule should declare so parity never rests on user-agent defaults. */
export const BASELINE_PROPERTIES: readonly string[] = [
  'appearance',
  'box-sizing',
  'background-color',
  'color',
  'font-family',
  'font-size',
  'line-height',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
];

const IDENTIFIER_LIST = /^[a-z][a-z0-9-]*(\s*,\s*[a-z][a-z0-9-]*)*$/;

/** Parses a non-token value for a property. Returns null when it is not allowed. */
export function parseLiteralForProperty(
  prop: string,
  raw: string,
): IRValueLiteral | null {
  const spec = PROPERTY_TABLE[prop];
  if (!spec) {
    return null;
  }
  const text = raw.trim();
  if (spec.literals.includes(text)) {
    return { kind: 'literal', type: 'keyword', value: text };
  }
  for (const kind of spec.literalKinds) {
    switch (kind) {
      case 'dimension': {
        const dim = parseDimension(text);
        if (dim) {
          return { kind: 'literal', type: 'dimension', value: dim };
        }
        break;
      }
      case 'number': {
        const num = parseNumber(text);
        if (num) {
          return { kind: 'literal', type: 'number', value: num.value };
        }
        break;
      }
      case 'color': {
        const hex = normalizeColor(text);
        if (hex) {
          return { kind: 'literal', type: 'color', value: hex };
        }
        break;
      }
      case 'identifier-list': {
        if (IDENTIFIER_LIST.test(text)) {
          const normalized = text.split(',').map((s) => s.trim()).join(', ');
          return { kind: 'literal', type: 'string', value: normalized };
        }
        break;
      }
    }
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run test/properties.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 5: Checkpoint**

Report: `src/components/properties.ts`, `test/properties.test.ts` created.

---

## Task 12: Rule ordering and component CSS parsing

**Files:**
- Create: `packages/ds-compiler/src/components/rules.ts`
- Create: `packages/ds-compiler/src/components/parse-component.ts`
- Test: `packages/ds-compiler/test/parse-component.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import type { Manifest } from '../src/components/manifest.js';
import { parseComponentCss } from '../src/components/parse-component.js';
import { Diagnostics } from '../src/errors.js';
import { parseTokenFile } from '../src/tokens/parse-tokens.js';
import { resolveTokens } from '../src/tokens/resolve-tokens.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
};

const tokenFiles: Record<string, string> = {
  'color.css': ':root { --fx-color-brand: #1863d3; --fx-color-text: #111; --fx-color-border: #ccc; }',
  'space.css': ':root { --fx-space-1: 4px; --fx-space-2: 8px; }',
  'radius.css': ':root { --fx-radius-md: 6px; }',
  'font-family.css': ":root { --fx-font-family-body: 'Open Sans', sans-serif; }",
  'font-size.css': ':root { --fx-font-size-md: 1rem; }',
  'line-height.css': ':root { --fx-line-height-tight: 1.25; }',
  'duration.css': ':root { --fx-duration-fast: 150ms; }',
};

const manifest: Manifest = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'disabled'],
  slots: {
    root: { element: 'button', optional: false },
    icon: { element: 'span', optional: true },
  },
  preview: {},
  targets: {},
};

function tokens() {
  const diag = new Diagnostics();
  const raws = Object.entries(tokenFiles).flatMap(([f, css]) =>
    parseTokenFile(`src/tokens/${f}`, css, config, diag),
  );
  return resolveTokens(raws, config, diag);
}

function parse(css: string) {
  const diag = new Diagnostics();
  const ir = parseComponentCss('button.css', css, manifest, tokens(), config, diag);
  return { ir, diag, codes: diag.errors.map((e) => e.code) };
}

describe('parseComponentCss', () => {
  it('builds normalized rules in cascade order with token and literal values', () => {
    const { ir, diag } = parse(`
.fx-button .fx-button__icon { width: var(--fx-space-2); }
.fx-button[data-size="sm"] { padding: var(--fx-space-1) var(--fx-space-2); }
.fx-button[data-variant="outline"]:hover { color: var(--fx-color-brand); }
.fx-button:disabled { cursor: not-allowed; opacity: 0.4; }
.fx-button[data-variant="outline"] { background-color: transparent; }
.fx-button:hover { background-color: var(--fx-color-brand); }
.fx-button {
  display: inline-flex;
  color: var(--fx-color-text);
  border-radius: var(--fx-radius-md);
  transition-property: color, background-color;
  transition-duration: var(--fx-duration-fast);
}
`);
    expect(diag.items).toEqual([]);
    expect(ir?.rules.map((r) => [r.slot, r.axes, r.states])).toEqual([
      ['root', {}, []],
      ['root', {}, ['hover']],
      ['root', {}, ['disabled']],
      ['root', { variant: 'outline' }, []],
      ['root', { variant: 'outline' }, ['hover']],
      ['root', { size: 'sm' }, []],
      ['icon', {}, []],
    ]);
    const base = ir!.rules[0];
    expect(base.declarations).toEqual({
      display: { kind: 'literal', type: 'keyword', value: 'inline-flex' },
      color: { kind: 'token', ref: 'color.text' },
      'border-top-left-radius': { kind: 'token', ref: 'radius.md' },
      'border-top-right-radius': { kind: 'token', ref: 'radius.md' },
      'border-bottom-right-radius': { kind: 'token', ref: 'radius.md' },
      'border-bottom-left-radius': { kind: 'token', ref: 'radius.md' },
      'transition-property': { kind: 'literal', type: 'string', value: 'color, background-color' },
      'transition-duration': { kind: 'token', ref: 'duration.fast' },
    });
    expect(base.source).toEqual({ file: 'button.css', line: 8, column: 1 });
    expect(ir!.rules[5].declarations).toEqual({
      'padding-top': { kind: 'token', ref: 'space.1' },
      'padding-right': { kind: 'token', ref: 'space.2' },
      'padding-bottom': { kind: 'token', ref: 'space.1' },
      'padding-left': { kind: 'token', ref: 'space.2' },
    });
    expect(ir!.rules[2].declarations.opacity).toEqual({
      kind: 'literal',
      type: 'number',
      value: 0.4,
    });
    expect(ir!.name).toBe('button');
    expect(ir!.slots.icon.optional).toBe(true);
  });

  it('merges rules with the same key from different source rules and selector lists', () => {
    const { ir, diag } = parse(`
.fx-button:hover, .fx-button[data-variant="outline"] { color: var(--fx-color-brand); }
.fx-button:hover { opacity: 0.9; }
`);
    expect(diag.items).toEqual([]);
    expect(ir?.rules).toHaveLength(2);
    expect(Object.keys(ir!.rules[0].declarations).sort()).toEqual(['color', 'opacity']);
  });

  it('reports DS-E046 when the same key sets a property to two values', () => {
    const { codes } = parse(`
.fx-button:hover { color: var(--fx-color-brand); }
.fx-button:hover { color: var(--fx-color-text); }
`);
    expect(codes).toEqual(['DS-E046']);
  });

  it('allows an identical duplicate declaration', () => {
    const { codes } = parse(`
.fx-button { color: var(--fx-color-text); }
.fx-button { color: var(--fx-color-text); }
`);
    expect(codes).toEqual([]);
  });

  it('reports DS-E034 for at-rules, nesting, !important, and stray declarations', () => {
    const { codes } = parse(`
@media (min-width: 600px) { .fx-button { display: flex; } }
.fx-button { color: var(--fx-color-text) !important; }
.fx-button { &:hover { color: var(--fx-color-text); } }
`);
    expect(codes).toEqual(['DS-E034', 'DS-E034', 'DS-E034']);
  });

  it('reports DS-E040, DS-E041, DS-E042, DS-E043, DS-E044, DS-E045', () => {
    const { diag } = parse(`
.fx-button {
  colr: red;
  color: #fff;
  display: flexbox;
  color: var(--fx-color-missing);
  padding-top: var(--fx-color-text);
  border: 1px solid red;
  margin: var(--fx-space-1) var(--fx-space-1) var(--fx-space-1) var(--fx-space-1) var(--fx-space-1);
  gap: var(--fx-space-1, 4px);
}
`);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E040',
      'DS-E041',
      'DS-E042',
      'DS-E043',
      'DS-E044',
      'DS-E045',
      'DS-E042',
      'DS-E042',
      'DS-E042',
    ]);
    expect(diag.errors[0].location).toEqual({ file: 'button.css', line: 3, column: 3 });
    expect(diag.errors[1].message).toContain('color token');
  });

  it('returns null and DS-E061 on a CSS syntax error', () => {
    const { ir, codes } = parse('.fx-button { color: ');
    expect(ir).toBeNull();
    expect(codes).toEqual(['DS-E061']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/parse-component.test.ts`
Expected: FAIL, cannot resolve `../src/components/parse-component.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/components/rules.ts`**

```ts
import type { Diagnostics, SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { IRValue, Rule } from '../ir/types.js';
import type { Manifest } from './manifest.js';
import { compareStates } from './states.js';

/** Identity of a rule: slot, selected axes (in manifest order), and sorted states. */
export function ruleKey(
  slot: string,
  axes: Record<string, string>,
  states: readonly string[],
  axisOrder: readonly string[],
): string {
  const axisPart = axisOrder
    .filter((a) => a in axes)
    .map((a) => `${a}=${axes[a]}`)
    .join(',');
  return `${slot}|${axisPart}|${states.join(',')}`;
}

/** Adds declarations to a rule; a different value for an existing property is DS-E046. */
export function mergeDeclarations(
  rule: Rule,
  incoming: Record<string, IRValue>,
  location: SourceLocation,
  diag: Diagnostics,
): void {
  for (const [prop, value] of Object.entries(incoming)) {
    const existing = rule.declarations[prop];
    if (existing && stableStringify(existing) !== stableStringify(value)) {
      diag.add(
        'DS-E046',
        `"${prop}" is already set to a different value for this slot, axes, and states (first at ${rule.source.file}:${rule.source.line})`,
        location,
      );
      continue;
    }
    rule.declarations[prop] = value;
  }
}

/**
 * Cascade order: slot (manifest order, root first), then fewer axes first,
 * then axis values in manifest order, then fewer states first, then state order.
 */
export function compareRules(a: Rule, b: Rule, manifest: Manifest): number {
  const slots = Object.keys(manifest.slots);
  const bySlot = slots.indexOf(a.slot) - slots.indexOf(b.slot);
  if (bySlot !== 0) {
    return bySlot;
  }
  const aCount = Object.keys(a.axes).length;
  const bCount = Object.keys(b.axes).length;
  if (aCount !== bCount) {
    return aCount - bCount;
  }
  for (const axis of Object.keys(manifest.axes)) {
    const av = a.axes[axis];
    const bv = b.axes[axis];
    if (av === undefined && bv === undefined) {
      continue;
    }
    if (av === undefined) {
      return -1;
    }
    if (bv === undefined) {
      return 1;
    }
    const values = manifest.axes[axis].values;
    const d = values.indexOf(av) - values.indexOf(bv);
    if (d !== 0) {
      return d;
    }
  }
  if (a.states.length !== b.states.length) {
    return a.states.length - b.states.length;
  }
  for (let i = 0; i < a.states.length; i += 1) {
    const d = compareStates(a.states[i], b.states[i]);
    if (d !== 0) {
      return d;
    }
  }
  return 0;
}

export function sortRules(rules: readonly Rule[], manifest: Manifest): Rule[] {
  return [...rules].sort((a, b) => compareRules(a, b, manifest));
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/components/parse-component.ts`**

```ts
import type { ChildNode, Rule as PostcssRule } from 'postcss';
import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { ComponentIR, IRValue, Rule, Token, TokenId } from '../ir/types.js';
import { locationOf, parseCss } from '../tokens/parse-tokens.js';
import { parseVarRef } from '../tokens/values.js';
import type { Manifest } from './manifest.js';
import {
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
  type PropertySpec,
} from './properties.js';
import { mergeDeclarations, ruleKey, sortRules } from './rules.js';
import { parseSelector } from './selector.js';

export type TokenTable = Record<TokenId, Token>;

export function parseComponentCss(
  cssPath: string,
  css: string,
  manifest: Manifest,
  tokens: TokenTable,
  config: DsConfig,
  diag: Diagnostics,
): ComponentIR | null {
  const root = parseCss(cssPath, css, diag);
  if (!root) {
    return null;
  }
  const rules = new Map<string, Rule>();
  const axisOrder = Object.keys(manifest.axes);

  root.each((node: ChildNode) => {
    if (node.type === 'comment') {
      return;
    }
    if (node.type === 'atrule') {
      diag.add('DS-E034', `@${node.name} is not allowed in component files`, locationOf(cssPath, node));
      return;
    }
    if (node.type === 'decl') {
      diag.add('DS-E034', `declaration "${node.prop}" outside a rule`, locationOf(cssPath, node));
      return;
    }
    if (node.type !== 'rule') {
      return;
    }
    const location = locationOf(cssPath, node);
    const declarations = collectDeclarations(node, cssPath, tokens, config, diag);
    for (const selector of node.selectors) {
      const parsed = parseSelector(selector.trim(), manifest, config.prefix, location, diag);
      if (!parsed) {
        continue;
      }
      const key = ruleKey(parsed.slot, parsed.axes, parsed.states, axisOrder);
      let rule = rules.get(key);
      if (!rule) {
        rule = {
          slot: parsed.slot,
          axes: parsed.axes,
          states: parsed.states,
          declarations: {},
          source: location,
        };
        rules.set(key, rule);
      }
      mergeDeclarations(rule, declarations, location, diag);
    }
  });

  return {
    name: manifest.name,
    displayName: manifest.displayName,
    description: manifest.description,
    axes: manifest.axes,
    states: manifest.states,
    slots: manifest.slots,
    preview: manifest.preview,
    rules: sortRules([...rules.values()], manifest),
    targets: manifest.targets,
  };
}

function collectDeclarations(
  rule: PostcssRule,
  cssPath: string,
  tokens: TokenTable,
  config: DsConfig,
  diag: Diagnostics,
): Record<string, IRValue> {
  const out: Record<string, IRValue> = {};
  rule.each((child: ChildNode) => {
    if (child.type === 'comment') {
      return;
    }
    if (child.type === 'rule') {
      diag.add('DS-E034', `nested rule "${child.selector}" is not allowed`, locationOf(cssPath, child));
      return;
    }
    if (child.type === 'atrule') {
      diag.add('DS-E034', `@${child.name} is not allowed inside a rule`, locationOf(cssPath, child));
      return;
    }
    if (child.type !== 'decl') {
      return;
    }
    const location = locationOf(cssPath, child);
    if (child.important) {
      diag.add('DS-E034', `"${child.prop}" uses !important`, location);
      return;
    }
    const prop = child.prop.toLowerCase();
    if (FORBIDDEN_SHORTHANDS.has(prop)) {
      diag.add('DS-E045', `"${prop}" is a forbidden shorthand`, location);
      return;
    }
    const expansion = expandShorthand(prop, child.value);
    let pairs: Array<[string, string]>;
    if (expansion === null) {
      pairs = [[prop, child.value.trim()]];
    } else if (!expansion.ok) {
      diag.add('DS-E042', `"${prop}: ${child.value}": ${expansion.reason}`, location);
      return;
    } else {
      pairs = Object.entries(expansion.declarations);
    }
    for (const [p, v] of pairs) {
      const spec = PROPERTY_TABLE[p];
      if (!spec) {
        diag.add('DS-E040', `"${p}" is not a supported property`, location);
        continue;
      }
      const value = resolveValue(p, v, spec, tokens, config.prefix, location, diag);
      if (value) {
        out[p] = value;
      }
    }
  });
  return out;
}

function resolveValue(
  prop: string,
  raw: string,
  spec: PropertySpec,
  tokens: TokenTable,
  prefix: string,
  location: SourceLocation,
  diag: Diagnostics,
): IRValue | null {
  const ref = parseVarRef(raw, prefix);
  if (ref) {
    if (!ref.ok) {
      diag.add('DS-E043', `"${prop}: ${raw}": ${ref.reason}`, location);
      return null;
    }
    const token = tokens[ref.id];
    if (!token) {
      diag.add('DS-E043', `"${prop}" references "${ref.name}", which is not defined`, location);
      return null;
    }
    if (!spec.categories.includes(token.category)) {
      const accepted = spec.categories.length > 0 ? spec.categories.join(', ') : 'no';
      diag.add(
        'DS-E044',
        `"${prop}" accepts ${accepted} tokens, but "${ref.name}" is a ${token.category} token`,
        location,
      );
      return null;
    }
    return { kind: 'token', ref: ref.id };
  }
  const literal = parseLiteralForProperty(prop, raw);
  if (literal) {
    return literal;
  }
  const escapes = spec.literals.length > 0 ? ` (or one of: ${spec.literals.join(', ')})` : '';
  if (spec.tokenRequired) {
    diag.add(
      'DS-E041',
      `"${prop}: ${raw}" must reference a ${spec.categories.join(' or ')} token${escapes}`,
      location,
    );
  } else {
    diag.add('DS-E042', `"${prop}: ${raw}" is not an allowed value${escapes}`, location);
  }
  return null;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/parse-component.test.ts`
Expected: PASS, 7 tests. PostCSS 8 parses `&:hover { … }` inside a rule as a nested `rule` node, which produces the third DS-E034.

- [ ] **Step 6: Checkpoint**

Report: `src/components/rules.ts`, `src/components/parse-component.ts`, `test/parse-component.test.ts` created.

---

## Task 13: Build and lint orchestration with the mini fixture

**Files:**
- Create: `packages/ds-compiler/src/build.ts`
- Create: `packages/ds-compiler/src/lint.ts`
- Create: `packages/ds-compiler/test/helpers.ts`
- Create: `packages/ds-compiler/test/fixtures/mini/**` (listed in Step 3)
- Test: `packages/ds-compiler/test/build.test.ts`
- Test: `packages/ds-compiler/test/lint.test.ts`

- [ ] **Step 1: Write the failing tests**

`test/helpers.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const FIXTURE_MINI = fileURLToPath(new URL('./fixtures/mini/', import.meta.url));

/** Writes files (relative path -> contents) into a fresh temp root and returns it. */
export function makeRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'ds-root-'));
  for (const [rel, contents] of Object.entries(files)) {
    const abs = join(root, rel);
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, contents);
  }
  return root;
}

export const MINI_CONFIG = JSON.stringify({
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
});

export const BASELINE_CSS = `
  appearance: none;
  box-sizing: border-box;
  background-color: transparent;
  color: var(--fx-color-text-default);
  font-family: var(--fx-font-family-body);
  font-size: var(--fx-font-size-md);
  line-height: var(--fx-line-height-tight);
  border-style: none;
`;
```

`test/build.test.ts`:

```ts
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build, buildIR, IR_FILE } from '../src/build.js';
import { FIXTURE_MINI, makeRoot } from './helpers.js';

describe('buildIR on the mini fixture', () => {
  it('produces a complete IR with no diagnostics', () => {
    const { ir, diagnostics } = buildIR(FIXTURE_MINI);
    expect(diagnostics.items).toEqual([]);
    expect(ir).not.toBeNull();
    expect(ir!.irVersion).toBe(1);
    expect(ir!.meta).toMatchObject({
      name: 'Fictional',
      prefix: 'fx',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      rootFontSize: 16,
    });
    expect(ir!.meta.sourceHash).toMatch(/^[0-9a-f]{64}$/);
    expect(Object.keys(ir!.components)).toEqual(['badge', 'button']);
    expect(Object.keys(ir!.tokens)).toContain('color.brand.default');
    expect(ir!.tokens['color.brand.default'].modeInvariant).toBe(false);
    expect(ir!.tokens['radius.md']).toMatchObject({ alias: 'space.2', $type: 'dimension' });
    expect(ir!.tokens['shadow.focus'].$value).toMatchObject({
      layers: [{ color: { ref: 'color.focus.ring' } }],
    });
  });

  it('orders button rules deterministically', () => {
    const { ir } = buildIR(FIXTURE_MINI);
    expect(ir!.components.button.rules.map((r) => [r.slot, r.axes, r.states])).toEqual([
      ['root', {}, []],
      ['root', {}, ['hover']],
      ['root', {}, ['focus-visible']],
      ['root', {}, ['disabled']],
      ['root', { variant: 'outline' }, []],
      ['root', { variant: 'outline' }, ['hover']],
      ['root', { size: 'sm' }, []],
      ['icon', {}, []],
    ]);
  });

  it('is byte-for-byte reproducible and writes design.ir.json', () => {
    const root = makeRoot({});
    // Copy the fixture into a temp root so the fixture stays clean.
    cpSync(FIXTURE_MINI, root, { recursive: true });
    const first = build(root);
    expect(first.outFile).toBe(join(root, IR_FILE));
    const a = readFileSync(join(root, IR_FILE), 'utf8');
    build(root);
    const b = readFileSync(join(root, IR_FILE), 'utf8');
    expect(a).toBe(b);
    expect(a.endsWith('\n')).toBe(true);
    const parsed = JSON.parse(a);
    expect(Object.keys(parsed)).toEqual(['components', 'irVersion', 'meta', 'tokens']);
  });

  it('returns a null IR and does not write when there are errors', () => {
    const root = makeRoot({
      'ds.config.json': '{ "name": "X", "prefix": "fx", "modes": ["light"], "defaultMode": "light" }',
      'src/tokens/color.css': ':root { --fx-color-a: notacolor; }',
    });
    const result = build(root);
    expect(result.ir).toBeNull();
    expect(result.outFile).toBeUndefined();
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E012']);
    expect(existsSync(join(root, IR_FILE))).toBe(false);
  });

  it('reports DS-E001 and stops when the config is missing', () => {
    const root = makeRoot({});
    const result = buildIR(root);
    expect(result.ir).toBeNull();
    expect(result.diagnostics.errors.map((e) => e.code)).toEqual(['DS-E001']);
  });
});
```

`test/lint.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { lint } from '../src/lint.js';
import { BASELINE_CSS, MINI_CONFIG, makeRoot } from './helpers.js';

const tokens = {
  'src/tokens/color.css': ':root { --fx-color-text-default: #111; }',
  'src/tokens/font-family.css': ":root { --fx-font-family-body: 'Open Sans', sans-serif; }",
  'src/tokens/font-size.css': ':root { --fx-font-size-md: 1rem; }',
  'src/tokens/line-height.css': ':root { --fx-line-height-tight: 1.25; }',
};

describe('lint', () => {
  it('passes a complete component with no diagnostics', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        targets: { tailwind: {} },
      }),
      'src/components/card/card.css': `.fx-card {${BASELINE_CSS}}`,
    });
    expect(lint(root).items).toEqual([]);
  });

  it('reports DS-E050 for TODO markers in token files, CSS, and manifests with line numbers', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root {\n  /* TODO: add colors */\n}',
      'src/components/card/card.manifest.json': JSON.stringify(
        { name: 'card', displayName: 'Card', targets: { mui: { excluded: 'TODO' } } },
        null,
        2,
      ),
      'src/components/card/card.css': '.fx-card {\n  /* TODO */\n  display: block;\n}',
    });
    const errors = lint(root).errors.filter((e) => e.code === 'DS-E050');
    expect(errors).toHaveLength(3);
    expect(errors[0].location).toMatchObject({ file: 'src/tokens/color.css', line: 2 });
    expect(errors[1].location?.file).toBe('src/components/card/card.manifest.json');
    expect(errors[2].location).toMatchObject({ file: 'src/components/card/card.css', line: 2 });
  });

  it('reports DS-E060 for a component directory missing a file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    expect(lint(root).errors.map((e) => e.code)).toEqual(['DS-E060']);
  });

  it('warns DS-W001 when the base root rule misses baseline properties', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    const result = lint(root);
    expect(result.hasErrors()).toBe(false);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe('DS-W001');
    expect(result.warnings[0].message).toContain('appearance');
  });

  it('respects baseline: false and a custom baseline list', () => {
    const off = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: false,
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    expect(lint(off).items).toEqual([]);
    const custom = makeRoot({
      'ds.config.json': MINI_CONFIG,
      ...tokens,
      'src/components/card/card.manifest.json': JSON.stringify({
        name: 'card',
        displayName: 'Card',
        baseline: ['display', 'color'],
      }),
      'src/components/card/card.css': '.fx-card { display: block; }',
    });
    const w = lint(custom).warnings;
    expect(w).toHaveLength(1);
    expect(w[0].message).toContain('color');
    expect(w[0].message).not.toContain('appearance');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run test/build.test.ts test/lint.test.ts`
Expected: FAIL, cannot resolve `../src/build.js`.

- [ ] **Step 3: Create the mini fixture under `packages/ds-compiler/test/fixtures/mini/`**

`ds.config.json`:

```json
{
  "name": "Fictional",
  "prefix": "fx",
  "modes": ["light", "dark"],
  "defaultMode": "light",
  "rootFontSize": 16
}
```

`src/tokens/color.css`:

```css
:root {
  --fx-color-neutral-0: #ffffff;
  --fx-color-neutral-900: #111111;
  --fx-color-brand-default: #1863d3;
  --fx-color-brand-hover: #1453b0;
  --fx-color-text-default: var(--fx-color-neutral-900);
  --fx-color-text-on-brand: var(--fx-color-neutral-0);
  --fx-color-surface-default: var(--fx-color-neutral-0);
  --fx-color-border-default: #c9c9c9;
  --fx-color-focus-ring: #3f8cff;
}

:root[data-fx-theme="dark"] {
  --fx-color-neutral-0: #111111;
  --fx-color-neutral-900: #ffffff;
  --fx-color-brand-default: #3f8cff;
  --fx-color-brand-hover: #6aa6ff;
  --fx-color-border-default: #484848;
}
```

`src/tokens/space.css`:

```css
:root {
  --fx-space-1: 4px;
  --fx-space-2: 8px;
  --fx-space-3: 12px;
  --fx-space-4: 16px;
}
```

`src/tokens/radius.css`:

```css
:root {
  --fx-radius-sm: 4px;
  --fx-radius-md: var(--fx-space-2);
  --fx-radius-pill: 9999px;
}
```

`src/tokens/font-family.css`:

```css
:root {
  --fx-font-family-body: 'Open Sans', Arial, sans-serif;
}
```

`src/tokens/font-size.css`:

```css
:root {
  --fx-font-size-sm: 0.875rem;
  --fx-font-size-md: 1rem;
}
```

`src/tokens/font-weight.css`:

```css
:root {
  --fx-font-weight-regular: 400;
  --fx-font-weight-semibold: 600;
}
```

`src/tokens/line-height.css`:

```css
:root {
  --fx-line-height-tight: 1.25;
}
```

`src/tokens/border-width.css`:

```css
:root {
  --fx-border-width-1: 1px;
}
```

`src/tokens/duration.css`:

```css
:root {
  --fx-duration-fast: 150ms;
}
```

`src/tokens/easing.css`:

```css
:root {
  --fx-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

`src/tokens/shadow.css`:

```css
:root {
  --fx-shadow-focus: 0 0 0 2px var(--fx-color-focus-ring);
}
```

`src/components/button/button.manifest.json`:

```json
{
  "name": "button",
  "displayName": "Button",
  "description": "Triggers an action.",
  "axes": {
    "variant": { "values": ["solid", "outline"], "default": "solid" },
    "size": { "values": ["sm", "md"], "default": "md" }
  },
  "states": ["hover", "focus-visible", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "label": { "element": "span" },
    "icon": { "element": "span", "optional": true }
  },
  "preview": { "label": "Button" },
  "targets": {
    "tailwind": {},
    "mui": { "excluded": "fixture only" },
    "flutter": { "excluded": "fixture only" }
  }
}
```

`src/components/button/button.css`:

```css
.fx-button {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--fx-space-2);
  padding: var(--fx-space-2) var(--fx-space-4);
  border-style: solid;
  border-width: var(--fx-border-width-1);
  border-color: transparent;
  border-radius: var(--fx-radius-md);
  background-color: var(--fx-color-brand-default);
  color: var(--fx-color-text-on-brand);
  font-family: var(--fx-font-family-body);
  font-size: var(--fx-font-size-md);
  font-weight: var(--fx-font-weight-semibold);
  line-height: var(--fx-line-height-tight);
  cursor: pointer;
  transition-property: background-color, border-color, color;
  transition-duration: var(--fx-duration-fast);
  transition-timing-function: var(--fx-easing-standard);
}

.fx-button:hover {
  background-color: var(--fx-color-brand-hover);
}

.fx-button:focus-visible {
  outline-style: none;
  box-shadow: var(--fx-shadow-focus);
}

.fx-button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.fx-button[data-variant="outline"] {
  background-color: transparent;
  border-color: var(--fx-color-border-default);
  color: var(--fx-color-text-default);
}

.fx-button[data-variant="outline"]:hover {
  background-color: var(--fx-color-surface-default);
}

.fx-button[data-size="sm"] {
  padding: var(--fx-space-1) var(--fx-space-3);
  font-size: var(--fx-font-size-sm);
}

.fx-button .fx-button__icon {
  display: inline-flex;
  width: var(--fx-space-4);
  height: var(--fx-space-4);
}
```

`src/components/badge/badge.manifest.json`:

```json
{
  "name": "badge",
  "displayName": "Badge",
  "slots": { "root": { "element": "span" } },
  "preview": { "root": "New" },
  "targets": { "tailwind": {} }
}
```

`src/components/badge/badge.css`:

```css
.fx-badge {
  appearance: none;
  box-sizing: border-box;
  display: inline-block;
  padding: var(--fx-space-1) var(--fx-space-2);
  border-style: none;
  border-radius: var(--fx-radius-pill);
  background-color: var(--fx-color-brand-default);
  color: var(--fx-color-text-on-brand);
  font-family: var(--fx-font-family-body);
  font-size: var(--fx-font-size-sm);
  font-weight: var(--fx-font-weight-semibold);
  line-height: var(--fx-line-height-tight);
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/build.ts`**

```ts
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { MANIFEST_SUFFIX, parseManifest, type Manifest } from './components/manifest.js';
import { parseComponentCss } from './components/parse-component.js';
import { BASELINE_PROPERTIES } from './components/properties.js';
import { CONFIG_FILE, loadConfig } from './config.js';
import { Diagnostics } from './errors.js';
import { serializeIR, sourceHash, type SourceFile } from './ir/serialize.js';
import { IR_VERSION, type ComponentIR, type DesignIR } from './ir/types.js';
import { parseTokenFile } from './tokens/parse-tokens.js';
import { resolveTokens } from './tokens/resolve-tokens.js';

export const IR_FILE = 'design.ir.json';
export const TOKENS_DIR = 'src/tokens';
export const COMPONENTS_DIR = 'src/components';

export interface BuildResult {
  ir: DesignIR | null;
  diagnostics: Diagnostics;
  sources: SourceFile[];
}

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

/** Flags every line containing the word TODO as DS-E050. */
export function scanTodo(file: string, text: string, diag: Diagnostics): void {
  text.split('\n').forEach((line, index) => {
    const at = line.search(/\bTODO\b/);
    if (at !== -1) {
      diag.add('DS-E050', `line contains TODO: ${line.trim()}`, {
        file,
        line: index + 1,
        column: at + 1,
      });
    }
  });
}

function checkBaseline(
  component: ComponentIR,
  manifest: Manifest,
  file: string,
  diag: Diagnostics,
): void {
  if (manifest.baseline === false) {
    return;
  }
  const required = manifest.baseline ?? BASELINE_PROPERTIES;
  const base = component.rules.find(
    (r) => r.slot === 'root' && Object.keys(r.axes).length === 0 && r.states.length === 0,
  );
  const missing = required.filter((p) => !base || !(p in base.declarations));
  if (missing.length > 0) {
    diag.add(
      'DS-W001',
      `${component.name}: base root rule is missing ${missing.join(', ')}`,
      base?.source ?? { file, line: 1, column: 1 },
    );
  }
}

/** Parses everything under rootDir into an IR without writing anything. */
export function buildIR(rootDir: string): BuildResult {
  const diag = new Diagnostics();
  const sources: SourceFile[] = [];
  const config = loadConfig(rootDir, diag);
  if (!config) {
    return { ir: null, diagnostics: diag, sources };
  }
  sources.push({
    path: CONFIG_FILE,
    contents: readFileSync(join(rootDir, CONFIG_FILE), 'utf8'),
  });

  const tokensDir = join(rootDir, TOKENS_DIR);
  const tokenFiles = existsSync(tokensDir)
    ? readdirSync(tokensDir).filter((f) => f.endsWith('.css')).sort()
    : [];
  const raws = tokenFiles.flatMap((file) => {
    const abs = join(tokensDir, file);
    const rel = toPosix(relative(rootDir, abs));
    const css = readFileSync(abs, 'utf8');
    sources.push({ path: rel, contents: css });
    scanTodo(rel, css, diag);
    return parseTokenFile(rel, css, config, diag);
  });
  const tokens = resolveTokens(raws, config, diag);

  const components: Record<string, ComponentIR> = {};
  const componentsDir = join(rootDir, COMPONENTS_DIR);
  const names = existsSync(componentsDir)
    ? readdirSync(componentsDir)
        .filter((d) => statSync(join(componentsDir, d)).isDirectory())
        .sort()
    : [];
  for (const name of names) {
    const dir = join(componentsDir, name);
    const cssAbs = join(dir, `${name}.css`);
    const manifestAbs = join(dir, `${name}${MANIFEST_SUFFIX}`);
    const cssRel = toPosix(relative(rootDir, cssAbs));
    const manifestRel = toPosix(relative(rootDir, manifestAbs));
    if (!existsSync(cssAbs) || !existsSync(manifestAbs)) {
      const missing = !existsSync(cssAbs) ? `${name}.css` : `${name}${MANIFEST_SUFFIX}`;
      diag.add('DS-E060', `${COMPONENTS_DIR}/${name} is missing ${missing}`, {
        file: toPosix(relative(rootDir, dir)),
        line: 1,
        column: 1,
      });
      continue;
    }
    const manifestText = readFileSync(manifestAbs, 'utf8');
    const css = readFileSync(cssAbs, 'utf8');
    sources.push({ path: manifestRel, contents: manifestText });
    sources.push({ path: cssRel, contents: css });
    scanTodo(manifestRel, manifestText, diag);
    scanTodo(cssRel, css, diag);

    let json: unknown;
    try {
      json = JSON.parse(manifestText);
    } catch (err) {
      diag.add('DS-E020', `not valid JSON: ${(err as Error).message}`, {
        file: manifestRel,
        line: 1,
        column: 1,
      });
      continue;
    }
    const manifest = parseManifest(json, manifestRel, name, diag);
    if (!manifest) {
      continue;
    }
    const component = parseComponentCss(cssRel, css, manifest, tokens, config, diag);
    if (!component) {
      continue;
    }
    checkBaseline(component, manifest, cssRel, diag);
    components[name] = component;
  }

  if (diag.hasErrors()) {
    return { ir: null, diagnostics: diag, sources };
  }
  const ir: DesignIR = {
    irVersion: IR_VERSION,
    meta: {
      name: config.name,
      prefix: config.prefix,
      modes: config.modes,
      defaultMode: config.defaultMode,
      rootFontSize: config.rootFontSize,
      sourceHash: sourceHash(sources),
    },
    tokens,
    components,
  };
  return { ir, diagnostics: diag, sources };
}

export function writeIR(rootDir: string, ir: DesignIR): string {
  const out = join(rootDir, IR_FILE);
  writeFileSync(out, serializeIR(ir));
  return out;
}

/** buildIR plus writing design.ir.json when there are no errors. */
export function build(rootDir: string): BuildResult & { outFile?: string } {
  const result = buildIR(rootDir);
  if (result.ir) {
    return { ...result, outFile: writeIR(rootDir, result.ir) };
  }
  return result;
}
```

- [ ] **Step 5: Create `packages/ds-compiler/src/lint.ts`**

```ts
import { buildIR } from './build.js';
import type { Diagnostics } from './errors.js';

/** Runs every authoring rule without writing any file. */
export function lint(rootDir: string): Diagnostics {
  return buildIR(rootDir).diagnostics;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run test/build.test.ts test/lint.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 7: Run the whole suite, typecheck, and lint**

Run from `packages/ds-compiler`:

```bash
npx vitest run
npm run typecheck
npm run lint
```

Expected: all tests pass, no type errors, no lint errors.

- [ ] **Step 8: Checkpoint**

Report: `src/build.ts`, `src/lint.ts`, `test/helpers.ts`, `test/fixtures/mini/**`, `test/build.test.ts`, `test/lint.test.ts` created.

---

## Task 14: Scaffold commands

**Files:**
- Create: `packages/ds-compiler/src/scaffold/tokens.ts`
- Create: `packages/ds-compiler/src/scaffold/component.ts`
- Test: `packages/ds-compiler/test/scaffold.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseManifest } from '../src/components/manifest.js';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { lint } from '../src/lint.js';
import {
  ScaffoldError,
  renderComponentCss,
  renderComponentManifest,
  scaffoldComponent,
} from '../src/scaffold/component.js';
import { renderTokenScaffold, scaffoldTokens } from '../src/scaffold/tokens.js';
import { MINI_CONFIG, makeRoot } from './helpers.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
};

describe('scaffold tokens', () => {
  it('renders a :root block and one block per extra mode, each with a TODO', () => {
    const text = renderTokenScaffold('color', config);
    expect(text).toContain(':root {');
    expect(text).toContain(':root[data-fx-theme="dark"] {');
    expect(text).toContain('--fx-color-example: #1863d3');
    expect(text.match(/TODO/g)).toHaveLength(2);
  });

  it('writes the file and refuses to overwrite', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = scaffoldTokens(root, 'space', config);
    expect(path).toBe(join(root, 'src/tokens/space.css'));
    expect(existsSync(path)).toBe(true);
    expect(() => scaffoldTokens(root, 'space', config)).toThrow(ScaffoldError);
  });

  it('lints with only DS-E050 until filled, then clean', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = scaffoldTokens(root, 'space', config);
    const before = lint(root);
    expect(new Set(before.errors.map((e) => e.code))).toEqual(new Set(['DS-E050']));
    writeFileSync(path, ':root {\n  --fx-space-1: 4px;\n}\n');
    expect(lint(root).items).toEqual([]);
  });
});

describe('scaffold component', () => {
  const opts = {
    axes: { variant: ['solid', 'outline'], size: ['sm', 'md'] },
    states: ['hover', 'focus-visible', 'disabled', 'open'],
    slots: ['icon'],
  };

  it('renders a manifest that validates, with every target excluded as TODO', () => {
    const text = renderComponentManifest('button', opts, config);
    const diag = new Diagnostics();
    const manifest = parseManifest(JSON.parse(text), 'button.manifest.json', 'button', diag);
    expect(diag.items).toEqual([]);
    expect(manifest).toMatchObject({
      name: 'button',
      displayName: 'Button',
      axes: {
        variant: { values: ['solid', 'outline'], default: 'solid' },
        size: { values: ['sm', 'md'], default: 'sm' },
      },
      states: ['hover', 'focus-visible', 'disabled', 'open'],
      slots: {
        root: { element: 'div', optional: false },
        icon: { element: 'span', optional: false },
      },
    });
    expect(Object.keys(manifest!.targets)).toEqual(['tailwind', 'mui', 'flutter']);
    expect(manifest!.targets.mui).toEqual({ excluded: 'TODO: map this target or give a reason' });
  });

  it('renders CSS rules in cascade order with a TODO in each', () => {
    const css = renderComponentCss('button', opts, config);
    const selectors = [...css.matchAll(/^([^\n{]+) \{$/gm)].map((m) => m[1]);
    expect(selectors).toEqual([
      '.fx-button',
      '.fx-button:hover',
      '.fx-button:focus-visible',
      '.fx-button:disabled',
      '.fx-button[data-state="open"]',
      '.fx-button[data-variant="outline"]',
      '.fx-button[data-size="md"]',
      '.fx-button .fx-button__icon',
    ]);
    expect(css).toContain('TODO baseline: appearance, box-sizing');
  });

  it('writes both files and refuses to overwrite an existing component', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const out = scaffoldComponent(root, 'button', opts, config);
    expect(out.cssPath).toBe(join(root, 'src/components/button/button.css'));
    expect(out.manifestPath).toBe(join(root, 'src/components/button/button.manifest.json'));
    expect(readFileSync(out.manifestPath, 'utf8').endsWith('\n')).toBe(true);
    expect(() => scaffoldComponent(root, 'button', opts, config)).toThrow(ScaffoldError);
  });

  it('rejects invalid identifiers', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(() => scaffoldComponent(root, 'Button', opts, config)).toThrow(/kebab-case/);
    expect(() =>
      scaffoldComponent(root, 'button', { axes: { Size: ['sm'] }, states: [], slots: [] }, config),
    ).toThrow(/Size/);
  });

  it('lints with only DS-E050 errors until filled', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-text: #111; }',
    });
    scaffoldComponent(root, 'button', opts, config);
    const result = lint(root);
    expect(new Set(result.errors.map((e) => e.code))).toEqual(new Set(['DS-E050']));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/scaffold.test.ts`
Expected: FAIL, cannot resolve `../src/scaffold/tokens.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/scaffold/tokens.ts`**

```ts
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { TOKENS_DIR } from '../build.js';
import { modeSelectorFor, type DsConfig } from '../config.js';
import type { TokenCategory } from '../tokens/categories.js';

export class ScaffoldError extends Error {}

export const CATEGORY_EXAMPLES: Record<TokenCategory, string> = {
  color: '#1863d3',
  space: '8px',
  radius: '6px',
  'font-family': "'Open Sans', Arial, sans-serif",
  'font-size': '1rem',
  'font-weight': '600',
  'line-height': '1.5',
  'letter-spacing': '-0.02em',
  shadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
  'border-width': '1px',
  duration: '150ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  opacity: '0.4',
  'z-index': '100',
  size: '44px',
};

export function renderTokenScaffold(category: TokenCategory, config: DsConfig): string {
  const lines = [
    `/* ${config.name} tokens: ${category}`,
    ` * Only :root and the mode blocks below are allowed. Every declaration is`,
    ` * --${config.prefix}-${category}-<path>; values are literals or var() aliases.`,
    ` * Docs: docs/design-system/authoring-guide.md#tokens */`,
    '',
    ':root {',
    `  /* example: --${config.prefix}-${category}-example: ${CATEGORY_EXAMPLES[category]}; */`,
    `  /* TODO: add ${category} tokens */`,
    '}',
  ];
  for (const mode of config.modes) {
    if (mode === config.defaultMode) {
      continue;
    }
    lines.push(
      '',
      `${modeSelectorFor(config, mode)} {`,
      `  /* TODO: add ${mode} values for tokens that vary by mode, or delete this block */`,
      '}',
    );
  }
  return `${lines.join('\n')}\n`;
}

export function scaffoldTokens(
  rootDir: string,
  category: TokenCategory,
  config: DsConfig,
): { path: string } {
  const path = join(rootDir, TOKENS_DIR, `${category}.css`);
  if (existsSync(path)) {
    throw new ScaffoldError(`${path} already exists; scaffold never overwrites`);
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, renderTokenScaffold(category, config));
  return { path };
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/scaffold/component.ts`**

```ts
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { COMPONENTS_DIR } from '../build.js';
import { axisValue, identifier, MANIFEST_SUFFIX } from '../components/manifest.js';
import { BASELINE_PROPERTIES } from '../components/properties.js';
import { sortStates } from '../components/states.js';
import type { DsConfig } from '../config.js';
import { ScaffoldError } from './tokens.js';

export { ScaffoldError } from './tokens.js';

export const KNOWN_TARGETS = ['tailwind', 'mui', 'flutter'] as const;

export interface ComponentScaffoldOptions {
  /** axis name -> values; the first value becomes the default. */
  axes: Record<string, string[]>;
  states: string[];
  /** Slot names other than root. */
  slots: string[];
}

const STATE_SELECTORS: Record<string, string> = {
  hover: ':hover',
  active: ':active',
  'focus-visible': ':focus-visible',
  disabled: ':disabled',
  pressed: '[aria-pressed="true"]',
  selected: '[aria-selected="true"]',
  expanded: '[aria-expanded="true"]',
  checked: '[aria-checked="true"]',
};

function stateSelector(state: string): string {
  return STATE_SELECTORS[state] ?? `[data-state="${state}"]`;
}

function titleCase(name: string): string {
  return name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function assertIdentifier(value: string, what: string): void {
  const result = identifier.safeParse(value);
  if (!result.success) {
    throw new ScaffoldError(`${what} "${value}" ${result.error.issues[0].message}`);
  }
}

function assertAxisValue(value: string, what: string): void {
  const result = axisValue.safeParse(value);
  if (!result.success) {
    throw new ScaffoldError(`${what} "${value}" ${result.error.issues[0].message}`);
  }
}

function validate(name: string, opts: ComponentScaffoldOptions): void {
  assertIdentifier(name, 'component name');
  for (const [axis, values] of Object.entries(opts.axes)) {
    assertIdentifier(axis, 'axis');
    if (values.length === 0) {
      throw new ScaffoldError(`axis "${axis}" needs at least one value`);
    }
    values.forEach((v) => assertAxisValue(v, `axis "${axis}" value`));
  }
  opts.states.forEach((s) => assertIdentifier(s, 'state'));
  opts.slots.forEach((s) => {
    assertIdentifier(s, 'slot');
    if (s === 'root') {
      throw new ScaffoldError('slot "root" is implicit; do not list it');
    }
  });
}

export function renderComponentManifest(
  name: string,
  opts: ComponentScaffoldOptions,
  _config: DsConfig,
): string {
  validate(name, opts);
  const manifest = {
    name,
    displayName: titleCase(name),
    description: 'TODO: describe the component in one sentence',
    axes: Object.fromEntries(
      Object.entries(opts.axes).map(([axis, values]) => [axis, { values, default: values[0] }]),
    ),
    states: sortStates(opts.states),
    slots: {
      root: { element: 'div' },
      ...Object.fromEntries(opts.slots.map((s) => [s, { element: 'span' }])),
    },
    preview: {},
    targets: Object.fromEntries(
      KNOWN_TARGETS.map((t) => [t, { excluded: 'TODO: map this target or give a reason' }]),
    ),
  };
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

export function renderComponentCss(
  name: string,
  opts: ComponentScaffoldOptions,
  config: DsConfig,
): string {
  validate(name, opts);
  const root = `.${config.prefix}-${name}`;
  const blocks: string[] = [];
  blocks.push(
    [
      `${root} {`,
      `  /* TODO baseline: ${BASELINE_PROPERTIES.join(', ')} */`,
      '}',
    ].join('\n'),
  );
  for (const state of sortStates(opts.states)) {
    blocks.push(`${root}${stateSelector(state)} {\n  /* TODO */\n}`);
  }
  for (const [axis, values] of Object.entries(opts.axes)) {
    for (const value of values.slice(1)) {
      blocks.push(`${root}[data-${axis}="${value}"] {\n  /* TODO */\n}`);
    }
  }
  for (const slot of opts.slots) {
    blocks.push(`${root} ${root}__${slot} {\n  /* TODO */\n}`);
  }
  const header = [
    `/* ${config.name} component: ${name}`,
    ` * Selector grammar: ${root}[data-<axis>="<value>"]:<state> ${root}__<slot>`,
    ` * The default value of each axis is styled by the base rule; other values get their own rule.`,
    ` * Docs: docs/design-system/authoring-guide.md#components */`,
  ].join('\n');
  return `${header}\n\n${blocks.join('\n\n')}\n`;
}

export function scaffoldComponent(
  rootDir: string,
  name: string,
  opts: ComponentScaffoldOptions,
  config: DsConfig,
): { cssPath: string; manifestPath: string } {
  validate(name, opts);
  const dir = join(rootDir, COMPONENTS_DIR, name);
  if (existsSync(dir)) {
    throw new ScaffoldError(`${dir} already exists; scaffold never overwrites`);
  }
  mkdirSync(dir, { recursive: true });
  const cssPath = join(dir, `${name}.css`);
  const manifestPath = join(dir, `${name}${MANIFEST_SUFFIX}`);
  writeFileSync(manifestPath, renderComponentManifest(name, opts, config));
  writeFileSync(cssPath, renderComponentCss(name, opts, config));
  return { cssPath, manifestPath };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run test/scaffold.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Checkpoint**

Report: `src/scaffold/tokens.ts`, `src/scaffold/component.ts`, `test/scaffold.test.ts` created.

---

## Task 15: Reporter, CLI, public exports, and package build

**Files:**
- Create: `packages/ds-compiler/src/report.ts`
- Create: `packages/ds-compiler/src/cli.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Create: `packages/ds-compiler/.prettierignore`
- Test: `packages/ds-compiler/test/cli.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIXTURE_MINI, MINI_CONFIG, makeRoot } from './helpers.js';

const pkgDir = fileURLToPath(new URL('..', import.meta.url));

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('npx', ['tsx', 'src/cli.ts', ...args], {
      cwd: pkgDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status: number; stdout: string; stderr: string };
    return { code: e.status, stdout: String(e.stdout), stderr: String(e.stderr) };
  }
}

describe('bwp-ds CLI', () => {
  it('lint exits 0 on the mini fixture', () => {
    const r = run(['lint', '--root', FIXTURE_MINI]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('0 errors');
  });

  it('lint exits 1 and prints coded diagnostics on a broken root', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: nope; }',
    });
    const r = run(['lint', '--root', root]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('DS-E012');
    expect(r.stderr).toContain('hint:');
  });

  it('lint --json prints a JSON array of diagnostics', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: nope; }',
    });
    const r = run(['lint', '--root', root, '--json']);
    const parsed = JSON.parse(r.stdout) as { diagnostics: Array<{ code: string }> };
    expect(parsed.diagnostics[0].code).toBe('DS-E012');
  });

  it('build writes design.ir.json into the root', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const r = run(['build', '--root', root]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('design.ir.json');
  });

  it('scaffold tokens and scaffold component write files', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(run(['scaffold', 'tokens', 'color', '--root', root]).code).toBe(0);
    expect(run(['scaffold', 'tokens', 'colour', '--root', root]).code).toBe(1);
    const r = run([
      'scaffold', 'component', 'button', '--root', root,
      '--axis', 'variant=solid,outline', '--axis', 'size=sm,md',
      '--state', 'hover,disabled', '--slot', 'icon',
    ]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('button.manifest.json');
    expect(run(['scaffold', 'component', 'button', '--root', root]).code).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/cli.test.ts`
Expected: FAIL, `src/cli.ts` does not exist (tsx exits non-zero).

- [ ] **Step 3: Create `packages/ds-compiler/src/report.ts`**

```ts
import {
  formatDiagnostic,
  sortDiagnosticsForDisplay,
  type Diagnostics,
} from './errors.js';

export function summarize(diag: Diagnostics): string {
  const e = diag.errors.length;
  const w = diag.warnings.length;
  return `${e} error${e === 1 ? '' : 's'}, ${w} warning${w === 1 ? '' : 's'}`;
}

/** Sorted by file, line, column. Errors go to stderr, warnings and the summary to stdout. With json, one object to stdout. */
export function printDiagnostics(
  diag: Diagnostics,
  json: boolean,
  extra: Record<string, unknown> = {},
): void {
  const ordered = sortDiagnosticsForDisplay(diag.items);
  if (json) {
    console.log(JSON.stringify({ diagnostics: ordered, summary: summarize(diag), ...extra }));
    return;
  }
  for (const d of ordered) {
    if (d.severity === 'error') {
      console.error(formatDiagnostic(d));
    } else {
      console.log(formatDiagnostic(d));
    }
  }
  console.log(summarize(diag));
  for (const [key, value] of Object.entries(extra)) {
    console.log(`${key}: ${String(value)}`);
  }
}
```

- [ ] **Step 4: Create `packages/ds-compiler/src/cli.ts`**

```ts
#!/usr/bin/env node
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { Command } from 'commander';
import { build } from './build.js';
import { loadConfig, type DsConfig } from './config.js';
import { Diagnostics } from './errors.js';
import { lint } from './lint.js';
import { printDiagnostics } from './report.js';
import {
  ScaffoldError,
  scaffoldComponent,
  type ComponentScaffoldOptions,
} from './scaffold/component.js';
import { scaffoldTokens } from './scaffold/tokens.js';
import { TOKEN_CATEGORIES, isTokenCategory } from './tokens/categories.js';

const { version } = createRequire(import.meta.url)('../package.json') as { version: string };

const program = new Command()
  .name('bwp-ds')
  .description('Design-system compiler: CSS source of truth to IR and target theme layers')
  .version(version)
  .option('--root <dir>', 'source root containing ds.config.json', process.cwd())
  .option('--json', 'machine-readable output', false);

interface GlobalOpts {
  root: string;
  json: boolean;
}

function globals(): GlobalOpts {
  const opts = program.opts<GlobalOpts>();
  return { root: resolve(opts.root), json: opts.json };
}

function requireConfig(root: string, json: boolean): DsConfig | null {
  const diag = new Diagnostics();
  const config = loadConfig(root, diag);
  if (!config) {
    printDiagnostics(diag, json);
    process.exitCode = 1;
  }
  return config;
}

program
  .command('lint')
  .description('Check authoring rules without writing files')
  .action(() => {
    const { root, json } = globals();
    const diag = lint(root);
    printDiagnostics(diag, json);
    process.exitCode = diag.hasErrors() ? 1 : 0;
  });

program
  .command('build')
  .description('Compile CSS and manifests into design.ir.json')
  .action(() => {
    const { root, json } = globals();
    const result = build(root);
    printDiagnostics(result.diagnostics, json, result.outFile ? { wrote: result.outFile } : {});
    process.exitCode = result.ir ? 0 : 1;
  });

const scaffold = program
  .command('scaffold')
  .description('Write files that already satisfy the authoring rules');

scaffold
  .command('tokens <category>')
  .description(`Create src/tokens/<category>.css; categories: ${TOKEN_CATEGORIES.join(', ')}`)
  .action((category: string) => {
    const { root, json } = globals();
    const config = requireConfig(root, json);
    if (!config) {
      return;
    }
    if (!isTokenCategory(category)) {
      console.error(`"${category}" is not a token category. Allowed: ${TOKEN_CATEGORIES.join(', ')}`);
      process.exitCode = 1;
      return;
    }
    try {
      const { path } = scaffoldTokens(root, category, config);
      console.log(`wrote ${path}`);
    } catch (err) {
      console.error(err instanceof ScaffoldError ? err.message : String(err));
      process.exitCode = 1;
    }
  });

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

scaffold
  .command('component <name>')
  .description('Create src/components/<name>/<name>.css and <name>.manifest.json')
  .option('--axis <spec>', 'axis as name=value1,value2 (repeatable); first value is the default', collect, [])
  .option('--state <list>', 'comma-separated states', '')
  .option('--slot <list>', 'comma-separated slot names (root is implicit)', '')
  .action((name: string, opts: { axis: string[]; state: string; slot: string }) => {
    const { root, json } = globals();
    const config = requireConfig(root, json);
    if (!config) {
      return;
    }
    const axes: Record<string, string[]> = {};
    for (const spec of opts.axis) {
      const [axis, values] = spec.split('=');
      if (!axis || !values) {
        console.error(`--axis expects name=value1,value2 but got "${spec}"`);
        process.exitCode = 1;
        return;
      }
      axes[axis.trim()] = splitList(values);
    }
    const options: ComponentScaffoldOptions = {
      axes,
      states: splitList(opts.state),
      slots: splitList(opts.slot),
    };
    try {
      const out = scaffoldComponent(root, name, options, config);
      console.log(`wrote ${out.manifestPath}`);
      console.log(`wrote ${out.cssPath}`);
    } catch (err) {
      console.error(err instanceof ScaffoldError ? err.message : String(err));
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
```

- [ ] **Step 5: Replace `packages/ds-compiler/src/index.ts` with the public API**

```ts
export const COMPILER_NAME = '@bwp-web/ds-compiler';

export { build, buildIR, writeIR, scanTodo, IR_FILE, TOKENS_DIR, COMPONENTS_DIR } from './build.js';
export type { BuildResult } from './build.js';
export { lint } from './lint.js';
export { loadConfig, modeSelectorFor, defaultModeSelector, CONFIG_FILE } from './config.js';
export type { DsConfig } from './config.js';
export {
  Diagnostics,
  ERROR_CATALOG,
  formatDiagnostic,
  sortDiagnosticsForDisplay,
} from './errors.js';
export type { Diagnostic, DiagnosticCode, Severity, SourceLocation } from './errors.js';
export { serializeIR, stableStringify, sourceHash } from './ir/serialize.js';
export type { SourceFile } from './ir/serialize.js';
export { IR_VERSION } from './ir/types.js';
export type {
  AxisIR,
  ComponentIR,
  DesignIR,
  IRValue,
  IRValueLiteral,
  IRValueToken,
  ManifestTargets,
  Mode,
  Rule,
  SlotIR,
  TargetHints,
  Token,
  TokenId,
} from './ir/types.js';
export {
  CATEGORY_TYPES,
  TOKEN_CATEGORIES,
  isTokenCategory,
  parseTokenName,
  tokenIdToCssName,
  categoryOfTokenId,
} from './tokens/categories.js';
export type { TokenCategory } from './tokens/categories.js';
export type {
  ColorValue,
  CubicBezierValue,
  DimensionUnit,
  DimensionValue,
  DurationValue,
  FontFamilyValue,
  FontWeightValue,
  NumberValue,
  ShadowLayer,
  ShadowValue,
  TokenType,
  TokenValue,
} from './tokens/values.js';
export { manifestSchema, parseManifest, loadManifest, manifestJsonSchema } from './components/manifest.js';
export type { Manifest } from './components/manifest.js';
export { PSEUDO_STATES, STATE_ORDER, compareStates, sortStates, stateForAttribute } from './components/states.js';
export { parseSelector } from './components/selector.js';
export type { ParsedSelector } from './components/selector.js';
export {
  BASELINE_PROPERTIES,
  FORBIDDEN_SHORTHANDS,
  PROPERTY_TABLE,
  expandShorthand,
  parseLiteralForProperty,
} from './components/properties.js';
export type { LiteralKind, PropertySpec } from './components/properties.js';
export { compareRules, sortRules, ruleKey } from './components/rules.js';
export { parseComponentCss } from './components/parse-component.js';
export { scaffoldTokens, renderTokenScaffold, CATEGORY_EXAMPLES, ScaffoldError } from './scaffold/tokens.js';
export {
  scaffoldComponent,
  renderComponentCss,
  renderComponentManifest,
  KNOWN_TARGETS,
} from './scaffold/component.js';
export type { ComponentScaffoldOptions } from './scaffold/component.js';
```

- [ ] **Step 6: Create `packages/ds-compiler/.prettierignore`**

```
schemas/manifest.schema.json
dist
```

- [ ] **Step 7: Run the CLI test, then build the package and verify the bin**

```bash
npx vitest run test/cli.test.ts
npm run build -w packages/ds-compiler
node packages/ds-compiler/dist/cli.js --help
node packages/ds-compiler/dist/cli.js lint --root packages/ds-compiler/test/fixtures/mini
```

Expected: 5 CLI tests pass. `--help` lists `lint`, `build`, `scaffold`. The fixture lint prints `0 errors, 0 warnings`. If the built `dist/cli.js` lacks the shebang, add `banner: { js: '#!/usr/bin/env node' }` to the tsup config for the cli entry and remove the shebang line from `src/cli.ts` (tsx does not need it).

- [ ] **Step 8: Format, then run everything**

From `packages/ds-compiler`:

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
```

Expected: all green. Prettier may reflow test strings; re-run tests after formatting to confirm nothing depends on formatting.

- [ ] **Step 9: Checkpoint**

Report: `src/report.ts`, `src/cli.ts`, `src/index.ts`, `.prettierignore`, `test/cli.test.ts` created or updated; `dist/` built locally (ignored by git).

---

## Task 16: The `styles-css` source package and monorepo wiring

**Files:**
- Delete: `packages/styles/**`
- Create: `packages/styles-css/package.json`
- Create: `packages/styles-css/postcss.config.js`
- Create: `packages/styles-css/.prettierignore`
- Modify: `.github/workflows/main.yml`
- Create: `packages/styles-css/ds.config.json`
- Create: `packages/styles-css/src/index.css`
- Create: `packages/styles-css/src/tokens/*.css` (15 files)
- Create: `packages/styles-css/src/tokens/MAPPING.md`
- Create: `packages/styles-css/src/components/example/example.manifest.json`
- Create: `packages/styles-css/src/components/example/example.css`
- Create: `packages/styles-css/README.md`
- Generate: `packages/styles-css/design.ir.json`
- Modify: `package.json` (root), `turbo.json`
- Modify: `packages/components/package.json`, `packages/canvas/package.json`, `packages/storybook/package.json`
- Modify: `packages/components/src/index.ts`, `packages/canvas/src/index.ts`, `packages/assets/src/index.ts`
- Modify: `README.md` (root)

- [ ] **Step 1: Remove the old styles package and its references**

```bash
rm -rf packages/styles
```

Append to the root `.gitignore`, under `# Build output`:

```
packages/ds-compiler/test/fixtures/**/design.ir.json
```

(Running the CLI by hand against the compiler's test fixture writes an IR file there; the `styles-css` IR, by contrast, is committed.)

In `packages/components/package.json` remove the line `"@bwp-web/styles": ">=1.0.13",` from `peerDependencies` and `"@bwp-web/styles": "*",` from `devDependencies`.

In `packages/canvas/package.json` remove `"@bwp-web/styles": "*",` from both `peerDependencies` and `devDependencies`.

In `packages/storybook/package.json` remove `"@bwp-web/styles": "*",` from `dependencies`.

Replace the contents of `packages/components/src/index.ts`, `packages/canvas/src/index.ts`, and `packages/assets/src/index.ts` with:

```ts
// Intentionally empty.
// Cleared ahead of the new design system; see
// docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md
export {};
```

- [ ] **Step 2: Create `packages/styles-css/package.json`**

```json
{
  "name": "@bwp-web/styles-css",
  "version": "2.0.0-alpha.0",
  "description": "Design-system CSS source of truth: tokens, component styles, and the compiled intermediate representation",
  "type": "module",
  "main": "./dist/styles.css",
  "style": "./dist/styles.css",
  "exports": {
    ".": "./dist/styles.css",
    "./styles.css": "./dist/styles.css",
    "./dist/styles.css": "./dist/styles.css",
    "./ir": "./design.ir.json",
    "./ds.config.json": "./ds.config.json",
    "./package.json": "./package.json"
  },
  "files": [
    "dist",
    "src",
    "design.ir.json",
    "ds.config.json"
  ],
  "sideEffects": [
    "**/*.css"
  ],
  "publishConfig": {
    "access": "public",
    "tag": "alpha"
  },
  "scripts": {
    "build": "bwp-ds build && postcss src/index.css -o dist/styles.css --no-map",
    "lint": "bwp-ds lint",
    "format": "prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore",
    "clean": "rm -rf dist node_modules .turbo",
    "prepublishOnly": "turbo run build --filter=@bwp-web/styles-css"
  },
  "devDependencies": {
    "@bwp-web/ds-compiler": "*",
    "postcss": "^8.5.28",
    "postcss-cli": "^12.0.0",
    "postcss-import": "^17.0.0",
    "prettier": "^3.8.3"
  },
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/evoko/workplace-public-packages.git",
    "directory": "packages/styles-css"
  }
}
```

- [ ] **Step 3: Create `packages/styles-css/postcss.config.js` and `.prettierignore`**

`postcss.config.js`:

```js
import postcssImport from 'postcss-import';

export default {
  plugins: [postcssImport()],
};
```

`.prettierignore`:

```
design.ir.json
dist
```

- [ ] **Step 4: Create `packages/styles-css/ds.config.json`**

```json
{
  "name": "SOLAR",
  "prefix": "bwp",
  "modes": ["light", "dark"],
  "defaultMode": "light",
  "rootFontSize": 16
}
```

- [ ] **Step 5: Create the 15 starter token files under `packages/styles-css/src/tokens/`**

Every file begins with the same two-line comment (adjust the category word):

```css
/* Starter content for the <category> category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
```

`color.css`:

```css
/* Starter content for the color category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-color-neutral-0: #ffffff;
  --bwp-color-neutral-100: #f5f5f5;
  --bwp-color-neutral-300: #c9c9c9;
  --bwp-color-neutral-700: #333333;
  --bwp-color-neutral-900: #111111;
  --bwp-color-accent-default: #1863d3;
  --bwp-color-accent-hover: #1453b0;
  --bwp-color-text-default: var(--bwp-color-neutral-900);
  --bwp-color-text-muted: var(--bwp-color-neutral-700);
  --bwp-color-text-on-accent: var(--bwp-color-neutral-0);
  --bwp-color-surface-default: var(--bwp-color-neutral-0);
  --bwp-color-surface-raised: var(--bwp-color-neutral-100);
  --bwp-color-border-default: var(--bwp-color-neutral-300);
  --bwp-color-focus-ring: #3f8cff;
}

:root[data-bwp-theme="dark"] {
  --bwp-color-neutral-0: #111111;
  --bwp-color-neutral-100: #222222;
  --bwp-color-neutral-300: #484848;
  --bwp-color-neutral-700: #c9c9c9;
  --bwp-color-neutral-900: #ffffff;
  --bwp-color-accent-default: #3f8cff;
  --bwp-color-accent-hover: #6aa6ff;
}
```

`space.css`:

```css
/* Starter content for the space category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-space-1: 4px;
  --bwp-space-2: 8px;
  --bwp-space-3: 12px;
  --bwp-space-4: 16px;
  --bwp-space-6: 24px;
  --bwp-space-8: 32px;
}
```

`radius.css`:

```css
/* Starter content for the radius category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-radius-sm: 4px;
  --bwp-radius-md: 6px;
  --bwp-radius-lg: 12px;
  --bwp-radius-pill: 9999px;
}
```

`font-family.css`:

```css
/* Starter content for the font-family category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-font-family-body: 'Open Sans', Arial, sans-serif;
  --bwp-font-family-heading: 'Montserrat', Arial, sans-serif;
}
```

`font-size.css`:

```css
/* Starter content for the font-size category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-font-size-xs: 0.75rem;
  --bwp-font-size-sm: 0.875rem;
  --bwp-font-size-md: 1rem;
  --bwp-font-size-lg: 1.25rem;
}
```

`font-weight.css`:

```css
/* Starter content for the font-weight category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-font-weight-regular: 400;
  --bwp-font-weight-semibold: 600;
  --bwp-font-weight-bold: 700;
}
```

`line-height.css`:

```css
/* Starter content for the line-height category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-line-height-tight: 1.25;
  --bwp-line-height-normal: 1.5;
}
```

`letter-spacing.css`:

```css
/* Starter content for the letter-spacing category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-letter-spacing-tight: -0.02em;
  --bwp-letter-spacing-normal: 0;
}
```

`shadow.css`:

```css
/* Starter content for the shadow category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --bwp-shadow-focus: 0 0 0 2px var(--bwp-color-focus-ring);
}
```

`border-width.css`:

```css
/* Starter content for the border-width category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-border-width-1: 1px;
  --bwp-border-width-2: 2px;
}
```

`duration.css`:

```css
/* Starter content for the duration category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-duration-fast: 150ms;
  --bwp-duration-normal: 250ms;
}
```

`easing.css`:

```css
/* Starter content for the easing category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-easing-standard: cubic-bezier(0.4, 0, 0.2, 1);
}
```

`opacity.css`:

```css
/* Starter content for the opacity category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-opacity-disabled: 0.4;
}
```

`z-index.css`:

```css
/* Starter content for the z-index category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-z-index-dropdown: 1000;
  --bwp-z-index-modal: 1300;
}
```

`size.css`:

```css
/* Starter content for the size category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-size-control-sm: 32px;
  --bwp-size-control-md: 44px;
  --bwp-size-icon-md: 20px;
}
```

- [ ] **Step 6: Create `packages/styles-css/src/tokens/MAPPING.md`**

```markdown
# Design file to token mapping

Every token authored from a design file (Figma or otherwise) is recorded here so
a reviewer can check the mapping. One table per category. Add a row when you add
a token from a design source; leave the table empty for hand-authored tokens.

Columns: design-file name (as shown in the design tool), token name, note on any
judgment call.

## color

| Design name | Token | Note |
| --- | --- | --- |

## space

| Design name | Token | Note |
| --- | --- | --- |

## radius

| Design name | Token | Note |
| --- | --- | --- |

## font-family

| Design name | Token | Note |
| --- | --- | --- |

## font-size

| Design name | Token | Note |
| --- | --- | --- |

## font-weight

| Design name | Token | Note |
| --- | --- | --- |

## line-height

| Design name | Token | Note |
| --- | --- | --- |

## letter-spacing

| Design name | Token | Note |
| --- | --- | --- |

## shadow

| Design name | Token | Note |
| --- | --- | --- |

## border-width

| Design name | Token | Note |
| --- | --- | --- |

## duration

| Design name | Token | Note |
| --- | --- | --- |

## easing

| Design name | Token | Note |
| --- | --- | --- |

## opacity

| Design name | Token | Note |
| --- | --- | --- |

## z-index

| Design name | Token | Note |
| --- | --- | --- |

## size

| Design name | Token | Note |
| --- | --- | --- |
```

- [ ] **Step 7: Create the starter component `packages/styles-css/src/components/example/`**

`example.manifest.json`:

```json
{
  "$schema": "../../../../ds-compiler/schemas/manifest.schema.json",
  "name": "example",
  "displayName": "Example",
  "description": "Starter component that exercises axes, states, and a slot. Replace it with real components.",
  "axes": {
    "tone": { "values": ["neutral", "accent"], "default": "neutral" },
    "size": { "values": ["sm", "md"], "default": "md" }
  },
  "states": ["hover", "focus-visible", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "label": { "element": "span" },
    "icon": { "element": "span", "optional": true }
  },
  "preview": { "label": "Example", "icon": "plus" },
  "targets": {
    "tailwind": {},
    "mui": { "excluded": "starter component; the real design system replaces it" },
    "flutter": { "excluded": "starter component; the real design system replaces it" }
  }
}
```

`example.css`:

```css
/* Starter component. Replace with real components; keep the selector grammar
   from docs/design-system/authoring-guide.md#components. */
.bwp-example {
  appearance: none;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--bwp-space-2);
  min-height: var(--bwp-size-control-md);
  padding: var(--bwp-space-2) var(--bwp-space-4);
  border-style: solid;
  border-width: var(--bwp-border-width-1);
  border-color: var(--bwp-color-border-default);
  border-radius: var(--bwp-radius-md);
  background-color: var(--bwp-color-surface-default);
  color: var(--bwp-color-text-default);
  font-family: var(--bwp-font-family-body);
  font-size: var(--bwp-font-size-md);
  font-weight: var(--bwp-font-weight-semibold);
  line-height: var(--bwp-line-height-tight);
  letter-spacing: var(--bwp-letter-spacing-tight);
  cursor: pointer;
  transition-property: background-color, border-color, color;
  transition-duration: var(--bwp-duration-fast);
  transition-timing-function: var(--bwp-easing-standard);
}

.bwp-example:hover {
  background-color: var(--bwp-color-surface-raised);
}

.bwp-example:focus-visible {
  outline-style: none;
  box-shadow: var(--bwp-shadow-focus);
}

.bwp-example:disabled {
  cursor: not-allowed;
  opacity: var(--bwp-opacity-disabled);
}

.bwp-example[data-tone="accent"] {
  border-color: transparent;
  background-color: var(--bwp-color-accent-default);
  color: var(--bwp-color-text-on-accent);
}

.bwp-example[data-tone="accent"]:hover {
  background-color: var(--bwp-color-accent-hover);
}

.bwp-example[data-size="sm"] {
  min-height: var(--bwp-size-control-sm);
  padding: var(--bwp-space-1) var(--bwp-space-3);
  font-size: var(--bwp-font-size-sm);
}

.bwp-example .bwp-example__icon {
  display: inline-flex;
  width: var(--bwp-size-icon-md);
  height: var(--bwp-size-icon-md);
}
```

- [ ] **Step 8: Create `packages/styles-css/src/index.css`**

Since Task 16b, `bwp-ds build` generates this file; write it by hand here only so the first PostCSS build has an entry, and expect the build to rewrite the header. Generated form:

```css
/* Generated by bwp-ds build. Do not edit by hand.
   Order: token files alphabetical by category, then components alphabetical. */

@import './tokens/border-width.css';
@import './tokens/color.css';
@import './tokens/duration.css';
@import './tokens/easing.css';
@import './tokens/font-family.css';
@import './tokens/font-size.css';
@import './tokens/font-weight.css';
@import './tokens/letter-spacing.css';
@import './tokens/line-height.css';
@import './tokens/opacity.css';
@import './tokens/radius.css';
@import './tokens/shadow.css';
@import './tokens/size.css';
@import './tokens/space.css';
@import './tokens/z-index.css';

@import './components/example/example.css';
```

- [ ] **Step 9: Create `packages/styles-css/README.md`**

```markdown
# @bwp-web/styles-css

The design system's source of truth: hand-written CSS tokens and component
styles, plus the compiled intermediate representation (`design.ir.json`) that
every other target package (Tailwind, MUI, Flutter) is generated from.

## Install

```bash
npm install @bwp-web/styles-css
```

## Use

```css
@import '@bwp-web/styles-css';
```

Set the color mode on the root element: `<html data-bwp-theme="dark">`. The
default mode needs no attribute.

Components are plain CSS classes on plain HTML:

```html
<button class="bwp-example" data-tone="accent" data-size="sm">
  <span class="bwp-example__icon">…</span>
  <span class="bwp-example__label">Save</span>
</button>
```

## Author

Read `docs/design-system/authoring-guide.md` before editing anything under
`src/`. The short version:

- Tokens live in `src/tokens/<category>.css`, one file per category, named
  `--bwp-<category>-<path>`.
- Components live in `src/components/<name>/` as `<name>.css` plus
  `<name>.manifest.json`.
- Run `npx bwp-ds lint` after every edit and `npx bwp-ds build` to regenerate
  `design.ir.json`. Both run from this directory.
- `npx bwp-ds scaffold component <name>` and `npx bwp-ds scaffold tokens
  <category>` create files that already follow the rules.

## Exports

| Export | Content |
| --- | --- |
| `.` and `./styles.css` | Bundled CSS: all tokens and components |
| `./ir` | `design.ir.json`, the compiled IR |
| `./ds.config.json` | Name, prefix, and modes |

Import the IR as JSON:

```js
import ir from '@bwp-web/styles-css/ir' with { type: 'json' };
```
```

- [ ] **Step 10: Wire the root**

In the root `package.json`, add to `scripts`:

```json
"ds": "bwp-ds --root packages/styles-css",
"test": "turbo run test"
```

In `turbo.json`, add to `tasks` (package-scoped tasks make lint work on a fresh checkout and keep the committed IR out of the build input hash while registering it as an output):

```json
"@bwp-web/styles-css#build": {
  "dependsOn": ["^build"],
  "inputs": ["$TURBO_DEFAULT$", "!design.ir.json", "!src/index.css"],
  "outputs": ["dist/**", "design.ir.json", "src/index.css"]
},
"@bwp-web/styles-css#lint": {
  "dependsOn": ["@bwp-web/ds-compiler#build"]
},
"test": {
  "dependsOn": ["^build"]
}
```

In the root `README.md`, replace the package table with:

```markdown
| Package                                              | Description                                                       | README                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| [`@bwp-web/styles-css`](./packages/styles-css)       | Design-system source of truth: CSS tokens, components, and the IR | [docs](./packages/styles-css/README.md)         |
| [`@bwp-web/ds-compiler`](./packages/ds-compiler)     | Private compiler: lint, build, scaffold (targets come later)      | [docs](./docs/design-system/authoring-guide.md) |
| [`@bwp-web/components`](./packages/components)       | Shared React components (empty during the V2 rebuild)             | [docs](./packages/components/README.md)         |
| [`@bwp-web/assets`](./packages/assets)               | Shared icons, image, and font assets (empty during the V2 rebuild) | [docs](./packages/assets/README.md)            |
| [`@bwp-web/canvas`](./packages/canvas)               | Interactive canvas editor and viewer (empty during the V2 rebuild) | [docs](./packages/canvas/README.md)            |
```

Also in the root `README.md`, replace the `## Storybook` section body with one paragraph: "The Storybook is being rebuilt for the V2 design system. See `AGENTS.md` and `docs/design-system/` for the current state." Leave the Releasing section as is (Plan 6 revises it).

In `.github/workflows/main.yml`, add two steps after "Install dependencies" (so lint has a built compiler and the committed IR is verified against the source) and one after "Run format":

```yaml
      - name: Build
        run: npm run build

      - name: Check generated files are up to date
        run: git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css
```

```yaml
      - name: Run tests
        run: npm run test
```

- [ ] **Step 11: Install, build, and verify the source package**

From the repo root:

```bash
npm install
npm run build -w packages/ds-compiler
npm run ds -- lint
npx prettier --write packages/styles-css --ignore-path .gitignore --ignore-path packages/styles-css/.prettierignore
npm run ds -- lint
npm run format -w packages/styles-css
npm run build -w packages/styles-css
npm run lint
npm run typecheck
npm run test
ls packages/styles-css/dist packages/styles-css/design.ir.json
```

Expected: lint prints `0 errors, 0 warnings`, build prints `wrote …/packages/styles-css/design.ir.json`, the styles-css build writes `dist/styles.css`, and `design.ir.json` exists. Prettier runs before the IR build so `meta.sourceHash` matches the committed source bytes; Prettier may rewrite attribute-selector quotes, and the second lint confirms the parser is unaffected. Root lint, typecheck, and test pass across all workspaces. If `postcss-cli` fails to load the ESM config, rename it to `postcss.config.mjs`.

Inspect `packages/styles-css/design.ir.json`: it starts with `"components"`, contains `"example"`, and `meta.name` is `SOLAR`.

- [ ] **Step 12: Checkpoint**

Report: `packages/styles` deleted; `packages/styles-css/**` created including generated `design.ir.json`; root `package.json`, `turbo.json`, `README.md`, and the three package manifests and stubs modified; `package-lock.json` updated.

---

## Task 16b: Generated `src/index.css` entry file

Decided with the user on 2026-09-17 (batch 7 review follow-up). `src/index.css` is
no longer hand-maintained: `bwp-ds build` and both scaffold commands regenerate
it deterministically, and `bwp-ds lint` reports `DS-E070` when it is missing or
does not match the files on disk. The entry file is not part of `sourceHash`
(it is derived, not authored), so regenerating it never changes the IR.

**Files:**
- Create: `packages/ds-compiler/src/paths.ts`
- Create: `packages/ds-compiler/src/entry.ts`
- Modify: `packages/ds-compiler/src/build.ts` (constants move to `paths.ts`; `build` writes the entry file)
- Modify: `packages/ds-compiler/src/lint.ts`
- Modify: `packages/ds-compiler/src/errors.ts` (add `DS-E070`)
- Modify: `packages/ds-compiler/src/scaffold/tokens.ts`, `packages/ds-compiler/src/scaffold/component.ts`
- Modify: `packages/ds-compiler/src/cli.ts` (report the entry path)
- Modify: `packages/ds-compiler/src/index.ts` (exports)
- Modify: `packages/ds-compiler/test/helpers.ts`, `test/lint.test.ts`, `test/scaffold.test.ts`, `test/cli.test.ts`
- Create: `packages/ds-compiler/test/entry.test.ts`
- Create: `packages/ds-compiler/test/fixtures/mini/src/index.css`
- Regenerate: `packages/styles-css/src/index.css` (by running the build)

- [ ] **Step 1: Write the failing test**

`packages/ds-compiler/test/entry.test.ts`:

```ts
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build } from '../src/build.js';
import {
  ENTRY_FILE,
  ENTRY_HEADER,
  checkEntryCss,
  discoverEntrySources,
  expectedEntryCss,
  renderEntryCss,
  writeEntryCss,
} from '../src/entry.js';
import { Diagnostics } from '../src/errors.js';
import { lint } from '../src/lint.js';
import { MINI_CONFIG, makeRoot } from './helpers.js';

describe('entry file rendering', () => {
  it('renders the header, then token imports, then component imports', () => {
    const text = renderEntryCss({ tokens: ['color', 'space'], components: ['badge'] });
    expect(text).toBe(
      `${ENTRY_HEADER}\n\n@import './tokens/color.css';\n@import './tokens/space.css';\n\n@import './components/badge/badge.css';\n`,
    );
  });

  it('renders only the header for an empty root', () => {
    expect(renderEntryCss({ tokens: [], components: [] })).toBe(`${ENTRY_HEADER}\n`);
  });

  it('discovers token files and complete component directories in code-unit order', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/space.css': ':root { --fx-space-1: 4px; }',
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
      'src/tokens/MAPPING.md': '# mapping',
      'src/components/button/button.css': '.fx-button { display: block; }',
      'src/components/button/button.manifest.json': '{}',
      'src/components/broken/notes.txt': 'no css here',
      'src/components/badge/badge.css': '.fx-badge { display: block; }',
    });
    expect(discoverEntrySources(root)).toEqual({
      tokens: ['color', 'space'],
      components: ['badge', 'button'],
    });
  });

  it('returns empty lists when the source directories do not exist', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(discoverEntrySources(root)).toEqual({ tokens: [], components: [] });
  });
});

describe('checkEntryCss', () => {
  it('reports DS-E070 when the file is missing', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const diag = new Diagnostics();
    checkEntryCss(root, diag);
    expect(diag.items).toHaveLength(1);
    expect(diag.items[0]).toMatchObject({
      code: 'DS-E070',
      location: { file: ENTRY_FILE, line: 1, column: 1 },
    });
    expect(diag.items[0].message).toContain('missing');
  });

  it('reports DS-E070 when the file is stale and nothing when it matches', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
      'src/index.css': "@import './tokens/color.css';\n",
    });
    const stale = new Diagnostics();
    checkEntryCss(root, stale);
    expect(stale.items.map((d) => d.code)).toEqual(['DS-E070']);
    expect(stale.items[0].message).toContain('does not match');

    writeFileSync(join(root, ENTRY_FILE), expectedEntryCss(root));
    const fresh = new Diagnostics();
    checkEntryCss(root, fresh);
    expect(fresh.items).toEqual([]);
  });
});

describe('writeEntryCss', () => {
  it('creates the file, is idempotent, and rewrites a stale file', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const first = writeEntryCss(root);
    expect(first).toEqual({ path: join(root, ENTRY_FILE), changed: true });
    expect(readFileSync(first.path, 'utf8')).toBe(expectedEntryCss(root));
    expect(writeEntryCss(root).changed).toBe(false);

    writeFileSync(first.path, '/* edited by hand */\n');
    expect(writeEntryCss(root).changed).toBe(true);
    expect(readFileSync(first.path, 'utf8')).toBe(expectedEntryCss(root));
  });

  it('creates src/ when the root has no source directories yet', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const { path } = writeEntryCss(root);
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, 'utf8')).toBe(`${ENTRY_HEADER}\n`);
  });
});

describe('lint and build with the entry file', () => {
  const files = {
    'ds.config.json': MINI_CONFIG,
    'src/tokens/color.css': ':root { --fx-color-a: #000; }',
  };

  it('lint reports only DS-E070 for a root without an entry file', () => {
    const root = makeRoot(files);
    expect(lint(root).items.map((d) => d.code)).toEqual(['DS-E070']);
  });

  it('build writes the entry file and reports its path; lint is then clean', () => {
    const root = makeRoot(files);
    const result = build(root);
    expect(result.ir).not.toBeNull();
    expect(result.entryFile).toBe(join(root, ENTRY_FILE));
    expect(readFileSync(result.entryFile!, 'utf8')).toContain("@import './tokens/color.css';");
    expect(lint(root).items).toEqual([]);
  });

  it('build writes the entry file but not the IR when the IR has errors', () => {
    const root = makeRoot({
      ...files,
      'src/tokens/space.css': ':root { --fx-space-1: nope; }',
    });
    const result = build(root);
    expect(result.ir).toBeNull();
    expect(result.entryFile).toBe(join(root, ENTRY_FILE));
    expect(existsSync(join(root, ENTRY_FILE))).toBe(true);
    expect(existsSync(join(root, 'design.ir.json'))).toBe(false);
  });

  it('lint skips the entry check when the config cannot be loaded', () => {
    const root = makeRoot({ 'src/tokens/color.css': ':root { --fx-color-a: #000; }' });
    expect(lint(root).items.map((d) => d.code)).toEqual(['DS-E001']);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run test/entry.test.ts`
Expected: FAIL, cannot resolve `../src/entry.js`.

- [ ] **Step 3: Create `packages/ds-compiler/src/paths.ts` and point `build.ts` at it**

`src/paths.ts`:

```ts
/** File and directory names inside a source root. Kept separate so entry.ts and build.ts do not import each other. */
export const IR_FILE = 'design.ir.json';
export const TOKENS_DIR = 'src/tokens';
export const COMPONENTS_DIR = 'src/components';
export const ENTRY_FILE = 'src/index.css';
```

In `src/build.ts`, delete the three `export const IR_FILE / TOKENS_DIR / COMPONENTS_DIR` lines and replace them with:

```ts
import { COMPONENTS_DIR, IR_FILE, TOKENS_DIR } from './paths.js';
export { COMPONENTS_DIR, IR_FILE, TOKENS_DIR } from './paths.js';
```

(Existing importers of these names from `./build.js` keep working.)

- [ ] **Step 4: Create `packages/ds-compiler/src/entry.ts`**

```ts
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import type { Diagnostics } from './errors.js';
import { COMPONENTS_DIR, ENTRY_FILE, TOKENS_DIR } from './paths.js';

export { ENTRY_FILE } from './paths.js';

export const ENTRY_HEADER = `/* Generated by bwp-ds build. Do not edit by hand.
   Order: token files alphabetical by category, then components alphabetical. */`;

export interface EntrySources {
  /** Token category file names without the .css extension, code-unit sorted. */
  tokens: string[];
  /** Component directory names that contain <name>.css, code-unit sorted. */
  components: string[];
}

function codeUnitCompare(a: string, b: string): number {
  if (a < b) {
    return -1;
  }
  return a > b ? 1 : 0;
}

/** Directory entry names sorted by code unit, or [] when the directory does not exist. */
function listNames(dir: string): string[] {
  try {
    return readdirSync(dir).sort(codeUnitCompare);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw err;
  }
}

/** Reads a file, or returns null when it does not exist. */
function readIfPresent(path: string): string | null {
  try {
    return readFileSync(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

/**
 * Every `<name>.css` under src/tokens and every `<name>/` under src/components
 * that contains `<name>.css`. Validation of names and contents is buildIR's
 * job; this only decides what the entry file imports.
 */
export function discoverEntrySources(rootDir: string): EntrySources {
  const tokens = listNames(join(rootDir, TOKENS_DIR))
    .filter((name) => name.endsWith('.css') && !name.startsWith('.'))
    .map((name) => name.slice(0, -'.css'.length));
  const components = listNames(join(rootDir, COMPONENTS_DIR)).filter(
    (name) =>
      !name.startsWith('.') &&
      existsSync(join(rootDir, COMPONENTS_DIR, name, `${name}.css`)),
  );
  return { tokens, components };
}

export function renderEntryCss(sources: EntrySources): string {
  const lines = [ENTRY_HEADER];
  if (sources.tokens.length > 0) {
    lines.push('', ...sources.tokens.map((t) => `@import './tokens/${t}.css';`));
  }
  if (sources.components.length > 0) {
    lines.push(
      '',
      ...sources.components.map((c) => `@import './components/${c}/${c}.css';`),
    );
  }
  return `${lines.join('\n')}\n`;
}

export function expectedEntryCss(rootDir: string): string {
  return renderEntryCss(discoverEntrySources(rootDir));
}

/** Adds DS-E070 when src/index.css is missing or differs from what build would write. */
export function checkEntryCss(rootDir: string, diag: Diagnostics): void {
  const actual = readIfPresent(join(rootDir, ENTRY_FILE));
  const expected = expectedEntryCss(rootDir);
  if (actual === expected) {
    return;
  }
  const message =
    actual === null
      ? `${ENTRY_FILE} is missing`
      : `${ENTRY_FILE} does not match the files under ${TOKENS_DIR} and ${COMPONENTS_DIR}`;
  diag.add('DS-E070', message, { file: ENTRY_FILE, line: 1, column: 1 });
}

/** Writes src/index.css when its content would change. */
export function writeEntryCss(rootDir: string): {
  path: string;
  changed: boolean;
} {
  const path = join(rootDir, ENTRY_FILE);
  const expected = expectedEntryCss(rootDir);
  if (readIfPresent(path) === expected) {
    return { path, changed: false };
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, expected);
  return { path, changed: true };
}
```

- [ ] **Step 5: Add `DS-E070` to `packages/ds-compiler/src/errors.ts`**

After the `DS-E061` entry:

```ts
  'DS-E070': {
    title: 'Entry file out of date',
    hint: 'src/index.css is generated. Run bwp-ds build (or any scaffold command) to regenerate it; never edit it by hand.',
  },
```

- [ ] **Step 6: Wire `lint` and `build`**

Replace `src/lint.ts`:

```ts
import { buildIR } from './build.js';
import { checkEntryCss } from './entry.js';
import type { Diagnostics } from './errors.js';

/** Runs every authoring rule without writing any file. */
export function lint(rootDir: string): Diagnostics {
  const result = buildIR(rootDir);
  // sources is empty only when ds.config.json could not be read (DS-E001);
  // an entry-file error on top of that would be noise.
  if (result.sources.length > 0) {
    checkEntryCss(rootDir, result.diagnostics);
  }
  return result.diagnostics;
}
```

Replace `build` in `src/build.ts` (add `import { writeEntryCss } from './entry.js';` at the top):

```ts
/** buildIR plus writing src/index.css and design.ir.json when there are no errors. */
export function build(
  rootDir: string,
): BuildResult & { outFile?: string; entryFile?: string } {
  const result = buildIR(rootDir);
  if (!result.ir) {
    return result;
  }
  const entry = writeEntryCss(rootDir);
  return {
    ...result,
    outFile: writeIR(rootDir, result.ir),
    entryFile: entry.path,
  };
}
```

- [ ] **Step 7: Regenerate the entry file from the scaffold commands**

In `src/scaffold/tokens.ts`, import `writeEntryCss` from `../entry.js` and change `scaffoldTokens` to return `{ path: string; entryPath: string }`:

```ts
  mkdirSync(dirname(path), { recursive: true });
  writeNewFile(path, renderTokenScaffold(category, config));
  const entry = writeEntryCss(rootDir);
  return { path, entryPath: entry.path };
```

In `src/scaffold/component.ts`, import `writeEntryCss` from `../entry.js` and change `scaffoldComponent` to return `{ cssPath: string; manifestPath: string; entryPath: string }`:

```ts
  writeNewFile(manifestPath, manifestText);
  writeNewFile(cssPath, cssText);
  const entry = writeEntryCss(rootDir);
  return { cssPath, manifestPath, entryPath: entry.path };
```

- [ ] **Step 8: Report the entry file from the CLI**

In `src/cli.ts`, the `build` action passes the entry path along with the IR path:

```ts
    const extra: Record<string, unknown> = {};
    if (result.outFile) {
      extra.wrote = result.outFile;
    }
    if (result.entryFile) {
      extra.entry = result.entryFile;
    }
    printDiagnostics(result.diagnostics, json, extra);
```

The `scaffold tokens` success path reports `[path, entryPath]` and the `scaffold component` success path reports `[manifestPath, cssPath, entryPath]` through the existing `scaffoldSuccess` helper, so `--json` output is `{"wrote":[...]}` with the entry file last and plain output prints one `wrote <path>` line per file.

- [ ] **Step 9: Export from `src/index.ts`**

Add:

```ts
export { ENTRY_FILE } from './paths.js';
export {
  ENTRY_HEADER,
  checkEntryCss,
  discoverEntrySources,
  expectedEntryCss,
  renderEntryCss,
  writeEntryCss,
} from './entry.js';
export type { EntrySources } from './entry.js';
```

- [ ] **Step 10: Update fixtures and existing tests**

Create `test/fixtures/mini/src/index.css` with exactly what `renderEntryCss` produces for the fixture (11 token files, then `badge`, then `button`):

```css
/* Generated by bwp-ds build. Do not edit by hand.
   Order: token files alphabetical by category, then components alphabetical. */

@import './tokens/border-width.css';
@import './tokens/color.css';
@import './tokens/duration.css';
@import './tokens/easing.css';
@import './tokens/font-family.css';
@import './tokens/font-size.css';
@import './tokens/font-weight.css';
@import './tokens/line-height.css';
@import './tokens/radius.css';
@import './tokens/shadow.css';
@import './tokens/space.css';

@import './components/badge/badge.css';
@import './components/button/button.css';
```

Add to `test/helpers.ts`:

```ts
import { writeEntryCss } from '../src/entry.js';

/** Writes the generated src/index.css into a root so lint can be clean. */
export function withEntry(root: string): string {
  writeEntryCss(root);
  return root;
}
```

In `test/lint.test.ts`, wrap every `makeRoot(...)` whose result is asserted to lint with no diagnostics or with an exact list of codes in `withEntry(...)` (the "passes a complete component", "respects baseline: false", and the custom-baseline roots; check each remaining test and wrap where the assertion is exact). In `test/scaffold.test.ts`, the scaffold commands already regenerate the entry file; the "lints with only DS-E050 until filled, then clean" test needs no change. In `test/cli.test.ts`, the `--json` scaffold success test now expects `wrote` to have length 3, and the plain scaffold test still checks that stdout contains `button.manifest.json`.

- [ ] **Step 11: Run everything**

From `packages/ds-compiler`:

```bash
npx prettier --write . --ignore-path ../../.gitignore --ignore-path .prettierignore
npx vitest run
npm run typecheck
npm run lint
npm run format
npm run build
```

Expected: all green; the suite gains the entry tests.

- [ ] **Step 12: Regenerate the styles-css entry file and verify**

From the repo root (Node 22):

```bash
npm run build
npm run ds -- lint
npm run format
shasum -a 256 packages/styles-css/design.ir.json
```

Expected: `packages/styles-css/src/index.css` now starts with the generated header and imports the same 15 token files and `example` component. Lint prints `0 errors, 0 warnings`. The IR checksum is unchanged (the entry file is not a hashed source). Then edit `packages/styles-css/src/index.css` by hand (delete one line), run `npm run ds -- lint`, confirm `DS-E070`, and run `npm run build` to restore it.

- [ ] **Step 13: Review amendments (applied during execution, 2026-09-17)**

The quality review changed the shape above; the code on disk is authoritative:

- Directory listing lives in `src/sources.ts` (`listTokenFiles`, `listComponentDirs`, symlinks followed with `statSync`, dotfiles and `node_modules` skipped, code-unit sorted) and is shared by `buildIR` and `discoverEntrySources`, so the entry file and the IR can never disagree about which files exist. Valid symlinked token files are now in both; broken symlinks and directories named `*.css` are in neither.
- `build()` writes `src/index.css` whenever the config loaded, even when the IR has errors, so the DS-E070 hint ("run `bwp-ds build`") always works. `design.ir.json` is still written only on success.
- `readIfPresent` maps EISDIR, ENOTDIR, and EACCES to a DS-E070 naming the cause instead of throwing; `writeEntryCss` failures are wrapped with a `cannot write src/index.css:` message.
- `lint` skips the entry check only when a `DS-E001` diagnostic is present.
- `renderEntryCss` sorts its inputs. Scaffold commands report the entry path only when it changed (`entryPath: string | null`); the `scaffold` group help says it also regenerates `src/index.css`.
- The four path constants are exported from `./paths.js` only.
- `turbo.json` `@bwp-web/styles-css#build` excludes `src/index.css` from inputs and lists it as an output; CI's generated-files check covers both `design.ir.json` and `src/index.css`. The `styles-css` README says the entry file is generated.

- [ ] **Step 14: Checkpoint**

Report: `src/paths.ts`, `src/sources.ts`, `src/entry.ts`, `test/entry.test.ts`, `test/fixtures/mini/src/index.css` created; `build.ts`, `lint.ts`, `errors.ts`, `cli.ts`, `index.ts`, both scaffold modules, `test/helpers.ts`, `test/lint.test.ts`, `test/cli.test.ts` modified; `packages/styles-css/src/index.css` regenerated.

---

## Task 17: Documentation for agents and humans

**Files:**
- Create: `AGENTS.md`
- Create: `CLAUDE.md`
- Create: `docs/design-system/authoring-guide.md`
- Create: `docs/design-system/figma-mapping.md`
- Create: `docs/design-system/ir.md`
- Create: `docs/design-system/errors.md`
- Create: `docs/design-system/verification.md`
- Create: `docs/design-system/targets/tailwind.md`
- Create: `docs/design-system/targets/mui.md`
- Create: `docs/design-system/targets/flutter.md`

These files are prose. Write them exactly as given; later plans extend them. Wherever a document quotes a command or a rule, it must match the code from Tasks 1 to 16. After writing, run `npx prettier --check AGENTS.md CLAUDE.md docs/design-system` from the root and fix any formatting it reports.

- [ ] **Step 1: Create `AGENTS.md`**

```markdown
# Agent guide

Read this before touching anything in this repository. It tells you what the
project is, what must never change, where things live, which commands to run,
and how to do the common tasks without guessing.

## What this repository is

A monorepo that turns one hand-written CSS design system into equivalent theme
layers for Tailwind CSS, MUI, and Flutter, and verifies that they stay in
parity. The design system in use today is called SOLAR. The infrastructure is
design-system agnostic: its name, CSS prefix, and color modes live in
`packages/styles-css/ds.config.json`, and nothing in the code is named after it.

Full design: `docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md`.

## Invariants

1. **The CSS in `packages/styles-css/src` is the single source of truth.**
   Every other representation (the IR, Tailwind, MUI, Flutter) is derived from
   it by the compiler. Fix the source or the compiler, never the derived output.
2. **Never edit generated files:** anything under a `generated/` directory,
   `design.ir.json`, and `packages/styles-css/src/index.css`. They are
   regenerated by `bwp-ds build` (and, later, `bwp-ds generate`), and CI fails
   on drift.
3. **Everything downstream of the CSS is algorithmic.** If a translation is
   wrong, change the compiler's handler table or a target plugin, not the
   output. Do not "fix" generated code by hand and do not ask a model to
   rewrite it.
4. **Run `bwp-ds lint` after every edit to the CSS source, and `bwp-ds build`
   before you report completion.** A lint error is a hard stop; fix it before
   the next file.
5. **Never run a git command that writes** (`add`, `commit`, `tag`, `branch`,
   `reset`). The maintainers handle version control. Report which files you
   changed instead.
6. **Do not name anything after the current design system.** Use `ds`, `bwp`,
   or a descriptive word. The design system's display name comes from
   `ds.config.json`.
7. **If a command is denied or blocked, stop and report it.** Do not reach the
   same effect through another tool or a script. The maintainers decide.

## Package map

| Path | Package | Role |
| --- | --- | --- |
| `packages/ds-compiler` | `@bwp-web/ds-compiler` (private) | Parser, IR, `bwp-ds` CLI. Later: target plugins, verifier, story generator. |
| `packages/styles-css` | `@bwp-web/styles-css` | The CSS source of truth, `ds.config.json`, and the compiled `design.ir.json`. |
| `packages/storybook` | `@bwp-web/storybook` (private) | Unified Storybook. Compare views arrive in a later plan. |
| `packages/assets`, `packages/components`, `packages/canvas` | published, currently empty | Untouched by the design-system work. |
| `docs/design-system/` | | Human documentation. Start with `authoring-guide.md`. |

## Commands

Run from the repo root with Node 22 (`nvm use` reads `.nvmrc`).
`npm run ds -- <command>` targets `packages/styles-css`.

| Command | What it does |
| --- | --- |
| `npm run ds -- lint` | Checks every authoring rule. Exit 1 on any error. |
| `npm run ds -- build` | Lint plus writes `packages/styles-css/src/index.css` and `design.ir.json`. |
| `npm run ds -- scaffold tokens <category>` | Creates a token file that already follows the rules and updates `src/index.css`. |
| `npm run ds -- scaffold component <name> --axis a=v1,v2 --state s1,s2 --slot x` | Creates a manifest and CSS skeleton and updates `src/index.css`. The first axis value is the default. Duplicate axis names, values, or slots are rejected. |
| `npm run ds -- lint --json` | Same diagnostics as JSON, for tooling. |
| `npm run test` | Compiler unit tests. |
| `npm run lint`, `npm run typecheck`, `npm run format` | Repo-wide checks; CI runs them. |

Every diagnostic has the form
`<file>:<line>:<col> <severity> <code> <title>: <message>` followed by a
`hint:` line. Codes are listed in `docs/design-system/errors.md`.

With `--json`, `lint` and `build` print one object
`{ "diagnostics": [...], "summary": "<n> errors, <m> warnings", "wrote"?: path, "entry"?: path }`.
`scaffold` prints `{ "wrote": [paths] }` on success or `{ "error": "<message>" }`
on failure, except when `ds.config.json` cannot be loaded, in which case it
prints the `diagnostics` object like `lint` does. Exit code 1 on any error.

## Authoring procedure (design file to CSS)

Follow these steps in order. Do not skip, reorder, or merge them.

1. Read `docs/design-system/authoring-guide.md` and
   `docs/design-system/figma-mapping.md`.
2. Inventory the design file. List variables and styles grouped by the token
   categories in the authoring guide. List components with their variants,
   sizes, states, and parts.
3. For each token category you need: run `scaffold tokens <category>` if the
   file does not exist, then fill in values. Name tokens by the rules in the
   mapping guide, never by the design-file name verbatim. Record every
   design-name to token mapping in `packages/styles-css/src/tokens/MAPPING.md`.
4. Run `lint`. Fix every error. Run `build`.
5. For each component: run `scaffold component <name>` with the axes, states,
   and slots you found, then fill in values. Every color, spacing, radius,
   font, shadow, border width, duration, and easing must be a `var()` token
   reference. If the design uses a value that has no token, add the token
   first. Never write the literal.
6. Fill the `targets` section of each manifest using
   `docs/design-system/targets/*.md`, or set `{ "excluded": "<reason>" }`.
7. Run `lint`, fix, `build`. When `bwp-ds verify` exists, run it too.
8. Report using the template below.

### Report template

```
Tokens added: <count> across <categories>
Components added: <names>
Mappings recorded in MAPPING.md: yes/no
Targets excluded: <component>.<target>: <reason>
Design values with no clear home: <list, or none>
Ambiguities resolved (and how): <list, or none>
Lint: 0 errors, <n> warnings   Build: design.ir.json written
```

### Never do

- Write a literal color, spacing, radius, font, shadow, border width,
  duration, or easing in a component. Use a token.
- Invent a token category. The set is fixed in the authoring guide.
- Put a state or axis on a slot selector. They go on the root compound.
- Edit anything under `generated/`, `design.ir.json`, or `src/index.css`.
- Skip `lint` between files.
- Resolve an ambiguity silently. Put it in the report.
- Use the `disabled` state on a root whose element is not a form control
  (`button`, `input`, `select`, `textarea`). `:disabled` never matches a `div`;
  set `slots.root.element` in the manifest instead.

## Recipes

### Add a token

1. Open `packages/styles-css/src/tokens/<category>.css` (or scaffold it).
2. Add `--bwp-<category>-<path>: <value>;` inside `:root`. If the value differs
   per mode, add the same name inside every mode block.
3. `npm run ds -- lint`, then `npm run ds -- build`.

### Add a component

1. `npm run ds -- scaffold component <name> --axis ... --state ... --slot ...`
2. Fill `<name>.css`. The base rule `.bwp-<name>` styles the default axis
   values; other values get `[data-<axis>="<value>"]` rules; states get
   pseudo-class or attribute rules on the root; slots get
   `.bwp-<name> .bwp-<name>__<slot>` rules.
3. Fill `<name>.manifest.json`: `displayName`, `description`, `preview`,
   `targets`.
4. `npm run ds -- lint`, then `npm run ds -- build`. The build regenerates
   `src/index.css`; do not edit it.

### Support a new CSS property

1. Add an entry to `PROPERTY_TABLE` in
   `packages/ds-compiler/src/components/properties.ts`. Choose `token(...)` for
   design values, `keyword([...])` for enumerations, `free(...)` for free-form
   literals.
2. Add a test case in `packages/ds-compiler/test/properties.test.ts`.
3. Document it in the properties section of the authoring guide.
4. Later plans add a handler per target; until then the property is
   `unsupported` for generation and coverage reports it.

### Add a state or axis to a component

Add it to the manifest first (`states` or `axes`), then use it in the CSS.
Using it in CSS first fails with `DS-E031` or `DS-E033`.

### Change the compiler

The compiler is TypeScript under `packages/ds-compiler/src`. Every module has a
test file under `test/`. Add or update the test first, run
`npx vitest run` from the package, then implement. Errors get a stable code in
`src/errors.ts` and an entry in `docs/design-system/errors.md`.

## Error code index

See `docs/design-system/errors.md`. Ranges: `DS-E00x` config, `DS-E01x`
tokens, `DS-E02x` manifests, `DS-E03x` selectors, `DS-E04x` declarations,
`DS-E05x` scaffolding leftovers, `DS-E06x` file layout and CSS syntax,
`DS-E07x` generated files, `DS-W00x` warnings.
```

- [ ] **Step 2: Create `CLAUDE.md`**

```markdown
Read `AGENTS.md` first. It holds the invariants, package map, commands, and
procedures for this repository.
```

- [ ] **Step 3: Create `docs/design-system/authoring-guide.md`**

```markdown
# Authoring guide

How to write the CSS source of truth so the compiler can read it. Every rule
here is enforced by `bwp-ds lint`; the error code in parentheses is what you
see when you break it. See `errors.md` for the full list.

## Configuration

`packages/styles-css/ds.config.json`:

| Field | Meaning |
| --- | --- |
| `name` | Display name of the design system. Used in Storybook and docs only. |
| `prefix` | Lowercase word that starts every custom property and class: `--<prefix>-…`, `.<prefix>-…`. |
| `modes` | Color-scheme modes, for example `["light", "dark"]`. |
| `defaultMode` | The mode whose values live on `:root`. Must be one of `modes`. |
| `rootFontSize` | Pixels per `rem`, used when a target needs absolute units. Default 16. |
| `modeSelector` | Selector for non-default modes with `{mode}` as placeholder. Default `:root[data-<prefix>-theme="{mode}"]`. |

An invalid or missing config is `DS-E001`.

## Tokens

Location: `src/tokens/<category>.css`, one file per category. The file name is
the category (`DS-E017` otherwise).

Categories and the value each accepts:

| Category | Accepts | Example |
| --- | --- | --- |
| `color` | any CSS color | `#1863d3`, `rgb(0 0 0 / 50%)` |
| `space` | dimension | `8px`, `0.5rem` |
| `radius` | dimension | `6px` |
| `font-family` | family list | `'Open Sans', Arial, sans-serif` |
| `font-size` | dimension | `1rem` |
| `font-weight` | 1 to 1000, `normal`, `bold` | `600` |
| `line-height` | number or dimension | `1.5`, `24px` |
| `letter-spacing` | dimension | `-0.02em` |
| `shadow` | one or more `box-shadow` layers, `none` | `0 1px 2px rgba(0, 0, 0, 0.2)` |
| `border-width` | dimension | `1px` |
| `duration` | `ms` or `s` | `150ms` |
| `easing` | `cubic-bezier()` or a keyword | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `opacity` | number | `0.4` |
| `z-index` | number | `1000` |
| `size` | dimension | `44px` |

Dimensions accept `px`, `rem`, `em`, `%`, and unitless `0`.

Rules:

- A token file may contain only `:root { … }` and one block per non-default
  mode using the configured mode selector. No at-rules, no other selectors, no
  nesting (`DS-E010`). A CSS syntax error in any source file is `DS-E061`.
- Every declaration is `--<prefix>-<category>-<path>` where `<category>` is the
  file's category and `<path>` is one or more lowercase kebab-case segments
  (`DS-E011`). Every hyphen in the path is a segment boundary:
  `--bwp-color-on-primary` has the path `on.primary`.
- A value is a literal of the category's type or `var(--<prefix>-…)` pointing
  to another token. No `calc()`, no `var()` fallback, no mixed content
  (`DS-E012`).
- An alias must point to an existing token (`DS-E013`) whose value type is
  accepted by this category (`DS-E014`). `radius` may alias `space` because
  both are dimensions; `space` may not alias `color`.
- A token is either mode-invariant (declared only in `:root`) or declared in
  every mode (`DS-E015`). Declaring it twice in one mode is `DS-E016`.

Conventions the compiler does not enforce but every target relies on:

- **Mode blocks redefine semantic tokens, not primitives.** Keep the raw
  palette (`neutral-900`, `accent-500`) the same in every mode and switch the
  semantic layer (`text-default`, `surface-default`, `border-default`) per
  mode. A consumer who reads a primitive directly must get the same color in
  every mode.
- **No token path may be a prefix of another token's path.** `text-on` and
  `text-on-accent` cannot coexist because targets that nest tokens (Dart
  classes, Tailwind namespaces) cannot represent both. Prefer `text-inverse`.

Example:

```css
:root {
  --bwp-color-neutral-0: #ffffff;
  --bwp-color-neutral-900: #111111;
  --bwp-color-text-default: var(--bwp-color-neutral-900);
  --bwp-color-surface-default: var(--bwp-color-neutral-0);
}

:root[data-bwp-theme="dark"] {
  --bwp-color-text-default: var(--bwp-color-neutral-0);
  --bwp-color-surface-default: var(--bwp-color-neutral-900);
}
```

The primitives stay mode-invariant; `text-default` and `surface-default` are
declared in `:root` and in `dark`, so they are mode-varying with an alias per
mode.

## Components

Location: `src/components/<name>/<name>.css` and `<name>.manifest.json`. Both
must exist (`DS-E060`) and `manifest.name` must equal `<name>` (`DS-E021`).

### Selector grammar

```
.<prefix>-<name>                     root, default axis values, no state
.<prefix>-<name>[data-<axis>="<v>"]  one axis value (repeatable for several axes)
.<prefix>-<name>:<state>             a state (repeatable)
.<prefix>-<name> .<prefix>-<name>__<slot>   a slot, reached by one descendant space
```

Parts combine: `.bwp-button[data-variant="outline"][data-size="sm"]:hover .bwp-button__icon`.

States and how to write them:

| State | Write |
| --- | --- |
| `hover` | `:hover` |
| `active` | `:active` |
| `focus-visible` | `:focus-visible` |
| `disabled` | `:disabled`, `[disabled]`, or `[aria-disabled="true"]`. `:disabled` and `[disabled]` match only form controls; a `div` root needs `[aria-disabled="true"]` and a manifest `slots.root.element` that fits. |
| `pressed` | `[aria-pressed="true"]` |
| `selected` | `[aria-selected="true"]` |
| `expanded` | `[aria-expanded="true"]` |
| `checked` | `[aria-checked="true"]` |
| any other name | `[data-state="<name>"]` |

Rules:

- Axes and their values must be declared in the manifest (`DS-E031`); slots
  too (`DS-E032`); states too (`DS-E033`).
- Anything outside the grammar is `DS-E030`: extra classes, unknown
  pseudo-classes, unknown attributes.
- Forbidden outright (`DS-E034`): element selectors, ids, `*`, `&`,
  pseudo-elements, combinators other than one descendant space, more than one
  descendant step, `!important`, nesting, any at-rule, states or axes on the
  slot compound.
- The compiler orders rules itself: root before slots, fewer axes first, axis
  values in manifest order, fewer states first, then `hover`,
  `focus-visible`, `active`, `pressed`, `selected`, `expanded`, `checked`,
  `disabled`, then other states alphabetically. Source order does not matter.
  Two rules with the same slot, axes, and states merge; setting one property
  to two different values, within one rule or across rules, is `DS-E046`. A
  shorthand followed by one of its longhands with a different value counts
  (`padding: … ; padding-top: …`). Rules with no declarations are dropped.

### Declarations

The compiler knows a fixed table of properties (`DS-E040` for any other). Each
property is one of three kinds:

**Token-required.** The value must be `var(--<prefix>-<category>-…)` from an
allowed category (`DS-E041` for a literal, `DS-E043` for an unknown token,
`DS-E044` for the wrong category). A few escape-hatch keywords are allowed:

| Properties | Categories | Escape hatches |
| --- | --- | --- |
| `color`, `background-color`, `border-*-color`, `outline-color`, `caret-color`, `text-decoration-color`, `fill`, `stroke` | `color` | `transparent`, `currentColor`, `inherit` |
| `padding-*`, `row-gap`, `column-gap`, `outline-offset` | `space` | `0` |
| `margin-*` | `space` | `0`, `auto` |
| `top`, `right`, `bottom`, `left` | `space`, `size` | `0`, `auto` |
| `border-*-radius` | `radius` | `0` |
| `border-*-width`, `outline-width` | `border-width` | `0` |
| `text-decoration-thickness` | `border-width` | `auto`, `from-font` |
| `text-underline-offset` | `space` | `auto` |
| `font-family` | `font-family` | |
| `font-size` | `font-size` | |
| `font-weight` | `font-weight` | |
| `line-height` | `line-height` | `normal` |
| `letter-spacing` | `letter-spacing` | `normal` |
| `box-shadow` | `shadow` | `none` |
| `transition-duration`, `transition-delay` | `duration` | |
| `transition-timing-function` | `easing` | |

**Keyword.** Only listed keywords (`DS-E042` otherwise): `display`, `position`,
`box-sizing`, `align-*`, `justify-*`, `flex-direction`, `flex-wrap`,
`overflow*`, `visibility`, `object-fit`, `border-collapse`, `list-style-type`,
`background-image` (`none` only), `border-*-style`, `outline-style`,
`font-style`, `text-align`, `vertical-align`, `text-transform`,
`text-decoration-line`, `text-decoration-style`, `white-space`,
`text-overflow`, `cursor`, `appearance`, `pointer-events`, `user-select`,
`resize`. The exact keyword lists are in
`packages/ds-compiler/src/components/properties.ts`.

**Free.** A token from the listed categories or a free literal of the listed
kinds: `width`, `height`, `min-*`, `max-*`, `flex-basis` (`size` or `space`
token, any dimension, `auto`, `none`, `fit-content`, `max-content`,
`min-content`); `flex-grow`, `flex-shrink`, `order` (number); `opacity`
(`opacity` token or number); `z-index` (`z-index` token, number, `auto`);
`stroke-width` (`border-width` token, number, dimension);
`transition-property` (comma-separated identifiers, `none`, `all`).

Shorthands: `padding`, `margin`, `border-width`, `border-style`,
`border-color`, `border-radius`, and `gap` are expanded to their longhands
(1 to 4 values, `gap` 1 to 2). `border`, `background`, `font`, `transition`,
`outline`, `flex`, `inset`, `animation`, `text-decoration`, `place-*`,
`grid*`, `columns`, `list-style` are forbidden (`DS-E045`); write the longhands.

### Baseline

The base root rule (no axes, no states) should declare `appearance`,
`box-sizing`, `background-color`, `color`, `font-family`, `font-size`,
`line-height`, and all four `border-*-style` (or `border-style`). Missing any
is warning `DS-W001`. Set `"baseline": false` in the manifest to opt out, or
`"baseline": ["display", "color"]` to use your own list.

## Manifest

```json
{
  "$schema": "../../../../ds-compiler/schemas/manifest.schema.json",
  "name": "button",
  "displayName": "Button",
  "description": "Triggers an action.",
  "axes": {
    "variant": { "values": ["solid", "outline"], "default": "solid" }
  },
  "states": ["hover", "focus-visible", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "icon": { "element": "span", "optional": true }
  },
  "preview": { "label": "Button", "icon": "plus" },
  "baseline": ["display", "color"],
  "targets": {
    "tailwind": {},
    "mui": { "excluded": "not mapped yet" }
  }
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | Kebab-case, equals the directory name. |
| `displayName` | yes | Human name. |
| `description` | no | One sentence. |
| `axes` | no | Each axis: `values` (lowercase letters and digits, hyphen-separated, may start with a digit like `2xl`) and `default` (one of the values). The default is styled by the base rule. |
| `states` | no | The states the CSS may use. |
| `slots` | no | Named parts. `root` is implicit and always present; its element defaults to `div` and it cannot be optional. Other slots have `element` (default `span`) and `optional` (default false). |
| `preview` | no | Text or icon names per slot for Storybook. |
| `baseline` | no | `false` or a list of supported properties; see Baseline. An unknown property name is `DS-E020`. |
| `targets` | no | Per target: `{}` or hints (later plans), or `{ "excluded": "<reason>" }`. A target that is absent is unmapped and fails coverage once verification exists. |

Unknown fields and invalid shapes are `DS-E020`. A `$schema` field is allowed
and ignored. The JSON schema is `packages/ds-compiler/schemas/manifest.schema.json`.

## Entry file

`src/index.css` is generated. `bwp-ds build` and both scaffold commands write
it: one `@import` per token file in alphabetical order, then one per component
in alphabetical order. `bwp-ds lint` reports `DS-E070` when it is missing,
unreadable, or does not match the files on disk; run `bwp-ds build` to fix it.
Never edit it by hand. The PostCSS bundle `dist/styles.css` is built from it.

## Scaffolding and the lint loop

`bwp-ds scaffold tokens <category>` and
`bwp-ds scaffold component <name> --axis variant=solid,outline --state hover,disabled --slot icon`
write files that satisfy every rule above and leave `TODO` markers where you
fill in values. A remaining `TODO` in any token file, component CSS file, or
manifest is `DS-E050`, so a half-filled scaffold cannot pass. Scaffold never
overwrites an existing file (the entry file is the one exception, it is
regenerated), rejects duplicate axis names, axis values, and slot names, and
takes the first value of each axis as its default. The component root element
defaults to `div`; change `slots.root.element` in the manifest before using the
`disabled` state.

Loop: edit one file, run `bwp-ds lint`, fix every error, move on. Finish with
`bwp-ds build`.
```

- [ ] **Step 4: Create `docs/design-system/figma-mapping.md`**

```markdown
# Design file to source mapping

Deterministic rules for turning a design file (Figma or similar) into tokens
and components. Apply these rules; do not choose. Anything the rules do not
cover goes into the report as an ambiguity.

## Variables and styles to token categories

| In the design file | Category |
| --- | --- |
| Color variables and color styles | `color` |
| Number variables used for padding, gap, margin | `space` |
| Number variables used for corner radius | `radius` |
| Text style font family | `font-family` |
| Text style font size | `font-size` |
| Text style font weight | `font-weight` |
| Text style line height | `line-height` (unitless when the design gives a percentage of font size; `px` when fixed) |
| Text style letter spacing | `letter-spacing` |
| Effect styles of type drop shadow or inner shadow | `shadow` (inner shadow is `inset`) |
| Number variables used for stroke width | `border-width` |
| Prototype transition durations | `duration` |
| Prototype easing curves | `easing` |
| Layer opacity used as a design decision (for example disabled) | `opacity` |
| Stacking order values | `z-index` |
| Fixed widths or heights of controls and icons | `size` |

Variable collections map to files only through the category of each variable;
a collection named "Brand" contributes to `color.css`, `space.css`, and so on.

## Modes

The design file's mode names map to `ds.config.json` `modes`. If the design has
"Light" and "Dark", the config has `["light", "dark"]`. A variable whose value
differs per mode is declared in `:root` and in every other mode block. A
variable that is the same in every mode is declared only in `:root`.

## Names

Design names use slashes and title case: `Color/Text/On Primary`. Token names
use the prefix, the category, and lowercase kebab-case segments:
`--bwp-color-text-on-primary`.

1. Drop the leading group when it repeats the category (`Color/…` for a color).
2. Lowercase everything.
3. Replace spaces and slashes with hyphens; collapse repeats.
4. Numeric scales keep the number: `Grey/900` becomes `--bwp-color-grey-900`;
   `Space/4` becomes `--bwp-space-4`.
5. State words stay as the last segment: `default`, `hover`, `active`,
   `disabled`.
6. Never encode a mode in the name (`--bwp-color-text-dark` is wrong; use the
   mode block).

Record each mapping as a row in `packages/styles-css/src/tokens/MAPPING.md`.

## Components

| In the design file | In the manifest and CSS |
| --- | --- |
| Component or component set name | `name` (kebab-case), `displayName` |
| Variant property with several options | an axis; its options are the values; the design's default variant is `default` |
| Boolean property that shows or hides a layer | an `optional: true` slot |
| Boolean property that changes appearance | a `data-state` state |
| Instance-swap property | a slot |
| Interactive component states (hover, pressed, focused, disabled) | states `hover`, `active`, `focus-visible`, `disabled` |
| Named layers inside the component (label, icon, indicator) | slots, kebab-case |
| Auto-layout padding, gap | `padding-*`, `row-gap`, `column-gap` with `space` tokens |
| Fill | `background-color` with a `color` token |
| Stroke | `border-*-width`, `border-*-style: solid`, `border-*-color` |
| Corner radius | `border-radius` with a `radius` token |
| Text style | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` tokens |
| Effect | `box-shadow` with a `shadow` token |
| Fixed width or height | `width`, `height`, `min-*` with `size` tokens |

The default value of every axis is styled by the base rule. Only non-default
values get their own `[data-<axis>="<value>"]` rule.

## Values with no token

If a component uses a color, spacing, radius, font value, shadow, border
width, duration, or easing that no token provides, add the token to its
category file first, record the mapping, then reference it. Never write the
literal in the component.

## Never do

- Write a literal where a token is required.
- Create a category outside the fixed set.
- Put a state or axis on a slot selector.
- Edit `generated/` output or `design.ir.json`.
- Skip `bwp-ds lint` between files.
- Resolve an ambiguity silently. Write it in the report.
```

- [ ] **Step 5: Create `docs/design-system/ir.md`**

```markdown
# Intermediate representation

`bwp-ds build` compiles the CSS source into `packages/styles-css/design.ir.json`.
Every target plugin reads this file, never the CSS. The TypeScript types live
in `packages/ds-compiler/src/ir/types.ts`.

## Shape

```
DesignIR
  irVersion: 1
  meta: { name, prefix, modes, defaultMode, rootFontSize, sourceHash }
  tokens: { [tokenId]: Token }
  components: { [name]: ComponentIR }
```

`sourceHash` is a SHA-256 over every source file (config, token files,
component CSS and manifests) sorted by path. Two builds of identical sources
produce identical files; the JSON has sorted keys and a trailing newline.

## Tokens

Token ids are dot paths with the category first: `--bwp-color-text-default`
becomes `color.text.default`.

```
Token
  $type: color | dimension | fontFamily | fontWeight | number | duration | cubicBezier | shadow
  $value: <value> when modeInvariant, else { [mode]: <value> }
  modeInvariant: boolean
  category, path, cssName
  alias?: tokenId when modeInvariant, else { [mode]: tokenId } for the modes whose source used var()
  source: { file, line, column }
```

`$type` and `$value` follow the W3C Design Tokens Community Group format so a
formatter can emit standard token JSON without an IR change. Values are
normalized:

| Type | Value |
| --- | --- |
| color | `{ hex: "#rrggbbaa" }` |
| dimension | `{ value, unit }` with unit `px`, `rem`, `em`, or `%` |
| fontFamily | `{ families: [...] }` |
| fontWeight | `{ weight }` |
| number | `{ value }` |
| duration | `{ ms }` |
| cubicBezier | `{ points: [x1, y1, x2, y2] }` |
| shadow | `{ layers: [{ inset, offsetX, offsetY, blur, spread, color }] }` where color is `{ hex }` or `{ ref: tokenId }` |

Aliases are resolved: `$value` is always a concrete value. A token declared
only in `:root` that aliases a mode-varying token is itself mode-varying.

## Components

```
ComponentIR
  name, displayName, description?
  axes: { [axis]: { values, default } }
  states: [...]
  slots: { [slot]: { element, optional } }   root first
  preview: { [slot]: text }
  rules: Rule[]                               in cascade order
  targets: manifest targets, verbatim
```

```
Rule
  slot: "root" | slot name
  axes: { [axis]: value }      only the axes this rule selects
  states: [...]                sorted canonically
  declarations: { [cssProperty]: IRValue }
  source: { file, line, column }
```

Declarations use canonical longhand CSS property names. Shorthands from the
source are expanded. Values:

```
IRValue
  { kind: "token", ref: tokenId }
  { kind: "literal", type: "keyword" | "dimension" | "number" | "color" | "string", value }
```

Rule order is fixed by the compiler: slot order (root first, then manifest
order), fewer axes first, axis values in manifest order, fewer states first,
then canonical state order. Generators emit in this order so specificity
matches across targets.
```

- [ ] **Step 6: Create `docs/design-system/errors.md`**

```markdown
# Error codes

Every diagnostic has a stable code. Errors fail `bwp-ds lint` and `bwp-ds
build`; warnings do not. The source of truth is `ERROR_CATALOG` in
`packages/ds-compiler/src/errors.ts`.

## Configuration

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E001 | `ds.config.json` missing, not JSON, or invalid (bad prefix, `defaultMode` not in `modes`, `modeSelector` without `{mode}`) | Create or fix the file; see the authoring guide's Configuration table. |

## Tokens

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E010 | A token file contains something other than `:root` and mode blocks, or declares the default mode through its mode selector | Remove at-rules, other selectors, nested rules; put default-mode values in `:root`. |
| DS-E011 | A declaration is not `--<prefix>-<category>-<path>`, or its category differs from the file | Rename it, or move it to the right category file. |
| DS-E012 | The value is not a literal of the category type and not a clean `var()` | Use a literal of the right type, or `var(--<prefix>-…)` with no fallback or arithmetic. |
| DS-E013 | `var()` points to a token that does not exist, or aliases form a cycle | Define the target first; break the cycle. |
| DS-E014 | An alias resolves to a type the category does not accept | Point to a token of a compatible type. |
| DS-E015 | A token is declared in some modes but not all, or only in a non-default mode | Declare it in every mode block, or only in `:root`. |
| DS-E016 | The same token is declared twice in one mode | Keep one. |
| DS-E017 | A file under `src/tokens` is not named after a category | Rename to one of the fifteen categories. |

## Manifests

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E020 | The manifest is not JSON, has unknown fields, fails the schema, has an axis default outside its values, or duplicate states | Follow the manifest reference; the message lists each field. |
| DS-E021 | `manifest.name` differs from the directory name | Make them equal. |

## Selectors

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E030 | The selector does not fit the grammar: wrong root class, extra class, unknown pseudo-class or attribute, malformed slot | Use `.<prefix>-<name>[data-axis="v"]:state .<prefix>-<name>__slot`. |
| DS-E031 | An axis or axis value is not in the manifest | Declare it under `axes`. |
| DS-E032 | A slot is not in the manifest, or `__root` is used | Declare it under `slots`; style root with the root class alone. |
| DS-E033 | A state is not in the manifest | Declare it under `states`. |
| DS-E034 | Element or id selector, `*`, `&`, pseudo-element, a combinator other than one space, two descendant steps, `!important`, nesting, an at-rule, or a state or axis on the slot compound | Remove the feature; move states and axes to the root compound. |

## Declarations

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E040 | The property is not in the compiler's table | Use a supported property, or add it to `PROPERTY_TABLE` with a test. |
| DS-E041 | A token-required property has a literal | Reference a token; add the token if none fits. |
| DS-E042 | A literal is not allowed for this property, or a shorthand has the wrong number of values | Use a listed keyword or allowed literal kind; fix the value count. |
| DS-E043 | `var()` references an unknown token, or is not a clean reference | Fix the name, add the token, remove fallbacks. |
| DS-E044 | The token's category is not accepted by the property | Reference a token from an accepted category. |
| DS-E045 | A forbidden shorthand (`border`, `background`, `font`, `transition`, …) | Write the longhands. |
| DS-E046 | The same property has two different values for one slot, axes, and states, whether in one rule, across rules, or via a shorthand followed by its longhand | Keep one. |

## Scaffolding, layout, and generated files

| Code | Cause | Fix |
| --- | --- | --- |
| DS-E050 | A `TODO` left by `bwp-ds scaffold` (or written by hand) is still in a source file | Fill it in or delete the line. |
| DS-E060 | A component directory lacks `<name>.css` or `<name>.manifest.json`, or a symlink under `src/components` is broken | Add the missing file; fix or remove the link. |
| DS-E061 | A token or component CSS file has a syntax error | Fix the CSS at the reported line and column. |
| DS-E070 | `src/index.css` is missing, unreadable, or does not match the token files and components on disk | Run `bwp-ds build`; never edit the file by hand. |

## Warnings

| Code | Cause | Fix |
| --- | --- | --- |
| DS-W001 | The base root rule omits baseline properties | Declare them, or set `"baseline": false` or a custom list in the manifest. |
| DS-W002 | No token files and no component directories were found under `src/` | Check `--root`, or scaffold the first token file. |
```

- [ ] **Step 7: Create `docs/design-system/verification.md`**

```markdown
# Verification

What checks exist today, what each one proves, and how to read its output.
The full verification design is section 10 of the spec; steps arrive with the
plans that add the pieces they check.

## Today

| Command | Proves | Needs |
| --- | --- | --- |
| `bwp-ds lint` | Every authoring rule holds: config, token structure and values, aliases, manifests, selector grammar, property table, no TODO leftovers, entry file current. | Node 22 |
| `bwp-ds build` | Lint plus a complete IR was produced and written, and `src/index.css` is regenerated. | Node 22 |
| `npm run test` | The compiler behaves as specified, including one deliberately invalid input per error code. | Node 22 |
| CI "Check generated files are up to date" | The committed `design.ir.json` and `src/index.css` equal a fresh build. | CI |

## Reading a diagnostic

```
src/components/button/button.css:14:3 error DS-E041 Token required: "color: #fff" must reference a color token (or one of: transparent, currentColor, inherit)
  hint: This property must reference a token: var(--<prefix>-<category>-…). If no token fits, add one to the category file first.
```

File, line, column, severity, code, title, message, then the fix hint. The CLI
prints errors to stderr and warnings plus the summary to stdout, sorted by
file, line, and column. With `--json`, `lint` and `build` print one object to
stdout: `diagnostics` (same order), `summary`, and for `build` the `wrote` and
`entry` paths. `scaffold --json` prints `{ "wrote": [...] }` or
`{ "error": "..." }`; if the config cannot be loaded it prints the
`diagnostics` object instead.

## From a symptom to the code

- "This value is wrong in target X" and the CSS is right: the target plugin's
  handler for that property (`packages/ds-compiler/src/targets/<x>/…`, from
  Plan 2 on).
- "This value is wrong everywhere": the source CSS, or the IR normalization in
  `packages/ds-compiler/src/tokens/values.ts` and
  `src/components/parse-component.ts`.
- "Lint rejects something valid": the rule in `src/tokens/parse-tokens.ts`,
  `src/tokens/resolve-tokens.ts`, `src/components/selector.ts`, or
  `src/components/properties.ts`, in that order of likelihood.

## Planned steps

| Step | Plan | Proves |
| --- | --- | --- |
| `bwp-ds verify` drift | 2 | Regenerating every target produces no diff against committed output. |
| `bwp-ds verify` roundtrip | 2 | Each target's output re-parses to the source IR. |
| `bwp-ds verify` coverage | 2 | Every component is supported, partial with listed ignores, or excluded with a reason for every target. |
| `bwp-ds verify --rendered` | 4 | Computed styles match across web targets in a browser. |
| Flutter checks | 5 | `dart analyze`, `dart format --set-exit-if-changed`, `dart test` when the SDK is present. |
```

- [ ] **Step 8: Create the three target documents**

`docs/design-system/targets/tailwind.md`:

```markdown
# Target: Tailwind CSS

Status: designed, not yet generated. Plan 2 adds the plugin and the
`@bwp-web/styles-tailwind` package.

## What it will emit

Tailwind 4.x, CSS-first. Under `packages/styles-tailwind/src/generated/`:

- `theme.css`: an `@theme` block mapping tokens into Tailwind namespaces
  (`color` to `--color-<prefix>-…`, `space` to `--spacing-<prefix>-…`, `radius`
  to `--radius-<prefix>-…`, font categories to `--font-…`, `shadow` to
  `--shadow-<prefix>-…`), with per-mode values through the mode selector.
- `components.css`: `@layer components { .<prefix>-<name> { … } }` for every
  rule in the IR, values referencing the theme variables.
- `index.css`: imports both.

Consumers write `@import "tailwindcss"; @import "@bwp-web/styles-tailwind";`.

## Manifest hints

`targets.tailwind` accepts `{}` today. No hints are defined yet; the plugin
registers its own schema when it lands.
```

`docs/design-system/targets/mui.md`:

```markdown
# Target: MUI

Status: designed, not yet generated. Plan 3 adds the plugin, the defaults
catalog, and the `@bwp-web/styles-mui` package.

## What it will emit

MUI 9.x with Emotion. Under `packages/styles-mui/src/generated/`:

- `theme.ts` exporting `createBwpTheme()`: `createTheme` with CSS variables
  and one color scheme per mode; palette, typography, spacing, shape, and
  shadows from tokens; per component `defaultProps`, `styleOverrides`,
  `variants` (one per axis value and combination), and a reset for every
  framework default the IR does not define.
- `augmentation.d.ts`: adds the design system's axis values to the component's
  prop overrides and disables listed MUI variants.
- `theme.model.json`: the model the TypeScript was rendered from, used for
  round-trip verification.

## Defaults catalog

`bwp-ds capture-defaults --target mui` renders every mapped component in
headless Chromium and records the default theme and computed styles into
`packages/ds-compiler/catalogs/mui@<version>.json`. The generator refuses to
run against a different installed version unless told to.

## Manifest hints (reserved)

| Key | Meaning |
| --- | --- |
| `component` | MUI component name, for example `Button`. |
| `axisMap` | Axis to MUI prop, for example `{ "variant": "variant", "size": "size" }`. |
| `slotMap` | Slot to MUI slot class or prop, for example `{ "icon": "startIcon" }`. |
| `disableDefaultVariants` | MUI variant values to disable in the augmentation. |
| `defaultProps` | Extra `defaultProps`, for example `{ "disableRipple": true }`. |
| `ignore` | IR properties intentionally not translated for this component. |
| `excluded` | Reason string; the component is not mapped to MUI. |
```

`docs/design-system/targets/flutter.md`:

```markdown
# Target: Flutter

Status: designed, not yet generated. Plan 5 adds the plugin and the
`bwp_styles` Dart package. The pinned SDK is Flutter 3.47.x stable; the local
SDK must be upgraded to it before Plan 5.

## What it will emit

Under `packages/styles-flutter/lib/src/generated/`:

- `tokens.dart`: `BwpColors`, `BwpSpace`, `BwpRadius`, `BwpText`, and so on,
  with `light` and `dark` constants where values vary and plain constants
  otherwise. `rem` becomes logical pixels using `rootFontSize`.
- `theme.dart`: `BwpTheme.light()` and `BwpTheme.dark()` returning Material 3
  `ThemeData` with component themes; states through
  `WidgetStateProperty.resolveWith`; axes Flutter lacks natively (such as size)
  become named `ButtonStyle` constants.
- `<file>.flutter.json` beside each Dart file: the model the Dart was rendered
  from, used for round-trip verification.

Dart is formatted by construction; `dart format --set-exit-if-changed` runs as
a check when the SDK is present and never rewrites output.

## Manifest hints (reserved)

| Key | Meaning |
| --- | --- |
| `variantWidgets` | Axis value to Flutter widget, for example `{ "filled": "FilledButton", "outlined": "OutlinedButton" }`. |
| `ignore` | IR properties intentionally not translated for this component. |
| `excluded` | Reason string; the component is not mapped to Flutter. |
```

- [ ] **Step 9: Align the starter color tokens with the mode convention**

Replace `packages/styles-css/src/tokens/color.css` so primitives are mode-invariant and the dark block overrides the semantic layer (the values are placeholders and carry no design authority):

```css
/* Starter content for the color category. Replace with the real design
   system values; keep the naming rules from docs/design-system/authoring-guide.md. */
:root {
  --bwp-color-neutral-0: #ffffff;
  --bwp-color-neutral-100: #f5f5f5;
  --bwp-color-neutral-300: #c9c9c9;
  --bwp-color-neutral-700: #333333;
  --bwp-color-neutral-800: #222222;
  --bwp-color-neutral-900: #111111;
  --bwp-color-accent-500: #1863d3;
  --bwp-color-accent-600: #1453b0;
  --bwp-color-accent-300: #3f8cff;
  --bwp-color-accent-200: #6aa6ff;
  --bwp-color-accent-default: var(--bwp-color-accent-500);
  --bwp-color-accent-hover: var(--bwp-color-accent-600);
  --bwp-color-text-default: var(--bwp-color-neutral-900);
  --bwp-color-text-muted: var(--bwp-color-neutral-700);
  --bwp-color-text-inverse: var(--bwp-color-neutral-0);
  --bwp-color-surface-default: var(--bwp-color-neutral-0);
  --bwp-color-surface-raised: var(--bwp-color-neutral-100);
  --bwp-color-border-default: var(--bwp-color-neutral-300);
  --bwp-color-focus-ring: var(--bwp-color-accent-300);
}

:root[data-bwp-theme='dark'] {
  --bwp-color-accent-default: var(--bwp-color-accent-300);
  --bwp-color-accent-hover: var(--bwp-color-accent-200);
  --bwp-color-text-default: var(--bwp-color-neutral-0);
  --bwp-color-text-muted: var(--bwp-color-neutral-300);
  --bwp-color-text-inverse: var(--bwp-color-neutral-900);
  --bwp-color-surface-default: var(--bwp-color-neutral-900);
  --bwp-color-surface-raised: var(--bwp-color-neutral-800);
  --bwp-color-border-default: var(--bwp-color-neutral-700);
}
```

`text-on-accent` becomes `text-inverse` (the prefix rule). Update the one reference in `packages/styles-css/src/components/example/example.css` (`color: var(--bwp-color-text-inverse);` in the accent tone rule). Then from the root: `npm run ds -- lint` (0 errors) and `npm run build`, which rewrites `design.ir.json`; the new checksum is the expected one from now on. Record the new SHA-256 in the checkpoint report.

- [ ] **Step 10: Repair the README tables**

In `packages/styles-css/README.md`, "Exports" table, replace the first row with:

```markdown
| `.` (also `./styles.css` for bundlers that read `exports`) | Bundled CSS: all tokens and components |
```

and add below the "Use" example: "PostCSS with `postcss-import` resolves the bare specifier through the `style` field; only `exports`-aware bundlers (Vite, webpack) resolve `./styles.css`."

In the root `README.md`, replace the whole "Detailed Documentation" table (every row) with:

```markdown
| Document                                                                         | Contents                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| [AGENTS.md](./AGENTS.md)                                                         | Invariants, package map, commands, procedures for agents     |
| [design-system/authoring-guide.md](./docs/design-system/authoring-guide.md)      | Tokens, components, manifests, scaffolding, the lint loop    |
| [design-system/figma-mapping.md](./docs/design-system/figma-mapping.md)          | Deterministic rules from a design file to tokens and CSS     |
| [design-system/ir.md](./docs/design-system/ir.md)                                | The compiled intermediate representation                     |
| [design-system/errors.md](./docs/design-system/errors.md)                        | Every `DS-E` and `DS-W` code with cause and fix              |
| [design-system/verification.md](./docs/design-system/verification.md)            | What each check proves and how to read diagnostics           |
| [design-system/targets/](./docs/design-system/targets)                           | Tailwind, MUI, and Flutter target plans                      |
| [packages/styles-css/README.md](./packages/styles-css/README.md)                 | Installing and using the CSS package                         |
| [packages/assets/README.md](./packages/assets/README.md)                         | Icons, images, fonts (empty during the V2 rebuild)           |

The full design is in
[docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md](./docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md).
```

- [ ] **Step 11: Format and check**

```bash
npx prettier --write AGENTS.md CLAUDE.md README.md docs/design-system packages/styles-css/README.md packages/styles-css/src/tokens/color.css packages/styles-css/src/components/example/example.css
npx prettier --check AGENTS.md CLAUDE.md README.md docs/design-system
npm run format
npm run ds -- lint
npm run test
```

Expected: clean; lint prints `0 errors, 0 warnings`.

- [ ] **Step 12: Checkpoint**

Report: `AGENTS.md`, `CLAUDE.md`, and eight files under `docs/design-system/` created; `README.md`, `packages/styles-css/README.md`, `color.css`, `example.css`, and `design.ir.json` updated with the new IR checksum.

---

## Task 18: Final verification

**Files:** none new.

- [ ] **Step 1: Clean install and full pipeline from scratch**

From the repo root:

```bash
npm run clean
npm install
npm run build
npm run lint
npm run typecheck
npm run format
npm run test
npm run ds -- lint
```

Expected: every command exits 0. `npm run build` builds `ds-compiler` before
`styles-css` (Turbo orders by dependency) and leaves `packages/styles-css/dist/styles.css`
and a fresh `packages/styles-css/design.ir.json`.

Discovered during execution (2026-09-17): on a fresh clone npm does not create
`node_modules/.bin/bwp-ds` because the bin target `dist/cli.js` does not exist
at install time, so `styles-css` build and lint failed with exit 127 even
though Turbo built the compiler first. Fix: a committed shim
`packages/ds-compiler/bin/bwp-ds.js` (`#!/usr/bin/env node` and
`import '../dist/cli.js';`) is the `bin` target and is listed in `files`;
`dist/cli.js` is still built by tsup. Re-run Step 1 after the fix.

- [ ] **Step 2: Confirm the IR is reproducible**

```bash
cp packages/styles-css/design.ir.json /tmp/ir-before.json
npm run ds -- build
diff /tmp/ir-before.json packages/styles-css/design.ir.json && echo "reproducible"
```

Expected: prints `reproducible`.

- [ ] **Step 3: Walk the agent procedure once, end to end**

```bash
npm run ds -- scaffold component demo --axis tone=quiet,loud --state hover --slot icon
npm run ds -- lint
```

Expected: lint exits 1 with only `DS-E050` errors (and a `DS-W001` warning) pointing at the scaffolded files. Then delete the scaffolded component and confirm the tree is clean:

```bash
rm packages/styles-css/src/components/demo/demo.css packages/styles-css/src/components/demo/demo.manifest.json
rmdir packages/styles-css/src/components/demo
npm run ds -- lint
npm run ds -- build
npm run ds -- lint
git status --short
```

Expected: the first lint reports exactly one error, `DS-E070` (the scaffold
added `demo` to `src/index.css` and the deletion made it stale); `build`
regenerates the entry file; the second lint prints `0 errors, 0 warnings`; and
`git status` shows a clean tree (the entry file and IR are back to their
committed bytes).

- [ ] **Step 4: Final report**

List every created, modified, and deleted path grouped by package, the test
count from `npm run test`, and confirm that no git write command was run. Note
for Plan 2: the compiler exports `buildIR`, `DesignIR`, and the manifest
schema; target plugins register their hint schema by merging into
`manifestSchema.targets` and live under `packages/ds-compiler/src/targets/<id>/`.

---

## Follow-ups recorded during execution

- **Negative durations.** `parseDuration` accepts a leading minus because negative `transition-delay` is valid CSS. Nothing yet rejects a negative `duration` token bound to `transition-duration`. Revisit when target generators exist; a lint rule at the declaration level is the natural place.
- **`TargetHints` narrowing.** Consumers should narrow with `typeof hints.excluded === 'string'`, not `'excluded' in hints`. Task 12/13 code and later plugins follow this.
- **`noUncheckedIndexedAccess`.** Deferred to the end of this plan to avoid rippling through the plan's remaining code.
- **Cross-mode type check cascade.** If a second multi-type category is ever added to `CATEGORY_TYPES`, move the cross-mode type check into a memoized per-token resolution so an alias to a mixed-type token does not report a second DS-E012.
- **Manifest JSON schema is lenient on `excluded`.** Zod cannot express the `.refine()` that rejects a malformed `excluded` hint, so the emitted schema accepts what the compiler rejects. Safe direction; add `"not": {"required": ["excluded"]}` to the permissive branch in `manifestJsonSchema()` if editor parity is wanted.
- **Root slot default derivation.** `parseManifest` reads the raw JSON to know whether `slots.root.element` was authored. A cleaner form drops the schema default on `element` and applies per-slot defaults after parsing.
- **Unguarded reads in `build.ts`.** `readFileSync` calls in `buildIR` are not wrapped; an unreadable file (EACCES) surfaces as a thrown error that the CLI's `parseAsync` catch turns into a plain message, not a coded diagnostic. Add a `DS-E06x` "cannot read file" code at the next error-catalog change.
- **`KNOWN_TARGETS` in the scaffold is hard-coded** (`tailwind`, `mui`, `flutter`). When target plugins exist (Plans 2-5), derive it from the plugin registry so a new target is scaffolded automatically.
- **`:disabled` on a non-form root.** `scaffold component --state disabled` writes `:disabled` next to the default `div` root, and lint does not cross-check `slots.root.element` against the selector. Documented in Task 17 (authoring guide, AGENTS.md recipe, Figma mapping row for the root element). Code follow-up for Plan 2 or a later batch: a warning (`DS-W003`) when `:disabled` or `[disabled]` is used and the root element is not `button`, `input`, `select`, `textarea`, `fieldset`, or `option`; and a `--root-element <el>` option on `scaffold component` so the manifest is right from the start.
- **Scaffold output order follows CLI argument order** for axes and slots. Deterministic per input, but two authors listing the same axes in a different order get different bytes. Document; do not sort (authors control cascade order deliberately).
- **Test temp roots are never removed.** `makeRoot` uses `mkdtempSync` without cleanup; harmless per run, accumulates under watch mode. Add an `afterAll` sweep if it becomes a nuisance.
- **`design.ir.json` under the compiler test fixture.** Running the CLI against `test/fixtures/mini` writes an IR file there. Task 16 adds `packages/ds-compiler/test/fixtures/**/design.ir.json` to the root `.gitignore`; it is already Prettier-ignored.
- **`src/index.css` was hand-maintained.** Resolved by Task 16b (user decision 2026-09-17): `bwp-ds build` and the scaffold commands regenerate it; `bwp-ds lint` reports `DS-E070` when it is missing or stale.
- **Mode blocks should override semantic tokens, not primitives.** The starter `color.css` inverts the neutral ramp in the dark block; consumers reading a primitive directly get the wrong color. Authoring guide (Task 17): mode blocks redefine semantic tokens (`text`, `surface`, `border`), primitives stay mode-invariant.
- **Token path segments split on every hyphen.** `--bwp-color-text-on-accent` becomes `color.text.on.accent`, so a future `--bwp-color-text-on` collides with the `on` group. Authoring guide: a token name must not equal the prefix of another token's path (prefer `text-inverse` to `text-on-accent`). A compiler check is a candidate for Plan 2.
- **Root README "Detailed Documentation" table** links about 20 files under `docs/` that no longer exist (pre-existing from the strip). Task 17 rewrites that table.
- **Bundled `dist/styles.css` ships authoring comments** and concatenates the header comments of consecutive files on one line. Cosmetic; a comment-stripping PostCSS step can be added when the CSS bundle gets a real consumer.
- **`example` manifest declares a `label` slot with no CSS.** Legitimate (a structural slot), but the first target generator should decide whether slots without rules emit anything.
- **`styles-css` README advertises `./styles.css` as equivalent to `.`**, but postcss-import cannot resolve that subpath (only exports-aware bundlers can). Task 17 qualifies the row or drops it in favour of the bare specifier.
- **CI IR check uses `git diff --exit-code`**, which misses an untracked IR. Only matters for a brand-new source root; `git status --porcelain` on the path would close it.

---

## Execution log

Read this section first when resuming. It records how the plan is being executed
and where it stands. Update the status table after every milestone.

### Process

- Skill: `superpowers:subagent-driven-development`. Tasks are batched; each batch
  gets one implementer subagent (sonnet), then one spec-compliance reviewer
  (sonnet), then one code-quality reviewer (opus). Reviewer findings go back to
  the same implementer via SendMessage; the same reviewer re-verifies.
- Subagents are told to read only the plan's line range for their tasks plus
  lines 1-84, and to read the real source files for signatures, because review
  fixes have changed several modules from the plan text.
- **No git write commands, ever** (no add, commit, stash, checkout, reset). The
  user commits. Read-only `git status` and `git diff` are fine.
- **Pause after every milestone** (a batch that passed both reviews). Report the
  changed files and test counts, then wait for the user to say continue.
- The plan text is amended whenever a review decision changes later tasks, so
  later batches implement the amended text. Follow-ups that are out of scope are
  appended under "Follow-ups recorded during execution".

### Status

| Batch | Tasks | State |
| --- | --- | --- |
| 1 | 1-3 skeleton, errors, config | done, reviewed, committed by user |
| 2 | 4-6 IR types, serialize, categories, values | done, reviewed, committed by user |
| 3 | 7-8 token parsing and resolution | done, reviewed, committed by user |
| 4 | 9-11 manifest, selector, properties | done, reviewed, committed by user |
| 5 | 12-13 component parsing, build, lint, fixture | done, reviewed, committed by user |
| 6 | 14-15 scaffold commands, CLI, exports, build | done, reviewed, committed by user |
| 7 | 16 styles-css package and monorepo wiring | done, reviewed, committed by user |
| 7b | 16b generated `src/index.css` entry file | done, reviewed, committed by user |
| 8 | 17 documentation | done, reviewed, committed by user |
| 9 | 18 final verification | done (bin shim fix), awaiting user commit; Plan 1 complete |

Test suite at the end of batch 8: 18 files, 201 tests; root build, lint, typecheck, format, and test clean under Node 22.23.2. styles-css IR file SHA-256 after the color-token realignment: `16cde2888b1768cef74f832ad13aed725f5901784ea0c7db892dff7316011b78`.

### Decisions made during execution (already reflected in code and plan text)

- Node baseline raised to 22 (user decision, 2026-09-17, during Task 16): root and
  `ds-compiler` `engines.node >=22`, root `.nvmrc` = 22, tsup target `node22`,
  `@types/node ^22`, commander `^15`, `postcss-cli ^12`, `postcss-import ^17`.
  commander had been pinned to `^14` for Node 20; that pin is gone.
- Task 16 hardening (batch 7 review): `styles-css` has `main`/`style` pointing
  at `dist/styles.css` (postcss-import ignores `exports`), extra exports for
  `./dist/styles.css` and `./package.json`, `sideEffects: ["**/*.css"]`,
  `publishConfig { access: public, tag: alpha }`, and `prepublishOnly` runs
  `turbo run build --filter=@bwp-web/styles-css` so the compiler is built first.
  Turbo has package-scoped `@bwp-web/styles-css#lint` (depends on the compiler
  build) and `#build` (IR excluded from inputs, listed as output). CI builds
  first and fails if the committed `design.ir.json` differs from a fresh build.
  Step 11 runs Prettier before the IR build so `sourceHash` matches the
  committed bytes.
- Task 16b (generated entry file, user decision 2026-09-17): `src/index.css` is
  written by `bwp-ds build` and the scaffold commands and checked by `bwp-ds
  lint` as `DS-E070`. Directory listing is shared in `src/sources.ts` between
  `buildIR` and the entry so the two cannot drift; as a consequence, dotfiles
  under `src/tokens` are now ignored silently (previously `DS-E017`) and valid
  symlinked token files are included in the IR (previously skipped). `build`
  writes the entry even when the IR has errors. `src/index.css` is a Turbo
  output and excluded from the build input hash; CI's generated-files check
  covers it. Two checksums exist for the styles-css IR: the file SHA-256
  (`36d42cc0…`) and `meta.sourceHash` inside it (`22123c70…`).
- Task 17 (docs, batch 8): the starter `color.css` now keeps primitives
  mode-invariant and overrides the semantic layer in dark; `text-on-accent`
  became `text-inverse` (path-prefix rule). The IR changed accordingly. The
  docs were corrected against the code in 20 places during review (forbidden
  shorthand names, `overflow` keywords, easing keywords, shadow layer shape,
  config Required column, DS-E012 triggers, `preview` semantics, `slots` key
  order in the IR file, `--axis` repeatable, `build` write behavior, scaffold
  wording, the `disabled`-on-`div` caveat). Prose in the plan's Task 17 blocks
  is therefore slightly behind the files; the files are authoritative.
- Task 18 (final verification): a fresh `npm ci`/`npm install` did not link
  `bwp-ds` because npm skips bin targets that do not exist at install time and
  `dist/cli.js` is built later. Fixed with a committed shim
  `packages/ds-compiler/bin/bwp-ds.js` as the `bin` target (in `files`);
  `package-lock.json` records the new bin path and must be committed with it.
  From-scratch pipeline, IR reproducibility, and the scaffold walk all pass.
  Plan 1 is complete; Plan 2 (Tailwind target, drift and round-trip
  verification, coverage) is the next document to write.
- `SourceLocation.file` is relative to the source root. `Diagnostics.items` is a
  readonly getter. Catalog integrity test enforces the `DS-W` prefix convention.
- `Token` is a discriminated union on `modeInvariant`; build both arms explicitly.
- `TargetHints` narrows with `typeof hints.excluded === 'string'`.
- `DS-E061` is the code for CSS syntax errors in any file. `DS-W002` warns on an
  empty source root.
- Axis values may start with a digit (`axisValue` pattern); names use `identifier`.
- Root slot element defaults to `div`; root cannot be optional; `baseline` entries
  are validated against the property table.
- Within-rule duplicate declarations with different values are `DS-E046`;
  identical duplicates are allowed; declaration-free rules are dropped.
- Malformed `var()` in a component declaration is `DS-E042`; `DS-E043` means the
  referenced token does not exist.
- `resolveTokens` tries literal parsing before alias parsing (shadows with an
  embedded color `var()`); comment in `parseEntries` states the invariant.
- Diagnostics keep insertion order in the API; `sortDiagnosticsForDisplay` in
  `errors.ts` is for the CLI (Task 15) only.
- `parseManifest` flattens nested Zod union issues so field names appear in
  `DS-E020` messages.
- Scaffold axis default is always the first listed value. The Task 14 test
  originally expected `size` to default to `md` (the second value); corrected to
  `sm` with the `md` override rule, matching the scaffold code and CLI help text.
- Scaffold CLI hardening (batch 6 review): `--axis` splits on the first `=`
  only; a repeated axis name, duplicate axis values, and duplicate slot names
  are errors; scaffold subcommands honor `--json` (`{"wrote":[...]}` on
  success, `{"error": msg}` on failure; config failures still print the
  `{"diagnostics", "summary"}` envelope); `parseAsync` has a catch that prints
  the message only; scaffold writes use the `wx` flag through `writeNewFile`
  and never leave partial output; `stateSelector` derives from `states.ts`
  (`ARIA_TRUE_STATES` now exported) with `Object.hasOwn` guards; `--root` help
  shows "current directory"; `.prettierignore` includes `**/design.ir.json`.
  Task 17 docs must mention the two `--json` envelope shapes.
