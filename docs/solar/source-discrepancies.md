# Source discrepancies

The SOLAR Foundations Figma file contains three kinds of content: prose slides, per-page
`@SOLAR:PAGE_CONTEXT` blocks written for agents, and the actual variable collections.
They were authored at different times and did not always agree. This file lists every
conflict still present, so nobody silently picks the wrong value.

**Precedence used in this folder**: Figma variables / styles > Agentic Reference page and
page-context blocks > prose slides. Where they disagree, the variables win, and the gap is
raised with the SOLAR core team (the design lead) through governance.

## Status

Checked against Foundations file version `2402389239778582681` (last modified 2026-09-23), and
re-checked on 2026-09-24's sync, which found the file unchanged. That revision changed one sentence
(Iconography now gives one stroke weight across the set, as the chapter already did) and neither
conflict below.

**Two conflicts remain.** The 2026-09-22 revision resolved 25 of the 26 previously recorded here
and all 6 structural quirks, and introduced one new one. In most cases the pages now state the
correct value _and_ explicitly ban the name they used to publish — `radius.xs`, `on-color`,
`color.feedback.*`, `shadow.subtle/medium/strongest` and `opacity.disabled` all appear now only in
"this does not exist" rules. Do not re-add a row from git history without re-reading the page
first.

## Remaining

| Where                                     | Says                                                       | Variables say                                                       | Kind                 |
| ----------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- | -------------------- |
| Agentic Reference `[COLOR_TOKEN_GRAMMAR]` | `data: color.data.{type}.{id} → … scale.01-08`             | `color.data.scale.100 … 900`                                        | Wrong values         |
| Color and Borders & Radius page contexts  | action states `{default\|hover\|focus\|pressed\|disabled}` | `default \| hover \| active \| disabled` — no `focus`, no `pressed` | New in this revision |

`category.01-08` in the same grammar line is correct; only the `scale` half is wrong.

The action-state set is the one thing this revision made worse rather than better. The States page
context separately says "the variant value is pressed, never active", which contradicts the 96
action colour variables. The chapters follow the variables and flag it.

Two unfinished edits on the Iconography page are not conflicts with the variables but are worth
knowing: the Outline vs Solid and Icon Library slides and the Gatekeeper checklist still describe
the old scheme (a `/Solid` suffix, size variants, "Sourced from Remix at every size"), and the
checklist asks for icon fills bound to `color.icon.*` while every icon master binds the primitive
`color/neutral/900`. [09-iconography.md](09-iconography.md) follows the shipped icons.

One variable pair is wrong within the variables themselves, which the precedence above cannot
settle: in Dark, `action/primary/icon/hover` and `action/primary/icon/active` are `color/mono/white`,
while the primary backgrounds they sit on are white and `color/neutral/50`, and every other mode and
state of `action/primary/icon/*` follows `action/primary/text/*` (`color/neutral/900` in Dark). The
code follows the variables, so a primary button's icons vanish on hover in Dark until SOLAR fixes
them; do not patch the colour in a component. It is in the design review (section 8, action colours), with three
danger-hover labels just under the WCAG AA text contrast.

## Resolved in the 2026-09-22 revision

Worth knowing so nobody reinstates a row: the spacing scale, the nine-step Primitives tables, the
Theming `inset.lg`/`stack.lg` values, the icon size ladder, radius and border widths, border colour
roles, the breakpoint set, motion durations and easing names, the typography scale and style
naming, and the invented `space.*`, `dataviz.*`, `color.overlay.*` and `opacity.*` families.

**Both colour swatch labels are fixed too.** Neutral 300 now reads `#a8a8a8` and green 600 reads
`#24791d`. `#878787` and `#c39900` still appear on the page — they are the correct labels for
neutral 400 and yellow 600. Searching for those strings alone will produce a false positive.

All remaining items are open in [`solar-review-for-design.md`](../solar-review-for-design.md).
