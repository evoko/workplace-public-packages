# Cursor

> SOLAR Web · Figma page `↳ 🟢 Cursor` (id `8871:430`) · section `components/utility` · raw data: [`raw/components/utility/cursor.json`](../../raw/components/utility/cursor.json)

## Component set: Cursor

Custom pointer glyphs for canvas and authoring surfaces — the Spatial and Flow editors — where the native cursor cannot express the active tool. 22 variants: type (Default, Default White, Pointer, Text, Move, Grabbing, Crosshair, Copy, Not Allowed, Unavailable, Progress, Hourglass, Zoom In, Zoom Out, Resize N, NS, EW, NE SW, NW SE, Col, Row, X). Glyphs bind icon/primary with an icon/inverse outline so they read on light and dark. Non-interactive: the cursor mirrors state set elsewhere and is never the only signal. Standard UI keeps native cursors.

### Props

| Prop   | Type    | Options / default                                                                                                                                                                                                                                        |
| ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | variant | Copy · Crosshair · **Default** · Default White · Grabbing · Hourglass · Move · Not Allowed · Pointer · Progress · Resize Col · Resize EW · Resize N · Resize NE SW · Resize NS · Resize NW SE · Resize Row · Text · Unavailable · Zoom In · Zoom Out · X |

Default variant: `type=Default` · 22 variants · default size 12×14px

### Anatomy (default variant)

- **type=Default** · component · 12×14  
  effect `shadow/raised`
  - **Rectangle 237** · vector · 12×14  
    fill `color.icon.primary` · stroke `color.icon.inverse` 1px

### Tokens used

| Role       | Tokens               |
| ---------- | -------------------- |
| Strokes    | `color.icon.inverse` |
| Icon color | `color.icon.primary` |
| Effects    | `shadow/raised`      |

### Variant matrix

| type          | size  | fill | stroke | effect          | text | icon |
| ------------- | ----- | ---- | ------ | --------------- | ---- | ---- |
| Default       | 12×14 |      |        | `shadow/raised` |      |      |
| Grabbing      | 13×14 |      |        |                 |      |      |
| Default White | 13×14 |      |        |                 |      |      |
| Progress      | 22×24 |      |        |                 |      |      |
| Not Allowed   | 21×24 |      |        |                 |      |      |
| Move          | 18×18 |      |        |                 |      |      |
| Resize Col    | 18×16 |      |        |                 |      |      |
| Resize Row    | 16×18 |      |        |                 |      |      |
| Resize NS     | 8×19  |      |        |                 |      |      |
| Resize N      | 8×15  |      |        |                 |      |      |
| Crosshair     | 16×16 |      |        |                 |      |      |
| X             | 16×16 |      |        |                 |      |      |
| Text          | 8×16  |      |        |                 |      |      |
| Unavailable   | 16×16 |      |        |                 |      |      |
| Zoom In       | 16×16 |      |        |                 |      |      |
| Zoom Out      | 16×16 |      |        |                 |      |      |
| Resize EW     | 19×8  |      |        |                 |      |      |
| Resize NW SE  | 13×13 |      |        |                 |      |      |
| Resize NE SW  | 13×13 |      |        |                 |      |      |
| Copy          | 21×24 |      |        |                 |      |      |
| Pointer       | 14×17 |      |        |                 |      |      |
| Hourglass     | 11×16 |      |        |                 |      |      |

## Documentation card

**Description**

Custom pointer treatments for canvas and authoring surfaces (grab, crosshair, resize, etc.). For domain canvases; standard UI uses native cursors.

**Anatomy**

Cursor glyph · hotspot point · optional label / badge (e.g. active tool name).

**Variants**

type: default · grab · grabbing · crosshair · resize · text · not-allowed. Provide hi-dpi assets.

**States**

Reflects the active tool / context. Non-interactive itself — it mirrors interaction state happening elsewhere.

**Accessibility**

Cursor is never the sole signal of state — pair with a visible tool indicator and keyboard equivalents. Ensure the glyph is visible on light and dark surfaces.

**Rules**

Mirror the active tool  
Keep a precise hotspot  
Provide keyboard equivalents  
Test on light + dark surfaces

Convey state by cursor alone  
Use custom cursors in standard UI  
Obscure the target  
Forget hi-dpi assets
