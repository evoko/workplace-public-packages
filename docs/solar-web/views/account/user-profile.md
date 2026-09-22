# User Profile

> SOLAR Web · Figma page `↳ 🟢 User Profile` (id `3768:10`) · section `views/account` · raw data: [`raw/views/account/user-profile.json`](../../raw/views/account/user-profile.json)

## Component set: User Profile

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×1462px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×1462  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Container** · frame · column gap 0 pad 0/0/16/0 FILL/HUG · 1368×173  
    stroke `color.border.surface` mixedpx · itemSpacing `inset.none` · padding `inset.md` · strokeWeight `border.default`
    - **Title Container** · frame · row gap 16 pad 24/0/24/0 FIXED/HUG · 640×117  
      itemSpacing `inset.md` · padding `inset.xl`
      - **Avatar** · instance of **Avatar** (size=lg, type=text, color=neutral, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 44×44  
        fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
      - **Name and Pronouns** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 580×69  
        itemSpacing `inset.md`
        - **Name and Pronouns Container** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 201×15  
          itemSpacing `inset.sm`
          - **Title** · text `title/sm` "Display Name" · HUG/HUG · 125×15  
            fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
          - **Title** · text `body/sm/regular` "(they/them)" · HUG/HUG · 64×9  
            fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
        - **Description** · text `body/md/regular` "Role · Team" · HUG/HUG · 74×10  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
        - **Additional Info** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 298×12  
          itemSpacing `inset.sm`
          - **Location Info** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 88×12  
            itemSpacing `inset.2xs`
            - **Icon/Location** · instance of **Icon/Location** (solid=false) · FIXED/FIXED · 12×12  
              height `icon.xs`
            - **Description** · text `body/sm/regular` "City, Country" · HUG/HUG · 72×9  
              fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
          - **Time Info** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 124×12  
            itemSpacing `inset.2xs`
            - **Icon/Clock** · instance of **Icon/Clock** (solid=false) · FIXED/FIXED · 12×12  
              height `icon.xs`
            - **Description** · text `body/sm/regular` "Local time · 5:32PM" · HUG/HUG · 108×9  
              fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
          - **Description** · text `body/sm/medium` "Active now" · HUG/HUG · 62×9  
            fill `color.text.feedback.success` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`
    - **Buttons Container** · frame · row gap 8 pad 0/0/0/0 FILL/HUG · 640×40  
      itemSpacing `inset.xs`
      - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 107×40  
        fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
      - **Button** · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 148×40  
        fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
      - **Button** · instance of **Button** (size=md, prio=primary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 120×40  
        fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
      - **Icon Button** · instance of **Icon Button** (size=md, shape=square, prio=secondary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        fill `color.action.secondary.bg.default` · stroke `color.border.medium` 1px · effect `shadow/control` · strokeWeight `border.default` · radius `radius.control`
  - **FormSection** · frame · column gap 20 pad 20/0/20/0 FILL/HUG · 640×141  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Contaner** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×101  
      itemSpacing `inset.xl`
      - **SectionHeader** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 640×101  
        itemSpacing `stack.md` · padding `stack.none`
        - **Title** · text `title/sm` "About" · FILL/HUG · 640×15  
          fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
        - **Description** · text `body/md/regular` "Short bio paragraph the person has written about themselves — what they do, what" · FILL/HUG · 640×30  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
        - **Skills Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 220×24  
          itemSpacing `inset.xs`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 68×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 68×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 68×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
      - ~~**Button**~~ (hidden by default) · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 108×40  
        fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`
  - **FormSection** · frame · column gap 20 pad 20/0/20/0 FILL/HUG · 640×147  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Title** · text `title/sm` "Contact" · FILL/HUG · 640×15  
      fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Contacts Container** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×72  
      itemSpacing `inset.xl`
      - **Email and Handle Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×72  
        itemSpacing `stack.sm`
        - **Email Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 152×16  
          itemSpacing `inset.xs`
          - **Icon/Email** · instance of **Icon/Email** (solid=false) · FIXED/FIXED · 16×16  
            height `icon.sm`
          - **Description** · text `link/md/default` "user@example.com" · HUG/HUG · 128×10  
            fill `color.text.link.default` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Handle Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 81×16  
          itemSpacing `inset.xs`
          - **Icon/Chat** · instance of **Icon/Chat** (solid=false) · FIXED/FIXED · 16×16  
            height `icon.sm`
          - **Description** · text `body/md/medium` "@handle" · HUG/HUG · 57×10  
            fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Working Hours Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 204×16  
          itemSpacing `inset.xs`
          - **Icon/Clock** · instance of **Icon/Clock** (solid=false) · FIXED/FIXED · 16×16  
            height `icon.sm`
          - **Description** · text `body/md/regular` "Working hours · 09:00–17:00" · HUG/HUG · 180×10  
            fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
      - **Phone and Timezone Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×44  
        itemSpacing `stack.sm`
        - **Phone Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 137×16  
          itemSpacing `inset.xs`
          - **Icon/Phone** · instance of **Icon/Phone** (solid=false) · FIXED/FIXED · 16×16  
            height `icon.sm`
          - **Description** · text `body/md/regular` "+0 000 000 0000" · HUG/HUG · 113×10  
            fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
        - **Timezone Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 143×16  
          itemSpacing `inset.xs`
          - **Icon/Globe** · instance of **Icon/Globe** (solid=false) · FIXED/FIXED · 16×16  
            height `icon.sm`
          - **Description** · text `body/md/regular` "Timezone · UTC±0" · HUG/HUG · 119×10  
            fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **FormSection** · frame · column gap 20 pad 20/0/20/0 FILL/HUG · 640×195  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Title** · text `title/sm` "Organization" · FILL/HUG · 640×15  
      fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
    - **Reports and Direct Reports Container** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×54  
      itemSpacing `inset.xl`
      - **Reports Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×54  
        itemSpacing `stack.sm`
        - **Description** · text `body/md/medium` "Reports to" · HUG/HUG · 68×10  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Manager Info Container** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 139×32  
          itemSpacing `inset.xs`
          - **Avatar** · instance of **Avatar** (size=md, type=text, color=neutral, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
            fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
          - **Manager Info** · frame · column gap 8 pad 0/0/0/0 HUG/HUG · 99×27  
            itemSpacing `inset.xs`
            - **Description** · text `body/md/medium` "Manager Name" · HUG/HUG · 99×10  
              fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
            - **Description** · text `body/sm/regular` "Role" · HUG/HUG · 24×9  
              fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
      - **Direct Reports Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×54  
        itemSpacing `stack.sm`
        - **Description** · text `body/md/medium` "Direct reports · 3" · HUG/HUG · 108×10  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Direct Reports Info** · frame · row gap -8 pad 0/0/0/0 HUG/HUG · 80×32
          - **Avatar** · instance of **Avatar** (size=md, type=text, color=neutral, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
            fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
          - **Avatar** · instance of **Avatar** (size=md, type=text, color=neutral, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
            fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
          - **Avatar** · instance of **Avatar** (size=md, type=text, color=neutral, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
            fill `color.neutral.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **Teams and Spaces Container** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×46  
      itemSpacing `inset.xl`
      - **Teams Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×46  
        itemSpacing `stack.sm`
        - **Description** · text `body/md/medium` "Teams" · HUG/HUG · 43×10  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Teams Info** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 190×24  
          itemSpacing `inset.xs`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 91×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 91×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
      - **Spaces Container** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×46  
        itemSpacing `stack.sm`
        - **Description** · text `body/md/medium` "Sites / Spaces" · HUG/HUG · 92×10  
          fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
        - **Spaces Info** · frame · row gap 8 pad 0/0/0/0 HUG/HUG · 170×24  
          itemSpacing `inset.xs`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 81×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
          - **Tag** · instance of **Tag** (status=neutral, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 81×24  
            fill `color.surface.feedback.neutral.subtle` · stroke `color.border.medium` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill`
  - **FormSection** · frame · column gap 20 pad 20/0/20/0 FILL/HUG · 640×806  
    stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Recent Activity Header** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×15
      - **Title** · text `title/sm` "Recent Activity" · HUG/HUG · 137×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Title** · text `link/md/default` "View all" · HUG/HUG · 50×10  
        fill `color.text.link.default` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
    - **Recent Activity Feed** · instance of **Activity Feed** (breakpoint=desktop) · column gap 8 pad 0/0/0/0 FIXED/HUG · 640×731  
      itemSpacing `inset.xs`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                                                                                                               |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.action.secondary.bg.default`, `color.surface.feedback.neutral.subtle`, `color.neutral.50`                                                                                                                                                                                  |
| Strokes         | `color.action.primary.border.default`, `color.action.secondary.border.default`, `color.border.medium`, `color.border.subtle`, `color.border.surface`                                                                                                                                                                 |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.neutral`, `color.text.feedback.success`, `color.text.link.default`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.blue.700`, `color.neutral.700`, `color.purple.700`, `color.red.700` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.link.default`, `color.icon.primary`, `color.icon.secondary`                                                                                                                                                                  |
| Spacing         | `inset.2xs`, `inset.md`, `inset.none`, `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`, `stack.sm`                                                                                                                                                                                          |
| Radius          | `radius.container`, `radius.control`, `radius.none`, `radius.pill`                                                                                                                                                                                                                                                   |
| Border width    | `border.default`                                                                                                                                                                                                                                                                                                     |
| Sizes           | `icon.sm`, `icon.xs`                                                                                                                                                                                                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.body.sm`, `type.size.title.sm`                                                                                        |
| Effects         | `shadow/control`                                                                                                                                                                                                                                                                                                     |
| Text styles     | `body/md/medium`, `body/md/regular`, `body/sm/medium`, `body/sm/regular`, `link/md/default`, `title/sm`                                                                                                                                                                                                              |

### Composes

- Activity Feed
- Avatar
- Button
- Icon Button
- Icon/Chat
- Icon/Clock
- Icon/Email
- Icon/Globe
- Icon/Location
- Icon/Phone
- Tag

### Variant matrix

| breakpoint | size      | fill | stroke | effect | text                                                                                                                                                                                                                                                                                                                                       | icon                                                                                                                                                        |
| ---------- | --------- | ---- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×1462 |      |        |        | `color.neutral.700`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.feedback.neutral`<br>`color.text.link.default`<br>`color.blue.700`<br>`color.text.tertiary`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.link.default`<br>`color.icon.primary` |
| mobile     | 377×1524  |      |        |        | `color.neutral.700`<br>`color.text.primary`<br>`color.text.secondary`<br>`color.text.feedback.success`<br>`color.text.feedback.neutral`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.link.default`<br>`color.blue.700`<br>`color.text.tertiary`<br>`color.purple.700`<br>`color.red.700` | `color.icon.secondary`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.link.default`<br>`color.icon.primary` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.50`, `color.blue.700`, `color.neutral.700`, `color.purple.700`, `color.red.700`.
- Hard-coded gap `-8px` on layer _FormSection › Reports and Direct Reports Container › Direct Reports Container › Direct Reports Info_
- Hard-coded gap `24px` on layer _FormSection › Recent Activity Header_

## Documentation card

**Description**

The signed-in user's own profile — view and edit personal info, avatar and preferences. For self-service; admins edit others in Members.

**Layout**

Page header · avatar + name block · sections (personal info · contact · preferences) as Form Rows / Property List · Save actions.

**Responsive**

Desktop: two-column (nav + sections). Mobile: single column, stacked sections.

**States**

view (read), editing, saving, saved, error; inline field validation.

**Accessibility**

Sections are labelled regions with headings; fields labelled. Announce the save result. Keyboard-complete; visible focus.

**Rules**

Separate view vs edit clearly  
Save per section or with a clear Save  
Validate inline  
Confirm destructive changes

Mix self-profile with admin controls  
Auto-save without feedback  
Bury the avatar control  
Lose edits on navigation
