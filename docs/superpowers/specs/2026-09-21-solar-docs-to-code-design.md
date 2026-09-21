# SOLAR docs-to-code generator — design

Status: approved in discussion 2026-09-21, not yet implemented.
Audience: engineers and agents working in this repository.

## 1. Purpose

Turn the extracted SOLAR design data in [`docs/`](../../README.md) into shipping code for four
targets, with verifiable parity between them and a working loop for correcting the generator
when its output is wrong.

Targets and depth:

| Target   | Tokens | Icons | Components |
| -------- | ------ | ----- | ---------- |
| MUI      | yes    | yes   | yes        |
| Flutter  | yes    | yes   | yes        |
| CSS      | yes    | yes   | no         |
| Tailwind | yes    | no    | no         |

Components are generated for MUI and Flutter only. A third and fourth component
implementation would be more parity surface for little gain.

## 2. Invariants

These are hard rules. Everything else in this document is negotiable.

1. **`docs/` is read-only to the generator.** It is a faithful mirror of Figma, including
   Figma's defects. No tweak, no adopt, no agent may write to it. Only `solar:sync` and
   `solar:tokens` write there.
2. **Design-to-doc never changes because of a code problem.** If the real fix is in Figma, the
   generator records a deviation and reports it. It does not edit the mirror.
3. **Generated files are never hand-edited as a way of keeping a change.** They carry a header
   saying so and CI fails if a rebuild changes them. Editing one locally to try something is
   fine and expected; `--adopt` exists to turn that experiment into an overlay entry, after
   which regeneration restores the file.
4. **Emitters read only the spec.** They never read `docs/` directly. This is what keeps the
   targets in step.
5. **No raw literal in a recipe without a recorded deviation.** Every style value is a token
   reference or an explicit, reasoned exception.

Enforcement: all generator writes pass through one helper that rejects paths under `docs/`, so
a violation fails during development. CI additionally asserts `docs/` is byte-identical after
`solar:codegen`.

## 3. Architecture

```
Figma ──► docs/                                   solar:sync, solar:tokens
             │  (read-only)
             ▼
        normalize ◄── spec/overlay/*.yaml         solar:codegen
             │         (human decisions)
             ▼
        spec/tokens.json  (DTCG)
        spec/ir/*.json
             │
     ┌───────┼───────┬──────────┐
     ▼       ▼       ▼          ▼
    MUI   Flutter   CSS     Tailwind          emitters
     │       │       │          │
     └───────┴───┬───┴──────────┘
                 ▼
          conformance suites                     solar:verify
```

Three stages, one direction. The normalizer is the only component that reads `docs/`. The
emitters are independent and interchangeable.

### Directory layout

```
spec/
  tokens.json               generated, DTCG format
  ir/<component>.json       generated, the component contract and recipe
  ir/icons.json             generated
  overlay/_defaults.yaml    system-wide rules
  overlay/<component>.yaml  per-component decisions, hand-written
  deviations.md             generated report for SOLAR governance

packages/
  codegen/                  private workspace package: the generator and its CLI
    src/normalize/  src/emit/{mui,flutter,css,tailwind}/  src/verify/
  styles/src/generated/     CSS variables, MUI theme, Tailwind preset
  assets/src/generated/     icon components
  components/
    src/generated/          <name>.recipe.json, <name>.types.ts
    src/<Name>.tsx          scaffolded once, then developer-owned
  solar_flutter/            Dart package, consumed by git dependency
    lib/src/generated/      theme, tokens, recipes, icon widgets
    lib/src/components/     scaffolded once, then developer-owned
```

`spec/` is checked in. It is derived, but committing it makes a Figma change reviewable as a
diff of the contract instead of a diff of 1596 variant rows.

## 4. The spec layer

### 4.1 Tokens

`spec/tokens.json` uses the DTCG (Design Tokens Community Group) draft format, generated from
`docs/solar/tokens/css-contract.json` plus the SOLAR Web `Layout` collection. DTCG costs
nothing over an invented shape and matches what Biamp's own pipeline document expects to emit
at stage 2, so an official export could later replace our capture without touching an emitter.

Modes: Light and Dark for colour, Desktop and Mobile for type. Everything else is single-mode.

### 4.2 Component IR

One file per component. It carries the public contract and the style recipe.

```jsonc
{
  "component": "Button",
  "base": { "mui": "Button", "flutter": null }, // null = bespoke
  "api": {
    "variant": {
      "values": ["primary", "secondary", "tertiary"],
      "default": "primary",
    },
    "size": { "values": ["sm", "md", "xl"], "default": "md" },
    "danger": { "type": "boolean", "default": false },
  },
  "states": ["default", "hover", "active", "focus", "disabled", "loading"],
  "slots": { "iconLeading": { "type": "icon", "optional": true } },
  "style": {
    "root": {
      "base": {
        "borderRadius": "radius.control",
        "borderWidth": "border.default",
      },
      "size.md": { "paddingX": "inset.sm", "gap": "inset.xs" },
      "variant.primary": {
        "default": { "background": "color.action.primary.bg.default" },
        "hover": { "background": "color.action.primary.bg.hover" },
      },
    },
  },
  "provenance": { "figmaNode": "2087:2544", "page": "components/buttons" },
}
```

`states` are platform states, not props. Figma models them as a variant axis because it has no
pseudo-states; the normalizer demotes that axis by default.

### 4.3 Overlay

Hand-written, reviewed, the only place design-to-code judgement lives.

```yaml
component: Button
base:
  mui: Button
  flutter: FilledButton
api:
  rename: { prio: variant }
style:
  root.shadow:
    set: shadow.control
    reason: MUI default was leaking through; Figma binds shadow/control
deviations:
  - path: root.size.md.gap
    figma: 8px hard-coded
    use: inset.xs
    reason: same value, governed token
    raised: SOLAR-123
```

Deviations are aggregated into `spec/deviations.md` for the SOLAR team. A deviation is a
statement that code and design disagree on purpose, and it must stay visible.

## 5. Emitters

Each emitter also writes a machine-readable manifest of what it produced. Parity tests compare
manifests rather than parsing Dart or CSS.

- **MUI**: `createTheme` input, CSS custom properties, per-component recipe plus prop types.
- **Flutter**: a `ThemeExtension`, Dart token constants, per-component recipe as a Dart const
  structure plus a widget-state resolver.
- **CSS**: `--solar-*` custom properties, Light default, Dark under `[data-theme="dark"]`,
  Mobile type under a media query. Superset of today's `reference.css`. Icons ship as the raw
  SVG files, copied from `docs/solar-icons/svg/` with the fill swapped to `currentColor`.
- **Tailwind**: a preset mapping token names to scale keys. Tokens only.

Component shells are **scaffolded once** from the IR, then owned by developers forever. The
recipe beside them regenerates on every run. This is the boundary that lets look changes flow
in automatically while behaviour is never clobbered.

## 6. The developer loop

The review surface is the tweak surface. A Storybook panel is bound to the component's recipe;
changing a value updates the render live, and saving writes an overlay entry with provenance
attached. The developer edits where their eye is, and the edit is structured by construction.

Supporting commands:

| Command                                   | Purpose                                                                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `solar:explain <C> --variant … --state …` | Print the provenance chain for every resolved property: shell, recipe, token, Figma node, overlay, or "MUI default, not in recipe" |
| `solar:codegen -- --adopt <C>`            | Read hand edits and fold what it understands into the overlay, asking about the rest                                               |
| `solar:overlay:audit`                     | Report overlay rules repeated across components: candidates for promotion into the normalizer                                      |
| `solar:verify`                            | Run the three parity suites                                                                                                        |

Rule of thumb: **overlay for a decision about one component, normalizer for a rule about the
system, shell for behaviour or markup.**

On save, the system classifies the change as either a generator correction (a bug, fix the
normalizer, no deviation) or a deliberate departure from Figma (a deviation, recorded with a
reason). Where it cannot tell, it asks once. Without this the generator quietly learns to
contradict the design system.

Agents may edit `spec/overlay/` and `packages/codegen/`. Agents may never edit `docs/`.

## 7. Parity verification

Generated from the same spec the emitters read, so it cannot drift from them.

1. **Token parity.** All four manifests resolve each token to the same value in each mode.
2. **API parity.** Every component exposes the same variants, sizes, states and slots, with the
   same names and defaults, on both platforms.
3. **Visual parity.** Computed properties, not pixels: background, text colour, border width,
   radius, padding, font size, box size. Cross-platform pixel diffing fails on font
   rasterisation alone.

The visual comparison is **each platform against Figma**, not web against Flutter. The
extraction already records expected fill, stroke, effect and text colours for all 1596
variants, so there is an oracle rather than a mutual diff. That catches both platforms drifting
together. Where an overlay records a deviation, it becomes the expectation and the report says
so.

Web probes run under Playwright with `getComputedStyle`. Flutter probes run as native widget
and golden tests inside the Dart package, not through Flutter web, which rasterises differently
and would prove nothing about the mobile apps.

## 8. Review surfaces

Storybook for web, widgetbook for Flutter. A side-by-side gallery is a later human convenience;
the computed-property suite is the gate.

## 9. CI

Extends [`.github/workflows/solar.yml`](../../../.github/workflows/solar.yml):

- `solar:codegen` produces no diff, and `docs/` is byte-identical afterwards.
- `solar:verify` passes all three parity suites.
- A Flutter SDK step for the Dart analyzer and tests, adding one to two minutes.

No Figma token is needed, consistent with the existing jobs.

## 10. Milestones

| #   | Milestone                                                                   | Proves                                                                  | Risk   |
| --- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| 1   | Token emitters, all four targets, plus the Dart package skeleton and its CI | Normalizer, multi-emitter shape, token parity                           | Low    |
| 2   | Icons: 341 icons as React components and Flutter widgets, plus raw SVG      | Asset pipeline, `currentColor`, naming, tree-shaking                    | Low    |
| 3   | The spine on 6–8 components                                                 | Overlay, recipes, scaffolding, tweak panel, explain, adopt, conformance | High   |
| 4   | Scale out by category behind a readiness gate                               | The loop at volume                                                      | Medium |
| 5   | Migrate one real app, feed deviations to SOLAR                              | That it is wanted                                                       | Medium |

Milestone 1 is the highest value per unit of effort: existing apps adopt the brand by swapping
a theme, before any component exists, and the token data is already verified.

Milestone 3 deliberately picks hard cases over easy ones: Button (variant breadth, `danger`),
Text Input (states, helper text), Checkbox (indeterminate), Card (bespoke layout), Dialog
(portal, focus trap), Tabs (keyboard navigation), and one audio component such as Meter that
Material has no answer for.

Milestone 4 needs a readiness gate rather than a loop over the catalog. A component is eligible
when it has a description, a recorded base decision, no unresolved variable references, and its
hard-coded values either mapped or deviated. Today 111 of 227 components have no description,
so much of the catalog is not ready and generating it would produce confident guesses.

## 11. Out of scope

- `@bwp-web/canvas`, which needs the SOLAR Spatial library we have not extracted.
- Component behaviour logic. Keyboard navigation, focus management and controlled state are
  real engineering per platform whatever the generator does.
- Motion. Not extracted from Figma; only the Foundations motion tokens exist.
- CSS and Tailwind components.

## 12. Known risks

| Risk                                                 | Mitigation                                                                                |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 111 of 227 components have no description            | Readiness gate; push descriptions upstream to SOLAR                                       |
| 151 hard-coded values on 52 components               | Recipes reject raw literals; each needs a mapping or a deviation                          |
| Hybrid base means two patterns to maintain           | The choice is recorded per component in the overlay and reviewed                          |
| Wrapping MUI lets its defaults leak into the look    | `solar:explain` labels them; the overlay pins them so Flutter matches                     |
| Two toolchains, npm and Dart, in one repo and one CI | Accepted cost of single-commit parity                                                     |
| Adopt cannot parse arbitrary TSX                     | It handles the structured cases and asks about the rest; the tweak panel is the main road |

## 13. Decisions taken

| Question                                      | Decision                                                                                                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| One generator with transpilation, or several? | Neither. One normalizer, one spec, independent emitters. Parity by generated conformance tests, not shared implementation code. |
| Wrap Material or build our own?               | Hybrid, recorded per component.                                                                                                 |
| Where does Flutter live?                      | `packages/solar_flutter` in this repo, consumed by git dependency.                                                              |
| How much of a component is generated?         | Recipe and types regenerate every run; the shell is scaffolded once and then owned.                                             |
| Can a tweak change the docs?                  | Never. Only docs-to-code logic changes.                                                                                         |
