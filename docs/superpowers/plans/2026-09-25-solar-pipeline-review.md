# SOLAR design-to-code pipeline — review and priority backlog

> **For agentic workers:** this is a review with a verified backlog, not an implementation plan.
> Every item has a **Check it out** section: run those commands first and confirm the evidence
> still holds, since the tree moves fast. An item marked **Owner decision** must not be started
> until the owner has answered. Once an item is confirmed and decided, write its own plan with
> superpowers:writing-plans (bucket 1 items each deserve one) and carry it out with
> superpowers:subagent-driven-development or superpowers:executing-plans. The repository owner
> handles all version control: no git write commands, ever. "Commit" means stop and report.

**Status (2026-09-25, after F10):** done — #2 (patterns and reason references; 327 numbered
rules folded, 33 empty reasons referred, the focus ring one patterned rule per overlay, `*` looks),
#3 (the Node check), #4 (Dark measured on both platforms), #7 (`npm run solar:overlay:audit`; the
focus ring did not become a global default, see `spec/overlay/README.md`), #8
(`spec/overlay/README.md`) and #11 (the spec's notes; its two questions open for the owner); and
the four gaps this review missed (a text's FILL, the fetcher's hidden paths and added layers'
places, writes held until the run succeeds, the words check). Not started: #1, #5, #6, #9, #10,
#12, #13.

**Goal:** make the pipeline cheaper to extend and to correct, without weakening the parts that
make it trustworthy: the finding model, the oracle's independence from the recipe, and the reason
on every overlay rule.

**Scope:** the generator (`packages/codegen`), its overlays (`spec/overlay`), the shells, the
viewers and the checks. Not the Figma fetchers, not the token layer, which is in good shape.

**State reviewed:** commit `7579eec` ("pagination and steppers", 2026-09-24) on `v2-SOLAR`, with
F10's Card pioneer in progress in the working tree (`spec/overlay/card.yaml`, edits to
`normalize/overlay.mjs` and `normalize/components.mjs`). Numbers below come from that state; the
**Check it out** commands recompute them.

---

## Verdict, in short

The architecture is right for design-to-code, and more rigorous than most: one normalizer over
the Figma mirror, independent emitters, an oracle built from Figma layers rather than from the
recipe, rendered checks on both platforms, deterministic rebuilds in CI, and every human decision
recorded with a reason. Keep all of that.

The costs have pooled in four places:

1. **Repeated children are not modelled**, so Figma's sample counts (35 day cells, 7 weekdays, 8
   tabs) become distinct layers, distinct recipe entries, distinct overlay rules and distinct gaps.
2. **The overlay is a 24-construct language** documented as a changelog, and **two thirds of the
   descriptors are TSX and Dart inside template strings**, with a second option-DSL around them.
3. **The developer loop is YAML plus a CLI.** `solar:explain` is excellent; the viewers show
   Figma's values but not the differences, and nothing proposes a rule.
4. **The "wrap MUI and Flutter" premise has inverted.** 67 of 79 descriptors draw their own layer
   tree; Flutter wraps a stock widget in about 15. The system is a layer-tree renderer with
   borrowed platform behaviours, and the spec does not say so yet.

| Measure (2026-09-25)                                                | Value          |
| ------------------------------------------------------------------- | -------------- |
| Components generated · oracle variants                              | 79 · 983       |
| Visual failures on the last web run                                 | 0              |
| Excused differences: decided by an overlay · open Figma findings    | 1,244 · 30     |
| Overlay rule kinds accepted by `parseOverlay`                       | 24             |
| Descriptor lines inside template strings (of 17,480)                | 66%            |
| Descriptors with `slots: 'drawn'` (bespoke layer trees)             | 67 of 79       |
| Overlays naming a Flutter base widget                               | 15             |
| Hand-written Flutter runtime, `lib/src/*.dart` outside `components` | ~2,200 lines   |
| `@bwp-web/styles` MUI entry after `npm run build`                   | 840 KB `mui.js` |

---

## How the buckets are ordered

By payoff against cost, and by **when the cost is paid**. F10 Cards, F11 Tables and F13 Calendar
parts repeat children; F12 Dialogs is the family with the most behaviour to write; F14 Charts
carries sample geometry. Each bucket 1 item saves work in every family after it.

- **Bucket 1:** before F10 finishes. Every later family pays for them.
- **Bucket 2:** assurance gaps. Small changes, large coverage.
- **Bucket 3:** the developer loop.
- **Bucket 4:** structural. Decide now, do between families.
- **Bucket 5:** before publishing 2.0.

---

## Bucket 1 — before F10 finishes

### 1. Model repeated children in the IR

**Why.** Figma draws a component's sample content as sibling instances: a month's 35 day cells,
seven weekdays, eight tabs. `namesOf` (`packages/codegen/src/normalize/components.mjs`) names
them `dayGridDayCell`, `dayGridDayCell2`… and from there every stage treats them as 35 layers:
the recipe derives 35 style blobs, the overlay needs 70 `set` rules to say their size is the Day
Cell's own, the MUI recipe writes 35 selector blocks, the oracle measures 35 layers per variant,
the shell carries a 35-entry `TREE`, and 281 excused gaps are theirs. The shells never use the
samples: `DatePickerOpen.tsx` builds the real month and fills `dayGrid` through `content`.

**Evidence.**

- `spec/components/date-picker-open.json`: 145 layers, 35 of them `dayGridDayCell*`, with 5
  distinct style blobs among the 35 (the differences are Figma's sample states: today, selected,
  disabled).
- `spec/overlay/date-picker-open.yaml`: 711 lines, 70 rules on `dayGridDayCell*`, the reason
  "As its width, its own." 108 times across all overlays.
- `packages/styles/src/generated/mui/components/date-picker-open.ts`: 2,724 lines.
- `packages/components/test/visual/.out/date-picker-open-gaps.json`: 281 of the 1,274 gaps.

**Check it out.**

```bash
node -e '
const ir=JSON.parse(require("fs").readFileSync("spec/components/date-picker-open.json","utf8"));
const cells=Object.keys(ir.layers).filter(k=>/^dayGridDayCell\d*$/.test(k));
const norm=(s)=>JSON.stringify(s,(k,v)=>k==="from"?undefined:v);
console.log(Object.keys(ir.layers).length,"layers;",cells.length,"day cells;",
  new Set(cells.map(c=>norm(ir.style[c]))).size,"distinct style blobs");'
grep -c dayGridDayCell spec/overlay/date-picker-open.yaml
grep -h '^\s*reason:' spec/overlay/*.yaml | sort | uniq -c | sort -rn | head -5
grep -c dayGridDayCell packages/components/src/DatePickerOpen.tsx
```

Expected: 145 layers, 35 day cells, 5 blobs; 70 rules; the top repeated reasons are the day
cells'; the shell names the 35 layers only in `TREE`.

**What to change.** A normalizer rule, not an overlay: repeated siblings that are instances of
the same component (or the same node type with the same name stem) collapse into **one layer**
with a `repeat` count and, where their samples differ, one `sample` axis whose variants are
excused as content. Touch points, in pipeline order:

- `normalize/components.mjs` `namesOf`: name the group once; record `repeat` and the member paths.
- `normalize/recipe.mjs` `deriveRecipe`: read one layer's cells from the first member; a member
  that differs is a **sample** finding, not an axis finding (compare `samples` in the overlay).
- `verify/oracle.mjs` `buildOracle`: one entry per group, measured against the first member the
  shell draws; both visual harnesses (`packages/components/test/visual/components.spec.mjs`
  `targets`, `packages/solar_flutter/test/visual/harness.dart`) already measure held children
  through `data-layer` and `measureHeld`, so a repeated layer measures as a held slot.
- `emit/mui-component.mjs`, `emit/flutter-component.mjs`: one selector or one cell key per group.
- `shells/drawn.mjs` `treeOf`, `packages/components/src/internal/layers.tsx` `drawChildren`,
  `packages/solar_flutter/lib/src/solar_layers.dart`: a repeated layer draws its `content`, or its
  first sample where the shell gives none.
- Overlays: delete the `set` rules the collapse makes stale (the build will name them).

**Done when.** `date-picker-open.json` has under 60 layers; its overlay has no `dayGridDayCell*`
rules; its gap count is under 30; every other component's IR, recipe and oracle is byte-identical
(diff `spec/` and `packages/*/src/generated` before and after); `npx vitest run`, both visual
checks and `flutter test` pass; two `npm run solar:rebuild` runs leave the tree unchanged.

**Owner decision.** Whether Figma's per-sample differences (a selected day among disabled ones)
should be recorded as findings at all, or excused wholesale as content.

### 2. Pattern addresses and reason references in overlays

**Why.** Even with item 1, cells repeat across layers that are not siblings (Tag's `icon`,
`iconNone`, `iconClose` widths; Stepper's steps; every field's height). Today each needs its own
rule and its own reason, so authors paste. A rule that applies to several layers, and a reason
that points at another rule, remove the pasting without weakening the reason-on-every-rule
discipline.

**Check it out.**

```bash
grep -hE '^[a-zA-Z]+:$' spec/overlay/*.yaml | sort | uniq -c | sort -rn
grep -c 'As its width' spec/overlay/*.yaml | sort -t: -k2 -rn | head
grep -nE 'wildcard|glob|pattern' packages/codegen/src/normalize/overlay.mjs
```

Expected: 24 rule kinds; several overlays with a dozen "As its width" reasons; no pattern
support in the parser (the one `RegExp` is for axis keys).

**What to change.** In `packages/codegen/src/normalize/overlay.mjs`:

- `parseOverlay` (≈ line 192) and `splitCell` (≈ line 553): accept `<layer>` as a glob over IR
  layer names (`dayGrid.*`, `icon*`) and a `layers: [a, b]` list on `bind`, `set`,
  `allowLiteral`, `follows`, `controlDraws`. Expansion happens once, against the IR's layer set,
  and a pattern that matches nothing fails as a stale rule does today.
- `reason: as <section>.<address>` resolves to that rule's reason text at parse time, and fails
  if the target does not exist. Record the resolved text in the IR's `overlay.rules`, so
  `spec/deviations.md` and `solar:explain` still show a full sentence.
- Tests in `packages/codegen/test/overlay.test.mjs`: a glob that matches two layers, one that
  matches none (fails), a reason reference to a missing rule (fails), and a corpus test that
  rewriting Tag's three icon binds as one rule leaves `spec/components/tag.json` unchanged.

**Done when.** Rewriting the three worst overlays (`date-picker-open.yaml`, `tree-item.yaml`,
`stepper.yaml`) with patterns leaves every generated file unchanged, and their line counts halve.

### 3. Fail fast on the Node version

**Why.** On Node 20, `solar:explain` died with `TypeError: entriesOf(...).some is not a function`
from `applyOverlay` in `normalize/overlay.mjs`: the generator relies on Node 22 iterator helpers.
`.nvmrc` says 22, `README.md` says 22, and every CI job pins 22, but the CLIs do not check, so a
developer on the wrong Node gets a stack trace with no hint.

**Check it out.**

```bash
node -v     # if this prints v20.x, the next line reproduces the crash
node packages/codegen/bin/solar-explain.mjs Button 2>&1 | head -3
cat .nvmrc
```

**What to change.** A tiny `packages/codegen/src/util/node-version.mjs` that reads `.nvmrc` at
`repoRoot` and throws a one-line error if `process.versions.node`'s major is lower; call it first
thing in `bin/solar-codegen.mjs`, `bin/solar-explain.mjs` and `bin/solar-triage.mjs`. Test: the
check passes on the current process and fails on a stubbed `'20.20.0'`.

**Done when.** Running any of the three CLIs on Node 20 prints `SOLAR codegen needs Node 22
(.nvmrc); this is 20.20.0` and exits 1 before touching a file.

---

## Bucket 2 — assurance gaps

### 4. Run the oracle in Dark as well

**Why.** The oracle records `mode: {color: light, type: desktop}` only, so neither visual check
measures Dark. Every recipe value is a token name and Dark is token reassignment, so a Dark
defect can only come from Figma binding the wrong variable in a Dark-specific way, or from a
Dark token value. SOLAR's first Dark defect (primary button icons white on white on hover,
design review §8) was found **by eye** in Storybook, which is proof the gap is real.

**Check it out.**

```bash
node -e 'console.log(JSON.parse(require("fs").readFileSync("spec/verify/button.json","utf8")).mode)'
grep -n -i dark packages/codegen/src/verify/oracle.mjs packages/components/test/visual/components.spec.mjs
```

Expected: `{ color: 'light', type: 'desktop' }`; no Dark handling in the oracle or the spec.

**What to change.** `verify/oracle.mjs` `buildOracle` resolves each token through the contract
for one mode; make the mode a parameter and write a second oracle file (`spec/verify/<name>.dark.json`)
or a `modes` block per entry. The comparer (`compare.mjs`) is mode-agnostic. The web spec sets
`data-theme="dark"` on the page for a second pass (the Storybook preview already does exactly
this); the Flutter harness builds under `SolarTheme.dark`. Excuses carry over unchanged, since a
finding is about a binding, not a value.

**Done when.** Both checks run every variant twice, Light and Desktop then Dark and Desktop, and
the design review's §8 defect shows up as a measured difference against Figma's own Dark value
(it will pass, because the code draws what Figma binds; the point is that it is now measured).

**Owner decision.** Whether Mobile type should be measured too (a third pass on the type mode),
or left to the token parity suite.

### 5. Show the excused-difference register in both viewers

**Why.** 1,274 excused entries and 30 open findings are the project's design-debt ledger. Today
they live in `packages/components/test/visual/.out/*-gaps.json`,
`packages/solar_flutter/build/visual/*-gaps.json` and a 1,219-row table in
`spec/deviations.md`. The Storybook tile shows Figma's values as JSON but not what differs, so a
reviewer cannot tell an excused tile from a matching one.

**Check it out.**

```bash
node -e '
const fs=require("fs"); const dir="packages/components/test/visual/.out"; let open=0,dec=0;
for (const n of fs.readdirSync(dir)) if (n.endsWith("-gaps.json"))
  for (const g of JSON.parse(fs.readFileSync(dir+"/"+n,"utf8"))) g.decision?dec++:open++;
console.log({decided:dec, open});'
```

Expected: about 1,244 decided, 30 open (Button 18, Text Input 8, Number Input 3, FileUpload 1).

**What to change.** `packages/components/.storybook/main.ts` `solarData()` already serves the IR
and state tables as `virtual:solar`; add each oracle's `excused` lists and, when present, the
last gap and failure reports. In `packages/components/stories/solar.tsx` `Tile`, badge a variant
with its excused count, colour the badge by whether every excuse has a `decision`, and list each
excused cell with its reason under the "Figma values" details. Mirror it in the Widgetbook app,
which already receives the oracles through `scripts/widgetbook.mjs`.

**Done when.** Opening Button's Variants story shows the 18 open-finding tiles marked, with the
finding text under each; the Storybook and Widgetbook builds in CI still succeed.

---

## Bucket 3 — the developer loop

### 6. A rule proposer, before a live editor

**Why.** The design spec's tweak panel (edit a value, save an overlay rule) is not built and
would need a browser-to-repository write path. Most of its value is choosing the right rule kind
and spelling the address correctly, which is mechanical from data the pipeline already has: the
cell, its class, whether a token of the same value exists, what Figma drew, and which variants
the cell reaches.

**What to change.** First in the CLI: `solar:explain -- "<Name>" --variant … --propose
<layer>.<property>` prints a YAML snippet ready to paste into `spec/overlay/<address>.yaml`:

- an unbound value with a token of the same value → `bind` with `literal` and `token`;
- an unbound value with no token → `allowLiteral` with a reason placeholder that names the
  governance gap;
- an axis finding → `follows` listing the axes the value actually varies with, computed from the
  oracle, or `accept` where it varies with none;
- a cell to change → `set` with the full address and Figma's value as `replaced`.

Implementation in `packages/codegen/src/explain/index.mjs`, next to `lookupCell`, reusing
`tokenNames(contract)` from `normalize/recipe.mjs` for the same-value lookup. Then the same
function behind a button on the Storybook tile (item 5), copying the snippet to the clipboard.

**Done when.** For each of Button's three open findings the proposer prints a snippet that, once
pasted with a reason, builds and changes the oracle's excuse from `decision: null` to the new
rule; a test proves the snippet for a `bind` and for a `set` round-trips through `parseOverlay`.

### 7. `solar:overlay:audit`

**Why.** Named in the design spec §6 and not built. The zero-inset default was found by hand
after 16 overlays had repeated it. With 83 overlays and 24 rule kinds, the next repeated
decision will not be noticed without a tool.

**What to change.** `packages/codegen/bin/solar-overlay-audit.mjs` and
`src/report/overlay-audit.mjs`, reading each built IR's `overlay.rules` (already recorded with
`from`, `rule`, `at`, `reason`). Report: rules with the same kind, cell and value in three or
more components (promotion candidates for `spec/overlay/defaults.yaml`), reasons repeated
verbatim, `allowLiteral` cells whose literal now matches a token (a `bind` candidate after a
token sync), and `set` rules whose `replaced` value no longer appears in Figma (Figma fixed it).

**Done when.** The audit lists the field heights (`root.height` `allowLiteral` in every text
field) and the icon-ladder binds as candidates, and the triage test pins its shape.

### 8. An overlay reference and a glossary

**Why.** The overlay's 24 constructs are documented in one 280-line paragraph of the codegen
README organised by which family added what. An agent or engineer deciding a finding needs a
catalogue: one construct per heading, its fields, one real example from an existing overlay, and
the failure it raises when stale. The prose across the repository uses a consistent house
vocabulary ("the caller's", "as Figma draws it", "hugs", "reaches", "excuses") that is precise
once learned and opaque before.

**What to change.** `spec/overlay/README.md` (hand-written, beside the overlays; nothing under
`docs/` since that is the Figma mirror) with a section per construct in the order
`parseOverlay` applies them, and a glossary. Link it from the codegen README, whose Components
section shrinks to the pipeline's four steps and points at the reference for the constructs.
Keep the family history in the plan's Done notes, where it already is.

**Done when.** Every key `parseOverlay` accepts has a heading with a real example, and
`npx prettier --check` passes on the new file.

---

## Bucket 4 — structural, decide now

### 9. Shells as real files that import a generated module

**Owner decision required.** The owner chose generated shells on 2026-09-24 ("Between F5 and
F6") so that a shared helper's fix and a slot Figma adds reach every component, and so the two
platforms cannot drift unseen. This item argues for keeping those two guarantees by another
means, and reverses that choice, so it needs an explicit yes.

**Why.** Two thirds of the 17,480 descriptor lines are TSX and Dart inside template strings: no
highlighting, no type checking until after a run, escaped backticks, and an option-DSL of about
50 keys across `shells/drawn.mjs`, `field.mjs`, `picker.mjs`, `typed.mjs` and `menu.mjs` to
avoid repeating the strings. F12 Dialogs and Overlays is the family with the most behaviour to
write (portals, focus traps, Escape, focus return) and will be the most expensive place to write
it in strings.

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
  already how `layers.tsx` and `SolarLayers` work. Only the string-assembling helpers
  (`drawnReact`, `drawnFlutter`, `fieldFlutter`…) go away, replaced by runtime helpers where
  they hold logic and by nothing where they only concatenate.

**Done when.** No descriptor has `templates`; `packages/codegen/src/shells/` holds only
`index.mjs`'s owned-shell check and `target.mjs`; every shell typechecks and analyses; both
visual checks and all unit tests pass unchanged; the parity test fails when an IR slot is removed
from a shell.

**Alternative if the owner keeps generated shells.** Move each template to a
`packages/codegen/src/components/<name>.react.tsx.tmpl` and `.flutter.dart.tmpl` file with a
small placeholder syntax, so editors highlight them, and add a step that typechecks the rendered
output before writing it. Cheaper, but the option-DSL stays.

### 10. Stable public names, not Figma layer names

**Why.** Class names (`SolarStatusIndicator-frame3InnerPath`, `SolarTag-iconNone`) and Flutter
keys (`tabItem.counter`) are built from Figma layer names by `namesOf`. A designer renaming a
layer fails the build by design (overlay rules go stale), which is good, but a fix that renames
the layer also renames a CSS hook a consuming app may target with `sx`, which is a silent break
for consumers.

**What to change.** Two name spaces: **public** hooks are slot names and `root` only, stable
across syncs and documented in the components README; **internal** layer classes take a prefix
that says so (`SolarTag--iconNone`) or a stable overlay-given name via `layerNames`. `slotsOf`
in `emit/mui-component.mjs` and `drawnResets` in `shells/drawn.mjs` write the classes; the web
visual spec's `targets` reads the same table, so it follows. Document that internal classes are
not a contract.

**Done when.** The components README lists each component's public hooks; a test asserts every
public hook is a slot or `root`.

### 11. Say in the spec what the system has become

**Owner decision required.** `docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md`
§3 and §13 describe wrapping MUI and Flutter controls, hybrid per component. The corpus says
otherwise:

```bash
grep -l "slots: 'drawn'" packages/codegen/src/components/*.mjs | wc -l   # 67 of 79
grep -hE '^  flutter: ' spec/overlay/*.yaml | wc -l                       # ~15
wc -l packages/solar_flutter/lib/src/*.dart | tail -1                     # ~2,200 hand-written
```

**What to change.** Add a superseded note to §3 and §13, as §5 already has, stating the design as
it is: a layer-tree renderer (`internal/layers.tsx`, `SolarLayers`) that borrows platform
behaviour where it helps (MUI's `ButtonBase`, `InputBase`, `Tab`; Flutter's `FilledButton`,
`TextField`, `RawRadio`). Then two follow-on questions for the owner, recorded there:

- Does MUI 9 plus Emotion still earn its place as a **peer dependency of `@bwp-web/components`**
  for what is mostly `Box`, `ButtonBase` and `InputBase`? If yes, say why (focus and keyboard
  handling, an app already on MUI). If no, the migration is per component and can wait.
- The MUI theme (`packages/styles/src/generated/mui/theme.ts`) holds literal hex so MUI's
  `alpha()` and `darken()` work, while every recipe holds `var(--solar-*)`. Stock MUI widgets
  and SOLAR widgets on one page therefore switch modes by different mechanisms. Decide whether
  MUI's CSS-variables theme mode (`cssVariables: true`) should replace the literals.

---

## Bucket 5 — before publishing 2.0

### 12. Recipe packaging for consumers

**Why.** `@bwp-web/styles/mui` bundles every component's recipe into one module: 840 KB of
source after `npm run build`, most of it repeated `var(--solar-…)` strings. Named ESM exports
tree-shake, but each recipe object is one large literal that a bundler keeps or drops whole, and
an app importing three components pays for the index's re-export graph.

**Check it out.**

```bash
ls -la packages/styles/dist/mui.js 2>/dev/null || (npm run build -w @bwp-web/styles && ls -la packages/styles/dist/mui.js)
wc -l packages/styles/src/generated/mui/components/*.ts | tail -1
```

**What to change.** Per-component subpath exports (`@bwp-web/styles/mui/button`) written by
`emitMuiComponents` into `packages/styles/package.json`'s `exports` and `tsup.config.ts`'s entry
list, or a compact encoding (token name once, `var()` built at call time in `solar<Name>Style`).
Item 1 shrinks the largest recipes first; measure again after it.

**Done when.** An app importing `Button` alone bundles under 60 KB of recipe.

### 13. What git carries

**Owner decision required.** `spec/components/` and `spec/verify/` are 4 MB across 244 derived
files, regenerated and diffed in CI. The stated reason to commit them is that a Figma change
becomes a reviewable diff of the contract, and the viewers read the oracles without a codegen run
(`scripts/widgetbook.mjs`, `.storybook/main.ts`). Both hold. The cost is review noise: a sync
touches thousands of oracle lines. Options: keep both (status quo); keep the IR and rebuild the
oracles in the viewer scripts; or keep both but exclude `spec/verify` from PR review by
`.gitattributes` `linguist-generated`. Recommend the last, since it changes nothing else.

---

## Do not change

These are the parts that make the pipeline better than the alternatives, and every item above is
about making them cheaper to live with:

- The finding model: geometry follows size, paint follows appearance and state, every
  disagreeing variant recorded, never averaged.
- The oracle's independence from the recipe, and the test that scrambles the recipe to prove it.
- A reason on every overlay rule, and a stale rule failing the build.
- `docs/` read-only to the generator, the write guard, and CI's rebuild determinism.
- `solar:explain`, and its test that the lookup resolves to Figma's value in every unexcused
  cell.
- Visual checks that reach states the way a user does, on both platforms, against Figma.

---

## Verification checklist for any item

From the repository root, on Node 22 (`export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`):

```bash
npx vitest run
npm run lint && npm run typecheck && npm run format
npm run solar:rebuild && npm run solar:rebuild && git status --porcelain   # must be empty
npm run test:visual
(cd packages/solar_flutter && flutter analyze && dart format --output=none --set-exit-if-changed lib test variants/lib widgetbook/lib && flutter test)
```

Generated output of every component not named by the item must be byte-identical before and
after. Then stop and report for the owner to review and commit.
