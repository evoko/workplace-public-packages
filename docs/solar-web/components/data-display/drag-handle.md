# Drag Handle

> SOLAR Web · Figma page `↳ 🟢 Drag Handle` (id `4533:82`) · section `components/data-display` · raw data: [`raw/components/data-display/drag-handle.json`](../../raw/components/data-display/drag-handle.json)

## Component set: DragHandle

Grip affordance that marks a row or card as draggable for reordering. 10 variants: size (sm, md) × state (default, hover, focus, pressed, disabled); pressed is the grabbing state. Glyph binds icon/secondary; hit area ≥24px, padded to 44×44 on touch. Not a button — pair with keyboard reordering (Space to lift, arrows to move, Space to drop) and aria-label "Reorder".

### Props

| Prop    | Type    | Options / default                                |
| ------- | ------- | ------------------------------------------------ |
| `size`  | variant | **sm** · md                                      |
| `state` | variant | **default** · hover · focus · disabled · pressed |

Default variant: `size=sm, state=default` · 10 variants · default size 26×33px

### Anatomy (default variant)

- **size=sm, state=default** · component · row gap 4 pad 8/8/8/8 HUG/HUG · 26×33  
  itemSpacing `stack.2xs` · padding `inset.xs` · radius `radius.control`
  - **Col1** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 3×17  
    itemSpacing `stack.2xs`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`
  - **Col2** · frame · column gap 4 pad 0/0/0/0 HUG/HUG · 3×17  
    itemSpacing `stack.2xs`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`
    - **Dot** · ellipse · FIXED/FIXED · 3×3  
      fill `color.icon.secondary`

### Tokens used

| Role    | Tokens                  |
| ------- | ----------------------- |
| Fills   | `color.icon.secondary`  |
| Spacing | `inset.xs`, `stack.2xs` |
| Radius  | `radius.control`        |
| Effects | `shadow/focus/default`  |

### Variant matrix

| size | state    | size  | fill | stroke | effect                 | text | icon |
| ---- | -------- | ----- | ---- | ------ | ---------------------- | ---- | ---- |
| sm   | default  | 26×33 |      |        |                        |      |      |
| sm   | hover    | 26×33 |      |        |                        |      |      |
| sm   | pressed  | 26×33 |      |        |                        |      |      |
| sm   | focus    | 26×33 |      |        | `shadow/focus/default` |      |      |
| sm   | disabled | 26×33 |      |        |                        |      |      |
| md   | default  | 28×36 |      |        |                        |      |      |
| md   | hover    | 28×36 |      |        |                        |      |      |
| md   | pressed  | 28×36 |      |        |                        |      |      |
| md   | focus    | 28×36 |      |        | `shadow/focus/default` |      |      |
| md   | disabled | 28×36 |      |        |                        |      |      |

## Documentation card

**Description**

A grab affordance marking an element as draggable for reordering. Pairs with sortable list rows, table rows and cards — it is not a button.

**Anatomy**

Grip glyph (dots) · hit area ≥ the visible glyph · optional hover surface.

**Placement & Size**

Sits at the leading or trailing edge of the draggable row. Hit area ≥24px, padded to 44×44 on touch. Glyph uses icon.secondary.

**States**

default, hover (surface.hover), grabbing (cursor: grabbing). Does not toggle or hold a selected state.

**Accessibility**

Expose reordering by keyboard (Space to lift, arrows to move, Space to drop) — the handle alone is not enough. aria-label "Reorder"; glyph ≥3:1 vs surface.

**Rules**

Pair with keyboard reordering  
Keep a large hit area  
Use icon.secondary for the glyph  
Show grab / grabbing cursors

Make it the only way to reorder  
Shrink below 24px  
Use on non-draggable rows  
Rely on hover to reveal on touch
