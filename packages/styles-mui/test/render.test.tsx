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
        // A mapped component's root also carries MUI's own utility classes
        // (`MuiButton-filled`, `MuiButton-sizeMd`, …) between the theme root
        // class and the caller's className, so check both are present as
        // distinct class tokens rather than requiring them adjacent.
        const dom = html.replace(/<style[\s\S]*?<\/style>/g, '');
        const classAttr = /class="([^"]*)"/.exec(dom)?.[1] ?? '';
        const classes = classAttr.split(/\s+/);
        expect(classes).toContain(`${c.themeKey}-root`);
        expect(classes).toContain('extra');
        expect(html).toContain('data-testid="x"');
      });
    });
  }

  it('renders Button through MUI with the ripple removed and MUI defaults neutralised', () => {
    const theme = createDsTheme();
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <generated.Button variant="ghost" size="sm" icon={<i>+</i>} disabled>
          Go
        </generated.Button>
      </ThemeProvider>,
    );
    const dom = html.replace(/<style[\s\S]*?<\/style>/g, '');
    expect(dom).toMatch(/<button[^>]*class="[^"]*MuiButton-root[^"]*"/);
    expect(dom).toContain('MuiButton-startIcon');
    expect(dom).toContain('disabled=""');
    // Not asserting the ripple is absent from the DOM here: MuiTouchRipple
    // mounts from an effect, so it never appears in a static (SSR) render
    // regardless of `disableRipple` — that assertion would be vacuous. The
    // parity default that actually disables it (`disableRipple: true`) is
    // asserted directly on the theme in theme.test.ts.
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => m[1])
      .join('\n');
    expect(css).toContain('min-width:revert');
    expect(css).toContain('text-transform:none'); // the design system's base value, restated over MUI's uppercase
    expect(css).toContain('padding-top:var(--bwp-tokens-space-1)'); // size="sm"
    expect(css).toContain('background-color:transparent'); // variant="ghost"
    // Unconditioned states (no React prop toggles them; the browser matches
    // the pseudo-class) are always present in the generated CSS class,
    // regardless of the props passed to this instance.
    expect(css).toContain('box-shadow:var(--bwp-tokens-shadow-focus)'); // :focus-visible
    expect(generated.buttonClasses).toEqual({
      root: 'MuiButton-root',
      icon: 'MuiButton-startIcon',
    });
  });

  it('restates the design system color under .Mui-disabled when no higher-specificity rule already provides it', () => {
    // variant="filled" (the default) sets no color of its own, unlike
    // "ghost", so the disabled reset must restate the base rule's color
    // rather than leaving it to a variant that never runs for "filled".
    const theme = createDsTheme();
    const html = renderToStaticMarkup(
      <ThemeProvider theme={theme}>
        <generated.Button disabled>Go</generated.Button>
      </ThemeProvider>,
    );
    const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
      .map((m) => m[1])
      .join('\n');
    expect(css).toMatch(
      /\.Mui-disabled\{[^}]*color:var\(--bwp-palette-tokens-text-inverse\)[^}]*\}/,
    );
  });
});
