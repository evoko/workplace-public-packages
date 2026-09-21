# Skeleton

> SOLAR Web · Figma page `↳ 🟢 Skeleton` (id `2163:3680`) · section `components/feedback` · raw data: [`raw/components/feedback/skeleton.json`](../../raw/components/feedback/skeleton.json)

## Component set: Skeleton

Loading placeholder that mirrors the shape of incoming content. Types: text (lines), circle (avatars), rectangular (cards, thumbnails, tables). Sizes sm/md/lg match the final content dimensions. Animate with a subtle shimmer or pulse. Show only when content will appear within ~1s; use Spinner or ProgressBar for longer waits. Pair with aria-busy=true on the wrapping region. See also: ProgressBar for determinate loading, Spinner for short waits.

### Props

| Prop   | Type    | Options / default               |
| ------ | ------- | ------------------------------- |
| `type` | variant | **text** · circle · rectangular |
| `size` | variant | **sm** · md · lg                |

Default variant: `type=text, size=sm` · 9 variants · default size 120×12px

### Anatomy (default variant)

- **type=text, size=sm** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 120×12  
  fill `color.surface.muted` · radius `radius.control`

### Tokens used

| Role   | Tokens                |
| ------ | --------------------- |
| Fills  | `color.surface.muted` |
| Radius | `radius.control`      |

### Variant matrix

| type        | size | size    | fill                  | stroke | effect | text | icon |
| ----------- | ---- | ------- | --------------------- | ------ | ------ | ---- | ---- |
| text        | sm   | 120×12  | `color.surface.muted` |        |        |      |      |
| text        | md   | 200×16  | `color.surface.muted` |        |        |      |      |
| text        | lg   | 280×20  | `color.surface.muted` |        |        |      |      |
| circle      | sm   | 24×24   | `color.surface.muted` |        |        |      |      |
| circle      | md   | 32×32   | `color.surface.muted` |        |        |      |      |
| circle      | lg   | 40×40   | `color.surface.muted` |        |        |      |      |
| rectangular | sm   | 120×80  | `color.surface.muted` |        |        |      |      |
| rectangular | md   | 200×120 | `color.surface.muted` |        |        |      |      |
| rectangular | lg   | 320×180 | `color.surface.muted` |        |        |      |      |

## Documentation card

**Description**

Loading placeholder that mirrors the shape of incoming content. Show only when content will appear within ~1s.

**Types**

text Horizontal line. Use for paragraphs, labels, table cells.  
circle For avatars and circular icons.  
rectangular For cards, thumbnails, and image containers.

**Sizes**

sm Small inline elements (chip, row metadata).  
md Body text, cards, standard thumbnails.  
lg Hero images, large cards, dashboard tiles.

**Motion & A11y**

Animate with a subtle shimmer or pulse — never a hard flash.  
Pair aria-busy=true on the wrapping region.  
Respect prefers-reduced-motion: fall back to a static placeholder.

**Rules**

- DO: Match shape and size of final content
- DO: Use for loads expected within ~1s
- DO: Pair aria-busy on the wrapping region
- DO: Respect prefers-reduced-motion

- DON'T: Use for indeterminate long loads (use ProgressBar)
- DON'T: Stack skeletons without layout hierarchy
- DON'T: Animate at high contrast — stay subtle
- DON'T: Replace error or empty states with Skeleton
