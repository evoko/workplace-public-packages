/**
 * The page the visual checks measure: every variant of every generated component, rendered by the
 * real components with the real stylesheets, one case per oracle variant, in the oracle's order.
 * How each component is rendered is its case module, `cases/<name>.tsx`.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import { CASES, slug } from './cases/index.js';

function Page() {
  return (
    <main>
      {Object.entries(CASES).flatMap(([component, c]) =>
        c.oracle.variants.map((v, i) => (
          <div
            key={`${component}-${i}`}
            data-case={`${slug(component)}-${i}`}
            style={{ padding: 8 }}
          >
            {c.render(v)}
          </div>
        )),
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
