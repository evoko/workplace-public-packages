# Search Results

> SOLAR Web · Figma page `↳ 🟢 Search Results` (id `3768:13`) · section `views/generic` · raw data: [`raw/views/generic/search-results.json`](../../raw/views/generic/search-results.json)

## Component set: Search Results

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×745px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1368×745  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×105  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Container** · frame · column gap 0 pad 0/0/0/0 HUG/FILL · 640×584
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×127  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×107  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×107  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×107  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×127  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
    - **Search Results Item** · instance of **Search Results Item** · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×107  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
  - **Footer** · frame · row gap 0 pad 8/0/8/0 FILL/HUG · 1368×56  
    padding `stack.none`, `inset.xs`
    - **Container** · frame · row gap 242 pad 0/0/0/0 FILL/FIXED · 1280×40
      - **Showing 1–10 of 128** · text `body/md/regular` "Showing 1–10 of 128" · HUG/HUG · 129×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **Pagination** · instance of **Pagination** · row gap 8 pad 0/0/0/0 HUG/HUG · 216×24  
        itemSpacing `stack.xs`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                                                                                             |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                            |
| Spacing         | `inset.lg`, `inset.none`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`, `stack.xs`                                                                                                                                                    |
| Radius          | `radius.container`, `radius.none`                                                                                                                                                                                                         |
| Border width    | `border.default`                                                                                                                                                                                                                          |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.md`, `type.size.body.md`                                                                                                                                         |
| Text styles     | `body/md/regular`                                                                                                                                                                                                                         |

### Composes

- Page Header
- Pagination
- Search Results Item

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                    | icon                                                                                                                           |
| ---------- | -------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×745 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| mobile     | 377×745  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.text.feedback.info`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                         |

### Issues detected

- Component description is empty.
- Hard-coded gap `242px` on layer _Footer › Container_

## Component: Search Results Item

### Anatomy (default variant)

- **Search Results Item** · component · column gap 16 pad 16/0/16/0 FIXED/HUG · 640×127  
  stroke `color.border.surface` mixedpx · itemSpacing `stack.md` · padding `stack.none`, `stack.md` · strokeWeight `border.default`
  - **Container** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 283×24  
    itemSpacing `stack.sm`
    - **Title** · text `title/xs` "Title with label highlighted" · HUG/HUG · 189×12  
      fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
    - **Tag** · instance of **Tag** (status=info, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 82×24  
      fill `color.surface.feedback.info.subtle` · stroke `color.border.feedback.info.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
  - **Excerpt placeholder text with the label match highlighted inline. Two-line clamp keeps the row compact and scannable.** · text `body/md/regular` "Excerpt placeholder text with the label match highlighted inline. Two-line clamp" · FILL/HUG · 640×30  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Path / Location · Updated 2d ago · Author Name** · text `body/sm/medium` "Path / Location · Updated 2d ago · Author Name" · HUG/HUG · 299×9  
    fill `color.text.tertiary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.info.subtle`                                                                                                                                                                                          |
| Strokes         | `color.border.feedback.info.subtle`, `color.border.surface`                                                                                                                                                                   |
| Text color      | `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                                                                                                                                           |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `stack.md`, `stack.none`, `stack.sm`                                                                                                                                                   |
| Radius          | `radius.pill`                                                                                                                                                                                                                 |
| Border width    | `border.default`                                                                                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.xs`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.xs` |
| Text styles     | `body/md/regular`, `body/sm/medium`, `title/xs`                                                                                                                                                                               |

### Composes

- Tag

### Issues detected

- Component description is empty.

## Documentation card

**Description**

The results view for a global / scoped search — query summary, facets / filters and a ranked result list. In-context filtering uses Filter Panel.

**Layout**

Search bar (query) · Facet Groups / filters · result count + sort · result list (typed items) · pagination; empty / no-results states.

**Responsive**

Desktop facets + results two-column; mobile filters in a drawer, results full-width.

**States**

loaded, loading (skeletons), empty (no query), no-results (query), error, loading-more.

**Accessibility**

Result count in an aria-live region; results are a labelled list; facets grouped; sort labelled. Keyboard-complete; visible focus.

**Rules**

Echo the query  
Show result count + sort  
Offer facets / filters  
Handle no-results helpfully

Hide the query  
Dead-end on no-results  
Mix result types unlabelled  
Rely on colour for relevance
