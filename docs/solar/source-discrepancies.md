# Source discrepancies

The SOLAR Foundations Figma file contains three kinds of content: prose slides, per-page
`@SOLAR:PAGE_CONTEXT` blocks written for agents, and the actual variable collections.
They were authored at different times and did not always agree. This file lists every
conflict still present, so nobody silently picks the wrong value.

**Precedence used in this folder**: Figma variables / styles > Agentic Reference page and
page-context blocks > prose slides. Where they disagree, the variables win, and the gap is
raised with the SOLAR core team (the design lead) through governance.

## Status

Checked against Foundations file version `2403083104633531037` (last modified 2026-09-25). That
revision (Changelog: "Guideline pages · PATCH · Action states, data scale and icon checklist
corrected to the variables", plus two Color and one Spatial variable entries) resolved both
conflicts that were left after 2026-09-22, the two unfinished Iconography edits and the Dark
primary icon pair. See "Resolved on 2026-09-25" below.

**Two conflicts remain**, both found on the 2026-09-25 re-read. In most cases the pages now state
the correct value _and_ explicitly ban the name they used to publish — `radius.xs`, `on-color`,
`color.feedback.*`, `shadow.subtle/medium/strongest` and `opacity.disabled` all appear now only in
"this does not exist" rules. Do not re-add a row from git history without re-reading the page
first.

## Remaining

| Where                             | Says                                                            | Variables say                                                                        | Kind         |
| --------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------ |
| Tokens page, colour grammar table | `state (action)`: `default, hover, focus, active, disabled`     | `default \| hover \| active \| disabled`; focus is the `shadow/focus/*` effect style | Wrong values |
| Agentic Reference, component map  | minimum targets `44x36(sm)`, `44x40`, `44x20`, `44x24`, `44x48` | `size/target/min` = 44 on both axes (and the page's own `rule_09`: 44 × 44)          | Wrong values |

The Tokens page's Spatial grammar and the Agentic Reference `[SPATIAL_SYSTEM]` block do not list
`size/control/*` or `size/target/min` yet. That is an omission, not a conflict.
[02-tokens.md](02-tokens.md) and [18-agent-reference.md](18-agent-reference.md) follow the
variables and note both rows.

## Resolved on 2026-09-25

Kept so nobody reinstates a row. Each line is the conflict as it stood, then what the page says now.

- **Action states** (Color and Borders & Radius page contexts `{default|hover|focus|pressed|disabled}`;
  States page context "the variant value is pressed, never active"): the pages now say the variant
  value is `pressed` and its colours bind the `action.*.*.active` variables; focus is the shared
  `shadow/focus/*` effect style, not a colour.
- **Data scale** (Agentic Reference `[COLOR_TOKEN_GRAMMAR]` `scale.01-08`): now `scale.100-900`,
  matching `color.data.scale.100 … 900`.
- **Icon library and checklist** (Outline vs Solid and Icon Library slides: a `/Solid` suffix and
  size variants; Gatekeeper checklist: "Sourced from Remix at every size", icon fills bound to
  `color.icon.*`): now one component set per icon with a `solid` boolean, one 24 × 24 canvas, and
  the master fill bound to `color/neutral/900` with every placed instance rebound to
  `color.icon.*` or `color.action.*.icon.*`.
- **Dark primary icon hover/active** (within the variables: `action/primary/icon/hover` and
  `/active` were `color/mono/white` in Dark, on white and `neutral/50` backgrounds, so the icon
  vanished): now `color/neutral/900`, following `action/primary/text/*`. The three danger-hover
  labels that were just under WCAG AA text contrast now pass 4.5:1 (primary danger hover bg
  `red/600`; secondary and tertiary danger hover text `red/600` in Light).

## Resolved in the 2026-09-22 revision

Worth knowing so nobody reinstates a row: the spacing scale, the nine-step Primitives tables, the
Theming `inset.lg`/`stack.lg` values, the icon size ladder, radius and border widths, border colour
roles, the breakpoint set, motion durations and easing names, the typography scale and style
naming, and the invented `space.*`, `dataviz.*`, `color.overlay.*` and `opacity.*` families.

**Both colour swatch labels are fixed too.** Neutral 300 now reads `#a8a8a8` and green 600 reads
`#24791d`. `#878787` and `#c39900` still appear on the page — they are the correct labels for
neutral 400 and yellow 600. Searching for those strings alone will produce a false positive.

All remaining items are open in [`solar-review-for-design.md`](../solar-review-for-design.md).
