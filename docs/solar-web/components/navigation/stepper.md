# Stepper

> SOLAR Web · Figma page `↳ 🟢 Stepper` (id `2163:3707`) · section `components/navigation` · raw data: [`raw/components/navigation/stepper.json`](../../raw/components/navigation/stepper.json)

## Component set: Stepper Indicator

The numbered or ticked circle that marks one step's status inside Stepper. 4 variants: status (upcoming, active, completed, error). Building block of Step; not used on its own.

### Props

| Prop     | Type    | Options / default                         |
| -------- | ------- | ----------------------------------------- |
| `status` | variant | **completed** · active · upcoming · error |

Default variant: `status=completed` · 4 variants · default size 24×24px

### Anatomy (default variant)

- **status=completed** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
  fill `color.surface.inverse` · strokeWeight `border.default` · radius `radius.pill`
  - **Icon/Check** · instance of **Icon/Check** (solid=false) · FIXED/FIXED · 16×16  
    height `icon.sm`

### Tokens used

| Role         | Tokens                                                                                |
| ------------ | ------------------------------------------------------------------------------------- |
| Fills        | `color.surface.base`, `color.surface.feedback.danger.strong`, `color.surface.inverse` |
| Strokes      | `color.border.medium`                                                                 |
| Text color   | `color.icon.inverse`, `color.text.inverse`, `color.text.secondary`                    |
| Icon color   | `color.icon.inverse`                                                                  |
| Radius       | `radius.pill`                                                                         |
| Border width | `border.default`                                                                      |
| Sizes        | `icon.sm`                                                                             |

### Composes

- Icon/Check

### Variant matrix

| status    | size  | fill                                   | stroke                | effect | text                   | icon                 |
| --------- | ----- | -------------------------------------- | --------------------- | ------ | ---------------------- | -------------------- |
| completed | 24×24 | `color.surface.inverse`                |                       |        |                        | `color.icon.inverse` |
| active    | 24×24 | `color.surface.inverse`                |                       |        | `color.text.inverse`   |                      |
| upcoming  | 24×24 | `color.surface.base`                   | `color.border.medium` |        | `color.text.secondary` |                      |
| error     | 24×24 | `color.surface.feedback.danger.strong` | `color.border.medium` |        | `color.icon.inverse`   |                      |

## Component set: Step

One step of a Stepper — indicator plus label. 8 variants: status (upcoming, active, complete, error) × type (round, horizontal). Building block of Stepper; not used on its own.

### Props

| Prop     | Type    | Options / default                        |
| -------- | ------- | ---------------------------------------- |
| `status` | variant | error · **complete** · active · upcoming |
| `type`   | variant | **round** · horizontal                   |

Default variant: `status=complete, type=round` · 8 variants · default size 26×41px

### Anatomy (default variant)

- **status=complete, type=round** · component · column gap 8 pad 0/0/0/0 HUG/HUG · 26×41  
  itemSpacing `inset.xs`
  - **Stepper Indicator** · instance of **Stepper Indicator** (status=completed) · row gap 0 pad 0/0/0/0 FIXED/FIXED · 24×24  
    fill `color.surface.inverse` · strokeWeight `border.default` · radius `radius.pill`
  - **Step** · text `body/sm/medium` "Step" · HUG/HUG · 26×9  
    fill `color.text.primary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.500`

### Tokens used

| Role            | Tokens                                                                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.inverse`                                                                                                                       |
| Text color      | `color.icon.inverse`, `color.text.feedback.danger`, `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color      | `color.icon.inverse`                                                                                                                          |
| Spacing         | `inset.xs`                                                                                                                                    |
| Radius          | `radius.pill`                                                                                                                                 |
| Border width    | `border.default`                                                                                                                              |
| Typography vars | `type.font-family.inter`, `type.font-weight.500`, `type.line-height.body.sm`, `type.size.body.sm`                                             |
| Text styles     | `body/sm/medium`                                                                                                                              |

### Composes

- Stepper Indicator

### Variant matrix

| status   | type       | size  | fill | stroke | effect | text                                                 | icon                 |
| -------- | ---------- | ----- | ---- | ------ | ------ | ---------------------------------------------------- | -------------------- |
| complete | round      | 26×41 |      |        |        | `color.text.primary`                                 | `color.icon.inverse` |
| complete | horizontal | 39×20 |      |        |        | `color.text.primary`                                 |                      |
| active   | round      | 26×41 |      |        |        | `color.text.inverse`<br>`color.text.primary`         |                      |
| active   | horizontal | 39×20 |      |        |        | `color.text.primary`                                 |                      |
| upcoming | round      | 26×41 |      |        |        | `color.text.secondary`<br>`color.text.primary`       |                      |
| upcoming | horizontal | 39×20 |      |        |        | `color.text.tertiary`                                |                      |
| error    | round      | 26×41 |      |        |        | `color.icon.inverse`<br>`color.text.feedback.danger` |                      |
| error    | horizontal | 39×20 |      |        |        | `color.text.feedback.danger`                         |                      |

## Component set: Stepper

Progress indicator for a linear multi-step flow — wizard, onboarding, device setup. 4 variants: type (line, with label, no label, line+text). Booleans showStep3, showStep4, showStep5 set the step count (2–5). Steps are informational unless the flow allows going back, in which case completed steps are links. Back/next buttons belong to the Multi-step Wizard pattern, not to Stepper. For non-linear sections use Tabs.

### Props

| Prop        | Type    | Options / default                            |
| ----------- | ------- | -------------------------------------------- |
| `type`      | variant | line · **with label** · no label · line+text |
| `showStep5` | boolean | default `true`                               |
| `showStep4` | boolean | default `true`                               |
| `showStep3` | boolean | default `true`                               |

Default variant: `type=with label` · 4 variants · default size 350×41px

### Anatomy (default variant)

- **type=with label** · component · column gap 0 pad 0/0/0/0 FILL/HUG · 350×41
  - **Progress** · frame · column gap 8 pad 0/225/0/0 FIXED/FIXED · 313×4  
    fill `color.surface.muted` · itemSpacing `stack.xs` · radius `radius.control`
    - **Rectangle 2** · rectangle · FIXED/FIXED · 153×4  
      fill `color.surface.inverse` · radius `radius.control`
  - **Steps** · frame · row gap 197 pad 0/0/0/0 FILL/HUG · 350×41
    - **Step** · instance of **Step** (status=complete, type=round) · column gap 8 pad 0/0/0/0 HUG/HUG · 26×41  
      itemSpacing `inset.xs`
    - **Step** · instance of **Step** (status=active, type=round) · column gap 8 pad 0/0/0/0 HUG/HUG · 26×41  
      itemSpacing `inset.xs`
    - **Step** · instance of **Step** (status=upcoming, type=round) · column gap 8 pad 0/0/0/0 HUG/HUG · 26×41  
      itemSpacing `inset.xs`

### Tokens used

| Role       | Tokens                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- |
| Fills      | `color.surface.inverse`, `color.surface.muted`                                            |
| Text color | `color.text.inverse`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color | `color.icon.inverse`                                                                      |
| Spacing    | `inset.xs`, `stack.xs`                                                                    |
| Radius     | `radius.control`                                                                          |

### Composes

- Step

### Variant matrix

| type       | size   | fill | stroke | effect | text                                                                   | icon                 |
| ---------- | ------ | ---- | ------ | ------ | ---------------------------------------------------------------------- | -------------------- |
| with label | 350×41 |      |        |        | `color.text.primary`<br>`color.text.inverse`<br>`color.text.secondary` | `color.icon.inverse` |
| no label   | 350×24 |      |        |        | `color.text.inverse`<br>`color.text.secondary`                         | `color.icon.inverse` |
| line       | 350×4  |      |        |        |                                                                        |                      |
| line+text  | 350×20 |      |        |        | `color.text.primary`<br>`color.text.tertiary`                          |                      |

### Issues detected

- Hard-coded paddingRight `225px` on layer _Progress_
- Hard-coded gap `197px` on layer _Steps_

## Issues detected (page)

- Documentation card contains Breadcrumbs boilerplate text; it does not describe this component.

## Documentation card

**Description**

Shows the user's location within a navigational hierarchy — and lets them jump back up the tree. Use for deep page structures where ancestors are meaningful destinations. Not for single-level flows (omit entirely), not for linear progress (use Stepper).

**Anatomy**

Breadcrumbs compose from Breadcrumb Items joined by a separator.  
Breadcrumb Item (4 variants) type: link | current — current is the final, non-interactive item.  
Breadcrumbs (5 variants) items: 2 | 3 | 4 | 5 | multiple — use 'multiple' when the trail exceeds 5 levels.

**States**

default Interactive ancestor link. Subtle text color.  
hover Full emphasis + underline. Touch targets pad to 44px per WCAG.  
disabled Non-interactive ancestor. Use sparingly — prefer omitting the item entirely.

**Truncation**

Switch to items=multiple once the trail exceeds 5 levels. The middle collapses to an ellipsis (…) while the first and last segments stay visible. Clicking the ellipsis opens a menu listing the hidden ancestors so users can jump to any of them without losing the endpoints.

**Accessibility**

Wrap the trail in `<nav aria-label="Breadcrumb">` and render as an ordered list.  
Mark the current item with aria-current="page" — never link it.  
Separators are decorative: aria-hidden="true".  
Keyboard: Tab moves between links, Enter activates. Ellipsis menu: Arrow keys to navigate, Esc to dismiss.
