# Search

> SOLAR Web · Figma page `↳ 🟢 Search` (id `2163:3703`) · section `components/inputs` · raw data: [`raw/components/inputs/search.json`](../../raw/components/inputs/search.json)

## Component set: SearchField

Local search field for filtering an in-page list or table. 12 variants: size (sm, md) × state (default, hover, focus, filled, error, disabled). Trailing clear affordance (×) when filled. Live-filter on input (debounced); result count announced via aria-live. For global product-wide search use GlobalSearch.

### Props

| Prop        | Type    | Options / default                                       |
| ----------- | ------- | ------------------------------------------------------- |
| `state`     | variant | error · **default** · hover · focus · filled · disabled |
| `size`      | variant | **md** · sm                                             |
| `hasFilter` | boolean | default `true`                                          |

Default variant: `state=default, size=md` · 12 variants · default size 240×40px

### Anatomy (default variant)

- **state=default, size=md** · component · row gap 12 pad 0/12/0/12 FIXED/FIXED · 240×40  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/Search** · instance of **Icon/Search** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`
  - **Search** · text `body/md/regular` "Search" · FILL/HUG · 160×10  
    fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Icon/Filter** · instance of **Icon/Filter** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm` · prop visible←hasFilter

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`                                                                                                      |
| Strokes         | `color.border.feedback.danger.strong`, `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle` |
| Text color      | `color.text.disabled`, `color.text.primary`, `color.text.secondary`                                                       |
| Icon color      | `color.icon.disabled`, `color.icon.primary`, `color.icon.secondary`                                                       |
| Spacing         | `inset.none`, `inset.sm`                                                                                                  |
| Radius          | `radius.control`                                                                                                          |
| Border width    | `border.default`                                                                                                          |
| Sizes           | `icon.sm`                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.md`, `type.size.body.md`                         |
| Effects         | `shadow/control`, `shadow/danger`, `shadow/focus/default`                                                                 |
| Text styles     | `body/md/regular`                                                                                                         |

### Slots and prop-controlled layers

| Layer       | Controlled property | Prop        |
| ----------- | ------------------- | ----------- |
| Icon/Filter | visible             | `hasFilter` |

### Composes

- Icon/Filter
- Icon/Search

### Variant matrix

| state    | size | size   | fill                 | stroke                                | effect                 | text                   | icon                                           |
| -------- | ---- | ------ | -------------------- | ------------------------------------- | ---------------------- | ---------------------- | ---------------------------------------------- |
| default  | md   | 240×40 | `color.surface.base` | `color.border.subtle`                 | `shadow/control`       | `color.text.secondary` | `color.icon.secondary`                         |
| default  | sm   | 200×32 | `color.surface.base` | `color.border.subtle`                 |                        | `color.text.secondary` | `color.icon.secondary`                         |
| hover    | md   | 240×40 | `color.surface.base` | `color.border.medium`                 | `shadow/control`       | `color.text.secondary` | `color.icon.secondary`<br>`color.icon.primary` |
| hover    | sm   | 200×32 | `color.surface.base` | `color.border.medium`                 |                        | `color.text.secondary` | `color.icon.secondary`<br>`color.icon.primary` |
| filled   | md   | 240×40 | `color.surface.base` | `color.border.subtle`                 | `shadow/control`       | `color.text.primary`   | `color.icon.primary`                           |
| filled   | sm   | 200×32 | `color.surface.base` | `color.border.subtle`                 |                        | `color.text.primary`   | `color.icon.primary`                           |
| focus    | md   | 240×40 | `color.surface.base` | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`   | `color.icon.primary`                           |
| focus    | sm   | 200×32 | `color.surface.base` | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`   | `color.icon.primary`                           |
| error    | md   | 240×40 | `color.surface.base` | `color.border.feedback.danger.strong` | `shadow/danger`        | `color.text.primary`   | `color.icon.primary`                           |
| error    | sm   | 200×32 | `color.surface.base` | `color.border.feedback.danger.strong` | `shadow/danger`        | `color.text.primary`   | `color.icon.primary`                           |
| disabled | md   | 240×40 | `color.surface.base` | `color.border.subtle`                 | `shadow/control`       | `color.text.disabled`  | `color.icon.disabled`                          |
| disabled | sm   | 200×32 | `color.surface.base` | `color.border.subtle`                 |                        | `color.text.disabled`  | `color.icon.disabled`                          |

## Component set: GlobalSearch

Global product-wide search entry, usually in the app header. 10 variants: size (sm, md) × state (default, hover, focus, filled, error). Opens a command-palette / global-search overlay when activated; the field itself is a trigger. Keyboard shortcut: ⌘K or / (product decides; document in-place via Kbd). For scoped local filter use SearchField.

### Props

| Prop    | Type    | Options / default                            |
| ------- | ------- | -------------------------------------------- |
| `state` | variant | error · **default** · hover · focus · filled |
| `size`  | variant | **md** · sm                                  |

Default variant: `state=default, size=md` · 10 variants · default size 240×40px

### Anatomy (default variant)

- **state=default, size=md** · component · row gap 12 pad 0/12/0/12 FIXED/FIXED · 240×40  
  fill `color.surface.background` · stroke `color.border.subtle` 1px · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/Search** · instance of **Icon/Search** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`
  - **Search Workplace** · text `body/md/regular` "Search Workplace" · FILL/HUG · 148×10  
    fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Kbd** · instance of **Kbd** (type=default) · row gap 0 pad 4/4/4/4 HUG/HUG · 28×17  
    fill `color.surface.feedback.neutral.strong` · stroke `color.border.subtle` 1px · itemSpacing `inset.none` · padding `inset.2xs` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`, `color.surface.feedback.neutral.strong`                                 |
| Strokes         | `color.border.feedback.danger.strong`, `color.border.feedback.focus.strong`, `color.border.medium`, `color.border.subtle` |
| Text color      | `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`                                 |
| Icon color      | `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                                                       |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`                                                                                     |
| Radius          | `radius.control`                                                                                                          |
| Border width    | `border.default`                                                                                                          |
| Sizes           | `icon.sm`                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.line-height.body.md`, `type.size.body.md`                         |
| Effects         | `shadow/danger`, `shadow/focus/default`                                                                                   |
| Text styles     | `body/md/regular`                                                                                                         |

### Composes

- Icon/Search
- Kbd

### Variant matrix

| state   | size | size   | fill                       | stroke                                | effect                 | text                                           | icon                   |
| ------- | ---- | ------ | -------------------------- | ------------------------------------- | ---------------------- | ---------------------------------------------- | ---------------------- |
| default | md   | 240×40 | `color.surface.background` | `color.border.subtle`                 |                        | `color.text.tertiary`<br>`color.text.inverse`  | `color.icon.tertiary`  |
| default | sm   | 200×32 | `color.surface.background` | `color.border.subtle`                 |                        | `color.text.tertiary`<br>`color.text.inverse`  | `color.icon.tertiary`  |
| hover   | md   | 240×40 | `color.surface.base`       | `color.border.medium`                 |                        | `color.text.secondary`<br>`color.text.inverse` | `color.icon.secondary` |
| hover   | sm   | 200×32 | `color.surface.base`       | `color.border.medium`                 |                        | `color.text.secondary`<br>`color.text.inverse` | `color.icon.secondary` |
| filled  | md   | 240×40 | `color.surface.base`       | `color.border.subtle`                 |                        | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |
| filled  | sm   | 200×32 | `color.surface.base`       | `color.border.subtle`                 |                        | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |
| focus   | md   | 240×40 | `color.surface.base`       | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |
| focus   | sm   | 200×32 | `color.surface.base`       | `color.border.feedback.focus.strong`  | `shadow/focus/default` | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |
| error   | md   | 240×40 | `color.surface.base`       | `color.border.feedback.danger.strong` | `shadow/danger`        | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |
| error   | sm   | 200×32 | `color.surface.base`       | `color.border.feedback.danger.strong` | `shadow/danger`        | `color.text.primary`<br>`color.text.inverse`   | `color.icon.primary`   |

## Documentation card

**Description**

Two search primitives. SearchField is a local filter for an in-page list or table — live-filters on input. GlobalSearch is the header-level entry for product-wide search; activating it opens a command-palette overlay. Use the pair so the scope is obvious from placement.

**When to use which**

SearchField Use above a list, table, or scoped result set. Filters that list only. Debounce ~150-250ms.  
GlobalSearch Use in the app header for product-wide search. Opens a command palette / search overlay; the field is the trigger, not where results render.

**States**

Both: default, hover, focus, error.  
Error applies when the search input itself is invalid (unterminated quote, invalid operator) — not when there are zero results. Zero results is an empty state on the result list, not an error on the field.

**Accessibility**

Render as `<input type="search">` with a real `<label>` or aria-label. Result count announced via aria-live="polite". Trailing clear × has aria-label="Clear search". GlobalSearch: the shortcut hint is visible (Kbd) and exposed via aria-keyshortcuts. Esc clears the field or closes the palette.

**Rules**

Do  
• Debounce live filtering (~150-250ms)  
• Show clear × when filled  
• Announce result count via aria-live  
• Show the keyboard shortcut for GlobalSearch

Don't  
• Don't require Enter to search — live filter is better  
• Don't show error for zero results — that's an empty state  
• Don't nest SearchField inside a scope it can't actually filter  
• Don't duplicate SearchField + GlobalSearch adjacently
