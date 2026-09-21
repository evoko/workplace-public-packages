# SSO & SAML

> SOLAR Web · Figma page `↳ 🟢 SSO & SAML` (id `5066:21`) · section `views/org-admin` · raw data: [`raw/views/org-admin/sso-saml.json`](../../raw/views/org-admin/sso-saml.json)

## Component set: SSO & SAML

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | **desktop** · mobile |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×876px

### Anatomy (default variant)

- **breakpoint=desktop** · component · row gap 8 pad 0/0/0/0 FIXED/HUG · 1368×876  
  itemSpacing `stack.xs` · layoutGrids `grid.columns.lg,Space:stack.x-sm`
  - **Left** · frame · column gap 0 pad 12/12/12/12 FIXED/FILL · 221×876  
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
    - **Section Nav Item** · instance of **Section Nav Item** (state=selected) · row gap 8 pad 0/8/0/8 FILL/FIXED · 197×32  
      fill `color.surface.active` · itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
    - **Section Nav Item** · instance of **Section Nav Item** (state=default) · row gap 8 pad 0/8/0/8 HUG/FIXED · 220×32  
      itemSpacing `inset.xs` · padding `inset.xs`, `inset.none` · radius `radius.control`
  - **Center** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1139×876  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
    - **Members & Roles** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 1139×876  
      fill `color.surface.base`
      - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1139×105  
        stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
      - **Form** · frame · column gap 24 pad 8/20/24/20 FILL/HUG · 1139×771
  - ~~**Right**~~ (hidden by default) · frame · column gap 0 pad 0/0/0/0 FIXED/FIXED · 336×744  
    fill `color.surface.raised` · itemSpacing `stack.none` · padding `inset.none` · radius `radius.container`, `radius.none`

Instance census (tree capped at depth 3): Icon/None ×38, Counter ×15, Section Nav Item ×8, Tab Item ×8, Button ×7, Spinner ×7, Text Input ×5, Tree Group Header ×3, Breadcrumb Item ×3, Icon/File ×2, Icon/ChevronRight ×2, Toggle ×2, FormRow ×2, Icon/User ×1, Icon/Shield ×1, Icon/Licenses ×1, Icon/PanKnob ×1, Icon/Key ×1, Icon/Ethernet ×1, Icon/History ×1, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tag ×1, StatusIndicator ×1, Icon/Download ×1, Icon/Invite ×1, Tabs ×1, FormSection ×1, FileUpload ×1, Banner ×1, Icon/Close ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills        | `color.surface.active`, `color.surface.base`, `color.surface.raised`                                                                                                                                                              |
| Strokes      | `color.border.subtle`                                                                                                                                                                                                             |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.disabled`, `color.text.feedback.info`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.disabled`, `color.icon.primary`, `color.icon.secondary`, `color.icon.tertiary`, `color.neutral.900` |
| Spacing      | `inset.2xs`, `inset.lg`, `inset.none`, `inset.sm`, `inset.xs`, `stack.lg`, `stack.none`, `stack.xs`                                                                                                                               |
| Radius       | `radius.container`, `radius.control`, `radius.none`                                                                                                                                                                               |
| Border width | `border.default`                                                                                                                                                                                                                  |
| Other        | `layoutGrids={Space:grid/columns/lg}`, `layoutGrids={Space:stack/x-sm}`                                                                                                                                                           |

### Composes

- Page Header
- Section Nav Item
- Tree Group Header

### Variant matrix

| breakpoint | size     | fill                 | stroke | effect | text                                                                                                                                                                                                                                            | icon                                                                                                                                                                                                                     |
| ---------- | -------- | -------------------- | ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| desktop    | 1368×876 |                      |        |        | `color.text.tertiary`<br>`color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.disabled`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.tertiary`<br>`color.icon.disabled`                  |
| mobile     | 377×861  | `color.surface.base` |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.text.disabled`<br>`color.text.feedback.info` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.icon.tertiary`<br>`color.icon.disabled`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.900`.
- Hard-coded gap `24px` on layer _Center › Members & Roles › Form_
- Hard-coded paddingTop `8px` on layer _Center › Members & Roles › Form_
- Hard-coded paddingRight `20px` on layer _Center › Members & Roles › Form_
- Hard-coded paddingBottom `24px` on layer _Center › Members & Roles › Form_
- Hard-coded paddingLeft `20px` on layer _Center › Members & Roles › Form_

## Documentation card

**Description**

Configure single sign-on (SAML / OIDC) for the org — IdP metadata, attribute mapping and enforcement. Admin security.

**Layout**

Setup form: provider metadata (URLs · certs) · attribute mapping · test-connection · enforce-SSO toggle.

**Responsive**

Desktop form; mobile stacked with step progress.

**States**

not configured, editing, testing (connection test), active, error / misconfig, enforced.

**Accessibility**

Fields labelled; test results via aria-live; enforcement change confirmed (lockout risk). Keyboard-complete.

**Rules**

Provide a test-connection step  
Warn before enforcing SSO  
Show the attribute mapping clearly  
Keep a break-glass admin

Enforce without a test  
Expose secrets in plain text  
Lock out all admins  
Hide misconfiguration errors
