import { ThemeProvider } from '@mui/material/styles';

import { cssMarkup } from './markup';
import { ShadowCell } from './ShadowCell';
import {
  cellId,
  rowKey,
  rowsFor,
  targetsFor,
  type CompareSpec,
  type StoriesConfig,
  type TargetId,
} from './spec';
import { TARGET_CSS } from './styles';

export type TargetsChoice = 'all' | TargetId;

export interface CompareGridProps {
  spec: CompareSpec;
  config: StoriesConfig;
  /** The `dsTargets` global: `all`, or one target shown next to the css reference. */
  targets?: TargetsChoice;
}

function rootSelectorFor(
  spec: CompareSpec,
  config: StoriesConfig,
  target: TargetId,
): string {
  return target === 'mui' && spec.mui
    ? `.${spec.mui.rootClass}`
    : `.${config.prefix}-${spec.name}`;
}

const CSS_ONLY = [TARGET_CSS.css];
const TAILWIND_ONLY = [TARGET_CSS.tailwind];

/**
 * Columns are targets, rows are every axis permutation times base and each
 * state; every cell is a ShadowCell. The MUI `ThemeProvider` wraps the whole
 * table so MUI's theme variables are written at document level, where every
 * cell inherits them.
 */
export function CompareGrid({
  spec,
  config,
  targets = 'all',
}: CompareGridProps) {
  const columns = targetsFor(spec).filter(
    (t) => targets === 'all' || t === 'css' || t === targets,
  );
  const rows = rowsFor(spec);
  const table = (
    <table className="ds-compare" data-parity-component={spec.name}>
      <thead>
        <tr>
          <th scope="col" data-parity-neutral={spec.name}>
            {spec.displayName}
          </th>
          {columns.map((t) => (
            <th key={t} scope="col">
              {t}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} data-parity-row={rowKey(row)}>
            <th scope="row">{rowKey(row)}</th>
            {columns.map((t) => (
              <td key={t}>
                {t === 'mui' && spec.mui ? (
                  <ShadowCell
                    id={cellId(t, row)}
                    mode={config.mode}
                    rootSelector={rootSelectorFor(spec, config, t)}
                  >
                    {spec.mui.render(row)}
                  </ShadowCell>
                ) : (
                  <ShadowCell
                    id={cellId(t, row)}
                    mode={config.mode}
                    css={t === 'css' ? CSS_ONLY : TAILWIND_ONLY}
                    html={cssMarkup(spec, config.prefix, row)}
                    rootSelector={rootSelectorFor(spec, config, t)}
                  />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
  return spec.mui ? (
    <ThemeProvider theme={spec.mui.theme}>{table}</ThemeProvider>
  ) : (
    table
  );
}
