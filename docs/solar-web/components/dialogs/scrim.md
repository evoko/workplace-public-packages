# Scrim

> SOLAR Web · Figma page `↳ 🟢 Scrim` (id `2966:606`) · section `components/dialogs` · raw data: [`raw/components/dialogs/scrim.json`](../../raw/components/dialogs/scrim.json)

## Component: Scrim

Full-viewport translucent overlay rendered behind Dialog, Drawer, and blocking modal surfaces. Uses color.surface.scrim token. Click dismisses the overlaid modal unless the modal is declared non-dismissible. Never use as a decorative background — scrim is a semantic focus-trap indicator that user attention is bound to the layer above it.

### Anatomy (default variant)

- **Scrim** · component · 1440×800  
  fill `color.surface.scrim` · width `breakpoint.lg`

### Tokens used

| Role  | Tokens                |
| ----- | --------------------- |
| Fills | `color.surface.scrim` |
| Sizes | `breakpoint.lg`       |

## Documentation card

**Description**

Full-viewport translucent overlay rendered behind Dialog, Drawer, and blocking modal surfaces. Signals that user attention is bound to the layer above.

**Purpose**

Focus trap indicator — everything below is non-interactive.  
Click dismisses the modal above unless the modal is non-dismissible.  
Uses color.surface.scrim token.

**Layering**

Z-index: dialog level (400) — always paired with the modal above.  
Never render Scrim alone.  
Never stack multiple Scrims — use a single shared surface per modal stack.

**Motion**

Fade in with the modal opening; typical duration fast (100ms).  
Fade out on modal close.  
Respect prefers-reduced-motion — snap without fade when set.

**Rules**

- DO: Pair with Dialog, Drawer, or blocking modal
- DO: Dismiss modal on Scrim click (unless non-dismissible)
- DO: Use color.surface.scrim token
- DO: Animate in/out with modal

- DON'T: Use as decorative background
- DON'T: Stack multiple Scrims
- DON'T: Leave Scrim visible without a modal above
- DON'T: Block interaction without a focus trap above
