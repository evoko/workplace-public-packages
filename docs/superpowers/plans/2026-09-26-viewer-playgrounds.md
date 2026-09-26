# Viewer playgrounds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every component's Playground in Storybook and in Widgetbook gets generated controls for
its slots and a width, a live two-way component, a Reset button and an event log, the same on both.

**Architecture:** One pure generator function derives each component's controls from its IR; both
viewers read that list. A small hand-written builder per component and platform renders the real
component from the control values through a viewer-independent interface (`value`, `set`, `log`,
`icon`, `child`). One adapter per viewer turns the controls into Storybook args or Widgetbook knobs,
syncs them both ways, and draws the width box, Reset and the log. Spec:
`docs/superpowers/specs/2026-09-26-viewer-playgrounds-design.md`.

**Tech Stack:** Node 22 ESM (`.mjs`), vitest; React 19, MUI 9, Storybook 10 (`storybook/preview-api`
`useArgs`, `storybook/actions`), Playwright; Flutter 3.47.5, Widgetbook 3.25 (knob values live in
the URL query: set one with `WidgetbookState.of(context).updateQueryField(group: 'knobs', …)`).

---

## Rules for every task

- **Run no git write command.** The owner commits. Reading git is fine.
- Node 22 and Flutter: `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$HOME/development/flutter/bin:$PATH`.
  The shell is zsh.
- The visual-check cases (`packages/components/test/visual/cases/`) and the variant builders
  (`packages/solar_flutter/variants/`) are **not** touched: the playground never changes what the
  checks measure.
- Never edit a generated file; change its emitter and run `npm run solar:codegen`.
- Every value in a builder that is a design value comes from the component (its recipe); a builder
  holds sample content only (words, a count), never a colour or a size. The width box's widths are
  a viewer's layout, not a component's design.
- Web builders follow the shells' conventions (read the component's `packages/components/src/<Name>.tsx`);
  Flutter builders the widgets' (`packages/solar_flutter/lib/src/components/solar_<name>.dart`):
  a Flutter control is disabled by a null callback, a field takes `enabled`, a group decides its
  members.
- Parity: every batch writes the web and the Flutter builder of each component together. Their
  extra controls are not the builders': they go in the one table,
  `packages/codegen/src/playground/extras.mjs` (with a comment per component saying why), so both
  viewers offer the same extras by construction.

## Batches and stops

- **Batch A (Tasks 1–7):** the derivation, both interfaces and adapters, five pilot builders on each
  platform (Button, Checkbox, Text Input, Pagination, Dialog), their tests. **Stop for the owner's
  review.**
- **Batch B (Tasks 8–13):** every other component's builders, family by family. **Stop.**
- **Batch C (Tasks 14–16):** generated registries (completeness enforced), docs, full verify.
  **Stop.**

During Batches A and B each platform keeps a hand-written temporary registry
(`registry.ts`, `registry.dart`) listing the builders written so far, and a component with no
builder falls back to today's case-based Playground. Batch C replaces both with generated
registries covering every component, and removes the fallback.

## File structure

| File                                                                         | Responsibility                                               |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `packages/codegen/src/playground/controls.mjs`                               | a component's controls from its IR; the icon list            |
| `packages/codegen/test/playground-controls.test.mjs`                         | its tests                                                    |
| `packages/codegen/src/playground/extras.mjs`                                 | every component's extra controls, one hand-written table     |
| `packages/codegen/src/playground/values.mjs`                                 | the fixed values: icon none/sample/solid, widths, log length |
| `packages/components/stories/playground/core.tsx`                            | the viewer-free web core: controls, argTypes, `Playground`   |
| `packages/components/stories/playground/overlay.tsx`                         | an overlay's "Open" trigger and `open` wiring                |
| `packages/codegen/src/emit/playground.mjs`                                   | the Widgetbook icon map (Task 5) and, in Task 14, registries |
| `packages/components/stories/playground/types.ts`                            | the web builder interface                                    |
| `packages/components/stories/playground/adapter.tsx`                         | the Storybook adapter                                        |
| `packages/components/stories/playground/<slug>.tsx`                          | one builder per component                                    |
| `packages/components/stories/playground/registry.ts`                         | temporary registry (Batch C: `registry.generated.ts`)        |
| `packages/solar_flutter/widgetbook/lib/playground/playground.dart`           | the Flutter builder interface                                |
| `packages/solar_flutter/widgetbook/lib/playground/adapter.dart`              | the Widgetbook adapter                                       |
| `packages/solar_flutter/widgetbook/lib/playground/<snake>.dart`              | one builder per component                                    |
| `packages/solar_flutter/widgetbook/lib/playground/registry.dart`             | temporary, then generated registry                           |
| `packages/solar_flutter/widgetbook/lib/playground/icons.dart`                | generated: icon names, and name → `SolarVector`              |
| `packages/solar_flutter/widgetbook/lib/playground/controls.dart`             | generated: every component's controls (`playgroundControls`) |
| `packages/components/test/playground.test.mjs`                               | web: every builder renders (server render)                   |
| `packages/components/test/visual/playground.spec.mjs`, `playground-page.tsx` | web: interaction in Chromium                                 |
| `packages/solar_flutter/widgetbook/test/playground_test.dart`                | Flutter: every builder renders; interaction                  |

---

## Batch A

> Done, then hardened after review (2026-09-26): extras moved from the builders into
> `packages/codegen/src/playground/extras.mjs`; builders read through typed accessors and declare
> no `controls`; the web core is `stories/playground/core.tsx`. The steps below are as first
> written; where they differ, the code and the Batch B rules are right.

### Task 1: Correct the spec for component slots

**Files:** Modify `docs/superpowers/specs/2026-09-26-viewer-playgrounds-design.md`

- [ ] In "What a tester gets", replace the paragraph beginning "A component slot's words are the
      child component's main text slot" with:

      "A component slot names its child where the IR knows it (Button's `counter` is a Counter; a
      card's call to action is the caller's, unnamed). Its words control is the child's main text
      slot, read from the child's own IR (its `label` slot, or else its first text slot), at the
      child's default. Where the child has no text slot (Counter's count is a number its shell
      takes) or the IR names no child, the slot gets its toggle alone, and the builder may declare
      a control of its own (Button's `counter count`)."

- [ ] In "Control derivation, shared", replace the Widgetbook bullet with: "**Widgetbook**
      receives it as a generated, committed Dart file,
      `widgetbook/lib/playground/controls.dart` (`playgroundControls`), which `solar:codegen`
      writes from the IRs it has just built, beside `icons.dart` (the icon names and vectors); the
      app and its tests read it directly, so nothing depends on npm packages at build time."
- [ ] In the controls table, add a row for extras' kinds: "a builder's own control | text,
      number, boolean or select, at the builder's default". Run
      `npx prettier --write` on the file.

### Task 2: Control derivation

**Files:** Create `packages/codegen/src/playground/controls.mjs`,
`packages/codegen/test/playground-controls.test.mjs`

- [ ] **Step 1: Write the failing tests**

```js
import { describe, expect, it } from 'vitest';
import { iconNames, playgroundData } from '../src/playground/controls.mjs';

const data = playgroundData();
const controlsOf = (name) => data.components[name];
const byName = (name, control) =>
  controlsOf(name).find((c) => c.name === control);

describe('playground controls', () => {
  it('gives Button its axes, booleans, words, icons, counter and a width', () => {
    const names = controlsOf('Button').map((c) => `${c.kind}:${c.name}`);
    expect(names).toEqual([
      'select:size',
      'select:prio',
      'boolean:disabled',
      'boolean:loading',
      'boolean:danger',
      'icon:iconLeading',
      'text:label',
      'icon:iconTrailing',
      'child:counter',
      'width:width',
    ]);
    expect(byName('Button', 'size')).toMatchObject({
      default: 'md',
      options: ['md', 'sm', 'lg'],
    });
    expect(byName('Button', 'label')).toMatchObject({
      default: 'Label',
      optional: true,
    });
    expect(byName('Button', 'iconLeading')).toMatchObject({ default: 'none' });
    expect(byName('Button', 'counter')).toMatchObject({
      default: false,
      component: 'Counter',
    });
    expect(byName('Button', 'width')).toMatchObject({ default: 'auto' });
  });

  it("gives a component slot its child's words where the child has a text slot", () => {
    // Banner's primary button is a Button, whose label is a text slot.
    const banner = controlsOf('Banner');
    const child = banner.find(
      (c) => c.kind === 'child' && c.component === 'Button',
    );
    expect(child).toBeDefined();
    expect(banner).toContainEqual(
      expect.objectContaining({
        kind: 'childText',
        name: `${child.name} label`,
        default: 'Label',
      }),
    );
  });

  it('lists every SOLAR icon, once each', () => {
    expect(iconNames()).toHaveLength(340);
    expect(iconNames()).toContain('chevron-right');
    expect(data.icons).toEqual(iconNames());
  });

  it('covers every component that has a Playground, the same twice', () => {
    expect(Object.keys(data.components)).toContain('Checkbox');
    expect(Object.keys(data.components)).not.toContain('Bar Chart');
    expect(playgroundData()).toEqual(data);
  });
});
```

- [ ] **Step 2: Run them to see them fail**: `npx vitest run packages/codegen/test/playground-controls.test.mjs`
      → FAIL (module missing).

- [ ] **Step 3: Write the module**

```js
/**
 * Each component's Playground controls, from its IR: a select per axis, a toggle per boolean, a
 * colour for a colour the caller gives, and per slot a text field (words), an icon picker, a
 * show/hide toggle and the child's words (a composed component), or a toggle (content); then the
 * width of the box it sits in. Storybook and Widgetbook both draw these (their adapters), so the
 * two show the same controls. Pure, and dependency-free: it reads spec/ with Node's fs alone, so it
 * runs where no npm packages are installed (CI's Widgetbook build).
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { specDir } from '../util/paths.mjs';

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

/** Every SOLAR icon's stem (`chevron-right`), in the icon spec's order. */
export function iconNames() {
  return readJson(join(specDir, 'icons.json')).icons.map(([stem]) => stem);
}

/** Every component IR, by its name. */
function loadSpecs() {
  const dir = join(specDir, 'components');
  return Object.fromEntries(
    readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .map((f) => readJson(join(dir, f)))
      .map((s) => [s.component, s]),
  );
}

/** A child component's main words: its `label` slot, or else its first text slot. */
function wordsOf(child) {
  const texts = Object.entries(child?.slots ?? {}).filter(
    ([, s]) => s.type === 'text',
  );
  return texts.find(([n]) => n === 'label') ?? texts[0] ?? null;
}

/** One component's controls, in order: its API, its slots in the IR's order, its width. */
export function controlsOf(spec, specs) {
  const controls = [];
  for (const [name, axis] of Object.entries(spec.api ?? {})) {
    if (axis.type === 'boolean')
      controls.push({ name, kind: 'boolean', default: axis.default });
    else if (axis.type === 'color')
      controls.push({ name, kind: 'color', default: axis.default ?? null });
    else
      controls.push({
        name,
        kind: 'select',
        default: axis.default,
        options: axis.values,
      });
  }
  for (const [name, slot] of Object.entries(spec.slots ?? {})) {
    if (slot.type === 'text')
      controls.push({
        name,
        kind: 'text',
        default: slot.default ?? '',
        optional: Boolean(slot.optional),
      });
    else if (slot.type === 'icon')
      controls.push({
        name,
        kind: 'icon',
        default: slot.visible === false ? 'none' : 'default',
      });
    else if (slot.type === 'component' || slot.type === 'instance') {
      controls.push({
        name,
        kind: 'child',
        default: slot.visible !== false,
        component: slot.component ?? null,
      });
      const words = slot.component ? wordsOf(specs[slot.component]) : null;
      if (words)
        controls.push({
          name: `${name} ${words[0]}`,
          kind: 'childText',
          default: words[1].default ?? '',
          slot: name,
        });
    } else if (slot.type === 'content')
      controls.push({ name, kind: 'content', default: slot.visible !== false });
  }
  controls.push({ name: 'width', kind: 'width', default: 'auto' });
  return controls;
}

/**
 * Every component with a Playground (it has a story: not one a chart library draws), with its
 * controls, and the icon list the icon controls offer.
 */
export function playgroundData() {
  const specs = loadSpecs();
  const library = new Set([
    'Bar Chart',
    'Line Chart',
    'Donut Chart',
    'Chart Axis',
    'Chart Gridlines',
  ]);
  const components = Object.fromEntries(
    Object.keys(specs)
      .filter((n) => !library.has(n))
      .map((n) => [n, controlsOf(specs[n], specs)]),
  );
  return { components, icons: iconNames() };
}
```

Replace the hard-coded `library` set before finishing: import `DESCRIPTORS` from
`../components/index.mjs` and exclude `d.library` components by name — **but** check first that
`components/index.mjs` imports nothing outside Node and the generator (it uses `readdirSync` and
dynamic imports of the descriptor files, which import only `shared/*.mjs`); if it stays
dependency-free, use it, and say so in the report; if not, keep the set and add a test that it
equals the descriptors' `library` components.

Icon default `'default'` means "what Figma shows": the adapter and the builder treat it as the
builder's own sample icon. If an icon slot in the IR records which icon Figma draws, prefer
emitting that stem as the default; check a few IRs (`spec/components/button.json` has
`"layer": "/Icon/None"`) and report what is available.

- [ ] **Step 4: Run the tests**: PASS. Fix the Button order expectation only if the IR's slot
      order differs (read `spec/components/button.json`), and say so.
- [ ] **Step 5**: `npm run lint -w @bwp-web/codegen`, `npx prettier --check packages/codegen`.

### Task 3: The web interface and adapter

**Files:** Create `packages/components/stories/playground/types.ts`,
`packages/components/stories/playground/adapter.tsx`,
`packages/components/stories/playground/registry.ts`; modify
`packages/components/.storybook/main.ts` (serve `PLAYGROUND` in `virtual:solar`),
`packages/components/stories/solar.tsx` (the Playground story uses the adapter), and the
`virtual:solar` type declaration (find it: `grep -rn "virtual:solar" packages/components --include=*.d.ts`).

- [ ] **Step 1: The interface** (`types.ts`)

```ts
/**
 * What a Playground builder gets and gives, on the web: the same five members as Flutter's
 * (widgetbook/lib/playground/playground.dart), independent of Storybook, so a builder is tested
 * with a fake and the adapter is the only code that knows the viewer.
 */

import type { ReactNode } from 'react';

export type ControlValue = string | number | boolean | null;

export interface Playground {
  /** A control's current value. */
  value<T extends ControlValue = ControlValue>(name: string): T;
  /** Sets a control: the component's own change reaches the panel. */
  set(name: string, value: ControlValue): void;
  /** Adds a line to the event log (and Storybook's Actions). */
  log(event: string, detail?: unknown): void;
  /** The icon an icon slot's control picked, as an element, or undefined for `_none`. */
  icon(slot: string): ReactNode | undefined;
  /** A component slot's toggle and, where it has one, its words. */
  child(slot: string): { shown: boolean; text: string | undefined };
}

/** A control a builder declares for a value the IR does not hold (a Text Input's typed value). */
export interface ExtraControl {
  name: string;
  kind: 'text' | 'number' | 'boolean' | 'select';
  default: ControlValue;
  options?: string[];
}

export interface PlaygroundBuilder {
  controls?: ExtraControl[];
  render(p: Playground): ReactNode;
}
```

- [ ] **Step 2: Serve the controls** — in `.storybook/main.ts`'s `solarData()`, import
      `playgroundData` from `../../codegen/src/playground/controls.mjs` and add
      `export const PLAYGROUND = ${JSON.stringify(playgroundData())};` to the returned module.
      Declare it in the `virtual:solar` type declaration:
      `export const PLAYGROUND: { components: Record<string, Array<{ name: string; kind: string; default: unknown; options?: string[]; optional?: boolean; component?: string | null; slot?: string }>>; icons: string[] };`

- [ ] **Step 3: The adapter** (`adapter.tsx`). Write it to do exactly this:
  - `argTypesFor(component, builder)`: from `PLAYGROUND.components[component]` plus
    `builder.controls`:
    - `select` → `{ control: 'select', options }`; `boolean`, `child`, `content` →
      `{ control: 'boolean' }`; `color` → `{ control: 'color' }`; `text`, `childText` →
      `{ control: 'text' }`; `number` → `{ control: 'number' }`;
    - `icon` → `{ control: 'select', options: ['_none', '_sample', ...icons.flatMap((s) => [`${s}`, `${s} solid`])] }` (every value within `[a-zA-Z0-9 _-]`, the characters Storybook keeps in its URL);
    - `width` → `{ control: 'select', options: ['auto', '120', '200', '320', '480', '640'] }`.
  - `argsFor(component, builder)`: every control's `default`.
  - `PlaygroundView({ component, builder, args, updateArgs })`, rendered by the story function
    `playgroundRender(component, builder)` returns, which calls `useArgs()` from
    `storybook/preview-api` (Storybook allows its hooks only in a story function or decorator);
    builds a `Playground`:
    - `value(n)` → `args[n]`; `set(n, v)` → `updateArgs({ [n]: v })`;
    - `log(e, d)` → pushes `` `${e}${d === undefined ? '' : `: ${JSON.stringify(d)}`}` `` into a
      `useState` list capped at 5 (newest first) and calls `action(e)(d)` from
      `storybook/actions`;
    - `icon(slot)`: `'_none'` → undefined; `'_sample'` → `<IconPlaceholder />` where the
      placeholder is `IconPlus` from `@bwp-web/assets` (the builder's neutral sample); otherwise
      the stem, optionally with ` solid`, resolved to the `@bwp-web/assets` component whose name
      is the icon spec's `component` for that stem (import `* as assets from '@bwp-web/assets'` and
      look up `assets[PLAYGROUND.iconComponents[stem]]`, the map controls.mjs's `iconComponents()`
      reads from `spec/icons.json`: a stem's PascalCase is not always the name, `io-device` is
      `IconIODevice`), rendered with `variant="solid"` where chosen;
    - `child(slot)` → `{ shown: Boolean(args[slot]), text: args[`${slot} ${wordsName}`] }` where
      the words control is the `childText` control whose `slot` is `slot`.
  - Renders, top to bottom: a Reset button (a plain `<button type="button">Reset</button>` styled
    only with `--solar-*` variables) calling `updateArgs(argsFor(...))` and clearing the log; the
    component inside a `<div>` whose `width` is `auto` or `${args.width}px`; the log as a `<ol>`
    with `aria-label="Event log"`.
- [ ] **Step 4: Use it** — in `solar.tsx`, the Playground story: where
      `PLAYGROUND_BUILDERS[component]` (from `./playground/registry.js`) exists, `meta(component)`
      returns `args: argsFor(...)`, `argTypes: argTypesFor(...)` and
      `render: playgroundRender(component, builder)`; otherwise it keeps
      today's case-based render (the fallback, removed in Task 14). `registry.ts` starts as
      `export const PLAYGROUND_BUILDERS: Record<string, PlaygroundBuilder> = {};` with a comment
      that Task 14 replaces it with a generated one.
- [ ] **Step 5**: `npm run typecheck`, `npm run lint -w @bwp-web/components`,
      `npx prettier --check packages/components/stories packages/components/.storybook`.

### Task 4: The Flutter interface and adapter

**Files:** Create `packages/solar_flutter/widgetbook/lib/playground/playground.dart`,
`adapter.dart`, `registry.dart`; modify `packages/solar_flutter/widgetbook/lib/main.dart`. Task 5
generates `controls.dart` and `icons.dart`, which this task's adapter reads; do Task 5 first if
`flutter analyze` needs them (it will).

- [ ] **Step 1**: nothing to write for the data: the adapter reads `playgroundControls`
      (`controls.dart`) and `playgroundIcons` (`icons.dart`), both generated in Task 5.
- [ ] **Step 2: The interface** (`playground.dart`)

```dart
/// What a Playground builder gets and gives, in Flutter: the same five members as the web's
/// (packages/components/stories/playground/types.ts), independent of Widgetbook, so a builder is
/// tested with a fake and the adapter is the only code that knows the viewer.
library;

import 'package:flutter/widgets.dart';

abstract interface class SolarPlayground {
  /// A control's current value (bool, String, num, or null).
  Object? value(String name);

  /// Sets a control: the component's own change reaches the panel.
  void set(String name, Object? value);

  /// Adds a line to the event log.
  void log(String event, [Object? detail]);

  /// The icon an icon slot's control picked, as a widget, or null for `_none`.
  Widget? icon(String slot);

  /// A component slot's toggle and, where it has one, its words.
  ({bool shown, String? text}) child(String slot);
}

/// A control a builder declares for a value the IR does not hold.
class SolarExtraControl {
  const SolarExtraControl(this.name, this.kind, this.initial, {this.options});
  final String name;
  final String kind; // 'text' | 'number' | 'boolean' | 'select'
  final Object? initial;
  final List<String>? options;
}

class SolarPlaygroundBuilder {
  const SolarPlaygroundBuilder({this.controls = const [], required this.build});
  final List<SolarExtraControl> controls;
  final Widget Function(SolarPlayground p) build;
}
```

- [ ] **Step 3: The adapter** (`adapter.dart`): `Widget solarPlayground(BuildContext context,
String component, SolarPlaygroundBuilder builder)`:
  - registers one knob per control (`playgroundControls[component]` plus `builder.controls`): `select` → `context.knobs.object.dropdown<String>`; `boolean`,
    `child`, `content` → `context.knobs.boolean`; `text`, `childText` → `context.knobs.string`;
    `number` → `context.knobs.double.input`; `color` → `context.knobs.color`; `icon` → a dropdown of
    `['_none', '_sample', for each icon stem s: s and '$s solid']`; `width` → a dropdown of
    `['auto', '120', '200', '320', '480', '640']`; each with its default as the initial value;
  - `set(name, v)`: `WidgetbookState.of(context).updateQueryField(group: 'knobs', field: name,
value: <v as the knob's query text>)`. Find each knob kind's query encoding in Widgetbook
    3.25's `lib/src/fields/` (`~/.pub-cache/hosted/pub.dev/widgetbook-3.25.0/lib/src/fields/`,
    each field's `toParam`) and encode to match; write a small widget test proving a boolean and a
    string knob round-trip through `updateQueryField` if Widgetbook's test utilities allow, else
    verify by hand in `npm run widgetbook` and say so;
  - `icon(slot)`: `'_none'` → null; `'_sample'` → `SolarIcon(SolarIcons.plusOutline)`; a stem
    (optionally ` solid`) → `SolarIcon(solarIconsByName['<stem>Outline' or 'Solid'])` from
    `icons.dart` (Task 5);
  - `child(slot)`: `(shown: value(slot) == true, text: value('<the childText control for slot>'))`;
  - renders a `Column`: a Reset `TextButton` (sets every knob back to its initial through
    `updateQueryField`, and clears the log), the component in a `SizedBox(width: null or the
chosen width)` inside an `Align(alignment: Alignment.topLeft)`, and the last five log lines
    (a `StatefulWidget` holds the log).
- [ ] **Step 4**: `registry.dart` starts as `const playgroundBuilders = <String, SolarPlaygroundBuilder>{};`
      (a `final` map if builders are not const) with a comment that Task 14 generates it. In
      `main.dart`: the Playground use case calls `solarPlayground(...)` where the component has a
      builder, and today's `playground(...)` otherwise (fallback, removed in Task 14).
- [ ] **Step 5**: `(cd packages/solar_flutter && dart format widgetbook/lib && (cd widgetbook && flutter analyze))`.

### Task 5: The Widgetbook data: icon map and controls

**Files:** Create `packages/codegen/src/emit/playground.mjs`; modify the icon or component stage
that should call it (read `packages/codegen/src/stages/icons.mjs`; the icon stage owns icon names).

- [ ] Write `renderWidgetbookIcons(spec)` returning the text of
      `packages/solar_flutter/widgetbook/lib/playground/icons.dart`: the generated header, an
      import of `package:solar_flutter/solar_flutter.dart`, and
      `const solarIconsByName = <String, SolarVector>{ 'accessibilityOutline': SolarIcons.accessibilityOutline, … };`
      using `dartVariantName(stem, variant)` from `src/emit/flutter-icons.mjs` for every icon and
      both variants, sorted by `byCodeUnit`. Emit it from the icon stage with `writeGenerated`. It is
      Widgetbook-only (a map retains every icon, which an app must not; the README's warning is
      about the package, not the viewer).
      The same file also holds `const playgroundIcons = <String>['accessibility', …];`, every stem
      in the spec's order (what the icon knobs offer).
- [ ] Write `renderWidgetbookControls(specs)` returning the text of
      `packages/solar_flutter/widgetbook/lib/playground/controls.dart`: the header and
      `const playgroundControls = <String, List<Map<String, Object?>>>{ 'Button': [ {'name': 'size', 'kind': 'select', 'default': 'md', 'options': ['md', 'sm', 'lg']}, … ], … };`,
      each list `controlsOf(spec, specs)` (Task 2) for every component with a story, from the
      IRs the component stage has just built (in memory, never re-read from disk, since writes are
      deferred until the run ends), keys and entries in the derivation's order. Emit it from the
      component stage (`src/stages/components.mjs` `emit`), with `writeGenerated`.
- [ ] Unit tests (a new `packages/codegen/test/playground-emit.test.mjs`): the icon map has 680
      entries and every key is a `SolarIcons` field name `dartVariantName` gives; `playgroundIcons`
      has 340 stems; `playgroundControls` for Button equals `controlsOf` of Button's IR.
- [ ] `npm run solar:codegen`, then `npm run solar:codegen` again: the second run changes nothing
      (`git status` shows only the new file). `(cd packages/solar_flutter/widgetbook && flutter analyze)`.

### Task 6: Pilot builders on both platforms

**Files:** Create, for Button, Checkbox, Text Input, Pagination, Dialog:
`packages/components/stories/playground/{button,checkbox,text-input,pagination,dialog}.tsx` and
`packages/solar_flutter/widgetbook/lib/playground/{button,checkbox,text_input,pagination,dialog}.dart`;
register each in both temporary registries.

Each builder reads its controls through the interface, renders the real component, and wires every
callback to `set` (for a value a control holds) and `log`. Per component (read each shell first):

- **Button**: `label` text as its children (empty → icon-only, then give it an `aria-label` /
  `semanticLabel` of "Label"); `iconLeading`, `iconTrailing` from `icon()`; `counter` shown →
  a `<Counter count={value('counter count')} />` inside; extra control
  `{ name: 'counter count', kind: 'number', default: 3 }`; `size`, `prio`, `danger`, `loading`,
  `disabled` from their controls (Flutter: `onPressed` null when disabled); `onClick` / `onPressed`
  → `log('onClick')`.
- **Checkbox**: `checked`, `mixed`, `disabled`; change → `set('checked', v)`,
  `set('mixed', false)`, `log('onChange', v)`; named "Option".
- **Text Input**: extra `{ name: 'value', kind: 'text', default: '' }`; its text slots from their
  controls; typing → `set('value', text)`, `log('onChange', text)`. Flutter holds words in a
  `TextEditingController`: keep one in the builder's state, sync it from `value('value')` when the
  control changes and to `set` on edit, without moving the cursor on every keystroke.
- **Pagination**: extras `{ name: 'page', kind: 'number', default: 1 }`,
  `{ name: 'count', kind: 'number', default: 12 }`; change → `set('page', n)`, `log('onChange', n)`.
- **Dialog**: extra `{ name: 'open', kind: 'boolean', default: false }`; a trigger button "Open"
  → `set('open', true)`; the dialog open while `value('open')`; closing → `set('open', false)`,
  `log('onClose')`; its text slots and content toggle from the controls.

Web builders are default exports `{ controls?, render } satisfies PlaygroundBuilder`; Flutter
builders are top-level `final <camel>Playground = SolarPlaygroundBuilder(controls: [...], build: (p) => ...)`.
A Flutter builder that needs state (Text Input's controller) returns a small `StatefulWidget` from
`build`.

- [ ] Run `npm run typecheck`, `npm run lint -w @bwp-web/components`, the Flutter analyze and format,
      then `npm run storybook` / `npm run widgetbook` are not required here; Task 7 tests them.

### Task 7: Tests for Batch A

**Files:** Create `packages/components/test/playground.test.mjs`,
`packages/components/test/visual/playground-page.tsx`,
`packages/components/test/visual/playground.spec.mjs`; modify
`packages/components/test/visual/build.mjs` (bundle the second page);
create `packages/solar_flutter/widgetbook/test/playground_test.dart`; modify
`.github/workflows/solar.yml` (Dart job: `(cd widgetbook && flutter test)` after `flutter test`)
and the Verify block in `docs/engineering/workflows.md` (the same).

- [ ] **Web, every builder renders**: for each entry of `PLAYGROUND_BUILDERS`, build a fake
      `Playground` from `PLAYGROUND`-equivalent data (import `playgroundData` from the codegen
      directly in the test) and the builder's own controls' defaults, `renderToString` its
      `render(fake)` inside `SolarProvider`, and expect no throw and non-empty HTML. Also: the icon
      resolver finds an `@bwp-web/assets` export for every icon stem (both styles).
- [ ] **Web, interaction** (Playwright): `playground-page.tsx` renders each pilot builder with a
      fake `Playground` that keeps values in React state and records every `set` call on
      `window.__sets`; `playground.spec.mjs`:
  - clicks the Checkbox → it is checked and `__sets` has `['checked', true]`;
  - types "abc" in the Text Input → its input shows `abc` and the last `set` is `['value', 'abc']`;
  - clicks page 3 in the Pagination → `['page', 3]`;
  - clicks "Open" → a `role="dialog"` appears and `['open', true]`.
    Serve it as `components.spec.mjs` serves its page (`page.route('http://solar.test/**')`).
- [ ] **Flutter** (`playground_test.dart`): a `FakePlayground implements SolarPlayground` holding
      a `Map<String, Object?>` and a `List` of set calls, with `setState` via a `StatefulBuilder`;
      for each builder in `playgroundBuilders`, pump it with the defaults of
      `playgroundControls[name]` and `builder.controls` (the generated `controls.dart`), expect no
      exception; then the four interactions: tap the Checkbox, enter
      "abc" in the Text Input, tap page 3, tap "Open", each asserting the widget changed and the
      recorded set call.
- [ ] Run: `npx vitest run packages/components/test/playground.test.mjs`,
      `npx playwright test -c packages/components/playwright.config.mjs playground` (after the
      global setup builds), `(cd packages/solar_flutter/widgetbook && flutter test)`.
- [ ] **Stop for the owner's review** (Batch A): report what was built, how to try it
      (`npm run storybook`, `npm run widgetbook`, the five components), and every check's result.

## Batch B

Tasks 8–13 each write the web and the Flutter builder of every component in one family, add its
extras to `packages/codegen/src/playground/extras.mjs` (then `npm run solar:codegen`), register
them in both temporary registries, and extend the smoke tests (they iterate the registries, so
they cover new builders automatically). Rules for every builder:

- every control is read through the typed accessors (`flag`, `text`, `words`, `whole`, `choice`),
  `icon` or `child`, and `value` only for a kind none covers (a colour); none ignored (the web's
  "reads every control" test fails otherwise);
- a builder declares no controls; an extra (a value the IR does not hold) is an entry in
  `extras.mjs`, whose name repeats no IR control's;
- a web builder may use hooks: its `render` runs inside the adapter's `BuilderHost`; put them in a
  small component `render` returns (Pagination's), which the hooks lint accepts;
- a select's value maps to a Flutter enum through the control's `dartOptions` (the same index):
  read it with `p.choice('size', SolarButtonSize.values)`, write it with `p.setChoice(name, e)`;
- every callback the component has is logged; a value a control holds is `set` back (two-way);
- a component that needs a parent to work (a Radio in its `RadioGroup`, a Tab Item in its Tabs, a
  Dropdown Item in a menu, a Row in a Table, a Step in a Stepper) is rendered inside it, with the
  sample siblings it needs, and the extra controls name what the parent decides (`selected`);
- an overlay (Tooltip, Popover, Coachmark, Context Menu, Dropdown Menu, Drawer, Confirmation
  Dialog, Split Dialog) gets an `open` extra in `extras.mjs` and, on the web, the shared helper
  `overlayOf(p)` (`stories/playground/overlay.tsx`: the "Open" trigger, `open`, and `close(event,
detail)`), as the Dialog pilot does; in Flutter, an overlay shown as a route uses
  `PlaygroundRoute` (`playground/overlay.dart`: the trigger, the route pushed and popped with
  `open`, `close(event, detail)`, the route popped when the Playground goes), given its own show
  function (`showSolarDrawer`); Tooltip opens on hover as in an app, and `open` forces it; the
  Playwright overlay test and the Flutter open-state test then open and close it;
- a Flutter typing component (Text Area, Password, Number, PIN, Search, Token Input, Inline Input)
  keeps its words in `PlaygroundText` (`playground/typing.dart`), as Text Input does;
- the log names an event as the platform's callback is named (web `onChange`, Flutter
  `onChanged`), and a null detail logs the name alone;
- a component checked as another's state (Autocomplete Open) renders that component in that state.

After each task: `npm run typecheck`, `npm run lint -w @bwp-web/components`,
`npx vitest run packages/components/test/playground.test.mjs`, Flutter format, analyze and
`(cd widgetbook && flutter test)`.

### Task 8: Buttons and display primitives

Icon Button (`active` → toggle, `set('active', …)`), Button Group (its Buttons, with a `buttons`
number extra 1–4), FAB, BackButton, SplitButton (`items` sample, menu opens), Link, Spinner;
StatusIndicator, Counter (`count` extra), Kbd, Timestamp (`text` extra), Avatar (colour, initials,
picture toggle), Trend Badge, Divider, Skeleton, ProgressBar (`value` extra 0–100 on the web, 0–1
in Flutter, one control named `value` in percent on both), Node End, RowExpand (expand →
`set('expanded', …)` where the IR has it), Tree Indent (`depth`).

### Task 9: Selection controls and tags and messages

Radio (a `RadioGroup` of three, `selected` select extra), Toggle, Slider and Slider Range
(`value`, `low`, `high` extras), DragHandle, Segmented Control and its Item (three items,
`selected`); Tag (`indicator`, `icon`, close → `log('onClose')`), Alert, Alert Small, Banner (its
buttons from `child`, close logged), Toast, EmptyState.

### Task 10: Text fields

Text Area, SearchField, GlobalSearch, Password Input (show/hide logged), Number Input (`value`
number), Inline Input (edit/confirm/cancel logged, `value`), Token Input (`tokens` as a
comma-separated text extra, draft typing), PIN Input (`length` select 4–6, `value`), FileUpload
(browse logged, `files` text extra).

### Task 11: Menus, lists and pickers

Dropdown Item, Dropdown Group Label, Dropdown Menu (open), Context Menu Item, Context Menu (open at
the trigger), Option Row, Options List, ListItem, List; Select and Dropdown (three sample options,
`value` select extra), Autocomplete and Autocomplete Open (`value` text), DatePicker (`date` text
`YYYY-MM-DD`), Date Picker Open, Date Picker Day Cell, TimePicker (`time` text `HH:MM`), TimePicker
Dropdown.

### Task 12: Navigation, paging and cards

Tabs and Tab Item (three tabs, `selected`), Nav Item, Section Nav Item, Section Nav Group Header,
Breadcrumbs and Breadcrumb Item (`items` number extra), Tree Item (`expanded`, rename logged);
PaginationItem, PaginationNav, PaginationEllipsis, PageNavigator, PageNavButton, Stepper (`steps`
number, `activeStep`), Step, Stepper Indicator; every card (Card, Container, Split Dropdown, Status
Card, Insight Card, Insight Card Small, Insight Row, Expandable Card and Accordion (`expanded`),
Event Row, Option Card, File Card, Image Card and Interactive Card (`selected`), Action Card,
Device Card, Launch Card, Launch Card Full Screen), each pressable one logging its press.

### Task 13: Tables, overlays and dialogs, calendar, charts

Table, Row, Column Item, RowSelect (`selected`), TableHeader, TableFooter, PropertyList,
PropertyRow; Confirmation Dialog, Split Dialog, Drawer, Scrim, Tooltip, Popover, Coachmark (all
with `open`); Event Chip, Calendar Day Cell, Weekday Header, Time Axis Label, Time Slot, All-Day
Bar, Agenda Row, Calendar Toolbar; Sparkline (`data` as comma-separated numbers), Bar, Bar Stack,
Data Legend, Chart Tooltip.

- [ ] After Task 13: every component with a story has a builder on both platforms. Check:
      `node -e` listing `playgroundData().components` names against both registries' keys; they
      must match exactly.
- [ ] **Stop for the owner's review** (Batch B).

## Batch C

### Task 14: Generated registries; remove the fallback

**Files:** Modify `packages/codegen/src/emit/registries.mjs` (two more files),
`packages/components/stories/solar.tsx`, `packages/solar_flutter/widgetbook/lib/main.dart`;
delete `packages/components/stories/playground/registry.ts`; replace
`packages/solar_flutter/widgetbook/lib/playground/registry.dart` with the generated one.

- [ ] In `renderRegistries`, add, for the components with a story (the same list the stories are
      written for), sorted:
  - `components/stories/playground/registry.generated.ts`: `import <camel> from './<slug>.js';`
    each, and `export const PLAYGROUND_BUILDERS: Record<string, PlaygroundBuilder> = { … };`
  - `solar_flutter/widgetbook/lib/playground/registry.dart`: `import '<snake>.dart';` each and
    `final playgroundBuilders = <String, SolarPlaygroundBuilder>{ '<name>': <camel>Playground, … };`
- [ ] A unit test in `packages/codegen/test/registries.test.mjs`: both new files list exactly the
      story components.
- [ ] `solar.tsx` imports `./playground/registry.generated.js`; `meta` always uses the adapter
      (remove the case-based Playground render). `main.dart` always uses `solarPlayground` (remove
      the old `playground()` function if nothing else uses it).
- [ ] `npm run solar:codegen` twice (second run changes nothing); `npm run typecheck`;
      `flutter analyze` in widgetbook; the playground tests.

### Task 15: Docs

- `docs/engineering/workflows.md`, "Add a component": a step 7 (after the visual cases): write
  its two playground builders, `packages/components/stories/playground/<slug>.tsx` and
  `packages/solar_flutter/widgetbook/lib/playground/<snake>.dart`; the registries fail until they
  exist. Add both to the file-naming table.
- `packages/components/stories/README.md` and `packages/solar_flutter/widgetbook/README.md`: a
  short "Playground" paragraph: the generated controls (words, icons, a composed part and its
  words, width), live two-way interaction, Reset, the event log, where the builders live, and that
  they never touch the visual checks.
- `packages/codegen/README.md`: `src/playground/controls.mjs` in Layout and a line in "Changing it";
  the playground registries and the Widgetbook icon map in the Descriptor reference's registries.
- `docs/engineering/decisions.md`, "The two libraries" (Status `Owner 2026-09-26`): "Each
  component's Playground in Storybook and Widgetbook is the same: controls generated from the IR
  (words, every SOLAR icon, a composed part as a toggle and its words, width), the component live
  and two-way with the controls, Reset and an event log; a builder per component and platform is
  written by hand and never touches the visual checks."
- Wrap by hand at 100 columns; Prettier; the link checker.

### Task 16: Verify

- [ ] The whole Verify block (it now includes `(cd widgetbook && flutter test)`), once, not in
      parallel with anything else: `bash /private/tmp/claude-502/-Users-e-joon-ko-Documents-github-workplace-public-packages/8e14facf-912e-4d52-9535-199f52583395/scratchpad/verify.sh`
      (add the widgetbook test step to it first).
- [ ] Delete this plan and its spec only after the owner commits (CLAUDE.md), once their lasting
      content is in the docs.
- [ ] **Stop for the owner's review.**
