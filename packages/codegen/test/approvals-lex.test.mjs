import { describe, expect, it } from 'vitest';
import { dartCanon, tsCanon } from '../src/approvals/lex.mjs';

describe('tsCanon', () => {
  const a =
    '// a comment\nexport const x = 1; /* more */\n/** Doc. */\nfunction f(a: number) {\n  return a + 1;\n}\n';

  it('ignores comments and layout', () => {
    const b = 'export const x=1;function f( a : number ){ return a+1; }';
    expect(tsCanon(b, 'f.ts')).toBe(tsCanon(a, 'f.ts'));
  });

  it('changes with the code', () => {
    expect(tsCanon(a.replace('a + 1', 'a + 2'), 'f.ts')).not.toBe(
      tsCanon(a, 'f.ts'),
    );
  });

  it('keeps what a string, a template or a regular expression holds', () => {
    const s =
      "const u = 'http://x'; const t = `a // b ${1}`; const r = /\\/\\//;";
    const c = tsCanon(s, 'f.ts');
    expect(c).toContain("'http://x'");
    expect(c).toContain('`a // b ${');
    expect(c).toContain('/\\/\\//');
  });

  it('reads JSX text as React does: lines trimmed where they break, and joined', () => {
    expect(tsCanon('const e = <p>\n  Save now\n</p>;', 'f.tsx')).toBe(
      tsCanon('const e = <p>Save now</p>;', 'f.tsx'),
    );
  });

  it('keeps a space React keeps: beside an expression, and within a line', () => {
    expect(tsCanon('const e = <p>{x} a\n</p>;', 'f.tsx')).not.toBe(
      tsCanon('const e = <p>{x}a\n</p>;', 'f.tsx'),
    );
    expect(tsCanon('const e = <p>a  b</p>;', 'f.tsx')).not.toBe(
      tsCanon('const e = <p>a b</p>;', 'f.tsx'),
    );
  });
});

describe('dartCanon', () => {
  const a =
    '/// Doc.\nclass A { // line\n  /* block /* nested */ still */ final int x = 1;\n}\n';

  it('ignores comments and layout', () => {
    expect(dartCanon(a)).toBe(dartCanon('class A{final int x=1;}'));
  });

  it('keeps words apart', () => {
    expect(dartCanon('final  int\n x')).toBe('final int x');
  });

  it('changes with the code', () => {
    expect(dartCanon(a.replace('= 1', '= 2'))).not.toBe(dartCanon(a));
  });

  it('keeps two minuses or two pluses apart', () => {
    expect(dartCanon('a - --b')).not.toBe(dartCanon('a-- - b'));
    expect(dartCanon('a + ++b')).not.toBe(dartCanon('a++ + b'));
    expect(dartCanon('a - -b')).toBe('a- -b');
    expect(dartCanon('a - b')).toBe('a-b');
  });

  it('keeps strings whole', () => {
    const s =
      "final a = 'http://x  y'; final b = \"it's\"; final c = r'\\d//'; final d = '''\n // kept\n''';";
    const c = dartCanon(s);
    expect(c).toContain("'http://x  y'");
    expect(c).toContain('"it\'s"');
    expect(c).toContain("r'\\d//'");
    expect(c).toContain("'''\n // kept\n'''");
  });

  it('follows an interpolation, and the strings inside it', () => {
    const s = "final a = '${b ? 'x}' : \"y\"} // not a comment';";
    expect(dartCanon(s)).toContain("'${b ? 'x}' : \"y\"} // not a comment'");
  });
});
