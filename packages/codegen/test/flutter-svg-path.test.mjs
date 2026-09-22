import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packagesDir } from '../src/util/paths.mjs';
import { SUPPORTED_COMMANDS } from '../src/normalize/svg.mjs';

/**
 * The Dart path parser is hand written, not generated: a parser is behaviour, and the generated
 * tree holds recipes. That leaves one thing a generator would have given for free -- the two
 * sides cannot disagree about which commands exist -- so it is asserted here instead.
 *
 * The check is deliberately shallow. It reads one declaration, which the Dart file states in one
 * obvious place for exactly this reason, rather than trying to infer a grammar from control
 * flow. Everything else about the two parsers agreeing is proved by behaviour: `checkPathData`
 * is tested against all 686 corpus files in svg.test.mjs, and `svg_path_test.dart` walks the
 * same accept and reject cases on the Dart side.
 */

const DART_FILE = join(
  packagesDir,
  'solar_flutter',
  'lib',
  'src',
  'svg_path.dart',
);

const source = readFileSync(DART_FILE, 'utf8');

describe('the Dart parser and the JS validator accept the same commands', () => {
  it('states its command set in one greppable declaration', () => {
    expect(source.match(/const String _commands = '([A-Z]+)';/g)).toHaveLength(
      1,
    );
  });

  it('accepts exactly SUPPORTED_COMMANDS', () => {
    const [, commands] = /const String _commands = '([A-Z]+)';/.exec(source);
    expect(new Set(commands)).toEqual(SUPPORTED_COMMANDS);
  });

  it('gives every one of them an arity and invents none', () => {
    const [, table] =
      /const Map<String, int> _arity = <String, int>\{([^}]*)\}/.exec(source);
    const keys = [...table.matchAll(/'([A-Z])':/g)].map((m) => m[1]);
    expect(new Set(keys)).toEqual(SUPPORTED_COMMANDS);
    expect(keys).toHaveLength(SUPPORTED_COMMANDS.size);
  });

  it('never mentions a command it does not support', () => {
    // A stray reference to an arc or a quadratic in the switch would mean the declaration above
    // is no longer the whole truth.
    const drawn = [...source.matchAll(/case '([A-Za-z])':/g)].map((m) => m[1]);
    expect(drawn.every((c) => SUPPORTED_COMMANDS.has(c))).toBe(true);
  });
});
