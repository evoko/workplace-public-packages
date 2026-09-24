/**
 * SOLAR Step, beyond its IR: where MUI draws each layer, and the two shell templates, rendered into
 * the shells by \`solar:codegen\` on every run. One file per component, so adding one edits nothing
 * shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): one step of a Stepper, its Stepper Indicator in the
 * variant the recipe names for its status, and its label.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const layer of ['stepperIndicator', 'step', 'label', 'line'])
    if (!spec.layers[layer])
      throw new Error(`Step: the IR has no ${layer} layer`);
};

export default {
  name: 'Step',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A step one can go back to is a button, none of the browser's own look, with a 44 × 44 target.
    resets: drawnResets('Step', {
      display: 'flex',
      '&:is(button)': {
        appearance: 'none',
        font: 'inherit',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'inherit',
      },
      ...targetArea('&:is(button)'),
    }),
  },
  flutter: {},
  shells: {
    // A step's words are its `label`.
    label: 'label',
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its label’s text style and ink, and its line, by status and type',
        about: `Bespoke: one step of a Stepper, drawn from Figma's layer tree (\`internal/layers.tsx\`):
its StepperIndicator in the variant Figma draws for its \`status\` and its \`label\` under it
(\`round\`), or its numbered label over a line (\`horizontal\`). A button where it has \`onClick\` (a
completed step the flow lets one go back to), words otherwise. A Stepper gives it its status.`,
        element: "{onClick ? 'button' : 'span'}",
        refType: 'HTMLElement',
        react: ['type MouseEventHandler', 'type ReactNode'],
        imports: "import { StepperIndicator } from './StepperIndicator.js';",
        props: `/** The step's name. */
label: ReactNode;
/** The step's number, from 1. */
number: number;
/** Called when it is chosen: it is a button. */
onClick?: MouseEventHandler<HTMLElement>;`,
        own: ['label', 'number', 'onClick'],
        omit: ['onClick'],
        attrs: `type={onClick ? 'button' : undefined}
onClick={onClick}`,
        text: '{ step: label, label: <>{number}. {label}</> }',
        content: `{
          stepperIndicator: (
            <StepperIndicator
              number={number}
              status={composed.stepperIndicator['variant.status'] as never}
            />
          ),
        }`,
        present: { step: 'composed.step?.present !== false' },
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its label’s text style and ink, and its line, by status and type, read cell by cell',
        about: `Bespoke: one step of a SolarStepper, drawn from Figma's layer tree with [SolarLayers]: its SolarStepperIndicator in the variant Figma draws for its [status] and its [label] under it (round), or its numbered label over a line (horizontal). Pressable where it has [onPressed] (a completed step the flow lets one go back to). A SolarStepper gives it its status.`,
        params: `required this.label,
required this.number,`,
        fields: `/// The step's name.
final String label;

/// The step's number, from 1.
final int number;`,
        pressable: true,
        text: "{'step': label, 'label': '$number. $label'}",
        composed: `{
        'stepperIndicator': SolarStepperIndicator(
          number: number,
          status: SolarStepperIndicatorStatus.values.byName(
            SolarStepRecipe.lookup('stepperIndicator.variant.status', p, states)!.substring(2),
          ),
        ),
      }`,
        imports: `import '../generated/components/stepper_indicator.dart';
import 'solar_stepper_indicator.dart';`,
      });
    },
  },
};
