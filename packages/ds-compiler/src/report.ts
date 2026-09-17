import {
  formatDiagnostic,
  sortDiagnosticsForDisplay,
  type Diagnostics,
} from './errors.js';

export function summarize(diag: Diagnostics): string {
  const e = diag.errors.length;
  const w = diag.warnings.length;
  return `${e} error${e === 1 ? '' : 's'}, ${w} warning${w === 1 ? '' : 's'}`;
}

/** Sorted by file, line, column. Errors go to stderr, warnings and the summary to stdout. With json, one object to stdout. */
export function printDiagnostics(
  diag: Diagnostics,
  json: boolean,
  extra: Record<string, unknown> = {},
): void {
  const ordered = sortDiagnosticsForDisplay(diag.items);
  if (json) {
    console.log(
      JSON.stringify({
        diagnostics: ordered,
        summary: summarize(diag),
        ...extra,
      }),
    );
    return;
  }
  for (const d of ordered) {
    if (d.severity === 'error') {
      console.error(formatDiagnostic(d));
    } else {
      console.log(formatDiagnostic(d));
    }
  }
  console.log(summarize(diag));
  for (const [key, value] of Object.entries(extra)) {
    console.log(`${key}: ${String(value)}`);
  }
}
