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

**Scope.** Part 1 covers the component sets we build from in SOLAR Web: the Components and Patterns
sections. It leaves out the view pages, which are not in use yet, and the documentation utility
frame, so nothing found only there (a missing description, a stray binding) is listed. Parts 2 and
3 cover Foundations and Icons completely.

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
- **`inset.*` and `stack.*`.** Two spacing scales with the same numbers. `inset` is padding inside a
  container and the gap of a horizontal auto layout; `stack` is the gap between siblings stacked
  vertically.
- **Axes and variants.** A component set's properties (`size`, `prio`, `state`, …) are its axes;
  each combination is a variant. SOLAR's model is that **geometry follows `size` and colour follows
  `prio`, `state` and `danger`**; section 6 lists where a component departs from it.

## Start here

If you take only a few items, take these:

1. **In Dark, a primary button's icons disappear on hover** — white on white — and nearly
   disappear when pressed. Two variable values; the one problem on this list that users would
   notice. [Section 8](#8-action-colours-below-the-contrast-floor--5).
2. **Control heights** — eleven components describe themselves as 36/44px tall and are drawn at
   32/40px, which is also the touch-target question. [Section 3](#3-described-sizes-that-disagree-with-the-drawing--11-components).
3. **36 Accessibility cards** still carry the Breadcrumbs page's text, and two Usage cards do too.
   [Section 5](#5-documentation-cards-copied-from-breadcrumbs--36-pages).

## At a glance

| #                                                                     | What                                              | Count                                                                                                                 | File        |
| --------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------- |
| [1](#1-hard-coded-values--9-across-8-components)                      | Hard-coded values not bound to a variable         | 9 in 8 components, and 1,130 zeros                                                                                    | SOLAR Web   |
| [2](#2-primitive-colours-used-directly--3-components)                 | Components using primitive colours directly       | 3                                                                                                                     | SOLAR Web   |
| [3](#3-described-sizes-that-disagree-with-the-drawing--11-components) | Described sizes that disagree with the drawn ones | 11                                                                                                                    | SOLAR Web   |
| [4](#4-variable-bindings--2-wrong-2-unknown)                          | Wrong or unknown variable bindings                | 2 + 2                                                                                                                 | SOLAR Web   |
| [5](#5-documentation-cards-copied-from-breadcrumbs--36-pages)         | Documentation cards copied from Breadcrumbs       | 36 pages                                                                                                              | SOLAR Web   |
| [6](#6-the-components-we-build-variant-by-variant)                    | The components we build, in detail                | Button 6, Spinner 2, Icon Button 5, Button Group 3, StatusIndicator 2, the display primitives 3 fixes and 5 questions | SOLAR Web   |
| [7](#7-guideline-pages-that-contradict-the-variables)                 | Guideline pages that contradict the variables     | 2, and 2 page edits                                                                                                   | Foundations |
| [8](#8-action-colours-below-the-contrast-floor--5)                    | Action colours below the contrast floor           | 5                                                                                                                     | Foundations |
| [9](#9-icons-and-logos)                                               | Icons and logos                                   | no icon findings; 2 logo questions                                                                                    | SOLAR Icons |

---

# Part 1 · SOLAR Web

## 1. Hard-coded values — 9 across 8 components

Gaps typed in as numbers rather than bound to a variable. They do not follow theme or density
changes, and they are invisible unless you inspect the layer. **Each matches a variable exactly**
and can be bound with no visual change. All nine are the gaps of horizontal auto layouts, so the
variable to bind is an `inset`.

| Component                    | Section               | Layer                              | Property | Current  | Bind to    | Open                                                                             |
| ---------------------------- | --------------------- | ---------------------------------- | -------- | -------- | ---------- | -------------------------------------------------------------------------------- |
| **SearchResultsPanel**       | patterns/layout-shell | ResultsBody › Dropdown Group Label | gap      | `8px` ×2 | `inset.xs` | [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327)   |
| **Activity Feed Filter Row** | patterns/data         | breakpoint=desktop                 | gap      | `8px`    | `inset.xs` | [8512:5759](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8512-5759)   |
| **Schedule Strip**           | patterns/dashboards   | Container                          | gap      | `8px`    | `inset.xs` | [6593:41547](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6593-41547) |
| **Notifications Panel**      | patterns/layout-shell | Header                             | gap      | `12px`   | `inset.sm` | [4644:6776](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4644-6776)   |
| **Top Bar**                  | patterns/layout-shell | desktop, with sidebar, logged in   | gap      | `12px`   | `inset.sm` | [5888:18620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18620) |
| **Widget Card**              | patterns/dashboards   | Header                             | gap      | `12px`   | `inset.sm` | [5465:85](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5465-85)       |
| **Calendar Toolbar**         | components/calendar   | Calendar Toolbar                   | gap      | `16px`   | `inset.md` | [6653:861](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6653-861)     |
| **Page Header**              | patterns/layout-shell | Container                          | gap      | `16px`   | `inset.md` | [6186:21246](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6186-21246) |

**Zeros, everywhere.** Separately from these, 1,130 paddings and gaps, in 95 of the 119 sets in the
Components section, are `0` and bound to nothing. `inset/none` and `stack/none` are the variables
for `0`, so there is no visual change to make: binding them would only make the intent explicit
and let density changes reach them. We read every unbound `0` padding as `inset/none`, and every
unbound `0` gap as `inset/none` or `stack/none` by the direction of its auto layout, in every
component, so they need no answer component by component. If you rebind them in bulk, nothing in
our code changes.

## 2. Primitive colours used directly — 3 components

Bound directly, a primitive does not follow Light and Dark, because only the semantic colours are
reassigned per mode.

| Component            | Section            | Layer                                          | Primitive              | Open                                                                           |
| -------------------- | ------------------ | ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| **Interactive Card** | components/cards   | the text-and-icon row's icon (`Icon/None`)     | `color/neutral/900`    | [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504) |
| **Launch Card**      | components/cards   | the favourite Icon Button over the cover image | `color/alpha/white-60` | [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814) |
| **Cursor**           | components/utility | Copy's plus disc (`Oval 3`)                    | `color/green/400`      | [8871:436](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8871-436)   |
| **Cursor**           | components/utility | Progress's arc (`Rectangle 8`)                 | `color/blue/400`       | [8871:436](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8871-436)   |

The icon wants a `color/icon/*` colour. The favourite button's translucent white sits on a photo,
where no Light or Dark colour helps; if it is meant to stay white on every image, a semantic
overlay colour would say so. No semantic colour has Cursor's two values: we draw the plus disc
with `color/surface/feedback/success/strong` and the arc with `color/icon/link/hover` (`green/500`
and `blue/500` in Light, beside the disc's own `icon/link/default`), and ask you to rebind them.

Two sources of primitives are not on this list, on purpose. **Avatar**'s colours are the user's
choice: an avatar takes whatever colour it is given, so its palette, and the Avatars inside Agenda
Row, Event Row, Column Item, Activity Feed, Profile Dropdown and Top Bar, are samples rather
than bindings. **The Biamp logo** carries `color/brand/red` and `brand/white`, as a brand mark always
carries its own colours; that is every other primitive in the patterns.

## 3. Described sizes that disagree with the drawing — 11 components

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
control-height variable and a target-size variable would settle this and section 6's heights
together.

## 4. Variable bindings — 2 wrong, 2 unknown

**Wrong bindings** — a value bound to a variable of the wrong kind or from the wrong place:

| Component    | Finding                                                                                                                          | Open                                                                         |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Spinner**  | The default indicator's colour is bound to `border/strong`, the stroke-_width_ variable. Presumably meant `color/border/strong`. | [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102) |
| **Tab Item** | A colour bound to `border/strong`, the stroke-width variable, as on Spinner.                                                     | [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)   |

**Unknown variables** — these layers are bound to two variables that are not in the Foundations
library at all, so we cannot tell what value they hold. They may have been deleted, detached or
taken from another library. Rebinding each to its Foundations equivalent fixes it.

| Component                                  | Bound property                   | Uses | Open                                                                                                                                                           |
| ------------------------------------------ | -------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Column Chooser**, **SearchResultsPanel** | corner radius (all four corners) | 88   | [6952:1068](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6952-1068), [7258:3327](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7258-3327) |
| **StatusIndicator**                        | the `help` type's border colour  | 4    | [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)                                                                                   |

## 5. Documentation cards copied from Breadcrumbs — 36 pages

On 36 pages the documentation card's **Accessibility** section still holds the Breadcrumbs page's
text ("Wrap the trail in `<nav aria-label="Breadcrumb">`…") rather than the page's own component's.
Their Usage sections now describe their own components, except on two pages:

- **Nav Item** and **Stepper**: the Usage section is Breadcrumbs' too ("Shows the user's location
  within a navigational hierarchy…").
  [2663:774](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2663-774),
  [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)

The 36 pages, whose Accessibility section needs its own text:

| Section                           | Pages                                                                                          |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| components/cards                  | Accordion, Action Card, Card, Divider, Expandable Card, Insight Card, Insight Row, Status Card |
| components/calendar               | Day Cell, Weekday Header, Event Chip, Time Slot, Calendar Toolbar                              |
| components/dialogs                | Dialog, Confirmation Dialog, Drawer                                                            |
| components/feedback               | Empty State, Spinner                                                                           |
| components/navigation             | Nav Item, Stepper                                                                              |
| components/data-display, overlays | Table, Popover                                                                                 |
| patterns/layout-shell             | App Shell, Command Palette, Page Header, Search Results Panel, Sidebar, Top Bar                |
| patterns/data                     | Bulk Actions Bar, Column Chooser, Data Table, Filter Panel                                     |
| patterns/forms, dashboards        | Form Row, Form Section, Widget Card, Stat Card                                                 |

## 6. The components we build, variant by variant

We have read every variant of each component we build against the others. SOLAR's model — geometry follows `size`, colour follows `prio`, `state` and `danger` —
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
| **Heights have no variable.** Button is 32 / 40 / 48px tall, lg is 200px wide and the counter badge 20px tall, all fixed and bound to nothing, and SOLAR publishes no control-size variable. Would you add one (e.g. `control/height/sm…lg`)? Section 3 is the same question from the other side.                                                          | We carry these as raw pixel values, the only ones we allow. |

### Spinner · [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)

- **Fix:** the default indicator's colour is bound to a width variable (section 4). We draw it with
  `color/border/strong` meanwhile, the colour whose inverse the inverse style uses.
- **⚠️ Decide:** the ring is 16, 24 and 32px across and bound to nothing. Should Spinner sizes be
  variables of their own, or follow the icon ladder (`icon/sm`, `icon/lg`, `icon/2xl` have the same
  values)?

### Icon Button · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)

Its sizes are in section 3 (described 28/36/44, drawn 32/40/48).

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
target-size question as section 3.

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

### StatusIndicator · [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)

Each type is its own drawing, from other layers (success is the disc itself, warning a triangle,
danger a circle, the rest a disc frame), and `xs` is the dot alone. We build each as drawn, placing
each mark where Figma puts it. The `help` type's border is bound to an unknown variable (section 4).

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                            | What we do meanwhile            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **A shadow on the marks?** The tick, the exclamation, the cross, info's `i` and neutral's dash carry `shadow/raised`; help's question mark and private's lock do not. A shadow variable is a box shadow, which a mark's outline cannot take. Should the marks have a shadow (then a drop-shadow variable), or none? | We draw no shadow on the marks. |
| **The xs dot's size.** It is 8px, below the icon ladder, whose smallest is 12. md and sm are 20 and 16, which bind to `icon/md` and `icon/sm`. A size variable for the dot, or the ladder extended?                                                                                                                 | We carry 8px as a raw value.    |

### The display primitives

Counter, Kbd, Timestamp, Avatar, Trend Badge, Divider, Skeleton, ProgressBar, Node End, RowExpand,
Tree Indent and Cursor, the small parts the rest of the library is built from. We build each as
drawn. Kbd and Timestamp have nothing to raise. Divider, Skeleton and ProgressBar are drawn at
sample sizes (Divider 320px wide, ProgressBar 200px, Skeleton the size of its content), which in
code fill the space or take the content they are given; nothing needs to change.

**Fix** — these look like accidents:

| Component                                                                                            | What                                                                                                                                                         | Variants             |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| **Trend Badge** · [2203:3287](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2203-3287)     | The **xs decline** dot is `color/icon/feedback/danger`, where decline's md and sm, and every other type at xs, use their `surface/feedback/*/strong` colour. | 1: `decline / xs`    |
| **Avatar** · [2578:1831](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-1831)          | There is **no lg logo** avatar; every other type is drawn at all four sizes. We draw lg's size with md's look.                                               | `logo / lg`          |
| **Tree Indent** · [10229:19647](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10229-19647) | Each depth unit is **39px tall inside the 32px indent**, overflowing it. We draw 39, as drawn; is 32 meant?                                                  | every depth but `00` |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                                  | What we do meanwhile                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Avatar's initials on a colour.** An avatar takes any colour, so its initials need a rule. Figma's samples pair each colour with a darker or lighter shade of its hue, but on the Medium shade 8 of the 9 samples fall below 4.5:1 (yellow 2.5, turquoise 2.3, neutral 3.3, pink 3.5, green 3.7, red, orange and blue 4.1; purple 4.7 passes). Is the rule yours to set? | We keep the colour's hue at Figma's own lightness and move it toward black or white just enough to reach 4.5:1.                    |
| **Sizes with no variable.** Counter's badge is 20px tall, Avatar 44, 32, 24 and 16, ProgressBar 6, a table row (RowExpand) 40, a tree row (Tree Indent) 32, a labelled Divider 20 and Trend Badge's xs dot 8, all bound to nothing. One family of size variables, as for Button's heights?                                                                                | We carry them as raw values.                                                                                                       |
| **Node End's halo** is the dot's colour at 20% layer opacity. SOLAR has alpha colours but no opacity scale, and no alpha form of `surface/feedback/info/strong`. A variable for it?                                                                                                                                                                                       | We carry 0.2 as Figma's number.                                                                                                    |
| **Cursor's shadow.** The Default arrow, alone of the 22, carries `shadow/raised`, which falls as a drop shadow following the arrow; the same question as StatusIndicator's marks.                                                                                                                                                                                         | We draw no shadow.                                                                                                                 |
| **Skeleton's pulse.** Its description asks for "a subtle shimmer or pulse", and SOLAR has no motion variable for a loop.                                                                                                                                                                                                                                                  | The web uses MUI's pulse; Flutter pulses the same way, over `motion.duration.slower` each way. Neither moves under reduced motion. |

---

# Part 2 · SOLAR Foundations

## 7. Guideline pages that contradict the variables

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

## 8. Action colours below the contrast floor — 5

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

## 9. Icons and logos

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
   a target-size variable would settle both this and Button's fixed heights. Sections 3 and 6.
2. **Spinner sizes** — variables of their own, or the icon ladder? Section 6.
3. **The xs dots** — StatusIndicator's and Trend Badge's, 8px, below the icon ladder: a variable
   for them? Section 6.
4. **Sizes with no variable** — Counter's badge, Avatar, ProgressBar, the table and tree rows, a
   labelled Divider: one family of size variables? Section 6.
5. **A logo size scale** (`logo.*`)? Section 9.

**Colour**

6. **Danger hover labels** at 4.07 and 4.13 : 1 — a darker hover red, or an accepted exception for
   the hover state? Section 8.
7. **Avatar's initials** — an avatar takes any colour its user picks. Should the initials' colour be
   picked with it, or follow from it? Figma pairs each fill with a darker or lighter shade of the
   same hue, below 4.5:1 on 8 of the 9 Medium samples; meanwhile we keep the hue and move it just
   far enough to reach 4.5:1. Section 6.
8. **Node End's halo** — 20% opacity, with no opacity scale or alpha variable for it. Section 6.
9. **Launch Card's favourite button** — translucent white on any cover image: a semantic overlay
   colour, or a fixed white on purpose? Section 2.
10. **Icon master colour** — the semantic `color/icon/primary`, or the primitive the checklist
    should then mention? Section 7.

**Components**

11. **Button `lg`** — a larger button, or a different kind (full-width or menu)? Icon Button's lg is
    flat the same way. Section 6.
12. **Tertiary hover's underline** — meant everywhere, or only where it is drawn? Section 6.
13. **Icon Button's primary border** — grey at sm and only at rest, where Button's primary keeps its
    `#111111` action border in every state. Which is right? Section 6.
14. **A focus ring on press** — Icon Button's pressed primary and secondary show it, Button's do
    not. Intended? Section 6.
15. **Button Group's description** — "regular sizes to content" and "all children share one prio",
    where every group is drawn with filling buttons of mixed priority. Section 6.
16. **Drop shadows** — StatusIndicator's marks and Cursor's Default arrow carry `shadow/raised`, a
    box shadow, where the shape needs a drop shadow: a drop-shadow variable, or none? Section 6.
17. **Skeleton's pulse** — a motion variable for it? Section 6.

**Structure**

18. **Action states** — `active` in the variables, `pressed` on the guideline pages. Which name
    should both use? Section 7.
19. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR
    Web rather than in Foundations. Should it move down a layer?
20. **A flat Teams mark**, if Microsoft publishes one? Section 9.

---

_Read from SOLAR Foundations `[v1--2026]` version `2402389239778582681`, SOLAR Web `[v1--2026]`
version `2402690438319512660` and SOLAR Icons `[v2--2026]` version `2402400024423705866`, on
2026-09-24. Counts are computed from the files, not estimated. We are happy to walk through any of
this live — and happy to be wrong on the judgement calls, where we may be missing context._
