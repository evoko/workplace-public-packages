/**
 * What SOLAR's pickers share (Select, Dropdown): a field, with its label above and its helper
 * below, that opens a panel of Dropdown Items under it and shows the one chosen. MUI's Select on
 * the web, on InputBase as the field, its menu kept in the component (`disablePortal`) so the
 * recipe reaches it: drawn as the picker's own panel layer where Figma draws one (Select's), and
 * otherwise as a Dropdown Menu (Dropdown's). In Flutter, a drawn field, pressable, and the panel
 * floated under it by SolarMenuAnchor, as wide as the field.
 */

import { camel, pascal } from '../util/naming.mjs';
import {
  dartFile,
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
} from './drawn.mjs';
import { dartField, dartParam } from './helpers.mjs';
import { targetArea } from './target.mjs';

/** A chevron layer's SOLAR icon, from the component Figma draws in it (`Icon/ChevronDown`). */
function chevronIcon(spec, layer) {
  const keyword = spec.style[layer]?.base?.component?.keyword ?? '';
  if (!keyword.startsWith('Icon/'))
    throw new Error(`${spec.component} ${layer}: draws no icon`);
  const icon = keyword.slice('Icon/'.length);
  return {
    react: `Icon${pascal(icon)}`,
    dart: `SolarIcons.${camel(icon)}Outline`,
  };
}

/**
 * A picker's resets: a drawn component's, the combobox as the field's words (MUI's own padding,
 * height and room for its icon give way to the recipe's), MUI's icon as the chevron in the field's
 * row, the menu's paper as the panel (none of MUI's own look), a caller's icons filling their
 * slots, the helper wrapping, and a 44 × 44 target around the field.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string} o.value the text layer that shows the choice
 * @param {string} o.chevron the chevron's layer
 * @param {string|null} [o.panel] the panel's layer, where Figma draws one
 * @param {string[]} [o.icons] the icon slots a caller fills
 */
export function pickerResets(
  name,
  { value, chevron, panel = null, icons = [] },
) {
  const P = `Solar${pascal(name)}`;
  return drawnResets(name, {
    [`& .${P}-field`]: { cursor: 'pointer' },
    // The combobox holds the field's parts, in its row, spaced as the field is; as specific as
    // MUI's own rule, which gives it room for an icon it no longer draws.
    [`& .${P}-field .MuiSelect-select.MuiSelect-select.MuiSelect-select`]: {
      display: 'flex',
      alignItems: 'center',
      gap: 'inherit',
      flex: '1 1 0%',
      minWidth: '0',
      height: 'auto',
      minHeight: '0',
      padding: '0',
    },
    // The choice's words take what the icons leave, cut short where they run out.
    [`& .${P}-${value}`]: {
      flex: '1 1 0%',
      minWidth: '0',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    [[`& .${P}-${chevron}`, ...icons.map((i) => `& .${P}-${i}`)].join(', ')]: {
      flexShrink: '0',
    },
    [[
      `& .${P}-${chevron} > svg`,
      ...icons.map((i) => `& .${P}-${i} > svg`),
    ].join(', ')]: {
      display: 'block',
      width: '100%',
      height: '100%',
    },
    ...(panel
      ? {
          [`& .${P}-${panel}.MuiPaper-root`]: {
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            backgroundImage: 'none',
          },
        }
      : {}),
    [`& .${P}-helper`]: { whiteSpace: 'normal' },
    ...targetArea(`& .${P}-field`, { under: true }),
  });
}

/**
 * A picker's React shell.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment
 * @param {string} o.value the text layer that shows the choice
 * @param {string} o.chevron the chevron's layer; `chevronOpen`, where Figma swaps it while open
 * @param {string} [o.chevronOpen] the open chevron's layer (Dropdown's up chevron)
 * @param {string|null} [o.panel] the panel's layer, where Figma draws one; otherwise a Dropdown
 *   Menu's surface
 * @param {string[]} [o.icons] the icon slots a caller fills, by layer
 */
export function pickerReact(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const S = `Solar${P}`;
  const api = Object.keys(spec.api);
  const icons = o.icons ?? [];
  const chevrons = [o.chevron, o.chevronOpen].filter(Boolean);
  const react = [
    ...new Set(chevrons.map((c) => chevronIcon(spec, c).react)),
  ].sort();
  const iconOf = (layer) => chevronIcon(spec, layer).react;
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
  const iconProps = icons
    .map(
      (i) =>
        `/** An icon ${i.startsWith('leading') ? 'before' : 'after'} the choice. */\n  ${i}?: ReactNode;`,
    )
    .join('\n  ');
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${o.about.trim()} The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import MuiSelect, {
  type SelectChangeEvent,
  type SelectProps as MuiSelectProps,
} from '@mui/material/Select';
import { useControlled } from '@mui/material/utils';
import { ${react.join(', ')} } from '@bwp-web/assets';
import { Children, forwardRef, isValidElement, useId, type ReactNode } from 'react';
import {
  solar${P}Compose,
  solar${P}Style,${o.panel ? '' : '\n  solarDropdownMenuStyle,'}
  type Solar${P}Props,
} from '@bwp-web/styles/mui';
import { DropdownMenuSizeContext } from './DropdownMenu.js';
import { drawChildren, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

/** MUI's own icon, which the field draws as its chevron layer instead. */
const NoIcon = () => null;

export interface ${P}Props
  extends Solar${P}Props,
    Omit<
      MuiSelectProps<string>,
      | keyof Solar${P}Props
      | 'size'
      | 'variant'
      | 'color'
      | 'input'
      | 'label'
      | 'multiple'
      | 'native'
      | 'autoWidth'
      | 'IconComponent'
      | 'renderValue'
      | 'displayEmpty'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'children'
      | 'ref'
    > {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether a choice must be made, which stars the label. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** What the field says before a choice is made. */
  placeholder?: ReactNode;
  /** The chosen row's \`value\`, where the caller keeps it; '' for none. */
  value?: string;
  /** The choice it starts with, where \`value\` does not say. */
  defaultValue?: string;
  /** Called with the row chosen's \`value\`. */
  onChange?: (event: SelectChangeEvent<string>, value: string) => void;
  /** The rows: DropdownItems, each with a \`value\`. */
  children: ReactNode;${iconProps ? `\n  ${iconProps}` : ''}
}

export const ${P} = forwardRef<HTMLDivElement, ${P}Props>(function ${P}(
  {
    ${api.map((a) => (a === 'open' ? 'open: openProp' : a === 'disabled' || a === 'error' ? `${a} = false` : a)).join(',\n    ')},
    label,
    mandatory = false,
    helper,
    placeholder,${icons.map((i) => `\n    ${i},`).join('')}
    value: valueProp,
    defaultValue,
    onChange,
    onOpen,
    onClose,
    children,
    id: idProp,
    MenuProps,
    className,
    style,
    sx,
    ...rest
  },
  ref,
) {
  const own = useId();
  const id = idProp ?? own;
  const [value, setValue] = useControlled<string>({
    controlled: valueProp,
    default: defaultValue ?? '',
    name: '${P}',
    state: 'value',
  });
  const [open, setOpen] = useControlled<boolean>({
    controlled: openProp,
    default: false,
    name: '${P}',
    state: 'open',
  });
  const look = { ${api.join(', ')} };
  // What shows depends on whether it is open (Dropdown's chevron turns up).
  const parts = solar${P}Compose(look, open ? 'open' : 'default');
  // The chosen row's words, or the placeholder.
  const chosen = Children.toArray(children).find(
    (row) =>
      isValidElement<{ value?: unknown }>(row) && row.props.value === value,
  );
  const words = isValidElement<{ children?: ReactNode }>(chosen)
    ? chosen.props.children
    : placeholder;
  const drawing: LayerDrawing = {
    prefix: '${S}',
    tree: TREE,
    // A part left empty is not drawn; the panel is MUI's menu, drawn below.
    parts: {
      ...parts,
      label: { ...parts.label, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      helper: { ...parts.helper, present: helper != null },${icons.map((i) => `\n      ${i}: { ...parts.${i}, present: ${i} != null },`).join('')}${o.panel ? `\n      ${o.panel}: { ...parts.${o.panel}, present: false },` : ''}
    },
    text: {
      labelLabel: label,
      mandatory: <span aria-hidden>*</span>,
      ${o.value}: words,
    },
    icons: {
${chevrons.map((c) => `      ${c}: <${iconOf(c)} />,`).join('\n')}${icons.map((i) => `\n      ${i}: <span>{${i}}</span>,`).join('')}
    },
    render: {
      label: (layer) => <label id={\`\${id}-label\`} htmlFor={id} {...layer} />,
      // The field is MUI's InputBase around its Select, the combobox the choice's words are in.
      // Its rows take its size, as a Dropdown Menu's do.
      field: (layer) => (
        <DropdownMenuSizeContext.Provider value={size ?? 'md'}>
        <MuiSelect
          {...rest}
          input={<InputBase className={layer.className} style={layer.style} />}
          id={id}
          labelId={label != null ? \`\${id}-label\` : undefined}
          value={value}
          displayEmpty
          // The combobox draws the field's parts, as Figma nests them: the choice's words and the
          // chevron, which is no icon of MUI's.
          renderValue={() => drawChildren('field', drawing)}
          IconComponent={NoIcon}
          open={open}
          onOpen={(event) => {
            setOpen(true);
            onOpen?.(event);
          }}
          onClose={(event) => {
            setOpen(false);
            onClose?.(event);
          }}
          onChange={(event) => {
            setValue(event.target.value);
            onChange?.(event, event.target.value);
          }}
          disabled={disabled}
          error={error}
          SelectDisplayProps={{
            'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
          }}
          MenuProps={{
            ...MenuProps,
            // In the component, so the recipe reaches the panel.
            disablePortal: true,
            slotProps: {
              ...MenuProps?.slotProps,
              paper: {
                className: ${o.panel ? `'${S}-${o.panel} ${S}-box'` : `'SolarDropdownMenu'`},${o.panel ? '' : `\n                sx: solarDropdownMenuStyle({ size }),`}
              },
              list: { disablePadding: true },
            },
          }}
        >
          {children}
        </MuiSelect>
        </DropdownMenuSizeContext.Provider>
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
          open ? '${S}-open' : null,
          error ? '${S}-error' : null,
          disabled ? '${S}-disabled' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      style={style}
      sx={[solar${P}Style(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', drawing)}
    </Box>
  );
});
`;
}

/**
 * A picker's Flutter widget: generic in its options' value, a StatefulWidget holding its panel's
 * MenuController and its field's states.
 *
 * @param {object} spec the IR
 * @param {object} o as pickerReact's
 */
export function pickerFlutter(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const R = `Solar${P}Recipe`;
  const api = Object.entries(spec.api);
  const icons = o.icons ?? [];
  const chevrons = [o.chevron, o.chevronOpen].filter(Boolean);
  const tree = Object.entries(treeOf(spec))
    .map(
      ([parent, kids]) =>
        `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
    )
    .join('\n');
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [${R}]: ${o.look}, read cell by cell.`;
  const recipe = (states, present, props = 'p') => `SolarLayerRecipe(
        lookup: (c) => ${R}.lookup(c, ${props}, ${states}),
        dimension: (c) => ${R}.dimension(c, ${props}, ${states}),
        color: (c) => ${R}.color(t, c, ${props}, ${states}),
        shadow: (c) => ${R}.shadow(t, c, ${props}, ${states}),
        textStyle: (c) => ${R}.textStyle(t, c, ${props}, ${states}),
        present: ${present},
        glyph: (_) => null,
      )`;
  const presentField = `(l) => switch (l) {
          'label' || 'labelLabel' => w.label != null,
          'mandatory' => w.mandatory,
          'helper' => w.helper != null,${icons.map((i) => `\n          '${i}' => w.${i} != null,`).join('')}${o.panel ? `\n          '${o.panel}' => false,` : ''}
          _ => ${R}.present(l, p, states),
        }`;
  const panel = o.panel
    ? `SolarLayers(
      // Drawn while open alone, so read as open: Figma draws the panel in the open variants.
      recipe: ${recipe('const <WidgetState>{}', `(l) => ${R}.present(l, shown, const <WidgetState>{})`, 'shown')},
      tree: _tree,
      keyPrefix: '${keyPrefixOf(name)}',
      content: {
        '${o.panel}': [SolarMenuList(size: w.size.name, children: rows)],
      },
    ).layer('${o.panel}')`
    : `SolarDropdownMenu(
      size: SolarDropdownMenuSize.values.byName(w.size.name),
      children: rows,
    )`;
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(o.about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/${dartFile(name)}';${o.panel ? '' : "\nimport '../generated/components/dropdown_menu.dart';"}
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import '../solar_states.dart';
import 'solar_dropdown_item.dart';${o.panel ? '' : "\nimport 'solar_dropdown_menu.dart';"}
import 'solar_theme_of.dart';

/// One row of a Solar${P}: the value it stands for, and its words.
class Solar${P}Option<T> {
  const Solar${P}Option({
    required this.value,
    required this.label,
    this.helper,
    this.icon,
    this.disabled = false,
    this.key,
  });

  /// The value it stands for, which the picker's value is where it is chosen.
  final T value;

  /// Its words, which the field shows once it is chosen.
  final String label;

  /// A second line under its words.
  final String? helper;

  /// An icon before its words.
  final Widget? icon;

  final bool disabled;

  /// The row's key, where the caller keys it.
  final Key? key;
}

class Solar${P}<T> extends StatefulWidget {
  const Solar${P}({
    super.key,
${api.map(([prop, def]) => `    ${dartParam(P, prop, def)},`).join('\n')}
    required this.options,
    this.value,
    this.onChanged,
    this.label,
    this.mandatory = false,
    this.helper,
    this.placeholder,${icons.map((i) => `\n    this.${i},`).join('')}
    this.statesController,
  });

${api.map(([prop, def]) => dartField(P, prop, def)).join('\n')}

  /// Its rows, in order.
  final List<Solar${P}Option<T>> options;

  /// The chosen row's value; null for none.
  final T? value;

  /// Called with the row chosen's value; null disables it.
  final ValueChanged<T>? onChanged;

  /// What it asks for, above it.
  final String? label;

  /// Whether a choice must be made, which stars the label.
  final bool mandatory;

  /// More about it, below; where it is in [error], what is wrong.
  final String? helper;

  /// What the field says before a choice is made.
  final String? placeholder;
${icons.map((i) => `\n  /// An icon ${i.startsWith('leading') ? 'before' : 'after'} the choice.\n  final Widget? ${i};\n`).join('')}
  /// The field's states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  @override
  State<Solar${P}<T>> createState() => _Solar${P}State<T>();
}

class _Solar${P}State<T> extends State<Solar${P}<T>> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  final _menu = MenuController();
  final _field = GlobalKey();
  WidgetStatesController? _own;
  var _open = false;
  var _width = 0.0;

  WidgetStatesController get _states =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  bool get _enabled => !widget.disabled && widget.onChanged != null;

  @override
  void initState() {
    super.initState();
    // Open as it is first built, where it is asked to be.
    if (widget.open) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) _show();
      });
    }
  }

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  void _show() {
    _width = _field.currentContext?.size?.width ?? 0;
    _menu.open();
  }

  void _toggle() => _menu.isOpen ? _menu.close() : _show();

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = Solar${P}Props(
${api.map(([prop]) => `      ${prop}: ${prop === 'open' ? '_open' : prop === 'disabled' ? 'w.disabled || w.onChanged == null' : `w.${prop}`},`).join('\n')}
    );
${
  o.panel
    ? `    final shown = Solar${P}Props(
${api.map(([prop]) => `      ${prop}: ${prop === 'open' ? 'true' : prop === 'disabled' ? 'w.disabled || w.onChanged == null' : `w.${prop}`},`).join('\n')}
    );
`
    : ''
}    final chosen = [
      for (final option in w.options)
        if (option.value == w.value) option,
    ].firstOrNull;
    final rows = [
      for (final option in w.options)
        KeyedSubtree(
          key: option.key,
          child: SolarDropdownItem(
            label: option.label,
            helper: option.helper,
            icon: option.icon,
            disabled: option.disabled,
            selected: option.value == w.value,
            onPressed: () {
              _menu.close();
              w.onChanged?.call(option.value);
            },
          ),
        ),
    ];
    return SolarMenuAnchor(
      controller: _menu,
      onOpen: () => setState(() => _open = true),
      onClose: () => setState(() => _open = false),
      // As wide as the field, as Figma draws it.
      menu: ConstrainedBox(
        constraints: BoxConstraints(minWidth: _width),
        child: ${panel.replace(/\n/g, '\n        ')},
      ),
      builder: (context, _) => ListenableBuilder(
        listenable: _states,
        builder: (context, _) {
          final states = {..._states.value};
          return SolarLayers(
            recipe: ${recipe('states', presentField)},
            tree: _tree,
            keyPrefix: '${keyPrefixOf(name)}',
            text: {
              'labelLabel': ?w.label,
              'mandatory': '*',
              'helper': ?w.helper,
              '${o.value}': chosen?.label ?? w.placeholder ?? '',
            },
            icons: const {${chevrons.map((c) => `'${c}': ${chevronIcon(spec, c).dart}`).join(', ')}},${icons.length ? `\n            slots: {${icons.map((i) => `'${i}': ?w.${i}`).join(', ')}},` : ''}
            // The field is the control: a tap, Enter, Space or the down arrow opens the panel. It is
            // read as a button named by the label, its value the choice.
            builders: {
              // The label and helper are read with the field, as its name and hint, not again.
              'label': (layer) => ExcludeSemantics(child: layer),
              'helper': (layer) => ExcludeSemantics(child: layer),
              'field': (field) => KeyedSubtree(
                key: _field,
                child: Semantics(
                  label: w.label ?? w.placeholder,
                  value: chosen?.label,
                  hint: w.helper,
                  expanded: _open,
                  child: CallbackShortcuts(
                    bindings: {
                      const SingleActivator(LogicalKeyboardKey.arrowDown): () {
                        if (_enabled && !_menu.isOpen) _show();
                      },
                    },
                    child: SolarPressable(
                      onPressed: _enabled ? _toggle : null,
                      statesController: _states,
                      target: true,
                      // Its words are its value, read as such, not again as its name.
                      builder: (_, _) => ExcludeSemantics(child: field),
                    ),
                  ),
                ),
              ),
            },
          ).layer('root');
        },
      ),
    );
  }
}
`;
}
