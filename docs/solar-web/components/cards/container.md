# Container

> SOLAR Web · Figma page `↳ 🟢 Container` (id `2202:1218`) · section `components/cards` · raw data: [`raw/components/cards/container.json`](../../raw/components/cards/container.json)

## Component set: Container

ROLE: sibling primitive (non-card).

A non-card layout region. Groups related content inside a larger surface (typically a Card Body, a Dialog body, or a page region) with an optional header (Title + Description) and a content slot.

ANATOMY
Vertical auto-layout with TextGroup (Title + Description) + Content slot.

VARIANT PROPERTIES
• type — default (no paint, no border; pure semantic grouping), outlined (surface/raised + border/subtle + radius/container).

COMPOSITION CONTRACT
Sibling to Card, not a child. Container deliberately does not render a shadow and does not participate in interaction. Lives in the same Figma section because consumers search for "container-ish" things together, not because Container extends Card.

TAXONOMY NOTE (2026-04-21)
Taxonomy specifies "outlined has no shadow." Current outlined variant has shadow/control attached via effect style — re-point blocked pending owner call.

OPEN DECISION (Anatoliy)
Open Decision #1: collapse outlined into Card as elevation=none; Container keeps default-only. Engineering concurs. Pending owner sign-off.

IS NOT
• Not a Card without shadow (taxonomy intent — see Open Decision #1).
• Not interactive.
• Not nestable as Card's body replacement (use Card's slots).

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `type`    | variant | **default** · outlined    |
| `content` | slot    | default `[object Object]` |

Default variant: `type=default` · 2 variants · default size 440×112px

### Anatomy (default variant)

- **type=default** · component · column gap 16 pad 16/16/16/16 FIXED/HUG · 440×112  
  itemSpacing `stack.md` · padding `inset.md` · radius `radius.dialog`
  - **content** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 408×80  
    prop slotContentId←content

### Tokens used

| Role    | Tokens                 |
| ------- | ---------------------- |
| Fills   | `color.surface.raised` |
| Strokes | `color.border.subtle`  |
| Spacing | `inset.md`, `stack.md` |
| Radius  | `radius.dialog`        |
| Effects | `shadow/overlay`       |

### Slots and prop-controlled layers

| Layer   | Controlled property | Prop      |
| ------- | ------------------- | --------- |
| content | slotContentId       | `content` |

### Variant matrix

| type     | size    | fill                   | stroke                | effect           | text | icon |
| -------- | ------- | ---------------------- | --------------------- | ---------------- | ---- | ---- |
| default  | 440×112 |                        |                       |                  |      |      |
| outlined | 440×112 | `color.surface.raised` | `color.border.subtle` | `shadow/overlay` |      |      |

## Documentation card

**Description**

A layout wrapper that groups related content with an optional header (title + description) and action slot. Use for form sections, settings groups, and content regions across all products.

**Variants**

default Transparent background, no border. Groups content semantically with a header.  
outlined Raised surface with subtle border and shadow. Use when the section needs visual separation from its surroundings.

**Anatomy**

Header row with title, optional description, and optional trailing action.  
Content slot below for any child content.  
Both header and content use auto-layout for flexible sizing.

**Rules**

- DO: Use for grouping related form fields
- DO: Use outlined variant when visual separation is needed
- DO: Keep title concise — one line
- DO: Use the action slot for section-level controls

- DON'T: Nest containers more than one level deep
- DON'T: Use outlined variant inside a Card (double border)
- DON'T: Hide both title and description — use a plain frame instead
- DON'T: Use as a clickable element — it's a layout wrapper
