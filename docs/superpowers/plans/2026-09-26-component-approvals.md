# Component approvals Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record which components a person has approved, per platform; colour every component
🟢 🟡 🔴; fail CI when a change cancels an approval; show the circles in Storybook and Widgetbook.

**Architecture:** A read-only module in the generator, `packages/codegen/src/approvals/`, finds each
platform's components and the files each ships (esbuild's metafile on the web, the Dart import graph
in Flutter), hashes those files with comments and layout removed (plus, on the web, the values of
the tokens they name), and compares the result with `spec/approvals.yaml`, which people edit by
hand. A CLI prints the colours and checks the approvals; the two viewers read the colours at build.
Spec: `docs/superpowers/specs/2026-09-26-component-approvals-design.md`.

**Tech Stack:** Node 22 ESM (`.mjs`, no build step), esbuild (file resolution only), the
TypeScript compiler API (tokens), `yaml`, vitest; Storybook 10 manager API; Flutter/Widgetbook.

---

## Rules for every task

- **Run no git write command** (no `add`, `commit`, `stash`, `checkout`, `reset`, worktree). The
  owner commits. Reading (`git diff`, `git status`) is fine.
- Node 22: `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`; Flutter:
  `export PATH=$HOME/development/flutter/bin:$PATH`.
- The shell is zsh: pass lists literally or as a zsh array.
- Generator code is ESM `.mjs` with no build step; follow the repository's comment style (a short
  header saying what the file is for; comments that say why). Anything that reaches output sorts
  with `byCodeUnit` (`packages/codegen/src/util/sort.mjs`), never `localeCompare`.
- Nothing here writes a generated file; `solar:status` writes nothing at all.
- Run a task's tests with `npx vitest run packages/codegen/test/<file>` from the repository root.

## File structure

| File                                                   | Responsibility                                                         |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `packages/codegen/src/approvals/lex.mjs`               | a source file as code only: `tsCanon` (TS/TSX), `dartCanon` (Dart)     |
| `packages/codegen/src/approvals/graph.mjs`             | each platform's components, the files each ships, what each uses       |
| `packages/codegen/src/approvals/fingerprint.mjs`       | a component's fingerprint; the token values tokens.css gives           |
| `packages/codegen/src/approvals/status.mjs`            | scan, colours, the check, the lines to paste, the viewers' circles     |
| `packages/codegen/bin/solar-status.mjs`                | the CLI                                                                |
| `packages/codegen/test/approvals-lex.test.mjs`         | lexer tests                                                            |
| `packages/codegen/test/approvals.test.mjs`             | colour and check tests (pure), graph and fingerprint tests (real tree) |
| `spec/approvals.yaml`                                  | the record, hand-written                                               |
| `packages/components/.storybook/manager.ts`, `main.ts` | Storybook's circles                                                    |
| `scripts/widgetbook.mjs`, `widgetbook/lib/main.dart`   | Widgetbook's circles                                                   |

---

### Task 1: Dependencies, the record, the script entry, and the spec's two corrections

**Files:**

- Modify: `packages/codegen/package.json`, `package.json` (root), `package-lock.json` (by npm)
- Create: `spec/approvals.yaml`
- Modify: `docs/superpowers/specs/2026-09-26-component-approvals-design.md`

- [ ] **Step 1: Declare esbuild and TypeScript in the generator**

The generator imports both; today they resolve only because other packages hoist them. Add to
`packages/codegen/package.json` `devDependencies`, at the ranges `packages/components/package.json`
uses (read them there; today `"esbuild": "^0.28.2"`, `"typescript": "^6.0.3"`), keeping the keys
sorted. Then, from the root, with Node 22 on `PATH` (npm 10.9, so the lockfile keeps its format):

```bash
npm install
node -p "require.resolve('esbuild', { paths: ['packages/codegen'] })"
```

Expected: install succeeds; the path prints. `git diff --stat package-lock.json` shows only
esbuild/typescript entries moving.

- [ ] **Step 2: The script**

In the root `package.json` `scripts`, after `"solar:triage"`, add:

```json
"solar:status": "node packages/codegen/bin/solar-status.mjs",
```

- [ ] **Step 3: The record**

Create `spec/approvals.yaml`:

```yaml
# Which SOLAR components a person has approved, per platform. Written by people only, never by an
# agent (CLAUDE.md). `npm run solar:status` prints, for each 🟡 component, the lines to paste here
# once you have confirmed it looks and behaves as intended; `-- --check` fails where a recorded
# fingerprint no longer matches what the component ships.
#
# Button:
#   web: { fingerprint: 'sha256:…', by: 'Your Name', on: 2026-09-27 }
#   flutter: { fingerprint: 'sha256:…', by: 'Your Name', on: 2026-09-27 }
```

- [ ] **Step 4: Correct the spec**

In `docs/superpowers/specs/2026-09-26-component-approvals-design.md`:

- In "The three colours", replace the sentence beginning "Components with no shell of their own"
  with: "A component checked as another's state (Autocomplete Open) is not listed; the component it
  is the state of covers it. A chart library draws Bar, Line and Donut Chart, and their hand-written
  wrappers ship, so each is listed with its wrapper (`BarChart.tsx`; in Flutter the widget in
  `lib/src/solar_charts.dart`); Chart Axis and Chart Gridlines have no wrapper and are covered by the
  charts that draw them. Components that share an entry file (the three Flutter charts) do not use
  one another."
- In "Fingerprints", after the Flutter bullet, add: "Flutter's `tokens.dart` holds every token, so
  any token change cancels every Flutter approval; the web names its tokens one by one."
- In "Circles in the viewers", Widgetbook bullet: the colours go to
  `widgetbook/assets/verify/approvals.status` (JSON; the directory is already an asset and
  git-ignored, and the name is not `.json`, which the app reads as oracles); where the status module
  cannot load (the CI job that builds Widgetbook installs no npm packages), the script prints a
  note and builds without circles.

- [ ] **Step 5: Check**

```bash
npx prettier --check spec/approvals.yaml docs/superpowers/specs/2026-09-26-component-approvals-design.md package.json packages/codegen/package.json
```

Expected: pass (run `--write` first if needed).

### Task 2: The lexer

**Files:**

- Create: `packages/codegen/src/approvals/lex.mjs`
- Test: `packages/codegen/test/approvals-lex.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, expect, it } from 'vitest';
import { dartCanon, tsCanon } from '../src/approvals/lex.mjs';

describe('tsCanon', () => {
  const a =
    '// a comment\nexport const x = 1; /* more */\n/** Doc. */\nfunction f(a: number) {\n  return a + 1;\n}\n';

  it('ignores comments and layout', () => {
    const b = 'export const x=1;function f( a : number ){ return a+1; }';
    expect(tsCanon(b, 'f.ts')).toBe(tsCanon(a, 'f.ts'));
  });

  it('changes with the code', () => {
    expect(tsCanon(a.replace('a + 1', 'a + 2'), 'f.ts')).not.toBe(
      tsCanon(a, 'f.ts'),
    );
  });

  it('keeps what a string, a template or a regular expression holds', () => {
    const s =
      "const u = 'http://x'; const t = `a // b ${1}`; const r = /\\/\\//;";
    const c = tsCanon(s, 'f.ts');
    expect(c).toContain("'http://x'");
    expect(c).toContain('`a // b ${');
    expect(c).toContain('/\\/\\//');
  });

  it('reads JSX text as React does, its whitespace collapsed', () => {
    expect(tsCanon('const e = <p>\n  Save   now\n</p>;', 'f.tsx')).toBe(
      tsCanon('const e = <p>Save now</p>;', 'f.tsx'),
    );
  });
});

describe('dartCanon', () => {
  const a =
    '/// Doc.\nclass A { // line\n  /* block /* nested */ still */ final int x = 1;\n}\n';

  it('ignores comments and layout', () => {
    expect(dartCanon(a)).toBe(dartCanon('class A{final int x=1;}'));
  });

  it('keeps words apart', () => {
    expect(dartCanon('final  int\n x')).toBe('final int x');
  });

  it('changes with the code', () => {
    expect(dartCanon(a.replace('= 1', '= 2'))).not.toBe(dartCanon(a));
  });

  it('keeps strings whole', () => {
    const s =
      "final a = 'http://x  y'; final b = \"it's\"; final c = r'\\d//'; final d = '''\n // kept\n''';";
    const c = dartCanon(s);
    expect(c).toContain("'http://x  y'");
    expect(c).toContain('"it\'s"');
    expect(c).toContain("r'\\d//'");
    expect(c).toContain("'''\n // kept\n'''");
  });

  it('follows an interpolation, and the strings inside it', () => {
    const s = "final a = '${b ? 'x}' : \"y\"} // not a comment';";
    expect(dartCanon(s)).toContain("'${b ? 'x}' : \"y\"} // not a comment'");
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run packages/codegen/test/approvals-lex.test.mjs`
Expected: FAIL, cannot find `../src/approvals/lex.mjs`.

- [ ] **Step 3: Write the lexer**

```js
/**
 * A source file as its code alone: comments and layout gone, so rewording a comment or
 * reformatting a line gives the same text, and any change to the code a different one. What a
 * component's fingerprint hashes, file by file (./fingerprint.mjs).
 */

import ts from 'typescript';

const WORD = /[A-Za-z0-9_$]/;

const scriptKind = (fileName) =>
  fileName.endsWith('.tsx')
    ? ts.ScriptKind.TSX
    : /\.(m?js|jsx)$/.test(fileName)
      ? ts.ScriptKind.JSX
      : ts.ScriptKind.TS;

/**
 * A TypeScript or TSX file's tokens, one per line, read off its syntax tree: comments are trivia
 * there, never tokens, and a string, a template or a regular expression is one token, whole. JSX
 * text is collapsed as React collapses it.
 */
export function tsCanon(text, fileName) {
  const file = ts.createSourceFile(
    fileName,
    text,
    ts.ScriptTarget.Latest,
    false,
    scriptKind(fileName),
  );
  const out = [];
  const visit = (node) => {
    // A doc comment is a node of the tree, but still a comment.
    if (
      node.kind >= ts.SyntaxKind.FirstJSDocNode &&
      node.kind <= ts.SyntaxKind.LastJSDocNode
    )
      return;
    const kids = node.getChildren(file);
    if (kids.length) {
      for (const kid of kids) visit(kid);
      return;
    }
    let token = node.getText(file);
    if (node.kind === ts.SyntaxKind.JsxText) {
      const collapsed = token.replace(/\s+/g, ' ');
      token = /\n/.test(token) ? collapsed.trim() : collapsed;
    }
    if (token) out.push(token);
  };
  visit(file);
  return out.join('\n');
}

const isRawStart = (t, i) =>
  (t[i] === 'r' || t[i] === 'R') &&
  (t[i + 1] === "'" || t[i + 1] === '"') &&
  !WORD.test(t[i - 1] ?? '');

/** The index just past a block comment starting at `i`; Dart's nest. */
function blockCommentEnd(t, i) {
  let depth = 0;
  do {
    if (t.startsWith('/*', i)) {
      depth++;
      i += 2;
    } else if (t.startsWith('*/', i)) {
      depth--;
      i += 2;
    } else i++;
  } while (depth > 0 && i < t.length);
  return i;
}

/** The index just past the `}` that closes an interpolation whose code starts at `i`. */
function interpolationEnd(t, i) {
  let depth = 1;
  while (i < t.length) {
    const c = t[i];
    if (c === "'" || c === '"' || isRawStart(t, i)) i = stringEnd(t, i);
    else if (t.startsWith('//', i)) while (i < t.length && t[i] !== '\n') i++;
    else if (t.startsWith('/*', i)) i = blockCommentEnd(t, i);
    else {
      if (c === '{') depth++;
      else if (c === '}' && --depth === 0) return i + 1;
      i++;
    }
  }
  return i;
}

/** The index just past a Dart string starting at `i`: raw or not, single or triple quoted. */
function stringEnd(t, i) {
  const raw = t[i] === 'r' || t[i] === 'R';
  if (raw) i++;
  const quote = t[i];
  const close = t.startsWith(quote.repeat(3), i) ? quote.repeat(3) : quote;
  i += close.length;
  while (i < t.length) {
    if (!raw && t[i] === '\\') i += 2;
    else if (t.startsWith(close, i)) return i + close.length;
    else if (!raw && t[i] === '$' && t[i + 1] === '{')
      i = interpolationEnd(t, i + 2);
    // An unterminated single-line string ends with its line, as the Dart parser reads it.
    else if (close.length === 1 && t[i] === '\n') return i;
    else i++;
  }
  return i;
}

/**
 * A Dart file with its comments dropped (`//`, `///`, nested `/* */`) and its layout reduced to
 * one space where two words would otherwise run together. Strings are kept whole, their
 * interpolations and the strings inside those too.
 */
export function dartCanon(t) {
  const out = [];
  let space = false;
  const emit = (s) => {
    if (space && out.length && WORD.test(out.at(-1).at(-1)) && WORD.test(s[0]))
      out.push(' ');
    space = false;
    out.push(s);
  };
  let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (/\s/.test(c)) {
      space = true;
      i++;
    } else if (t.startsWith('//', i)) {
      while (i < t.length && t[i] !== '\n') i++;
      space = true;
    } else if (t.startsWith('/*', i)) {
      i = blockCommentEnd(t, i);
      space = true;
    } else if (c === "'" || c === '"' || isRawStart(t, i)) {
      const end = stringEnd(t, i);
      emit(t.slice(i, end));
      i = end;
    } else {
      emit(c);
      i++;
    }
  }
  return out.join('');
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run packages/codegen/test/approvals-lex.test.mjs`
Expected: PASS (9 tests). If the JSDoc test case fails because `getChildren` does not return JSDoc
nodes, the guard is harmless; if a doc comment's text appears in `tsCanon` output, fix the guard
(use `ts.isJSDoc(node)` or skip `node.jsDoc`) until "ignores comments and layout" passes.

### Task 3: The graph

**Files:**

- Create: `packages/codegen/src/approvals/graph.mjs`
- Test: `packages/codegen/test/approvals.test.mjs` (graph part; Task 5 adds to it)

- [ ] **Step 1: Write the graph module**

```js
/**
 * Each platform's components, the repository files each ships, and the components each uses: the
 * graph approvals follow (./status.mjs). A component is one with a shell on that platform; it
 * uses another when the other's shell is among the files it ships, however it got there (its own
 * import, or a runtime helper's). Shared helpers are never components: they count in the
 * fingerprint of every component that ships them.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { DESCRIPTORS } from '../components/index.mjs';
import {
  componentsSrc,
  flutterComponents,
  flutterFileOf,
  flutterLib,
  shellFileOf,
} from '../shells/index.mjs';
import { repoRoot } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { WORKSPACE_SOURCES } from '../util/workspace-sources.mjs';

export const PLATFORMS = ['web', 'flutter'];

/** A repository path, relative and with forward slashes, whatever the machine. */
export const rel = (path) => relative(repoRoot, path).split(sep).join('/');

const pascal = (name) => name.replace(/[^A-Za-z0-9]/g, '');

/**
 * The components with a shell on a platform, each with the file it starts from. A component checked
 * as another's state has none. A chart a library draws is listed where a wrapper ships it: on the
 * web its own file, in Flutter its widget in `lib/src/solar_<library>.dart`.
 */
export function nodesOf(platform) {
  const nodes = [];
  for (const d of DESCRIPTORS) {
    if (d.checkedAs) continue;
    if (platform === 'web') {
      const entry = join(componentsSrc, shellFileOf(d.name));
      if (d.library && !existsSync(entry)) continue;
      nodes.push({ name: d.name, entry });
    } else if (d.library) {
      const entry = join(flutterLib, 'src', `solar_${d.library}.dart`);
      if (!existsSync(entry)) continue;
      const widget = new RegExp(`\\bclass Solar${pascal(d.name)}\\b`);
      if (widget.test(readFileSync(entry, 'utf8')))
        nodes.push({ name: d.name, entry });
    } else
      nodes.push({
        name: d.name,
        entry: join(flutterComponents, flutterFileOf(d.name)),
      });
  }
  return nodes;
}

/**
 * Every repository file each web component ships, from one esbuild pass over every shell: the
 * files that put code in its bundle, the workspace packages read from their sources, the app's
 * packages (React, MUI, Emotion) left out. Only the file set is used; esbuild's output is never
 * hashed, so an esbuild upgrade moves no fingerprint.
 */
export async function webClosures(nodes) {
  const { build } = await import('esbuild');
  const result = await build({
    entryPoints: nodes.map((n) => n.entry),
    absWorkingDir: repoRoot,
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    jsx: 'automatic',
    treeShaking: true,
    outdir: join(repoRoot, '.solar-status'),
    alias: WORKSPACE_SOURCES,
    packages: 'external',
    loader: { '.css': 'empty', '.woff': 'empty', '.woff2': 'empty' },
    logLevel: 'error',
  });
  const byEntry = new Map();
  for (const output of Object.values(result.metafile.outputs)) {
    if (!output.entryPoint) continue;
    const files = Object.entries(output.inputs)
      .filter(([, input]) => input.bytesInOutput > 0)
      .map(([file]) => file);
    byEntry.set(output.entryPoint, new Set([output.entryPoint, ...files]));
  }
  return new Map(
    nodes.map((n) => {
      const files = byEntry.get(rel(n.entry));
      if (!files)
        throw new Error(
          `solar:status: esbuild built nothing for ${rel(n.entry)}`,
        );
      return [n.name, [...files].sort(byCodeUnit)];
    }),
  );
}

const IMPORT = /^\s*(?:import|export|part)\s+['"]([^'"]+)['"]/gm;

/**
 * Every file each Flutter component ships: its widget and whatever it imports within
 * solar_flutter, followed file to file. Flutter, fl_chart and intl are the app's.
 */
export function flutterClosures(nodes, read = (p) => readFileSync(p, 'utf8')) {
  const imports = new Map();
  const importsOf = (file) => {
    if (!imports.has(file)) {
      const found = [];
      for (const [, target] of read(file).matchAll(IMPORT)) {
        let path;
        if (target.startsWith('package:solar_flutter/'))
          path = join(
            flutterLib,
            target.slice('package:solar_flutter/'.length),
          );
        else if (/^(package|dart):/.test(target)) continue;
        else path = resolve(dirname(file), target);
        if (path.startsWith(flutterLib + sep) && existsSync(path))
          found.push(path);
      }
      imports.set(file, found);
    }
    return imports.get(file);
  };
  return new Map(
    nodes.map((n) => {
      const seen = new Set([n.entry]);
      const queue = [n.entry];
      while (queue.length)
        for (const next of importsOf(queue.shift()))
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
      return [n.name, [...seen].map(rel).sort(byCodeUnit)];
    }),
  );
}

/** The components each one uses: those whose shell it ships, apart from its own entry's. */
export function usesOf(nodes, closures) {
  const entryOf = new Map(nodes.map((n) => [n.name, rel(n.entry)]));
  return new Map(
    nodes.map((n) => {
      const files = new Set(closures.get(n.name));
      const uses = nodes
        .filter(
          (m) =>
            entryOf.get(m.name) !== entryOf.get(n.name) &&
            files.has(entryOf.get(m.name)),
        )
        .map((m) => m.name)
        .sort(byCodeUnit);
      return [n.name, uses];
    }),
  );
}
```

- [ ] **Step 2: Write the graph tests**

Create `packages/codegen/test/approvals.test.mjs`:

```js
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  flutterClosures,
  nodesOf,
  rel,
  usesOf,
  webClosures,
} from '../src/approvals/graph.mjs';
import { repoRoot } from '../src/util/paths.mjs';

const read = (path) => readFileSync(join(repoRoot, path), 'utf8');

describe('the graph', () => {
  let web;
  let flutter;
  beforeAll(async () => {
    const webNodes = nodesOf('web');
    const flutterNodes = nodesOf('flutter');
    const webFiles = await webClosures(webNodes);
    const flutterFiles = flutterClosures(flutterNodes);
    web = {
      nodes: webNodes,
      files: webFiles,
      uses: usesOf(webNodes, webFiles),
    };
    flutter = {
      nodes: flutterNodes,
      files: flutterFiles,
      uses: usesOf(flutterNodes, flutterFiles),
    };
  }, 120_000);

  it('has exactly the components the barrels export, and the chart wrappers', () => {
    const barrel = (path, re) =>
      [...read(path).matchAll(re)].map(([, f]) => f).sort();
    const webShells = barrel(
      'packages/components/src/components.generated.ts',
      /export \* from '\.\/([A-Za-z0-9]+)\.js'/g,
    );
    const webEntries = web.nodes
      .map((n) => rel(n.entry).split('/').pop().replace('.tsx', ''))
      .sort();
    expect(webEntries).toEqual(
      [...webShells, 'BarChart', 'DonutChart', 'LineChart'].sort(),
    );
    const flutterShells = barrel(
      'packages/solar_flutter/lib/src/components/components.dart',
      /export '(solar_[a-z0-9_]+\.dart)'/g,
    );
    const flutterEntries = flutter.nodes
      .map((n) => rel(n.entry))
      .filter((p) => p.includes('/components/'))
      .map((p) => p.split('/').pop())
      .sort();
    expect(flutterEntries).toEqual(flutterShells);
    for (const g of [web, flutter]) {
      const names = g.nodes.map((n) => n.name);
      expect(names).toEqual(
        expect.arrayContaining(['Bar Chart', 'Line Chart', 'Donut Chart']),
      );
      expect(names).not.toContain('Chart Axis');
      expect(names).not.toContain('Autocomplete Open');
    }
  });

  it('knows what each component uses, on each platform', () => {
    expect(web.uses.get('Button')).toEqual(['Spinner']);
    expect(flutter.uses.get('Button')).toEqual(['Spinner']);
    expect(web.uses.get('Dialog')).toContain('Icon Button');
    expect(flutter.uses.get('Dialog')).toEqual(
      expect.arrayContaining(['Icon Button', 'Scrim']),
    );
    // The three Flutter charts share one file, and do not use one another for it.
    expect(flutter.uses.get('Bar Chart')).not.toContain('Line Chart');
  });

  it("ships a component's own recipe, not the barrel's every recipe, and no test or story", () => {
    const button = web.files.get('Button');
    expect(button).toContain('packages/components/src/Button.tsx');
    expect(button).toContain(
      'packages/styles/src/generated/mui/components/button.ts',
    );
    expect(button).not.toContain(
      'packages/styles/src/generated/mui/components/tag.ts',
    );
    for (const g of [web, flutter])
      for (const files of g.files.values())
        for (const f of files)
          expect(f).not.toMatch(/\/(test|stories|variants|widgetbook)\//);
    expect(flutter.files.get('Button')).toContain(
      'packages/solar_flutter/lib/src/generated/components/button.dart',
    );
  });
});
```

- [ ] **Step 3: Run them**

Run: `npx vitest run packages/codegen/test/approvals.test.mjs`
Expected: PASS. If `packages: 'external'` stops esbuild applying the aliases (the recipe file is
missing from Button's files), replace it with an explicit
`external: ['react', 'react/*', 'react-dom', 'react-dom/*', '@mui/*', '@emotion/*']` and re-run.
If a component's expected `uses` differs, read its shells: correct the test only where the code
shows the test's expectation was wrong, and say so in the report.

### Task 4: Fingerprints

**Files:**

- Create: `packages/codegen/src/approvals/fingerprint.mjs`

- [ ] **Step 1: Write the module**

```js
/**
 * A component's fingerprint on one platform: a SHA-256 of every file it ships, each read as its
 * code alone (./lex.mjs), and on the web of the value, in every mode, of every token those files
 * name, since a recipe names a token and tokens.css holds its value. Flutter's files include
 * tokens.dart itself. An approval holds while the fingerprint does (./status.mjs).
 */

import { join } from 'node:path';
import { sha256 } from '../util/digest.mjs';
import { packagesDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { rel } from './graph.mjs';
import { dartCanon, tsCanon } from './lex.mjs';

export const tokensCss = rel(
  join(packagesDir, 'styles', 'src', 'generated', 'css', 'tokens.css'),
);

/**
 * Every `--solar-*` declaration in tokens.css: the property to its `<blocks>=<value>` lines, the
 * blocks being the selectors and media queries it sits in (`:root`, `[data-theme='dark']`…).
 */
export function tokenValues(css) {
  const values = new Map();
  const blocks = [];
  for (const line of css.split('\n')) {
    const t = line.trim();
    if (t.endsWith('{')) blocks.push(t.slice(0, -1).trim());
    else if (t === '}') blocks.pop();
    else {
      const m = /^(--solar-[a-z0-9-]+)\s*:\s*(.*?);?$/.exec(t);
      if (!m) continue;
      const list = values.get(m[1]) ?? [];
      list.push(`${blocks.join(' ')}=${m[2]}`);
      values.set(m[1], list);
    }
  }
  return values;
}

/** One file as its code alone. */
export const canonOf = (path, text) =>
  path.endsWith('.dart') ? dartCanon(text) : tsCanon(text, path);

/**
 * The fingerprint of a component that ships `files` (repository paths, sorted). `read` gives a
 * file's text, `tokens` the web's token values, `canon` a per-scan cache of each file's hash.
 */
export function fingerprint(
  platform,
  files,
  { read, tokens, cache = new Map() },
) {
  const hashOf = (f) => {
    if (!cache.has(f)) cache.set(f, sha256(canonOf(f, read(f))));
    return cache.get(f);
  };
  const lines = files.map((f) => `${f} ${hashOf(f)}`);
  if (platform === 'web') {
    const named = new Set();
    for (const f of files)
      for (const [name] of read(f).matchAll(/--solar-[a-z0-9-]+/g))
        named.add(name);
    for (const name of [...named].sort(byCodeUnit))
      for (const value of tokens.get(name) ?? [])
        lines.push(`${name} ${value}`);
  }
  return `sha256:${sha256(lines.join('\n'))}`;
}
```

- [ ] **Step 2: Check tokens.css parses**

```bash
node -e "
import('./packages/codegen/src/approvals/fingerprint.mjs').then(({ tokenValues, tokensCss }) => {
  const v = tokenValues(require('fs').readFileSync(tokensCss, 'utf8'));
  console.log(v.size, v.get('--solar-color-action-primary-bg-default'));
})"
```

Expected: about 660 properties; the action colour has two lines, `:root=…` and
`[data-theme='dark']=…`. If a value spans lines in tokens.css, extend the parser to join them and
say so.

### Task 5: Status, colours and the check

**Files:**

- Create: `packages/codegen/src/approvals/status.mjs`
- Modify: `packages/codegen/test/approvals.test.mjs` (append)

- [ ] **Step 1: Write the failing pure tests** (append to `approvals.test.mjs`)

```js
import {
  check,
  colour,
  pasteFor,
  readApprovals,
  scan,
} from '../src/approvals/status.mjs';

const scanOf = (list) => ({
  web: list.map(([name, uses, fingerprint]) => ({
    name,
    uses,
    files: [],
    fingerprint,
  })),
});
const base = scanOf([
  ['Spinner', [], 'sha256:s'],
  ['Button', ['Spinner'], 'sha256:b'],
  ['Dialog', ['Button', 'Spinner'], 'sha256:d'],
]);
const colours = (coloured) =>
  Object.fromEntries(coloured.web.map((c) => [c.name, c.colour]));
const approved = (fingerprints) =>
  Object.fromEntries(
    Object.entries(fingerprints).map(([n, f]) => [
      n,
      { web: { fingerprint: f, by: 'Joon', on: '2026-09-27' } },
    ]),
  );

describe('colours', () => {
  it('is yellow using nothing unapproved, red using something unapproved', () => {
    expect(colours(colour(base, {}))).toEqual({
      Spinner: 'yellow',
      Button: 'red',
      Dialog: 'red',
    });
  });

  it('is green approved with only green children', () => {
    const a = approved({ Spinner: 'sha256:s', Button: 'sha256:b' });
    expect(colours(colour(base, a))).toEqual({
      Spinner: 'green',
      Button: 'green',
      Dialog: 'yellow',
    });
  });

  it('cancels a child and every parent above it when the child changes; a revert restores them', () => {
    const a = approved({
      Spinner: 'sha256:s',
      Button: 'sha256:b',
      Dialog: 'sha256:d',
    });
    // A child's change changes every parent's fingerprint too (the fingerprint tests prove it).
    const changed = scanOf([
      ['Spinner', [], 'sha256:s2'],
      ['Button', ['Spinner'], 'sha256:b2'],
      ['Dialog', ['Button', 'Spinner'], 'sha256:d2'],
    ]);
    expect(colours(colour(changed, a))).toEqual({
      Spinner: 'yellow',
      Button: 'red',
      Dialog: 'red',
    });
    expect(check(colour(changed, a), a)).toHaveLength(3);
    expect(colours(colour(base, a))).toEqual({
      Spinner: 'green',
      Button: 'green',
      Dialog: 'green',
    });
    expect(check(colour(base, a), a)).toEqual([]);
  });
});

describe('the check', () => {
  it('names an approval that no longer matches', () => {
    const a = approved({ Spinner: 'sha256:old' });
    const [problem] = check(colour(base, a), a);
    expect(problem).toContain('Spinner (web)');
    expect(problem).toContain('sha256:s');
  });

  it('names an approval recorded before its children were approved', () => {
    const a = approved({ Button: 'sha256:b' });
    const [problem] = check(colour(base, a), a);
    expect(problem).toContain('Button (web)');
    expect(problem).toContain('Spinner');
  });

  it('names a component or a platform that has no shell', () => {
    expect(
      check(colour(base, {}), approved({ Nope: 'sha256:x' }))[0],
    ).toContain('Nope');
    const ios = { Button: { ios: { fingerprint: 'sha256:b' } } };
    expect(check(colour(base, {}), ios)[0]).toContain('ios');
  });

  it('names a cycle', () => {
    const cyclic = scanOf([
      ['A', ['B'], 'sha256:a'],
      ['B', ['A'], 'sha256:b'],
    ]);
    const [problem] = check(colour(cyclic, {}), {});
    expect(problem).toContain('A');
    expect(problem).toContain('B');
    expect(colours(colour(cyclic, {}))).toEqual({ A: 'red', B: 'red' });
  });

  it('prints the lines to paste for each yellow component', () => {
    expect(pasteFor(colour(base, {}), { by: 'Joon', on: '2026-09-27' })).toBe(
      "Spinner:\n  web: { fingerprint: 'sha256:s', by: 'Joon', on: 2026-09-27 }",
    );
  });

  it('reads the committed record', () => {
    expect(typeof readApprovals()).toBe('object');
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run packages/codegen/test/approvals.test.mjs`
Expected: FAIL, cannot find `../src/approvals/status.mjs`.

- [ ] **Step 3: Write the module**

```js
/**
 * Approvals: which components a person has approved, per platform, against what each ships now.
 * 🟢 approved and every component it uses 🟢; 🟡 not approved and every component it uses 🟢,
 * ready to fix and review; 🔴 some component it uses not 🟢, not to be worked on. Read-only:
 * `spec/approvals.yaml` is written by people alone. `bin/solar-status.mjs` prints this; the
 * viewers show the circles.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { repoRoot, specDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { fingerprint, tokenValues, tokensCss } from './fingerprint.mjs';
import {
  flutterClosures,
  nodesOf,
  PLATFORMS,
  usesOf,
  webClosures,
} from './graph.mjs';

export const approvalsFile = join(specDir, 'approvals.yaml');
export const CIRCLES = { green: '🟢', yellow: '🟡', red: '🔴' };

/** The record, `{ <component>: { <platform>: { fingerprint, by, on } } }`; empty where it is. */
export function readApprovals(
  text = existsSync(approvalsFile) ? readFileSync(approvalsFile, 'utf8') : '',
) {
  return parse(text) ?? {};
}

const readRepo = (path) => readFileSync(join(repoRoot, path), 'utf8');

/**
 * Each platform's components, as `{ name, uses, files, fingerprint }`. `read` gives a repository
 * file's text (a test changes one in memory); the files each component ships come from disk.
 */
export async function scan(platforms = PLATFORMS, { read = readRepo } = {}) {
  const tokens = tokenValues(read(tokensCss));
  const cache = new Map();
  const scanned = {};
  for (const platform of platforms) {
    const nodes = nodesOf(platform);
    const closures =
      platform === 'web'
        ? await webClosures(nodes)
        : flutterClosures(nodes, (p) => readRepo(p.slice(repoRoot.length + 1)));
    const uses = usesOf(nodes, closures);
    scanned[platform] = nodes.map((n) => ({
      name: n.name,
      uses: uses.get(n.name),
      files: closures.get(n.name),
      fingerprint: fingerprint(platform, closures.get(n.name), {
        read,
        tokens,
        cache,
      }),
    }));
  }
  return scanned;
}

/** A scan with each component's colour, and the components it waits on (those not 🟢). */
export function colour(scanned, approvals) {
  const coloured = {};
  for (const [platform, components] of Object.entries(scanned)) {
    const byName = new Map(components.map((c) => [c.name, c]));
    const memo = new Map();
    const of = (name, path = []) => {
      if (memo.has(name)) return memo.get(name);
      // A cycle can never be approved: the check names it.
      if (path.includes(name)) return 'red';
      const c = byName.get(name);
      const childrenGreen = c.uses.every(
        (k) => of(k, [...path, name]) === 'green',
      );
      const holds =
        approvals?.[name]?.[platform]?.fingerprint === c.fingerprint;
      const result = !childrenGreen ? 'red' : holds ? 'green' : 'yellow';
      memo.set(name, result);
      return result;
    };
    coloured[platform] = components.map((c) => ({
      ...c,
      colour: of(c.name),
      waitsOn: c.uses.filter((k) => of(k) !== 'green'),
    }));
  }
  return coloured;
}

/** What is wrong with the record, one sentence each; nothing where every approval holds. */
export function check(coloured, approvals) {
  const problems = [];
  for (const [name, platforms] of Object.entries(approvals ?? {}))
    for (const [platform, approval] of Object.entries(platforms ?? {})) {
      if (!PLATFORMS.includes(platform)) {
        problems.push(
          `${name} (${platform}): ${platform} is no platform (${PLATFORMS.join(', ')}).`,
        );
        continue;
      }
      if (!coloured[platform]) continue;
      const c = coloured[platform].find((x) => x.name === name);
      if (!c)
        problems.push(
          `${name} (${platform}): approved, but ${platform} has no ${name}.`,
        );
      else if (approval?.fingerprint !== c.fingerprint)
        problems.push(
          `${name} (${platform}): approved as ${approval?.fingerprint}, but it now ships ` +
            `${c.fingerprint}: it, or a component it uses, changed. Review it again and paste its ` +
            'new line from `npm run solar:status`, or revert the change.',
        );
      else if (c.colour !== 'green')
        problems.push(
          `${name} (${platform}): approved while ${c.waitsOn.join(', ')} ` +
            `${c.waitsOn.length > 1 ? 'are' : 'is'} not; approve ${c.waitsOn.length > 1 ? 'those' : 'it'} first.`,
        );
    }
  for (const [platform, components] of Object.entries(coloured)) {
    const byName = new Map(components.map((c) => [c.name, c]));
    for (const c of components)
      for (const k of c.uses)
        if (byCodeUnit(c.name, k) < 0 && byName.get(k)?.uses.includes(c.name))
          problems.push(
            `${platform}: ${c.name} and ${k} use each other, so neither can ever be approved.`,
          );
  }
  return problems;
}

const quote = (text) => `'${String(text).replace(/'/g, "''")}'`;

/** The lines to paste into spec/approvals.yaml for each 🟡 component, by component. */
export function pasteFor(coloured, { by, on }) {
  const lines = new Map();
  for (const [platform, components] of Object.entries(coloured))
    for (const c of components)
      if (c.colour === 'yellow') {
        if (!lines.has(c.name)) lines.set(c.name, []);
        lines
          .get(c.name)
          .push(
            `  ${platform}: { fingerprint: '${c.fingerprint}', by: ${quote(by)}, on: ${on} }`,
          );
      }
  return [...lines]
    .sort(([a], [b]) => byCodeUnit(a, b))
    .map(([name, platformLines]) => `${name}:\n${platformLines.join('\n')}`)
    .join('\n');
}

/** The colours as the CLI prints them, and the lines to paste. */
export function render(coloured, { by, on }) {
  const titles = { web: 'Web', flutter: 'Flutter' };
  const out = [];
  for (const [platform, components] of Object.entries(coloured)) {
    const count = (k) => components.filter((c) => c.colour === k).length;
    out.push(
      `${titles[platform]}: ${CIRCLES.green} ${count('green')} · ${CIRCLES.yellow} ${count('yellow')} · ${CIRCLES.red} ${count('red')}`,
    );
    for (const c of components)
      out.push(
        `  ${CIRCLES[c.colour]} ${c.name}${c.colour === 'red' ? ` (waits on ${c.waitsOn.join(', ')})` : ''}`,
      );
    out.push('');
  }
  const paste = pasteFor(coloured, { by, on });
  if (paste)
    out.push(
      'To approve a 🟡 component once you have confirmed it, add its lines to spec/approvals.yaml',
      '(a component already there takes the platform line under its name):',
      '',
      paste,
    );
  return `${out.join('\n')}\n`;
}

/** Each component's circle on one platform, for a viewer's sidebar. */
export async function circlesFor(platform) {
  const coloured = colour(await scan([platform]), readApprovals())[platform];
  return Object.fromEntries(coloured.map((c) => [c.name, CIRCLES[c.colour]]));
}
```

Note on `scan`'s Flutter reader: `flutterClosures` takes absolute paths; pass
`(p) => readFileSync(p, 'utf8')` instead if simpler. The `read` override applies to hashing only.

- [ ] **Step 4: Run the pure tests**

Run: `npx vitest run packages/codegen/test/approvals.test.mjs`
Expected: PASS for "colours" and "the check", and the graph tests.

- [ ] **Step 5: Add the fingerprint tests on the real tree** (append)

```js
describe('fingerprints', () => {
  let base;
  const fp = (scanned, platform, name) =>
    scanned[platform].find((c) => c.name === name).fingerprint;
  const edited = (file, edit) => (path) => {
    const text = readFileSync(join(repoRoot, path), 'utf8');
    return path === file ? edit(text) : text;
  };
  beforeAll(async () => {
    base = await scan();
  }, 120_000);

  it('are the same twice', async () => {
    expect(await scan()).toEqual(base);
  }, 120_000);

  it("change with a child's code, and only for its parents", async () => {
    const s = await scan(['web'], {
      read: edited(
        'packages/components/src/Spinner.tsx',
        (t) => `${t}\nexport const probe = 1;\n`,
      ),
    });
    expect(fp(s, 'web', 'Button')).not.toBe(fp(base, 'web', 'Button'));
    expect(fp(s, 'web', 'Spinner')).not.toBe(fp(base, 'web', 'Spinner'));
    expect(fp(s, 'web', 'Tag')).toBe(fp(base, 'web', 'Tag'));
    const f = await scan(['flutter'], {
      read: edited(
        'packages/solar_flutter/lib/src/components/solar_spinner.dart',
        (t) => `${t}\nconst probe = 1;\n`,
      ),
    });
    expect(fp(f, 'flutter', 'Button')).not.toBe(fp(base, 'flutter', 'Button'));
  }, 120_000);

  it('do not change with a comment or the layout', async () => {
    const s = await scan(['web'], {
      read: edited(
        'packages/components/src/Button.tsx',
        (t) =>
          `// A note.\n${t.replace('export const Button', '\n\nexport   const Button')}`,
      ),
    });
    expect(fp(s, 'web', 'Button')).toBe(fp(base, 'web', 'Button'));
    const f = await scan(['flutter'], {
      read: edited(
        'packages/solar_flutter/lib/src/components/solar_button.dart',
        (t) => `// A note.\n${t}`,
      ),
    });
    expect(fp(f, 'flutter', 'Button')).toBe(fp(base, 'flutter', 'Button'));
  }, 120_000);

  it("change on the web with a token's value", async () => {
    const s = await scan(['web'], {
      read: edited('packages/styles/src/generated/css/tokens.css', (t) =>
        t.replace(
          /(--solar-color-action-primary-bg-default:\s*)[^;]+/,
          '$1#000000',
        ),
      ),
    });
    expect(fp(s, 'web', 'Button')).not.toBe(fp(base, 'web', 'Button'));
  }, 120_000);

  it('never change with a test or a story', async () => {
    const s = await scan(['web'], {
      read: edited(
        'packages/components/stories/Button.stories.tsx',
        (t) => `${t}\nexport const x = 1;\n`,
      ),
    });
    expect(s.web).toEqual(base.web);
  }, 120_000);

  it('leave no cycle', () => {
    expect(check(colour(base, {}), {})).toEqual([]);
  });
});
```

- [ ] **Step 6: Run everything in the file**

Run: `npx vitest run packages/codegen/test/approvals.test.mjs packages/codegen/test/approvals-lex.test.mjs`
Expected: PASS. Note the time the file takes; if over a minute, cache web closures across scans
within one test file (compute them once in `beforeAll` and pass them into `scan` via an option)
rather than weaken a test.

### Task 6: The CLI

**Files:**

- Create: `packages/codegen/bin/solar-status.mjs`

- [ ] **Step 1: Write it**

```js
#!/usr/bin/env node
// Which SOLAR components a person has approved, per platform, and which can be worked on.
//
//   npm run solar:status              every component's colour, and the lines to paste for each 🟡
//   npm run solar:status -- --check   fails where a recorded approval no longer holds (CI)
//
// Read-only: it writes nothing. spec/approvals.yaml is written by people alone.
// First, before anything else loads: the Node this needs (.nvmrc).
import '../src/util/require-node.mjs';
import { execFileSync } from 'node:child_process';
import {
  check,
  colour,
  readApprovals,
  render,
  scan,
} from '../src/approvals/status.mjs';

const approvals = readApprovals();
const coloured = colour(await scan(), approvals);
if (process.argv.includes('--check')) {
  const problems = check(coloured, approvals);
  for (const problem of problems) process.stderr.write(`${problem}\n`);
  if (problems.length) process.exit(1);
  process.stdout.write('solar:status: every recorded approval holds.\n');
} else {
  let by = 'Your Name';
  try {
    by =
      execFileSync('git', ['config', 'user.name'], {
        encoding: 'utf8',
      }).trim() || by;
  } catch {
    // No git, or no name: the placeholder stands.
  }
  process.stdout.write(
    render(coloured, { by, on: new Date().toISOString().slice(0, 10) }),
  );
}
```

- [ ] **Step 2: Run it**

```bash
npm run solar:status | head -20
npm run solar:status -- --check; echo "exit $?"
```

Expected: a Web and a Flutter section, every component 🟡 or 🔴 (the record is empty), Button 🔴
waiting on Spinner, Spinner 🟡; the check prints "every recorded approval holds." and exits 0.

- [ ] **Step 3: Prove the check fails** (then restore)

Copy Spinner's printed web line into `spec/approvals.yaml`, run `--check` (exit 0); change one hex
digit of that fingerprint, run `--check` (exit 1, naming `Spinner (web)`); restore
`spec/approvals.yaml` exactly (`git diff spec/approvals.yaml` must show only the Task 1 file, i.e.
the file is untracked and identical to what Task 1 wrote).

- [ ] **Step 4: Lint**

```bash
npm run lint -w @bwp-web/codegen && npx prettier --check packages/codegen
```

Expected: pass (`--write` first if Prettier complains).

### Task 7: Storybook's circles

**Files:**

- Create: `packages/components/.storybook/manager.ts`
- Modify: `packages/components/.storybook/main.ts`

- [ ] **Step 1: Give the manager the colours**

In `main.ts`, add the import beside the other codegen imports:

```ts
import { circlesFor } from '../../codegen/src/approvals/status.mjs';
```

and to `config`, after `core`:

```ts
  // Each component's approval circle (spec/approvals.yaml), for the sidebar: worked out here, in
  // Node, when Storybook starts or builds, and handed to the manager as a global (manager.ts).
  managerHead: async (head) =>
    `${head ?? ''}<script>window.SOLAR_APPROVALS = ${JSON.stringify(await circlesFor('web'))};</script>`,
```

- [ ] **Step 2: Show them**

Create `manager.ts`:

```ts
/**
 * The sidebar: each component's name after its approval circle, 🟢 approved, 🟡 ready to review,
 * 🔴 waiting on a component it uses (docs/engineering/workflows.md, Approve a component). The
 * circles are worked out in main.ts.
 */

import { addons } from 'storybook/manager-api';

const circles =
  (globalThis as { SOLAR_APPROVALS?: Record<string, string> })
    .SOLAR_APPROVALS ?? {};

addons.setConfig({
  sidebar: {
    renderLabel: (item) =>
      item.type === 'component' && circles[item.name]
        ? `${circles[item.name]} ${item.name}`
        : item.name,
  },
});
```

- [ ] **Step 3: Build and check**

```bash
npm run typecheck && npm run lint -w @bwp-web/components
npm run build-storybook -w @bwp-web/components
grep -o 'SOLAR_APPROVALS = {"[^"]*":"[^"]*"' packages/components/storybook-static/index.html | head -1
```

Expected: typecheck and lint pass; the build succeeds; the grep prints the start of the colours
map (find the build's output directory from the command's output if it is not `storybook-static`).
If `renderLabel`'s item type rejects `item.name` or `item.type`, type the parameter from
`storybook/manager-api`'s `API_HashEntry` and re-run.

### Task 8: Widgetbook's circles

**Files:**

- Modify: `scripts/widgetbook.mjs`, `packages/solar_flutter/widgetbook/lib/main.dart`

- [ ] **Step 1: Write the colours before each run**

In `scripts/widgetbook.mjs`, after the oracles are copied (after the `console.log` of the oracles),
add:

```js
// Each component's approval circle, for the sidebar. Beside the oracles, named so the app does not
// read it as one (it reads *.json there). Where the generator cannot load (the CI job that builds
// Widgetbook installs no npm packages), the app is built without circles.
try {
  const { circlesFor } =
    await import('../packages/codegen/src/approvals/status.mjs');
  writeFileSync(
    join(to, 'approvals.status'),
    JSON.stringify(await circlesFor('flutter')),
  );
  console.log('widgetbook: approval circles written');
} catch (error) {
  rmSync(join(to, 'approvals.status'), { force: true });
  console.log(
    `widgetbook: no approval circles (${error.message.split('\n')[0]})`,
  );
}
```

and add `writeFileSync` to the `node:fs` import. Update the file's header comment: one sentence
saying it also writes the approval circles.

- [ ] **Step 2: Read them in the app**

In `main.dart`, add beside `loadOracles`:

```dart
/// Each component's approval circle (🟢 🟡 🔴), written by scripts/widgetbook.mjs beside the
/// oracles; none where it wrote none.
Future<Map<String, String>> loadCircles() async {
  try {
    final text = await rootBundle.loadString('assets/verify/approvals.status');
    return (jsonDecode(text) as Map<String, dynamic>).cast<String, String>();
  } catch (_) {
    return const {};
  }
}
```

change `main` to `runApp(SolarWidgetbook(oracles: await loadOracles(), circles: await loadCircles()));`,
add `final Map<String, String> circles;` and `this.circles = const {}` to `SolarWidgetbook`, and
name each component `circles[name] == null ? name : '${circles[name]} $name'` in the
`WidgetbookComponent`. The use cases still take `name` (the component), not the label.

- [ ] **Step 3: Check**

```bash
(cd packages/solar_flutter && dart format widgetbook/lib && (cd widgetbook && flutter analyze))
node scripts/widgetbook.mjs build
ls packages/solar_flutter/widgetbook/assets/verify/approvals.status
git status --porcelain packages/solar_flutter/widgetbook
```

Expected: analyze passes; the build succeeds and prints "approval circles written"; the file exists;
git status lists only `lib/main.dart` (the status file is git-ignored with the oracles).

### Task 9: CI and the Verify block

**Files:**

- Modify: `.github/workflows/solar.yml`, `docs/engineering/workflows.md`

- [ ] **Step 1: CI**

In `solar.yml`, job "Generated code is up to date", after "Run the unit and parity suites", add:

```yaml
# Every approval in spec/approvals.yaml must still match what its component ships
# (docs/engineering/workflows.md, Approve a component).
- name: Every recorded approval still holds
  run: npm run solar:status -- --check
```

- [ ] **Step 2: The Verify block**

In `workflows.md`'s Verify block, after `npx vitest run`, add the line
`npm run solar:status -- --check`.

- [ ] **Step 3: Check**

```bash
npx prettier --check .github/workflows/solar.yml docs/engineering/workflows.md
```

### Task 10: The docs

**Files:**

- Modify: `CLAUDE.md`, `docs/engineering/workflows.md`, `docs/engineering/architecture.md`,
  `docs/engineering/decisions.md`, `docs/engineering/open-work.md`, `packages/codegen/README.md`,
  `packages/components/stories/README.md`, `packages/solar_flutter/widgetbook/README.md`

Each topic has one home (CLAUDE.md, "Keeping the docs true"): the mechanism's home is
architecture.md, the procedure's workflows.md, the internals' the codegen README; the others link.
Wrap prose by hand at 100 columns; run Prettier.

- [ ] **Step 1: CLAUDE.md** — in "Working with the owner", add:

```markdown
- **`spec/approvals.yaml` is the owner's.** Agents never edit it, and never work on a component
  `npm run solar:status` shows 🔴 (one that uses a component not yet approved): work bottom-up, on
  🟡 components. A change that cancels an approval fails the check until the owner re-approves.
```

- [ ] **Step 2: workflows.md** — a section "## Approve a component", after "Add a component":

```markdown
## Approve a component

A component is approved per platform, by a person, once they have confirmed it looks and behaves
as intended; the owner writes the record, never an agent.

1. `npm run solar:status` shows each platform's components: 🟢 approved, 🟡 ready to review, 🔴
   waiting on a component it uses (approve that first). Storybook's and Widgetbook's sidebars show
   the same circles.
2. Review the 🟡 component in its viewer, and have anything wrong fixed.
3. Paste the lines `solar:status` prints for it into `spec/approvals.yaml` (under its name, where
   it is already there for the other platform).

An approval holds while the component's fingerprint does: a change to anything it ships (its
shell, a component it uses, a helper, its recipe, a token's value) cancels it and every approval
above it, and `solar:status -- --check`, in CI and the Verify block, fails until the component is
approved again or the change reverted. How it works: [architecture.md, Approvals](architecture.md#approvals).
```

In "Upgrade a dependency", add: "An upgrade of what a platform's components run on (React, MUI,
Emotion or MUI X Charts on the web; Flutter on the other) clears that platform's approvals in
`spec/approvals.yaml` in the same change: behaviour can change without any fingerprint moving."

- [ ] **Step 3: architecture.md** — a section "## Approvals", before "## CI and deployment":

```markdown
## Approvals

The checks prove each platform draws what Figma draws; a person still confirms each component
before it ships. `spec/approvals.yaml` records that, per component and platform, as the
component's **fingerprint**: a SHA-256 of every file it ships (its shell, the shells of the
components it uses, the runtime helpers, its recipe; on the web its icons), each read as its code
alone, without comments or layout, and on the web the value of every token those files name
(Flutter's files include `tokens.dart`). esbuild's metafile gives the web's files, the Dart imports
Flutter's; the bundler's output is never hashed, so upgrading it moves nothing. A component uses
another when it ships the other's shell.

An approval holds while its fingerprint does. A component is 🟢 approved with every component it
uses 🟢, 🟡 unapproved with every component it uses 🟢, and 🔴 otherwise, so approval goes
bottom-up, and a child's change cancels every approval above it. `npm run solar:status` prints the
colours; `-- --check` fails on an approval that no longer holds, on one recorded for a 🔴
component, on an unknown name, and on a cycle. The code is `packages/codegen/src/approvals/`.
```

And in the CI table's "Generated code is up to date" row, Checks: append "; `solar:status --check`".
Fix, append: "; for a cancelled approval, re-approve it or revert
([workflows.md](workflows.md#approve-a-component))".

- [ ] **Step 4: decisions.md** — rows in "Process and repository" (Status `Owner 2026-09-26`):

| Decision                                                                                                                                                                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A person approves each component per platform before it ships; `spec/approvals.yaml` is written by people alone. A component is 🟢 approved with every component it uses 🟢, 🟡 unapproved with every one it uses 🟢, 🔴 otherwise, and a 🔴 component is not worked on. |
| An approval is the component's fingerprint: its shipped files as code alone, and on the web its tokens' values; a change to any of them cancels it and every approval above it, and CI fails until it is re-approved or reverted. The bundler resolves files only.       |
| Approvals are recorded by editing the file for now; the viewers show the same circle characters (🟢 🟡 🔴) in their sidebars.                                                                                                                                            |
| Bar, Line and Donut Chart are approved as components with their wrappers; a peer upgrade (React, MUI, Emotion, MUI X Charts; Flutter) clears that platform's approvals.                                                                                                  |

and in "Pipeline and generator", Status `Taken`: "Flutter's fingerprints include all of
`tokens.dart`, so any token change cancels every Flutter approval; the web names its tokens one by
one."

- [ ] **Step 5: open-work.md** — under "## Designed, not built", add:
      "- **Recording approvals from the viewers**: an Approve action in Storybook and Widgetbook, in
      place of pasting the line `solar:status` prints into `spec/approvals.yaml`."

- [ ] **Step 6: codegen README** — in "## Changing it", add a bullet:
      "- **`solar:status`** (`bin/solar-status.mjs`, `src/approvals/`): each platform's components, the
      files each ships and its fingerprint, against `spec/approvals.yaml`; writes nothing. How approvals
      work: [architecture.md, Approvals](../../docs/engineering/architecture.md#approvals)." And in
      "## Layout", add `src/approvals/` with "the files each component ships, its fingerprint, and the
      approval check (`solar:status`)".

- [ ] **Step 7: The viewers' READMEs** — one line each: Storybook
      (`packages/components/stories/README.md`): "Each component's name in the sidebar follows its
      approval circle, 🟢 🟡 🔴 ([workflows.md, Approve a component](../../../docs/engineering/workflows.md#approve-a-component)),
      worked out when Storybook starts or builds." Widgetbook: the same, "written by
      `scripts/widgetbook.mjs` before each run; a build without the generator's npm packages (CI's) has
      none."

- [ ] **Step 8: Check**

```bash
npx prettier --check CLAUDE.md docs/engineering/*.md packages/codegen/README.md packages/components/stories/README.md packages/solar_flutter/widgetbook/README.md
node /private/tmp/claude-502/-Users-e-joon-ko-Documents-github-workplace-public-packages/8e14facf-912e-4d52-9535-199f52583395/scratchpad/check-links.mjs CLAUDE.md docs/engineering/*.md packages/codegen/README.md packages/components/stories/README.md packages/solar_flutter/widgetbook/README.md
```

### Task 11: Verify

- [ ] **Step 1: The whole Verify block**, as `docs/engineering/workflows.md` lists it (now with
      `solar:status --check`), in order, once, not in parallel with anything else:

```bash
bash /private/tmp/claude-502/-Users-e-joon-ko-Documents-github-workplace-public-packages/8e14facf-912e-4d52-9535-199f52583395/scratchpad/verify.sh
```

(add a `step status npm run solar:status -- --check` line after `vitest` in that script first).
Expected: every step exits 0; the rebuild leaves generated files unchanged; `git status` lists only
this plan's files.

- [ ] **Step 2: Report**, per task: what was built, test results, anything the code contradicted.
