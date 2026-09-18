import { readFileSync } from 'node:fs';
import {
  ThemeProvider,
  type Theme,
  type ThemeOptions,
} from '@mui/material/styles';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import * as generated from '../src/index.js';

interface ComponentModel {
  name: string;
  exportName: string;
  themeKey: string;
  rootElement: string;
  stateProps: { prop: string; attribute: string }[];
  slots: Record<string, { className: string }>;
  childrenSlot: string | null;
}

interface Model {
  prefix: string;
  themeOptions: {
    components: Record<
      string,
      { styleOverrides: { root: Record<string, string> } }
    >;
  };
  components: Record<string, ComponentModel>;
}

const model = JSON.parse(
  readFileSync(
    new URL('../src/generated/theme.model.json', import.meta.url),
    'utf8',
  ),
) as Model;
const pascal = (s: string): string => s[0].toUpperCase() + s.slice(1);
const exportsByName = generated as unknown as Record<string, unknown>;
const createDsTheme = exportsByName[`create${pascal(model.prefix)}Theme`] as (
  options?: ThemeOptions,
) => Theme;
const kebab = (camel: string): string =>
  camel.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

function render(c: ComponentModel, props: Record<string, unknown>): string {
  const Component = exportsByName[c.exportName] as React.ComponentType<
    Record<string, unknown>
  >;
  return renderToStaticMarkup(
    <ThemeProvider theme={createDsTheme()}>
      <Component {...props}>content</Component>
    </ThemeProvider>,
  );
}

describe('generated components', () => {
  const components = Object.values(model.components);

  it('exports one React component per mapped design-system component', () => {
    expect(components.length).toBeGreaterThan(0);
    for (const c of components) {
      expect(typeof exportsByName[c.exportName], c.exportName).toBe('object'); // forwardRef exotic component
    }
  });

  for (const c of components) {
    describe(c.name, () => {
      it('renders the root element, the root class, every slot, and the children', () => {
        const slotProps = Object.fromEntries(
          Object.keys(c.slots)
            .filter((s) => s !== c.childrenSlot)
            .map((s) => [s, `slot-${s}`]),
        );
        const html = render(c, slotProps);
        expect(html).toContain(`<${c.rootElement} `);
        expect(html).toContain(`${c.themeKey}-root`);
        expect(html).toContain('content');
        for (const [slot, { className }] of Object.entries(c.slots)) {
          expect(html).toContain(className);
          if (slot !== c.childrenSlot) {
            expect(html).toContain(`slot-${slot}`);
          }
        }
      });

      it('applies the theme styles through Emotion', () => {
        const html = render(c, {});
        const root =
          model.themeOptions.components[c.themeKey].styleOverrides.root;
        const [property, value] = Object.entries(root)[0] ?? [];
        if (property) {
          expect(html).toContain(`${kebab(property)}:${value}`);
        }
        expect(html).toContain('<style');
      });

      it('renders state props as attributes', () => {
        for (const { prop, attribute } of c.stateProps) {
          const html = render(c, { [prop]: true });
          expect(html).toContain(
            attribute === 'disabled' ? 'disabled=""' : `${attribute}="true"`,
          );
        }
      });

      it('forwards a className and DOM props to the root', () => {
        const html = render(c, { className: 'extra', 'data-testid': 'x' });
        expect(html).toContain(`${c.themeKey}-root extra`);
        expect(html).toContain('data-testid="x"');
      });
    });
  }
});
