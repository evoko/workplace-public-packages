# Tooltip

> SOLAR Web · Figma page `↳ 🟢 Tooltip` (id `2163:3685`) · section `components/overlays` · raw data: [`raw/components/overlays/tooltip.json`](../../raw/components/overlays/tooltip.json)

## Component set: Tooltip

Brief contextual label shown on hover or keyboard focus. Size sm for icon-button labels; md for multi-word descriptions. Position top is default; use right/bottom/left only when top would clip the viewport. Max 1 line (sm) or ~10 words (md). Show after ~500ms hover delay. Never trap focus or hold interactive content — use Popover for that. Pair with aria-describedby on the trigger element.

### Props

| Prop              | Type    | Options / default               |
| ----------------- | ------- | ------------------------------- |
| `size`            | variant | **sm** · md                     |
| `position`        | variant | **top** · right · bottom · left |
| `content`         | text    | default `Label`                 |
| `Tooltip Content` | slot    | default `[object Object]`       |

Default variant: `size=sm, position=top` · 8 variants · default size 47×25px

### Anatomy (default variant)

- **size=sm, position=top** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 47×25
  - **Tooltip Content** · slot · row gap 0 pad 8/8/8/8 HUG/HUG · 47×25  
    fill `color.surface.inverse` · padding `inset.xs` · radius `radius.control` · prop slotContentId←Tooltip Content
    - **Content** · text `body/sm/medium` "Label" · HUG/HUG · 31×9  
      fill `color.text.inverse` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500` · prop characters←content
  - **arrow** · vector · FIXED/FIXED · 7×3  
    fill `color.surface.inverse` · effect `shadow/raised`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`                                                                           |
| Text color      | `color.text.inverse`                                                                              |
| Icon color      | `color.surface.inverse`                                                                           |
| Spacing         | `inset.xs`                                                                                        |
| Radius          | `radius.control`                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm` |
| Effects         | `shadow/raised`                                                                                   |
| Text styles     | `body/sm/medium`                                                                                  |

### Slots and prop-controlled layers

| Layer                     | Controlled property | Prop              |
| ------------------------- | ------------------- | ----------------- |
| Tooltip Content           | slotContentId       | `Tooltip Content` |
| Tooltip Content › Content | characters          | `content`         |

### Variant matrix

| size | position | size  | fill | stroke | effect | text                 | icon |
| ---- | -------- | ----- | ---- | ------ | ------ | -------------------- | ---- |
| sm   | top      | 47×25 |      |        |        | `color.text.inverse` |      |
| md   | top      | 60×34 |      |        |        | `color.text.inverse` |      |
| sm   | right    | 47×25 |      |        |        | `color.text.inverse` |      |
| md   | right    | 60×34 |      |        |        | `color.text.inverse` |      |
| sm   | bottom   | 47×25 |      |        |        | `color.text.inverse` |      |
| md   | bottom   | 60×34 |      |        |        | `color.text.inverse` |      |
| sm   | left     | 47×25 |      |        |        | `color.text.inverse` |      |
| md   | left     | 60×34 |      |        |        | `color.text.inverse` |      |

## Documentation card

**Description**

Brief contextual label shown on hover or keyboard focus. Never interactive — for interactive overlays use Popover.

**Sizes**

sm Icon-button labels and single-word descriptors.  
md Multi-word descriptions, up to ~10 words.

**Position**

top Default. Use unless it clips.  
bottom When top clips or anchor sits near top edge.  
left When bottom and top clip (rare).  
right Same — flip when needed.

**Timing**

Show after 500ms hover delay.  
Hide immediately on pointer leave or focus loss.  
Show instantly on keyboard focus (no delay).

**Labels & Content**

1 line (sm) or ~10 words (md).  
No links, no buttons, no interactive content.  
Pair with aria-describedby on the trigger.

**Rules**

- DO: Use for icon-button labels
- DO: Show instantly on keyboard focus
- DO: Keep content under 10 words
- DO: Pair aria-describedby with trigger

- DON'T: Put links or buttons inside
- DON'T: Use as the sole source of critical info
- DON'T: Override with custom long delays
- DON'T: Nest tooltips on tooltips
