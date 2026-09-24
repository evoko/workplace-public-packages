/**
 * SOLAR Checkbox, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Checkbox on the web, its root the box, the tick and dash drawn inside it by the shared layer
 * helpers as MUI's icons; drawn and pressable in Flutter, announced as a checkbox.
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';
import { targetInput } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const prop of ['checked', 'mixed', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Checkbox: the IR has no ${prop} prop`);
  for (const layer of ['icon', 'container'])
    if (!spec.layers[layer])
      throw new Error(`Checkbox: the IR has no ${layer} layer`);
};

export default {
  name: 'Checkbox',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the box: its padding and round hover halo give way to the recipe's, and its
    // native input, invisible, covers the box.
    resets: drawnResets('Checkbox', {
      padding: '0',
      // The input is the target, 44 × 44 around the box (shells/target.mjs).
      ...targetInput('& input'),
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Checkbox.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarCheckboxStyle\` and \`solarCheckboxCompose\` in \`@bwp-web/styles/mui\`: the
 * box's fill and edge by state, and the tick and dash, Figma's own outlines.
 *
 * One choice of many, committed on click. It wraps MUI's Checkbox, a native input, with its box,
 * tick and dash drawn from Figma's layer tree (\`internal/layers.tsx\`). \`mixed\` draws the dash, for
 * a parent box whose children are partly checked, and is announced so. Give it a name: a <label>
 * around it or beside it (which toggles it), or an \`aria-label\`. Controlled with \`checked\`, or
 * not with \`defaultChecked\`. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiCheckbox, {
  type CheckboxProps as MuiCheckboxProps,
} from '@mui/material/Checkbox';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ReactNode } from 'react';
import {
  solarCheckboxCompose,
  solarCheckboxStyle,
  type SolarCheckboxProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

/** The tick or dash, as MUI's icon: MUI hands the icon a size, which the marks do not take. */
function Marks({ children }: { children: ReactNode; fontSize?: unknown }) {
  return <>{children}</>;
}

export interface CheckboxProps
  extends SolarCheckboxProps,
    Omit<
      MuiCheckboxProps,
      | keyof SolarCheckboxProps
      | 'indeterminate'
      | 'icon'
      | 'checkedIcon'
      | 'indeterminateIcon'
      | 'color'
      | 'size'
      | 'ref'
    > {}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(
    { checked: checkedProp, defaultChecked, mixed = false, disabled = false, onChange, sx, ...rest },
    ref,
  ) {
    const [on, setOn] = useControlled({
      controlled: checkedProp,
      default: Boolean(defaultChecked),
      name: 'Checkbox',
      state: 'checked',
    });
    // Figma draws a mixed box only as a checked one, so a mixed box is drawn so.
    const look = { checked: on || mixed, mixed, disabled };
    // Hover and focus draw the marks as at rest; a disabled box draws Figma's own outline of them.
    const marks = (
      <Marks>
        {drawChildren('root', {
          prefix: 'SolarCheckbox',
          tree: TREE,
          parts: solarCheckboxCompose(look, disabled ? 'disabled' : 'default'),
        })}
      </Marks>
    );
    return (
      <MuiCheckbox
        ref={ref}
        {...rest}
        checked={on}
        indeterminate={mixed}
        disabled={disabled}
        onChange={(event, value) => {
          setOn(value);
          onChange?.(event, value);
        }}
        disableRipple
        icon={marks}
        checkedIcon={marks}
        indeterminateIcon={marks}
        sx={[solarCheckboxStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the box’s fill and edge by state, and the tick and dash, Figma’s own outlines, read cell by cell',
        about: `Bespoke: Flutter's Checkbox paints a tick of its own and cannot take Figma's. The box, tick
and dash are drawn from Figma's layer tree with [SolarLayers], pressable, and announced as a
checkbox. One choice of many, committed on tap. [mixed] draws the dash, for a parent box whose
children are partly checked, and is announced so. Name it with [semanticLabel], or a label beside
it that toggles it too.`,
        params: `required this.onChanged,
this.semanticLabel,`,
        fields: `/// Called with the value a tap asks for, the opposite of [checked]; null disables it.
final ValueChanged<bool>? onChanged;

/// What it chooses, for a screen reader, where no label beside it says so.
final String? semanticLabel;`,
        control: {
          onPressed:
            'disabled || onChanged == null ? null : () => onChanged!(!checked)',
          semantics: `checked: checked,
mixed: mixed,`,
        },
        // Figma draws a mixed box only as a checked one, and a box with nothing to do as disabled.
        values: {
          checked: 'checked || mixed',
          disabled: 'disabled || onChanged == null',
        },
        wrap: `semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark)`,
      });
    },
  },
};
