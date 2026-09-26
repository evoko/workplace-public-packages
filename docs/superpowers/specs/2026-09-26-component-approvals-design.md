# Component approvals: design

**Status:** agreed with the owner on 2026-09-26 and built as described here; folded into the
engineering docs once committed.

## Why

The development loop is: the generator produces every component roughly right; a person reviews
each one, notices flaws, and has agents fix them through an overlay, a shell, or a better
generator; the person then confirms the component looks and behaves exactly as intended. Nothing
ships that a person has not confirmed first hand.

Today nothing records that confirmation. The visual checks compare each platform with Figma, not
with what a person approved, and nothing stops a generator improvement made for one component from
quietly changing another that was already confirmed. This design adds a record of approvals, per
component and per platform, and makes losing one visible and blocking.

## The three colours

Each component has one colour per platform (web, Flutter):

| Colour | Meaning                                            | Work on it?                  |
| ------ | -------------------------------------------------- | ---------------------------- |
| 🟢     | Approved, and every component it uses is 🟢        | Done; protected              |
| 🟡     | Not approved, and every component it uses is 🟢    | Yes: ready to fix and review |
| 🔴     | Not approved, and some component it uses is not 🟢 | No: its children come first  |

Approval therefore goes bottom-up. A component "uses" another when the other's shell is among the
files it ships (below), however it got there: its own import or a runtime helper's, and so
transitively. Dialog uses Icon Button, Scrim and Spinner on both platforms: on the web Scrim
through the `internal/modal.tsx` helper, and Spinner through Icon Button. Each platform's colours
follow its own graph.

The nodes are the components with a shell on that platform, as the descriptors list them.
Shared runtime helpers (`internal/layers.tsx`, `internal/theme.ts`, `SolarLayers`,
`solar_theme_of.dart` and the rest) are not nodes: they count towards the fingerprint of every
component that imports them. A component checked as another's state (Autocomplete Open) is not
listed; the component it is the state of covers it. A chart library draws Bar, Line and Donut
Chart, and their hand-written wrappers ship, so each is listed with its wrapper (`BarChart.tsx`; in
Flutter the widget in `lib/src/solar_charts.dart`); Chart Axis and Chart Gridlines have no wrapper
and are covered by the charts that draw them. Components that share an entry file (the three
Flutter charts) do not use one another, and share one fingerprint.

On 2026-09-26 neither graph had a cycle, and the longest chain was four components on each
platform.

## Fingerprints: what counts as a change

An approval records the component's **fingerprint**, a SHA-256 of what the component ships on that
platform. The approval holds while the fingerprint is unchanged; any change to what ships cancels
it.

A component's fingerprint covers every file it ships: its shell, the shells of the components it
uses, the runtime helpers, its generated recipe, tree and slots, and (on the web) its icons and
what `SolarProvider` installs: its files and the generated MUI theme
(`packages/styles/src/generated/mui/theme.ts`), since a change to that theme changes how the
component looks in an app. Each
file is read as a stream of tokens, with comments and whitespace dropped, so rewording a comment or
reformatting changes nothing. The files are taken in a fixed order (by path, `byCodeUnit`).

- **Web.** esbuild resolves the component's entry, `packages/components/src/<Name>.tsx`, with the
  workspace packages (`@bwp-web/styles`, `@bwp-web/assets`) read from source through
  `packages/codegen/src/util/workspace-sources.mjs`; its metafile names the files the component
  ships (one esbuild pass over every shell and `SolarProvider`). Every npm package is external
  (React, MUI, Emotion, MUI X Charts, the `@fontsource` fonts). Each file is read as the tokens of
  TypeScript's syntax tree. The fingerprint also
  covers the value, in every mode, of every `--solar-*` token those files' code names, since a
  recipe names a token and `tokens.css` holds its value. Names are read from the code, so a
  comment naming a token counts for nothing; a name built at run time
  (`var(--solar-icon-${size})`) counts every token it can be. It also covers every declaration in
  `tokens.css` that is not a token (the reduced-motion rule), which reaches every component.
- **Flutter.** The files are `solar_<name>.dart` and every file it imports within `solar_flutter`,
  transitively (child widgets, helpers, the generated recipe, `tokens.dart`); Flutter, `fl_chart`
  and `intl` are external. Each file is tokenised by a small Dart lexer that drops comments and
  whitespace and keeps strings intact.

Flutter's `tokens.dart` holds every token, so any token change cancels every Flutter approval; the
web names its tokens one by one. A change to the MUI theme or to `tokens.css`'s other declarations
cancels every web approval, as a change to `tokens.dart` cancels every Flutter one.

The bundler only resolves files; its output is never hashed. So upgrading esbuild changes no
fingerprint. (An earlier draft hashed the minified bundle; that tied every web approval to
esbuild's exact output, which the newest-version policy would change often.)

Because a component's files include its children's, a child's change changes every parent's
fingerprint: when Button changes, Dialog's approval is cancelled with Button's, and Dialog turns 🔴
until Button is approved again. Reverting the change restores both fingerprints, and both
approvals hold again with no edit.

Never part of a fingerprint: tests, stories, visual cases, the variants package and Widgetbook.
They do not ship.

**Upgrades.** An upgrade of any package outside this repository that a platform's components run
on (on the web React, MUI, Emotion, MUI X Charts and the `@fontsource` fonts; in Flutter the SDK,
`fl_chart` and `intl`) can change behaviour without changing a fingerprint. By policy, it clears
that platform's approvals in `spec/approvals.yaml` in the same change.

## The approval record

`spec/approvals.yaml` is written by hand, by people only. Agents never edit it (a rule in
`CLAUDE.md`). A better way to record approvals is planned (open work); until then, the owner pastes
the line `solar:status` prints.

```yaml
# Human approvals, per component and platform. Written by people only, never by an agent.
# Paste the line `npm run solar:status` prints for a 🟡 component once you have confirmed it.
Button:
  web: { fingerprint: 'sha256:3f9a…', by: Joon, on: 2026-09-27 }
  flutter: { fingerprint: 'sha256:c41e…', by: Joon, on: 2026-09-27 }
```

Keys are the components' names as the descriptors spell them (`Action Card`, `StatusIndicator`).
`by` is free text; `on` a date. The file starts empty, and every component starts 🟡 or 🔴.

## The status command

`npm run solar:status` is read-only. It builds both graphs, computes every fingerprint, reads
`spec/approvals.yaml`, and prints each platform's components with their colour; each 🔴 line names
the 🟡 components to approve first (`approve first: …`), or says it is in a cycle. For each 🟡
component it prints the exact YAML to paste. It is the one place that says what is workable.

`npm run solar:status -- --check` fails, naming the components involved, when:

1. a recorded fingerprint no longer matches: the component, or something it uses, changed. The
   message lists every component to re-review, or the change to revert;
2. an approval is recorded for a 🔴 component (pasted before its children were approved);
3. an approval names a component, or a platform, that has no shell;
4. a platform's graph has a cycle, which would leave its members 🔴 forever.

With `spec/approvals.yaml` empty, the check passes.

It runs in CI, in the "Generated code is up to date" job of `.github/workflows/solar.yml` (the
Flutter fingerprints only read files, so no Flutter SDK is needed), and in the Verify block of
`docs/engineering/workflows.md`. An agent's change that cancels an approval therefore cannot pass
until the owner re-approves or the change is reverted.

The code lives in `packages/codegen/src/approvals/` (graph, fingerprint, check) with its CLI in
`packages/codegen/bin/solar-status.mjs`, under the same Node check as the other CLIs.

## Circles in the viewers

Each viewer shows its own platform's colours as 🔴, 🟡 or 🟢 before each component's name in its
sidebar, the same characters in both:

- **Storybook** (and its Vercel deployment): a `manager.ts` sets the sidebar's `renderLabel`; the
  colours are computed in Node when Storybook starts or builds, in `main.ts`'s `managerHead`, and
  never committed. A running Storybook shows a new approval after a restart; the deployed one's
  circles are as of its last deployment, since an approval alone may deploy nothing (the Vercel
  project skips a deployment when nothing its root directory depends on changed, and the Turbo
  cache does not key on the record).
- **Widgetbook**: `scripts/widgetbook.mjs`, which already prepares Widgetbook's assets before each
  run, writes the Flutter colours to `widgetbook/assets/verify/approvals.status` (JSON; the
  directory is already an asset and git-ignored, and the name is not `.json`, which the app reads
  as oracles), and each `WidgetbookComponent`'s name takes its circle. Where the status module
  cannot load (the CI job that builds Widgetbook installs no npm packages), the script prints a
  note and builds without circles.

The circles are informational; the check is what blocks.

## Tests

In `packages/codegen/test/`:

- **Colours:** an unapproved component using nothing unapproved is 🟡; one using an unapproved
  component is 🔴; an approved one with only 🟢 children is 🟢; a child's change cancels the child
  and every parent above it; reverting restores them.
- **The check:** one test per failure above, each requiring the message to name the component.
- **Fingerprints, proved by mutation** (change a committed file, compute, restore): a child's edit
  changes the parent's fingerprint; a token's value, the MUI theme and `tokens.css`'s other rules
  change the web fingerprint; a comment-only or whitespace-only edit changes neither platform's;
  an edit to a test, story or visual case changes nothing; computing twice gives the same result.
- **The graph:** its nodes are exactly the components with a shell on each platform; helpers are
  not nodes.
- **The viewers:** each viewer's status list has a colour for every component on its platform.

## Docs, in the same change

- `CLAUDE.md`: agents never edit `spec/approvals.yaml`, and never work on a 🔴 component;
  `solar:status` says what is workable.
- `docs/engineering/workflows.md`: a section "Approve a component" (confirm it in the viewer, run
  `solar:status`, paste the line); the check in the Verify block; in "Upgrade a dependency", that
  an upgrade of a package outside this repository clears that platform's approvals.
- `docs/engineering/architecture.md`: a short section on approvals, and the check in the CI table.
- `docs/engineering/decisions.md`: approvals per component and platform; the fingerprint of what
  ships as the trigger; 🔴 blocks work; a cancelled approval fails CI; hand-edited record for now;
  the same circle characters in both viewers. Each Owner, 2026-09-26. Taken: Flutter's
  fingerprints include all of `tokens.dart`; every web fingerprint covers `SolarProvider`, its MUI
  theme and `tokens.css`'s declarations that are not tokens.
- `docs/engineering/open-work.md`: a better way to record approvals than editing the file.
- `packages/codegen/README.md`: the status command. `packages/components/stories/README.md` and
  `packages/solar_flutter/widgetbook/README.md`: the circles.

## Out of scope

- Recording approvals from the viewers, or any flow other than editing the file (open work).
- Screenshots, as a trigger or as a review aid; a later addition may show before and after images
  when an approval is cancelled.
- Approving at a finer grain than a component and platform (a variant, a state).
