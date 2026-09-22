# Announcements / What's New

> SOLAR Web · Figma page `↳ 🟢 Announcements / What's New` (id `5066:15`) · section `views/communications` · raw data: [`raw/views/communications/announcements.json`](../../raw/views/communications/announcements.json)

## Component set: Announcements / What's New

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×637px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/32/0 FIXED/HUG · 1368×637
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×133  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Content** · frame · column gap 16 pad 24/0/0/0 FIXED/HUG · 680×472  
    itemSpacing `stack.md` · padding `inset.xl`
    - **Announcement Card** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 680×100  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Announcement Card** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 680×100  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Announcement Card** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 680×100  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Announcement Card** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 680×100  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Fills        | `color.surface.base`                                                                                                                                                                                                                                                     |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                                                                    |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.feedback.warning`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                           |
| Spacing      | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`                                                                                                                                                                         |
| Radius       | `radius.container`                                                                                                                                                                                                                                                       |
| Border width | `border.default`                                                                                                                                                                                                                                                         |
| Effects      | `shadow/raised`                                                                                                                                                                                                                                                          |

### Composes

- Card
- Page Header

### Variant matrix

| breakpoint | size     | fill | stroke | effect | text                                                                                                                                                                                                                                                                                     | icon                                                                                                                           |
| ---------- | -------- | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×637 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.warning`<br>`color.text.feedback.neutral` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |
| mobile     | 377×775  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.text.feedback.warning`<br>`color.text.feedback.neutral`                                          | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`                                         |

### Issues detected

- Component description is empty.
- Hard-coded paddingBottom `32px` on layer _breakpoint=desktop_

## Documentation card

**Description**

Broadcast product news, releases and tips to users — a one-to-many feed distinct from personal notifications. For release notes and highlights.

**Layout**

Feed of announcement cards (title · summary · media · date · optional CTA) · optional categories · 'new' markers.

**Responsive**

Desktop card list / grid; mobile stacked cards.

**States**

loaded, loading, empty, unseen markers, error.

**Accessibility**

Cards as articles with headings; media has alt text; 'new' is text + marker, not colour alone. CTAs keyboard-reachable.

**Rules**

Lead with the benefit  
Date each item  
Mark unseen clearly  
Keep CTAs optional

Mix personal notifications here  
Auto-play media with sound  
Rely on colour for 'new'  
Overload with minor changes
