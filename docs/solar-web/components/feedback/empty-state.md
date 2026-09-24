# Empty State

> SOLAR Web · Figma page `↳ 🟢 Empty State` (id `2202:1224`) · section `components/feedback` · raw data: [`raw/components/feedback/empty-state.json`](../../raw/components/feedback/empty-state.json)

## Component: EmptyState

Placeholder for a view with nothing to show — icon, title, description and an optional call to action. Single variant; hasAction toggles the Button. The copy carries the meaning: say why it is empty and what to do next (first use, no results, error). Use inside tables, panels and full pages; for a loading placeholder use Skeleton or Spinner.

### Props

| Prop        | Type    | Options / default |
| ----------- | ------- | ----------------- |
| `hasAction` | boolean | default `true`    |

### Anatomy (default variant)

- **EmptyState** · component · column gap 16 pad 12/12/12/12 HUG/HUG · 247×144  
  itemSpacing `stack.md` · padding `inset.sm`
  - **Icon/None** · instance of **Icon/None** (solid=false) · FIXED/FIXED · 24×24  
    width `icon.lg`
  - **TextContent** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 223×32  
    itemSpacing `stack.sm`
    - **Title** · text `body/md/medium` "No items found" · FIXED/HUG · 161×10  
      fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Description** · text `body/md/regular` "Try adjusting your search or filters." · FIXED/HUG · 223×10  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 64×32  
    stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasAction

### Tokens used

| Role            | Tokens                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Strokes         | `color.action.secondary.border.default`                                                                                   |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                              |
| Spacing         | `inset.sm`, `inset.xs`, `stack.md`, `stack.sm`                                                                            |
| Radius          | `radius.control`                                                                                                          |
| Border width    | `border.default`                                                                                                          |
| Sizes           | `icon.lg`                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md` |
| Effects         | `shadow/control`                                                                                                          |
| Text styles     | `body/md/medium`, `body/md/regular`                                                                                       |

### Slots and prop-controlled layers

| Layer  | Controlled property | Prop        |
| ------ | ------------------- | ----------- |
| Button | visible             | `hasAction` |

### Composes

- Button
- Icon/None

## Documentation card

**EmptyState**

**Usage**

Placeholder for a view with nothing to show — icon, title, description and an optional call to action. The copy carries the meaning: say why it is empty and what to do next (first use, no results, error).

**Anatomy**

Top-level layers of the component: Icon/None · TextContent · Button. Instances keep their SOLAR component names.

**Specification**

Single component.  
Props: hasAction (boolean).

**Related**

Use inside tables, panels and full pages; for a loading placeholder use Skeleton or Spinner.

**Accessibility**

Single variant; hasAction toggles the Button.
