# SOLAR — what to fix and decide in Figma

**For:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-24

## What this is

The Biamp Workplace web and mobile apps build their components straight from the three SOLAR
Figma files: **SOLAR Foundations** (the variables and the guideline pages), **SOLAR Web** (the
components, patterns and views) and **SOLAR Icons**. A script reads every variant of every
component, and the code draws exactly what Figma draws. That makes Figma the source of truth in a
very literal sense: an unbound value, a variable bound in the wrong place or a variant that
disagrees with its siblings ends up in the product.

This list is everything we found in the files that we think should be fixed or decided **in
Figma**. It is a work list, not a critique: most items are small and mechanical, and each one is
something only the design team can change. Nothing here needs to be done at once, and nothing blocks
us — where an item is open, we draw what Figma draws and say so below.

**Scope.** Part 1 covers the 196 component sets we read in SOLAR Web. It leaves out the view pages
we do not build from yet (Generic Views, Account & Identity, Organization & Admin, Communications,
Devices & Operations, Help & Discovery); that is a choice about our pipeline, not about the file.
Parts 2 and 3 cover Foundations and Icons completely.

## How to read it

- **Fix** — clearly wrong; no judgement needed.
- **⚠️ Decide** — something is off, but the right answer is a design call. The questions are
  gathered again at the end, in [Decisions we need from you](#decisions-we-need-from-you).

Every row links straight to the node in Figma. Where we suggest a variable, it is the one whose
value already matches what is drawn, so binding it changes nothing visually; it only makes the value
follow the system (theme, density, future changes).

A few terms used throughout:

- **Bound / unbound.** A value is _bound_ when it uses a Foundations variable, _unbound_ (hard-coded)
  when it is typed in as a number or colour.
- **Primitive and semantic colours.** Primitives are the raw palette (`color/purple/700`);
  semantic colours say what a colour is for (`color/text/primary`, `color/action/primary/bg/hover`).
  Only the semantic ones switch between Light and Dark, so components should bind those.
- **`inset.*` and `stack.*`.** Two spacing scales with the same numbers: `inset` is padding inside a
  container, `stack` the gap between siblings. An auto-layout _padding_ binds to `inset.*`, its
  _gap_ to `stack.*`.
- **Axes and variants.** A component set's properties (`size`, `prio`, `state`, …) are its axes;
  each combination is a variant. SOLAR's model is that **geometry follows `size` and colour follows
  `prio`, `state` and `danger`**; section 8 lists where a component departs from it.

## Start here

If you take only a few items, take these:

1. **In Dark, a primary button's icons disappear on hover** — white on white — and nearly
   disappear when pressed. Two variable values; the one problem on this list that users would
   notice. [Section 10](#10-action-colours-below-the-contrast-floor--5).
2. **Control heights** — eleven components describe themselves as 36/44px tall and are drawn at
   32/40px, which is also the touch-target question. [Section 4](#4-described-sizes-that-disagree-with-the-drawing--11-components).
3. **45 documentation cards** still carry the Breadcrumbs page's text.
   [Section 7](#7-documentation-cards-copied-from-breadcrumbs--45-pages).
4. **Stepper's 225px padding**, the one hard-coded value that looks like a layout accident rather
   than a missing binding. [Section 2](#2-hard-coded-values--55-across-11-components).

## At a glance

| #                                                                      | What                                                  | Count                                              | File        |
| ---------------------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------- | ----------- |
| [1](#1-components-with-no-description--24)                             | Components with no description                        | 24                                                 | SOLAR Web   |
| [2](#2-hard-coded-values--55-across-11-components)                     | Hard-coded values not bound to a variable             | 55 in 11 components, and 1,098 zeros               | SOLAR Web   |
| [3](#3-primitive-colours-used-directly--32-components)                 | Components using primitive colours directly           | 32                                                 | SOLAR Web   |
| [4](#4-described-sizes-that-disagree-with-the-drawing--11-components)  | Described sizes that disagree with the drawn ones     | 11                                                 | SOLAR Web   |
| [5](#5-state-values-outside-the-standard-ladder--5)                    | State values outside the standard ladder              | 5 (+2 described)                                   | SOLAR Web   |
| [6](#6-variable-bindings--3-wrong-5-unknown)                           | Wrong or unknown variable bindings                    | 3 + 5                                              | SOLAR Web   |
| [7](#7-documentation-cards-copied-from-breadcrumbs--45-pages)          | Documentation cards copied from Breadcrumbs           | 45 pages                                           | SOLAR Web   |
| [8](#8-button-spinner-icon-button-and-button-group-variant-by-variant) | Button, Spinner, Icon Button, Button Group, in detail | Button 6, Spinner 2, Icon Button 5, Button Group 3 | SOLAR Web   |
| [9](#9-guideline-pages-that-contradict-the-variables)                  | Guideline pages that contradict the variables         | 2, and 2 page edits                                | Foundations |
| [10](#10-action-colours-below-the-contrast-floor--5)                   | Action colours below the contrast floor               | 5                                                  | Foundations |
| [11](#11-icons-and-logos)                                              | Icons and logos                                       | no icon findings; 2 logo questions                 | SOLAR Icons |

---

# Part 1 · SOLAR Web

## 1. Components with no description — 24

Every set under `components/` and `patterns/` is described. These are the ones that are not: three
groups of views and one utility frame. A description tells anyone reading the file, person or tool,
what the set is for and how its variants differ.

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

## 2. Hard-coded values — 55 across 11 components

Paddings and gaps typed in as numbers rather than bound to a variable. They do not follow theme or
density changes, and they are invisible unless you inspect the layer. **53 of the 55 match a
variable exactly** and can be bound with no visual change. Most of them (44) are one view, Resource
View, repeating the same five values across its rows; the other ten components have one or two
each.

**Zeros, everywhere.** Separately from the 55, 1,098 paddings and gaps, in 91 of the 119 sets in
the Components section, are `0` and bound to nothing. `inset/none` is the variable for `0`, so
there is no visual change to make: binding them would only make the intent explicit and let density
changes reach them. We read every unbound `0` padding or gap as `inset/none`, in every component,
so they need no answer component by component. If you rebind them in bulk, nothing in our code
changes.

**Fix first — a layout accident:**

| Component   | Layer    | Property     | Value   | Open                                                                           |
| ----------- | -------- | ------------ | ------- | ------------------------------------------------------------------------------ |
| **Stepper** | Progress | paddingRight | `225px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846) |

No spacing variable comes near (the scale stops at 40px); it looks like a width that should follow
from the number of steps rather than fixed spacing. On the same component, the gap between steps is
bound to `inset/md`, a padding variable; `stack/md` is the gap variable of the same value.

**Resource View** · views/calendar · 44 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6827-2)

| Layer (under Calendar Body › Calendar Surface) | Property      | Current | Times | Bind to    |
| ---------------------------------------------- | ------------- | ------- | ----- | ---------- |
| Header Row › Corner                            | paddingTop    | `8px`   | 1     | `inset.xs` |
| Header Row › Corner                            | paddingBottom | `8px`   | 1     | `inset.xs` |
| Header Row › Hour Cell                         | paddingTop    | `8px`   | 12    | `inset.xs` |
| Header Row › Hour Cell                         | paddingBottom | `8px`   | 12    | `inset.xs` |
| Resource Row › Resource Label                  | gap           | `12px`  | 6     | `stack.sm` |
| Resource Row › Resource Label                  | paddingTop    | `8px`   | 6     | `inset.xs` |
| Resource Row › Resource Label                  | paddingBottom | `8px`   | 6     | `inset.xs` |

**Day View** · views/calendar · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6822-119)

| Layer                                                    | Property | Current | Bind to                                                           |
| -------------------------------------------------------- | -------- | ------- | ----------------------------------------------------------------- |
| Calendar Body › Calendar Surface › All-Day Strip › Frame | gap      | `2px`   | ⚠️ no spacing variable at 2px (it exists only as `border.strong`) |

**The rest match a variable exactly:**

| Component                    | Section               | Layer                              | Property | Current  | Bind to    | Open                                                                             |
| ---------------------------- | --------------------- | ---------------------------------- | -------- | -------- | ---------- | -------------------------------------------------------------------------------- |
| **SearchResultsPanel**       | patterns/layout-shell | ResultsBody › Dropdown Group Label | gap      | `8px` ×2 | `stack.xs` | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Activity Feed Filter Row** | patterns/data         | breakpoint=desktop                 | gap      | `8px`    | `stack.xs` | [8512:5759](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)   |
| **Schedule Strip**           | patterns/dashboards   | Container                          | gap      | `8px`    | `stack.xs` | [6593:41547](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547) |
| **Notifications Panel**      | patterns/layout-shell | Header                             | gap      | `12px`   | `stack.sm` | [4644:6776](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6776)   |
| **Top Bar**                  | patterns/layout-shell | desktop, with sidebar, logged in   | gap      | `12px`   | `stack.sm` | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| **Widget Card**              | patterns/dashboards   | Header                             | gap      | `12px`   | `stack.sm` | [5465:85](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5465-85)       |
| **Calendar Toolbar**         | components/calendar   | Calendar Toolbar                   | gap      | `16px`   | `stack.md` | [6653:861](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6653-861)     |
| **Page Header**              | patterns/layout-shell | Container                          | gap      | `16px`   | `stack.md` | [6186:21246](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246) |

## 3. Primitive colours used directly — 32 components

Bound directly, a primitive does not follow Light and Dark, because only the semantic colours are
reassigned per mode. Most of these are the same few colours repeated:

| Primitive           | Components |
| ------------------- | ---------- |
| `color/brand/red`   | 19         |
| `color/brand/white` | 15         |
| `color/purple/700`  | 12         |
| `color/neutral/700` | 4          |
| `color/purple/50`   | 4          |
| `color/neutral/50`  | 3          |
| `color/blue/700`    | 2          |
| `color/neutral/100` | 2          |
| `color/neutral/400` | 2          |
| `color/pink/700`    | 2          |
| `color/red/500`     | 2          |
| `color/red/700`     | 2          |

Two are really questions (in the decisions list): whether `brand/red` and `purple/700` are meant as
fixed brand colours, and whether Avatar's 45-colour palette wants tokens of its own.

| Component                             | Section                 | Primitives                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | Open                                                                             |
| ------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Agenda Row**                        | components/calendar     | `purple/50`, `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | [6651:138](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6651-138)     |
| **Event Row**                         | components/cards        | `neutral/50`, `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | [7358:6](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7358-6)         |
| **Interactive Card**                  | components/cards        | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504)   |
| **Launch Card**                       | components/cards        | `alpha/white-60`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814)   |
| **Avatar**                            | components/data-display | `blue/100`, `blue/50`, `blue/500`, `blue/700`, `blue/800`, `green/100`, `green/50`, `green/500`, `green/700`, `green/800`, `neutral/100`, `neutral/400`, `neutral/50`, `neutral/700`, `neutral/800`, `orange/100`, `orange/50`, `orange/500`, `orange/700`, `orange/800`, `pink/100`, `pink/50`, `pink/500`, `pink/700`, `pink/800`, `purple/100`, `purple/50`, `purple/500`, `purple/700`, `purple/800`, `red/100`, `red/50`, `red/500`, `red/700`, `red/800`, `turquoise/100`, `turquoise/50`, `turquoise/500`, `turquoise/700`, `turquoise/800`, `yellow/100`, `yellow/50`, `yellow/600`, `yellow/700`, `yellow/800` | [2578:1831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-1831)   |
| **Column Item**                       | components/data-display | `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [4458:3831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3831)   |
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
| **Resource View**                     | views/calendar          | `neutral/50`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [6827:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6827-2)         |
| **403 Forbidden**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| **404 Not Found**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| **500 Server Error**                  | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| **Maintenance**                       | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| **Offline**                           | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

## 4. Described sizes that disagree with the drawing — 11 components

Eleven descriptions give a control height in pixels that the component does not have. Across the
button, tab and input families the pattern is the same: **the description says 36px and 44px, the
component is drawn 32px and 40px** — 4px taller in the description. Icon Button is off by 4px the
other way. For the inputs we compared the field itself, not the component with its label and helper.

| Component        | Description says     | Drawn               | Open                                                                             |
| ---------------- | -------------------- | ------------------- | -------------------------------------------------------------------------------- |
| **Button**       | sm 36, md 44, lg 48  | sm 32, md 40, lg 48 | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)   |
| **BackButton**   | sm 36, md 44         | sm 32, md 40        | [4549:130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4549-130)     |
| **SplitButton**  | sm 36, md 44         | sm 32, md 40        | [4569:200](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4569-200)     |
| **Icon Button**  | sm 28, md 36, lg 44  | sm 32, md 40, lg 48 | [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)     |
| **Tab Item**     | sm 36, md 44         | sm 32, md 40        | [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)       |
| **Tabs**         | sm 36, md 44         | sm 32, md 40        | [6165:12202](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-12202) |
| **Text Input**   | sm 36, md 44 (field) | sm 32, md 40        | [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737)   |
| **Select**       | sm 36, md 44 (field) | sm 32, md 40        | [5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92)       |
| **Autocomplete** | sm 36, md 44 (field) | sm 32, md 40        | [3889:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3889-128)     |
| **DatePicker**   | sm 36, md 44 (field) | sm 32, md 40        | [7266:25837](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-25837) |
| **TimePicker**   | sm 36, md 44 (field) | sm 32, md 40        | [4414:79](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4414-79)       |

**⚠️ Decide:** which is right? 44px is the WCAG touch target, so the descriptions may be describing
the intended hit area while the drawings show the visible control — Button's description says as
much ("sm renders below the 44px WCAG touch target — pad the hit area in code"). If so, a sentence
saying "drawn at 32/40, hit area 44" in each description would settle it. **We build what is drawn**
(32 and 40) and do not pad the hit area yet, because there is no variable for the target size. A
control-height variable and a target-size variable would settle this and section 8's heights
together.

## 5. State values outside the standard ladder — 5

SOLAR's state axis runs `default`, `hover`, `pressed`, `focus`, `disabled` (plus `loading` where a
component can load). These sets add values that describe their content rather than an interaction:

| Component              | Section               | Values                           | Open                                                                             |
| ---------------------- | --------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **Tree Item**          | components/navigation | edit                             | [2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)   |
| **Day Cell**           | components/inputs     | today                            | [3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)       |
| **Day Cell**           | components/calendar   | other-month, today, today-column | [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)       |
| **SearchResultsPanel** | patterns/layout-shell | no-results                       | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Sidebar Locations**  | patterns/layout-shell | search, no-results, rename       | [10406:1217](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10406-1217) |

**⚠️ Decide:** `today`, `other-month` and `no-results` read naturally as booleans of their own (as
`ghost` and `destructive` already are on the cards), leaving the state axis for interaction.

Two more that the descriptions themselves point out:

- **Text Input**'s `pressed` "is the focused state here and is flagged to rename to focus", and is
  still `pressed`. [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737)
- **Tab Item**'s description calls its selected tab and focus state `active` and `focused`; they are
  drawn as `selected` and `focus`, which is the right way round, so only the description needs
  updating. [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)

## 6. Variable bindings — 3 wrong, 5 unknown

**Wrong bindings** — a value bound to a variable of the wrong kind or from the wrong place:

| Component                      | Finding                                                                                                                          | Open                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Spinner**                    | The default indicator's colour is bound to `border/strong`, the stroke-_width_ variable. Presumably meant `color/border/strong`. | [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)   |
| **Tab Item**                   | A colour bound to `border/strong`, the stroke-width variable, as on Spinner.                                                     | [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)     |
| **Auth — Create Organization** | Bound to a local duplicate `Color(local):text/primary`, not the library variable.                                                | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461) |

**Unknown variables** — these layers are bound to five variables that are not in the Foundations
library at all, so we cannot tell what value they hold. They may have been deleted, detached or
taken from another library. Rebinding each to its Foundations equivalent fixes it.

| Component                                    | Bound property                                  | Uses | Open                                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Column Chooser**, **SearchResultsPanel**   | corner radius (all four corners)                | 88   | [6952:1068](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6952-1068), [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327) |
| **StatusIndicator**                          | a fill colour                                   | 4    | [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)                                                                                   |
| **Auth — Sign Up**, `.Component Description` | horizontal padding and gap                      | 5    | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885)                                                                               |
| **.Component Description**                   | font size (one variable), line height (another) | 2    | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612)                                                                               |

## 7. Documentation cards copied from Breadcrumbs — 45 pages

On 45 pages the documentation card holds the Breadcrumbs page's text ("Breadcrumbs compose from
Breadcrumb Items…", `aria-label="Breadcrumb"`) rather than a description of the page's own
component. It looks as if the card was duplicated from Breadcrumbs and never rewritten, so anyone
reading the card, person or tool, is told about the wrong component.

| Section                           | Pages                                                                                                     |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| components/cards                  | Accordion, Action Card, Card, Divider, Expandable Card, Insight Card, Insight Row, Status Card            |
| components/calendar               | Day Cell, Weekday Header, Event Chip, Time Slot, Calendar Toolbar                                         |
| components/dialogs                | Dialog, Confirmation Dialog, Drawer                                                                       |
| components/feedback               | Empty State, Spinner                                                                                      |
| components/navigation             | Nav Item, Stepper                                                                                         |
| components/data-display, overlays | Table, Popover                                                                                            |
| patterns/layout-shell             | App Shell, Command Palette, Page Header, Search Results Panel, Sidebar, Top Bar                           |
| patterns/data                     | Bulk Actions Bar, Column Chooser, Data Table, Filter Panel                                                |
| patterns/forms, dashboards        | Form Row, Form Section, Widget Card, Stat Card                                                            |
| views                             | Auth — Sign In, Invite Acceptance, Organization Selector, Month View, 403, 404, 500, Maintenance, Offline |

We can send the full list with a link to each page's card.

## 8. Button, Spinner, Icon Button and Button Group, variant by variant

These four are the components we build first, so we have read every one of their variants against
the others. SOLAR's model — geometry follows `size`, colour follows `prio`, `state` and `danger` —
holds almost everywhere; these are the places where it does not, or where a component disagrees
with a sibling. Where an item is open, we build it exactly as drawn.

### Button · [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)

**Fix** — these look like accidents:

| What                                                                                                                                                                                       | Variants                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| The **secondary** button has no background at `sm`. md and lg carry `action/secondary/bg/*`; sm has none, so it is transparent on a grey surface.                                          | 8: `sm / secondary` in default, pressed, focus and loading, with and without danger |
| The **lg disabled secondary** label uses `action/secondary/text/danger/disabled` although danger is off. Every other size uses `action/secondary/text/disabled`.                           | 1: `lg / secondary / disabled / danger=false`                                       |
| lg's gap is `12` and bound to nothing (every other size binds an inset). `inset/sm` has the same value. The two icon slots are `16` tall and unbound; their width already binds `icon/sm`. | all lg; all                                                                         |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                   | What we do meanwhile                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Is `lg` a different kind of button?** It is fixed at 200px wide, `space-between`, square (`radius/none`), borderless and has no resting shadow, though it keeps the focus ring. That reads like a full-width or menu button rather than a larger one. Also, tertiary gains a background only at lg, and secondary hover loses its background only at lg. | We build `lg` exactly as drawn.                             |
| **Tertiary hover switches the label to a link style** (`link/*/hover`, which is underlined). With danger it does not switch, and at lg it uses `link/md/default` — as does lg _secondary_ hover. Is the underline meant for tertiary hover everywhere?                                                                                                     | We reproduce each variant as drawn.                         |
| **Heights have no variable.** Button is 32 / 40 / 48px tall, lg is 200px wide and the counter badge 20px tall, all fixed and bound to nothing, and SOLAR publishes no control-size variable. Would you add one (e.g. `control/height/sm…lg`)? Section 4 is the same question from the other side.                                                          | We carry these as raw pixel values, the only ones we allow. |

### Spinner · [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)

- **Fix:** the default indicator's colour is bound to a width variable (section 6). We draw it with
  `color/border/strong` meanwhile, the colour whose inverse the inverse style uses.
- **⚠️ Decide:** the ring is 16, 24 and 32px across and bound to nothing. Should Spinner sizes be
  variables of their own, or follow the icon ladder (`icon/sm`, `icon/lg`, `icon/2xl` have the same
  values)?

### Icon Button · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)

Its sizes are in section 4 (described 28/36/44, drawn 32/40/48).

**Fix** — these look like accidents:

| What                                                                                                                                                                                        | Variants                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Disabled gains a border.** Tertiary has no border in any state but disabled, where it draws 1px `color/border/medium`; lg secondary is the same (no border at lg, but one when disabled). | 8: `tertiary / disabled` at every size and shape; `lg / secondary / disabled` |
| The icon is 12 / 16 / 20px wide and unbound; `icon/xs`, `icon/sm` and `icon/md` have the same values, and its height already binds them.                                                    | all                                                                           |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                     | What we do meanwhile                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Primary's border differs from Button's.** At sm, primary draws a grey 1px `color/border/medium` border at rest, in focus and while loading, and none on hover, press or disable; at md and lg it has none. Button's primary keeps `action/primary/border/default` (`#111111`) in every state at sm and md. Which is right? | We draw each variant as Figma does. |
| **Pressing shows the focus ring.** Pressed primary and secondary at sm and md draw `shadow/focus/default`, where Button's pressed state keeps its control shadow. Is a ring on press intended?                                                                                                                               | We draw each variant as Figma does. |
| **lg is flat**, as Button's lg is: no resting shadow, and secondary loses its border, keeping only the focus ring. The same question as Button's lg.                                                                                                                                                                         | We build lg as drawn.               |

The description asks for a 44 × 44 hit area around the smaller sizes; that waits on the same
target-size question as section 4.

### Button Group · [2618:3237](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2618-3237)

Three combinations are drawn — horizontal regular, vertical regular and horizontal full-width — and,
as the description says, there is no vertical full-width. We build those three and no other.

**Fix** — tidying:

| What                                                                                                                                                       | Variants                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| The hidden buttons keep a fixed width from before they were hidden (the tertiary 138px, the vertical group's third 431px), while every shown button fills. | `horizontal / regular`, `vertical / regular` |

**⚠️ Decide:**

| Question                                                                                                                                                      | What we do meanwhile                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **"Regular sizes to content"**, says the description, but regular's buttons are drawn filling the group in equal shares, as full-width's are. Which is meant? | We draw them filling, as drawn.                                      |
| **"All children must share the same prio"**, says the description, but every variant mixes secondary and primary. Is it one _size_ that is meant?             | We check (in development builds) only that the buttons share a size. |

---

# Part 2 · SOLAR Foundations

## 9. Guideline pages that contradict the variables

Where a guideline page and a variable disagree, we follow the variable; these pages should be
brought in line.

| Where                                     | Says                                                       | Variables say                                                       | Fix                                                                 |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Agentic Reference `[COLOR_TOKEN_GRAMMAR]` | `data: … category.01-08, scale.01-08`                      | `color.data.scale.100 … 900`                                        | Change `scale.01-08` to `scale.100-900`. `category.01-08` is right. |
| Color and Borders & Radius page contexts  | action states `{default\|hover\|focus\|pressed\|disabled}` | `default \| hover \| active \| disabled` — no `focus`, no `pressed` | ⚠️ Decide: rename the variables, or correct the pages               |

The States page also says "the variant value is pressed, never active", which the 96 action colour
variables contradict — SOLAR Web's buttons bind `action/*/bg/active` for their pressed state.

**Two edits needed on the Iconography page:**

- The **Outline vs Solid** and **Icon Library** slides say solid "uses a /Solid suffix" in a
  component set with "Size and Style variants", and the **Gatekeeper checklist** says "Sourced from
  Remix at every size", "Canvas matches the rendered size" and "Identical across sizes". The icons
  as built are one 24 × 24 canvas with a `solid` boolean, as the Sizing, Grid, Stroke and Naming
  slides already describe.
- The same checklist says an icon's fill is "bound to semantic tokens — `color.icon.*` or
  `color.action.*.icon.*`". Every one of the 680 icon variants is bound to the primitive
  `color/neutral/900`. ⚠️ Decide: rebind the masters to `color/icon/primary`, or say in the
  checklist that masters use the primitive. (It makes no difference to us: icons take their colour
  where they are used.)

## 10. Action colours below the contrast floor — 5

We checked all 96 `action/*` colour variables: each `icon` and `text` colour against the `bg` of the
same role and state, in both modes, laid over `surface/background` where the background is
see-through. The floor is WCAG 2.1 AA, which SOLAR names as its own: 3:1 for an icon, 4.5:1 for text
at the label sizes. Disabled colours are exempt.

| Variable                             | Mode  | Colour    | On                                 | Colour    | Contrast | Fix                                                                |
| ------------------------------------ | ----- | --------- | ---------------------------------- | --------- | -------- | ------------------------------------------------------------------ |
| `action/primary/icon/hover`          | Dark  | `#ffffff` | `action/primary/bg/hover`          | `#ffffff` | 1.00 : 1 | **Fix:** `{color/neutral/900}`, as `action/primary/text/hover` is  |
| `action/primary/icon/active`         | Dark  | `#ffffff` | `action/primary/bg/active`         | `#f5f5f5` | 1.09 : 1 | **Fix:** `{color/neutral/900}`, as `action/primary/text/active` is |
| `action/primary/text/danger/hover`   | Light | `#ffffff` | `action/primary/bg/danger/hover`   | `#f61d3c` | 4.07 : 1 | ⚠️ Decide: a darker hover red, or accept for the hover state       |
| `action/secondary/text/danger/hover` | Light | `#e0032d` | `action/secondary/bg/danger/hover` | `#ffe4df` | 4.13 : 1 | ⚠️ Decide: as above                                                |
| `action/tertiary/text/danger/hover`  | Light | `#e0032d` | `action/tertiary/bg/danger/hover`  | `#ffe4df` | 4.13 : 1 | ⚠️ Decide: as above                                                |

The first two are clearly mistakes: in Dark, a primary button's icons are white on its white hover
background, so they vanish, and nearly vanish when pressed. Every other mode and state of
`action/primary/icon/*` follows `action/primary/text/*`, and these two do not. Because our code
follows the variables, the apps show the same thing until the variables change. The three danger
hovers miss 4.5:1 narrowly; a hover state is transient, but the floor has no exception for it.

# Part 3 · SOLAR Icons

## 11. Icons and logos

**The 340 icons have no findings.** No strokes, no clipping masks, one fill per icon, 24 × 24 frames
throughout, both variants drawn for every icon, and every name unique.

Two questions about the logos:

- **⚠️ Decide: a flat Teams mark?** The Teams logo is drawn with 12 gradient fills and per-path
  opacity. The web draws it faithfully; our Flutter package has to leave it out, because redrawing
  that many radial gradients by hand is not worth it for one third-party mark. A flat-colour
  version, if Microsoft publishes one, would ship everywhere.
- **⚠️ Decide: a logo size scale.** There is `icon.xs … icon.2xl` but no `logo.*`. Our logo
  components borrow the icon ladder, which works but is not what either scale means.

---

# Decisions we need from you

The questions we cannot answer ourselves, most far-reaching first.

**Sizes and targets**

1. **Control heights** — the descriptions say 36/44px and the components are drawn 32/40px. Which
   is right, and is 44px the intended hit area? A control-height variable (`control/height/*`) and
   a target-size variable would settle both this and Button's fixed heights. Sections 4 and 8.
2. **Spinner sizes** — variables of their own, or the icon ladder? Section 8.
3. **A logo size scale** (`logo.*`)? Section 11.

**Colour**

4. **Danger hover labels** at 4.07 and 4.13 : 1 — a darker hover red, or an accepted exception for
   the hover state? Section 10.
5. **`color/brand/red` (19 components) and `color/purple/700` (12)** — fixed brand colours, or
   should they be semantic? Section 3.
6. **Avatar's 45 palette colours** — a deliberate identity palette that wants its own tokens?
   Section 3.
7. **Icon master colour** — the semantic `color/icon/primary`, or the primitive the checklist
   should then mention? Section 9.

**Components**

8. **Button `lg`** — a larger button, or a different kind (full-width or menu)? Icon Button's lg is
   flat the same way. Section 8.
9. **Tertiary hover's underline** — meant everywhere, or only where it is drawn? Section 8.
10. **Icon Button's primary border** — grey at sm and only at rest, where Button's primary keeps its
    `#111111` action border in every state. Which is right? Section 8.
11. **A focus ring on press** — Icon Button's pressed primary and secondary show it, Button's do
    not. Intended? Section 8.
12. **Button Group's description** — "regular sizes to content" and "all children share one prio",
    where every group is drawn with filling buttons of mixed priority. Section 8.
13. **The remaining state values** — `today`, `other-month`, `no-results`, `edit`, `search`,
    `rename`: booleans of their own? Section 5.

**Structure**

14. **Action states** — `active` in the variables, `pressed` on the guideline pages. Which name
    should both use? Section 9.
15. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR
    Web rather than in Foundations. Should it move down a layer?
16. **A flat Teams mark**, if Microsoft publishes one? Section 11.

---

_Read from SOLAR Foundations `[v1--2026]` version `2402389239778582681`, SOLAR Web `[v1--2026]`
version `2402412754718078809` and SOLAR Icons `[v2--2026]` version `2402400024423705866`, on
2026-09-24. Counts are computed from the files, not estimated. We are happy to walk through any of
this live — and happy to be wrong on the judgement calls, where we may be missing context._
