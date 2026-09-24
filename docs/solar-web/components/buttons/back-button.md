# Back Button

> SOLAR Web · Figma page `↳ 🟢 Back Button` (id `4533:80`) · section `components/buttons` · raw data: [`raw/components/buttons/back-button.json`](../../raw/components/buttons/back-button.json)

## Component set: BackButton

Left-chevron + label affordance for returning to the previous context (parent list, detail ancestor, wizard step back). 12 variants: size (sm 32px, md 40px) × state (default, hover, pressed, focus, disabled, loading). Drawn heights are the visible control; the 44×44px WCAG hit area is padded in code (no target-size variable exists yet). Props: Label (text), showLabel. Used above page titles on detail views and inside side panels. Routes to the ancestor the user came from — should never be a no-op or hit browser-back.

### Props

| Prop        | Type    | Options / default                                          |
| ----------- | ------- | ---------------------------------------------------------- |
| `size`      | variant | sm · **md**                                                |
| `state`     | variant | **default** · hover · pressed · disabled · focus · loading |
| `Label`     | text    | default `Back`                                             |
| `showLabel` | boolean | default `true`                                             |

Default variant: `size=md, state=default` · 12 variants · default size 89×40px

### Anatomy (default variant)

- **size=md, state=default** · component · row gap 12 pad 0/12/0/12 HUG/FIXED · 89×40  
  fill `color.action.tertiary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · itemSpacing `stack.sm` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **Icon/ArrowLeft** · instance of **Icon/ArrowLeft** (solid=false) · FIXED/FIXED · 20×20  
    height `icon.md`
  - **Label** · text `label/md` "Back" · FILL/HUG · 33×10  
    fill `color.action.tertiary.text.default` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500` · prop visible←showLabel, characters←Label

### Tokens used

| Role            | Tokens                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.active`, `color.action.tertiary.bg.default`, `color.action.tertiary.bg.disabled`, `color.action.tertiary.bg.hover`         |
| Strokes         | `color.border.medium`                                                                                                                                |
| Text color      | `color.action.tertiary.text.active`, `color.action.tertiary.text.default`, `color.action.tertiary.text.disabled`, `color.action.tertiary.text.hover` |
| Icon color      | `color.action.tertiary.icon.active`, `color.action.tertiary.icon.default`, `color.action.tertiary.icon.disabled`, `color.action.tertiary.icon.hover` |
| Spacing         | `inset.sm`, `stack.sm`                                                                                                                               |
| Radius          | `radius.control`                                                                                                                                     |
| Border width    | `border.default`                                                                                                                                     |
| Sizes           | `icon.md`                                                                                                                                            |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md`                                                  |
| Effects         | `shadow/control`, `shadow/focus/default`                                                                                                             |
| Text styles     | `label/md`                                                                                                                                           |

### Slots and prop-controlled layers

| Layer | Controlled property | Prop        |
| ----- | ------------------- | ----------- |
| Label | visible             | `showLabel` |
| Label | characters          | `Label`     |

### Composes

- Icon/ArrowLeft

### Variant matrix

| size | state    | size  | fill                                | stroke                | effect                 | text                                  | icon                                  |
| ---- | -------- | ----- | ----------------------------------- | --------------------- | ---------------------- | ------------------------------------- | ------------------------------------- |
| md   | default  | 89×40 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.default`  | `color.action.tertiary.icon.default`  |
| sm   | default  | 68×32 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.default`  | `color.action.tertiary.icon.default`  |
| md   | hover    | 89×40 | `color.action.tertiary.bg.hover`    | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.hover`    | `color.action.tertiary.icon.hover`    |
| sm   | hover    | 68×32 | `color.action.tertiary.bg.hover`    | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.hover`    | `color.action.tertiary.icon.hover`    |
| md   | pressed  | 89×40 | `color.action.tertiary.bg.active`   | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.active`   | `color.action.tertiary.icon.active`   |
| sm   | pressed  | 68×32 | `color.action.tertiary.bg.active`   | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.active`   | `color.action.tertiary.icon.active`   |
| md   | disabled | 89×40 | `color.action.tertiary.bg.disabled` | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.disabled` | `color.action.tertiary.icon.disabled` |
| sm   | disabled | 68×32 | `color.action.tertiary.bg.disabled` | `color.border.medium` | `shadow/control`       | `color.action.tertiary.text.disabled` | `color.action.tertiary.icon.disabled` |
| md   | focus    | 89×40 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/focus/default` | `color.action.tertiary.text.default`  | `color.action.tertiary.icon.default`  |
| sm   | focus    | 68×32 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/focus/default` | `color.action.tertiary.text.default`  | `color.action.tertiary.icon.default`  |
| md   | loading  | 48×40 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/control`       |                                       | `color.action.tertiary.icon.default`  |
| sm   | loading  | 32×32 | `color.action.tertiary.bg.default`  | `color.border.medium` | `shadow/control`       |                                       | `color.action.tertiary.icon.default`  |

## Documentation card

**BackButton**

**Usage**

Left-chevron + label affordance for returning to the previous context (parent list, detail ancestor, wizard step back). Used above page titles on detail views and inside side panels. Routes to the ancestor the user came from — should never be a no-op or hit browser-back.

**Usage**

Place top-left of a page, panel, or step. Pairs with a Page Header. One per view.

**Behavior**

Shows a back chevron with an optional label. On press, navigates to the previous view in history or a defined parent.

**Sizes**

sm (36px) Dense contexts and panels.  
md (44px) Default. Meets the 44px touch target.

**Accessibility**

Expose as a link or button with a clear label (“Back”, “Back to Devices”). Reachable and operable by keyboard; visible focus ring.

**Rules**

- DO: Use it as described under Usage; bind every colour, spacing and radius to a SOLAR token.

- DON'T: Routes to the ancestor the user came from — should never be a no-op or hit browser-back.
