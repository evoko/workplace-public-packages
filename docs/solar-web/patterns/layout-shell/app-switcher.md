# App Switcher

> SOLAR Web · Figma page `↳ 🟢 App Switcher` (id `2966:620`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/app-switcher.json`](../../raw/patterns/layout-shell/app-switcher.json)

## Component: AppSwitcherItem

### Props

| Prop        | Type    | Options / default |
| ----------- | ------- | ----------------- |
| `hasButton` | boolean | default `true`    |

### Anatomy (default variant)

- **AppSwitcherItem** · component · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
  stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
  - **App Icon** · instance of **App Icon** (App=Workplace) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
    fill `IMAGE` ⚠️ hard-coded · itemSpacing `spatial.scale.0` · padding `spatial.scale.0` · radius `spatial.border-radius.md`
  - **Frame 6** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 204×10
    - **Title** · text `label/md` "App Name" · FILL/HUG · 204×10  
      fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
  - **SplitButton** · instance of **SplitButton** (prio=secondary, size=sm, state=default) · row gap 0 pad 0/0/0/0 HUG/FIXED · 88×32  
    fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasButton

### Tokens used

| Role            | Tokens                                                                                              |
| --------------- | --------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`                                                                 |
| Strokes         | `color.border.medium`, `color.border.subtle`                                                        |
| Text color      | `color.text.primary`                                                                                |
| Spacing         | `spatial.scale.0`, `inset.md`, `stack.sm`                                                           |
| Radius          | `spatial.border-radius.md`, `radius.control`, `radius.none`                                         |
| Border width    | `border.default`                                                                                    |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.label.md`, `type.size.label.md` |
| Effects         | `shadow/control`                                                                                    |
| Text styles     | `label/md`                                                                                          |

### Slots and prop-controlled layers

| Layer       | Controlled property | Prop        |
| ----------- | ------------------- | ----------- |
| SplitButton | visible             | `hasButton` |

### Composes

- App Icon
- SplitButton

### Issues detected

- Component description is empty.
- Hard-coded gap `8px` on layer _Frame 6_

## Component: App switcher

Panel listing the Biamp product suite, grouped into Web, Config and Desktop app slot groups with a ‘View all apps’ footer. Opens from the topbar grid icon. Items are AppSwitcherItem entries (App Icon, product name, SplitButton launch action). Scope to apps the user has access to; mark the current app as selected.

### Props

| Prop           | Type | Options / default         |
| -------------- | ---- | ------------------------- |
| `Desktop apps` | slot | default `[object Object]` |
| `Config Apps`  | slot | default `[object Object]` |
| `Web Apps`     | slot | default `[object Object]` |

### Anatomy (default variant)

- **App switcher** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 380×530  
  fill `color.surface.overlay` · stroke `color.border.subtle` 1px · effect `shadow/dialog` · strokeWeight `border.default` · radius `radius.dialog`
  - **Dropdown Group Label** · instance of **Dropdown Group Label** (Size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 380×34  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Web Apps** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×128  
    prop slotContentId←Web Apps
    - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
    - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
  - **Dropdown Group Label** · instance of **Dropdown Group Label** (Size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 380×34  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Config Apps** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×128  
    prop slotContentId←Config Apps
    - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
    - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
  - **Dropdown Group Label** · instance of **Dropdown Group Label** (Size=md) · row gap 8 pad 12/12/12/12 FILL/HUG · 380×34  
    fill `color.surface.background` · itemSpacing `inset.xs` · padding `inset.sm`
  - **Desktop apps** · slot · column gap 0 pad 0/0/0/0 FILL/HUG · 380×128  
    stroke `color.border.subtle` mixedpx · prop slotContentId←Desktop apps
    - **List** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 380×128
      - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
        stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
      - **AppSwitcherItem** · instance of **AppSwitcherItem** · row gap 12 pad 16/16/16/16 FIXED/HUG · 380×64  
        stroke `color.border.subtle` mixedpx · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.none`
  - **Footer** · frame · row gap 0 pad 16/20/16/20 FILL/HUG · 380×44  
    padding `inset.lg`, `inset.md`
    - **View all apps** · text `body/lg/medium` "View all apps" · HUG/HUG · 97×12  
      fill `color.text.link.default` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.surface.overlay`                                               |
| Strokes         | `color.border.subtle`                                                                             |
| Text color      | `color.text.link.default`                                                                         |
| Spacing         | `inset.lg`, `inset.md`, `inset.sm`, `inset.xs`, `stack.sm`                                        |
| Radius          | `radius.dialog`, `radius.none`                                                                    |
| Border width    | `border.default`                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.lg`, `type.size.body.lg` |
| Effects         | `shadow/dialog`                                                                                   |
| Text styles     | `body/lg/medium`                                                                                  |

### Slots and prop-controlled layers

| Layer        | Controlled property | Prop           |
| ------------ | ------------------- | -------------- |
| Web Apps     | slotContentId       | `Web Apps`     |
| Config Apps  | slotContentId       | `Config Apps`  |
| Desktop apps | slotContentId       | `Desktop apps` |

### Composes

- AppSwitcherItem
- Dropdown Group Label

## Compositions and examples on this page

### AppSwitcher (frame, 564×568)

Uses: App Icon ×8, AppSwitcherItem ×7, SplitButton ×7, Icon/ExternalLink ×7, Icon/None ×2, Button ×1, Spinner ×1, Counter ×1

- ~~**AppSwitcher**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/HUG · 564×568  
  fill `color.surface.dialog` · stroke `color.border.medium` 1px · effect `shadow/dialog` · itemSpacing `stack.none` · padding `inset.none` · strokeWeight `border.default` · radius `radius.dialog`
  - **Frame 11** · frame · column gap 8 pad 16/16/16/16 FILL/HUG · 564×124  
    stroke `color.border.subtle` mixedpx · padding `spatial.scale.4`
    - **Divider** · frame · row gap 12 pad 0/0/0/0 FILL/FIXED · 532×20  
      itemSpacing `stack.sm`
    - **AppSwitcherItem** · frame · row gap 12 pad 16/16/16/16 FILL/HUG · 532×64  
      fill `GRADIENT_LINEAR` ⚠️ hard-coded · stroke `color.border.subtle` 1px · itemSpacing `stack.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Frame 12** · frame · column gap 8 pad 16/16/16/16 FILL/HUG · 564×196  
    stroke `color.border.subtle` mixedpx · padding `spatial.scale.4`
    - **Divider** · frame · row gap 12 pad 0/0/0/0 FILL/FIXED · 532×20  
      itemSpacing `stack.sm`
    - **App Grid** · frame · grid gap 0 pad 0/0/0/0 FILL/HUG · 532×136
  - **Frame 13** · frame · column gap 8 pad 16/16/16/16 FILL/HUG · 564×124  
    stroke `color.border.subtle` mixedpx · padding `spatial.scale.4`
    - **Divider** · frame · row gap 12 pad 0/0/0/0 FILL/FIXED · 532×20  
      itemSpacing `stack.sm`
    - **App Grid** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 532×64
  - **Frame 14** · frame · column gap 8 pad 16/16/16/16 FILL/HUG · 564×124  
    padding `spatial.scale.4`
    - **Divider** · frame · row gap 12 pad 0/0/0/0 FILL/FIXED · 532×20  
      itemSpacing `stack.sm`
    - **App Grid** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 532×64

> Monitor and manage your entire AV infrastructure.

## Documentation card

**Description**

Panel surfacing the Biamp product suite, grouped into Web, Config and Desktop apps. Opens from the topbar grid icon. Scoped to products the user has access to.

**Sub-components**

App Switcher Panel container with three slot groups (Web / Config / Desktop apps), each under a Dropdown Group Label, plus a ‘View all apps’ footer.  
AppSwitcherItem Per-product entry: App Icon, product name, SplitButton launch action.

**Launch behavior**

Each item launches via its SplitButton: the primary action opens the app in the current context; the chevron menu offers alternate targets (e.g. open in a new tab). Prefer a new tab for apps that don’t share session state with the shell.

**Labels & Content**

Product name: official casing (‘Crowd Mics’ not ‘crowd mics’).  
Group labels: ‘Web apps’, ‘Config apps’, ‘Desktop apps’.  
Mark the current app as selected — do not hide it.

**Rules**

- DO: Scope to apps the user has access to
- DO: Mark the current app as selected
- DO: Use official product casing
- DO: Group apps under the Web / Config / Desktop labels

DON’T Show apps the user cannot access  
DON’T Hide the current app from the panel  
DON’T Mix product names with feature names  
DON’T Put settings or sign-out here (use Profile Dropdown)
