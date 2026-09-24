/**
 * SOLAR Options List, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn fieldset (`src/shells/drawn.mjs`) whose content layer holds the caller's Option Rows in
 * place of Figma's examples, named by a legend a screen reader reads and Figma does not draw (owner
 * decision 2026-09-24).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  if (spec.layers.content?.type !== 'SLOT')
    throw new Error('Options List: the IR has no content slot');
};

const P = 'SolarOptionsList';

export default {
  name: 'Options List',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the root is a fieldset.
    slots: 'drawn',
    // A fieldset has none of the browser's own edge, gap or width, and its legend is hidden, as
    // Figma draws none: a screen reader reads it.
    resets: drawnResets('Options List', {
      display: 'flex',
      flexDirection: 'column',
      margin: '0',
      minWidth: '0',
      border: '0',
      padding: '0',
      [`& .${P}-legend`]: {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        overflow: 'hidden',
        clipPath: 'inset(50%)',
        whiteSpace: 'nowrap',
      },
      [`& .${P}-content > *`]: { width: '100%' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'the list’s gap, and its rows’ place',
        about: `Bespoke: the fieldset around OptionRows that answer one question, drawn from Figma's layer tree
(\`internal/layers.tsx\`). Its \`label\` is the question, the fieldset's legend, which a screen
reader reads and the page does not show (Figma draws none); where the question is on the page
already, pass it. One kind of control a list: radios go in MUI's RadioGroup inside it, one group.
Above five choices of one, SOLAR says, use a Select.`,
        element: 'fieldset',
        refType: 'HTMLFieldSetElement',
        react: ['type ReactNode'],
        props: `/** The question the rows answer: the fieldset's legend, read by a screen reader. */
label: string;
/** The rows: OptionRows of one control. */
children: ReactNode;`,
        own: ['label', 'children'],
        content: '{ content: children }',
        before: `<legend className="${P}-legend">{label}</legend>`,
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the list’s gap, and its rows’ place, read cell by cell',
        about: `Bespoke: the group around SolarOptionRows that answer one question, drawn from Figma's layer
tree with [SolarLayers] and named by its [label], which a screen reader reads and the page does not
show (Figma draws none). One kind of control a list: radios go under one [RadioGroup]. Above five
choices of one, SOLAR says, use a Select.`,
        params: `required this.label,
required this.children,`,
        fields: `/// The question the rows answer, read by a screen reader.
final String label;

/// The rows: SolarOptionRows of one control.
final List<Widget> children;`,
        content: "{'content': children}",
        wrap: `Semantics(
      container: true,
      explicitChildNodes: true,
      label: label,
      child: mark,
    )`,
      });
    },
  },
};
