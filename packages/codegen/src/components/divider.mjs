/**
 * SOLAR Divider, beyond its IR: where MUI draws each layer, and the two shell templates, run once
 * by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/scaffold/drawn.mjs`): a rule, or a label between two rules, as layers of
 * their own. Its root is a block, as a separator spans its container.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireLayers = (spec) => {
  for (const axis of ['orientation', 'type'])
    if (!spec.api[axis]) throw new Error(`Divider: the IR has no ${axis}`);
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Divider: the IR has no label text');
};

export default {
  name: 'Divider',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A block, where the other drawn components are inline: a separator spans what it separates.
    resets: drawnResets('Divider', { display: 'flex' }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'the rule’s colour and thickness, the label’s text style, and each type’s gap and inset',
        about: `Bespoke: a rule, an inset rule, or a label between two rules, drawn from Figma’s layer
tree (\`internal/layers.tsx\`). It fills what it separates: a horizontal divider the width it is
given, a vertical one the height. A screen reader hears a separator, and a labelled one’s label.`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** For \`with-label\`: the words between the rules ("Or"). */
children?: ReactNode;`,
        own: ['children'],
        attrs: `role="separator"
aria-orientation={orientation === 'vertical' ? 'vertical' : 'horizontal'}
aria-label={typeof children === 'string' ? children : undefined}`,
        text: '{ label: children }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the rule’s colour and thickness, the label’s text style, and each type’s gap and inset, read cell by cell',
        about: `Bespoke: a rule, an inset rule, or a label between two rules, drawn from Figma's layer
tree with [SolarLayers]. It fills what it separates: a horizontal divider the width it is given, a
vertical one the height, so give a vertical one a bounded height (a row's).`,
        params: 'this.label,',
        fields: `/// For with-label: the words between the rules ('Or').
final String? label;`,
        text: "{'label': ?label}",
      });
    },
  },
};
