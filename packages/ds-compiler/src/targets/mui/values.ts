import type { DesignIR, IRValue } from '../../ir/types.js';
import { renderLiteralValue } from '../css-values.js';
import { muiVarName } from './names.js';

/** `var(<mui variable>)` for a token reference, CSS text for a literal. */
export function muiValue(ir: DesignIR, value: IRValue): string {
  if (value.kind === 'token') {
    return `var(${muiVarName(ir.meta.prefix, ir.tokens[value.ref])})`;
  }
  return renderLiteralValue(value);
}
