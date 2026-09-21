# Profile Dropdown

> SOLAR Web · Figma page `↳ 🟢 Profile Dropdown` (id `2202:1262`) · section `patterns/layout-shell` · raw data: [`raw/patterns/layout-shell/profile-dropdown.json`](../../raw/patterns/layout-shell/profile-dropdown.json)

## Component: Profile Dropdown

Topbar dropdown for account and session actions: profile, preferences, organization switcher, sign out. Opens from the topbar avatar. Holds Dropdown Items and dividers. Draft — awaiting 2+ consumer alignment on exact item roster. Sign out should always appear at the bottom, below a divider.

### Anatomy (default variant)

- **Profile Dropdown** · component · column gap 0 pad 0/0/0/0 FIXED/HUG · 280×154  
  fill `color.surface.overlay` · effect `shadow/dialog` · strokeWeight `border.default` · radius `radius.dialog`
  - **Identity** · frame · row gap 12 pad 16/16/16/16 FILL/HUG · 280×64  
    itemSpacing `stack.sm` · padding `inset.md`
    - **Avatar** · instance of **Avatar** (size=md, type=text, color=purple, Shade=Light) · column gap 0 pad 0/0/0/0 FIXED/FIXED · 32×32  
      fill `color.purple.50` · stroke `color.border.subtle` 1px · strokeWeight `border.default` · radius `radius.pill`
    - **Content** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 204×30  
      itemSpacing `stack.xs`
      - **Daniel Salmonssom** · text `body/lg/semibold` "Daniel Salmonssom" · FILL/HUG · 204×12  
        fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.600`
      - **daniel.salmonsson@biamp.com** · text `body/md/regular` "daniel.salmonsson@biamp.com" · FILL/HUG · 204×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
  - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 280×1
  - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 280×44  
    itemSpacing `inset.xs` · padding `inset.sm`
  - **Divider** · instance of **Divider** (orientation=horizontal, type=full) · row gap 0 pad 0/0/0/0 FILL/FIXED · 280×1
  - **Dropdown Item** · instance of **Dropdown Item** (size=md, state=default) · row gap 8 pad 12/12/12/12 FILL/HUG · 280×44  
    itemSpacing `inset.xs` · padding `inset.sm`

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.overlay`, `color.purple.50`                                                                                                                                 |
| Strokes         | `color.border.subtle`                                                                                                                                                      |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                               |
| Spacing         | `inset.md`, `inset.sm`, `inset.xs`, `stack.sm`, `stack.xs`                                                                                                                 |
| Radius          | `radius.dialog`, `radius.pill`                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                           |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.600`, `type.line-height.body.lg`, `type.line-height.body.md`, `type.size.body.lg`, `type.size.body.md` |
| Effects         | `shadow/dialog`                                                                                                                                                            |
| Text styles     | `body/lg/semibold`, `body/md/regular`                                                                                                                                      |

### Composes

- Avatar
- Divider
- Dropdown Item

### Issues detected

- Primitive color bound directly (CLR-002): `color.purple.50`.

## Documentation card

**Description**

The account menu opened from the user avatar in the top bar — identity plus account and session actions. For personal account actions, not app navigation.

**Anatomy**

Trigger (Avatar) · Popover · identity header (avatar · name · email) · menu items · optional org switcher · sign-out.

**Behaviour**

Opens on click, anchored to the avatar, flipping to stay in the viewport. Groups: account, preferences, then a separated sign-out. Closes on select / outside / Esc.

**States**

trigger: default, hover, focus, open. Items follow nav-item states. Popover: open / closed.

**Accessibility**

Trigger is a button with aria-haspopup + aria-expanded. Menu uses role=menu / menuitem; arrow-key nav, Esc closes, focus returns to the trigger.

**Rules**

Show who's signed in  
Separate sign-out  
Anchor to the avatar  
Return focus on close

Put app navigation here  
Hide the current account  
Bury sign-out among items  
Rely on hover to open
