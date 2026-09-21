# Page Header

> SOLAR Web · Figma page `↳ 🟢 Page Header` (id `4533:83`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/page-header.json`](../../raw/patterns/layout-shell/page-header.json)

## Component set: Page Header

### Props

| Prop              | Type    | Options / default           |
| ----------------- | ------- | --------------------------- |
| `type`            | variant | centered · **left-aligned** |
| `breakpoint`      | variant | **desktop** · mobile        |
| `page-title`      | text    | default `Page Title`        |
| `hasDescription`  | boolean | default `true`              |
| `hasBreadcrumbs`  | boolean | default `true`              |
| `hasIcon`         | boolean | default `true`              |
| `hasImage`        | boolean | default `true`              |
| `hasTabs`         | boolean | default `true`              |
| `hasCTA`          | boolean | default `false`             |
| `hasSecondaryCTA` | boolean | default `true`              |
| `hasPrimaryCTA`   | boolean | default `true`              |
| `hasTag`          | boolean | default `false`             |

Default variant: `type=left-aligned, breakpoint=desktop` · 3 variants · default size 1368×166px

### Anatomy (default variant)

- **type=left-aligned, breakpoint=desktop** · component · column gap 0 pad 8/24/0/24 FIXED/HUG · 1368×166  
  stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1320×118
    - **TextStack** · frame · column gap 16 pad 20/0/20/0 FILL/HUG · 1181×118  
      itemSpacing `stack.md` · padding `stack.lg`
      - **Breadcrumbs** · instance of **Breadcrumbs** (items=multiple) · row gap 12 pad 0/0/0/0 HUG/HUG · 156×12  
        itemSpacing `stack.sm` · prop visible←hasBreadcrumbs
      - **Container** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 1181×24  
        itemSpacing `inset.sm`
        - **Icon/Building** · instance of **Icon/Building** (solid=false) · FIXED/FIXED · 24×24  
          width `icon.lg` · prop visible←hasIcon
        - **Title** · text `title/md` "Page Title" · HUG/HUG · 145×23  
          fill `color.text.primary` · lineHeight `type.line-height.title.md` · fontFamily `type.font-family.inter` · fontSize `type.size.title.md` · fontStyle `type.font-weight.500` · prop characters←page-title
        - ~~**Tag**~~ (hidden by default) · instance of **Tag** (status=success, type=status, invert=false) · row gap 8 pad 0/12/0/8 HUG/FIXED · 67×24  
          fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasTag
      - **Description** · text `body/md/regular` "Supporting description text that explains the page context." · FILL/HUG · 1181×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop visible←hasDescription
    - **Image** · rectangle · FIXED/FIXED · 139×78  
      fill `IMAGE` ⚠️ hard-coded · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.control` · prop visible←hasImage
    - ~~**CTA**~~ (hidden by default) · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 182×32  
      itemSpacing `inset.xs` · prop visible←hasCTA
      - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
        fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasSecondaryCTA
      - **Button** · instance of **Button** (size=md, prio=primary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
        fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasPrimaryCTA
  - **Tabs** · instance of **Tabs** (size=md) · row gap 0 pad 0/0/0/0 FILL/HUG · 1320×40  
    padding `inset.none` · strokeWeight `border.default` · prop visible←hasTabs

### Tokens used

| Role            | Tokens                                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.action.secondary.bg.default`, `color.surface.feedback.success.subtle`                                                                     |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`, `color.border.feedback.success.subtle`, `color.border.subtle`                                       |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`      |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900` |
| Spacing         | `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`, `stack.sm`                                                                                  |
| Radius          | `radius.control`, `radius.pill`                                                                                                                                                     |
| Border width    | `border.default`                                                                                                                                                                    |
| Sizes           | `icon.lg`                                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.md`, `type.size.body.md`, `type.size.title.md`        |
| Effects         | `shadow/control`                                                                                                                                                                    |
| Text styles     | `body/md/regular`, `title/md`                                                                                                                                                       |

### Slots and prop-controlled layers

| Layer                                             | Controlled property | Prop              |
| ------------------------------------------------- | ------------------- | ----------------- |
| Container › TextStack › Breadcrumbs               | visible             | `hasBreadcrumbs`  |
| Container › TextStack › Container › Icon/Building | visible             | `hasIcon`         |
| Container › TextStack › Container › Title         | characters          | `page-title`      |
| Container › TextStack › Container › Tag           | visible             | `hasTag`          |
| Container › TextStack › Description               | visible             | `hasDescription`  |
| Container › Image                                 | visible             | `hasImage`        |
| Container › CTA                                   | visible             | `hasCTA`          |
| Container › CTA › Button                          | visible             | `hasSecondaryCTA` |
| Container › CTA › Button                          | visible             | `hasPrimaryCTA`   |
| Tabs                                              | visible             | `hasTabs`         |

### Composes

- Breadcrumbs
- Button
- Icon/Building
- Tabs
- Tag

### Variant matrix

| type         | breakpoint | size     | fill | stroke                | effect | text                                                                                                                                                                                     | icon                                                                                                                                                  |
| ------------ | ---------- | -------- | ---- | --------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| left-aligned | desktop    | 1368×166 |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                        |
| left-aligned | mobile     | 377×150  |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                                                |
| centered     | desktop    | 1368×174 |      | `color.border.subtle` |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary` | `color.icon.secondary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.primary` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded gap `16px` on layer _Container_

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
