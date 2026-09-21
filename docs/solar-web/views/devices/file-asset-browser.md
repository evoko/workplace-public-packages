# File & Asset Browser

> SOLAR Web · Figma page `↳ 🟢 File & Asset Browser ` (id `3772:3`) · section `views/devices` · raw data: [`raw/views/devices/file-asset-browser.json`](../../raw/views/devices/file-asset-browser.json)

## Component set: File & Asset Browser

### Props

| Prop         | Type    | Options / default           |
| ------------ | ------- | --------------------------- |
| `breakpoint` | variant | **desktop** · mobile        |
| `view`       | variant | **grid** · list · templates |

Default variant: `breakpoint=desktop, view=grid` · 6 variants · default size 1368×744px

### Anatomy (default variant)

- **breakpoint=desktop, view=grid** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1368×744  
  fill `color.surface.base`
  - **Page Header** · instance of **Page Header** (type=left-aligned, breakpoint=desktop) · column gap 0 pad 8/24/0/24 FILL/HUG · 1368×99  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.none` · padding `inset.xl`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Content** · frame · column gap 16 pad 16/40/24/40 FILL/FILL · 1368×645  
    itemSpacing `stack.md`
    - **TableHeader** · instance of **TableHeader** (breakpoint=desktop) · row gap 0 pad 8/0/8/0 FIXED/HUG · 1280×56  
      padding `stack.none`, `inset.xs` · strokeWeight `border.default`
    - **Grid** · frame · grid gap 0 pad 0/0/0/0 FIXED/FIXED · 1280×698  
      itemSpacing `stack.md` · counterAxisSpacing `stack.md`
      - **File Card** · instance of **File Card** (type=New Asset Tile) · column gap 12 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `stack.sm` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
      - **File Card** · instance of **File Card** (type=File Card) · column gap 0 pad 0/0/0/0 FILL/FILL · 308×222  
        fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`                                                                                                                                                                                                                                            |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                           |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.neutral.900`                                                      |
| Spacing      | `inset.none`, `inset.xl`, `inset.xs`, `stack.md`, `stack.none`, `stack.sm`                                                                                                                                                                                      |
| Radius       | `radius.container`                                                                                                                                                                                                                                              |
| Border width | `border.default`                                                                                                                                                                                                                                                |
| Effects      | `shadow/raised`                                                                                                                                                                                                                                                 |

### Composes

- File Card
- Page Header
- TableHeader

### Variant matrix

| breakpoint | view      | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                   | icon                                                                                                                                                                                          |
| ---------- | --------- | -------- | -------------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | grid      | 1368×744 | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.neutral.900`                |
| mobile     | grid      | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.icon.tertiary`               |
| desktop    | list      | 1368×744 | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.neutral.900`                                         |
| mobile     | list      | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.neutral.900`<br>`color.action.primary.icon.default` |
| desktop    | templates | 1368×744 | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`                               | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.neutral.900`                |
| mobile     | templates | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary`<br>`color.action.primary.text.default`<br>`color.text.inverse`<br>`color.text.feedback.neutral`               | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.icon.tertiary`<br>`color.neutral.900`                                                        |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded paddingTop `16px` on layer _Content_
- Hard-coded paddingRight `40px` on layer _Content_
- Hard-coded paddingBottom `24px` on layer _Content_
- Hard-coded paddingLeft `40px` on layer _Content_

## Compositions and examples on this page

### Modal · New design (instance of Dialog, 600×244)

Uses: Icon/None ×4, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Icon/Plus ×1, Icon/Image ×1, Icon/Folder ×1, Button Group ×1

- **Modal · New design** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 600×244  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

### Modal · Select a template (instance of Dialog, 744×602)

Uses: Icon/Image ×6, Tag ×5, Icon/None ×4, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Button Group ×1

- **Modal · Select a template** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 744×602  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

### Modal · Design details (instance of Dialog, 480×350)

Uses: Icon/None ×6, Select ×2, Icon/ChevronDown ×2, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Text Input ×1, Button Group ×1

- **Modal · Design details** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 480×350  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

### Modal · Export design (instance of Dialog, 480×360)

Uses: Icon/None ×4, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Icon/Folder ×1, Icon/Image ×1, Button Group ×1

- **Modal · Export design** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 480×360  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

### Modal · Request a quote (instance of Dialog, 480×498)

Uses: Icon/None ×12, Text Input ×4, Button ×2, Spinner ×2, Counter ×2, Dialog ×1, Icon/Empty ×1, Icon Button ×1, Icon/Close ×1, Select ×1, Icon/ChevronDown ×1, Button Group ×1

- **Modal · Request a quote** · instance of **Dialog** (type=default) · column gap 0 pad 0/0/0/0 FIXED/HUG · 480×498  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

## Documentation card

**Description**

Browse, preview and manage files / assets in folders — a grid or list of File Cards with actions. For content and asset management.

**Layout**

Toolbar (view toggle · sort · upload · search) · breadcrumb path · File Card grid / list · optional preview (Detail Side Panel) · bulk-actions bar.

**Responsive**

Desktop grid + optional preview panel; mobile list, preview full-screen.

**States**

loaded, loading (skeletons), empty (upload prompt), no-results, error, uploading (progress).

**Accessibility**

Files are labelled focusable items; selection announced; upload progress via aria-live; breadcrumb is a nav landmark. Keyboard-complete.

**Rules**

Show the path (breadcrumb)  
Offer grid + list  
Support multi-select + bulk  
Show upload progress

Rely on thumbnail alone  
Hide file type  
Lose selection on navigation  
Block keyboard selection
