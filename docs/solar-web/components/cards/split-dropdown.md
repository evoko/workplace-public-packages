# Split Dropdown

> SOLAR Web · Figma page `↳ 🟢 Split Dropdown` (id `10395:5`) · section `components/cards` · raw data: [`raw/components/cards/split-dropdown.json`](../../raw/components/cards/split-dropdown.json)

## Component: Split Dropdown

Two-zone slot container: plain top area + tinted lower strip. Pairs a primary control with supporting details. Migrated from Chatter Config 2026-09-01.

### Props

| Prop            | Type | Options / default         |
| --------------- | ---- | ------------------------- |
| `Top Content`   | slot | default `[object Object]` |
| `Lower Content` | slot | default `[object Object]` |

### Anatomy (default variant)

- **Split Dropdown** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 680×152  
  stroke `color.border.subtle` 1px · itemSpacing `stack.none` · padding `inset.none` · strokeWeight `border.default` · radius `radius.container`
  - **Top** · frame · column gap 8 pad 16/12/16/12 FILL/FIXED · 680×80  
    fill `color.surface.raised` · itemSpacing `inset.xs` · padding `inset.sm`, `inset.md`
    - **Top Content** · slot · row gap 0 pad 0/0/0/0 FILL/FILL · 656×48  
      prop slotContentId←Top Content
  - **Lower** · frame · column gap 8 pad 12/12/12/12 FILL/HUG · 680×72  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
    - **Lower Content** · slot · row gap 0 pad 0/0/0/0 FILL/HUG · 656×48  
      prop slotContentId←Lower Content

### Tokens used

| Role         | Tokens                                                         |
| ------------ | -------------------------------------------------------------- |
| Fills        | `color.surface.background`, `color.surface.raised`             |
| Strokes      | `color.border.subtle`                                          |
| Spacing      | `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.none` |
| Radius       | `radius.container`                                             |
| Border width | `border.default`                                               |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop            |
| --------------------- | ------------------- | --------------- |
| Top › Top Content     | slotContentId       | `Top Content`   |
| Lower › Lower Content | slotContentId       | `Lower Content` |

## Documentation card

**Description**

Two-zone container: a plain top content area and a tinted lower strip, divided by the container border. Used to pair a primary control with supporting details (e.g. a device row above its firmware selector).

**Anatomy**

radius/container shell with border/subtle. Top area (inset/md · inset/sm padding) with a Top Content area; lower strip on surface/background (inset/sm padding) with a Lower Content area.

**Content areas**

Top Content and Lower Content are placeholder frames intended as slots — convert them to slots in Figma to accept per-instance content.

**Usage**

Put the primary object or control on top.  
Use the lower strip for secondary settings or metadata.  
Keep both zones single-purpose.

**Rules**

- DO: Keep the lower strip on surface/background
- DO: Fill zones through the content slots
- DO: Let height hug the content

DON’T Nest another split container inside  
DON’T Recolor the zones per feature  
DON’T Use as a dialog (use Dialog / Split Dialog)
