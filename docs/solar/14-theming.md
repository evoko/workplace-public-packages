---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/theming: 9cc2105a7018
---

# 14 · Theming

> Source: Figma page "Theming" (designing for themes, what changes between modes,
> accessibility and theming, how theming works, non-color tokens, do's and don'ts) and
> its `@SOLAR:PAGE_CONTEXT`. All resolved values verified against the Color, Spatial
> and Type collections.

## How theming works

Theming operates at the **semantic token layer**. Primitives stay constant; semantic
tokens change their mapping per theme; components never change.

```
Component → Semantic token → [Theme mode] → Primitive token → Raw value
```

SOLAR supports **Light** and **Dark** as system-level themes (Figma Color collection
modes). Mode switching happens at the system or app-shell level, never per component.
The same architecture leaves room for future extensions (high contrast, brand themes).

Purpose: consistent Light/Dark across all products; accessibility met in every theme;
mode switching without component changes.

## Rules

**Designers**

- Design with semantic tokens only; never primitive colors or hex.
- Validate in both Light and Dark before handoff; a pair passing AA in Light may fail in
  Dark if tokens are misapplied.
- Do not assume a surface ("this is white"); use the role (`color.surface.base`).
- Use Figma variable modes to preview both themes.
- Never override a semantic token with a primitive.

**Engineers**

- Consume semantic tokens only.
- Theme switching at the system/app-shell level via CSS custom property reassignment
  under `[data-theme="dark"]` or `prefers-color-scheme: dark`.
- Respect `prefers-color-scheme` for automatic detection and provide a manual toggle to
  override it.
- Test all components in both modes as part of acceptance criteria.
- Use `--solar-` prefixed custom properties for every token reference.
- Theme switching must be instant: a custom-property swap or class toggle, no layout
  shift.

Figma variable mode names must match code theme identifiers (`Light` / `Dark`).

## What changes between modes

| Changes                                          | Stays the same                         |
| ------------------------------------------------ | -------------------------------------- |
| Surface and background colors invert             | Token names                            |
| Text and icon colors invert                      | Typography (size, weight, line height) |
| Border colors shift to maintain separation       | Spacing and layout tokens              |
| Action colors invert (neutral/900 ↔ neutral/50)  | Component structure and behaviour      |
| Shadow alpha increases (5 % → 50 %, 20 % → 70 %) | Motion durations and easing            |
| Feedback colors move to a shifted palette step   | Semantic meaning of every token        |

Dark mode is **not** inverted colors; every token mapping is designed intentionally.
Elevated surfaces in Dark share neutral/800 and rely on stronger shadows rather than
lighter tints.

## Token resolution table (representative)

Full table: [tokens/figma-variables.json](tokens/figma-variables.json) → `color`.

| Semantic token                          | Light (primitive → hex) | Dark (primitive → hex)  | Category |
| --------------------------------------- | ----------------------- | ----------------------- | -------- |
| `color.text.primary`                    | neutral/900 `#111111`   | neutral/50 `#F5F5F5`    | Text     |
| `color.text.secondary`                  | neutral/500 `#646464`   | neutral/300 `#A8A8A8`   | Text     |
| `color.surface.background`              | neutral/50 `#F5F5F5`    | neutral/900 `#111111`   | Surface  |
| `color.surface.base`                    | mono/white `#FFFFFF`    | neutral/800 `#222222`   | Surface  |
| `color.surface.scrim`                   | alpha/black-20          | alpha/black-20          | Surface  |
| `color.border.subtle`                   | alpha/black-10          | alpha/white-10          | Border   |
| `color.border.medium`                   | alpha/black-20          | alpha/white-20          | Border   |
| `color.action.primary.bg.default`       | neutral/900 `#111111`   | neutral/50 `#F5F5F5`    | Action   |
| `color.action.primary.text.default`     | mono/white `#FFFFFF`    | neutral/900 `#111111`   | Action   |
| `color.surface.feedback.success.subtle` | green/50 `#ECFFE9`      | green/800 `#002400`     | Feedback |
| `color.surface.feedback.warning.subtle` | orange/50 `#FFEEDA`     | orange/800 `#3E0000`    | Feedback |
| `color.surface.feedback.danger.subtle`  | red/50 `#FFE4DF`        | red/800 `#410001`       | Feedback |
| `color.surface.feedback.info.subtle`    | turquoise/50 `#F0FFFF`  | turquoise/800 `#033238` | Feedback |
| `color.text.feedback.danger`            | red/600 `#C00024`       | red/300 `#FF5F64`       | Feedback |
| `color.shadow.subtle`                   | alpha/black-05          | alpha/black-50          | Shadow   |
| `color.shadow.strong`                   | alpha/black-20          | alpha/black-70          | Shadow   |
| `color.shadow.feedback.focus`           | alpha/blue-20           | alpha/blue-20           | Shadow   |

Feedback tokens keep their semantic meaning across modes by shifting palette steps
(surfaces 50 → 800, strong fills 500 → 400, text 600 → 400).

The Theming slides now print the same values. The retired spellings they used to carry
— `color.border.default`, unsuffixed `surface.feedback.{type}`, warning as yellow/50 →
yellow/900, danger as red/900, info as blue/900, `shadow.subtle` dark as black-90 — do not
exist. Use `color.border.medium` and the `.subtle` / `.medium` / `.strong` feedback
surfaces.

## Non-color tokens and theming

Spatial tokens have a single mode and never change with theme:

| Group        | Tokens                                                                                                                    |
| ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Radius       | `radius.none` 0 · `radius.subtle` 4 · `radius.control` 6 · `radius.container` 8 · `radius.dialog` 12 · `radius.pill` 9999 |
| Border width | `border.none` 0 · `border.default` 1 · `border.strong` 2 · `border.emphasis` 4                                            |
| Inset        | `inset.none…3xl` = 0, 4, 8, 12, 16, 20, 24, 28, 40                                                                        |
| Stack        | `stack.none…3xl` = 0, 4, 8, 12, 16, 20, 24, 28, 40                                                                        |

Typography has its own **Desktop / Mobile** modes (Type collection) that are orthogonal
to Light/Dark: a design is always in one color mode _and_ one type mode.

## Accessibility and theming

Dark mode is an accessibility feature for brightness-sensitive users, not a decorative
preference. All text-on-surface and border-on-surface pairs meet WCAG AA in **both**
modes: 4.5:1 normal text, 3:1 large text and UI components; focus indicators visible in
both; reduced-motion applies equally.

| Check                   | Light | Dark   | Rule ID  | Severity |
| ----------------------- | ----- | ------ | -------- | -------- |
| Text contrast ≥ 4.5:1   | Pass  | Verify | CLR-003  | Error    |
| Non-text contrast ≥ 3:1 | Pass  | Pass   | CLR-004  | Error    |
| Focus ring visible      | Pass  | Verify | A11Y-003 | Error    |

Validation rules: **THM-001** no mode-specific color values in components; **THM-002**
all semantic tokens resolve in both modes; **THM-003** custom surfaces use semantic
surface tokens.

## Brand theming (architecture, from the page context)

A theme is a complete set of semantic token values. Brand themes may override visual
tokens (primitive palette, type stack, radius scale) but never structural or behavioural
properties. Themes cascade: base → dark; base → brand → brand-dark. Creating a new theme
requires a governance proposal, a full token mapping (no gaps), design review, Figma
mode setup, code implementation, and QA in all modes.

## Do and don't

| Scenario             | Do                           | Don't                                      | Why                  | Rule    |
| -------------------- | ---------------------------- | ------------------------------------------ | -------------------- | ------- |
| Body text color      | `color.text.primary`         | `color/neutral/900`                        | Dark-on-dark in Dark | THM-001 |
| Error feedback color | `color.text.feedback.danger` | brand red `#D22730`                        | Not mode-aware       | THM-001 |
| Surface background   | `color.surface.base`         | `#FFFFFF`                                  | White in Dark        | THM-003 |
| Mode logic           | Let tokens resolve           | Conditional light/dark logic in components | Breaks the model     | THM-001 |

Common mistakes: hard-coding hex; surface assumptions; not validating Dark contrast
before handoff; mixing primitive references with semantic tokens in one component.
Subtle backgrounds, borders and shadows are the most common Dark-mode failures.
