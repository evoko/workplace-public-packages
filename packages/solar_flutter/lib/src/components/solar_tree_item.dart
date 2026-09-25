/// SOLAR Tree Item.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarTreeItemRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarTreeItemRecipe]: the row's fill, edge
/// and ring by state, and its parts' ink, read cell by cell.
///
/// One row of a tree, drawn from Figma's layer tree with [SolarLayers], pressable and focusable,
/// announced selected and expanded: indented by its [depth] (0 to 10, 16px a level), a chevron that
/// expands and collapses it where it is [expandable] (a leaf keeps the chevron's room, as its
/// description says), and a checkbox ([checked]), icons either side, a [status], a [tag] and a
/// [count] as the caller gives them. Its two actions, [onMore] and [onAdd], show on hover and while
/// selected. A tap, Enter or Space selects it ([onSelect]); the right and left arrows expand and
/// collapse it. [edit] draws its label as a text field: submitting renames it ([onRename]), Escape
/// cancels. A keyboard-focused row draws edit's edge and ring, as its description says edit
/// "doubles as the focus treatment". The tree around it is the caller's for now.
library;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../generated/components/statusindicator.dart';
import '../generated/components/tree_indent.dart';
import '../generated/components/tree_item.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_checkbox.dart';
import 'solar_counter.dart';
import 'solar_statusindicator.dart';
import 'solar_theme_of.dart';
import 'solar_tree_indent.dart';

class SolarTreeItem extends StatefulWidget {
  const SolarTreeItem({
    super.key,
    this.selected = false,
    this.expanded = false,
    this.edit = false,
    required this.label,
    this.depth = 0,
    this.expandable = true,
    this.onExpandedChange,
    this.onSelect,
    this.checked,
    this.onCheckedChange,
    this.leadingIcon,
    this.trailingIcon,
    this.status,
    this.tag,
    this.count,
    this.onMore,
    this.onAdd,
    this.onRename,
    this.onRenameCancel,
    this.expandLabel = 'Expand',
    this.collapseLabel = 'Collapse',
    this.moreLabel = 'More actions',
    this.addLabel = 'Add',
    this.statesController,
  });

  final bool selected;
  final bool expanded;
  final bool edit;

  /// The row's words.
  final String label;

  /// How deep in the tree it is, 0 to 10.
  final int depth;

  /// Whether it has children, which its chevron expands; a leaf keeps the chevron's room.
  final bool expandable;

  /// Called with whether it is to be expanded, by its chevron or the arrow keys.
  final ValueChanged<bool>? onExpandedChange;

  /// Called when it is chosen: a tap, Enter or Space.
  final VoidCallback? onSelect;

  /// A checkbox before its words, checked or not; none where null.
  final bool? checked;

  /// Called with the checkbox's new state.
  final ValueChanged<bool>? onCheckedChange;

  /// An icon before the words, and one after.
  final Widget? leadingIcon, trailingIcon;

  /// A status after the words, a SolarStatusIndicator of this type.
  final SolarStatusIndicatorType? status;

  /// A SolarTag after the words.
  final Widget? tag;

  /// A count after the words, a SolarCounter; none at 0 or below.
  final int? count;

  /// Its actions, shown on hover and while selected: more, and add.
  final VoidCallback? onMore, onAdd;

  /// Called with the new name, where it is being edited: submitting it.
  final ValueChanged<String>? onRename;

  /// Called where the edit is left: Escape.
  final VoidCallback? onRenameCancel;

  /// Names for a screen reader: the chevron's, and the actions'.
  final String expandLabel, collapseLabel, moreLabel, addLabel;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarTreeItem> createState() => _SolarTreeItemState();
}

class _SolarTreeItemState extends State<SolarTreeItem> {
  late final _name = TextEditingController(text: widget.label);

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  void _toggle() => widget.onExpandedChange?.call(!widget.expanded);

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarTreeItemProps(
      selected: w.selected,
      expanded: w.expanded,
      edit: w.edit,
    );
    Widget draw(Set<WidgetState> states) {
      String? look(String cell) => SolarTreeItemRecipe.lookup(cell, p, states);
      // A slot is drawn where it is given; the actions where Figma shows them (on hover, while
      // selected) and they are given; the rest as Figma shows them.
      bool present(String layer) {
        final shown = SolarTreeItemRecipe.present(layer, p, states);
        return switch (layer) {
          'checkbox' => w.checked != null,
          'leadingIcon' => w.leadingIcon != null,
          'status' => w.status != null,
          'tag' => w.tag != null,
          'counter' => w.count != null && w.count! > 0,
          'trailingIcon' => w.trailingIcon != null,
          'buttons' => shown && (w.onMore != null || w.onAdd != null),
          'iconMore' => shown && w.onMore != null,
          'iconPlus' => shown && w.onAdd != null,
          _ => shown,
        };
      }

      // Its own box is its target: the controls sit 4px apart, where two padded targets would
      // cover each other (a tap on More would reach Add's).
      Widget action(VoidCallback? onPressed, String label, Widget icon) =>
          SolarPressable(
            onPressed: onPressed,
            builder: (_, _) => Semantics(label: label, child: icon),
          );
      return SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: look,
          dimension: (c) => SolarTreeItemRecipe.dimension(c, p, states),
          color: (c) => SolarTreeItemRecipe.color(t, c, p, states),
          shadow: (c) => SolarTreeItemRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarTreeItemRecipe.textStyle(t, c, p, states),
          present: present,
          glyph: (_) => null,
        ),
        tree: SolarTreeItemRecipe.tree,
        keyPrefix: 'treeItem',
        text: {'label': w.label},
        truncates: const {'label'},
        icons: const {
          'chevronChevron': SolarIcons.chevronRightOutline,
          'iconChevronDown': SolarIcons.chevronDownOutline,
          'iconMore': SolarIcons.moreOutline,
          'iconPlus': SolarIcons.plusOutline,
        },
        slots: {'leadingIcon': ?w.leadingIcon, 'trailingIcon': ?w.trailingIcon},
        composed: {
          'treeIndent': SolarTreeIndent(
            depth: SolarTreeIndentDepth.values[w.depth.clamp(0, 10)],
          ),
          if (w.checked != null)
            'checkbox': SolarCheckbox(
              checked: w.checked!,
              onChanged: w.onCheckedChange == null
                  ? null
                  : (v) => w.onCheckedChange!(v),
            ),
          if (w.status != null)
            'status': SolarStatusIndicator(
              type: w.status!,
              size: SolarStatusIndicatorSize.values.byName(
                look('status.variant.size')!.substring(2),
              ),
            ),
          if (w.tag != null) 'tag': w.tag!,
          // In a scope of its own: the row's hover is not the counter's, which the recipe names.
          if (w.count != null && w.count! > 0)
            'counter': SolarStatesScope(
              builder: (_, _) => SolarCounter(
                count: w.count!,
                disabled: look('counter.variant.state') == 'k:disabled',
              ),
            ),
        },
        // Editing, the words are a text field: submitting renames, Escape cancels.
        fields: {
          'renameInput': (style) => CallbackShortcuts(
            bindings: {
              const SingleActivator(LogicalKeyboardKey.escape): () =>
                  w.onRenameCancel?.call(),
            },
            child: TextField(
              controller: _name,
              autofocus: true,
              style: style,
              maxLines: 1,
              decoration: const InputDecoration.collapsed(hintText: null),
              onSubmitted: w.onRename,
            ),
          ),
        },
        builders: {
          // The chevron expands it; a leaf keeps its room, the glyph not drawn.
          'chevron': (layer) => w.expandable
              ? action(
                  _toggle,
                  w.expanded ? w.collapseLabel : w.expandLabel,
                  layer,
                )
              : ExcludeSemantics(child: Opacity(opacity: 0, child: layer)),
          'iconMore': (icon) => action(w.onMore, w.moreLabel, icon),
          'iconPlus': (icon) => action(w.onAdd, w.addLabel, icon),
        },
      ).layer('root');
    }

    // The row is the control: the arrows expand and collapse it.
    return CallbackShortcuts(
      bindings: {
        const SingleActivator(LogicalKeyboardKey.arrowRight): () {
          if (w.expandable && !w.expanded) _toggle();
        },
        const SingleActivator(LogicalKeyboardKey.arrowLeft): () {
          if (w.expandable && w.expanded) _toggle();
        },
      },
      child: Semantics(
        expanded: w.expandable ? w.expanded : null,
        child: SolarPressable(
          onPressed: w.edit ? null : (w.onSelect ?? () {}),
          statesController: w.statesController,
          selected: w.selected,
          builder: (_, states) => draw(states),
        ),
      ),
    );
  }
}
