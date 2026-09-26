# Open work

What is known to be missing or unfinished, with how to check its state and when it is done. It
lists gaps in what exists, not new features. Run each item's check before starting it: the
numbers here were measured on 2026-09-26 and the tree moves. Remove an item when it is done;
record any decision it needed in [decisions.md](decisions.md).

An item marked **Owner** needs the repository owner's answer before work starts.

## Recipe packaging for consumers

**Why.** `@bwp-web/styles/mui` bundles every component's recipe into one module, and
`@bwp-web/components` imports it. Named ESM exports tree-shake, but each recipe is one large
object literal a bundler keeps or drops whole. On 2026-09-26 `dist/mui.js` was 1.28 MB, from
51,696 lines of generated recipes.

**Check.**

```bash
npm run build -w @bwp-web/styles && ls -la packages/styles/dist/mui.js
wc -l packages/styles/src/generated/mui/components/*.ts | tail -1
```

**What to change.** Per-component subpath exports (`@bwp-web/styles/mui/button`) written by
`emitMuiComponents` into `packages/styles/package.json`'s `exports` and `tsup.config.ts`'s
entries, each shell importing its own recipe module; or a compact encoding (each token name once,
`var()` built in `solar<Name>Style`). Measure with a real bundler on the smoke app
(`scripts/smoke-install.mjs` installs the packed packages), not on `dist` alone.

**Done when.** An app importing `Button` alone bundles under 60 KB of recipe, and the styles
README states the per-component entry.

## Stock MUI components styled from the recipes

**Why.** Under the SOLAR theme, stock MUI components should look like their SOLAR counterparts.
`spec/overlay/mui-theme.yaml` decides which ones take a recipe; today only `MuiButton` and
`MuiIconButton` do, and both pass the Figma check as cases of Button's and Icon Button's oracles.
Every other SOLAR component is drawn, so its recipe's selectors are SOLAR layer classes
(`.SolarTag--iconClose`) that MUI's markup lacks (`.MuiChip-deleteIcon`): each needs a hand map
from SOLAR layers onto MUI's slots in the decision file.

**Check.**

```bash
grep -E '^Mui[A-Za-z]+:' spec/overlay/mui-theme.yaml
```

**What to change.** In this order, the likeliest reached for first:

1. `MuiChip` (Tag), `MuiBadge` (Counter), `MuiSwitch` (Toggle), `MuiCheckbox`, `MuiRadio`;
2. `MuiTextField` and its parts (Text Input), `MuiSelect`, `MuiMenuItem` (Dropdown Item),
   `MuiTabs` and `MuiTab`;
3. `MuiAlert`, `MuiTooltip`, `MuiDialog`, `MuiCard`, `MuiAccordion`, `MuiTableCell`.

Each themed stock component is a case of its SOLAR component's oracle in the web visual check, so
it is measured against Figma, never against the SOLAR component. The emitter is
`packages/codegen/src/emit/mui-theme-components.mjs`.

**Done when.** Groups 1 and 2 pass the visual check against their SOLAR component's oracle in both
modes, and the styles README's coverage table is generated from the decision file.

## Figma Code Connect and a Figma-ID manifest

**Owner:** is SOLAR Web's library on a Figma Organization or Enterprise plan (Code Connect
publishing needs one)? And should the next `solar:sync` record each variant's node ID?

**Why.** A designer in Dev Mode should see the real props, and a rename in Figma should not move
a code name. The IR holds each component's Figma node (`provenance.figmaNode`), its API and its
renames, so a Code Connect template per component can be generated.

**Check.**

```bash
node -e 'const ir=JSON.parse(require("fs").readFileSync("spec/components/button.json","utf8")); console.log(ir.provenance)'
ls packages/components/codeconnect 2>/dev/null || echo "no Code Connect"
```

**What to change.** A `codeconnect` emitter in `packages/codegen/src/emit/` writing
`packages/components/codeconnect/<Name>.figma.tsx` from the IR (the node URL, each axis through its
`api` mapping to the shell's prop, each slot to `figma.instance` or `figma.string`, derived axes
left out); a manifest emitter once variant IDs exist; `@figma/code-connect` as a dev dependency and
a `codeconnect:check` script in CI. Publishing stays a deliberate local action.

**Done when.** `figma connect parse` passes for every exported component, and the manifest
resolves every component's Figma node to its export name.

## An app's own MUI theme leaks into SOLAR components on stock MUI

**Why.** A SOLAR component SOLAR draws itself (Button, Tag, Alert) renders the same under any MUI
theme. One built on a stock MUI control (Text Input on `InputBase`, Tabs on `Tab`, Toggle on
`Switch`, Select, Slider and others: about 40) also takes the host theme's `styleOverrides` for that
control. Measured 2026-09-26 under V1's `biampTheme`: Text Input 44px tall instead of 40 and in the
app's font, Tabs 45px instead of 34. Every V1 app keeps its theme while it migrates, so its SOLAR
fields and tabs drift from Figma until the old theme goes. The visual checks never render under a
foreign theme, so they cannot catch it.

**Check.** Render a SOLAR Text Input and Tabs under a theme with overrides on `MuiInputBase` and
`MuiTab`, and compare with the same under `SolarProvider` (the adoption review's scratch lab did
this with V1's theme from npm).

**What to change.** A web visual case per wrapped control under a hostile theme (overrides on every
stock key the component's base uses), then recipe resets for the properties a host theme can set,
as `MUI_RESETS` undoes MUI's own defaults.

**Done when.** Every SOLAR component on a stock MUI control draws what Figma draws under the hostile
theme, in both modes.

## A Material theme for Flutter's stock widgets

**Why.** A Flutter app that is SOLAR only still uses stock Material widgets SOLAR does not define
(`Scaffold`, `AppBar`, dialogs, drawers, snack bars, and buttons outside SOLAR's), and they draw in
Material's defaults: `solar_flutter` gives no `ThemeData`. SOLAR's text styles carry no colour, by
design, so text also takes Material's default colour rather than `text.primary`. The web has the
equivalent in part (the MUI palette and typography, and `MuiButton` and `MuiIconButton` from
recipes). workplace-client, the first Flutter consumer, relies on a hand-written `ThemeData` of about
1,500 lines (`packages/core_theme/lib/src/app_theme.dart`: `colorScheme` 443 uses, `textTheme` 183,
stock buttons 351, `Scaffold`, `AppBar`, dialogs and drawers 429), which it would otherwise rewrite
from SOLAR's tokens by hand. Owner, 2026-09-26: planned once "SOLAR in app code" has landed.

**Check.**

```bash
grep -rln "ThemeData(\|ColorScheme(" packages/solar_flutter/lib || echo "no Material theme"
```

**What to change.** A generated `SolarTheme.material(Brightness)` (or `SolarTheme.materialTheme`)
from the tokens: a `ColorScheme` from SOLAR's roles, a `TextTheme` from the text styles with
`text.primary` as the default text colour, the `SolarTheme` extension installed, and component themes
for the stock widgets an app keeps, each value a token, as the MUI palette and typography tables do.

**Done when.** An app given `SolarTheme.material(brightness)` draws stock `Scaffold`, `AppBar`,
`AlertDialog` and the Material buttons in SOLAR's colours and type in Light and Dark, checked the
way the Flutter visual check measures widgets, and the Flutter README shows the setup.

## Flutter idioms beyond the buttons

**Why.** Flutter's idiom is that a null callback is the disabled state, and that a themable look
is a component theme. The buttons, menu and list rows, paging controls, the calendar's day,
Checkbox and Toggle follow it; the fields take `enabled`.

**Check.**

```bash
for f in packages/solar_flutter/lib/src/components/solar_*.dart; do grep -q 'this.disabled = false' "$f" && grep -q 'onPressed\|onChanged' "$f" && basename "$f"; done
grep -n 'class Solar.*ThemeData' packages/solar_flutter/lib/src/*.dart
```

On 2026-09-26 the grep lists eleven files. `solar_splitbutton.dart` is a false match: its
`disabled` parameter is `SolarSplitButtonItem`'s, a menu item's data, and `SolarSplitButton`
itself is disabled by a null `onPressed`. Of the other ten, six keep the parameter by decision,
as a look of their own rather than the absence of an action (the cards: Card, Status Card,
Accordion; Tab Item; Breadcrumb Item; Counter), see [decisions.md](decisions.md). Four have no
recorded reason: **Radio, Slider, Slider Range and Option Row**. Component
themes exist only for the four button widgets (`solar_button_themes.dart`).

**What to change.** Apply the null-callback rule to those widgets, or record why not in
decisions.md; add component themes (`Solar<Name>ThemeData`, a `ThemeExtension` merged over the
recipe) for the wrapped controls: the fields on `TextField`, Radio, Slider.

**Done when.** Every widget with both a `disabled` parameter and a callback has its reason in
decisions.md; the fields, Radio and Slider have component themes; `flutter analyze` and
`flutter test` pass and the Flutter visual check is unchanged.

## Designed, not built

- **The tweak panel**: edit a value in Storybook, save it as an overlay rule with provenance.
  Today the loop is `solar:explain --propose`, which prints the rule to paste.
- **`solar:codegen -- --adopt <Name>`**: fold a local edit of a generated file into the overlay.

## Out of scope today

Not gaps in what exists, but things a reader may expect and not find: those in
[architecture.md, Out of scope, by design](architecture.md#out-of-scope-by-design), and besides
them the calendar's assembled Month, Week and Day views and their date logic, and publishing
(every public package is `2.0.0-alpha.0`, unpublished).

## Open Figma findings

Figma defects the code does not copy are excused in the oracle and listed for the designers in
[the design review](../solar-review-for-design.md). They are closed in Figma, not here: after the
next `solar:sync`, a fixed finding disappears, and an overlay rule that decided it fails as stale
until removed.
