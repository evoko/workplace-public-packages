# Coachmark

> SOLAR Web · Figma page `↳ 🟠 Coachmark` (id `10785:28`) · section `components/overlays` · raw data: [`raw/components/overlays/coachmark.json`](../../raw/components/overlays/coachmark.json)

## Component set: Node end

### Props

| Prop    | Type    | Options / default |
| ------- | ------- | ----------------- |
| `State` | variant | **01** · 02       |

Default variant: `State=01` · 2 variants · default size 12×12px

### Anatomy (default variant)

- **State=01** · component · FIXED/FIXED · 12×12
  - **Ellipse 5** · ellipse · 6×6  
    fill `Mid Blue` (Legacy Palette) · opacity 0.20000000298023224
  - **Ellipse 3** · ellipse · 6×6  
    fill `Mid Blue` (Legacy Palette)

### Tokens used

| Role  | Tokens     |
| ----- | ---------- |
| Fills | `Mid Blue` |

### Variant matrix

| State | size  | fill | stroke | effect | text | icon |
| ----- | ----- | ---- | ------ | ------ | ---- | ---- |
| 01    | 12×12 |      |        |        |      |      |
| 02    | 12×12 |      |        |        |      |      |

### Issues detected

- Component description is empty.
- State axis uses non-standard value(s): 01, 02.
- Binds legacy non-SOLAR collection(s): {Legacy Palette:Mid Blue}.

## Component: Coachmark

### Anatomy (default variant)

- **Coachmark** · component · column gap 16 pad 16/16/16/16 FIXED/HUG · 233×194  
  fill `Background.background_sidebar` (Sematic)
  - **Frame 20069** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 201×16
    - **Icon 16** · instance of **Icon 16** (Type=Close) · column gap 8 pad 0/0/0/0 FIXED/FIXED · 16×16
    - **Label** · text "Label" · FIXED/FIXED · 39×10  
      fill `Text.text_primaryAction` (Sematic)
  - **Choose how you want to start your design. You can create a design from scratch, import an existing file, or start from a template.** · text "Choose how you want to start your design. You can create a design from scratch, " · FIXED/HUG · 201×63  
    fill `Text.text_primaryAction` (Sematic)
  - **1 / 6 steps** · text "1 / 6 steps" · FIXED/HUG · 201×9  
    fill `Text.text_secondary` (Sematic)
  - **Frame 20068** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 201×26
    - **Buttons Desktop** · instance of **Buttons Desktop** (Type=Small, Priority=Secondary, State=Default, Critical=False, Disabled=False) · row gap 8 pad 12/12/12/12 FILL/FIXED · 97×26  
      fill `Action.action_secondary` (Sematic) · stroke `Divider.divider_secondary` (Sematic) 1px · effect `Shadow/Text Input` · itemSpacing `Spacing.1` · padding `Spacing.1,5` · radius `Corner radius.Button Small` · opacity 0.30000001192092896
    - **Buttons Desktop** · instance of **Buttons Desktop** (Type=Small, Priority=Secondary, State=Default, Critical=False, Disabled=False) · row gap 8 pad 12/12/12/12 FILL/FIXED · 97×26  
      fill `Action.action_secondary` (Sematic) · stroke `Divider.divider_secondary` (Sematic) 1px · effect `Shadow/Text Input` · itemSpacing `Spacing.1` · padding `Spacing.1,5` · radius `Corner radius.Button Small`

### Tokens used

| Role       | Tokens                                                     |
| ---------- | ---------------------------------------------------------- |
| Fills      | `Action.action_secondary`, `Background.background_sidebar` |
| Strokes    | `Divider.divider_secondary`                                |
| Text color | `Text.text_primaryAction`, `Text.text_secondary`           |
| Spacing    | `Spacing.1,5`, `Spacing.1`                                 |
| Radius     | `Corner radius.Button Small`                               |
| Effects    | `Shadow/Text Input`                                        |

### Composes

- Buttons Desktop
- Icon 16

### Issues detected

- Component description is empty.
- Binds legacy non-SOLAR collection(s): {Sematic:Action/action_secondary}, {Sematic:Background/background_sidebar}, {Sematic:Divider/divider_secondary}, {Sematic:Text/text_primaryAction}, {Sematic:Text/text_secondary}, {Legacy Spatial:Spacing/1,5}, {Legacy Spatial:Spacing/1}, {Legacy Spatial:Corner radius/Button Small}.
- Hard-coded gap `16px` on layer _Coachmark_
- Hard-coded paddingTop `16px` on layer _Coachmark_
- Hard-coded paddingRight `16px` on layer _Coachmark_
- Hard-coded paddingBottom `16px` on layer _Coachmark_
- Hard-coded paddingLeft `16px` on layer _Coachmark_
- Hard-coded radius `8px` on layer _Coachmark_
- Hard-coded gap `8px` on layer _Frame 20069_
- Hard-coded gap `8px` on layer _Frame 20068_

## Compositions and examples on this page

### Tutorial node (frame, 140×6)

Uses: Node end ×1

- **Tutorial node** · frame · row gap 122 pad 0/0/0/0 FIXED/FIXED · 140×6
  - **Vector** · vector · FILL/FIXED · 140×0  
    stroke `Mid Blue` (Legacy Palette) 1px
  - **Ellipse** · ellipse · FIXED/FIXED · 6×6  
    fill `Mid Blue` (Legacy Palette)
  - **Node end** · instance of **Node end** (State=02) · FIXED/FIXED · 12×12

## Documentation card

**Description**

Anchored step card that walks a user through a guided product tour. It points at a target element, explains it in a sentence or two, and moves the user forward. Use it for first-run tours, feature announcements tied to a specific control, and progressive disclosure of a multi-step workflow.

**Anatomy**

Header Centred title + close Icon Button (tertiary, sm), balanced by a Spacer.  
Body One idea per step, ~25 words maximum, centred.  
Step Progress counter, helper/sm, text secondary.  
Actions Button Group (regular, 8px gap) — two equal-width secondary Buttons.  
Tip Directional pointer aimed at the target element.

**Variants**

placement = top (default) | bottom | left | right  
The tip points from the named side. Coachmark has no interactive states of its own — Back and Next carry Button states, the close control carries Icon Button states.  
The card pins the Color collection to Dark mode, so it reads as a dark island above the app with every value still a bound token. Known issue: the close control paints a box because action/tertiary/bg/default is opaque in both modes (Variable Audit §16 / BACKLOG TOK-1). Left bound on purpose so it self-heals — do not override the fill.

**Usage**

Do — keep tours to 3–6 steps, always leave an escape (close dismisses the whole tour), disable Back on step 1, and relabel Next to "Done" on the final step.  
Don't — use for hover hints (Tooltip), on-demand detail (Popover), or anything blocking (Dialog). Never make a coachmark the only route to the feature it describes.

**Accessibility**

Role role="dialog" aria-modal="false", aria-labelledby on the title.  
Focus Move focus to the card on every step change; keep Tab order inside it.  
SR Announce step changes via aria-live="polite"; counter reads "Step 1 of 6".  
Keys Esc dismisses the tour. Back/Next are real buttons, not divs.  
Contrast Surface, text and tip all inherit bound SOLAR tokens — no raw hex.

**Rules**

- DO: Anchor to a visible element and point the tip at it
- DO: Keep the tour to 3–6 steps, one idea per step
- DO: Disable Back on step 1 and label the last action "Done"
- DO: Let Esc and the close control exit the whole tour

- DON'T: Use a Coachmark for a hover hint — that's Tooltip
- DON'T: Block the UI behind a scrim — a tour is not a Dialog
- DON'T: Cover the element the step is describing
- DON'T: Make a coachmark the only route to a feature
