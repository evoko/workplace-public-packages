# Popover

> SOLAR Web · Figma page `↳ 🟢 Popover` (id `2202:1230`) · section `components/overlays` · raw data: [`raw/components/overlays/popover.json`](../../raw/components/overlays/popover.json)

## Component set: Popover

Anchored overlay with an arrow for rich content — a title, body text and optionally controls — opened from a trigger. 8 variants: placement (top, bottom, left, right) × size (sm, md). title and body are text props. Uses shadow/overlay at the overlay z level; dismisses on Esc or outside click; focus moves into it only when it contains controls. For a one-line hint use Tooltip; for a list of actions use Dropdown.

### Props

| Prop        | Type    | Options / default                                                 |
| ----------- | ------- | ----------------------------------------------------------------- |
| `placement` | variant | **top** · bottom · left · right                                   |
| `size`      | variant | sm · **md**                                                       |
| `title`     | text    | default `Popover Title`                                           |
| `body`      | text    | default `Popover content goes here. This is a short description.` |

Default variant: `placement=top, size=md` · 8 variants · default size 320×100px

### Anatomy (default variant)

- **placement=top, size=md** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 320×100  
  effect `shadow/dialog`
  - **Content** · frame · column gap 12 pad 16/16/16/16 FIXED/HUG · 320×90  
    fill `color.surface.raised` · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`, `radius.none`
    - **Title** · text `body/md/medium` "Popover Title" · FILL/HUG · 288×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Body** · text `body/lg/regular` "Popover content goes here. This is a short description." · FILL/HUG · 288×36  
      fill `color.text.secondary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.400`
  - **Tip** · vector · FIXED/FIXED · 10×10  
    fill `color.surface.raised`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.raised`                                                                                                                                                     |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                               |
| Icon color      | `color.surface.raised`                                                                                                                                                     |
| Spacing         | `inset.md`, `stack.sm`                                                                                                                                                     |
| Radius          | `radius.container`, `radius.none`                                                                                                                                          |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md` |
| Effects         | `shadow/dialog`                                                                                                                                                            |
| Text styles     | `body/lg/regular`, `body/md/medium`                                                                                                                                        |

### Variant matrix

| placement | size | size    | fill | stroke | effect          | text                                           | icon |
| --------- | ---- | ------- | ---- | ------ | --------------- | ---------------------------------------------- | ---- |
| top       | md   | 320×100 |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| top       | sm   | 240×76  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| bottom    | sm   | 240×76  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| bottom    | md   | 320×100 |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| left      | md   | 330×90  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| left      | sm   | 250×66  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| right     | sm   | 250×66  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |
| right     | md   | 330×90  |      |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary` |      |

## Documentation card

**Usage**

Anchored overlay with an arrow for rich content — a title, body text and optionally controls — opened from a trigger. Uses shadow/overlay at the overlay z level; dismisses on Esc or outside click; focus moves into it only when it contains controls.

**Anatomy**

Top-level layers of the first variant: Content · Tip. Instances keep their SOLAR component names.

**Specification**

8 variants.  
• placement — top | bottom | left | right  
• size — sm | md  
Props: title (text), body (text).

**Related**

For a one-line hint use Tooltip; for a list of actions use Dropdown.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
