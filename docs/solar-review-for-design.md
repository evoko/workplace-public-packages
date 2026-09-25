# SOLAR — what to fix and decide in Figma

**For:** the SOLAR design team
**From:** the Biamp Workplace web team
**Date:** 2026-09-25

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

**Scope.** The component sets we build from in SOLAR Web: the Components and Patterns sections. It
leaves out the view pages, which are not in use yet, and the documentation utility frame, so nothing
found only there (a missing description, a stray binding) is listed. SOLAR Foundations and SOLAR
Icons need nothing at the moment.

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
- **`inset.*` and `stack.*`.** Two spacing scales with the same numbers. `inset` is padding inside a
  container and the gap of a horizontal auto layout; `stack` is the gap between siblings stacked
  vertically.
- **Axes and variants.** A component set's properties (`size`, `prio`, `state`, …) are its axes;
  each combination is a variant. SOLAR's model is that **geometry follows `size` and colour follows
  `prio`, `state` and `danger`**; section 2 lists where a component departs from it.

## Start here

If you take only a few items, take these:

1. **Bind the control heights** to the new `size/control/*` variables. Button's description names
   them, but no component binds them yet; we already do, in code, on 18 components.
   [Section 1](#1-control-heights-to-bind--18-components).
2. **A shown Segmented Control label draws only its star** — the new `show label` property shows
   its frame, but the words inside stay hidden.
   [Section 2](#the-selection-controls-checkbox-radio-toggle-slider-slider-range-draghandle-and-segmented-control).
3. **Sizes with no variable** — the sizes on no control step. Decision 1.

## At a glance

| #                                                  | What                                        | Count                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | File      |
| -------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| [1](#1-control-heights-to-bind--18-components)     | Control heights to bind to `size/control/*` | 18                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | SOLAR Web |
| [2](#2-the-components-we-build-variant-by-variant) | The components we build, in detail          | Button 2 fixes and 2 questions, Spinner 2, Icon Button 2, Button Group 1, StatusIndicator 1, the display primitives 1 fix and 1 question, the selection controls 2 fixes, the tags and messages 2 fixes and 1 question, the text fields 1 fix and 5 questions, the menus and lists 2 questions, the pickers 1 fix and 5 questions, navigation 1 fix and 6 questions, paging and steps 2 fixes and 2 questions, the cards 12 fixes and 7 questions, the tables and properties 4 fixes and 7 questions, the overlays and dialogs 5 fixes and 5 questions, the calendar parts 8 fixes and 4 questions, the charts 3 fixes and 2 questions | SOLAR Web |

---

## 1. Control heights to bind — 18 components

SOLAR has `size/control/sm`, `md` and `lg` (32, 40 and 48), and Button's description says its
"heights are size/control/{sm,md,lg}", but no component binds its height to them yet: every height
below is typed in. We bind each to its step in code, on both platforms, so binding them in Figma
changes nothing visually. **Fix:**

| Components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Heights            | Bind to                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ | ----------------------------- |
| **Button** · [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544), **Icon Button** · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)                                                                                                                                                                                                                                                                                                            | 32 / 40 / 48       | `size/control/sm`, `md`, `lg` |
| **SplitButton** · [4569:200](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4569-200) (and its sm chevron half), **BackButton** · [4549:130](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4549-130)                                                                                                                                                                                                                                                                                | 32 / 40            | `size/control/sm`, `md`       |
| **Text Input** · [2087:2737](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2737), **Password Input** · [2995:245](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-245), **SearchField** · [3773:278](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3773-278), **GlobalSearch** · [3781:1596](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3781-1596), **Number Input** · [3886:170](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3886-170) | 32 / 40, the field | `size/control/sm`, `md`       |
| **Inline Input** · [9647:28979](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9647-28979)                                                                                                                                                                                                                                                                                                                                                                                                    | 40                 | `size/control/md`             |
| **Select** · [5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92), **Dropdown** · [2488:12213](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2488-12213), **Autocomplete** · [3889:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3889-128), **DatePicker** · [7266:25837](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7266-25837), **TimePicker** · [4414:79](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4414-79)              | 32 / 40, the field | `size/control/sm`, `md`       |
| **Tab Item** · [3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)                                                                                                                                                                                                                                                                                                                                                                                                              | 32 / 40            | `size/control/sm`, `md`       |
| **Nav Item** · [2663:774](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2663-774), **Section Nav Item** · [8109:19](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8109-19)                                                                                                                                                                                                                                                                                                         | 40; 32             | `size/control/md`; `sm`       |

The heights on no step stay in the sizes with no variable (decision 1): FAB's 44 and 56, Banner's
44, Context Menu Item's and PageNavButton's 36, Segmented Control Item's 24 at sm (and its 32 at md
with it), and Text Area's 100 and 120.

## 2. The components we build, variant by variant

We have read every variant of each component we build against the others. SOLAR's model — geometry follows `size`, colour follows `prio`, `state` and `danger` —
holds almost everywhere; these are the places where it does not, or where a component disagrees
with a sibling. Where an item is open, we build it exactly as drawn.

### Button · [2087:2544](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2087-2544)

**Fix** — tidying:

| What                                                                                                            | Variants |
| --------------------------------------------------------------------------------------------------------------- | -------- |
| The two icon slots bind their height to `icon/sm`, but their width is 16 and unbound. Bind it to `icon/sm` too. | all      |
| The heights are typed in: bind them to `size/control/*` (section 1).                                            | all      |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                         | What we do meanwhile                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Tertiary hover's underline**, which the description names, is not drawn on a danger tertiary button's hover, and lg's _secondary_ hover draws it too (`link/md/default`, where the description says secondary hover changes only the border and label). Which? | We reproduce each variant as drawn. |
| **lg tertiary alone has a fill**: `action/tertiary/bg/*` (white in Light) at rest, pressed, focus and loading, where sm and md tertiary have none. Meant for the wide menu-style button?                                                                         | We draw it as drawn.                |

### Spinner · [4626:102](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4626-102)

- **Fix:** the frame binds `icon/sm`, `icon/lg` and `icon/2xl`, but the ring and its track
  inside it are 16, 24 and 32 typed in. Letting them fill the frame would let the variable
  size them too.
- **Fix:** please rename the **`style` property** (default, inverse), on Alert and Alert Small too.
  In React, the web framework we build on, `style` is reserved for a component's inline CSS, so no
  component can take a property of that name; in code it is called `variant`, the one place our
  names differ from yours. Renaming it `variant` in Figma makes the two match again.

### Icon Button · [2995:443](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-443)

**Fix** — tidying:

| What                                                                                                                                                                                               | Variants                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| The icon binds its width to `icon/xs`, `icon/sm` and `icon/md`, but its height is 12 / 16 / 20 and unbound. Bind it to the same.                                                                   | all                                                            |
| A consistency nit: at sm the secondary background is left empty, where md and lg bind `action/secondary/bg/*` (transparent). Both draw the same; binding it at sm too keeps the three sizes alike. | `sm / secondary` at rest, pressed, focus, loading and disabled |

The heights go with Button's (section 1), and the hit area is padded, as for every control.

### Button Group · [2618:3237](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2618-3237)

Three combinations are drawn — horizontal regular, vertical regular and horizontal full-width — and,
as the description says, there is no vertical full-width. We build those three and no other.

**Fix** — tidying:

| What                                                                                                                                                       | Variants                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| The hidden buttons keep a fixed width from before they were hidden (the tertiary 138px, the vertical group's third 431px), while every shown button fills. | `horizontal / regular`, `vertical / regular` |

### StatusIndicator · [3738:305](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3738-305)

Each type is its own drawing, from other layers (success is the disc itself, warning a triangle,
danger a circle, the rest a disc frame), and `xs` is the dot alone. We build each as drawn, placing
each mark where Figma puts it.

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                            | What we do meanwhile            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| **A shadow on the marks?** The tick, the exclamation, the cross, info's `i` and neutral's dash carry `shadow/raised`; help's question mark and private's lock do not. A shadow variable is a box shadow, which a mark's outline cannot take. Should the marks have a shadow (then a drop-shadow variable), or none? | We draw no shadow on the marks. |

### The display primitives

Counter, Kbd, Timestamp, Avatar, Trend Badge, Divider, Skeleton, ProgressBar, Node End, RowExpand,
and Tree Indent, the small parts the rest of the library is built from. We build each as
drawn. Kbd and Timestamp have nothing to raise. Divider, Skeleton and ProgressBar are drawn at
sample sizes (Divider 320px wide, ProgressBar 200px, Skeleton the size of its content), which in
code fill the space or take the content they are given; nothing needs to change.

**Fix** — this looks like an accident:

| Component                                                                                       | What                                                                                                                                                           | Variants    |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| **Avatar** · [11066:29966](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=11066-29966) | The **new lg logo avatar is rounded 11**, bound to nothing, where the md and sm logos use `radius/container` (8). We draw it at `radius/container`, as theirs. | `logo / lg` |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                       | What we do meanwhile         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **Sizes with no variable.** Counter's badge is 20px tall, Avatar 44, 32, 24 and 16, ProgressBar 6, a table row (RowExpand) 40, a tree row (Tree Indent) 32 and a labelled Divider 20, all bound to nothing. One family of size variables, as `size/control/*` is for controls? | We carry them as raw values. |

### The selection controls: Checkbox, Radio, Toggle, Slider, Slider Range, DragHandle and Segmented Control

DragHandle has nothing to raise beyond its dots' sizes. Checkbox, Radio and Toggle are drawn at 16,
18 and 32 × 18px with no size variable (decision 1); their hit areas are padded to 44 × 44, as
every control's is.

**Fix** — these look like accidents:

| Component                                                                                                | What                                                                                                                                                                                                              | Variants |
| -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Segmented Control** · [6170:20250](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6170-20250) | The new **`show label`** property shows the label's frame, but its words (the Label text inside it) stay hidden in both variants, so a shown label draws only its star. We draw the words where a label is given. | both     |
| **Slider Range** · [5475:74](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5475-74)            | The new **focus rings both handles at once**, where only one can have the focus (the description: "focus rings the handle"). We ring the whole slider for now.                                                    | `focus`  |

### Tags and messages: Tag, Alert, Alert Small, Banner, Toast and EmptyState

EmptyState has nothing to raise. Tag's close button and Banner's close icon and text action are
drawn without a target area (Banner's description asks for 44 × 44); we give each a 44 × 44
target, reaching as far as the tag or banner around it lets it. Tag's 24px, Banner's 44px and the
callouts' sizes join the sizes with no variable (decision 1).

**Fix** — these look like accidents:

| Component                                                                                                                                                                                    | What                                                                                                                                                                                                                                           | Variants      |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Toast** · [2578:450](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2578-450)                                                                                                     | Its description says each toast carries **a standard status Tag**, but the Tag's fill is overridden to `surface/overlay` (a status Tag is `surface/feedback/*/subtle`), and neutral's edge to `border/subtle`. We draw Figma's look meanwhile. | every variant |
| **Alert** · [2762:706](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2762-706), **Alert Small** · [9080:29141](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9080-29141) | Please rename the **`style` property** (filled, outlined): React reserves `style` for inline CSS, so in code it is `variant`, as on Spinner. Renaming it `variant` in Figma makes the names match.                                             | the property  |

**⚠️ Decide:**

| Question                                                                                                                                                    | What we do meanwhile |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **Tag's inverted close button** is 16px with `inset/2xs` beside it, where every other close button is 12px with `inset/xs`, in all five statuses. Intended? | We draw it as drawn. |

---

### The text fields: Text Input, Text Area, SearchField, GlobalSearch, Password Input, Number Input, Inline Input, Token Input, PIN Input and FileUpload

Text Input's `pressed` is its focus, as its description says (we name it focus). Every field's
height but Text Area's goes with section 1, and each has a 44 × 44 target around its field. GlobalSearch is built as the trigger its description names, and Inline Input,
Token Input and PIN Input hold their own values, by the owner's decisions.

**Fix** — this looks like an accident:

| Component                                                                                         | What                                                                                                                                                                                                               | Variants |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **Password Input** · [2995:245](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2995-245) | The **"Forgot password?" link shows only in the focused md field**, in the helper's place: a link shown only while the field has the focus cannot be clicked. We show it, beside the helper, wherever it is given. | 2        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                              | What we do meanwhile                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **The focused field's placeholder** is drawn in `text/primary` (Text Input, Password Input), as dark as a value, where hover draws it `text/secondary`. Meant?                                                                        | We draw it as drawn.                                                      |
| **SearchField at sm is flat**: no `shadow/control` at rest, where md and every other field carry it. Meant for a list's toolbar?                                                                                                      | We draw it as drawn.                                                      |
| **Text Area's buttons** sit over the bottom of its words, which scroll under them. Should the words stop above them?                                                                                                                  | We draw it as drawn.                                                      |
| **PIN Input's hover and focus** are drawn on the first cell only. We draw them on the cell the next digit goes in, which is the first in Figma's variants. Right?                                                                     | As said.                                                                  |
| **Token Input's disabled field** ([8817:174](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8817-174)) shows its placeholder beside its Tag, where the focused, filled and error fields show none once they hold one. Meant? | We draw it as drawn: the placeholder beside the Tags only while disabled. |

### The menus and lists: Dropdown Item, Dropdown Group Label, Dropdown Menu, Context Menu Item, Context Menu, Option Row, Options List, ListItem and List

The menus float where they are anchored, under a trigger or at the pointer, and draw in place
otherwise. The arrow keys move the focus from row to row, and a focused Dropdown Item draws the
hover, as its description says. A row spans its menu, and the rows Figma draws 240 and 200 wide
are read as samples of a menu's width. An Option Row is its control's target: hovering the row
hovers the control, as a label does.

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | What we do meanwhile                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| **A Dropdown Item's height** ([2781:994](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2781-994)): its description says rows that hide the icon, checkbox and description are 34px at md, as Select's open panel draws them ([5422:92](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5422-92)), but the row hugs its content, and its label's line is 20px (`body/md/medium`): 12 + 20 + 12 is 44. The 34 comes from the label's box, drawn 10px tall, shorter than its line. Which is meant? | A row of its own content's height, 44 at md. |
| **List's `in-card=false`** ([7739:28903](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-28903)), the list inside a Card, keeps `shadow/raised` with no edge to cast it, on a surface the Card already provides. Meant?                                                                                                                                                                                                                                                                              | We draw each as drawn.                       |

### The pickers: Select, Dropdown, Autocomplete, Autocomplete Open, DatePicker, Date Picker Open, Day Cell, TimePicker and TimePicker Dropdown

A picker's panel floats under its field. Select and Dropdown are built as one control in two looks,
by the owner's decision, as their descriptions say. A date or a time is typed or picked: the
field reads what is typed, in the locale's figures or on its clock, and its icon opens the panel.
DatePicker's and TimePicker's `error-focused` is drawn as error while focused, as their descriptions
flag. Autocomplete Open is built as Autocomplete's open state, not a component of its own. A day's
range roles are drawn as drawn, though the pickers choose one date for now, and the week starts on
the locale's first day (Monday, as drawn, in most of Europe).

**Fix** — this looks like an accident:

| Component                                                                                           | What                                                                                                                                                                                                                                         | Variants |
| --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Date Picker Open** · [7280:669](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7280-669) | The **double calendar's month labels are placed by position**, in a 212 × 10px box at 32, 11, which sits them 5px below the arrows' centre; the single calendar's label is laid out in the header's row. We draw them where they are placed. | 1        |

**⚠️ Decide:**

| Question                                                                                                                                                                                             | What we do meanwhile                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Autocomplete's highlighted suggestion** ([3889:128](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3889-128)), the one the arrow keys reach, has no look of its own.                      | We draw a row's hover.                                                    |
| **Autocomplete Open** ([5408:4232](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5408-4232)) is an open Autocomplete drawn as a component of its own. Could it be a state of Autocomplete? | We check it as Autocomplete's open state.                                 |
| **A floating double calendar** is not drawn: Date Picker Open's `type=double` exists only `inline=true`. Should a DatePicker open two months?                                                        | A floating calendar shows one month.                                      |
| **Date Picker Open's double calendar draws a range** across its two months (a start, middle days and an end), and its second month is a copy of the first's grid. Are ranges coming to the pickers?  | One date is chosen; a day's range roles are drawn as Day Cell draws them. |
| **Day Cell's preview end** ([3454:18](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3454-18)) is rounded 18px, half its 36px cell, bound to nothing.                                       | `radius/pill`, which draws the same.                                      |

### Navigation: Tab Item, Tabs, Nav Item, Section Nav Item, Section Nav Group Header, Breadcrumb Item, Breadcrumbs and Tree Item

In a Tabs strip the arrow keys move the focus and Enter or Space selects, as the description says;
each tab draws its own underline. A Nav Item and a Section Nav Item are links where they go
somewhere, the current page announced. Past five, a breadcrumb trail collapses its middle to an
ellipsis that opens a menu of the pages it hides. A Tree Item's edit state is an inline rename, and,
as its description says, its focus.

**Fix** — tidying:

| Component                                                                                         | What                                                                                                                                               | Variants |
| ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Section Nav Item** · [8109:19](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8109-19) | At rest, **its label is fixed at 180**, where every other state's fills the item. The same width today; a narrower rail would clip it. We fill it. | 1        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                | What we do meanwhile                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| **A focused tab draws the selected tab's underline** ([3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)). With the arrow keys moving the focus before Enter selects, a focused tab that is not selected looks selected. Meant? | We draw it as drawn, the underline and the ring.                        |
| **A disabled tab's Counter** ([3414:71](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3414-71)) is drawn `regular`, as a selected tab's, where a resting tab's is `idle`. Meant?                                                              | We draw it as drawn.                                                    |
| **Tree Item's focus** ([2422:9953](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2422-9953)) is its edit state, its description says, which also hides the label for the rename field.                                                        | A keyboard-focused row draws edit's edge and ring, and keeps its label. |
| **Tree Item's Counter** is drawn `disabled` at rest, and `default` on hover and while selected. Meant as a muted count at rest?                                                                                                                         | We draw it as drawn.                                                    |
| **Tree Item's actions** are two fixed icons, More and Plus. Should they be the product's own actions?                                                                                                                                                   | Two actions, More and Add, each shown where the product gives it.       |
| **A Tabs strip** ([6165:12202](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-12202)) that is wider than its space: should it scroll? A scrolling strip clips the focused tab's ring.                                                     | It does not scroll, for the two to seven tabs the description allows.   |

### Paging and steps: Pagination and its parts, Page Navigator and PageNavButton, Stepper, Step and Stepper Indicator

A Pagination shows the pages its description names: the first, the last, the current ± 1, and
three at the end the current is near (`1 2 3 … 12`), in 24px squares. A Page Navigator says where
the reader is and announces it as it changes. A Stepper takes its steps' labels and the active one;
completed steps go back where the product allows it. Its 225px progress padding is presentation
only, as agreed, and not drawn.

**Fix** — tidying:

| Component                                                                                                                                                                                         | What                                                                                                                                                                                 | Variants |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| **Stepper Indicator** · [2574:3254](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2574-3254), **Step** · [5760:5192](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5760-5192) | **The same status is named twice**: `completed` on the indicator, `complete` on the step. Stepper's description notes it; one name would let the two match. We map one to the other. | —        |
| **PageNavButton** · [4581:110](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4581-110)                                                                                                  | **The previous button's gap binds `stack/xs`**, the next one's `inset/xs`: the same 8, but a horizontal gap is an `inset`. We draw them the same.                                    | 5        |

**⚠️ Decide:**

| Question                                                                                                                                                                       | What we do meanwhile         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| **PageNavButton is 112px wide** ([4581:110](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4581-110)), bound to nothing: a longer word (a translation) would not fit. | It hugs its words and arrow. |
| **The Stepper's bar and lines** are 4px, 3px and 2px thick, bound to nothing. A line-thickness variable?                                                                       | Figma's values, flagged.     |

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
| **Card** · [3059:214](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3059-214)                   | **The loading Tag is a detached frame** (not a Tag instance), a muted pill with no words. We draw a Tag placeholder of the Tag's size. The docs' "status border override via border/feedback/strong" is not what is drawn: the status tints the fill.                                                                                                                                                     | 1        |
| **Status Card** · [3763:676](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3763-676)            | **The disabled warning card packs its title row to the start**, where every other variant spreads it, its More at the end. We spread it in all.                                                                                                                                                                                                                                                           | 1        |
| **Insight Card** · [3151:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3151-2)               | **The selected card is painted twice** (surface/background over surface/base). We draw the top paint. Its More glyph is tinted by severity, odd for an action.                                                                                                                                                                                                                                            | 5        |
| **Insight Card Small** · [9240:30553](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=9240-30553) | **The severity's tile is two layers**, Icon in the resting success variant and Container in every other, the same tile. We read them as one.                                                                                                                                                                                                                                                              | 10       |
| **Insight Row** · [6905:61](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6905-61)              | **The row is fixed at 64** while its words, at their own line heights, need 76 (their boxes are drawn shorter than their lines). We let it hug its words. The loading info row's title and meta hug their words at rest and on hover, where every other row's fill it; we fill them. Its severity is a colour bar alone: we name it by its word for a screen reader; SOLAR may want an icon (WCAG 1.4.1). | 10       |
| **Expandable Card** · [3168:3](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3168-3)            | **The hovered collapsed card spreads its header**, every other packs it; both draw alike, the title filling the header.                                                                                                                                                                                                                                                                                   | 1        |
| **Accordion** · [2733:1322](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=2733-1322)            | **Expanded, the item nests its own collapsed variant as its header**, so its chevron still points down. We draw that header, its chevron turned up. The description's sizes, chevron placement and flush mode are not drawn.                                                                                                                                                                              | 3        |
| **Event Row** · [7358:6](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7358-6)                  | **The focused row fills its meta line white** (an unbound #ffffff) and draws no focus ring, where the description asks for shadow/focus/default. We draw the ring, not the fill.                                                                                                                                                                                                                          | 1        |
| **File Card** · [8273:15264](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=8273-15264)          | **The create tile's edge is an unbound 1**, where the file tile's is border/default. The description's "dashed" edge, and its hover, selected, focus, loading and error states, are not drawn.                                                                                                                                                                                                            | 1        |
| **Image Card** · [10401:26](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10401-26)             | **The More mark is a vector** (3 × 14), not Icon/More; **its default variant is selected**. We start a tile unselected. The unfilled tile's Plus is 22px, off the icon ladder.                                                                                                                                                                                                                            | 4        |
| **Interactive Card** · [10400:504](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10400-504)     | **All three controls are on by default**; dragging looks exactly as focus does (the focus ring and edge).                                                                                                                                                                                                                                                                                                 | 3        |
| **Launch Card** · [10403:814](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10403-814)          | **Hover draws nothing** ("reserved"); its two favourite booleans are one control in two places. We take one favourite. The Button Group is fixed at 310 in a 308 column.                                                                                                                                                                                                                                  | 4        |

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

### Tables and properties: Column Item, RowSelect, Row, Table, TableHeader, TableFooter, PropertyRow and PropertyList

A Table is built as its header row and the caller's rows; it tells each row whether it draws its
select and expand cells, and each part is a table, row or cell to a screen reader. A cell's type
follows from what it holds, words, an Avatar, a Tag, a field or a control (owner decision), and the
breakpoint is the app's to give. A top row's expand cell is the button that shows its group. A
PropertyList is a description list, each row a term and its value, as its description says.

**Fix** — these look like accidents:

| Component                                                                                    | What                                                                                                                                                                                                                                           | Variants |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Table** · [6165:13091](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-13091) | **The mobile fade is 38 wide** in the table with neither select nor expand cells, and 32 in the other two. We draw 32 in all.                                                                                                                  | 1        |
| **Table** · [6165:13091](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-13091) | **The fade starts at `color/alpha/transparent`**, a primitive: in Dark it fades from transparent white into the dark surface. `surface/base` at 0% is the same fade in every mode; we draw that.                                               | 3        |
| **Table**, **TableHeader**, **TableFooter**                                                  | **The side paddings bind `stack/none`**, where a padding is an `inset`: `inset/none`, the same 0.                                                                                                                                              | all      |
| **Row** · [4458:3569](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4458-3569)     | **A top row draws its chevron collapsed** even where its group shows beneath it (Table's default variant: a top row, then middle rows). There is no expanded top row: we turn the chevron down (RowExpand's `expanded`) where the group shows. | 5        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                     | What we do meanwhile                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **A row's height**: Row draws a data row 44 tall, and Table resizes its rows to 40. Which is meant?                                                                                                                                                                                                                          | Row's own, 44.                                                               |
| **Row's hover**: its description says "Hover renders at runtime as a surface/hover overlay", and no variant draws it.                                                                                                                                                                                                        | `surface/hover`, only on a row given something to do (owner decision).       |
| **A sortable header** (Column Item's description: "the sortable column header") draws no sort arrow or sorted state.                                                                                                                                                                                                         | A header that sorts says so to a screen reader; no arrow is drawn.           |
| **Numeric columns**: Column Item's description says numeric text right-aligns; no variant draws one.                                                                                                                                                                                                                         | A numeric column's words sit at the end.                                     |
| **The mobile Table** ([6165:13091](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6165-13091)): its description says mobile "collapses rows to a card-style list"; Figma draws the same rows, narrower, with a fade at the right edge. Which? And what does the fade mean, where no column is wider than the table? | Figma's fitted rows and its fade, no sideways scroll.                        |
| **TableHeader's title and count**: its description names them, and mobile "stacks the actions under the title"; neither is drawn, and mobile draws no search. Meant?                                                                                                                                                         | As drawn: search, views and actions on desktop, views and actions on mobile. |
| **PropertyList's `in-card`** ([7739:29013](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7739-29013)): its description says true "removes the outer chrome for placement inside Card"; Figma draws the chrome on true and none on false, as List does.                                                             | As drawn, as List's.                                                         |

### Overlays and dialogs: Dialog, ConfirmationDialog, Split Dialog, Drawer, Scrim, Tooltip, Popover and Coachmark

A Dialog, ConfirmationDialog, Split Dialog and Drawer are modal: over the Scrim, the focus held in
them, Escape closing them. A Dialog's type follows from what it holds, a picture, a Stepper or
neither (owner decision). A Tooltip, Popover and Coachmark are drawn beside what they point at,
with their arrow, tip or connector, in Flutter as on the web (owner decision for the Tooltip).

**Fix** — these look like accidents:

| Component                                                                                          | What                                                                                                                                                                      | Variants |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Dialog** · [5888:18256](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18256)      | **The wizard's close button is resized to 36**; the default's is the Icon Button's own 40. We draw the Icon Button's own.                                                 | 1        |
| **Dialog** · [5888:18256](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=5888-18256)      | **The image dialog's content padding binds `stack/lg`**, where a padding is an `inset`: `inset/lg`, the same 20, as the other types bind.                                 | 1        |
| **Split Dialog** · [6774:9620](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6774-9620)  | **With `cta=regular`, the left pane draws a 1px edge on its left**, against the dialog's own edge: the right pane's divider, copied. We draw it as Figma does.            | 1        |
| **Tooltip** · [3377:34](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=3377-34)           | **The md left arrow sits 1px into the bubble** (2 past its edge, where sm's is 3). We draw each as Figma does.                                                            | 1        |
| **Coachmark** · [10813:32930](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=10813-32930) | **The left connector is 7 tall, the right 6**: it is the right one turned half round, and its dot and node end sit half a pixel off the line. We draw each as Figma does. | 1        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                                    | What we do meanwhile                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Popover's shadow** ([4572:120](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=4572-120)): Figma binds `shadow/dialog` on its frame, which has no fill, so Figma draws only the soft shadow the bubble and tip cast together, not the style's 2px ring; the description says `shadow/overlay`. Which? A shadow that follows the tip needs a drop-shadow variable. | `shadow/overlay` on the bubble; the tip casts none.                        |
| **Tooltip's arrow shadow**: the arrow carries `shadow/raised`, which the bubble does not. Meant? As StatusIndicator's marks, it needs a drop-shadow variable (decision 3).                                                                                                                                                                                                  | No shadow on the arrow.                                                    |
| **Tooltip's delay**: the description says "~500ms"; the nearest duration is `motion/duration/slow`, 600ms. A duration of its own, or 600?                                                                                                                                                                                                                                   | `motion/duration/slow`.                                                    |
| **Split Dialog on a narrow viewport**: its description says the panes stack; no variant draws it.                                                                                                                                                                                                                                                                           | Side by side at any width.                                                 |
| **Coachmark's close** is a bare 20px icon, where a Dialog's is an Icon Button, and its title is centred over the header, where a long title would run under the icon. Meant?                                                                                                                                                                                                | A button around the icon, its target 44 × 44; the title centred, as drawn. |

### Calendar parts: Event Chip, Day Cell, Weekday Header, Time Axis Label, Time Slot, All-Day Bar, Agenda Row and Calendar Toolbar

The calendar parts are styled parts: each is drawn as Figma draws it, and the dates, events and
what a click does are the app's. A Day Cell holds the app's Event Chips, cut off at its edge where
there are more than fit; a chip, a bar and a row fill the width they are given.

**Fix** — these look like accidents:

| Component                                                                                                                                                                                   | What                                                                                                                                                                                                                                                                                                                  | Variants |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Day Cell** · [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)                                                                                                   | **Today's date is detached from its text style**: 12/16 semibold, where every other day's is `body/sm/medium`. We draw `body/sm/semibold`, the same values.                                                                                                                                                           | 1        |
| **Day Cell** · [6638:82](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6638-82)                                                                                                   | **Three chips do not fit the 120 cell**: its padding, date row, gaps and three 22 chips need 122. We cut the third short at the cell's edge.                                                                                                                                                                          | 5        |
| **Time Axis Label** · [6643:14](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6643-14)                                                                                            | **The hour is detached from any text style**: 10/14 medium (semibold for now), its size and line height bound to `caption/xs`, whose style is regular. We draw `body/xs/medium` and `body/xs/semibold`, the same values.                                                                                              | 4        |
| **All-Day Bar** · [6644:50](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6644-50)                                                                                                | **A solid bar's title is detached from its text style**: 12/16 semibold. We draw `body/sm/semibold`, as a solid Event Chip's.                                                                                                                                                                                         | 4        |
| **Event Chip** · [6632:2](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6632-2), **All-Day Bar** · [6644:50](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6644-50)     | **The tinted chip and the solid bar align their content to the top**, where the others centre it; the content fills the height, so nothing shows the difference.                                                                                                                                                      | 12       |
| **Calendar Toolbar** · [6653:861](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6653-861)                                                                                         | **Previous and next are md Icon Buttons (40) in a 32 row**, where every other control is sm; they reach past the row. We draw them as Figma does.                                                                                                                                                                     | 1        |
| **Agenda Row** · [6651:138](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6651-138)                                                                                               | **Rows are sized for text trimmed to its cap height** (Figma's leading trim, on every SOLAR text), which neither platform draws: full lines need 76 (comfortable) and 44 (compact), not 64 and 32. Code draws full lines and grows the row to hold them (owner decision); please size text containers for full lines. | 6        |
| **Agenda Row** · [6651:138](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6651-138), **All-Day Bar** · [6644:50](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6644-50) | **The dot and the bar are category 06 only**, where the Agenda Row's description says its colour matches the source event. Code gives both Event Chip's `category` (owner decision), blue by default; please add the axis in Figma.                                                                                   | 14       |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                     | What we do meanwhile                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- |
| **All-Day Bar's span** (**All-Day Bar** · [6644:50](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=6644-50)): its description says the span sets the corners so segments fuse into one bar across columns; every span is drawn alike. Should the start, middle and end round only their outer ends? | Every span alike, as drawn.                          |
| **Event Chip's densities**: its description says both densities (md, sm) support every category; no density is drawn.                                                                                                                                                                                        | One density, as drawn.                               |
| **Weekday Header's today**: its description says today "bolds the weekday and tints it"; Figma only tints it.                                                                                                                                                                                                | Tinted, as drawn.                                    |
| **Calendar Toolbar's New Event**: its description says a primary Button; Figma draws a secondary one.                                                                                                                                                                                                        | The app's Button; secondary in our checks, as drawn. |

### Charts: Sparkline, Bar, Bar Stack, Data Legend, Chart Tooltip, and the plotted charts

Sparkline, Bar, Bar Stack, Data Legend and Chart Tooltip are built as drawn and checked against
Figma. Bar Chart, Line Chart and Donut Chart, with Chart Axis and Chart Gridlines, are drawn by a
chart library (MUI X Charts, fl_chart) in a theme generated from them: their series colours
(bars and lines 06, 02, 04, 07, 01, 03, 05, 08; the donut's segments 01 to 08, owner decision),
strokes, axis and label styles and the donut's hole. Their plots are Figma's samples.

**Fix** — these look like accidents:

| Component                                                                                   | What                                                                                                                                                                         | Variants |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| **Sparkline** · [7312:14](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7312-14)  | **The frame is 115 × 32 at both sizes**, where the description says sm is 80 × 24; the line inside is the size. We draw the 115 × 32 frame (owner decision).                 | 6        |
| **Bar Stack** · [7235:26](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7235-26)  | **The segments' gap is `inset/2xs` (4) in the default stack and an unbound 2 in the other five.** We draw 4, the governed one. Which is meant? A 2 needs a spacing variable. | 5        |
| **Line Chart** · [7311:54](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7311-54) | **Its legend's swatches are 10 × 10 squares** (radius 2), where Data Legend and Chart Tooltip draw an 8px dot. Code names series with Data Legend.                           | 2        |

**⚠️ Decide:**

| Question                                                                                                                                                                                                                                                                                                                                                                                                                                                            | What we do meanwhile                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **The series swatch** (**Data Legend** · [7309:62](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7309-62), **Chart Tooltip** · [7308:25](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7308-25)): Figma draws a StatusIndicator (an xs dot in status colours: success, warning…), where both descriptions say a swatch in the series' data colour (Data Legend: 10 × 10, radius/control). Which shape, and should it be a component of its own? | Figma's dot, in the series' colour (owner decision). |
| **Bar Chart's states** (**Bar Chart** · [7219:254](https://figma.com/design/OGvmMNnywH7JWDyEhOzjcc?node-id=7219-254)): its description lists loading, empty and error as pending.                                                                                                                                                                                                                                                                                   | The library's own empty state; none drawn.           |

---

# Decisions we need from you

The questions we cannot answer ourselves, most far-reaching first.

**Sizes**

1. **Sizes with no variable** — the heights on no `size/control` step (FAB's 44 and 56, Banner's 44,
   Context Menu Item's and PageNavButton's 36, Segmented Control Item's 24 and 32, Text Area's 120
   and 100, Tag's 24), Button lg's 200px width, Counter's badge, Avatar, ProgressBar, the table and
   tree rows, a labelled Divider, the selection controls (Checkbox's box, Radio's ring, Toggle's
   track and thumb, a slider's track and handle, DragHandle's dots), PIN Input's cells, Number
   Input's side stepper, a date picker's 36px day cells and 32px month headers, and a menu's
   ~300px maximum height, which Dropdown Menu's description asks for (we cap at one raw 300), and
   a table's: its 40px select column and row heights, a header cell's 26px separator, the
   toolbar's 240px search, a property's 160px Select and the mobile fade's 32, and an overlay's:
   a Dialog's 480 and a Split Dialog's 640 width, a Drawer's 348, a Popover's 320 and 240 and a
   Coachmark's 320, a dialog title's 36px icon box and its image's 279, a Tooltip's 7 × 3 arrow, a
   Popover's 10px tip, and a Coachmark's 100px connector and 6px dot, and a calendar's: a chip's
   and bar's 22 and stripe's 3, a day's 120 and its date pill's 24, a weekday header's 36, an
   hour's 48 and 32, the time rail's 56, an agenda row's time column (36, 76) and 8px dot, and a
   chart's: a Sparkline's 115 × 32 frame and 1.5 stroke, an axis tick's 4: one family of size
   variables, as `size/control/*` is for controls? Sections 1 and 2.

**Components**

2. **Button's tertiary underline and lg fill** — the underline is not drawn on a danger tertiary
   hover and is drawn on lg's secondary hover; lg tertiary alone is filled. Section 2.
3. **Drop shadows** — StatusIndicator's marks and Tooltip's arrow carry `shadow/raised`, and
   Popover's frame `shadow/dialog`, each a box shadow where the shape needs a drop shadow: a
   drop-shadow variable, or none? And is Popover's `shadow/dialog` or, as its description says,
   `shadow/overlay`? Section 2.
4. **Focus where none is drawn** — Tree Item's focus is its edit state, and no card draws a focus
   ring. Section 2.
5. **A Dropdown Item's height** — 34px at md without its optional parts, as its description and
   Select's panel say, or the 44 its content hugs to? Section 2.
6. **Tag's inverted close button** — larger than every other, with less padding: intended?
   Section 2.
7. **Ranges** — Date Picker Open's double calendar draws a range, and Day Cell a range's roles:
   are range pickers coming, and should a floating calendar show two months? Section 2.
8. **Tables** — a row's height (44 or 40), Row's hover, a sort arrow and a numeric column, and the
   mobile table: a card-style list, or the fitted rows and fade Figma draws? Section 2.
9. **Overlays** — Tooltip's delay, a Split Dialog on a narrow viewport, and Coachmark's close and
   title. Section 2.
10. **Calendar** — an All-Day Bar's span corners, Event Chip's densities, Weekday Header's today
    and the toolbar's New Event. Section 2.
11. **Charts** — the series swatch's shape, a Bar Stack's gap, and Bar Chart's loading, empty and
    error states. Section 2.

---

_Read from SOLAR Foundations `[v1--2026]` version `2403083104633531037` and SOLAR Web `[v1--2026]`
version `2403086052040245261`, on 2026-09-25, and SOLAR Icons `[v2--2026]` version
`2402400024423705866`. Counts are computed from the files, not estimated. We are happy to walk
through any of this live — and happy to be wrong on the judgement calls, where we may be missing
context._
