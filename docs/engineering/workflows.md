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
`~/.config/figma/token` or `$FIGMA_TOKEN`; nothing but a sync needs it.

A different Flutter version reformats the generated Dart, and CI fails on the difference. To
upgrade Flutter: install the new version, run `npm run solar:rebuild` and `dart format` on the
package, and raise `FLUTTER_VERSION` in `.github/workflows/solar.yml` in the same change.

## Everyday commands

From the repository root:

| Command                                  | Does                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `npm run solar:rebuild`                  | rebuild every generated doc, token file and code target; no network      |
| `npm run solar:codegen`                  | only the code: `spec/` and every generated target                        |
| `npx vitest run`                         | the unit and parity suites (codegen, from the root or the package)       |
| `npm run test:visual`                    | the web visual check; reports in `packages/components/test/visual/.out/` |
| `npm run storybook`                      | the React viewer, http://localhost:6006                                  |
| `npm run widgetbook`                     | the Flutter viewer, in Chrome                                            |
| `npm run solar:explain -- "<Name>"`      | why a component draws what it draws (see below)                          |
| `npm run solar:triage`                   | every SOLAR Web component's IR, findings and needs, for planning         |
| `npm run solar:overlay:audit`            | decisions the overlays make more than once                               |
| `npm run build && npm run smoke:install` | pack the packages and install them into a clean React 18 app             |

In `packages/solar_flutter`: `flutter test` (the widget tests and the Flutter visual check,
reports in `build/visual/`), `flutter analyze`, `dart format lib test variants/lib widgetbook/lib`.

## Verify before saying a task is done

Everything CI runs, locally. **Any change to code, an overlay, a descriptor, a shell, a runtime
helper or a generated file runs all of it**, and all of it must pass; the rebuild must leave the
tree unchanged but for your own change. A change to Markdown alone runs the last two lines (the
Prettier check CI runs, and the link check of your pages).

```bash
npx vitest run
npm run lint && npm run typecheck && npm run format
npm run solar:rebuild && npm run solar:rebuild && git status --porcelain   # only your own changes
npm run test:visual
(cd packages/solar_flutter && flutter analyze && (cd variants && flutter analyze) && (cd widgetbook && flutter analyze) \
  && dart format --output=none --set-exit-if-changed lib test variants/lib widgetbook/lib && flutter test)
npm run build-storybook -w @bwp-web/components && npm run widgetbook -- build
npm run build && npm run smoke:install
node scripts/check-personal-data.mjs
npx prettier --check "docs/**/*.md" "docs/**/*.mjs" "docs/**/*.js" "docs/**/*.json" "scripts/**/*.mjs" \
  "scripts/**/*.json" "spec/overlay/**/*.yaml" "packages/solar_flutter/**/*.md" README.md CLAUDE.md package.json
```

Generated output of every component a change does not name must be byte-identical before and
after. `git status --porcelain -- spec packages/styles/src/generated packages/assets/src/generated
packages/solar_flutter/lib/src/generated packages/components/stories` after `solar:codegen` must
list only the files of the components the change names (reading `git status` is not a git
write). The visual checks and the Flutter tests share a server and build directories, so run them
once, not from parallel agents.

## Decide where a change goes

| The problem                                                | The change                                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| A value is wrong in every target                           | the normalizer, `packages/codegen/src/normalize/`                                                                                       |
| A value is wrong in one target                             | that emitter, `packages/codegen/src/emit/`                                                                                              |
| One component looks wrong on one platform                  | its descriptor's tables, `packages/codegen/src/components/<name>.mjs`                                                                   |
| One component looks wrong, and Figma is right for it alone | its overlay, `spec/overlay/<name>.yaml`                                                                                                 |
| A rule holds for every component                           | `spec/overlay/defaults.yaml`                                                                                                            |
| A component behaves wrong                                  | its shell, `packages/components/src/<Name>.tsx` or `solar_flutter/lib/src/components/solar_<name>.dart`, or the runtime helper it calls |
| Figma itself is wrong                                      | leave the finding open, or add a rule to `normalize/deviations.mjs`; the design review asks the designers                               |
| A token you need does not exist                            | stop and flag a governance gap (⚠️); never invent a name                                                                                |

Never edit `docs/`, a generated file, or an oracle to make something pass. After any change to
`packages/codegen` or `spec/overlay`, run `npm run solar:codegen` and keep what it writes.

## Fix a failing visual check

1. Read the failure: the web writes `packages/components/test/visual/.out/<name>-failures.json`
   (and `-dark-failures.json`), Flutter `packages/solar_flutter/build/visual/`.
2. `npm run solar:explain -- "<Name>"` lists the variants, every excused difference and the last
   runs' failures.
3. Narrow it to one cell:
   `npm run solar:explain -- "<Name>" --variant <v> --layer <layer> --property <cell>`, where
   `<v>` is a variant's number, Figma's name for it, or `axis=value` pairs. It shows the chain for
   that cell: Figma's value, the recipe entry that wins and where it sits, its token and value,
   where it was read from and why, the rules on it, the excuse, and what each platform drew.
   `--full` shows every row. Layer names are the IR's (`layers` in
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
writes a real reason. Choose by what the finding is:

| Finding                                  | Rule                                                                 |
| ---------------------------------------- | -------------------------------------------------------------------- |
| A real interaction between axes          | `follows`                                                            |
| A Figma slip the code does not copy      | leave open (the design review lists it), or `accept` with the reason |
| A raw value equal to a token's           | `bind` (a token of another value fails: a bind never redesigns)      |
| A raw value no token has                 | `allowLiteral`, a governance gap; the reason names it                |
| An entry that should differ from Figma's | `set` (a token, `none`, a keyword, or an allowed literal)            |

Every rule kind is in [spec/overlay/README.md](../../spec/overlay/README.md).

## Add a component

Every file is named from the component's name in code, Figma's name or its overlay's `codeName`:
lower-cased with every run of other characters as `-` (the slug) or `_` (the snake), or
PascalCase. For **Split Button**, named `SplitButton` in Figma, and **Button Group**:

| File                                                                   | SplitButton              | Button Group              |
| ---------------------------------------------------------------------- | ------------------------ | ------------------------- |
| descriptor, `packages/codegen/src/components/`                         | `splitbutton.mjs`        | `button-group.mjs`        |
| overlay, `spec/overlay/`                                               | `splitbutton.yaml`       | `button-group.yaml`       |
| React shell, `packages/components/src/`                                | `SplitButton.tsx`        | `ButtonGroup.tsx`         |
| Flutter shell, `packages/solar_flutter/lib/src/components/`            | `solar_splitbutton.dart` | `solar_button_group.dart` |
| web case, `packages/components/test/visual/cases/`                     | `splitbutton.tsx`        | `button-group.tsx`        |
| Flutter builder and case, `variants/lib/src/` and `test/visual/cases/` | `splitbutton.dart`       | `button_group.dart`       |

`npm run solar:codegen` writes the registries that import these files, so the typecheck and
`flutter analyze` name any that are missing or misnamed. Where Figma's name is two components'
(`Day Cell`), the overlay's `codeName` decides (`Calendar Day Cell`, `Date Picker Day Cell`).

The full procedure, with every table a descriptor may hold, is in the codegen README's
[Changing it](../../packages/codegen/README.md#changing-it), "A new component". In short:

1. `npm run solar:triage` shows whether it builds, its API, slots, composition and findings.
   A component it composes must exist first.
2. Write its descriptor, `packages/codegen/src/components/<name>.mjs` (`name`, the MUI tables,
   the Flutter tables, an `api` table where a platform reaches a prop by another name). Nothing
   else lists components by hand.
3. Write its overlay, `spec/overlay/<name>.yaml`, deciding every finding.
4. `npm run solar:codegen` writes its recipes, tree, slots, story and every registry, and fails
   until both shells exist.
5. Write both shells by hand, starting from the nearest component's (a drawn one from Counter's,
   a field from Text Input's, a card from Card's). `npx vitest run test/component-parity.test.mjs`
   (in `packages/codegen`) names what of the IR a shell does not reach yet.
6. Write its visual cases: `packages/components/test/visual/cases/<slug>.tsx`, a builder in
   `packages/solar_flutter/variants/lib/src/` and a case in `packages/solar_flutter/test/visual/cases/`.
   Until they exist the typecheck and `flutter analyze` fail on the registries naming them.
7. Unit tests for its IR and recipes (`packages/codegen/test/`) and its shells (the Flutter
   `test/solar_<name>_test.dart`).
8. Its entry in `packages/components/README.md` and `packages/solar_flutter/README.md`, its open
   findings and governance gaps in the design review (below), and any decision in
   [decisions.md](decisions.md).
9. Verify, as above.

Both viewers then show it with no more work.

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
- Widgetbook is not deployed: Vercel's build image has no Flutter. CI builds it as an artifact.

## Upgrade a dependency

Every dependency is kept at its newest stable version; an SDK is replaced in place. Where a
dependency cannot move (an upstream peer range), say which upstream blocks it. After an upgrade,
run the whole verification, including both visual checks and both viewers' builds.

## Pitfalls

Each of these has broken something before. The code usually says so in a comment; this is the
list to read before a change in the same area.

**Environment**

- `solar:codegen` runs `dart format` on the generated Dart and exits non-zero without the Dart
  SDK on `PATH`; the rebuild check then reports hundreds of changed lines.
- An npm other than the one Node 22 ships (npm 11 in some editor terminals) rewrites
  `package-lock.json`. Put Node 22 first on `PATH`.
- The visual checks and the Flutter tests share a server and build directories: run them once,
  never from parallel agents. Parallel agents adding descriptors also read each other's
  half-written files; build members of one family one at a time where they share files.
- A check that passes locally can fail on a clean CI runner, where nothing is built and nothing
  git-ignored exists. Two cases have happened:
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
- A codegen Prettier glob that names `.svg` files makes Prettier fail ("No parser could be
  inferred"); the assets glob is `{ts,tsx,json}` on purpose.

**Tests that pin the corpus**

- `packages/codegen/test/recipe.test.mjs`, `components.test.mjs` and `triage.test.mjs` name which
  SOLAR Web sets derive and build. A change that moves that set updates them deliberately, in the
  same change.
- A parity suite is proved by mutation: change one committed artifact, run the suite, restore;
  it must fail naming the asset. Do this when adding a suite or changing what one reads.
