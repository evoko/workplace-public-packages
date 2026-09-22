# Help Center

> SOLAR Web · Figma page `↳ 🟢 Help Center` (id `6133:2`) · section `views/help` · raw data: [`raw/views/help/help-center.json`](../../raw/views/help/help-center.json)

## Component set: Help Center

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×747px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/64/0 FIXED/HUG · 1368×747
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×105  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Content** · frame · column gap 32 pad 20/0/0/0 FIXED/HUG · 640×578  
    padding `stack.lg`
    - **SearchField** · instance of **SearchField** (state=default, size=md) · row gap 12 pad 0/12/0/12 FILL/FIXED · 640×40  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
    - **Categories** · frame · grid gap 0 pad 0/0/0/0 FILL/HUG · 640×258  
      itemSpacing `inset.sm` · gridRowGap `stack.sm` · gridColumnGap `stack.sm`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/FIXED · 314×78  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Resources** · frame · row gap 12 pad 0/0/0/0 FILL/HUG · 640×196  
      itemSpacing `stack.sm`
      - **Popular** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 314×196  
        itemSpacing `inset.xs`
      - **Action Card** · instance of **Action Card** (status=default, state=default, layout=vertical) · column gap 16 pad 16/16/16/16 FILL/HUG · 314×146  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `stack.md` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`

Instance census (tree capped at depth 3): Icon/None ×48, Counter ×24, Button ×16, Spinner ×16, Tab Item ×8, Action Card ×7, Icon/More ×7, Icon/ChevronRight ×6, ListItem ×4, Icon/File ×4, Breadcrumb Item ×3, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tag ×1, StatusIndicator ×1, Tabs ×1, SearchField ×1, Icon/Search ×1, Icon/Filter ×1, Icon/Deploy ×1, Icon/Speaker ×1, Icon/Location ×1, Icon/Calendar ×1, Icon/Settings ×1, Icon/User ×1, Icon/HelpCircle ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills        | `color.surface.base`                                                                                                                                                           |
| Strokes      | `color.border.subtle`                                                                                                                                                          |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                       |
| Spacing      | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.md`, `stack.sm`                                                                               |
| Radius       | `radius.container`, `radius.control`                                                                                                                                           |
| Border width | `border.default`                                                                                                                                                               |
| Effects      | `shadow/control`                                                                                                                                                               |
| Other        | `gridColumnGap={Spatial:stack/sm}`, `gridRowGap={Spatial:stack/sm}`                                                                                                            |

### Composes

- Action Card
- Page Header
- SearchField

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                | icon                                                                                                                           |
| ---------- | -------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×747 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`#000000` ⚠️ hard-coded | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| mobile     | 377×843  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`#000000` ⚠️ hard-coded | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Hard-coded paddingBottom `64px` on layer _breakpoint=desktop_
- Hard-coded gap `32px` on layer _Content_

## Documentation card

**Description**

A browsable, searchable knowledge base of articles and guides — the static self-serve help hub. Conversational help lives in AI Assistant.

**Layout**

Search bar · category tiles · popular / featured articles · article list; article view (breadcrumb · body · related · feedback).

**Responsive**

Desktop two-column (nav + content); mobile stacked, search-first.

**States**

loaded, loading, empty, no-results (search), error; plus article-view states.

**Accessibility**

Search labelled; articles are headed regions; results announced; breadcrumb is a nav landmark. Keyboard-complete.

**Rules**

Lead with search  
Group by category  
Show popular + related  
Offer article feedback

Bury the search  
Dead-end on no-results  
Rely on colour for categories  
Mix in live chat
