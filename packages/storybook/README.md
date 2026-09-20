# @bwp-web/storybook

Private. The one Storybook for the repository: a compare grid for every
design-system component and every token category, rendering the CSS,
Tailwind, and MUI targets side by side, plus the harness that proves in a
real browser that the three compute the same styles.

`src/generated/` is written by `bwp-ds generate --target stories`; everything
else in the package is hand-written.

## Layout

| Path                            | What it is                                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/Introduction.mdx`          | The `Introduction` section; reads the design system's name from the generated config.                 |
| `src/generated/`                | `config.ts`, `foundations/<category>.stories.tsx`, `styles/<component>.stories.tsx`. Never hand-edit. |
| `src/harness/`                  | The compare grids, the isolated cells, the comparison, and the play functions.                        |
| `scripts/lint-story-titles.mjs` | Fails on a story title outside the six sections.                                                      |
| `.storybook/`                   | Storybook config, the `dsMode` and `dsTargets` globals, the MUI `ThemeProvider` decorator.            |
| `vitest.config.ts`              | Two projects: `unit` (Node) and `storybook` (Chromium, with the Playwright-backed parity commands).   |

## Scripts

| Script                  | What it does                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run dev`           | The Storybook UI on port 6006. From the repo root: `npm run storybook`.                                   |
| `npm run build`         | A static Storybook in `dist/`.                                                                            |
| `npm run generate`      | `bwp-ds generate --root ../styles-css --target stories`.                                                  |
| `npm test`              | The harness's pure modules under Node.                                                                    |
| `npm run test:rendered` | Every story in headless Chromium. Run it from the repo root as `npm run storybook:test` (see below).      |
| `npm run typecheck`     | `tsc --noEmit` over the harness, the generated stories, and `.storybook`, so a generation bug fails here. |
| `npm run lint`          | The title lint, then ESLint.                                                                              |

Run the browser comparison from the repo root, not here:

```bash
npx playwright install chromium   # once per machine
npm run storybook:test            # turbo run test:rendered --filter=@bwp-web/storybook
```

Running `npm run test:rendered` here instead proves whatever was built last,
not the current sources — see
[`docs/design-system/storybook.md`](../../docs/design-system/storybook.md).

## Writing a compare story by hand

`src/harness/index.ts` is the whole surface a story may import:

| Export                                                                                                                                           | Use                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `CompareGrid`                                                                                                                                    | The component grid. Props: `spec`, `config`, and the `dsTargets` global. |
| `TokenGrid`                                                                                                                                      | The token grid for a foundations story.                                  |
| `parityPlay(context, spec, config, opts)`                                                                                                        | The play function. `opts.ignore` drops properties from the comparison.   |
| `tokenParityPlay(context, tokens, category, config)`                                                                                             | The play function for a token grid.                                      |
| `CompareSpec`, `CompareRow`, `CompareAxis`, `CompareSlot`, `CompareState`, `MuiCellSpec`, `TokenSpec`, `TargetId`, `ModeSwitch`, `StoriesConfig` | The types the specs are written against.                                 |

```tsx
import { CompareGrid, parityPlay, type CompareSpec } from '../harness';
import { storiesConfig } from '../generated/config';

const spec: CompareSpec = {
  /* … */
};

export default { title: 'Styles/Thing' } satisfies Meta;

export const Compare: StoryObj = {
  render: (_args, context) => (
    <CompareGrid
      spec={spec}
      config={storiesConfig}
      targets={context.globals.dsTargets}
    />
  ),
  play: (context) => parityPlay(context, spec, storiesConfig),
};
```

`src/harness/Harness.stories.tsx` is the worked example. Story titles must
start with `Introduction`, `Foundations`, `Styles`, `Components`, `Canvas`,
or `Assets`.

Full documentation: [`docs/design-system/storybook.md`](../../docs/design-system/storybook.md).
