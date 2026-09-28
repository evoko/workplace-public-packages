# Workflows

How to do the common tasks, step by step. [architecture.md](architecture.md) says why the
system is shaped this way; the reference for each tool is the README it links to.

The repository owner handles all version control. An agent runs no git write command (no `add`,
`commit`, `stash`, `checkout`, worktree); it finishes a task by stopping and reporting.

## Set up a machine

| Tool                  | Version                          | Needed for                                            |
| --------------------- | -------------------------------- | ----------------------------------------------------- |
| Node                  | 22 (`.nvmrc`), with npm 10.9     | everything; the codegen CLIs stop on an older Node    |
| Flutter               | 3.47.5 (`FLUTTER_VERSION` in CI) | `solar:codegen` (it runs `dart format`), Flutter work |
| Playwright's Chromium | the pinned Playwright's          | `npm run test:visual`                                 |
| A Figma access token  | `file_content:read`              | `solar:sync` and the fetchers only                    |

```bash
nvm use                      # or: export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH
npm install
(cd packages/components && npx playwright install chromium)
(cd packages/solar_flutter && flutter pub get && (cd variants && flutter pub get) && (cd widgetbook && flutter pub get))
npm run build
```

On the owner's machine Flutter is at `~/development/flutter`. The Figma token goes in
`~/.config/figma/token` or `$FIGMA_TOKEN`; nothing but a sync needs it. The published packages
support Node 20 and newer; only building the repository needs Node 22.

A different Flutter version reformats the generated Dart, and CI fails on the difference. To
upgrade Flutter: install the new version, run `npm run solar:rebuild` and `dart format` on the
package, and raise `FLUTTER_VERSION` in `.github/workflows/solar.yml` in the same change.

## Everyday commands

From the repository root:

| Command                                                | Does                                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `npm run solar:rebuild`                                | rebuild every generated doc, token file and code target; no network      |
| `npm run solar:codegen`                                | only the code: `spec/` and every generated target                        |
| `npx vitest run`                                       | the unit and parity suites (codegen, from the root or the package)       |
| `npm run test:visual`                                  | the web visual check; reports in `packages/components/test/visual/.out/` |
| `npm run storybook`                                    | the React viewer, http://localhost:6006, with the workbench              |
| `npm run widgetbook`                                   | the Flutter viewer, in Chrome, with the workbench                        |
| `npm run solar:explain -- "<Name>"`                    | why a component draws what it draws (see below)                          |
| `npm run solar:triage`                                 | every SOLAR Web component's IR, findings and needs, for planning         |
| `npm run solar:overlay:audit`                          | decisions the overlays make more than once                               |
| `npm run solar:status`                                 | each component's approval colour, per platform (see below)               |
| `npm run build && npm run smoke:install`               | pack the packages and install them into a clean React 18 app             |
| `npm run lint`, `typecheck`, `format`, `test`, `build` | across the workspace, through Turbo                                      |

The commands that fetch from Figma or rebuild the docs are in [docs/README.md](../README.md#commands).

In `packages/solar_flutter`: `flutter test` (the widget tests and the Flutter visual check,
reports in `build/visual/`), `flutter analyze`,
`dart format lib test variants/lib widgetbook/lib widgetbook/test`; in its `widgetbook/`,
`flutter test` (the Playground adapter and builders, and the workbench bar).

## Verify before saying a task is done

Everything CI runs, locally. **Any change to code, an overlay, a descriptor, a shell, a runtime
helper or a generated file runs all of it**, and all of it must pass; the rebuild must leave the
tree unchanged but for your own change. A change to Markdown alone runs the last two lines (the
personal-data check and the Prettier check CI runs).

```bash
npx vitest run
npm run solar:status -- --check
npm run lint && npm run typecheck && npm run format
npm run solar:rebuild && npm run solar:rebuild && git status --porcelain   # only your own changes
npm run test:visual
(cd packages/solar_flutter && flutter analyze && (cd variants && flutter analyze) && (cd widgetbook && flutter analyze) \
  && dart format --output=none --set-exit-if-changed lib test variants/lib widgetbook/lib widgetbook/test \
  && flutter test && (cd widgetbook && flutter test))
npm run build-storybook -w @bwp-web/components && npm run widgetbook -- build
npm run build && npm run smoke:install
node scripts/check-personal-data.mjs
npx prettier --check "docs/**/*.md" "docs/**/*.mjs" "docs/**/*.js" "docs/**/*.json" "scripts/**/*.mjs" \
  "scripts/**/*.json" "spec/overlay/**/*.yaml" "spec/**/*.md" "packages/solar_flutter/**/*.md" \
  ".claude/skills/**/*.md" README.md CLAUDE.md package.json
```

Generated output of every component a change does not name must be byte-identical before and
after. `git status --porcelain -- spec packages/styles/src/generated packages/assets/src/generated
packages/solar_flutter/lib/src/generated packages/components/stories` after `solar:codegen` must
list only the files of the components the change names (reading `git status` is not a git
write). The visual checks and the Flutter tests share a server and build directories, so run them
once, not from parallel agents.

## Decide where a change goes

| The problem                                                | The change                                                                                                                                                                                                          |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A value is wrong in every target                           | the normalizer, `packages/codegen/src/normalize/`                                                                                                                                                                   |
| A value is wrong in one target                             | that emitter, `packages/codegen/src/emit/`                                                                                                                                                                          |
| One component looks wrong on one platform                  | its descriptor's tables, `packages/codegen/src/components/<name>.mjs`                                                                                                                                               |
| One component looks wrong, and Figma is right for it alone | its overlay, `spec/overlay/<name>.yaml`                                                                                                                                                                             |
| A rule holds for every component                           | `spec/overlay/defaults.yaml`                                                                                                                                                                                        |
| A component behaves wrong                                  | its shell, `packages/components/src/<Name>.tsx` or `solar_flutter/lib/src/components/solar_<name>.dart`, or the runtime helper it calls                                                                             |
| Figma itself is wrong                                      | leave the finding open (the design review asks the designers), or `accept` it in the overlay where the code keeps its value; a wrong token value or icon: a rule in `packages/codegen/src/normalize/deviations.mjs` |
| A token you need does not exist                            | stop and flag a governance gap (⚠️); never invent a name                                                                                                                                                            |
| A new token appeared in Figma                              | nothing in the generator: recapture `figma-variables.json` by hand ([Regenerating](../solar/tokens/README.md#regenerating)), then `npm run solar:tokens` and `solar:codegen`; an unknown token type fails loudly    |
| A new icon appeared in Figma                               | nothing in the generator: `npm run solar:icons` (it fetches, so it needs the Figma token), then `solar:codegen`; an SVG feature the IR cannot represent (a gradient, a stroke, an arc) fails naming the file        |
| A visual check fails                                       | [Fix a failing visual check](#fix-a-failing-visual-check), below                                                                                                                                                    |

Never edit `docs/`, a generated file, or an oracle to make something pass. After any change to
`packages/codegen` or `spec/overlay`, run `npm run solar:codegen` and keep what it writes.

## Fix a failing visual check

1. Read the failure: the web writes `packages/components/test/visual/.out/<name>-failures.json`
   (and `-dark-failures.json`), Flutter `packages/solar_flutter/build/visual/`.
2. `npm run solar:explain -- "<Name>"` lists the variants, every excused difference and the last
   runs' failures. It builds from the current sources in memory and writes nothing.
3. Narrow it to one cell:
   `npm run solar:explain -- "<Name>" --variant <v> --layer <layer> --property <cell>`, where
   `<v>` is a variant's number, Figma's name for it, or `axis=value` pairs. It shows the chain for
   that cell: Figma's value, the recipe entry that wins and where it sits (base, size, appearance,
   or combined), its token and value, where it was read from (a Figma variant, the defaults, the
   overlay) and why, the rules on it, the excuse, and what each platform drew. `--full` shows
   every row, not only those that differ.
   Layer names are the IR's (`layers` in
   `spec/components/<name>.json`, or the rows `--variant` prints); a layer name that does not
   exist prints nothing, so take it from there.
4. Decide which is wrong:
   - **the code** (the recipe draws what the oracle expects, the platform does not): fix the
     emitter table, the shell or the runtime helper;
   - **the recipe** (it does not say what Figma draws): fix the normalizer, or decide it in the
     overlay;
   - **Figma** (a slip among its variants): leave the finding open, or `accept` it, so the oracle
     excuses it.
5. `npm run solar:codegen`, then the check again.

## Decide a finding

A finding is a disagreement between Figma's variants and the recipe, or a value bound to no
variable. `npm run solar:explain -- "<Name>" [--variant …] --propose <layer>.<cell>` prints the
overlay rule that decides it, with `reason: TODO(reason)`, which the build refuses until a person
writes a real reason. For a `set`, the other route is the viewer's Inspect, which writes the rule
and asks for its reason ([Fix a component in the viewer](#fix-a-component-in-the-viewer)). Choose
by what the finding is:

| Finding                                  | Rule                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| A real interaction between axes          | `follows`                                                            |
| A Figma slip the code does not copy      | leave open (the design review lists it), or `accept` with the reason |
| A raw value equal to a token's           | `bind` (a token of another value fails: a bind never redesigns)      |
| A raw value no token has                 | `allowLiteral`, a governance gap; the reason names it                |
| An entry that should differ from Figma's | `set` (a token, `none`, a keyword, or an allowed literal)            |

Every rule kind is in [spec/overlay/README.md](../../spec/overlay/README.md).

## Add a component

Every file but the overlay is named from the component's name in code, Figma's name or its
overlay's `codeName`: lower-cased with every run of other characters as `-` (the slug) or `_` (the
snake), or PascalCase. For **Split Button**, named `SplitButton` in Figma, and **Button Group**:

| File                                                                            | SplitButton              | Button Group              |
| ------------------------------------------------------------------------------- | ------------------------ | ------------------------- |
| descriptor, `packages/codegen/src/components/`                                  | `splitbutton.mjs`        | `button-group.mjs`        |
| overlay, `spec/overlay/`                                                        | `splitbutton.yaml`       | `button-group.yaml`       |
| React shell, `packages/components/src/`                                         | `SplitButton.tsx`        | `ButtonGroup.tsx`         |
| Flutter shell, `packages/solar_flutter/lib/src/components/`                     | `solar_splitbutton.dart` | `solar_button_group.dart` |
| web case, `packages/components/test/visual/cases/`                              | `splitbutton.tsx`        | `button-group.tsx`        |
| Flutter builder and case, `variants/lib/src/` and `test/visual/cases/`          | `splitbutton.dart`       | `button_group.dart`       |
| web Playground builder, `packages/components/stories/playground/`               | `split-button.tsx`       | `button-group.tsx`        |
| Flutter Playground builder, `packages/solar_flutter/widgetbook/lib/playground/` | `split_button.dart`      | `button_group.dart`       |

The overlay alone is named from the component's address, Figma's name or `<section>/<name>`
(`inputs-day-cell.yaml` for Date Picker Day Cell). The Playground builders are named from the
builder's identifier word by word (`playgroundFileOf`, `packages/codegen/src/emit/playground.mjs`),
so `SplitButton` is `split-button.tsx`, not the slug's `splitbutton`.

`npm run solar:codegen` writes the registries that import these files, so the typecheck and
`flutter analyze` name any that are missing or misnamed. Where Figma's name is two components'
(`Day Cell`), the overlay's `codeName` decides (`Calendar Day Cell`, `Date Picker Day Cell`).

In short (every table a descriptor may hold is in the codegen README's
[Descriptor reference](../../packages/codegen/README.md#descriptor-reference)):

1. `npm run solar:triage` shows whether it builds, its API, slots, composition and findings.
   A component it composes must exist first.
2. Write its descriptor, `packages/codegen/src/components/<name>.mjs` (`name`, the MUI tables,
   the Flutter tables, an `api` table where a platform reaches a prop by another name, `checkedAs`
   where a Figma component is another's state: Autocomplete Open). Nothing else lists components
   by hand.
3. Write its overlay, `spec/overlay/<address>.yaml`, deciding every finding.
4. `npm run solar:codegen` writes its recipes, tree, slots and story, and adds it to every
   registry: the shell barrels, the MUI theme's types, the case registries and the variant
   builders' registry (each file is listed in the codegen README's
   [Descriptor reference](../../packages/codegen/README.md#descriptor-reference)). It fails until
   both shells exist.
5. Write both shells by hand, starting from the nearest component's (a drawn one from Counter's,
   a field from Text Input's, a card from Card's). A drawn shell hands the generated tree to
   `drawChildren` (web) or `SolarLayers` (Flutter), whose options are listed in the same README; a
   composed child it draws (Button's Spinner) comes from the recipe's `compose` lookup, never by
   hand. `npx vitest run test/component-parity.test.mjs` (in `packages/codegen`) names what of the
   IR a shell does not reach yet.
6. Write its visual cases: `packages/components/test/visual/cases/<slug>.tsx`, a builder in
   `packages/solar_flutter/variants/lib/src/` and a case in `packages/solar_flutter/test/visual/cases/`.
   Until they exist the typecheck and `flutter analyze` fail on the registries naming them.
7. Write its two Playground builders, `packages/components/stories/playground/<file>.tsx` and
   `packages/solar_flutter/widgetbook/lib/playground/<file>.dart`, starting from the nearest
   component's: each renders the real component from the generated controls, wires its callbacks
   to `set` and `log`, and holds no design value. Give it extras or sample words in
   `packages/codegen/src/playground/extras.mjs` where the IR holds no value an app gives it (a
   typed value, an overlay's `open`) or Figma records no words for a text slot, then
   `npm run solar:codegen`. Until both builders exist the typecheck and `flutter analyze` fail on
   the generated Playground registries. The controls, the interface and the rules:
   [architecture.md, The viewers](architecture.md#the-viewers).
8. Unit tests for its IR and recipes (`packages/codegen/test/`) and its shells (the Flutter
   `test/solar_<name>_test.dart`); the Playground tests cover its builders already, and an
   interaction of a new kind gets its own (`test/visual/playground.spec.mjs`, the Widgetbook
   `test/playground_*_test.dart`).
9. Its entry in `packages/components/README.md` and `packages/solar_flutter/README.md`, its open
   findings and governance gaps in the design review (below), and any decision in
   [decisions.md](decisions.md).
10. Verify, as above.

Both viewers then show its variants and its Playground.

## Fix a component in the viewer

`npm run storybook` and `npm run widgetbook` start the workbench service with the viewer, and each
component's Playground then has the **workbench bar** above it: Storybook's acts for the web,
Widgetbook's for Flutter. Where no service answers (a static build, the deployed Storybook), there
is no bar. How the service works: [architecture.md, The workbench](architecture.md#the-workbench).

The bar shows the component's circle on its platform, and offers by it:

| Circle | The bar offers                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------ |
| 🔴     | nothing to change or approve: the components to approve first, or the cycle it is in                   |
| 🟡     | **Inspect** and **Report**, where the component is 🟡 or absent on the other platform too; **Approve** |
| 🟢     | **Undo approval**                                                                                      |

A look change reaches both platforms, so Inspect and Report are locked while the component is
approved on either platform (the bar names the viewer to withdraw it in) or waits on another
component on either.

### Inspect: change a look by choosing a token

1. Press **Inspect**. A full-screen dialog opens over the viewer, the same in both; Close or Escape
   closes it. Its top row has a Select per variant axis, the state among them (every Figma variant,
   states included: the Playground shows only the resting state); a value no drawn variant pairs
   with the others cannot be chosen.
2. Choose a **layer**, from the tree of the component's layers (nested as Figma nests them), or by
   clicking its part in the preview, which draws the variant large with the selected layer
   outlined. Widgetbook outlines and points only in a component `SolarLayers` draws; for one
   Material draws (Button among them) it names the selected layer beside the preview instead.
3. The layer's properties list its cells in that variant: each cell's entry (a token, `none`, a
   keyword or a raw value), its value as a person reads it, and where it comes from, **Figma**,
   **rule** or **defaults**, as `solar:explain` reads them.
4. Choose a cell. Its editor opens under its row:
   - **Apply to**: the scope, the look the rule is keyed on, from every variant down to the one in
     view, in plain words (`every md`, `primary · at rest`), each with how many variants a change
     there reaches. The scope that holds today's value is marked, and one a narrower rule decides
     in the variant in view is disabled, naming that rule. Only the scopes the build accepts are
     offered.
   - **Filter tokens** and **Change to**: the semantic tokens of the cell's kind, each with its
     value, `none`, and `FILL` or `HUG` for a width or a height. Change to lists at most eight of
     the tokens the filter matches, then how many more. A cell whose raw value the overlay allows
     (`allowLiteral`) offers nothing. A raw value, or any rule but `set`, goes through Report.
   - a line saying why the cell is what it is now.
5. Choosing in Change to makes a **draft**, and nothing is sent. The strip along the dialog's foot
   shows it (the cell, the scope and its reach, before → after) and asks for a one-line reason a
   reviewer can check (none where the edit removes a rule). Where the cell had a rule, its old
   reason is shown to rewrite, and Save refuses it unchanged. **Discard**, or Close, drops the
   draft.
6. **Save** sends it. The service writes the `set` rule, with its reason, into the component's
   overlay, proves it reaches the variant in view, and regenerates with a plain `solar:codegen`.
   Both viewers then reload (Storybook's page; Widgetbook by a hot restart), and the dialog reopens
   where it was. What they show is the real regeneration: exactly what would ship. An edit the
   build refuses, one that changes nothing in the variant in view, and one that would cancel an
   approval are undone.
7. The component's checks run (below). When they pass, the edit is kept. When they fail, it stays
   **pending**, its failures in the strip, and the person chooses **Undo** (the overlay file back
   byte for byte, regenerated), **Keep again** (regenerated and checked again, after a fix) or
   **Send to agent**.

Choosing Figma's own value where a rule changed it removes the rule; a rule whose reason others
borrow (`reason: { as: set … }`) cannot be removed, and replacing one changes their reason too. A
component with no overlay file cannot be edited: a person adds the file first. **One edit is
pending in the repository at a time**: while it is, no viewer can save another, approve or undo an
approval, the dialog can be read but not edited, and the edit survives a restart of the service.

### The checks behind Keep and Approve

The component's own checks, one after another, never the whole suite:

- its web visual check alone, Light and Dark: in `packages/components`,
  `SOLAR_VISUAL_ONLY="<Name>" npx playwright test components.spec.mjs -g "in every variant"`;
- its Flutter visual check: in `packages/solar_flutter`,
  `flutter test test/visual/components_visual_test.dart --name "^<Name> draws what Figma draws"`;
- the whole parity suite, `npx vitest run test/component-parity.test.mjs` in `packages/codegen`,
  with `test/charts.test.mjs` for a component a chart library draws, which has no visual check.

Each visual check's reports are deleted before it runs, so every failure shown is this run's, and
each command stops after 15 minutes. The bar lists each failure (the variant, the layer and
property, what Figma draws and what was drawn, or what the command printed), 200 at most: past
that, the last one counts the rest and names the `solar:explain` command that shows them all.

A token chosen with Inspect does not fail them by itself: a `set` records the value it replaced,
and the oracle excuses that cell in the variants the rule reaches. A knock-on can: the checks also
measure positions and sizes, and one cell's change can move another that no rule names. Do not run
`npm run test:visual` or the Flutter tests while the workbench's checks run
([Pitfalls](#pitfalls)).

### Send to agent

Offered beside failing checks, where the component may change (on the terms of Inspect, so never on
a component approved on the other platform). It writes a note to `spec/feedback/` carrying the
failures and the person's words (none gives a default sentence):

- after a saved edit's checks fail (at Save or Keep again), the edit stays in the overlay with its
  reason and is no longer pending, and the note records the rule and its value; the component's
  checks, and CI's, fail until `/solar-feedback` settles it;
- after a refused **Approve**, the note carries the failures shown.

The agent settles it lawfully: by an overlay decision that records the person's judgement, so the
check excuses the difference, or by fixing the knock-on in the code; never by loosening a check or
editing an oracle. The person then approves.

### Report

A note for whatever Inspect cannot do: behaviour, a missing callback, a raw value, a layout the
overlay cannot express. Report is offered with Inspect, on the same terms, and works while an edit
is pending. **Save note** writes `spec/feedback/<slug>-<n>.yaml`: the component, the platform, the
date, the note (10 000 characters at most), every Playground control's value, and, once the
component has been inspected, the layer and variant chosen there. Each field is described in
[the skill](../../.claude/skills/solar-feedback/SKILL.md).

The notes wait in `spec/feedback/` until a developer runs `/solar-feedback` in Claude Code
(`.claude/skills/solar-feedback/`, the one committed project skill). It works on 🟡 components
only, resolves each note where its kind of change belongs, proposes where the new `set` rules
belong instead, verifies and stops for review; its steps are in the skill.

### Approve and Undo approval

**Approve** (🟡) opens a Confirmation Dialog. Confirming runs the checks above and, when they pass,
writes the component's line into `spec/approvals.yaml` for this platform, as `solar:status` prints
it: the fingerprint and `on` today. An approval names no person: any developer with write access may
approve.
Failing checks refuse it, listed, with Send to agent where the component may change.

**Undo approval** (🟢) opens a Confirmation Dialog listing every approval it withdraws: this one,
and every approved component on this platform that uses it (withdrawing Button withdraws Dialog),
since an approval above an unapproved component fails `solar:status --check`. Confirming removes
those lines.

The bar's circle changes at once; the sidebars' when the viewer next starts.

**An agent never calls the service's Keep, Approve, Undo approval, Report or Send** (a person's
decisions and words), by any means (a browser, `curl`, a script), and calls Save only in a test or
smoke run it undoes, leaving no pending edit; it may run the viewers and read from the service. The
service is a local port and cannot tell a person's click from a request; the rule in CLAUDE.md is
what holds.

## Approve a component

A person approves each component, per platform, once they have confirmed it looks and behaves as
intended. The record, `spec/approvals.yaml`, is written by people, never by an agent.

1. `npm run solar:status` shows each platform's components: 🟢 approved, 🟡 ready to review, 🔴
   waiting on a component it uses (its line names the 🟡 ones to approve first, or says it is in
   a cycle). Storybook's and Widgetbook's sidebars show each its own platform's circles.
2. Review a 🟡 component in its viewer, and have anything wrong fixed.
3. Run `npm run solar:status` again and paste the lines it prints for it into
   `spec/approvals.yaml` (under its name, where it is already there for the other platform): fixes
   change the fingerprint. Or press **Approve** in its Playground, which runs its checks first and
   writes the same line ([Approve and Undo approval](#approve-and-undo-approval)).

To withdraw an approval, delete its line and those of the approved components on that platform
that use it (an approval above an unapproved component fails the check), or press **Undo
approval** in the viewer, which withdraws them together. An agent does neither.

Any change to what it ships cancels it and every approval above it;
`npm run solar:status -- --check`, in CI and the Verify block, then fails until it is approved
again or the change is reverted. What counts, and why:
[architecture.md, Approvals](architecture.md#approvals).

## Keep the design review current

[docs/solar-review-for-design.md](../solar-review-for-design.md) is hand-written, for the SOLAR
design team: what to fix or decide in Figma. It lists only what is next. Add an open finding or a
governance gap in its existing style, with the Figma node link; delete an item once Figma has fixed
it (the next sync closes the finding); keep no "done" section and no change history.

## Sync from Figma

The owner runs this; it is never automated and never in CI.

```bash
npm run solar:sync            # fetch all three files, rebuild every doc, token file and code
npm run solar:sync -- --fresh # ignore the version cache and re-fetch every page
```

It runs every step even after one fails, and lists the failures at the end. Then:

1. **Unresolved variable IDs.** When the SOLAR Web fetcher names a binding
   `{unresolved:…}`, run `node docs/solar-web/raw/unresolved-ids.mjs`, run the script it prints in
   the SOLAR Web file through the Figma MCP `use_figma` tool, save its `resolved` object as JSON,
   merge it with `node docs/solar-web/raw/unresolved-ids.mjs --add <file>`, and rebuild from the
   cache (`node docs/solar-web/raw/fetch-rest.mjs && node docs/solar-web/build-docs.mjs`).
2. **Variables changed in Figma.** The token capture is not part of the sync. Re-capture it as
   [docs/solar/tokens/README.md](../solar/tokens/README.md#regenerating) says, then
   `npm run solar:tokens`.
3. **Stale overlay rules.** A rule that no longer matches the IR fails the build, naming the
   file and the rule. Delete it if Figma fixed what it decided; re-decide it if Figma changed.
4. **New findings.** `npm run solar:triage` and `solar:explain` show them; decide each or leave it
   open for the design review.
5. **Tests that pin the corpus** (`packages/codegen/test/recipe.test.mjs`,
   `components.test.mjs`, the triage test) name which sets build; update them deliberately when
   the set changes.
6. **Chapters behind Figma.** [docs/solar/review-status.md](../solar/review-status.md) lists
   curated chapters whose source pages changed. Reconcile the chapter with the page under
   `docs/solar/figma-pages/` (the variables still win), then
   `node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>`. Never edit the hashes.
7. **Personal data.** Review the diff by hand for names, then
   `node scripts/check-personal-data.mjs`. Prefer redacting in the extractor; accept a finding
   only with a reason (`--accept`, then write it in `scripts/personal-data-baseline.json`).
   Credentials are never accepted.
8. Verify, as above.

## Deploy

The Storybook is deployed by Vercel's Git integration, with no workflow in this repository. The
project builds every push from the root directory `packages/storybook` with the Vite preset's
defaults: `npm install` at the repository root, `turbo run build` in `packages/storybook`, and
`dist` published. On this branch that directory is [`@bwp-web/storybook`](../../packages/storybook/README.md),
a package whose `build` writes the components' Storybook into its `dist/`; the V1 branches keep
their own package in the same place, so the one set of settings serves both.

- `main` is production (V1's Storybook). A push to `v2-SOLAR` deploys V2's at the branch's URL,
  `workplace-storybook-git-v2-solar-biamp.vercel.app`.
- To see what Vercel will publish: `cd packages/storybook && ../../node_modules/.bin/turbo run build`,
  then open `packages/storybook/dist/index.html` through any static server.
- The project skips a deployment when nothing its root directory depends on changed, so
  `@bwp-web/storybook` lists every workspace package the Storybook build reads
  (`test/storybook-deploy.test.mjs` keeps it so). A new one the Storybook comes to read is added
  there too.
- An approval alone (a change to `spec/approvals.yaml` only) may deploy nothing, since the
  project skips a deployment when nothing its root directory depends on changed and the Turbo
  cache does not key on the record: the deployed circles are as of the last deployment.
- Widgetbook is not deployed: Vercel's build image has no Flutter. CI builds it as an artifact.

## Upgrade a dependency

Every dependency is kept at its newest stable version; an SDK is replaced in place. Where a
dependency cannot move (an upstream peer range), say which upstream blocks it. After an upgrade,
run the whole verification, including both visual checks and both viewers' builds.

An upgrade of any package outside this repository that a platform's components run on (on the web
React, MUI, Emotion, MUI X Charts and the `@fontsource` fonts; in Flutter the SDK, `fl_chart` and
`intl`) clears that platform's approvals in `spec/approvals.yaml` in the same change: behaviour can
change without any fingerprint moving. A person makes that edit, never an agent
([Approve a component](#approve-a-component)).

## Pitfalls

Each of these is easy to get wrong; the code usually says so in a comment. Read the list before a
change in the same area.

**Environment**

- `solar:codegen` runs `dart format` on the generated Dart and exits non-zero without the Dart
  SDK on `PATH`; the rebuild check then reports hundreds of changed lines.
- An npm other than the one Node 22 ships (npm 11 in some editor terminals) rewrites
  `package-lock.json`. Put Node 22 first on `PATH`.
- The visual checks and the Flutter tests share a server and build directories: run them once,
  never from parallel agents. Parallel agents adding descriptors also read each other's
  half-written files; build members of one family one at a time where they share files.
- A check that passes locally can fail on a clean CI runner, where nothing is built and nothing
  git-ignored exists:
  - The unit tests, the web visual check and Storybook read the workspace packages from their
    sources through one table, `packages/codegen/src/util/workspace-sources.mjs`. A new
    `@bwp-web/*` entry a component imports must be added there, or it resolves to `dist/`,
    which only a local build leaves behind (`test/workspace-sources.test.mjs` fails on one
    missing).
  - A directory the Widgetbook pubspec declares must exist in git: `flutter analyze` fails on a
    declared asset directory that is missing, and CI analyses before it copies the oracles in.
    `assets/verify/` is kept by its `.gitkeep` (`test/widgetbook-assets.test.mjs`).

  To reproduce CI locally, move the `dist/` folders (or the copied oracles) aside and run the
  check.

**The workbench** ([Fix a component in the viewer](#fix-a-component-in-the-viewer))

- A pending edit (a saved edit whose checks failed) stays in `spec/overlay/` with its reason, so
  the component's checks, and the Verify block's, fail on it, and `/solar-feedback` stops on it,
  until a person presses Undo, Keep again or Send to agent. The edit survives a restart: start a
  viewer and press one. Where the service cannot start again, put the overlay file back from the
  `before` field of `.workbench/pending.json`, then delete that file.
- `SOLAR_VISUAL_ONLY` left set in a shell narrows `npm run test:visual` to one component (it says
  so in a warning). Unset it before the Verify block.
- The workbench's checks run the visual checks and the Flutter tests: do not run either yourself
  while they do, since they share a server and build directories.

**Reading Figma data** (`packages/codegen/src/normalize/`)

- Read the resolved layer tree and each layer's overrides, never a variant's flat `fills` or
  `textFills` digests: they aggregate every layer and change with a child's visibility.
- Get a layer's path by walking the tree, never by splitting a string: Figma's layer names
  contain `/` (`Icon/None`).
- A reader change must accept both the old and the new raw shape, because the owner's
  `solar:sync` runs codegen straight after the fetch, before any follow-up change can land.
- Where one property has two bindings, the one naming the value Figma draws wins.
- Sort anything that reaches a generated file with `byCodeUnit`, never `localeCompare`.
- A Dart keyword or an illegal identifier (`default`, `2xs`) is escaped with `$`, keeping
  SOLAR's spelling in the recipe keys.

**Emitters and shells**

- A React shell forwards every destructured prop, so an unset one arrives as `undefined`; the
  generated resolver ignores `undefined` rather than spreading it over the defaults.
- In an MUI reset, undo a minimum width with `minWidth: 'auto'`, not `'0'`: `sx` reads a number
  ≤ 1 as a fraction.
- MUI's Button is pinned to `variant="text"`, not `disableElevation`, which writes
  `box-shadow: none` on hover and press over the recipe's shadow.
- MUI marks a loading button disabled, so Button's disabled selector is
  `&.Mui-disabled:not(.MuiButton-loading)`.
- In Flutter, name a control with `MergeSemantics`, not `Semantics(label:)` alone, which adds a
  second node and leaves the control unnamed.
- The web visual check serves its bundle through `page.route('http://solar.test/**')`, because
  Chromium refuses module scripts over `file://`.
- `underPrettier` in bin/solar-codegen.mjs must not list `svg`: Prettier has no SVG parser and
  throws.

**Tests that pin the corpus**

- `packages/codegen/test/recipe.test.mjs`, `components.test.mjs` and `triage.test.mjs` name which
  SOLAR Web sets derive and build. A change that moves that set updates them deliberately, in the
  same change.
- A parity suite is proved by mutation: change one committed artifact, run the suite, restore;
  it must fail naming the asset. Do this when adding a suite or changing what one reads.
