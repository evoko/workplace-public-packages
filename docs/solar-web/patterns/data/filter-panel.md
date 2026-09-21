# Filter Panel

> SOLAR Web · Figma page `↳ 🟢 Filter Panel` (id `5674:2`) · section `patterns/data` · raw data: [`raw/patterns/data/filter-panel.json`](../../raw/patterns/data/filter-panel.json)

## Component set: FilterSection

FilterSection — Day-1: checkbox-list only. type × state = 3 variants. Composes into FilterPanel.Sections slot. Expanded is a component property, not a variant axis.

### Props

| Prop    | Type    | Options / default             |
| ------- | ------- | ----------------------------- |
| `type`  | variant | **checkbox-list**             |
| `state` | variant | **default** · loading · empty |

Default variant: `type=checkbox-list, state=default` · 3 variants · default size 288×184px

### Anatomy (default variant)

- **type=checkbox-list, state=default** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 288×184
  - **SectionHeader** · frame · row gap 8 pad 12/16/12/16 FILL/HUG · 288×40  
    itemSpacing `stack.xs` · padding `inset.md`, `inset.sm`
    - **Label** · text `label/sm` "Label" · FILL/HUG · 232×9  
      fill `color.text.secondary` · lineHeight `type.line-height.label.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.label.sm` · fontStyle `type.font-weight.500`
    - **Chevron** · instance of **Icon/ChevronUp** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **Body** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 288×144
    - **FilterRow** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 288×36  
      itemSpacing `stack.xs` · padding `inset.md`, `inset.none`
      - **Checkbox** · instance of **Checkbox** (checked=true, disabled=false, hover=false, mixed=false, focus=false) · column gap 16 pad 0/0/0/0 FIXED/FIXED · 16×16  
        fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · itemSpacing `stack.md` · strokeWeight `border.default` · radius `radius.control`
      - **Label** · text `body/md/regular` "Label" · FILL/HUG · 200×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **142** · text `body/md/regular` "142" · HUG/HUG · 24×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **FilterRow** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 288×36  
      itemSpacing `stack.xs` · padding `inset.md`, `inset.none`
      - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
        stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`
      - **Label** · text `body/md/regular` "Label" · FILL/HUG · 209×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **18** · text `body/md/regular` "18" · HUG/HUG · 15×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **FilterRow** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 288×36  
      itemSpacing `stack.xs` · padding `inset.md`, `inset.none`
      - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
        stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`
      - **Label** · text `body/md/regular` "Label" · FILL/HUG · 215×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **4** · text `body/md/regular` "4" · HUG/HUG · 9×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - **FilterRow** · frame · row gap 8 pad 0/16/0/16 FILL/FIXED · 288×36  
      itemSpacing `stack.xs` · padding `inset.md`, `inset.none`
      - **Checkbox** · instance of **Checkbox** (checked=false, disabled=false, hover=false, mixed=false, focus=false) · FIXED/FIXED · 16×16  
        stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.control`
      - **Label** · text `body/md/regular` "Label" · FILL/HUG · 206×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **86** · text `body/md/regular` "86" · HUG/HUG · 18×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`                                                                                                                                            |
| Strokes         | `color.border.medium`                                                                                                                                                        |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                 |
| Icon color      | `color.icon.inverse`, `color.icon.secondary`                                                                                                                                 |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `stack.md`, `stack.xs`                                                                                                                 |
| Radius          | `radius.control`                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                             |
| Sizes           | `icon.sm`                                                                                                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.label.sm`, `type.size.body.md`, `type.size.label.sm` |
| Text styles     | `body/md/regular`, `label/sm`                                                                                                                                                |

### Composes

- Checkbox
- Icon/ChevronUp

### Variant matrix

| type          | state   | size    | fill | stroke | effect | text                                           | icon                                           |
| ------------- | ------- | ------- | ---- | ------ | ------ | ---------------------------------------------- | ---------------------------------------------- |
| checkbox-list | default | 288×184 |      |        |        | `color.text.secondary`<br>`color.text.primary` | `color.icon.secondary`<br>`color.icon.inverse` |
| checkbox-list | loading | 288×184 |      |        |        | `color.text.secondary`                         | `color.icon.secondary`                         |
| checkbox-list | empty   | 288×82  |      |        |        | `color.text.secondary`                         | `color.icon.secondary`                         |

## Component set: FilterPanel

FilterPanel chassis. Day-1: layout × footerBehavior × state = 12 variants. Staged-apply (apply-button) is the canonical default per hardening review §4.1. Section children take Expanded:Boolean as a component property. Slot-based composition — consumers drop FilterSection (or any) instances into the Sections region.

### Props

| Prop      | Type    | Options / default             |
| --------- | ------- | ----------------------------- |
| `state`   | variant | **default** · loading · empty |
| `content` | slot    | default `[object Object]`     |

Default variant: `state=default` · 3 variants · default size 320×720px

### Anatomy (default variant)

- **state=default** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 320×720  
  fill `color.surface.raised` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
  - **Header** · frame · row gap 12 pad 8/16/8/16 FILL/FIXED · 320×52  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.xs` · strokeWeight `border.default`
    - **TitleGroup** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 260×20  
      itemSpacing `stack.xs`
      - **Title** · text `body/lg/medium` "Filters" · HUG/HUG · 46×12  
        fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
      - **SummaryCounter** · instance of **Counter** (type=regular, state=default) · row gap 0 pad 0/8/0/8 HUG/FIXED · 24×20  
        fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · padding `inset.xs` · strokeWeight `border.default` · radius `radius.pill`
    - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 16×16  
      height `icon.sm`
  - **content** · slot · column gap 0 pad 0/0/0/0 FILL/FILL · 320×620  
    prop slotContentId←content
    - **FilterSection** · instance of **FilterSection** (type=checkbox-list, state=default) · column gap 0 pad 0/0/0/0 FILL/HUG · 320×184  
      stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
    - **FilterSection** · instance of **FilterSection** (type=checkbox-list, state=default) · column gap 0 pad 0/0/0/0 FILL/HUG · 320×184  
      stroke `color.border.subtle` mixedpx · strokeWeight `border.default`
    - **SectionDateRange** · frame · column gap 12 pad 16/16/16/16 FILL/HUG · 320×81  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default`
      - **Dropdown** · instance of **Dropdown** (size=sm, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 288×49  
        itemSpacing `stack.xs`
    - **SectionTags** · frame · column gap 12 pad 12/16/12/16 FILL/HUG · 320×101  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md`, `inset.sm` · strokeWeight `border.default`
      - **SectionHeading** · text `body/sm/medium` "Tags" · HUG/HUG · 27×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
      - **TagCluster** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 288×56  
        itemSpacing `stack.xs`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 76×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 62×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 78×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 61×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 89×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
        - **Tag** · instance of **Tag** (status=neutral, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 51×24  
          fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill`
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 320×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills           | `color.action.primary.bg.default`, `color.surface.feedback.neutral.subtle`, `color.surface.raised`                                                                                   |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                         |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.neutral`, `color.text.primary`, `color.text.secondary`                              |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary` |
| Spacing         | `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.sm`, `stack.xs`                                                                                                             |
| Radius          | `radius.container`, `radius.pill`                                                                                                                                                    |
| Border width    | `border.default`                                                                                                                                                                     |
| Sizes           | `icon.sm`                                                                                                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.sm`, `type.size.body.lg`, `type.size.body.sm`                                   |
| Effects         | `shadow/raised`                                                                                                                                                                      |
| Text styles     | `body/lg/medium`, `body/sm/medium`                                                                                                                                                   |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| content | slotContentId       | `content` |

### Composes

- Button Group
- Counter
- Dropdown
- FilterSection
- Icon/Close
- Tag

### Variant matrix

| state   | size    | fill                   | stroke                | effect          | text                                                                                                                                                            | icon                                                                                                                                                                                           |
| ------- | ------- | ---------------------- | --------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| default | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.text.feedback.neutral`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| loading | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                  | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |
| empty   | 320×720 | `color.surface.raised` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                  | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                                           |

### Issues detected

- Description says 12 variants; the set has 3.

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
