# SOLAR design-to-code pipeline — review and priority backlog

> **For agentic workers:** this is a review with a verified backlog, not an implementation plan.
> Every open item has a **Check it out** section: run those commands first and confirm the
> evidence still holds, since the tree moves fast. An item marked **Owner decision** must not be
> started until the owner has answered. Once an item is confirmed and decided, write its own plan
> with superpowers:writing-plans and carry it out with superpowers:subagent-driven-development or
> superpowers:executing-plans. The repository owner handles all version control: no git write
> commands, ever. "Commit" means stop and report.

**Goal:** make the pipeline cheaper to extend and to correct, and its output easy to adopt,
without weakening the parts that make it trustworthy: the finding model, the oracle's
independence from the recipe, and the reason on every overlay rule.

**Scope:** the generator (`packages/codegen`), its overlays (`spec/overlay`), the shells, the
viewers, the checks, and what a consuming app receives. Not the Figma fetchers, not the token
layer, which is in good shape.

**State reviewed:** first at commit `7579eec` (2026-09-24, F9 done, 79 components); revised at
`21497a6` (2026-09-25, F10 Cards done, 97 components). Between the two, six items were done and
four gaps this review had not seen were fixed (a text's `FILL`, the fetcher's hidden paths and
the places of added layers, generated writes held until the run succeeds, the words check). Every
number below is from `21497a6`; the **Check it out** commands recompute them. The comparison with
`@biamp/solar-mui` (items 14–18, appendix) was checked against the package itself on 2026-09-25,
which corrected three of its readings and added items 19 and 20.

## Status at a glance

| #   | Item                                                 | State                                                           |
| --- | ---------------------------------------------------- | --------------------------------------------------------------- |
| 1   | Repeated children in the IR                          | **Open.** Owner decision needed first.                          |
| 2   | Pattern addresses and reason references              | Done 2026-09-25.                                                |
| 3   | Fail fast on the Node version                        | Done 2026-09-25.                                                |
| 4   | Oracle in Dark                                       | Done 2026-09-25. Mobile type: recommend no third pass.          |
| 5   | Excused-difference register in the viewers           | Done 2026-09-25 (badges in Storybook and Widgetbook).           |
| 6   | Rule proposer                                        | Done 2026-09-25 (`solar:explain --propose`).                    |
| 7   | `solar:overlay:audit`                                | Done 2026-09-25; 7b done too (reasons in the overlay README).   |
| 8   | Overlay reference and glossary                       | Done 2026-09-25 (`spec/overlay/README.md`).                     |
| 9   | Shells as real files                                 | **Open.** Owner decision needed first.                          |
| 10  | Stable public names                                  | Done 2026-09-25 (`-<slot>` public, `--<layer>` internal).       |
| 11  | The spec says what the system is                     | Done 2026-09-25. One question open (MUI as peer dependency).    |
| 12  | Recipe packaging                                     | **Open.**                                                       |
| 13  | What git carries                                     | **Open.** Owner decision needed first.                          |
| 14  | A stock-MUI theme generated from the recipes         | Started 2026-09-25: MuiButton, MuiIconButton; drawn ones open.   |
| 15  | One mode switch for stock MUI and SOLAR components   | Done 2026-09-25 (MUI CSS variables on `data-theme`).            |
| 16  | One-line setup for a consuming app                   | Done 2026-09-25 (`SolarProvider`).                              |
| 17  | One vocabulary: Figma's words or MUI's               | **Open.** New. Owner decision needed first.                     |
| 18  | Figma Code Connect and a Figma-ID manifest           | **Open.** The fetcher records variant IDs from the next sync.   |
| 19  | Breakpoints, spacing and motion in the MUI theme     | Done 2026-09-25.                                                |
| 20  | Install the packed packages in a clean app           | Done 2026-09-25 (`npm run smoke:install`, in CI).               |
| 21  | Parity suite: reachability, not spelling             | Done 2026-09-25 (two-libraries spec; `src/shells/api.mjs`).     |
| 22  | Flutter idiom: null callback, component themes       | Done 2026-09-25 for the buttons (two-libraries spec).           |

---

## Verdict, in short

The architecture is right for design-to-code, and more rigorous than most: one normalizer over
the Figma mirror, independent emitters, an oracle built from Figma layers rather than from the
recipe, rendered checks on both platforms in both colour modes, deterministic rebuilds in CI, and
every human decision recorded with a reason. Keep all of that.

The costs that remain pool in three places:

1. **Repeated children are not modelled**, so Figma's sample counts (35 day cells, 7 weekdays)
   become distinct layers, recipe entries, oracle entries and gaps. Item 2 removed the overlay
   pain; the IR, recipe and oracle bloat remains.
2. **Behaviour is written in template strings** (61% of 20,169 descriptor lines) behind an option
   vocabulary of 87 keys across the shell helpers. F12 Dialogs is the family that will pay most.
3. **Delivery is thinner than generation.** The components are measured against Figma on two
   platforms in two modes, but a consuming app gets a four-step setup, two dark-mode switches,
   stock MUI components that only get palette and typography, and a 1 MB recipe module. A
   comparison with a theme-only third-party package (`@biamp/solar-mui`, appendix) shows what
   the delivery side should borrow.

| Measure (2026-09-25, `21497a6`)                                           | Value            |
| ------------------------------------------------------------------------- | ---------------- |
| Components generated (exported) · oracle variants                         | 97 (96) · 1,102  |
| Visual failures on the last web run, Light and Dark                       | 0                |
| Excused differences on the web, both modes: decided · open Figma findings | 3,241 · 60       |
| Open findings per mode (Button 18, Text Input 8, Number Input 3, FileUpload 1) | 30          |
| Overlay rule kinds, each with a heading in `spec/overlay/README.md`       | 24               |
| Descriptor lines inside template strings (of 20,169)                      | 61%              |
| Option keys the shell helpers take (`o.<key>` in `src/shells/*.mjs`)      | 87               |
| Descriptors with `slots: 'drawn'` (bespoke layer trees)                   | 84 of 98         |
| Overlays naming a MUI base · a Flutter base                               | 34 · 15          |
| Hand-written Flutter runtime, `lib/src/*.dart` outside `components`       | ~2,200 lines     |
| Generated MUI recipes · `@bwp-web/styles` `mui.js` after `npm run build`  | 41,591 lines · 1,012 KB |
| JS tests · Flutter tests (F10 done note)                                  | 1,639 · 463      |

---

## How the buckets are ordered

By payoff against cost, and by **when the cost is paid**. F11 Tables and F13 Calendar parts
repeat children; F12 Dialogs is the family with the most behaviour to write; F14 Charts carries
sample geometry. Bucket 6 is the consumer's experience, which matters as soon as the first app
adopts 2.0.

- **Bucket 1:** before F11. Every later family pays for it.
- **Bucket 2:** assurance gaps. Small changes, large coverage.
- **Bucket 3:** the developer loop.
- **Bucket 4:** structural. Decide now, do between families.
- **Bucket 5:** before publishing 2.0.
- **Bucket 6:** the consumer's experience. From the comparison in the appendix.

---

## Bucket 1 — before F11

### 1. Model repeated children in the IR

**Owner decision required:** whether Figma's per-sample differences among repeated siblings (a
selected day among disabled ones) are findings at all, or content excused wholesale.

**Why.** Figma draws a component's sample content as sibling instances: a month's 35 day cells,
seven weekdays. `namesOf` (`packages/codegen/src/normalize/components.mjs`) names them
`dayGridDayCell`, `dayGridDayCell2`… and from there every stage treats them as 35 layers: the
recipe derives 35 style blobs, the MUI recipe writes 35 selector blocks, the oracle measures 35
layers per variant in both modes, and the shell carries a 35-entry `TREE`. The shells never use
the samples: `DatePickerOpen.tsx` builds the real month and fills `dayGrid` through `content`.
Item 2's patterns took the overlay from 711 lines to 99, so the remaining cost is in the IR, the
recipes, the oracle and the gap reports. F11's Row, Table and PropertyList, and F13's calendar
parts, repeat children the same way.

**Check it out.**

```bash
node -e '
const ir=JSON.parse(require("fs").readFileSync("spec/components/date-picker-open.json","utf8"));
const cells=Object.keys(ir.layers).filter(k=>/^dayGridDayCell\d*$/.test(k));
const norm=(s)=>JSON.stringify(s,(k,v)=>k==="from"?undefined:v);
console.log(Object.keys(ir.layers).length,"layers;",cells.length,"day cells;",
  new Set(cells.map(c=>norm(ir.style[c]))).size,"distinct style blobs");'
wc -l spec/overlay/date-picker-open.yaml packages/styles/src/generated/mui/components/date-picker-open.ts
node -e 'const g=JSON.parse(require("fs").readFileSync("packages/components/test/visual/.out/date-picker-open-gaps.json","utf8")); console.log(g.length,"gaps")'
```

Expected: 145 layers, 35 day cells, 5 blobs; a 99-line overlay beside a 2,751-line recipe; the
largest gap count of any component.

**What to change.** A normalizer rule, not an overlay: repeated siblings that are instances of
the same component (or the same node type with the same name stem) collapse into **one layer**
with a `repeat` count and, where their samples differ, one `sample` axis whose variants are
excused as content. Touch points, in pipeline order:

- `normalize/components.mjs` `namesOf`: name the group once; record `repeat` and the member paths.
- `normalize/recipe.mjs` `deriveRecipe`: read one layer's cells from the first member; a member
  that differs is a **sample** finding, not an axis finding (compare `samples` in the overlay).
- `verify/oracle.mjs` `buildOracle` and `withDark`: one entry per group, measured against the
  first member the shell draws; both harnesses (`packages/components/test/visual/components.spec.mjs`
  `targets`, `packages/solar_flutter/test/visual/harness.dart`) already measure held children
  through `data-layer` and `measureHeld`, so a repeated layer measures as a held slot.
- `emit/mui-component.mjs`, `emit/flutter-component.mjs`: one selector or one cell key per group.
- `shells/drawn.mjs` `treeOf`, `packages/components/src/internal/layers.tsx` `drawChildren`,
  `packages/solar_flutter/lib/src/solar_layers.dart`: a repeated layer draws its `content`, or its
  first sample where the shell gives none.
- Overlays: the patterned rules on `dayGridDayCell*` become one rule on the group, or go.

**Done when.** `date-picker-open.json` has under 60 layers; its recipe is under 800 lines; its
gap count is under 30 per mode; every other component's IR, recipe and oracle is byte-identical
(diff `spec/` and `packages/*/src/generated` before and after); `npx vitest run`, both visual
checks in both modes and `flutter test` pass; two `npm run solar:rebuild` runs leave the tree
unchanged.

### 2. Pattern addresses and reason references — done

Done 2026-09-25 (`spec/overlay/README.md`, "Addresses"): a rule's layer may be a pattern
(`dayGridDayCell*.base.width`), a full address wins over a pattern on the same cell, a pattern
matching nothing fails as a stale rule does, and a reason may be another rule's
(`reason: { as: "set root.base.width" }`), replaced by that rule's text in the IR so the
deviations report and `solar:explain` still read a sentence. 327 numbered rules were folded and
the focus ring became one patterned rule per overlay. Generated output did not change.

### 3. Fail fast on the Node version — done

Done 2026-09-25: `packages/codegen/src/util/node-version.mjs` reads `.nvmrc`;
`util/require-node.mjs` is the first import of every CLI under `packages/codegen/bin/`, so a
Node older than the pin exits with one line instead of a `TypeError` from the iterator helpers.

---

## Bucket 2 — assurance gaps

### 4. Oracle in Dark — done, one question open

Done 2026-09-25: each oracle variant carries `dark`, what Dark draws otherwise (the layers whose
values differ, and its excuses where they differ), and both checks run every variant in Light
and in Dark (`withDark` in `verify/oracle.mjs`; `inMode` in the web spec; `_dark` in the Flutter
harness). The gap reports are per mode (`<name>-dark-gaps.json`).

**Owner decision still open:** whether the Mobile type mode should be measured too (a third pass
on the type mode), or left to the token parity suite. SOLAR changes only `display`, `title` and
`code` between the two, so the token suite already proves the values; a third pass would prove
the components read them.

**Recommendation:** no third pass. Every recipe reads type through `var(--solar-type-size-*)`
and `var(--solar-type-line-height-*)`, which one media query in `tokens.css` reassigns at
767.98px, and the Light pass already proves each component reads the variables rather than a
number. A Mobile pass would add half again to the check's time to re-prove that one media query.

### 5. Show the excused-difference register in both viewers

**Why.** 3,241 decided excuses and 60 open findings across both modes are the project's
design-debt ledger. Today they live in `packages/components/test/visual/.out/*-gaps.json`,
`packages/solar_flutter/build/visual/*-gaps.json` and a 1,567-row table in `spec/deviations.md`.
The Storybook tile shows Figma's values as JSON but not what differs, so a reviewer cannot tell
an excused tile from a matching one, nor a Dark-only excuse from a Light one.

**Check it out.**

```bash
node -e '
const fs=require("fs"); const dir="packages/components/test/visual/.out"; let open=0,dec=0;
for (const n of fs.readdirSync(dir)) if (n.endsWith("-gaps.json"))
  for (const g of JSON.parse(fs.readFileSync(dir+"/"+n,"utf8"))) g.decision?dec++:open++;
console.log({decided:dec, open});'
grep -n -i 'excus\|gaps' packages/components/stories/solar.tsx packages/components/.storybook/main.ts
```

Expected: about 3,241 decided and 60 open; no mention of excuses or gaps in the viewer.

**What to change.** `packages/components/.storybook/main.ts` `solarData()` already serves the IR
and state tables as `virtual:solar`; add each oracle's `excused` lists (Light, and each variant's
`dark.excused`) and, when present, the last gap and failure reports. In
`packages/components/stories/solar.tsx` `Tile`, badge a variant with its excused count, colour
the badge by whether every excuse has a `decision`, and list each excused cell with its reason
under the "Figma values" details, marking the Dark-only ones. Mirror it in the Widgetbook app,
which already receives the oracles through `scripts/widgetbook.mjs`.

**Done when.** Opening Button's Variants story shows the 18 open-finding tiles marked, with the
finding text under each, in both themes; the Storybook and Widgetbook builds in CI still succeed.

---

## Bucket 3 — the developer loop

### 6. A rule proposer, before a live editor

**Why.** The design spec's tweak panel (edit a value, save an overlay rule) is not built and
would need a browser-to-repository write path. Most of its value is choosing the right rule kind
and spelling the address correctly, which is mechanical from data the pipeline already has: the
cell, its class, whether a token of the same value exists, what Figma drew, and which variants
the cell reaches. With item 2's patterns the proposer can also say when a pattern covers the
siblings.

**Check it out.**

```bash
grep -n -i 'propose' packages/codegen/bin/solar-explain.mjs packages/codegen/src/explain/index.mjs
```

Expected: nothing.

**What to change.** First in the CLI: `solar:explain -- "<Name>" --variant … --propose
<layer>.<property>` prints a YAML snippet ready to paste into `spec/overlay/<address>.yaml`:

- an unbound value with a token of the same value → `bind` with `literal` and `token`;
- an unbound value with no token → `allowLiteral` with a reason placeholder naming the
  governance gap;
- an axis finding → `follows` listing the axes the value actually varies with, computed from the
  oracle, or `accept` where it varies with none;
- a cell to change → `set` with the full address and Figma's value as `replaced`;
- where sibling layers hold the same finding, one patterned address instead of several.

Implementation in `packages/codegen/src/explain/index.mjs`, next to `lookupCell`, reusing
`tokenNames(contract)` from `normalize/recipe.mjs` for the same-value lookup. Then the same
function behind a button on the Storybook tile (item 5), copying the snippet to the clipboard.

**Done when.** For each of Button's three open findings the proposer prints a snippet that, once
pasted with a reason, builds and changes the oracle's excuse from `decision: null` to the new
rule; a test proves the snippet for a `bind` and for a `set` round-trips through `parseOverlay`.

### 7. `solar:overlay:audit` — done; 7b. act on what it found

Done 2026-09-25: `npm run solar:overlay:audit` (`bin/solar-overlay-audit.mjs`,
`src/report/overlay-audit.mjs`) reports rules repeated across three or more components,
reasons repeated verbatim, `allowLiteral` cells whose literal now matches a token, and `set`
rules whose `replaced` value Figma no longer draws.

**7b. Follow up on its first run.** The audit's top rows are decisions repeated across half the
corpus:

| Components | Decision                                          |
| ---------- | ------------------------------------------------- |
| 45         | `set root.base.width = FILL`                      |
| 38         | `allowLiteral root.height = any`                  |
| 23         | `set root.appearance.*.focus.shadow = shadow.focus.default` |
| 15         | `allowLiteral root.width = any`                   |
| 11         | `set root.size.sm.width = FILL`                   |

The overlay README already records why the focus ring is **not** a default (the text fields draw
theirs on the field, Context Menu Item as a fill). The other four need the same question asked:
does "a component fills its container" hold for every component it would reach, and is "SOLAR
publishes no control height token" one governance gap or 38? If a default is right, add it to
`spec/overlay/defaults.yaml` with the reason and delete the per-component rules; if it is not,
write the reason in the README's "Beside the overlays" so the audit's row stops being a
question. Either way, the design review's control-height item should count once.

**Check it out.**

```bash
npm run solar:overlay:audit 2>/dev/null | sed -n 1,20p
```

**Done when.** Each of the top five audit rows is either a default or has a written reason for
not being one, and generated output is unchanged.

### 8. Overlay reference and glossary — done

Done 2026-09-25: `spec/overlay/README.md`, a heading per rule in the order they apply, with
patterns, reason references, `defaults.yaml`, `excluded.yaml` and a glossary of the house
vocabulary. The codegen README points at it.

---

## Bucket 4 — structural, decide now

### 9. Shells as real files that import a generated module

> Reoriented 2026-09-25 by [two libraries, one contract](../specs/2026-09-25-two-libraries-one-contract.md):
> under that decision a React shell in TSX and a Flutter widget in Dart, each written by an
> engineer of that platform, are how each library stays native. The argument below stands and
> is stronger.

**Owner decision required.** The owner chose generated shells on 2026-09-24 ("Between F5 and
F6") so that a shared helper's fix and a slot Figma adds reach every component, and so the two
platforms cannot drift unseen. This item argues for keeping those two guarantees by another
means, and reverses that choice, so it needs an explicit yes.

**Why.** 61% of the 20,169 descriptor lines are TSX and Dart inside template strings: no
highlighting, no type checking until after a run, escaped backticks, and an option vocabulary of
87 keys across `shells/drawn.mjs`, `field.mjs`, `picker.mjs`, `typed.mjs`, `menu.mjs`, `card.mjs`
and `insight.mjs` to avoid repeating the strings. F10 added `card.mjs` (773 lines) to that
vocabulary. F12 Dialogs and Overlays is the family with the most behaviour to write (portals,
focus traps, Escape, focus return) and will be the most expensive place to write it in strings.

**Check it out.**

```bash
node -e '
const fs=require("fs"); let tpl=0,total=0;
for (const f of fs.readdirSync("packages/codegen/src/components")) {
  const t=fs.readFileSync("packages/codegen/src/components/"+f,"utf8"); let inT=false;
  for (const line of t.split("\n")) { total++; const n=(line.match(/(?<!\\)`/g)||[]).length; if(inT) tpl++; if(n%2) inT=!inT; } }
console.log({total, inTemplates: tpl, share: (tpl/total).toFixed(2)});'
grep -oE '\bo\.[a-zA-Z]+' packages/codegen/src/shells/*.mjs | sed 's/.*://' | sort -u | wc -l
```

**What to change.** Keep generating what is a function of the IR, and stop generating what is
hand-written behaviour:

- Emit `solar<Name>Tree` (today `treeOf(spec)` inlined into the shell) and the slot-name table
  into the MUI recipe module, and `Solar<Name>Tree` into the Flutter recipe, beside the props
  types and `Parts` that are already there.
- Turn every shell into a hand-owned file that imports them: the mechanism exists as
  `owned: true` (`shells/index.mjs`, `renderShells`), so the migration is: render each shell once
  more, strip the header, delete the descriptor's `templates`, set `owned`. Each file already
  equals its template's output, so the migration produces no behaviour change.
- Keep the two guarantees: a slot or prop Figma adds becomes a **typecheck error** in the shell,
  since the generated props type and tree gain a member the shell does not use (add a test in
  `test/component-parity.test.mjs`, which already parses the shells, that every IR slot is
  referenced); a shared-helper fix reaches every shell because the helpers are runtime modules
  (`components/src/internal/*`, `solar_flutter/lib/src/*.dart`) that the shells import, which is
  already how `layers.tsx` and `SolarLayers` work. Only the string-assembling helpers go away,
  replaced by runtime helpers where they hold logic and by nothing where they only concatenate.

**Done when.** No descriptor has `templates`; `packages/codegen/src/shells/` holds only
`index.mjs`'s owned-shell check and `target.mjs`; every shell typechecks and analyses; both
visual checks and all unit tests pass unchanged; the parity test fails when an IR slot is removed
from a shell.

**Alternative if the owner keeps generated shells.** Move each template to a
`packages/codegen/src/components/<name>.react.tsx.tmpl` and `.flutter.dart.tmpl` file with a
small placeholder syntax, so editors highlight them, and add a step that typechecks the rendered
output before writing it. Cheaper, but the option vocabulary stays.

### 10. Stable public names, not Figma layer names

**Why.** Class names (`SolarStatusIndicator-frame3InnerPath`, `SolarTag-iconNone`) and Flutter
keys (`tabItem.counter`) are built from Figma layer names by `namesOf`. A designer renaming a
layer fails the build by design (overlay rules go stale), which is good, but a fix that renames
the layer also renames a CSS hook a consuming app may target with `sx`, which is a silent break
for consumers.

**Check it out.**

```bash
grep -oE 'Solar[A-Z][A-Za-z]+-[a-z][A-Za-z0-9]+' packages/styles/src/generated/mui/components/statusindicator.ts | sort -u | head
```

Expected: classes named after Figma layers (`frame3InnerPath`, `containerUnion`).

**What to change.** Two name spaces: **public** hooks are slot names and `root` only, stable
across syncs and documented in the components README; **internal** layer classes take a prefix
that says so (`SolarTag--iconNone`) or a stable overlay-given name via `layerNames`. `slotsOf`
in `emit/mui-component.mjs` and `drawnResets` in `shells/drawn.mjs` write the classes; the web
visual spec's `targets` reads the same table, so it follows. Document that internal classes are
not a contract.

**Done when.** The components README lists each component's public hooks; a test asserts every
public hook is a slot or `root`.

### 11. The spec says what the system is — done; one question open

Done 2026-09-25: the design spec's §3 carries "What it has become": a layer-tree renderer that
borrows platform behaviour where it helps, 84 of 98 descriptors drawn. §13 records it and lists
two questions for the owner:

- Does MUI 9 with Emotion earn its place as `@bwp-web/components`' peer dependency, for what is
  mostly `Box`, `ButtonBase` and `InputBase`?
- The MUI theme holds literal hex while every recipe holds `var(--solar-*)`, so a stock MUI
  widget and a SOLAR component on one page switch modes by different mechanisms.

The second is item 15 below, since the comparison made it a consumer-facing defect rather than a
purity question, and item 15 settled it on 2026-09-25.

---

## Bucket 5 — before publishing 2.0

### 12. Recipe packaging for consumers

**Why.** `@bwp-web/styles/mui` bundles every component's recipe into one module: 1,012 KB after
`npm run build` at 97 components, most of it repeated `var(--solar-…)` strings. Named ESM
exports tree-shake, but each recipe object is one large literal that a bundler keeps or drops
whole, and `@bwp-web/components` imports the barrel, so an app importing three components pays
for the index's re-export graph.

**Check it out.**

```bash
ls -la packages/styles/dist/mui.js 2>/dev/null || (npm run build -w @bwp-web/styles && ls -la packages/styles/dist/mui.js)
wc -l packages/styles/src/generated/mui/components/*.ts | tail -1
grep -oE "from ?['\"]@bwp-web/styles/mui['\"]" packages/components/dist/index.js | wc -l
```

**What to change.** Per-component subpath exports (`@bwp-web/styles/mui/button`) written by
`emitMuiComponents` into `packages/styles/package.json`'s `exports` and `tsup.config.ts`'s entry
list, with the shells importing their own recipe module; or a compact encoding (token name once,
`var()` built at call time in `solar<Name>Style`). Item 1 shrinks the largest recipes first;
measure again after it.

**Done when.** An app importing `Button` alone bundles under 60 KB of recipe.

### 13. What git carries

**Owner decision required.** `spec/components/` and `spec/verify/` are derived files,
regenerated and diffed in CI, and the oracles now carry Dark beside Light. The stated reason to
commit them is that a Figma change becomes a reviewable diff of the contract, and the viewers
read the oracles without a codegen run (`scripts/widgetbook.mjs`, `.storybook/main.ts`). Both
hold. The cost is review noise: a sync touches thousands of oracle lines. Options: keep both
(status quo); keep the IR and rebuild the oracles in the viewer scripts; or keep both but mark
`spec/verify/**` `linguist-generated` in `.gitattributes` so PR review collapses them.
Recommend the last, since it changes nothing else.

**Check it out.**

```bash
du -sh spec/components spec/verify; ls spec/verify | wc -l; cat .gitattributes 2>/dev/null || echo "no .gitattributes"
```

---

## Bucket 6 — the consumer's experience

From the comparison with `@biamp/solar-mui` (appendix). That package is a theme, a token export
and icons for stock MUI, with no components; it is weaker at fidelity and stronger at adoption.
These items take its strengths without its approximations.

### 14. A stock-MUI theme generated from the recipes

**Why.** `createSolarThemeOptions` (`packages/styles/src/generated/mui/theme.ts`) returns
palette, shape, z-index and typography, and no `components` block. Any app using our components
will also use stock MUI for what we have not built (Dialog, Table, Tooltip until F11 and F12)
and for what we never will (Grid, Drawer variants), and those get MUI's look. The third-party
package themes 49 MUI keys by hand; we can derive the same block from recipes we already
generate, since `solar<Name>Style()` is documented as usable in `styleOverrides.root`, and MUI 9's
`variants: [{ props, style }]` takes a SOLAR appearance per MUI prop combination.

**Check it out.**

```bash
grep -n 'components' packages/styles/src/generated/mui/theme.ts   # expected: nothing
grep -c 'Mui[A-Z][A-Za-z]*: {' ~/Downloads/package/dist/theme.js 2>/dev/null   # the third party's coverage, if the package is present
```

**What to change.**

- A decision file, `spec/overlay/mui-theme.yaml` (or a section of `defaults.yaml`), mapping each
  MUI component key with a SOLAR counterpart to the recipe and the prop mapping, each with a
  reason: `MuiButton: { component: Button, props: { variant: { contained: primary, outlined:
secondary, text: tertiary }, color: { error: { danger: true } }, size: { small: sm, medium: md,
large: lg } } }`, and the same for IconButton, Checkbox, Radio, Switch, Slider, Tab and Tabs,
  MenuItem, Select, Chip (Tag), Badge (Counter), LinearProgress, CircularProgress, Skeleton,
  Avatar, Link, Breadcrumbs, PaginationItem, Stepper parts, Alert, Tooltip, Dialog parts, Card
  parts, Accordion parts, TableCell.
- `emit/mui.mjs` writes `components.<Key>.styleOverrides` and `variants` from the mapped
  recipes, `var(--solar-*)` values as the recipes hold them, and `defaultProps` where SOLAR
  fixes one (`disableRipple`, `disableElevation`). A key whose mapping names a component that is
  not generated yet fails the build, so Dialog and Table join when F11 and F12 land.
- A test renders a stock `<Button variant="outlined">` under the theme and asserts it computes
  the same values as `<Button variant="secondary">` from `@bwp-web/components`, for the resting
  state and hover, in Light and Dark.

**Scope, checked 2026-09-25.** Deriving `styleOverrides` "from recipes we already generate"
works directly only where our shell sits on the same MUI component (Button on MUI `Button`,
Dropdown Item on `MenuItem`, ListItem on `ListItemButton`: the overlays naming a MUI base). For the
84 drawn components the recipe's selectors are our layer classes (`.SolarTag-label`), which MUI's
DOM does not have (`.MuiChip-label`), so each MUI key needs a hand map from our layers to its
slots in the decision file, with a reason per layer. Start with the keys whose SOLAR counterpart
already sits on the MUI component, then the drawn ones one family at a time.

**Keep it honest the way the components are.** Their parity check exists because a hand theme
drifts. Ours can do better at little cost: add the themed stock MUI components to the web visual
check as cases of the same oracles (a stock `<Button variant="outlined">` is a case of Button's
`prio=secondary` variants), so the theme is measured against Figma, not against our components.

**Done when.** A stock MUI `Button`, `TextField`, `Checkbox`, `Switch`, `Tabs`, `Chip` and
`MenuItem` under the theme pass the visual check against their SOLAR component's oracle in both
modes, and the theme's coverage table is generated into `packages/styles/README.md`.

### 15. One mode switch

**Why.** Our components switch with `data-theme="dark"` on any subtree; stock MUI switches with
`palette.mode` in the theme object. A consumer must set both and keep them in sync. The
third-party package has one switch because it has only MUI. MUI 9's CSS-variables theme mode
(`cssVariables: { colorSchemeSelector: 'data-theme' }`, with `colorSchemes: { light, dark }`)
makes MUI read the same attribute our tokens do, and lets `palette` values be `var(--solar-*)`
where MUI does not run `alpha()` or `darken()` on them.

**Check it out.**

```bash
grep -n 'cssVariables\|colorSchemes\|data-theme' packages/styles/src/generated/mui/theme.ts packages/styles/README.md
```

Expected: `data-theme` only in the README's CSS section, nothing in the theme.

**What to change.** `emit/mui.mjs`: emit `colorSchemes.light` and `colorSchemes.dark` from
`solarMuiPalette`, and set `cssVariables: { colorSchemeSelector: '[data-theme="%s"]' }`, so MUI
writes its own `--mui-palette-*` variables under the attribute our tokens switch on. Keep the
palette values literal, one set per scheme, as `solarMuiPalette` already has them: MUI derives
channels and shades from the palette (`alpha()`, `darken()`, `--mui-palette-*-mainChannel`), which a
`var(--solar-*)` value breaks. The switch is the selector, not the values. Where an app lets MUI
set the attribute (`useColorScheme`), server rendering needs `InitColorSchemeScript`; where the app
sets `data-theme` itself, as for our tokens, it does not. Test:
render under `data-theme="dark"` with no `palette.mode` and assert MUI's `background.paper`
resolves to the Dark surface token's value.

**Done when.** The styles README's MUI section shows one snippet with one switch, and a stock MUI
`Paper` and a SOLAR `Card` in one `data-theme="dark"` subtree draw the same surface.

### 16. One-line setup for a consuming app

**Why.** Today: import `tokens.css`, import `fonts.css`, `createTheme(createSolarThemeOptions('light'))`
in a `ThemeProvider`, then import components. Four steps across two packages. The third-party
package is one call. Nothing in ours requires four steps.

**What to change.** A `SolarProvider` in `@bwp-web/components` (or `createSolarTheme()` in
`@bwp-web/styles/mui` returning a ready `Theme`, once item 15 lands) that installs the theme,
and a documented single snippet at the top of `packages/components/README.md` that imports the
two stylesheets and wraps the app. Keep the granular entries for apps that want only tokens or
only Tailwind.

**Done when.** The components README's "Getting started" is one code block a new app can paste,
and a smoke test renders `Button` inside `SolarProvider` with no other setup.

### 17. One vocabulary: Figma's words or MUI's

> Proposed answer, 2026-09-25, in [two libraries, one contract](../specs/2026-09-25-two-libraries-one-contract.md)
> rule 5: SOLAR's word where SOLAR names the thing; otherwise MUI's word on the web and
> Flutter's word in Flutter, never one spelling forced on both. Pending the owner's confirmation.

**Owner decision required.** We rename Figma's `prio` to `variant` for MUI's sake, and keep
`helper`, `mandatory`, `iconLeading` and `count` where MUI says `helperText`, `required`,
`startIcon` and `badgeContent`. Either rule is defensible. Applying both is what a consumer
coming from MUI will stumble on, and it is cheap to fix now and expensive after 2.0 ships.

**Check it out.**

```bash
grep -hoE '^\| `[a-zA-Z]+`' packages/components/README.md | sort | uniq -c | sort -rn | head -30
```

**What to change.** Decide the rule (Figma's words where SOLAR's description names a prop, MUI's
where SOLAR is silent, is the likeliest), record it in `spec/overlay/README.md` beside `rename`,
and apply it through `rename` rules and the descriptors' `shells.slots` tables. Where a MUI name
is dropped, consider a typed alias for one minor version.

**Both platforms.** The rule must hold in Flutter too, where the parity test already asserts one
vocabulary: MUI's `helperText` and `startIcon` are not Flutter's words either
(`InputDecoration.helperText` is, `startIcon` is not), so "MUI's name" means the web and Flutter
diverge unless the rule is "MUI's name where Flutter's agrees, SOLAR's otherwise". Decide with
both prop tables open.

**Done when.** The components README's prop tables follow one stated rule, and the parity test
asserts both platforms use the same names.

### 18. Figma Code Connect and a Figma-ID manifest

**Why.** The third-party package ships Code Connect templates for 26 components and a manifest
from Figma family and variant IDs to export names, so a designer in Dev Mode sees the real props
and a rename in Figma does not move the code name. Our IR already holds each component's Figma
node (`provenance`), its API and its prop mapping (`rename`), so both are generator outputs, and
for a design-to-code product they are a large part of what a designer experiences.

**Check it out.**

```bash
node -e 'const ir=JSON.parse(require("fs").readFileSync("spec/components/button.json","utf8")); console.log(ir.provenance)'
ls packages/components/codeconnect 2>/dev/null || echo "no Code Connect"
```

**What to change.** A `codeconnect` emitter in `packages/codegen/src/emit/` writing
`packages/components/codeconnect/<Name>.figma.tsx` from the IR: the Figma node URL, each axis
mapped through its `rename` to the shell's prop, each slot to `figma.instance` or
`figma.string`, and derived axes left out. A `manifest` emitter writing
`packages/components/src/generated/manifest.ts` from `provenance`. `@figma/code-connect` as a
dev dependency and a `codeconnect:check` script that parses the templates in CI; publishing
stays a deliberate local action, like `solar:sync`.

**Checked 2026-09-25.** `provenance.figmaNode` is the component set's node, which is all Code
Connect needs. A per-variant manifest needs each variant's node ID, which the raw data does not
record (a raw variant has `variant`, `size`, paints and `overrides`, no `id`): the fetcher must
record it (`digest` in `docs/solar-web/raw/fetch-rest.mjs`), and the IDs arrive with the owner's
next `solar:sync`. Their README notes that publishing needs the components in a team library on a
Figma Organization or Enterprise plan.

**Owner questions:** is SOLAR Web's library on such a plan, and should the variant IDs be
recorded at the next sync?

**Done when.** `figma connect parse` passes for every exported component, and the manifest
resolves every generated component's Figma node to its export name.

### 19. Breakpoints, spacing and motion in the MUI theme

**Why.** `createSolarThemeOptions` returns palette, shape, z-index and typography only. MUI's own
defaults fill the rest, and they disagree with SOLAR: MUI's breakpoints are 600, 900, 1200 and
1536px, where SOLAR's viewport tokens are its own and our typography already switches to Mobile at
767.98px (`@media (max-width: 767.98px)` in the theme and in `tokens.css`), so an app's
`theme.breakpoints.down('md')` and SOLAR's Mobile type change at different widths. MUI's 8px
spacing unit and its transition durations and easings are not SOLAR's either. The third-party
theme derives all three from the tokens.

**Check it out.**

```bash
grep -n 'breakpoints\|spacing\|transitions' packages/styles/src/generated/mui/theme.ts   # expected: nothing
node -e 'const t=JSON.parse(require("fs").readFileSync("spec/tokens.json","utf8")); console.log(Object.keys(t.viewport ?? {}), Object.keys(t.motion ?? {}))'
```

**What to change.** `emit/mui.mjs`: `breakpoints.values` from the `viewport.*` tokens (`xs: 0`,
as MUI requires, the rest SOLAR's, with `sm` the Mobile switch the type already uses);
`spacing` from SOLAR's base inset unit; `transitions.duration` and `transitions.easing` from the
`motion.*` tokens, as `var(--solar-motion-*)` where MUI accepts a string and numbers where it
computes. A test asserts `theme.breakpoints.values.sm` equals the width the type's media query
switches at.

**Done when.** The theme's breakpoints, spacing and motion trace to tokens, and the styles README
says so.

### 20. Install the packed packages in a clean app

**Why.** `packages/codegen/test/packaging.test.mjs` checks each `package.json` (`exports`,
`sideEffects`), but nothing installs what `npm pack` produces. A file missing from `files`, an
export pointing at a path the build does not write, a CSS entry the bundler drops, or a module that
touches `window` at import all pass today and fail in the first consuming app. The third-party
package installs its packed archive in a clean app with React 18 and renders it on the server.

**Check it out.**

```bash
grep -rn 'npm pack\|renderToString' packages/codegen/test/packaging.test.mjs   # expected: nothing
```

**What to change.** A script (`scripts/smoke-install.mjs`, run in CI after `npm run build`) that
packs `@bwp-web/styles`, `@bwp-web/assets` and `@bwp-web/components` into a temporary directory,
installs them into a fresh app with the lowest supported React (18) and MUI 9, imports every
public entry (`tokens.css`, `fonts.css`, `/mui`, `/svg/*`), and renders a Button, a Text Input and
an icon with `renderToString`.

**Done when.** The script passes in CI, and fails when a file is removed from a package's `files`.

---

## Bucket 7 — two libraries, one contract

The owner's stated intent (2026-09-25): each library matches its Figma design on its own; the
two need not match each other, and neither adopts the other's conventions. The decision, the
evidence, the rules for writing a component and the detail of these two items are in
[two libraries, one contract](../specs/2026-09-25-two-libraries-one-contract.md). Read it before
starting either item, or items 9, 14, 15 and 17, which it reorients.

### 21. Demote the parity suite to the contract — done

Done 2026-09-25: the descriptors' `api` tables and `src/shells/api.mjs`; see the spec's §8.

Keep the level-1 checks in `packages/codegen/test/component-parity.test.mjs` (every IR entry on
both platforms, same states in the same order, same appearance combinations, no colour literal).
Replace the API-identity checks ("same props", "spelled the same", "label as their child") with
reachability through a declared per-platform mapping, and turn the descriptors' exception tables
(`shells.label`, `shells.flutter`, `shells.slots`, `flutter.groupDecides`) into that mapping.
Detail and done-when: the spec's §6, item 21.

### 22. A Flutter idiom pass — done for the buttons

Done 2026-09-25: null callbacks disable 16 widgets, and the four button widgets have component
themes; Slider, Slider Range, Radio and Option Row could follow. See the spec's §8.

A pressable is disabled by `onPressed: null` (31 widgets carry both a `disabled` parameter and a
callback today); wrapped controls expose their recipe as a component theme in `SolarTheme`; the
string-keyed lookup stays for drawn widgets. Detail, the check-it-out commands and done-when: the
spec's §6, item 22. Owner questions in its §8.

---

## Do not change

These are the parts that make the pipeline better than the alternatives, and every item above is
about making them cheaper to live with or easier to adopt:

- The finding model: geometry follows size, paint follows appearance and state, every
  disagreeing variant recorded, never averaged.
- The oracle's independence from the recipe, and the test that scrambles the recipe to prove it.
- A reason on every overlay rule, and a stale rule failing the build.
- `docs/` read-only to the generator, the write guard, and CI's rebuild determinism.
- `solar:explain`, and its test that the lookup resolves to Figma's value in every unexcused
  cell.
- Visual checks that reach states the way a user does, on both platforms, in both modes, against
  Figma.

---

## Appendix — comparison with `@biamp/solar-mui` 0.1.0

A package produced by another product from the same three Figma files, found at
`~/Downloads/package` on 2026-09-25 (dist only, no source). It is a **theme, a token export and
344 `SvgIcon` icons** for stock MUI: a 220-line `theme.js` (29.5 KB) with `styleOverrides` and
`variants` for 49 MUI keys, and a README table mapping SOLAR names onto native MUI props. It
ships no components. Its own parity check covers 217 cases across 23 components on the web.

Checked against the package: the theme is **hand-written but token-driven**. It reads each
colour and spacing by token name when the theme is created (`c['action/primary/bg/default']`), so
colours follow the tokens; what is hand-written is the mapping onto MUI and about 64 raw sizes
(`minHeight: 40`, `width: 16`) and heuristics (`hairline = 0.6`, which fills `action()` makes
transparent). Its icon set is ours: 340 icons and the same three logo families (OS Logo, Biamp
Logo, App Icon). Its manifest labels both of Support's variants "solid"; our fetch reads them as
`solid=false` and `solid=true`, so the duplicate is not in our data.

| Aspect                     | `@biamp/solar-mui`                                                                                                                                                | Ours                                                                                                                                          |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup                      | `createSolarTheme()` in a `ThemeProvider`.                                                                                                                        | Two stylesheets, a theme call, component imports (item 16).                                                                                   |
| API                        | Native MUI props; MUI's docs are the docs.                                                                                                                        | Props from Figma's vocabulary, documented per component (item 17).                                                                            |
| Stock MUI components       | Themed for 49 keys, including Dialog, Table, Tooltip, Card, Accordion.                                                                                            | Palette, shape, z-index and typography only (item 14).                                                                                        |
| Breakpoints, spacing, motion | From the viewport, inset and motion tokens.                                                                                                                     | MUI's defaults, which disagree with the Mobile type switch at 768 px (item 19).                                                               |
| Install check              | The packed archive installed in a clean app, React 18, server rendering.                                                                                         | `package.json` checks only (item 20).                                                                                                         |
| Dark mode                  | A second theme object; JS only.                                                                                                                                   | `data-theme` on any subtree, CSS only; stock MUI needs `palette.mode` too (item 15).                                                          |
| Coverage of SOLAR Web      | About 39 names mapped onto about 30 MUI components; SOLAR-only components absent or approximated (Counter as `Badge`, round Icon Button via `sx`).               | 97 of 132 generated, including everything MUI lacks.                                                                                          |
| Fidelity                   | Hand-encoded heuristics (`action()` deciding transparent fills, `hairline = 0.6`, about 60 raw pixel literals, a fixed `2px solid` focus outline).               | Measured per variant against Figma layers: 1,102 variants, two platforms, two modes, 0 failures, every difference excused by a named finding. |
| Figma's own mistakes       | Not caught: the Tabs indicator is 1 px (`border/default`) where Figma draws the selected underline 2 px; the colour, `border/strong`, is the same as ours.         | Figma's misbound focus colour caught as a finding, decided in `tab-item.yaml`; 2 px as Figma draws it.                                        |
| Text tracking              | One rule: body and label text at `-0.02em`, titles at `-0.03em`.                                                                                                  | Each text style as Figma authors it: `body/md`, `link/md` and `display/xs` are a fixed `-0.32px` (`-0.02286em` at 14px), not `-2%`.          |
| Change flow                | Someone re-reads Figma and edits `theme.js`.                                                                                                                      | `solar:sync`, `solar:codegen`.                                                                                                                |
| Icons                      | MUI `SvgIcon` (`fontSize`, `color`, `sx`, `titleAccess`); needs MUI. Figma-ID manifest.                                                                           | Plain `<svg>`, `size` from the `icon.*` ladder, `title`; no MUI needed; 1.5 KB per icon. No manifest (item 18).                                |
| Figma Code Connect         | Templates for 26 components.                                                                                                                                      | None (item 18).                                                                                                                               |
| Bundle                     | 30 KB theme, per-icon deep imports.                                                                                                                               | 1 MB recipe module (item 12).                                                                                                                 |
| Accessibility              | MUI's defaults plus a focus outline.                                                                                                                              | 44 px targets on every control, names required or warned, roles per shell.                                                                    |
| Flutter                    | None.                                                                                                                                                             | Full parity.                                                                                                                                  |

**Reading.** The generation side of ours is correct and ahead; the delivery side should borrow
their strengths: a full stock-MUI theme derived from the recipes, one mode switch, one-line
setup, Code Connect. Their theme is fast to write and impossible to keep honest, which is the
drift our pipeline exists to prevent; do not copy its method, only its surface.

---

## Verification checklist for any item

From the repository root, on Node 22 (`export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`):

```bash
npx vitest run
npm run lint && npm run typecheck && npm run format
npm run solar:rebuild && npm run solar:rebuild && git status --porcelain   # must be empty
npm run test:visual
(cd packages/solar_flutter && flutter analyze && dart format --output=none --set-exit-if-changed lib test variants/lib widgetbook/lib && flutter test)
npm run solar:overlay:audit
```

Generated output of every component not named by the item must be byte-identical before and
after. Then stop and report for the owner to review and commit.
