# Source discrepancies

The SOLAR Foundations Figma file contains three kinds of content: prose slides, per-page
`@SOLAR:PAGE_CONTEXT` blocks written for agents, and the actual variable collections.
They were authored at different times and do not always agree. This file lists every
conflict found while transcribing, so nobody silently picks the wrong value.

**Precedence used in this folder**: Figma variables / styles > Agentic Reference page and
chapter prose > `@SOLAR:PAGE_CONTEXT` blocks. Items marked **gap** are worth raising with
the SOLAR core team (the design lead) through governance.

## Spacing

| Where                                | Says                                                                                                                       | Variables say                                                                  | Note                                                               |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Agentic Reference `[SPATIAL_SYSTEM]` | inset `2xs=2, xs=4, sm=8, md=16, lg=24, xl=32`; stack adds `2xl=48`                                                        | `inset/stack: none 0, 2xs 4, xs 8, sm 12, md 16, lg 20, xl 24, 2xl 28, 3xl 40` | Names collide with different values. **gap**                       |
| Spatial page (Stack / Inset slides)  | `stack.lg → 1.5rem`, `inset.lg → 1.5rem` (24 px)                                                                           | `lg` = 20 px; 24 px is `xl`                                                    | **gap**                                                            |
| Theming page (non-color tokens)      | `inset.lg = 24px`, `stack.lg = 24px`                                                                                       | 20 px                                                                          | same                                                               |
| Primitives › Spatial tables          | Seven inset/stack rows: 0, 4, 8, 12, 16, 24, 32                                                                            | Nine variables: 0, 4, 8, 12, 16, 20, 24, 28, 40                                | Table names render as "MAJOR" placeholders, so no names to compare |
| Spatial page context                 | `space.{0,2xs…4xl}` = 0, 2, 4, 8, 16, 24, 32, 48, 64, 96; `inline`, `squish_inset`, `stretch_inset`; `{component}.space.*` | No `space.*` tokens exist; only `inset.*` and `stack.*`                        | Illustrative                                                       |

## Icon sizes

| Where                                | Says                                           | Variables say                                    |
| ------------------------------------ | ---------------------------------------------- | ------------------------------------------------ |
| Iconography slides                   | xs 12, sm 16, md 20, lg 24, xl 32, xxl 40      | `icon/xs 12, sm 16, md 20, lg 24, xl 28, 2xl 32` |
| Iconography page context             | xs 12, sm 16, md 20, lg 24, xl 32 (five sizes) | as above                                         |
| Agentic Reference `[SPATIAL_SYSTEM]` | xs 16, sm 20, md 24, lg 32, xl 40              | as above                                         |

The slides are the design intent (six sizes 12/16/20/24/32/40); `icon/xl` = 28 and the
missing 40 are a **gap**. The Agentic Reference values look shifted by one step.

## Radius and border

| Where                           | Says                                                                                                                                           | Variables say                                                                                                                                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Borders page context            | `radius.none 0, xs 2, sm 4, md 6, lg 8, xl 12, 2xl 16, full`; `border.width.lg 3px`; color roles `default, interactive, error, success, focus` | Primitives `none 0, sm 4, md 6, lg 8, xl 12, full 9999`; semantic `radius.{none,subtle,control,container,dialog,pill}`; `border-width lg = 4`; border color roles are `subtle, medium, strong, disabled, inverse, surface, highlight, feedback.*` | Illustrative; no `radius.xs`, no 16 px step, no 3 px border |
| Borders page context            | inputs `radius.sm` 4, dialogs `radius.lg` 8                                                                                                    | `radius.subtle` 4, `radius.dialog` 12                                                                                                                                                                                                             | Component mapping differs; follow semantic names            |
| Tokens page (button annotation) | `size.inset.md`, `size.radius.control`                                                                                                         | `inset/md`, `radius/control`                                                                                                                                                                                                                      | Prefix variant; no `size.` group                            |

## Color

| Where                                     | Says                                                                                                                                                                                                     | Variables say                                                                                                                                                                                              |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Typography page, "Text Color" slide       | secondary dark neutral/500; tertiary dark neutral/700; disabled black/white-alpha-40; inverse light neutral/50; success green/700→300; warning orange/700→300; danger red/700→300; info **blue**/700→300 | secondary neutral/500→300; tertiary neutral/300→500; disabled alpha-20; inverse brand/white→neutral/900; success green/600→400; warning orange/600→400; danger red/600→**300**; info **turquoise**/700→400 |
| Theming page, "What changes" table        | warning surface yellow/50→yellow/900; danger red/50→red/900; info blue/50→blue/900                                                                                                                       | warning orange/50→orange/800; danger red/50→red/800; info turquoise/50→turquoise/800                                                                                                                       |
| Theming page, "How theming works" table   | `color.border.default` = alpha-black-20 / alpha-white-20                                                                                                                                                 | No `border/default` variable; `border/medium` has those values. **gap** (Agentic Reference also lists `default` as a border variant)                                                                       |
| Theming page, shadow variables            | `shadow.subtle` dark = alpha/black-90; `shadow.strong` dark = mono/black                                                                                                                                 | alpha/black-50 and alpha/black-70 (the Elevation page agrees with the variables)                                                                                                                           |
| Color page context `[PALETTE_STRUCTURE]`  | `blue-50…950`, `neutral-0…1000`, `color.text.on-color`, `color.surface.default/subtle`, `color.border.interactive/error`, `color.feedback.*`                                                             | Palettes are 50…900; no `on-color`, `surface.default`, `surface.subtle`, `border.interactive/error`, or `color.feedback.*` group                                                                           | Illustrative |
| Color page, Action slide                  | "Blue 500 for primary"                                                                                                                                                                                   | Primary action is neutral/900 (Light) / neutral/50 (Dark); blue is links and focus                                                                                                                         |
| Primitives › Color swatch labels          | neutral 300 labelled `#878787`; green 600 labelled `#C39900`                                                                                                                                             | `#A8A8A8` and `#24791D` (label typos; swatches themselves are variable-bound)                                                                                                                              |
| Data-viz page context                     | `dataviz.color.categorical.{1–8}`, `sequential.{100–900}`, `diverging.{neg,neutral,pos}`                                                                                                                 | `color.data.category.NN.{strong,subtle}`, `color.data.scale.*`, `color.data.delta.*`                                                                                                                       |
| Layering page context                     | `color.overlay.scrim`, `color.surface.default/subtle`, `shadow.medium/strongest`                                                                                                                         | `color.surface.scrim`, `color.surface.base/muted`, effect styles `overlay`/`dialog`                                                                                                                        |
| Agentic Reference `[COLOR_TOKEN_GRAMMAR]` | surface variant `modal`; data `scale.01-08`                                                                                                                                                              | `surface/dialog`; `data/scale/100…900`                                                                                                                                                                     |
| Agentic Reference `[COMPONENT_MAP]`       | Table uses `color.surface.secondary`                                                                                                                                                                     | Phantom (the page itself flags it)                                                                                                                                                                         |

## Typography

| Where                                                              | Says                                                        | Variables / styles say                                  |
| ------------------------------------------------------------------ | ----------------------------------------------------------- | ------------------------------------------------------- |
| Agentic Reference `[TYPOGRAPHY_SCALE]`                             | Title L 44/56; Helper M 14/16; "32 variables × 2 modes"     | `title/lg` 40/48; `helper/md` 14/20; 41 variables       |
| Agentic Reference rule 3                                           | style names `Display/L`, `Body/M/Regular`, `type.body.md.*` | Styles are `display/lg`, `body/md/regular`              |
| Typography page tables                                             | body md letter spacing −2 %                                 | `body/md/*`, `link/md/*`, `display/xs/*` store −0.32 px |
| Typography page (Font Size / Line Height / Family / Weight tables) | Container text is a copy of the border-width paragraph      | Copy-paste error in the source; values are correct      |

## Shadows and elevation

| Where                                 | Says                                                                                                      | Effect styles say                                                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Primitives › Elevation shadow table   | second row `y:3 / blur:4`                                                                                 | `shadow/raised` = y 1 / blur 2 (the `y:4 / blur:5` row matches `shadow/strong`)                                                              |
| Layering page context                 | `shadow.none/subtle/medium/strong/strongest` with `0 8px 24px`-style values; z bands 0–9, 10–99, 100–199… | Styles `control/raised/overlay/dialog/strong`; z levels 0/100/200/300/400/500/600 (Agentic Reference and Elevation page agree on the latter) |
| Agentic Reference `[SHADOW_TOKENS]`   | `shadow.modal`                                                                                            | `shadow/dialog`                                                                                                                              |
| Agentic Reference `[BANNED_SEGMENTS]` | "`shadow.subtle` → use `shadow.raised`"                                                                   | `shadow/subtle` **does** exist as a color variable; only invalid as an effect                                                                |

## Layout and responsive

| Where                   | Says                                                                                         | Variables say                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Responsive page context | mobile 0–599, tablet 600–1023, desktop 1024–1439, wide 1440+; `viewport.breakpoint.sm 600px` | `viewport xs 393, sm 768, md 1024, lg 1440, xl 1920`                           |
| Grid page context       | mobile 4 col / 16; tablet 8 col / 24 (`space.lg`); desktop 12 col / margin 40 (`space.xl`)   | Grid slides + Agentic Reference: xs 4/16, sm 4/16, md 8/20, lg 12/24, xl 12/24 |

## Motion

| Where               | Says                                                                                                   | Variables say                                               |
| ------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | --- | ----- |
| Motion page context | fast 100–150, normal 200–300, slow 400–500, slower 600–800; `motion.easing.standard/enter/exit/linear` | fast 100, normal 300, slow 600, slower 900; `motion/ease/in | out | both` |
| States page context | `opacity.disabled`, `motion/hover`, `motion/focus`                                                     | None exist; semantic motion layer is a planned workstream   |

## Structural quirks in the file

- The UX Copy page's `@SOLAR:PAGE_CONTEXT` is a verbatim copy of the Governance block
  (`page: Governance`).
- The Lint Plugin page's "How It Works" slide contains the UX-copy writing-pattern
  cards (error messages, empty states, confirmation dialogs) under the plugin heading.
- The Governance page contains the Implementation Guidelines and Execution & Impact
  slides as well; the dedicated pages for those chapters repeat and extend them.
- Chapter numbering differs between the Table of Contents (Theming 07, UX Copy 08,
  Governance 09) and cross-references inside slides ("Chapter 08 — Theming", "Ch.09
  Compliance Validation Rules").
- The Governance page states 39 validation rules (30 errors, 9 warnings); summing the
  listed ID ranges gives 42. The plugin's rule catalog is authoritative.
- Two empty "Slide" frames exist on the Introduction and Tokens pages.
