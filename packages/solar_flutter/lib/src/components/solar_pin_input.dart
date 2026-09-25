/// SOLAR PIN Input.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarPINInputRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarPINInputRecipe]: each cell's fill,
/// edge and focus ring by state, its digit's and placeholder's ink, and the label, helper and
/// error, read cell by cell.
///
/// A one-time code or a verification code, one digit per cell, [length] of them (4 to 6, six by
/// default): its [label] above (a [mandatory] one is starred), its [helper] below, and in [error]
/// its [errorMessage] there instead. One [TextField] holds the code, invisible over the cells drawn
/// from Figma's layer tree with [SolarLayers] ([SolarField] holds it and its states), so typing
/// moves on a cell, Backspace steps back, a paste fills every cell, and the phone offers the code
/// it was sent (the one-time-code autofill, the numeric keyboard). The cell the next digit goes in
/// shows the focus and the caret. [onChanged] is called with the digits, [onCompleted] once every
/// cell holds one. It reads as one text field, named by its label.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/pin_input.dart';
import '../solar_field.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarPINInput extends StatelessWidget {
  const SolarPINInput({
    super.key,
    this.size = SolarPINInputSize.md,
    this.enabled = true,
    this.error = false,
    this.label,
    this.mandatory = false,
    this.helper,
    this.errorMessage,
    this.length = 6,
    this.controller,
    this.onChanged,
    this.onCompleted,
    this.placeholder = '0',
    this.autofocus = false,
    this.focusNode,
    this.statesController,
  }) : assert(length >= 4 && length <= 6, 'a PIN has 4 to 6 digits');

  final SolarPINInputSize size;

  /// Whether it is enabled, as Flutter's own fields and menu entries say it; false draws it
  /// disabled.
  final bool enabled;

  /// Whether it is disabled: not [enabled].
  bool get disabled => !enabled;
  final bool error;

  /// What it asks for, above it.
  final String? label;

  /// Whether it must be filled, which stars the label.
  final bool mandatory;

  /// More about it, below.
  final String? helper;

  /// What is wrong, below in the helper's place, where it is in [error].
  final String? errorMessage;

  /// How many digits the code has, 4 to 6.
  final int length;

  /// Its digits, where the caller keeps them; one of its own, empty, otherwise.
  final TextEditingController? controller;

  /// Called with the digits as they change.
  final ValueChanged<String>? onChanged;

  /// Called with the code once every cell holds a digit.
  final ValueChanged<String>? onCompleted;

  /// What an empty cell shows, Figma's 0 by default.
  final String placeholder;

  /// Whether it takes the focus when first built.
  final bool autofocus;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final label = this.label;
    final helper = this.helper;
    final errorMessage = this.errorMessage;
    final cellsOf = SolarPINInputRecipe.tree['cells']!;
    return SolarField(
      controller: controller,
      focusNode: focusNode,
      statesController: statesController,
      builder: (context, field) {
        final states = field.states;
        final value = field.text.text;
        // Filled where it holds its code.
        final p = SolarPINInputProps(
          size: size,
          disabled: disabled,
          error: error,
          filled: value.isNotEmpty,
        );
        // The cell the next digit goes in is Figma's first; the others are Figma's rest, in order.
        final next = value.length < length ? value.length : length - 1;
        final rest = cellsOf.skip(1).iterator;
        final cells = [
          for (var i = 0; i < length; i++)
            i == next ? cellsOf.first : (rest..moveNext()).current,
        ];
        final focused = states.contains(WidgetState.focused);
        final text = <String, String>{};
        final shown = <String, bool>{};
        for (final (i, cell) in cells.indexed) {
          final parts = SolarPINInputRecipe.tree[cell]!;
          final digit = parts.firstWhere((l) => l.startsWith('digit'));
          final empty = parts.firstWhere((l) => l.startsWith('placeholder'));
          final has = i < value.length;
          final caret = cell == cellsOf.first && focused && !has;
          text[digit] = has ? value[i] : '';
          text[empty] = placeholder;
          shown[digit] = has;
          shown[empty] = !has && !caret;
          if (cell == cellsOf.first) {
            text['caret'] = '|';
            shown['caret'] = caret;
          }
        }
        SolarLayers draw({Map<String, List<Widget>> content = const {}}) =>
            SolarLayers(
              recipe: SolarLayerRecipe(
                lookup: (c) => SolarPINInputRecipe.lookup(c, p, states),
                dimension: (c) => SolarPINInputRecipe.dimension(c, p, states),
                color: (c) => SolarPINInputRecipe.color(t, c, p, states),
                shadow: (c) => SolarPINInputRecipe.shadow(t, c, p, states),
                textStyle: (c) =>
                    SolarPINInputRecipe.textStyle(t, c, p, states),
                // A part left empty is not drawn; the cells' parts are as the code fills them.
                present: (l) => switch (l) {
                  _ when shown.containsKey(l) => shown[l]!,
                  'label' => label != null,
                  'mandatory' => mandatory,
                  'helper' =>
                    helper != null && SolarPINInputRecipe.present(l, p, states),
                  'errorMessage' =>
                    errorMessage != null &&
                        SolarPINInputRecipe.present(l, p, states),
                  _ => SolarPINInputRecipe.present(l, p, states),
                },
                glyph: (_) => null,
              ),
              tree: SolarPINInputRecipe.tree,
              keyPrefix: 'pinInput',
              text: {
                ...text,
                'labelLabel': ?label,
                'mandatory': '*',
                'helper': ?helper,
                'errorMessage': ?errorMessage,
              },
              wraps: const {
                'helper': TextAlign.start,
                'errorMessage': TextAlign.start,
              },
              content: content,
              builders: {
                // A cell's words are as wide as the cell leaves them: Figma's 0 at 16px sits in a
                // 12px room, which a font's measure may pass by a hair.
                for (final cell in cellsOf)
                  for (final part in SolarPINInputRecipe.tree[cell]!)
                    part: (words) => Flexible(child: words),
                // The label, the helper and the error are read with the code, which they name.
                'label': (layer) => ExcludeSemantics(child: layer),
                'helper': (layer) => ExcludeSemantics(child: layer),
                'errorMessage': (layer) => ExcludeSemantics(child: layer),
                // The cells, with the input that holds the code invisible over them.
                'cells': (row) => field.area(
                  Stack(
                    children: [
                      ExcludeSemantics(child: row),
                      Positioned.fill(
                        child: Opacity(
                          opacity: 0,
                          // Unseen, and still read: the code's text field.
                          alwaysIncludeSemantics: true,
                          child: field.read(
                            TextField(
                              controller: field.text,
                              focusNode: field.focus,
                              enabled: !disabled,
                              autofocus: autofocus,
                              keyboardType: TextInputType.number,
                              autofillHints: const [AutofillHints.oneTimeCode],
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(length),
                              ],
                              onChanged: (digits) {
                                onChanged?.call(digits);
                                if (digits.length == length) {
                                  onCompleted?.call(digits);
                                }
                              },
                              showCursor: false,
                              enableInteractiveSelection: false,
                              decoration: const InputDecoration.collapsed(
                                hintText: null,
                              ),
                            ),
                            label: label,
                            hint: error ? errorMessage : helper,
                          ),
                        ),
                      ),
                    ],
                  ),
                  enabled: !disabled,
                ),
              },
            );
        final drawer = draw();
        return draw(
          content: {
            'cells': [for (final cell in cells) drawer.layer(cell)],
          },
        ).layer('root');
      },
    );
  }
}
