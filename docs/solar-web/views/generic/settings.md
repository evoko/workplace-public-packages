# Settings

> SOLAR Web · Figma page `↳ 🟢 Settings` (id `3768:9`) · section `views/generic` · raw data: [`raw/views/generic/settings.json`](../../raw/views/generic/settings.json)

## Component set: Settings

### Props

| Prop         | Type    | Options / default                                      |
| ------------ | ------- | ------------------------------------------------------ |
| `breakpoint` | variant | **desktop** · mobile                                   |
| `step`       | variant | billing · **general** · integrations · time & language |

Default variant: `breakpoint=desktop, step=general` · 8 variants · default size 1368×901px

### Anatomy (default variant)

- **breakpoint=desktop, step=general** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 1368×901  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×119  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×417  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×161  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×141  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes      | `color.border.subtle`, `color.border.surface`                                                                                                                                                                                                                                   |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.danger.default`, `color.action.secondary.text.default`, `color.text.disabled`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.disabled`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                      |
| Spacing      | `inset.lg`, `inset.none`, `inset.xs`, `stack.lg`, `stack.none`                                                                                                                                                                                                                  |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                                                                                               |
| Border width | `border.default`                                                                                                                                                                                                                                                                |

### Composes

- FormSection
- Page Header

### Variant matrix

| breakpoint | step            | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                                                            | icon                                                                                                                                                                                                                              |
| ---------- | --------------- | -------- | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | general         | 1368×901 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.disabled`<br>`color.action.secondary.text.danger.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.disabled`<br>`color.icon.tertiary`<br>`color.action.secondary.icon.danger.default`  |
| mobile     | general         | 377×890  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.text.feedback.info`<br>`color.text.disabled`<br>`color.action.secondary.text.danger.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.disabled`<br>`color.icon.tertiary`<br>`color.action.secondary.icon.danger.default` |
| desktop    | billing         | 1368×744 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`                                                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`                                                                           |
| mobile     | billing         | 377×744  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.text.feedback.info`                                                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.tertiary`                                                                          |
| desktop    | integrations    | 1368×744 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`                                                                                                        | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                                                                    |
| mobile     | integrations    | 377×744  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`                                                                                                        | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`                                                                                                   |
| desktop    | time & language | 1368×922 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.disabled`                                                 | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.disabled`                                                                           |
| mobile     | time & language | 377×1034 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.text.tertiary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default`<br>`color.text.feedback.info`<br>`color.text.disabled`                                                 | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.disabled`                                                                          |

### Issues detected

- Component description is empty.

## Documentation card

**Description**

The generic settings shell — a Section Nav rail plus a content panel that hosts specific settings pages (General, Security, etc.). The frame other settings views slot into.

**Layout**

Section Nav (settings groups) + content panel · page header · Form Rows / toggles · contextual save.

**Responsive**

Desktop nav + panel; mobile full-width list drilling into pages.

**States**

loaded, section-selected, editing, saving, saved, error.

**Accessibility**

Section Nav with aria-current; each settings page is a labelled region; save announced. Keyboard-complete; visible focus.

**Rules**

Use a consistent nav + panel  
Mark the active section  
Save per page with feedback  
Group logically

Invent per-page nav patterns  
Lose your place on save  
Deep-nest settings  
Rely on colour for the active item
