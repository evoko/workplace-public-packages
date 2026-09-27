/**
 * The workbench bar over HTTP, for workbench-scenarios.spec.mjs and workbench-dialog.spec.mjs: the
 * bar for the component the URL's hash names (Button by default), on the web, given the Playground
 * values the query's `controls` holds (JSON; none by default), its client the real one
 * (httpClient), asking the page's own origin, where the spec answers as the scenario's fake service
 * (codegen/src/workbench/bar-scenarios.json). Inspect's preview draws the component's oracle
 * variants from its visual-check case, as the Variants page does (stories/variant-stage.tsx). Drawn
 * here alone: never on the visual checks' pages.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import { SolarProvider } from '../../src/SolarProvider.js';
import { WorkbenchBar } from '../../stories/workbench/Bar.js';
import { DrawnVariant } from '../../stories/variant-stage.js';
import { httpClient } from '../../stories/workbench/client.js';

/** How each component's states are marked, as Storybook's virtual:solar serves STATES (build.mjs). */
declare const __STATES__: Record<string, Record<string, string | null>>;

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
      drawVariant={(index, stage) => (
        <DrawnVariant
          component={component}
          index={index}
          states={__STATES__[component]}
          {...stage}
        />
      )}
    />
    <p id="ready">ready</p>
  </SolarProvider>,
);
