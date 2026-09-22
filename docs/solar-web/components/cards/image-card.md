# Image Card

> SOLAR Web · Figma page `↳ 🟢 Image Card` (id `10395:3`) · section `components/cards` · raw data: [`raw/components/cards/image-card.json`](../../raw/components/cards/image-card.json)

## Component set: Image Card

Selectable thumbnail tile (image + title + metadata) with checkbox on hover/selected and a dashed create-new variant. Migrated from Chatter Config 2026-09-01.

### Props

| Prop       | Type    | Options / default |
| ---------- | ------- | ----------------- |
| `filled`   | variant | **true** · false  |
| `selected` | variant | **true** · false  |
| `hover`    | variant | **false** · true  |

Default variant: `filled=true, selected=true, hover=false` · 4 variants · default size 200×190px

### Anatomy (default variant)

- **filled=true, selected=true, hover=false** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 200×190  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
  - **Image** · frame · row gap 0 pad 8/8/8/8 FILL/FILL · 200×127  
    fill `color.surface.background` · padding `inset.xs`
    - **Checkbox** · instance of **Checkbox** (checked=true, disabled=false, hover=false, mixed=false, focus=false) · column gap 16 pad 0/0/0/0 FIXED/FIXED · 16×16  
      fill `color.action.primary.bg.default` · stroke `color.border.medium` 1px · itemSpacing `stack.md` · strokeWeight `border.default` · radius `radius.control`
  - **Text** · frame · column gap 12 pad 16/16/16/16 FILL/HUG · 200×63  
    itemSpacing `stack.sm` · padding `inset.md`
    - **Title** · text `label/md` "Title" · HUG/HUG · 29×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
    - **Icon** · vector · FIXED/FIXED · 3×14  
      fill `color.icon.secondary`
    - **Subtitle** · text `body/sm/regular` "Last modified: 2h ago" · FILL/HUG · 168×9  
      fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.surface.background`, `color.surface.base`                                                                                          |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                                                                                                 |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                 |
| Icon color      | `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`                                                                                                           |
| Spacing         | `inset.md`, `inset.xs`, `stack.md`, `stack.sm`                                                                                                                               |
| Radius          | `radius.container`, `radius.control`                                                                                                                                         |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.sm`, `type.line-height.label.md`, `type.size.body.sm`, `type.size.label.md` |
| Effects         | `shadow/raised`                                                                                                                                                              |
| Text styles     | `body/sm/regular`, `label/md`                                                                                                                                                |

### Composes

- Checkbox

### Variant matrix

| filled | selected | hover | size    | fill                 | stroke                | effect          | text                                           | icon                 |
| ------ | -------- | ----- | ------- | -------------------- | --------------------- | --------------- | ---------------------------------------------- | -------------------- |
| true   | true     | false | 200×190 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.inverse` |
| true   | false    | true  | 200×190 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` |                      |
| true   | false    | false | 200×190 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` |                      |
| false  | false    | false | 200×190 |                      | `color.border.medium` |                 | `color.text.primary`                           | `color.icon.primary` |

## Documentation card

**Description**

Selectable thumbnail tile with a title and metadata line. Used for visual entities such as floor plans and maps; the empty variant is a dashed create-new tile.

**Anatomy**

200×190 card on surface/base with radius/container and shadow/raised. Image area (surface/background + image fill) hosting a Checkbox when selectable; text area with label/md title, body/sm metadata and a more-menu glyph in icon/secondary.

**Variants & props**

filled (2) true · false — false is the dashed create-new tile  
selected (2) checkbox checked on the image  
hover (2) checkbox visible unchecked on the image

**Usage**

Show the checkbox only on hover or when selected.  
Keep titles to one line; metadata to one short line.  
Use the create-new tile as the last item of a grid.

**Rules**

- DO: Keep one aspect ratio across a grid
- DO: Use real content thumbnails when available
- DO: Route actions through the more menu

DON’T Mix filled and empty tiles mid-grid  
DON’T Put buttons inside the image area  
DON’T Use for list layouts (use Interactive Card)
