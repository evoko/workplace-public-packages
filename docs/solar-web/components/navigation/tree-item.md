# Tree Item

> SOLAR Web · Figma page `↳ 🟢 Tree Item` (id `2422:8434`) · section `components/navigation` · raw data: [`raw/components/navigation/tree-item.json`](../../raw/components/navigation/tree-item.json)

## Component set: Tree Item

Single row in a hierarchical tree. 12 variants: state (default / hover / edit) × selected × expanded.

DEPTH — set on the nested Tree indent instance (depth 00–10). Indent = depth × 16px. Never hardcode indentation or add Level variants back; depth is unbounded by design.
LEAF ROWS — hasChevron=false hides only the glyph inside the fixed 16px chevron slot, so sibling labels stay aligned. Never delete or hide the Chevron frame itself.
CTAs — appear on hover and while selected; hasCTAs=false opts out per instance. Resting rows have no CTA layer.
RENAME — state=edit styles the row as an active inline input (border/feedback/focus/strong + shadow/focus/default) and doubles as the focus treatment.

⚠️ Hovering a selected row renders identically to selected — pending a color.surface.selected token.
⚠️ No separate focus/disabled variants; state=edit carries the focus ring. Flag before 🟢 if Class D coverage is required.

### Props

| Prop              | Type    | Options / default          |
| ----------------- | ------- | -------------------------- |
| `selected`        | variant | **false** · true           |
| `expanded`        | variant | **false** · true           |
| `state`           | variant | **default** · hover · edit |
| `hasChevron`      | boolean | default `true`             |
| `hasCounter`      | boolean | default `false`            |
| `hasCheckbox`     | boolean | default `false`            |
| `hasTag`          | boolean | default `false`            |
| `hasLeadingIcon`  | boolean | default `false`            |
| `hasStatus`       | boolean | default `false`            |
| `hasButtons`      | boolean | default `true`             |
| `hasTrailingIcon` | boolean | default `false`            |

Default variant: `selected=false, expanded=false, state=default` · 12 variants · default size 200×32px

### Anatomy (default variant)

- **selected=false, expanded=false, state=default** · component · row gap 4 pad 0/8/0/4 FIXED/FIXED · 200×32  
  itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
  - **Tree Indent** · instance of **.Tree Indent** (depth=00) · FIXED/FIXED · 0×32
  - **Chevron** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 16×16  
    itemSpacing `inset.xs`
    - **Icon/ChevronRight** · instance of **Icon/ChevronRight** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm` · prop visible←hasChevron
  - ~~**Checkbox**~~ (hidden by default) · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
    stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control` · prop visible←hasCheckbox
  - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←hasLeadingIcon
  - **Label** · text `label/md` "Label" · FILL/HUG · 164×10  
    fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
  - ~~**StatusIndicator**~~ (hidden by default) · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
    fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasStatus
  - ~~**Tag**~~ (hidden by default) · instance of **Tag** (status=success, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 67×24  
    fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasTag
  - ~~**Counter**~~ (hidden by default) · instance of **Counter** (type=regular, state=disabled) · row gap 0 pad 0/8/0/8 HUG/FIXED · 25×20  
    fill `color.action.primary.bg.disabled` · stroke `color.border.medium` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasCounter
  - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←hasTrailingIcon

### Tokens used

| Role            | Tokens                                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.disabled`, `color.surface.active`, `color.surface.base`, `color.surface.feedback.success.strong`, `color.surface.feedback.success.subtle`, `color.surface.hover` |
| Strokes         | `color.border.feedback.focus.strong`, `color.border.feedback.success.subtle`, `color.border.medium`                                                                                       |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`             |
| Icon color      | `color.icon.primary`, `color.icon.secondary`                                                                                                                                              |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`                                                                                                                                         |
| Radius          | `radius.control`, `radius.pill`                                                                                                                                                           |
| Border width    | `border.default`                                                                                                                                                                          |
| Sizes           | `icon.sm`                                                                                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                                                       |
| Effects         | `shadow/focus/default`                                                                                                                                                                    |
| Text styles     | `label/md`                                                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                       | Controlled property | Prop              |
| --------------------------- | ------------------- | ----------------- |
| Chevron › Icon/ChevronRight | visible             | `hasChevron`      |
| Checkbox                    | visible             | `hasCheckbox`     |
| Icon/None                   | visible             | `hasLeadingIcon`  |
| StatusIndicator             | visible             | `hasStatus`       |
| Tag                         | visible             | `hasTag`          |
| Counter                     | visible             | `hasCounter`      |
| Icon/None                   | visible             | `hasTrailingIcon` |

### Composes

- .Tree Indent
- Checkbox
- Counter
- Icon/ChevronRight
- Icon/None
- StatusIndicator
- Tag

### Variant matrix

| selected | expanded | state   | size   | fill                   | stroke                               | effect                 | text                                                                                            | icon                                           |
| -------- | -------- | ------- | ------ | ---------------------- | ------------------------------------ | ---------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| false    | false    | default | 200×32 |                        |                                      |                        | `color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled` | `color.icon.secondary`                         |
| false    | false    | hover   | 200×32 | `color.surface.hover`  |                                      |                        | `color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`  | `color.icon.secondary`                         |
| false    | false    | edit    | 200×32 | `color.surface.base`   | `color.border.feedback.focus.strong` | `shadow/focus/default` | `color.text.tertiary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`  | `color.icon.primary`<br>`color.icon.secondary` |
| false    | true     | default | 200×32 |                        |                                      |                        | `color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled` | `color.icon.secondary`                         |
| false    | true     | edit    | 200×32 | `color.surface.base`   | `color.border.feedback.focus.strong` | `shadow/focus/default` | `color.text.tertiary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`  | `color.icon.primary`<br>`color.icon.secondary` |
| false    | true     | hover   | 200×32 | `color.surface.hover`  |                                      |                        | `color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`  | `color.icon.secondary`                         |
| true     | false    | default | 200×32 | `color.surface.active` |                                      |                        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |
| true     | false    | hover   | 200×32 | `color.surface.active` |                                      |                        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |
| true     | false    | edit    | 200×32 | `color.surface.base`   | `color.border.feedback.focus.strong` | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |
| true     | true     | default | 200×32 | `color.surface.active` |                                      |                        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |
| true     | true     | edit    | 200×32 | `color.surface.base`   | `color.border.feedback.focus.strong` | `shadow/focus/default` | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |
| true     | true     | hover   | 200×32 | `color.surface.active` |                                      |                        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`    | `color.icon.primary`                           |

### Issues detected

- State axis uses non-standard value(s): edit.

## Component set: .Tree Indent

Spacer that sets a Tree Item's nesting depth via the exposed depth property (00–10). Indent = depth × 16px, matching the 16px chevron slot.

Width is content-driven — each variant holds depth × 16px units and hugs them. This is deliberate: fixed-size variants do NOT resize when swapped inside a nested instance (Figma limitation). Add depth by adding units; never resize the variant frame or convert to fixed widths.

### Props

| Prop    | Type    | Options / default                                        |
| ------- | ------- | -------------------------------------------------------- |
| `depth` | variant | **00** · 01 · 02 · 03 · 04 · 05 · 06 · 07 · 08 · 09 · 10 |

Default variant: `depth=00` · 11 variants · default size 0×32px

### Anatomy (default variant)

- **depth=00** · component · FIXED/FIXED · 0×32

### Variant matrix

| depth | size   | fill | stroke | effect | text | icon |
| ----- | ------ | ---- | ------ | ------ | ---- | ---- |
| 00    | 0×32   |      |        |        |      |      |
| 01    | 16×32  |      |        |        |      |      |
| 02    | 32×32  |      |        |        |      |      |
| 03    | 48×32  |      |        |        |      |      |
| 04    | 64×32  |      |        |        |      |      |
| 05    | 80×32  |      |        |        |      |      |
| 06    | 96×32  |      |        |        |      |      |
| 07    | 112×32 |      |        |        |      |      |
| 08    | 128×32 |      |        |        |      |      |
| 09    | 144×32 |      |        |        |      |      |
| 10    | 160×32 |      |        |        |      |      |

## Documentation card

**Tree**

**Depth**

Depth is a property, not a variant — select the nested Tree indent and pick depth 00–10.  
Indent = depth × 16px, matching the 16px chevron slot, so a child’s content aligns under its parent’s label at any depth.  
Leaf rows: set hasChevron=false. Only the glyph hides — the 16px slot remains, so siblings stay aligned.

**Keyboard**

↑ / ↓ move row focus.  
→ expand (if collapsed) or move to first child (if expanded).  
← collapse (if expanded) or move to parent (if collapsed).  
Enter/Space select / activate.  
Home/End first / last visible row.  
F2 rename in place (state=edit).

**Rules**

Do  
• Set depth on the nested Tree indent — never hardcode indentation  
• Use hasChevron=false for leaf rows; the slot keeps siblings aligned  
• Rely on the built-in reveal: CTAs show on hover and while selected  
• Use state=edit for inline rename — it doubles as the focus treatment

Don’t  
• Don’t delete or hide the Chevron frame — toggle hasChevron instead  
• Don’t re-add Level variants — depth is unbounded by design  
• Don’t put destructive actions inline in the row without a confirm  
• Don’t resize Tree indent variants — depth is content-driven on purpose
