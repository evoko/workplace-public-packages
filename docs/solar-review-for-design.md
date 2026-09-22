# SOLAR — Figma fix list

**Prepared for:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-22

We read all three SOLAR Figma files end to end and listed everything we think can be fixed or
improved **in Figma**. This is a work list, not a critique — most items are small and mechanical,
and each one is something only you can change.

## How to use this

Every row links straight to the node in Figma. Work top to bottom within a section, or take a whole
section at a time.

- **Fix** — clearly wrong, no judgement needed.
- **⚠️ Decide** — we can see something is off but the right answer is a design call.

Where we suggest a token, we picked the one whose value already matches what is drawn, so in most
cases the visual result does not change at all.

## Summary

| #                                                           | What                                                      | Count   | File        |
| ----------------------------------------------------------- | --------------------------------------------------------- | ------- | ----------- |
| [1](#1-components-with-no-description--111)                 | Components with no description                            | 111     | SOLAR Web   |
| [2](#2-hard-coded-values--151-across-52-components)         | Hard-coded values not bound to a variable                 | 151     | SOLAR Web   |
| [3](#3-primitive-colours-used-directly--68-components)      | Components using primitive colours directly               | 68      | SOLAR Web   |
| [4](#4-descriptions-that-contradict-the-component-set--21)  | Descriptions that contradict the set                      | 21      | SOLAR Web   |
| [5](#5-state-and-axis-naming--13--10)                       | State and axis naming inconsistencies                     | 13 + 10 | SOLAR Web   |
| [6](#6-local-variables-that-should-be-library-variables--5) | Local variables shadowing library ones                    | 5       | SOLAR Web   |
| [7](#7-documentation-pages-that-publish-wrong-values)       | Doc pages publishing values that contradict the variables | 9 areas | Foundations |
| [8](#8-page-artifacts-and-copy-paste-errors)                | Page artifacts and copy-paste errors                      | 6       | Foundations |
| [9](#9-icons--7-findings-on-5-icons)                        | Icon fixes                                                | 5 icons | SOLAR Icons |

**If you only do three things:** section 1 for `components/*` (33 items), the spacing scale in
section 7.1, and the two unbound icon fills in section 9.

---

# Part 1 · SOLAR Web

## 1. Components with no description — 111

The description field is empty on 111 of 227 components. It is the only place in Figma that records
what a component is _for_, and it is what everyone downstream reads first — designers picking a
component, and us.

**Start with `components/*`.** Those 33 are the reusable building blocks; the pattern and view pages
mostly compose them, so describing the primitives has the widest effect.

A good description already exists on **PageNavButton** — worth copying as a template:

> Prev/next button used inside PageNavigator. 10 variants: direction (prev/next) × state (default,
> hover, pressed, focus, disabled). Larger visual weight than PaginationNav — built for step-by-step
> flows (wizards, multi-page detail, onboarding) rather than dense pagination. Disabled at the
> sequence boundaries. Label + chevron, mirrored by direction.

It states the purpose, the variant axes and counts, when to use it _instead of_ a similar component,
and the intended behaviour. Four sentences is plenty.

Separately, **67 components still show the page template's placeholder documentation card** (the one
whose body reads "Breadcrumbs"), and **43 have neither a description nor a real card** — no written
record of their purpose anywhere.

#### components/ — 33 components on 23 pages

| Figma page        | Component                    | Variants | Open                                                                               |
| ----------------- | ---------------------------- | -------- | ---------------------------------------------------------------------------------- |
| File Card         | **File Card**                | 2        | [8273:15264](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8273-15264)   |
| Insight Row       | **Insight Row**              | 10       | [6905:61](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6905-61)         |
| Option Card       | **Option Card**              | 3        | [9385:28717](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9385-28717)   |
| Status Card       | **Status Card**              | 16       | [3763:676](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3763-676)       |
| Drag Handle       | **DragHandle**               | 10       | [4583:170](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4583-170)       |
| List              | **List**                     | 2        | [7739:28903](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-28903)   |
| Property List     | **PropertyRow**              | 14       | [7676:169](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7676-169)       |
| Property List     | **PropertyList**             | 2        | [7739:29013](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-29013)   |
| Table             | **RowSelect**                | 2        | [3795:3341](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3795-3341)     |
| Table             | **RowExpand**                | 6        | [4417:3527](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4417-3527)     |
| Table             | **Row**                      | 10       | [4458:3569](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3569)     |
| Table             | **Column Item**              | 9        | [4458:3831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3831)     |
| Table             | **Table**                    | 6        | [6165:13091](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-13091)   |
| Table             | **TableFooter**              | 2        | [6596:44918](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44918)   |
| Table             | **TableHeader**              | 2        | [6596:44919](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44919)   |
| Dialog            | **Dialog**                   | 3        | [5888:18256](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18256)   |
| Drawer            | **Drawer**                   | 1        | [4586:80](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4586-80)         |
| Split Dialog      | **Split Dialog**             | 2        | [6774:9620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6774-9620)     |
| Empty State       | **EmptyState**               | 1        | [4632:85](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4632-85)         |
| Spinner           | **Spinner**                  | 6        | [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)       |
| Date Picker       | **Date Picker Open**         | 3        | [7280:669](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7280-669)       |
| Option Row        | **Options List**             | 1        | [10291:22366](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10291-22366) |
| PIN Input         | **PIN Input**                | 12       | [7795:222](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7795-222)       |
| Text Input        | **Text Input**               | 12       | [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737)     |
| Section Nav Item  | **Section Nav Item**         | 5        | [8109:19](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8109-19)         |
| Section Nav Item  | **Section Nav Group Header** | 1        | [8044:7](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8044-7)           |
| Segmented Control | **Segmented Control**        | 2        | [6170:20250](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6170-20250)   |
| Stepper           | **Stepper Indicator**        | 4        | [2574:3254](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2574-3254)     |
| Stepper           | **Step**                     | 8        | [5760:5192](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-5192)     |
| Stepper           | **Stepper**                  | 4        | [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)     |
| Tabs              | **Tabs**                     | 2        | [6165:12202](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-12202)   |
| Popover           | **Popover**                  | 8        | [4572:120](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4572-120)       |
| Cursor            | **Cursor**                   | 22       | [8871:436](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8871-436)       |

#### patterns/ — 26 components on 20 pages

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
| App Switcher                               | **AppSwitcherItem**          | 1        | [6431:1625](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6431-1625)   |
| Command Palette                            | **Command Item**             | 2        | [5760:4612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-4612)   |
| Command Palette                            | **Command Palette**          | 1        | [5607:3799](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5607-3799)   |
| Page Header                                | **Page Header**              | 3        | [6186:21246](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246) |
| Search Results Panel                       | **SearchResultsPanel**       | 4        | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| Search Results Panel                       | **ResultRow**                | 1        | [5808:14608](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5808-14608) |
| Section Nav                                | **Section Nav**              | 1        | [8045:7](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8045-7)         |
| Shell Tier 1 · Workplace                   | **Layout / Workplace**       | 2        | [6498:5921](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6498-5921)   |
| Shell Tier 2 · Canvas app                  | **Layout / Canvas**          | 2        | [6499:6448](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6448)   |
| Shell Tier 3 · Config app (Chatter Config) | **Layout / Config **         | 2        | [6499:6532](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6532)   |
| Shell Tier 4 · Client app (Chatter)        | **Layout**                   | 2        | [6499:6699](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6699)   |
| Sidebar                                    | **Sidebar**                  | 2        | [2666:781](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2666-781)     |
| Top Bar                                    | **Top Bar**                  | 6        | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| Top Bar                                    | **App Name**                 | 3        | [6177:20350](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20350) |
| Tree Navigation Panel                      | **Tree Navigation Panel**    | 1        | [3773:518](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-518)     |

#### views/ — 51 components on 44 pages

| Figma page                   | Component                             | Variants | Open                                                                             |
| ---------------------------- | ------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Account Settings             | **Account Settings**                  | 9        | [7706:14605](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7706-14605) |
| Linked Accounts & API Tokens | **Linked Accounts & API Tokens**      | 2        | [7506:27098](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7506-27098) |
| User Profile                 | **User Profile**                      | 2        | [7400:23455](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455) |
| Forgot Password              | **Auth — Forgot Password**            | 2        | [7776:21546](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-21546) |
| Invite Acceptance            | **Auth — Invite Acceptance**          | 2        | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| Join or Create Organization  | **Auth - Join Organization **         | 2        | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)   |
| Join or Create Organization  | **Auth - Create organization**        | 2        | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| MFA Challenge                | **Auth — MFA Challenge**              | 2        | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| Organization Selector        | **Organization Selector**             | 4        | [6592:38886](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6592-38886) |
| Organization Selector        | **Organization Selector Overlay**     | 1        | [9511:29064](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9511-29064) |
| Reset Password               | **Auth — Reset Password / Default**   | 1        | [6136:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6136-58)       |
| Reset Password               | **Auth — Reset Password / Default**   | 1        | [6137:58](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6137-58)       |
| Session Expired              | **Auth — Session Expired**            | 2        | [7810:21910](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21910) |
| Auth — Sign In               | **Auth — Sign In / Email**            | 2        | [6177:20771](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20771) |
| Auth — Sign In               | **Auth — Sign In / Email + Password** | 2        | [6177:20772](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20772) |
| Auth — Sign Up               | **Auth — Sign Up**                    | 2        | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885) |
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
| Entity Detail                | **Entity List**                       | 2        | [7776:11871](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-11871) |
| Entity List                  | **Entity List**                       | 2        | [7776:14270](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-14270) |
| Search Results               | **Search Results**                    | 2        | [7470:23845](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845) |
| Search Results               | **Search Results Item**               | 1        | [7266:12882](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-12882) |
| Settings                     | **Settings**                          | 8        | [7058:43950](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7058-43950) |
| AI Assistant                 | **AI Assistant / Chat Message**       | 2        | [8566:86](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8566-86)       |
| AI Assistant                 | **AI Assistant / Conversation Event** | 2        | [8569:90](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8569-90)       |
| AI Assistant                 | **AI Assistant**                      | 1        | [8484:203](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8484-203)     |
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

## 2. Hard-coded values — 151 across 52 components

Paddings, gaps, radii and fills typed in as numbers rather than bound to a variable. They do not
follow theme or density changes, and they are invisible in Figma unless you inspect the layer.

**121 of the 151 already equal an existing token exactly** — binding those changes nothing visually.
The remaining 30 are marked ⚠️ and need a decision, because no token has that value.

The four most common are `8px` (34×), `24px` (25×), `16px` (24×) and `4px` (15×) — all of which have
an exact token.

**.Component Description** · .[UTILITY] · 15 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612)

| Layer                        | Property      | Current | Bind to                                              |
| ---------------------------- | ------------- | ------- | ---------------------------------------------------- |
| .Component Description       | radius        | `16px`  | ⚠️ no token at 16px — nearest `radius.dialog` (12px) |
| Header › Container           | paddingRight  | `40px`  | `inset.3xl`                                          |
| Header › Container           | paddingLeft   | `40px`  | `inset.3xl`                                          |
| Header › Container › Version | gap           | `8px`   | `inset.xs`                                           |
| Header › Container › Version | paddingTop    | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs` (4px)       |
| Header › Container › Version | paddingRight  | `8px`   | `inset.xs`                                           |
| Header › Container › Version | paddingBottom | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs` (4px)       |
| Header › Container › Version | paddingLeft   | `8px`   | `inset.xs`                                           |
| Header › Container › Version | radius        | `6px`   | `radius.control`                                     |
| Header › .Subheader          | gap           | `20px`  | `inset.lg`                                           |
| Header › .Subheader          | paddingTop    | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl` (28px)     |
| Header › .Subheader          | paddingRight  | `40px`  | `inset.3xl`                                          |
| Header › .Subheader          | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl` (28px)     |
| Header › .Subheader          | paddingLeft   | `40px`  | `inset.3xl`                                          |
| Content › Rules › Frame 2    | gap           | `24px`  | `inset.xl`                                           |

**Time Range** · Time Range Selector · 9 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-25836)

| Layer                             | Property      | Current | Bind to    |
| --------------------------------- | ------------- | ------- | ---------- |
| Container › Tree                  | paddingTop    | `12px`  | `inset.sm` |
| Container › Tree                  | paddingRight  | `8px`   | `inset.xs` |
| Container › Tree                  | paddingBottom | `12px`  | `inset.sm` |
| Container › Tree                  | paddingLeft   | `8px`   | `inset.xs` |
| Container › Container › Container | gap           | `24px`  | `inset.xl` |
| Container › Container › Container | paddingTop    | `24px`  | `inset.xl` |
| Container › Container › Container | paddingRight  | `24px`  | `inset.xl` |
| Container › Container › Container | paddingBottom | `24px`  | `inset.xl` |
| Container › Container › Container | paddingLeft   | `24px`  | `inset.xl` |

**Account Settings** · Account Settings · 8 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7706-14605)

| Layer                             | Property      | Current | Bind to    |
| --------------------------------- | ------------- | ------- | ---------- |
| Container › Tree                  | paddingTop    | `12px`  | `inset.sm` |
| Container › Tree                  | paddingRight  | `8px`   | `inset.xs` |
| Container › Tree                  | paddingBottom | `12px`  | `inset.sm` |
| Container › Tree                  | paddingLeft   | `8px`   | `inset.xs` |
| Container › Container › Container | paddingTop    | `24px`  | `inset.xl` |
| Container › Container › Container | paddingRight  | `24px`  | `inset.xl` |
| Container › Container › Container | paddingBottom | `24px`  | `inset.xl` |
| Container › Container › Container | paddingLeft   | `24px`  | `inset.xl` |

**User Profile** · User Profile · 8 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455)

| Layer                                                                                                          | Property | Current | Bind to                                    |
| -------------------------------------------------------------------------------------------------------------- | -------- | ------- | ------------------------------------------ |
| Container › Title Container › Name and Pronouns                                                                | gap      | `16px`  | `inset.md`                                 |
| FormSection › Contaner                                                                                         | gap      | `24px`  | `inset.xl`                                 |
| FormSection › Contacts Container                                                                               | gap      | `24px`  | `inset.xl`                                 |
| FormSection › Reports and Direct Reports Container                                                             | gap      | `24px`  | `inset.xl`                                 |
| FormSection › Reports and Direct Reports Container › Reports Container › Manager Info Container › Manager Info | gap      | `8px`   | `inset.xs`                                 |
| FormSection › Reports and Direct Reports Container › Direct Reports Container › Direct Reports Info            | gap      | `-8px`  | ⚠️ negative value — design decision needed |
| FormSection › Teams and Spaces Container                                                                       | gap      | `24px`  | `inset.xl`                                 |
| FormSection › Recent Activity Header                                                                           | gap      | `24px`  | `inset.xl`                                 |

**Chart Axis** · Chart Axis · 6 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7269-68)

| Layer                                      | Property | Current | Bind to     |
| ------------------------------------------ | -------- | ------- | ----------- |
| orientation=horizontal, breakpoint=desktop | gap      | `4px`   | `inset.2xs` |
| Ticks › Tick                               | gap      | `4px`   | `inset.2xs` |
| Ticks › Tick                               | gap      | `4px`   | `inset.2xs` |
| Ticks › Tick                               | gap      | `4px`   | `inset.2xs` |
| Ticks › Tick                               | gap      | `4px`   | `inset.2xs` |
| Ticks › Tick                               | gap      | `4px`   | `inset.2xs` |

**Dashboard** · Dashboard · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)

| Layer                   | Property | Current | Bind to    |
| ----------------------- | -------- | ------- | ---------- |
| Page Header › Container | gap      | `16px`  | `inset.md` |
| Container › Container   | gap      | `16px`  | `inset.md` |
| Container › Container   | gap      | `16px`  | `inset.md` |
| Container › Container   | gap      | `16px`  | `inset.md` |
| Container › Container   | gap      | `16px`  | `inset.md` |

**Day View** · Day View · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6822-119)

| Layer                                            | Property      | Current | Bind to     |
| ------------------------------------------------ | ------------- | ------- | ----------- |
| Calendar Body                                    | gap           | `16px`  | `inset.md`  |
| Calendar Body › Side Rail                        | gap           | `16px`  | `inset.md`  |
| Calendar Body › Side Rail › Up Next              | gap           | `8px`   | `inset.xs`  |
| Calendar Body › Calendar Surface › All-Day Strip | paddingTop    | `4px`   | `inset.2xs` |
| Calendar Body › Calendar Surface › All-Day Strip | paddingBottom | `4px`   | `inset.2xs` |

**General** · General · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8407-1130)

| Layer         | Property      | Current | Bind to    |
| ------------- | ------------- | ------- | ---------- |
| Center › Form | gap           | `24px`  | `inset.xl` |
| Center › Form | paddingTop    | `8px`   | `inset.xs` |
| Center › Form | paddingRight  | `20px`  | `inset.lg` |
| Center › Form | paddingBottom | `24px`  | `inset.xl` |
| Center › Form | paddingLeft   | `20px`  | `inset.lg` |

**Notification Center** · Notification Center · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8473-227)

| Layer                               | Property      | Current | Bind to                                          |
| ----------------------------------- | ------------- | ------- | ------------------------------------------------ |
| breakpoint=desktop                  | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl` (28px) |
| Content                             | gap           | `24px`  | `inset.xl`                                       |
| Content › Filter Tabs               | gap           | `4px`   | `inset.2xs`                                      |
| Content › Group · Today             | gap           | `8px`   | `inset.xs`                                       |
| Content › Group · Earlier this week | gap           | `8px`   | `inset.xs`                                       |

**SSO & SAML** · SSO & SAML · 5 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8421-1130)

| Layer                           | Property      | Current | Bind to    |
| ------------------------------- | ------------- | ------- | ---------- |
| Center › Members & Roles › Form | gap           | `24px`  | `inset.xl` |
| Center › Members & Roles › Form | paddingTop    | `8px`   | `inset.xs` |
| Center › Members & Roles › Form | paddingRight  | `20px`  | `inset.lg` |
| Center › Members & Roles › Form | paddingBottom | `24px`  | `inset.xl` |
| Center › Members & Roles › Form | paddingLeft   | `20px`  | `inset.lg` |

**AI Assistant** · AI Assistant · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8484-203)

| Layer                                                       | Property | Current | Bind to    |
| ----------------------------------------------------------- | -------- | ------- | ---------- |
| content › Conversation › Suggested prompts                  | gap      | `8px`   | `inset.xs` |
| content › Exchange                                          | gap      | `16px`  | `inset.md` |
| content › Exchange › Turn / AI Assistant › Extras › Actions | gap      | `8px`   | `inset.xs` |
| Composer                                                    | gap      | `8px`   | `inset.xs` |

**Bar Chart** · Bar Chart · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7219-254)

| Layer                                                 | Property | Current | Bind to    |
| ----------------------------------------------------- | -------- | ------- | ---------- |
| type=simple, orientation=vertical, breakpoint=desktop | gap      | `12px`  | `inset.sm` |
| Plot                                                  | gap      | `8px`   | `inset.xs` |
| Plot › Bars                                           | gap      | `16px`  | `inset.md` |
| Plot › Labels                                         | gap      | `16px`  | `inset.md` |

**Day Cell** · Day Cell · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)

| Layer                      | Property     | Current | Bind to                                         |
| -------------------------- | ------------ | ------- | ----------------------------------------------- |
| Day Num Row                | paddingRight | `2px`   | ⚠️ no token at 2px — nearest `inset.none` (0px) |
| Day Num Row                | paddingLeft  | `2px`   | ⚠️ no token at 2px — nearest `inset.none` (0px) |
| Day Num Row › Day Num Pill | paddingRight | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs` (4px)  |
| Day Num Row › Day Num Pill | paddingLeft  | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs` (4px)  |

**File & Asset Browser** · File & Asset Browser · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8243-2826)

| Layer   | Property      | Current | Bind to     |
| ------- | ------------- | ------- | ----------- |
| Content | paddingTop    | `16px`  | `inset.md`  |
| Content | paddingRight  | `40px`  | `inset.3xl` |
| Content | paddingBottom | `24px`  | `inset.xl`  |
| Content | paddingLeft   | `40px`  | `inset.3xl` |

**Launch Card Full Screen** · Launch Card · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10404-64)

| Layer                      | Property | Current | Bind to                                         |
| -------------------------- | -------- | ------- | ----------------------------------------------- |
| Text                       | gap      | `18px`  | ⚠️ no token at 18px — nearest `inset.md` (16px) |
| Text › Content             | gap      | `18px`  | ⚠️ no token at 18px — nearest `inset.md` (16px) |
| Text › Content › Headline  | gap      | `18px`  | ⚠️ no token at 18px — nearest `inset.md` (16px) |
| Text › Content › Body copy | gap      | `18px`  | ⚠️ no token at 18px — nearest `inset.md` (16px) |

**Year View** · Year View · 4 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6829-2)

| Layer                                      | Property | Current | Bind to    |
| ------------------------------------------ | -------- | ------- | ---------- |
| Calendar Body › Year Grid                  | gap      | `16px`  | `inset.md` |
| Calendar Body › Year Grid › Mini Month Row | gap      | `16px`  | `inset.md` |
| Calendar Body › Year Grid › Mini Month Row | gap      | `16px`  | `inset.md` |
| Calendar Body › Year Grid › Mini Month Row | gap      | `16px`  | `inset.md` |

**Agenda View** · Agenda View · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6825-2)

| Layer                                      | Property | Current | Bind to     |
| ------------------------------------------ | -------- | ------- | ----------- |
| Calendar Body › Agenda List › Frame 1      | gap      | `8px`   | `inset.xs`  |
| Calendar Body › Agenda List                | gap      | `16px`  | `inset.md`  |
| Calendar Body › Agenda List › Date Section | gap      | `4px`   | `inset.2xs` |

**API & Webhooks** · API & Webhooks · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8449-1130)

| Layer                                           | Property | Current | Bind to    |
| ----------------------------------------------- | -------- | ------- | ---------- |
| Center › Body › Webhook endpoints › head        | gap      | `16px`  | `inset.md` |
| Center › Body › Webhook endpoints › Webhook Row | gap      | `16px`  | `inset.md` |
| Center › Body › Webhook endpoints › Webhook Row | gap      | `16px`  | `inset.md` |

**Audit Log** · Audit Log · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8475-1244)

| Layer                  | Property      | Current | Bind to    |
| ---------------------- | ------------- | ------- | ---------- |
| Members & Roles › Feed | gap           | `16px`  | `inset.md` |
| Members & Roles › Feed | paddingTop    | `8px`   | `inset.xs` |
| Members & Roles › Feed | paddingBottom | `24px`  | `inset.xl` |

**Help Center** · Help Center · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8453-418)

| Layer                         | Property      | Current | Bind to                                                   |
| ----------------------------- | ------------- | ------- | --------------------------------------------------------- |
| breakpoint=desktop            | paddingBottom | `64px`  | ⚠️ layout dimension, not a spacing value — confirm intent |
| Content                       | gap           | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl` (28px)          |
| Content › Resources › Popular | gap           | `8px`   | `inset.xs`                                                |

**Week View** · Week View · 3 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6811-17)

| Layer                                            | Property      | Current | Bind to         |
| ------------------------------------------------ | ------------- | ------- | --------------- |
| Calendar Body › Calendar Surface                 | radius        | `12px`  | `radius.dialog` |
| Calendar Body › Calendar Surface › All-Day Strip | paddingTop    | `4px`   | `inset.2xs`     |
| Calendar Body › Calendar Surface › All-Day Strip | paddingBottom | `4px`   | `inset.2xs`     |

**Announcements / What's New** · Announcements / What's New · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8488-384)

| Layer              | Property      | Current | Bind to                                          |
| ------------------ | ------------- | ------- | ------------------------------------------------ |
| breakpoint=desktop | paddingBottom | `32px`  | ⚠️ no token at 32px — nearest `inset.2xl` (28px) |
| Content            | paddingTop    | `24px`  | `inset.xl`                                       |

**Calendar Toolbar** · Calendar Toolbar · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6653-861)

| Layer            | Property | Current | Bind to     |
| ---------------- | -------- | ------- | ----------- |
| Calendar Toolbar | gap      | `16px`  | `inset.md`  |
| Left › Nav       | gap      | `4px`   | `inset.2xs` |

**Coachmark** · Coachmark · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10813-32930)

| Layer                   | Property | Current | Bind to                                                   |
| ----------------------- | -------- | ------- | --------------------------------------------------------- |
| Coachmark › Frame 20069 | gap      | `8px`   | `inset.xs`                                                |
| Tutorial node           | gap      | `122px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**FormSection** · Form Section · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5612-6418)

| Layer         | Property | Current | Bind to    |
| ------------- | -------- | ------- | ---------- |
| Contaner      | gap      | `24px`  | `inset.xl` |
| SectionFields | gap      | `24px`  | `inset.xl` |

**Layout** · Shell Tier 4 · Client app (Chatter) · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6699)

| Layer                                         | Property | Current | Bind to    |
| --------------------------------------------- | -------- | ------- | ---------- |
| App Content › Page Shell › center             | gap      | `8px`   | `inset.xs` |
| App Content › Page Shell › center › Container | gap      | `8px`   | `inset.xs` |

**ProgressBar** · Progress Bar · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4507-112)

| Layer            | Property | Current  | Bind to                                                   |
| ---------------- | -------- | -------- | --------------------------------------------------------- |
| feedback=neutral | radius   | `9999px` | ⚠️ layout dimension, not a spacing value — confirm intent |
| Indicator        | radius   | `9999px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**SearchResultsPanel** · Search Results Panel · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)

| Layer                              | Property | Current | Bind to    |
| ---------------------------------- | -------- | ------- | ---------- |
| ResultsBody › Dropdown Group Label | gap      | `8px`   | `inset.xs` |
| ResultsBody › Dropdown Group Label | gap      | `8px`   | `inset.xs` |

**Section Nav** · Section Nav · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8045-7)

| Layer | Property | Current   | Bind to                                  |
| ----- | -------- | --------- | ---------------------------------------- |
| Items | fill     | `#ffffff` | ⚠️ not a length — design decision needed |
| Items | gap      | `4px`     | `inset.2xs`                              |

**Segmented Control** · Segmented Control · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6170-20250)

| Layer   | Property | Current | Bind to     |
| ------- | -------- | ------- | ----------- |
| size=md | gap      | `8px`   | `inset.xs`  |
| Label   | gap      | `4px`   | `inset.2xs` |

**Stepper** · Stepper · 2 values · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)

| Layer    | Property     | Current | Bind to                                                   |
| -------- | ------------ | ------- | --------------------------------------------------------- |
| Progress | paddingRight | `225px` | ⚠️ layout dimension, not a spacing value — confirm intent |
| Steps    | gap          | `197px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**Activity Feed Filter Row** · Activity Feed · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)

| Layer              | Property | Current | Bind to    |
| ------------------ | -------- | ------- | ---------- |
| breakpoint=desktop | gap      | `8px`   | `inset.xs` |

**AppSwitcherItem** · App Switcher · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6431-1625)

| Layer   | Property | Current | Bind to    |
| ------- | -------- | ------- | ---------- |
| Frame 6 | gap      | `8px`   | `inset.xs` |

**Auth — Sign Up** · Auth — Sign Up · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885)

| Layer        | Property | Current | Bind to     |
| ------------ | -------- | ------- | ----------- |
| Center Stack | gap      | `40px`  | `inset.3xl` |

**Bar Stack** · Bar Chart · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7235-26)

| Layer                            | Property | Current | Bind to                                         |
| -------------------------------- | -------- | ------- | ----------------------------------------------- |
| segments=2, orientation=vertical | gap      | `2px`   | ⚠️ no token at 2px — nearest `inset.none` (0px) |

**Chart Tooltip** · Chart Tooltip · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7308-25)

| Layer | Property | Current | Bind to                                        |
| ----- | -------- | ------- | ---------------------------------------------- |
| Frame | gap      | `6px`   | ⚠️ no token at 6px — nearest `inset.2xs` (4px) |

**Column Chooser** · Column Chooser · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6952-1068)

| Layer         | Property | Current | Bind to            |
| ------------- | -------- | ------- | ------------------ |
| state=default | radius   | `8px`   | `radius.container` |

**File Card** · File Card · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8273-15264)

| Layer  | Property | Current | Bind to    |
| ------ | -------- | ------- | ---------- |
| Footer | gap      | `8px`   | `inset.xs` |

**Inline Input** · Inline Input · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9647-28979)

| Layer         | Property | Current | Bind to    |
| ------------- | -------- | ------- | ---------- |
| state=default | gap      | `8px`   | `inset.xs` |

**Line Chart** · Line Chart · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7311-54)

| Layer                             | Property | Current | Bind to    |
| --------------------------------- | -------- | ------- | ---------- |
| series=single, breakpoint=desktop | gap      | `12px`  | `inset.sm` |

**Month View** · Month View · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6673-466)

| Layer                            | Property | Current | Bind to         |
| -------------------------------- | -------- | ------- | --------------- |
| Calendar Body › Calendar Surface | radius   | `12px`  | `radius.dialog` |

**Notifications Panel** · Notifications Panel · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6776)

| Layer  | Property | Current | Bind to    |
| ------ | -------- | ------- | ---------- |
| Header | gap      | `12px`  | `inset.sm` |

**Page Header** · Page Header · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246)

| Layer     | Property | Current | Bind to    |
| --------- | -------- | ------- | ---------- |
| Container | gap      | `16px`  | `inset.md` |

**Payment Method Card** · Licenses · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8378-283)

| Layer       | Property | Current | Bind to    |
| ----------- | -------- | ------- | ---------- |
| Information | gap      | `8px`   | `inset.xs` |

**Schedule Strip** · Schedule Strip · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547)

| Layer     | Property | Current | Bind to    |
| --------- | -------- | ------- | ---------- |
| Container | gap      | `8px`   | `inset.xs` |

**Search Results** · Search Results · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845)

| Layer              | Property | Current | Bind to                                                   |
| ------------------ | -------- | ------- | --------------------------------------------------------- |
| Footer › Container | gap      | `242px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**Split Dialog** · Split Dialog · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6774-9620)

| Layer | Property | Current   | Bind to                                  |
| ----- | -------- | --------- | ---------------------------------------- |
| Body  | fill     | `#ffffff` | ⚠️ not a length — design decision needed |

**TableFooter** · Table · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44918)

| Layer     | Property | Current | Bind to                                                   |
| --------- | -------- | ------- | --------------------------------------------------------- |
| Container | gap      | `242px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**TableHeader** · Table · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44919)

| Layer     | Property | Current | Bind to                                                   |
| --------- | -------- | ------- | --------------------------------------------------------- |
| Container | gap      | `692px` | ⚠️ layout dimension, not a spacing value — confirm intent |

**Top Bar** · Top Bar · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620)

| Layer                                                | Property | Current | Bind to    |
| ---------------------------------------------------- | -------- | ------- | ---------- |
| breakpoint=desktop, hasSidebar=true, isLoggedIn=True | gap      | `12px`  | `inset.sm` |

**Tree Item** · Tree Item · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)

| Layer   | Property | Current | Bind to    |
| ------- | -------- | ------- | ---------- |
| Chevron | gap      | `8px`   | `inset.xs` |

**Widget Card** · Widget Card · 1 value · [open](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5465-85)

| Layer  | Property | Current | Bind to    |
| ------ | -------- | ------- | ---------- |
| Header | gap      | `12px`  | `inset.sm` |

## 3. Primitive colours used directly — 68 components

These layers are bound to a raw palette colour (`color/neutral/900`) rather than a semantic token
(`color.text.primary`). **A primitive does not change between light and dark mode**, so these layers
will keep their light-mode colour on a dark background.

The most common swaps:

| Bound now           | Almost certainly means                       | Times |
| ------------------- | -------------------------------------------- | ----- |
| `color/neutral/900` | `color.text.primary`                         | 134   |
| `color/neutral/700` | `color.text.secondary`                       | 21    |
| `color/neutral/50`  | `color.surface.base`                         | 19    |
| `color/brand/white` | `color.text.inverse` or `color.surface.base` | 46    |
| `color/mono/white`  | `color.text.inverse`                         | 3     |

Two special cases worth deciding as a group rather than layer by layer:

- **Avatar** binds 45 different palette colours — this looks like a deliberate per-user identity
  palette. If so it probably wants its own semantic token set (something like
  `color.avatar.*`) rather than 45 raw bindings.
- **`color/purple/700` (64×)** and **`color/brand/red` (56×)** appear across many view pages; these
  may be intentional brand or illustration colours, in which case they are fine — we just cannot
  tell them apart from mistakes.

Also: **Tab Item** and **Spinner** bind `border.strong` — a _width_ value — into a colour slot.

| Component                             | Figma page                                 | Primitives bound                                                                                                        | Open                                                                             |
| ------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Agenda Row**                        | Agenda Row                                 | `color/purple/50`, `color/purple/700`                                                                                   | [6651:138](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6651-138)     |
| **Device Card**                       | Device Card                                | `color/neutral/900`                                                                                                     | [10402:922](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10402-922)   |
| **Event Row**                         | Event Row                                  | `color/neutral/50`, `color/neutral/700`                                                                                 | [7358:6](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7358-6)         |
| **Image Card**                        | Image Card                                 | `color/neutral/900`                                                                                                     | [10401:26](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10401-26)     |
| **Insight Card**                      | Insight Card                               | `color/neutral/900`                                                                                                     | [3151:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3151-2)         |
| **Interactive Card**                  | Interactive Card                           | `color/neutral/900`                                                                                                     | [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504)   |
| **Launch Card**                       | Launch Card                                | `color/alpha/white-60`                                                                                                  | [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814)   |
| **Avatar**                            | Avatar                                     | `color/blue/100`, `color/blue/50`, `color/blue/500`, `color/blue/700`, `color/blue/800`, `color/green/100` +39 more     | [2578:1831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-1831)   |
| **Column Item**                       | Table                                      | `color/neutral/700`                                                                                                     | [4458:3831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3831)   |
| **PropertyList**                      | Property List                              | `color/neutral/900`                                                                                                     | [7739:29013](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-29013) |
| **PropertyRow**                       | Property List                              | `color/neutral/900`                                                                                                     | [7676:169](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7676-169)     |
| **StatusIndicator**                   | Status Indicator                           | `color/neutral/100`, `color/neutral/50`                                                                                 | [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)     |
| **TableFooter**                       | Table                                      | `color/neutral/900`                                                                                                     | [6596:44918](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-44918) |
| **Banner**                            | Banner                                     | `color/alpha/turquoise-50`                                                                                              | [2764:627](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2764-627)     |
| **SearchField**                       | Search                                     | `color/neutral/900`                                                                                                     | [3773:278](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-278)     |
| **PaginationNav**                     | Pagination                                 | `color/neutral/900`                                                                                                     | [3653:22](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3653-22)       |
| **Cursor**                            | Cursor                                     | `color/mono/white`, `color/neutral/900`                                                                                 | [8871:436](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8871-436)     |
| **.Component Description**            | .[UTILITY]                                 | `color/mono/white`, `color/neutral/100`, `color/neutral/400`, `color/neutral/700`, `color/neutral/900`, `color/red/500` | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612) |
| **Activity Feed**                     | Activity Feed                              | `color/blue/700`, `color/purple/700`, `color/red/700`                                                                   | [8512:5284](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5284)   |
| **DataTable**                         | Data Table                                 | `color/neutral/900`                                                                                                     | [6596:47707](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6596-47707) |
| **AppShell**                          | App Shell                                  | `color/brand/red`, `color/purple/700`                                                                                   | [5888:18630](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18630) |
| **Command Item**                      | Command Palette                            | `color/neutral/900`                                                                                                     | [5760:4612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-4612)   |
| **Layout**                            | Shell Tier 4 · Client app (Chatter)        | `color/brand/red`, `color/purple/700`                                                                                   | [6499:6699](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6699)   |
| **Layout / Canvas**                   | Shell Tier 2 · Canvas app                  | `color/purple/700`                                                                                                      | [6499:6448](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6448)   |
| **Layout / Config **                  | Shell Tier 3 · Config app (Chatter Config) | `color/purple/700`                                                                                                      | [6499:6532](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6499-6532)   |
| **Layout / Workplace**                | Shell Tier 1 · Workplace                   | `color/brand/red`, `color/purple/700`                                                                                   | [6498:5921](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6498-5921)   |
| **Page Header**                       | Page Header                                | `color/neutral/900`                                                                                                     | [6186:21246](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246) |
| **Profile Dropdown**                  | Profile Dropdown                           | `color/purple/50`                                                                                                       | [4644:6843](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6843)   |
| **Sidebar**                           | Sidebar                                    | `color/brand/red`                                                                                                       | [2666:781](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2666-781)     |
| **Top Bar**                           | Top Bar                                    | `color/purple/50`, `color/purple/700`                                                                                   | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| **Account Settings**                  | Account Settings                           | `color/neutral/900`, `color/purple/700`                                                                                 | [7706:14605](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7706-14605) |
| **Linked Accounts & API Tokens**      | Linked Accounts & API Tokens               | `color/neutral/700`, `color/neutral/900`                                                                                | [7506:27098](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7506-27098) |
| **User Profile**                      | User Profile                               | `color/blue/700`, `color/neutral/50`, `color/neutral/700`, `color/purple/700`, `color/red/700`                          | [7400:23455](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7400-23455) |
| **Auth - Create organization**        | Join or Create Organization                | `color/brand/red`, `color/brand/white`, `color/purple/700`                                                              | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| **Auth - Join Organization **         | Join or Create Organization                | `color/brand/red`, `color/brand/white`, `color/purple/700`                                                              | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)   |
| **Auth — Forgot Password**            | Forgot Password                            | `color/brand/red`, `color/brand/white`                                                                                  | [7776:21546](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-21546) |
| **Auth — Invite Acceptance**          | Invite Acceptance                          | `color/brand/red`, `color/brand/white`                                                                                  | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| **Auth — MFA Challenge**              | MFA Challenge                              | `color/brand/red`, `color/brand/white`                                                                                  | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| **Auth — Session Expired**            | Session Expired                            | `color/brand/red`, `color/brand/white`                                                                                  | [7810:21910](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21910) |
| **Auth — Sign In / Email**            | Auth — Sign In                             | `color/brand/red`, `color/brand/white`                                                                                  | [6177:20771](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20771) |
| **Auth — Sign In / Email + Password** | Auth — Sign In                             | `color/brand/red`, `color/brand/white`                                                                                  | [6177:20772](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6177-20772) |
| **Auth — Sign Up**                    | Auth — Sign Up                             | `color/brand/black`, `color/brand/red`, `color/brand/white`                                                             | [9655:12885](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9655-12885) |
| **Organization Selector**             | Organization Selector                      | `color/brand/red`, `color/brand/white`, `color/pink/700`, `color/purple/700`                                            | [6592:38886](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6592-38886) |
| **Activity Log**                      | Activity Log                               | `color/blue/700`, `color/neutral/900`, `color/purple/700`, `color/red/700`                                              | [7470:25944](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-25944) |
| **Announcements / What's New**        | Announcements / What's New                 | `color/neutral/900`                                                                                                     | [8488:384](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8488-384)     |
| **Notification Center**               | Notification Center                        | `color/neutral/900`                                                                                                     | [8473:227](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8473-227)     |
| **Device Detail**                     | Device Detail                              | `color/neutral/900`, `color/purple/700`                                                                                 | [8616:112](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8616-112)     |
| **Devices List**                      | Device List                                | `color/neutral/900`                                                                                                     | [6783:8331](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6783-8331)   |
| **File & Asset Browser**              | File & Asset Browser                       | `color/neutral/900`                                                                                                     | [8243:2826](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8243-2826)   |
| **Dashboard**                         | Dashboard                                  | `color/neutral/900`                                                                                                     | [7229:9275](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)   |
| **Entity List**                       | Entity List                                | `color/neutral/900`                                                                                                     | [7776:14270](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-14270) |
| **Entity List**                       | Entity Detail                              | `color/blue/700`, `color/neutral/900`, `color/purple/700`, `color/red/700`                                              | [7776:11871](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7776-11871) |
| **Search Results**                    | Search Results                             | `color/neutral/900`                                                                                                     | [7470:23845](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845) |
| **Settings**                          | Settings                                   | `color/neutral/900`                                                                                                     | [7058:43950](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7058-43950) |
| **Help Center**                       | Help Center                                | `color/neutral/900`                                                                                                     | [8453:418](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8453-418)     |
| **API & Webhooks**                    | API & Webhooks                             | `color/neutral/900`                                                                                                     | [8449:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8449-1130)   |
| **Audit Log**                         | Audit Log                                  | `color/blue/700`, `color/neutral/900`, `color/purple/700`, `color/red/700`                                              | [8475:1244](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8475-1244)   |
| **Billing History**                   | Billing History                            | `color/neutral/900`                                                                                                     | [8389:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8389-1130)   |
| **General**                           | General                                    | `color/neutral/900`                                                                                                     | [8407:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8407-1130)   |
| **Licenses**                          | Licenses                                   | `color/neutral/900`                                                                                                     | [8320:144](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8320-144)     |
| **Members**                           | Members                                    | `color/neutral/700`, `color/neutral/900`                                                                                | [8083:6420](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8083-6420)   |
| **Payment Method Card**               | Licenses                                   | `color/neutral/900`                                                                                                     | [8378:283](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8378-283)     |
| **SSO & SAML**                        | SSO & SAML                                 | `color/neutral/900`                                                                                                     | [8421:1130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8421-1130)   |
| **403 Forbidden**                     | 403 Forbidden                              | `color/brand/red`, `color/brand/white`                                                                                  | [6593:38890](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38890) |
| **404 Not Found**                     | 404 Not Found                              | `color/brand/red`, `color/brand/white`                                                                                  | [6593:38891](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38891) |
| **500 Server Error**                  | 500 Server Error                           | `color/brand/red`, `color/brand/white`                                                                                  | [6593:38892](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38892) |
| **Maintenance**                       | Maintenance                                | `color/brand/red`, `color/brand/white`                                                                                  | [6593:38893](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38893) |
| **Offline**                           | Offline                                    | `color/brand/red`, `color/brand/white`                                                                                  | [6593:38894](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-38894) |

## 4. Descriptions that contradict the component set — 21

The description states variants or axis values the set does not have. We cannot tell whether
variants were added and the text went stale, or drawn by mistake.

The two most consequential:

- **Button** — the description lists sizes `xs, sm, md, lg`; the set has `md, sm, xl`. Neither `xs`
  nor `lg` exists and `xl` is undocumented. Button sizing propagates into everything that embeds a
  button, so this one is worth settling first.
- **Icon Button** — the description accounts for 72 variants; the set has 126.

| Component                  | Figma page        | Mismatch                                                                                                                          | Open                                                                             |
| -------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Link**                   | Link              | Description says 12 variants; the set has 15.                                                                                     | [2715:626](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2715-626)     |
| **Segmented Control Item** | Segmented Control | Description says 4 variants; the set has 8.                                                                                       | [2488:12014](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2488-12014) |
| **BackButton**             | Back Button       | Description says 8 variants; the set has 12.                                                                                      | [4549:130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4549-130)     |
| **Button**                 | Button            | Description says 96 variants; the set has 108.                                                                                    | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)   |
| **Button**                 | Button            | Axis `size`: description lists [xs, sm, md, lg], set has [md, sm, xl].                                                            | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)   |
| **Button**                 | Button            | Axis `state`: description lists [default, hover, pressed, disabled], set has [default, hover, pressed, disabled, focus, loading]. | [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)   |
| **Button Group**           | Button Group      | Description says 2 variants; the set has 3.                                                                                       | [2618:3237](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2618-3237)   |
| **Icon Button**            | Icon Button       | Description says 72 variants; the set has 126.                                                                                    | [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)     |
| **FAB**                    | FAB               | Description says 20 variants; the set has 24.                                                                                     | [4557:130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4557-130)     |
| **SplitButton**            | Split Button      | Description says 16 variants; the set has 24.                                                                                     | [4569:200](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4569-200)     |
| **Day Cell**               | Date Picker       | Description says 6 variants; the set has 13.                                                                                      | [3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)       |
| **FileUpload**             | File Upload       | Description says 5 variants; the set has 6.                                                                                       | [4475:5361](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4475-5361)   |
| **Number Input**           | Number Input      | Description says 16 variants; the set has 20.                                                                                     | [3886:170](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3886-170)     |
| **SearchField**            | Search            | Description says 4 variants; the set has 12.                                                                                      | [3773:278](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-278)     |
| **GlobalSearch**           | Search            | Description says 4 variants; the set has 10.                                                                                      | [3781:1596](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3781-1596)   |
| **Select**                 | Select            | Description says 10 variants; the set has 12.                                                                                     | [5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92)       |
| **Slider**                 | Slider            | Description says 4 variants; the set has 7.                                                                                       | [5475:48](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5475-48)       |
| **Action Card**            | Action Card       | Axis `status`: description lists [default, done], set has [default, done, danger].                                                | [3044:45](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3044-45)       |
| **Card**                   | Card              | Axis `status`: description lists [none, danger, warning, success], set has [none, danger, warning, success, info].                | [3059:214](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3059-214)     |
| **Card**                   | Card              | Axis `loading`: description lists [skeleton], set has [false, true].                                                              | [3059:214](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3059-214)     |
| **FilterPanel**            | Filter Panel      | Description says 12 variants; the set has 3.                                                                                      | [5674:637](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5674-637)     |

## 5. State and axis naming — 13 + 10

We read the `state` axis to generate real interaction states, so consistent naming matters more here
than on other axes. The house vocabulary looks like `default, hover, pressed, focus, disabled`.

Worth deciding as a group: **`ghost`, `destructive` and `readonly` read like variants, not states** —
a permanent visual style or mode rather than an interaction. Modelled on the state axis they cannot
be combined with hover or focus.

| Component              | Figma page           | Finding                                                                  | Open                                                                             |
| ---------------------- | -------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **Tree Item**          | Tree Item            | State axis uses non-standard value(s): edit.                             | [2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)   |
| **Icon Button**        | Icon Button          | State axis has both `pressed` and `active`.                              | [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)     |
| **Day Cell**           | Date Picker          | State axis uses non-standard value(s): today.                            | [3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)       |
| **Text Area**          | Text Area            | State axis has both `focus` and `focused`.                               | [3888:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3888-128)     |
| **Context Menu Item**  | Context Menu         | State axis uses non-standard value(s): destructive.                      | [3451:31](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3451-31)       |
| **Status Card**        | Status Card          | State axis uses non-standard value(s): ghost.                            | [3763:676](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3763-676)     |
| **Day Cell**           | Day Cell             | State axis uses non-standard value(s): other-month, today, today-column. | [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)       |
| **SearchResultsPanel** | Search Results Panel | State axis uses non-standard value(s): no results, ghost.                | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Sidebar Locations**  | Sidebar Locations    | State axis uses non-standard value(s): search, no-results, rename.       | [10406:1217](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10406-1217) |
| **Schedule Strip**     | Schedule Strip       | State axis uses non-standard value(s): ghost.                            | [6593:41547](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547) |
| **Stat Card**          | Stat Card            | State axis uses non-standard value(s): ghost.                            | [6579:25711](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6579-25711) |
| **Stat Card Small**    | Stat Card            | State axis uses non-standard value(s): ghost.                            | [9059:28778](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9059-28778) |
| **Node end**           | Coachmark            | State axis uses non-standard value(s): 01, 02.                           | [10802:2282](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10802-2282) |

### Axis names

Capitalisation and typos create separate axes as far as any tool is concerned.

| Axis name as drawn | Should be         | Components                                            | Open                                                                               |
| ------------------ | ----------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `Breakpoint`       | `breakpoint`      | Auth - Join Organization , Auth - Create organization | [9441:2459](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2459)     |
| `Property 1`       | a meaningful name | Dashboard                                             | [7229:9275](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7229-9275)     |
| `Shade`            | `shade`           | Avatar                                                | [2578:1831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-1831)     |
| `Size`             | `size`            | Dropdown Group Label                                  | [2781:1203](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2781-1203)     |
| `State`            | `state`           | Node end                                              | [10802:2282](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10802-2282)   |
| `Style`            | `style`           | Alert, Alert Small                                    | [2762:706](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2762-706)       |
| `Type`             | `type`            | Cursor                                                | [8871:436](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8871-436)       |
| `Variant`          | a meaningful name | Option Row, Alert, Alert Small, Banner                | [10102:10994](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10102-10994) |
| `breakdpoint`      | `breakpoint`      | Search Results                                        | [7470:23845](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7470-23845)   |

Also worth a pass: `no results` (with a space) and `no-results` (hyphen) are used for the same idea
on different components, and **Coachmark › Node end** uses `01` and `02` as state names.

## 6. Local variables that should be library variables — 5

These bind a variable stored locally in the SOLAR Web file that has the same name as a real
Foundations token. They look correct on the canvas but do not track the published library.

| Component                      | Figma page                  | Local variables bound                                                                                                                                                                                                                                                                                    | Open                                                                             |
| ------------------------------ | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **ColumnRow**                  | Column Chooser              | `.Primitives:typography/letter-spacing/body (-0,2em)`, `Color(local):icon/tertiary`, `Color(local):surface/hover`, `Color(local):text/primary`, `Color(local):text/secondary`, `Spatial(local):inset/xs`, `Type(local):line-height/body/sm`, `Type(local):size/body/sm`                                  | [6951:14726](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6951-14726) |
| **Auth - Create organization** | Join or Create Organization | `Color(local):text/primary`                                                                                                                                                                                                                                                                              | [9441:2461](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9441-2461)   |
| **Auth — MFA Challenge**       | MFA Challenge               | `Type(local):line-height/body/xs`, `Type(local):size/body/xs`                                                                                                                                                                                                                                            | [7810:21831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-21831) |
| **Auth — Invite Acceptance**   | Invite Acceptance           | `Type(local):line-height/body/xs`, `Type(local):size/body/xs`                                                                                                                                                                                                                                            | [7810:22325](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7810-22325) |
| **.Component Description**     | .[UTILITY]                  | `Base Typograhy:font-family/Inter`, `Base Typograhy:font-sizing/1,25rem`, `Base Typograhy:font-sizing/1,5rem`, `Base Typograhy:font-sizing/2,5rem`, `Base Typograhy:font-weight/500`, `Base Typograhy:font-weight/600`, `Base Typograhy:letter-spacing/body (-0,2em)`, `Scale:0,875rem`, `Scale:1,25rem` | [6239:26612](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6239-26612) |

The `.Component Description` template also binds two pre-SOLAR collections, **`Base Typograhy`** and
**`Scale`**. It is documentation chrome rather than product UI, so it is low priority — but note the
collection name itself is misspelled (missing the second `p`), and it is the single largest source of
hard-coded values in the file.

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
on 2026-09-21. Counts are computed from the files, not estimated. Happy to walk through any of this
live — and happy to be wrong on the judgement calls, where we may be missing context._
