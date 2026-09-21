---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/agentic-reference: c5d73d846622
    page-context: e077532bd1ff
---

# 18 · Agent Reference

> Source: Figma page "Agentic Reference" (agentic implementation, instruction layer,
> machine-readable specifications, skills, validation & compliance, consumption path,
> quick-start rules, do/don't/tips) plus every `@SOLAR:PAGE_CONTEXT` block in the file.
> **Every token name and value here has been corrected against the Figma variable
> inventory**; where the Figma Agentic Reference page differs, the difference is noted
> and logged in [source-discrepancies.md](source-discrepancies.md).

This is the first-pass lookup for an AI agent generating or reviewing SOLAR UI. The
chapters hold rationale and edge cases; [tokens/figma-variables.json](tokens/figma-variables.json)
holds every value.

## How SOLAR treats agents

- **Not a bolt-on.** Token grammars, component specs and validation rules are authored
  for human and agent consumption from the start.
- **Deterministic output.** The system's rules are the spec, not the conversation.
- **Governed equally.** Agents follow the same compliance rules as humans. No separate
  standard for generated output.
- **Not** autonomous design decision-making, not a replacement for design review, not
  permission to invent tokens or bypass governance. Agents execute within the system's
  boundaries; they do not extend them.

## The consumption path

1. **Read the instruction layer** (`CLAUDE.md`, which points here). Every rule is hard,
   not advisory.
2. **Load component specs** (`component-specs.json` in the SOLAR repo, when available):
   token mappings, ARIA, states. Parse JSON; do not extract intent from prose.
3. **Load a skill** if one exists for the task (`skills/<name>/SKILL.md` under 500 lines
   plus `references/`).
4. **Generate output** applying semantic tokens, named text styles, spatial values and
   accessibility requirements.
5. **Validate** with the checklist below, cross-reference the token inventory, flag
   phantom tokens.
6. **Submit.** Compliance is binary; partial compliance is non-compliance.

## Ten foundational rules

1. Every color → semantic token (`color.*`); never hex, never primitive.
2. Every spacing → spatial token (`inset.*`, `stack.*`); never raw px/rem.
3. Every text → named text style (`body/md/regular`, `title/sm`…); never raw font props.
4. Every shadow → effect token (`shadow.*`); never raw `box-shadow`.
5. Every duration → `motion.duration.*`; never raw ms.
6. Every easing → `motion.ease.*`; never raw cubic-bezier.
7. Every border radius → `radius.*` (semantic) or `spatial.border-radius.*`; never raw px.
8. Every z-index → a defined level (0 / 100 / 200 / 300 / 400 / 500 / 600); never arbitrary.
9. Every interactive element → minimum 44 × 44 px touch target.
10. Every interactive element → visible focus ring on `:focus-visible`.

If a property is not covered by a token, **flag it as a gap**; never use a raw value and
never invent a token name.

## Separator conventions

| Context | Separator                         | Example                                          |
| ------- | --------------------------------- | ------------------------------------------------ |
| Figma   | `/`                               | `surface/base`, `inset/md`                       |
| Docs    | `.`                               | `color.surface.base`, `inset.md`                 |
| CSS     | `--solar-` prefix, `-`, lowercase | `--solar-color-surface-base`, `--solar-inset-md` |

Never mix separators within one context. Figma names omit the category prefix for the
Color collection (`text/primary` = `color.text.primary`).

## Color token grammar (verified)

| Category | Pattern                                                                                                     | Variants that exist                                                                                                                                                                                                          |
| -------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| surface  | `color.surface.{variant}`                                                                                   | `background`, `base`, `raised`, `overlay`, `dialog`, `scrim`, `muted`, `inverse`, `hover`, `active`, `feedback.{success\|warning\|danger\|info\|neutral}.{subtle\|subtle-alpha\|medium\|strong}`                             |
| text     | `color.text.{variant}`                                                                                      | `primary`, `secondary`, `tertiary`, `disabled`, `inverse`, `feedback.{type}`, `link.{default\|hover\|active\|disabled}`                                                                                                      |
| icon     | `color.icon.{variant}`                                                                                      | same as text                                                                                                                                                                                                                 |
| border   | `color.border.{variant}`                                                                                    | `subtle`, `medium`, `strong`, `disabled`, `inverse`, `inverse.subtle`, `inverse.strong`, `surface`, `highlight`, `feedback.{focus\|success\|warning\|danger\|info\|neutral}.{subtle\|medium\|strong}`                        |
| shadow   | `color.shadow.{variant}`                                                                                    | `subtle`, `strong`, `feedback.{focus\|danger\|warning\|success\|info\|neutral}` (colors only; composites are effect styles)                                                                                                  |
| action   | `color.action.{intent}.{property}.{state}`                                                                  | intent `primary\|secondary\|tertiary` (+ `danger` variant, written `primary-danger` in docs, stored `action/primary/{property}/danger/{state}`); property `bg\|text\|icon\|border`; state `default\|hover\|active\|disabled` |
| data     | `color.data.{type}.{id}`                                                                                    | `category.01…08.{strong\|subtle}`, `scale.100…900`, `delta.{neutral\|negative-100\|negative-300\|negative-500\|positive-100\|positive-300\|positive-500}`                                                                    |
| brand    | `color.brand.{primary\|secondary\|tertiary}`                                                                | red, black, white                                                                                                                                                                                                            |
| meter    | `color.meter.{nominal\|warning\|peak}`                                                                      | audio meters                                                                                                                                                                                                                 |
| control  | `color.control.{neutral\|mute\|solo\|phantom\|phase}.{bg\|border\|icon}.{default\|hover\|active\|disabled}` | audio channel-strip controls                                                                                                                                                                                                 |

## Banned segments and phantom tokens

| Never write                                             | Write instead                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `foreground`                                            | `text` or `icon`                                                                      |
| `background` (in action tokens)                         | `bg`; for surfaces use `color.surface.*`                                              |
| `color.icon.default`                                    | `color.icon.primary`                                                                  |
| `color.text.danger`                                     | `color.text.feedback.danger`                                                          |
| `color.icon.success`                                    | `color.icon.feedback.success`                                                         |
| `color.surface.danger`                                  | `color.surface.feedback.danger.{tone}`                                                |
| `color.border.error`                                    | `color.border.feedback.danger.strong`                                                 |
| `color.border.focus`                                    | `color.border.feedback.focus.strong`                                                  |
| `color.border.default`                                  | `color.border.subtle` / `.medium` / `.strong` (no `default` variable exists)          |
| `color.surface.secondary`                               | phantom; flag with ⚠️, do not use                                                     |
| `shadow.subtle` (as an effect)                          | `shadow/raised` (effect style); `color.shadow.subtle` is only a color                 |
| `shadow.elevated`, `shadow.medium`, `shadow.strongest`  | `shadow/overlay`, `shadow/dialog`                                                     |
| `shadow.modal`                                          | `shadow/dialog`                                                                       |
| `radius.xs`, `radius.2xl`, `radius.md/lg/xl` (semantic) | `radius.subtle`, `radius.control`, `radius.container`, `radius.dialog`, `radius.pill` |
| `space.*`, `gap.*`                                      | `inset.*` (padding) or `stack.*` (gaps)                                               |
| `viewport.breakpoint.*`, 600 px                         | `viewport.xs…xl` (393 / 768 / 1024 / 1440 / 1920)                                     |
| `opacity.disabled`                                      | not a variable; use the explicit `disabled` color tokens                              |
| `motion.easing.standard/enter/exit/linear`              | `motion.ease.both` / `.out` / `.in` (semantic easing layer is planned, not shipped)   |

**Phantom token protocol**: when a referenced token does not exist in the inventory,
flag it with ⚠️ and log it in the Variable Audit Report / discrepancies file rather than
silently using it. Gaps are governance issues, not agent decisions.

## Spatial system (verified)

| Group                          | none | 2xs | xs  | sm  | md  | lg  | xl  | 2xl | 3xl |
| ------------------------------ | ---- | --- | --- | --- | --- | --- | --- | --- | --- |
| `inset.*` / `stack.*`          | 0    | 4   | 8   | 12  | 16  | 20  | 24  | 28  | 40  |
| `icon.size.*` (Figma `icon/*`) | —    | —   | 12  | 16  | 20  | 24  | 28  | 32  | —   |

| Radius (semantic)  | px   | Primitive                    |
| ------------------ | ---- | ---------------------------- |
| `radius.none`      | 0    | `spatial.border-radius.none` |
| `radius.subtle`    | 4    | `spatial.border-radius.sm`   |
| `radius.control`   | 6    | `spatial.border-radius.md`   |
| `radius.container` | 8    | `spatial.border-radius.lg`   |
| `radius.dialog`    | 12   | `spatial.border-radius.xl`   |
| `radius.pill`      | 9999 | `spatial.border-radius.full` |

Border width: `border.none` 0, `border.default` 1, `border.strong` 2, `border.emphasis` 4.
Primitive scale: `spatial.scale.0…22` = 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48,
52, 56, 64, 72, 80, 96, 112, 128, 144, 160.

The Figma Agentic Reference page prints `inset: 2xs=2 | xs=4 | sm=8 | md=16 | lg=24 |
xl=32` and `icon.size: xs=16 … xl=40`; those do not match the variables. The documented
icon design intent is six sizes 12/16/20/24/32/40; the variables currently stop at 28
and 32 for `xl`/`2xl`. Flag icon `xl`/`xxl` as a known gap.

## Shadow and elevation (verified)

| Effect style                      | Use                                               | z-index level                              |
| --------------------------------- | ------------------------------------------------- | ------------------------------------------ |
| `shadow/control`                  | Inputs, small controls (interactivity, not depth) | base 0                                     |
| `shadow/raised`                   | Cards, raised surfaces                            | base 0                                     |
| `shadow/overlay`                  | Dropdowns, menus, popovers, tooltips              | dropdown 200 / overlay 300 / tooltip 600   |
| `shadow/dialog`                   | Dialogs, drawers                                  | modal 400 (drawer backdrop at overlay 300) |
| `shadow/strong`                   | Higher-emphasis separation                        | —                                          |
| `shadow/focus/default`            | Focus ring (blue 20 %)                            | —                                          |
| `shadow/focus/danger`             | Focus ring in error context (red 20 %)            | —                                          |
| `shadow/danger`, `shadow/warning` | Validation outline on a control                   | —                                          |

Z-index levels: base 0, sticky 100, dropdown 200, overlay 300, modal 400, toast 500,
tooltip 600. Stacking: Tooltip > Toast > Dialog > Overlay > Dropdown > Sticky > Base.

## Component map (from the Agentic Reference page, token names corrected)

| Component      | HTML                         | Key tokens                                                                             | Min target (w × h)            |
| -------------- | ---------------------------- | -------------------------------------------------------------------------------------- | ----------------------------- |
| Button         | `<button>`                   | `color.action.{intent}.*`, `radius.control`                                            | 44 × 36 (sm), 44 × 44 (md/lg) |
| TextInput      | `<input>` + `<label>`        | `color.surface.base`, `color.border.*`, `shadow/control`, `radius.subtle`              | 44 × 40                       |
| SelectDropdown | custom `<div>` listbox       | `color.surface.raised`, `shadow/overlay`                                               | 44 × 40                       |
| Checkbox       | `<input type="checkbox">`    | `color.action.primary.bg.default`                                                      | 44 × 20                       |
| Radio          | `<input type="radio">`       | `color.action.primary.bg.default`                                                      | 44 × 20                       |
| Switch         | `<button role="switch">`     | `color.action.primary.bg.default`                                                      | 44 × 24                       |
| Dialog         | `<dialog>` / `role="dialog"` | `color.surface.dialog`, `shadow/dialog`, `color.surface.scrim`, `radius.dialog`, z 400 | —                             |
| Drawer         | `<aside>` or `<div>` dialog  | `color.surface.dialog`, `shadow/dialog`, content z 400, backdrop z 300                 | —                             |
| Card           | `<div>`                      | `color.surface.raised`, `shadow/raised`, `radius.container`                            | —                             |
| Table          | `<table>`                    | `color.surface.base` (⚠️ page says `color.surface.secondary`, a phantom)               | 44 × 36 (row)                 |
| Tabs           | `<div role="tablist">`       | `color.action.primary.bg.default` for the selected indicator                           | 44 × 40                       |
| Accordion      | heading + `<button>`         | `color.surface.base`, `color.border.subtle`                                            | 44 × 48                       |
| Tooltip        | `<div role="tooltip">`       | `color.surface.inverse`, `color.text.inverse`, z 600                                   | —                             |
| Menu           | `<div role="menu">`          | `shadow/overlay`, z 200                                                                | 44 × 36 (item)                |

Full ARIA requirements: [03-accessibility.md](03-accessibility.md#component-aria-reference).

## Breakpoints and grid (verified)

| Viewport | px   | Columns | Gutter / margin |
| -------- | ---- | ------- | --------------- |
| xs       | 393  | 4       | 16 px           |
| sm       | 768  | 4       | 16 px           |
| md       | 1024 | 8       | 20 px           |
| lg       | 1440 | 12      | 24 px           |
| xl       | 1920 | 12      | 24 px           |

## Typography scale (verified, Desktop / Mobile)

| Role    | Family, weight          | Sizes (size/line-height px)                                                                   |
| ------- | ----------------------- | --------------------------------------------------------------------------------------------- |
| Display | Montserrat (Gotham) 500 | lg 56/72 → 40/52 · md 40/52 → 32/40 · sm 32/40 → 24/32 · xs 16/20                             |
| Title   | Inter 500               | lg 40/48 → 32/40 · md 32/40 → 24/32 · sm 20/28 → 18/24 · xs 16/24 · 2xs 12/16 (+8 % tracking) |
| Body    | Inter 400/500/600/700   | lg 16/24 · md 14/20 · sm 12/16 · xs 10/14 · 2xs 8/12 (same both modes)                        |
| Label   | Inter 500               | md 14/20 · sm 12/16                                                                           |
| Helper  | Inter 400               | md 14/20 · sm 12/16                                                                           |
| Code    | IBM Plex Mono 500       | lg 16/20 → 14/20 · md 14/16 → 12/16                                                           |
| Link    | Inter 500               | lg/md/sm/xs/2xs as Body                                                                       |
| Caption | Inter 400               | xs 10/14                                                                                      |

The Figma Agentic Reference page prints Title L as 44/56 and Helper M as 14/16; the
variables say 40/48 and 14/20.

## Motion (verified)

`motion.duration.{instant 0, fast 100, normal 300, slow 600, slower 900}` ms;
`motion.ease.{out (default, entrances), in (exits), both (transform in place)}`.
Always honour `prefers-reduced-motion` (collapse to instant; remove decorative motion).

## Per-domain agent roles (condensed from the page contexts)

| Domain              | When acting as this specialist, always…                                                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Accessibility       | Check a11y first; severity critical/major/minor with a concrete fix; never approve failing contrast or keyboard; disabled opacity ≥ 0.38 |
| Visual language     | Check every decision against all sub-domains; simplest treatment; name tokens; consider all themes and breakpoints                       |
| Color               | Answer with token paths not hex; verify contrast both modes; draft a proposal for missing roles; data-viz palette only for data          |
| Typography          | Named text styles only; Desktop and Mobile both; semantic text color tokens                                                              |
| Elevation           | Give shadow token + z-index level; scrim with dialogs; test both modes                                                                   |
| States              | Verify default/hover/active/focus/disabled all defined and visually distinct; focus always on top; touch has no hover                    |
| Iconography         | Reference icon by system name + size token; accessible name on icon buttons; one style per context                                       |
| Data visualization  | Justify chart type; data tokens only; text alternative; y-axis at zero for bars; series distinguishable without color                    |
| Layout / responsive | Mobile-first; describe each breakpoint; column spans not px; no horizontal overflow; reading order = visual order                        |
| Spatial / borders   | Token names not px; nearest token, never invented; inset inside, stack between; width token + color token for borders; concentric radius |
| Motion              | Duration + easing + property; pair enter/exit; reduced-motion fallback; transform/opacity only                                           |
| Theming             | Verify every value in all themes; never primitives in components; every token resolves in both modes                                     |
| Governance          | Gaps become proposals (name, category, rationale, use case, spec); never one-offs; flag deprecated with replacement                      |

## Pre-submission checklist

Tokens

- [ ] No hex, rgb, hsl, or primitive references in components (CLR-001/002)
- [ ] No raw px/rem for spacing, radius, border width (SPC-001…004)
- [ ] Every text node uses a named text style; no manual font overrides (TYP-001…005)
- [ ] Shadows, z-index, durations and easings are tokens (ELV-001…003, MOT-001…002)
- [ ] All token names pass the grammar; none from the banned list (NAM-001…003)
- [ ] `--solar-` prefix on every CSS custom property; product overrides use their own prefix

Accessibility

- [ ] Text contrast ≥ 4.5:1 / 3:1 large; non-text ≥ 3:1, in Light **and** Dark (CLR-003/004)
- [ ] Focus ring visible on every interactive element, not clipped (A11Y-003)
- [ ] Touch targets ≥ 44 × 44 px (A11Y-001)
- [ ] Correct HTML element and ARIA per the component reference (CMP-001…004)
- [ ] Color never the sole differentiator; dialogs trap and return focus
- [ ] `prefers-reduced-motion` respected (MOT-003)

Responsive and theming

- [ ] Works at xs, sm, md, lg, xl; no horizontal overflow (RSP-001…003)
- [ ] Only semantic tokens; every token resolves in both modes (THM-001…003)
- [ ] No conditional light/dark logic in components

Governance

- [ ] Any missing token or component flagged ⚠️ as a governance gap, not fabricated

## Do / don't / tips

**Do**: semantic tokens for every visual property; include the `feedback` segment for
status colors; use `bg|text|icon|border` in action tokens; reference named text styles;
run the checklist before every handoff; 44 × 44 targets; visible focus rings.

**Don't**: hex, primitives, hard-coded px/rem; skip the `feedback` segment; `foreground`
or `background`; mix separator styles; arbitrary z-index; silently use phantom tokens;
invent tokens.

**Tips**: check the banned list first, it catches most naming errors; typography differs
between Desktop and Mobile, check both; CSS shadows are composites while Figma stores
shadow _colors_ as variables; when a token you need does not exist, flag a governance
gap and stop.
