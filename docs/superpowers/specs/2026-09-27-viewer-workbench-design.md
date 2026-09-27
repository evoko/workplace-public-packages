# Viewer workbench: design

**Status:** agreed with the owner on 2026-09-27; not yet planned or built.

## Why

Generation gets a component roughly right; a person then finds what is still wrong, has it fixed,
and approves it. Today that loop leaves the viewers: a developer reads `solar:explain`, writes an
overlay rule by hand or asks an agent, runs `solar:codegen`, looks again, and pastes
`solar:status`'s lines into `spec/approvals.yaml`. The workbench keeps the loop in Storybook and
Widgetbook: change a look by choosing a token, send anything else to an agent as a note, and
approve or withdraw an approval, all without leaving the Playground.

Two ideas were set aside, and why:

- **A free visual editor** (drag a padding, pick any colour) writes the wrong file (the recipe,
  which the next `solar:codegen` overwrites), the wrong kind of value (a literal where SOLAR wants
  a token), and one platform only.
- **An in-browser code editor** duplicates the developer's own editor, for files (overlay YAML,
  generator modules) that are no easier to edit there.

The workbench writes what lasts: an overlay `set` rule, which both platforms generate from, with a
person's reason.

## Who, and where

Developers only, locally, under `npm run storybook` and `npm run widgetbook` (owner, 2026-09-27).
Nothing in a static build, the Vercel deployment or CI includes the workbench or talks to it:
production is read-only.

## What a developer gets

A slim **workbench bar** above each component's Playground, beside Reset, drawn with SOLAR's own
components (the status circle, Tabs, Select, Button, Confirmation Dialog, Text Area), identical in
both viewers. It shows only when the workbench service answers; with none, the Playground is
exactly as it is today. Storybook's bar acts for the web, Widgetbook's for Flutter.

### What the bar offers, by the component's circle on that platform

| Circle | The bar offers                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| 🔴     | nothing to change or approve; it names the components to approve first (or the cycle), as `solar:status` does                         |
| 🟡     | **Inspect**, **Report** and **Approve**                                                                                               |
| 🟢     | **Undo approval** only: Inspect and Report are locked, since both lead to a change that would cancel the approval (owner, 2026-09-27) |

A look change reaches both platforms (an overlay rule generates both), and approvals are per
platform, so **Inspect is locked while the component is approved on either platform**: the bar
names the other viewer to withdraw it in. Report is locked on the same terms.

### Inspect: change a look by choosing a token

1. Choose a **layer** from the component's layers (the same list in both viewers; on the web,
   pointing at the component selects its layer too), and a **variant**: its axes and a state
   (rest, hover, pressed, focus, disabled), since the Playground shows only the resting state.
2. The bar lists the layer's **cells** in that variant, each with its value, its token and the look
   that decides it (`root` · `background` · `color.action.primary.bg.default` · `[base]`):
   `solar:explain`'s own reading.
3. Choose a cell, a **scope** (the look the rule is keyed on: from the variant in view up to
   `base`, every variant), and a **token** from the semantic tokens of the same kind as the cell's
   (colours for a fill, the inset scale for a padding), each shown with its value. `none` and the
   sizing keywords (`FILL`, `HUG`) are offered where the overlay allows them; a raw value is not
   (it needs `allowLiteral` too): it goes to Report.
4. The rule is written and both viewers regenerate (about 10 to 15 seconds; `solar:codegen` alone
   takes about 11). What they then show is exactly what would ship.
5. **Keep** asks for a one-line reason and runs the component's checks (below). **Undo** puts the
   overlay file back byte for byte and regenerates.

One rule per cell and look. `set` is keyed `<layer>.<look>.<cell>`, so the file never piles up:

| You                                               | The overlay                                                                                        |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| change a cell with no rule                        | gains one entry                                                                                    |
| change a cell with a rule (yours or an older one) | has that entry's value replaced; its old reason is shown to rewrite, and Keep refuses it unchanged |
| choose the token Figma has                        | loses the entry: nothing is left to decide                                                         |
| Undo before Keep                                  | is back exactly as it was                                                                          |

The file is edited with the `yaml` package's document API (the generator's own YAML reader), so
comments and order survive and a save moves only its own lines. Rules that later stop mattering
are caught as today: a stale rule fails the build, and `solar:overlay:audit` reports repeats and
rules Figma now agrees with.

### Report: send anything else to an agent

A text area. Saving writes a note to `spec/feedback/<slug>-<n>.yaml`: the component, the platform,
every Playground control's value, the selected layer and variant if any, the note, and any failing
check attached by Keep or Approve (below). Behaviour, a missing callback, a raw value, a layout
the overlay cannot express: whatever Inspect cannot do.

### Approve and Undo approval

**Approve** opens a Confirmation Dialog; confirming runs the component's checks and, when they
pass, writes the component's line into `spec/approvals.yaml` for that platform: the fingerprint
`solar:status` prints, `by` from `git config user.name`, `on` today. The circles update at once.
While a check fails, Approve refuses and says why, offering Send to agent.

**Undo approval** opens a Confirmation Dialog listing every approval it withdraws: the component's
on this platform, and every approved component above it that uses it (withdrawing Button withdraws
Dialog), since an approval recorded above an unapproved child fails `solar:status --check`
(owner's rule, 2026-09-26). Confirming removes those lines.

Approvals stay written by people only: by hand, or by a person pressing Approve or Undo approval.
**An agent never calls either.** The service is a local port and cannot tell a click from a
request; the rule in CLAUDE.md is what holds.

### When a person and a check disagree

Keep and Approve both run **the component's own checks**, on both platforms: its web visual check
(Playwright, filtered to the component), its Flutter visual check (`flutter test`, filtered to it)
and its parity tests. Not the whole suite.

- A token chosen with Inspect does not fail them by itself: a `set` records the value it replaced,
  and the oracle excuses exactly that cell in exactly the variants the rule reaches. The check then
  reports it as an excused difference, in the gap report.
- A **knock-on** can fail them: the checks also measure positions from a parent's edge and sizes,
  and changing one cell can move another no rule names. The check is right that it differs from
  Figma where nothing says it may.

On a failure the bar shows the cell, what Figma draws and what the component drew, and offers
**Undo** or **Send to agent**, which keeps the edit and writes a Report note with the failure
attached. The agent settles it lawfully, by an overlay decision that records the person's
judgement (so the check excuses it) or by fixing the knock-on in the code, never by loosening a
check or editing an oracle. The person then approves. A person's judgement wins, as a written
decision the check can read.

## The `/solar-feedback` skill

A project skill, `.claude/skills/solar-feedback/SKILL.md`, which a developer runs in Claude Code
when they choose to (owner, 2026-09-27: a queue, not an agent started on every save). It:

1. Works through `spec/feedback/`, on 🟡 components only (a note for a 🔴 or 🟢 one is left, and
   reported). For each note: `solar:explain`, then
   [workflows.md, Decide where a change goes](../../engineering/workflows.md#decide-where-a-change-goes),
   the fix, `solar:codegen`, and the note deleted.
2. Reviews the overlay rules added since its last run and proposes where one belongs instead:
   siblings, `defaults.yaml`, the normalizer or an emitter. A proposal that would cancel an
   approval is not made; it is listed, with the approvals it would cancel, for the owner to decide.
3. Runs the Verify block, and stops for the owner's review.

It never touches `spec/approvals.yaml` and never loosens a check.

## How it is built

### The service

One local Node process, `scripts/workbench/` (its pure logic in modules the tests import), on a
fixed port, `localhost` only.

- **Lifecycle.** Each launcher (`.storybook/main.ts` in the dev server only, and
  `scripts/widgetbook.mjs` when serving) ensures it runs: it starts it where the port is free and
  reuses it where it is taken. It exits a minute after its last viewer disconnects.
- **One job at a time.** Writes, regenerations and checks queue; the viewers hear progress
  (regenerating, checking, done, failed, circles changed) through server-sent events.
- **Reads fresh.** Each request reads the files from disk, and a write names the content it read:
  a file changed since (by an agent or an editor) is refused, and the bar asks to reload.
- **Endpoints:** a component's inspection (layers, cells, the tokens allowed per cell, pending
  edit); set, keep, undo; report; approve, unapprove; status.

### Inspection

`solar:explain`'s lookup, run in memory (about 1.6 seconds for Button), as JSON rather than text.
The tokens allowed for a cell: the semantic tokens of the kind of the cell's current token,
primitives never.

### The pending edit

Choosing a token writes the `set` entry with the reason `TODO(reason)` (`PLACEHOLDER` in
`normalize/overlay.mjs`) and regenerates with a flag only the service passes, which lets that
placeholder through. A plain `solar:codegen`, the Verify block and CI still refuse it, so an edit
walked away from cannot ship unnoticed; reopening the bar shows it again, with Keep and Undo.
Keep writes the reason and regenerates without the flag.

### Refreshing the viewers

Storybook reloads through its dev server as the generated files change. `scripts/widgetbook.mjs`
starts `flutter run` with a pid file, and the service sends it the hot-reload signal after each
regeneration (hot restart where a reload cannot apply).

### Failures

| What happens                             | The bar                                                                |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| the edit breaks the build                | shows the error; the edit is undone                                    |
| Keep would move an approved fingerprint  | names the approval; the edit is undone (a safety net beneath the lock) |
| the component's checks fail              | shows the failure; Undo or Send to agent                               |
| a file changed on disk since it was read | asks to reload; nothing is written                                     |
| no service                               | is absent                                                              |

## Tests

- **The service's logic**, unit tests with no viewer: a `set` added, replaced and deleted, with the
  file's comments and order kept; Undo restores the exact bytes; Approve writes the line
  `solar:status` prints; Undo approval withdraws the approvals above; the lock and the Keep check
  refuse a change that moves an approved fingerprint; 🔴 and 🟢 components refuse edits and
  reports; a stale read is refused; a pending placeholder is refused by a plain `solar:codegen`.
- **One end-to-end test per viewer:** Storybook in Playwright, Widgetbook as a widget test against
  a fake service. The bar appears with a service and is absent without; a token change reaches the
  component; Approve and Undo approval work through their Confirmation Dialogs.
- The visual checks and oracles are untouched: the bar is never drawn where they measure.

## Docs, in the same change

- `docs/engineering/workflows.md`: "Fix a component in the viewer"; "Approve a component" gains
  the buttons.
- `docs/engineering/architecture.md`, "The viewers" and "Approvals": the workbench.
- `docs/engineering/decisions.md`: the decisions above, owner, 2026-09-27.
- `CLAUDE.md`: approvals are written by hand or through the viewers' buttons, and an agent never
  presses them; `spec/feedback/` and `/solar-feedback`.
- `docs/engineering/open-work.md`: "Recording approvals from the viewers" removed.
- `packages/components/stories/README.md`, `packages/solar_flutter/widgetbook/README.md`: the bar.

## Build order

1. The service's core: inspection, the overlay writer, the pending edit, approve and unapprove,
   with their unit tests.
2. The bar in Storybook, then the same in Widgetbook, with the refresh and the end-to-end tests.
3. Report, the feedback queue and the `/solar-feedback` skill.
4. The per-component checks behind Keep and Approve, and Send to agent.

Each batch stops for the owner's review.

## Out of scope

- Editing through the deployed Storybook or by designers (production is read-only).
- A raw value, or any overlay rule kind other than `set`, from Inspect (Report covers them).
- Grouping the sidebars by Figma's sections (set aside).
