# SOLAR — Figma fix list

**Prepared for:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-22

Everything below is something we think can be fixed or improved **in Figma**, read from the three
SOLAR files as they stand after today's revision. This is a work list, not a critique — most items
are small and mechanical, and each one is something only you can change.

## How to use this

Every row links straight to the node in Figma. Work top to bottom within a section, or take a
whole section at a time.

- **Fix** — clearly wrong, no judgement needed.
- **⚠️ Decide** — we can see something is off but the right answer is a design call.

Where we suggest a token, we picked the one whose value already matches what is drawn, so in most
cases the visual result does not change at all.

**Scope note.** Part 1 covers the 196 component sets our build currently reads. We have paused on
28 view pages — Generic Views, Account & Identity, Organization & Admin, Communications, Devices &
Operations and Help & Discovery — so the 31 sets on those pages are not measured here. That is a
decision about our pipeline, not about your file; anything on those pages is simply outside what
we can see. Parts 2 and 3 cover their files completely.

## Summary

| #                                                                                 | What                                        | Count       | File        |
| --------------------------------------------------------------------------------- | ------------------------------------------- | ----------- | ----------- |
| [1](#1-components-with-no-description--24)                                        | Components with no description              | 24          | SOLAR Web   |
| [2](#2-hard-coded-values--33-across-20-components)                                | Hard-coded values not bound to a variable   | 33          | SOLAR Web   |
| [3](#3-primitive-colours-used-directly--32-components)                            | Components using primitive colours directly | 32          | SOLAR Web   |
| [4](#4-descriptions-that-contradict-the-component-set--3-findings-on-1-component) | Descriptions that contradict the set        | 3 on Button | SOLAR Web   |
| [5](#5-state-and-axis-naming--12)                                                 | State and axis naming inconsistencies       | 12          | SOLAR Web   |
| [6](#6-variable-binding--1-local-duplicate-2-non-colour-bound-as-colour)          | Local duplicate and non-colour bindings     | 3           | SOLAR Web   |
| [7](#7-pages-that-still-contradict-the-variables--2)                              | Pages that still contradict the variables   | 2           | Foundations |
| [8](#8-icons--1-name-collision)                                                   | Icon fixes                                  | 1           | SOLAR Icons |

**If you only do three things:** the four layout accidents at the top of section 2, Button's
description in section 4, and the icon name collision in section 8.

---

# Part 1 · SOLAR Web

## 1. Components with no description — 24

Every `components/*` set and every `patterns/*` set is now described. What is left is three
view groups and one utility frame.

| Figma page                  | Component                             | Variants | Open                                                                             |
| --------------------------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| .[UTILITY]                  | **.Component Description**            | 1        | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612) |
| Join or Create Organization | **Auth — Create Organization**        | 2        | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| Forgot Password             | **Auth — Forgot Password**            | 2        | [7776:21546](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-21546) |
| Invite Acceptance           | **Auth — Invite Acceptance**          | 2        | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| Join or Create Organization | **Auth — Join Organization**          | 2        | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)   |
| MFA Challenge               | **Auth — MFA Challenge**              | 2        | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| Reset Password              | **Auth — Reset Password / Default**   | 1        | [6136:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6136-58)       |
| Reset Password              | **Auth — Reset Password / Default**   | 1        | [6137:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6137-58)       |
| Session Expired             | **Auth — Session Expired**            | 2        | [7810:21910](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21910) |
| Auth — Sign In              | **Auth — Sign In / Email**            | 2        | [6177:20771](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20771) |
| Auth — Sign In              | **Auth — Sign In / Email + Password** | 2        | [6177:20772](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20772) |
| Auth — Sign Up              | **Auth — Sign Up**                    | 2        | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885) |
| Organization Selector       | **Organization Selector**             | 4        | [6592:38886](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6592-38886) |
| Organization Selector       | **Organization Selector Overlay**     | 1        | [9511:29064](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9511-29064) |
| Agenda View                 | **Agenda View**                       | 1        | [6825:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6825-2)         |
| Day View                    | **Day View**                          | 1        | [6822:119](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6822-119)     |
| Resource View               | **Resource View**                     | 1        | [6827:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6827-2)         |
| Week View                   | **Week View**                         | 1        | [6811:17](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6811-17)       |
| Year View                   | **Year View**                         | 1        | [6829:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6829-2)         |
| 403 Forbidden               | **403 Forbidden**                     | 2        | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| 404 Not Found               | **404 Not Found**                     | 2        | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| 500 Server Error            | **500 Server Error**                  | 2        | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| Maintenance                 | **Maintenance**                       | 2        | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| Offline                     | **Offline**                           | 2        | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

## 2. Hard-coded values — 33 across 20 components

Paddings, gaps and radii typed in as numbers rather than bound to a variable. They do not follow
theme or density changes, and they are invisible unless you inspect the layer.

**11 of the 33 match a token exactly** and can be bound with no visual change. The other
**22 sit off the scale**, mostly because SOLAR has no token at that value.

`inset.*` is padding inside a container; `stack.*` is the gap between siblings. Auto-layout _gap_
therefore binds to `stack.*`, and _padding_ to `inset.*`, even though the two scales carry the
same numbers.

The off-scale values, and why they have no home:

| Value     | Times | Nearest token      | Note                                                      |
| --------- | ----- | ------------------ | --------------------------------------------------------- |
| `6px`     | 5     | `stack.2xs (4px)`  | 6px exists as `radius.control`, but not as a spacing step |
| `18px`    | 4     | `stack.md (16px)`  | all on Launch Card Full Screen                            |
| `2px`     | 3     | `stack.none (0px)` | 2px exists as `border.strong`, but not as a spacing step  |
| `32px`    | 2     | `stack.2xl (28px)` | the scale steps 28 → 40, so 32 has no home                |
| `#ffffff` | 2     | `None`             | no token at this value                                    |

These four are not scale gaps but almost certainly layout accidents, and are worth looking at first:

| Component     | Layer     | Property     | Value   | Open                                                                               |
| ------------- | --------- | ------------ | ------- | ---------------------------------------------------------------------------------- |
| **Stepper**   | Progress  | paddingRight | `225px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)     |
| **Stepper**   | Steps     | gap          | `197px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)     |
| **Coachmark** | Connector | gap          | `122px` | [10813:32930](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10813-32930) |

**.Component Description** · meta · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612)

| Layer                        | Property      | Current | Bind to                                              |
| ---------------------------- | ------------- | ------- | ---------------------------------------------------- |
| .Component Description       | radius        | `16px`  | ⚠️ no token at 16px — nearest `radius.dialog (12px)` |
| Header › Container › Version | paddingTop    | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs (4px)`       |
| Header › Container › Version | paddingBottom | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs (4px)`       |
| Header › .Subheader          | paddingTop    | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl (28px)`     |
| Header › .Subheader          | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl (28px)`     |

**Day Cell** · components/calendar · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)

| Layer                      | Property     | Current | Bind to                                         |
| -------------------------- | ------------ | ------- | ----------------------------------------------- |
| Day Num Row                | paddingRight | `2px`   | ⚠️ no token at 2px — nearest `inset.none (0px)` |
| Day Num Row                | paddingLeft  | `2px`   | ⚠️ no token at 2px — nearest `inset.none (0px)` |
| Day Num Row › Day Num Pill | paddingRight | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs (4px)`  |
| Day Num Row › Day Num Pill | paddingLeft  | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs (4px)`  |

**Launch Card Full Screen** · components/cards · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10404-64)

| Layer                      | Property | Current | Bind to                                         |
| -------------------------- | -------- | ------- | ----------------------------------------------- |
| Text                       | gap      | `18px`  | ⚠️ no token at 18px — nearest `stack.md (16px)` |
| Text › Content             | gap      | `18px`  | ⚠️ no token at 18px — nearest `stack.md (16px)` |
| Text › Content › Headline  | gap      | `18px`  | ⚠️ no token at 18px — nearest `stack.md (16px)` |
| Text › Content › Body copy | gap      | `18px`  | ⚠️ no token at 18px — nearest `stack.md (16px)` |

**ProgressBar** · components/data-display · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4507-112)

| Layer            | Property | Current  | Bind to       |
| ---------------- | -------- | -------- | ------------- |
| feedback=neutral | radius   | `9999px` | `radius.pill` |
| Indicator        | radius   | `9999px` | `radius.pill` |

**SearchResultsPanel** · patterns/layout-shell · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)

| Layer                              | Property | Current | Bind to    |
| ---------------------------------- | -------- | ------- | ---------- |
| ResultsBody › Dropdown Group Label | gap      | `8px`   | `stack.xs` |
| ResultsBody › Dropdown Group Label | gap      | `8px`   | `stack.xs` |

**Stepper** · components/navigation · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)

| Layer    | Property     | Current | Bind to                                           |
| -------- | ------------ | ------- | ------------------------------------------------- |
| Progress | paddingRight | `225px` | ⚠️ no token at 225px — nearest `inset.3xl (40px)` |
| Steps    | gap          | `197px` | ⚠️ no token at 197px — nearest `stack.3xl (40px)` |

**Activity Feed Filter Row** · patterns/data · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)

| Layer              | Property | Current | Bind to    |
| ------------------ | -------- | ------- | ---------- |
| breakpoint=desktop | gap      | `8px`   | `stack.xs` |

**Bar Stack** · components/data-visualization · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7235-26)

| Layer                            | Property | Current | Bind to                                         |
| -------------------------------- | -------- | ------- | ----------------------------------------------- |
| segments=2, orientation=vertical | gap      | `2px`   | ⚠️ no token at 2px — nearest `stack.none (0px)` |

**Calendar Toolbar** · components/calendar · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6653-861)

| Layer            | Property | Current | Bind to    |
| ---------------- | -------- | ------- | ---------- |
| Calendar Toolbar | gap      | `16px`  | `stack.md` |

**Chart Tooltip** · components/data-visualization · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7308-25)

| Layer | Property | Current | Bind to                                        |
| ----- | -------- | ------- | ---------------------------------------------- |
| Frame | gap      | `6px`   | ⚠️ no token at 6px — nearest `stack.2xs (4px)` |

**Coachmark** · components/overlays · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10813-32930)

| Layer     | Property | Current | Bind to                                           |
| --------- | -------- | ------- | ------------------------------------------------- |
| Connector | gap      | `122px` | ⚠️ no token at 122px — nearest `stack.3xl (40px)` |

**Notifications Panel** · patterns/layout-shell · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6776)

| Layer  | Property | Current | Bind to    |
| ------ | -------- | ------- | ---------- |
| Header | gap      | `12px`  | `stack.sm` |

**Page Header** · patterns/layout-shell · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246)

| Layer     | Property | Current | Bind to    |
| --------- | -------- | ------- | ---------- |
| Container | gap      | `16px`  | `stack.md` |

**Schedule Strip** · patterns/dashboards · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547)

| Layer     | Property | Current | Bind to    |
| --------- | -------- | ------- | ---------- |
| Container | gap      | `8px`   | `stack.xs` |

**Section Nav** · patterns/layout-shell · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8045-7)

| Layer | Property | Current   | Bind to   |
| ----- | -------- | --------- | --------- |
| Items | fill     | `#ffffff` | ⚠️ decide |

**Split Dialog** · components/dialogs · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6774-9620)

| Layer | Property | Current   | Bind to   |
| ----- | -------- | --------- | --------- |
| Body  | fill     | `#ffffff` | ⚠️ decide |

**TableFooter** · components/data-display · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44918)

| Layer     | Property | Current | Bind to                                           |
| --------- | -------- | ------- | ------------------------------------------------- |
| Container | gap      | `242px` | ⚠️ no token at 242px — nearest `stack.3xl (40px)` |

**TableHeader** · components/data-display · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44919)

| Layer     | Property | Current | Bind to                                           |
| --------- | -------- | ------- | ------------------------------------------------- |
| Container | gap      | `692px` | ⚠️ no token at 692px — nearest `stack.3xl (40px)` |

**Top Bar** · patterns/layout-shell · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620)

| Layer                                                | Property | Current | Bind to    |
| ---------------------------------------------------- | -------- | ------- | ---------- |
| breakpoint=desktop, hasSidebar=true, isLoggedIn=True | gap      | `12px`  | `stack.sm` |

**Widget Card** · patterns/dashboards · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5465-85)

| Layer  | Property | Current | Bind to    |
| ------ | -------- | ------- | ---------- |
| Header | gap      | `12px`  | `stack.sm` |

## 3. Primitive colours used directly — 32 components

A primitive is a raw palette entry. Bound directly it will not follow Light/Dark, because only
the semantic tokens are reassigned per mode. Most of these are the same few colours repeated.

| Primitive           | Components |
| ------------------- | ---------- |
| `color/brand/red`   | 19         |
| `color/brand/white` | 15         |
| `color/purple/700`  | 12         |
| `color/neutral/700` | 4          |
| `color/purple/50`   | 4          |
| `color/blue/700`    | 2          |
| `color/neutral/100` | 2          |
| `color/neutral/400` | 2          |

| Component                             | Section                 | Primitives                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Open                                                                             |
| ------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Agenda Row**                        | components/calendar     | `purple/50`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [6651:138](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6651-138)     |
| **Event Row**                         | components/cards        | `neutral/50`, `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | [7358:6](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7358-6)         |
| **Interactive Card**                  | components/cards        | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504)   |
| **Launch Card**                       | components/cards        | `alpha/white-60`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814)   |
| **Avatar**                            | components/data-display | `blue/100`, `blue/50`, `blue/500`, `blue/700`, `blue/800`, `green/100`, `green/50`, `green/500`, `green/700`, `green/800`, `neutral/100`, `neutral/400`, `neutral/50`, `neutral/700`, `neutral/800`, `orange/100`, `orange/50`, `orange/500`, `orange/700`, `orange/800`, `pink/100`, `pink/50`, `pink/500`, `pink/700`, `pink/800`, `purple/100`, `purple/50`, `purple/500`, `purple/700`, `purple/800`, `red/100`, `red/50`, `red/500`, `red/700`, `red/800`, `turquoise/100`, `turquoise/50`, `turquoise/500`, `turquoise/700`, `turquoise/800`, `yellow/100`, `yellow/50`, `yellow/600`, `yellow/700`, `yellow/800` | [2578:1831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-1831)   |
| **Column Item**                       | components/data-display | `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [4458:3831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3831)   |
| **Banner**                            | components/feedback     | `alpha/turquoise-50`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [2764:627](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2764-627)     |
| **.Component Description**            | meta                    | `mono/white`, `neutral/100`, `neutral/400`, `neutral/700`, `neutral/900`, `red/500`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612) |
| **Activity Feed**                     | patterns/data           | `blue/700`, `purple/700`, `red/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [8512:5284](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5284)   |
| **AppShell**                          | patterns/layout-shell   | `brand/red`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [5888:18630](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18630) |
| **Layout**                            | patterns/layout-shell   | `brand/red`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [6499:6699](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6699)   |
| **Layout / Canvas**                   | patterns/layout-shell   | `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [6499:6448](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6448)   |
| **Layout / Config**                   | patterns/layout-shell   | `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [6499:6532](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6532)   |
| **Layout / Workplace**                | patterns/layout-shell   | `brand/red`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [6498:5921](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6498-5921)   |
| **Profile Dropdown**                  | patterns/layout-shell   | `purple/50`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | [4644:6843](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6843)   |
| **Sidebar**                           | patterns/layout-shell   | `brand/red`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | [2666:781](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2666-781)     |
| **Top Bar**                           | patterns/layout-shell   | `purple/50`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| **Auth — Create Organization**        | views/auth              | `brand/red`, `brand/white`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| **Auth — Forgot Password**            | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [7776:21546](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-21546) |
| **Auth — Invite Acceptance**          | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| **Auth — Join Organization**          | views/auth              | `brand/red`, `brand/white`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)   |
| **Auth — MFA Challenge**              | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| **Auth — Session Expired**            | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [7810:21910](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21910) |
| **Auth — Sign In / Email**            | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6177:20771](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20771) |
| **Auth — Sign In / Email + Password** | views/auth              | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6177:20772](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20772) |
| **Auth — Sign Up**                    | views/auth              | `brand/black`, `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885) |
| **Organization Selector**             | views/auth              | `brand/red`, `brand/white`, `pink/700`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | [6592:38886](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6592-38886) |
| **403 Forbidden**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| **404 Not Found**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| **500 Server Error**                  | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| **Maintenance**                       | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| **Offline**                           | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

## 4. Descriptions that contradict the component set — 3 findings on 1 component

Only **Button** is left. Its description is out of date on three counts:

| Finding                                                                                                                           | Open                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Description says 96 variants; the set has 108.                                                                                    | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |
| Axis `size`: description lists [xs, sm, md, lg], set has [md, sm, xl].                                                            | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |
| Axis `state`: description lists [default, hover, pressed, disabled], set has [default, hover, pressed, disabled, focus, loading]. | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |

## 5. State and axis naming — 12

**2 sets carry two spellings of one state**, which is the clearer fix:

| Component       | Finding                                     | Open                                                                         |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| **Icon Button** | State axis has both `pressed` and `active`. | [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443) |
| **Text Area**   | State axis has both `focus` and `focused`.  | [3888:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3888-128) |

**10 sets use a value outside the standard ladder.** `ghost` appears on four and looks deliberate — see the decisions list.

| Component              | Section               | Values                           | Open                                                                             |
| ---------------------- | --------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **Tree Item**          | components/navigation | edit                             | [2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)   |
| **Day Cell**           | components/inputs     | today                            | [3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)       |
| **Context Menu Item**  | components/overlays   | destructive                      | [3451:31](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3451-31)       |
| **Status Card**        | components/cards      | ghost                            | [3763:676](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3763-676)     |
| **Day Cell**           | components/calendar   | other-month, today, today-column | [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)       |
| **SearchResultsPanel** | patterns/layout-shell | no-results, ghost                | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Sidebar Locations**  | patterns/layout-shell | search, no-results, rename       | [10406:1217](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10406-1217) |
| **Schedule Strip**     | patterns/dashboards   | ghost                            | [6593:41547](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547) |
| **Stat Card**          | patterns/dashboards   | ghost                            | [6579:25711](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6579-25711) |
| **Stat Card Small**    | patterns/dashboards   | ghost                            | [9059:28778](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9059-28778) |

## 6. Variable binding — 1 local duplicate, 2 non-colour bound as colour

| Component                      | Finding                                                                                                            | Open                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| **Auth — Create Organization** | Bound to a LOCAL duplicate of a Foundations token (should bind the library variable): `Color(local):text/primary`. | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461) |
| **Tab Item**                   | Non-color variable bound as a color: `border.strong`.                                                              | [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)     |
| **Spinner**                    | Non-color variable bound as a color: `border.strong`.                                                              | [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)   |

---

# Part 2 · SOLAR Foundations

Almost everything we raised here has been fixed. The spacing scale, the icon size ladder, the
radius and border-width tables, the border colour roles, the breakpoint set, the motion durations,
the typography scale and the invented `space.*` / `opacity.disabled` / `color.overlay.*` families
now match the variables — and in most cases the pages go further and explicitly name the retired
spellings as banned, which is more useful to us than silence. The page-artifact issues are gone
too: the UX Copy page carries its own context block, the Lint Plugin page no longer holds the
UX-copy cards, the chapter numbering agrees with the table of contents, and the two empty slide
frames are gone.

## 7. Pages that still contradict the variables — 2

| Where                                     | Says                                                       | Variables say                                                       | Fix                                                                 |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Agentic Reference `[COLOR_TOKEN_GRAMMAR]` | `data: … category.01-08, scale.01-08`                      | `color.data.scale.100 … 900`                                        | Change `scale.01-08` to `scale.100-900`. `category.01-08` is right. |
| Color and Borders & Radius page contexts  | action states `{default\|hover\|focus\|pressed\|disabled}` | `default \| hover \| active \| disabled` — no `focus`, no `pressed` | ⚠️ Decide: rename the variables, or correct the pages               |

The second one is new in this revision and is the only place it went backwards. The States page
also says "the variant value is pressed, never active", which the 96 action colour variables
contradict. We have followed the variables.

One more, not a contradiction but an unfinished edit: on the **Iconography** page the Sizing, Grid,
Stroke and Naming slides and the page context all describe the new single 24 × 24 canvas with a
`solid` boolean, while the **Outline vs Solid** and **Icon Library** slides and the Gatekeeper
checklist still describe the old `/Solid` suffix, per-size drawing and "Sourced from Remix at every
size". The shipped components match the new scheme, so it is the older slides that need updating.

---

# Part 3 · SOLAR Icons

341 icons, and the set is in excellent shape: no strokes, no clipping masks, one fill per icon,
24 × 24 frames throughout, every icon bound to `color/neutral/900`, and both variants drawn for
every icon. The two unbound fills, the missing Support outline, the duplicate Support solid and
Zone's off-grid frame are all fixed.

## 8. Icons — 1 name collision

| Icon      | Figma page    | What to fix                                                                             | Open                                                                           |
| --------- | ------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Phone** | Communication | Shares the name `Icon/Phone` with a different icon on another page — one needs renaming | [5310:1325](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5310-1325) |
| **Phone** | Audio & DSP   | The other half of the same collision                                                    | [5317:662](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5317-662)   |

Until it is renamed we export the Audio & DSP one as `phone--audio-dsp` and call its component
`IconPhoneAudioDsp`, so both icons ship. A rename in Figma would let us drop that special case.

---

# Decisions we need from you

These are the ones we genuinely cannot answer:

1. **Button sizes** — is `xl` real, and were `xs` / `lg` dropped deliberately? Section 4 is
   entirely Button, and we cannot tell which side is right.
2. **`ghost`, `destructive`, `readonly`, `today`, `no-results`** — should these be variants rather
   than states? `ghost` appears on four sets and looks deliberate.
3. **Avatar's 45 palette colours** — a deliberate identity palette that wants its own tokens?
4. **`color/brand/red` (19 sets) and `color/purple/700` (12 sets)** — intentional brand colour, or
   should they be semantic? They are the two biggest entries in section 3.
5. **Touch targets** — Button is drawn at 32px and 40px tall, Checkbox at 16px, Radio and Toggle at
   18px. That is fine if the hit area is larger than the drawn box, but it is not recorded
   anywhere. Could the intended target size go in the component description?
6. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR
   Web rather than in Foundations. Should it move down a layer?
7. **A logo size scale** — there is `icon.xs … icon.2xl` but no `logo.*`. Our logo components
   currently borrow the icon ladder, which works but is not what either scale means.

---

_Extracted from SOLAR Foundations `[v1--2026]` version `2402047167094879156`, SOLAR Web
`[v1--2026]` and SOLAR Icons `[v2--2026]` version `2402050745869349423`, all read on 2026-09-22.
Counts are computed from the files, not estimated. Happy to walk through any of this live — and
happy to be wrong on the judgement calls, where we may be missing context._
