# Account Settings

> SOLAR Web · Figma page `↳ 🟢 Account Settings` (id `5066:10`) · section `views/account` · raw data: [`raw/views/account/account-settings.json`](../../raw/views/account/account-settings.json)

## Component set: Account Settings

### Props

| Prop   | Type    | Options / default                                                                                                                                        |
| ------ | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` | variant | Connected Apps · Security &Sign-in · Devices & Sessions · Host-Provided · Language & Region · Notifications · Preferences · Privacy & Data · **Profile** |

Default variant: `type=Profile` · 9 variants · default size 712×740px

### Anatomy (default variant)

- **type=Profile** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 712×740  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Header** · frame · column gap 8 pad 8/8/8/8 FILL/HUG · 712×56  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default`
    - **Text** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 696×40
      - **Icon** · frame · row gap 8 pad 0/0/0/0 FIXED/FIXED · 36×36  
        itemSpacing `stack.xs`
      - **Title** · text `title/sm` "Account Settings" · FILL/HUG · 620×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        strokeWeight `border.default` · radius `radius.pill`
  - **Container** · frame · row gap 0 pad 0/0/0/0 FILL/FILL · 712×684
    - **Tree** · frame · column gap 0 pad 12/8/12/8 FIXED/FILL · 200×684  
      fill `color.surface.background` · stroke `color.border.subtle` mixedpx · itemSpacing `inset.none`
      - **Tree Item** · instance of **Tree Item** (selected=true, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        fill `color.surface.active` · itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
      - **Tree Item** · instance of **Tree Item** (selected=false, expanded=false, state=default) · row gap 4 pad 0/8/0/4 FILL/FIXED · 184×32  
        itemSpacing `inset.2xs` · padding `inset.2xs`, `inset.xs` · radius `radius.control`
    - **Container** · frame · column gap 0 pad 0/0/0/0 FILL/FILL · 512×684
      - **Container** · frame · column gap 20 pad 24/24/24/24 FILL/FILL · 512×620  
        itemSpacing `stack.lg`
      - **Button Group** · instance of **Button Group** (orientation=horizontal, type=regular) · row gap 8 pad 12/12/12/12 FILL/HUG · 512×64  
        stroke `color.border.subtle` mixedpx · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default`

Instance census (tree capped at depth 3): Icon/None ×37, StatusIndicator ×18, Counter ×13, Tree Item ×9, .Tree Indent ×9, Icon/ChevronRight ×9, Checkbox ×9, Tag ×9, Icon Button ×4, Button ×4, Spinner ×4, Text Input ×4, FormRow ×2, Icon/Empty ×1, Icon/More ×1, Icon/Plus ×1, Avatar ×1, Icon/Repeat ×1, Select ×1, Icon/ChevronDown ×1, Text Area ×1, Button Group ×1

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.active`, `color.surface.background`, `color.surface.dialog`                                                                                                                                                                                                                                                                                                                                            |
| Strokes         | `color.border.subtle`                                                                                                                                                                                                                                                                                                                                                                                                 |
| Text color      | `color.action.primary.text.default`, `color.action.primary.text.disabled`, `color.action.secondary.text.danger.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.default`, `color.text.feedback.danger`, `color.text.feedback.info`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.purple.700` |
| Icon color      | `color.action.primary.icon.default`, `color.action.primary.icon.disabled`, `color.action.secondary.icon.danger.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.inverse`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.neutral.900`                                                                                                  |
| Spacing         | `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.xs`                                                                                                                                                                                                                                                                                                                                             |
| Radius          | `radius.control`, `radius.dialog`, `radius.pill`                                                                                                                                                                                                                                                                                                                                                                      |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                                                                                                                      |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.title.sm`, `type.size.title.sm`                                                                                                                                                                                                                                                                                                                   |
| Effects         | `shadow/dialog`                                                                                                                                                                                                                                                                                                                                                                                                       |
| Text styles     | `title/sm`                                                                                                                                                                                                                                                                                                                                                                                                            |

### Composes

- Button Group
- Icon Button
- Tree Item

### Variant matrix

| type               | size    | fill                   | stroke | effect          | text                                                                                                                                                                                                                                                                                                                                                     | icon                                                                                                                                                                                                                                          |
| ------------------ | ------- | ---------------------- | ------ | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile            | 712×740 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.secondary`<br>`color.action.primary.text.disabled`<br>`color.purple.700`<br>`color.action.secondary.text.default`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`                             | `color.action.tertiary.icon.default`<br>`color.icon.primary`<br>`color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.icon.tertiary`<br>`color.action.primary.icon.disabled`<br>`color.action.primary.icon.default`       |
| Language & Region  | 712×526 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.feedback.info`<br>`color.action.tertiary.text.default`<br>`color.action.secondary.text.default`                                                                            | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                                        |
| Notifications      | 712×903 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.tertiary.text.default`<br>`color.action.secondary.text.default`                                                                                 | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.icon.inverse`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                         |
| Preferences        | 712×462 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.info`<br>`color.action.tertiary.text.default`<br>`color.action.secondary.text.default`                                                   | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |
| Security &Sign-in  | 712×851 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default`                                                                                 | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |
| Connected Apps     | 712×668 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default`                                                                                 | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |
| Devices & Sessions | 712×641 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.action.tertiary.text.default`                                                                                 | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |
| Privacy & Data     | 712×681 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.text.feedback.danger`<br>`color.action.secondary.text.danger.default`<br>`color.action.tertiary.text.default` | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.secondary.icon.danger.default`<br>`color.action.primary.icon.default` |
| Host-Provided      | 712×866 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.primary.text.disabled`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.text.feedback.neutral`<br>`color.action.tertiary.text.default`<br>`color.action.secondary.text.default`                                                | `color.action.tertiary.icon.default`<br>`color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`                                                 |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.purple.700`, `color.neutral.900`.
- Hard-coded paddingTop `12px` on layer _Container › Tree_
- Hard-coded paddingRight `8px` on layer _Container › Tree_
- Hard-coded paddingBottom `12px` on layer _Container › Tree_
- Hard-coded paddingLeft `8px` on layer _Container › Tree_
- Hard-coded paddingTop `24px` on layer _Container › Container › Container_
- Hard-coded paddingRight `24px` on layer _Container › Container › Container_
- Hard-coded paddingBottom `24px` on layer _Container › Container › Container_
- Hard-coded paddingLeft `24px` on layer _Container › Container › Container_

## Documentation card

**Description**

Personal account settings — security (password, MFA), sessions, notifications and preferences for the signed-in user.

**Layout**

Section Nav rail + content: grouped settings (Security · Notifications · Preferences) as Form Rows / toggles, with contextual save.

**Responsive**

Desktop: nav rail + panel. Mobile: full-width list drilling into each section.

**States**

loaded, editing, saving, saved, error. Sensitive changes may require re-auth (MFA Challenge).

**Accessibility**

Section Nav with aria-current; settings grouped with fieldset / legend; toggles labelled and their state announced. Keyboard-complete.

**Rules**

Group by security / notifications / prefs  
Re-auth for sensitive changes  
Give clear save feedback  
Explain each toggle

Mix org admin here  
Change security silently  
Hide the current values  
Rely on colour for state
