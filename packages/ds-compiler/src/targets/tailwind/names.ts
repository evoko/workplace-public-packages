import { parseTokenName, type TokenCategory } from '../../tokens/categories.js';

/** Token categories that map onto a Tailwind v4 theme namespace. Others keep their source name. */
export const TAILWIND_NAMESPACES: Readonly<
  Partial<Record<TokenCategory, string>>
> = {
  color: 'color',
  space: 'spacing',
  radius: 'radius',
  'font-family': 'font',
  'font-size': 'text',
  'font-weight': 'font-weight',
  'line-height': 'leading',
  'letter-spacing': 'tracking',
  shadow: 'shadow',
  easing: 'ease',
};

/** `--<ns>-<prefix>-<path>` for namespaced categories, otherwise `--<prefix>-<category>-<path>`. */
export function tailwindVarName(
  category: TokenCategory,
  path: readonly string[],
  prefix: string,
): string {
  const ns = TAILWIND_NAMESPACES[category];
  const tail = path.join('-');
  return ns ? `--${ns}-${prefix}-${tail}` : `--${prefix}-${category}-${tail}`;
}

/** Namespace prefixes longest first, so `--font-weight-` wins over `--font-`. */
const INVERSE: ReadonlyArray<[string, TokenCategory]> = (
  Object.entries(TAILWIND_NAMESPACES) as [TokenCategory, string][]
)
  .map(([category, ns]): [string, TokenCategory] => [ns, category])
  .sort((a, b) => b[0].length - a[0].length || (a[0] < b[0] ? -1 : 1));

/**
 * Inverse of tailwindVarName. Returns the source custom-property name, or null
 * when the name is neither a namespaced token nor a source-named one.
 */
export function sourceNameFromTailwind(
  name: string,
  prefix: string,
): string | null {
  for (const [ns, category] of INVERSE) {
    const head = `--${ns}-${prefix}-`;
    if (name.startsWith(head) && name.length > head.length) {
      const candidate = `--${prefix}-${category}-${name.slice(head.length)}`;
      return parseTokenName(candidate, prefix) ? candidate : null;
    }
  }
  const sourceHead = `--${prefix}-`;
  if (name.startsWith(sourceHead) && name.length > sourceHead.length) {
    return parseTokenName(name, prefix) ? name : null;
  }
  return null;
}
