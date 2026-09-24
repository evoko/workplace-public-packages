# Form Section

> SOLAR Web · Figma page `↳ 🟢 Form Section` (id `2202:1257`) · section `patterns/forms` · raw data: [`raw/patterns/forms/form-section.json`](../../raw/patterns/forms/form-section.json)

## Component: FormSection

Titled group of FormRows: optional section header (title and description), optional CTA Button and the SectionFields slot. Single component. Props: SectionFields (slot), hasSectionHeader (default on), hasCTA (default off). Stack sections with stack/xl inside a form; each section renders as a fieldset with the title as its legend.

### Props

| Prop               | Type    | Options / default         |
| ------------------ | ------- | ------------------------- |
| `SectionFields`    | slot    | default `[object Object]` |
| `hasSectionHeader` | boolean | default `true`            |
| `hasCTA`           | boolean | default `false`           |

### Anatomy (default variant)

- **FormSection** · component · column gap 20 pad 20/0/20/0 FIXED/HUG · 640×377  
  stroke `color.border.surface` mixedpx · itemSpacing `stack.lg` · padding `stack.none`, `stack.lg` · strokeWeight `border.default`
  - **Container** · frame · row gap 24 pad 0/0/0/0 FILL/HUG · 640×41  
    itemSpacing `inset.xl`
    - **SectionHeader** · frame · column gap 16 pad 0/0/0/0 FILL/HUG · 640×41  
      itemSpacing `stack.md` · padding `stack.none` · prop visible←hasSectionHeader
      - **Title** · text `title/sm` "Section title" · FILL/HUG · 640×15  
        fill `color.text.primary` · lineHeight `type.line-height.title.sm` · fontFamily `type.font-family.inter` · fontSize `type.size.title.sm` · fontStyle `type.font-weight.500`
      - **Description** · text `body/md/regular` "Short description goes here." · FILL/HUG · 640×10  
        fill `color.text.secondary` · lineHeight `type.line-height.body.md` · fontFamily `type.font-family.inter` · fontSize `type.size.body.md` · fontStyle `type.font-weight.400`
    - ~~**Button**~~ (hidden by default) · instance of **Button** (size=md, prio=secondary, state=default, danger=false) · row gap 8 pad 0/12/0/12 HUG/FIXED · 80×40  
      fill `color.action.secondary.bg.default` · stroke `color.action.secondary.border.default` 1px · effect `shadow/control` · itemSpacing `inset.xs` · padding `inset.sm` · strokeWeight `border.default` · radius `radius.control` · prop visible←hasCTA
  - **SectionFields** · slot · column gap 24 pad 0/0/0/0 FILL/HUG · 640×276  
    itemSpacing `inset.xl` · prop slotContentId←SectionFields
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`
    - **FormRow** · instance of **FormRow** (columns=2) · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
      itemSpacing `stack.md`

### Tokens used

| Role            | Tokens                                                                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fills           | `color.action.secondary.bg.default`                                                                                                                                          |
| Strokes         | `color.action.secondary.border.default`, `color.border.surface`                                                                                                              |
| Text color      | `color.text.primary`, `color.text.secondary`                                                                                                                                 |
| Spacing         | `inset.sm`, `inset.xl`, `inset.xs`, `stack.lg`, `stack.md`, `stack.none`                                                                                                     |
| Radius          | `radius.control`                                                                                                                                                             |
| Border width    | `border.default`                                                                                                                                                             |
| Typography vars | `type.font-family.inter`, `type.font-weight.400`, `type.font-weight.500`, `type.line-height.body.md`, `type.line-height.title.sm`, `type.size.body.md`, `type.size.title.sm` |
| Effects         | `shadow/control`                                                                                                                                                             |
| Text styles     | `body/md/regular`, `title/sm`                                                                                                                                                |

### Slots and prop-controlled layers

| Layer                     | Controlled property | Prop               |
| ------------------------- | ------------------- | ------------------ |
| Container › SectionHeader | visible             | `hasSectionHeader` |
| Container › Button        | visible             | `hasCTA`           |
| SectionFields             | slotContentId       | `SectionFields`    |

### Composes

- Button
- FormRow

## Documentation card

**FormSection**

**Usage**

Titled group of FormRows: optional section header (title and description), optional CTA Button and the SectionFields slot. Single component. Stack sections with stack/xl inside a form; each section renders as a fieldset with the title as its legend.

**Anatomy**

Top-level layers of the component: Container · SectionFields. Instances keep their SOLAR component names.

**Specification**

Single component.  
Props: SectionFields (slot), hasSectionHeader (boolean), hasCTA (boolean).  
Props: SectionFields (slot), hasSectionHeader (default on), hasCTA (default off).

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
