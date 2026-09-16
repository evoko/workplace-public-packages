# Strip monorepo for new design system

**Date:** 2026-09-16
**Branch:** `v2-css`
**Status:** Approved, pending implementation

## Context

The Biamp Workplace design system is being replaced wholesale. Every component,
token, and icon in this monorepo was built against the outgoing system and is
obsolete. This spec covers emptying the repo so the new system starts from a
clean, still-buildable monorepo.

### Safety

`v2-css` is identical to local `main`, which is identical to `origin/main`, and
the working tree is clean. Every file deleted here stays recoverable from
`origin/main`. No force-push, no history rewrite, no `.git` deletion.

## Goals

1. Remove all design-system source from the four published packages and the
   Storybook stories.
2. Remove the outgoing system's dependencies (MUI, Emotion, and the libraries
   that only existed to serve deleted components).
3. Leave a monorepo that still installs, typechecks, builds, and boots Storybook
   with nothing in it.

## Non-goals

- Version changes. Published versions stay as-is (`assets` 1.0.10, `canvas`
  1.1.3, `components` 1.10.2, `styles` 1.0.17). Versioning is decided when there
  is something to publish.
- Designing the replacement system. That is a separate spec.
- Touching `origin`. This work is local to `v2-css`.

## Scope: deletions

| Path | What goes |
| --- | --- |
| `packages/styles/src/` | `theme.tsx` (70KB MUI theme), `augmentations.ts`, `custom-components/` |
| `packages/styles/mui-theme-augmentation.d.ts` | File plus its `exports` entry in `package.json` |
| `packages/components/src/` | All 15 component dirs, `hooks/`, `slotProps.ts`, `global.d.ts` |
| `packages/canvas/src/` | Everything: `viewport.ts`, `serialization.ts`, `background.ts`, `keyboard.ts`, `history.ts`, `constants.ts`, `types.ts`, `styles.ts`, `fabricAugmentation.ts`, `interactions/`, `alignment/`, `shapes/`, `overlay/`, `Canvas/`, `context/`, `hooks/` |
| `packages/assets/src/` | Everything: `icons/` (218 files), `fonts/`, `logos/`, `images/`, `assets.d.ts` |
| `packages/storybook/src/stories/` | All 35 story files and the `canvas/` helper dir |
| `packages/storybook/debug-storybook.log` | Stray log file |
| `docs/` | 12 component `.md` files and `docs/canvas/`. `docs/superpowers/` is created by this work and is not affected. |

Each stripped package retains `src/index.ts` containing `export {};` so `tsup`
and `tsc` keep a valid entry point.

## Scope: retained

**Root:** `package.json` (workspaces, turbo scripts), `turbo.json`,
`tsconfig.json`, `.prettierrc.json`, `.github/`, `.gitignore`, `README.md`.

**`packages/eslint-config/`:** untouched. It has no design-system coupling.

**Per stripped package:** `package.json`, `tsup.config.ts`, `tsconfig.json`,
`tsconfig.build.json`, `eslint.config.js`, `README.md`.

**Storybook:** `.storybook/` (`main.ts`, `manager.ts`, `manager-head.html`,
`preview.tsx`), `vitest.config.ts`, `vitest.shims.d.ts`, `public/` favicons,
`src/global.d.ts`.

`preview.tsx` currently imports the MUI theme and must be rewritten to a minimal
decorator-free preview, otherwise Storybook will not boot after the strip.

## Scope: dependencies

Removed from `peerDependencies` and `devDependencies` wherever they appear:

- `@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`
- `@emotion/react`, `@emotion/styled`
- `fabric` (canvas only)
- `@tanstack/react-table` (components, storybook)
- `randomcolor`, `@types/randomcolor` (components)
- `dayjs`, `luxon`, `@types/luxon` (storybook)

Retained: `react`, `react-dom`, `@types/react`, `@types/react-dom`,
`typescript`, `tsup`, `eslint`, `prettier`, the Storybook 10 toolchain, the
Vitest/Playwright toolchain, and the `@bwp-web/*` workspace cross-links
(`components` -> `assets` + `styles`, `canvas` -> `styles`, storybook -> all
four). The cross-links are kept because the new system is expected to preserve
that package topology.

Each `tsup.config.ts` has an `external: [...]` array naming removed packages.
Those entries are cleaned up in the same pass.

`package-lock.json` is regenerated via `npm install` after the edits.

## Verification

Run in order; all must pass before the work is called done:

1. `npm install` — lockfile regenerates without resolution errors
2. `npm run typecheck` — clean across all packages
3. `npm run build` — all four publishable packages emit `dist/`
4. `npm run storybook` — dev server boots with an empty story list

A grep for `@mui`, `@emotion`, `fabric`, `@tanstack`, `randomcolor`, `luxon`,
and `dayjs` across `packages/*/src` and `packages/*/package.json` must return
nothing.

## Follow-up

The stored project memory "MUI to SCSS Migration" is factually wrong — it claims
the migration completed with zero MUI imports remaining, which does not match
this branch. It is deleted as part of this work, along with the canvas
architecture memory, since both describe code this spec removes.
