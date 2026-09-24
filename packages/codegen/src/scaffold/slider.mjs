/**
 * The shells of SOLAR's sliders, Slider and Slider Range: MUI's Slider on the web, its rail, track
 * and thumbs restyled by the recipe; in Flutter, Figma's layers drawn with [SolarLayers] over
 * [SolarSliderInput], the value placing the fill and handles (the overlay's controlDraws) and the
 * recipe drawing everything else.
 *
 * The two differ in how many handles they have: one value, or a pair. The templates are functions
 * of the IR: the API and the layer tree come from it, never retyped.
 */

import { pascal } from '../util/naming.mjs';
import { keyPrefixOf, treeOf, wrapDoc } from './drawn.mjs';
import { dartField, dartParam } from './helpers.mjs';
import { TARGET, targetArea } from './target.mjs';

/** The layers a slider's templates need, refused where the IR lacks one. */
export function requireSlider(spec, handles) {
  for (const layer of ['track', 'fill', ...handles])
    if (!spec.layers[layer])
      throw new Error(`${spec.component}: the IR has no ${layer} layer`);
  if (spec.api.disabled?.type !== 'boolean')
    throw new Error(`${spec.component}: the IR has no disabled prop`);
}

/** Where MUI draws each layer, and the resets its own styles need. */
export function sliderMui(handles) {
  const thumb = (i) =>
    handles.length === 1
      ? '& .MuiSlider-thumb'
      : `& .MuiSlider-thumb[data-index="${i}"]`;
  return {
    slots: {
      root: '&',
      track: '& .MuiSlider-rail',
      fill: '& .MuiSlider-track',
      ...Object.fromEntries(handles.map((h, i) => [h, thumb(i)])),
    },
    // MUI centres its rail and track with a transform, and its thumb on both axes, where the recipe
    // places them from the slider's top as Figma does: the thumb keeps only its centring on the
    // value. Its elevation, a ::before, gives way to the recipe's shadow, and the padding that
    // enlarges its touch area to the recipe's height.
    resets: {
      display: 'block',
      padding: '0',
      boxSizing: 'border-box',
      '& .MuiSlider-rail': { opacity: '1', transform: 'none' },
      '& .MuiSlider-track': { border: 'none', transform: 'none' },
      '& .MuiSlider-thumb': {
        transform: 'translateX(-50%)',
        boxSizing: 'border-box',
        '&::before': { display: 'none' },
        // MUI's own touch area, a pseudo-element, is the 44 × 44 target (target.mjs).
        '&::after': { width: TARGET, height: TARGET },
      },
      // A 44-tall target along the rail (target.mjs).
      ...targetArea(),
    },
    // Figma draws each state on the whole slider: pressed while a thumb is held, focused while
    // one has the keyboard.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:has(.Mui-active)',
      focus: '&:has(.Mui-focusVisible)',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  };
}

/**
 * The React shell.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {boolean} o.range whether it takes a pair of values
 * @param {string} o.about what it is for, for the doc comment
 */
export function sliderReact(spec, { range, about }) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.keys(spec.api);
  // MUI types its slider for one number or an array, so a range is its array (low first).
  const V = range ? 'number[]' : 'number';
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(`Scaffolded once by \`npm run solar:scaffold "${name}"\` from spec/components/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, \`solar${P}Style\` in \`@bwp-web/styles/mui\`: the rail, the fill by state, and the handle${range ? 's' : ''}' size, edge and shadow.`, ' * ')}
 *
${wrapDoc(`${about} It wraps MUI's Slider, which drags, takes the arrow keys and is announced as a slider${range ? ' for each thumb (name each with `getAriaLabel`)' : ' (name it with `aria-label`)'}; on 0 to 100 by default, as MUI's is. It fills its container. The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import MuiSlider, { type SliderProps as MuiSliderProps } from '@mui/material/Slider';
import { forwardRef } from 'react';
import { solar${P}Style, type Solar${P}Props } from '@bwp-web/styles/mui';

export interface ${P}Props
  extends Solar${P}Props,
    // MUI's value, onChange and the rest, typed for ${range ? 'a pair' : 'one value'}.
    Omit<
      MuiSliderProps<'span', object, ${V}>,
      keyof Solar${P}Props | 'color' | 'size' | 'marks' | 'track' | 'orientation' | 'ref'
    > {}

export const ${P} = forwardRef<HTMLSpanElement, ${P}Props>(function ${P}(
  { ${api.map((p) => `${p} = false`).join(', ')}, sx, ...rest },
  ref,
) {
  return (
    <MuiSlider
      ref={ref}
      {...rest}
      disabled={disabled}${api.includes('error') ? `\n      aria-invalid={error || undefined}` : ''}
      sx={[solar${P}Style({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
});
`;
}

/**
 * The Flutter widget.
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string[]} o.handles the handle layers, low first
 * @param {string} o.about what it is for, for the doc comment
 */
export function sliderFlutter(spec, { handles, about }) {
  const name = spec.component;
  const P = pascal(name);
  const R = `Solar${P}Recipe`;
  const range = handles.length > 1;
  const api = Object.entries(spec.api);
  const tree = Object.entries(treeOf(spec))
    .map(
      ([parent, kids]) =>
        `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
    )
    .join('\n');
  const T = range ? 'RangeValues' : 'double';
  const toFractions = range
    ? '[frac(values.start), frac(values.end)]'
    : '[frac(value)]';
  const fromFractions = range
    ? 'RangeValues(min + f[0] * span, min + f[1] * span)'
    : 'min + f[0] * span';
  const header = `Scaffolded once by \`npm run solar:scaffold -- --flutter "${name}"\` from spec/components/${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json, and owned by developers from then on: change it freely. What it looks like is not here. That is the recipe, [${R}]: the rail, the fill by state, and the handle${range ? 's' : ''}' size, edge and shadow, read cell by cell.`;
  const text = `${about} Bespoke: Flutter's ${range ? 'RangeSlider' : 'Slider'} paints its own track and thumb${range ? 's' : ''}. Figma's layers are drawn with [SolarLayers] over a [SolarSliderInput], which drags, takes the arrow keys and announces ${range ? 'each handle' : 'it'} as a slider; the value places the fill and handle${range ? 's' : ''}. On [min] to [max], 0 to 1 by default, as Flutter's is. It fills its container, which must give it a width.`;
  return `/// SOLAR ${name}.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(text, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.dart';
import '../solar_layers.dart';
import '../solar_slider_input.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class Solar${P} extends StatelessWidget {
  const Solar${P}({
    super.key,
    required this.${range ? 'values' : 'value'},
    required this.onChanged,
    this.min = 0,
    this.max = 1,
    this.onChangeStart,
    this.onChangeEnd,
${api.map(([prop, def]) => `    ${dartParam(P, prop, def)},`).join('\n')}
    this.${range ? 'semanticLabels = const (null, null)' : 'semanticLabel'},
    this.statesController,
  });

  /// ${range ? 'The two ends of the range chosen, low first' : 'The value chosen'}, from [min] to [max].
  final ${T} ${range ? 'values' : 'value'};

  /// Called with ${range ? 'the range' : 'the value'} as a handle moves; null disables it.
  final ValueChanged<${T}>? onChanged;

  /// Called with ${range ? 'the range' : 'the value'} when a pointer takes a handle.
  final ValueChanged<${T}>? onChangeStart;

  /// Called with ${range ? 'the range' : 'the value'} when the pointer lets it go.
  final ValueChanged<${T}>? onChangeEnd;

  /// The lowest value.
  final double min;

  /// The highest value.
  final double max;

${api.map(([prop, def]) => dartField(P, prop, def)).join('\n')}

  /// ${range ? 'What each end sets, low first' : 'What it sets'}, for a screen reader.
  final ${range ? '(String?, String?) semanticLabels' : 'String? semanticLabel'};

  /// Its states, where the caller keeps them (the visual checks force a state through it).
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final off = disabled || onChanged == null;
    final p = Solar${P}Props(${api.map(([prop]) => (prop === 'disabled' ? 'disabled: off' : `${prop}: ${prop}`)).join(', ')});
    final span = max - min;
    double frac(double v) => span == 0 ? 0 : ((v - min) / span).clamp(0.0, 1.0);
    ${T} of(List<double> f) => ${fromFractions};
    final at = ${toFractions};
    return SolarTarget(child: SolarSliderInput(
      values: at,
      onChanged: off ? null : (f) => onChanged!(of(f)),
      onChangeStart: onChangeStart == null ? null : (f) => onChangeStart!(of(f)),
      onChangeEnd: onChangeEnd == null ? null : (f) => onChangeEnd!(of(f)),
      labels: ${range ? '[semanticLabels.$1, semanticLabels.$2]' : '[semanticLabel]'},
      valueLabel: (f) => '\${(f * 100).round()}%',
      statesController: statesController,
      builder: (context, states, width, handle) {
        // Where the value puts the fill and the handle${range ? 's' : ''}, which the control decides (the
        // overlay's controlDraws), and the width it is given; the recipe says the rest.
        double half(String h) => (${R}.dimension('$h.width', p, states) ?? 0) / 2;
        double? placed(String cell) => switch (cell) {
          'root.width' || 'track.width' => width,
${
  range
    ? `          'fill.x' => at[0] * width,
          'fill.width' => (at[1] - at[0]) * width,
          '${handles[0]}.x' => at[0] * width - half('${handles[0]}'),
          '${handles[1]}.x' => at[1] * width - half('${handles[1]}'),`
    : `          'fill.width' => at[0] * width,
          '${handles[0]}.x' => at[0] * width - half('${handles[0]}'),`
}
          _ => null,
        };
        return SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) =>
                placed(c) == null ? ${R}.lookup(c, p, states) : 'px:placed',
            dimension: (c) => placed(c) ?? ${R}.dimension(c, p, states),
            color: (c) => ${R}.color(t, c, p, states),
            shadow: (c) => ${R}.shadow(t, c, p, states),
            textStyle: (c) => ${R}.textStyle(t, c, p, states),
            present: (l) => ${R}.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(name)}',
          builders: {
${handles.map((h, i) => `            '${h}': (drawn) => handle(${i}, drawn),`).join('\n')}
          },
        ).layer('root');
      },
    ));
  }
}
`;
}
