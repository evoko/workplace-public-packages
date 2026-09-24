/**
 * SOLAR Text Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field: SOLAR's label above, its helper below, and between them the field, MUI's InputBase on
 * the web and an undecorated TextField in Flutter, drawn by the shared layer helpers. Filled
 * follows the value (the overlay's `derive`), which the shells track.
 */

import { treeOf } from '../shells/drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from '../shells/field.mjs';

const P = 'SolarTextInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper'],
    label: ['labelLabel', 'mandatory'],
    field: ['leadingIcon', 'fieldLabel', 'trailingIcon'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Text Input: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  for (const slot of [
    'label',
    'mandatory',
    'leadingIcon',
    'trailingIcon',
    'helper',
  ])
    if (!spec.slots[slot])
      throw new Error(`Text Input: the IR has no ${slot} slot`);
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('Text Input: its filled is not derived from its value');
};

export default {
  name: 'Text Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, and its words the InputBase's input.
    slots: 'drawn',
    resets: fieldResets('Text Input', {
      input: 'fieldLabel',
      icons: ['leadingIcon', 'trailingIcon'],
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Text Input', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // A field's label is its `label`, as MUI's TextField and Flutter's InputDecoration name it.
    label: 'label',
    // Flutter holds a field's value in its controller.
    flutter: { value: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Text Input.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTextInputStyle\` and \`solarTextInputCompose\` in \`@bwp-web/styles/mui\`: the
 * field's fill, edge and focus ring by state, its words' and icons' ink, and the label and helper.
 *
 * Single-line text: its \`label\` above (a \`mandatory\` one is starred, and the input required), its
 * \`helper\` below, which says what is wrong where it is in \`error\`, and an icon either side. The
 * field is MUI's InputBase, a native input, so every InputBase prop but its adornments reaches it
 * (\`value\` or \`defaultValue\`, \`onChange\`, \`placeholder\`, \`type\`, \`name\`, \`inputRef\`); the label
 * and the helper are linked to it by id. It is drawn filled where it holds a value. A placeholder
 * never replaces the label; validate on blur. For many lines use a Text Area, for numbers a Number
 * Input. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box from '@mui/material/Box';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarTextInputCompose,
  solarTextInputStyle,
  type SolarTextInputProps,
} from '@bwp-web/styles/mui';
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface TextInputProps
  extends SolarTextInputProps,
    Omit<
      InputBaseProps,
      | keyof SolarTextInputProps
      | 'size'
      | 'color'
      | 'fullWidth'
      | 'margin'
      | 'multiline'
      | 'rows'
      | 'minRows'
      | 'maxRows'
      | 'startAdornment'
      | 'endAdornment'
      | 'required'
      | 'ref'
    > {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** An icon before the words. */
  leadingIcon?: ReactNode;
  /** An icon after the words, or a small control (an IconButton that clears it). */
  trailingIcon?: ReactNode;
}

export const TextInput = forwardRef<HTMLDivElement, TextInputProps>(function TextInput(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    leadingIcon,
    trailingIcon,
    id: idProp,
    value: valueProp,
    defaultValue,
    onChange,
    inputProps,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const own = useId();
  const id = idProp ?? own;
  const [value, setValue] = useControlled<unknown>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: 'TextInput',
    state: 'value',
  });
  // Filled where it holds a value: its words are then the value's, not the placeholder's.
  const filled = value != null && String(value) !== '';
  const look = { ${api.join(', ')}, filled };
  const parts = solarTextInputCompose(look);
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE,
    // A part left empty is not drawn.
    parts: {
      ...parts,
      label: { ...parts.label, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      leadingIcon: { ...parts.leadingIcon, present: leadingIcon != null },
      trailingIcon: { ...parts.trailingIcon, present: trailingIcon != null },
      helper: { ...parts.helper, present: helper != null },
    },
    text: { labelLabel: label, mandatory: <span aria-hidden>*</span> },
    icons: {
      leadingIcon: <span>{leadingIcon}</span>,
      trailingIcon: <span>{trailingIcon}</span>,
    },
    render: {
      label: (layer) => <label htmlFor={id} {...layer} />,
      // The field is MUI's InputBase, its icons either side of the input, which is its words.
      field: (layer) => (
        <InputBase
          {...rest}
          className={layer.className}
          style={layer.style}
          id={id}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            onChange?.(event);
          }}
          disabled={disabled}
          error={error}
          required={mandatory}
          startAdornment={drawLayer('leadingIcon', drawing)}
          endAdornment={drawLayer('trailingIcon', drawing)}
          inputProps={{
            ...inputProps,
            className: ['${P}-fieldLabel', inputProps?.className].filter(Boolean).join(' '),
            'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
          }}
        />
      ),
      helper: (layer) => (
        <span id={\`\${id}-helper\`} className={layer.className} style={layer.style}>
          {helper}
        </span>
      ),
    },
  };
  return (
    <Box
      ref={ref}
      className={
        [
          filled ? '${P}-filled' : null,
          error ? '${P}-error' : null,
          disabled ? '${P}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solarTextInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', drawing)}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return fieldFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, its words' and icons' ink, and the label and helper",
        about: `Single-line text: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], and an icon either side. The words are a [TextField], undecorated, in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its words and states); a tap anywhere in the field focuses them. It is drawn filled where its [controller] holds text, and hovered and focused as the field is. It reads as one text field, named by its label and described by its helper. A [placeholder] never replaces the label; validate on blur. For many lines use a SolarTextArea, for numbers a Number Input.`,
        words: 'fieldLabel',
        params: `this.label,
this.mandatory = false,
this.helper,
this.leadingIcon,
this.trailingIcon,
this.onSubmitted,
this.keyboardType,
this.textInputAction,
this.obscureText = false,`,
        fields: `/// What it asks for, above it.
final String? label;

/// Whether it must be filled, which stars the label.
final bool mandatory;

/// More about it, below; where it is in [error], what is wrong.
final String? helper;

/// An icon before the words.
final Widget? leadingIcon;

/// An icon after the words, or a small control (an icon button that clears it).
final Widget? trailingIcon;

/// Called with the words when the keyboard's action submits them.
final ValueChanged<String>? onSubmitted;

/// The keyboard it asks for.
final TextInputType? keyboardType;

/// The keyboard's action.
final TextInputAction? textInputAction;

/// Whether its words are hidden, as a password's are.
final bool obscureText;`,
        name: 'label',
        hint: 'helper',
        unread: ['label', 'helper'],
        present: {
          label: 'label != null',
          mandatory: 'mandatory',
          leadingIcon: 'leadingIcon != null',
          trailingIcon: 'trailingIcon != null',
          helper: 'helper != null',
        },
        text: "{'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper}",
        slots: "{'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon}",
        wraps: "const {'helper': TextAlign.start}",
        textField: `keyboardType: keyboardType,
textInputAction: textInputAction,
obscureText: obscureText,
onSubmitted: onSubmitted,
maxLines: 1,`,
      });
    },
  },
};
