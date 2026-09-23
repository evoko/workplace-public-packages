# Milestone 3a — the component spine, proven on Button

Builds the whole chain from Figma component data to a styled component on two platforms, on one
component only: the component IR, the overlay, the MUI and Flutter recipe emitters, one-time shell
scaffolding, and API parity.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md), milestone 3,
sections 4.2 (component IR), 4.3 (overlay), 5 (emitters) and 7 (parity).

Milestone 3 is split into three plans because it commits to eleven distinct mechanisms and the
spec rates it high risk. This is the first:

| Plan   | Covers                                                                   |
| ------ | ------------------------------------------------------------------------ |
| **3a** | IR, overlay, both recipe emitters, scaffolding, API parity — Button only |
| 3b     | The other six components, and visual parity against Figma as the oracle  |
| 3c     | The developer loop: Storybook tweak panel, `explain`, `adopt`, `audit`   |

Button is deliberately the hardest case: 108 variants, four axes, seven slots, three composed
children, a boolean `danger` axis and a `loading` state. If the architecture survives Button it
survives the rest, and a design flaw shows up now rather than after six easy components.

## What the source data gives us, measured

The recipe is derivable **in token names, not values**, which is the finding that makes this
milestone possible. `docs/solar-web/raw/components/buttons/button.json` carries:

- **`defaultVariantTree`** — the full layer tree of the default variant, with `fills`, `strokes`,
  `effectStyle`, `radius`, `strokeWeight`, `layout` and, crucially, a **`vars`** map binding each
  geometric property to its Figma variable:

  ```
  radius: 6         vars.topLeftRadius   → Spatial:radius/control
  strokeWeight: 1   vars.strokeTopWeight → Spatial:border/default
  layout.gap: 8     vars.itemSpacing     → Spatial:inset/xs
  layout.pad        vars.paddingLeft     → Spatial:inset/sm
  ```

- **`variants[].overrides.changed[layerPath]`** — a structured per-layer diff against that tree.
  107 of Button's 108 variants carry one; the default carries none by definition.
- **`axes`**, **`props`**, **`slots`** and **`composes`** in `catalog.json` — the public API,
  the boolean and instance-swap props, and the child components.

**Read the layer tree and the per-layer overrides, never the flat `fills`/`textFills` arrays on a
variant.** Those arrays aggregate every layer in the variant, so they change when a child's
visibility changes and look non-orthogonal when nothing about the button's own colour moved. That
mistake costs an afternoon; it cost one here.

## The axis model, and how far the data actually supports it

Resolving all 108 variants and asking which axes each layer property genuinely depends on:

| Layer property                                     | Varies with               | Reading      |
| -------------------------------------------------- | ------------------------- | ------------ |
| `/.strokes`                                        | prio, state, danger       | as designed  |
| `/.layout`, `/.radius`, `/.strokeWeight`, `/.vars` | size                      | as designed  |
| `/Label.size`                                      | size                      | as designed  |
| `/Counter.fills`, `/Counter.variant`               | prio, state               | as designed  |
| `/Label.textStyle`, `/Label.vars`                  | size + prio, state, danger | partly wrong |
| `/.fills`, `/.effectStyle`, `/Label.fills`         | **size**, prio, state, danger | wrong    |

So the intended model holds — **geometry follows `size`, colour follows `prio` / `state` /
`danger`** — but the file does not obey it everywhere. Two confirmed examples:

- `secondary / default / false` has `fills: null` at `size=sm` and
  `{Color:action/secondary/bg/default}` at `md` and `xl`. The small secondary button has no
  background. Almost certainly a cleared fill, not a decision.
- `effectStyle` is `shadow/control` at `md` and `sm` and absent at `xl`, across every prio.

**The normalizer must not average these away.** It derives each recipe entry by holding the
non-relevant axes at their defaults, then checks every other combination agrees, and records a
deviation naming the exact variant where one does not. A disagreement is either a Figma mistake or
a real axis interaction, and both need a human. Expect Button to produce several on day one; they
are findings for the design review, not bugs in the generator.

## Decisions taken

| Question                                    | Decision                                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What happens to Figma's `state` axis?       | Demoted, per spec §4.2. `hover`, `pressed` and `focus` become platform states — CSS pseudo-classes, Flutter `WidgetState`. `disabled` and `loading` stay **props**, because neither is something the platform derives on its own. |
| What is the public API?                     | `prio` is renamed to `variant` in the overlay, matching the spec's own example. `size` and `danger` keep their names.                                                                                                           |
| Wrap MUI or build our own?                  | Recorded per component in the overlay, not decided globally. Button starts as a wrap of MUI `Button` and Flutter `FilledButton`; if the recipe cannot express what SOLAR draws, the overlay flips it to bespoke and says why.    |
| Where does the recipe live?                 | `spec/components/<name>.json`, beside `spec/tokens.json` and `spec/icons.json`, and guarded the same way — the committed file must equal what the emitters were handed.                                                          |
| How does a web recipe reference a token?    | As `var(--solar-*)`, the way the Tailwind preset already does, never as a resolved literal. `tokens.css` is then the one runtime source: a `[data-theme='dark']` subtree re-themes an MUI Button with no JavaScript, and there is one dark-mode switch rather than MUI's `palette.mode` beside `data-theme`. The MUI *theme palette* stays literal, because MUI runs `alpha()` and `darken()` on it; the recipe does not go through the palette. |
| Is Button `xl` a size?                      | Yes, kept as `size="xl"` as Figma has it (owner, 2026-09-23). Its fixed 200px width, square corners, no border and no shadow are recorded in the overlay as intentional, and raised with SOLAR to confirm. |
| Tertiary hover's link style                 | Follow Figma exactly (owner, 2026-09-23), including `xl` using `link/md/default` and danger not switching. The overlay declares that `Label.typography` follows `prio`, `state` and `danger` as well as `size`, so the recipe reproduces every variant as drawn and those cells stop being deviations. The inconsistency is still raised with SOLAR. |
| Heights with no token                       | Carried as literals (owner, 2026-09-23): the one explicit exemption from "every value is a token", listed in the overlay, each tied to its governance deviation. Task 8's parity rule allows exactly the overlay-listed literals and nothing else. |
| Are shells generated?                       | Scaffolded **once**, then owned by developers forever. The recipe beside them regenerates every run. This is the boundary that lets a look change flow in without ever clobbering behaviour.                                     |

## Notes for whoever executes this

- **The repository owner handles all version control.** No git write commands.
- `docs/` is read-only to the generator. `writeGenerated` enforces it.
- Node 22, Flutter pinned 3.24.4. Latest stable for anything new, with the milestone-1 caps.
- Run `npm run solar:codegen` and commit its output after touching the generator.
- The CLI is built from stage modules (`src/stages/`). The component stage in Task 9 is a third
  module exporting `name`, `build()` and `emit()`, not new inline code in the CLI.
- The CLI prunes whatever it did not write under the three generated directories. A component
  output that moves or is renamed therefore disappears from its old path on the next run, which
  is intended.
- The MUI theme already fills MUI's palette slots and built-in variants from SOLAR (the
  `mui.theme` deviation), so an unstyled MUI `Button` renders as SOLAR primary before Task 5
  adds anything. The recipe overrides what differs; it does not have to replace MUI's defaults.
- Flutter has `SolarTheme.resolve(brightness:, width:)`, which switches to the Mobile type scale
  below `viewport.sm`. Task 6 reads the label style from the ambient `SolarTheme`, never from
  `SolarTypography.desktop` directly, so Button follows the viewport on both platforms.

---

### Task 1: Resolve variants into a layer model

**Files:** create `packages/codegen/src/normalize/component-layers.mjs` and its test.

`resolveVariants(componentSet)` returns, for every variant, a map of layer path to resolved
properties: start from `defaultVariantTree`, apply `overrides.changed`, keep `vars` alongside the
literal values so a token name survives to the recipe.

Tests on Button: 108 variants; the default resolves to the tree unchanged; `/` on
`prio=secondary` carries the secondary background; a layer that no override touches keeps the
tree's value; `vars` survives resolution.

Run: `npx vitest run packages/codegen/test/component-layers.test.mjs`

**Done 2026-09-23.** Resolution inverts the fetcher's diff rule for rule, and it throws on
anything it cannot trust: a changed or removed path the default tree lacks, a variant name that
is not one value per axis, a duplicate combination, a default variant with overrides, or a
truncated set. Paths come from walking the tree, never from splitting a string, because layer
names contain `/` themselves (`Icon/None`). Run over the whole corpus, all 119 component sets
resolve without an error.

**Found for 3b:** 58 of those 119 sets have variants that _add_ a layer, and the fetcher records
an added layer by path alone, with none of its properties (`overrides.added`). They resolve as
`{unresolved: 'added'}` and are listed per variant, so nothing mistakes an unknown layer for an
empty one; Button has none. Before 3b the Web fetcher must carry an added layer's subtree, which
needs one `solar:sync` after the change.

---

### Task 2: Classify axes and derive the recipe

**Files:** create `packages/codegen/src/normalize/recipe.mjs` and its test.

For each layer property, determine which axes it depends on, then emit
`base` + `size.<v>` + `variant.<v>.<state>` entries, preferring the token name from `vars` over the
literal value. Every entry must carry provenance: the variant it was read from.

Then **verify**: for each derived entry, check every other axis combination agrees. Collect
disagreements as deviations of the shape already used by `ICON_DEVIATIONS`, naming the layer,
property and the exact variant.

Tests: the recipe's `base.radius` is `radius.control`, not `6px`; `size.sm` carries its own
padding; `variant.primary.hover` reads the hover background; the `fills: null` at
`secondary / sm` is reported as a deviation rather than silently winning; a synthetic orthogonal
component produces no deviations.

**Done 2026-09-23.** `deriveRecipe(resolved, {names, roles?})` in `src/normalize/recipe.mjs`.
Each layer contributes style cells (`background`, `paddingLeft`, `typography`, `present`, …),
each classed as geometry (follows the `size` role) or paint (follows `appearance` and `state`).
Roles default by axis name and can be given explicitly, which is what the overlay will do. The
recipe is `style[layer].base`, `.size[<v>]` and `.appearance[<combo>][<state>]`, each entry a
`{token}`, `{keyword}`, `{none}` or `{literal}` with `from` naming the variant it was read from.
A composed child contributes only its variant choice, presence and extent; its own padding and
colour belong to its own recipe. Token names resolve only through the contract, never by
spelling (`tokenNames`).

Button produces **14 deviations**, and they are real:

| Kind    | Finding                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------- |
| axis    | `root.background` at `sm`: secondary loses its background in 8 variants                             |
| axis    | `root.background` at `xl`: tertiary gains one, secondary hover loses one (9 variants)               |
| axis    | `root.shadow` at `xl`: absent in all 20 primary and secondary variants — one finding, not twenty    |
| axis    | `Label.color` at `xl`: secondary disabled borrows the _danger_ disabled colour (1 variant)          |
| axis    | `Label.typography`: tertiary hover switches to a link style, and `xl` picks `link/md/default`       |
| axis    | `Label.typography`: `xl` secondary hover uses `link/md/default` too                                 |
| unbound | `root.height` 40/32/48 — SOLAR publishes **no control height token**, a governance gap              |
| unbound | `root.paddingTop`/`paddingBottom` 0, which equals `inset.none` but is not bound to it               |
| unbound | `root.gap` 12 and `root.width` 200 at `xl`                                                          |
| unbound | the icon and counter heights (16, 20)                                                               |

`xl` is a different kind of button rather than a larger one: fixed 200 wide, `SPACE_BETWEEN`,
radius and border `none`, no shadow. That is why several `xl` findings are systematic, and it is
a question for the design review before Task 4 decides what the overlay says about it.

**Found for 3b**, from running it over the whole corpus: 116 of 119 sets derive. Three throw by
design on shapes the recipe does not model yet — per-side border or radius bindings (Weekday
Header, Popover) and two stacked paints (Insight Card). Thirteen sets have sparse variant
matrices (Avatar has 114 of 540); a missing defining variant is read from the first one Figma
does have and reported as `sparse`. The corpus yields about 1,300 unbound values and 950 axis
disagreements, so 3b needs the report grouped per component rather than one row each.

---

### Task 3: The component IR

**Files:** create `packages/codegen/src/normalize/components.mjs`, its test, extend
`packages/codegen/test/spec.test.mjs`.

`buildComponentSpec(catalog, raw)` produces the §4.2 shape: `component`, `base`, `api`, `states`,
`slots`, `style`, `provenance`. Written to `spec/components/button.json` by the CLI in Task 9, and
guarded by `spec.test.mjs` the way the token and icon specs are.

**Done 2026-09-23**, with three changes from the text below:

- The IR keeps Figma's axis name, so it is `api.prio`, not `api.variant`: renaming is the
  overlay's job (Task 4), and baking it in here would leave the overlay nothing to state.
- The component stage (`src/stages/components.mjs`) exists now rather than in Task 9, because
  the spec guard needs `spec/components/button.json` on disk. It writes the IR, folds the 14
  Button deviations into `spec/deviations.md` under the IR's layer names (`iconTrailing`, not
  `Icon/None#2`), and `spec/components/` is pruned with the other generated directories. Tasks
  5 and 6 add their emitters to it; Task 9 is left with `solar:scaffold`.
- Slots come from the layer tree's `propRefs`, not the catalog's `slots` list, which names
  both icon slots `Icon/None` and cannot tell leading from trailing.

Button's IR: `api` is `size`, `prio`, `danger` (boolean), `disabled` and `loading` (booleans
promoted from the state axis); `states` is `default, hover, pressed, focus`; four slots
(`iconLeading`, `label`, `iconTrailing`, `counter`) driven by the seven Figma props; layers
named `root`, `iconLeading`, `spinner`, `label`, `iconTrailing`, `counter`.

**Figma contradicts itself here**, and the IR keeps both sides under `docs`: Button's own
description says 96 variants, sizes `xs 28 / sm 36 / md 44 / lg 48`, and four states, while the
set has 108 variants, sizes `md 40 / sm 32 / xl 48`, and six states. The variants win. The same
description says focus is `shadow/focus/*` applied on `:focus-visible`, which agrees with
demoting `focus` to a platform state.

Tests: `api.variant` has the three prio values with `primary` as default; `api.size` is
`md | sm | xl` defaulting to `md`; `states` excludes `disabled` and `loading`, which appear in
`api` instead; `slots` names the seven from the catalog.

---

### Task 4: The overlay

**Files:** create `packages/codegen/src/normalize/overlay.mjs`, its test, and
`spec/overlay/button.yaml`.

Loads and merges the hand-written overlay over the IR: `base`, `api.rename`, `style` setters and
`deviations`. Merging is explicit and order-independent, and every overlay rule must name a
`reason`, because an unexplained override is how a design system drifts.

The overlay must also be able to say **which axes one cell follows** (`follows: [size, prio,
state, danger]` on `Label.typography`), passed to `deriveRecipe` as a per-cell override of the
role model, and **which literals are allowed** (Button's heights). Both carry a `reason`.

**Done 2026-09-23.** `src/normalize/overlay.mjs` and `spec/overlay/button.yaml`. Sections:
`base`, `rename`, `follows`, `bind` (a literal to the token of the same value, refused if the
values differ), `set` (one entry at an explicit address), `allowLiteral` and `accept` (a named
deviation). Addresses use Figma's axis names and `rename` applies last, which is what makes the
result order-independent. `follows` is applied before the recipe is derived, the rest after; a
cell that follows `size` and the paint axes lands in a new `combined` section of the recipe.
A decided deviation stays in `spec/deviations.md` with the ruling beside it. The parser is
`yaml` 2.9.1, which rejects a duplicated rule.

Button's overlay carries the three owner decisions, the plan's base (`Button` / `FilledButton`)
and rename, plus four rules taken on the owner's behalf and flagged for review: `bind` vertical
padding 0 to `inset.none`, xl's gap 12 to `inset.sm` and the icon heights 16 to `icon.sm` (all
same-value); and `allowLiteral` for xl's fixed width 200 and the counter height 20, by analogy
with the height decision. Button now reports 12 findings, 9 of them decided. The three left open
are genuine Figma defects: secondary losing its background at sm, the mixed background changes
at xl, and the xl disabled label borrowing the danger colour.

Tests: the `prio → variant` rename reaches the IR; a `follows` override makes tertiary hover's
link style a recipe entry rather than a deviation; a literal the overlay does not list still
fails; an overlay style setter wins over the derived
value and is marked as overlay-sourced in provenance; a rule without a reason fails loudly; an
overlay naming a property the IR does not have fails rather than being ignored.

---

### Task 5: MUI recipe emitter

**Files:** create `packages/codegen/src/emit/mui-component.mjs` and its test.

Writes `packages/styles/src/generated/mui/components/button.ts`: the recipe as plain data plus the
prop types, importing nothing from MUI, exactly as the token theme does. States render as the
pseudo-selectors MUI's `styleOverrides` expects.

Every token reference is emitted as `var(--solar-…)`, per the decision above; a value in the recipe
that is not one is a failure, not a fallback.

**Done 2026-09-23.** `src/emit/mui-component.mjs` writes
`packages/styles/src/generated/mui/components/button.ts`, exported from `@bwp-web/styles`:
`SolarButtonProps` and the value unions, `solarButtonDefaults`, `solarButtonStyles` (`root`,
`sizes`, `appearances`, `combined`), `solarButtonComposition` (what the shell renders rather
than styles: presence and child variants), and `solarButtonStyle(props)`, a pure resolver for
`sx` or `styleOverrides.root`. `MUI_SLOTS` places each IR layer in MUI's DOM and
`STATE_SELECTORS` maps states to MUI's classes, with disabled last so it wins at equal
specificity. A text style expands into the custom properties it is made of.

**Verified by rendering, not just by the suite:** real MUI 9 Buttons given
`sx={solarButtonStyle(…)}`, measured in headless Chrome with `tokens.css` loaded. Primary is
`#111111` on white text, 6px radius, 40px tall, 12px padding, Inter 14px with the control
shadow; `sm` is 32px with 8px padding; `xl` is 200px wide, square and flat but keeps a 2px focus
ring; tertiary is transparent; disabled is `#e0e0e0`; and inside a `[data-theme='dark']`
subtree primary flips to `#f5f5f5` with no JavaScript.

**That render caught a Task 4 mistake.** The xl decision was first written as `accept` of the
xl shadow deviation, and `accept` keeps the recipe's value, so xl rendered _with_ a shadow —
the opposite of the decision. It is now `follows: root.shadow` over all four axes, so xl draws
what Figma draws. The two rules are documented as not interchangeable. Figma draws xl's focus
ring, so following it keeps the WCAG focus floor.

The icon colour is not in the layer tree (icons are instances, and the fetcher does not descend
into one), so the recipe reads it from each variant's `iconFills` digest as a root-level
`iconColor` cell, which MUI draws on both icon slots. It throws if a variant ever has more than
one icon paint.

**A data gap this surfaced, and the owner's decision cannot be fully honoured until it is
closed:** no text style in our data carries `textDecoration`. Neither the Foundations capture
(`capture-variables.js`) nor the Web fetcher records it, so `link/md/hover` differs from
`label/md` only by 0.04px of letter spacing, and the underline — the visible part of tertiary
hover's link style — is lost. Nothing is invented in its place.

**Fix coded 2026-09-23, awaiting one `solar:sync`.** Fixed at the source, per the owner, so every
consumer of `typography.link.*` gets it, not only the Button recipe. The Foundations fetcher now
reads each text style's own node over REST into `docs/solar/raw/text-styles.json`
(`textDecoration`, `textCase`, and the sizes to cross-check); `capture-variables.js` records the
two properties from now on; `build-derived.mjs` merges them into `css-contract.json` and stops
if the two sources disagree. The spec carries them under the typography token's `$extensions`;
the MUI theme, the Button recipe (explicit `text-decoration: none` at rest, so leaving hover
undoes it), Flutter (`decoration: TextDecoration.underline`) and parity all read them, through
one mapping in `src/emit/text-features.mjs`. A text case Flutter cannot apply is recorded as a
deviation when the data uses one. Until the sync writes the file, everything is inert and the
generated output is byte-identical; `test/text-features.test.mjs` proves the path on a
synthetic contract.

Tests: every value is a `var(--solar-…)` reference naming a token that exists in `tokens.css`,
never a literal — the same contract the token emitters hold; the three variants and three sizes
are present; `disabled` and `loading` appear as props and `hover` does not.

---

### Task 5b: Ship SOLAR's fonts

Added 2026-09-23 at the owner's request: a consumer of the design system should not have to find
and load the fonts themselves.

The text styles use three families, all SIL OFL 1.1 and so free to bundle with the licence
alongside: **Inter** 400/500/600/700 (40 styles), **Montserrat** 500/600 (the 5 display styles;
SOLAR's open substitute for Gotham) and **IBM Plex Mono** 500 (the 2 code styles). **Gotham is
not shipped**: it is commercially licensed and this repository and its packages are public, and
no text style uses it. Open Sans and Roboto Mono are SOLAR's named fallbacks and are used by no
style, so they appear only in the fallback stacks, not as files.

**Files:** modify `packages/styles/package.json` and the build, add `packages/styles/src/fonts.css`;
modify `packages/codegen/src/normalize/tokens.mjs` (stacks), `src/emit/flutter.mjs`
(`package:`), `packages/solar_flutter/pubspec.yaml`; add `packages/solar_flutter/fonts/`.

- **Web, no manual download:** `@fontsource-variable/inter`, `@fontsource-variable/montserrat`
  and `@fontsource/ibm-plex-mono` (500) as dependencies of `@bwp-web/styles`, and a
  `@bwp-web/styles/fonts.css` export that imports them, listed in `sideEffects` like
  `tokens.css`. Fontsource ships WOFF2 per unicode range, so a page downloads only the scripts it
  uses.
- **Fallback stacks:** the font-family tokens are bare names today (`Inter`), so a font that
  fails to load falls to the browser default, usually Times. Emit SOLAR's own stacks: Inter →
  `"Open Sans"` → `system-ui, sans-serif`; Montserrat → `system-ui, sans-serif`; IBM Plex Mono →
  `"Roboto Mono"` → `ui-monospace, monospace`.
- **Flutter, one manual download by the owner:** TTFs, because Flutter cannot read WOFF2 —
  Inter 4.1 static Regular/Medium/SemiBold/Bold (rsms/inter releases, `extras/ttf/`), Montserrat
  Medium/SemiBold (JulietaUla/Montserrat, `fonts/ttf/`), IBM Plex Mono Medium (IBM/plex releases)
  — each with its licence file, into `packages/solar_flutter/fonts/<family>/`, declared under
  `flutter: fonts:` in the pubspec. The generated `TextStyle`s gain `package: 'solar_flutter'`,
  without which Flutter does not find a font bundled in a package.

**Done 2026-09-23.** Fontsource 5.3.0 static packages rather than the variable ones, because the
variable packages register the family as `Inter Variable` and SOLAR's tokens say `Inter`. The
Flutter TTFs were downloaded from the releases above (Inter 4.1, Montserrat 7.222, IBM Plex
Mono 2.5.0), licences checked as OFL 1.1, checksums in `packages/solar_flutter/fonts/README.md`;
2.3 MB in all. The stacks live in `src/emit/fonts.mjs`, which also reads the pubspec's `fonts:`
so the Flutter emitter fails if a text style uses a family or weight with no bundled file.
Parity compares a stack by its first family. `solarFontPackage` is exported for styles built from
`SolarFont` by hand.

Verified beyond the suite: `import '@bwp-web/styles/fonts.css'` bundles under webpack 5 and
esbuild (43 `@font-face`, 43 WOFF2 each); in headless Chrome all three families load and only the
used weights are fetched; in `flutter test` each generated style resolves to
`packages/solar_flutter/<family>` and the bundled file loaded under that key changes layout.

Tests: `fonts.css` survives tree shaking (the packaging test); every font-family token ends in a
generic family; every weight a text style uses has a file (web: the Fontsource weights; Flutter:
a pubspec entry per family and weight); `flutter test` renders a Text in each family without
falling back. Then compare a rendered label against Figma by eye once: Figma bundles its own Inter
and the versions may differ.

---

### Task 6: Flutter recipe emitter

**Files:** create `packages/codegen/src/emit/flutter-component.mjs`, its test, and a Dart test.

Writes `packages/solar_flutter/lib/src/generated/components/button.dart`: the recipe as a `const`
structure plus a `WidgetStateProperty` resolver, so hover, pressed, focus and disabled resolve the
way Flutter expects rather than through an if-ladder in the widget.

**Done 2026-09-23.** `src/emit/flutter-component.mjs` writes
`packages/solar_flutter/lib/src/generated/components/button.dart`: `SolarButtonVariant`,
`SolarButtonSize`, `SolarButtonProps`, and `SolarButtonRecipe` — the IR as a `const` map of token
*names*, a `lookup` applying the IR's precedence, typed converters (`color`, `shadow`,
`dimension`, `textStyle`, `present`) whose switches reach the theme's `SolarColors`,
`SolarShadows`, `SolarTypography` and the static `SolarInset`/`SolarRadius`/… fields, and
`style(theme, props)`, a `ButtonStyle` for `FilledButton`. The state order is imported from the
MUI emitter, reversed, so the two platforms cannot disagree about which state wins.

`ButtonStyle` has elevation but no box shadow, and SOLAR draws both the control shadow and the
focus ring as box shadows. Flutter 3.24's `backgroundBuilder` solves it without a wrapper: the
background colour and the shadows are one `BoxDecoration`, with Material's own background
transparent — one decoration, because a Flutter shadow paints under the whole box and would
otherwise darken the face, which CSS never does. Material's overlay, splash and platform density
are switched off, since every SOLAR state has explicit colours and sizes; the tap target stays
padded to 48, as SOLAR's description asks for sm.

Verified in `flutter test`: a real `FilledButton` with the style draws SOLAR primary with the
control shadow and 6px radius in a 40px box, labelled in the bundled Inter; disabled beats hover;
xl is flat but keeps its focus ring; tertiary hover underlines; dark resolves against the dark
colours. Dropping the precedence reversal fails both the JS and the Dart suite.

Tests, both sides: the resolver returns the hover background for `WidgetState.hovered`; disabled
wins over hover when both are set, matching CSS specificity; every colour is a `SolarColors` field
rather than a literal.

---

### Task 6b: One entry per audience, and Tailwind 4

Added 2026-09-23 at the owner's request: Tailwind, plain-CSS, MUI and Flutter users each take one
part of the design system, so each gets an entry that loads nothing of the others. Structure only;
components stay on MUI and Flutter for now.

**Done 2026-09-23.** `@bwp-web/styles` exports `.` (the tokens as framework-agnostic data,
`generated/tokens.ts`), `./mui` (the MUI theme and the component recipes), `./tokens.css`,
`./tailwind.css` and `./fonts.css`, built as separate tsup entries; the root is 316 bytes plus the
shared token data and holds no MUI code. The Tailwind target is now **Tailwind 4 only** (owner):
a stylesheet with `@theme inline`, `@utility` for the border widths, z-index and durations that
Tailwind 4 has no namespace for, and `@import './tokens.css'` so one import does. SOLAR's
`border.none` is not registered, because Tailwind's `border-none` is `border-style: none`.
Verified by compiling a page with the Tailwind 4.3.3 CLI: every SOLAR utility resolves to its
`var(--solar-*)`, `md:` switches at SOLAR's 1024px, and the dark block is present. The packaging
suite asserts each entry stays within its audience.

The component shell in Task 7 imports from `@bwp-web/styles/mui`.

---

### Task 7: Scaffold the shell, once

**Files:** create `packages/codegen/src/scaffold/`, its test, and `packages/components/src/Button.tsx`;
modify `packages/components/package.json`.

`@bwp-web/components` is still an empty skeleton with no React dependency, so it needs the same
treatment `@bwp-web/assets` got in milestone 2: `react` and `@types/react` as devDependencies for
typecheck and `"react": ">=18"` as the one peer dependency.

`npm run solar:scaffold Button` writes a hand-owned shell that consumes the recipe, and **refuses
to overwrite an existing file** unless `--force` is passed. The shell holds behaviour: prop
plumbing, the loading spinner, slot rendering, accessibility.

Tests: scaffolding twice does not clobber; the generated shell typechecks; it imports the recipe
rather than inlining any value.

---

### Task 8: API parity

**Files:** create `packages/codegen/test/component-parity.test.mjs`.

Both platforms expose the same variants, sizes, states, slots and defaults, with the same names —
read from the **artifacts**, not the manifests, for the reason milestone 1 documented. Also assert
the thing that makes components different from tokens: **every recipe value is a token reference**,
so a raw hex or px in a component recipe fails.

---

### Task 9: CLI and wiring

**Files:** modify `packages/codegen/bin/solar-codegen.mjs`, add `bin/solar-scaffold.mjs`, root
`package.json`.

`solar:codegen` gains a component stage after icons: write `spec/components/*.json`, run both
recipe emitters, fold the component deviations into the one report. `solar:scaffold` is separate,
because scaffolding is a one-time human action and must never run in CI.

Verify determinism by running twice and hashing, and confirm nothing is written under `docs/`.

---

### Task 10: Documentation

**Files:** modify `packages/codegen/README.md`, `docs/README.md`, `CLAUDE.md` and
`packages/components/README.md`, which exists as a two-line placeholder.

Say what a recipe is, where the boundary between generated recipe and owned shell sits, and the
rule of thumb from the spec: **overlay for a decision about one component, normalizer for a rule
about the system, shell for behaviour.** Record how many deviations Button produced and what they
mean.

---

## Done when

- `spec/components/button.json` exists, is guarded, and carries the recipe in token names.
- An MUI app and a Flutter app both render a SOLAR Button from the same spec, and the API parity
  suite proves they expose the same surface.
- Scaffolding Button twice does not overwrite the shell.
- Every disagreement between the axis model and the Figma data is a recorded deviation naming the
  variant, and none is silently averaged away.
- `npm run solar:codegen` stays deterministic and writes nothing under `docs/`.
