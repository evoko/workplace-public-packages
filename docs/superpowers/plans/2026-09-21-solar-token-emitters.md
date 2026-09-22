# SOLAR token emitters (milestone 1) implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the verified SOLAR token data into a DTCG spec file and emit it as CSS custom properties, an MUI theme, a Flutter `ThemeExtension` and a Tailwind preset, with a parity test proving all four agree.

**Architecture:** One normalizer reads `docs/solar/tokens/css-contract.json` and `docs/solar-web/tokens/layout-variables.json` and writes `spec/tokens.json` in DTCG format. Four independent emitters read only `spec/tokens.json`. Each emitter also writes a manifest recording, per token, the literal it emitted and that literal parsed back to canonical form. The parity test compares the round-tripped values across all four targets and against the spec, so a conversion bug in one target fails the build.

**Tech Stack:** Node 22, plain ESM `.mjs` (matching `docs/*/build-docs.mjs`, no build step), Vitest, Dart/Flutter for the `solar_flutter` package, GitHub Actions.

**Read first:** [the design spec](../specs/2026-09-21-solar-docs-to-code-design.md). Invariant 1 is absolute: the generator must never write to `docs/`.

**Dependencies:** always use the latest stable version available; versions named below are a
floor, not a pin. Two are capped by upstream peer ranges and cannot go higher yet: TypeScript
stays on 6.x because `typescript-eslint` peers `typescript <6.1.0`, and ESLint stays on 9.x
because `eslint-plugin-react` and `eslint-plugin-jsx-a11y` do not accept 10.

**Git:** the repository owner handles all version control. The `git add` / `git commit` block
that closes each task is a **record of what belongs in that commit, for the owner to run**. An
agent executing this plan must not run any git write command. Stop after the verification step,
report what changed, and leave the working tree for review.

---

## File structure

| Path                                            | Responsibility                                                |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `packages/codegen/package.json`                 | Private workspace package, not published                      |
| `packages/codegen/src/util/paths.mjs`           | Repo root resolution, one place                               |
| `packages/codegen/src/util/write.mjs`           | The only file-writing helper; refuses paths under `docs/`     |
| `packages/codegen/src/normalize/token-type.mjs` | Figma path to DTCG `$type`                                    |
| `packages/codegen/src/normalize/deviations.mjs` | Known, reasoned departures from the Figma data                |
| `packages/codegen/src/normalize/tokens.mjs`     | Builds the DTCG tree from the contract                        |
| `packages/codegen/src/emit/manifest.mjs`        | Shared manifest writer and canonical-value parsers            |
| `packages/codegen/src/emit/css.mjs`             | CSS custom properties                                         |
| `packages/codegen/src/emit/mui.mjs`             | MUI theme input                                               |
| `packages/codegen/src/emit/tailwind.mjs`        | Tailwind preset                                               |
| `packages/codegen/src/emit/flutter.mjs`         | Dart `ThemeExtension` and constants                           |
| `packages/codegen/bin/solar-codegen.mjs`        | CLI entry point                                               |
| `packages/codegen/test/*.test.mjs`              | Vitest suites, including token parity                         |
| `spec/tokens.json`                              | Generated DTCG spec, checked in                               |
| `spec/deviations.md`                            | Generated report for SOLAR governance                         |
| `packages/styles/src/generated/`                | `tokens.css`, `mui-theme.ts`, `tailwind-preset.ts`, manifests |
| `packages/solar_flutter/`                       | Dart package: pubspec, `lib/src/generated/`, tests            |

---

### Task 1: Bootstrap the codegen package and the write guard

**Files:**

- Create: `packages/codegen/package.json`
- Create: `packages/codegen/src/util/paths.mjs`
- Create: `packages/codegen/src/util/write.mjs`
- Create: `packages/codegen/eslint.config.js`
- Create: `packages/codegen/test/write.test.mjs`
- Create: `vitest.config.mjs`
- Modify: `package.json` (root: add vitest, add `test` script)
- Modify: `turbo.json` (add a `test` task)

- [ ] **Step 1: Create the workspace package**

`packages/codegen/package.json`:

```json
{
  "name": "@bwp-web/codegen",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "Generates SOLAR tokens, assets and component recipes from docs/ into the packages",
  "scripts": {
    "test": "vitest run",
    "lint": "eslint",
    "format": "prettier --check . --ignore-path ../../.gitignore"
  },
  "devDependencies": {
    "@bwp-web/eslint-config": "*",
    "eslint": "^9.39.5",
    "globals": "^17.12.0",
    "prettier": "^3.9.8"
  }
}
```

- [ ] **Step 2: Add vitest at the root**

Run: `npm install --save-dev --workspace-root vitest@latest` (5.0.1 at time of writing)

Then add to root `package.json` scripts, after `"format:fix"`:

```json
    "test": "turbo run test",
```

And add to `turbo.json` `tasks`, after `"lint": {}`:

```json
    "test": {
      "dependsOn": ["^build"]
    },
```

Create `vitest.config.mjs` at the repo root:

```js
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Turbo runs each package's `test` script with cwd set to that package, and Vitest resolves
  // `include` against cwd rather than against the config file. Pinning root makes both
  // `npm run test` and a direct `npx vitest run <path>` resolve the same files.
  root: fileURLToPath(new URL('.', import.meta.url)),
  test: {
    include: ['packages/*/test/**/*.test.mjs'],
    environment: 'node',
  },
});
```

- [ ] **Step 3: Give the package an ESLint config**

Every workspace package needs one, or the repo-wide `npm run lint` fails on the new package.
The shared base config declares no ambient globals, because the published packages target the
browser. This one runs on Node, so it declares the Node globals through the `globals` package;
without that, `no-undef` fires on `structuredClone`, `process` and `console`.

`packages/codegen/eslint.config.js`:

```js
import baseConfig from '@bwp-web/eslint-config/base';
import globals from 'globals';

/** @type {import('typescript-eslint').Config} */
export default [
  ...baseConfig,
  {
    // Unlike the published packages, which target the browser, the generator runs on Node.
    // The shared base config declares no ambient globals, so they are declared here.
    files: ['**/*.mjs'],
    languageOptions: { globals: globals.node },
  },
  {
    // The generator is a command line tool; printing progress is its job.
    files: ['bin/**/*.mjs', 'src/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
];
```

Verify with `npm run lint` from the repo root: every package should report successful.

- [ ] **Step 4: Write the failing test for the write guard**

`packages/codegen/test/write.test.mjs`:

```js
import { afterAll, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
import { writeGenerated } from '../src/util/write.mjs';

// The guard only allows writes inside the repository, so the one positive test has to create a
// real directory here. It cleans up after itself rather than leaving that to a manual step.
const scratch = [];
afterAll(() => {
  for (const dir of scratch) rmSync(dir, { recursive: true, force: true });
});

describe('writeGenerated', () => {
  it('refuses to write anywhere under docs/, because docs/ mirrors Figma', () => {
    expect(() =>
      writeGenerated(
        join(repoRoot, 'docs', 'solar', 'tokens', 'figma-variables.json'),
        '{}',
      ),
    ).toThrow(/read-only to the generator/);
  });

  it('refuses to write outside the repository', () => {
    expect(() => writeGenerated(join(tmpdir(), 'escape.txt'), 'x')).toThrow(
      /outside the repository/,
    );
  });

  it('writes inside the repository and creates missing directories', () => {
    const dir = mkdtempSync(join(repoRoot, 'packages', 'codegen', 'tmp-'));
    scratch.push(dir);
    const file = join(dir, 'nested', 'out.txt');
    writeGenerated(file, 'hello');
    expect(readFileSync(file, 'utf8')).toBe('hello');
  });
});
```

- [ ] **Step 5: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/write.test.mjs`
Expected: FAIL, cannot resolve `../src/util/paths.mjs`.

- [ ] **Step 6: Implement the two helpers**

`packages/codegen/src/util/paths.mjs`:

```js
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
/** Absolute path to the repository root. */
export const repoRoot = resolve(here, '..', '..', '..', '..');
export const docsDir = resolve(repoRoot, 'docs');
export const specDir = resolve(repoRoot, 'spec');
export const packagesDir = resolve(repoRoot, 'packages');
```

`packages/codegen/src/util/write.mjs`:

```js
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, relative, sep } from 'node:path';
import { repoRoot } from './paths.mjs';

// Spec invariant 1: docs/ is a faithful mirror of Figma and is read-only to the generator.
// Every write in this package goes through here so a violation fails immediately.
const FORBIDDEN_TOP_LEVEL = new Set(['docs']);

export function writeGenerated(absolutePath, contents) {
  const rel = relative(repoRoot, absolutePath);
  if (rel.startsWith('..') || rel === '') {
    throw new Error(
      `refusing to write outside the repository: ${absolutePath}`,
    );
  }
  const top = rel.split(sep)[0];
  if (FORBIDDEN_TOP_LEVEL.has(top)) {
    throw new Error(
      `refusing to write to ${rel}: docs/ is the Figma mirror and is read-only to the generator (design spec invariant 1)`,
    );
  }
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
  return absolutePath;
}
```

- [ ] **Step 7: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/write.test.mjs`
Expected: PASS, 3 tests, and no `packages/codegen/tmp-*` directory left behind.

- [ ] **Step 8: Commit**

```bash
git add packages/codegen vitest.config.mjs package.json package-lock.json turbo.json
git commit -m "feat(codegen): bootstrap the generator package with a docs/ write guard"
```

---

### Task 2: Classify every token into a DTCG type

**Files:**

- Create: `packages/codegen/src/normalize/token-type.mjs`
- Create: `packages/codegen/test/token-type.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/token-type.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { repoRoot } from '../src/util/paths.mjs';
import { dtcgType } from '../src/normalize/token-type.mjs';

const contract = JSON.parse(
  readFileSync(join(repoRoot, 'docs/solar/tokens/css-contract.json'), 'utf8'),
);

describe('dtcgType', () => {
  it.each([
    ['Color', 'surface/background', 'color'],
    ['Primitives', 'color/neutral/50', 'color'],
    ['Primitives', 'type/font-family/inter', 'fontFamily'],
    ['Primitives', 'type/font-weight/100', 'fontWeight'],
    ['Primitives', 'type/font-size/14', 'dimension'],
    ['Primitives', 'spatial/scale/4', 'dimension'],
    ['Primitives', 'viewport/md', 'dimension'],
    ['Primitives', 'motion/duration/fast', 'duration'],
    ['Primitives', 'motion/ease/in', 'cubicBezier'],
    ['Spatial', 'inset/md', 'dimension'],
    ['Type', 'size/body/md', 'dimension'],
    ['Layout', 'grid/columns/lg', 'number'],
    ['Layout', 'grid/gutter/md', 'dimension'],
    ['Layout', 'breakpoint/md', 'dimension'],
  ])('classifies %s %s as %s', (collection, figma, expected) => {
    expect(dtcgType({ collection, figma })).toBe(expected);
  });

  it('classifies every token in the contract without falling through', () => {
    for (const v of contract.variables) {
      expect(() => dtcgType(v), `${v.collection} ${v.figma}`).not.toThrow();
    }
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/token-type.test.mjs`
Expected: FAIL, cannot resolve `../src/normalize/token-type.mjs`.

- [ ] **Step 3: Implement the classifier**

`packages/codegen/src/normalize/token-type.mjs`:

```js
// Maps a css-contract.json entry to a DTCG $type. Throws rather than guessing, so a new
// Figma collection or path prefix fails the build instead of being silently mistyped.
export function dtcgType({ collection, figma }) {
  if (collection === 'Color') return 'color';
  if (collection === 'Spatial') return 'dimension';
  if (collection === 'Type') return 'dimension';
  if (collection === 'Layout') {
    return figma.startsWith('grid/columns/') ? 'number' : 'dimension';
  }
  if (collection === 'Primitives') {
    if (figma.startsWith('color/')) return 'color';
    if (figma.startsWith('type/font-family/')) return 'fontFamily';
    if (figma.startsWith('type/font-weight/')) return 'fontWeight';
    if (figma.startsWith('type/')) return 'dimension';
    if (figma.startsWith('spatial/')) return 'dimension';
    if (figma.startsWith('viewport/')) return 'dimension';
    if (figma.startsWith('motion/duration/')) return 'duration';
    if (figma.startsWith('motion/ease/')) return 'cubicBezier';
  }
  throw new Error(
    `unclassified token: collection=${collection} figma=${figma}`,
  );
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/token-type.test.mjs`
Expected: PASS, 15 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/codegen/src/normalize/token-type.mjs packages/codegen/test/token-type.test.mjs
git commit -m "feat(codegen): classify SOLAR tokens into DTCG types"
```

---

### Task 3: Record the known Figma defects as deviations

Two things happen here. Some values in the contract are genuinely unusable as emitted, and
those are real defects in the Figma file: the fix belongs in the generator with a written
reason, never in `docs/`. Separately, the easing keywords are valid CSS but have no Flutter
equivalent, so all of them are converted to cubic beziers; that is a faithful conversion and is
not recorded as a deviation.

| Token                | Figma value            | Problem                                       | We emit                                                                |
| -------------------- | ---------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `motion.ease.both`   | `ease-both`            | Not a valid CSS timing function               | cubic-bezier `[0.42, 0, 0.58, 1]`, recorded as a deviation             |
| `motion.ease.in`     | `ease-in`              | Valid CSS, but Flutter has no keyword easings | cubic-bezier `[0.42, 0, 1, 1]`, a faithful conversion, not a deviation |
| `motion.ease.out`    | `ease-out`             | Valid CSS, but Flutter has no keyword easings | cubic-bezier `[0, 0, 0.58, 1]`, a faithful conversion, not a deviation |
| `type.font-weight.*` | `Thin`, `Semi Bold`, … | Not a CSS `font-weight` value                 | the numeric weight from the token name, recorded as a deviation        |

**Files:**

- Create: `packages/codegen/src/normalize/deviations.mjs`
- Create: `packages/codegen/test/deviations.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/deviations.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { applyDeviation, DEVIATIONS } from '../src/normalize/deviations.mjs';

describe('applyDeviation', () => {
  it('converts the invalid ease-both keyword to a cubic bezier', () => {
    const r = applyDeviation(
      { doc: 'motion.ease.both', value: 'ease-both' },
      'cubicBezier',
    );
    expect(r.value).toEqual([0.42, 0, 0.58, 1]);
    expect(r.deviation.reason).toMatch(/not a valid CSS/i);
  });

  it('converts the other easing keywords without calling them defects', () => {
    expect(
      applyDeviation({ doc: 'motion.ease.in', value: 'ease-in' }, 'cubicBezier')
        .value,
    ).toEqual([0.42, 0, 1, 1]);
  });

  it('takes the numeric font weight from the token name, not the Figma style name', () => {
    const r = applyDeviation(
      { doc: 'type.font-weight.600', value: 'Semi Bold' },
      'fontWeight',
    );
    expect(r.value).toBe(600);
    expect(r.deviation.figmaValue).toBe('Semi Bold');
  });

  it('leaves everything else untouched and records no deviation', () => {
    const r = applyDeviation(
      { doc: 'color.surface.base', value: '#ffffff' },
      'color',
    );
    expect(r.value).toBe('#ffffff');
    expect(r.deviation).toBeNull();
  });

  it('exports every deviation with a reason', () => {
    for (const d of DEVIATIONS) expect(d.reason.length).toBeGreaterThan(20);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/deviations.test.mjs`
Expected: FAIL, cannot resolve `../src/normalize/deviations.mjs`.

- [ ] **Step 3: Implement the deviations**

`packages/codegen/src/normalize/deviations.mjs`:

```js
// Deliberate departures from what the Figma data says, each with a reason. These are reported
// in spec/deviations.md for SOLAR governance. docs/ is never edited to accommodate them.

// The CSS keywords, as their equivalent cubic beziers. Flutter has no keyword easings, so the
// bezier form is the only representation both platforms can share.
const EASING_BEZIERS = {
  'ease-in': [0.42, 0, 1, 1],
  'ease-out': [0, 0, 0.58, 1],
  'ease-in-out': [0.42, 0, 0.58, 1],
  'ease-both': [0.42, 0, 0.58, 1],
};

export const DEVIATIONS = [
  {
    token: 'motion.ease.both',
    figmaValue: 'ease-both',
    reason:
      'ease-both is not a valid CSS timing function. The intended curve is ease-in-out, emitted as its cubic bezier so CSS and Flutter share one definition.',
    raise: 'Ask SOLAR to rename the value to ease-in-out.',
  },
  {
    token: 'type.font-weight.*',
    figmaValue: 'Figma style names such as Semi Bold',
    reason:
      'The Figma value is the type style name, which is not a valid CSS font-weight. The numeric weight is carried by the token name, so that is what is emitted; the style name is kept in $extensions for font loading.',
    raise: null,
  },
];

/**
 * @returns {{value: unknown, deviation: null | {token: string, figmaValue: unknown, reason: string}}}
 */
export function applyDeviation(entry, type) {
  const { doc, value } = entry;

  if (type === 'cubicBezier') {
    const bezier = EASING_BEZIERS[value];
    if (!bezier) throw new Error(`unknown easing keyword for ${doc}: ${value}`);
    const defect = DEVIATIONS.find((d) => d.token === doc);
    return {
      value: bezier,
      deviation: defect ? { ...defect } : null,
    };
  }

  if (type === 'fontWeight') {
    const weight = Number(doc.split('.').pop());
    if (!Number.isInteger(weight))
      throw new Error(`cannot read a numeric weight from ${doc}`);
    const rule = DEVIATIONS.find((d) => d.token === 'type.font-weight.*');
    return {
      value: weight,
      deviation: { ...rule, token: doc, figmaValue: value },
    };
  }

  return { value, deviation: null };
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/deviations.test.mjs`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/codegen/src/normalize/deviations.mjs packages/codegen/test/deviations.test.mjs
git commit -m "feat(codegen): record the easing and font-weight deviations from Figma"
```

---

### Task 4: Normalize the contract into `spec/tokens.json`

Naming decisions, fixed here so every later task agrees:

| Source           | Doc name            | Notes                                                                                   |
| ---------------- | ------------------- | --------------------------------------------------------------------------------------- |
| `variables[]`    | `v.doc` unchanged   | e.g. `color.surface.background`, `inset.md`, `layout.grid.gutter.md`                    |
| `effectStyles[]` | `e.doc` unchanged   | e.g. `shadow.control`, `$type: shadow`                                                  |
| `textStyles[]`   | `typography.<path>` | `display/lg` becomes `typography.display.lg`, `$type: typography`                       |
| `zIndex`         | `z.<name>`          | keeps the documented `--solar-z-base` naming from `docs/solar/07-layering-elevation.md` |

Text styles whose Figma name starts with `.` or `_` are utility styles used inside the
Foundations file itself and are skipped, matching `build-derived.mjs`.

**One name in the data is both a value and a group.** Figma defines `border/inverse` together
with `border/inverse/subtle` and `border/inverse/strong`, so `color.border.inverse` has to carry
a `$value` and child keys at once. A strict DTCG reader treats a node with `$value` as a token
and would drop the two children, so this is recorded as a structural deviation and reported to
SOLAR governance. The flat namespace every emitter reads is unaffected: all three names survive,
and `--solar-color-border-inverse` keeps the name the docs already publish. Renaming the
standalone to `…inverse.default` would make the tree valid but would invent a name and change a
published CSS property, which is worse. `setPath` therefore merges rather than assigns, so the
result does not depend on the order the variables arrive in.

**Files:**

- Create: `packages/codegen/src/normalize/tokens.mjs`
- Create: `packages/codegen/src/spec.mjs`
- Create: `packages/codegen/test/tokens.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/tokens.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';

const { spec, deviations } = buildTokenSpec(loadContract());
const flat = new Map(flattenSpec(spec).map((t) => [t.name, t]));

describe('buildTokenSpec', () => {
  it('nests doc names into a DTCG tree', () => {
    expect(spec.color.surface.background.$type).toBe('color');
    expect(spec.color.surface.background.$value).toBe('#f5f5f5');
  });

  it('carries Light and Dark as modes for colour', () => {
    expect(
      spec.color.surface.background.$extensions['com.biamp.solar'].modes,
    ).toEqual({
      light: '#f5f5f5',
      dark: '#111111',
    });
  });

  it('carries Desktop and Mobile as modes for type', () => {
    expect(spec.type.size.body.md.$extensions['com.biamp.solar'].modes).toEqual(
      {
        desktop: '14px',
        mobile: '14px',
      },
    );
  });

  it('includes the SOLAR Web Layout collection', () => {
    expect(flat.get('layout.grid.columns.lg').value).toBe(12);
    expect(flat.get('layout.grid.gutter.md').value).toBe('20px');
  });

  it('emits easings as cubic beziers, not CSS keywords', () => {
    expect(flat.get('motion.ease.both').value).toEqual([0.42, 0, 0.58, 1]);
  });

  it('emits numeric font weights and keeps the Figma style name', () => {
    const w = flat.get('type.font-weight.600');
    expect(w.value).toBe(600);
    expect(w.ext.figmaStyleName).toBe('Semi Bold');
  });

  it('adds shadows, typography and the z-index ladder', () => {
    expect(flat.get('shadow.control').type).toBe('shadow');
    expect(flat.get('typography.label.md').type).toBe('typography');
    expect(flat.get('z.dialog').value).toBe(400);
  });

  it('skips the utility text styles that live inside the Figma file', () => {
    expect([...flat.keys()].some((k) => k.includes('utility'))).toBe(false);
  });

  it('covers every variable in the contract', () => {
    const contract = loadContract();
    for (const v of contract.variables)
      expect(flat.has(v.doc), v.doc).toBe(true);
  });

  it('does not depend on the order the variables arrive in', () => {
    // color.border.inverse is both a value and the namespace root of .subtle and .strong.
    // If the parent is written after its children, a naive assignment drops them.
    const contract = loadContract();
    const reversed = buildTokenSpec({
      ...contract,
      variables: [...contract.variables].reverse(),
    });
    expect(flattenSpec(reversed.spec).length).toBe(flattenSpec(spec).length);
    const names = new Set(flattenSpec(reversed.spec).map((t) => t.name));
    expect(names.has('color.border.inverse')).toBe(true);
    expect(names.has('color.border.inverse.subtle')).toBe(true);
    expect(names.has('color.border.inverse.strong')).toBe(true);
  });

  it('reports the deviations it applied', () => {
    expect(deviations.length).toBeGreaterThan(0);
    for (const d of deviations) expect(d.reason).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/tokens.test.mjs`
Expected: FAIL, cannot resolve `../src/normalize/tokens.mjs`.

- [ ] **Step 3: Implement the spec reader and flattener**

`packages/codegen/src/spec.mjs`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { specDir } from './util/paths.mjs';

export const EXT = 'com.biamp.solar';

export function readSpec() {
  return JSON.parse(readFileSync(join(specDir, 'tokens.json'), 'utf8'));
}

/** Depth-first list of every token leaf, as {name, type, value, modes, ext}. */
export function flattenSpec(spec) {
  const out = [];
  const walk = (node, path) => {
    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue;
      const name = path ? `${path}.${key}` : key;
      if (child && typeof child === 'object') {
        // A handful of Figma doc names (e.g. color.border.inverse) are both a value in
        // their own right AND the namespace root for finer variants (…inverse.subtle).
        // Such a node carries $value alongside further, non-$ child keys, so it is
        // pushed as a leaf here and still walked below for those children.
        if ('$value' in child) {
          const ext = child.$extensions?.[EXT] ?? {};
          out.push({
            name,
            type: child.$type,
            value: child.$value,
            modes: ext.modes ?? null,
            ext,
          });
        }
        walk(child, name);
      }
    }
  };
  walk(spec, '');
  return out;
}
```

- [ ] **Step 4: Implement the normalizer**

`packages/codegen/src/normalize/tokens.mjs`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsDir } from '../util/paths.mjs';
import { EXT } from '../spec.mjs';
import { dtcgType } from './token-type.mjs';
import { applyDeviation } from './deviations.mjs';

export function loadContract() {
  return JSON.parse(
    readFileSync(join(docsDir, 'solar/tokens/css-contract.json'), 'utf8'),
  );
}

function setPath(tree, docName, node) {
  const parts = docName.split('.');
  let cur = tree;
  for (const part of parts.slice(0, -1)) {
    cur[part] ??= {};
    // Do not reject nesting under a segment that already carries $value: a few Figma
    // doc names (color.border.inverse) are both a value and the namespace root for
    // finer variants (…inverse.subtle, …inverse.strong). Such a node ends up with
    // $type/$value/$extensions alongside further, non-$ child keys; flattenSpec()
    // knows to read both. A genuine duplicate is still caught below.
    cur = cur[part];
  }
  const leaf = parts.at(-1);
  if (cur[leaf] && '$value' in cur[leaf]) {
    throw new Error(`duplicate token: ${docName}`);
  }
  // Merge rather than assign. The leaf may already exist as a group holding finer variants
  // that happened to be processed first, and overwriting it would silently drop them.
  cur[leaf] = { ...(cur[leaf] ?? {}), ...node };
}

const px = (n) => `${n}px`;

export function buildTokenSpec(contract) {
  const spec = {};
  const deviations = [];
  const record = (d) => {
    if (d) deviations.push(d);
  };

  // Doc names that are both a leaf value and the namespace root of finer variants
  // (e.g. color.border.inverse vs. color.border.inverse.subtle) are a structural
  // deviation from a plain DTCG tree, not a value deviation, so they are recorded
  // here rather than in normalize/deviations.mjs.
  const allDocs = new Set(contract.variables.map((v) => v.doc));
  const hybridRoots = new Set(
    contract.variables
      .map((v) => v.doc)
      .filter((doc) =>
        [...allDocs].some((other) => other.startsWith(`${doc}.`)),
      ),
  );

  for (const v of contract.variables) {
    const type = dtcgType(v);
    const raw = v.value ?? v.light ?? v.desktop;
    // Layout's grid/columns/* values are numeric (a column count), but css-contract.json
    // carries every "value" field as a string; coerce to a real number here so the DTCG
    // $type: 'number' tokens hold numbers, not numeric strings.
    const typedRaw = type === 'number' ? Number(raw) : raw;
    const { value, deviation } = applyDeviation(
      { doc: v.doc, value: typedRaw },
      type,
    );
    record(deviation);

    if (hybridRoots.has(v.doc)) {
      record({
        token: v.doc,
        figmaValue: v.figma,
        reason:
          `${v.doc} is used in Figma both as a standalone value and as the namespace ` +
          `for finer variants (e.g. ${v.doc}.subtle). A DTCG tree node cannot cleanly be ` +
          'both, so it is emitted with its own $value and the variants nested beneath it.',
        raise: `Ask SOLAR to give ${v.doc} an explicit base/default sibling name in Figma.`,
      });
    }

    const meta = { tier: v.tier, figma: v.figma, collection: v.collection };
    if (v.collection === 'Color') meta.modes = { light: v.light, dark: v.dark };
    if (v.collection === 'Type')
      meta.modes = { desktop: v.desktop, mobile: v.mobile };
    if (v.lightAlias) meta.alias = { light: v.lightAlias, dark: v.darkAlias };
    else if (v.alias) meta.alias = v.alias;
    if (v.source) meta.source = v.source;
    if (type === 'fontWeight') meta.figmaStyleName = raw;

    setPath(spec, v.doc, {
      $type: type,
      $value: value,
      $extensions: { [EXT]: meta },
    });
  }

  for (const e of contract.effectStyles) {
    // Layer geometry is mode independent; only the bound colour changes between Light and
    // Dark, so the alias is kept here and resolved by each emitter.
    setPath(spec, e.doc, {
      $type: 'shadow',
      $value: e.layers.map((l) => ({
        color: `{color.${l.colorVar.replaceAll('/', '.')}}`,
        offsetX: px(l.x),
        offsetY: px(l.y),
        blur: px(l.blur),
        spread: px(l.spread),
      })),
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: e.figma,
          modes: { light: e.light, dark: e.dark },
        },
      },
    });
  }

  for (const t of contract.textStyles) {
    if (t.figma.startsWith('.') || t.figma.startsWith('_')) continue;
    const doc = `typography.${t.figma.replaceAll('/', '.')}`;
    setPath(spec, doc, {
      $type: 'typography',
      $value: {
        fontFamily: t.fontFamily,
        fontWeight: t.fontWeight,
        fontSize: px(t.sizeDesktop),
        lineHeight: px(t.lineHeightDesktop),
        letterSpacing: t.letterSpacing,
      },
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: t.figma,
          sizeToken: t.sizeVar,
          lineHeightToken: t.lineHeightVar,
          modes: {
            desktop: {
              fontSize: px(t.sizeDesktop),
              lineHeight: px(t.lineHeightDesktop),
            },
            mobile: {
              fontSize: px(t.sizeMobile),
              lineHeight: px(t.lineHeightMobile),
            },
          },
        },
      },
    });
  }

  for (const [name, value] of Object.entries(contract.zIndex)) {
    if (name.startsWith('_')) continue;
    setPath(spec, `z.${name}`, {
      $type: 'number',
      $value: value,
      $extensions: {
        [EXT]: {
          tier: 'semantic',
          figma: null,
          source: 'Agentic Reference page',
        },
      },
    });
  }

  return { spec, deviations };
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/tokens.test.mjs`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/codegen/src/spec.mjs packages/codegen/src/normalize/tokens.mjs packages/codegen/test/tokens.test.mjs
git commit -m "feat(codegen): normalize the SOLAR contract into a DTCG token spec"
```

---

### Task 5: Canonical values and the emitter manifest

Every emitter writes a manifest recording, per token, the literal it emitted and that literal
parsed back to a canonical form. The parity test compares the parsed-back values, so a bad
conversion in one target fails rather than hiding.

Each canonicalizer therefore has to parse the literal its targets actually emit, not just the
value the spec holds. `cubicBezier` accepts the spec's numeric array, the CSS
`cubic-bezier(a, b, c, d)` form and Dart's `Cubic(a, b, c, d)`. If it only accepted the array,
every emitter would have to hand back the source value and the round trip would check nothing.
The two composite types are the exception: their target syntax is too different to parse back,
so the emitter passes the structured value it derived and parity compares structure.

**Files:**

- Create: `packages/codegen/src/emit/manifest.mjs`
- Create: `packages/codegen/test/manifest.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/manifest.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { canonical } from '../src/emit/manifest.mjs';

describe('canonical', () => {
  it('reduces every colour spelling to the same value', () => {
    expect(canonical.color('#f5f5f5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('rgba(0, 0, 0, 0.05)')).toBe('rgba(0, 0, 0, 0.05)');
    expect(canonical.color('0xFFF5F5F5')).toBe('rgba(245, 245, 245, 1)');
    expect(canonical.color('#F5F5F5')).toBe('rgba(245, 245, 245, 1)');
  });

  it('reduces dimensions to a number of pixels', () => {
    expect(canonical.dimension('16px')).toBe(16);
    expect(canonical.dimension(16)).toBe(16);
    expect(canonical.dimension('16.0')).toBe(16);
  });

  it('reduces durations to milliseconds', () => {
    expect(canonical.duration('100ms')).toBe(100);
    expect(canonical.duration(100)).toBe(100);
  });

  it('passes numbers, families, weights and beziers through', () => {
    expect(canonical.number(12)).toBe(12);
    expect(canonical.fontFamily('Open Sans')).toBe('Open Sans');
    expect(canonical.fontWeight(600)).toBe(600);
    expect(canonical.cubicBezier([0.42, 0, 1, 1])).toEqual([0.42, 0, 1, 1]);
  });

  it('parses the easing literals each target emits, so the round trip is real', () => {
    expect(canonical.cubicBezier('cubic-bezier(0.42, 0, 1, 1)')).toEqual([
      0.42, 0, 1, 1,
    ]);
    expect(canonical.cubicBezier('Cubic(0.42, 0, 0.58, 1)')).toEqual([
      0.42, 0, 0.58, 1,
    ]);
    expect(() => canonical.cubicBezier('ease-both')).toThrow(
      /cannot parse cubic bezier/,
    );
  });

  it('normalises composite shadows by structure, not by target syntax', () => {
    const layers = [
      {
        color: '#00000010',
        offsetX: '0px',
        offsetY: '1px',
        blur: '1px',
        spread: '0px',
      },
    ];
    expect(canonical.shadow(layers)).toBe(
      canonical.shadow(structuredClone(layers)),
    );
    expect(canonical.shadow(layers)).toContain('rgba(0, 0, 0, 0.063)');
  });

  it('rejects a colour it cannot parse rather than guessing', () => {
    expect(() => canonical.color('ease-both')).toThrow(/cannot parse colour/);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/manifest.test.mjs`
Expected: FAIL, cannot resolve `../src/emit/manifest.mjs`.

- [ ] **Step 3: Implement canonical values and the manifest writer**

`packages/codegen/src/emit/manifest.mjs`:

```js
import { join } from 'node:path';
import { writeGenerated } from '../util/write.mjs';

const rgba = (r, g, b, a) =>
  `rgba(${r}, ${g}, ${b}, ${Math.round(a * 1000) / 1000})`;

export const canonical = {
  color(v) {
    if (typeof v === 'string') {
      let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(v.trim());
      if (m) {
        const n = parseInt(m[1], 16);
        const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
        return rgba((n >> 16) & 255, (n >> 8) & 255, n & 255, a);
      }
      m =
        /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
          v.trim(),
        );
      if (m) return rgba(+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]);
      m = /^0x([0-9a-f]{8})$/i.exec(v.trim()); // Dart Color(0xAARRGGBB)
      if (m) {
        const n = parseInt(m[1], 16);
        return rgba(
          (n >> 16) & 255,
          (n >> 8) & 255,
          n & 255,
          ((n >>> 24) & 255) / 255,
        );
      }
    }
    throw new Error(`cannot parse colour: ${JSON.stringify(v)}`);
  },
  dimension(v) {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/px$/, ''));
    if (!Number.isFinite(n))
      throw new Error(`cannot parse dimension: ${JSON.stringify(v)}`);
    return n;
  },
  duration(v) {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/ms$/, ''));
    if (!Number.isFinite(n))
      throw new Error(`cannot parse duration: ${JSON.stringify(v)}`);
    return n;
  },
  number: (v) => Number(v),
  fontFamily: (v) => String(v).replace(/^["']|["']$/g, ''),
  fontWeight: (v) => Number(v),
  // Accepts the spec's numeric array and the literals the targets emit, so a bad conversion
  // in one target is caught by the round trip instead of being echoed back unchecked.
  cubicBezier(v) {
    if (Array.isArray(v)) return v.map(Number);
    const m =
      /^(?:cubic-bezier|Cubic)\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/.exec(
        String(v).trim(),
      );
    if (!m) throw new Error(`cannot parse cubic bezier: ${JSON.stringify(v)}`);
    return m.slice(1).map(Number);
  },
  // Composites: normalise the structure, not the target's literal syntax.
  shadow: (layers) =>
    JSON.stringify(
      layers.map((l) => ({
        color: canonical.color(l.color),
        offsetX: canonical.dimension(l.offsetX),
        offsetY: canonical.dimension(l.offsetY),
        blur: canonical.dimension(l.blur),
        spread: canonical.dimension(l.spread),
      })),
    ),
  typography: (t) =>
    JSON.stringify({
      fontFamily: canonical.fontFamily(t.fontFamily),
      fontWeight: canonical.fontWeight(t.fontWeight),
      fontSize: canonical.dimension(t.fontSize),
      lineHeight: canonical.dimension(t.lineHeight),
      letterSpacing: String(t.letterSpacing),
    }),
};

/**
 * @param {{
 *   target: string,
 *   dir: string,
 *   entries: Record<string, {emitted: unknown, normalized: unknown}>,
 *   fileVersion: string,
 * }} args
 */
export function writeManifest({ target, dir, entries, fileVersion }) {
  const body = {
    _note:
      'Written by the SOLAR codegen. "emitted" is the literal this target produced; "normalized" is that literal parsed back to canonical form. The parity suite compares normalized values across targets.',
    target,
    fileVersion,
    tokens: entries,
  };
  return writeGenerated(
    join(dir, 'tokens.manifest.json'),
    JSON.stringify(body, null, 2) + '\n',
  );
}

/**
 * Builds a manifest entry.
 *
 * For scalar types the emitted literal is parsed back, so a bad conversion in one target is
 * caught. For the composite types (shadow, typography) the target's literal syntax differs too
 * much to round-trip, so the emitter passes the structured value it derived from the spec as
 * `canonicalInput`; parity then compares structure, and literal formatting is covered by each
 * emitter's own snapshot test.
 */
export function entry(type, emitted, canonicalInput = emitted) {
  const parse = canonical[type];
  if (!parse) throw new Error(`no canonicalizer for type ${type}`);
  return { emitted, normalized: parse(canonicalInput) };
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/manifest.test.mjs`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/codegen/src/emit/manifest.mjs packages/codegen/test/manifest.test.mjs
git commit -m "feat(codegen): canonical token values and the emitter manifest"
```

---

### Task 6: CSS emitter

Emits `:root` defaults, a `[data-theme='dark']` block for colour and shadow, and a mobile
media query for the Type collection. The dark selector deliberately has no `:root` prefix,
unlike the `reference.css` prototype in `docs/`: without it the attribute can be set on any
element, so a dark panel can sit inside a light page. Specificity still resolves correctly
because the dark block comes later in the file. Typography composites are deliberately not emitted as CSS
custom properties; their parts already exist as `type.*` tokens, and MUI and Flutter consume
the composite form instead.

**Files:**

- Create: `packages/codegen/src/emit/shadow.mjs`
- Create: `packages/codegen/src/emit/css.mjs`
- Create: `packages/codegen/test/css.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/css.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { cssLiteral, renderCss } from '../src/emit/css.mjs';

const { spec } = buildTokenSpec(loadContract());
const { css } = renderCss(spec);

describe('cssLiteral', () => {
  it('formats each type the way CSS needs it', () => {
    expect(cssLiteral('dimension', '16px')).toBe('16px');
    expect(cssLiteral('duration', '100ms')).toBe('100ms');
    expect(cssLiteral('cubicBezier', [0.42, 0, 1, 1])).toBe(
      'cubic-bezier(0.42, 0, 1, 1)',
    );
    expect(cssLiteral('fontFamily', 'Open Sans')).toBe('"Open Sans"');
    expect(cssLiteral('fontFamily', 'Inter')).toBe('Inter');
    expect(cssLiteral('fontWeight', 600)).toBe('600');
  });
});

describe('renderCss', () => {
  it('emits light values on :root and dark under the theme attribute', () => {
    expect(css).toMatch(
      /:root \{[\s\S]*--solar-color-surface-background: #f5f5f5;/,
    );
    expect(css).toMatch(
      /\[data-theme='dark'\] \{[\s\S]*--solar-color-surface-background: #111111;/,
    );
  });

  it('switches type sizes under the mobile media query', () => {
    expect(css).toMatch(
      /@media \(max-width: 767\.98px\)[\s\S]*--solar-type-size-display-lg: 40px;/,
    );
  });

  it('never emits the invalid values that are in the Figma data', () => {
    // The token is legitimately named motion.ease.both, so the property name contains
    // "ease-both". What must never appear is the invalid keyword as a value.
    expect(css).not.toMatch(/:\s*ease-(both|in|out)\s*;/);
    expect(css).toContain(
      '--solar-motion-ease-both: cubic-bezier(0.42, 0, 0.58, 1);',
    );
    expect(css).not.toMatch(/--solar-type-font-weight-\d+: [A-Za-z]/);
  });

  it('emits the SOLAR Web layout tokens and the z-index ladder', () => {
    expect(css).toContain('--solar-layout-grid-columns-lg: 12;');
    expect(css).toContain('--solar-z-dialog: 400;');
  });

  it('emits shadows as composites in both modes', () => {
    expect(css).toMatch(
      /--solar-shadow-control: 0px 1px 1px 0px rgba\(0, 0, 0, 0\.05\);/,
    );
  });

  it('does not emit typography composites as custom properties', () => {
    expect(css).not.toContain('--solar-typography-');
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/css.test.mjs`
Expected: FAIL, cannot resolve `../src/emit/css.mjs`.

- [ ] **Step 3: Implement the shared shadow resolver**

`packages/codegen/src/emit/shadow.mjs`:

```js
/**
 * Resolves a shadow node's layers for one mode, turning the `{color.shadow.subtle}` alias in
 * each layer into the concrete colour for that mode. `index` is a Map of token name to token.
 */
export function shadowLayers(index, node, mode) {
  return node.$value.map((layer) => {
    const ref = /^\{(.+)\}$/.exec(layer.color);
    if (!ref) return { ...layer };
    const token = index.get(ref[1]);
    if (!token) throw new Error(`shadow references unknown token: ${ref[1]}`);
    return { ...layer, color: token.modes?.[mode] ?? token.value };
  });
}

export const shadowToCss = (layers) =>
  layers
    .map((l) => `${l.offsetX} ${l.offsetY} ${l.blur} ${l.spread} ${l.color}`)
    .join(', ');
```

- [ ] **Step 4: Implement the CSS emitter**

`packages/codegen/src/emit/css.mjs`:

```js
import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { entry, writeManifest } from './manifest.mjs';
import { shadowLayers, shadowToCss } from './shadow.mjs';

const OUT_DIR = join(packagesDir, 'styles', 'src', 'generated', 'css');
const cssVar = (name) => `--solar-${name.replaceAll('.', '-')}`;

export function cssLiteral(type, value) {
  switch (type) {
    case 'color':
      return String(value);
    case 'dimension':
      return typeof value === 'number' ? `${value}px` : String(value);
    case 'duration':
      return typeof value === 'number' ? `${value}ms` : String(value);
    case 'number':
    case 'fontWeight':
      return String(value);
    case 'fontFamily':
      return /\s/.test(value) ? `"${value}"` : String(value);
    case 'cubicBezier':
      return `cubic-bezier(${value.join(', ')})`;
    default:
      throw new Error(`no CSS literal for type ${type}`);
  }
}

export function renderCss(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const manifest = {};
  const root = [];
  const dark = [];
  const mobile = [];

  for (const t of tokens) {
    if (t.type === 'typography') continue; // parts already exist as type.* tokens
    const name = cssVar(t.name);

    if (t.type === 'shadow') {
      const light = shadowLayers(index, { $value: t.value }, 'light');
      const night = shadowLayers(index, { $value: t.value }, 'dark');
      root.push(`  ${name}: ${shadowToCss(light)};`);
      dark.push(`  ${name}: ${shadowToCss(night)};`);
      manifest[t.name] = entry('shadow', shadowToCss(light), light);
      continue;
    }

    const literal = cssLiteral(t.type, t.value);
    root.push(`  ${name}: ${literal};`);
    manifest[t.name] = entry(t.type, literal);

    if (t.modes?.dark !== undefined)
      dark.push(`  ${name}: ${cssLiteral(t.type, t.modes.dark)};`);
    if (t.modes?.mobile !== undefined)
      mobile.push(`    ${name}: ${cssLiteral(t.type, t.modes.mobile)};`);
  }

  const css =
    `/* SOLAR design tokens. Generated by @bwp-web/codegen from spec/tokens.json. Do not edit. */\n` +
    `:root {\n${root.join('\n')}\n}\n\n` +
    `[data-theme='dark'] {\n${dark.join('\n')}\n}\n\n` +
    `@media (max-width: 767.98px) {\n  :root {\n${mobile.join('\n')}\n  }\n}\n\n` +
    `@media (prefers-reduced-motion: reduce) {\n  * {\n    transition-duration: 0ms !important;\n    animation-duration: 0ms !important;\n  }\n}\n`;

  return { css, manifest };
}

export function emitCss(spec, fileVersion) {
  const { css, manifest } = renderCss(spec);
  writeGenerated(join(OUT_DIR, 'tokens.css'), css);
  writeManifest({
    target: 'css',
    dir: OUT_DIR,
    entries: manifest,
    fileVersion,
  });
  return Object.keys(manifest).length;
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/css.test.mjs`
Expected: PASS, 7 tests.

- [ ] **Step 6: Commit**

```bash
git add packages/codegen/src/emit/shadow.mjs packages/codegen/src/emit/css.mjs packages/codegen/test/css.test.mjs
git commit -m "feat(codegen): emit SOLAR tokens as CSS custom properties"
```

---

### Task 7: MUI theme emitter

Emits plain data, with no import from `@mui/material`, so `@bwp-web/styles` stays
dependency-free. Consumers pass the result to `createTheme`.

Typography is emitted for both Desktop and Mobile. `createSolarThemeOptions` uses the desktop
set, because an MUI theme carries one typography scale; an app that wants the mobile sizes
either imports `tokens.css`, whose media query already switches them, or reads
`solarTypography.mobile` at a breakpoint.

**Files:**

- Create: `packages/codegen/src/emit/mui.mjs`
- Create: `packages/codegen/test/mui.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/mui.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderMui } from '../src/emit/mui.mjs';

const { spec } = buildTokenSpec(loadContract());
const { ts, manifest, data } = renderMui(spec);

describe('renderMui', () => {
  it('exposes every token per mode', () => {
    expect(data.tokens.light['color.surface.background']).toBe('#f5f5f5');
    expect(data.tokens.dark['color.surface.background']).toBe('#111111');
    expect(data.tokens.light['inset.md']).toBe('16px');
  });

  it('keeps both type modes, so the mobile sizes are not lost', () => {
    expect(data.typography.mobile['display.lg'].fontSize).toBe('40px');
    expect(data.typography.desktop['display.lg'].fontSize).toBe('56px');
  });

  it('exposes typography composites MUI can use directly', () => {
    expect(data.typography.desktop['label.md']).toMatchObject({
      fontFamily: 'Inter',
      fontWeight: 500,
      fontSize: '14px',
    });
  });

  it('exposes the z-index ladder under MUI names', () => {
    expect(data.zIndex.dialog).toBe(400);
  });

  it('emits a TypeScript module with no MUI import', () => {
    expect(ts).not.toContain("from '@mui/material'");
    expect(ts).toContain('export const solarTokens');
    expect(ts).toContain('export function createSolarThemeOptions');
  });

  it('covers the same token names as the manifest', () => {
    expect(Object.keys(manifest)).toContain('color.action.primary.bg.hover');
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/mui.test.mjs`
Expected: FAIL, cannot resolve `../src/emit/mui.mjs`.

- [ ] **Step 3: Implement the MUI emitter**

`packages/codegen/src/emit/mui.mjs`:

```js
import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { entry, writeManifest } from './manifest.mjs';
import { shadowLayers, shadowToCss } from './shadow.mjs';

const OUT_DIR = join(packagesDir, 'styles', 'src', 'generated', 'mui');

const literal = (type, value) => {
  if (type === 'dimension')
    return typeof value === 'number' ? `${value}px` : value;
  if (type === 'duration')
    return typeof value === 'number' ? `${value}ms` : value;
  if (type === 'cubicBezier') return `cubic-bezier(${value.join(', ')})`;
  return value;
};

export function renderMui(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const data = {
    tokens: { light: {}, dark: {} },
    typography: { desktop: {}, mobile: {} },
    zIndex: {},
    shadows: {},
  };
  const manifest = {};

  for (const t of tokens) {
    if (t.name.startsWith('z.')) {
      data.zIndex[t.name.slice(2)] = t.value;
      manifest[t.name] = entry('number', t.value);
      continue;
    }
    if (t.type === 'typography') {
      // The Type collection switches size and line height between Desktop and Mobile, so both
      // are emitted. Dropping mobile here would lose an axis only the CSS media query has.
      const key = t.name.replace(/^typography\./, '');
      data.typography.desktop[key] = { ...t.value, ...t.ext.modes.desktop };
      data.typography.mobile[key] = { ...t.value, ...t.ext.modes.mobile };
      manifest[t.name] = entry('typography', data.typography.desktop[key]);
      continue;
    }
    if (t.type === 'shadow') {
      const light = shadowLayers(index, { $value: t.value }, 'light');
      const night = shadowLayers(index, { $value: t.value }, 'dark');
      const key = t.name.replace(/^shadow\./, '');
      data.shadows[key] = {
        light: shadowToCss(light),
        dark: shadowToCss(night),
      };
      manifest[t.name] = entry('shadow', shadowToCss(light), light);
      continue;
    }
    const light = literal(
      t.type,
      t.modes?.light ?? t.modes?.desktop ?? t.value,
    );
    const dark = literal(t.type, t.modes?.dark ?? t.modes?.desktop ?? t.value);
    data.tokens.light[t.name] = light;
    data.tokens.dark[t.name] = dark;
    manifest[t.name] = entry(t.type, light);
  }

  const ts =
    `// SOLAR design tokens for MUI. Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n` +
    `// Plain data on purpose: this module imports nothing, so @bwp-web/styles stays dependency free.\n` +
    `// Pass the result of createSolarThemeOptions(mode) to MUI's createTheme.\n\n` +
    `export const solarTokens = ${JSON.stringify(data.tokens, null, 2)} as const;\n\n` +
    `export const solarTypography = ${JSON.stringify(data.typography, null, 2)} as const;\n\n` +
    `export const solarShadows = ${JSON.stringify(data.shadows, null, 2)} as const;\n\n` +
    `export const solarZIndex = ${JSON.stringify(data.zIndex, null, 2)} as const;\n\n` +
    `export type SolarMode = 'light' | 'dark';\n\n` +
    `export function createSolarThemeOptions(mode: SolarMode) {\n` +
    `  const t = solarTokens[mode];\n` +
    `  return {\n` +
    `    palette: {\n` +
    `      mode,\n` +
    `      background: { default: t['color.surface.background'], paper: t['color.surface.base'] },\n` +
    `      text: { primary: t['color.text.primary'], secondary: t['color.text.secondary'], disabled: t['color.text.disabled'] },\n` +
    `      divider: t['color.border.subtle'],\n` +
    `      error: { main: t['color.text.feedback.danger'] },\n` +
    `      warning: { main: t['color.text.feedback.warning'] },\n` +
    `      info: { main: t['color.text.feedback.info'] },\n` +
    `      success: { main: t['color.text.feedback.success'] },\n` +
    `    },\n` +
    `    shape: { borderRadius: parseFloat(t['radius.control']) },\n` +
    `    zIndex: solarZIndex,\n` +
    `    typography: solarTypography.desktop,\n` +
    `  };\n` +
    `}\n`;

  return { ts, manifest, data };
}

export function emitMui(spec, fileVersion) {
  const { ts, manifest } = renderMui(spec);
  writeGenerated(join(OUT_DIR, 'theme.ts'), ts);
  writeManifest({
    target: 'mui',
    dir: OUT_DIR,
    entries: manifest,
    fileVersion,
  });
  return Object.keys(manifest).length;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/mui.test.mjs`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/codegen/src/emit/mui.mjs packages/codegen/test/mui.test.mjs
git commit -m "feat(codegen): emit SOLAR tokens as MUI theme options"
```

---

### Task 8: Tailwind preset emitter

Values point at the CSS custom properties, so Light and Dark switch with `[data-theme]` and the
preset stays a single source rather than a second copy of every value. Screens are the
exception: media queries cannot read custom properties, so breakpoints are emitted literally.

Only the semantic layer is exposed, so app code cannot reach for a raw palette value. Two
families are exceptions, because SOLAR gives them no semantic layer at all: motion, and the font
families, which Tailwind's own `sans` / `serif` / `mono` defaults know nothing about. Font
weights are deliberately not exposed, since SOLAR's 100 to 900 are exactly Tailwind's built-in
scale and `font-400` would only duplicate `font-normal`.

The 47 text styles are not emitted here yet. Tailwind can express one as a `fontSize` tuple
carrying line height, weight and tracking, which would give `text-label-md` in a single utility
and is the better mapping. That belongs with the component work rather than this milestone.

**Files:**

- Create: `packages/codegen/src/emit/tailwind.mjs`
- Create: `packages/codegen/test/tailwind.test.mjs`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/tailwind.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderTailwind } from '../src/emit/tailwind.mjs';

const { spec } = buildTokenSpec(loadContract());
const { ts, preset } = renderTailwind(spec);

describe('renderTailwind', () => {
  it('maps colours to CSS variable references so dark mode keeps working', () => {
    expect(preset.theme.extend.colors['surface-background']).toBe(
      'var(--solar-color-surface-background)',
    );
  });

  it('maps spacing, radius and border width', () => {
    expect(preset.theme.extend.spacing['inset-md']).toBe(
      'var(--solar-inset-md)',
    );
    expect(preset.theme.extend.borderRadius.control).toBe(
      'var(--solar-radius-control)',
    );
    expect(preset.theme.extend.borderWidth.default).toBe(
      'var(--solar-border-default)',
    );
  });

  it('maps breakpoints to screens using real pixel values, not variables', () => {
    expect(preset.theme.extend.screens.md).toBe('1024px');
  });

  it('exposes the font families, which Tailwind has no default for, but not the weights', () => {
    expect(preset.theme.extend.fontFamily.inter).toBe(
      'var(--solar-type-font-family-inter)',
    );
    expect(Object.keys(preset.theme.extend.fontFamily)).toHaveLength(6);
    // SOLAR's 100 to 900 are exactly Tailwind's built-in scale, so they are not re-exported.
    expect(preset.theme.extend.fontWeight).toBeUndefined();
  });

  it('maps durations and easings', () => {
    expect(preset.theme.extend.transitionDuration.fast).toBe(
      'var(--solar-motion-duration-fast)',
    );
    expect(preset.theme.extend.transitionTimingFunction.both).toBe(
      'var(--solar-motion-ease-both)',
    );
  });

  it('resolves shadow aliases rather than passing the composite string through', () => {
    expect(preset.theme.extend.boxShadow.control).toBe(
      'var(--solar-shadow-control)',
    );
  });

  it('emits a module that imports nothing', () => {
    expect(ts).not.toContain('import');
    expect(ts).toContain('export const solarTailwindPreset');
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/tailwind.test.mjs`
Expected: FAIL, cannot resolve `../src/emit/tailwind.mjs`.

- [ ] **Step 3: Implement the Tailwind emitter**

`packages/codegen/src/emit/tailwind.mjs`:

```js
import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { entry, writeManifest } from './manifest.mjs';
import { shadowLayers } from './shadow.mjs';

const OUT_DIR = join(packagesDir, 'styles', 'src', 'generated', 'tailwind');
const ref = (name) => `var(--solar-${name.replaceAll('.', '-')})`;
const key = (name, prefix) => name.replace(prefix, '').replaceAll('.', '-');

export function renderTailwind(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const extend = {
    colors: {},
    spacing: {},
    borderRadius: {},
    borderWidth: {},
    boxShadow: {},
    fontSize: {},
    fontFamily: {},
    screens: {},
    zIndex: {},
    transitionDuration: {},
    transitionTimingFunction: {},
  };
  const manifest = {};

  for (const t of tokens) {
    const n = t.name;
    // Tailwind exposes the semantic layer, so app code cannot reach for a raw palette value.
    // Two families are exceptions because SOLAR gives them no semantic layer at all: motion,
    // and the font families, which Tailwind's own sans/serif/mono defaults know nothing about.
    // Font weights are deliberately not exposed: SOLAR's 100 to 900 are exactly Tailwind's
    // built-in scale, so font-400 would only duplicate font-normal.
    const EXPOSED_PRIMITIVES = /^(motion\.|type\.font-family\.)/;
    if (t.ext.tier === 'primitive' && !EXPOSED_PRIMITIVES.test(n)) continue;
    if (n.startsWith('color.')) extend.colors[key(n, 'color.')] = ref(n);
    else if (n.startsWith('inset.') || n.startsWith('stack.'))
      extend.spacing[key(n, '')] = ref(n);
    else if (n.startsWith('radius.'))
      extend.borderRadius[key(n, 'radius.')] = ref(n);
    else if (n.startsWith('border.'))
      extend.borderWidth[key(n, 'border.')] = ref(n);
    else if (n.startsWith('shadow.'))
      extend.boxShadow[key(n, 'shadow.')] = ref(n);
    else if (n.startsWith('type.size.'))
      extend.fontSize[key(n, 'type.size.')] = ref(n);
    else if (n.startsWith('type.font-family.'))
      extend.fontFamily[key(n, 'type.font-family.')] = ref(n);
    else if (n.startsWith('z.')) extend.zIndex[key(n, 'z.')] = ref(n);
    else if (n.startsWith('motion.duration.'))
      extend.transitionDuration[key(n, 'motion.duration.')] = ref(n);
    else if (n.startsWith('motion.ease.'))
      extend.transitionTimingFunction[key(n, 'motion.ease.')] = ref(n);
    // Media queries cannot read custom properties, so screens need real values.
    else if (n.startsWith('layout.breakpoint.'))
      extend.screens[key(n, 'layout.breakpoint.')] = t.value;
    else continue;

    // What the preset holds is a var() reference, except screens, which must be literal. The
    // resolved value is passed as the canonical input so parity can compare across targets;
    // shadows resolve their colour alias first, the same way CSS and Flutter do.
    const emitted = n.startsWith('layout.breakpoint.') ? t.value : ref(n);
    manifest[n] =
      t.type === 'shadow'
        ? entry(
            'shadow',
            emitted,
            shadowLayers(index, { $value: t.value }, 'light'),
          )
        : entry(t.type, emitted, t.modes?.light ?? t.modes?.desktop ?? t.value);
  }

  const preset = { theme: { extend } };
  const ts =
    `// SOLAR Tailwind preset. Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n` +
    `// Values point at the CSS custom properties in tokens.css, so Light and Dark switch with\n` +
    `// [data-theme]. Screens are real pixel values because media queries cannot read variables.\n\n` +
    `export const solarTailwindPreset = ${JSON.stringify(preset, null, 2)} as const;\n`;

  return { ts, preset, manifest };
}

export function emitTailwind(spec, fileVersion) {
  const { ts, manifest } = renderTailwind(spec);
  writeGenerated(join(OUT_DIR, 'preset.ts'), ts);
  writeManifest({
    target: 'tailwind',
    dir: OUT_DIR,
    entries: manifest,
    fileVersion,
  });
  return Object.keys(manifest).length;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/tailwind.test.mjs`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add packages/codegen/src/emit/tailwind.mjs packages/codegen/test/tailwind.test.mjs
git commit -m "feat(codegen): emit a SOLAR Tailwind preset"
```

---

### Task 9: Dart package skeleton

**Files:**

- Create: `packages/solar_flutter/pubspec.yaml`
- Create: `packages/solar_flutter/analysis_options.yaml`
- Create: `packages/solar_flutter/lib/solar_flutter.dart`
- Create: `packages/solar_flutter/.gitignore`
- Create: `packages/solar_flutter/README.md`

- [ ] **Step 1: Create the pubspec**

`packages/solar_flutter/pubspec.yaml`:

```yaml
name: solar_flutter
description: Biamp SOLAR design tokens, icons and components for Flutter. Generated from Figma.
version: 2.0.0-alpha.0
publish_to: none

environment:
  sdk: '>=3.4.0 <4.0.0'
  flutter: '>=3.22.0'

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^6.0.0
```

- [ ] **Step 2: Create the lint config, entry point, gitignore and README**

`packages/solar_flutter/analysis_options.yaml`:

```yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_const_declarations: true
```

`packages/solar_flutter/lib/solar_flutter.dart`:

```dart
/// Biamp SOLAR for Flutter.
///
/// Everything under `src/generated` is written by `npm run solar:codegen` from
/// `spec/tokens.json`. Do not edit those files by hand.
library solar_flutter;

export 'src/generated/tokens.dart';
```

`packages/solar_flutter/.gitignore`:

```
.dart_tool/
.packages
build/
pubspec.lock
```

`packages/solar_flutter/README.md`:

```markdown
# solar_flutter

Biamp SOLAR design tokens for Flutter, generated from the same spec as the web packages.

Consume it by git dependency:

    dependencies:
      solar_flutter:
        git:
          url: https://github.com/evoko/workplace-public-packages.git
          path: packages/solar_flutter
          ref: v2-SOLAR

Everything in `lib/src/generated` is produced by `npm run solar:codegen` at the repository
root. Do not edit it. See [the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).
```

- [ ] **Step 3: Verify the package resolves**

Run: `cd packages/solar_flutter && flutter pub get && cd ../..`
Expected: `Got dependencies!`. If `flutter` is not installed, install the stable SDK first; CI uses `subosito/flutter-action@v2`.

- [ ] **Step 4: Ignore the Dart build output in Prettier**

Append to `.prettierignore`:

```
# Dart package: formatted by dart format, not Prettier.
packages/solar_flutter/**
```

- [ ] **Step 5: Commit**

```bash
git add packages/solar_flutter .prettierignore
git commit -m "feat(flutter): add the solar_flutter package skeleton"
```

---

### Task 10: Flutter token emitter

Dart classes are not first-class values, so a static-only `SolarColorsLight` would force an
`if (dark) ... else ...` at every call site. Groups whose values change with a mode (colour,
type, typography, shadow) are therefore emitted as **instance classes with `static const`
instances per mode**, and a `SolarTheme` `ThemeExtension` bundles them so a widget reads
`Theme.of(context).extension<SolarTheme>()!.colors.surfaceBackground`. Mode-invariant groups
(spacing, radius, motion, z-index and the rest) stay as plain static holders.

**Files:**

- Create: `packages/codegen/src/emit/flutter.mjs`
- Create: `packages/codegen/test/flutter.test.mjs`
- Create: `packages/solar_flutter/test/tokens_test.dart`

- [ ] **Step 1: Write the failing test**

`packages/codegen/test/flutter.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { dartColor, dartName, renderFlutter } from '../src/emit/flutter.mjs';

const { spec } = buildTokenSpec(loadContract());
const { dart, manifest } = renderFlutter(spec);

describe('dartColor', () => {
  it('converts hex and rgba to ARGB', () => {
    expect(dartColor('#f5f5f5')).toBe('Color(0xFFF5F5F5)');
    expect(dartColor('rgba(0, 0, 0, 0.05)')).toBe('Color(0x0D000000)');
  });
});

describe('dartName', () => {
  it('camel-cases the remaining segments', () => {
    expect(dartName('surface.background')).toBe('surfaceBackground');
    expect(dartName('font-size.14')).toBe('fontSize14');
    expect(dartName('category.01.strong')).toBe('category01Strong');
  });
});

describe('renderFlutter', () => {
  it('emits mode-varying groups as instance classes with one instance per mode', () => {
    expect(dart).toContain('class SolarColors {');
    expect(dart).toContain('  final Color surfaceBackground;');
    expect(dart).toMatch(/static const SolarColors light = SolarColors\(/);
    expect(dart).toMatch(/static const SolarColors dark = SolarColors\(/);
    expect(dart).toContain('surfaceBackground: Color(0xFFF5F5F5)');
    expect(dart).toContain('surfaceBackground: Color(0xFF111111)');
  });

  it('emits mode-invariant groups as static holders', () => {
    expect(dart).toContain('abstract final class SolarInset');
    expect(dart).toContain('static const double md = 16.0;');
    expect(dart).toContain(
      'static const Duration fast = Duration(milliseconds: 100);',
    );
  });

  it('emits easings as Cubic, which is why the keywords had to go', () => {
    expect(dart).toContain(
      'static const Cubic both = Cubic(0.42, 0, 0.58, 1);',
    );
  });

  it('emits text styles with letter spacing resolved from percentages to pixels', () => {
    expect(dart).toMatch(/final TextStyle labelMd;/);
    expect(dart).toMatch(/labelMd: TextStyle\([\s\S]*?fontSize: 14\.0/);
  });

  it('bundles the mode-varying sets into a ThemeExtension', () => {
    expect(dart).toContain(
      'class SolarTheme extends ThemeExtension<SolarTheme>',
    );
    expect(dart).toContain('static const SolarTheme light = SolarTheme(');
    expect(dart).toContain('SolarTheme lerp(');
  });

  it('records canonical values in the manifest so parity can compare targets', () => {
    expect(manifest['color.surface.background'].normalized).toBe(
      'rgba(245, 245, 245, 1)',
    );
    expect(manifest['inset.md'].normalized).toBe(16);
  });
});
```

- [ ] **Step 2: Run the test and watch it fail**

Run: `npx vitest run packages/codegen/test/flutter.test.mjs`
Expected: FAIL, cannot resolve `../src/emit/flutter.mjs`.

- [ ] **Step 3: Implement the Flutter emitter**

`packages/codegen/src/emit/flutter.mjs`:

```js
import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { canonical, entry, writeManifest } from './manifest.mjs';
import { shadowLayers } from './shadow.mjs';

const OUT_DIR = join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated');

export function dartName(rest) {
  const parts = rest.split(/[.\-]/).filter(Boolean);
  return parts
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
}

/** `#rrggbb` or `rgba(r, g, b, a)` to Dart `Color(0xAARRGGBB)`. */
export function dartColor(value) {
  const [, r, g, b, a] = /^rgba\((\d+), (\d+), (\d+), ([\d.]+)\)$/.exec(
    canonical.color(value),
  );
  const argb =
    (Math.round(Number(a) * 255) << 24) | (+r << 16) | (+g << 8) | +b;
  return `Color(0x${(argb >>> 0).toString(16).toUpperCase().padStart(8, '0')})`;
}

const dbl = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));
const letterSpacingPx = (ls, fontSizePx) =>
  String(ls).endsWith('%')
    ? Math.round((parseFloat(ls) / 100) * fontSizePx * 100) / 100
    : parseFloat(ls);

// Groups whose values depend on a mode become instance classes with one instance per mode.
const MODAL_GROUPS = {
  color: ['light', 'dark'],
  type: ['desktop', 'mobile'],
  typography: ['desktop', 'mobile'],
  shadow: ['light', 'dark'],
};
const CLASS_FOR = {
  color: 'SolarColors',
  type: 'SolarType',
  typography: 'SolarTypography',
  shadow: 'SolarShadows',
  inset: 'SolarInset',
  stack: 'SolarStack',
  radius: 'SolarRadius',
  border: 'SolarBorder',
  icon: 'SolarIconSize',
  layout: 'SolarLayout',
  motion: 'SolarMotion',
  viewport: 'SolarViewport',
  spatial: 'SolarSpatial',
  z: 'SolarZ',
};

export function renderFlutter(spec) {
  const tokens = flattenSpec(spec);
  const index = new Map(tokens.map((t) => [t.name, t]));
  const manifest = {};
  const statics = new Map(); // class -> lines
  const modal = new Map(); // class -> {fields: [], values: {mode: []}}
  const addStatic = (cls, line) =>
    statics.set(cls, [...(statics.get(cls) ?? []), line]);
  const addModal = (cls, modes, dartType, field, perMode) => {
    const g = modal.get(cls) ?? {
      fields: [],
      values: Object.fromEntries(modes.map((m) => [m, []])),
    };
    g.fields.push(`  final ${dartType} ${field};`);
    for (const m of modes) g.values[m].push(`    ${field}: ${perMode[m]},`);
    modal.set(cls, g);
  };

  const textStyle = (v) => {
    const size = canonical.dimension(v.fontSize);
    return (
      `TextStyle(fontFamily: '${v.fontFamily}', fontWeight: FontWeight.w${v.fontWeight}, ` +
      `fontSize: ${dbl(size)}, height: ${canonical.dimension(v.lineHeight) / size}, ` +
      `letterSpacing: ${dbl(letterSpacingPx(v.letterSpacing, size))})`
    );
  };
  const boxShadows = (layers) =>
    `<BoxShadow>[${layers
      .map(
        (l) =>
          `BoxShadow(color: ${dartColor(l.color)}, offset: Offset(${dbl(canonical.dimension(l.offsetX))}, ${dbl(canonical.dimension(l.offsetY))}), blurRadius: ${dbl(canonical.dimension(l.blur))}, spreadRadius: ${dbl(canonical.dimension(l.spread))})`,
      )
      .join(', ')}]`;

  for (const t of tokens) {
    const [head, ...rest] = t.name.split('.');
    const cls = CLASS_FOR[head];
    if (!cls)
      throw new Error(
        `no Dart class mapped for token group "${head}" (${t.name})`,
      );
    const field = dartName(rest.join('.')) || dartName(head);
    const modes = MODAL_GROUPS[head];

    if (t.type === 'color') {
      addModal(cls, modes, 'Color', field, {
        light: dartColor(t.modes.light),
        dark: dartColor(t.modes.dark),
      });
      manifest[t.name] = entry(
        'color',
        dartColor(t.modes.light),
        t.modes.light,
      );
    } else if (t.type === 'typography') {
      const d = { ...t.value, ...t.ext.modes.desktop };
      const m = { ...t.value, ...t.ext.modes.mobile };
      addModal(cls, modes, 'TextStyle', field, {
        desktop: textStyle(d),
        mobile: textStyle(m),
      });
      manifest[t.name] = entry('typography', 'TextStyle', t.value);
    } else if (t.type === 'shadow') {
      const light = shadowLayers(index, { $value: t.value }, 'light');
      const night = shadowLayers(index, { $value: t.value }, 'dark');
      addModal(cls, modes, 'List<BoxShadow>', field, {
        light: boxShadows(light),
        dark: boxShadows(night),
      });
      manifest[t.name] = entry('shadow', 'BoxShadow[]', light);
    } else if (head === 'type') {
      addModal(cls, modes, 'double', field, {
        desktop: dbl(canonical.dimension(t.modes.desktop)),
        mobile: dbl(canonical.dimension(t.modes.mobile)),
      });
      manifest[t.name] = entry(
        'dimension',
        dbl(canonical.dimension(t.modes.desktop)),
      );
    } else if (t.type === 'dimension') {
      const v = canonical.dimension(t.value);
      addStatic(cls, `  static const double ${field} = ${dbl(v)};`);
      manifest[t.name] = entry('dimension', dbl(v));
    } else if (t.type === 'duration') {
      const ms = canonical.duration(t.value);
      addStatic(
        cls,
        `  static const Duration ${field} = Duration(milliseconds: ${ms});`,
      );
      manifest[t.name] = entry('duration', `Duration(milliseconds: ${ms})`, ms);
    } else if (t.type === 'cubicBezier') {
      addStatic(
        cls,
        `  static const Cubic ${field} = Cubic(${t.value.join(', ')});`,
      );
      manifest[t.name] = entry(
        'cubicBezier',
        `Cubic(${t.value.join(', ')})`,
        t.value,
      );
    } else if (t.type === 'number') {
      addStatic(cls, `  static const int ${field} = ${t.value};`);
      manifest[t.name] = entry('number', t.value);
    } else if (t.type === 'fontFamily') {
      addStatic(cls, `  static const String ${field} = '${t.value}';`);
      manifest[t.name] = entry('fontFamily', t.value);
    } else if (t.type === 'fontWeight') {
      addStatic(
        cls,
        `  static const FontWeight ${field} = FontWeight.w${t.value};`,
      );
      manifest[t.name] = entry('fontWeight', `FontWeight.w${t.value}`, t.value);
    } else {
      throw new Error(`no Dart emitter for type ${t.type} (${t.name})`);
    }
  }

  const modalClasses = [...modal.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cls, g]) => {
      const params = g.fields
        .map((f) => `    required this.${/ (\w+);$/.exec(f)[1]},`)
        .join('\n');
      const instances = Object.entries(g.values)
        .map(
          ([mode, lines]) =>
            `  static const ${cls} ${mode} = ${cls}(\n${lines.join('\n')}\n  );`,
        )
        .join('\n\n');
      return (
        `@immutable\nclass ${cls} {\n  const ${cls}({\n${params}\n  });\n\n` +
        `${g.fields.join('\n')}\n\n${instances}\n}\n`
      );
    })
    .join('\n');

  const staticClasses = [...statics.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([cls, lines]) =>
        `abstract final class ${cls} {\n${lines.join('\n')}\n}\n`,
    )
    .join('\n');

  // The ThemeExtension bundles the mode-varying sets. lerp snaps at the halfway point: design
  // tokens are discrete values, and interpolating a semantic colour would invent a token.
  const theme =
    `@immutable\nclass SolarTheme extends ThemeExtension<SolarTheme> {\n` +
    `  const SolarTheme({required this.colors, required this.shadows, required this.type, required this.typography});\n\n` +
    `  final SolarColors colors;\n  final SolarShadows shadows;\n  final SolarType type;\n  final SolarTypography typography;\n\n` +
    `  static const SolarTheme light = SolarTheme(colors: SolarColors.light, shadows: SolarShadows.light, type: SolarType.desktop, typography: SolarTypography.desktop);\n` +
    `  static const SolarTheme dark = SolarTheme(colors: SolarColors.dark, shadows: SolarShadows.dark, type: SolarType.desktop, typography: SolarTypography.desktop);\n\n` +
    `  @override\n  SolarTheme copyWith({SolarColors? colors, SolarShadows? shadows, SolarType? type, SolarTypography? typography}) =>\n` +
    `      SolarTheme(colors: colors ?? this.colors, shadows: shadows ?? this.shadows, type: type ?? this.type, typography: typography ?? this.typography);\n\n` +
    `  @override\n  SolarTheme lerp(ThemeExtension<SolarTheme>? other, double t) =>\n` +
    `      (other is SolarTheme && t >= 0.5) ? other : this;\n}\n`;

  const header =
    `// SOLAR design tokens for Flutter.\n` +
    `// Generated by @bwp-web/codegen from spec/tokens.json. Do not edit.\n\n` +
    `import 'package:flutter/animation.dart' show Cubic;\n` +
    `import 'package:flutter/foundation.dart' show immutable;\n` +
    `import 'package:flutter/material.dart' show ThemeExtension;\n` +
    `import 'package:flutter/painting.dart' show BoxShadow, Color, FontWeight, Offset, TextStyle;\n\n`;

  return {
    dart: header + modalClasses + '\n' + staticClasses + '\n' + theme,
    manifest,
  };
}

export function emitFlutter(spec, fileVersion) {
  const { dart, manifest } = renderFlutter(spec);
  writeGenerated(join(OUT_DIR, 'tokens.dart'), dart);
  writeManifest({
    target: 'flutter',
    dir: OUT_DIR,
    entries: manifest,
    fileVersion,
  });
  return Object.keys(manifest).length;
}
```

- [ ] **Step 4: Run the test and watch it pass**

Run: `npx vitest run packages/codegen/test/flutter.test.mjs`
Expected: PASS, 9 tests.

- [ ] **Step 5: Add a Dart-side smoke test**

`packages/solar_flutter/test/tokens_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_flutter/solar_flutter.dart';

void main() {
  test('light and dark surface backgrounds differ', () {
    expect(SolarColors.light.surfaceBackground, isNot(SolarColors.dark.surfaceBackground));
  });

  test('spacing is exposed as logical pixels', () {
    expect(SolarInset.md, 16.0);
  });

  test('easings are curves, not keywords', () {
    expect(SolarMotion.both.transform(0.5), closeTo(0.5, 0.01));
  });

  test('the theme extension carries a full set per mode', () {
    expect(SolarTheme.light.colors.surfaceBackground, SolarColors.light.surfaceBackground);
    expect(SolarTheme.dark.colors.surfaceBackground, SolarColors.dark.surfaceBackground);
  });
}
```

- [ ] **Step 6: Generate the Dart file, then analyze and test it**

Run: `node -e "const n=await import('./packages/codegen/src/normalize/tokens.mjs');const f=await import('./packages/codegen/src/emit/flutter.mjs');f.emitFlutter(n.buildTokenSpec(n.loadContract()).spec,'dev');" --input-type=module`
Then: `cd packages/solar_flutter && dart format lib test && flutter analyze && flutter test && cd ../..`
Expected: `No issues found!` and 4 passing tests.

- [ ] **Step 7: Commit**

```bash
git add packages/codegen/src/emit/flutter.mjs packages/codegen/test/flutter.test.mjs packages/solar_flutter
git commit -m "feat(codegen): emit SOLAR tokens as Dart sets and a ThemeExtension"
```

---

### Task 11: Token parity across the four targets

Targets cover different subsets on purpose, so the suite states those subsets explicitly
rather than requiring identical key sets.

| Target   | Covers                                                          |
| -------- | --------------------------------------------------------------- |
| css      | everything except `typography.*` composites                     |
| mui      | everything                                                      |
| flutter  | everything                                                      |
| tailwind | semantic tokens in the mapped categories only, never primitives |

**Files:**

- Create: `packages/codegen/test/parity.test.mjs`

- [ ] **Step 1: Write the parity suite**

`packages/codegen/test/parity.test.mjs`:

```js
import { beforeAll, describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';
import { renderCss } from '../src/emit/css.mjs';
import { renderMui } from '../src/emit/mui.mjs';
import { renderTailwind } from '../src/emit/tailwind.mjs';
import { renderFlutter } from '../src/emit/flutter.mjs';

let spec, tokens, manifests;

beforeAll(() => {
  spec = buildTokenSpec(loadContract()).spec;
  tokens = flattenSpec(spec);
  manifests = {
    css: renderCss(spec).manifest,
    mui: renderMui(spec).manifest,
    tailwind: renderTailwind(spec).manifest,
    flutter: renderFlutter(spec).manifest,
  };
});

describe('token parity', () => {
  it('every emitted token exists in the spec', () => {
    const known = new Set(tokens.map((t) => t.name));
    for (const [target, m] of Object.entries(manifests)) {
      for (const name of Object.keys(m)) {
        expect(known.has(name), `${target} emitted unknown token ${name}`).toBe(
          true,
        );
      }
    }
  });

  it('css, mui and flutter cover every non-typography token', () => {
    for (const t of tokens) {
      if (t.type !== 'typography') {
        expect(manifests.css[t.name], `css is missing ${t.name}`).toBeDefined();
      }
      expect(manifests.mui[t.name], `mui is missing ${t.name}`).toBeDefined();
      expect(
        manifests.flutter[t.name],
        `flutter is missing ${t.name}`,
      ).toBeDefined();
    }
  });

  it('tailwind exposes the semantic layer, and a primitive only where SOLAR has no semantic one', () => {
    const byName = new Map(tokens.map((t) => [t.name, t]));
    for (const name of Object.keys(manifests.tailwind)) {
      if (byName.get(name).ext.tier !== 'primitive') continue;
      // motion and the font families are the only ones with no semantic layer in SOLAR
      expect(name, `${name} is an unexpected primitive`).toMatch(
        /^(motion|type\.font-family)\./,
      );
    }
    expect(Object.keys(manifests.tailwind).length).toBeGreaterThan(100);
  });

  it('every target that emits a token agrees on its canonical value', () => {
    const mismatches = [];
    for (const t of tokens) {
      const seen = Object.entries(manifests)
        .map(([target, m]) => [target, m[t.name]])
        .filter(([, e]) => e !== undefined);
      if (seen.length < 2) continue;
      const [, first] = seen[0];
      for (const [target, e] of seen.slice(1)) {
        if (JSON.stringify(e.normalized) !== JSON.stringify(first.normalized)) {
          mismatches.push(
            `${t.name}: ${seen[0][0]}=${JSON.stringify(first.normalized)} vs ${target}=${JSON.stringify(e.normalized)}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('matches the spec value, not just each other', () => {
    for (const t of tokens) {
      const e = manifests.mui[t.name];
      if (!e || t.type === 'typography' || t.type === 'shadow') continue;
      const expected =
        t.type === 'color'
          ? undefined // colours carry modes; compared target to target above
          : t.value;
      if (expected === undefined) continue;
      expect(String(e.emitted).replace(/px$|ms$/, '')).toBe(
        String(expected).replace(/px$|ms$/, ''),
      );
    }
  });
});
```

- [ ] **Step 2: Run the suite**

Run: `npx vitest run packages/codegen/test/parity.test.mjs`
Expected: PASS, 5 tests. If a target is missing tokens, the failure names them.

- [ ] **Step 3: Commit**

```bash
git add packages/codegen/test/parity.test.mjs
git commit -m "test(codegen): assert token parity across CSS, MUI, Tailwind and Flutter"
```

---

### Task 12: CLI, npm scripts and package wiring

**Files:**

- Create: `packages/codegen/bin/solar-codegen.mjs`
- Create: `packages/codegen/src/report/deviations.mjs`
- Modify: `package.json` (root: add `solar:codegen`)
- Modify: `packages/styles/src/index.ts`
- Modify: `packages/styles/package.json` (export the stylesheet)

- [ ] **Step 1: Write the deviations report**

`packages/codegen/src/report/deviations.mjs`:

```js
import { join } from 'node:path';
import { specDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';

export function writeDeviationsReport(deviations, fileVersion) {
  const unique = [
    ...new Map(deviations.map((d) => [d.token, d])).values(),
  ].sort((a, b) => a.token.localeCompare(b.token));
  const rows = unique
    .map(
      (d) =>
        `| \`${d.token}\` | ${String(d.figmaValue).replaceAll('|', '\\|')} | ${d.reason} | ${d.raise ?? 'no action'} |`,
    )
    .join('\n');
  const body =
    `# SOLAR code deviations from Figma\n\n` +
    `Generated by \`npm run solar:codegen\` from \`spec/tokens.json\`. Figma file version \`${fileVersion}\`.\n\n` +
    `Each row is a place where the generated code deliberately differs from what the Figma data says.\n` +
    `The mirror in \`docs/\` is never edited to accommodate these; take them to SOLAR governance.\n\n` +
    (unique.length
      ? `| Token | Figma value | Why we differ | Action |\n| --- | --- | --- | --- |\n${rows}\n`
      : `No deviations.\n`);
  return writeGenerated(join(specDir, 'deviations.md'), body);
}
```

- [ ] **Step 2: Write the CLI**

`packages/codegen/bin/solar-codegen.mjs`:

```js
#!/usr/bin/env node
// Generates spec/tokens.json from docs/, then emits every target. Reads docs/, never writes it.
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { writeDeviationsReport } from '../src/report/deviations.mjs';
import { emitCss } from '../src/emit/css.mjs';
import { emitMui } from '../src/emit/mui.mjs';
import { emitTailwind } from '../src/emit/tailwind.mjs';
import { emitFlutter } from '../src/emit/flutter.mjs';
import { repoRoot, specDir } from '../src/util/paths.mjs';
import { writeGenerated } from '../src/util/write.mjs';

const contract = loadContract();
const { spec, deviations } = buildTokenSpec(contract);
const fileVersion = contract.generatedFrom?.exportedOn ?? 'unknown';

writeGenerated(
  join(specDir, 'tokens.json'),
  JSON.stringify(
    {
      $description:
        'SOLAR design tokens in DTCG format. Generated by @bwp-web/codegen from docs/solar/tokens/css-contract.json and docs/solar-web/tokens/layout-variables.json. Modes live under $extensions["com.biamp.solar"].modes. Do not edit.',
      $extensions: {
        'com.biamp.solar': {
          source: contract.generatedFrom,
          layout: contract.layoutSource,
        },
      },
      ...spec,
    },
    null,
    2,
  ) + '\n',
);
writeDeviationsReport(deviations, fileVersion);

const counts = {
  css: emitCss(spec, fileVersion),
  mui: emitMui(spec, fileVersion),
  tailwind: emitTailwind(spec, fileVersion),
  flutter: emitFlutter(spec, fileVersion),
};

execSync(
  `npx prettier --write "spec/**/*.{json,md}" "packages/styles/src/generated/**/*.{ts,css,json}"`,
  { cwd: repoRoot, stdio: 'ignore' },
);
try {
  execSync('dart format lib', {
    cwd: join(repoRoot, 'packages', 'solar_flutter'),
    stdio: 'ignore',
  });
} catch {
  console.log('dart format skipped: the Dart SDK is not on PATH');
}

console.log(
  `codegen: ${Object.entries(counts)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ')} tokens, ${deviations.length} deviations`,
);
```

- [ ] **Step 3: Add the npm script**

In root `package.json`, after `"solar:tokens"`:

```json
    "solar:codegen": "node packages/codegen/bin/solar-codegen.mjs",
```

- [ ] **Step 4: Wire the styles package**

`packages/styles/src/index.ts`:

```ts
export {
  solarTokens,
  solarTypography,
  solarShadows,
  solarZIndex,
  createSolarThemeOptions,
  type SolarMode,
} from './generated/mui/theme.js';
export { solarTailwindPreset } from './generated/tailwind/preset.js';
```

In `packages/styles/package.json`, add to `exports` after the `"."` entry:

```json
    "./tokens.css": "./src/generated/css/tokens.css"
```

and add `"src"` to the `files` array so the stylesheet is published.

- [ ] **Step 5: Run the generator and check the whole repo still builds**

Run: `npm run solar:codegen`
Expected, for the Figma data committed today:
`codegen: css 663, mui 710, tailwind <n>, flutter 710 tokens, 10 deviations`.

The spec holds 710 tokens: 647 variables, 9 shadows, 47 text styles and the 7-level z-index
ladder. CSS emits 663 because it skips the typography composites, and Tailwind is a documented
subset. If the Figma data has moved on the counts move with it; what must hold is that MUI and
Flutter agree and the parity suite passes.

Run: `npm run typecheck && npx vitest run`
Expected: typecheck passes, all suites pass.

- [ ] **Step 6: Run it twice to prove it is deterministic**

Run: `npm run solar:codegen && git status --porcelain > /tmp/a && npm run solar:codegen && git status --porcelain > /tmp/b && diff /tmp/a /tmp/b && echo DETERMINISTIC`
Expected: `DETERMINISTIC`

- [ ] **Step 7: Prove the write guard works end to end**

Run: `git status --porcelain docs/`
Expected: empty. The generator read `docs/` and wrote nothing there.

- [ ] **Step 8: Commit**

```bash
git add packages/codegen packages/styles spec package.json
git commit -m "feat(codegen): CLI, deviations report and styles package wiring"
```

---

### Task 13: CI

**Files:**

- Modify: `.github/workflows/solar.yml`

- [ ] **Step 1: Add the codegen job**

Append to `.github/workflows/solar.yml` under `jobs:`:

```yaml
codegen:
  name: Generated code is up to date
  runs-on: ubuntu-latest
  steps:
    - name: Check out code
      uses: actions/checkout@v4

    - name: Setup Node.js environment
      uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Regenerate the spec and every target
      run: npm run solar:codegen

    - name: Fail if docs/ was written to
      run: |
        if [ -n "$(git status --porcelain docs/)" ]; then
          echo "::error::The generator wrote to docs/. docs/ is the Figma mirror and is read-only to codegen (design spec invariant 1)."
          git status --short docs/
          exit 1
        fi

    - name: Fail if the regeneration changed anything
      run: |
        if [ -n "$(git status --porcelain)" ]; then
          echo "::error::Generated code does not match the spec. Run 'npm run solar:codegen' locally and commit the result."
          git status --short
          git --no-pager diff --stat
          exit 1
        fi

    - name: Run the unit and parity suites
      run: npx vitest run
```

- [ ] **Step 2: Add the Flutter job**

Append below it:

```yaml
flutter:
  name: Dart package analyzes and tests
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: packages/solar_flutter
  steps:
    - name: Check out code
      uses: actions/checkout@v4

    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        channel: stable
        cache: true

    - name: Install dependencies
      run: flutter pub get

    - name: Check formatting
      run: dart format --output=none --set-exit-if-changed lib test

    - name: Analyze
      run: flutter analyze

    - name: Test
      run: flutter test
```

- [ ] **Step 3: Validate the workflow parses**

Run: `npx prettier --check .github/workflows/solar.yml`
Expected: `All matched files use Prettier code style!`

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/solar.yml
git commit -m "ci: verify generated code determinism, the docs/ guard, and the Dart package"
```

---

### Task 14: Documentation

**Files:**

- Modify: `docs/README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add the code layer to the pipeline map**

In `docs/README.md`, in the "What exists today, and what does not" table, replace the row
`| SOLAR Icons: every icon as outline and solid SVG, logos, and a catalog for `@bwp-web/assets` |`
right-hand cell content by moving the generator entry out of "Does not exist yet", and add a
new section before "Checks in CI":

```markdown
## From docs to code

`npm run solar:codegen` reads `docs/` and `spec/overlay/`, writes `spec/tokens.json` in DTCG
format, and emits four targets: CSS custom properties, MUI theme options, a Tailwind preset and
Dart constants for Flutter. It never writes to `docs/`; that invariant is enforced by a write
guard in the generator and asserted in CI.

Design: [the docs-to-code spec](superpowers/specs/2026-09-21-solar-docs-to-code-design.md).
Deviations from Figma are reported in [`spec/deviations.md`](../spec/deviations.md).
```

- [ ] **Step 2: Add the hard rule for agents**

In `CLAUDE.md`, after the CI paragraph, add:

```markdown
`npm run solar:codegen` generates code from `docs/` plus `spec/overlay/` into `spec/` and the
packages. It must never write to `docs/`: that is the Figma mirror. When generated styling is
wrong, fix `spec/overlay/` for a single component, the normalizer in `packages/codegen` for a
systemic rule, or the hand-written shell for behaviour. Never edit a generated file to keep a
change, and never edit `docs/` to make code look right.
```

- [ ] **Step 3: Verify the docs checks still pass**

Run: `npx prettier --check "docs/**/*.md" README.md CLAUDE.md && node scripts/check-personal-data.mjs`
Expected: clean, and `0 new, 0 credentials`.

- [ ] **Step 4: Commit**

```bash
git add docs/README.md CLAUDE.md
git commit -m "docs: describe the docs-to-code generator and its invariant"
```

---

## Done when

- `npm run solar:codegen` is deterministic and writes nothing under `docs/`.
- `npx vitest run` passes, including the parity suite.
- `flutter analyze` and `flutter test` pass in `packages/solar_flutter`.
- An MUI app can call `createSolarThemeOptions('light')` and a Flutter app can read
  `SolarColorsLight.surfaceBackground`, from the same spec, with the parity suite proving they
  agree.
