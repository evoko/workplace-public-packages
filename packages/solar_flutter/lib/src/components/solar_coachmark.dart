/// SOLAR Coachmark.
///
/// Written by hand, and never regenerated; its layer tree is the IR's, [SolarCoachmarkRecipe.tree].
/// What it looks like is not here. That is the recipe, [SolarCoachmarkRecipe]: the card, its words'
/// text styles, and its connector's line, dot and place, read cell by cell.
///
/// One step of a guided product tour, as the description says, drawn from Figma's layer tree with
/// [SolarLayers]: its [title], [body] and [counter] ("1 / 6 steps") on the card, the caller's Back
/// and Next ([actions], a [SolarButtonGroup]) under them, and a connector from the card's [side] to
/// the element the step is about ([child]), which it sits beside, the connector's length off it,
/// in an overlay while [open]. A dialog that is not modal, named by its title, its words announced
/// politely; the focus moves to it on each step. Escape and its close button call [onClose], which
/// ends the tour: a tour is always skippable. Which step it is, and what Back and Next do, are the
/// caller's. Without a [child] it is the card alone.
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';

import '../generated/components/coachmark.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_node_end.dart';
import 'solar_theme_of.dart';

class SolarCoachmark extends StatefulWidget {
  const SolarCoachmark({
    super.key,
    required this.title,
    this.body,
    this.counter,
    this.actions,
    this.onClose,
    this.closeLabel = 'Close',
    this.side = SolarCoachmarkSide.right,
    this.child,
    this.open = false,
  });

  /// The step's title, which names it.
  final String title;

  /// The step's words.
  final String? body;

  /// Which step of how many, in the caller's words ("1 / 6 steps").
  final String? counter;

  /// Back and Next: a [SolarButtonGroup] (regular, two md secondary buttons).
  final Widget? actions;

  /// Ends the tour: its close button, Escape.
  final VoidCallback? onClose;

  /// What its close button says to a screen reader.
  final String closeLabel;

  final SolarCoachmarkSide side;

  /// The element the step is about; without one, the card alone is drawn.
  final Widget? child;

  /// Whether it shows, where it has a [child].
  final bool open;

  @override
  State<SolarCoachmark> createState() => _SolarCoachmarkState();
}

class _SolarCoachmarkState extends State<SolarCoachmark> {
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  final _focus = FocusNode(debugLabel: 'SolarCoachmark');
  var _listening = false;

  @override
  void initState() {
    super.initState();
    _follow();
  }

  @override
  void didUpdateWidget(SolarCoachmark old) {
    super.didUpdateWidget(old);
    final step = old.title != widget.title || old.counter != widget.counter;
    if (old.open != widget.open || old.child != widget.child || step) {
      _follow();
    }
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_key);
    _focus.dispose();
    super.dispose();
  }

  /// Escape ends the tour wherever the focus is, as on the web: the coachmark is not modal, and
  /// the focus may have moved on from it.
  bool _key(KeyEvent event) {
    if (event is! KeyDownEvent ||
        event.logicalKey != LogicalKeyboardKey.escape) {
      return false;
    }
    widget.onClose?.call();
    return true;
  }

  /// Shows or hides the overlay as [SolarCoachmark.open] says, once the frame is built, the focus
  /// on the card on each step.
  void _follow() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final show = widget.open && widget.child != null;
      if (show && !_portal.isShowing) _portal.show();
      if (!show && _portal.isShowing) _portal.hide();
      // Shown, in place or over its element: Escape ends the tour.
      final listens = widget.child == null || widget.open;
      if (listens != _listening) {
        _listening = listens;
        listens
            ? HardwareKeyboard.instance.addHandler(_key)
            : HardwareKeyboard.instance.removeHandler(_key);
      }
      if (show) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) _focus.requestFocus();
        });
      }
    });
  }

  Widget _card(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarCoachmarkProps(side: widget.side);
    const states = <WidgetState>{};
    bool drawn(String l) => SolarCoachmarkRecipe.present(l, p, states);
    final card = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarCoachmarkRecipe.lookup(c, p, states),
        dimension: (c) => SolarCoachmarkRecipe.dimension(c, p, states),
        color: (c) => SolarCoachmarkRecipe.color(t, c, p, states),
        shadow: (c) => SolarCoachmarkRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarCoachmarkRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn; its close button only where it can close.
        present: (l) => switch (l) {
          'close' => widget.onClose != null && drawn(l),
          'body' => widget.body != null && drawn(l),
          'counter' => widget.counter != null && drawn(l),
          'actions' => widget.actions != null && drawn(l),
          _ => drawn(l),
        },
        glyph: (l) => SolarCoachmarkRecipe.glyph(l, p, states),
      ),
      tree: SolarCoachmarkRecipe.tree,
      keyPrefix: 'coachmark',
      text: {
        'title': widget.title,
        'body': ?widget.body,
        'counter': ?widget.counter,
      },
      wraps: const {
        'title': TextAlign.center,
        'body': TextAlign.start,
        'counter': TextAlign.start,
      },
      icons: const {'close': SolarIcons.closeOutline},
      builders: {
        'close': (close) => SolarTarget.inside(
          child: Semantics(
            // A node of its own, so the control keeps its name inside the card's.
            container: true,
            child: SolarPressable(
              onPressed: widget.onClose,
              builder: (_, _) => Semantics(
                label: widget.closeLabel,
                excludeSemantics: true,
                child: close,
              ),
            ),
          ),
        ),
        // The connector is decorative: the words say what the step is about.
        'connector': (connector) => ExcludeSemantics(child: connector),
      },
      composed: {
        'nodeEnd': const SolarNodeEnd(halo: true),
        'actions': ?widget.actions,
      },
    ).layer('root');
    return Semantics(
      role: SemanticsRole.dialog,
      explicitChildNodes: true,
      liveRegion: true,
      label: widget.title,
      child: Focus(
        focusNode: _focus,
        child: Material(type: MaterialType.transparency, child: card),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final child = widget.child;
    if (child == null) return _card(context);
    final p = SolarCoachmarkProps(side: widget.side);
    // The connector's length off the element, so its end meets it; the card on the side away
    // from the one the connector leaves.
    final reach =
        SolarCoachmarkRecipe.dimension('connector.width', p, const {}) ?? 0;
    final (target, follower, offset) = switch (widget.side) {
      SolarCoachmarkSide.right => (
        Alignment.centerLeft,
        Alignment.centerRight,
        Offset(-reach, 0),
      ),
      SolarCoachmarkSide.left => (
        Alignment.centerRight,
        Alignment.centerLeft,
        Offset(reach, 0),
      ),
    };
    return OverlayPortal(
      controller: _portal,
      overlayChildBuilder: (context) => CompositedTransformFollower(
        link: _link,
        targetAnchor: target,
        followerAnchor: follower,
        offset: offset,
        child: Align(alignment: follower, child: _card(context)),
      ),
      child: CompositedTransformTarget(link: _link, child: child),
    );
  }
}
