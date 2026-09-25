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
2. **A target-size variable** — the descriptions now say the 44 × 44 hit area is padded in code;
   we do, with one raw 44 in each platform's code, which a variable would replace. Decision 1.

## At a glance

| #                                                                   | What                                              | Count                                                                                                                                                                                                                                                                                                                                                                                                                                                            | File        |
| ------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| [1](#1-hard-coded-values--9-across-8-components)                    | Hard-coded values not bound to a variable         | 9 in 8 components, and 1,130 zeros                                                                                                                                                                                                                                                                                                                                                                                                                               | SOLAR Web   |
| [2](#2-primitive-colours-used-directly--2-components)               | Components using primitive colours directly       | 2                                                                                                                                                                                                                                                                                                                                                                                                                                                                | SOLAR Web   |
| [3](#3-described-sizes-that-disagree-with-the-drawing--1-component) | Described sizes that disagree with the drawn ones | 1 (Link)                                                                                                                                                                                                                                                                                                                                                                                                                                                         | SOLAR Web   |
| [4](#4-variable-bindings--2-wrong-2-unknown)                        | Wrong or unknown variable bindings                | 2 + 2                                                                                                                                                                                                                                                                                                                                                                                                                                                            | SOLAR Web   |
| [5](#5-documentation-cards-copied-from-breadcrumbs--resolved)       | Documentation cards copied from Breadcrumbs       | resolved                                                                                                                                                                                                                                                                                                                                                                                                                                                         | SOLAR Web   |
| [6](#6-the-components-we-build-variant-by-variant)                  | The components we build, in detail                | Button 6, Spinner 3, Icon Button 5, Button Group 3, StatusIndicator 2, the display primitives 3 fixes and 4 questions, the buttons 3 fixes and 4 questions, the selection controls 5 fixes and 3 questions, the tags and messages 5 fixes and 2 questions, the text fields 9 fixes and 5 questions, the menus and lists 1 fix and 6 questions, the pickers 5 fixes and 8 questions, navigation 3 fixes and 9 questions, paging and steps 4 fixes and 5 questions | SOLAR Web   |
| [7](#7-guideline-pages-that-contradict-the-variables)               | Guideline pages that contradict the variables     | 2, and 2 page edits                                                                                                                                                                                                                                                                                                                                                                                                                                              | Foundations |
| [8](#8-action-colours-below-the-contrast-floor--5)                  | Action colours below the contrast floor           | 5                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Foundations |
| [9](#9-icons-and-logos)                                             | Icons and logos                                   | no icon findings; 2 logo questions                                                                                                                                                                                                                                                                                                                                                                                                                               | SOLAR Icons |

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

## 2. Primitive colours used directly — 2 components

Bound directly, a primitive does not follow Light and Dark, because only the semantic colours are
reassigned per mode.

| Component            | Section          | Layer                                          | Primitive              | Open                                                                           |
| -------------------- | ---------------- | ---------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| **Interactive Card** | components/cards | the text-and-icon row's icon (`Icon/None`)     | `color/neutral/900`    | [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504) |
| **Launch Card**      | components/cards | the favourite Icon Button over the cover image | `color/alpha/white-60` | [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814) |

The icon wants a `color/icon/*` colour. The favourite button's translucent white sits on a photo,
where no Light or Dark colour helps; if it is meant to stay white on every image, a semantic
overlay colour would say so.

Two sources of primitives are not on this list, on purpose. **Avatar**'s colours are the user's
choice: an avatar takes whatever colour it is given, so its palette, and the Avatars inside Agenda
Row, Event Row, Column Item, Activity Feed, Profile Dropdown and Top Bar, are samples rather
than bindings. **The Biamp logo** carries `color/brand/red` and `brand/white`, as a brand mark always
carries its own colours; that is every other primitive in the patterns.

## 3. Described sizes that disagree with the drawing — 1 component

Settled in the 2026-09-24 revision for all but one: the button, tab and input descriptions now give
the drawn heights, 32px and 40px, and say that "the 44×44px WCAG hit area is padded in code (no
target-size variable exists yet)". **We pad it now**, on every control we build: an invisible
target at least 44 × 44 around the drawn control on the web, and on touch platforms in Flutter.
The 44 is one raw value in each platform's code until there is a variable for it (decision 1).

One description still disagrees with its drawing:

| Component | Description says | Drawn        | Open                                                                         |
| --------- | ---------------- | ------------ | ---------------------------------------------------------------------------- |
| **Link**  | xs text 12px     | xs text 10px | [2715:626](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2715-626) |

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

## 5. Documentation cards copied from Breadcrumbs — resolved

Settled in the 2026-09-24 revision: the 36 pages whose Accessibility section held the Breadcrumbs
page's text, and Nav Item's and Stepper's Usage sections, now describe their own components.
Nothing is left to do here.

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
- **Fix:** please rename the **`style` property** (default, inverse), on Alert and Alert Small too.
  In React, the web framework we build on, `style` is reserved for a component's inline CSS, so no
  component can take a property of that name; in code it is called `variant`, the one place our
  names differ from yours. Renaming it `variant` in Figma makes the two match again.
- **⚠️ Decide:** the ring is 16, 24 and 32px across and bound to nothing. Should Spinner sizes be
  variables of their own, or follow the icon ladder (`icon/sm`, `icon/lg`, `icon/2xl` have the same
  values)?

### Icon Button · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)

Its described sizes now match the drawing, 32/40/48 (section 3).

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

The description asks for a 44 × 44 hit area around the smaller sizes; we pad it, as for every
control (section 3).

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
and Tree Indent, the small parts the rest of the library is built from. We build each as
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
| **Skeleton's pulse.** Its description asks for "a subtle shimmer or pulse", and SOLAR has no motion variable for a loop.                                                                                                                                                                                                                                                  | The web uses MUI's pulse; Flutter pulses the same way, over `motion.duration.slower` each way. Neither moves under reduced motion. |

### The buttons: FAB, BackButton, SplitButton and Link

BackButton has nothing to raise; its described sizes now match the drawing (section 3).

**Fix** — these look like accidents:

| Component                                                                                      | What                                                                                                                                                                                            | Variants                                              |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **FAB** · [4557:130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4557-130)         | The **loading extended FAB is 7 and 8px narrower** (84 and 104, beside 91 and 112 at rest) and padded evenly, so it would shrink under the pointer. We keep its size, as a loading Button does. | `extended / loading`, both sizes                      |
| **SplitButton** · [4569:200](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4569-200) | The **chevron's half is 4px wider** (44, beside 40) in pressed primary and hovered secondary, at md alone. We keep it 40.                                                                       | 2: `md / primary / pressed`, `md / secondary / hover` |
| **Link** · [2715:626](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2715-626)        | The **xs label is detached** from its text style: it binds local copies of body/xs's size and line height, which are `link/xs/default`'s. We draw it with `link/xs/*`.                          | every xs variant                                      |

**⚠️ Decide:**

| Question                                                                                                                                                                                                       | What we do meanwhile                            |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **FAB's and Link's focus draw no ring.** Their focus variants are drawn as at rest; FAB's description says "Focus ring via shadow/focus/default", and a visible focus is SOLAR's floor.                        | We draw `shadow/focus/default` on both.         |
| **SplitButton's focus ring** — the description says it "wraps whichever half is focused, not the whole control", and the focus variant rings the whole control. Which?                                         | We ring the whole control, as drawn.            |
| **Links are underlined at rest.** `link/*/default` is underlined, as `link/*/hover` is, so a link is underlined in every state; the description says it "underlines on hover". Is the resting underline meant? | We draw the underline in every state, as drawn. |
| **More opacity values** — SplitButton's rule between its halves is its label's colour at 30%, and a disabled Link is drawn at 50% over its disabled colours; the same question as Node End's halo.             | We carry Figma's numbers.                       |

### The selection controls: Checkbox, Radio, Toggle, Slider, Slider Range, DragHandle and Segmented Control

DragHandle has nothing to raise beyond its dots' sizes. Checkbox, Radio and Toggle are drawn at 16,
18 and 32 × 18px with no size variable (decision 4); their hit areas are padded to 44 × 44, as
every control's is (section 3).

**Fix** — these look like accidents:

| Component                                                                                                                                                                              | What                                                                                                                                                                                                 | Variants                      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| **Checkbox** · [2202:1291](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2202-1291)                                                                                          | The **resting mixed box has no edge**, where the resting checked box and the hovered mixed box have `border/medium`. We draw the edge.                                                               | 1: `checked / mixed`, at rest |
| **Checkbox** · [2202:1291](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2202-1291)                                                                                          | The **only disabled mixed box is drawn hovered** (`disabled` and `hover` both true); no variant draws it disabled alone. We read it as disabled.                                                     | 1                             |
| **Radio** · [2203:3333](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2203-3333)                                                                                             | A **disabled unchecked radio is drawn as an enabled one**: the same `border/medium` ring and no fill, so the two cannot be told apart. We draw it as drawn.                                          | 1: `disabled / unchecked`     |
| **Slider** · [5475:48](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5475-48), **Slider Range** · [5475:74](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5475-74) | Each **handle sits 2px before the value it marks**: its centre is at 158 for a fill ending at 160, and at 78 and 238 for a range from 80 to 240. We centre it on the value.                          | every variant                 |
| **Segmented Control** · [6170:20250](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6170-20250)                                                                               | The **label is hidden in both variants, with no prop to show it**, though the description gives the control "an optional field label" and a text prop for it. We show it where the caller gives one. | both                          |

**⚠️ Decide:**

| Question                                                                                                                                                                                                            | What we do meanwhile                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Focus where none is drawn.** Toggle, Slider Range and Segmented Control Item have no focus state (the Item's description leaves it to "the parent assembly"), and a visible focus is SOLAR's floor.               | We draw `shadow/focus/default` around the track, the whole slider and the segment. |
| **Slider's `filled` and `error`** are drawn exactly as its default. What should they look like?                                                                                                                     | They are props that draw as at rest; `error` is announced.                         |
| **The sliders' handles.** Slider Range's handles take `action/primary/border/hover` and `shadow/raised` on hover, and `action/primary/border/active` when pressed; Slider's handle does not change. Which is right? | We draw each as drawn.                                                             |

### Tags and messages: Tag, Alert, Alert Small, Banner, Toast and EmptyState

EmptyState has nothing to raise. Tag's close button and Banner's close icon and text action are
drawn without a target area (Banner's description asks for 44 × 44); we give each a 44 × 44
target, reaching as far as the tag or banner around it lets it (section 3). Tag's 24px, Banner's 44px and the
callouts' sizes join the sizes with no variable (decision 4).

**Fix** — these look like accidents:

| Component                                                                                                                                                                                    | What                                                                                                                                                                                                                             | Variants        |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| **Toast** · [2578:450](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-450)                                                                                                     | Its **Tag instance is `type=pill`**, a type Tag no longer has; its size and padding are a status tag's. We draw a status tag.                                                                                                    | every variant   |
| **Toast** · [2578:450](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-450)                                                                                                     | The **danger toast's Tag has the warning edge** (`border/feedback/warning/subtle`), where every other toast's Tag takes its own status's. We draw it as drawn.                                                                   | 1: `danger`     |
| **Alert** · [2762:706](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2762-706), **Alert Small** · [9080:29141](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9080-29141) | The descriptions offer a **close button "via boolean properties"**, and neither set draws one or has the property. We draw none.                                                                                                 | every variant   |
| **Alert** · [2762:706](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2762-706), **Alert Small** · [9080:29141](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9080-29141) | Please rename the **`style` property** (filled, outlined): React reserves `style` for inline CSS, so in code it is `variant`, as on Spinner. Renaming it `variant` in Figma makes the names match.                               | the property    |
| **Tag** · [3502:2108](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3502-2108)                                                                                                     | The description counts **45 variants as type × status × invert × show icon-leading**, where the set has no icon-leading property, and no inverted status tag (its dot would be its own fill). We draw no dot on an inverted tag. | the description |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                | What we do meanwhile                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Toast's Tag look.** The toast draws its Tag on `surface/overlay` with the toast's own edge, a look Tag itself does not have. Should Tag have it (a tag on a raised surface), or should the toast show a standard Tag? | We draw Figma's look, the toast restyling its Tag. |
| **Tag's inverted close button** is 16px with `inset/2xs` beside it, where every other close button is 12px with `inset/xs`, in all five statuses. Intended?                                                             | We draw it as drawn.                               |

---

### The text fields: Text Input, Text Area, SearchField, GlobalSearch, Password Input, Number Input, Inline Input, Token Input, PIN Input and FileUpload

Text Input's `pressed` is its focus, as its description says (we name it focus). Every field's
height joins the sizes with no variable (decision 4), and each has a 44 × 44 target around its
field (section 3). GlobalSearch is built as the trigger its description names, and Inline Input,
Token Input and PIN Input hold their own values, by the owner's decisions.

**Fix** — these look like accidents:

| Component                                                                                                                                                                                                                                                                                      | What                                                                                                                                                                                                                                                               | Variants |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **Text Input** · [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737), **Password Input** · [2995:245](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-245)                                                                                             | The **sm field keeps md's 12px padding** when focused, filled, disabled or in error (Text Input), and is **centred** (`CENTER/CENTER`) when disabled or in error. We draw sm's 8px, laid out from the start.                                                       | 4 and 2  |
| **SearchField** · [3773:278](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-278), **GlobalSearch** · [3781:1596](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3781-1596)                                                                                              | The **error field is centred** (`CENTER/CENTER`) where every other state lays out from the start. We lay it out from the start.                                                                                                                                    | error    |
| **SearchField** · [3773:278](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-278)                                                                                                                                                                                                 | The **resting sm field's icons are 16px**, where the sm field's are 12px in every other state; and the **md field has no hover edge**, where the sm one and every Text Input have `border/medium`. We draw 12px at sm, and the edge at both sizes.                 | 1; 1     |
| **Text Area** · [3888:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3888-128), **Number Input** · [3886:170](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3886-170), **FileUpload** · [4475:5361](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4475-5361) | The **whole component is ringed** (`shadow/focus/default` on the frame around label, field and helper) when focused: Text Area and Number Input ring the field too, FileUpload rings only the whole. We draw one ring, the field's.                                | focus    |
| **Number Input** · [3886:170](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3886-170)                                                                                                                                                                                                | The **md error inline field** has sm's 8px gap and 16px padding. We draw md's.                                                                                                                                                                                     | 1        |
| **PIN Input** · [7795:222](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7795-222)                                                                                                                                                                                                   | The **resting md row of cells is 48px tall** around 40px cells, where every other state hugs them; and the **resting and hovered sm first cell's placeholder is `helper/sm`**, where every other is `body/md/medium`. We hug the cells, and draw `body/md/medium`. | 1; 2     |
| **FileUpload** · [4475:5361](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4475-5361)                                                                                                                                                                                                | The **filled drop zone is 68px tall**, where every other hugs its 40px Browse to 64px. We hug it.                                                                                                                                                                  | 1        |
| **Password Input** · [2995:245](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-245)                                                                                                                                                                                              | The **"Forgot password?" link shows only in the focused md field**, in the helper's place: a link shown only while the field has the focus cannot be clicked. We show it, beside the helper, wherever it is given.                                                 | 2        |
| **Token Input** · [8817:174](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8817-174)                                                                                                                                                                                                 | **Read-only and disabled tokens keep their close buttons**, though they cannot be removed. We draw them without.                                                                                                                                                   | 2        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                              | What we do meanwhile                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **The focused field's placeholder** is drawn in `text/primary` (Text Input, Password Input), as dark as a value, where hover draws it `text/secondary`. Meant?                                                                        | We draw it as drawn.                                                      |
| **SearchField at sm is flat**: no `shadow/control` at rest, where md and every other field carry it. Meant for a list's toolbar?                                                                                                      | We draw it as drawn.                                                      |
| **Text Area's buttons** sit over the bottom of its words, which scroll under them. Should the words stop above them?                                                                                                                  | We draw it as drawn.                                                      |
| **PIN Input's hover and focus** are drawn on the first cell only. We draw them on the cell the next digit goes in, which is the first in Figma's variants. Right?                                                                     | As said.                                                                  |
| **Number Input's side stepper**, 28 × 20px per half, cannot have a 44 × 44 target without its halves covering each other. The arrow keys step it too.                                                                                 | We keep Figma's size for the side stepper.                                |
| **Token Input's disabled field** ([8817:174](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8817-174)) shows its placeholder beside its Tag, where the focused, filled and error fields show none once they hold one. Meant? | We draw it as drawn: the placeholder beside the Tags only while disabled. |

### The menus and lists: Dropdown Item, Dropdown Group Label, Dropdown Menu, Context Menu Item, Context Menu, Option Row, Options List, ListItem and List

The menus float where they are anchored, under a trigger or at the pointer, and draw in place
otherwise. The arrow keys move the focus from row to row, and a focused Dropdown Item draws the
hover, as its description says. A row spans its menu, and the rows Figma draws 240 and 200 wide
are read as samples of a menu's width. An Option Row is its control's target: hovering the row
hovers the control, as a label does.

**Fix** — these look like accidents:

| Component                                                                                          | What                                                                                                                                                                                                                                                    | Variants                           |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **Context Menu Item** · [3451:31](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3451-31) | A **destructive row is drawn at rest only**: no hover, no focus and no disabled look, so a keyboard user cannot see a destructive row focused. We draw the other rows' hover and focus fill, and their disabled ink, which wins over the danger colour. | destructive hover, focus, disabled |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                                                                                        | What we do meanwhile                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| **List's `in-card` is the other way round from its description** ([7739:28903](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-28903)): the description says `true` "drops the outer border and padding for placement inside Card", but `true` is drawn with the edge, corners and padded rows, and `false` without, its rows compact. `false` also keeps `shadow/raised` with no edge to cast it. Which is meant? | We draw each as drawn.                              |
| **A focused Dropdown Item** ([2781:994](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2781-994)) draws the hover, as the description says ("keyboard navigation … with hover styling"): no ring, where other controls ring their focus. Enough, or should it ring?                                                                                                                                                    | We draw the hover.                                  |
| **Rows under 44px tall that touch** — Dropdown Item sm is 32, Context Menu Item 36 — cannot take a 44 × 44 target without reaching into the next row. We leave a row's own box as its target, above WCAG's 24px minimum. An exception you accept?                                                                                                                                                                               | No padded target on rows.                           |
| **Options List's question** ([10291:22366](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10291-22366)): its description says to wrap it in a fieldset and legend, but Figma draws no legend. Should the question show?                                                                                                                                                                                                | A legend a screen reader reads, hidden on the page. |
| **Context Menu Item's shortcut** ([3451:31](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3451-31)) is plain text in `text/tertiary`, where its description pairs it with a Kbd. Which?                                                                                                                                                                                                                               | We draw the text, as drawn.                         |
| **ListItem's trailing element** ([4520:260](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4520-260)) is a 16px icon slot (a chevron), where its description also names "trailing metadata, counter". Should a Counter or a value fit there?                                                                                                                                                                           | We take an icon there.                              |

### The pickers: Select, Dropdown, Autocomplete, Autocomplete Open, DatePicker, Date Picker Open, Day Cell, TimePicker and TimePicker Dropdown

A picker's panel floats under its field. Select and Dropdown are built as one control in two looks,
by the owner's decision. A date or a time is typed or picked: the field reads what is typed, in
the locale's figures or on its clock, and its icon opens the panel. DatePicker's and TimePicker's
`error-focused` is drawn as error while focused, as their descriptions flag. Autocomplete Open is
built as Autocomplete's open state, not a component of its own. A day's range roles are drawn as
drawn, though the pickers choose one date for now, and the week starts on the locale's first day
(Monday, as drawn, in most of Europe).

**Fix** — these look like accidents:

| Component                                                                                           | What                                                                                                                                                                                                                                         | Variants |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Select** · [5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92)             | The **disabled and error fields are laid out `SPACE_BETWEEN`**, where every other state lays them out from the start. We lay them out from the start.                                                                                        | 2        |
| **Dropdown** · [2488:12213](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2488-12213)     | The **disabled and error fields are centred** (`CENTER/CENTER`), where every other state lays them out from the start. We lay them out from the start.                                                                                       | 2        |
| **Select** · [5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92)             | The **open panel's md rows are 34px tall**, where a Dropdown Item's md row is 44: a stale size, which makes the panel 136px where its rows need 178. We draw the rows at a Dropdown Item's height.                                           | open md  |
| **Dropdown** · [2488:12213](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2488-12213)     | **No focus state** is drawn, where a visible focus is the floor. We draw Select's focus edge and ring.                                                                                                                                       | focus    |
| **Date Picker Open** · [7280:669](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7280-669) | The **double calendar's month labels are placed by position**, in a 212 × 10px box at 32, 11, which sits them 5px below the arrows' centre; the single calendar's label is laid out in the header's row. We draw them where they are placed. | 1        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                              | What we do meanwhile                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Select and Dropdown** ([5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92), [2488:12213](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2488-12213)) are one control, a choice from a list, drawn two ways: Select's panel is its own layer, Dropdown opens a Dropdown Menu. Two components for one purpose, or one with two looks? | One control, two looks.                                                   |
| **Select's open variant hides its helper**, where its panel covers it.                                                                                                                                                                                                                                                                                                | We keep the helper; the floating panel covers it.                         |
| **Autocomplete's highlighted suggestion** ([3889:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3889-128)), the one the arrow keys reach, has no look of its own.                                                                                                                                                                                       | We draw a row's hover.                                                    |
| **Autocomplete Open** ([5408:4232](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5408-4232)) is an open Autocomplete drawn as a component of its own. Could it be a state of Autocomplete?                                                                                                                                                                  | We check it as Autocomplete's open state.                                 |
| **TimePicker Dropdown** ([5408:3807](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5408-3807)) is described as hour and minute columns ("optionally + AM/PM"), and drawn as one list of six times. Which?                                                                                                                                                   | One list of times, 30 minutes apart by default.                           |
| **A floating double calendar** is not drawn: Date Picker Open's `type=double` exists only `inline=true`. Should a DatePicker open two months?                                                                                                                                                                                                                         | A floating calendar shows one month.                                      |
| **Date Picker Open's double calendar draws a range** across its two months (a start, middle days and an end), and its second month is a copy of the first's grid. Are ranges coming to the pickers?                                                                                                                                                                   | One date is chosen; a day's range roles are drawn as Day Cell draws them. |
| **Day Cell's preview end** ([3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)) is rounded 18px, half its 36px cell, bound to nothing.                                                                                                                                                                                                        | `radius/pill`, which draws the same.                                      |

### Navigation: Tab Item, Tabs, Nav Item, Section Nav Item, Section Nav Group Header, Breadcrumb Item, Breadcrumbs and Tree Item

In a Tabs strip the arrow keys move the focus and Enter or Space selects, as the description says;
each tab draws its own underline. A Nav Item and a Section Nav Item are links where they go
somewhere, the current page announced. Past five, a breadcrumb trail collapses its middle to an
ellipsis that opens a menu of the pages it hides. A Tree Item's edit state is an inline rename, and,
as its description says, its focus.

**Fix** — these look like accidents:

| Component                                                                                         | What                                                                                                                                                                                              | Variants |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Tab Item** · [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)         | The **focused tab's underline colour is bound to `border/strong`**, a border width, not a colour (its own card flags it). We draw the selected tab's underline colour, `color/border/strong`.     | 2        |
| **Section Nav Item** · [8109:19](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8109-19) | The **resting item hugs its words**, where every other state is 220px wide, its label fixed at 180 where every other fills the item. We draw every state spanning its rail, its label filling it. | 1        |
| **Tree Item** · [2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)    | The **editing row's vertical padding is bound to `stack/none`**, where every other row's is an unbound 0. The same 0; we bind it `inset/none` as the others.                                      | 4        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                | What we do meanwhile                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **A focused tab draws the selected tab's underline** ([3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)). With the arrow keys moving the focus before Enter selects, a focused tab that is not selected looks selected. Meant?                                 | We draw it as drawn, the underline and the ring.                                         |
| **A disabled tab's Counter** ([3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)) is drawn `regular`, as a selected tab's, where a resting tab's is `idle`. Meant?                                                                                              | We draw it as drawn.                                                                     |
| **A focused Nav Item** ([2663:774](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2663-774)) and **a focused Breadcrumb Item** ([2771:588](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2771-588)) have no look: neither draws a focus state.                       | SOLAR's focus ring, `shadow/focus/default`.                                              |
| **Tree Item's focus** ([2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)) is its edit state, its description says, which also hides the label for the rename field.                                                                                        | A keyboard-focused row draws edit's edge and ring, and keeps its label.                  |
| **Tree Item's Counter** is drawn `disabled` at rest, and `default` on hover and while selected. Meant as a muted count at rest?                                                                                                                                                         | We draw it as drawn.                                                                     |
| **Tree Item's actions** are two fixed icons, More and Plus. Should they be the product's own actions?                                                                                                                                                                                   | Two actions, More and Add, each shown where the product gives it.                        |
| **Tree Item's chevron and actions** ([2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)) are 16px, 4px from the next control: a 44 × 44 target for each would cover its neighbour's (a tap on More would reach Add). Room between them, or larger controls? | Each control's own box is its target, as Number Input's side stepper keeps Figma's size. |
| **Breadcrumbs' "multiple"** ([2772:620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2772-620)) collapses its middle "to an ellipsis menu", its description says, but draws no menu.                                                                                         | A Dropdown Menu of the hidden pages.                                                     |
| **A Tabs strip** ([6165:12202](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-12202)) that is wider than its space: should it scroll? A scrolling strip clips the focused tab's ring.                                                                                     | It does not scroll, for the two to seven tabs the description allows.                    |

### Paging and steps: Pagination and its parts, Page Navigator and PageNavButton, Stepper, Step and Stepper Indicator

A Pagination shows the pages Figma draws: the first, the last, the current ± 1, and three at the end
the current is near (`1 2 3 … 12`). A Page Navigator says where the reader is and announces it as it
changes. A Stepper takes its steps' labels and the active one; completed steps go back where the
product allows it. Its 225px progress padding is presentation only, as agreed, and not drawn.

**Fix** — these look like accidents:

| Component                                                                                                                                                                                         | What                                                                                                                                                                                                                                                  | Variants |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Pagination** · [3655:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3655-2), **PageNavigator** · [4581:111](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4581-111)       | **The previous arrow is enabled on the first page** ("1 of 10"), where both descriptions disable it at the ends. We disable it.                                                                                                                       | 1 each   |
| **Stepper** · [5762:5846](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5762-5846)                                                                                                      | **The line+text stepper has no active step**: its second step is upcoming after a complete first. We draw the step after the completed ones active. Its first step is an instance of a Step variant itself (`Step/complete/horizontal`), not of Step. | 1        |
| **Stepper Indicator** · [2574:3254](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2574-3254), **Step** · [5760:5192](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-5192) | **The same status is named twice**: `completed` on the indicator, `complete` on the step. We map one to the other.                                                                                                                                    | —        |
| **PageNavButton** · [4581:110](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4581-110)                                                                                                  | **The next button's gap is an unbound 8**, where the previous one's is `stack/xs`; and the resting previous button lays out from the start, every other `SPACE_BETWEEN`. We draw them the same.                                                       | 10       |

**⚠️ Decide:**

| Question                                                                                                                                                                                                           | What we do meanwhile                                                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| **Pagination's truncation** ([3655:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3655-2)): the description says "never truncate below 7 total slots", but the drawing, `1 2 3 … 12`, has five. Which? | As drawn: the first, the last, the current ± 1, three at the near end. |
| **Pagination's 44 × 44 hit area**: its 24px items sit 4px apart, where 44 × 44 targets would cover each other, as the description asks for both.                                                                   | Each item's own 24px box, WCAG 2.2's minimum.                          |
| **A PaginationItem is 24px wide**, bound to nothing: a four-figure page outgrows it. Should it hug its number?                                                                                                     | 24px square.                                                           |
| **PageNavButton is 112px wide** ([4581:110](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4581-110)), bound to nothing: a longer word (a translation) would not fit.                                     | It hugs its words and arrow.                                           |
| **The Stepper's bar and lines** are 4px, 3px and 2px thick, bound to nothing. A line-thickness variable?                                                                                                           | Figma's values, flagged.                                               |

### Cards: Card, Container, Split Dropdown, Status Card, the Insight parts, Expandable Card, Accordion, Event Row, Option Card, File Card, Image Card, Action Card, Interactive Card, Device Card and the Launch Cards

A card is pressable where the product gives it something to do: its title is then its action, and
the whole card its target, so its own controls (a More menu, Buttons, a Checkbox) stay usable. Hover
and focus are drawn only then. Each More glyph opens a menu. `loading` draws each card's own
placeholders, whatever Figma calls it (`ghost` in Status Card and the Insight parts). An
Interactive Card shows one control, the product's choice. Option Card and the create tiles are
built as drawn; Launch Card takes its actions from the product (its `access` is gone), and Launch
Card Full Screen is built with slots.

**Fix** — these look like accidents:

| Component                                                                                                 | What                                                                                                                                                                                                                                                                                                                                                                                                      | Variants |
| --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Card** · [3059:214](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3059-214)                   | **The loading Tag is a detached frame** (no longer a Tag instance), a muted pill with no words. We draw a Tag placeholder of the Tag's size. The docs' "status border override via border/feedback/strong" is not what is drawn: the status tints the fill.                                                                                                                                               | 1        |
| **Status Card** · [3763:676](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3763-676)            | **The disabled warning card packs its title row to the start**, where every other variant spreads it, its More at the end. We spread it in all.                                                                                                                                                                                                                                                           | 1        |
| **Insight Card** · [3151:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3151-2)               | **The selected card is painted twice** (surface/background over surface/base). We draw the top paint. Its More glyph is tinted by severity, odd for an action.                                                                                                                                                                                                                                            | 5        |
| **Insight Card Small** · [9240:30553](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9240-30553) | **The severity's tile is two layers**, Icon in the resting success variant and Container in every other, the same tile. We read them as one.                                                                                                                                                                                                                                                              | 10       |
| **Insight Row** · [6905:61](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6905-61)              | **The row is fixed at 64** while its words, at their own line heights, need 76 (their boxes are drawn shorter than their lines). We let it hug its words. The loading info row's title and meta hug their words at rest and on hover, where every other row's fill it; we fill them. Its severity is a colour bar alone: we name it by its word for a screen reader; SOLAR may want an icon (WCAG 1.4.1). | 10       |
| **Expandable Card** · [3168:3](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3168-3)            | **The hovered collapsed card spreads its header**, every other packs it; both draw alike, the title filling the header.                                                                                                                                                                                                                                                                                   | 1        |
| **Accordion** · [2733:1322](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2733-1322)            | **Expanded, the item nests its own collapsed variant as its header**, so its chevron still points down. We draw that header, its chevron turned up. The description's sizes, chevron placement and flush mode are not drawn.                                                                                                                                                                              | 3        |
| **Event Row** · [7358:6](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7358-6)                  | **The focused row fills its meta line white** (an unbound #ffffff) and draws no focus ring, where the description asks for shadow/focus/default. We draw the ring, not the fill.                                                                                                                                                                                                                          | 1        |
| **File Card** · [8273:15264](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8273-15264)          | **The create tile's edge is an unbound 1**, where the file tile's is border/default. The description's "dashed" edge, and its hover, selected, focus, loading and error states, are not drawn.                                                                                                                                                                                                            | 1        |
| **Image Card** · [10401:26](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10401-26)             | **The More mark is a vector** (3 × 14), not Icon/More; **its default variant is selected**. We start a tile unselected. The unfilled tile's Plus is 22px, off the icon ladder.                                                                                                                                                                                                                            | 4        |
| **Interactive Card** · [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504)     | **The headline icon is bound to a primitive** (color/neutral/900, CLR-002). We draw color/icon/primary. All three controls are on by default; dragging looks exactly as focus does (the focus ring and edge).                                                                                                                                                                                             | 3        |
| **Device Card** · [10402:922](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10402-922)          | **The batch variant's hidden layers share names with shown ones** (its Dropdown's hidden label and the Tag's words are both "Label"), which Figma's data cannot tell apart. We read the Tag's words and the field's as shown, as drawn.                                                                                                                                                                   | 1        |
| **Launch Card** · [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814)          | **Hover draws nothing** ("reserved"); the favourite sits on a primitive alpha fill (color/alpha/white-60); its two favourite booleans are one control in two places. We take one favourite. The Button Group is fixed at 310 in a 308 column.                                                                                                                                                             | 4        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                    | What we do meanwhile                                           |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| **Option Card** (**Option Card** · [9385:28717](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9385-28717)): its description is a radio or checkbox card, its drawing a "New design" create tile. Which is it?                                     | As drawn: a create tile (owner decision).                      |
| **Card's hover**: its description says hover is an alpha overlay (`::before`), Figma draws a border change. Which?                                                                                                                                          | As drawn, and only on a pressable card.                        |
| **Container outlined** (**Container** · [3447:22](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3447-22)): its description (Open Decision #1) folds it into Card as elevation none, and says it has no shadow; Figma draws shadow/overlay.        | Both types as drawn.                                           |
| **Split Dropdown** (**Split Dropdown** · [10401:30493](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10401-30493)): nothing in it opens; a name such as Split Panel? Its description pads the top with inset/md and inset/sm, Figma pads nothing. | Named as Figma names it; padded as drawn.                      |
| **Sizes bound to nothing**: tiles (Option Card 228, File Card 222, Image Card 190), severity tiles (52, 40), media (160, 520 × 420), accent bars (4px), skeleton lines. Size variables?                                                                     | Figma's numbers, flagged; every card fills its width.          |
| **A focus ring for every card**: none is drawn in Figma.                                                                                                                                                                                                    | SOLAR's focus ring, shadow/focus/default, on a pressable card. |
| **Insight Card and Insight Card Small** draw info's tile neutral and its More info, and Status Card says neutral where they say info. One vocabulary?                                                                                                       | As drawn.                                                      |

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

1. **A target-size variable** — the descriptions now say the 44 × 44 hit area is padded in code,
   with no variable for it; we pad with one raw 44 per platform, which a variable would replace.
   A control-height variable would settle Button's fixed heights with it. Sections 3 and 6.
2. **Spinner sizes** — variables of their own, or the icon ladder? Section 6.
3. **The xs dots** — StatusIndicator's and Trend Badge's, 8px, below the icon ladder: a variable
   for them? Section 6.
4. **Sizes with no variable** — Counter's badge, Avatar, ProgressBar, the table and tree rows, a
   labelled Divider, the selection controls (Checkbox's box, Radio's ring, Toggle's track and
   thumb, a slider's track and handle, DragHandle's dots, a segment's height), Tag's and
   Banner's heights, the fields' (Text Input's 40 and 32, Text Area's 120 and 100, PIN
   Input's cells, Number Input's side stepper), Context Menu Item's 36, a date picker's 36px day
   cells and 32px month headers, the tabs' 40 and 32, the navigation rows' 40 (Nav Item) and 32
   (Section Nav Item, Tree Item), and a menu's ~300px maximum height, which Dropdown Menu's
   description asks for (we cap at one raw 300): one family of size variables? Section 6.
5. **A logo size scale** (`logo.*`)? Section 9.

**Colour**

6. **Danger hover labels** at 4.07 and 4.13 : 1 — a darker hover red, or an accepted exception for
   the hover state? Section 8.
7. **Avatar's initials** — an avatar takes any colour its user picks. Should the initials' colour be
   picked with it, or follow from it? Figma pairs each fill with a darker or lighter shade of the
   same hue, below 4.5:1 on 8 of the 9 Medium samples; meanwhile we keep the hue and move it just
   far enough to reach 4.5:1. Section 6.
8. **Opacity** — Node End's halo at 20%, SplitButton's rule at 30%, a disabled Link at 50% and
   a disabled Section Nav Item at 40%, with
   no opacity scale or alpha variable for them. Section 6.
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
16. **StatusIndicator's marks** — `shadow/raised` is a box shadow, where a mark needs a drop
    shadow: a drop-shadow variable, or none? Section 6.
17. **Skeleton's pulse** — a motion variable for it? Section 6.
18. **Focus where none is drawn** — FAB's and Link's focus variants have no ring, and Toggle,
    Slider Range and Segmented Control Item have no focus state, where a visible focus is the
    floor. Draw `shadow/focus/default`? Section 6. And the fields' focus: Text Area, Number Input
    and FileUpload ring the whole component, label and helper with it; the field alone? Section 6.
    And a menu's rows: a focused Dropdown Item draws the hover, a destructive Context Menu Item
    nothing. And Dropdown, Nav Item and Breadcrumb Item, which draw no focus at all, and Tree Item,
    whose focus is its edit state. Section 6.
19. **SplitButton's focus ring** — around the focused half, as described, or the whole control,
    as drawn? Section 6.
20. **Links underlined at rest** — meant, where the description says hover? Section 6.
21. **Slider's `filled` and `error`** — drawn as its default: what should they look like?
    Section 6.
22. **The sliders' handles** — Slider Range's react to hover and press, Slider's does not. Which?
    Section 6.
23. **Toast's Tag** — a look of Tag's own (a tag on a raised surface), or a standard Tag?
    Section 6.
24. **Tag's inverted close button** — larger than every other, with less padding: intended?
    Section 6.
25. **Select and Dropdown** — one control drawn two ways: two components, or one with two looks?
    And TimePicker Dropdown: the columns its description names, or the list it draws? Section 6.
26. **Ranges** — Date Picker Open's double calendar draws a range, and Day Cell a range's roles:
    are range pickers coming, and should a floating calendar show two months? Section 6.

**Structure**

27. **Action states** — `active` in the variables, `pressed` on the guideline pages. Which name
    should both use? Section 7.
28. **The Layout collection** (grid columns, margins, gutters, breakpoints) lives locally in SOLAR
    Web rather than in Foundations. Should it move down a layer?
29. **A flat Teams mark**, if Microsoft publishes one? Section 9.

---

_Read from SOLAR Foundations `[v1--2026]` version `2402389239778582681`, SOLAR Web `[v1--2026]`
version `2402761872194862831` and SOLAR Icons `[v2--2026]` version `2402400024423705866`, on
2026-09-24. Counts are computed from the files, not estimated. We are happy to walk through any of
this live — and happy to be wrong on the judgement calls, where we may be missing context._
