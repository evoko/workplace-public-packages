# Split Dialog

> SOLAR Web · Figma page `↳ 🟢 Split Dialog` (id `6774:9192`) · section `components/dialogs` · raw data: [`raw/components/dialogs/split-dialog.json`](../../raw/components/dialogs/split-dialog.json)

## Component set: Split Dialog

Modal dialog with two panes — a navigation or list rail on the left, content on the right — for multi-section tasks such as settings or import mapping. 2 variants: cta (regular, full-width) for the footer Button Group. left and right are slots. Same contract as Dialog: role=dialog, aria-modal, focus trap, Esc closes, focus returns to the trigger. Collapses to one stacked pane on narrow viewports. For a single-pane task use Dialog.

### Props

| Prop    | Type    | Options / default         |
| ------- | ------- | ------------------------- |
| `cta`   | variant | regular · **full-width**  |
| `left`  | slot    | default `[object Object]` |
| `right` | slot    | default `[object Object]` |

Default variant: `cta=full-width` · 2 variants · default size 640×480px

### Anatomy (default variant)

- **cta=full-width** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 640×480  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Header** · frame · column gap 8 pad 8/8/8/8 FILL/HUG · 640×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default`
    - **Text** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 624×40
      - **Icon** · frame · row gap 8 pad 0/0/0/0 FIXED/FIXED · 36×36  
        itemSpacing `stack.xs`
        - **Icon/Empty** · instance of **Icon/Empty** (solid=false) · FIXED/FIXED · 12×12  
          height `icon.xs`
      - **Title** · text `title/sm` "Dialog Title" · FILL/HUG · 548×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.pill`
  - **Body** · frame · row gap 0 pad 0/0/0/0 FILL/FILL · 640×376  
    fill `#ffffff` ⚠️ hard-coded
    - **left** · slot · column gap 16 pad 20/20/20/20 FILL/FILL · 320×376  
      itemSpacing `stack.md` · padding `inset.lg` · prop slotContentId←left
      - **Title** · text `title/xs` "Section title" · FILL/HUG · 280×12  
        fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
      - **Description** · text `body/md/regular` "Short description goes here." · FILL/HUG · 280×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **Text Input** · instance of **Text Input** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 280×58  
        itemSpacing `stack.xs`
    - **right** · slot · column gap 16 pad 20/20/20/20 FILL/FILL · 320×376  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.md` · padding `inset.lg` · strokeWeight `border.default` · prop slotContentId←right
      - **Supporting panel** · text `title/xs` "Supporting panel " · FILL/HUG · 280×12  
        fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
      - **Supporting panel — picker results, summary, contextual help, or example.** · text `body/md/regular` "Supporting panel — picker results, summary, contextual help, or example." · FILL/HUG · 280×30  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 640×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.default`, `color.surface.dialog`                                                                                                                                                                      |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                           |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`               |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.tertiary`                                                                                         |
| Spacing         | `inset.lg`, `inset.none`, `inset.xs`, `stack.md`, `stack.xs`                                                                                                                                                                    |
| Radius          | `radius.dialog`, `radius.pill`                                                                                                                                                                                                  |
| Border width    | `border.default`                                                                                                                                                                                                                |
| Sizes           | `icon.xs`                                                                                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.sm`, `type.line-height.title.xs`, `type.size.body.md`, `type.size.title.sm`, `type.size.title.xs` |
| Effects         | `shadow/dialog`                                                                                                                                                                                                                 |
| Text styles     | `body/md/regular`, `title/sm`, `title/xs`                                                                                                                                                                                       |

### Slots and prop-controlled layers

| Layer        | Controlled property | Prop    |
| ------------ | ------------------- | ------- |
| Body › left  | slotContentId       | `left`  |
| Body › right | slotContentId       | `right` |

### Composes

- Button Group
- Icon Button
- Icon/Empty
- Text Input

### Variant matrix

| cta        | size    | fill                   | stroke | effect          | text                                                                                                                                                                                  | icon                                                                                                                                          |
| ---------- | ------- | ---------------------- | ------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| full-width | 640×480 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default`<br>`color.icon.tertiary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| regular    | 640×480 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`                | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                          |

### Issues detected

- Hard-coded fill `#ffffff` on layer _Body_

## Documentation card

**Description**

A modal dialog with two panes — typically a nav/list rail beside a detail area. For focused multi-section tasks; use Dialog for single-pane.

**Anatomy**

Scrim · dialog surface (shadow.dialog) · left pane (nav/list) · right pane (content) · header · footer actions (Button Group).

**Sizes & Layout**

size=md / lg. Left pane fixed width, right pane fills. Collapses to a single stacked pane on narrow viewports.

**States**

open, closing. Content panes: loaded, loading, empty. Confirm/cancel use a Button Group — never two loose Buttons.

**Accessibility**

role=dialog, aria-modal=true, labelled by the header. Trap focus; Esc closes; return focus to the trigger. Scrim click closes only when non-destructive.

**Rules**

Use a Button Group for actions  
Trap + restore focus  
Collapse to one pane on mobile  
Label the dialog

Nest confusing scroll regions  
Use for a single-pane task  
Put destructive actions without confirm  
Block the Esc key
