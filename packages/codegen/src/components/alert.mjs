/**
 * SOLAR Alert, beyond its IR: where MUI draws each layer, and the two shell templates, run once
 * by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawn callout; its shells are the callouts' (`src/scaffold/alert.mjs`).
 */

import {
  alertFlutter,
  alertMui,
  alertReact,
  requireAlert,
} from '../scaffold/alert.mjs';

const ABOUT =
  'A callout of its full size, for a page or a panel; inside cards and narrower panels, use Alert Small.';

export default {
  name: 'Alert',
  mui: alertMui('Alert'),
  flutter: {},
  templates: {
    react: (spec) => {
      requireAlert(spec);
      return alertReact(spec, { about: ABOUT });
    },
    flutter: (spec) => {
      requireAlert(spec);
      return alertFlutter(spec, { about: ABOUT });
    },
  },
};
