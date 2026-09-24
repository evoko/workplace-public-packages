# Divider

> SOLAR Web · Figma page `↳ 🟢 Divider` (id `2202:1220`) · section `components/cards` · raw data: [`raw/components/cards/divider.json`](../../raw/components/cards/divider.json)

## Component set: Divider

Visual separator between content sections. Horizontal (full-width, inset, or with centered label) and vertical orientations. Mirrors Tailwind UI divider patterns.

### Props

| Prop          | Type    | Options / default             |
| ------------- | ------- | ----------------------------- |
| `orientation` | variant | **horizontal** · vertical     |
| `type`        | variant | **full** · inset · with-label |

Default variant: `orientation=horizontal, type=full` · 4 variants · default size 320×1px

### Anatomy (default variant)

- **orientation=horizontal, type=full** · component · row gap 0 pad 0/0/0/0 FIXED/FIXED · 320×1
  - **Rule** · rectangle · FILL/FIXED · 320×1  
    fill `color.border.subtle`

### Tokens used

| Role       | Tokens                |
| ---------- | --------------------- |
| Fills      | `color.border.subtle` |
| Text color | `color.text.tertiary` |

### Variant matrix

| orientation | type       | size   | fill | stroke | effect | text                  | icon |
| ----------- | ---------- | ------ | ---- | ------ | ------ | --------------------- | ---- |
| horizontal  | full       | 320×1  |      |        |        |                       |      |
| horizontal  | inset      | 320×1  |      |        |        |                       |      |
| horizontal  | with-label | 320×20 |      |        |        | `color.text.tertiary` |      |
| vertical    | full       | 1×32   |      |        |        |                       |      |

## Documentation card

**Usage**

Visual separator between content sections. Horizontal (full-width, inset, or with centered label) and vertical orientations. Mirrors Tailwind UI divider patterns.

**Anatomy**

Top-level layers of the first variant: Rule. Instances keep their SOLAR component names.

**Specification**

4 variants.  
• orientation — horizontal | vertical  
• type — full | inset | with-label

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Not yet documented here — follow the state-class requirements in CLAUDE.md §7 Check 2 and the WCAG AA rules in §6.
