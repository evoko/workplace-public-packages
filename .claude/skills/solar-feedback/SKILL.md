---
name: solar-feedback
description: Work through the notes the viewers' workbench saved in spec/feedback/ (Report, and Send to agent) - fix each on a 🟡 component where its kind of change belongs, propose where new overlay rules belong, verify, and stop for review. Use when the owner says to process feedback, run /solar-feedback, or act on workbench notes.
---

# Process the workbench's feedback

A person writes each note in Storybook or Widgetbook, with the workbench's **Report** or **Send to
agent** ([workflows.md, Fix a component in the viewer](../../../docs/engineering/workflows.md#fix-a-component-in-the-viewer));
the service saves it as `spec/feedback/<component-slug>-<n>.yaml`. Its fields:

| Field       | Holds                                                                                                                                                                                                                                                     |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `component` | the component's name in code, as `npm run solar:status` lists it (`Text Input`); it differs from Figma's for Calendar Day Cell, Date Picker Day Cell and Tree Indent                                                                                      |
| `platform`  | `web` or `flutter`: the viewer the note came from                                                                                                                                                                                                         |
| `on`        | the date, `YYYY-MM-DD`                                                                                                                                                                                                                                    |
| `note`      | the person's words: what to resolve                                                                                                                                                                                                                       |
| `layer`     | optional, present only once the component was inspected: the layer chosen in Inspect                                                                                                                                                                      |
| `variant`   | optional, present only once the component was inspected: Figma's name for the variant chosen in Inspect (not necessarily what `controls` draw); pass it to `--variant` as is                                                                              |
| `controls`  | empty in a Send to agent note; otherwise the Playground's values when the note was written; a Flutter colour arrives as `#rrggbb`, or `#aarrggbb` (alpha first) when not opaque, not CSS `#rrggbbaa`; the web sends what Storybook's colour control holds |
| `rule`      | optional (Send to agent after a failing Keep): the overlay rule the person kept, its `set` key                                                                                                                                                            |
| `value`     | optional (Send to agent after a failing Keep): that rule's value (`{ token }`, `{ keyword }` or `{ none: true }`), or null where the person removed the rule for Figma's own value                                                                        |
| `failures`  | optional (Send to agent): the checks that failed, each `{ platform, variant?, layer?, property?, figma?, drawn?, message? }`; a variant from a Dark report ends in ` (Dark)`; past 199, the last one counts the rest                                      |

[CLAUDE.md](../../../CLAUDE.md) holds throughout; these steps add to it.

## 0. Stop on a pending edit

If `.workbench/pending.json` exists, a look edit is pending in the viewer. If
`grep -rn "TODO(reason)" spec/overlay` finds anything, it is a pending viewer edit or a pasted
`solar:explain --propose` rule. Either way, **stop and tell the owner**: a person presses Keep or
Undo in the viewer, or writes the reason. Never Keep, Undo or delete the pending edit yourself.

While you work, nobody presses Set, Keep or Approve in a viewer: ask the owner before starting,
since the workbench's checks and yours share build directories
([Pitfalls](../../../docs/engineering/workflows.md#pitfalls)).

Never call the workbench service's Keep, Approve, Undo approval, Report or Send, never Set or Undo
there, and never write `spec/approvals.yaml` (CLAUDE.md). Make every change in the files.

## 1. Read the queue

List `spec/feedback/*.yaml` (never touch `.gitkeep`), and run `npm run solar:status`. A note is
yours only if its component is 🟡 on both platforms, or 🟡 on one and absent from the other:

- 🔴 on either: leave the note, and report what it waits on (never work on 🔴);
- 🟢 on either: leave the note, and report that a person must withdraw the approval first;
- on neither (renamed or removed): leave the note, and report it.

## 2. Resolve each note

1. See what draws the cell and why:
   `npm run solar:explain -- "<component>"`, adding `--variant "<variant>"` (a failure's variant
   without its ` (Dark)`), `--layer <layer>` and `--property <property>` (a failure's `property`)
   where the note or a failure names them
   ([Fix a failing visual check](../../../docs/engineering/workflows.md#fix-a-failing-visual-check)
   explains the output).
2. Decide where the change goes with
   [Decide where a change goes](../../../docs/engineering/workflows.md#decide-where-a-change-goes).
   A token that does not exist is a governance gap (⚠️): leave the note and report it. A note open to
   more than one reading: leave it, and ask in your report.
3. A note with `failures` came from a Keep or an Approve whose checks failed where the person judged
   the component right (a Keep's edit is already in the overlay, with the person's reason). Settle
   it with an overlay decision that records that judgement, so the check excuses it
   ([Decide a finding](../../../docs/engineering/workflows.md#decide-a-finding)), or by fixing the
   knock-on in the code. **Never** loosen a check or edit `spec/verify/`.
4. Make the change, run `npm run solar:codegen` and keep what it writes, then run that component's
   own checks, the ones the workbench's Keep runs, one at a time (never in parallel), as
   [The checks behind Keep and Approve](../../../docs/engineering/workflows.md#the-checks-behind-keep-and-approve)
   lists them.

5. Run `npm run solar:status -- --check`. A change that cancels an approval is undone by hand (never
   `git checkout`; CLAUDE.md) and listed for the owner, with the approvals it would cancel
   ([Approve a component](../../../docs/engineering/workflows.md#approve-a-component)).
6. Delete the resolved note with `rm spec/feedback/<file>.yaml`, on its exact path (`rm -rf` is
   denied here).

## 3. Propose where new rules belong

Read `git diff -- spec/overlay` and run `npm run solar:overlay:audit`. For each `set` rule added
since the last commit, ask whether the same decision belongs on sibling components, in
`spec/overlay/defaults.yaml`, in the normalizer or in an emitter.

A proposal is **listed, not made**, with what it would touch, when it would cancel an approval or
change any 🔴 component's output (moving a rule into `defaults.yaml`, the normalizer or an emitter
usually does). To tell, with `<generated>` standing for
`spec packages/styles/src/generated packages/assets/src/generated packages/solar_flutter/lib/src/generated packages/components/stories`:
save `git status --porcelain -- <generated>` and `git diff -- <generated>` before the proposal,
make it, run `npm run solar:codegen`, run both again and compare the two (not against HEAD). The
files that differ name the components whose output changed; compare them with
`npm run solar:status`, and run `npm run solar:status -- --check`. A proposal that fails either
test is undone by hand (never `git checkout`; CLAUDE.md).

## 4. Verify and stop

Run the whole block in
[Verify before saying a task is done](../../../docs/engineering/workflows.md#verify-before-saying-a-task-is-done),
and update the docs a change makes untrue, as CLAUDE.md says. Report each note resolved and how,
each note left and why, each proposal made or listed, and each check's output (a failure with its
output, a skipped check named as skipped). Then stop for the owner's review: the owner commits.
