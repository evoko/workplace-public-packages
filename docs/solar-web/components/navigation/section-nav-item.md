# Section Nav Item

> SOLAR Web · Figma page `↳ 🟢 Section Nav Item` (id `8108:2`) · section `components/navigation` · raw data: [`raw/components/navigation/section-nav-item.json`](../../raw/components/navigation/section-nav-item.json)

## Component set: Section Nav Item

### Props

| Prop    | Type          | Options / default                                 |
| ------- | ------------- | ------------------------------------------------- |
| `state` | variant       | **default** · hover · focus · selected · disabled |
| `label` | text          | default `Label`                                   |
| `icon`  | instance swap | default `10148:444`                               |

Default variant: `state=default` · 5 variants · default size 220×32px

### Anatomy (default variant)

- **state=default** · component · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
  itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop mainComponent←icon
  - **Label** · text `label/md` "Label" · FIXED/HUG · 180×10  
    fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop characters←label

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.hover`                                                       |
| Text color      | `color.text.primary`, `color.text.secondary`                                                        |
| Icon color      | `color.icon.primary`, `color.icon.secondary`                                                        |
| Spacing         | `inset.none`, `inset.xs`                                                                            |
| Radius          | `radius.control`                                                                                    |
| Sizes           | `icon.sm`                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md` |
| Effects         | `shadow/focus/default`                                                                              |
| Text styles     | `label/md`                                                                                          |

### Slots and prop-controlled layers

| Layer     | Controlled property | Prop    |
| --------- | ------------------- | ------- |
| Icon/None | mainComponent       | `icon`  |
| Label     | characters          | `label` |

### Composes

- Icon/None

### Variant matrix

| state    | size   | fill                   | stroke | effect                 | text                   | icon                   |
| -------- | ------ | ---------------------- | ------ | ---------------------- | ---------------------- | ---------------------- |
| default  | 220×32 |                        |        |                        | `color.text.secondary` | `color.icon.secondary` |
| hover    | 220×32 | `color.surface.hover`  |        |                        | `color.text.primary`   | `color.icon.primary`   |
| focus    | 220×32 |                        |        | `shadow/focus/default` | `color.text.secondary` | `color.icon.secondary` |
| selected | 220×32 | `color.surface.active` |        |                        | `color.text.primary`   | `color.icon.primary`   |
| disabled | 220×32 |                        |        |                        | `color.text.secondary` | `color.icon.secondary` |

### Issues detected

- Component description is empty.

## Component: Section Nav Group Header

### Props

| Prop    | Type | Options / default |
| ------- | ---- | ----------------- |
| `label` | text | default `Label`   |

### Anatomy (default variant)

- **Section Nav Group Header** · component · row gap 0 pad 0/8/0/8 FIXED/FIXED · 220×32  
  padding `inset.xs`
  - **Label** · text `title/2xs` "Label" · FILL/HUG · 204×9  
    fill `color.text.tertiary` · lineHeight `type.line-height.title.2xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.2xs` · fontStyle `type.font-weight.500` · prop characters←label

### Tokens used

| Role            | Tokens                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------- |
| Text color      | `color.text.tertiary`                                                                                 |
| Spacing         | `inset.xs`                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.2xs`, `type.size.title.2xs` |
| Text styles     | `title/2xs`                                                                                           |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop    |
| ----- | ------------------- | ------- |
| Label | characters          | `label` |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A single item in a vertical settings / section nav rail. Selectable, indicates the current section. Part of the Section Nav pattern — not a top-level app nav item.

**Anatomy**

Optional leading icon · label · optional trailing count / badge · active indicator (left bar or surface tint).

**Variants**

with / without icon; with / without trailing badge. Density comfortable or compact.

**States**

default, hover, focus, disabled, selected. selected maps to aria-current=page and uses tint + indicator, not colour alone.

**Accessibility**

Render as a link or button in a nav list. Mark the current item with aria-current=page. Focus ring visible; hit area ≥44 (comfortable). Label ≥4.5:1.

**Rules**

Mark current with aria-current  
Keep labels short  
Use tint + indicator for selected  
Group under a heading

Use for primary app nav  
Rely on colour alone for selected  
Truncate mid-word  
Nest more than one level
