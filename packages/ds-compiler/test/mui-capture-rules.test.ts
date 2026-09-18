import { describe, expect, it } from 'vitest';
import type { DiagnosticCode, SourceLocation } from '../src/errors.js';
import type { MuiCatalogProp } from '../src/targets/mui/catalog.js';
import {
  captureConsoleErrors,
  rulesFromMarkup,
  unresolvedUnionProps,
  type DiagSink,
} from '../src/targets/mui/capture.js';

const AT: SourceLocation = { file: 'test.manifest.json', line: 1, column: 1 };

function collector(): DiagSink & { messages: string[] } {
  const messages: string[] = [];
  return {
    messages,
    add(_code: DiagnosticCode, message: string, _location?: SourceLocation) {
      messages.push(message);
    },
  };
}

describe('rulesFromMarkup (synthetic markup, no MUI)', () => {
  it('rewrites a root-prefixed selector to &', () => {
    const html =
      '<div class="root c-root"><style data-emotion="c-root">.c-root:hover{color:red}</style></div>';
    const diag = collector();
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'name',
      'Component',
      AT,
      diag,
    );
    expect(rules).toEqual([
      { media: null, selector: '&:hover', declarations: { color: 'red' } },
    ]);
    expect(diag.messages).toEqual([]);
  });

  it('merges declarations for the same selector across style tags, later wins', () => {
    const html = [
      '<style data-emotion="c-root">.c-root{color:red}</style>',
      '<style data-emotion="c-root">.c-root{color:blue;background:white}</style>',
    ].join('');
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'name',
      'Component',
      AT,
      collector(),
    );
    expect(rules).toEqual([
      {
        media: null,
        selector: '&',
        declarations: { color: 'blue', background: 'white' },
      },
    ]);
  });

  it('wraps a rule inside @media with its params', () => {
    const html =
      '<style data-emotion="c-root">@media print{.c-root{color:red}}</style>';
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'name',
      'Component',
      AT,
      collector(),
    );
    expect(rules).toEqual([
      { media: 'print', selector: '&', declarations: { color: 'red' } },
    ]);
  });

  it('reports DS-E086 for an at-rule nested inside @media, and drops it', () => {
    const html =
      '<style data-emotion="c-root">@media print{@supports (a:b){.c-root{color:red}}}</style>';
    const diag = collector();
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'btn',
      'Button',
      AT,
      diag,
    );
    expect(rules).toEqual([]);
    expect(diag.messages).toHaveLength(1);
    expect(diag.messages[0]).toContain('@supports');
    expect(diag.messages[0]).toContain('cannot represent');
  });

  it('reports DS-E086 for a top-level at-rule the catalog cannot represent', () => {
    const html =
      '<style data-emotion="c-root">@keyframes spin{from{opacity:0}}</style>';
    const diag = collector();
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'btn',
      'Button',
      AT,
      diag,
    );
    expect(rules).toEqual([]);
    expect(diag.messages).toEqual([expect.stringContaining('@keyframes')]);
  });

  it('ignores the c-global sheet', () => {
    const html = '<style data-emotion="c-global abc">:root{--x:1px}</style>';
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(),
      'name',
      'Component',
      AT,
      collector(),
    );
    expect(rules).toEqual([]);
  });

  it("drops a root-nested rule targeting one of the component's own unmapped classes", () => {
    const html =
      '<style data-emotion="c-root">.c-root .MuiChip-avatar{margin-right:4px}</style>';
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      new Set(['MuiChip-avatar']),
      'tag',
      'Chip',
      AT,
      collector(),
    );
    expect(rules).toEqual([]);
  });

  it('keeps a root-nested rule targeting a mapped slot class', () => {
    const html =
      '<style data-emotion="c-root">.c-root .MuiButton-startIcon{margin-right:8px}</style>';
    const rules = rulesFromMarkup(
      html,
      new Map([['c-root', '&']]),
      // startIcon is mapped, so it is not in the "own but unmapped" set.
      new Set(),
      'btn',
      'Button',
      AT,
      collector(),
    );
    expect(rules).toEqual([
      {
        media: null,
        selector: '& .MuiButton-startIcon',
        declarations: { 'margin-right': '8px' },
      },
    ]);
  });

  it("keeps a mapped slot's own nested descendant rule (no leading space+class)", () => {
    const html =
      '<style data-emotion="c-slot">.c-slot>*:nth-of-type(1){font-size:1em}</style>';
    const rules = rulesFromMarkup(
      html,
      new Map([['c-slot', '& .MuiButton-startIcon']]),
      new Set(['MuiChip-avatar']),
      'btn',
      'Button',
      AT,
      collector(),
    );
    expect(rules).toEqual([
      {
        media: null,
        selector: '& .MuiButton-startIcon>*:nth-of-type(1)',
        declarations: { 'font-size': '1em' },
      },
    ]);
  });
});

function prop(kind: 'union' | 'other', values?: string[]): MuiCatalogProp {
  return kind === 'union'
    ? { kind, type: 'x', default: null, values, overrides: 'XOverrides' }
    : { kind, type: 'x', default: null };
}

describe('unresolvedUnionProps (synthetic props, no MUI)', () => {
  it('names union props whose values could not be resolved at all', () => {
    expect(
      unresolvedUnionProps({
        resolved: prop('union', ['a', 'b']),
        unresolved: prop('union', []),
        other: prop('other'),
        alsoUnresolved: prop('union', []),
      }),
    ).toEqual(['alsoUnresolved', 'unresolved']);
  });

  it('returns nothing when every union resolved', () => {
    expect(
      unresolvedUnionProps({
        a: prop('union', ['x']),
        b: prop('other'),
      }),
    ).toEqual([]);
  });
});

describe('captureConsoleErrors (synthetic render, no MUI)', () => {
  it('collects distinct first lines and restores console.error', () => {
    const original = console.error;
    const result = captureConsoleErrors(() => {
      console.error('Warning: bogus prop\nsecond line');
      console.error('Warning: bogus prop\nsecond line');
      console.error('Warning: another issue');
      return '<div>x</div>';
    });
    expect(console.error).toBe(original);
    expect(result.html).toBe('<div>x</div>');
    expect(result.messages).toEqual([
      'Warning: bogus prop',
      'Warning: another issue',
    ]);
  });

  it('returns no messages when render logs nothing', () => {
    const result = captureConsoleErrors(() => '<div/>');
    expect(result.messages).toEqual([]);
  });

  it('restores console.error even when render throws', () => {
    const original = console.error;
    expect(() =>
      captureConsoleErrors(() => {
        console.error('oops');
        throw new Error('boom');
      }),
    ).toThrow('boom');
    expect(console.error).toBe(original);
  });
});
