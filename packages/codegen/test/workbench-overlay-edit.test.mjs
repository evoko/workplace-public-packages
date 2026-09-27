import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as prettier from 'prettier';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { overlayDir } from '../src/normalize/overlay.mjs';
import {
  borrowersOf,
  readSetEntry,
  writeSetEntry,
} from '../src/workbench/overlay-edit.mjs';

const FILE = `# Button: decisions.
bind:
  # a comment on bind
  root.height:
    literal: 40
    token: size.control.md
    reason: A reason.

set:
  # the first rule
  root.base.width:
    keyword: FILL
    reason: >-
      A long reason that Prettier folded over two lines because it is longer than the width of
      the page.
  label.base.color:
    token: color.text.primary
    reason: Another.
`;

describe('editing one set entry', () => {
  it('adds an entry at the end of set, leaving every other line as it was', () => {
    const out = writeSetEntry(
      FILE,
      'root.base.radius',
      { token: 'radius.control' },
      'Why.',
    );
    expect(out.startsWith(FILE.trimEnd())).toBe(true);
    expect(out).toBe(
      `${FILE}  root.base.radius:\n    token: radius.control\n    reason: Why.\n`,
    );
    expect(parse(out).set['root.base.radius']).toEqual({
      token: 'radius.control',
      reason: 'Why.',
    });
  });

  it('adds an entry before a section that follows set, keeping the blank line between', () => {
    const text = `set:\n  a.base.gap:\n    token: inset.xs\n    reason: A.\n\nbind:\n  b.width:\n    literal: 1\n    token: border.sm\n    reason: B.\n`;
    expect(writeSetEntry(text, 'c.base.gap', { none: true }, 'C.')).toBe(
      `set:\n  a.base.gap:\n    token: inset.xs\n    reason: A.\n  c.base.gap:\n    none: true\n    reason: C.\n\nbind:\n  b.width:\n    literal: 1\n    token: border.sm\n    reason: B.\n`,
    );
  });

  it('replaces an entry in place, its neighbours and comments untouched', () => {
    const out = writeSetEntry(
      FILE,
      'root.base.width',
      { keyword: 'HUG' },
      'Hugs.',
    );
    expect(out).toContain(
      '# the first rule\n  root.base.width:\n    keyword: HUG\n    reason: Hugs.\n  label.base.color:',
    );
    expect(out).toContain('# a comment on bind');
    expect(parse(out).set['label.base.color'].reason).toBe('Another.');
    // Every byte outside the entry's own lines is as it was.
    expect(out).toBe(
      FILE.replace(
        / {2}root\.base\.width:\n[\s\S]*?the page\.\n/,
        '  root.base.width:\n    keyword: HUG\n    reason: Hugs.\n',
      ),
    );
  });

  it('deletes an entry, and the set section once it is empty', () => {
    let out = writeSetEntry(FILE, 'root.base.width', null);
    expect(parse(out).set['root.base.width']).toBeUndefined();
    // The entry goes with the comment written directly above it, and nothing else.
    expect(out).toBe(
      FILE.replace(/ {2}# the first rule\n[\s\S]*?the page\.\n/, ''),
    );
    out = writeSetEntry(out, 'label.base.color', null);
    expect(parse(out).set).toBeUndefined();
    expect(out).toContain('bind:');
    expect(out).toBe(
      FILE.slice(0, FILE.indexOf('\nset:') + 1).trimEnd() + '\n',
    );
  });

  it('deletes an empty set in the middle of a file, leaving one blank line', () => {
    const text = `bind: {}\n\nset:\n  a.base.gap:\n    none: true\n    reason: A.\n\naccept: {}\n`;
    expect(writeSetEntry(text, 'a.base.gap', null)).toBe(
      'bind: {}\n\naccept: {}\n',
    );
  });

  it('deletes an entry between blank lines, leaving the blank lines Prettier keeps', () => {
    const text = `set:\n  a.base.gap:\n    none: true\n    reason: A.\n\n  b.base.gap:\n    none: true\n    reason: B.\n\n  c.base.gap:\n    none: true\n    reason: C.\n\nbind: {}\n`;
    const a = '  a.base.gap:\n    none: true\n    reason: A.\n';
    const b = '  b.base.gap:\n    none: true\n    reason: B.\n';
    const c = '  c.base.gap:\n    none: true\n    reason: C.\n';
    expect(writeSetEntry(text, 'a.base.gap', null)).toBe(
      `set:\n${b}\n${c}\nbind: {}\n`,
    );
    expect(writeSetEntry(text, 'b.base.gap', null)).toBe(
      `set:\n${a}\n${c}\nbind: {}\n`,
    );
    expect(writeSetEntry(text, 'c.base.gap', null)).toBe(
      `set:\n${a}\n${b}\nbind: {}\n`,
    );
  });

  it('leaves the text as it was when deleting an entry it does not have', () => {
    expect(writeSetEntry(FILE, 'nope', null)).toBe(FILE);
    expect(writeSetEntry('bind: {}\n', 'nope', null)).toBe('bind: {}\n');
  });

  it('adds a set section to a file with none, or starts a file', () => {
    const out = writeSetEntry(
      'bind: {}\n',
      'root.base.gap',
      { token: 'inset.xs' },
      'Gap.',
    );
    expect(out).toBe(
      'bind: {}\n\nset:\n  root.base.gap:\n    token: inset.xs\n    reason: Gap.\n',
    );
    expect(parse(out).set['root.base.gap'].token).toBe('inset.xs');
    expect(
      parse(writeSetEntry('', 'root.base.gap', { none: true }, 'No gap.')).set,
    ).toEqual({
      'root.base.gap': { none: true, reason: 'No gap.' },
    });
  });

  it('fills a set section that is there but empty, never writing a second one', () => {
    for (const text of ['bind: {}\n\nset:\n', 'bind: {}\n\nset: {}\n']) {
      const out = writeSetEntry(text, 'a.base.gap', { none: true }, 'A.');
      expect(out).toBe(
        'bind: {}\n\nset:\n  a.base.gap:\n    none: true\n    reason: A.\n',
      );
    }
  });

  it('folds a long reason as the files do, and keeps a look’s key unquoted', () => {
    const long =
      'A reason long enough to need folding across more than one line of the overlay file, as people write them.';
    const out = writeSetEntry(
      FILE,
      'title.appearance.style=solid, span=end.default.typography',
      { token: 'typography.label.md' },
      long,
    );
    expect(out).toContain(
      '  title.appearance.style=solid, span=end.default.typography:\n',
    );
    expect(out).toContain('    reason: >-\n');
    expect(
      parse(out).set[
        'title.appearance.style=solid, span=end.default.typography'
      ].reason,
    ).toBe(long);
    expect(Math.max(...out.split('\n').map((l) => l.length))).toBeLessThan(101);
  });

  it('quotes a key that must be quoted as Prettier does, with single quotes', () => {
    const out = writeSetEntry(
      FILE,
      '*IconButton*.base.width',
      { none: true },
      'Its own.',
    );
    expect(out).toContain("  '*IconButton*.base.width':\n    none: true\n");
    expect(parse(out).set['*IconButton*.base.width'].none).toBe(true);
  });

  it('works on a file with no final newline', () => {
    const text = FILE.trimEnd();
    expect(
      writeSetEntry(text, 'root.base.gap', { token: 'inset.xs' }, 'Gap.'),
    ).toBe(`${FILE}  root.base.gap:\n    token: inset.xs\n    reason: Gap.\n`);
    expect(writeSetEntry(text, 'label.base.color', null)).toBe(
      FILE.replace(/ {2}label\.base\.color:[\s\S]*$/, ''),
    );
    expect(
      writeSetEntry('bind: {}', 'root.base.gap', { none: true }, 'No gap.'),
    ).toBe(
      'bind: {}\n\nset:\n  root.base.gap:\n    none: true\n    reason: No gap.\n',
    );
  });

  it('trims a reason, and never writes one that would not read back as given', () => {
    const out = writeSetEntry(
      FILE,
      'root.base.gap',
      { none: true },
      `  ${'A reason long enough to be folded over more than one line of the overlay file. '.repeat(2)}  `,
    );
    expect(parse(out).set['root.base.gap'].reason).toBe(
      'A reason long enough to be folded over more than one line of the overlay file. '
        .repeat(2)
        .trim(),
    );
    expect(out).not.toMatch(/>\d/);
    expect(
      parse(writeSetEntry(FILE, 'root.base.gap', { none: true }, ' Why. ')).set[
        'root.base.gap'
      ].reason,
    ).toBe('Why.');
  });

  it('refuses a rule with no reason', () => {
    for (const reason of [undefined, '', '   ', 42])
      expect(() =>
        writeSetEntry(FILE, 'root.base.gap', { none: true }, reason),
      ).toThrow('A set rule needs a reason.');
  });

  it('deletes the notes written under an entry with it, and a replace keeps them', () => {
    const text = `set:\n  a.base.gap:\n    none: true\n    reason: A.\n    # a note on a\n      # and more\n  b.base.gap:\n    none: true\n    reason: B.\n    # a note on b\nbind: {}\n`;
    expect(writeSetEntry(text, 'a.base.gap', null)).toBe(
      `set:\n  b.base.gap:\n    none: true\n    reason: B.\n    # a note on b\nbind: {}\n`,
    );
    expect(writeSetEntry(text, 'b.base.gap', null)).toBe(
      `set:\n  a.base.gap:\n    none: true\n    reason: A.\n    # a note on a\n      # and more\nbind: {}\n`,
    );
    expect(
      writeSetEntry(text, 'a.base.gap', { token: 'inset.xs' }, 'A2.'),
    ).toBe(
      text.replace(
        '    none: true\n    reason: A.\n',
        '    token: inset.xs\n    reason: A2.\n',
      ),
    );
  });

  it('refuses to delete an entry whose reason another rule borrows, and names its borrowers', () => {
    const text = `set:\n  attendee.base.width:\n    none: true\n    reason: Its own.\n  attendee.base.height:\n    none: true\n    reason: { as: set attendee.base.width }\n\naccept:\n  component.x.root.width@density=compact:\n    reason: { as: set attendee.base.width}\n  component.x.root.height:\n    reason: { as: set attendee.base.widths }\n`;
    expect(() => writeSetEntry(text, 'attendee.base.width', null)).toThrow(
      'set attendee.base.width: another rule borrows its reason (reason: { as: set attendee.base.width }); change that rule first: set attendee.base.height; accept component.x.root.width@density=compact',
    );
    expect(borrowersOf(text, 'attendee.base.width')).toEqual([
      'set attendee.base.height',
      'accept component.x.root.width@density=compact',
    ]);
    // A key that only begins like a borrowed one is not borrowed.
    expect(borrowersOf(text, 'attendee.base')).toEqual([]);
    expect(parse(writeSetEntry(text, 'attendee.base', null))).toEqual(
      parse(text),
    );
    // Replacing it is allowed: the borrowers take the new reason.
    const out = writeSetEntry(
      text,
      'attendee.base.width',
      { keyword: 'HUG' },
      'New.',
    );
    expect(parse(out).set['attendee.base.width']).toEqual({
      keyword: 'HUG',
      reason: 'New.',
    });
  });

  it('refuses a delete whose borrower quotes a look’s key, as the files must for one with a comma', () => {
    const key = 'root.appearance.prio=primary, danger=false.default.color';
    const text = `set:\n  ${key}:\n    token: color.text.primary\n    reason: Its own.\n  root.appearance.prio=primary, danger=true.default.color:\n    token: color.text.primary\n    reason: { as: "set ${key}" }\n`;
    expect(borrowersOf(text, key)).toEqual([
      'set root.appearance.prio=primary, danger=true.default.color',
    ]);
    expect(() => writeSetEntry(text, key, null)).toThrow(
      `set ${key}: another rule borrows its reason`,
    );
  });

  it('deletes an entry that a comment mentions borrowing, since a comment borrows nothing', () => {
    const text = `set:\n  a.base.gap:\n    none: true\n    reason: A.\n  # b could say reason: { as: set a.base.gap } one day\n  b.base.gap:\n    none: true\n    reason: B.\n`;
    expect(borrowersOf(text, 'a.base.gap')).toEqual([]);
    expect(writeSetEntry(text, 'a.base.gap', null)).toBe(
      text.replace('  a.base.gap:\n    none: true\n    reason: A.\n', ''),
    );
  });

  it('reads an entry back', () => {
    expect(readSetEntry(FILE, 'label.base.color')).toEqual({
      token: 'color.text.primary',
      reason: 'Another.',
    });
    expect(readSetEntry(FILE, 'nope')).toBeNull();
  });
});

/**
 * The lines an entry holds, found without the yaml library: its key line (plain or quoted, two
 * spaces in) to the last line indented deeper, so the check does not lean on the code it checks.
 */
function entryLines(lines, key) {
  const start = lines.findIndex(
    (l) => l === `  ${key}:` || l === `  '${key}':` || l === `  "${key}":`,
  );
  let end = start + 1;
  while (end < lines.length && lines[end].startsWith('    ')) end++;
  return [start, end];
}

const prettierOptions = async (file) => ({
  ...(await prettier.resolveConfig(file)),
  parser: 'yaml',
});

/** The lines with the blank lines at either end dropped. */
const unpadded = (lines) => {
  let from = 0;
  let to = lines.length;
  while (from < to && !lines[from].trim()) from++;
  while (to > from && !lines[to - 1].trim()) to--;
  return lines.slice(from, to);
};

describe('on every committed overlay', () => {
  it('rewriting each set entry as it is changes nothing, and deleting one moves only its lines', async () => {
    let checked = 0;
    let borrowed = 0;
    for (const f of readdirSync(overlayDir).filter(
      (x) =>
        x.endsWith('.yaml') &&
        !['defaults.yaml', 'excluded.yaml', 'mui-theme.yaml'].includes(x),
    )) {
      const file = join(overlayDir, f);
      const options = await prettierOptions(file);
      const text = readFileSync(file, 'utf8');
      const lines = text.split('\n');
      const set = parse(text)?.set ?? {};
      for (const [key, rule] of Object.entries(set)) {
        if (typeof rule.reason !== 'string') continue; // a reason by reference ({ as: … })
        const [start, end] = entryLines(lines, key);
        expect(start, `${f} ${key}`).toBeGreaterThan(-1);
        const { reason, ...value } = rule;

        // Rewritten: the same data, and every line outside the entry's own as it was.
        const out = writeSetEntry(text, key, value, reason);
        expect(parse(out), `${f} ${key}`).toEqual(parse(text));
        const outLines = out.split('\n');
        const tail = lines.length - end;
        expect(outLines.slice(0, start), `${f} ${key}`).toEqual(
          lines.slice(0, start),
        );
        expect(outLines.slice(outLines.length - tail), `${f} ${key}`).toEqual(
          lines.slice(end),
        );
        expect(await prettier.format(out, options), `${f} ${key}`).toBe(out);

        // Deleted: refused where another rule borrows its reason; else gone, and every other line
        // as it was, but for a blank line at the join.
        if (borrowersOf(text, key).length) {
          expect(() => writeSetEntry(text, key, null), `${f} ${key}`).toThrow(
            /another rule borrows its reason/,
          );
          borrowed++;
          continue;
        }
        const gone = writeSetEntry(text, key, null);
        expect(parse(gone)?.set?.[key], `${f} ${key}`).toBeUndefined();
        expect(await prettier.format(gone, options), `${f} ${key}`).toBe(gone);
        if (Object.keys(set).length > 1) {
          const goneLines = gone.split('\n');
          const before = unpadded(lines.slice(0, start));
          const after = unpadded(lines.slice(end));
          expect(goneLines.slice(0, before.length), `${f} ${key}`).toEqual(
            before,
          );
          expect(
            unpadded(goneLines.slice(before.length)).slice(0, after.length),
            `${f} ${key}`,
          ).toEqual(after);
          expect(
            goneLines.length - before.length - after.length,
            `${f} ${key}`,
          ).toBeLessThanOrEqual(2);
        }
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(100);
    expect(borrowed).toBeGreaterThan(0);
    // Every overlay, each rule formatted by Prettier twice over: longer than vitest's default.
  }, 60_000);
});
