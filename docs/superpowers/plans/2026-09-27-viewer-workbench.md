# Viewer workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** A local, dev-only workbench in Storybook and Widgetbook: change a component's look by
choosing a SOLAR token (written as an overlay `set` rule), send anything else to an agent as a
note, and approve or withdraw an approval, from the Playground.

**Architecture:** One local Node service (`scripts/workbench.mjs`, port 6011) is the only thing
that writes. Its logic is pure, dependency-injected modules in `packages/codegen/src/workbench/`,
tested with vitest. Each viewer draws the same bar above the Playground from SOLAR components and
talks to the service over HTTP, long-polling for events. Static builds never include or call it.

**Tech Stack:** Node 22 (`node:http`, `yaml` document API), vitest, React 19 on MUI 9 with SOLAR
components, Playwright, Flutter 3.47.5 with Widgetbook 3.25 and `package:http`.

**Spec:** [docs/superpowers/specs/2026-09-27-viewer-workbench-design.md](../specs/2026-09-27-viewer-workbench-design.md).

---

## Rules for every task (from CLAUDE.md; hard)

- **No git write commands**: no `add`, `commit`, `stash`, `checkout`, `reset`, worktrees. Where
  this skill's template says "Commit", **stop instead**: the owner commits. `git status` and
  `git diff` are fine.
- `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH` before any `node`/`npm`/`npx`;
  check `node -v` prints `v22.23.2`.
- **Never edit `spec/approvals.yaml`, and never make a test touch it.** Every test that writes
  approvals uses a temporary file (`mkdtempSync`). The real service writes it only when a person
  presses a button; no agent ever calls `/approve` or `/unapprove` against the real service.
- **Never leave a `TODO(reason)` in `spec/overlay/`**, never hand-edit a generated file, never edit
  `docs/` (other than `docs/engineering/` and `docs/superpowers/` pages this plan names), never
  loosen a visual check or edit `spec/verify/`.
- `rm -rf` is denied; use `rm` on exact paths.
- After touching `packages/codegen` or `spec/overlay`, run `npm run solar:codegen` and keep what it
  writes; `git status --porcelain -- spec packages/*/src/generated packages/solar_flutter/lib/src/generated`
  must then be empty unless the task says otherwise.
- Stop for the owner's review at the end of each batch (after Tasks 10, 15, 18 and 22).

## Decisions this plan takes beyond the spec (record in decisions-to-review, Task 23)

1. The service's logic lives in `packages/codegen/src/workbench/` (it imports the generator's
   modules and `yaml`, and codegen's vitest runs its tests), the process in `scripts/workbench.mjs`
   and its launcher in `scripts/workbench-launch.mjs`. The spec said `scripts/workbench/`.
2. **Long-polling** (`GET /events?after=<seq>`, answered within 25 s) instead of server-sent
   events: Dart's `http` package does it identically on the VM (widget tests) and the web, with no
   conditional imports.
3. **Inspect and Report need the component 🟡 on both platforms** (or absent from one). A look edit
   reaches both, and 🔴 on either means it waits on an unapproved component there.
4. **One pending edit in the repository at a time**, persisted with the overlay's bytes before it
   in `.workbench/pending.json` (git-ignored), so Undo survives a service restart.
5. The sidebars' circles refresh when the viewer next starts; the bar shows the live circle.
   (Widgetbook's use-case names carry the circle, so changing it live would change the URL.)
6. The bar's sections are chosen with SOLAR Buttons (the selected one `secondary`, the others
   `tertiary`), not Tabs.
7. The web's per-component visual check is chosen with `SOLAR_VISUAL_ONLY=<Name>`, read by
   `components.spec.mjs`; unset (CI, the Verify block), every component runs as today.
8. `.gitignore`'s `.claude/skills/` becomes `.claude/skills/*` plus `!.claude/skills/solar-feedback/`,
   so the project skill is committed while personal skills stay ignored.
9. The end-to-end tests drive each bar against a fake client; a real token change reaching the
   component is proved by the batch-end smoke run against the real service (Tasks 10 and 15).

## File structure

**Service logic** (`packages/codegen/src/workbench/`, tests in `packages/codegen/test/`):

| File                 | Responsibility                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| `tokens.mjs`         | the semantic tokens a cell may take, each with its value as text                               |
| `scopes.mjs`         | the looks a `set` rule for a cell in a variant may be keyed on, as overlay keys in Figma names |
| `inspect.mjs`        | a component's inspection: variants, layers, cells, each cell's entry, scopes and choices       |
| `overlay-edit.mjs`   | add, replace or delete one `set` entry in an overlay file's text, touching no other line       |
| `approvals-edit.mjs` | add or remove approval lines in `approvals.yaml`'s text; which approvals a withdrawal takes    |
| `feedback.mjs`       | a Report note's file name and text (Batch 3)                                                   |
| `checks.mjs`         | a component's own checks: the commands, and the failures their reports hold (Batch 4)          |
| `session.mjs`        | the service's state and operations, with every effect injected                                 |

**Process:** `scripts/workbench.mjs` (HTTP server over a real session), `scripts/workbench-launch.mjs`
(`ensureWorkbench`).

**Storybook** (`packages/components/stories/workbench/`): `client.ts`, `Bar.tsx`, `pick.ts`;
changes to `stories/playground/adapter.tsx` and `.storybook/main.ts`; test page
`test/visual/workbench-page.tsx`, `test/visual/workbench.spec.mjs`, a unit test
`test/workbench-pick.test.mjs`.

**Widgetbook** (`packages/solar_flutter/widgetbook/lib/workbench/`): `models.dart`, `client.dart`,
`bar.dart`; changes to `lib/playground/adapter.dart`, `pubspec.yaml`, `scripts/widgetbook.mjs`;
test `test/workbench_bar_test.dart`.

**Other:** `packages/codegen/src/normalize/overlay.mjs` and `bin/solar-codegen.mjs` (`--pending`),
`packages/components/test/visual/components.spec.mjs` (`SOLAR_VISUAL_ONLY`),
`.claude/skills/solar-feedback/SKILL.md`, `spec/feedback/.gitkeep`, `.gitignore`, docs.

## The HTTP contract (both clients and the server use exactly this)

All bodies JSON. Errors: status 4xx/5xx with `{ "error": "<one sentence>" }`.

| Method, path              | Body / query                                                          | Answer                                                   |
| ------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------- |
| `GET /health`             |                                                                       | `{ service: "solar-workbench" }`                         |
| `GET /status`             |                                                                       | `Status` (below)                                         |
| `GET /component`          | `?name=Button&variant=0`                                              | `Inspection` (below)                                     |
| `POST /set`               | `{ component, variant, layer, cell, scope, value, revision }`         | `Status`                                                 |
| `POST /keep`              | `{ component, reason }`                                               | `{ ok: true }` or `{ ok: false, failures: Failure[] }`   |
| `POST /undo`              | `{ component }`                                                       | `Status`                                                 |
| `POST /report`            | `{ component, platform, controls, layer?, variant?, note }` (Batch 3) | `{ file }`                                               |
| `POST /send`              | `{ component, platform, note }` (Batch 4)                             | `{ file }`                                               |
| `POST /approve`           | `{ component, platform }`                                             | `{ ok: true }` or `{ ok: false, failures: Failure[] }`   |
| `POST /unapprove/preview` | `{ component, platform }`                                             | `{ withdraws: string[] }`                                |
| `POST /unapprove`         | `{ component, platform }`                                             | `{ withdraws: string[] }`                                |
| `GET /events`             | `?after=<seq>`                                                        | `{ seq, events: [{ seq, type, message? }] }` within 25 s |

- `Status`: `{ busy: string | null, pending: Pending | null, components: { [name]: { web: Colour | null, flutter: Colour | null, waitsOn: { web: string[], flutter: string[] }, editable: boolean, locked: string | null } } }`, `busy` is null in the answer to a POST (the operation has finished); `Colour` one of `"green" | "yellow" | "red"`.
- `Pending`: `{ component, key, value, deletes: boolean, previousReason: string | null, failing: Failure[] | null, borrowers: string[] }` (`borrowers`: the rules whose reason is borrowed from the entry, whose reason therefore changes too).
- `Inspection`: `{ component, revision, variants: [{ index, name }], variant, layers: [{ name, className: string | null, hidden: boolean, cells: [{ cell, entry: string, at: string | null, scopes: [{ label, key }], choices: [{ name, value }], keywords: string[], none: boolean, note?: string }] }] }` (`note`: why a cell offers nothing, an `allowLiteral` cell).
- `Failure`: `{ platform: "web" | "flutter" | "parity", variant?, layer?, property?, figma?, drawn?, message? }`.
- `value` in `/set`: `{ token }`, `{ keyword }` (`FILL` or `HUG`) or `{ none: true }`.
- Event `type`: `busy` (with `message`), `changed` (refetch status and the inspection), `failed`
  (with `message`).

---

# Batch 1: the service's core

### Task 1: `solar:codegen --pending` lets a pending reason through

**Files:**

- Modify: `packages/codegen/src/normalize/overlay.mjs` (near `PLACEHOLDER`, line ~285, and the
  check at line ~272)
- Modify: `packages/codegen/bin/solar-codegen.mjs` (after the imports)
- Test: `packages/codegen/test/overlay-pending.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/overlay-pending.test.mjs
import { afterEach, describe, expect, it } from 'vitest';
import {
  allowPlaceholders,
  parseOverlay,
  PLACEHOLDER,
} from '../src/normalize/overlay.mjs';

const text = `set:\n  root.base.width:\n    keyword: FILL\n    reason: ${PLACEHOLDER}\n`;

describe('a pending reason', () => {
  afterEach(() => allowPlaceholders(false));

  it('is refused by default, as the proposer’s placeholder', () => {
    expect(() => parseOverlay(text, 'spec/overlay/x.yaml')).toThrow(
      /still the proposer's placeholder/,
    );
  });

  it('is let through while the workbench’s pending edit is being previewed', () => {
    allowPlaceholders(true);
    expect(() => parseOverlay(text, 'spec/overlay/x.yaml')).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/overlay-pending.test.mjs`
Expected: FAIL, `allowPlaceholders is not a function` (or not exported).

- [ ] **Step 3: Implement**

In `overlay.mjs`, just above `export const PLACEHOLDER`:

```js
/**
 * Whether `TODO(reason)` is let through: only while the workbench previews a pending edit
 * (`solar:codegen --pending`, scripts/workbench.mjs), never in a plain build, the Verify block or CI.
 */
let placeholders = false;
export const allowPlaceholders = (on) => {
  placeholders = on;
};
```

and change the check (the `if` that fails with "its reason is still the proposer's placeholder") to
begin `if (!placeholders && typeof rule?.reason === 'string' && …`.

In `bin/solar-codegen.mjs`, import `allowPlaceholders` from `../src/normalize/overlay.mjs` and,
right after the imports:

```js
// The workbench's preview of a pending edit, whose reason a person has not written yet
// (scripts/workbench.mjs). Nothing else passes it: a plain run refuses the placeholder.
if (process.argv.includes('--pending')) allowPlaceholders(true);
```

Add the flag to the file's header comment (`--pending   the workbench's preview; lets TODO(reason) through`).

- [ ] **Step 4: Run the tests**

Run: `cd packages/codegen && npx vitest run test/overlay-pending.test.mjs test/overlay.test.mjs`
Expected: PASS.

- [ ] **Step 5: Regenerate and confirm nothing moved**

Run: `npm run solar:codegen && git status --porcelain -- spec packages/styles/src/generated packages/assets/src/generated packages/solar_flutter/lib/src/generated packages/components/stories`
Expected: no output.

### Task 2: the tokens a cell may take

**Files:**

- Create: `packages/codegen/src/workbench/tokens.mjs`
- Test: `packages/codegen/test/workbench-tokens.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-tokens.test.mjs
import { beforeAll, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { tokenChoices } from '../src/workbench/tokens.mjs';

let tokens;
beforeAll(() => {
  ({ tokens } = stage.build());
});

describe('the tokens a cell may take', () => {
  it('are the semantic tokens of the current token’s kind, never a primitive', () => {
    const choices = tokenChoices(
      tokens,
      'background',
      'color.action.primary.bg.default',
    );
    const names = choices.map((c) => c.name);
    expect(names).toContain('color.action.primary.bg.default');
    expect(names).toContain('color.text.primary');
    expect(names.some((n) => n.startsWith('color.brand.'))).toBe(false);
    expect(names.some((n) => n.startsWith('inset.'))).toBe(false);
  });

  it('show a colour’s Light and Dark values', () => {
    const c = tokenChoices(
      tokens,
      'background',
      'color.action.primary.bg.default',
    ).find((x) => x.name === 'color.action.primary.bg.default');
    expect(c.value).toBe('#111111 / #f5f5f5');
  });

  it('put inset and stack together, as spacing', () => {
    const names = tokenChoices(tokens, 'paddingLeft', 'inset.sm').map(
      (c) => c.name,
    );
    expect(names).toContain('inset.md');
    expect(names).toContain('stack.md');
    expect(names).not.toContain('radius.control');
  });

  it('fall back to the cell’s kind where the cell has no token', () => {
    const names = tokenChoices(tokens, 'radius', null).map((c) => c.name);
    expect(names).toContain('radius.control');
    expect(tokenChoices(tokens, 'x', null)).toEqual([]);
  });

  it('show a text style as its size, line height and weight', () => {
    const c = tokenChoices(tokens, 'typography', 'typography.label.md').find(
      (x) => x.name === 'typography.label.md',
    );
    expect(c.value).toBe('14px/20px 500');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-tokens.test.mjs`
Expected: FAIL, cannot find module `../src/workbench/tokens.mjs`.

- [ ] **Step 3: Implement**

```js
// packages/codegen/src/workbench/tokens.mjs
/**
 * The tokens the workbench offers for a cell (docs/superpowers/specs/…-viewer-workbench-design.md,
 * Inspect): the semantic tokens of the kind of the cell's current token, primitives never, each with
 * its value as a person reads it. Where the cell has no token, the kind its cell names.
 */

import { flattenSpec } from '../spec.mjs';

/** Spacing is one kind whichever scale names it: a gap is often an inset, a padding a stack. */
const SPACING = new Set(['inset', 'stack']);

/** A token's kind: its type, and for a dimension the scale it belongs to. */
export function kindOf(token) {
  if (token.type !== 'dimension') return token.type;
  const group = token.name.split('.')[0];
  return SPACING.has(group) ? 'spacing' : group;
}

const sides = (cell) => ['Top', 'Right', 'Bottom', 'Left'].map((s) => cell + s);

/** The kinds a cell takes where it has no token to go by; none for a position. */
const CELL_KINDS = {
  background: ['color'],
  borderColor: ['color'],
  color: ['color'],
  typography: ['typography'],
  shadow: ['shadow'],
  gap: ['spacing'],
  ...Object.fromEntries(sides('padding').map((c) => [c, ['spacing']])),
  radius: ['radius'],
  radiusTopLeft: ['radius'],
  radiusTopRight: ['radius'],
  radiusBottomRight: ['radius'],
  radiusBottomLeft: ['radius'],
  borderWidth: ['border'],
  ...Object.fromEntries(
    ['Top', 'Right', 'Bottom', 'Left'].map((s) => [
      `border${s}Width`,
      ['border'],
    ]),
  ),
  width: ['size', 'icon', 'layout'],
  height: ['size', 'icon', 'layout'],
};

/** The cells a sizing keyword (`FILL`, `HUG`) may be set on. */
export const KEYWORD_CELLS = new Set(['width', 'height']);

/** A token's value as text: a colour's Light and Dark, a text style's size, line height, weight. */
export function valueText(token) {
  const modes = token.modes;
  if (modes?.light !== undefined && modes?.dark !== undefined)
    return modes.light === modes.dark
      ? String(modes.light)
      : `${modes.light} / ${modes.dark}`;
  const v = token.value;
  if (token.type === 'typography')
    return `${v.fontSize}/${v.lineHeight} ${v.fontWeight}`;
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

/**
 * @param {object} tokens the token spec (`stage.build().tokens`)
 * @param {string} cell an IR cell (`background`, `paddingLeft`, `typography`)
 * @param {string | null} current the token the cell names now, if any
 * @returns {{name: string, value: string}[]} in the token spec's order
 */
export function tokenChoices(tokens, cell, current) {
  const semantic = flattenSpec(tokens).filter(
    (t) => t.ext?.tier === 'semantic',
  );
  const now = current && semantic.find((t) => t.name === current);
  const kinds = now ? [kindOf(now)] : (CELL_KINDS[cell] ?? []);
  return semantic
    .filter((t) => kinds.includes(kindOf(t)))
    .map((t) => ({ name: t.name, value: valueText(t) }));
}
```

- [ ] **Step 4: Run the test**

Run: `cd packages/codegen && npx vitest run test/workbench-tokens.test.mjs`
Expected: PASS. If `color.text.primary` or `stack.md` is not a token name, pick another semantic
name of that kind from `node -e` over `flattenSpec` and adjust the test, not the code.

### Task 3: the scopes a rule may be keyed on

A `set` key is `<layer>.<section>.<keys…>.<cell>`, in **Figma's** axis names and values (the
overlay's `rename` applies after it) but the **IR's** state names (`states.rename` applies before
the recipe), and a scope is offered only where the build's `set` accepts it; the recipe lookup
(`src/explain/index.mjs`, `lookupCell`) works in the IR's. Sections: `base` (no keys), `size`
(size), `appearance` (look, state), `combined` (size, look, state). A look is
`axis=value, axis=value` in the order `appearanceAxes` gives, or `default` where there are none.

**Files:**

- Modify: `packages/codegen/src/explain/index.mjs` (export `appearanceAxes`)
- Create: `packages/codegen/src/workbench/scopes.mjs`
- Test: `packages/codegen/test/workbench-scopes.test.mjs`

- [ ] **Step 1: Export `appearanceAxes`**

In `src/explain/index.mjs` change `function appearanceAxes(spec)` to
`export function appearanceAxes(spec)`.

- [ ] **Step 2: Write the failing test**

```js
// packages/codegen/test/workbench-scopes.test.mjs
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { overlayDir, overlayFileOf } from '../src/normalize/overlay.mjs';
import * as stage from '../src/stages/components.mjs';
import { figmaSpelling, scopesFor, stateOf } from '../src/workbench/scopes.mjs';

let built;
const find = (name) => built.find((b) => b.spec.component === name);
const overlayOf = (name) => {
  const address = stage.COMPONENTS[stage.NAMES.indexOf(name)];
  return parse(readFileSync(join(overlayDir, overlayFileOf(address)), 'utf8'));
};
beforeAll(() => {
  ({ built } = stage.build());
});

describe('the scopes a set rule may be keyed on', () => {
  it('run from every variant to the one in view, for Button md primary at rest', () => {
    const b = find('Button');
    const v = b.oracle.variants.find(
      (x) => x.figma === 'size=md, prio=primary, state=default, danger=false',
    );
    const keys = scopesFor(
      b.spec,
      overlayOf('Button'),
      'root',
      'background',
      v,
    ).map((s) => s.key);
    expect(keys[0]).toBe('root.base.background');
    expect(keys).toContain('root.size.md.background');
    expect(keys).toContain(
      'root.appearance.prio=primary, danger=false.default.background',
    );
    expect(keys).toContain(
      'root.combined.md.prio=primary, danger=false.default.background',
    );
  });

  it('carry the IR path beside the key, for reading the entry there', () => {
    const b = find('Button');
    const v = b.oracle.variants[0];
    const base = scopesFor(
      b.spec,
      overlayOf('Button'),
      'root',
      'background',
      v,
    )[0];
    expect(base.path).toEqual(['base']);
  });

  it('spell a renamed axis as Figma does: All-Day Bar’s variant is Figma’s style', () => {
    const doc = overlayOf('All-Day Bar');
    expect(figmaSpelling(doc, 'variant=solid, span=end')).toBe(
      'style=solid, span=end',
    );
  });

  it('name the state that holds in the variant, or default', () => {
    const b = find('Button');
    const hover = b.oracle.variants.find((x) => x.state === 'hover');
    expect(stateOf(b.spec, hover)).toBe('hover');
    expect(stateOf(b.spec, b.oracle.variants[0])).toBe('default');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-scopes.test.mjs`
Expected: FAIL, cannot find module `../src/workbench/scopes.mjs`.

- [ ] **Step 4: Implement**

```js
// packages/codegen/src/workbench/scopes.mjs
/**
 * The looks a workbench `set` rule for one cell may be keyed on, from every variant (`base`) to the
 * one in view (`combined`), each as the overlay key a person would write: in Figma's axis names and
 * values, since `rename` and `states.rename` apply after `set` (spec/overlay/README.md, `rename`).
 * The IR path beside each key is where the recipe lookup reads the entry (explain/index.mjs).
 */

import { statePrecedence } from '../emit/flutter-component.mjs';
import { appearanceAxes, recipeProps } from '../explain/index.mjs';

/** The platform state that holds in a variant, by the recipe's precedence, or `default`. */
export function stateOf(spec, variant) {
  const props = recipeProps(spec, variant);
  for (const state of statePrecedence(spec.component)) {
    const holds = spec.states.includes(state)
      ? variant.state === state
      : props[state] === true;
    if (holds) return state;
  }
  return 'default';
}

/** One IR axis name and value in Figma's spelling, by the overlay's `rename`. */
function figmaPair(doc, axis, value) {
  for (const [figmaAxis, rule] of Object.entries(doc?.rename ?? {})) {
    const codeAxis = rule?.to ?? figmaAxis;
    if (codeAxis !== axis) continue;
    const figmaValue = Object.entries(rule?.values ?? {}).find(
      ([, code]) => String(code) === String(value),
    )?.[0];
    return [figmaAxis, figmaValue ?? value];
  }
  return [axis, value];
}

/** A look (`variant=solid, span=end`) in Figma's spelling (`style=solid, span=end`). */
export function figmaSpelling(doc, look) {
  if (look === 'default') return look;
  return look
    .split(', ')
    .map((pair) => {
      const [axis, value] = pair.split('=');
      return figmaPair(doc, axis, value).join('=');
    })
    .join(', ');
}

/** A state in Figma's spelling, by `states.rename`. */
function figmaState(doc, state) {
  const hit = Object.entries(doc?.states?.rename ?? {}).find(
    ([, rule]) => rule?.to === state,
  );
  return hit?.[0] ?? state;
}

/**
 * @param {object} spec the component's IR
 * @param {object | null} doc its overlay, parsed (for the renames)
 * @param {string} layer an IR layer
 * @param {string} cell an IR cell
 * @param {object} variant one of the oracle's variants
 * @returns {{label: string, key: string, path: string[]}[]} broadest first
 */
export function scopesFor(spec, doc, layer, cell, variant) {
  const props = recipeProps(spec, variant);
  const axes = appearanceAxes(spec);
  const look =
    axes.map((a) => `${a}=${String(props[a])}`).join(', ') || 'default';
  const size = 'size' in spec.api ? String(props.size) : null;
  const state = stateOf(spec, variant);
  const figmaSize = size && figmaPair(doc, 'size', size)[1];
  const figmaLook = figmaSpelling(doc, look);
  const fState = figmaState(doc, state);
  const out = [
    { label: 'every variant', key: `${layer}.base.${cell}`, path: ['base'] },
  ];
  if (size)
    out.push({
      label: `size ${size}`,
      key: `${layer}.size.${figmaSize}.${cell}`,
      path: ['size', size],
    });
  if (axes.length || state !== 'default')
    out.push({
      label: `${look} · ${state}`,
      key: `${layer}.appearance.${figmaLook}.${fState}.${cell}`,
      path: ['appearance', look, state],
    });
  if (size && axes.length)
    out.push({
      label: `${size} · ${look} · ${state}`,
      key: `${layer}.combined.${figmaSize}.${figmaLook}.${fState}.${cell}`,
      path: ['combined', size, look, state],
    });
  return out;
}
```

- [ ] **Step 5: Run the tests**

Run: `cd packages/codegen && npx vitest run test/workbench-scopes.test.mjs test/explain.test.mjs`
Expected: PASS. The session (Task 8) also proves each written key by rebuilding, so a spelling this
misses fails loudly there rather than writing a rule that does nothing.

### Task 4: the inspection

**Files:**

- Create: `packages/codegen/src/workbench/inspect.mjs`
- Test: `packages/codegen/test/workbench-inspect.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-inspect.test.mjs
import { beforeAll, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { inspect } from '../src/workbench/inspect.mjs';

let build;
beforeAll(() => {
  build = stage.build();
});

describe('a component’s inspection', () => {
  it('lists its variants and, for the one asked, each layer’s cells', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    expect(i.component).toBe('Button');
    expect(i.variants[0]).toEqual({
      index: 0,
      name: build.built.find((b) => b.spec.component === 'Button').oracle
        .variants[0].figma,
    });
    const root = i.layers.find((l) => l.name === 'root');
    expect(root.className).toBeNull();
    const bg = root.cells.find((c) => c.cell === 'background');
    expect(bg.entry).toMatch(/^color\./);
    expect(bg.at).toBeTruthy();
    expect(bg.scopes[0].key).toBe('root.base.background');
    expect(bg.choices.length).toBeGreaterThan(10);
    expect(bg.keywords).toEqual([]);
  });

  it('reads a text style as one cell, not six properties', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const label = i.layers.find((l) => l.name === 'label');
    expect(label.cells.filter((c) => c.cell === 'typography')).toHaveLength(1);
    expect(label.className).toBe('SolarButton-label');
  });

  it('offers FILL and HUG on a width', () => {
    const i = inspect(build, 'Button', 0, { overlayText: '' });
    const w = i.layers.flatMap((l) => l.cells).find((c) => c.cell === 'width');
    if (w) expect(w.keywords).toEqual(['FILL', 'HUG']);
  });

  it('carries the overlay file’s revision, for refusing a stale write', () => {
    const a = inspect(build, 'Button', 0, { overlayText: 'a' });
    const b = inspect(build, 'Button', 0, { overlayText: 'b' });
    expect(a.revision).not.toBe(b.revision);
  });

  it('fails for a component that does not exist', () => {
    expect(() => inspect(build, 'Nope', 0, { overlayText: '' })).toThrow(
      /no component Nope/,
    );
  });
});
```

If `label`'s class is not `SolarButton-label` (the slot may be named otherwise), use what
`layerClass(spec, 'label')` gives and keep the assertion.

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-inspect.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement**

```js
// packages/codegen/src/workbench/inspect.mjs
/**
 * What the workbench's Inspect shows for one variant of a component: `solar:explain`'s reading,
 * as data. Each layer with its web class (for pointing), and each cell once (a text style is one
 * cell, not its six properties): the entry that wins, where it sits, the scopes a rule may be keyed
 * on, and the tokens, keywords and `none` it may be set to.
 */

import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { entryText, lookupCell } from '../explain/index.mjs';
import { layerClass } from '../util/classes.mjs';
import { CELL_OF_PROPERTY } from './cells.mjs';
import { scopesFor } from './scopes.mjs';
import { KEYWORD_CELLS, tokenChoices } from './tokens.mjs';

export const revisionOf = (text) =>
  createHash('sha256')
    .update(text ?? '')
    .digest('hex')
    .slice(0, 16);

/** The built component by its name, or a thrown error naming it. */
export function builtOf(build, name) {
  const found = build.built.find((b) => b.spec.component === name);
  if (!found) throw new Error(`no component ${name}`);
  return found;
}

/**
 * @param {{built: object[], tokens: object}} build `stage.build()`
 * @param {string} name the component's name (`Button`)
 * @param {number} index an oracle variant's index
 * @param {{overlayText: string}} files the component's overlay file as it is on disk ('' if none)
 */
export function inspect(build, name, index, { overlayText }) {
  const { spec, oracle } = builtOf(build, name);
  const variant = oracle.variants[index];
  if (!variant) throw new Error(`${name} has no variant ${index}`);
  const doc = overlayText ? parse(overlayText) : null;
  const layers = Object.entries(variant.layers).map(([layer, values]) => {
    const cells = [
      ...new Set(
        Object.keys(values)
          .map((p) => CELL_OF_PROPERTY[p])
          .filter(Boolean),
      ),
    ];
    return {
      name: layer,
      className: layerClass(spec, layer),
      hidden: Boolean(values.hidden),
      cells: cells.map((cell) => {
        const hit = lookupCell(spec, layer, cell, variant);
        const current = hit?.entry?.token ?? null;
        return {
          cell,
          entry: entryText(hit?.entry),
          at: hit?.at ?? null,
          scopes: scopesFor(spec, doc, layer, cell, variant).map(
            ({ label, key }) => ({ label, key }),
          ),
          choices: tokenChoices(build.tokens, cell, current),
          keywords: KEYWORD_CELLS.has(cell) ? ['FILL', 'HUG'] : [],
          none: true,
        };
      }),
    };
  });
  return {
    component: spec.component,
    revision: revisionOf(overlayText),
    variants: oracle.variants.map((v, i) => ({ index: i, name: v.figma })),
    variant: index,
    layers,
  };
}
```

and the property-to-cell table, exported once so `inspect` and the session agree:

```js
// packages/codegen/src/workbench/cells.mjs
/** The IR cell each oracle property belongs to (`fontSize` is `typography`'s): verify/oracle.mjs. */
import { PROPERTIES_OF } from '../verify/oracle.mjs';

export const CELL_OF_PROPERTY = Object.fromEntries(
  Object.entries(PROPERTIES_OF).flatMap(([cell, props]) =>
    props.map((p) => [p, cell]),
  ),
);
```

(Add `cells.mjs` to the file structure table's list when you write docs in Task 23.)

- [ ] **Step 4: Run the test**

Run: `cd packages/codegen && npx vitest run test/workbench-inspect.test.mjs`
Expected: PASS.

### Task 5: editing one `set` entry in an overlay's text

The edit splices text: only the entry's own lines change, every comment and every other rule stays
byte for byte (the `yaml` document API is used to find ranges and to render the one entry, never to
re-print the file, which would re-fold every reason).

**Files:**

- Create: `packages/codegen/src/workbench/overlay-edit.mjs`
- Test: `packages/codegen/test/workbench-overlay-edit.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-overlay-edit.test.mjs
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { readSetEntry, writeSetEntry } from '../src/workbench/overlay-edit.mjs';

const FILE = `# Button: decisions.
bind:
  # a comment on bind
  root.height:
    literal: 40
    token: size.control.md
    reason: A reason.

set:
  # the first rule
  root.base.width:
    keyword: FILL
    reason: >-
      A long reason that Prettier folded over two lines because it is longer than the width of
      the page.
  label.base.color:
    token: color.text.primary
    reason: Another.
`;

describe('editing one set entry', () => {
  it('adds an entry at the end of set, leaving every other line as it was', () => {
    const out = writeSetEntry(
      FILE,
      'root.base.radius',
      { token: 'radius.control' },
      'Why.',
    );
    expect(out.startsWith(FILE.trimEnd())).toBe(true);
    expect(parse(out).set['root.base.radius']).toEqual({
      token: 'radius.control',
      reason: 'Why.',
    });
  });

  it('replaces an entry in place, its neighbours and comments untouched', () => {
    const out = writeSetEntry(
      FILE,
      'root.base.width',
      { keyword: 'HUG' },
      'Hugs.',
    );
    expect(out).toContain(
      '# the first rule\n  root.base.width:\n    keyword: HUG\n    reason: Hugs.\n  label.base.color:',
    );
    expect(out).toContain('# a comment on bind');
    expect(parse(out).set['label.base.color'].reason).toBe('Another.');
  });

  it('deletes an entry, and the set section once it is empty', () => {
    let out = writeSetEntry(FILE, 'root.base.width', null);
    expect(parse(out).set['root.base.width']).toBeUndefined();
    out = writeSetEntry(out, 'label.base.color', null);
    expect(parse(out).set).toBeUndefined();
    expect(out).toContain('bind:');
  });

  it('adds a set section to a file with none, or starts a file', () => {
    const out = writeSetEntry(
      'bind: {}\n',
      'root.base.gap',
      { token: 'inset.xs' },
      'Gap.',
    );
    expect(parse(out).set['root.base.gap'].token).toBe('inset.xs');
    expect(
      parse(writeSetEntry('', 'root.base.gap', { none: true }, 'No gap.')).set,
    ).toEqual({
      'root.base.gap': { none: true, reason: 'No gap.' },
    });
  });

  it('folds a long reason as the files do, and keeps a look’s key unquoted', () => {
    const long =
      'A reason long enough to need folding across more than one line of the overlay file, as people write them.';
    const out = writeSetEntry(
      FILE,
      'title.appearance.style=solid, span=end.default.typography',
      { token: 'typography.label.md' },
      long,
    );
    expect(out).toContain(
      '  title.appearance.style=solid, span=end.default.typography:\n',
    );
    expect(out).toContain('    reason: >-\n');
    expect(
      parse(out).set[
        'title.appearance.style=solid, span=end.default.typography'
      ].reason,
    ).toBe(long);
  });

  it('reads an entry back', () => {
    expect(readSetEntry(FILE, 'label.base.color')).toEqual({
      token: 'color.text.primary',
      reason: 'Another.',
    });
    expect(readSetEntry(FILE, 'nope')).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-overlay-edit.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement**

```js
// packages/codegen/src/workbench/overlay-edit.mjs
/**
 * One `set` entry of an overlay file added, replaced or deleted, by splicing the file's text: the
 * entry's own lines change and nothing else, so every comment, every other rule and every folded
 * reason stays byte for byte. The yaml document finds the ranges and renders the one entry.
 */

import { Document, isMap, isScalar, parse, parseDocument } from 'yaml';

const WIDTH = 100;

/** The entry at `key` as data, or null. */
export function readSetEntry(text, key) {
  return parse(text || '')?.set?.[key] ?? null;
}

/** The start of the line `offset` is on. */
const lineStart = (text, offset) => text.lastIndexOf('\n', offset - 1) + 1;

/** Just past the end of the line `offset` is on (its newline included). */
const lineEnd = (text, offset) => {
  const i = text.indexOf('\n', offset);
  return i === -1 ? text.length : i + 1;
};

/** The entry as the files write one: two spaces in, its reason folded where it is long. */
function render(key, value, reason) {
  const doc = new Document({ [key]: { ...value, reason } });
  const r = doc.getIn([key, 'reason'], true);
  if (isScalar(r) && `    reason: ${reason}`.length > WIDTH)
    r.type = 'BLOCK_FOLDED';
  return doc
    .toString({ lineWidth: WIDTH - 2, indent: 2 })
    .trimEnd()
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')
    .concat('\n');
}

/**
 * @param {string} text the overlay file ('' where there is none)
 * @param {string} key the set key (`root.base.width`)
 * @param {object | null} value `{ token }`, `{ keyword }`, `{ none: true }`, or null to delete
 * @param {string} [reason]
 * @returns {string} the new text
 */
export function writeSetEntry(text, key, value, reason) {
  const source = text ?? '';
  const doc = parseDocument(source);
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  const set = doc.get('set', true);
  const pair = isMap(set)
    ? set.items.find((p) => (isScalar(p.key) ? p.key.value : p.key) === key)
    : undefined;

  if (value === null) {
    if (!pair) return source;
    const from = lineStart(source, pair.key.range[0]);
    const to = lineEnd(source, pair.value.range[1] - 1);
    let out = source.slice(0, from) + source.slice(to);
    // An empty section says nothing: drop `set:` too.
    if (set.items.length === 1) {
      const setKey = doc.contents.items.find(
        (p) => isScalar(p.key) && p.key.value === 'set',
      ).key;
      const s = lineStart(out, setKey.range[0]);
      out = out.slice(0, s) + out.slice(lineEnd(out, setKey.range[0]));
      out = out.replace(/\n{3,}/g, '\n\n').replace(/\n+$/, '\n');
    }
    return out;
  }

  const entry = render(key, value, reason);
  if (pair) {
    const from = lineStart(source, pair.key.range[0]);
    const to = lineEnd(source, pair.value.range[1] - 1);
    return source.slice(0, from) + entry + source.slice(to);
  }
  if (isMap(set) && set.items.length) {
    const last = set.items.at(-1);
    const at = lineEnd(source, last.value.range[1] - 1);
    return source.slice(0, at) + entry + source.slice(at);
  }
  const base = source.trimEnd();
  return `${base}${base ? '\n\n' : ''}set:\n${entry}`;
}
```

- [ ] **Step 4: Run the test, and fix ranges until it passes**

Run: `cd packages/codegen && npx vitest run test/workbench-overlay-edit.test.mjs`
Expected: PASS. `range[1]` of a block map value is the end of its last value (its folded reason
included); if a test shows a trailing blank line or a comment moving, adjust `lineEnd`'s argument,
not the test.

- [ ] **Step 5: Prove it on every real overlay**

Add to the same test file, then run it:

```js
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { overlayDir } from '../src/normalize/overlay.mjs';

describe('on every committed overlay', () => {
  it('rewriting each set entry as it is changes nothing, and deleting one moves only its lines', () => {
    for (const f of readdirSync(overlayDir).filter(
      (x) =>
        x.endsWith('.yaml') &&
        !['defaults.yaml', 'excluded.yaml', 'mui-theme.yaml'].includes(x),
    )) {
      const text = readFileSync(join(overlayDir, f), 'utf8');
      for (const [key, rule] of Object.entries(parse(text)?.set ?? {})) {
        if (typeof rule.reason !== 'string') continue; // a reason by reference ({ as: … })
        const { reason, ...value } = rule;
        const out = writeSetEntry(text, key, value, reason);
        expect(parse(out), `${f} ${key}`).toEqual(parse(text));
        const gone = writeSetEntry(text, key, null);
        expect(parse(gone)?.set?.[key], `${f} ${key}`).toBeUndefined();
      }
    }
  });
});
```

Expected: PASS.

### Task 6: editing approvals

**Files:**

- Create: `packages/codegen/src/workbench/approvals-edit.mjs`
- Test: `packages/codegen/test/workbench-approvals-edit.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-approvals-edit.test.mjs
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import {
  withApproval,
  withdrawnBy,
  withoutApprovals,
} from '../src/workbench/approvals-edit.mjs';

const HEADER =
  '# Which SOLAR components a person has approved.\n#\n# Button:\n#   web: { … }\n';
const line = { fingerprint: 'sha256:abc', by: 'A Person', on: '2026-09-27' };

describe('editing approvals', () => {
  it('adds a line under its component, keeping the header, components in name order', () => {
    let out = withApproval(HEADER, 'Dialog', 'web', line);
    out = withApproval(out, 'Button', 'web', line);
    out = withApproval(out, 'Button', 'flutter', {
      ...line,
      fingerprint: 'sha256:def',
    });
    expect(out.startsWith(HEADER)).toBe(true);
    const data = parse(out);
    expect(Object.keys(data)).toEqual(['Button', 'Dialog']);
    expect(data.Button.flutter).toEqual({ ...line, fingerprint: 'sha256:def' });
    expect(out).toMatch(/^ {2}web: \{ fingerprint: /m);
  });

  it('removes lines, and a component once nothing is under it', () => {
    let out = withApproval(HEADER, 'Button', 'web', line);
    out = withApproval(out, 'Button', 'flutter', line);
    out = withApproval(out, 'Dialog', 'web', line);
    out = withoutApprovals(out, [
      { name: 'Button', platform: 'web' },
      { name: 'Dialog', platform: 'web' },
    ]);
    expect(parse(out)).toEqual({ Button: { flutter: line } });
    expect(out.startsWith(HEADER)).toBe(true);
  });

  it('withdrawing Button withdraws every approved component on that platform that uses it', () => {
    const coloured = {
      web: [
        { name: 'Button', uses: [] },
        { name: 'Dialog', uses: ['Button', 'Scrim'] },
        { name: 'Confirmation Dialog', uses: ['Button', 'Dialog', 'Scrim'] },
        { name: 'Scrim', uses: [] },
      ],
    };
    const approvals = {
      Button: { web: line },
      Dialog: { web: line },
      Scrim: { web: line },
    };
    expect(withdrawnBy(coloured, approvals, 'Button', 'web')).toEqual([
      'Button',
      'Dialog',
    ]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-approvals-edit.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement**

```js
// packages/codegen/src/workbench/approvals-edit.mjs
/**
 * spec/approvals.yaml's text with an approval added or removed, for the viewers' Approve and Undo
 * approval buttons: a person presses them, never an agent (CLAUDE.md). The header comment stays,
 * components stay in name order, and each platform's line is written as `solar:status` prints it.
 */

import { isMap, isScalar, parseDocument } from 'yaml';
import { byCodeUnit } from '../util/sort.mjs';

const docOf = (text) => {
  const doc = parseDocument(text ?? '');
  if (doc.errors.length) throw new Error(doc.errors[0].message);
  if (!isMap(doc.contents)) doc.contents = doc.createNode({});
  return doc;
};

const keyOf = (pair) => (isScalar(pair.key) ? pair.key.value : pair.key);

/**
 * @param {string} text the record
 * @param {string} name the component (`Button`)
 * @param {'web' | 'flutter'} platform
 * @param {{fingerprint: string, by: string, on: string}} approval
 */
export function withApproval(text, name, platform, approval) {
  const doc = docOf(text);
  const root = doc.contents;
  let entry = root.items.find((p) => keyOf(p) === name);
  if (!entry || !isMap(entry.value)) {
    const pair = doc.createPair(name, doc.createNode({}));
    const at = root.items.findIndex(
      (p) => byCodeUnit(String(keyOf(p)), name) > 0,
    );
    root.items.splice(at === -1 ? root.items.length : at, 0, pair);
    entry = pair;
  }
  const line = doc.createNode({ ...approval });
  line.flow = true;
  entry.value.set(platform, line);
  return doc.toString({ lineWidth: 0 });
}

/** The record without each `{ name, platform }`, and without a component left with nothing. */
export function withoutApprovals(text, pairs) {
  const doc = docOf(text);
  const root = doc.contents;
  for (const { name, platform } of pairs) {
    const entry = root.items.find((p) => keyOf(p) === name);
    if (!entry || !isMap(entry.value)) continue;
    entry.value.delete(platform);
    if (!entry.value.items.length) root.delete(name);
  }
  return doc.toString({ lineWidth: 0 });
}

/**
 * What withdrawing one approval takes with it: the component, and every component on that platform
 * that uses it (uses are transitive) and is recorded as approved, since an approval above an
 * unapproved child fails `solar:status --check`.
 */
export function withdrawnBy(coloured, approvals, name, platform) {
  const users = (coloured[platform] ?? [])
    .filter((c) => c.uses.includes(name) && approvals?.[c.name]?.[platform])
    .map((c) => c.name)
    .sort(byCodeUnit);
  return [name, ...users];
}
```

- [ ] **Step 4: Run the test**

Run: `cd packages/codegen && npx vitest run test/workbench-approvals-edit.test.mjs`
Expected: PASS. Also confirm the result reads back through the real reader:
`readApprovals(out)` from `src/approvals/status.mjs` gives the same data (add one assertion).

### Task 7: the session, part 1: status, gate, inspect, set, keep, undo

The session holds all state and does every operation, one at a time. Every effect is injected so
the tests run with fakes and never touch the repository's files.

**Files:**

- Create: `packages/codegen/src/workbench/session.mjs`
- Test: `packages/codegen/test/workbench-session.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-session.test.mjs
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { PLACEHOLDER } from '../src/normalize/overlay.mjs';
import { createSession } from '../src/workbench/session.mjs';

let build;
beforeAll(() => {
  build = stage.build();
});

/** A world of files in memory, and every effect recorded. */
function world({
  colours = { Button: { web: 'yellow', flutter: 'yellow' } },
} = {}) {
  const files = new Map();
  const calls = [];
  const coloured = Object.fromEntries(
    ['web', 'flutter'].map((p) => [
      p,
      Object.entries(colours).map(([name, c]) => ({
        name,
        colour: c[p],
        uses: c.uses ?? [],
        waitsOn: c.waitsOn?.[p] ?? [],
        fingerprint: `sha256:${name}-${p}`,
      })),
    ]),
  );
  const deps = {
    files: {
      read: (p) => files.get(p) ?? null,
      write: (p, t) => files.set(p, t),
      remove: (p) => files.delete(p),
    },
    overlayPath: (name) => `spec/overlay/${name.toLowerCase()}.yaml`,
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: '.workbench/pending.json',
    build: () => build,
    codegen: async ({ pending }) => {
      calls.push(['codegen', pending]);
      return { ok: true, output: '' };
    },
    status: async () => ({ coloured, approvals: {} }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => calls.push(['reload']),
    userName: () => 'A Person',
    today: () => '2026-09-27',
    emit: (e) => calls.push(['emit', e.type]),
  };
  return { files, calls, deps };
}

const setBody = (s, extra = {}) => ({
  component: 'Button',
  variant: 0,
  layer: 'root',
  cell: 'background',
  scope: 'root.base.background',
  value: { token: 'color.text.primary' },
  revision: s.inspect('Button', 0).revision,
  ...extra,
});

describe('the session', () => {
  let w;
  let s;
  beforeEach(() => {
    w = world();
    s = createSession(w.deps);
  });

  it('reports each component’s colours and whether it may be edited', async () => {
    const st = await s.status();
    expect(st.components.Button).toMatchObject({
      web: 'yellow',
      flutter: 'yellow',
      editable: true,
      locked: null,
    });
    expect(st.pending).toBeNull();
  });

  it('writes a pending set with the placeholder, regenerates with --pending, and reloads', async () => {
    await s.set(setBody(s));
    const text = w.files.get('spec/overlay/button.yaml');
    expect(text).toContain(
      'root.base.background:\n    token: color.text.primary\n    reason: TODO(reason)',
    );
    expect(w.calls).toContainEqual(['codegen', true]);
    expect(w.calls).toContainEqual(['reload']);
    expect((await s.status()).pending).toMatchObject({
      component: 'Button',
      key: 'root.base.background',
      deletes: false,
    });
    expect(
      JSON.parse(w.files.get('.workbench/pending.json')).before,
    ).toBeNull();
  });

  it('keeps with a reason, regenerating without --pending', async () => {
    await s.set(setBody(s));
    const r = await s.keep({
      component: 'Button',
      reason: 'The owner’s choice.',
    });
    expect(r).toEqual({ ok: true });
    expect(w.files.get('spec/overlay/button.yaml')).toContain(
      'reason: The owner’s choice.',
    );
    expect(w.files.get('spec/overlay/button.yaml')).not.toContain(PLACEHOLDER);
    expect(w.calls.at(-3)).toEqual(['codegen', false]);
    expect((await s.status()).pending).toBeNull();
    expect(w.files.has('.workbench/pending.json')).toBe(false);
  });

  it('refuses Keep without a reason, or with the rule’s old reason unchanged', async () => {
    w.files.set(
      'spec/overlay/button.yaml',
      'set:\n  root.base.background:\n    token: color.text.secondary\n    reason: Old.\n',
    );
    await s.set(setBody(s));
    await expect(s.keep({ component: 'Button', reason: ' ' })).rejects.toThrow(
      /reason/,
    );
    await expect(
      s.keep({ component: 'Button', reason: 'Old.' }),
    ).rejects.toThrow(/rewrite/);
  });

  it('undoes to the exact bytes before, and regenerates', async () => {
    const before =
      '# kept\nset:\n  root.base.gap:\n    token: inset.xs\n    reason: R.\n';
    w.files.set('spec/overlay/button.yaml', before);
    await s.set(setBody(s));
    await s.undo({ component: 'Button' });
    expect(w.files.get('spec/overlay/button.yaml')).toBe(before);
    expect(w.calls.at(-3)).toEqual(['codegen', false]);
  });

  it('removes a file it created, on Undo', async () => {
    await s.set(setBody(s));
    await s.undo({ component: 'Button' });
    expect(w.files.has('spec/overlay/button.yaml')).toBe(false);
  });

  it('refuses a stale revision: the file changed since the panel read it', async () => {
    const body = setBody(s);
    w.files.set('spec/overlay/button.yaml', 'bind: {}\n');
    await expect(s.set(body)).rejects.toThrow(/changed on disk/);
  });

  it('refuses a token not offered for the cell, and a scope not offered', async () => {
    await expect(
      s.set(setBody(s, { value: { token: 'inset.sm' } })),
    ).rejects.toThrow(/not offered/);
    await expect(
      s.set(setBody(s, { scope: 'root.nope.background' })),
    ).rejects.toThrow(/scope/);
  });

  it('refuses a second pending edit until the first is kept or undone', async () => {
    await s.set(setBody(s));
    await expect(
      s.set(
        setBody(s, { cell: 'borderColor', scope: 'root.base.borderColor' }),
      ),
    ).rejects.toThrow(/pending/);
  });

  it('refuses a rule the variant never reads (a narrower entry wins), and puts the file back', async () => {
    // Button's primary background comes from its appearance; a base rule would change nothing there.
    const i = s.inspect('Button', 0);
    const bg = i.layers
      .find((l) => l.name === 'root')
      .cells.find((c) => c.cell === 'background');
    if (bg.at === 'base') return; // nothing narrower to shadow it in this variant
    await expect(s.set(setBody(s))).rejects.toThrow(/wins/);
    expect(w.files.has('spec/overlay/button.yaml')).toBe(false);
  });

  it('locks a component approved on either platform, or waiting on another', async () => {
    const w2 = world({
      colours: {
        Button: { web: 'green', flutter: 'yellow' },
        Dialog: { web: 'red', flutter: 'yellow', waitsOn: { web: ['Button'] } },
      },
    });
    const s2 = createSession(w2.deps);
    const st = await s2.status();
    expect(st.components.Button).toMatchObject({
      editable: false,
      locked: expect.stringMatching(/approved on web/),
    });
    expect(st.components.Dialog).toMatchObject({
      editable: false,
      locked: expect.stringMatching(/waits on Button/),
    });
    await expect(s2.set(setBody(s2))).rejects.toThrow(/approved on web/);
  });

  it('undoes a Keep that would cancel an approval, naming it', async () => {
    // Badge's approval holds until the first plain regeneration (Keep's), and not after.
    let regenerated = false;
    const codegen = w.deps.codegen;
    w.deps.codegen = async (o) => {
      if (!o.pending) regenerated = true;
      return codegen(o);
    };
    w.deps.status = async () => {
      const held = !regenerated;
      return {
        coloured: {
          web: [
            {
              name: 'Button',
              colour: 'yellow',
              uses: [],
              waitsOn: [],
              fingerprint: 'x',
            },
            {
              name: 'Badge',
              colour: held ? 'green' : 'yellow',
              uses: [],
              waitsOn: [],
              fingerprint: 'y',
            },
          ],
          flutter: [
            {
              name: 'Button',
              colour: 'yellow',
              uses: [],
              waitsOn: [],
              fingerprint: 'z',
            },
          ],
        },
        approvals: {},
      };
    };
    s = createSession(w.deps);
    await s.set(setBody(s));
    await expect(
      s.keep({ component: 'Button', reason: 'Why.' }),
    ).rejects.toThrow(/Badge \(web\)/);
    expect(w.files.has('spec/overlay/button.yaml')).toBe(false);
  });

  it('comes back with the pending edit after a restart', async () => {
    await s.set(setBody(s));
    const again = createSession(w.deps);
    expect((await again.status()).pending).toMatchObject({
      component: 'Button',
    });
  });
});
```

The shadowing test depends on where Button's background sits in variant 0; if `bg.at` is `base`,
the test returns early. Keep it: it documents the rule even where it cannot fire.

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-session.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement**

```js
// packages/codegen/src/workbench/session.mjs
/**
 * The workbench service's state and operations (scripts/workbench.mjs serves them over HTTP): one
 * at a time, every effect injected, so a test runs it on files in memory. What it may do follows
 * the approvals (docs/superpowers/specs/…-viewer-workbench-design.md): a component 🟡 on both
 * platforms may be inspected, changed and reported on; 🟢 on either is locked; 🔴 on either waits.
 */

import { lookupCell, entryText } from '../explain/index.mjs';
import { PLACEHOLDER } from '../normalize/overlay.mjs';
import { builtOf, inspect as inspectOf, revisionOf } from './inspect.mjs';
import { readSetEntry, writeSetEntry } from './overlay-edit.mjs';
import { scopesFor } from './scopes.mjs';
import { tokenChoices, KEYWORD_CELLS } from './tokens.mjs';
import { parse } from 'yaml';

export class WorkbenchError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const refuse = (message, status = 409) => {
  throw new WorkbenchError(status, message);
};

const PLATFORMS = ['web', 'flutter'];
const TITLES = { web: 'web', flutter: 'Flutter' };
const VIEWER = { web: 'Storybook', flutter: 'Widgetbook' };

/** Whether an entry in the IR says what a set value says. */
const same = (entry, value) =>
  entry &&
  ((value.token !== undefined && entry.token === value.token) ||
    (value.keyword !== undefined && entry.keyword === value.keyword) ||
    (value.none && entry.none === true));

/** The IR entry at a scope's path, for one layer and cell, or undefined. */
const entryAt = (spec, layer, cell, path) =>
  path.reduce((node, key) => node?.[key], spec.style[layer])?.[cell];

/**
 * @param {object} deps see the test's `world()` for every member
 */
export function createSession(deps) {
  const { files } = deps;
  let queue = Promise.resolve();
  let busy = null;
  let pending = (() => {
    const text = files.read(deps.pendingPath);
    return text ? JSON.parse(text) : null;
  })();

  /** Runs `fn` after every earlier operation, telling the viewers while it runs. */
  const serial = (message, fn) => {
    const run = queue.then(async () => {
      busy = message;
      deps.emit({ type: 'busy', message });
      try {
        return await fn();
      } finally {
        busy = null;
        deps.emit({ type: 'changed' });
      }
    });
    queue = run.catch(() => {});
    return run;
  };

  const savePending = (p) => {
    pending = p;
    if (p) files.write(deps.pendingPath, `${JSON.stringify(p, null, 2)}\n`);
    else files.remove(deps.pendingPath);
  };

  /** What each component may do, from the colours on both platforms. */
  const gateOf = (coloured, name) => {
    const colours = Object.fromEntries(
      PLATFORMS.map((p) => [
        p,
        coloured[p]?.find((c) => c.name === name) ?? null,
      ]),
    );
    const green = PLATFORMS.filter((p) => colours[p]?.colour === 'green');
    const red = PLATFORMS.filter((p) => colours[p]?.colour === 'red');
    let locked = null;
    if (green.length)
      locked = `approved on ${green.map((p) => TITLES[p]).join(' and ')}: undo its approval in ${green.map((p) => VIEWER[p]).join(' and ')} to change it`;
    else if (red.length)
      locked = red
        .map((p) => `waits on ${colours[p].waitsOn.join(', ')} on ${TITLES[p]}`)
        .join('; ');
    return {
      web: colours.web?.colour ?? null,
      flutter: colours.flutter?.colour ?? null,
      waitsOn: Object.fromEntries(
        PLATFORMS.map((p) => [p, colours[p]?.waitsOn ?? []]),
      ),
      editable: locked === null && PLATFORMS.some((p) => colours[p]),
      locked,
    };
  };

  const statusNow = async () => {
    const { coloured } = await deps.status();
    const names = [
      ...new Set(
        PLATFORMS.flatMap((p) => (coloured[p] ?? []).map((c) => c.name)),
      ),
    ];
    return {
      busy,
      pending: pending && {
        component: pending.component,
        key: pending.key,
        value: pending.value,
        deletes: pending.deletes,
        previousReason: pending.previousReason,
        failing: pending.failing ?? null,
      },
      components: Object.fromEntries(
        names.map((n) => [n, gateOf(coloured, n)]),
      ),
    };
  };

  const mustEdit = async (name) => {
    const { coloured } = await deps.status();
    const gate = gateOf(coloured, name);
    if (!gate.editable)
      refuse(`${name}: ${gate.locked ?? 'not a component here'}`);
    return coloured;
  };

  /** The approvals that hold now, as `Name (platform)`. */
  const heldNow = async () => {
    const { coloured } = await deps.status();
    return PLATFORMS.flatMap((p) =>
      (coloured[p] ?? [])
        .filter((c) => c.colour === 'green')
        .map((c) => `${c.name} (${p})`),
    );
  };

  const overlayText = (name) => files.read(deps.overlayPath(name)) ?? '';

  /** Puts the overlay back as it was before the pending edit, and regenerates. */
  const restore = async (p) => {
    const path = deps.overlayPath(p.component);
    if (p.before === null) files.remove(path);
    else files.write(path, p.before);
    await deps.codegen({ pending: false });
    deps.reload();
  };

  return {
    status: statusNow,

    inspect: (name, variant) =>
      inspectOf(deps.build(), name, Number(variant), {
        overlayText: overlayText(name),
      }),

    set: (body) =>
      serial('Regenerating…', async () => {
        const {
          component: name,
          variant: index,
          layer,
          cell,
          scope,
          value,
          revision,
        } = body;
        if (pending)
          refuse(`keep or undo the pending edit on ${pending.component} first`);
        await mustEdit(name);
        const path = deps.overlayPath(name);
        const before = files.read(path);
        if (revisionOf(before ?? '') !== revision)
          refuse(`${path} changed on disk since the panel read it: reload`);
        const build = deps.build();
        const { spec, oracle } = builtOf(build, name);
        const variant = oracle.variants[Number(index)];
        if (!variant) refuse(`${name} has no variant ${index}`, 400);
        const doc = before ? parse(before) : null;
        const chosen = scopesFor(spec, doc, layer, cell, variant).find(
          (s) => s.key === scope,
        );
        if (!chosen)
          refuse(`${scope} is not a scope offered for ${layer}.${cell}`, 400);
        const current = lookupCell(spec, layer, cell, variant)?.entry;
        if (value.token !== undefined) {
          const offered = tokenChoices(
            build.tokens,
            cell,
            current?.token ?? null,
          );
          if (!offered.some((t) => t.name === value.token))
            refuse(`${value.token} is not offered for ${cell}`, 400);
        } else if (value.keyword !== undefined) {
          if (
            !KEYWORD_CELLS.has(cell) ||
            !['FILL', 'HUG'].includes(value.keyword)
          )
            refuse(`${value.keyword} is not offered for ${cell}`, 400);
        } else if (value.none !== true)
          refuse('a value is a token, a keyword or none', 400);

        // Choosing what Figma has, where a rule changed it, deletes the rule.
        const existing = readSetEntry(before ?? '', scope);
        const there = entryAt(spec, layer, cell, chosen.path);
        const deletes = Boolean(
          existing && there?.replaced && same(there.replaced, value),
        );
        // Nothing to decide where the chosen look already has exactly that entry.
        if (!existing && same(there, value))
          refuse(`${layer}.${cell} already draws ${entryText(there)} there`);
        const text = deletes
          ? writeSetEntry(before ?? '', scope, null)
          : writeSetEntry(before ?? '', scope, value, PLACEHOLDER);
        const held = await heldNow();
        files.write(path, text);

        // Prove the rule reaches the variant in view before regenerating anything.
        try {
          const after = builtOf(deps.build(), name);
          const now = lookupCell(
            after.spec,
            layer,
            cell,
            after.oracle.variants[Number(index)],
          );
          if (!deletes && !same(now?.entry, value))
            refuse(
              `the rule changes nothing in this variant: ${now?.at ?? 'another entry'} wins; choose a narrower scope`,
            );
        } catch (error) {
          if (before === null) files.remove(path);
          else files.write(path, before);
          throw error instanceof WorkbenchError
            ? error
            : new WorkbenchError(400, error.message);
        }

        const generated = await deps.codegen({ pending: true });
        if (!generated.ok) {
          if (before === null) files.remove(path);
          else files.write(path, before);
          await deps.codegen({ pending: false });
          refuse(
            `the build refused the edit: ${generated.output.split('\n').slice(-5).join(' ')}`,
            400,
          );
        }
        savePending({
          component: name,
          key: scope,
          value,
          deletes,
          before,
          previousReason: existing?.reason ?? null,
          held,
          failing: null,
        });
        deps.reload();
        return statusNow();
      }),

    keep: ({ component: name, reason }) =>
      serial('Keeping…', async () => {
        if (!pending || pending.component !== name)
          refuse(`${name} has no pending edit`);
        const path = deps.overlayPath(name);
        if (!pending.deletes) {
          const why = String(reason ?? '').trim();
          if (!why || why.startsWith(PLACEHOLDER))
            refuse('write a reason a reviewer can check', 400);
          if (pending.previousReason && why === pending.previousReason.trim())
            refuse('the rule changed, so rewrite its reason', 400);
          files.write(
            path,
            writeSetEntry(
              files.read(path) ?? '',
              pending.key,
              pending.value,
              why,
            ),
          );
        }
        const generated = await deps.codegen({ pending: false });
        if (!generated.ok)
          refuse(
            `the build failed: ${generated.output.split('\n').slice(-5).join(' ')}`,
            400,
          );
        const now = new Set(await heldNow());
        const lost = pending.held.filter((a) => !now.has(a));
        if (lost.length) {
          const p = pending;
          await restore(p);
          savePending(null);
          refuse(
            `kept, this would cancel ${lost.join(', ')}; the edit is undone`,
          );
        }
        const result = await deps.checks(name);
        if (!result.ok) {
          savePending({ ...pending, failing: result.failures });
          deps.reload();
          return { ok: false, failures: result.failures };
        }
        savePending(null);
        deps.reload();
        return { ok: true };
      }),

    undo: ({ component: name }) =>
      serial('Undoing…', async () => {
        if (!pending || pending.component !== name)
          refuse(`${name} has no pending edit`);
        await restore(pending);
        savePending(null);
        return statusNow();
      }),
  };
}
```

Notes for the implementer:

- `restore` regenerates, and Keep's lost-approval path calls it; the test world's `status()`
  answers "held" the first time and not after, so the order of `heldNow()` calls matters: it is
  called once in `set` (before writing) and once in `keep` (after regenerating).
- `checks` is `async () => ({ ok: true, failures: [] })` in Batch 1's real deps (Task 9); Batch 4
  gives it the real checks.

- [ ] **Step 4: Run the test until it passes**

Run: `cd packages/codegen && npx vitest run test/workbench-session.test.mjs`
Expected: PASS. Where a test's expectation about the codegen call order is off by one because of
`restore`, fix the expectation to the documented order, never weaken what it checks (that the last
regeneration before success is without `--pending`).

### Task 8: the session, part 2: approve and undo approval

**Files:**

- Modify: `packages/codegen/src/workbench/session.mjs`
- Test: `packages/codegen/test/workbench-session-approvals.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-session-approvals.test.mjs
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { createSession } from '../src/workbench/session.mjs';

const HEADER = '# Which SOLAR components a person has approved.\n';

function world(colours, approvals = {}) {
  const files = new Map([['spec/approvals.yaml', HEADER]]);
  const coloured = {
    web: Object.entries(colours).map(([name, c]) => ({
      name,
      colour: c.web,
      uses: c.uses ?? [],
      waitsOn: c.waitsOn ?? [],
      fingerprint: `sha256:${name}`,
    })),
    flutter: [],
  };
  const deps = {
    files: {
      read: (p) => files.get(p) ?? null,
      write: (p, t) => files.set(p, t),
      remove: (p) => files.delete(p),
    },
    overlayPath: (n) => `spec/overlay/${n}.yaml`,
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: '.workbench/pending.json',
    build: () => {
      throw new Error('not used');
    },
    codegen: async () => ({ ok: true, output: '' }),
    status: async () => ({
      coloured,
      approvals: parse(files.get('spec/approvals.yaml')) ?? approvals,
    }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => {},
    userName: () => 'A Person',
    today: () => '2026-09-27',
    emit: () => {},
  };
  return { files, deps };
}

describe('approving from a viewer', () => {
  it('writes the line solar:status prints, for a 🟡 component', async () => {
    const w = world({ Button: { web: 'yellow' } });
    const r = await createSession(w.deps).approve({
      component: 'Button',
      platform: 'web',
    });
    expect(r).toEqual({ ok: true });
    expect(parse(w.files.get('spec/approvals.yaml'))).toEqual({
      Button: {
        web: { fingerprint: 'sha256:Button', by: 'A Person', on: '2026-09-27' },
      },
    });
    expect(w.files.get('spec/approvals.yaml').startsWith(HEADER)).toBe(true);
  });

  it('refuses a 🔴 or 🟢 component, naming why', async () => {
    const w = world({
      Dialog: { web: 'red', waitsOn: ['Button'] },
      Button: { web: 'green' },
    });
    const s = createSession(w.deps);
    await expect(
      s.approve({ component: 'Dialog', platform: 'web' }),
    ).rejects.toThrow(/waits on Button/);
    await expect(
      s.approve({ component: 'Button', platform: 'web' }),
    ).rejects.toThrow(/already approved/);
  });

  it('refuses while its checks fail, returning the failures', async () => {
    const w = world({ Button: { web: 'yellow' } });
    w.deps.checks = async () => ({
      ok: false,
      failures: [
        {
          platform: 'web',
          layer: 'root',
          property: 'height',
          figma: 40,
          drawn: 44,
        },
      ],
    });
    const r = await createSession(w.deps).approve({
      component: 'Button',
      platform: 'web',
    });
    expect(r.ok).toBe(false);
    expect(r.failures[0].property).toBe('height');
    expect(parse(w.files.get('spec/approvals.yaml'))).toBeNull();
  });

  it('undoing Button’s approval withdraws Dialog’s too, and previews that first', async () => {
    const line = { fingerprint: 'x', by: 'A', on: '2026-09-27' };
    const w = world({
      Button: { web: 'green' },
      Dialog: { web: 'green', uses: ['Button'] },
    });
    w.files.set(
      'spec/approvals.yaml',
      `${HEADER}Button:\n  web: { fingerprint: x, by: A, on: 2026-09-27 }\nDialog:\n  web: { fingerprint: x, by: A, on: 2026-09-27 }\n`,
    );
    const s = createSession(w.deps);
    expect(
      await s.unapprovePreview({ component: 'Button', platform: 'web' }),
    ).toEqual({ withdraws: ['Button', 'Dialog'] });
    expect(await s.unapprove({ component: 'Button', platform: 'web' })).toEqual(
      { withdraws: ['Button', 'Dialog'] },
    );
    expect(parse(w.files.get('spec/approvals.yaml')) ?? {}).toEqual({});
    expect(w.files.get('spec/approvals.yaml').startsWith(HEADER)).toBe(true);
    void line;
  });

  it('refuses to undo an approval there is none of', async () => {
    const w = world({ Button: { web: 'yellow' } });
    await expect(
      createSession(w.deps).unapprove({ component: 'Button', platform: 'web' }),
    ).rejects.toThrow(/not approved/);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-session-approvals.test.mjs`
Expected: FAIL, `approve is not a function`.

- [ ] **Step 3: Implement**

In `session.mjs`, import `{ withApproval, withdrawnBy, withoutApprovals }` from
`./approvals-edit.mjs` and add to the returned object:

```js
    approve: ({ component: name, platform }) =>
      serial('Checking before approving…', async () => {
        const { coloured } = await deps.status();
        const c = coloured[platform]?.find((x) => x.name === name);
        if (!c) refuse(`${TITLES[platform] ?? platform} has no ${name}`, 400);
        if (c.colour === 'green') refuse(`${name} is already approved on ${TITLES[platform]}`);
        if (c.colour === 'red') refuse(`${name} waits on ${c.waitsOn.join(', ')}: approve those first`);
        if (pending?.component === name) refuse('keep or undo its pending edit first');
        const result = await deps.checks(name);
        if (!result.ok) return { ok: false, failures: result.failures };
        // Checks write nothing the fingerprint reads, but read it again after them regardless.
        const again = (await deps.status()).coloured[platform].find((x) => x.name === name);
        const text = files.read(deps.approvalsPath) ?? '';
        files.write(
          deps.approvalsPath,
          withApproval(text, name, platform, {
            fingerprint: again.fingerprint,
            by: deps.userName(),
            on: deps.today(),
          }),
        );
        return { ok: true };
      }),

    unapprovePreview: async ({ component: name, platform }) => {
      const { coloured, approvals } = await deps.status();
      if (!approvals?.[name]?.[platform]) refuse(`${name} is not approved on ${TITLES[platform]}`);
      return { withdraws: withdrawnBy(coloured, approvals, name, platform) };
    },

    unapprove: ({ component: name, platform }) =>
      serial('Withdrawing…', async () => {
        const { coloured, approvals } = await deps.status();
        if (!approvals?.[name]?.[platform]) refuse(`${name} is not approved on ${TITLES[platform]}`);
        const withdraws = withdrawnBy(coloured, approvals, name, platform);
        const text = files.read(deps.approvalsPath) ?? '';
        files.write(
          deps.approvalsPath,
          withoutApprovals(text, withdraws.map((n) => ({ name: n, platform }))),
        );
        return { withdraws };
      }),
```

- [ ] **Step 4: Run both session tests**

Run: `cd packages/codegen && npx vitest run test/workbench-session.test.mjs test/workbench-session-approvals.test.mjs`
Expected: PASS.

### Task 9: the service process and its launcher

**Files:**

- Create: `scripts/workbench.mjs`
- Create: `scripts/workbench-launch.mjs`
- Modify: `.gitignore` (add `.workbench/`)
- Test: `packages/codegen/test/workbench-server.test.mjs`

- [ ] **Step 1: Write the failing test**

The server's routing is tested over a fake session, on a free port:

```js
// packages/codegen/test/workbench-server.test.mjs
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '../../../scripts/workbench.mjs';
import { WorkbenchError } from '../src/workbench/session.mjs';

let server;
let base;
const calls = [];
const session = {
  status: async () => ({ busy: null, pending: null, components: {} }),
  inspect: (name, variant) => ({ component: name, variant }),
  set: async (b) => {
    calls.push(['set', b]);
    return { ok: 1 };
  },
  keep: async () => {
    throw new WorkbenchError(400, 'write a reason a reviewer can check');
  },
  undo: async () => ({}),
  approve: async (b) => ({ ok: true, b }),
  unapprovePreview: async () => ({ withdraws: ['Button'] }),
  unapprove: async () => ({ withdraws: ['Button'] }),
};

beforeAll(async () => {
  server = await serve({ session, port: 0, idleMs: 0 });
  base = `http://127.0.0.1:${server.address().port}`;
});
afterAll(() => server.close());

describe('the workbench service', () => {
  it('says who it is', async () => {
    expect(await (await fetch(`${base}/health`)).json()).toEqual({
      service: 'solar-workbench',
    });
  });

  it('routes a component’s inspection, and a set', async () => {
    expect(
      await (await fetch(`${base}/component?name=Button&variant=2`)).json(),
    ).toEqual({ component: 'Button', variant: '2' });
    const r = await fetch(`${base}/set`, {
      method: 'POST',
      body: JSON.stringify({ component: 'Button' }),
    });
    expect(r.status).toBe(200);
    expect(calls[0]).toEqual(['set', { component: 'Button' }]);
  });

  it('answers a refusal with its status and sentence', async () => {
    const r = await fetch(`${base}/keep`, { method: 'POST', body: '{}' });
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({
      error: 'write a reason a reviewer can check',
    });
  });

  it('lets a localhost page call it, and no other', async () => {
    const ok = await fetch(`${base}/health`, {
      headers: { Origin: 'http://localhost:6006' },
    });
    expect(ok.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:6006',
    );
    const no = await fetch(`${base}/health`, {
      headers: { Origin: 'https://example.com' },
    });
    expect(no.status).toBe(403);
  });

  it('long-polls events: an event published wakes a waiting poll', async () => {
    const poll = fetch(`${base}/events?after=0`).then((r) => r.json());
    server.publish({ type: 'changed' });
    const { seq, events } = await poll;
    expect(seq).toBe(1);
    expect(events).toEqual([{ seq: 1, type: 'changed' }]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-server.test.mjs`
Expected: FAIL, cannot find `scripts/workbench.mjs`.

- [ ] **Step 3: Implement the server**

```js
#!/usr/bin/env node
// scripts/workbench.mjs
// The workbench service: the only thing that writes for Storybook's and Widgetbook's workbench bar
// (docs/engineering/workflows.md, Fix a component in the viewer). Local and dev-only: started by
// `npm run storybook` and `npm run widgetbook` (scripts/workbench-launch.mjs), never by a build.
// It answers localhost alone, does one job at a time (packages/codegen/src/workbench/session.mjs),
// and exits a minute after the last viewer stops asking.
//
//   node scripts/workbench.mjs            serve on 6011
import { execFileSync, spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const WORKBENCH_PORT = 6011;
const LONG_POLL_MS = 25_000;
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Serves a session over HTTP (the contract: docs/superpowers/plans/…-viewer-workbench.md).
 * @returns {Promise<import('node:http').Server & { publish(event: object): void }>}
 */
export function serve({ session, port = WORKBENCH_PORT, idleMs = 60_000 }) {
  let seq = 0;
  const events = [];
  const waiting = new Set();
  let last = Date.now();

  const publish = (event) => {
    seq += 1;
    events.push({ seq, ...event });
    if (events.length > 100) events.shift();
    for (const wake of waiting) wake();
  };

  const body = async (req) => {
    let text = '';
    for await (const chunk of req) text += chunk;
    return text ? JSON.parse(text) : {};
  };

  const routes = {
    'GET /health': () => ({ service: 'solar-workbench' }),
    'GET /status': () => session.status(),
    'GET /component': (_, q) =>
      session.inspect(q.get('name'), q.get('variant') ?? '0'),
    'POST /set': (b) => session.set(b),
    'POST /keep': (b) => session.keep(b),
    'POST /undo': (b) => session.undo(b),
    'POST /report': (b) => session.report(b),
    'POST /send': (b) => session.send(b),
    'POST /approve': (b) => session.approve(b),
    'POST /unapprove/preview': (b) => session.unapprovePreview(b),
    'POST /unapprove': (b) => session.unapprove(b),
  };

  const server = createServer(async (req, res) => {
    last = Date.now();
    const origin = req.headers.origin;
    if (origin && !LOCAL.test(origin)) {
      res.writeHead(403).end();
      return;
    }
    const headers = {
      'Content-Type': 'application/json',
      ...(origin && {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST',
      }),
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, headers).end();
      return;
    }
    const url = new URL(req.url, 'http://localhost');
    const send = (status, data) =>
      res.writeHead(status, headers).end(JSON.stringify(data));

    if (req.method === 'GET' && url.pathname === '/events') {
      const after = Number(url.searchParams.get('after') ?? 0);
      const answer = () =>
        send(200, { seq, events: events.filter((e) => e.seq > after) });
      if (seq > after) return answer();
      const wake = () => {
        clearTimeout(timer);
        waiting.delete(wake);
        answer();
      };
      const timer = setTimeout(wake, LONG_POLL_MS);
      waiting.add(wake);
      req.on('close', () => {
        clearTimeout(timer);
        waiting.delete(wake);
      });
      return undefined;
    }

    const route = routes[`${req.method} ${url.pathname}`];
    if (!route) return send(404, { error: `no ${req.method} ${url.pathname}` });
    try {
      send(
        200,
        await route(
          req.method === 'POST' ? await body(req) : {},
          url.searchParams,
        ),
      );
    } catch (error) {
      send(error.status ?? 500, {
        error: String(error.message).split('\n')[0],
      });
    }
    return undefined;
  });

  server.publish = publish;
  if (idleMs > 0)
    setInterval(() => {
      if (Date.now() - last > idleMs && waiting.size === 0) process.exit(0);
    }, 5_000).unref();
  return new Promise((ok) =>
    server.listen(port, '127.0.0.1', () => ok(server)),
  );
}

/** The real session: the repository's files, the generator, the approvals. */
async function realSession(publish) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const codegen = (p) =>
    pathToFileURL(join(repoRoot, 'packages/codegen/src', p)).href;
  const stage = await import(codegen('stages/components.mjs'));
  const { allowPlaceholders, overlayDir, overlayFileOf } = await import(
    codegen('normalize/overlay.mjs')
  );
  const status = await import(codegen('approvals/status.mjs'));
  const { createSession } = await import(codegen('workbench/session.mjs'));
  const abs = (p) => join(repoRoot, p);
  const run = (cmd, args, opts = {}) =>
    new Promise((ok) => {
      const child = spawn(cmd, args, {
        cwd: repoRoot,
        ...opts,
        env: { ...process.env, ...opts.env },
      });
      let output = '';
      child.stdout.on('data', (d) => (output += d));
      child.stderr.on('data', (d) => (output += d));
      child.on('close', (code) => ok({ ok: code === 0, output }));
    });
  const pidFile = abs('.workbench/widgetbook.pid');
  return createSession({
    files: {
      read: (p) => (existsSync(abs(p)) ? readFileSync(abs(p), 'utf8') : null),
      write: (p, t) => {
        mkdirSync(dirname(abs(p)), { recursive: true });
        writeFileSync(abs(p), t);
      },
      remove: (p) => rmSync(abs(p), { force: true }),
    },
    overlayPath: (name) =>
      relative(
        repoRoot,
        join(
          overlayDir,
          overlayFileOf(stage.COMPONENTS[stage.NAMES.indexOf(name)]),
        ),
      ),
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: '.workbench/pending.json',
    build: () => {
      allowPlaceholders(true);
      try {
        return stage.build();
      } finally {
        allowPlaceholders(false);
      }
    },
    codegen: ({ pending }) =>
      run(process.execPath, [
        'packages/codegen/bin/solar-codegen.mjs',
        ...(pending ? ['--pending'] : []),
      ]),
    status: async () => {
      const approvals = status.readApprovals();
      return {
        coloured: status.colour(await status.scan(), approvals),
        approvals,
      };
    },
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => {
      // Widgetbook's `flutter run` hot-reloads on SIGUSR1 (started with --pid-file).
      if (!existsSync(pidFile)) return;
      try {
        process.kill(Number(readFileSync(pidFile, 'utf8')), 'SIGUSR1');
      } catch {
        // Widgetbook is not running.
      }
    },
    userName: () => {
      try {
        return (
          execFileSync('git', ['config', 'user.name'], {
            encoding: 'utf8',
          }).trim() || 'Your Name'
        );
      } catch {
        return 'Your Name';
      }
    },
    today: () => new Date().toISOString().slice(0, 10),
    emit: (event) => publish(event),
    run,
    repoRoot,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await import('../packages/codegen/src/util/require-node.mjs');
  let server;
  const session = await realSession((e) => server?.publish(e));
  server = await serve({ session });
  console.log(`solar workbench on http://127.0.0.1:${WORKBENCH_PORT}`);
}
```

- [ ] **Step 4: Implement the launcher**

```js
// scripts/workbench-launch.mjs
// Makes sure the workbench service runs, for `npm run storybook` and `npm run widgetbook`: reuses
// one already answering on its port, else starts it detached (it outlives neither viewer by more
// than a minute: scripts/workbench.mjs). Never called by a build.
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const WORKBENCH_URL = 'http://127.0.0.1:6011';
const here = dirname(fileURLToPath(import.meta.url));

const answers = async () => {
  try {
    const r = await fetch(`${WORKBENCH_URL}/health`);
    return (await r.json()).service === 'solar-workbench';
  } catch {
    return false;
  }
};

export async function ensureWorkbench() {
  if (await answers()) return;
  spawn(process.execPath, [join(here, 'workbench.mjs')], {
    detached: true,
    stdio: 'ignore',
  }).unref();
  for (let i = 0; i < 50; i += 1) {
    if (await answers()) return;
    await new Promise((ok) => setTimeout(ok, 200));
  }
  console.warn(
    'workbench: the service did not start; the viewers run without the bar',
  );
}
```

- [ ] **Step 5: Ignore the service's own files**

Append to `.gitignore`:

```
# The workbench service's pending edit and Widgetbook's pid (scripts/workbench.mjs)
.workbench/
```

- [ ] **Step 6: Run the server test and the whole codegen suite**

Run: `cd packages/codegen && npx vitest run`
Expected: PASS, every file.

### Task 10: Batch 1 smoke run against the real repository, then stop

- [ ] **Step 1: Start the service and read Button**

```bash
node scripts/workbench.mjs &
sleep 3
curl -s http://127.0.0.1:6011/status | head -c 400; echo
curl -s 'http://127.0.0.1:6011/component?name=Button&variant=0' | node -e "const i=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(i.revision, i.layers.map(l=>l.name).join(','))"
```

Expected: a status JSON (`Button` 🟡 on both platforms while `spec/approvals.yaml` is empty), the
revision and Button's layers.

- [ ] **Step 2: A set and an Undo leave the tree exactly as it was**

```bash
REV=$(curl -s 'http://127.0.0.1:6011/component?name=Button&variant=0' | node -e "console.log(JSON.parse(require('fs').readFileSync(0,'utf8')).revision)")
curl -s -X POST http://127.0.0.1:6011/set -d "{\"component\":\"Button\",\"variant\":0,\"layer\":\"root\",\"cell\":\"radius\",\"scope\":\"root.base.radius\",\"value\":{\"token\":\"radius.full\"},\"revision\":\"$REV\"}" | head -c 300; echo
git diff --stat | tail -3
curl -s -X POST http://127.0.0.1:6011/undo -d '{"component":"Button"}' > /dev/null
git status --porcelain
kill %1
```

Expected: after the set, `git diff --stat` lists `spec/overlay/button.yaml` and Button's
generated files; after Undo, `git status --porcelain` prints nothing. If `radius.full` is not a
token, use another `radius.*` from the inspection's choices. Never run `/keep`, `/approve` or
`/unapprove` here.

- [ ] **Step 3: Run the Verify block's first parts**

Run: `cd packages/codegen && npx vitest run`, `npm run lint`, `npm run typecheck`,
`npx prettier --check "scripts/**/*.mjs"`, `npm run solar:status -- --check`.
Expected: all pass.

- [ ] **Step 4: Stop for the owner's review of Batch 1.**

---

# Batch 2: the bar in both viewers

### Task 11: the Storybook client and the pointing rule

**Files:**

- Create: `packages/components/stories/workbench/client.ts`
- Create: `packages/components/stories/workbench/pick.ts`
- Test: `packages/components/test/workbench-pick.test.mjs`

- [ ] **Step 1: Write the failing pointing test**

Look at `packages/components/test/playground-core.test.mjs` for how these tests import TypeScript
(the same loader), and follow it.

```js
// packages/components/test/workbench-pick.test.mjs
import { describe, expect, it } from 'vitest';
import { layerAt } from '../stories/workbench/pick.ts';

/** A tiny element tree: each node `{ classList, parentElement }`. */
const el = (classes, parent = null) => ({
  classList: { contains: (c) => classes.includes(c) },
  parentElement: parent,
});

describe('pointing at the component', () => {
  const box = el([]);
  const root = el(['MuiButton-root'], box);
  const label = el(['SolarButton-label'], root);
  const inner = el([], label);
  const classes = {
    label: 'SolarButton-label',
    counter: 'SolarButton-counter',
    root: null,
  };

  it('selects the nearest layer whose class the clicked element or an ancestor carries', () => {
    expect(layerAt(inner, box, classes)).toBe('label');
  });

  it('selects the root for anything inside the box that no layer class claims', () => {
    expect(layerAt(root, box, classes)).toBe('root');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/components && npx vitest run test/workbench-pick.test.mjs`
Expected: FAIL, cannot find module.

- [ ] **Step 3: Implement `pick.ts`**

```ts
// packages/components/stories/workbench/pick.ts
/**
 * Which layer a click in the Playground's box points at: the nearest element, from the one clicked
 * up to the box, carrying a layer's class (util/classes.mjs: `Solar<Name>-<slot>` or
 * `Solar<Name>--<layer>`), else the root, the component's own element.
 */

interface Node {
  classList: { contains(name: string): boolean };
  parentElement: Node | null;
}

export function layerAt(
  target: Node,
  box: Node,
  classes: Record<string, string | null>,
): string {
  const byClass = Object.entries(classes).filter(
    (entry): entry is [string, string] => entry[1] !== null,
  );
  for (let n: Node | null = target; n && n !== box; n = n.parentElement) {
    const hit = byClass.find(([, c]) => n!.classList.contains(c));
    if (hit) return hit[0];
  }
  return 'root';
}
```

- [ ] **Step 4: Implement `client.ts`**

```ts
// packages/components/stories/workbench/client.ts
/**
 * The workbench service's client, for the bar (Bar.tsx): the HTTP contract in
 * docs/superpowers/plans/2026-09-27-viewer-workbench.md, as types and one function per route.
 * Dev only: nothing calls it in a static build (adapter.tsx).
 */

export type Colour = 'green' | 'yellow' | 'red';
export type Platform = 'web' | 'flutter';

export interface Failure {
  platform: Platform | 'parity';
  variant?: string;
  layer?: string;
  property?: string;
  figma?: unknown;
  drawn?: unknown;
  message?: string;
}

export interface Pending {
  component: string;
  key: string;
  value: SetValue;
  deletes: boolean;
  previousReason: string | null;
  failing: Failure[] | null;
}

export interface ComponentStatus {
  web: Colour | null;
  flutter: Colour | null;
  waitsOn: Record<Platform, string[]>;
  editable: boolean;
  locked: string | null;
}

export interface Status {
  busy: string | null;
  pending: Pending | null;
  components: Record<string, ComponentStatus>;
}

export type SetValue =
  { token: string } | { keyword: 'FILL' | 'HUG' } | { none: true };

export interface Cell {
  cell: string;
  entry: string;
  at: string | null;
  scopes: { label: string; key: string }[];
  choices: { name: string; value: string }[];
  keywords: string[];
  none: boolean;
}

export interface Inspection {
  component: string;
  revision: string;
  variants: { index: number; name: string }[];
  variant: number;
  layers: {
    name: string;
    className: string | null;
    hidden: boolean;
    cells: Cell[];
  }[];
}

export type Outcome = { ok: true } | { ok: false; failures: Failure[] };

export interface WorkbenchEvent {
  seq: number;
  type: 'busy' | 'changed' | 'failed';
  message?: string;
}

export interface WorkbenchClient {
  health(): Promise<boolean>;
  status(): Promise<Status>;
  inspect(component: string, variant: number): Promise<Inspection>;
  set(body: {
    component: string;
    variant: number;
    layer: string;
    cell: string;
    scope: string;
    value: SetValue;
    revision: string;
  }): Promise<Status>;
  keep(component: string, reason: string): Promise<Outcome>;
  undo(component: string): Promise<Status>;
  approve(component: string, platform: Platform): Promise<Outcome>;
  unapprovePreview(component: string, platform: Platform): Promise<string[]>;
  unapprove(component: string, platform: Platform): Promise<string[]>;
  events(after: number): Promise<{ seq: number; events: WorkbenchEvent[] }>;
}

export const WORKBENCH_URL = 'http://127.0.0.1:6011';

/** The client over HTTP; a refusal throws its sentence. */
export function httpClient(base = WORKBENCH_URL): WorkbenchClient {
  const call = async <T>(path: string, body?: unknown): Promise<T> => {
    const r = await fetch(`${base}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers:
        body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error ?? `${r.status}`);
    return data as T;
  };
  return {
    health: async () => {
      try {
        return (
          (await call<{ service: string }>('/health')).service ===
          'solar-workbench'
        );
      } catch {
        return false;
      }
    },
    status: () => call('/status'),
    inspect: (component, variant) =>
      call(
        `/component?name=${encodeURIComponent(component)}&variant=${variant}`,
      ),
    set: (body) => call('/set', body),
    keep: (component, reason) => call('/keep', { component, reason }),
    undo: (component) => call('/undo', { component }),
    approve: (component, platform) => call('/approve', { component, platform }),
    unapprovePreview: async (component, platform) =>
      (
        await call<{ withdraws: string[] }>('/unapprove/preview', {
          component,
          platform,
        })
      ).withdraws,
    unapprove: async (component, platform) =>
      (
        await call<{ withdraws: string[] }>('/unapprove', {
          component,
          platform,
        })
      ).withdraws,
    events: (after) => call(`/events?after=${after}`),
  };
}
```

- [ ] **Step 5: Run the test and the typecheck**

Run: `cd packages/components && npx vitest run test/workbench-pick.test.mjs && npm run typecheck`
Expected: PASS.

### Task 12: the Storybook bar

**Files:**

- Create: `packages/components/stories/workbench/Bar.tsx`
- Modify: `packages/components/stories/playground/adapter.tsx`
- Modify: `packages/components/.storybook/main.ts`

Before writing, read the SOLAR APIs this uses from their Playground builders:
`stories/playground/button.tsx`, `select.tsx` (Select with DropdownItem children, `onChange(_, value)`),
`text-area.tsx` (`value`, `onChange(event)`), `confirmation-dialog.tsx` (`open`, `intent`, `title`,
`description`, `confirmLabel`, `onConfirm`, `onCancel`). The typecheck is the judge of every prop.

- [ ] **Step 1: Write the bar**

```tsx
// packages/components/stories/workbench/Bar.tsx
/**
 * The workbench bar above a component's Playground (docs/engineering/workflows.md, Fix a component
 * in the viewer): its circle on this platform, and by it Inspect and Approve (🟡), Undo approval
 * (🟢), or what it waits on (🔴). Everything it changes goes through the workbench service
 * (client.ts); it renders nothing where no service answers. Drawn with SOLAR's own components, as
 * Widgetbook's bar (widgetbook/lib/workbench/bar.dart) is.
 */

import Typography from '@mui/material/Typography';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Button } from '../../src/Button.js';
import { ConfirmationDialog } from '../../src/ConfirmationDialog.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { Select } from '../../src/Select.js';
import { TextArea } from '../../src/TextArea.js';
import type {
  Cell,
  Failure,
  Inspection,
  Platform,
  SetValue,
  Status,
  WorkbenchClient,
} from './client.js';
import { layerAt } from './pick.js';

const CIRCLE = { green: '🟢', yellow: '🟡', red: '🔴' } as const;

type Section = 'none' | 'inspect';
type Dialog =
  null | { kind: 'approve' } | { kind: 'unapprove'; withdraws: string[] };

/** A set value as the Select writes it: a token's name, `FILL`, `HUG` or `none`. */
const valueOf = (choice: string): SetValue =>
  choice === 'none'
    ? { none: true }
    : choice === 'FILL' || choice === 'HUG'
      ? { keyword: choice }
      : { token: choice };

const valueText = (v: SetValue) =>
  'token' in v ? v.token : 'keyword' in v ? v.keyword : 'none';

export function FailureList({ failures }: { failures: Failure[] }) {
  return (
    <Typography
      component="ul"
      variant="bodyXsRegular"
      aria-label="Failing checks"
      style={list}
    >
      {failures.map((f, i) => (
        <li key={i}>
          {f.message ??
            `${f.platform}: ${f.variant ?? ''} ${f.layer}.${f.property}: Figma ${JSON.stringify(f.figma)}, drawn ${JSON.stringify(f.drawn)}`}
        </li>
      ))}
    </Typography>
  );
}

export function WorkbenchBar({
  component,
  platform,
  client,
  box,
}: {
  component: string;
  platform: Platform;
  client: WorkbenchClient;
  /** The Playground's width box, for pointing at a layer. */
  box?: RefObject<HTMLElement | null>;
}) {
  const [alive, setAlive] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [variant, setVariant] = useState(0);
  const [layer, setLayer] = useState('root');
  const [section, setSection] = useState<Section>('none');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState<Failure[] | null>(null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [pointing, setPointing] = useState(false);
  const seq = useRef(0);

  const refresh = useCallback(async () => {
    setStatus(await client.status());
    setInspection(await client.inspect(component, variant));
  }, [client, component, variant]);

  // The service answers, or the bar stays away.
  useEffect(() => {
    let live = true;
    void client.health().then((ok) => {
      if (live) setAlive(ok);
    });
    return () => {
      live = false;
    };
  }, [client]);

  useEffect(() => {
    if (alive) void refresh().catch((e: Error) => setError(e.message));
  }, [alive, refresh]);

  // Long-poll the service's events; each change refetches.
  useEffect(() => {
    if (!alive) return undefined;
    let live = true;
    const loop = async () => {
      while (live) {
        try {
          const { seq: next, events } = await client.events(seq.current);
          seq.current = next;
          if (events.some((e) => e.type !== 'busy')) await refresh();
          else if (events.length) setStatus(await client.status());
        } catch {
          await new Promise((ok) => setTimeout(ok, 2000));
        }
      }
    };
    void loop();
    return () => {
      live = false;
    };
  }, [alive, client, refresh]);

  // Pointing: the next click in the box selects the layer under it.
  useEffect(() => {
    const el = box?.current;
    if (!pointing || !el || !inspection) return undefined;
    const classes = Object.fromEntries(
      inspection.layers.map((l) => [l.name, l.className]),
    );
    const onClick = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      setLayer(layerAt(event.target as unknown as HTMLElement, el, classes));
      setPointing(false);
    };
    el.addEventListener('click', onClick, true);
    return () => el.removeEventListener('click', onClick, true);
  }, [box, pointing, inspection]);

  if (!alive || !status) return null;
  const mine = status.components[component];
  if (!mine) return null;
  const colour = mine[platform];
  const pending =
    status.pending?.component === component ? status.pending : null;
  const act = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const cells = inspection?.layers.find((l) => l.name === layer)?.cells ?? [];

  return (
    <div style={bar} aria-label="Workbench">
      <div style={row}>
        <Typography variant="labelSm">
          {colour ? CIRCLE[colour] : ''} Workbench
          {status.busy ? ` · ${status.busy}` : ''}
        </Typography>
        {colour === 'yellow' && mine.editable && (
          <Button
            size="sm"
            prio={section === 'inspect' ? 'secondary' : 'tertiary'}
            onClick={() =>
              setSection(section === 'inspect' ? 'none' : 'inspect')
            }
          >
            Inspect
          </Button>
        )}
        {colour === 'yellow' && (
          <Button
            size="sm"
            prio="tertiary"
            disabled={Boolean(pending)}
            onClick={() => setDialog({ kind: 'approve' })}
          >
            Approve
          </Button>
        )}
        {colour === 'green' && (
          <Button
            size="sm"
            prio="tertiary"
            onClick={() =>
              act(async () =>
                setDialog({
                  kind: 'unapprove',
                  withdraws: await client.unapprovePreview(component, platform),
                }),
              )
            }
          >
            Undo approval
          </Button>
        )}
      </div>

      {colour === 'red' && (
        <Typography variant="bodyXsRegular">
          Waits on {mine.waitsOn[platform].join(', ')}: approve those first.
        </Typography>
      )}
      {colour === 'yellow' && !mine.editable && mine.locked && (
        <Typography variant="bodyXsRegular">
          Inspect is locked: {mine.locked}.
        </Typography>
      )}

      {section === 'inspect' && inspection && !pending && (
        <div style={column}>
          <div style={row}>
            <Select
              size="sm"
              label="Variant"
              value={String(variant)}
              onChange={(_, v) => setVariant(Number(v))}
            >
              {inspection.variants.map((v) => (
                <DropdownItem key={v.index} value={String(v.index)}>
                  {v.name}
                </DropdownItem>
              ))}
            </Select>
            <Select
              size="sm"
              label="Layer"
              value={layer}
              onChange={(_, v) => setLayer(String(v))}
            >
              {inspection.layers.map((l) => (
                <DropdownItem key={l.name} value={l.name}>
                  {l.name}
                  {l.hidden ? ' (hidden here)' : ''}
                </DropdownItem>
              ))}
            </Select>
            {box && (
              <Button
                size="sm"
                prio={pointing ? 'secondary' : 'tertiary'}
                onClick={() => setPointing(!pointing)}
              >
                Point
              </Button>
            )}
          </div>
          {cells.map((c) => (
            <CellRow
              key={c.cell}
              cell={c}
              onSet={(scope, choice) =>
                act(() =>
                  client.set({
                    component,
                    variant,
                    layer,
                    cell: c.cell,
                    scope,
                    value: valueOf(choice),
                    revision: inspection.revision,
                  }),
                )
              }
            />
          ))}
        </div>
      )}

      {pending && !pending.failing && (
        <div style={column}>
          <Typography variant="bodyXsRegular">
            Pending: {pending.key} →{' '}
            {pending.deletes
              ? "Figma's value (the rule is removed)"
              : valueText(pending.value)}
          </Typography>
          {!pending.deletes && (
            <TextArea
              size="sm"
              label="Why (a reviewer must be able to check it)"
              helper={
                pending.previousReason
                  ? `Was: ${pending.previousReason}`
                  : undefined
              }
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          )}
          <div style={row}>
            <Button
              size="sm"
              prio="primary"
              onClick={() =>
                act(async () => {
                  const r = await client.keep(component, reason);
                  if (!r.ok) setFailures(r.failures);
                  else setReason('');
                })
              }
            >
              Keep
            </Button>
            <Button
              size="sm"
              prio="tertiary"
              onClick={() => act(() => client.undo(component))}
            >
              Undo
            </Button>
          </div>
        </div>
      )}

      {failures && <FailureList failures={failures} />}
      {error && (
        <Typography variant="bodyXsRegular" role="alert" style={alert}>
          {error}
        </Typography>
      )}

      <ConfirmationDialog
        open={dialog?.kind === 'approve'}
        title={`Approve ${component} on ${platform === 'web' ? 'the web' : 'Flutter'}?`}
        description="You have checked that it looks and behaves as intended. Its checks run first."
        confirmLabel="Approve"
        onConfirm={() => {
          setDialog(null);
          void act(async () => {
            const r = await client.approve(component, platform);
            if (!r.ok) setFailures(r.failures);
          });
        }}
        onCancel={() => setDialog(null)}
      />
      <ConfirmationDialog
        open={dialog?.kind === 'unapprove'}
        intent="danger"
        title={`Undo ${component}'s approval?`}
        description={
          dialog?.kind === 'unapprove'
            ? `This withdraws the approval of ${dialog.withdraws.join(', ')} on ${platform === 'web' ? 'the web' : 'Flutter'}.`
            : undefined
        }
        confirmLabel="Undo approval"
        onConfirm={() => {
          setDialog(null);
          void act(() => client.unapprove(component, platform));
        }}
        onCancel={() => setDialog(null)}
      />
    </div>
  );
}

/** One cell: its entry and where it sits, a scope, and the value to set it to. */
function CellRow({
  cell,
  onSet,
}: {
  cell: Cell;
  onSet: (scope: string, choice: string) => void;
}) {
  const [scope, setScope] = useState(cell.scopes.at(-1)?.key ?? '');
  const options = [
    ...cell.choices.map((c) => ({
      key: c.name,
      label: `${c.name} · ${c.value}`,
    })),
    ...cell.keywords.map((k) => ({ key: k, label: k })),
    ...(cell.none ? [{ key: 'none', label: 'none' }] : []),
  ];
  if (!options.length)
    return (
      <Typography variant="bodyXsRegular">
        {cell.cell}: {cell.entry} (not editable here: use Report)
      </Typography>
    );
  return (
    <div style={row}>
      <Typography
        variant="bodyXsRegular"
        style={{ minWidth: 'var(--solar-size-control-md)' }}
      >
        {cell.cell}: {cell.entry} {cell.at ? `[${cell.at}]` : ''}
      </Typography>
      <Select
        size="sm"
        label="Scope"
        value={scope}
        onChange={(_, v) => setScope(String(v))}
      >
        {cell.scopes.map((s) => (
          <DropdownItem key={s.key} value={s.key}>
            {s.label}
          </DropdownItem>
        ))}
      </Select>
      <Select
        size="sm"
        label="Set to"
        value=""
        placeholder="Choose"
        onChange={(_, v) => onSet(scope, String(v))}
      >
        {options.map((o) => (
          <DropdownItem key={o.key} value={o.key}>
            {o.label}
          </DropdownItem>
        ))}
      </Select>
    </div>
  );
}

const bar = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-sm)',
  padding: 'var(--solar-inset-sm)',
  border: 'var(--solar-border-default) solid var(--solar-color-border-default)',
  borderRadius: 'var(--solar-radius-control)',
};
const row = {
  display: 'flex',
  flexWrap: 'wrap' as const,
  alignItems: 'center',
  gap: 'var(--solar-inset-xs)',
};
const column = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-sm)',
};
const list = { margin: 0, paddingLeft: 'var(--solar-inset-md)' };
const alert = { color: 'var(--solar-color-text-danger)' };
```

Every `var(--solar-…)` used must exist in `packages/styles/src/generated/tokens.css`; replace any
that does not with the nearest semantic token that does (never a literal).

- [ ] **Step 2: Put it above the Playground, in dev only**

In `stories/playground/adapter.tsx`:

```tsx
import { useMemo, useRef, useState } from 'react';
import { WorkbenchBar } from '../workbench/Bar.js';
import { httpClient } from '../workbench/client.js';

/** The workbench, in `storybook dev` alone: a static build never draws or calls it. */
const DEV = (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true;
```

Inside `PlaygroundView`, before `return`:

```tsx
const box = useRef<HTMLDivElement>(null);
const client = useMemo(() => (DEV ? httpClient() : null), []);
```

and in the JSX, above the Reset `Button`:

```tsx
{
  client && (
    <WorkbenchBar
      component={component}
      platform="web"
      client={client}
      box={box}
    />
  );
}
```

and wrap the builder: `<WidthBox width={local.width}><div ref={box}><BuilderHost … /></div></WidthBox>`.
If the extra `div` changes the Playground interaction tests' results, pass the ref through
`WidthBox` instead (add an optional `boxRef` prop to `core.tsx`'s `WidthBox`).

- [ ] **Step 3: Start the service with `storybook dev`**

In `.storybook/main.ts`, change `viteFinal` to receive Storybook's options and start the service in
development only:

```ts
  viteFinal: async (vite, { configType }) => {
    // The workbench service, for the bar above each Playground: `storybook dev` alone.
    if (configType === 'DEVELOPMENT') {
      const { ensureWorkbench } = await import('../../../scripts/workbench-launch.mjs');
      await ensureWorkbench();
    }
    return {
      ...vite,
      // … the existing object, unchanged
    };
  },
```

- [ ] **Step 4: Typecheck, lint, and build Storybook**

Run: `npm run typecheck && npm run lint && npm run build-storybook -w @bwp-web/components`
Expected: PASS; `grep -r "127.0.0.1:6011" packages/components/storybook-static | head -1` prints
nothing or only dead code (the bar is not drawn: `DEV` is false). If the URL string survives in the
bundle, that is acceptable (never called); note it.

### Task 13: Storybook end-to-end test against a fake client

**Files:**

- Create: `packages/components/test/visual/workbench-page.tsx`
- Create: `packages/components/test/visual/workbench.spec.mjs`
- Modify: `packages/components/test/visual/build.mjs` (build `workbench.html` as it builds
  `playground.html`)

- [ ] **Step 1: Write the page**

```tsx
// packages/components/test/visual/workbench-page.tsx
/**
 * The workbench bar over a fake service, for workbench.spec.mjs: `#yellow`, `#green`, `#red` and
 * `#none` (no service) each draw Button's bar in that state; every call is recorded on
 * `window.calls` for the test to read.
 */
import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import { SolarProvider } from '../../src/SolarProvider.js';
import { WorkbenchBar } from '../../stories/workbench/Bar.js';
import type {
  Status,
  WorkbenchClient,
} from '../../stories/workbench/client.js';

const mode = location.hash.slice(1) || 'yellow';
const calls: unknown[][] = [];
(window as unknown as { calls: unknown[][] }).calls = calls;

const status: Status = {
  busy: null,
  pending: null,
  components: {
    Button: {
      web: mode === 'green' ? 'green' : mode === 'red' ? 'red' : 'yellow',
      flutter: 'yellow',
      waitsOn: { web: mode === 'red' ? ['Counter'] : [], flutter: [] },
      editable: mode === 'yellow',
      locked: mode === 'green' ? 'approved on web' : null,
    },
  },
};

const client: WorkbenchClient = {
  health: async () => mode !== 'none',
  status: async () => status,
  inspect: async () => ({
    component: 'Button',
    revision: 'r1',
    variant: 0,
    variants: [
      { index: 0, name: 'size=md, prio=primary, state=default, danger=false' },
    ],
    layers: [
      {
        name: 'root',
        className: null,
        hidden: false,
        cells: [
          {
            cell: 'radius',
            entry: 'radius.control',
            at: 'base',
            scopes: [{ label: 'every variant', key: 'root.base.radius' }],
            choices: [{ name: 'radius.full', value: '9999px' }],
            keywords: [],
            none: true,
          },
        ],
      },
    ],
  }),
  set: async (b) => {
    calls.push(['set', b]);
    return status;
  },
  keep: async (c, r) => {
    calls.push(['keep', c, r]);
    return { ok: true };
  },
  undo: async (c) => {
    calls.push(['undo', c]);
    return status;
  },
  approve: async (c, p) => {
    calls.push(['approve', c, p]);
    return { ok: true };
  },
  unapprovePreview: async () => ['Button', 'Dialog'],
  unapprove: async (c, p) => {
    calls.push(['unapprove', c, p]);
    return ['Button', 'Dialog'];
  },
  events: () => new Promise(() => {}),
};

createRoot(document.getElementById('root')!).render(
  <SolarProvider>
    <WorkbenchBar component="Button" platform="web" client={client} />
    <p id="ready">ready</p>
  </SolarProvider>,
);
```

- [ ] **Step 2: Write the test**

```js
// packages/components/test/visual/workbench.spec.mjs
import { expect, test } from '@playwright/test';
import { outDir } from './build.mjs';

const open = (page, mode) =>
  page.goto(`file://${outDir}/workbench.html#${mode}`);
const calls = (page) => page.evaluate(() => window.calls);

test('a 🟡 component offers Inspect and Approve; choosing a token sends the set', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await page.getByLabel('Set to').click();
  await page.getByRole('option', { name: /radius\.full/ }).click();
  expect((await calls(page))[0]).toEqual([
    'set',
    {
      component: 'Button',
      variant: 0,
      layer: 'root',
      cell: 'radius',
      scope: 'root.base.radius',
      value: { token: 'radius.full' },
      revision: 'r1',
    },
  ]);
});

test('Approve asks first, and approves on confirming', async ({ page }) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Approve' }).click();
  await expect(page.getByRole('dialog')).toContainText(
    'Approve Button on the web?',
  );
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Approve' })
    .click();
  expect(await calls(page)).toEqual([['approve', 'Button', 'web']]);
});

test('a 🟢 component offers Undo approval alone, naming what it withdraws', async ({
  page,
}) => {
  await open(page, 'green');
  await expect(page.getByRole('button', { name: 'Inspect' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo approval' }).click();
  await expect(page.getByRole('dialog')).toContainText('Button, Dialog');
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Undo approval' })
    .click();
  expect(await calls(page)).toEqual([['unapprove', 'Button', 'web']]);
});

test('a 🔴 component says what it waits on, and offers nothing', async ({
  page,
}) => {
  await open(page, 'red');
  await expect(page.getByLabel('Workbench')).toContainText('Waits on Counter');
  await expect(page.getByRole('button')).toHaveCount(0);
});

test('with no service there is no bar', async ({ page }) => {
  await open(page, 'none');
  await expect(page.locator('#ready')).toBeVisible();
  await expect(page.getByLabel('Workbench')).toHaveCount(0);
});
```

- [ ] **Step 3: Build the page in the global setup**

In `build.mjs`'s `setup()`, add a third `await page('workbench-page.tsx', 'workbench.html')` beside
the Playground page's, the same way (read the file first; follow its exact helper signature).

- [ ] **Step 4: Run it**

Run: `cd packages/components && npx playwright test workbench.spec.mjs`
Expected: 5 passed. A locator that does not find a SOLAR Select's option is fixed in the test's
locator (read `playground.spec.mjs`'s Select test for how it opens one), never by changing the bar
to suit.

### Task 14: the Widgetbook bar

**Files:**

- Modify: `packages/solar_flutter/widgetbook/pubspec.yaml` (add `http`)
- Create: `packages/solar_flutter/widgetbook/lib/workbench/models.dart`
- Create: `packages/solar_flutter/widgetbook/lib/workbench/client.dart`
- Create: `packages/solar_flutter/widgetbook/lib/workbench/bar.dart`
- Modify: `packages/solar_flutter/widgetbook/lib/playground/adapter.dart`
- Modify: `scripts/widgetbook.mjs`
- Test: `packages/solar_flutter/widgetbook/test/workbench_bar_test.dart`

- [ ] **Step 1: Add the dependency**

Run: `cd packages/solar_flutter/widgetbook && flutter pub add http`
Expected: `http` at its latest stable in `pubspec.yaml`.

- [ ] **Step 2: Write the models and the client**

```dart
// packages/solar_flutter/widgetbook/lib/workbench/models.dart
// The workbench service's answers, as the web's client types them (stories/workbench/client.ts):
// the HTTP contract in docs/superpowers/plans/2026-09-27-viewer-workbench.md.

class WorkbenchFailure {
  WorkbenchFailure.fromJson(Map<String, dynamic> j)
    : platform = j['platform'] as String,
      variant = j['variant'] as String?,
      layer = j['layer'] as String?,
      property = j['property'] as String?,
      figma = j['figma'],
      drawn = j['drawn'],
      message = j['message'] as String?;

  final String platform;
  final String? variant, layer, property, message;
  final Object? figma, drawn;

  String get text =>
      message ?? '$platform: ${variant ?? ''} $layer.$property: Figma $figma, drawn $drawn';
}

class WorkbenchPending {
  WorkbenchPending.fromJson(Map<String, dynamic> j)
    : component = j['component'] as String,
      key = j['key'] as String,
      value = (j['value'] as Map).cast<String, Object?>(),
      deletes = j['deletes'] as bool,
      previousReason = j['previousReason'] as String?,
      failing = (j['failing'] as List?)
          ?.map((f) => WorkbenchFailure.fromJson((f as Map).cast()))
          .toList();

  final String component, key;
  final Map<String, Object?> value;
  final bool deletes;
  final String? previousReason;
  final List<WorkbenchFailure>? failing;

  String get valueText =>
      '${value['token'] ?? value['keyword'] ?? (value['none'] == true ? 'none' : '')}';
}

class ComponentStatus {
  ComponentStatus.fromJson(Map<String, dynamic> j)
    : web = j['web'] as String?,
      flutter = j['flutter'] as String?,
      waitsOn = (j['waitsOn'] as Map).map(
        (k, v) => MapEntry(k as String, (v as List).cast<String>()),
      ),
      editable = j['editable'] as bool,
      locked = j['locked'] as String?;

  final String? web, flutter, locked;
  final Map<String, List<String>> waitsOn;
  final bool editable;

  String? colourOn(String platform) => platform == 'web' ? web : flutter;
}

class WorkbenchStatus {
  WorkbenchStatus.fromJson(Map<String, dynamic> j)
    : busy = j['busy'] as String?,
      pending = j['pending'] == null
          ? null
          : WorkbenchPending.fromJson((j['pending'] as Map).cast()),
      components = (j['components'] as Map).map(
        (k, v) => MapEntry(k as String, ComponentStatus.fromJson((v as Map).cast())),
      );

  final String? busy;
  final WorkbenchPending? pending;
  final Map<String, ComponentStatus> components;
}

class WorkbenchCell {
  WorkbenchCell.fromJson(Map<String, dynamic> j)
    : cell = j['cell'] as String,
      entry = j['entry'] as String,
      at = j['at'] as String?,
      scopes = [
        for (final s in j['scopes'] as List)
          (label: (s as Map)['label'] as String, key: s['key'] as String),
      ],
      choices = [
        for (final c in j['choices'] as List)
          (name: (c as Map)['name'] as String, value: c['value'] as String),
      ],
      keywords = (j['keywords'] as List).cast<String>(),
      none = j['none'] as bool;

  final String cell, entry;
  final String? at;
  final List<({String label, String key})> scopes;
  final List<({String name, String value})> choices;
  final List<String> keywords;
  final bool none;
}

class WorkbenchLayer {
  WorkbenchLayer.fromJson(Map<String, dynamic> j)
    : name = j['name'] as String,
      hidden = j['hidden'] as bool,
      cells = [
        for (final c in j['cells'] as List) WorkbenchCell.fromJson((c as Map).cast()),
      ];

  final String name;
  final bool hidden;
  final List<WorkbenchCell> cells;
}

class WorkbenchInspection {
  WorkbenchInspection.fromJson(Map<String, dynamic> j)
    : component = j['component'] as String,
      revision = j['revision'] as String,
      variant = j['variant'] as int,
      variants = [
        for (final v in j['variants'] as List)
          (index: (v as Map)['index'] as int, name: v['name'] as String),
      ],
      layers = [
        for (final l in j['layers'] as List) WorkbenchLayer.fromJson((l as Map).cast()),
      ];

  final String component, revision;
  final int variant;
  final List<({int index, String name})> variants;
  final List<WorkbenchLayer> layers;
}

/// Keep's and Approve's answer: done, or the checks that failed.
class WorkbenchOutcome {
  WorkbenchOutcome.fromJson(Map<String, dynamic> j)
    : ok = j['ok'] as bool,
      failures = [
        for (final f in (j['failures'] as List?) ?? const [])
          WorkbenchFailure.fromJson((f as Map).cast()),
      ];

  final bool ok;
  final List<WorkbenchFailure> failures;
}
```

```dart
// packages/solar_flutter/widgetbook/lib/workbench/client.dart
// The workbench service's client, for the bar (bar.dart): one method per route of the HTTP
// contract, as the web's (stories/workbench/client.ts). Plain HTTP and long-polling, so the same
// code runs in the browser and in widget tests (which pass a fake).

import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

/// The service's URL, given by scripts/widgetbook.mjs when it serves (`--dart-define`); empty in a
/// build, where the bar is never drawn.
const workbenchUrl = String.fromEnvironment('SOLAR_WORKBENCH');

abstract class WorkbenchClient {
  Future<bool> health();
  Future<WorkbenchStatus> status();
  Future<WorkbenchInspection> inspect(String component, int variant);
  Future<WorkbenchStatus> set({
    required String component,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
  });
  Future<WorkbenchOutcome> keep(String component, String reason);
  Future<WorkbenchStatus> undo(String component);
  Future<WorkbenchOutcome> approve(String component, String platform);
  Future<List<String>> unapprovePreview(String component, String platform);
  Future<List<String>> unapprove(String component, String platform);
  Future<({int seq, List<String> types})> events(int after);
}

class WorkbenchException implements Exception {
  WorkbenchException(this.message);
  final String message;
  @override
  String toString() => message;
}

class HttpWorkbenchClient implements WorkbenchClient {
  HttpWorkbenchClient(this.base);
  final String base;

  Future<Map<String, dynamic>> _call(String path, [Map<String, Object?>? body]) async {
    final uri = Uri.parse('$base$path');
    final r = body == null
        ? await http.get(uri)
        : await http.post(uri, headers: {'Content-Type': 'application/json'}, body: jsonEncode(body));
    final data = (jsonDecode(r.body) as Map).cast<String, dynamic>();
    if (r.statusCode >= 400) throw WorkbenchException('${data['error'] ?? r.statusCode}');
    return data;
  }

  @override
  Future<bool> health() async {
    try {
      return (await _call('/health'))['service'] == 'solar-workbench';
    } catch (_) {
      return false;
    }
  }

  @override
  Future<WorkbenchStatus> status() async => WorkbenchStatus.fromJson(await _call('/status'));

  @override
  Future<WorkbenchInspection> inspect(String component, int variant) async =>
      WorkbenchInspection.fromJson(
        await _call('/component?name=${Uri.encodeQueryComponent(component)}&variant=$variant'),
      );

  @override
  Future<WorkbenchStatus> set({
    required String component,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
  }) async => WorkbenchStatus.fromJson(
    await _call('/set', {
      'component': component,
      'variant': variant,
      'layer': layer,
      'cell': cell,
      'scope': scope,
      'value': value,
      'revision': revision,
    }),
  );

  @override
  Future<WorkbenchOutcome> keep(String component, String reason) async =>
      WorkbenchOutcome.fromJson(await _call('/keep', {'component': component, 'reason': reason}));

  @override
  Future<WorkbenchStatus> undo(String component) async =>
      WorkbenchStatus.fromJson(await _call('/undo', {'component': component}));

  @override
  Future<WorkbenchOutcome> approve(String component, String platform) async =>
      WorkbenchOutcome.fromJson(
        await _call('/approve', {'component': component, 'platform': platform}),
      );

  @override
  Future<List<String>> unapprovePreview(String component, String platform) async =>
      ((await _call('/unapprove/preview', {'component': component, 'platform': platform}))['withdraws']
              as List)
          .cast<String>();

  @override
  Future<List<String>> unapprove(String component, String platform) async =>
      ((await _call('/unapprove', {'component': component, 'platform': platform}))['withdraws'] as List)
          .cast<String>();

  @override
  Future<({int seq, List<String> types})> events(int after) async {
    final j = await _call('/events?after=$after');
    return (
      seq: j['seq'] as int,
      types: [for (final e in j['events'] as List) (e as Map)['type'] as String],
    );
  }
}
```

- [ ] **Step 3: Write the failing widget test**

Read `test/helpers.dart` first and use its app wrapper (the SolarTheme) the way
`playground_pilots_test.dart` does.

```dart
// packages/solar_flutter/widgetbook/test/workbench_bar_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:solar_widgetbook/workbench/bar.dart';
import 'package:solar_widgetbook/workbench/client.dart';
import 'package:solar_widgetbook/workbench/models.dart';

import 'helpers.dart';

class FakeClient implements WorkbenchClient {
  FakeClient(this.colour, {this.alive = true});
  final String colour;
  final bool alive;
  final calls = <List<Object?>>[];

  Map<String, dynamic> get _status => {
    'busy': null,
    'pending': null,
    'components': {
      'Button': {
        'web': 'yellow',
        'flutter': colour,
        'waitsOn': {'web': <String>[], 'flutter': colour == 'red' ? ['Counter'] : <String>[]},
        'editable': colour == 'yellow',
        'locked': colour == 'green' ? 'approved on Flutter' : null,
      },
    },
  };

  @override
  Future<bool> health() async => alive;
  @override
  Future<WorkbenchStatus> status() async => WorkbenchStatus.fromJson(_status);
  @override
  Future<WorkbenchInspection> inspect(String component, int variant) async =>
      WorkbenchInspection.fromJson({
        'component': 'Button',
        'revision': 'r1',
        'variant': 0,
        'variants': [
          {'index': 0, 'name': 'size=md, prio=primary, state=default, danger=false'},
        ],
        'layers': [
          {
            'name': 'root',
            'hidden': false,
            'cells': [
              {
                'cell': 'radius',
                'entry': 'radius.control',
                'at': 'base',
                'scopes': [
                  {'label': 'every variant', 'key': 'root.base.radius'},
                ],
                'choices': [
                  {'name': 'radius.full', 'value': '9999px'},
                ],
                'keywords': <String>[],
                'none': true,
              },
            ],
          },
        ],
      });
  @override
  Future<WorkbenchStatus> set({
    required String component,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
  }) async {
    calls.add(['set', component, layer, cell, scope, value, revision]);
    return status();
  }

  @override
  Future<WorkbenchOutcome> keep(String component, String reason) async =>
      WorkbenchOutcome.fromJson({'ok': true});
  @override
  Future<WorkbenchStatus> undo(String component) => status();
  @override
  Future<WorkbenchOutcome> approve(String component, String platform) async {
    calls.add(['approve', component, platform]);
    return WorkbenchOutcome.fromJson({'ok': true});
  }

  @override
  Future<List<String>> unapprovePreview(String c, String p) async => ['Button', 'Dialog'];
  @override
  Future<List<String>> unapprove(String component, String platform) async {
    calls.add(['unapprove', component, platform]);
    return ['Button', 'Dialog'];
  }

  @override
  Future<({int seq, List<String> types})> events(int after) =>
      Completer<({int seq, List<String> types})>().future;
}

void main() {
  Future<FakeClient> pump(WidgetTester tester, String colour, {bool alive = true}) async {
    final client = FakeClient(colour, alive: alive);
    await tester.pumpWidget(
      solarApp(WorkbenchBar(component: 'Button', platform: 'flutter', client: client)),
    );
    await tester.pumpAndSettle();
    return client;
  }

  testWidgets('a 🟡 component offers Inspect and Approve; choosing a token sends the set', (tester) async {
    final client = await pump(tester, 'yellow');
    await tester.tap(find.text('Inspect'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Set to'));
    await tester.pumpAndSettle();
    await tester.tap(find.textContaining('radius.full').last);
    await tester.pumpAndSettle();
    expect(client.calls.single, [
      'set', 'Button', 'root', 'radius', 'root.base.radius', {'token': 'radius.full'}, 'r1',
    ]);
  });

  testWidgets('Approve asks first, and approves on confirming', (tester) async {
    final client = await pump(tester, 'yellow');
    await tester.tap(find.text('Approve'));
    await tester.pumpAndSettle();
    expect(find.text('Approve Button on Flutter?'), findsOneWidget);
    await tester.tap(find.text('Approve').last);
    await tester.pumpAndSettle();
    expect(client.calls, [
      ['approve', 'Button', 'flutter'],
    ]);
  });

  testWidgets('a 🟢 component offers Undo approval alone, naming what it withdraws', (tester) async {
    final client = await pump(tester, 'green');
    expect(find.text('Inspect'), findsNothing);
    await tester.tap(find.text('Undo approval'));
    await tester.pumpAndSettle();
    expect(find.textContaining('Button, Dialog'), findsOneWidget);
    await tester.tap(find.text('Undo approval').last);
    await tester.pumpAndSettle();
    expect(client.calls, [
      ['unapprove', 'Button', 'flutter'],
    ]);
  });

  testWidgets('a 🔴 component says what it waits on', (tester) async {
    await pump(tester, 'red');
    expect(find.textContaining('Waits on Counter'), findsOneWidget);
  });

  testWidgets('with no service there is no bar', (tester) async {
    await pump(tester, 'yellow', alive: false);
    expect(find.text('Inspect'), findsNothing);
    expect(find.textContaining('Workbench'), findsNothing);
  });
}
```

Add `import 'dart:async';` for `Completer`. If `helpers.dart` names its wrapper otherwise than
`solarApp`, use its name.

- [ ] **Step 4: Run it to see it fail**

Run: `cd packages/solar_flutter/widgetbook && flutter test test/workbench_bar_test.dart`
Expected: FAIL, `bar.dart` not found.

- [ ] **Step 5: Write the bar**

The same sections, words and order as the web's `Bar.tsx`, in SOLAR widgets: `SolarButton`
(`prio`, `size: SolarButtonSize.sm`, `onPressed`, `child`), `SolarSelect<String>` (`size`, `label`,
`value`, `options: [SolarSelectOption(value:, label:)]`, `onChanged`, `placeholder`),
`SolarTextArea` (`label`, `helper`, `controller`, `onChanged`), and `showSolarDialog` with
`SolarConfirmationDialog` (`intent`, `title`, `description`, `confirmLabel`, `onConfirm`,
`onCancel`) as `lib/playground/confirmation_dialog.dart` and `overlay.dart` show it. No pointing
(the web's alone).

```dart
// packages/solar_flutter/widgetbook/lib/workbench/bar.dart
// The workbench bar above a component's Playground, as the web's (stories/workbench/Bar.tsx): its
// circle on this platform, and by it Inspect and Approve (🟡), Undo approval (🟢), or what it waits
// on (🔴). Everything it changes goes through the workbench service (client.dart); it draws nothing
// where no service answers.

import 'dart:async';

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'client.dart';
import 'models.dart';

const _circle = {'green': '🟢', 'yellow': '🟡', 'red': '🔴'};

class WorkbenchBar extends StatefulWidget {
  const WorkbenchBar({
    super.key,
    required this.component,
    required this.platform,
    required this.client,
  });

  final String component;
  final String platform;
  final WorkbenchClient client;

  @override
  State<WorkbenchBar> createState() => _WorkbenchBarState();
}

class _WorkbenchBarState extends State<WorkbenchBar> {
  bool _alive = false;
  bool _live = true;
  WorkbenchStatus? _status;
  WorkbenchInspection? _inspection;
  int _variant = 0;
  String _layer = 'root';
  bool _inspecting = false;
  String? _error;
  List<WorkbenchFailure>? _failures;
  final _reason = TextEditingController();
  final _scopes = <String, String>{};
  int _seq = 0;

  @override
  void initState() {
    super.initState();
    unawaited(_start());
  }

  @override
  void dispose() {
    _live = false;
    _reason.dispose();
    super.dispose();
  }

  Future<void> _start() async {
    final ok = await widget.client.health();
    if (!mounted || !ok) return;
    setState(() => _alive = true);
    await _refresh();
    unawaited(_poll());
  }

  Future<void> _refresh() async {
    final status = await widget.client.status();
    final inspection = await widget.client.inspect(widget.component, _variant);
    if (mounted) {
      setState(() {
        _status = status;
        _inspection = inspection;
      });
    }
  }

  Future<void> _poll() async {
    while (_live && mounted) {
      try {
        final r = await widget.client.events(_seq);
        _seq = r.seq;
        if (r.types.any((t) => t != 'busy')) {
          await _refresh();
        } else if (r.types.isNotEmpty) {
          final s = await widget.client.status();
          if (mounted) setState(() => _status = s);
        }
      } catch (_) {
        await Future<void>.delayed(const Duration(seconds: 2));
      }
    }
  }

  Future<void> _act(Future<void> Function() fn) async {
    setState(() => _error = null);
    try {
      await fn();
    } catch (e) {
      if (mounted) setState(() => _error = '$e');
    }
  }

  Future<bool> _confirm({
    required String title,
    required String description,
    required String confirm,
    bool danger = false,
  }) async {
    var yes = false;
    await showSolarDialog<void>(
      context: context,
      builder: (context) => SolarConfirmationDialog(
        intent: danger ? SolarConfirmationDialogIntent.danger : SolarConfirmationDialogIntent.$default,
        title: title,
        description: description,
        confirmLabel: confirm,
        onConfirm: () {
          yes = true;
          Navigator.of(context).pop();
        },
        onCancel: () => Navigator.of(context).pop(),
      ),
    );
    return yes;
  }

  String get _where => widget.platform == 'web' ? 'the web' : 'Flutter';

  Map<String, Object?> _valueOf(String choice) => choice == 'none'
      ? {'none': true}
      : choice == 'FILL' || choice == 'HUG'
      ? {'keyword': choice}
      : {'token': choice};

  @override
  Widget build(BuildContext context) {
    final status = _status;
    final mine = status?.components[widget.component];
    if (!_alive || status == null || mine == null) return const SizedBox.shrink();
    final t = Theme.of(context).extension<SolarTheme>()!;
    final small = t.typography.bodyXsRegular.copyWith(color: t.colors.textSecondary);
    final colour = mine.colourOn(widget.platform);
    final pending = status.pending?.component == widget.component ? status.pending : null;
    final inspection = _inspection;
    final cells = inspection?.layers.where((l) => l.name == _layer).firstOrNull?.cells ?? const [];

    Widget button(String label, VoidCallback? onPressed, {SolarButtonPrio prio = SolarButtonPrio.tertiary}) =>
        SolarButton(prio: prio, size: SolarButtonSize.sm, onPressed: onPressed, child: Text(label));

    return Semantics(
      container: true,
      label: 'Workbench',
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border.all(color: t.colors.borderDefault, width: SolarBorder.defaultWidth),
          borderRadius: BorderRadius.circular(SolarRadius.control),
        ),
        child: Padding(
          padding: const EdgeInsets.all(SolarInset.sm),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            spacing: SolarStack.sm,
            children: [
              Wrap(
                spacing: SolarInset.xs,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  Text(
                    '${_circle[colour] ?? ''} Workbench${status.busy == null ? '' : ' · ${status.busy}'}',
                    style: t.typography.labelSm,
                  ),
                  if (colour == 'yellow' && mine.editable)
                    button(
                      'Inspect',
                      () => setState(() => _inspecting = !_inspecting),
                      prio: _inspecting ? SolarButtonPrio.secondary : SolarButtonPrio.tertiary,
                    ),
                  if (colour == 'yellow')
                    button('Approve', pending != null ? null : () => _act(() async {
                      final yes = await _confirm(
                        title: 'Approve ${widget.component} on $_where?',
                        description: 'You have checked that it looks and behaves as intended. Its checks run first.',
                        confirm: 'Approve',
                      );
                      if (!yes) return;
                      final r = await widget.client.approve(widget.component, widget.platform);
                      if (!r.ok && mounted) setState(() => _failures = r.failures);
                    })),
                  if (colour == 'green')
                    button('Undo approval', () => _act(() async {
                      final withdraws = await widget.client.unapprovePreview(widget.component, widget.platform);
                      final yes = await _confirm(
                        title: "Undo ${widget.component}'s approval?",
                        description: 'This withdraws the approval of ${withdraws.join(', ')} on $_where.',
                        confirm: 'Undo approval',
                        danger: true,
                      );
                      if (yes) await widget.client.unapprove(widget.component, widget.platform);
                    })),
                ],
              ),
              if (colour == 'red')
                Text('Waits on ${mine.waitsOn[widget.platform]!.join(', ')}: approve those first.', style: small),
              if (colour == 'yellow' && !mine.editable && mine.locked != null)
                Text('Inspect is locked: ${mine.locked}.', style: small),
              if (_inspecting && inspection != null && pending == null) ...[
                Wrap(
                  spacing: SolarInset.xs,
                  runSpacing: SolarStack.sm,
                  children: [
                    SizedBox(
                      width: SolarLayout.fieldMd,
                      child: SolarSelect<int>(
                        size: SolarSelectSize.sm,
                        label: 'Variant',
                        value: _variant,
                        options: [
                          for (final v in inspection.variants) SolarSelectOption(value: v.index, label: v.name),
                        ],
                        onChanged: (v) {
                          setState(() => _variant = v);
                          unawaited(_refresh());
                        },
                      ),
                    ),
                    SizedBox(
                      width: SolarLayout.fieldMd,
                      child: SolarSelect<String>(
                        size: SolarSelectSize.sm,
                        label: 'Layer',
                        value: _layer,
                        options: [
                          for (final l in inspection.layers)
                            SolarSelectOption(value: l.name, label: l.hidden ? '${l.name} (hidden here)' : l.name),
                        ],
                        onChanged: (v) => setState(() => _layer = v),
                      ),
                    ),
                  ],
                ),
                for (final c in cells) _cellRow(c, inspection, small),
              ],
              if (pending != null && pending.failing == null) ...[
                Text(
                  'Pending: ${pending.key} → ${pending.deletes ? "Figma's value (the rule is removed)" : pending.valueText}',
                  style: small,
                ),
                if (!pending.deletes)
                  SolarTextArea(
                    size: SolarTextAreaSize.sm,
                    label: 'Why (a reviewer must be able to check it)',
                    helper: pending.previousReason == null ? null : 'Was: ${pending.previousReason}',
                    controller: _reason,
                  ),
                Wrap(
                  spacing: SolarInset.xs,
                  children: [
                    button('Keep', () => _act(() async {
                      final r = await widget.client.keep(widget.component, _reason.text);
                      if (!mounted) return;
                      if (!r.ok) {
                        setState(() => _failures = r.failures);
                      } else {
                        _reason.clear();
                      }
                    }), prio: SolarButtonPrio.primary),
                    button('Undo', () => _act(() async {
                      await widget.client.undo(widget.component);
                    })),
                  ],
                ),
              ],
              if (_failures != null)
                Semantics(
                  label: 'Failing checks',
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [for (final f in _failures!) Text(f.text, style: small)],
                  ),
                ),
              if (_error != null)
                Text(_error!, style: small.copyWith(color: t.colors.textDanger)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _cellRow(WorkbenchCell c, WorkbenchInspection inspection, TextStyle small) {
    final options = [
      for (final ch in c.choices) SolarSelectOption(value: ch.name, label: '${ch.name} · ${ch.value}'),
      for (final k in c.keywords) SolarSelectOption(value: k, label: k),
      if (c.none) const SolarSelectOption(value: 'none', label: 'none'),
    ];
    if (options.isEmpty) {
      return Text('${c.cell}: ${c.entry} (not editable here: use Report)', style: small);
    }
    final scope = _scopes[c.cell] ?? c.scopes.last.key;
    return Wrap(
      spacing: SolarInset.xs,
      runSpacing: SolarStack.sm,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Text('${c.cell}: ${c.entry}${c.at == null ? '' : ' [${c.at}]'}', style: small),
        SizedBox(
          width: SolarLayout.fieldMd,
          child: SolarSelect<String>(
            size: SolarSelectSize.sm,
            label: 'Scope',
            value: scope,
            options: [for (final s in c.scopes) SolarSelectOption(value: s.key, label: s.label)],
            onChanged: (v) => setState(() => _scopes[c.cell] = v),
          ),
        ),
        SizedBox(
          width: SolarLayout.fieldMd,
          child: SolarSelect<String>(
            size: SolarSelectSize.sm,
            label: 'Set to',
            placeholder: 'Choose',
            options: options,
            onChanged: (v) => _act(() async {
              await widget.client.set(
                component: widget.component,
                variant: _variant,
                layer: _layer,
                cell: c.cell,
                scope: scope,
                value: _valueOf(v),
                revision: inspection.revision,
              );
            }),
          ),
        ),
      ],
    );
  }
}
```

The token names used here (`SolarBorder.defaultWidth`, `SolarRadius.control`, `SolarLayout.fieldMd`,
`t.colors.borderDefault`, `t.colors.textDanger`, `t.typography.labelSm`) are what the generated
`tokens.dart` is expected to call them; `flutter analyze` is the judge: where a name differs, use
the generated name of the same token, never a literal. `SolarSelect`'s `SolarSelectOption` may need
`const` removed or a type argument.

- [ ] **Step 6: Run the widget test until it passes**

Run: `cd packages/solar_flutter/widgetbook && flutter test test/workbench_bar_test.dart`
Expected: 5 passed. Fix finders in the test to match how SOLAR's Select opens (read
`playground_pickers_test.dart`), never the bar's behaviour.

- [ ] **Step 7: Draw the bar above the Playground in `flutter run` only**

In `lib/playground/adapter.dart`, import `../workbench/bar.dart` and `../workbench/client.dart`,
add `final String component;` to `_PlaygroundView` (passed from `solarPlayground`), and in the
`Column`'s children, before the Reset `SolarButton`:

```dart
          if (workbenchUrl.isNotEmpty)
            WorkbenchBar(
              component: widget.component,
              platform: 'flutter',
              client: _workbench,
            ),
```

with, in `_PlaygroundViewState`:

```dart
  /// The workbench service's client, where scripts/widgetbook.mjs serves with one.
  late final _workbench = HttpWorkbenchClient(workbenchUrl);
```

- [ ] **Step 8: Serve with the service, the URL and a pid file**

In `scripts/widgetbook.mjs`, replace `else flutter('run', '-d', 'chrome');` with:

```js
else {
  // The workbench service, for the bar above each Playground (serving only, never a build): its
  // URL for the app, and a pid file the service signals to hot-reload after it regenerates.
  const { ensureWorkbench, WORKBENCH_URL } = await import('./workbench-launch.mjs');
  await ensureWorkbench();
  mkdirSync(join(repoRoot, '.workbench'), { recursive: true });
  flutter(
    'run',
    '-d',
    'chrome',
    `--dart-define=SOLAR_WORKBENCH=${WORKBENCH_URL}`,
    '--pid-file',
    join(repoRoot, '.workbench', 'widgetbook.pid'),
  );
}
```

and add `mkdirSync` to the `node:fs` import. Update the header comment's first usage line to say it
starts the workbench too.

- [ ] **Step 9: Analyze, format, test, build**

Run: `cd packages/solar_flutter/widgetbook && dart format lib test && flutter analyze && flutter test && cd ../../.. && node scripts/widgetbook.mjs build`
Expected: all pass; the build does not start the service.

### Task 15: Batch 2 smoke run in both viewers, then stop

- [ ] **Step 1: Storybook**

Run `npm run storybook` (background), open `http://localhost:6006/?path=/story/solar-button--playground`
with Playwright's browser (or `curl` the service to confirm it started: `curl -s 127.0.0.1:6011/health`).
In the bar: Inspect → Layer `root` → `radius` → Set to a `radius.*` token. Expected: the bar shows
"Regenerating…", then the Button's corners change and the bar shows the pending edit with Keep and
Undo. Press **Undo**. Expected: `git status --porcelain` prints nothing.

- [ ] **Step 2: Widgetbook**

Run `npm run widgetbook` (background), open Button's Playground, repeat Step 1. Expected: the same,
the app hot-reloading after the regeneration; Undo leaves `git status --porcelain` empty.

Never press Keep or Approve in a smoke run (they would write a rule or an approval a person did
not decide). If a run leaves a pending edit, press Undo, or run
`curl -s -X POST 127.0.0.1:6011/undo -d '{"component":"Button"}'`.

- [ ] **Step 3: Stop both viewers (the service exits on its own a minute later).**

- [ ] **Step 4: Stop for the owner's review of Batch 2.** Tell the owner the bar is live under
      `npm run storybook` and `npm run widgetbook`, and that Keep and Approve were not exercised against
      the real files.

---

# Batch 3: Report, the feedback queue and `/solar-feedback`

### Task 16: notes

**Files:**

- Create: `packages/codegen/src/workbench/feedback.mjs`
- Create: `spec/feedback/.gitkeep` (empty)
- Modify: `packages/codegen/src/workbench/session.mjs` (`report`)
- Test: `packages/codegen/test/workbench-feedback.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-feedback.test.mjs
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { noteFile, noteText } from '../src/workbench/feedback.mjs';
import { createSession } from '../src/workbench/session.mjs';

describe('a Report note', () => {
  it('is named after the component, numbered after the notes already there', () => {
    expect(noteFile([], 'Text Input')).toBe('text-input-1.yaml');
    expect(
      noteFile(
        ['text-input-1.yaml', 'text-input-3.yaml', 'button-1.yaml'],
        'Text Input',
      ),
    ).toBe('text-input-4.yaml');
  });

  it('holds everything the agent needs, as YAML under a header', () => {
    const text = noteText({
      component: 'Button',
      platform: 'web',
      controls: { label: 'Save', size: 'md' },
      layer: 'label',
      variant: 'size=md, prio=primary, state=default, danger=false',
      note: 'The label wraps at 120 wide.',
      on: '2026-09-27',
    });
    expect(text.startsWith('# A note for /solar-feedback')).toBe(true);
    expect(parse(text)).toEqual({
      component: 'Button',
      platform: 'web',
      on: '2026-09-27',
      note: 'The label wraps at 120 wide.',
      layer: 'label',
      variant: 'size=md, prio=primary, state=default, danger=false',
      controls: { label: 'Save', size: 'md' },
    });
  });

  it('is written by the session for a component that may be worked on, and refused otherwise', async () => {
    const files = new Map();
    const coloured = (c) => ({
      web: [{ name: 'Button', colour: c, uses: [], waitsOn: [] }],
      flutter: [{ name: 'Button', colour: 'yellow', uses: [], waitsOn: [] }],
    });
    let colourNow = 'yellow';
    const s = createSession({
      files: {
        read: (p) => files.get(p) ?? null,
        write: (p, t) => files.set(p, t),
        remove: (p) => files.delete(p),
        list: (dir) =>
          [...files.keys()]
            .filter((k) => k.startsWith(`${dir}/`))
            .map((k) => k.slice(dir.length + 1)),
      },
      feedbackDir: 'spec/feedback',
      pendingPath: '.workbench/pending.json',
      status: async () => ({ coloured: coloured(colourNow), approvals: {} }),
      today: () => '2026-09-27',
      emit: () => {},
    });
    const { file } = await s.report({
      component: 'Button',
      platform: 'web',
      controls: {},
      note: 'Too tight.',
    });
    expect(file).toBe('spec/feedback/button-1.yaml');
    expect(parse(files.get(file)).note).toBe('Too tight.');
    await expect(
      s.report({
        component: 'Button',
        platform: 'web',
        controls: {},
        note: ' ',
      }),
    ).rejects.toThrow(/note/);
    colourNow = 'green';
    await expect(
      s.report({
        component: 'Button',
        platform: 'web',
        controls: {},
        note: 'x',
      }),
    ).rejects.toThrow(/approved/);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-feedback.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement `feedback.mjs`**

```js
// packages/codegen/src/workbench/feedback.mjs
/**
 * A Report note: what the workbench writes for `/solar-feedback` (.claude/skills/solar-feedback/)
 * to act on, one file per note in spec/feedback/, deleted once resolved.
 */

import { stringify } from 'yaml';

const slugOf = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The next note's file name for a component, after the files already in spec/feedback/. */
export function noteFile(existing, component) {
  const slug = slugOf(component);
  const numbers = existing
    .map((f) => f.match(new RegExp(`^${slug}-(\\d+)\\.yaml$`))?.[1])
    .filter(Boolean)
    .map(Number);
  return `${slug}-${Math.max(0, ...numbers) + 1}.yaml`;
}

const HEADER =
  '# A note for /solar-feedback (docs/engineering/workflows.md, Fix a component in the viewer),\n' +
  '# written by the workbench. The agent resolves it and deletes this file.\n';

/** The note as YAML: what, where, the person's words, and any failing check. */
export function noteText({
  component,
  platform,
  controls,
  layer,
  variant,
  note,
  failures,
  on,
}) {
  const data = {
    component,
    platform,
    on,
    note,
    ...(layer && { layer }),
    ...(variant && { variant }),
    controls: controls ?? {},
    ...(failures?.length && { failures }),
  };
  return HEADER + stringify(data, { lineWidth: 100 });
}
```

- [ ] **Step 4: Add `report` to the session**

In `session.mjs`, import `{ noteFile, noteText }` and add:

```js
    report: ({ component: name, platform, controls, layer, variant, note }) =>
      serial('Saving the note…', async () => {
        if (!String(note ?? '').trim()) refuse('write the note', 400);
        await mustEdit(name);
        const file = `${deps.feedbackDir}/${noteFile(files.list(deps.feedbackDir), name)}`;
        files.write(file, noteText({ component: name, platform, controls, layer, variant, note: note.trim(), on: deps.today() }));
        return { file };
      }),
```

`mustEdit` refuses a 🟢 or 🔴 component with the gate's sentence ("approved on web: …"). Give the
real session (`scripts/workbench.mjs`) `feedbackDir: 'spec/feedback'` and
`list: (dir) => existsSync(abs(dir)) ? readdirSync(abs(dir)) : []` (import `readdirSync`), and the
Batch 1 test worlds `list: () => []`, `feedbackDir: 'spec/feedback'`.

- [ ] **Step 5: Run the codegen suite**

Run: `cd packages/codegen && npx vitest run`
Expected: PASS.

### Task 17: Report in both bars

**Files:**

- Modify: `packages/components/stories/workbench/client.ts` (`report`)
- Modify: `packages/components/stories/workbench/Bar.tsx`
- Modify: `packages/components/stories/playground/adapter.tsx` (pass the controls' values)
- Modify: `packages/components/test/visual/workbench-page.tsx`, `workbench.spec.mjs`
- Modify: `packages/solar_flutter/widgetbook/lib/workbench/client.dart`, `bar.dart`,
  `lib/playground/adapter.dart`, `test/workbench_bar_test.dart`

- [ ] **Step 1: Write the failing tests, web and Flutter**

Web, add to `workbench.spec.mjs`:

```js
test('Report saves the note with the Playground’s values', async ({ page }) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Report' }).click();
  await page
    .getByLabel('Note for the agent')
    .fill('The label wraps too early.');
  await page.getByRole('button', { name: 'Save note' }).click();
  expect(await calls(page)).toEqual([
    [
      'report',
      {
        component: 'Button',
        platform: 'web',
        controls: { label: 'Label' },
        layer: 'root',
        variant: 'size=md, prio=primary, state=default, danger=false',
        note: 'The label wraps too early.',
      },
    ],
  ]);
  await expect(page.getByLabel('Workbench')).toContainText(
    'spec/feedback/button-1.yaml',
  );
});
```

and give the fake page `report: async (b) => { calls.push(['report', b]); return { file: 'spec/feedback/button-1.yaml' }; }`
and `controls={{ label: 'Label' }}` on its `WorkbenchBar`.

Flutter, add to `workbench_bar_test.dart` the same case (tap `Report`, enter text into the
`Note for the agent` field, tap `Save note`, expect the fake's `calls` to hold
`['report', 'Button', 'flutter', {'label': 'Label'}, 'root', <variant name>, 'The label wraps too early.']`
and the file name shown), with `report` in `FakeClient` and `controls: const {'label': 'Label'}`
on the bar.

- [ ] **Step 2: Run both to see them fail**

Run: `cd packages/components && npx playwright test workbench.spec.mjs` and
`cd packages/solar_flutter/widgetbook && flutter test test/workbench_bar_test.dart`
Expected: the new cases FAIL.

- [ ] **Step 3: Implement**

Web client: `report(body: { component: string; platform: Platform; controls: Record<string, unknown>; layer?: string; variant?: string; note: string }): Promise<{ file: string }>`
calling `POST /report`. Bar: a `controls: Record<string, unknown>` prop; a **Report** button beside
Inspect (same conditions: 🟡 and editable) opening a section with a `TextArea` labelled
`Note for the agent` and a primary `Save note` button, which calls `client.report({ component,
platform, controls, layer, variant: inspection?.variants[variant]?.name, note })`, then shows
`Saved: <file>` and clears the text. Sections are exclusive (`'none' | 'inspect' | 'report'`). The
adapter passes `controls={local}`.

Flutter: the same method on `WorkbenchClient` and `HttpWorkbenchClient` (returning the file), the
same button, section, words and call in `bar.dart`, and `controls: widget.values` from the adapter.

- [ ] **Step 4: Run both until they pass, then format, analyze, typecheck**

Run the two commands from Step 2, then `npm run typecheck && npm run lint`,
`dart format lib test && flutter analyze` in the widgetbook.
Expected: PASS.

### Task 18: the `/solar-feedback` skill, then stop

**Files:**

- Create: `.claude/skills/solar-feedback/SKILL.md`
- Modify: `.gitignore`

- [ ] **Step 1: Let the project skill be committed**

In `.gitignore`, replace the line `.claude/skills/` with:

```
.claude/skills/*
!.claude/skills/solar-feedback/
```

Run: `git check-ignore -v .claude/skills/solar-feedback/SKILL.md; echo $?`
Expected: exit 1 (not ignored) once the file exists.

- [ ] **Step 2: Write the skill**

```markdown
---
name: solar-feedback
description: Work through the notes the viewers' workbench saved in spec/feedback/ (Report, and Send to agent): fix each on a 🟡 component where its kind of change belongs, propose where new overlay rules belong instead, verify, and stop for review. Use when the owner says to process feedback, run /solar-feedback, or act on workbench notes.
---

# Process the workbench's feedback

The notes in `spec/feedback/*.yaml` were written by a person in Storybook or Widgetbook
(docs/engineering/workflows.md, Fix a component in the viewer). Each names a component, a platform,
the Playground's values, perhaps a layer and a variant, the person's words, and perhaps the checks
that failed (`failures`). CLAUDE.md's rules hold throughout; these add to them.

## 1. Read the queue

List `spec/feedback/*.yaml` (not `.gitkeep`). Run `npm run solar:status`. For each note:

- its component 🔴 or 🟢 on **either** platform: leave the note, and list it in your report with
  why (never work on 🔴; never change a 🟢 component: a person withdraws the approval first);
- otherwise it is yours to resolve.

## 2. Resolve each note

1. `npm run solar:explain -- "<Component>" --variant "<variant>"` (and `--layer` where the note
   names one) to see what draws the cell and why.
2. Decide where the change goes with
   [workflows.md, Decide where a change goes](../../../docs/engineering/workflows.md#decide-where-a-change-goes).
   A note with `failures` after a workbench edit is settled by an overlay decision that records the
   person's judgement (so the check excuses it: `set`, `accept`, …) or by fixing the knock-on in the
   code; **never** by loosening a check or editing `spec/verify/`.
3. Make the change; `npm run solar:codegen`; run that component's checks
   (`SOLAR_VISUAL_ONLY="<Component>" npx playwright test components.spec.mjs -g "in every variant"`
   in `packages/components`, `flutter test test/visual/components_visual_test.dart --name "^<Component> draws what Figma draws"`
   in `packages/solar_flutter`).
4. Delete the note (`rm spec/feedback/<file>`).

Never write `spec/approvals.yaml`, and never call the workbench service's `/approve` or
`/unapprove`.

## 3. Propose where new rules belong

`git diff --stat -- spec/overlay` and `npm run solar:overlay:audit`: for each `set` rule added since
the last commit, ask whether the same decision belongs on sibling components, in
`spec/overlay/defaults.yaml`, the normalizer or an emitter. Write each proposal down; make one only
when `npm run solar:status` shows it cancels no approval. A proposal that would cancel approvals is
**listed, not made**, with the approvals it would cancel, for the owner to decide.

## 4. Verify and stop

Run the whole Verify block (docs/engineering/workflows.md, Verify). Report: each note resolved and
how, each note left and why, each proposal made or listed. Then stop for the owner's review; the
owner commits.
```

- [ ] **Step 3: Check the skill's links and format**

Run: `npx prettier --check .claude/skills/solar-feedback/SKILL.md` (write it if it fails:
`npx prettier --write …`), and confirm the relative link resolves:
`ls docs/engineering/workflows.md`.

- [ ] **Step 4: Stop for the owner's review of Batch 3.**

---

# Batch 4: the component's checks behind Keep and Approve, and Send to agent

### Task 19: one component's visual check on the web

**Files:**

- Modify: `packages/components/test/visual/components.spec.mjs` (the `for (const component of NAMES)` loop, line ~549)

- [ ] **Step 1: Filter by `SOLAR_VISUAL_ONLY`**

```js
// One component alone, for the workbench's checks behind Keep and Approve
// (packages/codegen/src/workbench/checks.mjs). Unset in CI and the Verify block: every component.
const only = process.env.SOLAR_VISUAL_ONLY;
if (only && !NAMES.includes(only))
  throw new Error(`SOLAR_VISUAL_ONLY: no component ${only}`);

for (const component of only ? [only] : NAMES)
```

- [ ] **Step 2: Prove it runs one component, and all without it**

Run: `cd packages/components && SOLAR_VISUAL_ONLY=Button npx playwright test components.spec.mjs -g "in every variant" --list | tail -3`
Expected: `Total: 2 tests in 1 file` (Button, Button in Dark).
Run: `npx playwright test components.spec.mjs -g "in every variant" --list | tail -1`
Expected: the full count, as before the change.

### Task 20: the checks module

**Files:**

- Create: `packages/codegen/src/workbench/checks.mjs`
- Test: `packages/codegen/test/workbench-checks.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// packages/codegen/test/workbench-checks.test.mjs
import { describe, expect, it } from 'vitest';
import {
  checkCommands,
  failuresOf,
  runChecks,
} from '../src/workbench/checks.mjs';

describe('a component’s own checks', () => {
  it('are its two visual checks and the parity suite', () => {
    const [web, flutter, parity] = checkCommands('Icon Button');
    expect(web).toMatchObject({
      platform: 'web',
      cmd: 'npx',
      env: { SOLAR_VISUAL_ONLY: 'Icon Button' },
    });
    expect(web.args).toEqual([
      'playwright',
      'test',
      'components.spec.mjs',
      '-g',
      'in every variant',
    ]);
    expect(flutter.args).toEqual([
      'test',
      'test/visual/components_visual_test.dart',
      '--name',
      '^Icon Button draws what Figma draws',
    ]);
    expect(parity.args).toEqual([
      'vitest',
      'run',
      'test/component-parity.test.mjs',
    ]);
  });

  it('escape a name for the Flutter test’s pattern', () => {
    expect(checkCommands('A (B)')[1].args[3]).toBe(
      '^A \\(B\\) draws what Figma draws',
    );
  });

  it('read each platform’s reported failures, Light and Dark', () => {
    const files = {
      '/w/button-failures.json':
        '[{"variant":"v","layer":"root","property":"height","figma":40,"rendered":44}]',
      '/w/button-dark-failures.json': '[]',
    };
    const f = failuresOf(
      'Button',
      { web: '/w/button', flutter: '/f/button' },
      (p) => files[p] ?? null,
    );
    expect(f).toEqual([
      {
        platform: 'web',
        variant: 'v',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: 44,
      },
    ]);
  });

  it('pass only when every command passes; a failing run with no report says so', async () => {
    const run = async (cmd) => ({
      ok: cmd !== 'npx' || false,
      output: 'boom\n',
    });
    const r = await runChecks('Button', {
      run,
      read: () => null,
      stems: { web: '/w/button', flutter: '/f/button' },
    });
    expect(r.ok).toBe(false);
    expect(
      r.failures.some((f) => f.platform === 'web' && /boom/.test(f.message)),
    ).toBe(true);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-checks.test.mjs`
Expected: FAIL.

- [ ] **Step 3: Implement**

First read the Flutter check's report names: `packages/solar_flutter/test/visual/components_visual_test.dart`
(where it writes `build/visual/<name>-failures.json`) and whether Dark writes `-dark-failures.json`;
make `failuresOf` read exactly what both checks write.

```js
// packages/codegen/src/workbench/checks.mjs
/**
 * A component's own checks, behind the workbench's Keep and Approve: its web visual check (one
 * component, `SOLAR_VISUAL_ONLY`), its Flutter visual check (`--name`) and the parity suite, and the
 * failures their reports hold (the reports solar:explain reads: explain/index.mjs).
 */

import { join } from 'node:path';
import { packagesDir } from '../util/paths.mjs';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function checkCommands(component) {
  return [
    {
      platform: 'web',
      cmd: 'npx',
      args: [
        'playwright',
        'test',
        'components.spec.mjs',
        '-g',
        'in every variant',
      ],
      cwd: join(packagesDir, 'components'),
      env: { SOLAR_VISUAL_ONLY: component },
    },
    {
      platform: 'flutter',
      cmd: 'flutter',
      args: [
        'test',
        'test/visual/components_visual_test.dart',
        '--name',
        `^${escape(component)} draws what Figma draws`,
      ],
      cwd: join(packagesDir, 'solar_flutter'),
      env: {},
    },
    {
      platform: 'parity',
      cmd: 'npx',
      args: ['vitest', 'run', 'test/component-parity.test.mjs'],
      cwd: join(packagesDir, 'codegen'),
      env: {},
    },
  ];
}

/** Each platform's report stem for a component, as the checks name their files. */
export const stemsOf = (component) => ({
  web: join(
    packagesDir,
    'components',
    'test',
    'visual',
    '.out',
    component.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  ),
  flutter: join(
    packagesDir,
    'solar_flutter',
    'build',
    'visual',
    component.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  ),
});

/** The failures both platforms' last runs reported for a component, Light and Dark. */
export function failuresOf(component, stems, read) {
  const out = [];
  for (const [platform, stem] of Object.entries(stems))
    for (const file of [
      `${stem}-failures.json`,
      `${stem}-dark-failures.json`,
    ]) {
      const text = read(file);
      if (!text) continue;
      for (const f of JSON.parse(text))
        out.push({
          platform,
          variant: f.variant,
          layer: f.layer,
          property: f.property,
          figma: f.figma,
          drawn: f.rendered ?? f.painted,
        });
    }
  return out;
}

/**
 * Runs the component's checks one after another (they share build directories: workflows.md).
 * @param {{run: Function, read: Function, stems?: object}} deps
 */
export async function runChecks(
  component,
  { run, read, stems = stemsOf(component) },
) {
  const results = [];
  for (const c of checkCommands(component))
    results.push({
      ...c,
      ...(await run(c.cmd, c.args, { cwd: c.cwd, env: c.env })),
    });
  const failures = failuresOf(component, stems, read);
  for (const r of results)
    if (!r.ok && !failures.some((f) => f.platform === r.platform))
      failures.push({
        platform: r.platform,
        message: r.output.trim().split('\n').slice(-8).join('\n'),
      });
  return { ok: results.every((r) => r.ok), failures };
}
```

- [ ] **Step 4: Run it**

Run: `cd packages/codegen && npx vitest run test/workbench-checks.test.mjs`
Expected: PASS.

- [ ] **Step 5: Give the real session the checks**

In `scripts/workbench.mjs`'s `realSession`, import `runChecks` from `workbench/checks.mjs` and
replace `checks: async () => ({ ok: true, failures: [] })` with:

```js
    checks: (component) =>
      runChecks(component, {
        run: (cmd, args, opts) => run(cmd, args, opts),
        read: (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null),
      }),
```

The session's `approve` then refuses while any check fails, and `keep` keeps the edit pending with
its failures (Task 7's code already does both).

### Task 21: Send to agent

**Files:**

- Modify: `packages/codegen/src/workbench/session.mjs` (`send`)
- Test: add to `packages/codegen/test/workbench-session.test.mjs`
- Modify: both clients and bars, both end-to-end tests

- [ ] **Step 1: Write the failing session test**

Add to `workbench-session.test.mjs` (its `world()` gains `feedbackDir: 'spec/feedback'` and a
`list` over the map, as Task 16's test has):

```js
it('sends a failing Keep to the agent: the edit stays, a note carries the failures', async () => {
  w.deps.checks = async () => ({
    ok: false,
    failures: [
      {
        platform: 'web',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: 44,
      },
    ],
  });
  s = createSession(w.deps);
  await s.set(setBody(s));
  const r = await s.keep({ component: 'Button', reason: 'Why.' });
  expect(r.ok).toBe(false);
  expect((await s.status()).pending.failing).toHaveLength(1);
  const { file } = await s.send({
    component: 'Button',
    platform: 'web',
    note: 'Looks right to me.',
  });
  expect(parse(w.files.get(file))).toMatchObject({
    note: 'Looks right to me.',
    failures: [{ property: 'height' }],
  });
  expect((await s.status()).pending).toBeNull();
  expect(w.files.get('spec/overlay/button.yaml')).toContain('reason: Why.');
});

it('sends a refused Approve to the agent with its failures, the component unapproved', async () => {
  w.deps.checks = async () => ({
    ok: false,
    failures: [{ platform: 'flutter', message: 'boom' }],
  });
  s = createSession(w.deps);
  const r = await s.approve({ component: 'Button', platform: 'web' });
  const { file } = await s.send({
    component: 'Button',
    platform: 'web',
    note: 'Approve refused.',
    failures: r.failures,
  });
  expect(parse(w.files.get(file)).failures[0].message).toBe('boom');
});
```

(import `parse` from `yaml` at the top.)

- [ ] **Step 2: Run to see it fail**

Run: `cd packages/codegen && npx vitest run test/workbench-session.test.mjs`
Expected: the two new cases FAIL (`send is not a function`).

- [ ] **Step 3: Implement `send`**

```js
    /**
     * Send to agent: a note carrying the failing checks, from a Keep (the pending edit's, which is
     * then kept as it is) or a refused Approve (the failures the viewer holds).
     */
    send: ({ component: name, platform, note, failures }) =>
      serial('Saving the note…', async () => {
        const fromKeep = pending?.component === name && pending.failing;
        const carried = fromKeep ? pending.failing : failures;
        if (!carried?.length) refuse(`${name} has no failing checks to send`, 400);
        const file = `${deps.feedbackDir}/${noteFile(files.list(deps.feedbackDir), name)}`;
        files.write(
          file,
          noteText({
            component: name,
            platform,
            controls: {},
            note: String(note ?? '').trim() || 'The checks failed where the person judged the component right.',
            failures: carried,
            on: deps.today(),
            ...(fromKeep && { layer: pending.key.split('.')[0] }),
          }),
        );
        if (fromKeep) savePending(null);
        return { file };
      }),
```

Approve's `refuse` for a 🟢/🔴 component still happens before any check; `send` itself needs no
gate beyond having failures (the component was editable when they arose).

- [ ] **Step 4: Both bars**

Web client `send(component, platform, note, failures?) → { file }` (`POST /send`); Flutter the same.
In both bars, where the failure list shows (after Keep or Approve), draw beside it: a `TextArea`
labelled `Note for the agent`, **Send to agent** (primary) calling `send(component, platform, note,
failures)` then showing `Saved: <file>` and clearing the failures, and, after a failing Keep,
**Undo** (the pending edit's). Add one end-to-end case per viewer: the fake's `approve` returns
`{ ok: false, failures: [{ platform: 'web', message: 'boom' }] }` in a `#failing` mode; confirming
Approve shows `boom`; Send to agent records `['send', 'Button', <platform>, <note>, <failures>]`.

- [ ] **Step 5: Run everything touched**

Run: `cd packages/codegen && npx vitest run`, `cd packages/components && npx playwright test workbench.spec.mjs`,
`cd packages/solar_flutter/widgetbook && flutter test test/workbench_bar_test.dart && flutter analyze`,
`npm run typecheck && npm run lint`.
Expected: PASS.

### Task 22: Batch 4 smoke run of the checks, then stop

- [ ] **Step 1: The checks run and pass for Button**

```bash
node -e "
const { runChecks } = await import('./packages/codegen/src/workbench/checks.mjs');
const { spawn } = await import('node:child_process');
const { existsSync, readFileSync } = await import('node:fs');
const run = (cmd, args, o) => new Promise((ok) => { const c = spawn(cmd, args, { ...o, env: { ...process.env, ...o.env } }); let out=''; c.stdout.on('data', d => out += d); c.stderr.on('data', d => out += d); c.on('close', code => ok({ ok: code === 0, output: out })); });
console.log(JSON.stringify(await runChecks('Button', { run, read: (p) => existsSync(p) ? readFileSync(p, 'utf8') : null })));
" --input-type=module
```

Expected: `{"ok":true,"failures":[]}` in about half a minute.

- [ ] **Step 2: Stop for the owner's review of Batch 4.**

---

# Closing: docs, decisions, Verify

### Task 23: the docs, in the same change

**Files:**

- Modify: `docs/engineering/workflows.md`, `docs/engineering/architecture.md`,
  `docs/engineering/decisions.md`, `docs/engineering/open-work.md`, `CLAUDE.md`,
  `packages/components/stories/README.md`, `packages/solar_flutter/widgetbook/README.md`,
  `packages/codegen/README.md`, `docs/superpowers/decisions-to-review.md`

- [ ] **Step 1: workflows.md**

Add a section **Fix a component in the viewer** after "Add a component": start `npm run storybook`
or `npm run widgetbook` (the service starts with them); the bar and what each circle offers;
Inspect (layer, variant, cell, scope, token; the preview is the regenerated component; Keep with a
reason, or Undo; choosing Figma's value removes the rule; one pending edit at a time); Report and
`/solar-feedback`; the checks behind Keep and Approve, and Send to agent; "an agent never presses
Approve or Undo approval". In **Approve a component**, add that a person may press Approve or
Undo approval in the viewer instead of pasting, with what Undo approval withdraws.

- [ ] **Step 2: architecture.md**

In **The viewers**, a paragraph on the workbench: the service (`scripts/workbench.mjs`, port 6011,
localhost, dev only, the launchers), its logic in `packages/codegen/src/workbench/`, the HTTP
contract in a table (move the table from this plan), long-polling, the lock rule, the pending edit
and `solar:codegen --pending`. In **Approvals**, one sentence: the viewers' buttons write the
record for a person.

- [ ] **Step 3: decisions.md**

Rows, owner 2026-09-27: the workbench (dev-only, local; a token inspector writing `set` rules, not a
free visual editor or a code editor, and why); the preview is the real regeneration; the queue and
`/solar-feedback` rather than an agent per save; Approve and Undo approval in the viewers, Undo
approval withdrawing the approvals above; approved components locked; a person's judgement enters
as an overlay decision, never a loosened check. Taken rows for this plan's own decisions 1–9.

- [ ] **Step 4: open-work.md**

Remove "Recording approvals from the viewers" and "The tweak panel" (the workbench is it). Also update `docs/README.md` (spec/approvals.yaml by people or the viewers' buttons; rows for `spec/feedback/` and the git-ignored `.workbench/`), the `--propose` lines of workflows.md (the workbench is the other route), a Pitfall (a pending edit leaves `TODO(reason)` in spec/overlay, so plain codegen and Verify refuse until Keep or Undo), and architecture.md's invariants on reasons (the placeholder passes only under `--pending`). Add under an appropriate heading: the sidebars'
circles refresh when the viewer next starts; Inspect sets only tokens, `none` and `FILL`/`HUG`;
pointing at a layer is the web's alone.

- [ ] **Step 5: CLAUDE.md**

In **Working with the owner**, change the approvals bullet's first sentence to: "**`spec/approvals.yaml`
is written by people, never by an agent**: by hand, or by a person pressing Approve or Undo approval
in a viewer's workbench bar; an agent never edits it and never calls the workbench service's
`/approve` or `/unapprove`." Add a bullet: "Notes a person saves in the workbench go to
`spec/feedback/`; `/solar-feedback` works through them (`.claude/skills/solar-feedback/`)."

- [ ] **Step 6: The READMEs**

`stories/README.md` and `widgetbook/README.md`: the bar, in two or three sentences each, linking
to workflows.md. `packages/codegen/README.md`: `src/workbench/` in the layout block and a line in
"Tooling around the build"; `solar:codegen --pending` among the CLI's flags.

- [ ] **Step 7: decisions-to-review.md**

Append this plan's decisions 1–9 as new numbered entries, each with what was chosen, the
alternative, and why, so the owner can correct them.

- [ ] **Step 8: Format and check**

Run: `npx prettier --write` on each changed Markdown file, then
`node scripts/check-personal-data.mjs` and the Prettier check line of the Verify block.
Expected: pass.

### Task 24: the whole Verify block

- [ ] **Step 1: Run every line of [workflows.md, Verify](../../engineering/workflows.md#verify-before-saying-a-task-is-done)**

Expected: every step passes; `git status --porcelain -- spec packages/styles/src/generated packages/assets/src/generated packages/solar_flutter/lib/src/generated packages/components/stories`
after `solar:codegen` lists only the new hand-written files under `packages/components/stories/workbench/`
(hand-written, not generated) and nothing generated.

- [ ] **Step 2: Confirm nothing was left behind**

Run: `ls .workbench 2>/dev/null; ls spec/feedback; grep -rl "TODO(reason)" spec/overlay; git diff --stat -- spec/approvals.yaml`
Expected: no pending file, only `.gitkeep` in `spec/feedback`, no placeholder, no change to the
approvals record.

- [ ] **Step 3: Report to the owner and stop.** Name every check run and its result, and point to
      the new entries in `docs/superpowers/decisions-to-review.md`.
