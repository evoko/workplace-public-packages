/**
 * What the typed pickers' shells share (DatePicker, TimePicker): a field (`field.mjs`) whose words
 * are a value typed in the locale's way, read on Enter and as the focus leaves, and whose icon is
 * the button that opens a panel under the field to pick one (owner decision 2026-09-24: typed and
 * picked). In error while focused is Figma's `error-focused`, a compound state (the overlay's
 * `states.compound`). Each picker gives its value's type, how its words are written and read, and
 * its panel.
 */

import { pascal } from '../util/naming.mjs';
import { iconsOf, treeOf, treeConsts } from './drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from './field.mjs';
import { targetArea } from './target.mjs';

/** The layers a typed picker draws, where Figma draws them, or the build fails. */
export function requireTyped(spec, icon) {
  const name = spec.component;
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper'],
    label: ['labelLabel', 'required'],
    field: [icon, 'value'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `${name}: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error(`${name}: its filled is not derived from its value`);
  if (!spec.states.includes('error-focused'))
    throw new Error(`${name}: error-focused is not a state`);
  if (!iconsOf(spec).some((i) => i.layer === icon))
    throw new Error(`${name}: ${icon} draws no SOLAR icon`);
}

/**
 * A typed picker's resets: a field's, its words the input, and its icon a button (none of the
 * browser's own look, its size the recipe's) with a 44 × 44 target.
 */
export function typedResets(name, icon) {
  const P = `Solar${pascal(name)}`;
  const button = `& .${P}-${icon}`;
  return fieldResets(name, {
    input: 'value',
    // The target's own rule on the button, merged: one rule per selector.
    more: {
      ...targetArea(button),
      [button]: {
        ...targetArea(button)[button],
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
        flexShrink: '0',
        // Its size is the recipe's, not the icon's own 16px, which a flex item takes as its least.
        minWidth: '0',
        '& > svg': { display: 'block', width: '100%', height: '100%' },
        '&:disabled': { cursor: 'default' },
      },
    },
  });
}

/**
 * A typed picker's state table: a field's, hovered and focused as the field is, filled and in
 * error by the shell's classes; in error while focused, both at once, as Figma's `error-focused`
 * draws it; disabled beats all.
 */
export function typedStates(name) {
  const P = `Solar${pascal(name)}`;
  return {
    ...fieldStates(name, ['filled', 'error']),
    'error-focused': `&.${P}-error:has(.${P}-field.Mui-focused)`,
    disabled: `&.${P}-disabled`,
  };
}

/** The Flutter side of `error-focused`: in error while the field has the focus. */
export const TYPED_FLUTTER_STATES = {
  'error-focused': 'p.error && s.contains(WidgetState.focused)',
};

/**
 * A typed picker's React shell: MUI's InputBase as the field, its words the value as the locale
 * writes it, read back on Enter and blur; its icon a button, and the down arrow, opening the
 * panel under the field.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.icon the icon layer, the button that opens the panel
 * @param {string} o.about the doc comment, after the generated header
 * @param {string} o.imports more import lines
 * @param {string} o.valueType the value's TypeScript type, less null (`string`)
 * @param {{value: string, defaultValue: string, onChange: string}} o.docs the value's doc comments
 * @param {string} o.props more props, TypeScript interface members with their doc comments
 * @param {string} o.destructure more of the props taken apart, one per line (`locale,`)
 * @param {string} o.words statements that set `words`, the value as the locale writes it, from
 *   `value`
 * @param {string} o.read the body of `read(typed)`: the value the words are, or null for none
 * @param {string} o.openLabel the button's name by default
 * @param {string} o.popup the panel's role (`dialog`, `listbox`), for `aria-haspopup`
 * @param {string} o.panel the panel, a JSX expression drawn while open: given `field` (the
 *   field's element), `value`, `choose(value)`, `hide()` and `input` (the input's element)
 */
export function typedReact(spec, o) {
  const name = spec.component;
  const P = `Solar${pascal(name)}`;
  const C = pascal(name);
  const api = Object.keys(spec.api);
  const icon = iconsOf(spec).find((i) => i.layer === o.icon).react;
  return `/**
 * SOLAR ${name}.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solar${C}Style\` and \`solar${C}Compose\` in \`@bwp-web/styles/mui\`: the
 * field's fill, edge and focus ring by state, its words' and icon's ink, and the label and helper.
 *
${o.about
  .trim()
  .split('\n')
  .map((l) => ` * ${l}`.trimEnd())
  .join('\n')}
 * The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box from '@mui/material/Box';
import InputBase, { type InputBaseProps } from '@mui/material/InputBase';
import { useControlled, useForkRef } from '@mui/material/utils';
import { ${icon} } from '@bwp-web/assets';
import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  solar${C}Compose,
  solar${C}Style,
  solar${C}Styles,
  type Solar${C}Props,
} from '@bwp-web/styles/mui';
${o.imports.trim()}
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface ${C}Props
  extends Solar${C}Props,
    Omit<
      InputBaseProps,
      | keyof Solar${C}Props
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
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'ref'
    > {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label and makes the input required. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** ${o.docs.value} */
  value?: ${o.valueType} | null;
  /** ${o.docs.defaultValue} */
  defaultValue?: ${o.valueType} | null;
  /** ${o.docs.onChange} */
  onChange?: (value: ${o.valueType} | null) => void;
${o.props
  .trim()
  .split('\n')
  .map((l) => `  ${l}`.trimEnd())
  .join('\n')}
  /** Whether its panel is open, where the caller keeps it. */
  open?: boolean;
  /** Called when the panel opens, and when it closes. */
  onOpen?: () => void;
  onClose?: () => void;
  /** The button that opens the panel, named for a screen reader. */
  openLabel?: string;
}

export const ${C} = forwardRef<HTMLDivElement, ${C}Props>(function ${C}(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    id: idProp,
    value: valueProp,
    defaultValue = null,
    onChange,
${o.destructure
  .trim()
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n')}
    open: openProp,
    onOpen,
    onClose,
    openLabel = '${o.openLabel}',
    inputProps,
    inputRef: inputRefProp,
    onBlur,
    onKeyDown,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const own = useId();
  const id = idProp ?? own;
  const [value, setValue] = useControlled<${o.valueType} | null>({
    controlled: valueProp,
    default: defaultValue,
    name: '${C}',
    state: 'value',
  });
  const [open, setOpen] = useControlled({
    controlled: openProp,
    default: false,
    name: '${C}',
    state: 'open',
  });
  // The words follow the value, as the locale writes it, and are the user's while typed.
${o.words
  .trim()
  .split('\n')
  .map((l) => `  ${l}`)
  .join('\n')}
  const [text, setText] = useState(words);
  useEffect(() => setText(words), [words]);
  const field = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputRef = useForkRef(inputRefProp, input);
  const choose = (next: ${o.valueType} | null) => {
    setValue(next);
    onChange?.(next);
  };
  /** The value the words are, or null where they are none. */
  const read = (typed: string): ${o.valueType} | null => {
${o.read
  .trim()
  .split('\n')
  .map((l) => `    ${l}`)
  .join('\n')}
  };
  // The words read back: cleared, no value; a value, it; anything else leaves it as it was.
  const commit = () => {
    const typed = text.trim();
    if (typed === '') {
      if (value !== null) choose(null);
      return;
    }
    const next = read(typed);
    if (next === null) return;
    if (next !== value) choose(next);
    else setText(words);
  };
  const show = () => {
    if (disabled || open) return;
    setOpen(true);
    onOpen?.();
  };
  const hide = () => {
    setOpen(false);
    onClose?.();
  };
  // Filled where it holds words: they are then the value's, not the placeholder's.
  const filled = text !== '';
  const look = { ${api.join(', ')}, filled };
  const parts = solar${C}Compose(look);
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
    // A part left empty is not drawn.
    parts: {
      ...parts,
      label: { ...parts.label, present: label != null },
      required: { ...parts.required, present: mandatory },
      helper: { ...parts.helper, present: helper != null },
    },
    text: { labelLabel: label, required: <span aria-hidden>*</span> },
    render: {
      label: (layer) => <label htmlFor={id} {...layer} />,
      // The icon is the button that opens the panel.
      ${o.icon}: (layer) => (
        <button
          type="button"
          className={layer.className}
          style={layer.style}
          aria-label={openLabel}
          aria-haspopup="${o.popup}"
          aria-expanded={open}
          disabled={disabled}
          onClick={show}
        >
          <${icon} />
        </button>
      ),
      // The field is MUI's InputBase, the button before the input, which is its words.
      field: (layer) => (
        <InputBase
          {...rest}
          ref={field}
          className={layer.className}
          style={layer.style}
          id={id}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onBlur={(event) => {
            commit();
            onBlur?.(event);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commit();
            if (event.key === 'ArrowDown') {
              event.preventDefault();
              show();
            }
            onKeyDown?.(event);
          }}
          disabled={disabled}
          error={error}
          required={mandatory}
          inputRef={inputRef}
          startAdornment={drawLayer('${o.icon}', drawing)}
          inputProps={{
            ...inputProps,
            className: ['${P}-value', inputProps?.className].filter(Boolean).join(' '),
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
  // The panel, under the field, as far from it as the helper is.
  const gap = solar${C}Styles.root.gap;
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
      sx={[solar${C}Style(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', drawing)}
      {open ? (
${o.panel
  .trim()
  .split('\n')
  .map((l) => `        ${l}`)
  .join('\n')}
      ) : null}
    </Box>
  );
});
`;
}

/**
 * A typed picker's Flutter widget: a field (`fieldFlutter`) inside an anchor that keeps its words
 * following the value, reads them back on submit and as the focus leaves, and floats the panel
 * under the field (SolarMenuAnchor), opened by the icon, a pressable, or the down arrow.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.icon the icon layer, the button that opens the panel
 * @param {string} o.about the doc comment, after the generated header
 * @param {string} o.imports more import lines
 * @param {string} o.valueType the value's Dart type, less `?` (`DateTime`)
 * @param {string} o.onChanged the name of its callback (`onDateChanged`)
 * @param {{value: string, onChanged: string}} o.docs their doc comments
 * @param {string} o.params more constructor parameters
 * @param {string} o.fields their fields, with their doc comments
 * @param {string} o.iconLabel the button's name, a Dart expression of `l`, MaterialLocalizations
 * @param {string} o.format the value `v` as the locale writes it, a Dart expression of `v` and `l`
 * @param {string} o.parse the value the words `typed` are, or null, a Dart expression of `typed`,
 *   `l` and `context`
 * @param {string} o.same whether values `a` and `b` are one, a Dart expression
 * @param {string} o.panel the panel, a Dart expression of `p` (the widget) and `choose(value)`
 */
export function typedFlutter(spec, o) {
  const name = spec.component;
  const C = pascal(name);
  const api = Object.keys(spec.api);
  const A = `_Solar${C}Anchor`;
  return (
    fieldFlutter(spec, {
      look: "the field's fill, edge and focus ring by state, its words' and icon's ink, and the label and helper",
      about: o.about,
      words: 'value',
      params: `this.label,
this.mandatory = false,
this.helper,
this.value,
this.${o.onChanged},
${o.params.trim()}`,
      fields: `/// What it asks for, above it.
final String? label;

/// Whether it must be filled, which stars the label.
final bool mandatory;

/// More about it, below; where it is in [error], what is wrong.
final String? helper;

/// ${o.docs.value}
final ${o.valueType}? value;

/// ${o.docs.onChanged}
final ValueChanged<${o.valueType}?>? ${o.onChanged};

${o.fields.trim()}`,
      name: 'label',
      hint: 'helper',
      unread: ['label', 'helper'],
      present: {
        label: 'label != null',
        required: 'mandatory',
        helper: 'helper != null',
      },
      text: "{'labelLabel': ?label, 'required': '*', 'helper': ?helper}",
      wraps: "const {'helper': TextAlign.start}",
      imports: `import 'package:flutter/services.dart';

import '../solar_menu.dart';
import '../solar_states.dart';
import '../solar_target.dart';
${o.imports.trim()}`,
      // The icon is the button that opens the panel.
      builders: `'${o.icon}': (layer) => Builder(
  builder: (context) {
    final anchor = context.findAncestorStateOfType<${A}State>()!;
    final l = MaterialLocalizations.of(context);
    return SolarTarget.inside(
      child: SolarPressable(
        onPressed: enabled ? anchor.show : null,
        builder: (_, _) => Semantics(label: ${o.iconLabel}, child: layer),
      ),
    );
  },
),`,
      textField: 'maxLines: 1,',
      around: (f) => `${A}(picker: this, field: ${f})`,
    }) +
    `
/// The words and the panel: the words follow the value, as the locale writes it, and are read back
/// as one; the panel floats under the field while open.
class ${A} extends StatefulWidget {
  const ${A}({required this.picker, required this.field});

  final Solar${C} picker;
  final Widget Function([TextEditingController? text, FocusNode? focus]) field;

  @override
  State<${A}> createState() => ${A}State();
}

class ${A}State extends State<${A}> {
  final _menu = MenuController();
  TextEditingController? _ownText;
  FocusNode? _ownFocus;
  TextEditingController get _text =>
      widget.picker.controller ?? (_ownText ??= TextEditingController());
  FocusNode get _focus => widget.picker.focusNode ?? (_ownFocus ??= FocusNode());
  bool _started = false;

  @override
  void initState() {
    super.initState();
    _focus.addListener(_left);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_started) {
      _started = true;
      _show(widget.picker.value);
    }
  }

  @override
  void didUpdateWidget(${A} old) {
    super.didUpdateWidget(old);
    if (old.picker.focusNode != widget.picker.focusNode) {
      (old.picker.focusNode ?? _ownFocus)?.removeListener(_left);
      _focus.addListener(_left);
    }
    if (old.picker.value != widget.picker.value) _show(widget.picker.value);
  }

  @override
  void dispose() {
    _focus.removeListener(_left);
    _ownText?.dispose();
    _ownFocus?.dispose();
    super.dispose();
  }

  /// The words of [v], as the locale writes it.
  void _show(${o.valueType}? v) {
    final l = MaterialLocalizations.of(context);
    final words = v == null ? '' : ${o.format};
    if (_text.text != words) _text.text = words;
  }

  /// The words read back: cleared, no value; a value, it; anything else leaves it as it was.
  void _commit() {
    final l = MaterialLocalizations.of(context);
    final typed = _text.text.trim();
    final value = widget.picker.value;
    if (typed.isEmpty) {
      if (value != null) widget.picker.${o.onChanged}?.call(null);
      return;
    }
    final next = ${o.parse};
    if (next == null) return;
    final a = next, b = value;
    if (b == null || !(${o.same})) {
      widget.picker.${o.onChanged}?.call(next);
    } else {
      _show(value);
    }
  }

  void _left() {
    if (!_focus.hasFocus && !_menu.isOpen) _commit();
  }

  /// Opens the panel.
  void show() {
    if (!widget.picker.disabled) _menu.open();
  }

  /// Takes [value] from the panel, closes it, and gives the field its focus back.
  void choose(${o.valueType} value) {
    widget.picker.${o.onChanged}?.call(value);
    _menu.close();
    _focus.requestFocus();
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.picker;
    // Under the field, as far from it as the helper is.
    final gap =
        Solar${C}Recipe.dimension(
          'root.gap',
          Solar${C}Props(${api.map((a) => `${a}: p.${a}`).join(', ')}),
          const {},
        ) ??
        0;
    return SolarMenuAnchor(
      controller: _menu,
      menu: Padding(
        padding: EdgeInsets.only(top: gap),
        child: ${o.panel.trim().split('\n').join('\n        ')},
      ),
      builder: (context, _) => CallbackShortcuts(
        bindings: {const SingleActivator(LogicalKeyboardKey.arrowDown): show},
        child: widget.field(_text, _focus),
      ),
    );
  }
}
`
  );
}
