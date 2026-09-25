# Top Bar

> SOLAR Web · Figma page `↳ 🟢 Top Bar` (id `2163:3678`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/top-bar.json`](../../raw/patterns/layout-shell/top-bar.json)

## Component set: Top Bar

App-wide header: App Name, GlobalSearch, a set of Nav Items, tenant switcher and account Avatar. 6 variants: breakpoint (desktop, mobile) × hasSidebar (true, false) × isLoggedIn (true, false), shipped as the used combinations only. Props: hasTenantSwitcher, hasSearchField, hasNotifications (booleans). It is the banner landmark; the app name links home and the search opens Search Results Panel.

### Props

| Prop                | Type    | Options / default    |
| ------------------- | ------- | -------------------- |
| `breakpoint`        | variant | mobile · **desktop** |
| `hasSidebar`        | variant | false · **true**     |
| `isLoggedIn`        | variant | **true** · false     |
| `hasTenantSwitcher` | boolean | default `true`       |
| `hasSearchField`    | boolean | default `true`       |
| `hasNotifications`  | boolean | default `true`       |

Default variant: `breakpoint=desktop, hasSidebar=true, isLoggedIn=true` · 6 variants · default size 1440×56px

### Anatomy (default variant)

- **breakpoint=desktop, hasSidebar=true, isLoggedIn=true** · component · row gap 12 pad 0/16/0/16 FILL/FIXED · 1440×56  
  fill `color.surface.background` · itemSpacing `inset.sm` · padding `stack.md`
  - **App Name** · instance of **App Name** (type=vertical) · row gap 12 pad 0/0/0/0 HUG/HUG · 131×32  
    itemSpacing `inset.sm` · padding `inset.none` · radius `radius.control`
  - **GlobalSearch** · instance of **GlobalSearch** (state=default, size=md) · row gap 12 pad 0/12/0/12 FIXED/FIXED · 320×40  
    fill `color.surface.background` · stroke `color.border.subtle` 1px · itemSpacing `inset.sm` · padding `inset.sm`, `inset.none` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasSearchField
  - **Right Zone** · frame · row gap 20 pad 0/0/0/0 HUG/HUG · 417×40  
    itemSpacing `inset.lg`
    - **Container** · frame · row gap 0 pad 0/0/0/0 HUG/HUG · 160×40  
      itemSpacing `stack.none`
      - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false, focus=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
      - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false, focus=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
      - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false, focus=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        itemSpacing `inset.none` · padding `inset.none` · radius `radius.control` · prop visible←hasNotifications
      - **Nav Item** · instance of **Nav Item** (selected=false, hover=false, expanded=false, focus=false) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 40×40  
        itemSpacing `inset.none` · padding `inset.none` · radius `radius.control`
    - **Field** · frame · row gap 8 pad 0/12/0/8 HUG/FIXED · 185×40  
      fill `color.surface.background` · stroke `color.border.subtle` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none`, `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasTenantSwitcher
      - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
        height `icon.md`
      - **Avatar** · instance of **Avatar** (size=sm, type=logo, color=neutral, shade=Logo) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
        fill `IMAGE` ⚠️ hard-coded · radius `radius.control`
      - **Label** · text `body/md/medium` "Acme Hospitality" · HUG/HUG · 109×10  
        fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
      - ~~**Icon/None**~~ (hidden by default) · instance of **Icon/None** (solid=false) · FIXED/FIXED · 20×20  
        height `icon.md`
      - **Icon/ChevronDown** · instance of **Icon/ChevronDown** (solid=false) · FIXED/FIXED · 16×16  
        height `icon.sm`
    - **Avatar** · instance of **Avatar** (size=md, type=text, color=purple, shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.purple.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`

### Tokens used

| Role            | Tokens                                                                                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.background`, `color.purple.50`                                                                                                                     |
| Strokes         | `color.border.subtle`                                                                                                                                             |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.inverse`, `color.text.primary`, `color.text.tertiary`, `color.purple.700` |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`                   |
| Spacing         | `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.none`                                                                                        |
| Radius          | `radius.control`, `radius.pill`                                                                                                                                   |
| Border width    | `border.default`                                                                                                                                                  |
| Sizes           | `icon.md`, `icon.sm`                                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.md`, `type.size.body.md`                                                                 |
| Effects         | `shadow/control`                                                                                                                                                  |
| Text styles     | `body/md/medium`                                                                                                                                                  |

### Slots and prop-controlled layers

| Layer                             | Controlled property | Prop                |
| --------------------------------- | ------------------- | ------------------- |
| GlobalSearch                      | visible             | `hasSearchField`    |
| Right Zone › Container › Nav Item | visible             | `hasNotifications`  |
| Right Zone › Field                | visible             | `hasTenantSwitcher` |

### Composes

- App Name
- Avatar
- GlobalSearch
- Icon/ChevronDown
- Icon/None
- Nav Item

### Variant matrix

| breakpoint | hasSidebar | isLoggedIn | size    | fill                       | stroke | effect | text                                                                                                                                                  | icon                                                                                                           |
| ---------- | ---------- | ---------- | ------- | -------------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| desktop    | true       | true       | 1440×56 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.purple.700`                                                           | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.icon.primary`                                        |
| desktop    | true       | false      | 1440×56 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.tertiary`<br>`color.icon.secondary`<br>`color.action.primary.icon.default`                         |
| desktop    | false      | true       | 1440×56 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.purple.700`                                                           | `color.icon.primary`<br>`color.icon.tertiary`<br>`color.icon.secondary`                                        |
| desktop    | false      | false      | 1440×56 | `color.surface.background` |        |        | `color.text.primary`<br>`color.text.tertiary`<br>`color.text.inverse`<br>`color.action.primary.text.default`<br>`color.action.secondary.text.default` | `color.icon.primary`<br>`color.icon.tertiary`<br>`color.icon.secondary`<br>`color.action.primary.icon.default` |
| mobile     | true       | false      | 393×56  | `color.surface.background` |        |        | `color.text.primary`<br>`color.purple.700`                                                                                                            | `color.action.secondary.icon.default`                                                                          |
| mobile     | false      | false      | 393×56  | `color.surface.background` |        |        | `color.text.primary`<br>`color.purple.700`                                                                                                            | `color.icon.primary`                                                                                           |

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.50`, `color.purple.700`.

## Component set: App Name

Product identity block for the Top Bar: App Icon plus name. 3 variants: type (vertical, horizontal, app). vertical stacks icon over name, horizontal sets them inline, app is the icon alone for narrow bars. Use only inside Top Bar and App Switcher; the name text is the link label.

### Props

| Prop   | Type    | Options / default               |
| ------ | ------- | ------------------------------- |
| `type` | variant | **vertical** · horizontal · app |

Default variant: `type=vertical` · 3 variants · default size 131×32px

### Anatomy (default variant)

- **type=vertical** · component · row gap 12 pad 0/0/0/0 HUG/HUG · 131×32  
  itemSpacing `inset.sm` · padding `inset.none` · radius `radius.control`
  - **App Icon** · instance of **App Icon** (App=Workplace) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
    fill `IMAGE` ⚠️ hard-coded · itemSpacing `spatial.scale.0` · padding `spatial.scale.0` · radius `spatial.border-radius.md`
  - **Workplace** · text `display/xs/semibold` "Workplace" · HUG/HUG · 87×11  
    fill `color.text.primary` · lineHeight `type.line-height.20` · fontFamily `type.font-family.montserrat` · fontSize `type.size.display.xs`

### Tokens used

| Role            | Tokens                                                                       |
| --------------- | ---------------------------------------------------------------------------- |
| Strokes         | `color.border.subtle`                                                        |
| Text color      | `color.text.inverse`, `color.text.primary`                                   |
| Icon color      | `color.icon.primary`                                                         |
| Spacing         | `spatial.scale.0`, `inset.none`, `inset.sm`                                  |
| Radius          | `spatial.border-radius.md`, `radius.control`                                 |
| Typography vars | `type.font-family.montserrat`, `type.line-height.20`, `type.size.display.xs` |
| Effects         | `shadow/control`                                                             |
| Text styles     | `display/xs/semibold`                                                        |

### Composes

- App Icon

### Variant matrix

| type       | size   | fill | stroke                | effect           | text                 | icon                 |
| ---------- | ------ | ---- | --------------------- | ---------------- | -------------------- | -------------------- |
| vertical   | 131×32 |      |                       |                  | `color.text.primary` |                      |
| app        | 227×40 |      | `color.border.subtle` | `shadow/control` | `color.text.primary` | `color.icon.primary` |
| horizontal | 85×59  |      |                       |                  | `color.text.inverse` |                      |

## Compositions and examples on this page

### Label (frame, 48×10)

- ~~**Label**~~ (hidden by default) · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 48×10  
  itemSpacing `inset.2xs`
  - **Label** · text `label/md` "Label" · HUG/HUG · 36×10  
    fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
  - ~~**\***~~ (hidden by default) · text `label/md` "\*" · FIXED/FIXED · 8×10  
    fill `color.text.feedback.info` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`

## Documentation card

**Helper text**

**Usage**

App-wide header: App Name, GlobalSearch, a set of Nav Items, tenant switcher and account Avatar.

**Anatomy**

Top-level layers of the first variant: App Name · GlobalSearch · Right Zone. Instances keep their SOLAR component names.

**Specification**

6 variants.  
• breakpoint — mobile | desktop  
• hasSidebar — false | true  
• isLoggedIn — true | false  
Props: hasTenantSwitcher (boolean), hasSearchField (boolean), hasNotifications (boolean).  
Props: hasTenantSwitcher, hasSearchField, hasNotifications (booleans).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

It is the banner landmark; the app name links home and the search opens Search Results Panel.
