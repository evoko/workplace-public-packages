/**
 * SOLAR Toggle, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Switch on the web, its root drawn as the track and the recipe's thumb in its thumb slot;
 * drawn and pressable in Flutter, announced as a switch.
 */

import { drawnFlutter, drawnResets, treeConsts } from '../shells/drawn.mjs';
import { targetInput } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const prop of ['selected', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Toggle: the IR has no ${prop} prop`);
  if (!spec.layers.thumb) throw new Error('Toggle: the IR has no thumb layer');
};

export default {
  name: 'Toggle',
  mui: {
    // The shell draws every layer itself, inside MUI's root, each with a class of its own.
    slots: 'drawn',
    // MUI's root is the track, and its switch base, which holds the input and the thumb, covers
    // it: MUI's own track, padding, halo and the slide of its thumb give way to the recipe's.
    resets: drawnResets('Toggle', {
      padding: '0',
      overflow: 'visible',
      '& .MuiSwitch-track': { display: 'none' },
      '& .MuiSwitch-switchBase, & .MuiSwitch-switchBase.Mui-checked': {
        position: 'absolute',
        inset: '0',
        padding: '0',
        transform: 'none',
        backgroundColor: 'transparent',
      },
      // The input is the target, 44 × 44 around the track (shells/target.mjs).
      // Through the switch base, as specific as MUI's own rule for the input, which it follows.
      ...targetInput('& .MuiSwitch-switchBase .MuiSwitch-input'),
    }),
    // A toggle in a row that is its target (an Option Row's) takes the row's hover, as Checkbox's.
    states: {
      default: null,
      hover: '&:hover, .SolarStatesScope:hover &',
      focus: '&:has(.Mui-focusVisible)',
      disabled: '&.SolarToggle-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onChanged.
  api: {
    flutter: { disabled: 'onChanged' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Toggle.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarToggleStyle\` and \`solarToggleCompose\` in \`@bwp-web/styles/mui\`: the track's
 * fill and edge by state, and the thumb's, where it sits on and off.
 *
 * A setting, on or off, that takes effect at once: no confirm, and no action (that is a Button). It
 * wraps MUI's Switch, a native input announced as a switch, with Figma's track and thumb drawn from
 * its layer tree (\`internal/layers.tsx\`). On and off read by the thumb's place as well as the
 * colour. Give it a name: a <label> around it or beside it (MUI's FormControlLabel), or an
 * \`aria-label\`. Controlled with \`selected\`, or not with \`defaultSelected\`. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import MuiSwitch, { type SwitchProps as MuiSwitchProps } from '@mui/material/Switch';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ChangeEvent } from 'react';
import {
  solarToggleCompose,
  solarToggleStyle,
  type SolarToggleProps,
} from '@bwp-web/styles/mui';
import { drawChildren, type LayerParts } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

/** Figma's thumb, drawn in MUI's thumb slot, from this variant's composition. */
function Thumb({ parts }: { parts?: Record<string, LayerParts> }) {
  return <>{drawChildren('root', { prefix: 'SolarToggle', tree: TREE, slots: SLOTS, parts: parts ?? {} })}</>;
}

export interface ToggleProps
  extends SolarToggleProps,
    Omit<
      MuiSwitchProps,
      | keyof SolarToggleProps
      | 'checked'
      | 'defaultChecked'
      | 'onChange'
      | 'icon'
      | 'checkedIcon'
      | 'color'
      | 'size'
      | 'edge'
      | 'ref'
    > {
  /** Whether it starts on, where \`selected\` does not say. */
  defaultSelected?: boolean;
  /** Called with the value a click asks for, the opposite of \`selected\`. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, selected: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    selected: selectedProp,
    defaultSelected,
    disabled = false,
    onChange,
    className,
    slotProps,
    sx,
    ...rest
  },
  ref,
) {
  const [selected, setSelected] = useControlled({
    controlled: selectedProp,
    default: Boolean(defaultSelected),
    name: 'Toggle',
    state: 'selected',
  });
  const look = { selected, disabled };
  return (
    <MuiSwitch
      ref={ref}
      {...rest}
      checked={selected}
      disabled={disabled}
      onChange={(event, value) => {
        setSelected(value);
        onChange?.(event, value);
      }}
      disableRipple
      className={[disabled ? 'SolarToggle-disabled' : null, className].filter(Boolean).join(' ') || undefined}
      slots={{ thumb: Thumb }}
      // The caller's, the input's among them (an Option Row describes it), beside the thumb's.
      slotProps={{ ...slotProps, thumb: { parts: solarToggleCompose(look) } as object }}
      sx={[solarToggleStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        disabledBy: 'onChanged',
        look: 'the track’s fill and edge by state, and the thumb’s, where it sits on and off, read cell by cell',
        about: `Bespoke: Flutter's Switch paints its own track and thumb and cannot take Figma's. They are
drawn from Figma's layer tree with [SolarLayers], pressable, and announced as a switch. A setting,
on or off, that takes effect at once: no confirm, and no action (that is a SolarButton). On and
off read by the thumb's place as well as the colour. Name it with [semanticLabel], or a label
beside it that toggles it too.`,
        params: `required this.onChanged,
this.semanticLabel,`,
        fields: `/// Called with the value a tap asks for, the opposite of [selected]; null disables it.
final ValueChanged<bool>? onChanged;

/// What it turns on, for a screen reader, where no label beside it says so.
final String? semanticLabel;`,
        control: {
          onPressed:
            'disabled || onChanged == null ? null : () => onChanged!(!selected)',
          semantics: 'toggled: selected,',
        },
        // A toggle with nothing to do is drawn disabled.
        values: { disabled: 'disabled || onChanged == null' },
        wrap: `semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark)`,
      });
    },
  },
};
