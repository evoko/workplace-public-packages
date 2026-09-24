/**
 * What SOLAR's fields share (Text Input, Text Area and the rest of F5): a drawn component whose
 * field is MUI's InputBase on the web, its words the InputBase's input, with the label above and
 * the helper below drawn beside it. Hovered and focused as the field is; disabled, in error, filled
 * and the rest by the shell's classes, `Solar<Name>-<prop>`.
 */

import { pascal } from '../util/naming.mjs';
import {
  dartFile,
  drawnResets,
  iconsOf,
  irFile,
  keyPrefixOf,
  treeOf,
  wrapDoc,
} from './drawn.mjs';
import { dartField, dartParam } from './helpers.mjs';
import { targetArea } from './target.mjs';

/**
 * The resets of a field's recipe: a drawn component's, and the input as the field's words (MUI's
 * own padding, height and placeholder tint give way to the recipe's, and it takes the room its
 * icons leave), a caller's icons filling their slots, the helpers wrapping, and a 44 × 44 target
 * around the field under its words.
 *
 * @param {string} name the component
 * @param {object} o
 * @param {string} o.input the layer that is the input (Text Input's `fieldLabel`)
 * @param {string|null} [o.field] the layer that is the field, `field` by default, or null where
 *   the root is (SearchField)
 * @param {string[]} [o.icons] the icon slots a caller fills
 * @param {string[]} [o.wraps] the texts that wrap onto more lines, `helper` by default
 * @param {object} [o.more] more resets
 */
export function fieldResets(
  name,
  { input, field = 'field', icons = [], wraps = ['helper'], more = {} },
) {
  const P = `Solar${pascal(name)}`;
  return drawnResets(name, {
    // Through MUI's class, as specific as MUI's disabled rule, whose ink it replaces.
    [`& .${P}-${input}.MuiInputBase-input`]: {
      flex: '1 1 0%',
      minWidth: '0',
      width: 'auto',
      height: 'auto',
      padding: '0',
      boxSizing: 'border-box',
      WebkitTextFillColor: 'currentcolor',
      '&::placeholder': { color: 'inherit', opacity: '1' },
    },
    ...(icons.length
      ? {
          [icons.map((i) => `& .${P}-${i} > svg`).join(', ')]: {
            display: 'block',
            width: '100%',
            height: '100%',
          },
        }
      : {}),
    ...(wraps.length
      ? {
          [wraps.map((w) => `& .${P}-${w}`).join(', ')]: {
            whiteSpace: 'normal',
          },
        }
      : {}),
    ...targetArea(field ? `& .${P}-${field}` : '&', { under: true }),
    ...more,
  });
}

/**
 * A field's state table: hovered and focused as the field is (MUI marks the focused InputBase),
 * the root itself where `field` is null (SearchField), and each of `props`, a state value the
 * shell marks with a class, weakest first.
 */
export function fieldStates(name, props, { field = 'field' } = {}) {
  const P = `Solar${pascal(name)}`;
  return {
    default: null,
    hover: field ? `&:has(.${P}-${field}:hover)` : '&:hover',
    focus: field ? `&:has(.${P}-${field}.Mui-focused)` : '&.Mui-focused',
    ...Object.fromEntries(props.map((p) => [p, `&.${P}-${p}`])),
  };
}

/**
 * A field's Flutter widget: a StatelessWidget over [SolarField], which holds its words' controller
 * and focus and its states, drawing Figma's layer tree with [SolarLayers], its words a TextField
 * undecorated in the recipe's style, read as one text field named by its label and described by
 * its helper, and its field hovered as a whole and focusing the words on a tap anywhere in it.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment
 * @param {string} o.words the layer that is the words (Text Input's `fieldLabel`)
 * @param {string} [o.field] the layer that is the field, `field` by default
 * @param {string} [o.params] constructor parameters beyond the IR's and the field's own
 * @param {string} [o.fields] their fields, with their doc comments
 * @param {string} [o.name] the words' name, a Dart expression (`label`), for a screen reader
 * @param {string} [o.hint] what describes them, a Dart expression (`helper`)
 * @param {string[]} [o.unread] the layers read with the words, left unread beside them
 * @param {Record<string, string>} [o.present] whether a layer is drawn, an expression by layer
 * @param {string} [o.text] the text layers' words, a map literal
 * @param {string} [o.slots] the slots the caller fills, a map literal
 * @param {string} [o.wraps] the texts that wrap, a map literal
 * @param {string} [o.values] more of the props the recipe reads, beyond the IR's and `filled`
 * @param {string} [o.icons] the SOLAR icons its layers draw, a map literal, where they depend on
 *   the field (Password Input's eye); Figma's own, from the IR, otherwise
 * @param {string} [o.builders] more of what the shell wraps a layer in, map entries
 * @param {boolean} [o.obscured] its words start hidden, as a password's are (SolarField's)
 * @param {string} [o.imports] more import lines
 * @param {string} [o.textField] the TextField's arguments beyond the field's own
 * @param {string} [o.prelude] statements in the builder, before the layers
 */
export function fieldFlutter(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const R = `Solar${P}Recipe`;
  const api = Object.entries(spec.api);
  const field = o.field ?? 'field';
  const indent = (text, n) =>
    text
      .trim()
      .split('\n')
      .map((l) => (l ? ' '.repeat(n) + l : l))
      .join('\n');
  const tree = Object.entries(treeOf(spec))
    .map(
      ([parent, kids]) =>
        `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
    )
    .join('\n');
  const icons = iconsOf(spec);
  const present = Object.entries(o.present ?? {});
  const header = `Scaffolded once by \`npm run solar:scaffold -- --flutter ${name.includes(' ') ? `"${name}"` : name}\` from spec/components/${irFile(name)}, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, [${R}]: ${o.look}, read cell by cell.`;
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(o.about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/${dartFile(name)}';
${icons.length ? "import '../generated/icons.dart';\n" : ''}import '../solar_field.dart';
import '../solar_layers.dart';
${o.imports ? `${o.imports.trim()}\n` : ''}import 'solar_theme_of.dart';

class Solar${P} extends StatelessWidget {
  const Solar${P}({
    super.key,
${api.map(([prop, def]) => `    ${dartParam(P, prop, def)},`).join('\n')}
${o.params ? `${indent(o.params, 4)}\n` : ''}    this.controller,
    this.placeholder,
    this.onChanged,
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  });

${api.map(([prop, def]) => dartField(P, prop, def)).join('\n')}
${o.fields ? `\n${indent(o.fields, 2)}\n` : ''}
  /// Its words, where the caller keeps them; one of its own, empty, otherwise.
  final TextEditingController? controller;

  /// What it shows while empty, in its words' place.
  final String? placeholder;

  /// Called with the words as they change.
  final ValueChanged<String>? onChanged;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final enabled = !disabled;
    return SolarField(
      controller: controller,
      focusNode: focusNode,
      statesController: statesController,${o.obscured ? '\n      obscured: true,' : ''}
      builder: (context, field) {
        final states = field.states;
${o.prelude ? `${indent(o.prelude, 8)}\n` : ''}        // Filled where it holds text: its words are then the value's, not the placeholder's.
        final p = Solar${P}Props(
${api.map(([prop]) => `          ${prop}: ${prop},`).join('\n')}
          filled: field.text.text.isNotEmpty,${o.values ? `\n${indent(o.values, 10)}` : ''}
        );
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => ${R}.lookup(c, p, states),
            dimension: (c) => ${R}.dimension(c, p, states),
            color: (c) => ${R}.color(t, c, p, states),
            shadow: (c) => ${R}.shadow(t, c, p, states),
            textStyle: (c) => ${R}.textStyle(t, c, p, states),${
              present.length
                ? `
            // A part left empty is not drawn.
            present: (l) => switch (l) {
${present.map(([l, e]) => `              '${l}' => ${e},`).join('\n')}
              _ => ${R}.present(l, p, states),
            },`
                : `
            present: (l) => ${R}.present(l, p, states),`
            }
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(name)}',${o.text ? `\n          text: ${o.text},` : ''}${o.slots ? `\n          slots: ${o.slots},` : ''}${o.wraps ? `\n          wraps: ${o.wraps},` : ''}${o.icons ? `\n          icons: ${o.icons},` : icons.length ? `\n          icons: const {${icons.map((i) => `'${i.layer}': ${i.dart}`).join(', ')}},` : ''}
          // The field's words, in the recipe's style.
          fields: {
            '${o.words}': (style) => field.read(
              TextField(
                controller: field.text,
                focusNode: field.focus,
                enabled: enabled,
                autofocus: autofocus,
                onChanged: onChanged,
                style: style,
${indent(o.textField ?? 'maxLines: 1,', 16)}
                decoration: InputDecoration.collapsed(
                  hintText: placeholder,
                  hintStyle: style,
                ),
              ),${o.name ? `\n              label: ${o.name},` : ''}${o.hint ? `\n              hint: ${o.hint},` : ''}
            ),
          },
          builders: {
${(o.unread ?? [])
  .map((l) => `            '${l}': (layer) => ExcludeSemantics(child: layer),`)
  .join(
    '\n',
  )}${(o.unread ?? []).length ? '\n' : ''}${o.builders ? `${indent(o.builders, 12)}\n` : ''}            '${field}': (layer) => field.area(layer, enabled: enabled),
          },
        ).layer('root');
      },
    );
  }
}
`;
}
