# Detail Side Panel

> SOLAR Web · Figma page `↳ 🟢 Detail Side Panel` (id `7709:24874`) · section `views/generic` · raw data: [`raw/views/generic/detail-side-panel.json`](../../raw/views/generic/detail-side-panel.json)

## Component: Detail Side Panel

### Anatomy (default variant)

- **Detail Side Panel** · component · column gap 0 pad 0/0/0/0 FIXED/FIXED · 348×800  
  fill `color.surface.raised` · stroke `color.border.surface` mixedpx · effect `shadow/overlay` · strokeWeight `border.default` · radius `radius.dialog`
  - **Header** · frame · row gap 0 pad 20/20/20/20 FILL/HUG · 348×69  
    padding `inset.lg` · strokeWeight `border.default`
    - **Frame 1** · frame · column gap 8 pad 0/0/0/0 FILL/HUG · 256×29  
      itemSpacing `inset.xs`
      - **Title** · text `body/lg/medium` "Entity Name 01" · FILL/HUG · 256×12  
        fill `color.text.primary` · lineHeight `type.line-height.body.lg` · fontFamily `type.font-family.inter` · fontSize `type.size.body.lg` · fontStyle `type.font-weight.500`
      - **Title** · text `body/sm/regular` "Updated 2 hr ago · ent\_3f9k2a" · FILL/HUG · 256×9  
        fill `color.text.secondary` · lineHeight `type.line-height.body.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.body.sm` · fontStyle `type.font-weight.400`
    - **Frame 2** · frame · row gap 12 pad 0/0/0/0 HUG/HUG · 52×20  
      itemSpacing `stack.sm`
      - **Icon/More** · instance of **Icon/More** (solid=false) · FIXED/FIXED · 20×20  
        height `icon.md`
      - **Icon/Close** · instance of **Icon/Close** (solid=false) · FIXED/FIXED · 20×20  
        height `icon.md`
  - **Tabs** · instance of **Tabs** (size=md) · row gap 0 pad 0/0/0/0 FILL/HUG · 348×40  
    stroke `color.border.surface` mixedpx · padding `inset.none` · strokeWeight `border.default`
  - **Body** · frame · column gap 16 pad 16/16/16/16 FILL/FILL · 348×643  
    itemSpacing `stack.md` · padding `inset.md`, `stack.md`
    - **Card / Details** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/FIXED · 316×254  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Description** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/FIXED · 316×130  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Recent activity** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/FIXED · 316×316  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Owner** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 316×86  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Metadata** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 316×158  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Quick actions** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 316×86  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
    - **Card / Related** · instance of **Card** (state=default, status=none, loading=false) · column gap 12 pad 16/16/16/16 FILL/HUG · 316×158  
      fill `color.surface.base` · stroke `color.border.subtle` 1px · effect `shadow/raised` · itemSpacing `inset.sm` · padding `inset.md` · strokeWeight `border.default` · radius `radius.container`
  - **Button Group** · instance of **Button Group** (orientation=horizontal, type=full-width) · row gap 0 pad 0/0/0/0 FILL/HUG · 348×48  
    stroke `color.border.subtle` mixedpx · itemSpacing `inset.none` · strokeWeight `border.default`

Instance census (tree capped at depth 3): Icon/None ×42, Icon/More ×18, Counter ×13, Avatar ×11, Event Row ×10, Tab Item ×8, Card ×7, Tag ×7, Divider ×6, ListItem ×6, Icon/ChevronRight ×6, Button ×5, Spinner ×5, PropertyRow ×3, PropertyList ×2, List ×2, Icon/Close ×1, Tabs ×1, Activity Feed ×1, Button Group ×1

### Tokens used

| Role            | Tokens                                                                                                                                                                     |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.surface.base`, `color.surface.raised`                                                                                                                               |
| Strokes         | `color.border.subtle`, `color.border.surface`                                                                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                               |
| Spacing         | `inset.lg`, `inset.md`, `inset.none`, `inset.sm`, `inset.xs`, `stack.md`, `stack.sm`                                                                                       |
| Radius          | `radius.container`, `radius.dialog`                                                                                                                                        |
| Border width    | `border.default`                                                                                                                                                           |
| Sizes           | `icon.md`                                                                                                                                                                  |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.lg`, `type.line-height.body.sm`, `type.size.body.lg`, `type.size.body.sm` |
| Effects         | `shadow/overlay`, `shadow/raised`                                                                                                                                          |
| Text styles     | `body/lg/medium`, `body/sm/regular`                                                                                                                                        |

### Composes

- Button Group
- Card
- Icon/Close
- Icon/More
- Tabs

### Issues detected

- Component description is empty.

## Documentation card

**Description**

A contextual side panel showing detail for a selected list / table row without leaving the list. For master–detail; full pages use Entity Detail.

**Layout**

Slide-in panel (right): header (title · close · actions) · content sections (Property List · tabs) · footer actions. Overlays or pushes content.

**Responsive**

Desktop side panel beside the list; mobile full-screen sheet.

**States**

closed, open, loading, empty (no selection), error; per-section content states.

**Accessibility**

role=complementary / dialog, labelled; focus moves in on open and returns on close; Esc closes; underlying list not needlessly trapped. Keyboard-complete.

**Rules**

Keep the list + context visible  
Move focus in on open  
Return focus on close  
Support Esc

Use for full-page detail  
Lose the selection  
Trap focus away from the list on desktop  
Rely on colour for state
