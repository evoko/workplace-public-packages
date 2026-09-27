// The Inspect dialog's preview (inspect_dialog.dart): the variant in view as the Variants use case
// draws it (VariantStage), scaled to fit its pane, with the selected layer outlined (the outline
// follows the scaling); a tap on a part of it selects that part's layer; "Regenerating…" over it
// while the service works. A layer is found by its key, `<prefix>.<layer>`, as SolarLayers keys
// every layer it draws (packages/solar_flutter/lib/src/solar_layers.dart); a component Material
// draws (Button among them) has no such keys, so its preview names the selected layer beside it
// instead of outlining it, and a tap there selects nothing. As the web's preview
// (packages/components/stories/workbench/preview.tsx), which finds a layer by its recipe selector.

import 'package:flutter/material.dart';
import 'package:solar_flutter/solar_flutter.dart';

import '../variant_stage.dart';

/// The prefix [component]'s layers are keyed under, as its widget names them: its words run
/// together in lower camel case, a leading acronym lower-cased whole (`Option Card` → `optionCard`,
/// `PIN Input` → `pinInput`).
String layerKeyPrefix(String component) {
  final words = component
      .split(RegExp(r'[\s_-]+'))
      .where((w) => w.isNotEmpty)
      .toList();
  if (words.isEmpty) return '';
  final first = words.first;
  final lead = first == first.toUpperCase()
      ? first.toLowerCase()
      : '${first[0].toLowerCase()}${first.substring(1)}';
  return [
    lead,
    for (final w in words.skip(1)) '${w[0].toUpperCase()}${w.substring(1)}',
  ].join();
}

/// One layer the preview draws: its name, its element, and how deep it sits in the tree.
typedef _Drawn = ({String layer, Element element, int depth});

class WorkbenchPreview extends StatefulWidget {
  const WorkbenchPreview({
    super.key,
    required this.component,
    required this.oracle,
    required this.index,
    required this.layer,
    required this.layers,
    this.regenerating = false,
    this.onPoint,
  });

  final String component;

  /// The component's oracle, whose variant [index] is drawn; null where the viewer has none, and
  /// nothing is drawn.
  final Map<String, dynamic>? oracle;
  final int index;

  /// The selected layer, outlined.
  final String layer;

  /// The layers the inspection lists: the ones a tap may select.
  final Set<String> layers;

  /// Whether the service is regenerating the component: said over the preview.
  final bool regenerating;

  /// Called with the layer under a tap; null where nothing may be selected now.
  final ValueChanged<String>? onPoint;

  @override
  State<WorkbenchPreview> createState() => _WorkbenchPreviewState();
}

class _WorkbenchPreviewState extends State<WorkbenchPreview> {
  final _stack = GlobalKey();
  final _stage = GlobalKey();

  /// The selected layer's box, in the stack's coordinates, where it is drawn.
  Rect? _outline;

  /// Whether the component keys its layers at all: false for one Material draws.
  bool _keyed = false;

  /// The keyed layers under the stage, outermost first: each `<prefix>.<layer>` of a layer the
  /// inspection lists (a component nested in it keys its own under another prefix).
  List<_Drawn> _drawn() {
    final found = <_Drawn>[];
    final root = _stage.currentContext as Element?;
    if (root == null) return found;
    final prefix = '${layerKeyPrefix(widget.component)}.';
    void visit(Element e, int depth) {
      final key = e.widget.key;
      if (key is ValueKey<String> && key.value.startsWith(prefix)) {
        final layer = key.value.substring(prefix.length);
        if (widget.layers.contains(layer)) {
          found.add((layer: layer, element: e, depth: depth));
        }
      }
      e.visitChildElements((c) => visit(c, depth + 1));
    }

    root.visitChildElements((c) => visit(c, 0));
    return found;
  }

  /// [e]'s box, in [ancestor]'s coordinates (the screen's where null); null where it has none.
  Rect? _rectOf(Element e, RenderObject? ancestor) {
    final box = e.renderObject;
    if (box is! RenderBox || !box.attached || !box.hasSize) return null;
    return MatrixUtils.transformRect(
      box.getTransformTo(ancestor),
      Offset.zero & box.size,
    );
  }

  /// Measures the selected layer after the frame lays it out, and redraws the outline where it
  /// moved (another variant, another layer, a regeneration, a resize).
  void _measure(Duration _) {
    if (!mounted) return;
    final stack = _stack.currentContext?.findRenderObject();
    final drawn = _drawn();
    final selected = drawn.where((d) => d.layer == widget.layer).firstOrNull;
    final rect = selected == null ? null : _rectOf(selected.element, stack);
    if (rect != _outline || drawn.isNotEmpty != _keyed) {
      setState(() {
        _outline = rect;
        _keyed = drawn.isNotEmpty;
      });
    }
  }

  /// A tap selects the innermost keyed layer under it; the component never sees it.
  void _tap(TapUpDetails details) {
    final onPoint = widget.onPoint;
    if (onPoint == null) return;
    _Drawn? hit;
    for (final d in _drawn()) {
      final rect = _rectOf(d.element, null);
      if (rect == null || !rect.contains(details.globalPosition)) continue;
      if (hit == null || d.depth > hit.depth) hit = d;
    }
    if (hit != null) onPoint(hit.layer);
  }

  @override
  Widget build(BuildContext context) {
    final t = SolarTheme.of(context);
    final oracle = widget.oracle;
    final drawable =
        oracle != null &&
        widget.index >= 0 &&
        widget.index < variantsOf(oracle).length;
    WidgetsBinding.instance.addPostFrameCallback(_measure);
    final outline = _outline;
    final small = t.typography.bodyXsRegular.copyWith(
      color: t.colors.textSecondary,
    );
    return Semantics(
      container: true,
      label: 'Preview',
      child: LayoutBuilder(
        // A new size lays the stage out again: the outline is measured again after it.
        builder: (context, constraints) => Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          spacing: SolarStack.xs,
          children: [
            Flexible(
              child: GestureDetector(
                behavior: HitTestBehavior.opaque,
                onTapUp: _tap,
                child: Stack(
                  key: _stack,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(SolarInset.lg),
                      // Drawn large, never used: no pointer, no focus reaches the component.
                      child: IgnorePointer(
                        child: ExcludeFocus(
                          child: KeyedSubtree(
                            key: _stage,
                            child: drawable
                                // Scaled to fill the pane, keeping its proportions.
                                ? SizedBox.expand(
                                    child: FittedBox(
                                      child: VariantStage(
                                        component: widget.component,
                                        oracle: oracle,
                                        index: widget.index,
                                      ),
                                    ),
                                  )
                                : const SizedBox.shrink(),
                          ),
                        ),
                      ),
                    ),
                    if (outline != null)
                      Positioned.fromRect(
                        rect: outline,
                        child: IgnorePointer(
                          child: Semantics(
                            label: 'Selected layer outline',
                            child: DecoratedBox(
                              decoration: BoxDecoration(
                                border: Border.all(
                                  color: t.colors.borderFeedbackFocusStrong,
                                  width: SolarBorder.strong,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (widget.regenerating)
                      Positioned(
                        top: SolarInset.none,
                        left: SolarInset.none,
                        right: SolarInset.none,
                        child: Semantics(
                          liveRegion: true,
                          child: Text(
                            'Regenerating…',
                            style: small,
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            if (outline == null)
              Text(
                !drawable
                    ? '${widget.layer}: no variant ${widget.index} to draw'
                    : _keyed
                    ? '${widget.layer}: not drawn in this variant'
                    : '${widget.layer}: selected (Flutter finds no layer of a component Material draws, so none is outlined)',
                style: small,
                textAlign: TextAlign.center,
              ),
          ],
        ),
      ),
    );
  }
}
