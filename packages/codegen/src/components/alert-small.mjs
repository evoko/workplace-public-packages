/**
 * SOLAR Alert Small, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn callout; its shells are the callouts' (`src/shells/alert.mjs`).
 */

import {
  alertFlutter,
  alertMui,
  alertReact,
  requireAlert,
} from '../shells/alert.mjs';

const ABOUT =
  'The compact callout, for cards and panels where an Alert is too tall.';

export default {
  name: 'Alert Small',
  mui: alertMui('Alert Small'),
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
