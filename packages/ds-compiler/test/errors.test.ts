import { describe, expect, it } from 'vitest';
import { Diagnostics, ERROR_CATALOG, formatDiagnostic } from '../src/errors.js';

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
});
