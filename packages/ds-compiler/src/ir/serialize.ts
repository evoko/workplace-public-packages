import { createHash } from 'node:crypto';
import type { DesignIR } from './types.js';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      if (obj[key] !== undefined) {
        out[key] = sortValue(obj[key]);
      }
    }
    return out;
  }
  return value;
}

/** JSON.stringify with recursively sorted object keys and 2-space indent. */
export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value), null, 2);
}

export function serializeIR(ir: DesignIR): string {
  return `${stableStringify(ir)}\n`;
}

export interface SourceFile {
  /** Path relative to the source root, using forward slashes. */
  path: string;
  contents: string;
}

/** SHA-256 over all source files, ordered by path so the result is order-independent. */
export function sourceHash(files: SourceFile[]): string {
  const hash = createHash('sha256');
  for (const f of [...files].sort((a, b) =>
    a.path < b.path ? -1 : a.path > b.path ? 1 : 0,
  )) {
    hash.update(`${f.path.length}:`);
    hash.update(f.path);
    hash.update('\n');
    hash.update(`${f.contents.length}:`);
    hash.update(f.contents);
    hash.update('\n--\n');
  }
  return hash.digest('hex');
}
