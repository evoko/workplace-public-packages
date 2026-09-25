/**
 * SOLAR Autocomplete, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A field (`src/shells/field.mjs`) that suggests options as the user types: MUI's useAutocomplete
 * over Text Input's field on the web, RawAutocomplete in Flutter; the suggestions a Dropdown Menu
 * floated under the field by Autocomplete Open's gap, which is its open look (owner decision
 * 2026-09-24).
 */

import { treeOf, treeConsts } from '../shells/drawn.mjs';
import { fieldFlutter, fieldResets, fieldStates } from '../shells/field.mjs';

const P = 'SolarAutocomplete';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  if (tree.field?.join() !== 'leadingIcon,search,trailingIcon')
    throw new Error(`Autocomplete: the field holds ${tree.field?.join(', ')}`);
  if (spec.derived?.filled?.type !== 'boolean')
    throw new Error('Autocomplete: its filled is not derived from its words');
};

export default {
  name: 'Autocomplete',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase, and its words the InputBase's input.
    slots: 'drawn',
    resets: fieldResets('Autocomplete', {
      input: 'search',
      icons: ['leadingIcon', 'trailingIcon'],
    }),
    // Hovered and focused as the field is; filled, in error and disabled by the props, as classes.
    states: fieldStates('Autocomplete', ['filled', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'label',
    // Its words, typed or the caller's, are its controller's.
    flutter: { value: 'controller', inputValue: 'controller' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Autocomplete.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarAutocompleteStyle\` and \`solarAutocompleteCompose\` in \`@bwp-web/styles/mui\`:
 * the field's fill, edge and focus ring by state, its words' and icons' ink, and the label and
 * helper; open, Autocomplete Open's gap between the field and its suggestions.
 *
 * A field that suggests matching \`options\` as the user types, for a large list or a search with
 * hints (for about eight or fewer fixed choices, a Select): its \`label\` above (a \`mandatory\` one
 * is starred), its \`helper\` below, which says what is wrong where it is in \`error\`, and an icon
 * either side (a search icon before, SOLAR says; a clear button after, once there is text). It is
 * MUI's useAutocomplete over MUI's InputBase: the suggestions are a DropdownMenu of DropdownItems
 * under the field, which the input keeps the focus for, the arrow keys moving the highlight, Enter
 * choosing and Escape closing; with none, \`noOptionsText\`. Every useAutocomplete prop reaches it
 * (\`value\`, \`onChange\`, \`inputValue\`, \`onInputChange\`, \`getOptionLabel\`, \`freeSolo\`,
 * \`filterOptions\`, \`open\`). It is drawn filled while it holds words. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import { type MenuListProps } from '@mui/material/MenuList';
import useAutocomplete, {
  type UseAutocompleteProps,
} from '@mui/material/useAutocomplete';
import {
  forwardRef,
  useId,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {
  solarAutocompleteCompose,
  solarAutocompleteOpenStyles,
  solarAutocompleteStyle,
  type SolarAutocompleteProps,
} from '@bwp-web/styles/mui';
import { DropdownItem } from './DropdownItem.js';
import { DropdownMenu, type DropdownMenuProps } from './DropdownMenu.js';
import { drawChildren, drawLayer, type LayerDrawing } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

/** An option's words, as MUI's Autocomplete reads them: its \`label\`, or itself. */
const labelOf = (option: unknown) =>
  typeof option === 'object' && option !== null && 'label' in option
    ? String((option as { label: unknown }).label)
    : String(option);

export interface AutocompleteProps<T>
  extends SolarAutocompleteProps,
    Omit<
      UseAutocompleteProps<T, false, false, boolean>,
      'multiple' | 'disableClearable' | 'componentName' | 'disabled'
    > {
  /** What it asks for, above it. */
  label?: ReactNode;
  /** Whether it must be filled, which stars the label. */
  mandatory?: boolean;
  /** More about it, below; where it is in \`error\`, what is wrong. */
  helper?: ReactNode;
  /** What it shows while empty, in its words' place. */
  placeholder?: string;
  /** An icon before the words: a search icon, SOLAR says. */
  leadingIcon?: ReactNode;
  /** An icon after the words, or a small control (a clear button, once there is text). */
  trailingIcon?: ReactNode;
  /** What the suggestions say where none match. */
  noOptionsText?: ReactNode;
  /** More of the suggestions' DropdownMenu's props. */
  menuProps?: Partial<DropdownMenuProps>;
  className?: string;
  style?: CSSProperties;
}

export const Autocomplete = forwardRef(function Autocomplete<T>(
  {
    ${api.join(',\n    ')},
    label,
    mandatory = false,
    helper,
    placeholder,
    leadingIcon,
    trailingIcon,
    noOptionsText = 'No matches',
    menuProps,
    id: idProp,
    getOptionLabel = labelOf,
    inputValue: words,
    className,
    style,
    ...rest
  }: AutocompleteProps<T>,
  ref: Ref<HTMLDivElement>,
) {
  const own = useId();
  const id = idProp ?? own;
  // A data- attribute is the root element's (a case marks it with its layer); the rest the hook's.
  const data = Object.fromEntries(
    Object.entries(rest).filter(([key]) => key.startsWith('data-')),
  );
  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    popupOpen,
    anchorEl,
    setAnchorEl,
    inputValue,
  } = useAutocomplete<T, false, false, boolean>({
    ...rest,
    // The words, where the caller keeps them: filled follows from them.
    inputValue: words,
    id,
    disabled,
    getOptionLabel,
    componentName: 'SolarAutocomplete',
  });
  // Filled where it holds words: they are then drawn as typed, not as the placeholder.
  const filled = inputValue !== '';
  const look = { ${api.join(', ')}, filled };
  const parts = solarAutocompleteCompose(look);
  const drawing: LayerDrawing = {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
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
      field: (layer) => {
        const input = getInputProps();
        // The root's handlers: a press anywhere in the field focuses its input.
        const root = getRootProps();
        return (
          <InputBase
            slotProps={{
              root: {
                onMouseDown: root.onMouseDown,
                onKeyDown: root.onKeyDown,
                onClick: root.onClick,
              },
            }}
            ref={setAnchorEl}
            className={layer.className}
            style={layer.style}
            disabled={disabled}
            error={error}
            required={mandatory}
            placeholder={placeholder}
            startAdornment={drawLayer('leadingIcon', drawing)}
            endAdornment={drawLayer('trailingIcon', drawing)}
            inputProps={{
              ...input,
              className: '${P}--search',
              'aria-describedby': helper != null ? \`\${id}-helper\` : undefined,
            }}
          />
        );
      },
      helper: (layer) => (
        <span id={\`\${id}-helper\`} className={layer.className} style={layer.style}>
          {helper}
        </span>
      ),
    },
  };
  const rows = groupedOptions as T[];
  return (
    <Box
      ref={ref}
      {...data}
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
      sx={solarAutocompleteStyle(look)}
    >
      {drawChildren('root', drawing)}
      {/* The suggestions, under the field by Autocomplete Open's gap, as wide as the field, which
          keeps the focus. */}
      <DropdownMenu
        size={size}
        anchorEl={anchorEl}
        open={popupOpen}
        keepFocus
        {...menuProps}
        listProps={getListboxProps() as MenuListProps}
        sx={{
          marginTop: solarAutocompleteOpenStyles.root.gap,
          minWidth: anchorEl?.clientWidth,
        }}
      >
        {rows.length > 0 ? (
          rows.map((option, index) => {
            const { key, ...props } = getOptionProps({ option, index });
            return (
              <DropdownItem key={key} {...props} selected={props['aria-selected'] === true}>
                {getOptionLabel(option)}
              </DropdownItem>
            );
          })
        ) : (
          <DropdownItem disabled role="option">
            {noOptionsText}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Box>
  );
}) as <T>(props: AutocompleteProps<T> & { ref?: Ref<HTMLDivElement> }) => ReactElement;
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return fieldFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, its words' and icons' ink, and the label and helper",
        about: `A field that suggests matching [options] as the user types, for a large list or a search with hints (for about eight or fewer fixed choices, a SolarSelect): its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], and an icon either side (a search icon before, SOLAR says; a clear button after, once there is text). Built on RawAutocomplete: the suggestions are a SolarDropdownMenu of SolarDropdownItems under the field, by Autocomplete Open's gap, which the words keep the focus for, the arrow keys moving the highlight and Enter choosing; [onSelected] is told the option chosen. Give it both a [controller] and a [focusNode], or neither. It is drawn filled while it holds words.`,
        typeParams: '<T extends Object>',
        words: 'search',
        params: `required this.options,
this.onSelected,
this.displayStringForOption = RawAutocomplete.defaultStringForOption,
this.label,
this.mandatory = false,
this.helper,
this.leadingIcon,
this.trailingIcon,`,
        fields: `/// Every option, of which those the words match are suggested.
final List<T> options;

/// Called with the option chosen.
final ValueChanged<T>? onSelected;

/// An option's words, which the suggestions show and the field takes once it is chosen.
final String Function(T option) displayStringForOption;

/// What it asks for, above it.
final String? label;

/// Whether it must be filled, which stars the label.
final bool mandatory;

/// More about it, below; where it is in [error], what is wrong.
final String? helper;

/// An icon before the words: a search icon, SOLAR says.
final Widget? leadingIcon;

/// An icon after the words, or a small control (a clear button, once there is text).
final Widget? trailingIcon;`,
        around: (field) => `RawAutocomplete<T>(
      textEditingController: controller,
      focusNode: focusNode,
      displayStringForOption: displayStringForOption,
      // The options whose words hold what is typed, none where nothing is.
      optionsBuilder: (value) {
        final words = value.text.toLowerCase();
        if (words.isEmpty) return const Iterable.empty();
        return options.where(
          (o) => displayStringForOption(o).toLowerCase().contains(words),
        );
      },
      onSelected: onSelected,
      fieldViewBuilder: (context, text, focus, _) => ${field}(text, focus),
      // Under the field by Autocomplete Open's gap, as wide as it, the highlighted row drawn hovered.
      optionsViewBuilder: (context, onSelected, matches) {
        final highlighted = AutocompleteHighlightedOption.of(context);
        final gap =
            SolarAutocompleteOpenRecipe.dimension(
              'root.gap',
              const SolarAutocompleteOpenProps(),
              const {},
            ) ??
            0;
        return Align(
          alignment: AlignmentDirectional.topStart,
          child: Padding(
            padding: EdgeInsets.only(top: gap),
            child: SolarDropdownMenu(
              size: SolarDropdownMenuSize.values.byName(size.name),
              children: [
                for (final (i, option) in matches.indexed)
                  SolarDropdownItem(
                    label: displayStringForOption(option),
                    statesController: i == highlighted
                        ? (WidgetStatesController({WidgetState.hovered}))
                        : null,
                    onPressed: () => onSelected(option),
                  ),
              ],
            ),
          ),
        );
      },
    )`,
        name: 'label',
        hint: 'helper',
        unread: ['label', 'labelLabel', 'mandatory', 'helper'],
        present: {
          label: 'label != null',
          labelLabel: 'label != null',
          mandatory: 'mandatory',
          leadingIcon: 'leadingIcon != null',
          trailingIcon: 'trailingIcon != null',
          helper: 'helper != null',
        },
        text: "{'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper}",
        slots: "{'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon}",
        wraps: "const {'helper': TextAlign.start}",
        imports: `import '../generated/components/autocomplete_open.dart';
import '../generated/components/dropdown_menu.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';`,
      });
    },
  },
};
