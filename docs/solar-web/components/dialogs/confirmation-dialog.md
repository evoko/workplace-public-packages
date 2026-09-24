# Confirmation Dialog

> SOLAR Web · Figma page `↳ 🟢 Confirmation Dialog` (id `4040:2`) · section `components/dialogs` · raw data: [`raw/components/dialogs/confirmation-dialog.json`](../../raw/components/dialogs/confirmation-dialog.json)

## Component set: ConfirmationDialog

Confirmation dialog for actions needing explicit approval. 'default' for safe actions, 'danger' for destructive actions. Uses real Button component instances.

### Props

| Prop          | Type    | Options / default                                                                    |
| ------------- | ------- | ------------------------------------------------------------------------------------ |
| `intent`      | variant | **default** · danger                                                                 |
| `title`       | text    | default `Are you sure?`                                                              |
| `description` | text    | default `This action will apply the changes you've made. You can modify them later.` |

Default variant: `intent=default` · 2 variants · default size 400×157px

### Anatomy (default variant)

- **intent=default** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 400×157  
  fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`
  - **Content** · frame · column gap 16 pad 24/20/24/20 FILL/HUG · 400×109  
    itemSpacing `stack.md` · padding `inset.lg`, `inset.xl`
    - **Title** · text `title/sm` "Are you sure?" · FILL/HUG · 360×15  
      fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500` · prop characters←title
    - **Description** · text `body/md/regular` "This action will apply the changes you've made. You can modify them later." · FILL/HUG · 360×30  
      fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400` · prop characters←description
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 400×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.dialog`                                                                                                                                                       |
| Strokes         | `color.border.subtle`                                                                                                                                                        |
| Text color      | `color.action.primary.text.danger.default`, `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.primary`, `color.text.secondary`         |
| Icon color      | `color.action.primary.icon.danger.default`, `color.action.primary.icon.default`, `color.action.secondary.icon.default`                                                       |
| Spacing         | `inset.lg`, `inset.none`, `inset.xl`, `stack.md`                                                                                                                             |
| Radius          | `radius.dialog`                                                                                                                                                              |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.title.sm` |
| Effects         | `shadow/dialog`                                                                                                                                                              |
| Text styles     | `body/md/regular`, `title/sm`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                 | Controlled property | Prop          |
| --------------------- | ------------------- | ------------- |
| Content › Title       | characters          | `title`       |
| Content › Description | characters          | `description` |

### Composes

- Button Group

### Variant matrix

| intent  | size    | fill                   | stroke | effect          | text                                                                                                                                                                         | icon                                                                                |
| ------- | ------- | ---------------------- | ------ | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| default | 400×157 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`                                               | `color.action.secondary.icon.default`<br>`color.action.primary.icon.default`        |
| danger  | 400×157 | `color.surface.dialog` |        | `shadow/dialog` | `color.text.primary`<br>`color.text.secondary`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.action.primary.text.danger.default` | `color.action.secondary.icon.default`<br>`color.action.primary.icon.danger.default` |

## Compositions and examples on this page

### Example in Context (frame, 1440×800)

Uses: Nav Item ×13, Icon/None ×6, Icon/Home ×2, Avatar ×2, Button ×2, Spinner ×2, Counter ×2, AppShell ×1, Top Bar ×1, App Name ×1, App Icon ×1, GlobalSearch ×1, Icon/Search ×1, Kbd ×1, Icon/AppSwitcher ×1, Icon/Notification ×1, Icon/HelpCircle ×1, Icon/ChevronDown ×1, Sidebar ×1, Icon/Location ×1, Icon/Zone ×1, Icon/Licenses ×1, Icon/Device ×1, Icon/Systems ×1, Icon/Admin ×1, Icon/Files ×1, Divider ×1, Icon/Support ×1, Icon/Panel ×1, Biamp Logo ×1, Scrim ×1, ConfirmationDialog ×1, Button Group ×1

- **Example in Context** · frame · 1440×800
  - **AppShell** · instance of **AppShell** (breakpoint=desktop) · column gap 0 pad 0/0/0/0 FIXED/HUG · 1440×800  
    fill `color.surface.background` · width `viewport.lg`
  - **Scrim** · instance of **Scrim** · 1440×800  
    fill `color.surface.scrim` · width `breakpoint.lg`
  - **ConfirmationDialog** · instance of **ConfirmationDialog** (intent=default) · column gap 0 pad 0/0/0/0 HUG/HUG · 400×157  
    fill `color.surface.dialog` · effect `shadow/dialog` · radius `radius.dialog`

> This action will apply the changes you've made. You can modify them later.

## Documentation card

**ConfirmationDialog**

**Usage**

Confirmation dialog for actions needing explicit approval. ’default’ for safe actions, ’danger’ for destructive actions. Uses real Button component instances.

**Anatomy**

Top-level layers of the first variant: Content · Button Group. Instances keep their SOLAR component names.

**Specification**

2 variants.  
• intent — default | danger  
Props: title (text), description (text).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
