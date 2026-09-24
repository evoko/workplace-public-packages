/**
 * SOLAR Kbd, beyond its IR: where MUI draws each layer, and the two shell templates, run once by
 * \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawn component: the shells draw its layer tree with the shared helpers
 * (`src/scaffold/drawn.mjs`), the label as the caller's text in its box.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireLabel = (spec) => {
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Kbd: the IR has no label text');
};

export default {
  name: 'Kbd',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // <kbd> is monospaced in a browser's own style sheet; the recipe's text style is the label's.
    resets: drawnResets('Kbd', { fontFamily: 'inherit' }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLabel(spec);
      return drawnReact(spec, {
        look: 'the key cap’s fill, border and radius, and its label’s text style',
        about: `Bespoke: a key cap, drawn as HTML’s <kbd> from Figma’s layer tree
(\`internal/layers.tsx\`). One key per Kbd: a chord is several, with a separator between them
(Ctrl + K), and a modifier is the platform’s own symbol (⌘ on macOS, Ctrl elsewhere).`,
        element: 'kbd',
        refType: 'HTMLElement',
        react: ['type ReactNode'],
        props: `/** The key's label: one key, as the platform names it (⌘, Ctrl, K, Enter). */
children: ReactNode;`,
        own: ['children'],
        text: '{ label: children }',
      });
    },
    flutter: (spec) => {
      requireLabel(spec);
      return drawnFlutter(spec, {
        look: 'the key cap’s fill, border and radius, and its label’s text style, read cell by cell',
        about: `Bespoke: a key cap, drawn from Figma's layer tree with [SolarLayers]. One key per Kbd:
a chord is several, with a separator between them (Ctrl + K), and a modifier is the platform's
own symbol (⌘ on macOS, Ctrl elsewhere).`,
        params: 'required this.label,',
        fields: `/// The key's label: one key, as the platform names it (⌘, Ctrl, K, Enter).
final String label;`,
        text: "{'label': label}",
      });
    },
  },
};
