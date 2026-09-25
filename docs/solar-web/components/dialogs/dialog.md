# Dialog

> SOLAR Web · Figma page `↳ 🟢 Dialog` (id `2229:5930`) · section `components/dialogs` · raw data: [`raw/components/dialogs/dialog.json`](../../raw/components/dialogs/dialog.json)

## Component set: Dialog

Modal dialog centred over a scrim for a focused task or decision. 3 variants: type (default, image, wizard) — image adds a media header (show modal-image + image slot); wizard adds a Stepper for multi-step flows. title is a text prop, content is a slot, footer actions use a Button Group. role=dialog with aria-modal=true; focus is trapped, Esc closes, focus returns to the trigger. For two panes use Split Dialog; for a yes/no decision use Confirmation Dialog; for an edge-anchored panel use Drawer.

### Props

| Prop               | Type    | Options / default            |
| ------------------ | ------- | ---------------------------- |
| `type`             | variant | wizard · image · **default** |
| `image`            | slot    | default `[object Object]`    |
| `show modal-image` | boolean | default `true`               |
| `content`          | slot    | default `[object Object]`    |
| `title`            | text    | default `Dialog Title`       |

Default variant: `type=default` · 3 variants · default size 480×464px

### Anatomy (default variant)

- **type=default** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 480×464  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Header** · frame · column gap 8 pad 8/8/8/8 FILL/HUG · 480×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default`
    - **Text** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 464×40  
      itemSpacing `inset.md`
      - **Icon** · frame · row gap 8 pad 0/0/0/0 FIXED/FIXED · 36×36  
        itemSpacing `stack.xs`
        - **Icon/Empty** · instance of **Icon/Empty** (solid=false) · FIXED/FIXED · 12×12  
          height `icon.xs`
      - **Title** · text `title/sm` "Dialog Title" · FILL/HUG · 388×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500` · prop characters←title
      - **Icon Button** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        stroke `color.action.tertiary.border.default` 1px · strokeWeight `border.default` · radius `radius.pill`
  - **content** · slot · column gap 16 pad 20/20/20/20 FILL/FILL · 480×360  
    itemSpacing `stack.md` · padding `inset.lg` · prop slotContentId←content
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 480×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.dialog`                                                                                                                                                                                |
| Strokes         | `color.action.tertiary.border.default`, `color.border.subtle`                                                                                                                                         |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.default`, `color.action.secondary.text.disabled`, `color.text.primary`, `color.text.tertiary` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.secondary.icon.disabled`, `color.action.tertiary.icon.default`, `color.neutral.900`                         |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.xs`, `stack.md`, `stack.xs`                                                                                                                              |
| Radius          | `radius.dialog`, `radius.pill`                                                                                                                                                                        |
| Border width    | `border.default`                                                                                                                                                                                      |
| Sizes           | `icon.xs`                                                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`                                                                                                   |
| Effects         | `shadow/dialog`                                                                                                                                                                                       |
| Text styles     | `title/sm`                                                                                                                                                                                            |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop      |
| --------------------- | ------------------- | --------- |
| Header › Text › Title | characters          | `title`   |
| content               | slotContentId       | `content` |

### Composes

- Button Group
- Icon Button
- Icon/Empty

### Variant matrix

| type    | size    | fill                   | stroke | effect          | text                                                                                                                                                                                                            | icon                                                                                                                                         |
| ------- | ------- | ---------------------- | ------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| default | 480×464 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                                                                            | `color.neutral.900`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`  |
| image   | 480×452 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                                                                                            | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                         |
| wizard  | 480×464 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.tertiary`<br>`color.action.secondary.text.disabled`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.neutral.900`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.disabled`<br>`color.action.primary.icon.default` |

### Issues detected

- Primitive color bound directly (CLR-002): `color.neutral.900`.

## Documentation card

**Usage**

Modal dialog centred over a scrim for a focused task or decision.

**Anatomy**

Top-level layers of the first variant: Header · content · Button Group. Instances keep their SOLAR component names.

**Specification**

3 variants.  
• type — wizard | image | default  
Props: image (slot), show modal-image (boolean), content (slot), title (text).

**Related**

For two panes use Split Dialog; for a yes/no decision use Confirmation Dialog; for an edge-anchored panel use Drawer.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
