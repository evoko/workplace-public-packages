# Dashboard

> SOLAR Web · Figma page `↳ 🟢 Dashboard` (id `3768:4`) · section `views/generic` · raw data: [`raw/views/generic/dashboard.json`](../../raw/views/generic/dashboard.json)

## Component set: Dashboard

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `Property 1` | variant | **Desktop** · Mobile |

Default variant: `Property 1=Desktop` · 2 variants · default size 1368×1607px

### Anatomy (default variant)

- **Property 1=Desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×1607  
  fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.none`
  - **Page Header** · frame · column gap 0 pad 0/20/0/20 FILL/HUG · 1368×80  
    fill `color.surface.base` · stroke `color.border.surface` mixedpx · itemSpacing `stack.none` · padding `inset.lg`, `inset.none` · strokeWeight `border.default`
    - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1280×80
      - **TextStack** · frame · column gap 16 pad 20/0/20/0 FILL/HUG · 1280×80  
        itemSpacing `stack.md` · padding `stack.lg`
      - ~~**Image**~~ (hidden by default) · rectangle · FIXED/FIXED · 139×78  
        fill `IMAGE` ⚠️ hard-coded · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.control`
    - ~~**Tabs**~~ (hidden by default) · instance of **Tabs** (size=md) · row gap 0 pad 0/0/0/0 FIXED/HUG · 1280×40  
      padding `inset.none` · strokeWeight `border.default`
  - **Container** · frame · column gap 28 pad 24/0/24/0 FILL/HUG · 1280×1527  
    itemSpacing `inset.2xl` · padding `stack.none`, `inset.xl`
    - **Container** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 1280×158
      - **Title** · text `title/sm` "Status" · HUG/HUG · 59×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1280×127  
        itemSpacing `stack.md` · padding `inset.none`
    - **Container** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 1280×445
      - **Title** · text `title/sm` "Needs Attention" · HUG/HUG · 147×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/FIXED · 1280×414  
        itemSpacing `stack.md` · padding `inset.none`
    - **Container** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 1280×404
      - **Title** · text `title/sm` "Predict & Contextualize" · HUG/HUG · 211×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1280×373  
        itemSpacing `stack.md` · padding `inset.none`
    - **Container** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 1280×388
      - **Title** · text `title/sm` "Live Pulse" · HUG/HUG · 91×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Container** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 1280×357  
        itemSpacing `stack.md` · padding `inset.none`

Instance census (tree capped at depth 3): Icon/None ×63, Column Item ×33, Bar ×21, Counter ×20, Trend Badge ×17, Button ×12, Spinner ×12, Icon/ChevronDown ×11, Icon/More ×9, Tab Item ×8, Row ×8, RowSelect ×8, Checkbox ×8, RowExpand ×8, Icon/ChevronRight ×6, Widget Card ×6, Segmented Control Item ×6, Dropdown ×4, Stat Card ×4, Insight Row ×4, Breadcrumb Item ×3, Card ×3, Tag ×3, Breadcrumbs ×1, Icon/Building ×1, Tabs ×1, Segmented Control ×1, Table ×1, Bar Chart ×1

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.raised`                                                                                                                                                                                                                                                                                                 |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                                                                                                                                                                                                |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.secondary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`                                                                                                                                                                                                               |
| Spacing         | `inset.2xl`, `inset.lg`, `inset.none`, `inset.xl`, `stack.lg`, `stack.md`, `stack.none`                                                                                                                                                                                                                                                      |
| Radius          | `radius.control`, `radius.none`                                                                                                                                                                                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`                                                                                                                                                                                                                                          |
| Text styles     | `title/sm`                                                                                                                                                                                                                                                                                                                                   |

### Composes

- Tabs

### Variant matrix

| Property 1 | size      | fill                   | stroke | effect | text                                                                                                                                                                                                                                                                                                                                                             | icon                                                                                                                                   |
| ---------- | --------- | ---------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Desktop    | 1368×1607 | `color.surface.raised` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.success`<br>`color.text.feedback.danger`<br>`color.text.feedback.info`<br>`color.action.tertiary.text.default`<br>`color.text.feedback.warning`<br>`color.text.feedback.neutral` | `color.icon.secondary`<br>`color.neutral.900`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.icon.inverse` |
| Mobile     | 377×2698  | `color.surface.raised` |        |        | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.text.tertiary`<br>`color.text.feedback.danger`<br>`color.text.feedback.info`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.action.tertiary.text.default`<br>`color.text.feedback.warning`<br>`color.text.feedback.neutral` | `color.action.secondary.icon.default`<br>`color.icon.secondary`<br>`color.icon.inverse`<br>`color.icon.primary`                        |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded gap `16px` on layer _Page Header › Container_
- Hard-coded gap `16px` on layer _Container › Container_
- Hard-coded gap `16px` on layer _Container › Container_
- Hard-coded gap `16px` on layer _Container › Container_
- Hard-coded gap `16px` on layer _Container › Container_

## Documentation card

**Description**

A composed overview page of widgets (stat cards, charts, tables) summarising a domain at a glance. A layout pattern; the pieces are Widget/Stat Card, charts, etc.

**Anatomy**

Page header + Time Range Selector · responsive widget grid · Widget / Stat Cards · charts · optional filters.

**Layout**

Responsive grid (e.g. 12-col) reflowing to fewer columns on smaller screens. Widgets share spacing / elevation tokens. Key metrics sit top-left.

**States**

loaded, loading (widget skeletons), empty (no data / not configured), error, partial (some widgets failed).

**Accessibility**

main landmark; each widget is a labelled region with a heading. Charts pair colour with labels + a table fallback. Logical heading order; keyboard-reachable controls.

**Rules**

Lead with the most important metric  
Use a responsive grid  
Give each widget a heading  
Handle per-widget loading / error

Cram in too many widgets  
Rely on colour alone in charts  
Let one failed widget break the page  
Fix a desktop-only layout
