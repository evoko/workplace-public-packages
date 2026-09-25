# Working in workplace-public-packages (V2 / SOLAR)

This branch (`v2-SOLAR`) holds the V2 generation of the `@bwp-web/*` packages, built on Biamp's
**SOLAR** design system. V1 lives on the `v1` branch and shares nothing with V2 except package
names.

The repository turns three SOLAR Figma files into a React library on MUI
(`@bwp-web/components`) and a Flutter library (`solar_flutter`), with tokens (`@bwp-web/styles`)
and icons (`@bwp-web/assets`). A generator (`packages/codegen`) reads a committed mirror of Figma
(`docs/`) and writes contracts (`spec/`) and code; hand-written shells give each component its
behaviour; visual checks prove each platform draws what Figma draws. Every component in SOLAR Web's components section is built, except Cursor, left out by decision. SOLAR names `CLAUDE.md` as its agent instruction layer: treat every
rule here as hard.

## Read first

| For                                                                    | Read                                                                                                                                 |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| How the system works, its invariants, the two-libraries contract       | [docs/engineering/architecture.md](docs/engineering/architecture.md)                                                                 |
| How to do a task: setup, verify, add a component, fix a check, sync    | [docs/engineering/workflows.md](docs/engineering/workflows.md), including its **Pitfalls**                                           |
| Why something is the way it is                                         | [docs/engineering/decisions.md](docs/engineering/decisions.md)                                                                       |
| What is unfinished                                                     | [docs/engineering/open-work.md](docs/engineering/open-work.md)                                                                       |
| Every pipeline input and output                                        | [docs/README.md](docs/README.md)                                                                                                     |
| SOLAR's rules for UI: tokens, grammar, banned names, scales, checklist | [docs/solar/18-agent-reference.md](docs/solar/18-agent-reference.md), then the chapters in [docs/solar/](docs/solar/README.md)       |
| The generator, and every recipe feature                                | [packages/codegen/README.md](packages/codegen/README.md)                                                                             |
| Every overlay rule kind, with an example                               | [spec/overlay/README.md](spec/overlay/README.md)                                                                                     |
| A component's API                                                      | [packages/components/README.md](packages/components/README.md), [packages/solar_flutter/README.md](packages/solar_flutter/README.md) |

## Working with the owner

- **The owner handles all version control. Run no git write command**: no `add`, `commit`,
  `stash`, `checkout`, `reset`, and no worktrees. Finishing a task means stopping and reporting.
- Stop for the owner's review after each batch of related work, before continuing.
- Ask when the answer changes what gets built; batch questions at the end of a task.
- Use Node 22 (`.nvmrc`; `export PATH=$HOME/.nvm/versions/node/v22.23.2/bin:$PATH`). The codegen
  CLIs refuse an older Node; the other scripts do not check, so check `node -v` first.

## Hard rules: the pipeline

- **Never write to `docs/` from the generator, and never edit `docs/` to make code look right.**
  It mirrors Figma, defects included; only `npm run solar:sync` and `npm run solar:tokens` write
  there. A write guard enforces it and CI re-checks it.
- **Never edit a generated file to keep a change.** Fix its source and regenerate:
  - a rule for every component: the normalizer, `packages/codegen/src/normalize/`, or
    `spec/overlay/defaults.yaml`;
  - one target: its emitter, `packages/codegen/src/emit/`;
  - one component on one platform: its descriptor's tables, `packages/codegen/src/components/<name>.mjs`;
  - one component's design decision: its overlay, `spec/overlay/<name>.yaml`;
  - behaviour: the hand-written shell, `packages/components/src/<Name>.tsx` or
    `packages/solar_flutter/lib/src/components/solar_<name>.dart`, or a runtime helper.
- **Every overlay rule needs a `reason`** a reviewer can check. A rule that no longer matches the IR
  fails the build; `solar:explain --propose` prints a rule with `TODO(reason)`, which the build
  refuses until a person writes one.
- **Never loosen a visual check or edit an oracle (`spec/verify/`) to make a check pass.** A
  difference is fixed in the code, or excused by an open finding or an overlay decision.
- **A shell holds no design value.** Its look is the generated recipe; its layer tree and slots are
  imported, never copied.
- **Builders are pure functions of what is committed.** Never write a build timestamp or anything
  machine-dependent into a generated file; `npm run solar:rebuild` twice must leave the tree
  unchanged.
- After touching `packages/codegen` or `spec/overlay`, run `npm run solar:codegen` and keep what
  it writes. CI regenerates everything and fails on any difference.
- When a check fails, start with `npm run solar:explain -- "<Name>" --variant …`.

## Hard rules: the design system

- **Every value traces to a SOLAR token**: colour, spacing, radius, border, shadow, duration,
  easing, z-index, text style. No hex, px, rem, ms or `box-shadow` literals in components.
- **Semantic tokens only**; primitives never appear in component code. Light/Dark and
  Desktop/Mobile are token reassignment, never component logic.
- **The variables win.** [docs/solar/tokens/figma-variables.json](docs/solar/tokens/figma-variables.json)
  is the token source of truth, over Figma's prose, page-context blocks and SOLAR Web. Known
  conflicts: [docs/solar/source-discrepancies.md](docs/solar/source-discrepancies.md).
- **Separators**: docs use dots (`color.text.primary`), Figma slashes, CSS `--solar-` plus hyphens
  (`--solar-color-text-primary`). Never mix them in one context.
- **A token you need does not exist?** Flag it as a governance gap (⚠️) and stop. Never invent a
  name.
- **WCAG 2.1 AA is the floor**: 4.5:1 text, 3:1 non-text, 44 × 44 targets (`size.target.min`),
  visible `:focus-visible` rings, `prefers-reduced-motion` honoured.
- **An icon never carries a colour, and must never be given one.** It inherits (`currentColor` on
  the web, the widget's colour in Flutter); tint it where it is used with a `color.icon.*` token,
  never a `fill`. Size it from the `icon.xs`…`icon.2xl` ladder, never a px literal.
- **A logo always carries its own colours and is never tintable.** `LogoBiamp`, `LogoOs` and
  `SolarLogo` take no `color` or `fill`, and their types refuse one.
- The curated chapters in `docs/solar/` carry the hashes of their Figma source pages;
  [review-status.md](docs/solar/review-status.md) says which are behind. Reconcile a chapter with
  its page under `docs/solar/figma-pages/`, then
  `node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>`. Never edit the hashes by hand.
- The token captures (`capture-variables.js`) are deliberate Plugin API runs, never part of
  `solar:sync`.

## Naming

- Where SOLAR's description names a thing, the code keeps SOLAR's word (`helper`, `mandatory`, a
  Button's `prio`); otherwise it takes MUI's word on the web and Flutter's in Flutter (a Flutter
  field's `enabled`, a button's null `onPressed`). The exception: Figma's `style` is `variant`,
  since React reserves `style`.
- A platform reaches an IR prop or slot by another name only through the descriptor's `api`
  table; the parity test checks reachability, not identical spelling.
- On the web, a slot's layer carries the public class `Solar<Name>-<slot>`; every other layer the
  internal `Solar<Name>--<layer>` (`packages/codegen/src/util/classes.mjs`).

## Before saying a task is done

Run the whole block in [workflows.md, Verify](docs/engineering/workflows.md#verify-before-saying-a-task-is-done)
for any change to code, an overlay, a descriptor, a shell, a runtime helper or a generated file; a
change to Markdown alone needs only its Prettier and link checks. Report the output honestly: a
failure is reported with its output, a skipped check is named as skipped.

## Keeping the docs true

The docs describe the system as it is. When a change alters behaviour, a command, a decision or a
gap, update the page that says so in the same change: the package README, the codegen README,
[decisions.md](docs/engineering/decisions.md) (a new or changed decision, with its date and
reason), or [open-work.md](docs/engineering/open-work.md) (remove what is done). Generated docs
are fixed in their builder, never by hand.

Plans and specs for new work go in `docs/superpowers/` (`plans/`, `specs/`) while the work is in
progress. When it lands, fold what lasts into the pages above and delete the plan: no page
describes history, and nothing stale is left for the next reader to follow.

## Repository conventions

- Monorepo: npm workspaces and Turbo. `npm run build`, `lint`, `typecheck`, `format` from the
  root. Each package builds ESM and CJS with tsup and emits types with tsc.
- Packages at `2.0.0-alpha.0`: `@bwp-web/styles` (tokens and themes, generated),
  `@bwp-web/assets` (icons, logos, app icons, generated), `@bwp-web/components` (the React
  components, on MUI 9; the charts on `@mui/x-charts`), `@bwp-web/canvas` (an empty skeleton).
  Private: `@bwp-web/codegen` (the generator), `@bwp-web/eslint-config`. Outside the npm
  workspace: `solar_flutter`, a Dart package formatted by `dart format`, pinned to the Flutter
  version in `.github/workflows/solar.yml`.
- Node 22 builds the repository, pinned in `.nvmrc` and every workflow; the packages' `engines`
  says `>=20`, which is what consumers need.
