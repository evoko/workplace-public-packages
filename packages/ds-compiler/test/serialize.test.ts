import { describe, expect, it } from 'vitest';
import {
  serializeIR,
  sourceHash,
  stableStringify,
} from '../src/ir/serialize.js';
import type { DesignIR } from '../src/ir/types.js';

describe('stableStringify', () => {
  it('sorts object keys recursively and keeps array order', () => {
    const out = stableStringify({
      b: 1,
      a: { d: [3, { z: 1, y: 2 }], c: 'x' },
    });
    expect(out).toBe(
      [
        '{',
        '  "a": {',
        '    "c": "x",',
        '    "d": [',
        '      3,',
        '      {',
        '        "y": 2,',
        '        "z": 1',
        '      }',
        '    ]',
        '  },',
        '  "b": 1',
        '}',
      ].join('\n'),
    );
  });

  it('drops undefined properties like JSON.stringify does', () => {
    expect(stableStringify({ a: undefined, b: 1 })).toBe('{\n  "b": 1\n}');
  });
});

describe('sourceHash', () => {
  it('is independent of input order and sensitive to content', () => {
    const a = sourceHash([
      { path: 'x.css', contents: '1' },
      { path: 'y.css', contents: '2' },
    ]);
    const b = sourceHash([
      { path: 'y.css', contents: '2' },
      { path: 'x.css', contents: '1' },
    ]);
    const c = sourceHash([
      { path: 'x.css', contents: '1' },
      { path: 'y.css', contents: '3' },
    ]);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('sorts by code unit, independent of shuffle order', () => {
    const contents: Record<string, string> = {
      'a-b.css': '1',
      'a_b.css': '2',
      'A.css': '3',
      'a.css': '4',
    };
    const toFiles = (order: string[]) =>
      order.map((path) => ({ path, contents: contents[path] }));
    const shuffleA = sourceHash(
      toFiles(['a.css', 'A.css', 'a_b.css', 'a-b.css']),
    );
    const shuffleB = sourceHash(
      toFiles(['A.css', 'a-b.css', 'a.css', 'a_b.css']),
    );
    expect(shuffleA).toBe(shuffleB);
  });

  it('differs when two paths swap contents', () => {
    const order = ['a-b.css', 'a_b.css', 'A.css', 'a.css'];
    const contents: Record<string, string> = {
      'a-b.css': '1',
      'a_b.css': '2',
      'A.css': '3',
      'a.css': '4',
    };
    const swapped: Record<string, string> = {
      ...contents,
      'a-b.css': '2',
      'a_b.css': '1',
    };
    const toFiles = (c: Record<string, string>) =>
      order.map((path) => ({ path, contents: c[path] }));
    expect(sourceHash(toFiles(contents))).not.toBe(
      sourceHash(toFiles(swapped)),
    );
  });
});

describe('serializeIR', () => {
  it('ends with exactly one newline and parses as JSON', () => {
    const ir: DesignIR = {
      irVersion: 1,
      meta: {
        name: 'test',
        prefix: 'fx',
        modes: ['light'],
        defaultMode: 'light',
        rootFontSize: 16,
        modeSelector: ':root[data-fx-theme="{mode}"]',
        sourceHash: 'abc',
      },
      tokens: {},
      components: {},
    };
    const out = serializeIR(ir);
    expect(out.endsWith('\n')).toBe(true);
    expect(out.endsWith('\n\n')).toBe(false);
    expect(() => JSON.parse(out)).not.toThrow();
  });
});
