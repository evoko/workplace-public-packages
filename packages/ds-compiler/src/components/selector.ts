import selectorParser, {
  type Node as SelectorNode,
  type Root as SelectorRoot,
} from 'postcss-selector-parser';
import type { Diagnostics, SourceLocation } from '../errors.js';
import type { Manifest } from './manifest.js';
import { PSEUDO_STATES, sortStates, stateForAttribute } from './states.js';

export interface ParsedSelector {
  slot: string;
  axes: Record<string, string>;
  states: string[];
}

/**
 * Parses one selector (no commas) against the grammar:
 *   .<prefix>-<name>[data-<axis>="<value>"]*<state>*  [ .<prefix>-<name>__<slot> ]
 * Reports exactly one diagnostic and returns null on the first violation.
 */
export function parseSelector(
  selector: string,
  manifest: Manifest,
  prefix: string,
  location: SourceLocation,
  diag: Diagnostics,
): ParsedSelector | null {
  const fail = (
    code: 'DS-E030' | 'DS-E031' | 'DS-E032' | 'DS-E033' | 'DS-E034',
    message: string,
  ): null => {
    diag.add(code, `"${selector}": ${message}`, location);
    return null;
  };

  let ast: SelectorRoot;
  try {
    ast = selectorParser().astSync(selector);
  } catch (err) {
    return fail('DS-E030', `cannot parse selector (${(err as Error).message})`);
  }
  if (ast.nodes.length !== 1) {
    return fail('DS-E030', 'expected a single selector');
  }

  const compounds: SelectorNode[][] = [[]];
  for (const node of ast.nodes[0].nodes) {
    if (node.type === 'combinator') {
      if (node.value.trim() !== '') {
        return fail(
          'DS-E034',
          `combinator "${node.value.trim()}" is not allowed; only a descendant space`,
        );
      }
      compounds.push([]);
      continue;
    }
    compounds[compounds.length - 1].push(node);
  }
  if (compounds.length > 2) {
    return fail(
      'DS-E034',
      'at most one descendant combinator (root then slot) is allowed',
    );
  }

  const rootClass = `${prefix}-${manifest.name}`;
  let foundRoot = false;
  const axes: Record<string, string> = {};
  const states: string[] = [];

  for (const node of compounds[0]) {
    switch (node.type) {
      case 'class': {
        if (node.value === rootClass && !foundRoot) {
          foundRoot = true;
          break;
        }
        if (node.value === rootClass && foundRoot) {
          return fail(
            'DS-E030',
            `the root class ".${rootClass}" appears twice`,
          );
        }
        return fail(
          'DS-E030',
          `unexpected class ".${node.value}"; the root compound may only contain .${rootClass}`,
        );
      }
      case 'attribute': {
        const attr = node.attribute;
        const value = node.value;
        if (value !== undefined && node.operator !== '=') {
          return fail(
            'DS-E030',
            `attribute operator "${node.operator}" is not allowed; use exact match [attr="value"]`,
          );
        }
        if (node.insensitive) {
          return fail(
            'DS-E030',
            'case-insensitive attribute flag is not allowed',
          );
        }
        if (attr.startsWith('data-') && attr !== 'data-state') {
          const axis = attr.slice('data-'.length);
          const def = manifest.axes[axis];
          if (!def) {
            return fail(
              'DS-E031',
              `unknown axis "${axis}"; declared axes: ${Object.keys(manifest.axes).join(', ') || '(none)'}`,
            );
          }
          if (value === undefined || !def.values.includes(value)) {
            return fail(
              'DS-E031',
              `axis "${axis}" has no value "${value ?? ''}"; allowed: ${def.values.join(', ')}`,
            );
          }
          if (axis in axes) {
            return fail('DS-E030', `axis "${axis}" selected twice`);
          }
          axes[axis] = value;
          break;
        }
        const state = stateForAttribute(attr, value);
        if (!state) {
          return fail(
            'DS-E030',
            `attribute [${attr}${value === undefined ? '' : `="${value}"`}] is not a recognized state`,
          );
        }
        states.push(state);
        break;
      }
      case 'pseudo': {
        if (node.value.startsWith('::')) {
          return fail(
            'DS-E034',
            `pseudo-element "${node.value}" is not allowed`,
          );
        }
        const state = PSEUDO_STATES[node.value.slice(1)];
        if (!state) {
          return fail(
            'DS-E030',
            `pseudo-class "${node.value}" is not a recognized state; allowed: ${Object.keys(
              PSEUDO_STATES,
            )
              .map((p) => `:${p}`)
              .join(', ')}`,
          );
        }
        states.push(state);
        break;
      }
      case 'tag':
        return fail(
          'DS-E034',
          `element selector "${node.value}" is not allowed`,
        );
      case 'id':
        return fail('DS-E034', `id selector "#${node.value}" is not allowed`);
      case 'universal':
        return fail('DS-E034', 'universal selector "*" is not allowed');
      case 'nesting':
        return fail('DS-E034', 'nesting selector "&" is not allowed');
      default:
        return fail('DS-E030', `unexpected selector part "${node.toString()}"`);
    }
  }
  if (!foundRoot) {
    return fail('DS-E030', `selector must start with .${rootClass}`);
  }

  let slot = 'root';
  if (compounds[1]) {
    const nodes = compounds[1];
    for (const n of nodes) {
      switch (n.type) {
        case 'tag':
          return fail(
            'DS-E034',
            `element selector "${n.value}" is not allowed`,
          );
        case 'id':
          return fail('DS-E034', `id selector "#${n.value}" is not allowed`);
        case 'universal':
          return fail('DS-E034', 'universal selector "*" is not allowed');
        case 'nesting':
          return fail('DS-E034', 'nesting selector "&" is not allowed');
        case 'pseudo':
        case 'attribute':
          return fail(
            'DS-E034',
            'states and axes go on the root compound, not on the slot',
          );
        default:
          break;
      }
    }
    if (nodes.length !== 1 || nodes[0].type !== 'class') {
      return fail('DS-E030', 'the slot compound must be exactly one class');
    }
    const cls = nodes[0].value;
    const slotPrefix = `${rootClass}__`;
    if (!cls.startsWith(slotPrefix)) {
      return fail(
        'DS-E030',
        `slot class ".${cls}" must start with .${slotPrefix}`,
      );
    }
    slot = cls.slice(slotPrefix.length);
    if (slot === 'root' || !manifest.slots[slot]) {
      return fail(
        'DS-E032',
        `unknown slot "${slot}"; declared slots: ${
          Object.keys(manifest.slots)
            .filter((s) => s !== 'root')
            .join(', ') || '(none)'
        }`,
      );
    }
  }

  for (const state of states) {
    if (!manifest.states.includes(state)) {
      return fail(
        'DS-E033',
        `state "${state}" is not declared in manifest.states [${manifest.states.join(', ')}]`,
      );
    }
  }

  return { slot, axes, states: sortStates(states) };
}
