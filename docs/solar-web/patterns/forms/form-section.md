# Form Section

> SOLAR Web · Figma page `↳ 🟢 Form Section` (id `2202:1257`) · section `patterns/forms` · raw data: [`raw/patterns/forms/form-section.json`](../../raw/patterns/forms/form-section.json)

## Component: FormSection

### Props

| Prop               | Type    | Options / default         |
| ------------------ | ------- | ------------------------- |
| `SectionFields`    | slot    | default `[object Object]` |
| `hasSectionHeader` | boolean | default `true`            |
| `hasCTA`           | boolean | default `false`           |

### Anatomy (default variant)

- **FormSection** · component · column gap 20 pad 20/0/20/0 FIXED/HUG · 640×377  
  stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - **Contaner** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×41  
    itemSpacing `inset.xl`
    - **SectionHeader** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 640×41  
      itemSpacing `stack.md` · padding `stack.none` · prop visible←hasSectionHeader
      - **Title** · text `title/sm` "Section title" · FILL/HUG · 640×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Description** · text `body/md/regular` "Short description goes here." · FILL/HUG · 640×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - ~~**Button**~~ (hidden by default) · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasCTA
  - **SectionFields** · slot · column gap 24 pad 0/0/0/0 FILL/HUG · 640×276  
    itemSpacing `inset.xl` · prop slotContentId←SectionFields
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`                                                                                                                                          |
| Strokes         | `color.action.secondary.border.default`, `color.border.surface`                                                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                 |
| Spacing         | `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.title.sm` |
| Effects         | `shadow/control`                                                                                                                                                             |
| Text styles     | `body/md/regular`, `title/sm`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                    | Controlled property | Prop               |
| ------------------------ | ------------------- | ------------------ |
| Contaner › SectionHeader | visible             | `hasSectionHeader` |
| Contaner › Button        | visible             | `hasCTA`           |
| SectionFields            | slotContentId       | `SectionFields`    |

### Composes

- Button
- FormRow

### Issues detected

- Component description is empty.

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

**Description**

Shows the user's location within a navigational hierarchy — and lets them jump back up the tree. Use for deep page structures where ancestors are meaningful destinations. Not for single-level flows (omit entirely), not for linear progress (use Stepper).

**Anatomy**

Breadcrumbs compose from Breadcrumb Items joined by a separator.  
Breadcrumb Item (4 variants) type: link | current — current is the final, non-interactive item.  
Breadcrumbs (5 variants) items: 2 | 3 | 4 | 5 | multiple — use 'multiple' when the trail exceeds 5 levels.

**States**

default Interactive ancestor link. Subtle text color.  
hover Full emphasis + underline. Touch targets pad to 44px per WCAG.  
disabled Non-interactive ancestor. Use sparingly — prefer omitting the item entirely.

**Truncation**

Switch to items=multiple once the trail exceeds 5 levels. The middle collapses to an ellipsis (…) while the first and last segments stay visible. Clicking the ellipsis opens a menu listing the hidden ancestors so users can jump to any of them without losing the endpoints.

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.
