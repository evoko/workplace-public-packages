# Linked Accounts & API Tokens

> SOLAR Web · Figma page `↳ 🟢 Linked Accounts & API Tokens` (id `5066:12`) · section `views/account` · raw data: [`raw/views/account/linked-accounts-api-tokens.json`](../../raw/views/account/linked-accounts-api-tokens.json)

## Component set: Linked Accounts & API Tokens

### Props

| Prop         | Type    | Options / default    |
| ------------ | ------- | -------------------- |
| `breakpoint` | variant | mobile · **desktop** |

Default variant: `breakpoint=desktop` · 2 variants · default size 1368×1172px

### Anatomy (default variant)

- **breakpoint=desktop** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 1368×1172  
  itemSpacing `stack.none` · padding `stack.none`, `inset.none` · radius `radius.container`, `radius.none`
  - **Page Header** · instance of **Page Header** (type=centered, breakpoint=desktop) · column gap 20 pad 8/20/0/20 FILL/HUG · 1368×79  
    stroke `color.border.subtle` mixedpx · itemSpacing `stack.lg` · padding `inset.lg`, `inset.xs`, `inset.none` · strokeWeight `border.default`
  - **Container** · frame · column gap 0 pad 0/0/0/0 FILL/HUG · 640×1093
    - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×421  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 640×1
    - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×377  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
    - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 640×1
    - **FormSection** · instance of **FormSection** · column gap 20 pad 20/0/20/0 FILL/HUG · 640×293  
      stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`

Instance census (tree capped at depth 3): Icon/None ×50, Counter ×25, Button ×17, Spinner ×17, Avatar ×12, Tab Item ×8, Breadcrumb Item ×3, FormSection ×3, Icon/ChevronRight ×2, Divider ×2, Page Header ×1, Breadcrumbs ×1, Icon/Building ×1, Tag ×1, StatusIndicator ×1, Tabs ×1

### Tokens used

| Role         | Tokens                                                                                                                                                                                              |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Strokes      | `color.border.subtle`, `color.border.surface`                                                                                                                                                       |
| Text color   | `color.action.primary.text.default`, `color.action.secondary.text.default`, `color.text.feedback.success`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary`, `color.neutral.700` |
| Icon color   | `color.action.primary.icon.default`, `color.action.secondary.icon.default`, `color.action.tertiary.icon.default`, `color.icon.primary`, `color.icon.secondary`, `color.neutral.900`                 |
| Spacing      | `inset.lg`, `inset.none`, `inset.xs`, `stack.lg`, `stack.none`                                                                                                                                      |
| Radius       | `radius.container`, `radius.none`                                                                                                                                                                   |
| Border width | `border.default`                                                                                                                                                                                    |

### Composes

- Divider
- FormSection
- Page Header

### Variant matrix

| breakpoint | size      | fill | stroke | effect | text                                                                                                                                                                                                            | icon                                                                                                                                                                   |
| ---------- | --------- | ---- | ------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| desktop    | 1368×1172 |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.secondary.text.default`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.neutral.700` | `color.icon.secondary`<br>`color.neutral.900`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default`<br>`color.icon.primary`                  |
| mobile     | 377×1244  |      |        |        | `color.text.secondary`<br>`color.text.primary`<br>`color.text.feedback.success`<br>`color.action.primary.text.default`<br>`color.text.tertiary`<br>`color.action.secondary.text.default`<br>`color.neutral.700` | `color.icon.secondary`<br>`color.icon.primary`<br>`color.action.tertiary.icon.default`<br>`color.action.secondary.icon.default`<br>`color.action.primary.icon.default` |

### Issues detected

- Component description is empty.
- Primitive color bound directly (CLR-002): `color.neutral.700`, `color.neutral.900`.

## Documentation card

**Description**

Manage connected identity providers / OAuth links and personal API tokens — create, view and revoke. Org-level keys live in API & Webhooks.

**Layout**

Two sections: Linked accounts (list · connect / disconnect) · API tokens (table: name · scope · last used · revoke; Create token).

**Responsive**

Desktop: tables / lists. Mobile: a stacked card per item.

**States**

loaded, empty (no tokens / links), creating (token shown once), revoking (confirm), error.

**Accessibility**

New token shown once with copy + warning; revoke uses a Confirmation Dialog. Tables labelled; actions keyboard-reachable. Announce create / revoke.

**Rules**

Show a new token once, with copy  
Confirm revoke  
Show scope + last used  
Warn before disconnecting the last IdP

Re-display secret tokens  
Revoke without confirm  
Hide token scope  
Mix org-level keys here
