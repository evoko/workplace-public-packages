// The workbench's Inspect dialog: a full-screen route over the page (a SOLAR Scrim behind the
// page's surface), which Close or Escape ends (Escape in an open Select closes that Select alone,
// and in a filter holding text clears it alone). Its header names the component and holds a Select
// per variant axis, Report and Close; under it three columns: the layers as a tree, the variant
// drawn large with the selected layer outlined (preview.dart), and the selected layer's
// properties, read only, with the chosen cell's editor right under its row (Apply to, Filter
// tokens, Change to, why it is this now); along the foot the pending edit's strip.
//
// It draws what the bar (bar.dart) gives it and keeps nothing of its own: the bar holds the
// inspection, the layer, cell and scope chosen, and the pending edit, and the dialog is rebuilt as
// they change. The parts carry the names bar-scenarios.json's vocabulary.dialog gives them, which
// the scenario driver finds them by. As the web's (packages/components/stories/workbench/
// InspectDialog.tsx). Drawn with SOLAR's widgets and tokens alone.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:solar_flutter/solar_flutter.dart';

import 'blocks.dart';
import 'models.dart';
import 'preview.dart';

/// The dialog's route, for the root navigator ([inspectNavigator]): over the whole window, not
/// Widgetbook's use-case pane, as the web's covers the page. It draws [builder] with the themes
/// [context] has (Widgetbook's theme is below the navigator). Escape pops it, as a dismissible
/// route's Escape does; the page covers the scrim, so nothing else does.
ModalRoute<void> inspectDialogRoute({
  required BuildContext context,
  required WidgetBuilder builder,
}) {
  final navigator = inspectNavigator(context);
  final themes = InheritedTheme.capture(from: context, to: navigator.context);
  final still = MediaQuery.maybeDisableAnimationsOf(context) ?? false;
  final duration = still
      ? SolarMotion.durationInstant
      : SolarMotion.durationFast;
  return PageRouteBuilder<void>(
    opaque: true,
    barrierDismissible: true,
    transitionDuration: duration,
    reverseTransitionDuration: duration,
    pageBuilder: (context, _, _) => themes.wrap(Builder(builder: builder)),
    transitionsBuilder: (context, animation, _, child) => FadeTransition(
      opacity: CurvedAnimation(parent: animation, curve: SolarMotion.easeOut),
      child: child,
    ),
  );
}

/// The navigator the dialog is pushed on: the root one, whose overlay is the whole window.
NavigatorState inspectNavigator(BuildContext context) =>
    Navigator.of(context, rootNavigator: true);

/// Change to lists at most this many tokens; Filter tokens narrows the rest (SolarSelect's menu does
/// not scroll).
const changeToCap = 8;

/// Change to's option that says how many more tokens match: never chosen.
const _more = '\u2026more';

/// [n] variants, in words: "variant" after 1.
String variantsText(int n) => '$n ${n == 1 ? 'variant' : 'variants'}';

/// Where Filter tokens starts for [entry]: a token's family (its name less the last segment,
/// `color.action.primary.bg`); empty for none, a keyword or a raw value.
String familyOf(String entry) =>
    RegExp(r'^[a-zA-Z][\w-]*(\.[\w-]+)+$').hasMatch(entry)
    ? entry.substring(0, entry.lastIndexOf('.'))
    : '';

/// Where Filter tokens starts for [cell]: its token's family where that matches a token it
/// offers; else empty, so the filter never starts by hiding every token.
String startFilter(WorkbenchCell cell) {
  final family = familyOf(cell.entry);
  return matching(cell, family).isEmpty ? '' : family;
}

/// The tokens [cell] offers that [filter] matches: a token whose name or value contains it,
/// ignoring case.
List<({String name, String value})> matching(
  WorkbenchCell cell,
  String filter,
) {
  final text = filter.trim().toLowerCase();
  return [
    for (final ch in cell.choices)
      if (text.isEmpty ||
          ch.name.toLowerCase().contains(text) ||
          ch.value.toLowerCase().contains(text))
        ch,
  ];
}

/// The pending edit in the words of [inspection], from the scope whose key it is:
/// `<layer> · <cell>, for <scope> (<n> variants): <was> → <new>`; null where it has no such scope.
String? pendingText(WorkbenchInspection inspection, WorkbenchPending pending) {
  for (final l in inspection.layers) {
    for (final c in l.cells) {
      for (final s in c.scopes) {
        if (s.key != pending.key) continue;
        final now = pending.deletes
            ? "Figma's value (the rule is removed)"
            : pending.valueText;
        final was = pending.was == null || pending.deletes
            ? ''
            : '${pending.was} → ';
        return '${l.name} · ${c.cell}, for ${s.label} (${variantsText(s.count)}): $was$now';
      }
    }
  }
  return null;
}

/// The scope a set is keyed on for [cell]: [chosen] where it is one the cell offers and no
/// narrower entry wins over, else the narrowest (the last) that none does; null where it offers
/// none.
String? scopeFor(WorkbenchCell cell, String? chosen) {
  final open = cell.scopes.where((s) => s.wins == null).toList();
  return open.any((s) => s.key == chosen) ? chosen : open.lastOrNull?.key;
}

/// A colour as the service writes its value (`#rrggbb`, `#rrggbbaa`, `rgba(r, g, b, a)`), in the
/// mode showing where it gives Light's and Dark's (`<light> / <dark>`); null for any other value.
Color? swatchOf(String value, Brightness brightness) {
  final modes = value.split(' / ');
  final text =
      (brightness == Brightness.dark && modes.length > 1
              ? modes[1]
              : modes.first)
          .trim();
  final hex = RegExp(r'^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$').firstMatch(text);
  if (hex != null) {
    final rgb = int.parse(hex[1]!, radix: 16);
    final a = hex[2] == null ? 0xff : int.parse(hex[2]!, radix: 16);
    return Color((a << 24) | rgb);
  }
  final rgba = RegExp(
    r'^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)$',
  ).firstMatch(text);
  if (rgba != null) {
    return Color.fromRGBO(
      int.parse(rgba[1]!),
      int.parse(rgba[2]!),
      int.parse(rgba[3]!),
      double.parse(rgba[4] ?? '1'),
    );
  }
  return null;
}

/// Where an entry comes from, as the dialog says it (the tree marks a rule's the same way).
String originText(String origin) => switch (origin) {
  'figma' => 'Figma',
  _ => origin,
};

/// Why a cell is what it is now, in one line: Figma's value, or the rule (at the scope that holds
/// it now) or the shared defaults that set it, with the reason.
String whyText(WorkbenchCell c) {
  final at =
      c.scopes.where((s) => s.current).firstOrNull?.label ?? c.at ?? 'a scope';
  final reason = c.reason == null ? '' : ': ${c.reason}';
  return switch (c.origin) {
    'rule' => 'a rule at $at sets ${c.entry}$reason',
    'defaults' => 'the shared defaults set ${c.entry}$reason',
    _ => 'Figma draws ${c.entry}',
  };
}

class InspectDialog extends StatelessWidget {
  const InspectDialog({
    super.key,
    required this.component,
    required this.inspection,
    required this.oracle,
    required this.layer,
    required this.cell,
    required this.scope,
    required this.filter,
    required this.editable,
    required this.onAxis,
    required this.onLayer,
    required this.onCell,
    required this.onScope,
    required this.onFilter,
    required this.onChange,
    required this.onReport,
    required this.onClose,
    required this.errorKey,
    this.busy,
    this.readOnly,
    this.regenerating = false,
    this.strip,
    this.foot = const [],
    this.error,
  });

  final String component;
  final WorkbenchInspection inspection;

  /// The component's oracle, which the preview draws the variant in view from.
  final Map<String, dynamic>? oracle;

  /// The layer and cell chosen, and the scope chosen for it (null: the narrowest).
  final String layer;
  final String? cell, scope;

  /// Filter tokens' text, which the bar keeps: it starts again at the family on another cell,
  /// layer or variant, and after a set.
  final TextEditingController filter;

  /// Whether anything may be chosen or changed: no edit pending anywhere, and no action running.
  /// Otherwise Close, Report and the strip alone are enabled; the rest stays in view.
  final bool editable;

  /// Called with the variant whose axes all match the choices, the layer chosen (in the tree or by
  /// pointing), the cell, the scope, and a value with the scope it is set at; [onFilter] when the
  /// filter's text changed.
  final ValueChanged<int> onAxis;
  final ValueChanged<String> onLayer, onCell, onScope;
  final VoidCallback onFilter;
  final void Function(String value, String scope) onChange;
  final VoidCallback onReport, onClose;

  /// What the service is doing, where it says; why the dialog is read only, where an edit is
  /// pending; whether the preview is being regenerated.
  final String? busy, readOnly;
  final bool regenerating;

  /// The pending edit's strip, where it is this component's.
  final Widget? strip;

  /// What else the foot says (the file Send to agent saved).
  final List<Widget> foot;

  /// The error shown, keyed [errorKey].
  final String? error;
  final Key errorKey;

  WorkbenchLayer get _layer =>
      inspection.layers.where((l) => l.name == layer).firstOrNull ??
      inspection.layers.first;

  /// The layers in tree order, each with its depth: every layer after its parent, siblings in the
  /// inspection's order.
  List<(WorkbenchLayer, int)> _tree() {
    final names = {for (final l in inspection.layers) l.name};
    final out = <(WorkbenchLayer, int)>[];
    void add(String? parent, int depth) {
      for (final l in inspection.layers) {
        final p = names.contains(l.parent) ? l.parent : null;
        if (p == parent && l.name != parent) {
          out.add((l, depth));
          add(l.name, depth + 1);
        }
      }
    }

    add(null, 0);
    return out;
  }

  @override
  Widget build(BuildContext context) {
    final t = SolarTheme.of(context);
    final small = workbenchSmall(t);
    final brightness = Theme.of(context).brightness;
    return Semantics(
      container: true,
      scopesRoute: true,
      namesRoute: true,
      explicitChildNodes: true,
      label: 'Inspect $component',
      child: Stack(
        fit: StackFit.expand,
        children: [
          const SolarScrim(),
          // A Material, which SOLAR's fields (Material text fields underneath) need above them.
          Material(
            color: t.colors.surfaceBackground,
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.all(SolarInset.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  spacing: SolarStack.md,
                  children: [
                    _header(t, small),
                    Expanded(
                      // The strip takes what it needs, up to half; the columns the rest.
                      child: LayoutBuilder(
                        builder: (context, constraints) => Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          spacing: SolarStack.md,
                          children: [
                            Expanded(
                              child: _columns(
                                t,
                                brightness,
                                MediaQuery.textScalerOf(context),
                                small,
                              ),
                            ),
                            if (strip != null || foot.isNotEmpty)
                              ConstrainedBox(
                                constraints: BoxConstraints(
                                  maxHeight: constraints.maxHeight / 2,
                                ),
                                child: _scroll(_foot()),
                              ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// The layers, the preview, and the properties with the chosen cell's editor: the tree a fifth
  /// of the width, the preview and the properties two fifths each.
  Widget _columns(
    SolarTheme t,
    Brightness brightness,
    TextScaler scaler,
    TextStyle small,
  ) => Row(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    spacing: SolarInset.md,
    children: [
      Expanded(child: _scroll(_layers())),
      Expanded(
        flex: 2,
        child: WorkbenchPreview(
          component: component,
          oracle: oracle,
          index: inspection.variant,
          layer: _layer.name,
          layers: {for (final l in inspection.layers) l.name},
          regenerating: regenerating,
          onPoint: editable ? onLayer : null,
        ),
      ),
      Expanded(
        flex: 2,
        child: _scroll(_properties(t, brightness, scaler, small)),
      ),
    ],
  );

  /// The pending edit's strip, and what else the foot says.
  Widget _foot() => Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    spacing: SolarStack.sm,
    children: [
      if (strip case final strip?)
        Semantics(container: true, label: 'Pending edit', child: strip),
      ...foot,
    ],
  );

  Widget _scroll(Widget child) => SingleChildScrollView(child: child);

  Widget _header(SolarTheme t, TextStyle small) {
    final current = inspection.current?.parts ?? const <String, String>{};
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: SolarStack.xs,
      children: [
        Row(
          spacing: SolarInset.md,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              component,
              style: t.typography.titleSm.copyWith(color: t.colors.textPrimary),
            ),
            Expanded(
              child: Wrap(
                spacing: SolarInset.xs,
                runSpacing: SolarInset.xs,
                crossAxisAlignment: WrapCrossAlignment.end,
                children: [
                  for (final axis in inspection.axes)
                    IntrinsicWidth(child: _axis(axis, current)),
                ],
              ),
            ),
            workbenchButton('Report', onReport),
            solarCloseButton(onPressed: onClose, label: 'Close'),
          ],
        ),
        // Announced as they change.
        if (busy != null || readOnly != null)
          Semantics(
            liveRegion: true,
            child: Text([?readOnly, ?busy].join(' · '), style: small),
          ),
        if (error case final error?) WorkbenchAlert(error, textKey: errorKey),
      ],
    );
  }

  /// The variant whose parts are [current]'s with [axis] at [value], or null where none is drawn.
  WorkbenchVariant? _variantWith(
    Map<String, String> current,
    String axis,
    String value,
  ) {
    final want = {...current, axis: value};
    return inspection.variants
        .where((v) => want.entries.every((e) => v.parts[e.key] == e.value))
        .firstOrNull;
  }

  Widget _axis(
    ({String name, List<String> values}) axis,
    Map<String, String> current,
  ) => SolarSelect<String>(
    size: SolarSelectSize.sm,
    enabled: editable,
    label: axis.name,
    value: current[axis.name],
    options: [
      for (final v in axis.values)
        SolarSelectOption(
          value: v,
          label: v,
          enabled: _variantWith(current, axis.name, v) != null,
        ),
    ],
    onChanged: editable
        ? (v) {
            final variant = _variantWith(current, axis.name, v);
            if (variant != null && variant.index != inspection.variant) {
              onAxis(variant.index);
            }
          }
        : null,
  );

  Widget _layers() => Semantics(
    container: true,
    label: 'Layers',
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final (l, depth) in _tree())
          // Every layer is shown, nested: nothing to expand or collapse.
          SolarTreeItem(
            label: l.name,
            depth: depth.clamp(0, 10),
            selected: l.name == _layer.name,
            expandable: false,
            tag: _marks(l),
            onSelect: editable ? () => onLayer(l.name) : null,
          ),
      ],
    ),
  );

  /// A layer's marks, as Tags after its name: hidden in this variant, set by an overlay rule (the
  /// word the properties' From column says); null where it has none.
  Widget? _marks(WorkbenchLayer l) {
    final marks = [
      if (l.hidden)
        const SolarTag(status: SolarTagStatus.neutral, label: 'hidden here'),
      if (l.cells.any((c) => c.origin == 'rule')) _origin('rule'),
    ];
    return marks.isEmpty
        ? null
        : Row(
            mainAxisSize: MainAxisSize.min,
            spacing: SolarInset.$2xs,
            children: marks,
          );
  }

  Widget _swatch(SolarTheme t, Color? colour) => colour == null
      ? const SizedBox.shrink()
      : SizedBox.square(
          dimension: SolarIconSize.sm,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: colour,
              border: Border.all(
                color: t.colors.borderMedium,
                width: SolarBorder.$default,
              ),
              borderRadius: BorderRadius.circular(SolarRadius.subtle),
            ),
          ),
        );

  static SolarTagStatus _originStatus(String origin) => switch (origin) {
    'rule' => SolarTagStatus.warning,
    'defaults' => SolarTagStatus.info,
    _ => SolarTagStatus.neutral,
  };

  /// Where an entry comes from, as a Tag.
  Widget _origin(String origin) =>
      SolarTag(status: _originStatus(origin), label: originText(origin));

  /// How wide [text] lays out on one line in [style].
  static double _textWidth(String text, TextStyle? style, TextScaler scaler) {
    final painter = TextPainter(
      text: TextSpan(text: text, style: style),
      textDirection: TextDirection.ltr,
      textScaler: scaler,
      maxLines: 1,
    )..layout();
    final width = painter.width;
    painter.dispose();
    return width.ceilToDouble();
  }

  /// How wide an origin's Tag is: its words in the Tag's text style, and its padding, as its recipe
  /// gives them.
  static double _tagWidth(SolarTheme t, TextScaler scaler, String origin) {
    final p = SolarTagProps(
      status: _originStatus(origin),
      type: SolarTagType.textOnly,
    );
    const states = <WidgetState>{};
    final style = SolarTagRecipe.textStyle(t, 'label.typography', p, states);
    return _textWidth(originText(origin), style, scaler) +
        (SolarTagRecipe.dimension('root.paddingLeft', p, states) ??
            SolarInset.none) +
        (SolarTagRecipe.dimension('root.paddingRight', p, states) ??
            SolarInset.none) +
        SolarBorder.strong;
  }

  /// The four columns of a property row, and of the headings over them: the cell's name as wide
  /// as the longest ([widths].cell), never broken; the token and the value sharing what is left,
  /// the value's words wrapping; the origin as wide as its widest Tag ([widths].from).
  Widget _cells(List<Widget> four, ({double cell, double from}) widths) => Row(
    spacing: SolarInset.xs,
    children: [
      SizedBox(width: widths.cell, child: four[0]),
      Expanded(flex: 3, child: four[1]),
      Expanded(flex: 2, child: four[2]),
      SizedBox(
        width: widths.from,
        // Where the room is short all the same, the Tag shrinks rather than being cut.
        child: Align(
          alignment: Alignment.centerLeft,
          child: FittedBox(fit: BoxFit.scaleDown, child: four[3]),
        ),
      ),
    ],
  );

  /// The heading, the table of the selected layer's cells, and the chosen cell's editor under its
  /// row.
  Widget _properties(
    SolarTheme t,
    Brightness brightness,
    TextScaler scaler,
    TextStyle small,
  ) {
    final l = _layer;
    final text = t.typography.bodyXsRegular.copyWith(
      color: t.colors.textPrimary,
    );
    final quiet = t.typography.bodyXsRegular.copyWith(
      color: t.colors.textSecondary,
    );
    final name = t.typography.labelSm.copyWith(color: t.colors.textPrimary);
    final heading = t.typography.labelSm.copyWith(
      color: t.colors.textSecondary,
    );
    final widths = (
      cell: [
        _textWidth('Cell', heading, scaler),
        for (final c in l.cells) _textWidth(c.cell, name, scaler),
      ].reduce((a, b) => a > b ? a : b),
      from: [
        _textWidth('From', heading, scaler),
        for (final c in l.cells) _tagWidth(t, scaler, c.origin),
      ].reduce((a, b) => a > b ? a : b),
    );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: SolarStack.xs,
      children: [
        Text(
          '${l.name}: properties',
          style: t.typography.titleXs.copyWith(color: t.colors.textPrimary),
        ),
        Semantics(
          container: true,
          label: 'Properties',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (l.cells.isNotEmpty)
                ExcludeSemantics(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: SolarInset.xs,
                    ),
                    child: _cells([
                      Text('Cell', style: heading, softWrap: false),
                      Text('Token', style: heading, softWrap: false),
                      Text('Value', style: heading, softWrap: false),
                      Text('From', style: heading, softWrap: false),
                    ], widths),
                  ),
                ),
              for (final c in l.cells) ...[
                _row(t, brightness, c, text, quiet, name, widths),
                if (c.cell == cell)
                  Semantics(
                    container: true,
                    label: '${l.name} · ${c.cell}',
                    child: Padding(
                      padding: const EdgeInsets.all(SolarInset.xs),
                      child: _editor(t, brightness, small, l, c),
                    ),
                  ),
              ],
            ],
          ),
        ),
      ],
    );
  }

  /// One cell's row, a whole-row target that chooses the cell: its name, token, value (with a
  /// swatch for a colour) and where it comes from.
  Widget _row(
    SolarTheme t,
    Brightness brightness,
    WorkbenchCell c,
    TextStyle text,
    TextStyle quiet,
    TextStyle name,
    ({double cell, double from}) widths,
  ) => Semantics(
    button: true,
    enabled: editable,
    selected: c.cell == cell,
    label: '${c.cell} ${c.entry} ${c.value} ${originText(c.origin)}',
    excludeSemantics: true,
    onTap: editable ? () => onCell(c.cell) : null,
    child: SolarPressable(
      onPressed: editable ? () => onCell(c.cell) : null,
      builder: (context, states) => Container(
        constraints: const BoxConstraints(minHeight: SolarSize.targetMin),
        padding: const EdgeInsets.symmetric(horizontal: SolarInset.xs),
        decoration: BoxDecoration(
          color: c.cell == cell
              ? t.colors.surfaceActive
              : states.contains(WidgetState.hovered)
              ? t.colors.surfaceHover
              : t.colors.surfaceBackground,
          // The keyboard's focus, drawn as SOLAR draws a focused field's edge.
          border: states.contains(WidgetState.focused)
              ? Border.all(
                  color: t.colors.borderFeedbackFocusStrong,
                  width: SolarBorder.strong,
                )
              : null,
        ),
        child: _cells([
          // One line each, never broken within the word; cut with an ellipsis only where the
          // room is truly short.
          Text(
            c.cell,
            style: name,
            maxLines: 1,
            softWrap: false,
            overflow: TextOverflow.ellipsis,
          ),
          Text(
            c.entry,
            style: text,
            maxLines: 1,
            softWrap: false,
            overflow: TextOverflow.ellipsis,
          ),
          Row(
            spacing: SolarInset.xs,
            children: [
              _swatch(t, swatchOf(c.value, brightness)),
              Flexible(child: Text(c.value, style: quiet)),
            ],
          ),
          _origin(c.origin),
        ], widths),
      ),
    ),
  );

  /// Filter tokens: Escape, where it holds text, clears it and leaves the dialog open.
  Widget _filterField() => Focus(
    canRequestFocus: false,
    skipTraversal: true,
    onKeyEvent: (_, event) {
      if (event is KeyDownEvent &&
          event.logicalKey == LogicalKeyboardKey.escape &&
          filter.text.isNotEmpty) {
        filter.clear();
        onFilter();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored;
    },
    child: SolarSearchField(
      size: SolarSearchFieldSize.sm,
      semanticLabel: 'Filter tokens',
      placeholder: 'Filter tokens',
      enabled: editable,
      controller: filter,
      onChanged: (_) => onFilter(),
    ),
  );

  /// The chosen cell's editor: the scope to apply a change to, the filter and the value to change
  /// it to, or why it offers none; and why it is what it is now.
  Widget _editor(
    SolarTheme t,
    Brightness brightness,
    TextStyle small,
    WorkbenchLayer l,
    WorkbenchCell c,
  ) {
    final scope = scopeFor(c, this.scope);
    final offers = c.choices.isNotEmpty || c.keywords.isNotEmpty || c.none;
    final matched = matching(c, filter.text);
    final title = Text(
      '${l.name} · ${c.cell}',
      style: t.typography.labelSm.copyWith(color: t.colors.textPrimary),
    );
    final why = Text('Why it is this now: ${whyText(c)}', style: small);
    if (c.note != null || !offers || scope == null) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        spacing: SolarStack.xs,
        children: [
          title,
          Text(
            c.note ?? '${c.entry}. Nothing to change it to here: use Report.',
            style: small,
          ),
          why,
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      spacing: SolarStack.xs,
      children: [
        title,
        SolarSelect<String>(
          size: SolarSelectSize.sm,
          enabled: editable,
          label: 'Apply to',
          value: scope,
          options: [
            for (final s in c.scopes)
              SolarSelectOption(
                value: s.key,
                label:
                    '${s.label}: changes ${s.count} of ${variantsText(c.total)}${s.current ? ' (set here now)' : ''}',
                helper: s.wins == null
                    ? null
                    : 'a narrower rule (${s.winsLabel ?? s.wins}) decides this variant',
                enabled: s.wins == null,
              ),
          ],
          onChanged: editable ? onScope : null,
        ),
        _filterField(),
        SolarSelect<String>(
          size: SolarSelectSize.sm,
          enabled: editable && matched.isNotEmpty,
          label: 'Change to',
          placeholder: 'Choose',
          helper: matched.isEmpty
              ? 'No token matches'
              : '${matched.length} of ${c.choices.length}',
          options: [
            // The value beside the name, not under it: a row of one line, so the list fits the
            // room below the field.
            for (final ch in matched.take(changeToCap))
              SolarSelectOption(
                value: ch.name,
                label:
                    '${ch.name} · ${ch.value}${ch.name == c.entry ? ' · current' : ''}',
                icon: switch (swatchOf(ch.value, brightness)) {
                  final colour? => _swatch(t, colour),
                  null => null,
                },
              ),
            if (matched.length > changeToCap)
              SolarSelectOption(
                value: _more,
                label:
                    '…and ${matched.length - changeToCap} more: filter to narrow',
                enabled: false,
              ),
            for (final k in c.keywords) SolarSelectOption(value: k, label: k),
            if (c.none) const SolarSelectOption(value: 'none', label: 'none'),
          ],
          onChanged: editable && matched.isNotEmpty
              ? (v) {
                  if (v != _more) onChange(v, scope);
                }
              : null,
        ),
        why,
      ],
    );
  }
}
