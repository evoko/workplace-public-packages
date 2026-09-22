# SOLAR — Figma fix list

**Prepared for:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-22

Everything below is something we think can be fixed or improved **in Figma**, read from the three
SOLAR files as they stand today. This is a work list, not a critique — most items are small and
mechanical, and each one is something only you can change.

## How to use this

Every row links straight to the node in Figma. Work top to bottom within a section, or take a whole
section at a time.

- **Fix** — clearly wrong, no judgement needed.
- **⚠️ Decide** — we can see something is off but the right answer is a design call.

Where we suggest a token, we picked the one whose value already matches what is drawn, so in most
cases the visual result does not change at all.

The counts below cover **the whole SOLAR Web file**, all 227 component sets. Our own build now
skips 28 view pages that are out of scope for us this quarter, so the totals in our generated
`issues.md` are smaller. That is a decision about our pipeline, not about your file — the items
below are worth fixing either way.

## Summary

| #                                                                                 | What                                                      | Count       | File        |
| --------------------------------------------------------------------------------- | --------------------------------------------------------- | ----------- | ----------- |
| [1](#1-components-with-no-description--78)                                        | Components with no description                            | 78          | SOLAR Web   |
| [2](#2-hard-coded-values--44-across-27-components)                                | Hard-coded values not bound to a variable                 | 44          | SOLAR Web   |
| [3](#3-primitive-colours-used-directly--44-components)                            | Components using primitive colours directly               | 44          | SOLAR Web   |
| [4](#4-descriptions-that-contradict-the-component-set--3-findings-on-1-component) | Descriptions that contradict the set                      | 3 on Button | SOLAR Web   |
| [5](#5-state-and-axis-naming--12)                                                 | State and axis naming inconsistencies                     | 12          | SOLAR Web   |
| [6](#6-variable-binding--1-local-duplicate-2-non-colour-bound-as-colour)          | Local duplicate and non-colour bindings                   | 3           | SOLAR Web   |
| [7](#7-documentation-pages-that-publish-wrong-values)                             | Doc pages publishing values that contradict the variables | 9 areas     | Foundations |
| [8](#8-page-artifacts-and-copy-paste-errors)                                      | Page artifacts and copy-paste errors                      | 6           | Foundations |
| [9](#9-icons--7-findings-on-5-icons)                                              | Icon fixes                                                | 5 icons     | SOLAR Icons |

**If you only do three things:** the four layout accidents at the top of section 2 (a `225px` padding,
a `197px` gap, a `122px` gap and a negative gap), the spacing scale in section 7.1, and the two
unbound icon fills in section 9.

---

# Part 1 · SOLAR Web

## 1. Components with no description — 78

Every one of the 33 `components/*` sets now carries a description. What is left sits in
`patterns/*` and `views/*`, which are the compositions — still worth describing, because the
description is the only place in Figma that records what something is _for_.

**26 patterns** and **51 views**. Patterns first: they are reused across views, so describing them pays twice.

### Patterns

| Figma page                                 | Component                    | Variants | Open                                                                             |
| ------------------------------------------ | ---------------------------- | -------- | -------------------------------------------------------------------------------- |
| Schedule Strip                             | **Schedule Entry**           | 8        | [6593:41012](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41012) |
| Schedule Strip                             | **Schedule Strip**           | 3        | [6593:41547](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547) |
| Time Range Selector                        | **Time Range Selector**      | 2        | [7266:25548](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-25548) |
| Activity Feed                              | **Activity Feed**            | 2        | [8512:5284](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5284)   |
| Activity Feed                              | **Activity Feed Filter Row** | 2        | [8512:5759](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)   |
| Bulk Actions Bar                           | **Bulk Actions Bar**         | 1        | [6786:85](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6786-85)       |
| Column Chooser                             | **Column Chooser**           | 3        | [6952:1068](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6952-1068)   |
| Column Chooser                             | **ColumnRow**                | 4        | [6951:14726](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6951-14726) |
| Data Table                                 | **DataTable**                | 4        | [6596:47707](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-47707) |
| Facet Group                                | **Facet Group**              | 1        | [5739:86](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5739-86)       |
| Form Section                               | **FormSection**              | 1        | [5612:6418](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5612-6418)   |
| Top Bar                                    | **App Name**                 | 3        | [6177:20350](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20350) |
| App Switcher                               | **AppSwitcherItem**          | 1        | [6431:1625](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6431-1625)   |
| Command Palette                            | **Command Item**             | 2        | [5760:4612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-4612)   |
| Command Palette                            | **Command Palette**          | 1        | [5607:3799](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5607-3799)   |
| Shell Tier 4 · Client app (Chatter)        | **Layout**                   | 2        | [6499:6699](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6699)   |
| Shell Tier 2 · Canvas app                  | **Layout / Canvas**          | 2        | [6499:6448](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6448)   |
| Shell Tier 3 · Config app (Chatter Config) | **Layout / Config**          | 2        | [6499:6532](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6532)   |
| Shell Tier 1 · Workplace                   | **Layout / Workplace**       | 2        | [6498:5921](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6498-5921)   |
| Page Header                                | **Page Header**              | 3        | [6186:21246](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246) |
| Search Results Panel                       | **ResultRow**                | 1        | [5808:14608](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5808-14608) |
| Search Results Panel                       | **SearchResultsPanel**       | 4        | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| Section Nav                                | **Section Nav**              | 1        | [8045:7](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8045-7)         |
| Sidebar                                    | **Sidebar**                  | 2        | [2666:781](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2666-781)     |
| Top Bar                                    | **Top Bar**                  | 6        | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| Tree Navigation Panel                      | **Tree Navigation Panel**    | 1        | [3773:518](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-518)     |

### Views

| Figma page                   | Component                             | Variants | Open                                                                             |
| ---------------------------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Account Settings             | **Account Settings**                  | 9        | [7706:14605](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7706-14605) |
| Linked Accounts & API Tokens | **Linked Accounts & API Tokens**      | 2        | [7506:27098](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7506-27098) |
| User Profile                 | **User Profile**                      | 2        | [7400:23455](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455) |
| Join or Create Organization  | **Auth — Create Organization**        | 2        | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| Forgot Password              | **Auth — Forgot Password**            | 2        | [7776:21546](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-21546) |
| Invite Acceptance            | **Auth — Invite Acceptance**          | 2        | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| Join or Create Organization  | **Auth — Join Organization**          | 2        | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)   |
| MFA Challenge                | **Auth — MFA Challenge**              | 2        | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| Reset Password               | **Auth — Reset Password / Default**   | 1        | [6136:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6136-58)       |
| Reset Password               | **Auth — Reset Password / Default**   | 1        | [6137:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6137-58)       |
| Session Expired              | **Auth — Session Expired**            | 2        | [7810:21910](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21910) |
| Auth — Sign In               | **Auth — Sign In / Email**            | 2        | [6177:20771](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20771) |
| Auth — Sign In               | **Auth — Sign In / Email + Password** | 2        | [6177:20772](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20772) |
| Auth — Sign Up               | **Auth — Sign Up**                    | 2        | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885) |
| Organization Selector        | **Organization Selector**             | 4        | [6592:38886](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6592-38886) |
| Organization Selector        | **Organization Selector Overlay**     | 1        | [9511:29064](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9511-29064) |
| Agenda View                  | **Agenda View**                       | 1        | [6825:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6825-2)         |
| Day View                     | **Day View**                          | 1        | [6822:119](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6822-119)     |
| Resource View                | **Resource View**                     | 1        | [6827:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6827-2)         |
| Week View                    | **Week View**                         | 1        | [6811:17](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6811-17)       |
| Year View                    | **Year View**                         | 1        | [6829:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6829-2)         |
| Activity Log                 | **Activity Log**                      | 2        | [7470:25944](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-25944) |
| Announcements / What's New   | **Announcements / What's New**        | 2        | [8488:384](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8488-384)     |
| Notification Center          | **Notification Center**               | 2        | [8473:227](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8473-227)     |
| Device Detail                | **Device Detail**                     | 2        | [8616:112](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8616-112)     |
| Device List                  | **Devices List**                      | 2        | [6783:8331](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6783-8331)   |
| File & Asset Browser         | **File & Asset Browser**              | 6        | [8243:2826](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8243-2826)   |
| Dashboard                    | **Dashboard**                         | 2        | [7229:9275](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)   |
| Detail Side Panel            | **Detail Side Panel**                 | 1        | [8366:14304](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8366-14304) |
| Entity List                  | **Entity List**                       | 2        | [7776:14270](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-14270) |
| Entity Detail                | **Entity List**                       | 2        | [7776:11871](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-11871) |
| Search Results               | **Search Results**                    | 2        | [7470:23845](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845) |
| Search Results               | **Search Results Item**               | 1        | [7266:12882](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-12882) |
| Settings                     | **Settings**                          | 8        | [7058:43950](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7058-43950) |
| AI Assistant                 | **AI Assistant**                      | 1        | [8484:203](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8484-203)     |
| AI Assistant                 | **AI Assistant / Chat Message**       | 2        | [8566:86](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8566-86)       |
| AI Assistant                 | **AI Assistant / Conversation Event** | 2        | [8569:90](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8569-90)       |
| Help Center                  | **Help Center**                       | 2        | [8453:418](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8453-418)     |
| Keyboard Shortcuts           | **Keyboard Shortcuts**                | 1        | [8504:198](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8504-198)     |
| API & Webhooks               | **API & Webhooks**                    | 2        | [8449:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8449-1130)   |
| Audit Log                    | **Audit Log**                         | 2        | [8475:1244](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8475-1244)   |
| Billing History              | **Billing History**                   | 2        | [8389:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8389-1130)   |
| General                      | **General**                           | 2        | [8407:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8407-1130)   |
| Members                      | **Members**                           | 2        | [8083:6420](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8083-6420)   |
| Roles & Permissions          | **Roles & Permissions**               | 3        | [8366:3995](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8366-3995)   |
| SSO & SAML                   | **SSO & SAML**                        | 2        | [8421:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8421-1130)   |
| 403 Forbidden                | **403 Forbidden**                     | 2        | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| 404 Not Found                | **404 Not Found**                     | 2        | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| 500 Server Error             | **500 Server Error**                  | 2        | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| Maintenance                  | **Maintenance**                       | 2        | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| Offline                      | **Offline**                           | 2        | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

### Other

| Figma page | Component                  | Variants | Open                                                                             |
| ---------- | -------------------------- | -------- | -------------------------------------------------------------------------------- |
| .[UTILITY] | **.Component Description** | 1        | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612) |

## 2. Hard-coded values — 44 across 27 components

Paddings, gaps and radii typed in as numbers rather than bound to a variable. They do not follow
theme or density changes, and they are invisible unless you inspect the layer.

The easy ones are gone. **16 of the 44 still match a token exactly** and can be bound with no
visual change. The other **28 sit off the scale** and need a decision — mostly because SOLAR has no
token at that value at all.

**Note on which family to use.** `inset.*` is padding inside a container; `stack.*` is the gap
between siblings. Auto-layout _gap_ therefore binds to `stack.*`, and _padding_ to `inset.*`, even
though the two scales carry identical numbers.

Four values account for most of the off-scale group:

| Value  | Times | Nearest token      | Comment                                                   |
| ------ | ----- | ------------------ | --------------------------------------------------------- |
| `6px`  | 5     | `stack.2xs (4px)`  | 6px exists as `radius.control`, but not as a spacing step |
| `32px` | 5     | `stack.2xl (28px)` | the scale steps 28 → 40, so 32 has no home                |
| `18px` | 4     | `stack.md (16px)`  | all four are on one component, Launch Card Full Screen    |
| `2px`  | 3     | `stack.none (0px)` | 2px exists as `border.strong`, but not as a spacing step  |

Four values are not scale gaps but almost certainly layout accidents, and are worth looking at first:

| Component        | Layer                                                                                               | Property     | Value   | Open                                                                               |
| ---------------- | --------------------------------------------------------------------------------------------------- | ------------ | ------- | ---------------------------------------------------------------------------------- |
| **Stepper**      | Progress                                                                                            | paddingRight | `225px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)     |
| **Stepper**      | Steps                                                                                               | gap          | `197px` | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)     |
| **User Profile** | FormSection › Reports and Direct Reports Container › Direct Reports Container › Direct Reports Info | gap          | `-8px`  | [7400:23455](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455)   |
| **Coachmark**    | Connector                                                                                           | gap          | `122px` | [10813:32930](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10813-32930) |

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

**API & Webhooks** · views/org-admin · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8449-1130)

| Layer                                           | Property | Current | Bind to    |
| ----------------------------------------------- | -------- | ------- | ---------- |
| Center › Body › Webhook endpoints › head        | gap      | `16px`  | `stack.md` |
| Center › Body › Webhook endpoints › Webhook Row | gap      | `16px`  | `stack.md` |
| Center › Body › Webhook endpoints › Webhook Row | gap      | `16px`  | `stack.md` |

**Help Center** · views/help · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8453-418)

| Layer              | Property      | Current | Bind to                                          |
| ------------------ | ------------- | ------- | ------------------------------------------------ |
| breakpoint=desktop | paddingBottom | `64px`  | ⚠️ no token at 64px — nearest `inset.3xl (40px)` |
| Content            | gap           | `32px`  | ⚠️ no token at 32px — nearest `stack.2xl (28px)` |

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

**User Profile** · views/account · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455)

| Layer                                                                                               | Property | Current | Bind to                                          |
| --------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------------ |
| FormSection › Reports and Direct Reports Container › Direct Reports Container › Direct Reports Info | gap      | `-8px`  | ⚠️ no token at -8px — nearest `stack.none (0px)` |
| FormSection › Recent Activity Header                                                                | gap      | `24px`  | `stack.xl`                                       |

**Activity Feed Filter Row** · patterns/data · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)

| Layer              | Property | Current | Bind to    |
| ------------------ | -------- | ------- | ---------- |
| breakpoint=desktop | gap      | `8px`   | `stack.xs` |

**Announcements / What's New** · views/communications · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8488-384)

| Layer              | Property      | Current | Bind to                                          |
| ------------------ | ------------- | ------- | ------------------------------------------------ |
| breakpoint=desktop | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl (28px)` |

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

**Dashboard** · views/generic · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)

| Layer                   | Property | Current | Bind to    |
| ----------------------- | -------- | ------- | ---------- |
| Page Header › Container | gap      | `16px`  | `stack.md` |

**Notification Center** · views/communications · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8473-227)

| Layer              | Property      | Current | Bind to                                          |
| ------------------ | ------------- | ------- | ------------------------------------------------ |
| breakpoint=desktop | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl (28px)` |

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

**Search Results** · views/generic · 1 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845)

| Layer              | Property | Current | Bind to                                           |
| ------------------ | -------- | ------- | ------------------------------------------------- |
| Footer › Container | gap      | `242px` | ⚠️ no token at 242px — nearest `stack.3xl (40px)` |

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

## 3. Primitive colours used directly — 44 components

A primitive is a raw palette entry. Bound directly it will not follow Light/Dark, because only the
semantic tokens are reassigned per mode. Most of these are the same few colours repeated.

| Primitive           | Components |
| ------------------- | ---------- |
| `color/brand/red`   | 19         |
| `color/purple/700`  | 18         |
| `color/brand/white` | 15         |
| `color/neutral/700` | 7          |
| `color/blue/700`    | 6          |
| `color/red/700`     | 6          |
| `color/neutral/900` | 6          |
| `color/purple/50`   | 4          |

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
| **Account Settings**                  | views/account           | `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [7706:14605](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7706-14605) |
| **Linked Accounts & API Tokens**      | views/account           | `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [7506:27098](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7506-27098) |
| **User Profile**                      | views/account           | `blue/700`, `neutral/50`, `neutral/700`, `purple/700`, `red/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | [7400:23455](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455) |
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
| **Activity Log**                      | views/communications    | `blue/700`, `purple/700`, `red/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [7470:25944](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-25944) |
| **Notification Center**               | views/communications    | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [8473:227](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8473-227)     |
| **Device Detail**                     | views/devices           | `purple/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | [8616:112](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8616-112)     |
| **File & Asset Browser**              | views/devices           | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [8243:2826](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8243-2826)   |
| **Dashboard**                         | views/generic           | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [7229:9275](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)   |
| **Entity List**                       | views/generic           | `blue/700`, `purple/700`, `red/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [7776:11871](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-11871) |
| **Audit Log**                         | views/org-admin         | `blue/700`, `purple/700`, `red/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | [8475:1244](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8475-1244)   |
| **Licenses**                          | views/org-admin         | `neutral/900`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [8320:144](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8320-144)     |
| **Members**                           | views/org-admin         | `neutral/700`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | [8083:6420](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8083-6420)   |
| **403 Forbidden**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| **404 Not Found**                     | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| **500 Server Error**                  | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| **Maintenance**                       | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| **Offline**                           | views/system            | `brand/red`, `brand/white`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

## 4. Descriptions that contradict the component set — 3 findings on 1 component

Only **Button** is left. Its description is out of date on three counts:

| Component  | Finding                                                                                                                           | Open                                                                           |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Button** | Description says 96 variants; the set has 108.                                                                                    | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |
| **Button** | Axis `size`: description lists [xs, sm, md, lg], set has [md, sm, xl].                                                            | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |
| **Button** | Axis `state`: description lists [default, hover, pressed, disabled], set has [default, hover, pressed, disabled, focus, loading]. | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544) |

## 5. State and axis naming — 12

**2 sets carry two spellings of one state**, which is the clearer fix: a component cannot
meaningfully have both.

| Component       | Finding                                     | Open                                                                         |
| --------------- | ------------------------------------------- | ---------------------------------------------------------------------------- |
| **Icon Button** | State axis has both `pressed` and `active`. | [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443) |
| **Text Area**   | State axis has both `focus` and `focused`.  | [3888:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3888-128) |

**10 sets use a state value outside the standard ladder.** `ghost` appears on four of them and
looks deliberate — see the decisions list, because that may be a variant rather than a state.

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

The variables themselves are in good shape. Everything in this part is about **documentation pages
that publish values contradicting the variables** — the risk is to anyone who reads the slide
instead of opening the variable panel.

## 7. Documentation pages that publish wrong values

### 7.1 The spacing scale — highest priority in this document

Three pages publish an `inset` / `stack` scale that uses **the same names as the real variables with
different values**. Every step except `md` is wrong.

| Token       | Pages say | Variables are |     |
| ----------- | --------- | ------------- | --- |
| `inset.2xs` | 2 px      | **4 px**      | ✗   |
| `inset.xs`  | 4 px      | **8 px**      | ✗   |
| `inset.sm`  | 8 px      | **12 px**     | ✗   |
| `inset.md`  | 16 px     | 16 px         | ✓   |
| `inset.lg`  | 24 px     | **20 px**     | ✗   |
| `inset.xl`  | 32 px     | **24 px**     | ✗   |

Because the names match, a designer who reads "`inset.lg` is 24px" and applies `inset.lg` gets 20px
with nothing to signal the difference.

To correct:

| Page                                                                                   | What to change                                                                                                                                                                            |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Agentic Reference](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1251-578)  | `[SPATIAL_SYSTEM]` block — replace the inset/stack scale with `none 0, 2xs 4, xs 8, sm 12, md 16, lg 20, xl 24, 2xl 28, 3xl 40`. It also lists a `stack.2xl` of 48, which does not exist. |
| [Spatial](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-59204)           | Stack and Inset slides say `stack.lg → 1.5rem` and `inset.lg → 1.5rem` (24px). `lg` is 20px; 24px is `xl`.                                                                                |
| [Theming](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1114-9360)           | Non-colour token table repeats `inset.lg = 24px`, `stack.lg = 24px`.                                                                                                                      |
| [Spatial](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-59204)           | Page-context block describes a `space.*` family (`space.0`…`space.4xl`) plus `inline`, `squish_inset`, `stretch_inset`. None of these exist — only `inset.*` and `stack.*`.               |
| [Primitives › Spatial](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=27-298) | Table lists seven steps (0, 4, 8, 12, 16, 24, 32); there are nine (0, 4, 8, 12, 16, 20, 24, 28, 40). Row labels currently render as "MAJOR" placeholders.                                 |

### 7.2 ⚠️ Icon sizes — needs a decision, not just an edit

Three sources give three different scales, and the stated design intent does not exist as variables:

| Source                                                                                               | Scale                                 |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------- |
| [Iconography](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-53729) slides — the intent | 12, 16, 20, 24, **32**, **40**        |
| The actual variables                                                                                 | 12, 16, 20, 24, **28**, **32**        |
| [Agentic Reference](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1251-578)                | 16, 20, 24, 32, 40 — shifted one step |

So `icon.xl` is 28 where the slides say 32, and there is no 40px size at all. Either add the two
sizes or correct the slides. `icon.xl` and `icon.2xl` are currently unused by any component.

### 7.3 Colour values that disagree

On [Typography](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-51711) ("Text Color" slide) and [Theming](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1114-9360):

| Token                      | Slide says             | Variables are                     |
| -------------------------- | ---------------------- | --------------------------------- |
| `color.text.feedback.info` | **blue** 700 → 300     | **turquoise** 700 → 400           |
| Info surface               | blue 50 → blue 900     | turquoise 50 → turquoise 800      |
| Warning surface            | yellow 50 → yellow 900 | orange 50 → orange 800            |
| `color.text.tertiary`      | neutral 700 (dark)     | neutral 300 → 500                 |
| `color.text.disabled`      | alpha 40               | alpha **20**                      |
| `color.text.inverse`       | neutral 50             | brand/white → neutral 900         |
| Success / warning / danger | 700 → 300              | 600 → 400 (danger 600 → **300**)  |
| `shadow.subtle` dark       | alpha-black-90         | alpha-black-**50** (strong is 70) |

The blue-vs-turquoise one is worth checking properly — that is a visible hue difference on every
informational message, not a rounding error.

Also on [Color](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-50347): the Action slide says "Blue 500 for primary", but the primary
action colour is neutral 900 (light) / neutral 50 (dark). Blue is links and focus rings.

### 7.4 Two mislabelled swatches

On [Primitives › Color](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=15-366) two swatches render one colour and are captioned with
another. **The swatches are variable-bound, so the colours are correct — only the caption text is
wrong**, but anyone copying the hex gets the wrong value.

| Swatch      | Caption says | Actually renders |
| ----------- | ------------ | ---------------- |
| neutral 300 | `#878787`    | `#A8A8A8`        |
| green 600   | `#C39900`    | `#24791D`        |

`#C39900` is a mustard yellow, which makes the green one especially confusing.

### 7.5 Remaining page corrections

| Page                                                                                         | Says                                                                                                        | Should say                                                                                                                                                                           |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [Borders & Radius](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-60191)        | `radius.xs` 2px, a 16px step, `border.width.lg` 3px, border roles `default/interactive/error/success/focus` | Semantic radii are `none, subtle, control, container, dialog, pill`; border widths 0/1/2/4; border roles `subtle, medium, strong, disabled, inverse, surface, highlight, feedback.*` |
| [Borders & Radius](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-60191)        | inputs `radius.sm`, dialogs `radius.lg`                                                                     | `radius.subtle` (4px) and `radius.dialog` (12px)                                                                                                                                     |
| [Agentic Reference](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1251-578)        | Title L 44/56; Helper M 14/16; "32 type variables"                                                          | 40/48; 14/20; 41 variables                                                                                                                                                           |
| [Agentic Reference](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1251-578)        | Style names `Display/L`, `Body/M/Regular`                                                                   | Lowercase `display/lg`, `body/md/regular`                                                                                                                                            |
| [Agentic Reference](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1251-578)        | Component map uses `color.surface.secondary`                                                                | No such variable — the page flags it itself                                                                                                                                          |
| [Layering & Elevation](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-52851)    | `shadow.none/subtle/medium/strong/strongest`; z bands 0–9, 10–99, 100–199                                   | Effect styles `control, raised, overlay, dialog, strong`; z levels 0/100/200/300/400/500/600                                                                                         |
| [Primitives › Elevation](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1627-10994) | Shadow table row 2 is `y:3 / blur:4`                                                                        | `shadow/raised` is `y:1 / blur:2`                                                                                                                                                    |
| [Responsive](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-57247)              | mobile 0–599, tablet 600–1023; `viewport.breakpoint.sm` 600px                                               | Viewports are 393 / 768 / 1024 / 1440 / 1920                                                                                                                                         |
| [Grid](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-58215)                    | tablet 8 col, desktop margin 40px                                                                           | xs 4/16, sm 4/16, md 8/20, lg 12/24, xl 12/24                                                                                                                                        |
| [Motion](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-61136)                  | Ranges (fast 100–150, normal 200–300); easings `standard/enter/exit/linear`                                 | Single values 100/300/600/900; `ease.in`, `ease.out`, `ease.both`                                                                                                                    |
| [States & Interaction](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1054-14458)   | `opacity.disabled`, `motion/hover`, `motion/focus`                                                          | None exist — use the explicit `disabled` colour tokens                                                                                                                               |
| [Theming](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1114-9360)                 | `color.border.default`                                                                                      | No such variable; the quoted values match `border/medium`                                                                                                                            |
| [Color](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-50347)                   | `blue-50…950`, `neutral-0…1000`, `color.text.on-color`, `color.surface.default/subtle`, `color.feedback.*`  | Palettes run 50…900; none of those token names exist                                                                                                                                 |
| [Data Visualization](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-55486)      | `dataviz.color.categorical.*`, `sequential.*`, `diverging.*`                                                | `color.data.category.NN.{strong,subtle}`, `color.data.scale.*`, `color.data.delta.*`                                                                                                 |
| [Tokens](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-47331)                  | Button annotation `size.inset.md`, `size.radius.control`                                                    | `inset.md`, `radius.control` — there is no `size.` group                                                                                                                             |

## 8. Page artifacts and copy-paste errors

| Page                                                                                                                                                            | What to fix                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [UX Copy](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1138-12741)                                                                                   | Its page-context block is a verbatim copy of the Governance block, still labelled `page: Governance`                                                                    |
| [Lint Plugin](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1086-16826)                                                                               | The "How It Works" slide contains the UX-copy writing-pattern cards (error messages, empty states, confirmation dialogs) under the plugin heading                       |
| [Typography](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-51711)                                                                                 | The Font Size / Line Height / Family / Weight tables all share one container paragraph, copied from the border-width section. Values are right; surrounding text is not |
| [Table of Contents](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=905-63456)                                                                          | Numbering disagrees with slide cross-references — ToC has Theming 07, UX Copy 08, Governance 09; slides say "Chapter 08 — Theming", "Ch.09 Compliance Validation Rules" |
| [Governance](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1114-10348)                                                                                | States 39 validation rules (30 errors, 9 warnings); the listed ID ranges sum to 42                                                                                      |
| [Introduction](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=1000-5125) / [Tokens](https://figma.com/design/Y21OGpk2z6ig9cRMc5cl9L?node-id=763-47331) | One empty "Slide" frame on each                                                                                                                                         |

---

# Part 3 · SOLAR Icons

## 9. Icons — 7 findings on 5 icons

341 icons, and the set is in very good shape: no strokes, no clipping masks, one fill per icon,
consistent 24×24 frames, and every icon now carries a description with search keywords. Five icons
need attention:

| Icon              | Figma page        | What to fix                                                                                                         | Open                                                                           |
| ----------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Design**        | Actions           | Solid variant fill is a raw hex instead of bound to `color/neutral/900` — **this icon will stay dark in dark mode** | [6380:605](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=6380-605)   |
| **Support**       | Status & Feedback | Has two `solid` variants                                                                                            | [5482:618](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5482-618)   |
| **Support**       | Status & Feedback | Has no `outline` variant, so there is no outline Support icon to use                                                | [5482:618](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5482-618)   |
| **Phone**         | Communication     | Shares the name `Icon/Phone` with a different icon on another page — one needs renaming                             | [5310:1325](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5310-1325) |
| **Zone**          | Location          | Outline frame is 24×**25**, not 24×24 — one stray pixel off-grid                                                    | [5396:622](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5396-622)   |
| **Phone**         | Audio & DSP       | Shares the name `Icon/Phone` with a different icon on another page — one needs renaming                             | [5317:662](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=5317-662)   |
| **ButtonControl** | Signal Flow       | Solid variant fill is a raw hex instead of bound to `color/neutral/900` — **this icon will stay dark in dark mode** | [6383:591](https://figma.com/design/f0slPVSjDnXgdyPmWOSVOw?node-id=6383-591)   |

Two of these matter more than they look:

- **Design** and **ButtonControl** have unbound solid fills, so those two icons **will stay dark in
  dark mode** while every other icon inverts. Binding them to `color/neutral/900` fixes it.
- **Support** has two `solid` variants and no `outline`, so there is currently no outline Support
  icon to use anywhere.

---

# Decisions we need from you

These are the ones we genuinely cannot answer:

1. **Button sizes** — is `xl` real, and were `xs` / `lg` dropped deliberately?
2. **Icon sizes** — add 32 and 40, or correct the slides to 28 / 32?
3. **`color.text.feedback.info`** — blue or turquoise?
4. **`ghost`, `destructive`, `readonly`** — should these be variants rather than states?
5. **Avatar's 45 palette colours** — a deliberate identity palette that wants its own tokens?
6. **`color/purple/700` and `color/brand/red`** across the view pages — intentional brand colour, or
   should they be semantic?
7. **Touch targets** — Button is drawn at 32px and 40px tall, Checkbox at 16px, Radio and Toggle at
   18px. That is fine if the hit area is larger than the drawn box, but it is not recorded anywhere.
   Could the intended target size go in the component description?
8. **Unused parts of the system** — 15 `color.border.*`, 9 `color.action.*`, 8 `color.shadow.*` and
   5 `color.surface.*` tokens, 20 of 47 text styles (all `display/*`, `title/lg`, every `body/*/bold`,
   both `code/*`), and 2 of 9 effect styles (`shadow/strong`, `shadow/warning`) are not used by any
   component. Reserved for work in progress, or retire them?
9. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR Web
   rather than in Foundations. Should it move down a layer?

---

_Extracted from SOLAR Foundations `[v1--2026]`, SOLAR Web `[v1--2026]` and SOLAR Icons `[v2--2026]`
_Extracted from SOLAR Foundations `[v1--2026]`, SOLAR Web `[v1--2026]` and SOLAR Icons `[v2--2026]`
on 2026-09-22. Counts are computed from the files, not estimated. Happy to walk through any of this
live — and happy to be wrong on the judgement calls, where we may be missing context._
