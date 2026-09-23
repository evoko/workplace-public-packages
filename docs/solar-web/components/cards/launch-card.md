# Launch Card

> SOLAR Web · Figma page `↳ 🟢 Launch Card` (id `10395:6`) · section `components/cards` · raw data: [`raw/components/cards/launch-card.json`](../../raw/components/cards/launch-card.json)

## Component set: Launch Card

App launch tile: cover image + favourite, App Icon, name, description, Open/Learn more actions; access=false swaps in Request access. Companion Launch Card Full Screen on the same page. Migrated from Chatter Config 2026-09-01.

### Props

| Prop               | Type    | Options / default |
| ------------------ | ------- | ----------------- |
| `hover`            | variant | **false** · true  |
| `access`           | variant | **true** · false  |
| `favourite`        | boolean | default `true`    |
| `hasImage`         | boolean | default `true`    |
| `hasBodyText`      | boolean | default `true`    |
| `hasTag`           | boolean | default `false`   |
| `favouriteNoImage` | boolean | default `false`   |

Default variant: `hover=false, access=true` · 4 variants · default size 340×333px

### Anatomy (default variant)

- **hover=false, access=true** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 340×333  
  fill `color.surface.dialog` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.dialog`
  - **Image** · frame · row gap 20 pad 0/0/0/0 FILL/FIXED · 340×160  
    fill `IMAGE` ⚠️ hard-coded · itemSpacing `stack.lg` · prop visible←hasImage
    - **Favourite** · instance of **Icon Button** (size=sm, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.alpha.white-60` · strokeWeight `border.default` · radius `radius.pill` · prop visible←favourite
  - **Content** · frame · column gap 24 pad 16/16/16/16 FILL/HUG · 340×173  
    itemSpacing `stack.xl` · padding `stack.md`
    - **Text** · frame · column gap 12 pad 0/0/0/0 FILL/HUG · 308×77  
      itemSpacing `inset.sm`
      - **Headline** · frame · row gap 8 pad 0/0/0/0 FILL/FIXED · 308×24  
        itemSpacing `inset.xs`
        - **App Icon** · instance of **App Icon** (App=Workplace) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
          fill `IMAGE` ⚠️ hard-coded · itemSpacing `spatial.scale.0` · padding `spatial.scale.0` · radius `spatial.border-radius.md`
        - **App name** · text `title/xs` "App name" · FILL/HUG · 276×12  
          fill `color.text.primary` · lineHeight `type.line-height.title.xs` · fontFamily `type.font-family.inter` · fontSize `type.size.title.xs` · fontStyle `type.font-weight.500`
        - ~~**Tag**~~ (hidden by default) · instance of **Tag** (status=success, type=text-only, invert=false) · row gap 4 pad 0/12/0/12 HUG/FIXED · 55×24  
          fill `color.surface.feedback.success.subtle` · stroke `color.border.feedback.success.subtle` 1px · itemSpacing `inset.2xs` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.pill` · prop visible←hasTag
        - ~~**FavouriteNoImage**~~ (hidden by default) · instance of **Icon Button** (size=sm, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
          fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.pill` · prop visible←favouriteNoImage
      - **Body** · text `body/sm/regular` "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam orci ipsum, pul" · FILL/HUG · 308×41  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400` · prop visible←hasBodyText
    - **Button Group** · instance of **Button Group** (orientation=horizontal, type=regular) · row gap 8 pad 0/0/0/0 FIXED/HUG · 310×40  
      itemSpacing `inset.xs` · padding `inset.none`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.tertiary.bg.default`, `color.surface.dialog`, `color.surface.feedback.success.subtle`, `color.alpha.white-60`                                                  |
| Strokes         | `color.border.feedback.success.subtle`, `color.border.subtle`                                                                                                                |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`                      |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`                                                             |
| Spacing         | `spatial.scale.0`, `inset.2xs`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.md`, `stack.xl`                                                                     |
| Radius          | `spatial.border-radius.md`, `radius.dialog`, `radius.pill`                                                                                                                   |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.sm`, `type.line-height.title.xs`, `type.size.body.sm`, `type.size.title.xs` |
| Text styles     | `body/sm/regular`, `title/xs`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                                        | Controlled property | Prop               |
| -------------------------------------------- | ------------------- | ------------------ |
| Image                                        | visible             | `hasImage`         |
| Image › Favourite                            | visible             | `favourite`        |
| Content › Text › Headline › Tag              | visible             | `hasTag`           |
| Content › Text › Headline › FavouriteNoImage | visible             | `favouriteNoImage` |
| Content › Text › Body                        | visible             | `hasBodyText`      |

### Composes

- App Icon
- Button Group
- Icon Button
- Tag

### Variant matrix

| hover | access | size    | fill                   | stroke                | effect | text                                                                                                                                                            | icon                                                                                                                 |
| ----- | ------ | ------- | ---------------------- | --------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| false | true   | 340×333 | `color.surface.dialog` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.text.secondary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| true  | true   | 340×333 | `color.surface.dialog` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.text.secondary`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.primary.icon.default`<br>`color.action.secondary.icon.default` |
| false | false  | 340×333 | `color.surface.dialog` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`                                        |
| true  | false  | 340×333 | `color.surface.dialog` | `color.border.subtle` |        | `color.text.primary`<br>`color.text.feedback.success`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default` | `color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`                                        |

### Issues detected

- Primitive color bound directly (CLR-002): `color.alpha.white-60`.

## Component: Launch Card Full Screen

Expanded app detail layout: image slot, app identity, intro + feature copy, Open action. Companion to Launch Card. Migrated from Chatter Config 2026-09-01.

### Anatomy (default variant)

- **Launch Card Full Screen** · component · row gap 28 pad 20/20/20/20 FIXED/HUG · 979×460  
  fill `color.surface.raised` · itemSpacing `inset.2xl` · padding `inset.lg` · radius `radius.dialog`
  - **Image** · frame · FIXED/FIXED · 520×420  
    fill `IMAGE` ⚠️ hard-coded · itemSpacing `stack.lg` · radius `radius.container`
  - **Text** · frame · column gap 16 pad 0/0/0/0 FILL/FIXED · 391×420  
    itemSpacing `inset.md`
    - **Content** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 391×347  
      itemSpacing `inset.md`
      - **Headline** · frame · row gap 16 pad 0/0/0/0 FILL/HUG · 391×40  
        itemSpacing `inset.md`
        - **App Icon** · instance of **App Icon** (App=Workplace) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
          fill `IMAGE` ⚠️ hard-coded · itemSpacing `spatial.scale.0` · padding `spatial.scale.0` · radius `spatial.border-radius.md`
        - **Favourite** · instance of **Icon Button** (size=md, shape=round, prio=tertiary, state=default) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
          fill `color.action.tertiary.bg.default` · strokeWeight `border.default` · radius `radius.pill`
      - **App name** · text `title/sm` "App name" · HUG/HUG · 93×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Body copy** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 391×260  
        itemSpacing `inset.md`
        - **Intro** · text `body/sm/regular` "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam orci ipsum, pul" · FILL/HUG · 391×41  
          fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
        - **Feature** · text `body/sm/regular` "Feature example 01 Curabitur suscipit mollis dolor vitae venenatis. Sed sagittis" · FILL/HUG · 391×57  
          fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600,Primitives:type.font-weight.400`
        - **Feature** · text `body/sm/regular` "Feature example 02 Suspendisse non mi eu elit consectetur faucibus. Donec vitae " · FILL/HUG · 391×57  
          fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600,Primitives:type.font-weight.400`
        - **Feature** · text `body/sm/regular` "Feature example 03 Nam rutrum convallis quam id vestibulum. Nulla eleifend neque" · FILL/HUG · 391×57  
          fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.600,Primitives:type.font-weight.400`
    - **Button** · instance of **Button** (size=md, prio=primary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      fill `color.action.primary.bg.default` · stroke `color.action.primary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control`

### Tokens used

| Role            | Tokens                                                                                                                                                                                               |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.primary.bg.default`, `color.action.tertiary.bg.default`, `color.surface.raised`                                                                                                        |
| Strokes         | `color.action.primary.border.default`                                                                                                                                                                |
| Text color      | `color.text.primary`                                                                                                                                                                                 |
| Spacing         | `spatial.scale.0`, `inset.2xl`, `inset.lg`, `inset.md`, `inset.sm`, `inset.xs`, `stack.lg`                                                                                                           |
| Radius          | `spatial.border-radius.md`, `radius.container`, `radius.control`, `radius.dialog`, `radius.pill`                                                                                                     |
| Border width    | `border.default`                                                                                                                                                                                     |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.font-weight.600`, `type.line-height.body.sm`, `type.line-height.title.sm`, `type.size.body.sm`, `type.size.title.sm` |
| Effects         | `shadow/control`                                                                                                                                                                                     |
| Text styles     | `body/sm/regular`, `title/sm`                                                                                                                                                                        |

### Composes

- App Icon
- Button
- Icon Button

## Documentation card

**Description**

App tile for launch surfaces: cover image with favourite action, App Icon and name, short description and a Button Group. The page also carries Launch Card Full Screen, the expanded detail layout with feature copy.

**Anatomy**

340×325 card on surface/dialog with radius/dialog. Image area (surface/muted) with a round tertiary Icon Button favourite on color/alpha/white-60; content with App Icon + title/xs name, body/sm description, Button Group. Full Screen: 979×460 surface/raised, image slot left, intro + three feature paragraphs and a md Open button right.

**Variants & props**

hover (2) false · true — reserved for hover styling; currently identical to default  
access (2) true (Open + Learn more) · false (Request access + Learn more)  
Booleans: favourite · hasImage · hasBodyText · hasTag · favouriteNoImage

**Usage**

Use access=false for apps outside the user’s license.  
Keep descriptions to two lines.  
Use Full Screen for the app detail overlay, not in grids.

**Rules**

- DO: Use official product names and App Icons
- DO: Keep Open as the only primary action
- DO: Show Request access when access=false

DON’T Show two primary buttons  
DON’T Hide the Learn more path  
DON’T Use for non-app content (use Card)
