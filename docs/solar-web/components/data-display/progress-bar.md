# Progress Bar

> SOLAR Web · Figma page `↳ 🟢 Progress Bar` (id `2163:3679`) · section `components/data-display` · raw data: [`raw/components/data-display/progress-bar.json`](../../raw/components/data-display/progress-bar.json)

## Component set: ProgressBar

Determinate linear progress / usage meter. Track = surface/muted; set completion by resizing the Indicator layer (width = % of track). Variants by feedback: neutral (default, action/primary), info, success, warning, danger — bound to surface/feedback/\*/strong. Pair with an external numeric label; announce completion via aria-live=polite. See also Skeleton, Spinner.

### Props

| Prop       | Type    | Options / default                               |
| ---------- | ------- | ----------------------------------------------- |
| `feedback` | variant | **neutral** · info · success · warning · danger |

Default variant: `feedback=neutral` · 5 variants · default size 200×6px

### Anatomy (default variant)

- **feedback=neutral** · component · FIXED/FIXED · 200×6  
  fill `color.surface.muted` · itemSpacing `inset.xs`
  - **Indicator** · rectangle · 80×6  
    fill `color.action.primary.bg.default`

### Tokens used

| Role    | Tokens                                                   |
| ------- | -------------------------------------------------------- |
| Fills   | `color.action.primary.bg.default`, `color.surface.muted` |
| Spacing | `inset.xs`                                               |

### Variant matrix

| feedback | size  | fill                  | stroke | effect | text | icon |
| -------- | ----- | --------------------- | ------ | ------ | ---- | ---- |
| neutral  | 200×6 | `color.surface.muted` |        |        |      |      |
| info     | 200×6 | `color.surface.muted` |        |        |      |      |
| success  | 200×6 | `color.surface.muted` |        |        |      |      |
| warning  | 200×6 | `color.surface.muted` |        |        |      |      |
| danger   | 200×6 | `color.surface.muted` |        |        |      |      |

### Issues detected

- Hard-coded radius `9999px` on layer _feedback=neutral_
- Hard-coded radius `9999px` on layer _Indicator_

## Documentation card

**Description**

Linear progress indicator for long-running tasks. Use for file uploads, batch operations, multi-step workflows, and completion meters.

**Types (planned)**

determinate Known progress (0–100%). Shows exact fraction complete.  
indeterminate Unknown duration. Animated bar — do not show percent.  
Variant axes currently placeholder (Variant2–Variant5). Rename before publishing.

**Labels & Content**

Always pair with a descriptive label above the bar ('Uploading presentation.pdf').  
Show percentage only for determinate bars.  
Announce start and completion with aria-live=polite.

**Rules**

- DO: Pair with a descriptive label
- DO: Use indeterminate when total duration is unknown
- DO: Announce completion via aria-live=polite
- DO: Show percentage for determinate bars

- DON'T: Use for operations under 1 second (use Spinner)
- DON'T: Show percent on indeterminate bars
- DON'T: Stack multiple bars without clear labels
- DON'T: Publish before variant axes are named
