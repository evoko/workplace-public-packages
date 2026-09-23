/**
 * The page the visual checks measure: every variant of every generated component, rendered by the
 * real components with the real stylesheets, one case per oracle variant, in the oracle's order.
 * Each Button shows both icons and a counter, so their colours can be measured; a slot's look does
 * not depend on whether the prop that shows it is on.
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import button from '../../../../spec/verify/button.json';
import spinner from '../../../../spec/verify/spinner.json';
import { Button, type ButtonProps } from '../../src/Button.js';
import { Spinner, type SpinnerProps } from '../../src/Spinner.js';

const icon = (
  <svg viewBox="0 0 24 24" aria-hidden>
    <path d="M4 4h16v16H4z" fill="currentColor" />
  </svg>
);

function Page() {
  return (
    <main>
      {button.variants.map((v, i) => (
        <div key={i} data-case={`button-${i}`} style={{ padding: 8 }}>
          <Button
            {...(v.props as ButtonProps)}
            iconLeading={icon}
            iconTrailing={icon}
            counter={3}
          >
            Label
          </Button>
        </div>
      ))}
      {spinner.variants.map((v, i) => (
        <div key={i} data-case={`spinner-${i}`} style={{ padding: 8 }}>
          <Spinner {...(v.props as SpinnerProps)} aria-label="Loading" />
        </div>
      ))}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<Page />);
