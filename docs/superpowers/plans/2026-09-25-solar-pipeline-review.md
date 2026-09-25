# SOLAR design-to-code pipeline — review and priority backlog

> **For agentic workers:** this is a review with a verified backlog, not an implementation plan.
> The **open items** come first; each has a **Check it out** section: run those commands before
> starting, since the tree moves fast. An item marked **Owner** must not be started until the
> owner has answered. Write each item's own plan with superpowers:writing-plans and carry it out
> with superpowers:subagent-driven-development or superpowers:executing-plans. The **resolved
> items** are kept as a record of what landed and where, so a later reader knows why the code is
> shaped as it is; do not reopen one without new evidence. The repository owner handles all
> version control: no git write commands, ever. "Commit" means stop and report.

**Goal:** make the pipeline cheaper to extend and to correct, and its output easy to adopt,
without weakening the parts that make it trustworthy: the finding model, the oracle's
independence from the recipe, and the reason on every overlay rule.

**Scope:** the generator (`packages/codegen`), its overlays (`spec/overlay`), the shells, the
viewers, the checks, and what a consuming app receives. Not the Figma fetchers, not the token
layer.

**State reviewed.** First at `7579eec` (2026-09-24, F9 done, 79 components). Revised at `21497a6`
(2026-09-25, F10 done, 97 components), which added the comparison with `@biamp/solar-mui` and
bucket 6. Revised again at **`d959c7a` (2026-09-25 16:20)** after four commits of refactoring
carried out most of the backlog: every claim below was re-verified in the code, `npx vitest run`
passes (136 files, 1,884 tests), and the last web and Flutter visual runs (16:14 and 16:16 the
same day) report 0 failures in Light and Dark. Numbers are from `d959c7a`.

## Status at a glance

| #   | Item                                              | State                                                                                   |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 12  | Recipe packaging for consumers                    | **Open.** Unmeasured since the refactor.                                                |
| 14  | Stock-MUI theme from the recipes                  | **Open for the drawn components.** Button and IconButton done.                          |
| 18  | Figma Code Connect and a Figma-ID manifest        | **Open. Owner:** plan tier, and record variant IDs at the next sync.                    |
| 22  | Flutter idiom pass                                | **Open beyond the buttons.** Null callbacks on 16 widgets, themes on 4.                 |
| 23  | Housekeeping the refactor left behind             | **Open.** New: the design spec's status line, the stale `dist`, `SplitButton`'s reason. |
| 1   | Repeated children in the IR                       | Resolved 2026-09-25 (opt-in `repeats`, owner's choice).                                 |
| 2   | Pattern addresses and reason references           | Resolved 2026-09-25.                                                                    |
| 3   | Fail fast on the Node version                     | Resolved 2026-09-25.                                                                    |
| 4   | Oracle in Dark                                    | Resolved 2026-09-25. No Mobile pass, by recommendation.                                 |
| 5   | Excused-difference register in the viewers        | Resolved 2026-09-25.                                                                    |
| 6   | Rule proposer                                     | Resolved 2026-09-25 (`solar:explain --propose`).                                        |
| 7   | `solar:overlay:audit`, and acting on its rows     | Resolved 2026-09-25.                                                                    |
| 8   | Overlay reference and glossary                    | Resolved 2026-09-25.                                                                    |
| 9   | Shells as hand-written files                      | Resolved 2026-09-25 (owner's choice A).                                                 |
| 10  | Stable public class names                         | Resolved 2026-09-25.                                                                    |
| 11  | The spec says what the system is                  | Resolved 2026-09-25. MUI stays the peer dependency (owner).                             |
| 13  | What git carries                                  | Resolved 2026-09-25 (`linguist-generated`, owner's choice C).                           |
| 15  | One mode switch                                   | Resolved 2026-09-25.                                                                    |
| 16  | One-line setup                                    | Resolved 2026-09-25 (`SolarProvider`).                                                  |
| 17  | One vocabulary                                    | Resolved 2026-09-25 (rule 5, owner-confirmed).                                          |
| 19  | Breakpoints, spacing and motion in the MUI theme  | Resolved 2026-09-25.                                                                    |
| 20  | Install the packed packages in a clean app        | Resolved 2026-09-25 (`smoke:install`, in CI).                                           |
| 21  | Parity suite checks reachability, not spelling    | Resolved 2026-09-25 (`api` tables, `shells/api.mjs`).                                   |

---

## Verdict, revised at `d959c7a`

The architecture was right at the first review and is unchanged: one normalizer over the Figma
mirror, independent emitters, an oracle built from Figma layers rather than from the recipe,
rendered checks on both platforms in both modes, deterministic rebuilds in CI, and every human
decision recorded with a reason. The three costs the first review named have each moved:

1. **Repeated children** are modelled by an opt-in `repeats` rule. Date Picker Open went from 145
   layers to 25, its recipe from 2,751 lines to 839, its gaps from 281 to 9 per mode.
2. **Behaviour is in real files.** The 16,400 lines of TSX and Dart inside template strings are
   gone; descriptors fell from 20,169 lines to 3,895 and hold only tables. The shells are
   ordinary code in each platform's language, and the parity suite proves they reach every IR
   prop, slot and icon and draw the generated tree.
3. **Delivery caught up.** One provider, one mode switch, stock MUI reading the same recipes,
   the theme's breakpoints, spacing and motion from tokens, a packed-install smoke test in CI,
   and the excused-difference ledger visible in both viewers. Every React shell reads its props
   through MUI's own `useThemeProps`, so an app themes a SOLAR component as it themes a stock one.

What the refactor did **not** touch, and must not: the oracle is still independent of the
recipe, every overlay rule still needs a reason, `docs/` is still write-guarded, and the open
Figma findings are the same 30 per mode on the same four components.

| Measure (2026-09-25, `d959c7a`)                                              | Value              |
| ---------------------------------------------------------------------------- | ------------------ |
| Components generated (exported) · oracle variants                            | 97 (96) · 1,102    |
| Visual failures, last runs, web and Flutter, Light and Dark                  | 0 · 0              |
| Excused differences, web, both modes: decided · open Figma findings          | 2,697 · 60         |
| Open findings per mode (Button 18, Text Input 8, Number Input 3, FileUpload 1) | 30               |
| Descriptor lines · of them inside template strings                           | 3,895 · 0          |
| Hand-written shells: React TSX · Flutter Dart                                | 13,473 · 12,741    |
| Descriptors with `slots: 'drawn'` (bespoke layer trees)                      | 84 of 97           |
| Hand-written Flutter runtime, `lib/src/*.dart` outside `components`          | ~2,600 lines       |
| Generated MUI recipes                                                        | 40,942 lines       |
| JS tests · Flutter tests (F10 done note)                                     | 1,884 · 463        |

---

## Open items

### 12. Recipe packaging for consumers

**Why.** `@bwp-web/styles/mui` bundles every component's recipe into one module, and
`@bwp-web/components` imports that barrel. Named ESM exports tree-shake, but each recipe object
is one large literal a bundler keeps or drops whole. The last build of `dist/mui.js` (14:52,
before the last two commits) was 1,032 KB. Item 1 shrank the largest recipe, items 9 and 10
added the tree and slot tables to each; the net has not been measured.

**Check it out.**

```bash
npm run build -w @bwp-web/styles && ls -la packages/styles/dist/mui.js
wc -l packages/styles/src/generated/mui/components/*.ts | tail -1
grep -oE "from ?['\"]@bwp-web/styles/mui['\"]" packages/components/dist/index.js | wc -l
```

**What to change.** Per-component subpath exports (`@bwp-web/styles/mui/button`) written by
`emitMuiComponents` into `packages/styles/package.json`'s `exports` and `tsup.config.ts`'s entry
list, with each shell importing its own recipe module; or a compact encoding (token name once,
`var()` built at call time in `solar<Name>Style`). Measure with a real bundler on the smoke app
(`scripts/smoke-install.mjs` already installs the packed packages), not on `dist` alone.

**Done when.** The smoke app importing `Button` alone bundles under 60 KB of recipe, and the
styles README states the per-component entry.

### 14. Stock-MUI theme from the recipes — the drawn components

**Done so far (2026-09-25).** `spec/overlay/mui-theme.yaml` decides which stock MUI components
take a SOLAR recipe, with a reason each; `emit/mui-theme-components.mjs` writes
`theme-components.ts`, `variants` per MUI prop combination from the recipe, restating what MUI's
own variants would change by state. `MuiButton` and `MuiIconButton` are in, and a stock
`<Button variant="outlined">` under the theme passes the Figma check in both modes, as a case of
Button's `prio=secondary` oracle variants.

**What is left.** Every other SOLAR component is drawn (84 of 97), so its recipe's selectors are
our layer classes (`.SolarTag--iconClose`), which MUI's own markup does not have
(`.MuiChip-deleteIcon`). Each needs a hand map from our layers onto MUI's slots in the decision
file, one family at a time, in the order an app is likeliest to reach for the stock component:

1. `MuiChip` (Tag), `MuiBadge` (Counter), `MuiSwitch` (Toggle), `MuiCheckbox`, `MuiRadio`;
2. `MuiTextField` and its parts (Text Input's label, field, helper), `MuiSelect`, `MuiMenuItem`
   (Dropdown Item), `MuiTabs` and `MuiTab`;
3. `MuiAlert`, `MuiTooltip`, `MuiDialog` parts, `MuiCard` parts, `MuiAccordion` parts,
   `MuiTableCell`, as F11 and F12 land.

**Check it out.**

```bash
grep -E '^Mui[A-Za-z]+:' spec/overlay/mui-theme.yaml
grep -c "Mui[A-Z][A-Za-z]*: {" packages/styles/src/generated/mui/theme-components.ts
```

Expected: two keys.

**Keep it honest the way the components are.** Each themed stock component is a case of the SOLAR
component's oracle in the web visual check, so the theme is measured against Figma, never against
our components.

**Done when.** The keys in group 1 and 2 pass the visual check against their SOLAR component's
oracle in both modes, and the styles README's coverage table is generated from the decision file.

### 18. Figma Code Connect and a Figma-ID manifest

**Owner:** two questions before work starts. Is SOLAR Web's library on a Figma Organization or
Enterprise plan (Code Connect publishing needs one)? Should the fetcher record each variant's node
ID at the next `solar:sync`? The fetcher change is in place; the IDs arrive with the sync.

**Why.** A designer in Dev Mode should see our real props, and a rename in Figma should not move a
code name. The IR holds each component set's Figma node (`provenance.figmaNode`), its API and its
`rename` mapping, so a Code Connect template per component is a generator output. A per-variant
manifest needs the variant IDs the raw data does not yet hold.

**Check it out.**

```bash
node -e 'const ir=JSON.parse(require("fs").readFileSync("spec/components/button.json","utf8")); console.log(ir.provenance)'
ls packages/components/codeconnect 2>/dev/null || echo "no Code Connect"
grep -n 'id' docs/solar-web/raw/fetch-rest.mjs | grep -i variant | head -3
```

**What to change.** A `codeconnect` emitter in `packages/codegen/src/emit/` writing
`packages/components/codeconnect/<Name>.figma.tsx` from the IR (the node URL, each axis through
its `api` mapping to the shell's prop, each slot to `figma.instance` or `figma.string`, derived
axes left out); a `manifest` emitter once variant IDs exist; `@figma/code-connect` as a dev
dependency with a `codeconnect:check` script in CI. Publishing stays a deliberate local action.

**Done when.** `figma connect parse` passes for every exported component, and the manifest
resolves every generated component's Figma node to its export name.

### 22. Flutter idiom pass — beyond the buttons

**Done so far (2026-09-25).** Sixteen widgets are disabled by a null `onPressed` or `onChanged`
with a `disabled` getter and no parameter: the buttons, the menu and list rows, the paging
controls, the calendar's day, Checkbox and Toggle. The fields take `enabled` (rule 5). Component
themes exist for the four button widgets (`solar_button_themes.dart`: `SolarButtonThemeData`,
`SolarIconButtonThemeData`, `SolarFABThemeData`, `SolarBackButtonThemeData`, each a
`ThemeExtension` merged over the recipe). `SolarOwnSize` keeps Figma's size in a stretching
layout; `SolarIcon` inherits the icon theme.

**What is left.**

- Slider, Slider Range, Radio and Option Row still take `disabled` beside a callback; the spec
  names them as candidates for the null-callback rule.
- Seven widgets keep both `disabled` and a callback: Accordion, Breadcrumb Item, Card, Counter,
  Status Card, Tab Item and SplitButton. The spec's §8 justifies the cards, Tab Item, Breadcrumb
  Item and Counter as a look of their own. **SplitButton is not named there**; write its reason
  in the spec or apply the rule.
- Component themes for the other wrapped controls (the fields on `TextField`, Radio, Slider), so
  a Flutter app overrides them with `copyWith` as it does the buttons.

**Check it out.**

```bash
for f in packages/solar_flutter/lib/src/components/solar_*.dart; do grep -q 'this.disabled = false' "$f" && grep -q 'onPressed\|onChanged' "$f" && basename "$f"; done
grep -n 'class Solar.*ThemeData' packages/solar_flutter/lib/src/*.dart
```

**Done when.** Every widget with both a `disabled` parameter and a callback is named in the spec's
§8 with a reason; the fields, Radio and Slider have component themes; `flutter analyze` and
`flutter test` pass and the Flutter visual check is unchanged.

### 23. Housekeeping the refactor left behind

Small, no decision needed, and worth doing before F11 so the record matches the code:

- `docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md` line 3 still reads
  "approved in discussion 2026-09-21, not yet implemented". It is implemented through milestone
  4 F10 with the superseded notes inside; say so.
- `packages/styles/dist` and `packages/components/dist` predate the last two commits. Rebuild
  before measuring anything (item 12) or running the smoke install locally.
- The two-libraries spec's §3 evidence table still describes the pre-refactor state (31 widgets,
  97 string-keyed lookups, no `useTheme`, 41 exception tables). Mark it as the baseline it was
  taken from, so a reader does not take it for the current state.
- `SplitButton`'s `disabled` parameter (item 22).

**Done when.** The three documents read true against `d959c7a`, and a rebuilt `dist` is measured
in item 12.

---

## Resolved items — the record

Each entry says what landed and where, so the reason for the code's shape is findable. Verified in
the code at `d959c7a`, not from a status line.

**1. Repeated children.** Owner chose an opt-in overlay rule over an automatic normalizer rule:
`repeats: { <first layer, or a pattern of firsts>: { reason } }` (`repeatLayers` in
`normalize/overlay.mjs`, `withoutRepeats` in the oracle, reference in `spec/overlay/README.md`).
The first sibling stands for the copies and the IR marks it `repeat: <count>`; the copies are no
layers, so recipe, oracle and tree carry one. Date Picker Open: 145 layers to 25, recipe 2,751 to
839 lines, 9 gaps per mode; no other component's output moved. F11's rows and F13's calendar parts
opt in the same way.

**2. Pattern addresses and reason references.** A rule's layer may be a pattern
(`dayGridDayCell*.base.width`), a full address wins over a pattern on the same cell, a pattern
matching nothing fails as a stale rule does, and a reason may be another rule's
(`reason: { as: "set root.base.width" }`), replaced by that rule's text in the IR. 327 numbered
rules folded; generated output unchanged.

**3. Node version.** `util/node-version.mjs` reads `.nvmrc`; `util/require-node.mjs` is the first
import of every CLI under `packages/codegen/bin/`.

**4. Oracle in Dark.** Each oracle variant carries `dark`, what Dark draws otherwise and its
excuses; both checks run every variant in both modes (`withDark` in the oracle, `inMode` in the
web spec, `_dark` in the Flutter harness); gap reports per mode. No Mobile type pass, by
recommendation: every recipe reads type through `var(--solar-type-*)`, which one media query in
`tokens.css` reassigns, and the Light pass proves each component reads the variable.

**5. Excused-difference register.** Storybook and Widgetbook badge each variant with its excused
count, coloured by whether every excuse has a decision, list each excused cell with its reason,
mark Dark-only excuses, and show the last check's failures (`stories/solar.tsx`, `virtual:solar`).

**6. Rule proposer.** `npm run solar:explain -- "<Name>" [--variant …] --propose <layer>.<cell>`
prints the overlay rule that decides a cell (`bind`, `allowLiteral`, `follows` with the axes the
value varies with, `set` with `replaced`, or `accept`), reasons left as `TODO(reason)`, which the
build refuses until a person writes one (`explain/propose.mjs`).

**7. Overlay audit, and its rows.** `npm run solar:overlay:audit` (`report/overlay-audit.mjs`)
lists decisions repeated across three or more components, verbatim reasons, `allowLiteral` cells
whose literal now matches a token, and `set` rules Figma no longer needs. Its first rows were
answered in `spec/overlay/README.md`, "Beside the overlays": which repeated decisions are defaults
and which are not, with reasons (the focus ring is not, since the fields draw theirs on the
field). One idle `set` it found in Date Picker Open was deleted and its finding reopened for SOLAR.

**8. Overlay reference.** `spec/overlay/README.md`: a heading per rule kind in the order they
apply, addresses, patterns, reason references, `defaults.yaml`, `excluded.yaml`, a glossary.

**9. Shells as hand-written files.** Owner chose A. Every shell (96 per platform) is a hand-written
file, taken over exactly as its template last rendered it; no descriptor has `templates` and the
index refuses one. `src/shells/` holds the story writer and shell-exists check (`index.mjs`), the
API mapping (`api.mjs`) and the icon analysis (`icons.mjs`). Generated beside each recipe and
imported by the shells: `solar<Name>Tree`, `solar<Name>Slots`, `Solar<Name>Recipe.tree`. The
parity suite fails a shell that leaves an IR prop, slot or icon unreached, copies the tree, or does
not read its props through the theme.

**10. Class names.** `util/classes.mjs`: a slot's layer carries `Solar<Name>-<slot>` (public,
stable across syncs), every other layer `Solar<Name>--<layer>` (internal, Figma's name, not a
contract). The recipe and the visual check share the table.

**11. The spec says what the system is.** The design spec's §3 and §13 describe a layer-tree
renderer borrowing platform behaviour; §5 says shells are hand-written. Owner: MUI 9 stays the
peer dependency of `@bwp-web/components`.

**13. Git.** Owner chose C: `.gitattributes` marks `spec/verify/**` `linguist-generated`; still
committed and diffed by CI.

**15. One mode switch.** The MUI theme uses `cssVariables: { colorSchemeSelector: '[data-theme="%s"]' }`
with `colorSchemes.light` and `.dark`, so `data-theme="dark"` on any element switches stock MUI
and SOLAR components together. Palette values stay literal per scheme, since MUI derives
channels and shades from them.

**16. One-line setup.** `SolarProvider` in `@bwp-web/components`: the SOLAR theme in a
`ThemeProvider`, built once, merging an app's own options; the components README's first snippet.

**17. One vocabulary.** Rule 5 of the two-libraries spec, owner-confirmed: SOLAR's word where
SOLAR's description names the thing (`helper`, `mandatory`, a Button's `prio`, Button Group's
`type`), otherwise MUI's on the web and Flutter's in Flutter (a field's `enabled`, a button's null
`onPressed`). One exception: Figma's `style` is `variant` in code, since React reserves `style`;
the design review asks Figma to rename it.

**19. Breakpoints, spacing and motion.** `solarMuiBreakpoints`, `solarMuiSpacing` and
`solarMuiTransitions` in the theme, from the viewport, inset and motion tokens; `sm` is the width
the Mobile type switches at.

**20. Packed install.** `npm run smoke:install` (`scripts/smoke-install.mjs`) packs the three
packages, installs them into a clean app and renders components on the server; `main.yml` runs it
after the build.

**21. Parity by reachability.** Each descriptor's `api` table, `{ react: {…}, flutter: {…} }`,
says how a platform reaches an IR prop or slot where not by its own name (`value: 'controller'`,
`disabled: { not: 'enabled' }`, `checked: { group: 'RadioGroup' }`), resolved by
`shells/api.mjs` with each platform's conventions as defaults. The suite proves every IR prop and
slot reachable, keeps defaults shared (they are Figma's), refuses a mapping of what the IR does
not name, and has tests for a missing member failing and a different spelling passing.

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
- The two-libraries decision: share the IR and the rendering model, not API spellings or
  platform mechanisms ([spec](../specs/2026-09-25-two-libraries-one-contract.md)).

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
transparent). Its icon set is ours: 340 icons and the same three logo families. Its manifest
labels both of Support's variants "solid"; our fetch reads them as `solid=false` and
`solid=true`, so the duplicate is not in our data.

The table records the comparison as it stood at `21497a6`, and in the last column what has
changed since.

| Aspect                       | `@biamp/solar-mui`                                                                                                                                  | Ours at `21497a6`                                                                                                    | At `d959c7a`                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Setup                        | `createSolarTheme()` in a `ThemeProvider`.                                                                                                          | Two stylesheets, a theme call, component imports.                                                                    | `SolarProvider` plus the two stylesheets (item 16).                                       |
| API                          | Native MUI props; MUI's docs are the docs.                                                                                                          | Props from Figma's vocabulary, two spellings at once.                                                                | One rule: SOLAR's word where SOLAR names it, else the platform's (item 17).               |
| Stock MUI components         | Themed for 49 keys, including Dialog, Table, Tooltip, Card, Accordion.                                                                              | Palette, shape, z-index and typography only.                                                                         | `MuiButton` and `MuiIconButton` from the recipes, Figma-checked; the rest open (item 14). |
| Breakpoints, spacing, motion | From the viewport, inset and motion tokens.                                                                                                         | MUI's defaults.                                                                                                      | From the tokens (item 19).                                                                |
| Install check                | The packed archive installed in a clean app, React 18, server rendering.                                                                            | `package.json` checks only.                                                                                          | `smoke:install` in CI (item 20).                                                          |
| Dark mode                    | A second theme object; JS only.                                                                                                                     | `data-theme` for SOLAR components, `palette.mode` for stock MUI.                                                     | One switch, `data-theme`, for both (item 15).                                             |
| Coverage of SOLAR Web        | About 39 names mapped onto about 30 MUI components; SOLAR-only components absent or approximated (Counter as `Badge`, round Icon Button via `sx`). | 97 of 132 generated, including everything MUI lacks.                                                                 | Unchanged; F11 to F14 next.                                                               |
| Fidelity                     | Hand-encoded heuristics (`action()`, `hairline = 0.6`, about 60 raw pixel literals, a fixed `2px solid` focus outline).                             | Measured per variant against Figma layers: 1,102 variants, two platforms, two modes, 0 failures, every difference excused by a named finding. | Unchanged.                                                       |
| Figma's own mistakes         | Not caught: the Tabs indicator is 1 px where Figma draws the selected underline 2 px.                                                                | Caught as a finding, decided in `tab-item.yaml`; 2 px as Figma draws it.                                             | Unchanged.                                                                                |
| Text tracking                | One rule: body and label at `-0.02em`, titles at `-0.03em`.                                                                                         | Each text style as Figma authors it (`body/md` is a fixed `-0.32px`, not `-2%`).                                    | Unchanged.                                                                                |
| Change flow                  | Someone re-reads Figma and edits `theme.js`.                                                                                                        | `solar:sync`, `solar:codegen`.                                                                                       | Unchanged.                                                                                |
| Icons                        | MUI `SvgIcon`; needs MUI. Figma-ID manifest.                                                                                                        | Plain `<svg>`, `size` from the `icon.*` ladder, `title`; no MUI needed; 1.5 KB per icon. No manifest.               | Manifest open (item 18).                                                                  |
| Figma Code Connect           | Templates for 26 components.                                                                                                                        | None.                                                                                                                | Open (item 18).                                                                           |
| Bundle                       | 30 KB theme, per-icon deep imports.                                                                                                                 | 1 MB recipe module.                                                                                                  | Unmeasured since the refactor (item 12).                                                  |
| Accessibility                | MUI's defaults plus a focus outline.                                                                                                                | 44 px targets on every control, names required or warned, roles per shell.                                           | Unchanged.                                                                                |
| Flutter                      | None.                                                                                                                                               | Full parity.                                                                                                         | Unchanged, now platform-idiomatic for the buttons (item 22).                              |

**Reading.** The generation side of ours was correct and ahead at the first comparison; the
delivery side has since taken their strengths (one setup, one switch, stock MUI from the recipes,
a packed install) without their method. Their theme is fast to write and impossible to keep
honest, which is the drift our pipeline exists to prevent.

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
npm run build && npm run smoke:install
```

Generated output of every component not named by the item must be byte-identical before and
after. Then stop and report for the owner to review and commit.
