import 'package:flutter/material.dart';

import 'solar_target.dart';

/// A field SOLAR draws itself (Text Input, Text Area, SearchField…): its words' controller and
/// focus, the caller's or its own, and its states for [builder] to draw it in. It is hovered and
/// focused as the field is, not as the TextField's own box, which holds only its words, and it
/// takes the states the caller forces beside its own (the visual checks force a state through
/// [statesController]).
///
/// Hand written, like [SolarPressable]: the shells of the fields share it, as the drawn components
/// share SolarLayers.
class SolarField extends StatefulWidget {
  /// A field drawn by [builder], rebuilt as its words and its states change.
  const SolarField({
    super.key,
    this.controller,
    this.focusNode,
    this.statesController,
    this.obscured = false,
    required this.builder,
  });

  /// Its words, where the caller keeps them; one of its own, empty, otherwise.
  final TextEditingController? controller;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Whether its words start hidden, as a password's are, until the user shows them.
  final bool obscured;

  /// The field in its current words and states.
  final Widget Function(BuildContext context, SolarFieldParts field) builder;

  @override
  State<SolarField> createState() => _SolarFieldState();
}

/// What a field's builder draws with.
class SolarFieldParts {
  const SolarFieldParts._(
    this.text,
    this.focus,
    this.states,
    this.obscured,
    this._hover,
    this._reveal,
  );

  /// Its words.
  final TextEditingController text;

  /// Its words' focus.
  final FocusNode focus;

  /// Its states: its own, hovered and focused, and those the caller forces.
  final Set<WidgetState> states;

  /// Whether its words are hidden, as a password's are.
  final bool obscured;

  final void Function(bool) _hover;
  final VoidCallback _reveal;

  /// Shows its hidden words, or hides them again (Password Input's eye).
  void reveal() => _reveal();

  /// [field], the layer that is the field, hovered as a whole, and focusing the words on a tap
  /// anywhere in it, or in its target around it ([SolarTarget.inside]), where it is [enabled].
  Widget area(Widget field, {required bool enabled}) => SolarTarget.inside(
    child: MouseRegion(
      cursor: enabled ? SystemMouseCursors.text : MouseCursor.defer,
      onEnter: (_) => _hover(true),
      onExit: (_) => _hover(false),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: enabled ? focus.requestFocus : null,
        child: field,
      ),
    ),
  );

  /// [words], read as one text field named by [label] and described by [hint]: the label and the
  /// helper drawn beside it are then left unread (ExcludeSemantics), and a control in the field (a
  /// clear button) stays its own.
  Widget read(Widget words, {String? label, String? hint}) => MergeSemantics(
    child: Semantics(label: label, hint: hint, child: words),
  );
}

class _SolarFieldState extends State<SolarField> {
  late bool _obscured = widget.obscured;
  TextEditingController? _ownText;
  FocusNode? _ownFocus;

  /// Hovered and focused as the field is.
  final _states = WidgetStatesController();

  TextEditingController get _text =>
      widget.controller ?? (_ownText ??= TextEditingController());

  FocusNode get _focus => widget.focusNode ?? (_ownFocus ??= FocusNode());

  @override
  void initState() {
    super.initState();
    _focus.addListener(_focused);
  }

  @override
  void didUpdateWidget(SolarField old) {
    super.didUpdateWidget(old);
    if (old.focusNode != widget.focusNode) {
      (old.focusNode ?? _ownFocus)?.removeListener(_focused);
      _focus.addListener(_focused);
      _focused();
    }
  }

  void _focused() => _states.update(WidgetState.focused, _focus.hasFocus);

  @override
  void dispose() {
    _focus.removeListener(_focused);
    _ownText?.dispose();
    _ownFocus?.dispose();
    _states.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final forced = widget.statesController;
    return ListenableBuilder(
      listenable: Listenable.merge([_text, _states, ?forced]),
      builder: (context, _) => widget.builder(
        context,
        SolarFieldParts._(
          _text,
          _focus,
          {..._states.value, ...?forced?.value},
          _obscured,
          (on) => _states.update(WidgetState.hovered, on),
          () => setState(() => _obscured = !_obscured),
        ),
      ),
    );
  }
}
