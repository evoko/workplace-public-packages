/**
 * The page the visual checks measure: every variant of every generated component, rendered by the
 * real components with the real stylesheets, one case per oracle variant, in the oracle's order.
 * How each component is rendered is its case module, `cases/<name>.tsx`.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import Paper from '@mui/material/Paper';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { createSolarThemeOptions } from '@bwp-web/styles/mui';
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

createRoot(document.getElementById('root')!).render(
  location.hash === '#theme' ? <ThemeProbe /> : <Page />,
);
