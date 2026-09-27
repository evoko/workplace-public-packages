/**
 * The workbench bar over HTTP, for workbench-scenarios.spec.mjs: the bar for the component the
 * URL's hash names (Button by default), on the web, given the Playground values the query's
 * `controls` holds (JSON; none by default), its client the real one (httpClient), asking
 * the page's own origin, where the spec answers as the scenario's fake service
 * (codegen/src/workbench/bar-scenarios.json). Drawn here alone: never on the visual checks' pages.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import { SolarProvider } from '../../src/SolarProvider.js';
import { WorkbenchBar } from '../../stories/workbench/Bar.js';
import { httpClient } from '../../stories/workbench/client.js';

const component = decodeURIComponent(location.hash.slice(1)) || 'Button';
const controls = JSON.parse(
  new URLSearchParams(location.search).get('controls') ?? '{}',
) as Record<string, unknown>;

createRoot(document.getElementById('root')!).render(
  <SolarProvider>
    <WorkbenchBar
      component={component}
      platform="web"
      controls={controls}
      client={httpClient(`${location.origin}/service`)}
    />
    <p id="ready">ready</p>
  </SolarProvider>,
);
