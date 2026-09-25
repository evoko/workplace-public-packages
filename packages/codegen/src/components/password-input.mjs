/**
 * SOLAR Password Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field (shells/field.mjs) whose words are hidden: MUI's InputBase on the web, a password
 * input, and an obscured TextField in Flutter, with SOLAR's eye after it to show or hide them.
 */

import { treeOf, treeConsts } from '../shells/drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from '../shells/field.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarPasswordInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper', 'forgotPassword'],
    label: ['password', 'mandatory'],
    field: ['maskedValue', 'icon'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Password Input: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  if (spec.style.icon?.base.component?.keyword !== 'Icon/Eye')
    throw new Error('Password Input: its icon is not the eye');
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('Password Input: its filled is not derived from its value');
};

export default {
  name: 'Password Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its words the InputBase's input, and the eye a button.
    slots: 'drawn',
    resets: fieldResets('Password Input', {
      input: 'maskedValue',
      wraps: ['helper', 'forgotPassword'],
      more: {
        // The eye is a button of the icon's size, its ink the recipe's, with a 44 × 44 target
        // (shells/target.mjs).
        ...targetArea(`& button.${P}--icon`),
        [`& button.${P}--icon`]: {
          ...targetArea(`& button.${P}--icon`)[`& button.${P}--icon`],
          appearance: 'none',
          background: 'none',
          border: '0',
          padding: '0',
          margin: '0',
          cursor: 'pointer',
          flexShrink: '0',
        },
        [`& button.${P}--icon > svg`]: {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      },
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Password Input', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A field's label is its `label`, as Text Input's is.
  // Flutter holds a field's value in its controller.
  api: {
    react: { label: 'label' },
    flutter: { value: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Password Input.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPasswordInputStyle\` and \`solarPasswordInputCompose\` in
 * \`@bwp-web/styles/mui\`: the field's fill, edge and focus ring by state, its words' and eye's ink,
 * and the label and helper.
 *
 * A password: its \`label\` above (a \`mandatory\` one is starred, and the input required), its
 * \`helper\` below, which says what is wrong where it is in \`error\`, and a \`forgotPassword\` link
 * below that where given. Its words are hidden, a native password input a password manager fills
 * (\`autoComplete\` is \`current-password\` unless it says \`new-password\`); SOLAR's eye after them
 * shows or hides them, announced as a toggle, and leaves the focus in the field. Never log or show
 * what is typed; for a value that need not be hidden, use a Text Input. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import { IconEye, IconEyeOff } from '@bwp-web/assets';
import Box from '@mui/material/Box';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import { forwardRef, useId, useState, type ReactNode } from 'react';
import {
  solarPasswordInputCompose,
  solarPasswordInputStyle,
  type SolarPasswordInputProps,
} from '@bwp-web/styles/mui';
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface PasswordInputProps
  extends SolarPasswordInputProps,
    Omit<
      InputBaseProps,
      | keyof SolarPasswordInputProps
      | 'size'
      | 'color'
      | 'type'
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
  /** What it asks for, above it ("Password"). */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** A link to the app's reset flow, below the helper ("Forgot password?"). */
  forgotPassword?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLDivElement, PasswordInputProps>(
  function PasswordInput(
    {
      ${api.join(',\n      ')},
      label,
      mandatory = false,
      helper,
      forgotPassword,
      id: idProp,
      value: valueProp,
      defaultValue,
      onChange,
      autoComplete = 'current-password',
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
      name: 'PasswordInput',
      state: 'value',
    });
    const [shown, setShown] = useState(false);
    // Filled where it holds a value: its words are then the value's, not the placeholder's.
    const filled = value != null && String(value) !== '';
    const look = { ${api.join(', ')}, filled };
    const parts = solarPasswordInputCompose(look);
    const drawing: LayerDrawing = {
      prefix: '${P}',
      tree: TREE, slots: SLOTS,
      // A part left empty is not drawn.
      parts: {
        ...parts,
        label: { ...parts.label, present: label != null },
        mandatory: { ...parts.mandatory, present: mandatory },
        helper: { ...parts.helper, present: helper != null },
        forgotPassword: { ...parts.forgotPassword, present: forgotPassword != null },
      },
      text: { password: label, mandatory: <span aria-hidden>*</span>, forgotPassword },
      icons: {
        // SOLAR's eye, a toggle that shows or hides the words, and leaves the focus in the field.
        icon: (
          <button
            type="button"
            aria-label="Show password"
            aria-pressed={shown}
            aria-controls={id}
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setShown((was) => !was)}
          >
            {shown ? <IconEyeOff /> : <IconEye />}
          </button>
        ),
      },
      render: {
        label: (layer) => <label htmlFor={id} {...layer} />,
        // The field is MUI's InputBase, its input the hidden words, the eye after them.
        field: (layer) => (
          <InputBase
            {...rest}
            className={layer.className}
            style={layer.style}
            id={id}
            type={shown ? 'text' : 'password'}
            autoComplete={autoComplete}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              onChange?.(event);
            }}
            disabled={disabled}
            error={error}
            required={mandatory}
            endAdornment={drawLayer('icon', drawing)}
            inputProps={{
              ...inputProps,
              className: ['${P}--maskedValue', inputProps?.className].filter(Boolean).join(' '),
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
        sx={[solarPasswordInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', drawing)}
      </Box>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return fieldFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, its words' and eye's ink, and the label and helper",
        about: `A password: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], and a [forgotPassword] link below that where given. Its words are an obscured [TextField], undecorated, in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its words, its states and whether they are shown), which a password manager fills; SOLAR's eye after them shows or hides them, announced as a toggle. It is drawn filled where its [controller] holds text, and hovered and focused as the field is. It reads as one text field, named by its label and described by its helper. Never log or show what is typed; for a value that need not be hidden, use a SolarTextInput.`,
        words: 'maskedValue',
        obscured: true,
        params: `this.label,
this.mandatory = false,
this.helper,
this.forgotPassword,
this.onForgotPassword,
this.onSubmitted,`,
        fields: `/// What it asks for, above it ("Password").
final String? label;

/// Whether it must be filled, which stars the label.
final bool mandatory;

/// More about it, below; where it is in [error], what is wrong.
final String? helper;

/// The words of a link to the app's reset flow, below the helper ("Forgot password?").
final String? forgotPassword;

/// Opens the app's reset flow, where [forgotPassword] is given.
final VoidCallback? onForgotPassword;

/// Called with the words when the keyboard's action submits them.
final ValueChanged<String>? onSubmitted;`,
        name: 'label',
        hint: 'helper',
        unread: ['label', 'helper'],
        present: {
          label: 'label != null',
          mandatory: 'mandatory',
          helper: 'helper != null',
          forgotPassword: 'forgotPassword != null',
        },
        text: "{'password': ?label, 'mandatory': '*', 'helper': ?helper, 'forgotPassword': ?forgotPassword}",
        wraps: "const {'helper': TextAlign.start}",
        // SOLAR's eye, open while the words are hidden, shut while they are shown.
        icons: `{
  'icon': field.obscured ? SolarIcons.eyeOutline : SolarIcons.eyeOffOutline,
}`,
        imports: `import '../solar_states.dart';
import '../solar_target.dart';`,
        builders: `// The link is a control of its own, announced as a link.
'forgotPassword': (words) => SolarTarget.inside(
  child: Semantics(
    container: true,
    child: SolarPressable(
      onPressed: onForgotPassword,
      link: true,
      builder: (_, _) => words,
    ),
  ),
),
// The eye is a toggle of its own, which shows or hides the words.
'icon': (eye) => SolarTarget.inside(
  child: Semantics(
    container: true,
    label: 'Show password',
    toggled: !field.obscured,
    child: SolarPressable(
      onPressed: enabled ? field.reveal : null,
      builder: (_, _) => eye,
    ),
  ),
),`,
        textField: `obscureText: field.obscured,
autofillHints: const [AutofillHints.password],
onSubmitted: onSubmitted,
maxLines: 1,`,
      });
    },
  },
};
