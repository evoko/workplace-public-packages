# File Card

> SOLAR Web · Figma page `↳ 🟢 File Card` (id `9386:3`) · section `components/cards` · raw data: [`raw/components/cards/file-card.json`](../../raw/components/cards/file-card.json)

## Component set: File Card

Card for a single file or asset in a file-browser grid — type icon, name and meta line. 2 variants: type (File Card, New Asset Tile). File Card shows an existing item; New Asset Tile is the dashed add-new placeholder that opens the upload flow. Props: title, meta, label (text), fileIcon (instance swap). The whole card is one focusable control named by the file name. Not a generic content card — use Card for that.

### Props

| Prop       | Type          | Options / default              |
| ---------- | ------------- | ------------------------------ |
| `type`     | variant       | **File Card** · New Asset Tile |
| `title`    | text          | default `File name`            |
| `meta`     | text          | default `Edited just now`      |
| `fileIcon` | instance swap | default `10148:157`            |
| `label`    | text          | default `New design`           |

Default variant: `type=File Card` · 2 variants · default size 308×222px

### Anatomy (default variant)

- **type=File Card** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 308×222  
  fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · strokeWeight `border.default` · radius `radius.container`
  - **Thumbnail** · frame · row gap 0 pad 0/0/0/0 FILL/FILL · 308×163  
    fill `color.surface.background` · radius `radius.container`
    - **Icon/Image** · instance of **Icon/Image** (solid=false) · FIXED/FIXED · 24×24  
      width `icon.lg` · prop mainComponent←fileIcon
  - **Footer** · frame · row gap 8 pad 16/16/16/16 FILL/HUG · 308×59  
    itemSpacing `inset.xs` · padding `inset.md`
    - **Text** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 248×27  
      itemSpacing `stack.xs`
      - **File name** · text `body/md/medium` "File name" · FILL/HUG · 248×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500` · prop characters←title
      - **Edited just now** · text `body/sm/regular` "Edited just now" · FILL/HUG · 248×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop characters←meta
    - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
      height `icon.md`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.base`                                                                                                                           |
| Strokes         | `color.border.subtle`                                                                                                                                                      |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                               |
| Icon color      | `color.icon.primary`, `color.icon.tertiary`                                                                                                                                |
| Spacing         | `inset.md`, `inset.xs`, `stack.xs`                                                                                                                                         |
| Radius          | `radius.container`                                                                                                                                                         |
| Border width    | `border.default`                                                                                                                                                           |
| Sizes           | `icon.lg`, `icon.md`                                                                                                                                                       |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.size.body.md`, `type.size.body.sm` |
| Effects         | `shadow/raised`                                                                                                                                                            |
| Text styles     | `body/md/medium`, `body/sm/regular`                                                                                                                                        |

### Slots and prop-controlled layers

| Layer                           | Controlled property | Prop       |
| ------------------------------- | ------------------- | ---------- |
| Thumbnail › Icon/Image          | mainComponent       | `fileIcon` |
| Footer › Text › File name       | characters          | `title`    |
| Footer › Text › Edited just now | characters          | `meta`     |

### Composes

- Icon/Image
- Icon/More

### Variant matrix

| type           | size    | fill                 | stroke                | effect          | text                                           | icon                                          |
| -------------- | ------- | -------------------- | --------------------- | --------------- | ---------------------------------------------- | --------------------------------------------- |
| File Card      | 308×222 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`<br>`color.text.secondary` | `color.icon.tertiary`<br>`color.icon.primary` |
| New Asset Tile | 308×222 | `color.surface.base` | `color.border.subtle` | `shadow/raised` | `color.text.primary`                           | `color.icon.tertiary`                         |

## Documentation card

**Description**

A card representing a single file or asset — thumbnail, name, meta and optional actions. For file-browser grids and lists; not a generic content card.

**Anatomy**

Thumbnail / type icon · file name · meta (size · date · type) · optional selection control · optional overflow action.

**Variants**

layout=grid (thumbnail-forward) / row (compact). Selectable variant adds a Checkbox. Type icon reflects the file category.

**States**

default, hover (surface.hover), selected, focus, disabled; plus loading (thumbnail skeleton) and error (broken / upload failed).

**Accessibility**

The whole card is one focusable control; the file name is its accessible label. Selection exposes aria-checked. Focus ring visible; hit area ≥44.

**Rules**

Show file type clearly  
Truncate long names with a tooltip  
Keep one primary action  
Support keyboard select

Rely on the thumbnail alone for type  
Hide the file name  
Cram in many actions  
Use for non-file content
