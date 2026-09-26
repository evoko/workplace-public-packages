/**
 * The web Playground builders (stories/playground/), rendered on the server through the same core
 * the Storybook adapter uses (stories/playground/core.tsx), with PLAYGROUND read as Storybook's
 * virtual:solar serves it (.storybook/main.ts): each renders, and each reads every control.
 */

import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as assets from '@bwp-web/assets';
import { playgroundData } from '../../codegen/src/playground/controls.mjs';
import { PLAYGROUND_BUILDERS } from '../stories/playground/registry.generated.ts';
import {
  BuilderHost,
  controlsOf,
  defaultsOf,
  iconElement,
  makePlayground,
} from '../stories/playground/core.tsx';
import { SolarProvider } from '../src/SolarProvider.tsx';

const data = playgroundData();

/** Renders a builder over `values`; returns the HTML and every control it read. */
function render(component, builder, values) {
  const read = new Set();
  const p = makePlayground({
    data,
    controls: controlsOf(data, component),
    values,
    set: () => {},
    log: () => {},
    onRead: (name) => read.add(name),
  });
  const html = renderToString(
    h(
      CacheProvider,
      { value: createCache({ key: 's' }) },
      h(SolarProvider, null, h(BuilderHost, { builder, p })),
    ),
  );
  return { html, read };
}

const TOGGLES = new Set(['boolean', 'child', 'content']);

describe('the Playground builders', () => {
  it('are one for every component with Playground controls, and no other', () => {
    expect(Object.keys(PLAYGROUND_BUILDERS).sort()).toEqual(
      Object.keys(data.components).sort(),
    );
  });

  it.each(Object.entries(PLAYGROUND_BUILDERS))(
    '%s renders at its controls’ defaults',
    (component, builder) => {
      const { html } = render(
        component,
        builder,
        defaultsOf(controlsOf(data, component)),
      );
      expect(html.trim()).not.toBe('');
    },
  );

  it.each(Object.entries(PLAYGROUND_BUILDERS))(
    '%s reads every control but the width',
    (component, builder) => {
      const controls = controlsOf(data, component);
      const defaults = defaultsOf(controls);
      // Every toggle flipped (an overlay's `open` among them), so what a hidden part holds is read.
      const flipped = Object.fromEntries(
        controls.map((c) => [
          c.name,
          TOGGLES.has(c.kind) ? !c.default : c.default,
        ]),
      );
      const read = new Set([
        ...render(component, builder, defaults).read,
        ...render(component, builder, flipped).read,
      ]);
      const unread = controls
        .filter((c) => c.kind !== 'width' && !read.has(c.name))
        .map((c) => c.name);
      expect(unread).toEqual([]);
    },
  );

  it('offers every icon, and each resolves to an @bwp-web/assets export in both styles', () => {
    expect(data.icons).toEqual(Object.keys(data.iconComponents));
    expect(
      data.icons.filter((stem) => !assets[data.iconComponents[stem]]),
    ).toEqual([]);
    for (const stem of data.icons)
      for (const value of [stem, `${stem}${data.values.iconSolid}`])
        expect(renderToString(iconElement(value, data)), value).toMatch(/<svg/);
  });
});
