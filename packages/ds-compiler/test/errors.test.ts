import { describe, expect, it } from 'vitest';
import {
  Diagnostics,
  ERROR_CATALOG,
  formatDiagnostic,
  sortDiagnosticsForDisplay,
  type Diagnostic,
} from '../src/errors.js';

describe('Diagnostics', () => {
  it('records an error with catalog title, hint, and location', () => {
    const diag = new Diagnostics();
    diag.add('DS-E040', 'Unknown property "colr"', {
      file: 'src/components/button/button.css',
      line: 4,
      column: 3,
    });
    expect(diag.hasErrors()).toBe(true);
    expect(diag.errors).toHaveLength(1);
    expect(diag.warnings).toHaveLength(0);
    const d = diag.errors[0];
    expect(d.code).toBe('DS-E040');
    expect(d.severity).toBe('error');
    expect(d.title).toBe(ERROR_CATALOG['DS-E040'].title);
    expect(d.hint).toBe(ERROR_CATALOG['DS-E040'].hint);
  });

  it('classifies W codes as warnings', () => {
    const diag = new Diagnostics();
    diag.add('DS-W001', 'Missing baseline: color');
    expect(diag.hasErrors()).toBe(false);
    expect(diag.warnings).toHaveLength(1);
  });

  it('formats a diagnostic on two lines with location, code, title, message, and hint', () => {
    const diag = new Diagnostics();
    diag.add('DS-E040', 'Unknown property "colr"', {
      file: 'a.css',
      line: 4,
      column: 3,
    });
    const text = formatDiagnostic(diag.items[0]);
    expect(text).toBe(
      `a.css:4:3 error DS-E040 Unknown CSS property: Unknown property "colr"\n  hint: ${ERROR_CATALOG['DS-E040'].hint}`,
    );
  });

  it('formats without a location', () => {
    const diag = new Diagnostics();
    diag.add('DS-E001', 'ds.config.json not found');
    expect(formatDiagnostic(diag.items[0]).startsWith('error DS-E001 ')).toBe(
      true,
    );
  });

  it('merges another collector', () => {
    const a = new Diagnostics();
    const b = new Diagnostics();
    a.add('DS-E001', 'x');
    b.add('DS-W001', 'y');
    a.merge(b);
    expect(a.items).toHaveLength(2);
  });
});

describe('ERROR_CATALOG', () => {
  it('has codes matching the DS-E/DS-W convention with non-empty titles and hints', () => {
    for (const [code, meta] of Object.entries(ERROR_CATALOG)) {
      expect(code).toMatch(/^DS-[EW]\d{3}$/);
      expect(meta.title.length).toBeGreaterThan(0);
      expect(meta.hint.length).toBeGreaterThan(0);
    }
  });

  it('includes the target-plugin and verification codes', () => {
    expect(Object.keys(ERROR_CATALOG)).toEqual(
      expect.arrayContaining([
        'DS-E080',
        'DS-E081',
        'DS-E082',
        'DS-E083',
        'DS-W003',
      ]),
    );
  });
});

function makeDiagnostic(
  code: 'DS-E040' | 'DS-E001',
  location?: Diagnostic['location'],
): Diagnostic {
  const meta = ERROR_CATALOG[code];
  return {
    code,
    severity: 'error',
    title: meta.title,
    message: 'x',
    hint: meta.hint,
    location,
  };
}

describe('sortDiagnosticsForDisplay', () => {
  it('orders by file, then line, then column, without mutating the input', () => {
    const c = makeDiagnostic('DS-E040', { file: 'b.css', line: 5, column: 1 });
    const a1 = makeDiagnostic('DS-E040', { file: 'a.css', line: 2, column: 9 });
    const a2 = makeDiagnostic('DS-E040', { file: 'a.css', line: 2, column: 1 });
    const a3 = makeDiagnostic('DS-E040', { file: 'a.css', line: 1, column: 1 });
    const items = [c, a1, a2, a3];
    const sorted = sortDiagnosticsForDisplay(items);
    expect(sorted).toEqual([a3, a2, a1, c]);
    // Original array and its order are untouched.
    expect(items).toEqual([c, a1, a2, a3]);
  });

  it('sorts diagnostics without a location before diagnostics with one', () => {
    const withLoc = makeDiagnostic('DS-E040', {
      file: 'a.css',
      line: 1,
      column: 1,
    });
    const noLoc = makeDiagnostic('DS-E001', undefined);
    expect(sortDiagnosticsForDisplay([withLoc, noLoc])).toEqual([
      noLoc,
      withLoc,
    ]);
  });

  it('is stable: equal keys keep their original relative order', () => {
    const first = makeDiagnostic('DS-E040', {
      file: 'a.css',
      line: 1,
      column: 1,
    });
    const second = makeDiagnostic('DS-E001', {
      file: 'a.css',
      line: 1,
      column: 1,
    });
    const third = makeDiagnostic('DS-E040', undefined);
    const fourth = makeDiagnostic('DS-E001', undefined);
    expect(sortDiagnosticsForDisplay([first, second, third, fourth])).toEqual([
      third,
      fourth,
      first,
      second,
    ]);
  });

  it('compares file paths by code unit, not locale', () => {
    const upper = makeDiagnostic('DS-E040', {
      file: 'Z.css',
      line: 1,
      column: 1,
    });
    const lower = makeDiagnostic('DS-E040', {
      file: 'a.css',
      line: 1,
      column: 1,
    });
    // 'Z' (0x5A) sorts before 'a' (0x61) under code-unit comparison.
    expect(sortDiagnosticsForDisplay([lower, upper])).toEqual([upper, lower]);
  });
});
