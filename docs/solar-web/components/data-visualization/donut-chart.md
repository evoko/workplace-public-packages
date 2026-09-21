# Donut Chart

> SOLAR Web · Figma page `↳ 🟢 Donut Chart` (id `5113:5`) · section `components/data-visualization` · raw data: [`raw/components/data-visualization/donut-chart.json`](../../raw/components/data-visualization/donut-chart.json)

## Component set: Donut Chart

Part-to-whole comparison. N segments of an annular ring, optional center label for the total.

Variants:
segments = 3 | 4 | 6
center-label = yes (shows total + label) | no

Each segment: ELLIPSE with arcData (startingAngle, endingAngle, innerRadius=0.6) and fill bound to a data/category token. Override segment ratios by editing arcData per instance.

Use 3 segments for binary-with-context (e.g. Good / Warning / Bad), 4 for quadrants, 6 for fine breakdown. Avoid > 8 segments — readability collapses.

### Props

| Prop           | Type    | Options / default |
| -------------- | ------- | ----------------- |
| `segments`     | variant | **3** · 4 · 6     |
| `center-label` | variant | **no** · yes      |

Default variant: `segments=3, center-label=no` · 6 variants · default size 200×200px

### Anatomy (default variant)

- **segments=3, center-label=no** · component · FILL/FILL · 200×200
  - **Segment** · ellipse · 200×200  
    fill `color.data.category.01.strong`
  - **Segment** · ellipse · 200×200  
    fill `color.data.category.02.strong`
  - **Segment** · ellipse · 200×200  
    fill `color.data.category.03.strong`

### Tokens used

| Role       | Tokens                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Fills      | `color.data.category.01.strong`, `color.data.category.02.strong`, `color.data.category.03.strong` |
| Text color | `color.text.primary`, `color.text.secondary`                                                      |

### Variant matrix

| segments | center-label | size    | fill | stroke | effect | text                                           | icon |
| -------- | ------------ | ------- | ---- | ------ | ------ | ---------------------------------------------- | ---- |
| 3        | no           | 200×200 |      |        |        |                                                |      |
| 4        | no           | 200×200 |      |        |        |                                                |      |
| 4        | yes          | 200×200 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| 6        | no           | 200×200 |      |        |        |                                                |      |
| 6        | yes          | 200×200 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |
| 3        | yes          | 200×200 |      |        |        | `color.text.primary`<br>`color.text.secondary` |      |

## Documentation card

**Description**

Shows part-to-whole composition as segments of a ring, with a central label for the total. For a few parts of a whole; use Bar Chart to compare many values.

**Anatomy**

Ring segments · centre total/label · optional legend · optional tooltip.

**Data & Colour**

One categorical token per segment (01–08). Keep to ~6 segments and group the tail as 'Other'. Order by size, largest first, clockwise from 12 o'clock.

**States**

default (loaded), loading, empty, error. Segments highlight on hover or keyboard focus.

**Accessibility**

Label segments with name + value, not colour alone; the centre total is the key figure. Segment-to-segment and segment-to-surface ≥3:1. Provide a table alternative.

**Rules**

Order segments by size  
Cap at ~6 + 'Other'  
Put the key total in the centre  
Label with value or %

Use for precise comparison  
Explode or 3D the ring  
Show dozens of thin slices  
Rely on colour alone
