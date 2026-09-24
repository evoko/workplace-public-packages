# Form Row

> SOLAR Web · Figma page `↳ 🟢 Form Row` (id `2202:1227`) · section `patterns/forms` · raw data: [`raw/patterns/forms/form-row.json`](../../raw/patterns/forms/form-row.json)

## Component set: FormRow

FormRow arranges 2, 3, or 4 form controls (TextInput, Select, etc.) in a single horizontal row with equal-width columns and a consistent gap (stack/md). Slots default to TextInput; swap per column for any other control. Collapses to stacked controls under ~640px viewport. Draft — authored by Claude.

### Props

| Prop      | Type    | Options / default |
| --------- | ------- | ----------------- |
| `columns` | variant | **2** · 3 · 4     |

Default variant: `columns=2` · 3 variants · default size 640×76px

### Anatomy (default variant)

- **columns=2** · component · row gap 16 pad 0/0/0/0 FILL/HUG · 640×76  
  itemSpacing `stack.md`
  - **Text Input** · instance of **Text Input** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 312×76  
    itemSpacing `stack.xs`
  - **Text Input** · instance of **Text Input** (size=md, state=default) · column gap 8 pad 0/0/0/0 FILL/HUG · 312×76  
    itemSpacing `stack.xs`

### Tokens used

| Role       | Tokens                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Text color | `color.text.feedback.info`, `color.text.primary`, `color.text.secondary`, `color.text.tertiary` |
| Icon color | `color.icon.tertiary`                                                                           |
| Spacing    | `stack.md`, `stack.xs`                                                                          |

### Composes

- Text Input

### Variant matrix

| columns | size   | fill | stroke | effect | text                                                                                                  | icon                  |
| ------- | ------ | ---- | ------ | ------ | ----------------------------------------------------------------------------------------------------- | --------------------- |
| 2       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |
| 3       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |
| 4       | 640×76 |      |        |        | `color.text.primary`<br>`color.text.feedback.info`<br>`color.text.tertiary`<br>`color.text.secondary` | `color.icon.tertiary` |

## Documentation card

**FormRow**

**Usage**

FormRow arranges 2, 3, or 4 form controls (TextInput, Select, etc.) in a single horizontal row with equal-width columns and a consistent gap (stack/md). Slots default to TextInput; swap per column for any other control. Collapses to stacked controls under ~640px viewport. Draft — authored by Claude.

**Anatomy**

Top-level layers of the first variant: Text Input. Instances keep their SOLAR component names.

**Specification**

3 variants.  
• columns — 2 | 3 | 4

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
