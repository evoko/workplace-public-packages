# Coachmark

> SOLAR Web · Figma page `↳ 🟠 Coachmark` (id `10785:28`) · section `components/overlays` · raw data: [`raw/components/overlays/coachmark.json`](../../raw/components/overlays/coachmark.json)

## Component set: Node end

Terminator dot for the Coachmark connector — the marker that sits on the element a tour step is describing.

Variants (2): State = 01 | 02. 01 is a plain 6px dot, for the connector origin or a passive anchor. 02 adds a halo around the dot, marking the element the current step is about.

Both states bind surface/feedback/info/strong. Used inside Coachmark; not intended to be placed on its own.

Accessibility: decorative. Mark it aria-hidden and give the target element its own accessible name — the dot must never be the only indication of what a step refers to.

### Props

| Prop    | Type    | Options / default |
| ------- | ------- | ----------------- |
| `State` | variant | **01** · 02       |

Default variant: `State=01` · 2 variants · default size 12×12px

### Anatomy (default variant)

- **State=01** · component · FIXED/FIXED · 12×12
  - **Ellipse 5** · ellipse · 6×6  
    fill `color.surface.feedback.info.strong` · opacity 0.20000000298023224
  - **Ellipse 3** · ellipse · 6×6  
    fill `color.surface.feedback.info.strong`

### Tokens used

| Role  | Tokens                               |
| ----- | ------------------------------------ |
| Fills | `color.surface.feedback.info.strong` |

### Variant matrix

| State | size  | fill | stroke | effect | text | icon |
| ----- | ----- | ---- | ------ | ------ | ---- | ---- |
| 01    | 12×12 |      |        |        |      |      |
| 02    | 12×12 |      |        |        |      |      |

### Issues detected

- State axis uses non-standard value(s): 01, 02.

## Component set: Coachmark

Anchored step card for a guided product tour. The card carries one step of copy; a connector runs from its edge to the element the step is about.

Variants (2): side = right (default) | left — which edge the connector leaves from. Choose the side that points toward the target without the card covering it.

Anatomy: 320px card on surface/inverse (16px padding, 20px gap) · Title 20px text/inverse with a trailing Icon/Close · step text 12px text/inverse · counter 14px text/secondary · Button Group (regular, 8px gap) with two equal-width md secondary Buttons · connector line + origin dot + Node end terminator, all surface/feedback/info/strong.

Use for: first-run tours, feature announcements tied to a specific control, progressive disclosure of a multi-step workflow.
Do not use for: hover hints (Tooltip), on-demand detail (Popover), or anything blocking (Dialog). A tour must always be skippable.

Content: keep tours to 3–6 steps, one idea per step. Disable Back on step 1 and relabel Next to "Done" on the last step.

Open issue: the counter fails WCAG AA in both modes (3.19:1 Light, 2.18:1 Dark, against 4.5:1 at 14px) because text/secondary and surface/inverse invert in the same direction. Needs an inverse-secondary text token. See BACKLOG TOK-2 — blocks 1.0 promotion.

Accessibility: role="dialog" aria-modal="false", aria-labelledby on the title. Move focus to the card on step change and announce via aria-live="polite". Esc dismisses the tour. The connector is decorative.

### Props

| Prop   | Type    | Options / default |
| ------ | ------- | ----------------- |
| `side` | variant | left · **right**  |

Default variant: `side=right` · 2 variants · default size 320×171px

### Anatomy (default variant)

- **side=right** · component · row gap 0 pad 0/0/0/0 HUG/HUG · 320×171
  - **Coachmark** · frame · column gap 20 pad 16/16/16/16 FIXED/HUG · 320×171  
    fill `color.surface.inverse` · effect `shadow/overlay` · itemSpacing `stack.lg` · padding `inset.md` · radius `radius.container`
    - **Frame 20069** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 288×20
      - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 20×20  
        width `icon.md`
      - **Title** · text `title/sm` "Title" · FIXED/FIXED · 41×15  
        fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Tutorial step text** · text `body/sm/regular` "Tutorial step text" · FILL/HUG · 288×9  
      fill `color.text.inverse` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
    - **1 / 6 steps** · text `body/md/medium` "1 / 6 steps" · FILL/HUG · 288×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Button Group** · instance of **Button Group** (orientation=horizontal, type=regular) · row gap 8 pad 0/0/0/0 FILL/HUG · 288×40  
      itemSpacing `inset.xs`
  - **Tutorial node** · frame · row gap 122 pad 0/0/0/0 FIXED/FIXED · 100×6
    - **Vector (Stroke)** · vector · FILL/FIXED · 100×1  
      fill `color.surface.feedback.info.strong`
    - **Ellipse** · ellipse · FIXED/FIXED · 6×6  
      fill `color.surface.feedback.info.strong`
    - **Node end** · instance of **Node end** (State=02) · FIXED/FIXED · 12×12

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.feedback.info.strong`, `color.surface.inverse`                                                                                                                                                                 |
| Text color      | `color.action.primary.text.default`, `color.action.tertiary.text.default`, `color.text.inverse`, `color.text.tertiary`                                                                                                        |
| Icon color      | `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.surface.feedback.info.strong`                                                                                       |
| Spacing         | `inset.md`, `inset.xs`, `stack.lg`                                                                                                                                                                                            |
| Radius          | `radius.container`                                                                                                                                                                                                            |
| Sizes           | `icon.md`                                                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/overlay`                                                                                                                                                                                                              |
| Text styles     | `body/md/medium`, `body/sm/regular`, `title/sm`                                                                                                                                                                               |

### Composes

- Button Group
- Icon/Close
- Node end

### Variant matrix

| side  | size    | fill | stroke | effect | text                                                                                                                         | icon                                                                                                  |
| ----- | ------- | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| right | 320×171 |      |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.icon.inverse`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |
| left  | 320×171 |      |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.icon.inverse`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |

### Issues detected

- Hard-coded gap `8px` on layer _Coachmark › Frame 20069_
- Hard-coded gap `122px` on layer _Tutorial node_

## Documentation card

**Description**

Anchored step card for a guided product tour. The card carries the copy for one step; a connector runs from its edge to the element the step is about, so the user can see exactly what is being described. Use it for first-run tours, feature announcements tied to a specific control, and progressive disclosure of a multi-step workflow.

**Anatomy**

Card 320px, surface/inverse, 16px padding, 20px gap, shared shadow effect style.  
Title 20px, text/inverse, centred, with a close glyph (Icon/Close, 20px) on the trailing edge.  
Step text 12px, text/inverse, centred — the copy for this step.  
Counter 14px, text/secondary, centred — position in the tour.  
Actions Button Group (regular, 8px gap), two equal-width md secondary Buttons.  
Connector 100px line + origin dot + a Node end terminator, all surface/feedback/info/strong.

**Variants**

Coachmark side = right (default) | left  
Which edge the connector leaves from. Pick the side that points toward the target without the card covering it.  
Node end State = 01 | 02  
The terminator on the far end of the connector. 01 is a plain 6px dot; 02 adds a halo, marking the element the step is about.  
Coachmark has no interactive states of its own — Back and Next carry Button states, and the close glyph is a bare icon.

**Usage**

Do — keep tours to 3–6 steps and one idea per step. Anchor the connector to something visible on screen. Disable Back on step 1 and relabel Next to "Done" on the last step. Always leave a way out.  
Don't — use this for a hover hint (Tooltip) or on-demand detail (Popover), block the UI behind a scrim (that is a Dialog), or run the connector across content the step is not about.

**Accessibility**

Role role="dialog" aria-modal="false", aria-labelledby on the title.  
Focus Move focus to the card on every step change; keep Tab order inside it.  
SR Announce step changes via aria-live="polite"; the counter reads "Step 1 of 6".  
Keys Esc dismisses the tour. Back, Next and close are real buttons, not divs.  
Target The connector is decorative — the target element still needs its own accessible name.  
⚠️ Open issue — the counter binds text/secondary on surface/inverse and fails WCAG AA in both modes: 3.19:1 in Light (#646464 on #111111) and 2.18:1 in Dark (#a8a8a8 on #f5f5f5), against 4.5:1 required at 14px. Both tokens invert in the same direction, so the pair never separates. Needs an inverse-secondary text token — SOLAR has no text/inverse/secondary today. See BACKLOG TOK-2. Blocks 🟢.

**Rules**

- DO: Point the connector at the element the step describes
- DO: Keep the tour to 3–6 steps, one idea per step
- DO: Disable Back on step 1 and label the last action "Done"
- DO: Let Esc and the close glyph exit the whole tour

- DON'T: Use a Coachmark for a hover hint — that's Tooltip
- DON'T: Block the UI behind a scrim — a tour is not a Dialog
- DON'T: Let the card cover the element it is pointing at
- DON'T: Make a coachmark the only route to a feature
