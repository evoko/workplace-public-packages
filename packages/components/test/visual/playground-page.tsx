/**
 * The page the Playground interaction check drives (playground.spec.mjs): one Playground builder,
 * named by the URL's hash (`#text-input`), with no viewer around it, through the same core the
 * Storybook adapter uses (stories/playground/core.tsx), its values in React state, so the component
 * is live and two-way as in Storybook. It sits in the adapter's column and width box, at the width
 * the hash names (`#progress-bar?width=320`), `auto` where it names none; any other name in the
 * hash's query starts that control at its value (`#divider?orientation=vertical`). Every `set` call is
 * recorded on `window.__sets` as `[name, value]`, in order, and every `log` on `window.__logs` as
 * `[event, detail]` (null where it has none), for the check to read.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { SolarProvider } from '../../src/SolarProvider.js';
import {
  BuilderHost,
  WidthBox,
  columnStyle,
  controlsOf,
  defaultsOf,
  makePlayground,
} from '../../stories/playground/core.js';
import { PLAYGROUND_BUILDERS } from '../../stories/playground/registry.generated.js';
import type {
  ControlValue,
  PlaygroundBuilder,
  PlaygroundData,
} from '../../stories/playground/types.js';

/**
 * What Storybook's virtual:solar serves as PLAYGROUND, from the codegen: build.mjs defines it when
 * it bundles this page, since the codegen reads spec/ from disk, which a browser cannot.
 */
declare const __PLAYGROUND__: PlaygroundData;

declare global {
  interface Window {
    __sets: Array<[string, ControlValue]>;
    __logs: Array<[string, unknown]>;
  }
}
window.__sets = [];
window.__logs = [];

/** A component's name as the check finds it (`Text Input` → `text-input`), as cases/index.ts spells it. */
const slug = (component: string) =>
  component.toLowerCase().replace(/[^a-z0-9]+/g, '-');

function Live({
  component,
  builder,
  seed,
}: {
  component: string;
  builder: PlaygroundBuilder;
  seed: Record<string, string>;
}) {
  const controls = controlsOf(__PLAYGROUND__, component);
  const [values, setValues] = useState<Record<string, ControlValue>>(() => ({
    ...defaultsOf(controls),
    ...seed,
  }));
  const p = makePlayground({
    data: __PLAYGROUND__,
    controls,
    values,
    set: (name, value) => {
      window.__sets.push([name, value]);
      setValues((v) => ({ ...v, [name]: value }));
    },
    log: (event, detail) => window.__logs.push([event, detail ?? null]),
  });
  return (
    <div data-playground={slug(component)} style={columnStyle}>
      <WidthBox width={values.width}>
        <BuilderHost builder={builder} p={p} />
      </WidthBox>
    </div>
  );
}

const [hashSlug = '', hashQuery = ''] = location.hash.slice(1).split('?');
const wanted = decodeURIComponent(hashSlug);
// The controls the hash starts (`width`, and any other by its name).
const seed = Object.fromEntries(new URLSearchParams(hashQuery));
const found = Object.entries(PLAYGROUND_BUILDERS).find(
  ([component]) => slug(component) === wanted,
);

createRoot(document.getElementById('root')!).render(
  <SolarProvider>
    <main>
      {found ? (
        <Live component={found[0]} builder={found[1]} seed={seed} />
      ) : (
        <p data-missing={wanted}>No Playground builder for “{wanted}”.</p>
      )}
    </main>
  </SolarProvider>,
);
