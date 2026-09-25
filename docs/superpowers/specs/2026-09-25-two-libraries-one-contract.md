# Two libraries, one contract — what is shared between MUI and Flutter, and what is not

Status: the owner stated the intent on 2026-09-25; this document records it as a design decision
and names the work that follows. Owner approval of the wording is pending where marked **Owner**.
Audience: engineers and agents working in this repository.

> **For agentic workers:** read this before touching a shell, a descriptor's `shells` or
> `flutter` table, `packages/codegen/test/component-parity.test.mjs`, or a component's public
> API on either platform. It changes the default: **a platform names and behaves its own way
> unless this document says the thing is shared.** The items at the end are tracked in the
> [pipeline review](../plans/2026-09-25-solar-pipeline-review.md); check their state there
> before starting one. The repository owner handles all version control: no git write commands.

## 1. The intent

The project generates a React library on MUI and a Flutter library from the SOLAR Figma files.
What matters is that **each library matches its Figma design, visually and functionally**, on its
own. It does not matter that the two libraries match each other, and neither library should have
to adopt the other's conventions to make the pair look uniform. MUI has its ways; Flutter has its
ways; each library should be native to its platform and faithful to Figma.

The pipeline already measures exactly this: the oracle (`spec/verify/<name>.json`) is what Figma
draws, and the web check and the Flutter check each compare their own platform against it, in
Light and Dark, with 0 failures at `21497a6`. What this document changes is the **design rule**
that sat on top of those checks, which asked the two platforms to be the same in ways Figma never
asked for.

## 2. Three levels of "shared", and the decision at each

Uniformity exists at three levels in the pipeline. The decision is different at each.

### Level 1 — the contract: shared, and stays shared

One IR per component (`spec/components/<name>.json`): its axes, its states, its slots, its layer
tree, and its recipe in token names, derived from Figma with the overlay's decisions. Two
emitters read it. One oracle per component is derived beside it.

**Decision: keep exactly as is.** This is Figma's contract, which neither MUI nor Flutter has an
opinion about. It is why one overlay rule fixes both platforms, why `solar:explain`, the
deviations report and the design review are one document rather than two, and why a Figma
change reaches both libraries through one sync. Nothing at this level is "merging conventions".

What the parity suite must keep asserting at this level:

- every IR recipe entry is present in the MUI recipe at its selector and in the Flutter recipe
  at its key, with the same token or the same allowed literal, and no colour literal anywhere;
- both platforms style every state the IR has, and resolve overlapping states in the same order
  (what wins in CSS wins in Flutter), which is how the suite caught Flutter drawing hover's
  underline on a mouse press;
- both platforms cover the same appearance combinations.

### Level 2 — the rendering model: a shared model, not a borrowed convention

84 of 98 components draw Figma's layer tree through a shared runtime: `internal/layers.tsx` on
the web, `SolarLayers` in Flutter. The rest borrow a stock control for its behaviour (MUI's
`ButtonBase`, `InputBase`, `Tab`, `MenuItem`, `Select`, `Slider`, `Switch`; Flutter's
`FilledButton`, `TextField`, `RawRadio`).

**Decision: keep.** The layer-tree renderer is how fidelity is reached for the majority of SOLAR
components, which have no native equivalent on either platform. It is a model both platforms
implement in their own language, not a convention either platform imposes on the other. The
design spec's §3 note of 2026-09-25 already records this.

What is **not** decided by this level: how a consuming app themes or overrides a component. That
is level 3.

### Level 3 — API, behaviour and theming: platform-native, shared concepts only

Today the parity suite asserts that both platforms have "the same props, and the same defaults",
"the same values, spelled the same", and "every slot, the label as their child", and it parses the
shells to prove it. A platform may differ only by registering an exception in its descriptor
(`shells.label`, `shells.flutter`, `shells.slots`, `flutter.groupDecides`), which 41 of 98
descriptors do. Uniform is the default; idiom is the exception.

**Decision: invert the default.** At this level the two libraries share **concepts**, never
spellings or mechanisms:

- Every IR axis, boolean, state and slot must be **reachable** on each platform. How it is
  reached is that platform's business: a prop, a nullable callback, a controller, a group, a
  theme, a `WidgetStatesController`, a CSS class.
- Names follow the platform where SOLAR is silent. Where SOLAR's description names a thing
  (`mandatory`, `danger`, `prio`), the IR keeps SOLAR's word, and the platform may still spell
  it its own way in the API through a declared mapping (`prio` is already `variant`).
- Behaviour follows the platform: what a null `onPressed` means in Flutter, what `disabled` and
  `aria-disabled` mean on the web, how focus is reached, how a group decides a member's state.
- Theming follows the platform: an MUI app controls appearance through its theme; a Flutter app
  through `ThemeData` and component themes. The recipe is the source; how it is exposed is per
  platform.

The mapping from IR to each platform's API is **declared once per component and checked**, so
nothing is lost: the parity suite proves reachability through the mapping instead of identity of
spelling. The exception tables become the mapping, and stop being exceptions.

## 3. Evidence that the old default cost platform idiom

Recorded so the work below has a baseline. Recompute with the commands.

| Symptom                                                                                                                                                             | Where                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 31 Flutter widgets take `disabled = false` **and** `onPressed`, and compute `onPressed: disabled \|\| busy ? null : onPressed`. Flutter's idiom is that a null callback is the disabled state. | `packages/solar_flutter/lib/src/components/solar_*.dart`                                     |
| Every Flutter recipe is a `Map<String, String> cells` looked up by strings such as `root.background\|appearance\|variant=primary, danger=false\|hover`. Flutter's idiom for a themable look is `ThemeData` component themes and `WidgetStateProperty`; only the buttons expose a `ButtonStyle`. | `packages/solar_flutter/lib/src/generated/components/*.dart` (97 files)                      |
| No web shell reads `useTheme`; every recipe is `sx` with `var(--solar-*)`, and the components "look right with or without the SOLAR MUI theme". An MUI app cannot control a SOLAR component through its theme, and stock MUI components get only palette and typography. | `packages/components/src/*.tsx`, `packages/styles/src/generated/mui/theme.ts`                |
| Both shells are rendered from one template model in JavaScript, so a Flutter engineer and a React engineer write behaviour in the same option vocabulary (87 keys) instead of in their own language. | `packages/codegen/src/components/*.mjs`, `packages/codegen/src/shells/*.mjs`                 |
| 41 descriptors carry a `shells` or `groupDecides` table to be allowed to differ.                                                                                    | `packages/codegen/src/components/*.mjs`                                                      |

```bash
for f in packages/solar_flutter/lib/src/components/solar_*.dart; do grep -q 'this.disabled = false' "$f" && grep -q 'onPressed' "$f" && echo "$f"; done | wc -l
grep -c "static const Map<String, String> cells" packages/solar_flutter/lib/src/generated/components/*.dart | grep -vc ':0'
grep -c "useTheme" packages/components/src/*.tsx | grep -v ':0' | wc -l
grep -l "shells:\|groupDecides" packages/codegen/src/components/*.mjs | wc -l
grep -nE "^\s*it\(" packages/codegen/test/component-parity.test.mjs | grep -iE "same props|spelled the same|label as their child"
```

## 4. What the shared contract has bought, so nothing is thrown away

- The parity suite's level-1 checks found defects the per-platform checks missed at the time:
  Flutter lacked the state-overlap restating that CSS gets from the cascade, and drew hover's
  underline while pressed and hover's colours while focused.
- One overlay decision changes both libraries; one deviations report goes to SOLAR; one
  `solar:explain` answers "why this colour" for both.
- One oracle, one set of visual cases, one Storybook and one Widgetbook built from them.

All of that is level 1 and level 2. None of it needs level 3.

## 5. The rules, for anyone writing or reviewing a component

1. **Ask Figma, not the other platform.** A visual or functional question is answered by the
   oracle and the platform's own check. "Does it match Flutter?" is never a reason to change the
   web, or the reverse.
2. **Share the IR; declare the mapping.** Every axis, boolean, state and slot of the IR is
   reachable on each platform through the descriptor's declared mapping. A concept that is not
   reachable on one platform is a bug; a spelling that differs is not.
3. **Behaviour follows the platform.** In Flutter, a pressable is disabled by a null callback; a
   field's value lives in a controller; a group decides its members. On the web, a control is
   disabled by `disabled` or `aria-disabled`; a field's value is `value` or `defaultValue`. Do not
   add a prop to one platform because the other has it.
4. **Theming follows the platform.** The recipe is the source of every value on both platforms.
   On the web it is reachable through `sx` **and** through the MUI theme
   ([review item 14](../plans/2026-09-25-solar-pipeline-review.md)); in Flutter through the
   generated recipe **and** through a component theme once one exists (item 22 below).
5. **Names.** SOLAR's word where SOLAR names the thing; otherwise MUI's word on the web and
   Flutter's word in Flutter. This is the answer to the review's item 17. **Owner:** confirm.
6. **Accessibility is per platform and non-negotiable on both.** The 44 × 44 target, the
   accessible name, the role and the states are each platform's own mechanism (a pseudo-element
   or an enlarged input; `SolarTarget` and `Semantics`), checked by each platform's own tests.

## 6. Work that follows

Two new items for the review's backlog, and a reorientation of four existing ones.

### Item 21 — demote the parity suite to the contract

**What to change.** In `packages/codegen/test/component-parity.test.mjs`:

- Keep, unchanged: "styles the same states on both platforms", "resolves states in the same
  order", "covers the same appearance combinations", "the Flutter recipe is the IR, entry for
  entry", "the MUI recipe names exactly the custom properties the IR implies", "holds a raw value
  only where the overlay allowed one", "never holds a colour literal", and the two "every entry,
  in place" suites.
- Replace "has the same props, and the same defaults", "offers the same values for every choice,
  spelled the same", "the shell takes a prop for every slot the IR has, and the label is its
  children", and the per-component "both take every prop of the IR" and "both take every slot,
  the label as their child" with **reachability through the mapping**: for each IR axis, boolean
  and slot, the descriptor's mapping names how each platform reaches it, and the parsed shell
  has that member. A mapping that names nothing for a platform fails; a mapping to a platform
  mechanism (`onPressed: null` for `disabled`, `controller` for `value`, a `RadioGroup` for
  `checked`) passes when the shell has that mechanism.
- Rename the descriptor tables from exceptions to the mapping: `shells.label`, `shells.flutter`,
  `shells.slots` and `flutter.groupDecides` become one `api` table per descriptor, `{ react: {…},
flutter: {…} }`, with the IR name as the key and the platform's spelling or mechanism as the
  value, defaulting to the IR name where a platform has no reason to differ.
- Keep "keeps hover, pressed and focus out of both APIs, as platform states": that is a level-1
  rule about what a state is.

**Done when.** The suite passes with the current shells (the mapping tables are filled from the
existing exception tables, so nothing changes on day one); removing an IR slot's mapping on one
platform fails the suite naming the slot; spelling a Flutter prop differently from React with a
mapping passes.

### Item 22 — a Flutter idiom pass

**What to change**, per widget, without changing what it draws (the Flutter visual check is the
gate):

- A pressable is disabled by `onPressed: null`. The `disabled` parameter goes where the widget
  has a callback; it stays where nothing is pressed (a Tag, a Divider, a Skeleton) and Figma
  draws a disabled look. The recipe still needs `disabled` as a prop, so the shell derives it:
  `disabled: onPressed == null`.
- `loading` stays a parameter (Flutter's buttons have no loading state of their own).
- For a wrapped control (the buttons, the fields, Radio, Slider), the recipe is also exposed as a
  **component theme** the Flutter way: a `Solar<Name>ThemeData` in the `SolarTheme` extension,
  built from the generated recipe, that a Flutter app can override with `copyWith`. The
  string-keyed `lookup` stays for the drawn widgets, where it is the honest representation of a
  layer tree; consider `WidgetStateProperty` accessors over it for the cells a caller is likely
  to override (root fill, ink).
- Values a Flutter app gives are Flutter types, as the pickers already do (`DateTime`,
  `TimeOfDay`, `onDateChanged`): review the rest of the API for strings that should be types.

**Done when.** No widget with an `onPressed` also takes `disabled`; `flutter analyze` and
`flutter test` pass; the Flutter visual check is unchanged; the Flutter README shows a
`SolarButtonThemeData` override.

### Reoriented items, already in the review

- **Item 9, shells as real files.** Under this decision the argument is stronger: a React shell
  written in TSX by a React engineer and a Flutter widget written in Dart by a Flutter engineer
  are how each library stays native as behaviour grows in F11 and F12. The IR-derived parts
  (types, tree, parts, the mapping) stay generated and imported.
- **Item 14, a stock-MUI theme from the recipes, and item 15, one mode switch.** These are
  "theming follows the platform" on the web. The recipe stays the source; the theme is how an
  MUI app expects to reach it.
- **Item 17, one vocabulary.** Answered by rule 5 above, pending the owner's confirmation:
  SOLAR's word where SOLAR names the thing, otherwise each platform's own.

## 7. What this does not change

- The IR, the overlays, the oracle, the deviations report, `solar:explain`, `solar:triage` and
  `solar:overlay:audit`.
- The layer-tree renderers and the shared visual cases.
- The invariants of the design spec (§2): `docs/` read-only, generated files never hand-edited to
  keep a change, emitters read only the spec, no raw literal without a recorded deviation.
- The rule that every variant matches Figma on each platform or is excused by a named finding.

## 8. Decided since

- **Item 21, done (2026-09-25).** Each descriptor's exception tables (`shells.label`,
  `shells.flutter`, `shells.slots`, `flutter.groupDecides`) are one `api` table,
  `{ react: {…}, flutter: {…} }`, resolved by `packages/codegen/src/shells/api.mjs` with each
  platform's conventions as defaults. The parity suite proves every IR prop and slot reachable
  through it (`unreached`), keeps the defaults shared (they are Figma's default variant's, level
  1), and refuses a mapping of what the IR does not name. Tests prove a missing member fails,
  naming the slot, and a declared different spelling passes.
- **Item 22, done for the buttons (2026-09-25).** Sixteen widgets are disabled by a null
  `onPressed` or `onChanged`, with a `disabled` getter, and no `disabled` parameter: the buttons,
  the menu and list rows, the paging controls, the calendar's day, Checkbox and Toggle (a
  Checkbox drawn in a row reads the row's disabled state from `inStates`). Kept, as a look of its
  own: the cards, Tab Item, Breadcrumb Item, Counter, and the fields (Flutter's `enabled`, rule 5).
  Slider, Slider Range, Radio and Option Row could follow. Component themes:
  `SolarButtonThemeData`, `SolarIconButtonThemeData`, `SolarFABThemeData` and
  `SolarBackButtonThemeData`, `ThemeExtension`s whose style is merged over the recipe.
- **Theming on the web (2026-09-25).** Every React shell reads its props through the MUI theme
  (`useSolarProps`: `components.Solar<Name>.defaultProps` and `styleOverrides.root`), typed by a
  generated augmentation. And the review's item 14, for the components whose SOLAR shell is the
  MUI component: stock `Button` and `IconButton` under the SOLAR theme take the recipe
  (`spec/overlay/mui-theme.yaml`), and pass the Figma check in both modes, as do the SOLAR ones
  under the same theme.

- **Size in a stretching layout (2026-09-25).** Checking the Flutter library on an iPhone found a
  Checkbox drawn as a full-width bar in a `ListView`: a widget took whatever size its parent
  forced. Every widget now keeps Figma's size on each axis Figma does not fill, **including those
  built on Flutter's own buttons**, which Flutter would stretch (owner decision: Figma's size
  wherever it is put); given more room, it sits at the room's **start** (owner decision), as the
  web lays out an inline box, and not centred as Flutter's Checkbox is. `SolarOwnSize` and
  `SolarFill` in `packages/solar_flutter/lib/src/solar_own_size.dart`; checked by
  `test/visual/own_size_test.dart`.
- **Icons inherit on Flutter as on the web.** `SolarIcon` takes the icon theme around it before
  SOLAR's default colour, so an icon in a button is the button's ink (it was drawn black on the
  primary Icon Button).

## 9. Open for the owner

- Rule 5's wording (SOLAR's word where SOLAR names the thing; otherwise the platform's).
- ~~Whether item 22's component themes should come before or after F11.~~ Settled 2026-09-25:
  done before F11, for the buttons (§8).
- Whether `loading` should follow the platform too (a Flutter app may prefer to swap the child),
  or stay a shared concept because SOLAR draws it as a state.
