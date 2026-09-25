/// SOLAR Column Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarColumnItemRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarColumnItemRecipe]: the cell's padding
/// and gap, the header's separator, and its words' text styles, read cell by cell.
///
/// One cell of a Table's Row, drawn from Figma's layer tree with [SolarLayers]: a column header
/// ([header]) or a data cell. What it holds decides its type (owner decision 2026-09-25), as a
/// Tag's content does: its [label], an [avatar] beside it (a user), or one of the caller's SOLAR
/// widgets: a [tag], an [icon], a [textInput], a [dropdown], a [button] or a [toggle]. In a
/// SolarRow it is a cell or a column header to a screen reader; a [numeric] column's words sit at
/// the end, as the description says. A header sorts where it is given [onSort]: it is then a
/// button, draws SOLAR's focus ring while the keyboard is on it, and says which way [sort] has the
/// column; no arrow is drawn, as Figma draws none. The sorting itself is the caller's. A row is
/// dense: a control in a cell is its own target, SOLAR's accepted exception to 44 × 44.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/column_item.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_table.dart';
import 'solar_theme_of.dart';

/// Which way a header's column is sorted.
enum SolarColumnSort { ascending, descending }

class SolarColumnItem extends StatelessWidget {
  const SolarColumnItem({
    super.key,
    this.header = false,
    this.label,
    this.avatar,
    this.tag,
    this.icon,
    this.textInput,
    this.dropdown,
    this.button,
    this.toggle,
    this.numeric = false,
    this.sort,
    this.onSort,
    this.sortLabels = const {
      SolarColumnSort.ascending: 'sorted ascending',
      SolarColumnSort.descending: 'sorted descending',
    },
  });

  /// Whether it heads its column.
  final bool header;

  /// The cell's words: a column's name in a header, a value in a data cell, a user's name.
  final String? label;

  /// A SolarAvatar (sm) before the words: a user cell.
  final Widget? avatar;

  /// A SolarTag: a status cell.
  final Widget? tag;

  /// An icon: an icon cell.
  final Widget? icon;

  /// A SolarTextInput (sm): an input cell.
  final Widget? textInput;

  /// A SolarDropdown (sm): a select cell.
  final Widget? dropdown;

  /// A SolarButton (sm): a button cell.
  final Widget? button;

  /// A SolarToggle: a toggle cell.
  final Widget? toggle;

  /// A column of figures: its words sit at the end.
  final bool numeric;

  /// A header's column, sorted which way; unsorted where null.
  final SolarColumnSort? sort;

  /// Called when a header is asked to sort its column: it is then a button.
  final VoidCallback? onSort;

  /// What a screen reader says of each [sort], after the header's words.
  final Map<SolarColumnSort, String> sortLabels;

  SolarColumnItemType get _type => header
      ? SolarColumnItemType.text
      : avatar != null
      ? SolarColumnItemType.user
      : tag != null
      ? SolarColumnItemType.status
      : icon != null
      ? SolarColumnItemType.icon
      : textInput != null
      ? SolarColumnItemType.input
      : dropdown != null
      ? SolarColumnItemType.select
      : button != null
      ? SolarColumnItemType.button
      : toggle != null
      ? SolarColumnItemType.toggle
      : SolarColumnItemType.text;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarColumnItemProps(header: header, type: _type);
    final words = label ?? '';
    // A table row is dense: a control in a cell is its own target.
    Widget? held(Widget? w) => w == null ? null : solarDenseTarget(context, w);
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarColumnItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarColumnItemRecipe.dimension(c, p, states),
        color: (c) => SolarColumnItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarColumnItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarColumnItemRecipe.textStyle(t, c, p, states),
        present: (l) => SolarColumnItemRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: SolarColumnItemRecipe.tree,
      keyPrefix: 'columnItem',
      text: {'label': words, 'name': words},
      // A cell's words take the room its row leaves, cut short; a numeric column's at the end.
      truncates: const {'label', 'name'},
      wraps: numeric
          ? const {'label': TextAlign.end, 'name': TextAlign.end}
          : const {},
      slots: {'icon': ?icon},
      composed: {
        'avatar': ?avatar,
        'tag': ?tag,
        'textInput': ?held(textInput),
        'dropdown': ?held(dropdown),
        'button': ?held(button),
        'toggle': ?held(toggle),
      },
    ).layer('root');
    final sorts = header && onSort != null;
    final Widget cell = sorts
        ? SolarPressable(
            onPressed: onSort,
            builder: (_, states) => draw(states),
          )
        : draw(const {});
    final row = SolarRowScope.of(context);
    if (row == null) return cell;
    return Semantics(
      role: header ? SemanticsRole.columnHeader : SemanticsRole.cell,
      value: sorts && sort != null ? sortLabels[sort] : null,
      container: true,
      child: cell,
    );
  }
}
