/**
 * SOLAR Number Input, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field (shells/field.mjs) of a number, a spinbutton: MUI's InputBase on the web and an
 * undecorated TextField in Flutter, stepped by the arrow keys and by its stepper's buttons, inline
 * (a minus and a plus either side) or beside it (a column of chevrons).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { keyPrefixOf, treeOf, wrapDoc, treeConsts } from '../shells/drawn.mjs';
import { fieldResets, fieldStates } from '../shells/field.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarNumberInput';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper'],
    label: ['labelLabel', 'mandatory'],
    field: [
      'fieldDecrement',
      'inlineValue',
      'fieldIncrement',
      'leadingIcon',
      'value',
      'stepper',
    ],
    stepper: ['stepperIncrement', 'divider', 'stepperDecrement'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Number Input: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  if (spec.api.stepper?.values?.join() !== 'inline,side')
    throw new Error('Number Input: its stepper is not inline or side');
};

/** A stepper's button: a box of the recipe's size, its ink the recipe's, with no face of its own. */
const button = {
  appearance: 'none',
  background: 'none',
  border: '0',
  padding: '0',
  margin: '0',
  font: 'inherit',
  cursor: 'pointer',
  '&:disabled': { cursor: 'default' },
};

export default {
  name: 'Number Input',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, its number the InputBase's input, and the steppers buttons.
    slots: 'drawn',
    resets: fieldResets('Number Input', {
      input: 'value',
      more: {
        // Inline, the number is as wide as its digits, and the field hugs it.
        [`& .${P}--inlineValue.MuiInputBase-input`]: {
          flex: '0 0 auto',
          width: 'auto',
          minWidth: '1ch',
          height: 'auto',
          padding: '0',
          fieldSizing: 'content',
          WebkitTextFillColor: 'currentcolor',
          textAlign: 'center',
        },
        [`& button.${P}--fieldDecrement, & button.${P}--fieldIncrement`]: {
          ...button,
          flexShrink: '0',
          position: 'relative',
        },
        [`& button.${P}--fieldDecrement > svg, & button.${P}--fieldIncrement > svg`]:
          {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        // The inline buttons have a 44 × 44 target each (shells/target.mjs); the side stepper's
        // halves, stacked 20px tall, cannot without covering each other, and keep Figma's.
        ...targetArea(`& button.${P}--fieldDecrement`),
        ...targetArea(`& button.${P}--fieldIncrement`),
        [`& button.${P}--stepperIncrement, & button.${P}--stepperDecrement`]:
          button,
        // The divider keeps its hairline between the halves, however short the column.
        [`& .${P}--divider`]: { flexShrink: '0' },
        // InputBase's own box around the number takes no part in the field's layout: the input is
        // the layer, laid out by the field.
        [`& .${P}-number`]: { display: 'contents' },
      },
    }),
    // Hovered as the field is, and focused as the InputBase in it is; in error and disabled by the
    // props, as classes.
    states: {
      ...fieldStates('Number Input', ['error', 'disabled']),
      focus: `&:has(.${P}--field .Mui-focused)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    // A field's label is its `label`, as Text Input's is.
    label: 'label',
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Number Input.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarNumberInputStyle\` and \`solarNumberInputCompose\` in \`@bwp-web/styles/mui\`:
 * the field's fill, edge and focus ring by state, its number's and steppers' ink, and the label and
 * helper, by stepper.
 *
 * A number, stepped between \`min\` and \`max\` by \`step\`: its \`label\` above (a \`mandatory\` one is
 * starred), its \`helper\` below, which says what is wrong where it is in \`error\`. The field is MUI's
 * InputBase, a native input announced as a spinbutton, which takes only a number (the mobile
 * keyboard's numeric one): the arrow keys step it, and so do its \`stepper\`'s buttons, a minus and
 * a plus either side (\`inline\`) or a column of chevrons after it (\`side\`, larger for touch). It
 * calls \`onChange\` with the number, or null while it is empty. Validate on blur. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import {
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconPlus,
} from '@bwp-web/assets';
import Box from '@mui/material/Box';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled } from '@mui/material/utils';
import {
  forwardRef,
  useId,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  solarNumberInputCompose,
  solarNumberInputStyle,
  type SolarNumberInputProps,
} from '@bwp-web/styles/mui';
import { drawChildren, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

/** A number as the field shows it, or nothing for none. */
const shown = (n: number | null | undefined) => (n == null ? '' : String(n));

/** What the field holds, as a number: null while it is empty, or not yet a number ("-"). */
const parsed = (text: string) => {
  const n = text.trim() === '' ? null : Number(text);
  return n != null && Number.isFinite(n) ? n : null;
};

export interface NumberInputProps
  extends SolarNumberInputProps,
    Omit<
      InputBaseProps,
      | keyof SolarNumberInputProps
      | 'size'
      | 'color'
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'onChange'
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
  /** The number it holds, or null for none; controlled where given. */
  value?: number | null;
  /** The number it starts with, where \`value\` does not say. */
  defaultValue?: number | null;
  /** Called with the number as it changes, or null while it is empty. */
  onChange?: (value: number | null) => void;
  /** The least it takes. */
  min?: number;
  /** The most it takes. */
  max?: number;
  /** How far a step goes, 1 by default. */
  step?: number;
}

export const NumberInput = forwardRef<HTMLDivElement, NumberInputProps>(function NumberInput(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    value: valueProp,
    defaultValue,
    onChange,
    min,
    max,
    step = 1,
    id: idProp,
    inputProps,
    onBlur,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const own = useId();
  const id = idProp ?? own;
  const [value, setValue] = useControlled<number | null>({
    controlled: valueProp,
    default: defaultValue ?? null,
    name: 'NumberInput',
    state: 'value',
  });
  // What is typed, while it is not yet a number ("-", "1."); the number's own words otherwise.
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? shown(value);
  const clamp = (n: number) => Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n));
  const commit = (n: number | null) => {
    setValue(n);
    onChange?.(n);
  };
  const stepBy = (dir: 1 | -1) => {
    if (disabled) return;
    setDraft(null);
    commit(clamp((value ?? 0) + dir * step));
  };
  const look = { ${api.join(', ')} };
  const parts = solarNumberInputCompose(look);
  // A stepper's button: out of the tab order, the arrow keys being the keyboard's steps, and
  // leaving the focus in the field.
  const stepButton = (dir: 1 | -1, name: string, children: ReactNode, layer = {}) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={dir > 0 ? 'Increase' : 'Decrease'}
      aria-controls={id}
      disabled={disabled || (dir > 0 ? value != null && max != null && value >= max : value != null && min != null && value <= min)}
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => stepBy(dir)}
      {...layer}
      key={name}
    >
      {children}
    </button>
  );
  const words = (className: string) => (
    <InputBase
      {...rest}
      className="${P}-number"
      id={id}
      value={text}
      onChange={(event) => {
        const typed = event.target.value;
        // Only what may become a number: digits, a sign and a point.
        if (!/^-?\\d*\\.?\\d*$/.test(typed)) return;
        setDraft(typed);
        const n = parsed(typed);
        if (n !== value) commit(n);
      }}
      onBlur={(event) => {
        setDraft(null);
        onBlur?.(event);
      }}
      disabled={disabled}
      error={error}
      required={mandatory}
      inputProps={{
        ...inputProps,
        inputMode: 'decimal',
        role: 'spinbutton',
        'aria-valuenow': value ?? undefined,
        'aria-valuemin': min,
        'aria-valuemax': max,
        size: Math.max(text.length, 1),
        onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
          inputProps?.onKeyDown?.(event);
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            stepBy(event.key === 'ArrowUp' ? 1 : -1);
          }
        },
        className: [className, inputProps?.className].filter(Boolean).join(' '),
        'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
      }}
    />
  );
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
    // A part left empty is not drawn.
    parts: {
      ...parts,
      label: { ...parts.label, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      helper: { ...parts.helper, present: helper != null },
    },
    text: { labelLabel: label, mandatory: <span aria-hidden>*</span> },
    icons: {
      fieldDecrement: stepButton(-1, 'fieldDecrement', <IconMinus />),
      fieldIncrement: stepButton(1, 'fieldIncrement', <IconPlus />),
      chevronUp: <IconChevronUp variant="solid" />,
      chevronDown: <IconChevronDown variant="solid" />,
    },
    render: {
      label: (layer) => <label htmlFor={id} {...layer} />,
      // The number, inline between its buttons or before its stepper column: an input whose class
      // is the layer's.
      inlineValue: (layer) => words(layer.className),
      value: (layer) => words(layer.className),
      stepperIncrement: (layer) => stepButton(1, 'stepperIncrement', layer.children, layer),
      stepperDecrement: (layer) => stepButton(-1, 'stepperDecrement', layer.children, layer),
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
        [error ? '${P}-error' : null, disabled ? '${P}-disabled' : null, className]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solarNumberInputStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', drawing)}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarNumberInputRecipe]: the field's fill, edge and focus ring by state, its number's and steppers' ink, and the label and helper, by stepper, read cell by cell.`;
      const about = `A number, stepped between [min] and [max] by [step]: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error]. The number is a [TextField], undecorated, in the field drawn from Figma's layer tree with [SolarLayers] ([SolarField] holds its states), which takes only a number (the numeric keyboard): the arrow keys step it, and so do its [stepper]'s buttons, a minus and a plus either side ([SolarNumberInputStepper.inline]) or a column of chevrons after it ([SolarNumberInputStepper.side], larger for touch). It reads as one adjustable text field, named by its label. It calls [onChanged] with the number, or null while it is empty. Validate on blur.`;
      return `/// SOLAR Number Input.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/number_input.dart';
import '../generated/icons.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarNumberInput extends StatefulWidget {
  const SolarNumberInput({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('NumberInput', prop, def)},`).join('\n')}
    this.label,
    this.mandatory = false,
    this.helper,
    required this.value,
    required this.onChanged,
    this.min,
    this.max,
    this.step = 1,
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  });

${api.map(([prop, def]) => dartField('NumberInput', prop, def)).join('\n')}

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// The number it holds, or null for none.
  final num? value;

  /// Called with the number as it changes, or null while it is empty; null disables it.
  final ValueChanged<num?>? onChanged;

  /// The least it takes.
  final num? min;

  /// The most it takes.
  final num? max;

  /// How far a step goes.
  final num step;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarNumberInput> createState() => _SolarNumberInputState();
}

class _SolarNumberInputState extends State<SolarNumberInput> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// A number as the field shows it, or nothing for none.
  static String _shown(num? n) =>
      n == null ? '' : (n == n.roundToDouble() ? n.round().toString() : '$n');

  late final _text = TextEditingController(text: _shown(widget.value));

  @override
  void didUpdateWidget(SolarNumberInput old) {
    super.didUpdateWidget(old);
    // The caller's number, where it is not what is typed ("-", "1." are on their way to one).
    if (widget.value != num.tryParse(_text.text)) {
      _text.text = _shown(widget.value);
    }
  }

  @override
  void dispose() {
    _text.dispose();
    super.dispose();
  }

  bool get _enabled => !widget.disabled && widget.onChanged != null;

  num _clamp(num n) {
    final min = widget.min;
    final max = widget.max;
    return max != null && n > max ? max : (min != null && n < min ? min : n);
  }

  void _step(int dir) {
    if (!_enabled) return;
    final next = _clamp((widget.value ?? 0) + dir * widget.step);
    _text.text = _shown(next);
    widget.onChanged!(next);
  }

  bool _can(int dir) {
    final value = widget.value;
    final limit = dir > 0 ? widget.max : widget.min;
    return _enabled &&
        (value == null || limit == null || (dir > 0 ? value < limit : value > limit));
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = widget.label;
    final helper = widget.helper;
    // A stepper's button, a control of its own; the arrow keys are the keyboard's steps.
    Widget stepper(int dir, Widget drawn, {required bool target}) {
      final button = Semantics(
        container: true,
        label: dir > 0 ? 'Increase' : 'Decrease',
        child: SolarPressable(
          onPressed: _can(dir) ? () => _step(dir) : null,
          builder: (_, _) => drawn,
        ),
      );
      return target ? SolarTarget.inside(child: button) : button;
    }

    return SolarField(
      controller: _text,
      focusNode: widget.focusNode,
      statesController: widget.statesController,
      builder: (context, field) {
        final states = field.states;
        final p = SolarNumberInputProps(
${api.map(([prop]) => `          ${prop}: widget.${prop},`).join('\n')}
        );
        Widget words(TextStyle? style) => field.read(
          Focus(
            // The arrow keys step it, as a spinbutton's do.
            onKeyEvent: (_, event) {
              if (event is KeyUpEvent) return KeyEventResult.ignored;
              final dir = event.logicalKey == LogicalKeyboardKey.arrowUp
                  ? 1
                  : event.logicalKey == LogicalKeyboardKey.arrowDown
                  ? -1
                  : 0;
              if (dir == 0) return KeyEventResult.ignored;
              _step(dir);
              return KeyEventResult.handled;
            },
            child: TextField(
              controller: field.text,
              focusNode: field.focus,
              enabled: _enabled,
              autofocus: widget.autofocus,
              keyboardType: const TextInputType.numberWithOptions(
                signed: true,
                decimal: true,
              ),
              // Only what may become a number: digits, a sign and a point.
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'^-?\\d*\\.?\\d*')),
              ],
              onChanged: (typed) {
                final n = num.tryParse(typed);
                if (n != widget.value) widget.onChanged?.call(n);
              },
              style: style,
              maxLines: 1,
              textAlign: widget.stepper == SolarNumberInputStepper.inline
                  ? TextAlign.center
                  : TextAlign.start,
              decoration: InputDecoration.collapsed(
                hintText: null,
                hintStyle: style,
              ),
            ),
          ),
          label: label,
          hint: helper,
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarNumberInputRecipe.lookup(c, p, states),
            dimension: (c) => SolarNumberInputRecipe.dimension(c, p, states),
            color: (c) => SolarNumberInputRecipe.color(t, c, p, states),
            shadow: (c) => SolarNumberInputRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarNumberInputRecipe.textStyle(t, c, p, states),
            // A part left empty is not drawn.
            present: (l) => switch (l) {
              'label' => label != null,
              'mandatory' => widget.mandatory,
              'helper' => helper != null,
              _ => SolarNumberInputRecipe.present(l, p, states),
            },
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(spec.component)}',
          text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
          wraps: const {'helper': TextAlign.start},
          icons: const {
            'fieldDecrement': SolarIcons.minusOutline,
            'fieldIncrement': SolarIcons.plusOutline,
            'chevronUp': SolarIcons.chevronUpSolid,
            'chevronDown': SolarIcons.chevronDownSolid,
          },
          // The number, in the recipe's style, in either stepper's place for it.
          fields: {'inlineValue': words, 'value': words},
          builders: {
            // The label and the helper are read with the number, which they name and describe.
            'label': (layer) => ExcludeSemantics(child: layer),
            'helper': (layer) => ExcludeSemantics(child: layer),
            'fieldDecrement': (drawn) => stepper(-1, drawn, target: true),
            'fieldIncrement': (drawn) => stepper(1, drawn, target: true),
            // The side stepper's halves, stacked 20px tall, cannot have a 44 × 44 target each.
            'stepperIncrement': (drawn) => stepper(1, drawn, target: false),
            'stepperDecrement': (drawn) => stepper(-1, drawn, target: false),
            'field': (layer) => field.area(layer, enabled: _enabled),
          },
        ).layer('root');
      },
    );
  }
}
`;
    },
  },
};
