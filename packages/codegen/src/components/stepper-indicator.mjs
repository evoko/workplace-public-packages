/**
 * SOLAR Stepper Indicator, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): the circle of one step's status, a part of a Step.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  for (const layer of ['iconCheck', 'number', 'icon'])
    if (!spec.layers[layer])
      throw new Error(`Stepper Indicator: the IR has no ${layer} layer`);
};

export default {
  name: 'Stepper Indicator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Stepper Indicator', {
      display: 'flex',
      borderStyle: 'solid',
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'the circle’s fill and edge by status, and its mark’s ink',
        about: `Bespoke: the circle of one step's status, drawn from Figma's layer tree
(\`internal/layers.tsx\`): a tick when completed, the step's \`number\` when active or upcoming, a
"!" in error. A part of a Step, which names the step: hidden from a screen reader.`,
        props: `/** The step's number, from 1. */
number: number;`,
        own: ['number'],
        attrs: 'aria-hidden',
        text: "{ number, icon: '!' }",
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the circle’s fill and edge by status, and its mark’s ink, read cell by cell',
        about: `Bespoke: the circle of one step's status, drawn from Figma's layer tree with [SolarLayers]: a tick when completed, the step's [number] when active or upcoming, a "!" in error. A part of a SolarStep, which names the step: excluded from semantics.`,
        params: 'required this.number,',
        fields: `/// The step's number, from 1.
final int number;`,
        text: "{'number': '$number', 'icon': '!'}",
        wrap: 'ExcludeSemantics(child: mark)',
      });
    },
  },
};
