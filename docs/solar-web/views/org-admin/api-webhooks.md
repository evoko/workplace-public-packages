# API & Webhooks

> SOLAR Web · Figma page `↳ 🟢 API & Webhooks` (id `8366:10823`) · section `views/org-admin` · raw data: [`raw/views/org-admin/api-webhooks.json`](../../raw/views/org-admin/api-webhooks.json)

## Component set: API & Webhooks

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×744px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/FIXED · 1368×744  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.sm` · radius `radius.container`, `radius.none`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Tree Group Header** · instance of **Tree Group Header** · row gap 4 pad 0/8/0/8 FIXED/FIXED · 197×32  
      itemSpacing `inset.2xs` · padding `inset.xs` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Center** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1139×663  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
    - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1139×105  
      stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
    - **Body** · frame · column gap 24 pad 20/20/20/20 FILL/HUG · 1139×558  
      itemSpacing `stack.xl` · padding `stack.lg`
      - **API keys** · frame · column gap 20 pad 0/0/0/0 FIXED/HUG · 640×215  
        itemSpacing `stack.lg`
        - **SectionHeader** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 640×41  
          itemSpacing `stack.md`
          - **Title** · text `title/sm` "API keys" · FILL/HUG · 640×15  
            fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
          - **Secret keys for server-to-server access.** · text `body/md/regular` "Secret keys for server-to-server access." · FILL/HUG · 640×10  
            fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
        - **Table** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 640×154
          - **Header** · frame · row gap 16 pad 12/0/12/0 FILL/HUG · 640×40  
            itemSpacing `stack.md` · padding `stack.sm`
            - **cell** · text `body/md/medium` "Name" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
            - **cell** · text `body/md/medium` "Key" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
            - **cell** · text `body/md/medium` "Created" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
            - **cell** · text `body/md/medium` "Last used" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.500`
            - **end** · frame · row gap 0 pad 0/0/0/0 FILL/FIXED · 115×16
          - **Rectangle** · rectangle · FILL/FIXED · 640×1  
            fill `color.border.subtle`
          - **Row** · frame · row gap 16 pad 12/0/12/0 FILL/HUG · 640×56  
            itemSpacing `stack.md` · padding `stack.sm`
            - **cell** · text `label/md` "Production" · FILL/HUG · 115×10  
              fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
            - **cell** · text `body/md/regular` "sk*live*••••3f9a" · FILL/HUG · 115×10  
              fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **cell** · text `body/md/regular` "04 Feb 2026" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **cell** · text `body/md/regular` "2 min ago" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **end** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 115×32
          - **Rectangle** · rectangle · FILL/FIXED · 640×1  
            fill `color.border.subtle`
          - **Row** · frame · row gap 16 pad 12/0/12/0 FILL/HUG · 640×56  
            itemSpacing `stack.md` · padding `stack.sm`
            - **cell** · text `label/md` "CI pipeline" · FILL/HUG · 115×10  
              fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
            - **cell** · text `body/md/regular` "sk*live*••••71c2" · FILL/HUG · 115×10  
              fill `color.text.primary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **cell** · text `body/md/regular` "22 Nov 2025" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **cell** · text `body/md/regular` "Yesterday" · FILL/HUG · 115×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
            - **end** · frame · row gap 0 pad 0/0/0/0 FILL/HUG · 115×32
      - **Webhook endpoints** · frame · column gap 0 pad 0/0/0/0 FIXED/HUG · 640×211
        - **head** · frame · row gap 16 pad 20/0/20/0 FILL/HUG · 640×81  
          padding `stack.lg`
          - **SectionHeader** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 538×41  
            itemSpacing `stack.md`
            - **Title** · text `title/sm` "Webhook endpoints" · FILL/HUG · 538×15  
              fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
            - **Receive event notifications at these URLs.** · text `body/md/regular` "Receive event notifications at these URLs." · FILL/HUG · 538×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
          - **Button** · instance of **Button** (size=sm, prio=secondary, state=default, danger=false) · row gap 8 pad 0/8/0/8 HUG/FIXED · 102×32  
            stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.xs` · strokeWeight `border.default` · radius `radius.control`
        - **Rectangle** · rectangle · FILL/FIXED · 640×1  
          fill `color.border.subtle`
        - **Webhook Row** · frame · row gap 16 pad 20/0/20/0 FILL/HUG · 640×64  
          padding `stack.lg`
          - **t** · frame · column gap 4 pad 0/0/0/0 FILL/HUG · 587×24  
            itemSpacing `stack.2xs`
            - **Title** · text `label/md` "https://hooks.acme.com/biamp" · FILL/HUG · 587×10  
              fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
            - **Sub** · text `body/md/regular` "device.fault · subscription.updated" · FILL/HUG · 587×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
          - **status** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 53×10  
            itemSpacing `stack.2xs`
            - **StatusIndicator** · instance of **StatusIndicator** (type=success, size=xs) · FIXED/FIXED · 8×8  
              fill `color.surface.feedback.success.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
            - **Title** · text `label/md` "Active" · HUG/HUG · 41×10  
              fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
        - **Rectangle** · rectangle · FILL/FIXED · 640×1  
          fill `color.border.subtle`
        - **Webhook Row** · frame · row gap 16 pad 20/0/20/0 FILL/HUG · 640×64  
          padding `stack.lg`
          - **t** · frame · column gap 4 pad 0/0/0/0 FILL/HUG · 579×24  
            itemSpacing `stack.2xs`
            - **Title** · text `label/md` "https://ops.acme.com/ingest" · FILL/HUG · 579×10  
              fill `color.text.primary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
            - **Sub** · text `body/md/regular` "all events" · FILL/HUG · 579×10  
              fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
          - **status** · frame · row gap 4 pad 0/0/0/0 HUG/HUG · 61×10  
            itemSpacing `stack.2xs`
            - **StatusIndicator** · instance of **StatusIndicator** (type=neutral, size=xs) · FIXED/FIXED · 8×8  
              fill `color.surface.feedback.neutral.strong` · stroke `color.border.medium` 1px · strokeWeight `border.default` · radius `radius.pill`
            - **Title** · text `label/md` "Paused" · HUG/HUG · 49×10  
              fill `color.text.secondary` · lineHeight `type.line-height.label.md` · fontFamily `type.font-family.inter` · fontSize `type.size.label.md` · fontStyle `type.font-weight.500`
      - **Banner** · instance of **Banner** (Variant=default) · row gap 12 pad 12/12/12/12 FIXED/FIXED · 640×44  
        fill `color.surface.feedback.neutral.medium` · itemSpacing `inset.sm` · padding `inset.sm`
  - ~~**Right**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 336×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none`

### Tokens used

| Role            | Tokens                                                                                                                                                                                                                           |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.border.subtle`, `color.surface.active`, `color.surface.base`, `color.surface.feedback.neutral.medium`, `color.surface.feedback.neutral.strong`, `color.surface.feedback.success.strong`, `color.surface.raised`           |
| Strokes         | `color.action.secondary.border.default`, `color.border.medium`, `color.border.subtle`                                                                                                                                            |
| Text color      | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.action.tertiary.text.danger.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`      |
| Icon color      | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.danger.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900` |
| Spacing         | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.2xs`, `stack.lg`, `stack.md`, `stack.none`, `stack.sm`, `stack.xl`, `stack.xs`                                                                             |
| Radius          | `radius.container`, `radius.control`, `radius.none`, `radius.pill`                                                                                                                                                               |
| Border width    | `border.default`                                                                                                                                                                                                                 |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.label.md`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.label.md`, `type.size.title.sm`  |
| Effects         | `shadow/control`                                                                                                                                                                                                                 |
| Text styles     | `body/md/medium`, `body/md/regular`, `label/md`, `title/sm`                                                                                                                                                                      |
| Other           | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                                          |

### Composes

- Banner
- Button
- Page Header
- Section Nav Item
- StatusIndicator
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                                    | icon                                                                                                                                                                                                                  |
| ---------- | -------- | -------------------- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×744 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.action.tertiary.text.danger.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.action.tertiary.icon.danger.default`                  |
| mobile     | 377×744  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.tertiary.text.danger.default`<br>`color.action.secondary.text.default` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.tertiary.icon.danger.default`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded gap `16px` on layer _Center › Body › Webhook endpoints › head_
- Hard-coded gap `16px` on layer _Center › Body › Webhook endpoints › Webhook Row_
- Hard-coded gap `16px` on layer _Center › Body › Webhook endpoints › Webhook Row_

## Documentation card

**Description**

Manage org-level API keys and webhook endpoints — create, scope, rotate and monitor delivery. Personal tokens live in Linked Accounts & API Tokens.

**Layout**

Two sections: API keys (table: name · scope · created · rotate / revoke) · Webhooks (endpoint · events · status · test / delivery log).

**Responsive**

Desktop tables; mobile stacked cards.

**States**

loaded, empty, creating (secret shown once), rotating / revoking (confirm), webhook failing (error), test.

**Accessibility**

Secret shown once with copy + warning; rotate / revoke confirmed; delivery status as text. Tables labelled; keyboard-complete.

**Rules**

Show a secret once with copy  
Scope keys minimally  
Confirm rotate / revoke  
Surface webhook failures

Re-display secrets  
Grant broad scope by default  
Revoke without confirm  
Hide delivery errors
