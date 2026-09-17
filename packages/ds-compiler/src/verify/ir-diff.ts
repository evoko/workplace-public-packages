import type { SourceLocation } from '../errors.js';
import { stableStringify } from '../ir/serialize.js';
import type { DesignIR, Rule } from '../ir/types.js';
import { codeUnitCompare } from '../sources.js';

export interface IRDifference {
  kind: 'token' | 'component' | 'rule' | 'declaration';
  /** Token id, component name, "<component> <rule key>", or "<component> <rule key> <property>". */
  id: string;
  message: string;
  /** Source location from the source IR when the source side exists. */
  location?: SourceLocation;
}

export interface DiffScope {
  /** Components the target claims to cover; others are not compared. */
  components: readonly string[];
  /** Properties the target ignores for a component; they may be absent from the reparsed IR. */
  ignored: (component: string) => ReadonlySet<string>;
}

const SHOW_LIMIT = 200;

/**
 * Compact one-line-ish JSON with sorted keys, for messages. Only a newline
 * plus its following indentation collapses to a single space, so spacing
 * inside a string value (e.g. a font-family name) survives; the result is
 * truncated beyond SHOW_LIMIT characters.
 */
function show(value: unknown): string {
  const text = stableStringify(value).replace(/\n\s*/g, ' ');
  return text.length > SHOW_LIMIT ? `${text.slice(0, SHOW_LIMIT)}…` : text;
}

function withoutSource<T extends { source?: unknown }>(
  value: T,
): Omit<T, 'source'> {
  const { source: _source, ...rest } = value;
  return rest;
}

/** Slot, axes (alphabetical), and states, e.g. `root[data-size="sm"]:hover`. */
export function ruleDiffKey(
  rule: Pick<Rule, 'slot' | 'axes' | 'states'>,
): string {
  const axes = Object.keys(rule.axes)
    .sort(codeUnitCompare)
    .map((a) => `[data-${a}="${rule.axes[a]}"]`)
    .join('');
  const states = rule.states.map((s) => `:${s}`).join('');
  return `${rule.slot}${axes}${states}`;
}

/**
 * Structural comparison of two IRs: every token, and the rules of the
 * components in scope. Axes, states, and slots come from the manifest on both
 * sides and are not compared. `source` locations are ignored.
 */
export function diffIR(
  source: DesignIR,
  reparsed: DesignIR,
  scope: DiffScope,
): IRDifference[] {
  const out: IRDifference[] = [];

  const tokenIds = new Set([
    ...Object.keys(source.tokens),
    ...Object.keys(reparsed.tokens),
  ]);
  for (const id of [...tokenIds].sort(codeUnitCompare)) {
    const a = source.tokens[id];
    const b = reparsed.tokens[id];
    if (!a) {
      out.push({
        kind: 'token',
        id,
        message: 'present only in the generated output',
      });
    } else if (!b) {
      out.push({
        kind: 'token',
        id,
        message: 'missing from the generated output',
        location: a.source,
      });
    } else {
      const sa = show(withoutSource(a));
      const sb = show(withoutSource(b));
      if (sa !== sb) {
        out.push({
          kind: 'token',
          id,
          message: `differs: source ${sa}, generated ${sb}`,
          location: a.source,
        });
      }
    }
  }

  const scopeSet = new Set(scope.components);
  for (const name of [...scope.components].sort(codeUnitCompare)) {
    const a = source.components[name];
    if (!a) {
      continue;
    }
    const ignored = scope.ignored(name);
    const b = reparsed.components[name];
    if (!b) {
      // A component whose every declaration (across every rule) is ignored
      // by this target is legitimately absent from the generated output.
      const hasKept = a.rules.some((r) =>
        Object.keys(r.declarations).some((p) => !ignored.has(p)),
      );
      if (hasKept) {
        out.push({
          kind: 'component',
          id: name,
          message: 'missing from the generated output',
        });
      }
      continue;
    }
    const ra = new Map(a.rules.map((r) => [ruleDiffKey(r), r]));
    const rb = new Map(b.rules.map((r) => [ruleDiffKey(r), r]));
    const keys = new Set([...ra.keys(), ...rb.keys()]);
    for (const key of [...keys].sort(codeUnitCompare)) {
      const x = ra.get(key);
      const y = rb.get(key);
      const id = `${name} ${key}`;
      if (!x) {
        out.push({
          kind: 'rule',
          id,
          message: 'present only in the generated output',
        });
        continue;
      }
      const kept = Object.keys(x.declarations).filter((p) => !ignored.has(p));
      if (!y) {
        // a source rule whose every declaration is ignored is legitimately absent
        if (kept.length > 0) {
          out.push({
            kind: 'rule',
            id,
            message: 'missing from the generated output',
            location: x.source,
          });
        }
        continue;
      }
      const props = new Set([...kept, ...Object.keys(y.declarations)]);
      for (const p of [...props].sort(codeUnitCompare)) {
        const pid = `${id} ${p}`;
        const va = x.declarations[p];
        const vb = y.declarations[p];
        if (ignored.has(p)) {
          // Ignored properties are never compared by value: the target may
          // legitimately omit them, but a target that emits one anyway has a
          // generator bug worth surfacing.
          if (vb) {
            out.push({
              kind: 'declaration',
              id: pid,
              message: 'ignored property present in the generated output',
              location: x.source,
            });
          }
          continue;
        }
        if (!va) {
          out.push({
            kind: 'declaration',
            id: pid,
            message: 'present only in the generated output',
          });
        } else if (!vb) {
          out.push({
            kind: 'declaration',
            id: pid,
            message: 'missing from the generated output',
            location: x.source,
          });
        } else if (show(va) !== show(vb)) {
          out.push({
            kind: 'declaration',
            id: pid,
            message: `differs: source ${show(va)}, generated ${show(vb)}`,
            location: x.source,
          });
        }
      }
    }
  }

  // A component the target has already compared (in scope) is handled above.
  // A component out of scope but still known to the source is none of this
  // target's business either way. Only a name unknown to the source entirely
  // is a genuine anomaly worth surfacing here.
  for (const name of Object.keys(reparsed.components).sort(codeUnitCompare)) {
    if (!scopeSet.has(name) && !source.components[name]) {
      out.push({
        kind: 'component',
        id: name,
        message: 'present only in the generated output',
      });
    }
  }

  return out;
}
