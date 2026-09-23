# Coachmark

> SOLAR Web · Figma page `↳ 🟢 Coachmark` (id `10785:28`) · section `components/overlays` · raw data: [`raw/components/overlays/coachmark.json`](../../raw/components/overlays/coachmark.json)

## Component set: Node End

Terminator dot for the Coachmark connector — the marker that sits on the element a tour step is describing.

Variants (2): halo = false | true. false is a plain 6px Dot, for a passive anchor. true adds a Halo around the Dot, marking the element the current step is about.

Both states bind surface/feedback/info/strong. Used inside Coachmark; not intended to be placed on its own.

Accessibility: decorative. Mark it aria-hidden and give the target element its own accessible name — the dot must never be the only indication of what a step refers to.

### Props

| Prop   | Type    | Options / default |
| ------ | ------- | ----------------- |
| `halo` | variant | **false** · true  |

Default variant: `halo=false` · 2 variants · default size 12×12px

### Anatomy (default variant)

- **halo=false** · component · FIXED/FIXED · 12×12
  - **Halo** · ellipse · 6×6  
    fill `color.surface.feedback.info.strong` · opacity 0.20000000298023224
  - **Dot** · ellipse · 6×6  
    fill `color.surface.feedback.info.strong`

### Tokens used

| Role  | Tokens                               |
| ----- | ------------------------------------ |
| Fills | `color.surface.feedback.info.strong` |

### Variant matrix

| halo  | size  | fill | stroke | effect | text | icon |
| ----- | ----- | ---- | ------ | ------ | ---- | ---- |
| false | 12×12 |      |        |        |      |      |
| true  | 12×12 |      |        |        |      |      |

## Component set: Coachmark

Anchored step card for a guided product tour. The card carries one step of copy; a connector runs from its edge to the element the step is about.

Variants (2): side = right (default) | left — which edge the connector leaves from. Choose the side that points toward the target without the card covering it.

Anatomy: Card (320px, surface/inverse, 16px padding, 20px gap) · Header = Title 20px text/inverse + Icon/Close · Body 12px text/inverse · Counter 14px text/tertiary · Button Group (regular, 8px gap) with two equal-width md secondary Buttons · Connector = Line + Origin Dot + Node End terminator, all surface/feedback/info/strong.

Use for: first-run tours, feature announcements tied to a specific control, progressive disclosure of a multi-step workflow.
Do not use for: hover hints (Tooltip), on-demand detail (Popover), or anything blocking (Dialog). A tour must always be skippable.

Content: keep tours to 3–6 steps, one idea per step. Disable Back on step 1 and relabel Next to "Done" on the last step.

Contrast: all three text roles pass WCAG AA on the inverse card (Title 18.88/17.32, Body 18.88/17.32, Counter 7.94/5.43, Light/Dark). The Counter intentionally uses text/tertiary — it is the one de-emphasised token that inverts opposite to the surface. text/secondary fails at 3.19:1 / 2.18:1; do not swap it.

Accessibility: role="dialog" aria-modal="false", aria-labelledby on the Title. Move focus to the card on step change and announce via aria-live="polite". Esc dismisses the tour. The Connector is decorative.

### Props

| Prop   | Type    | Options / default |
| ------ | ------- | ----------------- |
| `side` | variant | left · **right**  |

Default variant: `side=right` · 2 variants · default size 320×171px

### Anatomy (default variant)

- **side=right** · component · row gap 0 pad 0/0/0/0 HUG/HUG · 320×171
  - **Card** · frame · column gap 20 pad 16/16/16/16 FIXED/HUG · 320×171  
    fill `color.surface.inverse` · effect `shadow/overlay` · itemSpacing `stack.lg` · padding `inset.md` · radius `radius.container`
    - **Header** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 288×20  
      itemSpacing `inset.xs`
      - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 20×20  
        width `icon.md`
      - **Title** · text `title/sm` "Title" · FIXED/FIXED · 41×15  
        fill `color.text.inverse` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Body** · text `body/sm/regular` "Tutorial step text" · FILL/HUG · 288×9  
      fill `color.text.inverse` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
    - **Counter** · text `body/md/medium` "1 / 6 steps" · FILL/HUG · 288×10  
      fill `color.text.tertiary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Button Group** · instance of **Button Group** (orientation=horizontal, type=regular) · row gap 8 pad 0/0/0/0 FILL/HUG · 288×40  
      itemSpacing `inset.xs`
  - **Connector** · frame · row gap 16 pad 0/0/0/0 FIXED/FIXED · 100×6  
    itemSpacing `inset.md`
    - **Line** · vector · FILL/FIXED · 100×1  
      fill `color.surface.feedback.info.strong`
    - **Origin Dot** · ellipse · FIXED/FIXED · 6×6  
      fill `color.surface.feedback.info.strong`
    - **Node End** · instance of **Node End** (halo=true) · FIXED/FIXED · 12×12

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
- Node End

### Variant matrix

| side  | size    | fill | stroke | effect | text                                                                                                                         | icon                                                                                                  |
| ----- | ------- | ---- | ------ | ------ | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| right | 320×171 |      |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.icon.inverse`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |
| left  | 320×171 |      |        |        | `color.text.inverse`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.primary.text.default` | `color.icon.inverse`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default` |

## Documentation card

**Description**

Anchored step card for a guided product tour. The card carries the copy for one step; a connector runs from its edge to the element the step is about, so the user can see exactly what is being described. Use it for first-run tours, feature announcements tied to a specific control, and progressive disclosure of a multi-step workflow.

**Anatomy**

Card 320px, surface/inverse, 16px padding, 20px gap, shared shadow effect style.  
Header Title (20px, text/inverse, centred) + Icon/Close glyph on the trailing edge.  
Body 12px, text/inverse, centred — the copy for this step.  
Counter 14px, text/tertiary, centred — position in the tour.  
Button Group Regular, 8px gap, two equal-width md secondary Buttons.  
Connector Line (100px) + Origin Dot at the card edge + a Node End terminator,  
all surface/feedback/info/strong.

**Variants**

Coachmark side = right (default) | left  
Which edge the connector leaves from. Pick the side that points toward the target without the card covering it.  
Node End state = 01 | 02  
The terminator on the far end of the connector. 01 is a plain 6px Dot; 02 adds a Halo, marking the element the step is about.  
Coachmark has no interactive states of its own — Back and Next carry Button states, and the close glyph is a bare icon.

**Usage**

Do — keep tours to 3–6 steps and one idea per step. Anchor the connector to something visible on screen. Disable Back on step 1 and relabel Next to "Done" on the last step. Always leave a way out.  
Don't — use this for a hover hint (Tooltip) or on-demand detail (Popover), block the UI behind a scrim (that is a Dialog), or run the connector across content the step is not about.

**Accessibility**

Role role="dialog" aria-modal="false", aria-labelledby on the Title.  
Focus Move focus to the card on every step change; keep Tab order inside it.  
SR Announce step changes via aria-live="polite"; the Counter reads "Step 1 of 6".  
Keys Esc dismisses the tour. Back, Next and close are real buttons, not divs.  
Target The Connector is decorative.

**Rules**

- DO: Point the connector at the element the step describes
- DO: Keep the tour to 3–6 steps, one idea per step
- DO: Disable Back on step 1 and label the last action "Done"
- DO: Let Esc and the close glyph exit the whole tour

- DON'T: Use a Coachmark for a hover hint — that's Tooltip
- DON'T: Block the UI behind a scrim — a tour is not a Dialog
- DON'T: Let the card cover the element it is pointing at
- DON'T: Make a coachmark the only route to a feature
