# SOLAR — Figma fix list

**Prepared for:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-23, third revision (after the afternoon's changes to all three files)

Everything below is something we think can be fixed or improved **in Figma**, read from the three
SOLAR files as they stand now. This is a work list, not a critique — most items are small and
mechanical, and each one is something only you can change.

## How to use this

Every row links straight to the node in Figma. Work top to bottom within a section, or take a
whole section at a time.

- **Fix** — clearly wrong, no judgement needed.
- **⚠️ Decide** — we can see something is off but the right answer is a design call.

Where we suggest a token, we picked the one whose value already matches what is drawn, so in most
cases the visual result does not change at all.

**Scope note.** Part 1 covers the 196 components our build currently reads. We have paused on 28
view pages — Generic Views, Account & Identity, Organization & Admin, Communications, Devices &
Operations and Help & Discovery — so the sets on those pages are not measured here. That is a
decision about our pipeline, not about your file. Parts 2 and 3 cover their files completely.

## Thank you — fixed since the last list

Since this morning's list:

- **Button's description** is rewritten: it now gives 108 variants, the right size and state lists,
  and says `xl` became `lg`. All three description findings are gone.
- **Both duplicate state spellings** are gone: Icon Button no longer has `active` beside `pressed`
  (108 variants), and Text Area no longer has `focused` beside `focus`.
- **`ghost` and `destructive` are now booleans** rather than state values, on Status Card, Insight
  Card, Insight Card Small, Insight Row, Stat Card, Stat Card Small, Schedule Strip,
  SearchResultsPanel and Context Menu Item — the question we asked about them, answered.
- **Property names are consistently lower case**: Alert (`type`, `style`), Banner (`type`), Option
  Row (`control`), Avatar (`shade`), Dropdown Group Label, Cursor, and the `breakpoint`,
  `expanded` and `isLoggedIn` values on the layout patterns.
- **Banner** now has one visibility prop per button (`Show Primary Button` and
  `Show Secondary Button`) instead of one prop driving both, and no longer uses a primitive colour.
- **23 hard-coded values are bound**, including the oversized gaps that looked like layout
  accidents on TableFooter (242px), TableHeader (692px) and Coachmark (122px), ProgressBar's pill
  radius, Launch Card Full Screen, Day Cell, Chart Tooltip, Bar Stack, Split Dialog, Section Nav
  and the `.Component Description` frame.
- **Icons:** the duplicate `Icon/Phone` on Audio & DSP is deleted. The icon file has **no findings
  left at all**.
- **Stepper**'s 197px step gap is now 16px and bound to a variable — one of the two layout
  accidents we flagged.
- **Foundations:** Iconography now says one stroke weight across the set, not per size.

## Summary

| #                                                                      | What                                                              | Count             | File        |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ----------------- | ----------- |
| [1](#1-components-with-no-description--24)                             | Components with no description                                    | 24                | SOLAR Web   |
| [2](#2-hard-coded-values--55-across-11-components)                     | Hard-coded values not bound to a variable                         | 55 in 11          | SOLAR Web   |
| [3](#3-primitive-colours-used-directly--32-components)                 | Components using primitive colours directly                       | 32                | SOLAR Web   |
| [4](#4-described-sizes-that-disagree-with-the-drawing--11-components)  | Described sizes that disagree with the drawn ones                 | 11                | SOLAR Web   |
| [5](#5-state-values-outside-the-standard-ladder--5)                    | State values outside the standard ladder                          | 5                 | SOLAR Web   |
| [6](#6-variable-binding--3-wrong-bindings-5-unknown-variables)         | Wrong or unknown variable bindings                                | 3 + 5             | SOLAR Web   |
| [7](#7-documentation-cards-copied-from-breadcrumbs--45-pages)          | Documentation cards copied from Breadcrumbs                       | 45 pages          | SOLAR Web   |
| [8](#8-button-spinner-icon-button-and-button-group-variant-by-variant) | Button, Spinner, Icon Button and Button Group, variant by variant | 4 + 3 + 2 + 5 + 4 | SOLAR Web   |
| [9](#9-pages-that-still-contradict-the-variables--2)                   | Pages that still contradict the variables                         | 2 + 2             | Foundations |
| [10](#10-action-colours-below-the-contrast-floor--5)                   | Action colours below the contrast floor                           | 5                 | Foundations |
| [11](#11-icons-and-logos)                                              | Icons and logos                                                   | 0 + 2             | SOLAR Icons |

**If you only do three things:** decide the control heights in section 4 (it touches eleven
components and the touch-target question), replace the Breadcrumbs text on the 45 documentation
cards in section 7, and fix Stepper's last layout accident at the top of section 2. **And one
quick fix that users would see:** in Dark, a primary button's icons disappear on hover (section 10).

---

# Part 1 · SOLAR Web

## 1. Components with no description — 24

Unchanged since the last list. Every `components/*` set and every `patterns/*` set is described;
what is left is three view groups and one utility frame.

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
density changes, and they are invisible unless you inspect the layer.

The count went up only because the calendar views are now read in full: **Resource View** repeats
the same five values across its header and resource rows, which is 46 of the 55. Nine components
are down to one or two values each.

**53 of the 55 match a token exactly** and can be bound with no visual change. `inset.*` is padding
inside a container; `stack.*` is the gap between siblings, so auto-layout _gap_ binds to `stack.*`
and _padding_ to `inset.*`, even though the two scales carry the same numbers.

**Fix first — one layout accident left** (TableFooter's, TableHeader's, Coachmark's and Stepper's
197px step gap are fixed):

| Component   | Layer    | Property     | Value   | Open                                                                           |
| ----------- | -------- | ------------ | ------- | ------------------------------------------------------------------------------ |
| **Stepper** | Progress | paddingRight | `225px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846) |

It has no token anywhere near (the scale stops at 40px), and looks like a width that should follow
from the number of steps rather than fixed spacing. A small note on the gap just fixed: it is bound
to `inset/md`, a padding token; `stack/md` is the gap token of the same value.

**Resource View** · views/calendar · 46 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6827-2)

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

| Layer                                                    | Property | Current | Bind to                                                        |
| -------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------- |
| Calendar Body › Calendar Surface › All-Day Strip › Frame | gap      | `2px`   | ⚠️ no spacing token at 2px (it exists only as `border.strong`) |

**The rest match a token exactly:**

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

A primitive is a raw palette entry. Bound directly it will not follow Light/Dark, because only the
semantic tokens are reassigned per mode. Banner is fixed; **Resource View** is new (`neutral/50`).
Most of the rest are the same few colours repeated.

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

**New.** Eleven descriptions give a control height in pixels that the component does not have.
Across the button, tab and input families the pattern is the same: **the description says 36px
and 44px, the component is drawn 32px and 40px** — the description's numbers are 4px taller.
Icon Button is off by 4px the other way. For the inputs we compared the field itself, not the whole
component with its label and helper.

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
saying "drawn at 32/40, hit area 44" in each description would settle it. **We ship what is drawn**
(32 and 40), and pad nothing yet, because there is no token for the target size (see the decisions
list).

## 5. State values outside the standard ladder — 5

Down from 12: both duplicate spellings and every `ghost` and `destructive` are fixed. What is left:

| Component              | Section               | Values                           | Open                                                                             |
| ---------------------- | --------------------- | -------------------------------- | -------------------------------------------------------------------------------- |
| **Tree Item**          | components/navigation | edit                             | [2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)   |
| **Day Cell**           | components/inputs     | today                            | [3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)       |
| **Day Cell**           | components/calendar   | other-month, today, today-column | [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)       |
| **SearchResultsPanel** | patterns/layout-shell | no-results                       | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Sidebar Locations**  | patterns/layout-shell | search, no-results, rename       | [10406:1217](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10406-1217) |

The same treatment `ghost` got would fit most of these: `today`, `other-month` and `no-results`
describe content, not interaction, and read naturally as booleans.

Two more, not flagged by the ladder check because Figma's descriptions already say so:

- **Text Input**'s `pressed` "is the focused state here and is flagged to rename to focus" —
  still `pressed`. [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737)
- **Tab Item**'s selected tab and focus state are described as `active` and `focused` in the
  description but drawn as `selected` and `focus`, which is the right way round — only the
  description needs the update. [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)

## 6. Variable binding — 3 wrong bindings, 5 unknown variables

**Wrong bindings** (unchanged):

| Component                      | Finding                                                                                                                          | Open                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Spinner**                    | The default indicator's colour is bound to `border/strong`, the stroke-_width_ variable. Presumably meant `color/border/strong`. | [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)   |
| **Tab Item**                   | A colour bound to `border/strong`, the stroke-width variable, as on Spinner.                                                     | [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)     |
| **Auth — Create Organization** | Bound to a local duplicate `Color(local):text/primary`, not the library variable.                                                | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461) |

**Unknown variables — new to this list.** These layers are bound to five variables that are not in
the Foundations library at all; we cannot tell what value they hold. They may be deleted, detached
or from another library. Rebinding each to its Foundations equivalent would fix it.

| Component                                    | Bound property                                  | Uses | Open                                                                                                                                                           |
| -------------------------------------------- | ----------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Column Chooser**, **SearchResultsPanel**   | corner radius (all four corners)                | 88   | [6952:1068](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6952-1068), [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327) |
| **StatusIndicator**                          | a fill colour                                   | 4    | [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)                                                                                   |
| **Auth — Sign Up**, `.Component Description` | horizontal padding and gap                      | 5    | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885)                                                                               |
| **.Component Description**                   | font size (one variable), line height (another) | 2    | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612)                                                                               |

## 7. Documentation cards copied from Breadcrumbs — 45 pages

**New to this list, though not new in the file.** On 45 pages the documentation card still holds
the Breadcrumbs page's text ("Breadcrumbs compose from Breadcrumb Items…", `aria-label="Breadcrumb"`)
rather than a description of the page's own component — it looks like the card was duplicated from
Breadcrumbs and never rewritten. Anyone reading the card, person or tool, is told about the wrong
component.

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

The full list with each page's link is in our generated
[`docs/solar-web/issues.md`](solar-web/issues.md#page-level-findings-45-pages).

---

## 8. Button, Spinner, Icon Button and Button Group, variant by variant

We generate these components from their variants, reading every variant against the others.
SOLAR's model holds almost everywhere — **geometry follows `size`, colour follows `prio`, `state`
and `danger`** — and these are the places where it does not. `xl` is `lg` now; nothing else about
Button changed in this revision, so all of these still stand.

### Button · [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)

**Fix** — these look like accidents:

| What                                                                                                                                                                                    | Variants                                                                            |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| The **secondary** button has no background at `sm`. md and lg carry `action/secondary/bg/*`; sm has none, so it is transparent on a grey surface.                                       | 8: `sm / secondary` in default, pressed, focus and loading, with and without danger |
| The **lg disabled secondary** label uses `action/secondary/text/danger/disabled` although danger is off. Every other size uses `action/secondary/text/disabled`.                        | 1: `lg / secondary / disabled / danger=false`                                       |
| Vertical padding is `0` but bound to nothing. `inset/none` has the same value.                                                                                                          | all                                                                                 |
| lg's gap is `12` and bound to nothing (every other size binds an inset). `inset/sm` has the same value. The two icon slots are `16` tall, unbound; their width already binds `icon/sm`. | all lg; all                                                                         |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                   | What we do meanwhile                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Is `lg` a different kind of button?** It is fixed at 200px wide, `space-between`, square (`radius/none`), borderless and has no resting shadow, though it keeps the focus ring. That reads like a full-width or menu button rather than a larger one. Also, tertiary gains a background only at lg, and secondary hover loses its background only at lg. | We ship `lg` exactly as drawn.                              |
| **Tertiary hover switches the label to a link style** (`link/*/hover`, which is underlined). With danger it does not switch, and at lg it uses `link/md/default` — as does lg _secondary_ hover. Is the underline meant for tertiary hover everywhere?                                                                                                     | We reproduce each variant as drawn.                         |
| **Heights have no token.** Button is 32 / 40 / 48px tall, lg is 200px wide and the counter badge 20px tall, all fixed and bound to nothing, and SOLAR publishes no control-size token. Would you add one (e.g. `control/height/sm…lg`)? Section 4 is the same question from the other side.                                                                | We carry these as raw pixel values, the only ones we allow. |

### Spinner · [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)

New on this list: we now generate Spinner too, because Button's loading state shows it.

- **Fix:** the default indicator's colour (section 6). We draw it with `color/border/strong`
  meanwhile, the colour whose inverse the inverse style uses.
- **Fix:** the frame's padding and gap are `0` and bound to nothing; `inset/none` has the same value.
- **⚠️ Decide:** the ring is 16, 24 and 32px across and bound to nothing. Should Spinner sizes be
  tokens, or follow the icon ladder (`icon/sm`, `icon/lg`, `icon/2xl` have the same values)?

### Icon Button · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)

New on this list: we now generate Icon Button. Its sizes are in section 4 (described 28/36/44,
drawn 32/40/48).

**Fix** — these look like accidents:

| What                                                                                                                                                                                                                             | Variants                                                                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Disabled gains a border.** Tertiary has no border in any state but disabled, where it draws 1px `color/border/medium`; lg secondary is the same (no border at lg, but one when disabled).                                      | 8: `tertiary / disabled` at every size and shape; `lg / secondary / disabled` |
| The frame's padding and gap are `0` and bound to nothing; `inset/none` has the same value. The icon is 12 / 16 / 20px wide, unbound; `icon/xs`, `icon/sm` and `icon/md` have the same values, and its height already binds them. | all                                                                           |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                     | What we do meanwhile                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Primary's border differs from Button's.** At sm, primary draws a grey 1px `color/border/medium` border at rest, in focus and while loading, and none on hover, press or disable; at md and lg it has none. Button's primary keeps `action/primary/border/default` (`#111111`) in every state at sm and md. Which is right? | We draw each variant as Figma does. |
| **Pressing shows the focus ring.** Pressed primary and secondary at sm and md draw `shadow/focus/default`, where Button's pressed state keeps its control shadow. Is a ring on press intended?                                                                                                                               | We draw each variant as Figma does. |
| **lg is flat**, as Button's lg is: no resting shadow, and secondary loses its border, keeping only the focus ring. The same question as Button's lg.                                                                                                                                                                         | We ship lg as drawn.                |

The description asks for a 44 × 44 hit area around the smaller sizes; that waits on the same
target-size token as section 4. Flutter already pads the tap target to 48 on its own.

### Button Group · [2618:3237](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2618-3237)

New on this list: we now generate Button Group. We build the three combinations you draw
(horizontal regular, vertical regular, horizontal full-width) and, as the description says, no
vertical full-width.

**Fix** — tidying:

| What                                                                                                                                                       | Variants                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Full-width's padding is `0` and bound to nothing; `inset/none` has the same value.                                                                         | `horizontal / full-width`                    |
| The hidden buttons keep a fixed width from before they were hidden (the tertiary 138px, the vertical group's third 431px), while every shown button fills. | `horizontal / regular`, `vertical / regular` |

**⚠️ Decide:**

| Question                                                                                                                                                      | What we do meanwhile                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **"Regular sizes to content"**, says the description, but regular's buttons are drawn filling the group in equal shares, as full-width's are. Which is meant? | We draw them filling, as drawn.               |
| **"All children must share the same prio"**, says the description, but every variant mixes secondary and primary. Is it one _size_ that is meant?             | We warn (in development) on mixed sizes only. |

# Part 2 · SOLAR Foundations

## 9. Pages that still contradict the variables — 2

Unchanged in this revision; both still stand.

| Where                                     | Says                                                       | Variables say                                                       | Fix                                                                 |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Agentic Reference `[COLOR_TOKEN_GRAMMAR]` | `data: … category.01-08, scale.01-08`                      | `color.data.scale.100 … 900`                                        | Change `scale.01-08` to `scale.100-900`. `category.01-08` is right. |
| Color and Borders & Radius page contexts  | action states `{default\|hover\|focus\|pressed\|disabled}` | `default \| hover \| active \| disabled` — no `focus`, no `pressed` | ⚠️ Decide: rename the variables, or correct the pages               |

The States page also still says "the variant value is pressed, never active", which the 96 action
colour variables contradict — SOLAR Web's buttons bind `action/*/bg/active` for their pressed
state. We have followed the variables.

**Two unfinished edits on the Iconography page:**

- The stroke sentence is fixed, but the **Outline vs Solid** and **Icon Library** slides still say
  solid "uses a /Solid suffix" in a component set with "Size and Style variants", and the
  **Gatekeeper checklist** still says "Sourced from Remix at every size", "Canvas matches the
  rendered size" and "Identical across sizes". The shipped icons are one 24 × 24 canvas with a
  `solid` boolean, which the Sizing, Grid, Stroke and Naming slides already describe.
- The same checklist says an icon's fill is "bound to semantic tokens — `color.icon.*` or
  `color.action.*.icon.*`". Every one of the 680 icon variants is bound to the primitive
  `color/neutral/900`. ⚠️ Decide: rebind the masters to `color/icon/primary`, or say in the
  checklist that masters use the primitive. (It makes no difference to us: icons take their
  colour where they are used.)

## 10. Action colours below the contrast floor — 5

New in this revision, found when we first looked at Button in Dark in our component gallery. We
then checked every one of the 96 `action/*` colour variables the same way: each `icon` and `text`
colour against the `bg` of the same role and state, in both modes, laid over
`surface/background` where the background is see-through. The floor is WCAG 2.1 AA, which SOLAR
names as its own: 3:1 for an icon, 4.5:1 for text at the label sizes. Disabled colours are exempt.

| Variable                             | Mode  | Colour    | On                                 | Colour    | Contrast | Fix                                                                |
| ------------------------------------ | ----- | --------- | ---------------------------------- | --------- | -------- | ------------------------------------------------------------------ |
| `action/primary/icon/hover`          | Dark  | `#ffffff` | `action/primary/bg/hover`          | `#ffffff` | 1.00 : 1 | **Fix:** `{color/neutral/900}`, as `action/primary/text/hover` is  |
| `action/primary/icon/active`         | Dark  | `#ffffff` | `action/primary/bg/active`         | `#f5f5f5` | 1.09 : 1 | **Fix:** `{color/neutral/900}`, as `action/primary/text/active` is |
| `action/primary/text/danger/hover`   | Light | `#ffffff` | `action/primary/bg/danger/hover`   | `#f61d3c` | 4.07 : 1 | ⚠️ Decide: a darker hover red, or accept for the hover state       |
| `action/secondary/text/danger/hover` | Light | `#e0032d` | `action/secondary/bg/danger/hover` | `#ffe4df` | 4.13 : 1 | ⚠️ Decide: as above                                                |
| `action/tertiary/text/danger/hover`  | Light | `#e0032d` | `action/tertiary/bg/danger/hover`  | `#ffe4df` | 4.13 : 1 | ⚠️ Decide: as above                                                |

The first two are clearly mistakes: in Dark, a primary button's icons are white on its white
hover background, so they vanish, and nearly vanish when pressed. Every other mode and state of
`action/primary/icon/*` follows `action/primary/text/*`, and these two do not. The three danger
hovers miss 4.5:1 narrowly; a hover state is transient, but the floor has no exception for it.

# Part 3 · SOLAR Icons

## 11. Icons and logos

**340 icons, and no findings.** No strokes, no clipping masks, one fill per icon, 24 × 24 frames
throughout, and both variants drawn for every icon. The name collision is gone with the Audio & DSP
`Icon/Phone`, so every icon now takes its component name from its Figma name.

Two questions about the logos, which were never on this list:

- **⚠️ Decide: a flat Teams mark?** The Teams logo is drawn with 12 gradient fills and per-path
  opacity. The web draws it faithfully; our Flutter package has to leave it out, because redrawing
  that many radial gradients by hand is not worth it for one third-party mark. A flat-colour
  version, if Microsoft publishes one, would ship everywhere.
- **⚠️ Decide: a logo size scale.** There is `icon.xs … icon.2xl` but no `logo.*`. Our logo
  components borrow the icon ladder, which works but is not what either scale means.

---

# Decisions we need from you

These are the ones we genuinely cannot answer:

1. **Control heights** — the descriptions say 36/44px and the components are drawn 32/40px
   (section 4). Which is right, and is 44px the intended hit area? A control-size token
   (`control/height/*`) and a target-size token would settle both this and Button's heights.
2. **Button `lg`** — a larger button, or a different kind (full-width or menu)? Section 8.
3. **Tertiary hover's underline** — meant everywhere, or only where it is drawn? Section 8.
4. **The remaining state values** — `today`, `other-month`, `no-results`, `edit`, `search`,
   `rename`: booleans, as `ghost` became? Section 5.
5. **Avatar's 45 palette colours** — a deliberate identity palette that wants its own tokens?
6. **`color/brand/red` (19 components) and `color/purple/700` (12)** — intentional brand colour,
   or should they be semantic? They are the two biggest entries in section 3.
7. **Action states** — `active` in the variables, `pressed` on the pages. Section 9.
8. **Icon master colour** — semantic token or primitive? Section 9.
9. **Spinner sizes** — tokens, or the icon ladder? Section 8.
10. **Logos** — a flat Teams mark, and a `logo.*` size scale. Section 11.
11. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR
    Web rather than in Foundations. Should it move down a layer?

---

_Extracted from SOLAR Foundations `[v1--2026]` version `2402389239778582681`, SOLAR Web
`[v1--2026]` version `2402405917143022507` and SOLAR Icons `[v2--2026]` version
`2402400024423705866`, all read on 2026-09-23. Counts are computed from the files, not estimated,
and each section was re-checked against this revision rather than carried over. Happy to walk
through any of this live — and happy to be wrong on the judgement calls, where we may be missing
context._
