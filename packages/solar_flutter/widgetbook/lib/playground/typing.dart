/// A typing component's Playground wiring, the same for every field that holds its words in a
/// caller's TextEditingController (Text Input, Text Area, Password, PIN, Search, and Token Input's
/// draft): the controller, kept in step with the control that holds the words.
library;

import 'package:flutter/widgets.dart';

/// Keeps a TextEditingController for [builder]'s field, holding [text] (the control's words, read
/// by the builder: `p.text('value')`). The adapter keeps this state across the rebuild every knob
/// change makes, so the cursor stays where the tester types: the controller takes [text] only where
/// it differs from what the controller holds (the panel changed it, or Reset), and then puts the
/// cursor at the end; typing, which the field's `onChanged` sets back, never moves it.
///
/// A field with no `onChanged` of its own for these words (Token Input's draft) is given [onChanged]:
/// called with the controller's words whenever they change from anything but [text] (the tester
/// typing, or the field clearing them), so the builder can set the control back.
class PlaygroundText extends StatefulWidget {
  const PlaygroundText({
    super.key,
    required this.text,
    required this.builder,
    this.onChanged,
  });

  /// The words the control holds.
  final String text;

  /// Called with the controller's words where they come to differ from [text].
  final ValueChanged<String>? onChanged;

  /// The field, given the controller.
  final Widget Function(BuildContext context, TextEditingController controller)
  builder;

  @override
  State<PlaygroundText> createState() => _PlaygroundTextState();
}

class _PlaygroundTextState extends State<PlaygroundText> {
  late final _controller = TextEditingController(text: widget.text)
    ..addListener(_changed);

  /// The words the control holds, as far as this field knows: the last [PlaygroundText.text], or
  /// the words last reported through [PlaygroundText.onChanged], whose write may not have come back
  /// yet (the field typed on, or cleared itself, before the next build).
  late var _known = widget.text;

  /// The words changed: where they are not the control's, the field changed them. A notification
  /// that moves only the selection is no change.
  void _changed() {
    final text = _controller.text;
    if (text == _known) return;
    _known = text;
    widget.onChanged?.call(text);
  }

  @override
  void didUpdateWidget(PlaygroundText old) {
    super.didUpdateWidget(old);
    final text = widget.text;
    if (text != old.text) _known = text;
    if (_controller.text != text) {
      _controller.value = TextEditingValue(
        text: text,
        selection: TextSelection.collapsed(offset: text.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.builder(context, _controller);
}
