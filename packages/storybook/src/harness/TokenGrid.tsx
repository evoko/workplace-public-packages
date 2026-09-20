import { ShadowCell } from './ShadowCell';
import { SAMPLES } from './samples';
import type { StoriesConfig, TargetId, TokenSpec } from './spec';
import { TARGET_CSS } from './styles';

export interface TokenGridProps {
  category: string;
  tokens: TokenSpec[];
  config: StoriesConfig;
}

function tokenVar(token: TokenSpec, target: TargetId): string {
  return target === 'css'
    ? token.cssVar
    : target === 'tailwind'
      ? token.tailwindVar
      : token.muiVar;
}

export function tokenCellId(target: TargetId, token: TokenSpec): string {
  return `${target}|${token.id}`;
}

export const TOKEN_TARGETS: readonly TargetId[] = ['css', 'tailwind', 'mui'];

/** Escapes a token variable for use inside a double-quoted HTML attribute (variable names contain no quotes; kept for safety). */
function sampleMarkup(category: string, variable: string): string {
  const style = SAMPLES[category].style(variable).replace(/"/g, '&quot;');
  return `<span class="sample" style="${style}">Ag</span>`;
}

const CSS_ONLY = [TARGET_CSS.css];
const TAILWIND_ONLY = [TARGET_CSS.tailwind];
const NONE: readonly string[] = [];

/**
 * One row per token, one cell per target; each cell renders the category's
 * sample element consuming that target's variable. MUI variables come from
 * the `ThemeProvider` the preview decorator wraps around every story.
 */
export function TokenGrid({ category, tokens, config }: TokenGridProps) {
  if (!SAMPLES[category]) {
    return <p>No sample for category {category}.</p>;
  }
  return (
    <table className="ds-compare" data-parity-category={category}>
      <thead>
        <tr>
          <th scope="col">
            {config.name} {category}
          </th>
          {TOKEN_TARGETS.map((t) => (
            <th key={t} scope="col">
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {tokens.map((token) => (
          <tr key={token.id}>
            <th scope="row">
              <code>{token.id}</code>
              <br />
              <small>
                {token.cssVar} / {token.tailwindVar} / {token.muiVar}
              </small>
            </th>
            {TOKEN_TARGETS.map((t) => (
              <td key={t}>
                <ShadowCell
                  id={tokenCellId(t, token)}
                  css={
                    t === 'css'
                      ? CSS_ONLY
                      : t === 'tailwind'
                        ? TAILWIND_ONLY
                        : NONE
                  }
                  html={sampleMarkup(category, tokenVar(token, t))}
                  rootSelector=".sample"
                  mode={config.mode}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
