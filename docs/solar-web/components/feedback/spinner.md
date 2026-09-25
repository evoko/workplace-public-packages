# Spinner

> SOLAR Web · Figma page `↳ 🟢 Spinner` (id `2163:3681`) · section `components/feedback` · raw data: [`raw/components/feedback/spinner.json`](../../raw/components/feedback/spinner.json)

## Component set: Spinner

Circular indeterminate loading indicator. 6 variants: size (sm 16, md 24, lg 32 — bound to icon/sm, icon/lg, icon/2xl) × style (default, inverse). default uses color/border/strong; inverse is for dark and inverse surfaces. Non-interactive. Pair with visually hidden text or aria-busy on the region it covers; for known progress use Progress Bar, for layout placeholders use Skeleton.

### Props

| Prop    | Type    | Options / default     |
| ------- | ------- | --------------------- |
| `size`  | variant | **sm** · md · lg      |
| `style` | variant | **default** · inverse |

Default variant: `size=sm, style=default` · 6 variants · default size 16×16px

### Anatomy (default variant)

- **size=sm, style=default** · component · column gap 0 pad 0/0/0/0 HUG/HUG · 16×16  
  width `icon.sm` · height `icon.sm`
  - **SpinnerRing** · frame · FIXED/FIXED · 16×16
    - **Track** · ellipse · 16×16  
      stroke `color.border.subtle` 2px · strokeWeight `border.strong`
    - **Indicator** · vector · 7×5  
      stroke `color.border.strong` 2px · strokeWeight `border.strong`

### Tokens used

| Role         | Tokens                                       |
| ------------ | -------------------------------------------- |
| Strokes      | `color.border.strong`, `color.border.subtle` |
| Border width | `border.strong`                              |
| Sizes        | `icon.sm`                                    |

### Variant matrix

| size | style   | size  | fill | stroke | effect | text | icon |
| ---- | ------- | ----- | ---- | ------ | ------ | ---- | ---- |
| sm   | default | 16×16 |      |        |        |      |      |
| md   | default | 24×24 |      |        |        |      |      |
| lg   | default | 32×32 |      |        |        |      |      |
| sm   | inverse | 16×16 |      |        |        |      |      |
| md   | inverse | 24×24 |      |        |        |      |      |
| lg   | inverse | 32×32 |      |        |        |      |      |

## Documentation card

**Usage**

Circular indeterminate loading indicator. Non-interactive.

**Anatomy**

Top-level layers of the first variant: SpinnerRing. Instances keep their SOLAR component names.

**Specification**

6 variants.  
• size — sm | md | lg  
• style — default | inverse

**Related**

No sibling or alternative component is called out for this page.

**Accessibility**

Pair with visually-hidden text or aria-busy on the region it covers; for known progress use Progress Bar, for layout placeholders use Skeleton.
