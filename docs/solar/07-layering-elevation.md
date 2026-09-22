---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/layering-elevation: c58446db9889
    primitives/elevation: 04848690d0f9
---

# 07 · Layering & Elevation

> Source: Figma pages "Visual Language › Layering & Elevation" (overview, elevation
> levels, elevation tokens, elevation in context, stacking rules, do's and don'ts),
> "Primitives › Elevation" (surfaces, shadows, accessibility) and the page's
> `@SOLAR:PAGE_CONTEXT`. Shadow values are from the 9 local effect styles.

## Purpose

Layering and elevation help users understand spatial relationships. SOLAR uses a small
set of predictable elevation levels combined with surface and shadow tokens, keeping
interfaces visually calm while providing enough depth cues for hierarchy and
interaction feedback.

| Principle                       | Meaning                                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Layer hierarchy**             | Predictable layers: background surfaces, content containers, overlays, dialog elements         |
| **Subtle depth cues**           | Minimal shadows and surface contrast; no visual noise                                          |
| **Consistent system behaviour** | Each elevation level corresponds to specific UI patterns (cards, dropdowns, popovers, dialogs) |
| **Token-driven implementation** | Elevation is defined through Foundations tokens and applied consistently across all libraries  |

## Elevation levels

| Level          | Surface token              | Shadow (effect style) | Components                                                                           |
| -------------- | -------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| **Background** | `color.surface.background` | none                  | The lowest surface behind all content                                                |
| **Base**       | `color.surface.base`       | none                  | Page shell, navigation rail, sidebar, content area                                   |
| **Raised**     | `color.surface.raised`     | `shadow/raised`       | Card, data table, content pane, tab panel                                            |
| **Overlay**    | `color.surface.overlay`    | `shadow/overlay`      | DropdownMenu, Tooltip, Popover, ContextMenu (appear on interaction, dismiss on blur) |
| **Dialog**     | `color.surface.dialog`     | `shadow/dialog`       | Dialog, AlertDialog, system alert; blocks the UI; always with a scrim                |
| **Scrim**      | `color.surface.scrim`      | none                  | Semi-transparent backdrop (alpha/black-20) behind dialogs and drawers                |

Utility surfaces outside the hierarchy: `color.surface.muted` (recessed areas),
`color.surface.inverse` (flipped contrast), and the feedback surfaces
(`color.surface.feedback.{success,warning,danger,info,neutral}.*`).

Elevated surfaces (base, raised, overlay, dialog) **share one color by design**: white in
Light, neutral/800 in Dark. Depth is communicated by shadow, not surface contrast — dark
mode does not tint elevated surfaces lighter, it raises shadow alpha instead.

Two more layers sit above the table but reuse its surfaces: **toast** uses
`color.surface.raised` with `shadow/overlay`, and **tooltip** uses
`color.surface.inverse`. Sticky headers and toolbars stay on `color.surface.base` with no
shadow until the content scrolls under them.

## Shadow scale (effect styles)

| Effect style           | Layers (x y blur spread · color variable)                               | Purpose                                                                         |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `shadow/none`          | —                                                                       | Base-level surfaces                                                             |
| `shadow/control`       | 0 1 1 0 · `color.shadow.subtle`                                         | Signals interactivity on inputs and small controls. **Not** an elevation level. |
| `shadow/raised`        | 0 1 2 0 · `color.shadow.subtle`                                         | Light lift for content containers                                               |
| `shadow/overlay`       | 0 2 12 0 · `color.shadow.subtle`                                        | Floating elements                                                               |
| `shadow/dialog`        | 0 12 26 0 · `color.shadow.subtle` **+** 0 0 0 2 · `color.shadow.strong` | Strongest elevation in the system                                               |
| `shadow/strong`        | 0 4 5 0 · `color.shadow.strong`                                         | Higher-emphasis depth separation                                                |
| `shadow/focus/default` | 0 0 0 2 · `color.shadow.feedback.focus` (blue 20 %)                     | Focus ring                                                                      |
| `shadow/focus/danger`  | 0 0 0 2 · `color.shadow.feedback.danger` (red 20 %)                     | Focus ring in an error context                                                  |
| `shadow/danger`        | `shadow/control` **+** 0 0 0 2 · `color.shadow.feedback.danger`         | Danger outline on a control                                                     |
| `shadow/warning`       | `shadow/control` **+** 0 0 0 2 · `color.shadow.feedback.warning`        | Warning outline on a control                                                    |

All shadow colors are variable-bound and therefore mode-aware: `color.shadow.subtle` is
black 5 % in Light and black **50 %** in Dark; `color.shadow.strong` is black 20 % → 70 %.
Feedback shadow colors are the same in both modes.

Light-mode CSS equivalents:

```css
--solar-shadow-control: 0 1px 1px 0 rgba(0, 0, 0, 0.05);
--solar-shadow-raised: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--solar-shadow-overlay: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
--solar-shadow-dialog:
  0 12px 26px 0 rgba(0, 0, 0, 0.05), 0 0 0 2px rgba(0, 0, 0, 0.2);
--solar-shadow-strong: 0 4px 5px 0 rgba(0, 0, 0, 0.2);
--solar-shadow-focus-default: 0 0 0 2px rgba(37, 105, 253, 0.2);
--solar-shadow-focus-danger: 0 0 0 2px rgba(224, 3, 45, 0.2);
```

In Dark mode the same properties are reassigned with the dark shadow-color values.
`shadow.modal`, `shadow.medium` and `shadow.strongest` are retired names and do not
exist; the dialog composite is `shadow/dialog`. `shadow.subtle` and `shadow.strong` are
shadow _color_ variables (`color.shadow.*`); only `shadow/strong` doubles as an effect
style. Bind `effectStyleId` — never an inline `box-shadow`.

## Z-index ladder

SOLAR fixes seven z-index levels. Never use arbitrary values.

| Level    | Value | Used by                                                                 |
| -------- | ----- | ----------------------------------------------------------------------- |
| base     | 0     | Page content                                                            |
| sticky   | 100   | Sticky headers, fixed toolbars                                          |
| dropdown | 200   | Menus, dropdowns                                                        |
| overlay  | 300   | Popovers, drawers' backdrop, scrims                                     |
| dialog   | 400   | Dialogs, drawers' content                                               |
| toast    | 500   | Notifications, snackbars                                                |
| tooltip  | 600   | Tooltips (outrank toasts so a tooltip on a notification stays readable) |

Suggested CSS names follow the contract: `--solar-z-base`, `--solar-z-sticky`,
`--solar-z-dropdown`, `--solar-z-overlay`, `--solar-z-dialog`, `--solar-z-toast`,
`--solar-z-tooltip` (the Elevation page references `--solar-z-dialog` and
`--solar-z-overlay` explicitly).

## Stacking rules

1. **Stacking order follows elevation.** Higher levels always render above lower ones.
   Never override z-index to break the hierarchy.
2. **One dialog at a time.** Never stack dialogs; if more input is needed, add it inline
   within the active dialog.
3. **Overlays dismiss before dialogs.** An open dropdown closes before a dialog opens.
4. **Scrim is mandatory for dialogs.** It signals that the background is not
   interactive and directs focus.
5. **Focus is trapped** within the highest active elevation layer; overlays are
   dismissible with Escape.
6. Never stack more than 2–3 elevation levels simultaneously; never place content above
   the toast layer except system-level elements.

## Do and don't

| Do                                                                               | Don't                                                                     |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Pair surface and shadow from the same level (`surface/raised` + `shadow/raised`) | Apply `shadow/dialog` to a card to make it "pop"                          |
| Use a scrim with every dialog                                                    | Nest dialogs within dialogs                                               |
| Use color, border or spacing for emphasis                                        | Add shadows for emphasis on elements that do not occupy an elevated layer |

## Accessibility of elevation

| Concern          | Rule                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Surface contrast | Body text on `surface/raised`, `surface/overlay`, `surface/dialog` meets AA (4.5:1) in both modes against `color.text.primary` |
| Focus ring       | Focus = `shadow/focus/*` **plus** the 2 px ring (non-color cue). Color alone is never the focus signal (WCAG 2.4.7, 1.4.11)    |
| Danger emphasis  | `shadow/danger` and `shadow/focus/danger` reinforce, never replace, the danger surface or border (WCAG 1.4.1)                  |
| Dialog backdrop  | `shadow/dialog` always pairs with `surface/scrim`                                                                              |
| Dark-mode alpha  | Shadow alphas shift (5 % → 50 %, 20 % → 70 %); verify shadows still read after a mode swap                                     |
| Stacking         | Tooltip > Toast > Dialog > Overlay > Dropdown > Sticky > Base; mis-stacking traps keyboard focus under an opaque scrim         |
| Reduced motion   | If a component enters with shadow + motion, reduced motion removes the slide and keeps the shadow                              |

## Agent behaviour (from the page context)

- When recommending elevation, specify both the shadow token and the z-index level.
- If a component fits no existing level, flag a governance gap.
- Verify overlays include a scrim when required; test in both modes.
- Never write raw `box-shadow` or `z-index` values.
