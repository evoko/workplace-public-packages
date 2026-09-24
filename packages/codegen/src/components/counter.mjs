/**
 * SOLAR Counter, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`). Figma gives it hover and pressed because it is
 * drawn inside a Button: it takes the states of the control around it, and is a control of its own
 * only when given something to do (`onClick`, `onPressed`).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireValue = (spec) => {
  if (spec.layers.value?.type !== 'TEXT')
    throw new Error('Counter: the IR has no value text');
  if (spec.api.disabled?.type !== 'boolean')
    throw new Error('Counter: the IR has no disabled prop');
};

/**
 * A control the counter is, or sits in: a button that is not disabled. The one it sits in is
 * spelled from the element, since Emotion reads a selector that starts with a colon as the
 * counter's own (`:hover &` would be the counter hovered inside itself).
 */
const own = ':is(button):not(:disabled)';
// Not a tab: a Tab Item's Counter is drawn at rest in every state of the tab (its type says the
// tab's state), as Figma draws it.
const around = 'button:not(:disabled):not([role="tab"])';

export default {
  name: 'Counter',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A counter given onClick is a <button>, which the browser styles as one.
    resets: drawnResets('Counter', {
      '&:is(button)': {
        font: 'inherit',
        margin: '0',
        cursor: 'pointer',
        appearance: 'none',
      },
      '&:is(button):disabled': { cursor: 'default' },
      // A 44 × 44 target around a counter that is a control (shells/target.mjs).
      ...targetArea('&:is(button)'),
    }),
    // Its own states where it is a control, and otherwise the states of the control it sits in
    // (a Button's), as Figma draws it inside one. Disabled is its prop's class, or a disabled
    // control around it.
    states: {
      default: null,
      hover: `&${own}:hover, ${around}:hover &`,
      pressed: `&${own}:active, ${around}:active &`,
      disabled:
        '&.SolarCounter-disabled, button:not([role="tab"]):disabled &, .Mui-disabled:not([role="tab"]) &',
    },
    overlaps: { pressed: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireValue(spec);
      return drawnReact(spec, {
        look: 'the pill’s fill, border and padding, and the count’s text style, by type and state',
        about: `Bespoke: a count on a pill, drawn from Figma’s layer tree (\`internal/layers.tsx\`).
It takes the states of the control it sits in, so in a Button it follows the Button’s hover,
press and disabled colours, as Figma draws it; given \`onClick\`, it is a <button> of its own.
A count of 0 or less draws nothing, and one above \`max\` reads \`<max>+\`, as SOLAR says.`,
        element: "{onClick ? 'button' : 'span'}",
        refType: 'HTMLElement',
        props: `/** The count. At 0 or below the counter is not drawn: SOLAR never shows a literal 0. */
count: number;
/** The largest count shown as a number; above it the counter reads \`<max>+\`. 99 by default. */
max?: number;`,
        own: ['count', 'max = 99', 'onClick', 'className'],
        prelude: 'if (count <= 0) return null;',
        attrs: `onClick={onClick}
type={onClick ? 'button' : undefined}
disabled={onClick ? disabled : undefined}
className={
  [disabled ? 'SolarCounter-disabled' : null, className].filter(Boolean).join(' ') ||
  undefined
}`,
        text: '{ value: count > max ? `${max}+` : String(count) }',
      });
    },
    flutter: (spec) => {
      requireValue(spec);
      return drawnFlutter(spec, {
        look: 'the pill’s fill, border and padding, and the count’s text style, by type and state, read cell by cell',
        about: `Bespoke: a count on a pill, drawn from Figma's layer tree with [SolarLayers]. It takes
the states of the control it sits in (SolarStatesBuilder), so in a SolarButton it follows the
button's hover, press and disabled colours, as Figma draws it; given [onPressed], it is a control
of its own. A count of 0 or less draws nothing, and one above [max] reads \`<max>+\`, as SOLAR says.`,
        params: `required this.count,
this.max = 99,`,
        fields: `/// The count. At 0 or below the counter is not drawn: SOLAR never shows a literal 0.
final int count;

/// The largest count shown as a number; above it the counter reads \`<max>+\`.
final int max;`,
        prelude: 'if (count <= 0) return const SizedBox.shrink();',
        pressable: '!disabled',
        text: "{'value': count > max ? '$max+' : '$count'}",
      });
    },
  },
};
