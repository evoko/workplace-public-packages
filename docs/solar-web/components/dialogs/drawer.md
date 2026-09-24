# Drawer

> SOLAR Web · Figma page `↳ 🟢 Drawer` (id `2202:1222`) · section `components/dialogs` · raw data: [`raw/components/dialogs/drawer.json`](../../raw/components/dialogs/drawer.json)

## Component: Drawer

Panel that slides in from the viewport edge for a secondary task that keeps the page in context — filters, quick edits, settings. Single variant; title is a text prop, content is a slot, hasCTA toggles the footer Button Group. Traps focus like a dialog; Esc closes and focus returns to the trigger. Use Dialog when the task must finish before the page continues; use Detail Side Panel for read-only detail.

### Props

| Prop      | Type    | Options / default         |
| --------- | ------- | ------------------------- |
| `title`   | text    | default `Drawer Title`    |
| `content` | slot    | default `[object Object]` |
| `hasCTA`  | boolean | default `true`            |

### Anatomy (default variant)

- **Drawer** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 348×800  
  fill `color.surface.raised` · stroke `color.border.surface` mixedpx · effect `shadow/overlay` · strokeWeight `border.default` · radius `radius.dialog`
  - **Header** · frame · row gap 0 pad 8/20/8/20 FILL/FIXED · 348×56  
    stroke `color.border.surface` mixedpx · padding `inset.lg`, `inset.xs` · strokeWeight `border.default`
    - **Title** · text `body/lg/medium` "Drawer Title" · FILL/HUG · 268×12  
      fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500` · prop characters←title
    - **Icon Button** · instance of **Icon Button** (size=md, shape=square, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
      fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.control`
  - **content** · slot · column gap 12 pad 16/20/16/20 FILL/FILL · 348×696  
    itemSpacing `stack.sm` · padding `inset.lg`, `inset.md` · prop slotContentId←content
    - **Body** · text `body/md/regular` "Drawer content goes here. Add forms, lists, or any content." · FILL/HUG · 308×30  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 348×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default` · prop visible←hasCTA

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.default`, `color.surface.raised`                                                                                                                 |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                               |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.xs`, `stack.sm`                                                                                                               |
| Radius          | `radius.control`, `radius.dialog`                                                                                                                                          |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md` |
| Effects         | `shadow/overlay`                                                                                                                                                           |
| Text styles     | `body/lg/medium`, `body/md/regular`                                                                                                                                        |

### Slots and prop-controlled layers

| Layer          | Controlled property | Prop      |
| -------------- | ------------------- | --------- |
| Header › Title | characters          | `title`   |
| content        | slotContentId       | `content` |
| Button Group   | visible             | `hasCTA`  |

### Composes

- Button Group
- Icon Button

## Documentation card

**Usage**

Panel that slides in from the viewport edge for a secondary task that keeps the page in context — filters, quick edits, settings. Traps focus like a dialog; Esc closes and focus returns to the trigger.

**Anatomy**

Top-level layers of the component: Header · content · Button Group. Instances keep their SOLAR component names.

**Specification**

Single component.  
Props: title (text), content (slot), hasCTA (boolean).

**Related**

Use Dialog when the task must finish before the page continues; use Detail Side Panel for read-only detail.

**Accessibility**

Single variant; title is a text prop, content is a slot, hasCTA toggles the footer Button Group.
