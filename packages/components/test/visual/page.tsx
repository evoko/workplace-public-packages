/**
 * The page the visual checks measure: every variant of every generated component, rendered by the
 * real components with the real stylesheets, one case per oracle variant, in the oracle's order.
 * How each component is rendered is its case module, `cases/<name>.tsx`.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import MuiButton from '@mui/material/Button';
import MuiIconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import {
  createSolarThemeOptions,
  solarMuiThemeDecisions,
} from '@bwp-web/styles/mui';
import { icon } from './cases/probes.js';
import type { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Card } from '../../src/Card.js';
import { CASES, slug } from './cases/index.js';

/**
 * At `#theme`: a stock MUI Paper beside a SOLAR Card under the SOLAR theme, in a Light subtree and
 * a Dark one, each switched by `data-theme` alone, as an app switches them. The check measures
 * that one attribute turns both.
 */
function ThemeProbe() {
  const theme = createTheme(createSolarThemeOptions());
  return (
    <ThemeProvider theme={theme}>
      {['light', 'dark'].map((mode) => (
        <div key={mode} data-theme={mode} data-probe={mode}>
          <Paper elevation={0} style={{ width: 40, height: 40 }} />
          <Card title="Label" data-part="card" style={{ width: 160 }} />
        </div>
      ))}
    </ThemeProvider>
  );
}

function Page() {
  return (
    <main>
      {Object.entries(CASES).flatMap(([component, c]) =>
        c.oracle.variants.map((v, i) => (
          <div
            key={`${component}-${i}`}
            data-case={`${slug(component)}:${i}`}
            style={{ padding: 8 }}
          >
            {c.render(v)}
          </div>
        )),
      )}
    </main>
  );
}

type Decision = {
  component: string;
  props: Record<string, { axis: string; values: Record<string, unknown> }>;
  fixed: Record<string, unknown>;
};

/**
 * The MUI props a stock component takes to draw one SOLAR variant, from the theme's decisions, or
 * null where no MUI prop reaches it (a round Icon Button, a loading one: MUI's own loading
 * indicator is not SOLAR's Spinner).
 */
export function stockProps(d: Decision, props: Record<string, unknown>) {
  if (props.loading) return null;
  for (const [axis, value] of Object.entries(d.fixed))
    if (props[axis] !== value) return null;
  const out: Record<string, unknown> = { disabled: props.disabled };
  for (const [prop, { axis, values }] of Object.entries(d.props)) {
    const found = Object.entries(values).find(([, v]) => v === props[axis]);
    if (!found) return null;
    out[prop] = found[0];
  }
  return out;
}

/** How each themed stock component is rendered, its slots filled with the probes. */
const STOCK: Record<string, (mui: Record<string, unknown>) => ReactNode> = {
  MuiButton: (mui) => (
    <MuiButton {...mui} startIcon={icon} endIcon={icon}>
      Label
    </MuiButton>
  ),
  MuiIconButton: (mui) => (
    <MuiIconButton {...mui} aria-label="Icon">
      {icon}
    </MuiIconButton>
  ),
};

/**
 * At `#stock`: stock MUI components under the SOLAR theme, one per variant of the SOLAR component
 * each draws that its MUI props reach, marked as that component's case (`stock-button:3`), so the
 * check measures them against the same oracle.
 */
function StockCases() {
  const theme = createTheme(createSolarThemeOptions());
  return (
    <ThemeProvider theme={theme}>
      <main>
        {/* The SOLAR component itself under the theme too: its own recipe, never the stock one's. */}
        {Object.values(solarMuiThemeDecisions).flatMap((d) =>
          CASES[d.component].oracle.variants.map((v, i) => (
            <div
              key={`themed-${d.component}-${i}`}
              data-case={`themed-${slug(d.component)}:${i}`}
              style={{ padding: 8 }}
            >
              {CASES[d.component].render(v)}
            </div>
          )),
        )}
        {Object.entries(solarMuiThemeDecisions).flatMap(([key, d]) =>
          CASES[d.component].oracle.variants.map((v, i) => {
            const mui = stockProps(d as Decision, v.props);
            if (!mui) return null;
            return (
              <div
                key={`${key}-${i}`}
                data-case={`stock-${slug(d.component)}:${i}`}
                style={{ padding: 8 }}
              >
                {STOCK[key](mui)}
              </div>
            );
          }),
        )}
      </main>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  location.hash === '#theme' ? (
    <ThemeProbe />
  ) : location.hash === '#stock' ? (
    <StockCases />
  ) : (
    <Page />
  ),
);
