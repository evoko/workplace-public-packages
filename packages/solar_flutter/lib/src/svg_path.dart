import 'dart:ui' show Path;

/// Turns SVG path data into a [Path].
///
/// Hand written, not generated. A parser is behaviour, not data: the generated files under
/// `lib/src/generated/` are recipes -- geometry and a name -- and everything that reads them
/// lives outside that tree, the way `icon.tsx` sits outside `src/generated/` on the React side.
///
/// **It accepts exactly what the generator accepts.** `checkPathData` in
/// `packages/codegen/src/normalize/svg.mjs` validates every `d` string at generation time and
/// this function replays it at run time, so the two have to agree in both directions. If this
/// parser were stricter, a future Figma export could pass the build and then throw inside an
/// app; if it were looser, it would draw something the generator never checked. The command set
/// is stated once, in [_commands], and `packages/codegen/test/flutter-svg-path.test.mjs` reads
/// this file and asserts it matches `SUPPORTED_COMMANDS` so the two cannot drift apart.

/// The commands this parser draws, absolute only. Mirrors `SUPPORTED_COMMANDS` on the JS side.
///
/// A lowercase form of one of these is a *relative* command and is reported as such, separately
/// from a letter that is simply not supported: `a` and `A` alike are unsupported, because an arc
/// is not in the set at all, and an arc is the one that will actually turn up.
const String _commands = 'MLCHVZ';

/// How many numbers each command consumes.
///
/// A command may repeat its arguments: `H1 2` is two horizontal linetos and `M0 0 5 5` is a
/// moveto followed by an implicit lineto. A run is therefore well formed when its count is a
/// positive multiple of this, which is what separates a legal repeat from a truncated `C1 2 3`.
const Map<String, int> _arity = <String, int>{
  'M': 2,
  'L': 2,
  'C': 6,
  'H': 1,
  'V': 1,
  'Z': 0,
};

// Matched with matchAsPrefix, so the scan can name the exact character it could not read rather
// than skipping ahead to the next thing that happens to match. These are the JS scanner's three
// regexes, character for character.
final RegExp _number = RegExp(r'[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?');
final RegExp _letter = RegExp(r'[a-zA-Z]');
final RegExp _separator = RegExp(r'[\s,]+');

/// Parses SVG path data into a [Path].
///
/// Accepts `M L C H V Z`, absolute only, with numbers in the full SVG grammar: an optional sign,
/// digits with an optional decimal point (including the leading-dot form `.5`) and an optional
/// exponent, separated by any run of whitespace and commas, or by nothing at all when a sign
/// starts the next number (`1-2` is two numbers). Of those, only negative numbers and scientific
/// notation occur in the SOLAR corpus today -- commas, leading-dot numbers, `1-2` separators,
/// explicit plus signs and implicit repeats do not. They are supported anyway, because they are
/// valid SVG and the generator's validator accepts them, but they are speculative rather than
/// exercised by the data.
///
/// The fill type is deliberately not set: `fill-rule` travels beside the path data in the spec
/// and is applied per path by the caller.
///
/// Throws a [FormatException] naming what it found for anything else.
Path parseSvgPath(String d) {
  final String text = d.trim();
  if (text.isEmpty) {
    throw FormatException('path data is empty', d);
  }

  final Path path = Path();
  final List<double> args = <double>[];

  int at = 0;
  bool first = true;
  String? command;
  int count = 0;
  // Which argument group of the current run is being read. Only M cares: its first group is a
  // moveto and every later one is an implicit lineto.
  int group = 0;

  // The current point, and the start of the current subpath, which is where Z returns to.
  double x = 0;
  double y = 0;
  double startX = 0;
  double startY = 0;

  // Checked when the run ends rather than per number, because only the total distinguishes a
  // legal repeat from a truncated command.
  void endRun() {
    if (command == null) {
      return;
    }
    final int need = _arity[command]!;
    final bool ok = need == 0 ? count == 0 : count > 0 && count % need == 0;
    if (!ok) {
      throw FormatException(
        '"$command" takes $need argument${need == 1 ? '' : 's'} '
        'but was given $count',
        d,
      );
    }
  }

  void apply() {
    switch (command) {
      case 'M':
        // Extra coordinate pairs after a moveto are linetos, per the SVG grammar.
        if (group == 0) {
          path.moveTo(args[0], args[1]);
          startX = args[0];
          startY = args[1];
        } else {
          path.lineTo(args[0], args[1]);
        }
        x = args[0];
        y = args[1];
      case 'L':
        path.lineTo(args[0], args[1]);
        x = args[0];
        y = args[1];
      case 'C':
        path.cubicTo(args[0], args[1], args[2], args[3], args[4], args[5]);
        x = args[4];
        y = args[5];
      case 'H':
        x = args[0];
        path.lineTo(x, y);
      case 'V':
        y = args[0];
        path.lineTo(x, y);
    }
    args.clear();
    group += 1;
  }

  while (at < text.length) {
    final Match? number = _number.matchAsPrefix(text, at);
    if (number != null) {
      if (first) {
        throw FormatException(
          'path data starts with "${number[0]}", not a moveto',
          d,
          at,
        );
      }
      args.add(double.parse(number[0]!));
      count += 1;
      at = number.end;
      if (args.length == _arity[command]) {
        apply();
      }
      continue;
    }

    final Match? letter = _letter.matchAsPrefix(text, at);
    if (letter != null) {
      final String next = letter[0]!;
      if (!_commands.contains(next)) {
        final String why = _commands.contains(next.toUpperCase())
            ? 'relative path command "$next"'
            : 'unsupported path command "$next"';
        throw FormatException(
          '$why in path data; only ${_commands.split('').join(' ')} '
          'are supported',
          d,
          at,
        );
      }
      if (first && next != 'M') {
        throw FormatException(
          'path data starts with "$next", not a moveto',
          d,
          at,
        );
      }
      endRun();
      first = false;
      command = next;
      count = 0;
      group = 0;
      args.clear();
      at = letter.end;
      if (next == 'Z') {
        path.close();
        // Z leaves the current point at the start of the subpath it closed, which is what a
        // following H or V measures from.
        x = startX;
        y = startY;
      }
      continue;
    }

    final Match? separator = _separator.matchAsPrefix(text, at);
    if (separator != null) {
      at = separator.end;
      continue;
    }

    throw FormatException(
      'unreadable character "${text[at]}" in path data at offset $at',
      d,
      at,
    );
  }

  endRun();
  return path;
}
