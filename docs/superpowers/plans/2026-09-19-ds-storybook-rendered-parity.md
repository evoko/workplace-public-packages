# Storybook and Rendered Parity Implementation Plan (Plan 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** One Storybook that shows every token and every component rendered by each web target side by side, and a `bwp-ds verify --rendered` step that proves, in a real browser, that the CSS, Tailwind, and MUI targets compute the same styles for every axis combination, state, and color mode.

**Architecture:** A new compiler plugin `stories` generates `packages/storybook/src/generated/**`: a `config.ts` with the design system's prefix, mode selector, token categories, and the parity property list; one compare story per component under `styles/`; one compare story per token category under `foundations/`. The generated stories hold data only (a `CompareSpec` or `TokenSpec[]`) plus one generated render function for the MUI cell, and call a hand-written harness in `packages/storybook/src/harness/`. The harness renders a `CompareGrid`: columns are targets, rows are every axis permutation times every state; each cell is a Shadow DOM root holding that target's stylesheet (transitions disabled) so no target's CSS reaches another, while token variables live at document level where custom properties inherit into every shadow tree (CSS package `:root` block, Tailwind `:root, :host` block, MUI `ThemeProvider` variables). `parityPlay` drives real interactions through Vitest browser-mode commands (Playwright hover, mouse down, Tab from a sentinel) and compares `getComputedStyle` of the root and each slot between the CSS cell and every other cell, in light and dark mode, for every property in the compiler's property table, then throws one aggregated report. `bwp-ds verify --rendered` runs the storybook package's `test:rendered` script (Vitest browser mode over all stories) and reports failures as `DS-E087`. Flutter cells are Plan 5.

**Tech Stack:** Storybook 10.3 (`@storybook/react-vite`), Vitest 4 browser mode with `@vitest/browser-playwright` and Playwright 1.59 (Chromium), Vite 6, `@tailwindcss/postcss` 4.3 for the Tailwind cell, Emotion 11.14 (`@emotion/cache` with a shadow-root container) and MUI 9.4 for the MUI cell, React 19, TypeScript 5.9, Node 22, Turbo.

**Rules for every task:**

- **Never run any git command that writes** (no `git add`, `git commit`, `git tag`, `git stash`, `git checkout`, `git reset`, `git rm`, `git mv`). The user commits at each checkpoint. `git status` and `git diff` are fine.
- Use Node 22: `export PATH="$HOME/.nvm/versions/node/v22.23.2/bin:$PATH"` (or `nvm use`).
- Never name anything after the current design system. Use `ds`, `bwp`, or a descriptive word. Identifiers derived from the configured prefix (`createBwpTheme`, `bwp-button`) are data, not names. Package names (`@bwp-web/styles-mui`) appear only in hand-written files and in `ds.config.json`, never in the compiler.
- Generated output is deterministic: sorted keys, canonical order, template formatting, no external formatter at generation time. Never run Prettier over `src/generated/**` or the catalog.
- Do not work around a denied command. Report it as BLOCKED.
- Never hand-edit a generated file (`src/generated/**`, `design.ir.json`, `src/index.css`, `coverage.md`, `catalogs/*.json`); regenerate it.
- Read the real source files for signatures before editing; earlier plans' code is the base and this plan shows only what changes.

---

## Decisions made while writing this plan

Every decision below was probed in this repository with a scratch story run under Vitest browser mode before being written down.

| Topic | Decision |
| --- | --- |
| Cell isolation | Shadow DOM, not scoped containers. Each cell is a `<div>` host with an open shadow root holding `<style>` elements for that target and the rendered DOM. Component rules (`.bwp-button`, Tailwind's `@layer components`, Emotion's per-cell classes) cannot cross a shadow boundary; custom properties can. Probed: a CSS cell and an MUI cell rendered the starter `button` with identical computed values for 16 properties in the base, hover, focus-visible, and active states. |
| Where token variables live | At document level. `:root { … }` never matches inside a shadow root, so each target's variables are injected once into the document: the CSS package stylesheet and the compiled Tailwind stylesheet as `<style>` elements appended to `document.head` by the harness (their component rules match nothing in the light DOM, whose markup carries no design-system classes), and MUI's variables by the `ThemeProvider` the grid renders around the table (MUI's `GlobalStyles` writes them through the default Emotion cache into `document.head`). The three variable namespaces are disjoint (`--bwp-color-*`, `--color-bwp-*`, `--bwp-palette-tokens-*`), so they coexist. The same stylesheets are injected again inside each cell's shadow root for the component rules; Tailwind's `:root, :host` theme block resolves both ways. |
| MUI styles inside a cell | An Emotion cache per cell with `container` set to the shadow root and `prepend: true`, provided through `CacheProvider` to a React portal rendered into the shadow root. Probed: 57 Emotion `<style>` elements landed inside the shadow root and none of the component's styles in the document head; the theme's variables landed in the head. |
| Transitions | Every cell's shadow root starts with `*, *::before, *::after { transition: none !important; animation: none !important; }`. Probed: without it, every difference found was a value read mid-transition (a hover background at `rgba(245, 245, 245, 0.008)`, a focus ring at `0px`), because the design system animates `background-color`, `box-shadow`, and `color`. Foundations cells for the `duration` and `easing` categories opt out (`freeze: false`) because their sample compares `transition-duration` and `transition-timing-function`, which are static computed values. |
| Real interactions | `storybook/test`'s `userEvent.hover` dispatches synthetic events and does not change `:hover`; Playwright does. The harness registers Vitest browser commands (`vitest.config.ts` `browser.commands`): `parityHover(selector)`, `parityMouseDown(selector)`, `parityMouseUp()`, `parityFocusFrom(sentinelSelector)` (focus the sentinel, then press Tab, which makes `:focus-visible` match in both the CSS root and MUI's root, and MUI adds `Mui-focusVisible`). Playwright's CSS engine pierces open shadow roots, so a `[data-parity-root="<cell>"]` attribute the cell sets on its root element is a sufficient selector. Probed: all four worked; `:active` background matched between cells while the mouse was down. |
| Outside Vitest | In the Storybook UI the commands do not exist (`@vitest/browser/context` is unavailable). `parityPlay` detects that and compares only the base row and attribute-driven states (`disabled`, ARIA states), in both modes, and logs that interaction states were skipped. The Storybook UI stays useful; the proof runs in CI. |
| Modes | `parityPlay` compares in the current mode, then applies the other configured modes by setting the mode attribute or class on `document.documentElement` (derived from `modeSelector` by the generator into `config.ts`), waits a frame, compares again, and restores. Every difference records its mode. The `dsMode` toolbar global drives the same attribute for people. |
| Property list | Every property in the compiler's property table (`PROPERTY_TABLE`, about 100 longhands), emitted into the generated `config.ts` as `parityProperties`. Comparing unset properties is free (both sides compute the same user-agent default for the same element) and catches a target that leaks a value the design system never set, which is exactly the class of bug the MUI resets exist to prevent. Stories may pass `ignore: [...]` to `parityPlay` for a documented exception; none is needed today. |
| Comparison rule | Computed values are compared token by token: numbers within 0.5 (px or unitless) after parsing, everything else exact. Colors are already normalized to `rgb()`/`rgba()` by `getComputedStyle`. Values that fail to tokenize identically are reported whole. |
| Markup for CSS and Tailwind cells | Built by the harness from the spec: the root element with class `<prefix>-<name>` and one `data-<axis>` attribute per axis; slot elements in manifest order, class `<prefix>-<name>__<slot>`, text content from the manifest's `preview[slot]`; the label text (`preview.label`, else `displayName`) inside the `label` slot when there is one, else as a text node after the slots. Attribute states set the attribute on the root (`disabled` for form-control roots, `aria-disabled="true"` otherwise, `aria-<state>="true"` for ARIA states). |
| Markup for MUI cells | A generated render function per component: `(row) => <Button variant={row.axes.variant} size={row.axes.size} disabled={row.state === 'disabled'} icon="plus">Button</Button>`. Slot content is passed as a plain string so the slot element's own computed styles are compared, not a wrapper's. Root and slot selectors come from the MUI model (`MuiButton-root`, `MuiButton-startIcon`, `BwpExample-icon`). |
| Rows | Every axis permutation (`axisPermutations`, manifest order) times `[base, ...states]`. Cells: CSS always (the reference), Tailwind when the component is mapped for Tailwind, MUI when mapped for MUI. A component excluded from every other target still gets a CSS-only story (a gallery entry, nothing to compare). |
| Foundations | One story per token category present in the IR; each token is a row whose cells render a sample element that consumes the token's variable for that target (`background-color` for colors, `width` for space and size, `border-top-left-radius`, `border-top-width`, `font-*`, `line-height`, `letter-spacing`, `box-shadow`, `opacity`, `z-index`, `transition-duration`, `transition-timing-function`). `tokenParityPlay` compares that one property across cells in every mode, so the token layer of every target is proven, not only the components. The three variable names come from the compiler (`cssName`, `tailwindVarName`, `muiVarName`). |
| `stories` as a plugin | Registered like a target (`bwp-ds generate --target stories`, drift-checked, `outDir` from `targets.stories.outDir`) but marked `auxiliary: true` on the plugin: it has nothing to round-trip and no coverage entries. `verify` skips round-trip for auxiliary plugins and `computeCoverage` derives its columns from the entries, so no `stories` column appears in `coverage.md`. |
| What the generator needs | The IR, the MUI model (`buildMuiModel`, rebuilt from the MUI catalog for export names, prop names, slot classes, theme factory name), and the MUI package's import specifier, from `ds.config.json`: `targets.stories.options.muiPackage`. Target configs gain an optional `options: Record<string, string>`. The stories plugin loads the catalog through `loadMuiCatalog` with a scratch diagnostics object and reports a single summary error when the MUI side fails, so nothing is reported twice. |
| `verify --rendered` | The compiler is design-system agnostic and does not know where the Storybook lives, so `ds.config.json` gains `rendered: { cwd: "../storybook", command: "npm run test:rendered" }`. With `--rendered`, `verify` runs the command after the four existing steps (`spawnSync`, shell, 10-minute timeout, output captured) and records step `rendered`: `pass`, `fail` with `DS-E087 Rendered parity failed` carrying the last lines of output, or `skipped` with `DS-W005` when `rendered` is not configured. Rendered runs only when the four Node steps passed. |
| Storybook package tasks | `test` (Vitest `unit` project, Node, the harness's pure modules), `test:rendered` (Vitest `storybook` project, browser), `typecheck` (`tsc --noEmit` over harness, generated stories, and `.storybook`, so a generation bug fails typecheck as it does in `styles-mui`), `lint` (title-prefix lint script plus ESLint with the repo's React config), `build` (static Storybook, already a Turbo task; it now compiles the generated stories). |
| Tailwind in the browser | `src/harness/tailwind.css` is `@layer theme, base, components, utilities; @import '@bwp-web/styles-tailwind';` processed by `@tailwindcss/postcss` through a `postcss.config.js` in the storybook package; imported with `?inline`. Probed with the same input through the PostCSS CLI: 8.4 KB holding the `:root, :host` theme block, the dark block, and the `@layer components` rules; no preflight, no utilities (nothing imports `tailwindcss` itself). |
| CI | `main.yml` installs Chromium (`npx playwright install --with-deps chromium`) and runs `npm run verify -- --rendered` after the existing `verify`; the generated-files diff includes `packages/storybook/src/generated`. The Turbo `test:rendered` task is uncached and depends on `^build`. |
| Sections and title lint | Storybook titles must start with `Introduction`, `Foundations`, `Styles`, `Components`, `Canvas`, or `Assets`. `scripts/lint-story-titles.mjs` scans every `*.stories.*` and `*.mdx` in the storybook, components, and canvas packages and fails on any other prefix. |
| Out of scope | Flutter cells (Plan 5: a `custom` target kind on the grid), pixel screenshots (never), hand-written component stories (`Components`, `Canvas`, `Assets` stay empty), `auto-tag`/versioning (Plan 6). |

---

## File structure

Compiler (`packages/ds-compiler/`):

| Path | Responsibility |
| --- | --- |
| `src/config.ts` | `targets.<id>.options?: Record<string, string>`; top-level `rendered?: { cwd, command }`. |
| `src/errors.ts` | `DS-E087` (rendered parity failed), `DS-W005` (rendered verification not configured). |
| `src/targets/plugin.ts` | `TargetPlugin.auxiliary?: true`. |
| `src/verify/coverage.ts` | Columns from entries, not from every plugin. |
| `src/verify/index.ts` | `VerifyStep` gains `rendered`; `verify(rootDir, { rendered })` runs the configured command. |
| `src/verify/rendered.ts` | `runRendered(rootDir, config, diag)`: spawn, capture, report. |
| `src/cli.ts` | `verify --rendered`. |
| `src/targets/stories/spec.ts` | `StoriesModel`, `ComponentSpec`, `TokenSpec` types and `buildStoriesModel(ir, muiModel, options, diag)`. |
| `src/targets/stories/render.ts` | `renderStoriesConfig`, `renderComponentStory`, `renderFoundationsStory`. |
| `src/targets/stories/generate.ts` | `generateStories(ir, catalog, ctx, diag)`: file list. |
| `src/targets/stories/index.ts` | `storiesPlugin` (`auxiliary`, `loadCatalog`, `generate`, `reparse: () => null`, `coverage: () => []`). |
| `src/targets/index.ts` | Registers `stories`. |
| `src/index.ts` | Exports. |
| Tests | `test/stories-generate.test.ts`, `test/stories-spec.test.ts`, `test/verify-rendered.test.ts`; updated `config.test.ts`, `errors.test.ts`, `verify.test.ts`, `coverage.test.ts`, `cli.test.ts`, `tailwind-fixture.ts` (config gains `stories` and `rendered`). |

Storybook package (`packages/storybook/`), hand-written:

| Path | Responsibility |
| --- | --- |
| `package.json` | Scripts `test`, `test:rendered`, `typecheck`, `lint`, `generate`; dependencies on the three style packages, Emotion, MUI, `@tailwindcss/postcss`, `postcss`, `tailwindcss`. |
| `postcss.config.js` | `@tailwindcss/postcss`. |
| `tsconfig.json`, `eslint.config.js`, `.prettierignore`, `vitest.config.ts` | Two Vitest projects (`unit`, `storybook`), browser commands. |
| `.storybook/main.ts`, `.storybook/preview.tsx` | MDX glob; `dsMode` and `dsTargets` globals; mode decorator. |
| `src/Introduction.mdx` | Hand-written introduction reading the name from `ds.config.json`. |
| `src/harness/spec.ts` | `CompareSpec`, `CompareRow`, `TokenSpec`, `TargetId` types; `rowsFor(spec)`. |
| `src/harness/markup.ts` | `cssMarkup(spec, row)`: the HTML string for CSS and Tailwind cells. |
| `src/harness/compare.ts` | `compareValues`, `compareElements`, `formatDifferences`. |
| `src/harness/mode.ts` | `applyMode(config, mode)`, `clearMode(config)`. |
| `src/harness/styles.ts` | The three stylesheets as strings; `ensureDocumentStyles()`; `FREEZE_CSS`. |
| `src/harness/tailwind.css` | The Tailwind entry compiled by PostCSS. |
| `src/harness/ShadowCell.tsx` | The isolated cell (shadow root, styles, portal, Emotion cache). |
| `src/harness/CompareGrid.tsx` | The component grid. |
| `src/harness/TokenGrid.tsx` | The foundations grid. |
| `src/harness/driver.ts` | Vitest command wrappers with a null fallback. |
| `src/harness/parityPlay.ts` | `parityPlay(context, spec, options)`. |
| `src/harness/tokenParityPlay.ts` | `tokenParityPlay(context, tokens, category)`. |
| `src/harness/commands.ts` | The Playwright-side command implementations for `vitest.config.ts`. |
| `src/harness/index.ts` | Public exports. |
| `src/harness/*.test.ts` | Unit tests for `spec`, `markup`, `compare`, `mode`. |
| `scripts/lint-story-titles.mjs` | Section prefix lint. |
| `src/generated/**` | Generated by `bwp-ds generate --target stories`; committed. |

Repo: `packages/styles-css/ds.config.json` (`targets.stories`, `rendered`), `turbo.json`, `.github/workflows/main.yml`, root `.prettierignore`, `AGENTS.md`, root `README.md`, `docs/design-system/{storybook.md (new), verification.md, errors.md, authoring-guide.md}`.

---

## Batches

| Batch | Tasks | Milestone |
| --- | --- | --- |
| 1 | 1, 2 | Compiler: config, error codes, auxiliary plugins, `verify --rendered`, the `stories` plugin and its renderers, all on fixtures. |
| 2 | 3, 4 | Storybook harness: cells, grids, comparison, play functions, commands, globals, Introduction, title lint, unit tests. |
| 3 | 5 | Wiring: config, generated stories committed, `test:rendered` green locally, CI, Turbo, docs. |
| 4 | 6 | Final verification. |

Pause after every batch for the user's review and commit.

---

## Task 1: Config, error codes, auxiliary plugins, `verify --rendered`

**Files:**
- Modify: `packages/ds-compiler/src/config.ts`
- Modify: `packages/ds-compiler/src/errors.ts`
- Modify: `packages/ds-compiler/src/targets/plugin.ts`
- Modify: `packages/ds-compiler/src/verify/coverage.ts`
- Create: `packages/ds-compiler/src/verify/rendered.ts`
- Modify: `packages/ds-compiler/src/verify/index.ts`
- Modify: `packages/ds-compiler/src/cli.ts`
- Modify: `packages/ds-compiler/src/index.ts`
- Test: `test/config.test.ts`, `test/errors.test.ts`, `test/coverage.test.ts`, new `test/verify-rendered.test.ts`, `test/verify.test.ts`, `test/cli.test.ts`, `test/tailwind-fixture.ts`

- [ ] **Step 1: Failing config tests**

`test/config.test.ts`, add:

```ts
  it('accepts per-target options and a rendered command', () => {
    const root = tmpRoot();
    writeFileSync(
      join(root, 'ds.config.json'),
      JSON.stringify({
        name: 'Fictional',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        targets: {
          stories: {
            outDir: '../storybook/src/generated',
            options: { muiPackage: '@acme/styles-mui' },
          },
        },
        rendered: { cwd: '../storybook', command: 'npm run test:rendered' },
      }),
    );
    const diag = new Diagnostics();
    const config = loadConfig(root, diag)!;
    expect(diag.items).toEqual([]);
    expect(config.targets.stories).toEqual({
      outDir: '../storybook/src/generated',
      options: { muiPackage: '@acme/styles-mui' },
    });
    expect(config.rendered).toEqual({
      cwd: '../storybook',
      command: 'npm run test:rendered',
    });
  });

  it('rejects non-string options, an empty rendered command, and an absolute rendered cwd', () => {
    for (const bad of [
      { targets: { stories: { options: { n: 1 } } } },
      { rendered: { cwd: '../storybook', command: '' } },
      { rendered: { cwd: '/abs', command: 'x' } },
      { rendered: { command: 'x' } },
    ]) {
      const root = tmpRoot();
      writeFileSync(
        join(root, 'ds.config.json'),
        JSON.stringify({
          name: 'Fictional',
          prefix: 'fx',
          modes: ['light'],
          defaultMode: 'light',
          ...bad,
        }),
      );
      const diag = new Diagnostics();
      expect(loadConfig(root, diag)).toBeNull();
      expect(diag.errors.map((e) => e.code)).toEqual(['DS-E001']);
    }
  });
```

The existing "loads a valid config and fills defaults" test's `toEqual` gains no key: `rendered` is absent when not configured (use `rendered?: …` and do not set it), so that test stays as is; check it still passes.

- [ ] **Step 2: Config schema**

`src/config.ts`: inside the `targets` record's `z.strictObject`, add

```ts
        /** Free-form string options a plugin reads (the stories plugin needs `muiPackage`). */
        options: z.record(z.string(), z.string()).optional(),
```

after `coverageFile` add

```ts
  /**
   * How `bwp-ds verify --rendered` runs the rendered-parity check: a shell
   * command and the directory (relative to the source root) to run it in.
   */
  rendered: z
    .strictObject({
      cwd: relativePosixPath,
      command: z.string().min(1),
    })
    .optional(),
```

`DsConfig`: `targets: Record<string, { outDir?: string; options?: Record<string, string> }>;` and `rendered?: { cwd: string; command: string };`. In the returned object add `...(raw.rendered ? { rendered: raw.rendered } : {}),` so the key is absent when unconfigured.

- [ ] **Step 3: Error codes and the auxiliary flag**

`src/errors.ts` after `'DS-E086'`:

```ts
  'DS-E087': {
    title: 'Rendered parity failed',
    hint: 'The rendered-parity command (ds.config.json `rendered.command`) exited non-zero. Read its output above: each line names the component, axes, state, mode, target, element, and property that differ. Fix the target plugin under packages/ds-compiler/src/targets/<id>/ (or the harness under packages/storybook/src/harness/), never the generated output.',
  },
```

after `'DS-W004'`:

```ts
  'DS-W005': {
    title: 'Rendered verification not configured',
    hint: 'Add `rendered: { "cwd": "<dir>", "command": "<shell command>" }` to ds.config.json so `bwp-ds verify --rendered` can run the browser comparison.',
  },
```

`test/errors.test.ts`: extend the enumerations with both codes and assert `DS-W005` is a warning (the file already has an every-code-documented test against `errors.md`; Task 5 adds the rows, so in this task add the rows to `docs/design-system/errors.md` too: `DS-E087` in "Generated output and verification", `DS-W005` in "Warnings", one line each, wording from the hints).

`src/targets/plugin.ts`, in `TargetPlugin` after `id`:

```ts
  /**
   * True for a plugin that derives artifacts from the IR and other targets
   * (the story generator) but is not itself a styling target: it is
   * generated and drift-checked like the others, but has nothing to
   * round-trip and contributes no coverage entries.
   */
  auxiliary?: true;
```

- [ ] **Step 4: Coverage columns from entries**

`src/verify/coverage.ts`: replace `targets: plugins.map((p) => p.id).sort(codeUnitCompare),` with

```ts
    targets: [...new Set(entries.map((e) => e.target))].sort(codeUnitCompare),
```

`test/coverage.test.ts`, add:

```ts
  it('lists only targets that produced entries, so an auxiliary plugin adds no column', () => {
    const { ir } = twBuild(twRoot());
    const silent: TargetPlugin = {
      id: 'aux',
      auxiliary: true,
      generate: () => [],
      reparse: () => null,
      coverage: () => [],
      isMapped: () => false,
      ignoredProperties: () => new Set(),
    };
    const report = computeCoverage(ir, [tailwindPlugin, silent]);
    expect(report.targets).toEqual(['tailwind']);
    expect(renderCoverageMarkdown(report, ir, '0.0.0-test')).not.toContain('aux');
  });
```

(import `TargetPlugin` type, `twBuild`/`twRoot`, `renderCoverageMarkdown` as the file's existing imports allow.)

- [ ] **Step 5: Failing rendered tests**

Create `test/verify-rendered.test.ts`:

```ts
import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { runRendered } from '../src/verify/rendered.js';
import { makeRoot } from './helpers.js';

function configWith(rendered: DsConfig['rendered']): DsConfig {
  return {
    name: 'Fictional',
    prefix: 'fx',
    modes: ['light'],
    defaultMode: 'light',
    rootFontSize: 16,
    modeSelector: ':root[data-fx-theme="{mode}"]',
    targets: {},
    coverageFile: 'coverage.md',
    ...(rendered ? { rendered } : {}),
  };
}

describe('runRendered', () => {
  it('is skipped with DS-W005 when not configured', () => {
    const diag = new Diagnostics();
    expect(runRendered(makeRoot({}), configWith(undefined), diag)).toBe('skipped');
    expect(diag.warnings.map((w) => w.code)).toEqual(['DS-W005']);
    expect(diag.errors).toEqual([]);
  });

  it('passes when the command exits 0, running in the configured cwd', () => {
    const root = makeRoot({});
    mkdirSync(join(root, 'sb'));
    writeFileSync(join(root, 'sb', 'marker'), '');
    const diag = new Diagnostics();
    const status = runRendered(
      root,
      configWith({ cwd: 'sb', command: 'test -f marker' }),
      diag,
    );
    expect(status).toBe('pass');
    expect(diag.items).toEqual([]);
  });

  it('fails with DS-E087 carrying the output tail when the command exits non-zero', () => {
    const root = makeRoot({});
    mkdirSync(join(root, 'sb'));
    const script = join(root, 'sb', 'fail.sh');
    writeFileSync(
      script,
      '#!/bin/sh\nfor i in 1 2 3 4 5; do echo "line $i"; done\necho "button · variant=ghost · hover · mui · root · color: css rgb(1, 1, 1) vs mui rgb(2, 2, 2)" 1>&2\nexit 3\n',
    );
    chmodSync(script, 0o755);
    const diag = new Diagnostics();
    const status = runRendered(
      root,
      configWith({ cwd: 'sb', command: './fail.sh' }),
      diag,
    );
    expect(status).toBe('fail');
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E087']);
    expect(diag.errors[0].message).toContain('exited with 3');
    expect(diag.errors[0].message).toContain('line 5');
    expect(diag.errors[0].message).toContain('vs mui rgb(2, 2, 2)');
    expect(diag.errors[0].location).toEqual({ file: 'ds.config.json', line: 1, column: 1 });
  });

  it('fails with DS-E087 when the cwd does not exist', () => {
    const diag = new Diagnostics();
    expect(
      runRendered(makeRoot({}), configWith({ cwd: 'nope', command: 'true' }), diag),
    ).toBe('fail');
    expect(diag.errors[0].message).toContain('does not exist');
  });
});
```

- [ ] **Step 6: Implement `runRendered`**

Create `src/verify/rendered.ts`:

```ts
import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DsConfig } from '../config.js';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { StepStatus } from './index.js';

const AT: SourceLocation = { file: 'ds.config.json', line: 1, column: 1 };
/** Lines of combined output kept in the DS-E087 message. */
const TAIL_LINES = 60;
const TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Runs the configured rendered-parity command (a Vitest browser run over the
 * generated compare stories) in its configured directory. Its output is
 * captured; on failure the last lines travel in the diagnostic so a CI log
 * shows the differing properties next to the code.
 */
export function runRendered(
  rootDir: string,
  config: DsConfig,
  diag: Diagnostics,
): StepStatus {
  if (!config.rendered) {
    diag.add(
      'DS-W005',
      'rendered: no `rendered` entry in ds.config.json; the browser comparison did not run',
      AT,
    );
    return 'skipped';
  }
  const cwd = resolve(rootDir, config.rendered.cwd);
  if (!existsSync(cwd) || !statSync(cwd).isDirectory()) {
    diag.add(
      'DS-E087',
      `rendered: cwd "${config.rendered.cwd}" (${cwd}) does not exist`,
      AT,
    );
    return 'fail';
  }
  const result = spawnSync(config.rendered.command, {
    cwd,
    shell: true,
    encoding: 'utf8',
    timeout: TIMEOUT_MS,
    env: { ...process.env, CI: process.env.CI ?? '1', FORCE_COLOR: '0' },
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status === 0) {
    return 'pass';
  }
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`
    .split('\n')
    .filter((line) => line.trim() !== '')
    .slice(-TAIL_LINES)
    .join('\n');
  const why =
    result.error !== undefined
      ? `could not run: ${result.error.message}`
      : result.signal
        ? `was killed by ${result.signal}`
        : `exited with ${result.status}`;
  diag.add(
    'DS-E087',
    `rendered: "${config.rendered.command}" in ${config.rendered.cwd} ${why}\n${output}`,
    AT,
  );
  return 'fail';
}
```

(`CI=1` makes Vitest run once and exit instead of watching; `FORCE_COLOR=0` keeps the captured tail free of escape codes.)

- [ ] **Step 7: Wire the step into `verify` and the CLI**

`src/verify/index.ts`:

```ts
export type VerifyStep = 'lint' | 'drift' | 'roundtrip' | 'coverage' | 'rendered';

export interface VerifyOptions extends GenerateOptions {
  /** Run the configured rendered-parity command after the Node steps pass. */
  rendered?: boolean;
}
```

`verify(rootDir, options: VerifyOptions = {})`; initialise `steps` with `rendered: 'skipped'`; in the round-trip loop skip auxiliary plugins:

```ts
  for (const { plugin, ctx, catalog, files } of outputs) {
    if (plugin.auxiliary) {
      continue;
    }
```

and at the end, before the return (after the coverage file is written):

```ts
  if (options.rendered) {
    const nodeStepsPassed =
      steps.drift === 'pass' &&
      steps.roundtrip === 'pass' &&
      steps.coverage === 'pass';
    steps.rendered = nodeStepsPassed
      ? runRendered(rootDir, config, diag)
      : 'skipped';
  }
```

Update the doc comment: "With `rendered`, the configured browser comparison runs last, only when drift, round-trip, and coverage passed; it is `skipped` otherwise, and `skipped` with `DS-W005` when `ds.config.json` has no `rendered` entry." `runRendered` imports `StepStatus` from this file; keep the import type-only on both sides to avoid a runtime cycle.

`src/cli.ts` `verify`: add `.option('--rendered', 'also run the configured rendered-parity command (browser comparison of the compare stories)', false)` and pass `rendered: opts.rendered`; update the description to "…; with --rendered, also the browser comparison".

`test/verify.test.ts`: every `expect(result.steps).toEqual({ … })` gains `rendered: 'skipped'`. Add:

```ts
  it('runs the rendered step only on request and only after the Node steps pass', () => {
    const root = ready();
    const passing = verify(root, { rendered: true });
    // the fixture config has no `rendered` entry, so the step is skipped with a warning
    expect(passing.steps.rendered).toBe('skipped');
    expect(passing.diagnostics.warnings.map((w) => w.code)).toContain('DS-W005');
    expect(passing.diagnostics.errors).toEqual([]);

    const noFlag = verify(root);
    expect(noFlag.steps.rendered).toBe('skipped');
    expect(noFlag.diagnostics.items).toEqual([]);

    writeFileSync(join(root, 'out', 'tailwind', 'stray.css'), 'x');
    const drifted = verify(root, { rendered: true });
    expect(drifted.steps.drift).toBe('fail');
    expect(drifted.steps.rendered).toBe('skipped');
    expect(drifted.diagnostics.warnings.map((w) => w.code)).not.toContain('DS-W005');
  });
```

`test/cli.test.ts`: in the existing end-to-end verify JSON test, the `steps` object gains `rendered: 'skipped'`; add a case `verify --rendered --json` on a twRoot → exit 0, `steps.rendered === 'skipped'`, one `DS-W005` in `diagnostics`.

`src/index.ts`: export `runRendered` and the type `VerifyOptions`.

- [ ] **Step 8: Gates**

`cd packages/ds-compiler && npx vitest run && npx tsc --noEmit && npx eslint && npx prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore`. Root `npm run build && npm run verify` unchanged output. `git status --short` shows only compiler files and `docs/design-system/errors.md`.

---

## Task 2: The `stories` plugin

**Files:**
- Create: `packages/ds-compiler/src/targets/stories/spec.ts`
- Create: `packages/ds-compiler/src/targets/stories/render.ts`
- Create: `packages/ds-compiler/src/targets/stories/generate.ts`
- Create: `packages/ds-compiler/src/targets/stories/index.ts`
- Modify: `packages/ds-compiler/src/targets/index.ts`, `src/index.ts`
- Modify: `packages/ds-compiler/test/tailwind-fixture.ts` (config gains `stories` with `options.muiPackage` and an `out/stories` outDir)
- Test: new `test/stories-spec.test.ts`, `test/stories-generate.test.ts`; updated `test/verify.test.ts`, `test/cli.test.ts`, `test/mui-roundtrip.test.ts` (`targetIds()` now `['mui', 'stories', 'tailwind']`), `test/targets-hints.test.ts` if it lists registered plugins

Context: the generated stories import the hand-written harness (Task 3) from `../../harness` (styles) and `../../harness` (foundations); the harness's exported names and types used below are fixed here and Task 3 implements them exactly: `CompareGrid`, `TokenGrid`, `parityPlay`, `tokenParityPlay`, `type CompareSpec`, `type CompareRow`, `type TokenSpec`, `type StoriesConfig`. Generated files are TypeScript React (`.tsx`) for component and foundations stories, `.ts` for `config.ts`.

- [ ] **Step 1: Fixture config**

`test/tailwind-fixture.ts` `TW_CONFIG` targets gain `stories: { outDir: 'out/stories', options: { muiPackage: '@fx/styles-mui' } }`. Every test that asserts the full list of written files in `generate` (`verify.test.ts`, `cli.test.ts`) gains the stories files (see Step 5 for the exact list). `test/mui-roundtrip.test.ts`'s `targetIds()` assertion becomes `['mui', 'stories', 'tailwind']`.

- [ ] **Step 2: Failing spec tests**

Create `test/stories-spec.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { buildMuiModel } from '../src/targets/mui/model.js';
import { buildStoriesModel } from '../src/targets/stories/spec.js';
import { BTN_FILES, FX_CATALOG } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function model(extra: Record<string, string> = {}, catalog = FX_CATALOG) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const ctx = twContext(root, config);
  const mui = buildMuiModel(ir, catalog, ctx, new Diagnostics())!;
  const diag = new Diagnostics();
  const stories = buildStoriesModel(ir, mui, config.targets.stories?.options ?? {}, diag);
  return { ir, stories, diag };
}

describe('buildStoriesModel', () => {
  it('derives the config: prefix, mode attribute, categories, parity properties', () => {
    const { stories, diag } = model();
    expect(diag.items).toEqual([]);
    expect(stories!.config).toEqual({
      prefix: 'fx',
      name: 'Fictional',
      modes: ['light', 'dark'],
      defaultMode: 'light',
      mode: { kind: 'attribute', name: 'data-fx-theme' },
      tokenCategories: ['color', 'font-family', 'shadow', 'space'],
      parityProperties: expect.arrayContaining(['background-color', 'min-width', 'text-transform', 'transition-duration']),
      muiPackage: '@fx/styles-mui',
      muiThemeFactory: 'createFxTheme',
    });
    expect(stories!.config.parityProperties).toEqual([...stories!.config.parityProperties].sort());
  });

  it('describes an own component: css and mui cells, label slot, attribute states', () => {
    const { stories } = model();
    const chip = stories!.components.find((c) => c.name === 'chip')!;
    expect(chip).toEqual({
      name: 'chip',
      displayName: 'Chip',
      exportName: 'Chip',
      rootElement: 'button',
      axes: [{ name: 'tone', values: ['quiet', 'loud'], default: 'quiet' }],
      states: [
        { name: 'hover', kind: 'hover' },
        { name: 'disabled', kind: 'attribute', attributes: { disabled: '' }, muiProp: 'disabled' },
      ],
      slots: [{ name: 'icon', element: 'span', content: 'icon' }],
      label: 'Chip',
      labelSlot: null,
      labelElement: 'span',
      tailwind: true,
      mui: {
        rootClass: 'FxChip-root',
        slotClasses: { icon: 'FxChip-icon' },
        axisProps: { tone: 'tone' },
        slotProps: { icon: 'icon' },
        children: 'children',
      },
    });
  });

  it('describes a mapped component with MUI slot classes and props, and an aria state', () => {
    const { stories } = model(BTN_FILES);
    const btn = stories!.components.find((c) => c.name === 'btn')!;
    expect(btn.mui).toEqual({
      rootClass: 'MuiButton-root',
      slotClasses: { icon: 'MuiButton-startIcon' },
      axisProps: { tone: 'tone' },
      slotProps: { icon: 'icon' },
      children: 'children',
    });
    expect(btn.states).toEqual([
      { name: 'hover', kind: 'hover' },
      { name: 'disabled', kind: 'attribute', attributes: { disabled: '' }, muiProp: 'disabled' },
    ]);
  });

  it('omits cells for excluded targets and uses aria-disabled on a div root', () => {
    const { stories } = model();
    const tag = stories!.components.find((c) => c.name === 'tag')!;
    expect(tag.tailwind).toBe(true);
    expect(tag.mui).not.toBeNull();
    expect(tag.states).toEqual([
      { name: 'disabled', kind: 'attribute', attributes: { 'aria-disabled': 'true' }, muiProp: 'disabled' },
    ]);
    const pill = stories!.components.find((c) => c.name === 'pill')!;
    expect(pill.tailwind).toBe(false);
    expect(pill.mui).toBeNull();
  });

  it('lists tokens per category with the three variable names', () => {
    const { stories } = model();
    expect(stories!.tokens.color.map((t) => t.id)).toEqual(['color.neutral.900', 'color.text.default']);
    expect(stories!.tokens.color[1]).toEqual({
      id: 'color.text.default',
      path: ['text', 'default'],
      cssVar: '--fx-color-text-default',
      tailwindVar: '--color-fx-text-default',
      muiVar: '--fx-palette-tokens-text-default',
      modeInvariant: false,
    });
    expect(stories!.tokens.space[0].tailwindVar).toBe('--spacing-fx-2');
    expect(stories!.tokens.space[0].muiVar).toBe('--fx-tokens-space-2');
  });

  it('reports DS-E084 without a muiPackage option when a component is mapped for mui, and for a mode selector the browser cannot toggle', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const mui = buildMuiModel(ir, FX_CATALOG, twContext(root, config), new Diagnostics())!;
    const diag = new Diagnostics();
    expect(buildStoriesModel(ir, mui, {}, diag)).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E084']);
    expect(diag.errors[0].message).toContain('targets.stories.options.muiPackage');
  });
});
```

(Modes other than attribute or class form are already `DS-E084` for MUI, so the second half of the last test needs no separate root; keep the title accurate or drop the clause.)

- [ ] **Step 3: Implement `spec.ts`**

```ts
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
  muiPackage: string;
  muiThemeFactory: string;
}

export interface SpecAxis {
  name: string;
  values: string[];
  default: string;
}

export type SpecState =
  | { name: string; kind: 'hover' | 'focus-visible' | 'active' }
  | { name: string; kind: 'attribute'; attributes: Record<string, string>; muiProp: string };

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
  // Every other state is DS-E085 for MUI already; this branch is reached
  // only for ARIA states.
  return {
    name: state,
    kind: 'attribute',
    attributes: { [aria![0]]: 'true' },
    muiProp: propNameFor(state),
  };
}

function componentSpec(component: ComponentIR, mui: MuiModel): ComponentSpec {
  const rootElement = component.slots.root?.element ?? 'div';
  const nonRoot = component.slotOrder.filter((s) => s !== 'root');
  const labelSlot = nonRoot.includes('label') ? 'label' : null;
  const label = component.preview.label ?? component.displayName;
  const muiMeta = mui.components[component.name];
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
  const tokenCategories = (Object.keys(tokens) as TokenCategory[]).sort(codeUnitCompare);
  return {
    config: {
      prefix: ir.meta.prefix,
      name: ir.meta.name,
      modes: [...ir.meta.modes],
      defaultMode: ir.meta.defaultMode,
      mode,
      tokenCategories,
      parityProperties: Object.keys(PROPERTY_TABLE).sort(codeUnitCompare),
      muiPackage: muiPackage ?? '',
      muiThemeFactory: themeFactoryName(mui),
    },
    components: names.map((n) => componentSpec(ir.components[n], mui)),
    tokens: Object.fromEntries(tokenCategories.map((c) => [c, tokens[c]!])),
  };
}
```

`ComponentIR.preview` is `Record<string, string>`; `isMappedForTailwind` exists in `src/targets/tailwind/hints.ts` (check the name; adapt).

- [ ] **Step 4: Failing generate tests**

Create `test/stories-generate.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { storiesPlugin } from '../src/targets/stories/index.js';
import { BTN_FILES, FX_CATALOG, catalogFile } from './mui-mapped-fixture.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function generated(extra: Record<string, string> = {}, catalog = FX_CATALOG) {
  const root = twRoot(extra);
  const { ir, config } = twBuild(root);
  const ctx = { ...twContext(root, config), outDir: `${root}/out/stories` };
  const diag = new Diagnostics();
  const files = storiesPlugin.generate(ir, catalog, ctx, diag);
  return { files, byPath: Object.fromEntries(files.map((f) => [f.path, f.contents])), diag };
}

const HEADER =
  /^\/\/ Generated by @bwp-web\/ds-compiler 0\.0\.0-test for target stories from design\.ir\.json \(source hash [0-9a-f]+\)\. Do not edit; run bwp-ds generate\.\n/;

describe('stories plugin', () => {
  it('is auxiliary and registered', () => {
    expect(storiesPlugin.id).toBe('stories');
    expect(storiesPlugin.auxiliary).toBe(true);
    expect(storiesPlugin.coverage({} as never)).toEqual([]);
    expect(storiesPlugin.reparse([], {} as never, null, {} as never, new Diagnostics())).toBeNull();
  });

  it('emits config, one story per component, one per token category, each with a header', () => {
    const { files, byPath, diag } = generated();
    expect(diag.errors).toEqual([]);
    expect(files.map((f) => f.path)).toEqual([
      'config.ts',
      'styles/chip.stories.tsx',
      'styles/pill.stories.tsx',
      'styles/tag.stories.tsx',
      'foundations/color.stories.tsx',
      'foundations/font-family.stories.tsx',
      'foundations/shadow.stories.tsx',
      'foundations/space.stories.tsx',
    ]);
    for (const [path, text] of Object.entries(byPath)) {
      expect(text, path).toMatch(HEADER);
      expect(text.endsWith('\n'), path).toBe(true);
    }
  });

  it('renders config.ts as a typed constant', () => {
    const { byPath } = generated();
    const text = byPath['config.ts'];
    expect(text).toContain("import type { StoriesConfig } from '../harness';");
    expect(text).toContain('export const storiesConfig: StoriesConfig = {');
    expect(text).toContain("  prefix: 'fx',");
    expect(text).toContain("  mode: {\n    kind: 'attribute',\n    name: 'data-fx-theme',\n  },");
    expect(text).toContain("    'background-color',");
    expect(text).toContain("  muiThemeFactory: 'createFxTheme',");
  });

  it('renders an own-component story with a CompareSpec, the MUI render function, and parityPlay', () => {
    const { byPath } = generated();
    const text = byPath['styles/chip.stories.tsx'];
    expect(text).toContain("import type { Meta, StoryObj } from '@storybook/react-vite';");
    expect(text).toContain("import { Chip, createFxTheme } from '@fx/styles-mui';");
    expect(text).toContain("import { CompareGrid, parityPlay, type CompareRow, type CompareSpec } from '../../harness';");
    expect(text).toContain("import { storiesConfig } from '../config';");
    expect(text).toContain("  title: 'Styles/Chip',");
    expect(text).toContain("  name: 'chip',");
    expect(text).toContain("  rootElement: 'button',");
    expect(text).toContain("    { name: 'hover', kind: 'hover' },");
    expect(text).toContain("    { name: 'disabled', kind: 'attribute', attributes: { disabled: '' }, muiProp: 'disabled' },");
    expect(text).toContain("  slots: [{ name: 'icon', element: 'span', content: 'icon' }],");
    expect(text).toContain("  label: 'Chip',");
    expect(text).toContain('  labelSlot: null,');
    expect(text).toContain("  labelElement: 'span',");
    expect(text).toContain('  tailwind: true,');
    expect(text).toContain("    rootClass: 'FxChip-root',");
    expect(text).toContain("    slotClasses: { icon: 'FxChip-icon' },");
    expect(text).toContain('    theme: createFxTheme(),');
    expect(text).toContain(
      [
        '    render: (row: CompareRow) => (',
        "      <Chip tone={row.axes.tone as 'quiet' | 'loud'} disabled={row.state === 'disabled'} icon=\"icon\">",
        '        Chip',
        '      </Chip>',
        '    ),',
      ].join('\n'),
    );
    expect(text).toContain('export const Compare: StoryObj = {');
    expect(text).toContain('  render: (_args, context) => <CompareGrid spec={spec} config={storiesConfig} targets={context.globals.dsTargets} />,');
    expect(text).toContain('  play: (context) => parityPlay(context, spec, storiesConfig),');
  });

  it('renders a mapped component with MUI props and a CSS-only component without a mui cell', () => {
    const { byPath } = generated(BTN_FILES);
    const btn = byPath['styles/btn.stories.tsx'];
    expect(btn).toContain("import { Btn, createFxTheme } from '@fx/styles-mui';");
    expect(btn).toContain("    rootClass: 'MuiButton-root',");
    expect(btn).toContain("    slotClasses: { icon: 'MuiButton-startIcon' },");
    expect(btn).toContain("      <Btn tone={row.axes.tone as 'quiet' | 'loud'} disabled={row.state === 'disabled'} icon=\"icon\">");
    const pill = byPath['styles/pill.stories.tsx'];
    expect(pill).not.toContain('@fx/styles-mui');
    expect(pill).toContain('  tailwind: false,');
    expect(pill).toContain('  mui: null,');
    expect(pill).toContain("import { CompareGrid, parityPlay, type CompareSpec } from '../../harness';");
  });

  it('renders a foundations story with the token list and tokenParityPlay', () => {
    const { byPath } = generated();
    const text = byPath['foundations/color.stories.tsx'];
    expect(text).toContain("import { TokenGrid, tokenParityPlay, type TokenSpec } from '../../harness';");
    expect(text).toContain("  title: 'Foundations/Color',");
    expect(text).toContain("export const tokens: TokenSpec[] = [");
    expect(text).toContain(
      [
        '  {',
        "    id: 'color.text.default',",
        "    path: ['text', 'default'],",
        "    cssVar: '--fx-color-text-default',",
        "    tailwindVar: '--color-fx-text-default',",
        "    muiVar: '--fx-palette-tokens-text-default',",
        '    modeInvariant: false,',
        '  },',
      ].join('\n'),
    );
    expect(text).toContain('  render: () => <TokenGrid category="color" tokens={tokens} config={storiesConfig} />,');
    expect(text).toContain("  play: (context) => tokenParityPlay(context, tokens, 'color', storiesConfig),");
    expect(byPath['foundations/font-family.stories.tsx']).toContain("  title: 'Foundations/Font Family',");
  });

  it('is deterministic and independent of catalog key order', () => {
    const a = generated();
    const shuffled = JSON.parse(JSON.stringify(FX_CATALOG, Object.keys(FX_CATALOG).reverse()));
    const b = generated({}, { ...FX_CATALOG, ...shuffled });
    expect(a.files).toEqual(b.files);
  });

  it('reports the MUI side once and emits nothing when the MUI model cannot be built', () => {
    const { files, diag } = generated({ 'ds.config.json': twConfigWith({ modes: ['light', 'sepia'], defaultMode: 'light' }) }, null);
    expect(files).toEqual([]);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E084']);
    expect(diag.errors[0].message).toContain('stories: the mui model could not be built');
  });
});
```

`twConfigWith(overrides)` is a small helper to add to `tailwind-fixture.ts`: `JSON.stringify({ ...JSON.parse(TW_CONFIG), ...overrides }, null, 2)`. The `deterministic` test's shuffled object is a stand-in: keep it if `JSON.parse(text, reviver)` with a key array is awkward, else construct the reversed-key catalog by hand.

- [ ] **Step 5: Renderers and plugin**

`src/targets/stories/render.ts`:

```ts
import { codeUnitCompare } from '../../sources.js';
import { quoteTs, renderTsLiteral } from '../mui/render-ts.js';
import type { ComponentSpec, StoriesConfig, StoriesModel, TokenSpec } from './spec.js';

export function storiesHeader(generated: string): string {
  return `// ${generated}`;
}

/** `font-family` to `Font Family`. */
export function categoryTitle(category: string): string {
  return category
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function renderStoriesConfig(generated: string, config: StoriesConfig): string {
  return [
    storiesHeader(generated),
    '',
    "import type { StoriesConfig } from '../harness';",
    '',
    `export const storiesConfig: StoriesConfig = ${renderTsLiteral(config)};`,
    '',
  ].join('\n');
}

function union(values: readonly string[]): string {
  return values.map(quoteTs).join(' | ');
}

/** The `<Export …>` JSX for the MUI cell of one row. */
function muiRenderJsx(spec: ComponentSpec): string[] {
  const mui = spec.mui!;
  const attrs: string[] = [];
  for (const axis of spec.axes) {
    attrs.push(`${mui.axisProps[axis.name]}={row.axes.${axis.name} as ${union(axis.values)}}`);
  }
  for (const state of spec.states) {
    if (state.kind === 'attribute') {
      attrs.push(`${state.muiProp}={row.state === ${quoteTs(state.name)}}`);
    }
  }
  for (const slot of spec.slots) {
    attrs.push(`${mui.slotProps[slot.name]}=${JSON.stringify(slot.content)}`);
  }
  const open = `<${spec.exportName}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (mui.children === null) {
    return [`    render: (row: CompareRow) => ${open} />,`];
  }
  if (mui.children !== 'children') {
    attrs.push(`${mui.children}=${JSON.stringify(spec.label)}`);
    return [`    render: (row: CompareRow) => <${spec.exportName} ${attrs.join(' ')} />,`];
  }
  return [
    '    render: (row: CompareRow) => (',
    `      ${open}>`,
    `        ${spec.label}`,
    `      </${spec.exportName}>`,
    '    ),',
  ];
}

export function renderComponentStory(
  generated: string,
  spec: ComponentSpec,
  config: StoriesConfig,
): string {
  const lines: string[] = [
    storiesHeader(generated),
    '',
    "import type { Meta, StoryObj } from '@storybook/react-vite';",
  ];
  if (spec.mui) {
    lines.push(`import { ${spec.exportName}, ${config.muiThemeFactory} } from ${quoteTs(config.muiPackage)};`);
    lines.push("import { CompareGrid, parityPlay, type CompareRow, type CompareSpec } from '../../harness';");
  } else {
    lines.push("import { CompareGrid, parityPlay, type CompareSpec } from '../../harness';");
  }
  lines.push("import { storiesConfig } from '../config';", '');
  lines.push('const spec: CompareSpec = {');
  lines.push(`  name: ${quoteTs(spec.name)},`);
  lines.push(`  displayName: ${quoteTs(spec.displayName)},`);
  lines.push(`  rootElement: ${quoteTs(spec.rootElement)},`);
  lines.push(`  axes: ${renderTsLiteral(spec.axes, 1)},`);
  lines.push('  states: [');
  for (const s of spec.states) {
    lines.push(
      s.kind === 'attribute'
        ? `    { name: ${quoteTs(s.name)}, kind: 'attribute', attributes: ${inlineRecord(s.attributes)}, muiProp: ${quoteTs(s.muiProp)} },`
        : `    { name: ${quoteTs(s.name)}, kind: ${quoteTs(s.kind)} },`,
    );
  }
  lines.push('  ],');
  lines.push(
    `  slots: [${spec.slots.map((s) => `{ name: ${quoteTs(s.name)}, element: ${quoteTs(s.element)}, content: ${quoteTs(s.content)} }`).join(', ')}],`,
  );
  lines.push(`  label: ${quoteTs(spec.label)},`);
  lines.push(`  labelSlot: ${spec.labelSlot === null ? 'null' : quoteTs(spec.labelSlot)},`);
  lines.push(`  labelElement: ${quoteTs(spec.labelElement)},`);
  lines.push(`  tailwind: ${spec.tailwind},`);
  if (spec.mui) {
    lines.push('  mui: {');
    lines.push(`    rootClass: ${quoteTs(spec.mui.rootClass)},`);
    lines.push(`    slotClasses: ${inlineRecord(spec.mui.slotClasses)},`);
    lines.push(`    theme: ${config.muiThemeFactory}(),`);
    lines.push(...muiRenderJsx(spec));
    lines.push('  },');
  } else {
    lines.push('  mui: null,');
  }
  lines.push('};', '');
  lines.push('const meta: Meta = {');
  lines.push(`  title: ${quoteTs(`Styles/${spec.displayName}`)},`);
  lines.push("  parameters: { layout: 'padded' },");
  lines.push('};', '', 'export default meta;', '');
  lines.push('export const Compare: StoryObj = {');
  lines.push('  render: (_args, context) => <CompareGrid spec={spec} config={storiesConfig} targets={context.globals.dsTargets} />,');
  lines.push('  play: (context) => parityPlay(context, spec, storiesConfig),');
  lines.push('};', '');
  return lines.join('\n');
}

function inlineRecord(record: Record<string, string>): string {
  const entries = Object.keys(record).sort(codeUnitCompare);
  if (entries.length === 0) {
    return '{}';
  }
  return `{ ${entries.map((k) => `${/^[A-Za-z_$][\w$]*$/.test(k) ? k : quoteTs(k)}: ${quoteTs(record[k])}`).join(', ')} }`;
}

export function renderFoundationsStory(
  generated: string,
  category: string,
  tokens: TokenSpec[],
): string {
  return [
    storiesHeader(generated),
    '',
    "import type { Meta, StoryObj } from '@storybook/react-vite';",
    "import { TokenGrid, tokenParityPlay, type TokenSpec } from '../../harness';",
    "import { storiesConfig } from '../config';",
    '',
    `export const tokens: TokenSpec[] = ${renderTsLiteral(tokens)};`,
    '',
    'const meta: Meta = {',
    `  title: ${quoteTs(`Foundations/${categoryTitle(category)}`)},`,
    "  parameters: { layout: 'padded' },",
    '};',
    '',
    'export default meta;',
    '',
    'export const Compare: StoryObj = {',
    `  render: () => <TokenGrid category=${JSON.stringify(category)} tokens={tokens} config={storiesConfig} />,`,
    `  play: (context) => tokenParityPlay(context, tokens, ${quoteTs(category)}, storiesConfig),`,
    '};',
    '',
  ].join('\n');
}

export function renderAll(generated: string, model: StoriesModel): { path: string; contents: string }[] {
  return [
    { path: 'config.ts', contents: renderStoriesConfig(generated, model.config) },
    ...model.components.map((c) => ({
      path: `styles/${c.name}.stories.tsx`,
      contents: renderComponentStory(generated, c, model.config),
    })),
    ...model.config.tokenCategories.map((category) => ({
      path: `foundations/${category}.stories.tsx`,
      contents: renderFoundationsStory(generated, category, model.tokens[category]!),
    })),
  ];
}
```

`renderTsLiteral(value, indent)` is the MUI renderer's multi-line literal; `inlineRecord` keeps small maps on one line so the test strings above hold. Foundations files are `.tsx` and render `<TokenGrid … />` as JSX, so the grid's hooks run inside a component render.

`src/targets/stories/generate.ts`:

```ts
import { Diagnostics } from '../../errors.js';
import type { DesignIR } from '../../ir/types.js';
import type { MuiCatalog } from '../mui/catalog.js';
import { buildMuiModel } from '../mui/model.js';
import type { GeneratedFile, PluginContext } from '../plugin.js';
import { renderAll } from './render.js';
import { buildStoriesModel } from './spec.js';

export function storiesHeaderText(ir: DesignIR, ctx: PluginContext): string {
  return `Generated by @bwp-web/ds-compiler ${ctx.compilerVersion} for target stories from design.ir.json (source hash ${ir.meta.sourceHash}). Do not edit; run bwp-ds generate.`;
}

/**
 * The MUI model is rebuilt here for export names, prop names, slot classes,
 * and the theme factory. Its own diagnostics are the MUI plugin's job; a
 * failure is summarised once so nothing is reported twice.
 */
export function generateStories(
  ir: DesignIR,
  catalog: MuiCatalog | null,
  ctx: PluginContext,
  diag: Diagnostics,
): GeneratedFile[] {
  const muiDiag = new Diagnostics();
  const mui = buildMuiModel(ir, catalog, ctx, muiDiag);
  if (!mui) {
    diag.add(
      'DS-E084',
      'stories: the mui model could not be built; see the mui diagnostics',
      { file: 'ds.config.json', line: 1, column: 1 },
    );
    return [];
  }
  const options = ctx.config.targets.stories?.options ?? {};
  const model = buildStoriesModel(ir, mui, options, diag);
  return model ? renderAll(storiesHeaderText(ir, ctx), model) : [];
}
```

`src/targets/stories/index.ts`:

```ts
import { Diagnostics } from '../../errors.js';
import { loadMuiCatalog, type MuiCatalog } from '../mui/catalog.js';
import type { TargetPlugin } from '../plugin.js';
import { generateStories } from './generate.js';

export const STORIES_ID = 'stories';

/**
 * Compare stories for the Storybook. Auxiliary: generated and drift-checked
 * like a target, nothing to round-trip, no coverage. The MUI catalog is
 * loaded with a scratch diagnostics object because the MUI plugin already
 * reports its problems; only a hard failure is summarised here.
 */
export const storiesPlugin: TargetPlugin<MuiCatalog> = {
  id: STORIES_ID,
  auxiliary: true,
  loadCatalog: (ctx, diag) => {
    const scratch = new Diagnostics();
    const catalog = loadMuiCatalog(ctx, scratch);
    if (scratch.hasErrors()) {
      diag.add(
        'DS-E086',
        'stories: the mui defaults catalog could not be loaded; see the mui diagnostics',
        { file: 'catalogs/mui.json', line: 1, column: 1 },
      );
      return null;
    }
    return catalog;
  },
  generate: generateStories,
  reparse: () => null,
  coverage: () => [],
  isMapped: () => false,
  ignoredProperties: () => new Set(),
};
```

Note `loadMuiCatalog` checks the installed `@mui/material` from `ctx.outDir`; for the stories target that is the storybook package, which depends on `@mui/material` too (Task 3), so the version check passes there as well.

`src/targets/index.ts`: add `stories: storiesPlugin`. `src/index.ts`: export `storiesPlugin`, `STORIES_ID`, `buildStoriesModel`, `modeSwitchFor`, the renderers, and the types `StoriesModel`, `StoriesConfig`, `ComponentSpec`, `SpecAxis`, `SpecState`, `SpecSlot`, `MuiCell`, `TokenSpec`, `ModeSwitch`.

- [ ] **Step 6: Update the tests that enumerate generated files**

`verify.test.ts` and `cli.test.ts` file lists gain, in plugin order (`mui`, `stories`, `tailwind`): `stories/config.ts`, `stories/styles/chip.stories.tsx`, `stories/styles/pill.stories.tsx`, `stories/styles/tag.stories.tsx`, `stories/foundations/color.stories.tsx`, `stories/foundations/font-family.stories.tsx`, `stories/foundations/shadow.stories.tsx`, `stories/foundations/space.stories.tsx` (adapt the relative prefixes to how each test slices paths). The `generate` end-to-end test that counts files (`11 files` in earlier plans) becomes the new total.

- [ ] **Step 7: Gates**

Compiler suite, `tsc`, `eslint`, `prettier --check`. Root `npm run build`; `npm run verify` still passes because the repo config has no `stories` target yet (Task 5 adds it): the plugin is registered, `outDirFor` defaults to `../styles-stories/src/generated`, which does not exist, and drift reports… **check this**: with no config entry, `generateOutputs` runs the stories plugin and `checkDrift` would report every generated file as missing under `packages/styles-stories/src/generated`. To keep the repo green between Task 2 and Task 5, `generate` and `verify` must skip a registered plugin whose target has no `ds.config.json` entry **only when the plugin is auxiliary** (targets keep their default `outDir` behaviour from Plan 2). Implement in `generateOutputs`: `if (plugin.auxiliary && !config.targets[plugin.id]) continue;`, and in `generate()` resolve `targetIds()` the same way; document on `auxiliary`: "runs only when `ds.config.json` has a `targets.<id>` entry". Add a `verify.test.ts` case: a root without `targets.stories` writes no stories files and verify passes. Then re-run root `npm run verify`: pass, no new files.

---

## Task 3: Storybook harness: spec, markup, comparison, cells, driver

**Files:**
- Modify: `packages/storybook/package.json`, `tsconfig.json`, `vitest.config.ts`, `.storybook/main.ts`, `src/global.d.ts`
- Create: `packages/storybook/postcss.config.js`, `eslint.config.js`, `.prettierignore`
- Create: `packages/storybook/src/harness/{spec.ts,markup.ts,compare.ts,mode.ts,styles.ts,tailwind.css,ShadowCell.tsx,driver.ts,commands.ts,index.ts}`
- Test: `packages/storybook/src/harness/{spec,markup,compare,mode}.test.ts`

- [ ] **Step 1: Package wiring**

`packages/storybook/package.json` becomes:

```json
{
  "name": "@bwp-web/storybook",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "storybook dev -p 6006",
    "build": "storybook build -o dist",
    "generate": "bwp-ds generate --root ../styles-css --target stories",
    "test": "vitest run --project unit",
    "test:rendered": "vitest run --project storybook",
    "typecheck": "tsc --noEmit",
    "lint": "node scripts/lint-story-titles.mjs && eslint",
    "clean": "rm -rf dist node_modules .turbo",
    "format": "prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore"
  },
  "dependencies": {
    "@bwp-web/assets": "*",
    "@bwp-web/canvas": "*",
    "@bwp-web/components": "*",
    "@bwp-web/styles-css": "*",
    "@bwp-web/styles-mui": "*",
    "@bwp-web/styles-tailwind": "*",
    "@emotion/cache": "^11.14.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@mui/material": "^9.4.0",
    "react": "^19.2.5",
    "react-dom": "^19.2.5"
  },
  "devDependencies": {
    "@bwp-web/ds-compiler": "*",
    "@bwp-web/eslint-config": "*",
    "@storybook/addon-a11y": "^10.3.5",
    "@storybook/addon-docs": "^10.3.5",
    "@storybook/addon-vitest": "^10.3.5",
    "@storybook/react": "^10.3.5",
    "@storybook/react-vite": "^10.3.5",
    "@tailwindcss/postcss": "^4.3.3",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.5.2",
    "@vitest/browser-playwright": "^4.1.4",
    "@vitest/coverage-v8": "^4.1.4",
    "eslint": "^9.39.2",
    "happy-dom": "^20.0.0",
    "playwright": "^1.58.2",
    "postcss": "^8.5.28",
    "prettier": "^3.8.3",
    "storybook": "^10.3.5",
    "tailwindcss": "^4.3.3",
    "typescript": "^5.9.2",
    "vite": "^6.4.2",
    "vitest": "^4.1.4"
  }
}
```

Run `npm install` from the root (the lockfile follows; `happy-dom` is for the one DOM unit test, use the current major). `tsconfig.json`: remove `rootDir`; `include: ["src", ".storybook", "vitest.shims.d.ts", "vitest.config.ts"]`. `src/global.d.ts` becomes `/// <reference types="vite/client" />` plus `export {};` so `?inline` imports are typed. `postcss.config.js`:

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

`eslint.config.js` as in `packages/styles-mui` (base plus react) with a leading `{ ignores: ['dist/**', 'src/generated/**'] }` entry. `.prettierignore`: `src/generated`, `dist`, `.turbo`. `.storybook/main.ts` `stories` gains `'../src/**/*.mdx'` as its first entry.

`vitest.config.ts`:

```ts
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { parityCommands } from './src/harness/commands';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        plugins: [
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
            commands: parityCommands,
          },
        },
      },
    ],
  },
});
```

- [ ] **Step 2: Failing unit tests for the pure modules**

`src/harness/spec.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cellId, rowKey, rowsFor, type CompareSpec } from './spec';

export const SPEC: CompareSpec = {
  name: 'chip',
  displayName: 'Chip',
  rootElement: 'button',
  axes: [
    { name: 'tone', values: ['quiet', 'loud'], default: 'quiet' },
    { name: 'size', values: ['sm', 'md'], default: 'md' },
  ],
  states: [
    { name: 'hover', kind: 'hover' },
    { name: 'disabled', kind: 'attribute', attributes: { disabled: '' }, muiProp: 'disabled' },
  ],
  slots: [{ name: 'icon', element: 'span', content: 'plus' }],
  label: 'Chip',
  labelSlot: null,
  labelElement: 'span',
  tailwind: true,
  mui: null,
};

describe('rowsFor', () => {
  it('enumerates every axis permutation times base and each state, last axis fastest', () => {
    const rows = rowsFor(SPEC);
    expect(rows).toHaveLength(4 * 3);
    expect(rows.slice(0, 3)).toEqual([
      { axes: { tone: 'quiet', size: 'sm' }, state: null },
      { axes: { tone: 'quiet', size: 'sm' }, state: 'hover' },
      { axes: { tone: 'quiet', size: 'sm' }, state: 'disabled' },
    ]);
    expect(rows[11]).toEqual({ axes: { tone: 'loud', size: 'md' }, state: 'disabled' });
    expect(rowsFor({ ...SPEC, axes: [], states: [] })).toEqual([{ axes: {}, state: null }]);
  });

  it('keys rows and cells stably', () => {
    expect(rowKey({ axes: { tone: 'loud', size: 'sm' }, state: 'hover' })).toBe('tone=loud size=sm hover');
    expect(rowKey({ axes: { tone: 'loud', size: 'sm' }, state: null })).toBe('tone=loud size=sm base');
    expect(rowKey({ axes: {}, state: null })).toBe('base');
    expect(cellId('mui', { axes: { tone: 'loud' }, state: null })).toBe('mui|tone=loud base');
  });
});
```

`src/harness/markup.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { cssMarkup } from './markup';
import { SPEC } from './spec.test';

describe('cssMarkup', () => {
  it('renders the root with axis attributes, slots in order, and the label as text', () => {
    expect(cssMarkup(SPEC, 'fx', { axes: { tone: 'loud', size: 'sm' }, state: null })).toBe(
      '<button class="fx-chip" data-tone="loud" data-size="sm"><span class="fx-chip__icon">plus</span>Chip</button>',
    );
  });

  it('sets attribute-state attributes on the root and escapes text', () => {
    const spec = { ...SPEC, label: 'A <b> & "c"', slots: [] };
    expect(cssMarkup(spec, 'fx', { axes: { tone: 'quiet', size: 'md' }, state: 'disabled' })).toBe(
      '<button class="fx-chip" data-tone="quiet" data-size="md" disabled="">A &lt;b&gt; &amp; &quot;c&quot;</button>',
    );
    expect(cssMarkup(spec, 'fx', { axes: { tone: 'quiet', size: 'md' }, state: 'hover' })).not.toContain('hover');
  });

  it('puts the label inside the label slot when there is one', () => {
    const spec = { ...SPEC, labelSlot: 'label', labelElement: 'em' };
    expect(cssMarkup(spec, 'fx', { axes: { tone: 'quiet', size: 'md' }, state: null })).toBe(
      '<button class="fx-chip" data-tone="quiet" data-size="md"><span class="fx-chip__icon">plus</span><em class="fx-chip__label">Chip</em></button>',
    );
  });

  it('uses aria attributes verbatim', () => {
    const spec = {
      ...SPEC,
      rootElement: 'div',
      states: [{ name: 'disabled', kind: 'attribute' as const, attributes: { 'aria-disabled': 'true' }, muiProp: 'disabled' }],
    };
    expect(cssMarkup(spec, 'fx', { axes: { tone: 'quiet', size: 'md' }, state: 'disabled' })).toContain(
      '<div class="fx-chip" data-tone="quiet" data-size="md" aria-disabled="true">',
    );
  });
});
```

`src/harness/compare.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { compareValues, formatDifferences, type Difference } from './compare';

describe('compareValues', () => {
  it('accepts numbers within half a pixel and rejects beyond', () => {
    expect(compareValues('14px', '14.4px')).toBe(true);
    expect(compareValues('14px', '14.6px')).toBe(false);
    expect(compareValues('0px 0px 0px 2px rgb(63, 140, 255)', '0px 0px 0px 2.3px rgb(63, 140, 255)')).toBe(true);
    expect(compareValues('rgb(63, 140, 255)', 'rgb(63, 141, 255)')).toBe(false);
  });

  it('compares everything else exactly', () => {
    expect(compareValues('inline-flex', 'inline-flex')).toBe(true);
    expect(compareValues('inline-flex', 'flex')).toBe(false);
    expect(compareValues('"Open Sans", Arial, sans-serif', '"Open Sans", Arial, sans-serif')).toBe(true);
    expect(compareValues('none', 'rgb(0, 0, 0) 0px 0px 0px 0px')).toBe(false);
    expect(compareValues('1e3', '1000')).toBe(true);
  });

  it('formats differences one per line, sorted, with a count', () => {
    const diffs: Difference[] = [
      { component: 'chip', row: 'tone=loud hover', mode: 'light', target: 'mui', element: 'root', property: 'color', expected: 'rgb(1, 1, 1)', actual: 'rgb(2, 2, 2)' },
      { component: 'chip', row: 'base', mode: 'dark', target: 'tailwind', element: 'icon', property: 'width', expected: '20px', actual: '18px' },
    ];
    expect(formatDifferences(diffs)).toBe(
      [
        '2 rendered differences against the css cell:',
        'chip | base | dark | tailwind | icon | width: css 20px vs tailwind 18px',
        'chip | tone=loud hover | light | mui | root | color: css rgb(1, 1, 1) vs mui rgb(2, 2, 2)',
      ].join('\n'),
    );
  });
});
```

`src/harness/mode.test.ts`:

```ts
// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { applyMode, clearMode } from './mode';

describe('applyMode', () => {
  it('sets and clears a data attribute', () => {
    const mode = { kind: 'attribute' as const, name: 'data-fx-theme' };
    applyMode(mode, 'dark');
    expect(document.documentElement.getAttribute('data-fx-theme')).toBe('dark');
    clearMode(mode, ['light', 'dark']);
    expect(document.documentElement.hasAttribute('data-fx-theme')).toBe(false);
  });

  it('sets and clears a class built from the template', () => {
    const mode = { kind: 'class' as const, prefix: 'theme-', suffix: '' };
    applyMode(mode, 'dark');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(true);
    applyMode(mode, 'light');
    expect(document.documentElement.classList.contains('theme-dark')).toBe(false);
    expect(document.documentElement.classList.contains('theme-light')).toBe(true);
    clearMode(mode, ['light', 'dark']);
    expect(document.documentElement.className).toBe('');
  });
});
```

Run `npx vitest run --project unit` in `packages/storybook`: every file fails to import.

- [ ] **Step 3: Implement the pure modules**

`src/harness/spec.ts`:

```ts
import type { Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

export type TargetId = 'css' | 'tailwind' | 'mui';

export type ModeSwitch =
  | { kind: 'attribute'; name: string }
  | { kind: 'class'; prefix: string; suffix: string };

/** Mirrors the compiler's `StoriesConfig`; generated into `src/generated/config.ts`. */
export interface StoriesConfig {
  prefix: string;
  name: string;
  modes: string[];
  defaultMode: string;
  mode: ModeSwitch;
  tokenCategories: string[];
  parityProperties: string[];
  muiPackage: string;
  muiThemeFactory: string;
}

export interface CompareAxis {
  name: string;
  values: string[];
  default: string;
}

export type CompareState =
  | { name: string; kind: 'hover' | 'focus-visible' | 'active' }
  | {
      name: string;
      kind: 'attribute';
      attributes: Record<string, string>;
      muiProp: string;
    };

export interface CompareSlot {
  name: string;
  element: string;
  content: string;
}

export interface CompareRow {
  axes: Record<string, string>;
  /** A state name, or null for the base row. */
  state: string | null;
}

export interface MuiCellSpec {
  rootClass: string;
  slotClasses: Record<string, string>;
  theme: Theme;
  render: (row: CompareRow) => ReactNode;
}

export interface CompareSpec {
  name: string;
  displayName: string;
  rootElement: string;
  axes: CompareAxis[];
  states: CompareState[];
  /** Non-root slots in manifest order, the label slot excluded. */
  slots: CompareSlot[];
  label: string;
  labelSlot: string | null;
  labelElement: string;
  tailwind: boolean;
  mui: MuiCellSpec | null;
}

export interface TokenSpec {
  id: string;
  path: string[];
  cssVar: string;
  tailwindVar: string;
  muiVar: string;
  modeInvariant: boolean;
}

/** Every axis permutation (last axis fastest) times base and each state. */
export function rowsFor(spec: CompareSpec): CompareRow[] {
  let axes: Record<string, string>[] = [{}];
  for (const axis of spec.axes) {
    axes = axes.flatMap((partial) =>
      axis.values.map((v) => ({ ...partial, [axis.name]: v })),
    );
  }
  return axes.flatMap((a) => [
    { axes: a, state: null },
    ...spec.states.map((s) => ({ axes: a, state: s.name })),
  ]);
}

/** `tone=loud size=sm hover`, `tone=loud size=sm base`, or `base`. */
export function rowKey(row: CompareRow): string {
  const axes = Object.entries(row.axes).map(([k, v]) => `${k}=${v}`);
  return [...axes, row.state ?? 'base'].join(' ');
}

export function cellId(target: TargetId, row: CompareRow): string {
  return `${target}|${rowKey(row)}`;
}

/** The columns a spec renders: css always, then the targets it is mapped for. */
export function targetsFor(spec: CompareSpec): TargetId[] {
  const out: TargetId[] = ['css'];
  if (spec.tailwind) {
    out.push('tailwind');
  }
  if (spec.mui) {
    out.push('mui');
  }
  return out;
}
```

`src/harness/markup.ts`:

```ts
import type { CompareRow, CompareSpec } from './spec';

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The raw HTML the CSS and Tailwind cells render for one row. */
export function cssMarkup(
  spec: CompareSpec,
  prefix: string,
  row: CompareRow,
): string {
  const root = `${prefix}-${spec.name}`;
  const attrs = [`class="${root}"`];
  for (const axis of spec.axes) {
    attrs.push(`data-${axis.name}="${escapeHtml(row.axes[axis.name])}"`);
  }
  const state = spec.states.find((s) => s.name === row.state);
  if (state && state.kind === 'attribute') {
    for (const [name, value] of Object.entries(state.attributes)) {
      attrs.push(`${name}="${escapeHtml(value)}"`);
    }
  }
  const slots = spec.slots
    .map(
      (s) =>
        `<${s.element} class="${root}__${s.name}">${escapeHtml(s.content)}</${s.element}>`,
    )
    .join('');
  const label = spec.labelSlot
    ? `<${spec.labelElement} class="${root}__${spec.labelSlot}">${escapeHtml(spec.label)}</${spec.labelElement}>`
    : escapeHtml(spec.label);
  return `<${spec.rootElement} ${attrs.join(' ')}>${slots}${label}</${spec.rootElement}>`;
}
```

`labelElement` mirrors the compiler's `ComponentSpec.labelElement` (Task 2): the label slot's element, `span` when there is no label slot.

`src/harness/compare.ts`:

```ts
export interface Difference {
  component: string;
  row: string;
  mode: string;
  target: string;
  element: string;
  property: string;
  expected: string;
  actual: string;
}

export const TOLERANCE = 0.5;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/gi;

function tokens(value: string): (string | number)[] {
  const out: (string | number)[] = [];
  let last = 0;
  for (const m of value.matchAll(NUMBER)) {
    const index = m.index ?? 0;
    if (index > last) {
      out.push(value.slice(last, index));
    }
    out.push(Number(m[0]));
    last = index + m[0].length;
  }
  if (last < value.length) {
    out.push(value.slice(last));
  }
  return out;
}

/** Numbers within TOLERANCE, everything else exact; token shapes must match. */
export function compareValues(expected: string, actual: string): boolean {
  if (expected === actual) {
    return true;
  }
  const a = tokens(expected);
  const b = tokens(actual);
  if (a.length !== b.length) {
    return false;
  }
  return a.every((t, i) => {
    const u = b[i];
    return typeof t === 'number' && typeof u === 'number'
      ? Math.abs(t - u) <= TOLERANCE
      : t === u;
  });
}

/** The listed properties of an element as computed values. */
export function readComputed(
  element: Element,
  properties: readonly string[],
): Record<string, string> {
  const style = getComputedStyle(element);
  return Object.fromEntries(
    properties.map((p) => [p, style.getPropertyValue(p)]),
  );
}

export interface PropertyDifference {
  property: string;
  expected: string;
  actual: string;
}

export function diffComputed(
  expected: Record<string, string>,
  actual: Record<string, string>,
  properties: readonly string[],
): PropertyDifference[] {
  return properties
    .filter((p) => !compareValues(expected[p] ?? '', actual[p] ?? ''))
    .map((p) => ({
      property: p,
      expected: expected[p] ?? '',
      actual: actual[p] ?? '',
    }));
}

function sortKey(d: Difference): string {
  return [d.component, d.row, d.mode, d.target, d.element, d.property].join(
    '|',
  );
}

/** One line per difference, sorted, headed by a count. */
export function formatDifferences(diffs: readonly Difference[]): string {
  const lines = [...diffs]
    .sort((x, y) => (sortKey(x) < sortKey(y) ? -1 : sortKey(x) > sortKey(y) ? 1 : 0))
    .map(
      (d) =>
        `${d.component} | ${d.row} | ${d.mode} | ${d.target} | ${d.element} | ${d.property}: css ${d.expected} vs ${d.target} ${d.actual}`,
    );
  const n = diffs.length;
  return [
    `${n} rendered difference${n === 1 ? '' : 's'} against the css cell:`,
    ...lines,
  ].join('\n');
}
```

`src/harness/mode.ts`:

```ts
import type { ModeSwitch } from './spec';

export function applyMode(mode: ModeSwitch, value: string): void {
  const root = document.documentElement;
  if (mode.kind === 'attribute') {
    root.setAttribute(mode.name, value);
    return;
  }
  for (const cls of [...root.classList]) {
    const inner = cls.length - mode.prefix.length - mode.suffix.length;
    if (
      inner > 0 &&
      cls.startsWith(mode.prefix) &&
      cls.endsWith(mode.suffix)
    ) {
      root.classList.remove(cls);
    }
  }
  root.classList.add(`${mode.prefix}${value}${mode.suffix}`);
}

export function clearMode(mode: ModeSwitch, modes: readonly string[]): void {
  const root = document.documentElement;
  if (mode.kind === 'attribute') {
    root.removeAttribute(mode.name);
    return;
  }
  for (const m of modes) {
    root.classList.remove(`${mode.prefix}${m}${mode.suffix}`);
  }
}

/** Resolves after the next animation frame, when a mode change has reached computed styles. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
```

Run the unit project: all four files pass.

- [ ] **Step 4: Stylesheets, the cell, the driver, the commands**

`src/harness/tailwind.css`:

```css
/* Compiled by @tailwindcss/postcss (postcss.config.js) when Vite imports it.
   Nothing imports `tailwindcss` itself: no preflight, no utilities, only the
   generated theme variables and component layer. */
@layer theme, base, components, utilities;
@import '@bwp-web/styles-tailwind';
```

`src/harness/styles.ts`:

```ts
import cssPackage from '@bwp-web/styles-css/dist/styles.css?inline';
import type { TargetId } from './spec';
import tailwindPackage from './tailwind.css?inline';

/** Kills transitions and animations inside a cell so computed values are final. */
export const FREEZE_CSS =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';

/** The stylesheet each non-MUI target contributes to a cell. MUI styles arrive through Emotion. */
export const TARGET_CSS: Record<Exclude<TargetId, 'mui'>, string> = {
  css: cssPackage,
  tailwind: tailwindPackage,
};

const MARK = 'data-ds-harness-styles';

/**
 * Token variables must be visible to every shadow root, and `:root` rules
 * only match in the document, so both stylesheets are appended to
 * `document.head` once. Their component rules match nothing there: the
 * harness's own markup carries no design-system classes.
 */
export function ensureDocumentStyles(): void {
  if (document.head.querySelector(`style[${MARK}]`)) {
    return;
  }
  for (const [target, css] of Object.entries(TARGET_CSS)) {
    const style = document.createElement('style');
    style.setAttribute(MARK, target);
    style.textContent = css;
    document.head.appendChild(style);
  }
}
```

`src/harness/ShadowCell.tsx`:

```tsx
import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { FREEZE_CSS } from './styles';

export interface ShadowCellProps {
  /** Unique within the story; becomes `data-parity-cell` and the sentinel's key. */
  id: string;
  /** Stylesheets placed in the shadow root before the content. */
  css?: readonly string[];
  /** Raw HTML content (CSS and Tailwind cells). */
  html?: string;
  /** React content rendered through a portal with its own Emotion cache (MUI cells). */
  children?: React.ReactNode;
  /** Selector, inside the cell, of the element interactions target. */
  rootSelector: string;
  /** Disable transitions and animations (default true). */
  freeze?: boolean;
}

interface Mount {
  container: HTMLElement;
  cache: EmotionCache;
}

const EMPTY: readonly string[] = [];

/**
 * One isolated cell: an open shadow root with the target's stylesheets and
 * either raw HTML or a React subtree. A hidden focusable sentinel precedes
 * the host so `Tab` from it lands on the cell's first focusable element with
 * `:focus-visible` matching. After mount the root element is marked with
 * `data-parity-root="<id>"` so Playwright can address it through the shadow
 * boundary.
 */
export function ShadowCell({
  id,
  css = EMPTY,
  html,
  children,
  rootSelector,
  freeze = true,
}: ShadowCellProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [mount, setMount] = React.useState<Mount | null>(null);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    root.replaceChildren();
    for (const text of [...(freeze ? [FREEZE_CSS] : []), ...css]) {
      const style = document.createElement('style');
      style.textContent = text;
      root.appendChild(style);
    }
    const container = document.createElement('div');
    if (html !== undefined) {
      container.innerHTML = html;
    }
    root.appendChild(container);
    const cache = createCache({
      key: `cell${id.replace(/[^a-z0-9]/gi, '').toLowerCase()}`,
      container: root as unknown as HTMLElement,
      prepend: true,
    });
    setMount({ container, cache });
  }, [id, html, freeze, css]);

  React.useEffect(() => {
    if (!mount) {
      return;
    }
    const mark = () => {
      const el = mount.container.querySelector(rootSelector);
      if (el) {
        el.setAttribute('data-parity-root', id);
      }
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(mount.container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mount, rootSelector, id]);

  return (
    <>
      <button
        type="button"
        data-parity-sentinel={id}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <div ref={hostRef} data-parity-cell={id} />
      {mount && children !== undefined
        ? createPortal(
            <CacheProvider value={mount.cache}>{children}</CacheProvider>,
            mount.container,
          )
        : null}
    </>
  );
}
```

`tabIndex={-1}` keeps the sentinel out of the tab order for people while still focusable programmatically; `Tab` from it moves to the next focusable element, the cell's root. Emotion cache keys must be lowercase alphanumerics, hence the sanitising. Callers pass a stable `css` array (a module constant), so the effect does not re-run every render.

`src/harness/commands.ts` (Node side, imported by `vitest.config.ts`):

```ts
import type { BrowserCommand } from 'vitest/node';

/**
 * Real pointer and keyboard interactions for the parity plays. Selectors are
 * resolved by Playwright, whose CSS engine pierces open shadow roots, so a
 * `[data-parity-root="..."]` attribute set inside a cell is enough.
 */
export const parityCommands = {
  parityHover: (async ({ iframe }, selector: string) => {
    await iframe.locator(selector).hover();
  }) as BrowserCommand<[selector: string]>,
  parityMouseDown: (async ({ iframe, page }, selector: string) => {
    await iframe.locator(selector).hover();
    await page.mouse.down();
  }) as BrowserCommand<[selector: string]>,
  parityMouseUp: (async ({ page }) => {
    await page.mouse.up();
    await page.mouse.move(0, 0);
  }) as BrowserCommand<[]>,
  parityFocusFrom: (async ({ iframe, page }, sentinelSelector: string) => {
    await iframe.locator(sentinelSelector).focus();
    await page.keyboard.press('Tab');
  }) as BrowserCommand<[sentinelSelector: string]>,
  parityBlur: (async ({ iframe }) => {
    await iframe.locator('body').evaluate((body) => {
      (body.ownerDocument.activeElement as HTMLElement | null)?.blur();
    });
  }) as BrowserCommand<[]>,
};
```

If `BrowserCommand` lives elsewhere in Vitest 4 (`@vitest/browser` exports it too), import it from where `tsc` finds it; the shape is `(context, ...args) => Promise<unknown>` with `context.iframe` (a Playwright `FrameLocator`) and `context.page`.

`src/harness/driver.ts` (browser side):

```ts
export interface Driver {
  hover(selector: string): Promise<void>;
  mouseDown(selector: string): Promise<void>;
  mouseUp(): Promise<void>;
  focusFrom(sentinelSelector: string): Promise<void>;
  blur(): Promise<void>;
}

declare module '@vitest/browser/context' {
  interface BrowserCommands {
    parityHover(selector: string): Promise<void>;
    parityMouseDown(selector: string): Promise<void>;
    parityMouseUp(): Promise<void>;
    parityFocusFrom(sentinelSelector: string): Promise<void>;
    parityBlur(): Promise<void>;
  }
}

/**
 * The Playwright-backed commands when running under Vitest browser mode, or
 * null in the Storybook UI, where only attribute-driven states can be
 * compared.
 */
export async function getDriver(): Promise<Driver | null> {
  // Vitest browser mode defines these globals in the page; the Storybook UI does not.
  if (
    !('__vitest_browser_runner__' in globalThis) &&
    !('__vitest_browser__' in globalThis)
  ) {
    return null;
  }
  // Resolvable at build time too (the package depends on @vitest/browser
  // through @vitest/browser-playwright), so Storybook bundles it as a lazy
  // chunk that is never executed outside Vitest.
  const { commands } = await import('@vitest/browser/context');
  return {
    hover: (s) => commands.parityHover(s),
    mouseDown: (s) => commands.parityMouseDown(s),
    mouseUp: () => commands.parityMouseUp(),
    focusFrom: (s) => commands.parityFocusFrom(s),
    blur: () => commands.parityBlur(),
  };
}
```

`src/harness/index.ts` exports everything public: the types from `spec`, `rowsFor`, `rowKey`, `cellId`, `targetsFor`, `cssMarkup`, `compareValues`, `formatDifferences`, `applyMode`, `clearMode`, `ShadowCell`, `ensureDocumentStyles`, `getDriver`; Task 4 adds `CompareGrid`, `TokenGrid`, `parityPlay`, `tokenParityPlay`.

- [ ] **Step 5: Gates**

`cd packages/storybook && npx vitest run --project unit && npx tsc --noEmit && npx eslint && npx prettier --check . --ignore-path ../../.gitignore --ignore-path .prettierignore`. `npm run build -w @bwp-web/storybook` still builds (Storybook warns about globs with no stories; fine).

---

## Task 4: Grids, play functions, globals, Introduction, title lint

**Files:**
- Create: `packages/storybook/src/harness/{CompareGrid.tsx,TokenGrid.tsx,parityPlay.ts,tokenParityPlay.ts,samples.ts}`
- Modify: `packages/storybook/src/harness/index.ts`
- Modify: `packages/storybook/.storybook/preview.tsx`
- Create: `packages/storybook/src/Introduction.mdx`
- Create: `packages/storybook/scripts/lint-story-titles.mjs`
- Create: `packages/storybook/src/harness/Harness.stories.tsx` (hand-written smoke story)
- Modify: `packages/styles-css/ds.config.json` (`targets.stories`; needed now so `preview.tsx` can import the generated config)
- Test: `src/harness/samples.test.ts`

- [ ] **Step 1: Generate the stories target for the first time**

Add to `packages/styles-css/ds.config.json` `targets`:

```json
    "stories": {
      "outDir": "../storybook/src/generated",
      "options": { "muiPackage": "@bwp-web/styles-mui" }
    }
```

Run `npm run ds -- generate --target stories` and `npm run verify` (pass). The generated files (`config.ts`, `styles/button.stories.tsx`, `styles/example.stories.tsx`, `foundations/*.stories.tsx`) are part of this batch and stay. They import the harness names Task 4 adds, so typecheck fails until Step 4 below; that is expected mid-task.

- [ ] **Step 2: The component grid**

`src/harness/CompareGrid.tsx`:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import { cssMarkup } from './markup';
import { ShadowCell } from './ShadowCell';
import {
  cellId,
  rowKey,
  rowsFor,
  targetsFor,
  type CompareSpec,
  type StoriesConfig,
  type TargetId,
} from './spec';
import { TARGET_CSS, ensureDocumentStyles } from './styles';

export type TargetsChoice = 'all' | TargetId;

export interface CompareGridProps {
  spec: CompareSpec;
  config: StoriesConfig;
  /** The `dsTargets` global: `all`, or one target shown next to the css reference. */
  targets?: TargetsChoice;
}

export function rootSelectorFor(
  spec: CompareSpec,
  config: StoriesConfig,
  target: TargetId,
): string {
  return target === 'mui' && spec.mui
    ? `.${spec.mui.rootClass}`
    : `.${config.prefix}-${spec.name}`;
}

const CSS_ONLY = [TARGET_CSS.css];
const TAILWIND_ONLY = [TARGET_CSS.tailwind];

/**
 * Columns are targets, rows are every axis permutation times base and each
 * state; every cell is a ShadowCell. The MUI `ThemeProvider` wraps the whole
 * table so MUI's theme variables are written at document level, where every
 * cell inherits them.
 */
export function CompareGrid({
  spec,
  config,
  targets = 'all',
}: CompareGridProps) {
  React.useEffect(() => ensureDocumentStyles(), []);
  const columns = targetsFor(spec).filter(
    (t) => targets === 'all' || t === 'css' || t === targets,
  );
  const rows = rowsFor(spec);
  const table = (
    <table className="ds-compare" data-parity-component={spec.name}>
      <thead>
        <tr>
          <th scope="col" data-parity-neutral={spec.name}>
            {spec.displayName}
          </th>
          {columns.map((t) => (
            <th key={t} scope="col">
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} data-parity-row={rowKey(row)}>
            <th scope="row">{rowKey(row)}</th>
            {columns.map((t) => (
              <td key={t}>
                {t === 'mui' && spec.mui ? (
                  <ShadowCell
                    id={cellId(t, row)}
                    rootSelector={rootSelectorFor(spec, config, t)}
                  >
                    {spec.mui.render(row)}
                  </ShadowCell>
                ) : (
                  <ShadowCell
                    id={cellId(t, row)}
                    css={t === 'css' ? CSS_ONLY : TAILWIND_ONLY}
                    html={cssMarkup(spec, config.prefix, row)}
                    rootSelector={rootSelectorFor(spec, config, t)}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return spec.mui ? (
    <ThemeProvider theme={spec.mui.theme}>{table}</ThemeProvider>
  ) : (
    table
  );
}
```

- [ ] **Step 3: `parityPlay`**

`src/harness/parityPlay.ts`:

```ts
import {
  diffComputed,
  formatDifferences,
  readComputed,
  type Difference,
} from './compare';
import { getDriver, type Driver } from './driver';
import { applyMode, clearMode, nextFrame } from './mode';
import {
  cellId,
  rowKey,
  rowsFor,
  targetsFor,
  type CompareRow,
  type CompareSpec,
  type CompareState,
  type StoriesConfig,
  type TargetId,
} from './spec';

export interface ParityOptions {
  /** Properties left out of the comparison; keep the reason in the story. */
  ignore?: readonly string[];
}

export interface PlayContext {
  canvasElement: HTMLElement;
}

interface CellHandle {
  root: Element;
  /** Slot name to element (null when the cell lacks it). */
  slots: Record<string, Element | null>;
  sentinel: string;
  rootSelector: string;
}

type Snapshot = Record<string, Record<string, string> | null>;

function slotNames(spec: CompareSpec): string[] {
  return [
    ...spec.slots.map((s) => s.name),
    ...(spec.labelSlot ? [spec.labelSlot] : []),
  ];
}

function cell(
  canvas: HTMLElement,
  spec: CompareSpec,
  config: StoriesConfig,
  target: TargetId,
  row: CompareRow,
): CellHandle {
  const id = cellId(target, row);
  const shadow = canvas.querySelector(`[data-parity-cell="${id}"]`)?.shadowRoot;
  if (!shadow) {
    throw new Error(`parity: cell ${id} did not mount`);
  }
  const rootClass =
    target === 'mui' && spec.mui
      ? spec.mui.rootClass
      : `${config.prefix}-${spec.name}`;
  const root = shadow.querySelector(`.${rootClass}`);
  if (!root) {
    throw new Error(`parity: cell ${id} has no element with class ${rootClass}`);
  }
  const slots = Object.fromEntries(
    slotNames(spec).map((slot) => [
      slot,
      shadow.querySelector(
        target === 'mui' && spec.mui
          ? `.${spec.mui.slotClasses[slot]}`
          : `.${config.prefix}-${spec.name}__${slot}`,
      ),
    ]),
  );
  return {
    root,
    slots,
    sentinel: `[data-parity-sentinel="${id}"]`,
    rootSelector: `[data-parity-root="${id}"]`,
  };
}

/** Root and slot computed values, keyed by element name (`root` or the slot). */
function snapshot(handle: CellHandle, properties: readonly string[]): Snapshot {
  const out: Snapshot = { root: readComputed(handle.root, properties) };
  for (const [slot, el] of Object.entries(handle.slots)) {
    out[slot] = el ? readComputed(el, properties) : null;
  }
  return out;
}

async function enter(driver: Driver, state: CompareState, handle: CellHandle): Promise<void> {
  if (state.kind === 'hover') {
    await driver.hover(handle.rootSelector);
  } else if (state.kind === 'active') {
    await driver.mouseDown(handle.rootSelector);
  } else if (state.kind === 'focus-visible') {
    await driver.focusFrom(handle.sentinel);
  }
}

async function leave(driver: Driver, state: CompareState, neutral: string): Promise<void> {
  if (state.kind === 'active') {
    await driver.mouseUp();
  }
  if (state.kind === 'focus-visible') {
    await driver.blur();
  }
  await driver.hover(neutral);
}

/** Only one element can be hovered, pressed, or focused at a time, so cells in an interaction state are measured in turn. */
async function snapshotInState(
  driver: Driver,
  state: CompareState,
  handle: CellHandle,
  properties: readonly string[],
  neutral: string,
): Promise<Snapshot> {
  await enter(driver, state, handle);
  await nextFrame();
  const snap = snapshot(handle, properties);
  await leave(driver, state, neutral);
  return snap;
}

function collect(
  spec: CompareSpec,
  row: CompareRow,
  mode: string,
  target: TargetId,
  reference: Snapshot,
  candidate: Snapshot,
  properties: readonly string[],
  out: Difference[],
): void {
  for (const element of Object.keys(reference)) {
    const a = reference[element];
    const b = candidate[element];
    const base = { component: spec.name, row: rowKey(row), mode, target, element };
    if (!a || !b) {
      out.push({ ...base, property: '(element)', expected: a ? 'present' : 'missing', actual: b ? 'present' : 'missing' });
      continue;
    }
    for (const d of diffComputed(a, b, properties)) {
      out.push({ ...base, ...d });
    }
  }
}

/**
 * The rendered comparison. For every configured mode, every row, and every
 * non-css cell: put the css cell and the candidate cell in the row's state
 * (interaction states need the Vitest browser driver and are skipped in the
 * Storybook UI), read the computed values of the listed properties on the
 * root and each slot, and record every difference. One aggregated error at
 * the end lists them all; the toolbar's default mode is restored.
 */
export async function parityPlay(
  context: PlayContext,
  spec: CompareSpec,
  config: StoriesConfig,
  options: ParityOptions = {},
): Promise<void> {
  const canvas = context.canvasElement;
  const driver = await getDriver();
  const ignore = new Set(options.ignore ?? []);
  const properties = config.parityProperties.filter((p) => !ignore.has(p));
  const neutral = `[data-parity-neutral="${spec.name}"]`;
  const candidates = targetsFor(spec).filter((t) => t !== 'css');
  const differences: Difference[] = [];
  let skipped = 0;
  await nextFrame();
  for (const mode of config.modes) {
    applyMode(config.mode, mode);
    await nextFrame();
    for (const row of rowsFor(spec)) {
      const state = spec.states.find((s) => s.name === row.state);
      const interactive = state !== undefined && state.kind !== 'attribute';
      if (interactive && !driver) {
        skipped += 1;
        continue;
      }
      const reference = cell(canvas, spec, config, 'css', row);
      for (const target of candidates) {
        const candidate = cell(canvas, spec, config, target, row);
        const [a, b] =
          interactive && driver && state
            ? [
                await snapshotInState(driver, state, reference, properties, neutral),
                await snapshotInState(driver, state, candidate, properties, neutral),
              ]
            : [snapshot(reference, properties), snapshot(candidate, properties)];
        collect(spec, row, mode, target, a, b, properties, differences);
      }
    }
  }
  clearMode(config.mode, config.modes);
  applyMode(config.mode, config.defaultMode);
  if (skipped > 0) {
    console.info(
      `parity: ${spec.name}: ${skipped} interaction rows skipped outside Vitest browser mode`,
    );
  }
  if (differences.length > 0) {
    throw new Error(formatDifferences(differences));
  }
}
```

- [ ] **Step 4: Foundations samples, grid, and play**

`src/harness/samples.ts`:

```ts
/** The property a token category is compared on, and the inline style of the sample that consumes the variable. */
export interface Sample {
  property: string;
  style: (variable: string) => string;
}

const BOX = 'display:block;width:48px;height:24px;';

export const SAMPLES: Record<string, Sample> = {
  color: { property: 'background-color', style: (v) => `${BOX}background-color:var(${v})` },
  space: { property: 'width', style: (v) => `display:block;height:8px;width:var(${v})` },
  size: { property: 'width', style: (v) => `display:block;height:8px;width:var(${v})` },
  radius: { property: 'border-top-left-radius', style: (v) => `${BOX}border-top-left-radius:var(${v})` },
  'border-width': { property: 'border-top-width', style: (v) => `${BOX}border-top-style:solid;border-top-width:var(${v})` },
  'font-family': { property: 'font-family', style: (v) => `font-family:var(${v})` },
  'font-size': { property: 'font-size', style: (v) => `font-size:var(${v})` },
  'font-weight': { property: 'font-weight', style: (v) => `font-weight:var(${v})` },
  'line-height': { property: 'line-height', style: (v) => `font-size:16px;line-height:var(${v})` },
  'letter-spacing': { property: 'letter-spacing', style: (v) => `font-size:16px;letter-spacing:var(${v})` },
  shadow: { property: 'box-shadow', style: (v) => `${BOX}box-shadow:var(${v})` },
  opacity: { property: 'opacity', style: (v) => `${BOX}opacity:var(${v})` },
  'z-index': { property: 'z-index', style: (v) => `${BOX}position:relative;z-index:var(${v})` },
  duration: { property: 'transition-duration', style: (v) => `${BOX}transition-property:opacity;transition-duration:var(${v})` },
  easing: { property: 'transition-timing-function', style: (v) => `${BOX}transition-property:opacity;transition-timing-function:var(${v})` },
};

/** Categories whose sample reads a transition property, so the cell must not freeze transitions. */
export const UNFROZEN: ReadonlySet<string> = new Set(['duration', 'easing']);
```

`src/harness/samples.test.ts`: the 15 compiler categories (`color, space, radius, font-family, font-size, font-weight, line-height, letter-spacing, shadow, border-width, duration, easing, opacity, z-index, size`) each have a sample whose `style('--x')` contains `var(--x)` and whose `property` appears in that style text; `UNFROZEN` is a subset of the keys.

`src/harness/TokenGrid.tsx`:

```tsx
import * as React from 'react';
import { ShadowCell } from './ShadowCell';
import { SAMPLES, UNFROZEN } from './samples';
import type { StoriesConfig, TargetId, TokenSpec } from './spec';
import { TARGET_CSS, ensureDocumentStyles } from './styles';

export interface TokenGridProps {
  category: string;
  tokens: TokenSpec[];
  config: StoriesConfig;
}

export function tokenVar(token: TokenSpec, target: TargetId): string {
  return target === 'css'
    ? token.cssVar
    : target === 'tailwind'
      ? token.tailwindVar
      : token.muiVar;
}

export function tokenCellId(target: TargetId, token: TokenSpec): string {
  return `${target}|${token.id}`;
}

export const TOKEN_TARGETS: readonly TargetId[] = ['css', 'tailwind', 'mui'];

/** Escapes a token variable for use inside a double-quoted HTML attribute (variable names contain no quotes; kept for safety). */
function sampleMarkup(category: string, variable: string): string {
  const style = SAMPLES[category].style(variable).replace(/"/g, '&quot;');
  return `<span class="sample" style="${style}">Ag</span>`;
}

const CSS_ONLY = [TARGET_CSS.css];
const TAILWIND_ONLY = [TARGET_CSS.tailwind];
const NONE: readonly string[] = [];

/**
 * One row per token, one cell per target; each cell renders the category's
 * sample element consuming that target's variable. MUI variables come from
 * the `ThemeProvider` the preview decorator wraps around every story.
 */
export function TokenGrid({ category, tokens, config }: TokenGridProps) {
  React.useEffect(() => ensureDocumentStyles(), []);
  if (!SAMPLES[category]) {
    return <p>No sample for category {category}.</p>;
  }
  void config;
  return (
    <table className="ds-compare" data-parity-category={category}>
      <thead>
        <tr>
          <th scope="col">{category}</th>
          {TOKEN_TARGETS.map((t) => (
            <th key={t} scope="col">
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.id}>
            <th scope="row">
              <code>{token.id}</code>
              <br />
              <small>
                {token.cssVar} / {token.tailwindVar} / {token.muiVar}
              </small>
            </th>
            {TOKEN_TARGETS.map((t) => (
              <td key={t}>
                <ShadowCell
                  id={tokenCellId(t, token)}
                  css={t === 'css' ? CSS_ONLY : t === 'tailwind' ? TAILWIND_ONLY : NONE}
                  html={sampleMarkup(category, tokenVar(token, t))}
                  rootSelector=".sample"
                  freeze={!UNFROZEN.has(category)}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

(Drop the `void config` line and the `config` prop if nothing in the grid needs it after the decorator provides the theme; the generated call site passes `config`, so keep the prop in the type and use it for the category title lookup `config.name` in the header if that reads better than the bare category.)

`src/harness/tokenParityPlay.ts`:

```ts
import { compareValues, formatDifferences, type Difference } from './compare';
import { applyMode, clearMode, nextFrame } from './mode';
import { SAMPLES } from './samples';
import type { StoriesConfig, TokenSpec } from './spec';
import { TOKEN_TARGETS, tokenCellId } from './TokenGrid';
import type { PlayContext } from './parityPlay';

function sampleOf(canvas: HTMLElement, id: string): Element {
  const el = canvas.querySelector(`[data-parity-cell="${id}"]`)?.shadowRoot?.querySelector('.sample');
  if (!el) {
    throw new Error(`parity: token cell ${id} did not mount`);
  }
  return el;
}

/** Compares the category's sample property between the css cell and every other cell, in every mode. */
export async function tokenParityPlay(
  context: PlayContext,
  tokens: readonly TokenSpec[],
  category: string,
  config: StoriesConfig,
): Promise<void> {
  const canvas = context.canvasElement;
  const property = SAMPLES[category]?.property;
  if (!property) {
    throw new Error(`parity: no sample for category ${category}`);
  }
  const differences: Difference[] = [];
  await nextFrame();
  for (const mode of config.modes) {
    applyMode(config.mode, mode);
    await nextFrame();
    for (const token of tokens) {
      const expected = getComputedStyle(sampleOf(canvas, tokenCellId('css', token))).getPropertyValue(property);
      for (const target of TOKEN_TARGETS.filter((t) => t !== 'css')) {
        const actual = getComputedStyle(sampleOf(canvas, tokenCellId(target, token))).getPropertyValue(property);
        if (!compareValues(expected, actual)) {
          differences.push({ component: category, row: token.id, mode, target, element: 'sample', property, expected, actual });
        }
      }
    }
  }
  clearMode(config.mode, config.modes);
  applyMode(config.mode, config.defaultMode);
  if (differences.length > 0) {
    throw new Error(formatDifferences(differences));
  }
}
```

`src/harness/index.ts` adds `CompareGrid`, `TokenGrid`, `parityPlay`, `tokenParityPlay`, `SAMPLES`, `UNFROZEN`, `type ParityOptions`, `type PlayContext`, `type TargetsChoice`.

- [ ] **Step 5: Globals, decorator, Introduction, title lint, smoke story**

`.storybook/preview.tsx`:

```tsx
import { ThemeProvider } from '@mui/material/styles';
import type { Preview } from '@storybook/react-vite';
import * as React from 'react';
import { createBwpTheme } from '@bwp-web/styles-mui';
import { storiesConfig } from '../src/generated/config';
import { applyMode } from '../src/harness/mode';

const theme = createBwpTheme();

const preview: Preview = {
  tags: ['autodocs'],
  globalTypes: {
    dsMode: {
      description: 'Design-system color mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: storiesConfig.modes,
        dynamicTitle: true,
      },
    },
    dsTargets: {
      description: 'Which target columns the compare grids show',
      toolbar: {
        title: 'Targets',
        icon: 'component',
        items: ['all', 'css', 'tailwind', 'mui'],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { dsMode: storiesConfig.defaultMode, dsTargets: 'all' },
  decorators: [
    (Story, context) => {
      const mode = context.globals.dsMode as string;
      React.useEffect(() => {
        applyMode(storiesConfig.mode, mode);
      }, [mode]);
      return (
        <ThemeProvider theme={theme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/i },
    },
    layout: 'padded',
    a11y: { test: 'todo' },
  },
};

export default preview;
```

`preview.tsx` names the MUI package and imports the generated config: it is a hand-written file of this repository's Storybook, so naming this design system's packages is allowed there. The compiler stays agnostic.

`src/Introduction.mdx`:

```mdx
import { Meta } from '@storybook/addon-docs/blocks';
import { storiesConfig } from './generated/config';

<Meta title="Introduction" />

# {storiesConfig.name}

One design system, written once as CSS in `packages/styles-css`, compiled into
a Tailwind layer, an MUI theme with React components, and (later) a Flutter
package. This Storybook shows every token and component rendered by each web
target side by side.

## Reading a compare grid

Columns are targets; the **css** column is the reference. Rows are every axis
combination times every state. Each cell is an isolated shadow root holding
only that target's stylesheet, so nothing bleeds between columns. Use the
**Mode** toolbar to switch color modes and **Targets** to show one column next
to the reference.

Every compare story has a play function. Under `npm run test:rendered` (and
`bwp-ds verify --rendered` in CI) it drives real hover, focus, and press
interactions and compares the computed styles of the root and every slot
between the css cell and each other cell, in every mode. In this UI the
interaction rows are skipped; the base and attribute states still compare.

## Where things live

- Authoring: `docs/design-system/authoring-guide.md`
- Targets: `docs/design-system/targets/`
- Verification: `docs/design-system/verification.md`
- This Storybook: `docs/design-system/storybook.md`
```

`scripts/lint-story-titles.mjs`:

```js
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const SECTIONS = ['Introduction', 'Foundations', 'Styles', 'Components', 'Canvas', 'Assets'];
const here = fileURLToPath(new URL('..', import.meta.url));
const roots = ['src', '../components/src', '../canvas/src'].map((r) => join(here, r));
const TITLE = /title[:=]\s*(['"`])([^'"`]+)\1/;

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name !== 'node_modules') {
        walk(path, out);
      }
    } else if (/\.(stories\.(ts|tsx|js|jsx)|mdx)$/.test(name)) {
      out.push(path);
    }
  }
  return out;
}

const problems = [];
for (const file of roots.flatMap((r) => walk(r, []))) {
  const text = readFileSync(file, 'utf8');
  const match = TITLE.exec(text);
  if (!match) {
    if (file.endsWith('.mdx') && !/<Meta\b/.test(text)) {
      continue;
    }
    problems.push(`${relative(here, file)}: no title found`);
    continue;
  }
  const section = match[2].split('/')[0];
  if (!SECTIONS.includes(section)) {
    problems.push(`${relative(here, file)}: title "${match[2]}" must start with one of ${SECTIONS.join(', ')}`);
  }
}
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('story titles ok');
```

(`title[:=]` matches both `title: 'Styles/X'` in TS and `title="Introduction"` in MDX.)

`src/harness/Harness.stories.tsx` (hand-written smoke story, section `Styles/Harness`): a `CompareSpec` with `name: 'example'` shaped like the starter `example` component but `mui: null`, so the grid compares the CSS cell with the Tailwind cell only. Its play (`parityPlay`) must pass under `test:rendered`, proving cells, driver, modes, and the diff path without depending on the MUI package. Title `Styles/Harness`.

- [ ] **Step 6: Gates**

In `packages/storybook`: `npm run test` (unit), `npm run typecheck`, `npm run lint`, `npm run format`; once locally `npx playwright install chromium`; `npm run test:rendered` → the smoke story, `Styles/Button`, `Styles/Example`, and every `Foundations/*` play pass. Report the run time and the number of stories. `npm run build -w @bwp-web/storybook` builds the static Storybook. Root `npm run verify` passes (the stories target is configured and its output committed in this batch).

---

## Task 5: Wiring, CI, Turbo, docs

**Files:**
- Modify: `packages/styles-css/ds.config.json` (`rendered`)
- Modify: `turbo.json`, `.github/workflows/main.yml`, root `.prettierignore`, root `package.json`
- Create: `docs/design-system/storybook.md`
- Modify: `docs/design-system/verification.md`, `docs/design-system/errors.md` (rows exist from Task 1; check wording), `docs/design-system/authoring-guide.md`, `AGENTS.md`, root `README.md`, `packages/storybook/README.md` (create if absent)

- [ ] **Step 1: Config, Turbo, root scripts**

`packages/styles-css/ds.config.json` gains, next to `coverageFile`:

```json
  "rendered": { "cwd": "../storybook", "command": "npm run test:rendered" }
```

`turbo.json` gains:

```json
    "@bwp-web/storybook#test:rendered": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "@bwp-web/storybook#typecheck": {
      "dependsOn": ["^build", "^build:types"]
    },
    "@bwp-web/storybook#build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
```

(`typecheck` needs the styles packages' `dist` types; `^build:types` alone does not build `styles-css`'s CSS, which `?inline` imports resolve at Vite time but `tsc` does not need. Keep `^build` for symmetry with `test:rendered`.) Root `package.json` scripts gain `"verify:rendered": "bwp-ds verify --root packages/styles-css --rendered"` and `"storybook:test": "turbo run test:rendered --filter=@bwp-web/storybook"`. Root `.prettierignore` gains `packages/storybook/src/generated/`.

- [ ] **Step 2: CI**

`.github/workflows/main.yml`: after "Build" and the catalog capture, before "Verify design system", add

```yaml
      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium
```

replace the verify step's command with `npm run verify -- --rendered`, and add `packages/storybook/src/generated` to the "Check generated files are up to date" diff paths. Playwright's browser download is about 150 MB; cache it:

```yaml
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
```

placed before the install step (the install is a no-op when cached; `--with-deps` still installs system libraries, which is quick).

- [ ] **Step 3: Docs**

`docs/design-system/storybook.md` (new): sections. "What it is" (one Storybook, the six sections and which are generated). "Compare grids" (columns, rows, cells as shadow roots, why token variables are document-level, transitions frozen, the `Mode` and `Targets` toolbars). "Rendered parity" (what `parityPlay` compares: every property in the compiler's property table on the root and each slot, in every mode; interaction states through Playwright; tolerances: numbers within 0.5, everything else exact; how to read a failure line `component | row | mode | target | element | property: css X vs target Y`; how to add an `ignore` with a reason). "Foundations" (one property per category, table of category to sample property). "Running it" (`npx playwright install chromium` once; `npm run storybook` for the UI; `npm run storybook:test` or `npm run verify:rendered`; what CI runs; run time expectations). "Regenerating" (`npm run ds -- generate --target stories`; never edit `src/generated`). "Adding hand-written stories" (title prefixes, the lint, colocated stories in `components`/`canvas`). "Limits" (Storybook UI skips interaction rows; Flutter cells come with Plan 5; fonts fall back identically in all cells because they share one document).

`docs/design-system/verification.md`: the table gains rows for `bwp-ds verify --rendered` (needs Node 22, Chromium, `packages/storybook/node_modules`) and `npm run storybook:test`; the CI rows mention Chromium and the `--rendered` run; the "Planned steps" table loses the `--rendered` row (keep the Flutter row). `docs/design-system/errors.md`: confirm the `DS-E087` and `DS-W005` rows from Task 1 read well next to their neighbours. `docs/design-system/authoring-guide.md`: the `preview` row of the manifest table now says the values are what the compare stories render (label text and slot text) and that `preview.label` is the button text. `AGENTS.md`: invariant 2 lists `packages/storybook/src/generated/`; the commands table gains `npm run ds -- generate --target stories`, `npm run verify:rendered`, `npm run storybook:test`; the package map row for `storybook` becomes "Generated compare stories, the compare harness, Introduction; `npm run storybook` to browse"; a short recipe "Check rendered parity locally" (install Chromium once, run `npm run verify:rendered`, read the failure lines, fix the plugin or harness, never the generated stories). Root `README.md` "Storybook" section: what is there now, how to run it, the `Mode`/`Targets` toolbars. `packages/storybook/README.md`: purpose, scripts, the harness's public exports for hand-written compare stories (`CompareGrid`, `parityPlay`, `CompareSpec`).

- [ ] **Step 4: Gates**

Root: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`, `npm run test`, `npm run verify:rendered` (all five steps `pass`), `npm run ds -- generate` again leaves `git status --short` unchanged. Report the rendered run's duration and story count.

---

## Task 6: Final verification

**Files:** none new.

- [ ] **Step 1: Clean install and full pipeline**

```bash
npm run clean
npm ci
npx playwright install chromium
npm run build
npm run lint
npm run typecheck
npm run format
npm run test
npm run verify:rendered
git diff --exit-code -- packages/styles-css/design.ir.json packages/styles-css/src/index.css packages/styles-css/catalogs packages/styles-tailwind/src/generated packages/styles-mui/src/generated packages/storybook/src/generated docs/design-system/coverage.md && echo "generated files current"
```

Expected: every command exits 0; `verify:rendered` prints five `pass`; the last line prints `generated files current`. Record the Turbo task count, test counts (compiler, styles-mui, storybook unit), the number of stories the rendered run executed and its duration.

- [ ] **Step 2: The rendered step catches a real divergence**

Copy `packages/styles-css/src/components/button/button.css` to the scratchpad. Change the base rule's `text-transform: none;` to `text-transform: uppercase;` and run `npm run ds -- build && npm run ds -- generate && npm run verify:rendered ; echo "exit $?"`. Expected: exit 0 (all targets follow the source; parity holds for a real change), which proves the pipeline is not accidentally comparing constants. Restore the file, `build`, `generate`, `verify:rendered` → pass, `git status --short` clean.

Then break one target only: copy `packages/styles-mui/src/generated/theme.ts` to the scratchpad and edit the repo copy's `MuiButton` `styleOverrides.root` `textTransform: 'none'` to `'uppercase'`; run `npm run verify:rendered ; echo "exit $?"`. Expected: `drift: fail` with `DS-E080` on `theme.ts` and `rendered: skipped` (the Node steps guard the browser run). Now run the browser step directly, `npm run storybook:test ; echo "exit $?"` → exit 1, and the output contains lines such as `button | variant=filled size=md base | light | mui | root | text-transform: css none vs mui uppercase` for every row and both modes. Restore `theme.ts` with `cp`, confirm `git status --short` is clean and `npm run verify:rendered` passes.

- [ ] **Step 3: Foundations catch a token divergence**

Copy `packages/styles-tailwind/src/generated/theme.css` to the scratchpad; change `--spacing-bwp-2: 8px;` to `9px`; `npm run storybook:test ; echo "exit $?"` → exit 1 with `space | space.2 | light | tailwind | sample | width: css 8px vs tailwind 9px` (and the dark line). Restore, confirm clean.

- [ ] **Step 4: The Storybook UI path**

`npm run build -w @bwp-web/storybook` builds; open `packages/storybook/dist/index.html` is not scriptable here, so instead run `npx storybook dev -p 6007 --ci --no-open` in the background for 20 seconds and `curl -s http://localhost:6007/index.json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const j=JSON.parse(s);const t=Object.values(j.entries).map(e=>e.title);console.log([...new Set(t)].sort().join("\n"))})'` → titles: `Foundations/…` (one per category), `Introduction`, `Styles/Button`, `Styles/Example`, `Styles/Harness`. Stop the dev server.

- [ ] **Step 5: Final report**

List every created, modified, and deleted path grouped by package; test counts; the five `verify` steps; the rendered run's story count and duration; confirm no git write command and no `rm -rf` (outside `npm run clean`) was run. Note for Plan 5: the grid's `TargetId` union and `targetsFor` are where a `flutter` column (an iframe cell with route parameters) plugs in; `parityPlay` needs a cell handle that reads computed styles from an iframe of the Flutter web build, which is the property-level comparison the spec asks for. Note for Plan 6: `storybook build` output can be published as static docs; `auto-tag` unaffected.

---

## Follow-ups recorded while writing this plan

- **Interaction rows are skipped in the Storybook UI.** `storybook/test`'s `userEvent` does not produce real `:hover`; a future Storybook addon exposing Playwright to plays would let the UI run the full comparison.
- **Fonts.** All cells share one document, so a missing web font falls back identically everywhere and parity holds even when the font is wrong. Rendered parity is not a font-loading test.
- **`width`/`height` are compared** (they are in the property table). Identical content and fonts make them equal today; if a target ever legitimately differs in intrinsic size (an extra wrapper with padding), the story's `ignore` option is the documented escape hatch, with the reason next to it.
- **One property per token category** in Foundations. A category whose tokens are consumed through several properties (space through `padding` and `gap`) is still proven by the component grids.
- **Focus-visible depends on keyboard focus.** `Tab` from the sentinel is deterministic in Chromium; other browsers are out of scope (Chromium only in CI).
- **The rendered step runs only Chromium.** Firefox and WebKit computed values differ in places (font fallback, shadow rendering); if cross-browser parity ever matters, add instances and a per-browser tolerance.
- **Playwright's browser download in CI** (about 150 MB) is cached by lockfile hash; a Playwright bump re-downloads once.
- **`ensureDocumentStyles` appends both stylesheets to `document.head` once per page.** Their `@layer components` and `.bwp-*` rules are inert in the light DOM only as long as harness markup never uses design-system classes; the title lint does not check that, a grep-based check could.
- **Emotion cache keys are derived from cell ids** (sanitised); two cells whose ids sanitise to the same string would share a cache. Ids include the target and the row key, so this cannot happen with kebab-case names, but a future `cellId` change must keep them distinct.

---

## Execution log

Read this section first when resuming. It records how the plan is being executed
and where it stands. Update the status table after every milestone.

### Process

- Skill: `superpowers:subagent-driven-development`. Tasks are batched; each batch
  gets one implementer subagent (sonnet), then one spec-compliance reviewer
  (sonnet), then one code-quality reviewer (opus) that probes by running,
  including the browser run (`npm run test:rendered`) and, for the harness,
  deliberately broken targets to see the failure lines.
- Subagents read only the plan's line range for their tasks plus the header,
  decisions, and file-structure sections, and read the real source files for
  signatures.
- **No git write commands, ever.** The user commits. Read-only `git status` and
  `git diff` are fine.
- **Pause after every milestone** (a batch that passed both reviews). Report the
  changed files and test counts, then wait for the user to say continue.
- **A denied command is reported as BLOCKED**, never worked around.
- The plan text is amended whenever a review decision changes later tasks.

### Status

| Batch | Tasks | State |
| --- | --- | --- |
| 1 | 1-2 config, error codes, auxiliary plugins, `verify --rendered`, the `stories` plugin | pending |
| 2 | 3-4 harness modules, cells, grids, plays, globals, Introduction, title lint, first generated stories | pending |
| 3 | 5 config `rendered`, Turbo, CI, docs | pending |
| 4 | 6 final verification | pending |

Test suite at the start of Plan 4: compiler 36 files / 491 tests; `styles-mui` 3 files / 19 tests; 34 Turbo tasks.

### Decisions made during execution

(none yet)
