/**
 * SOLAR Alert Small, beyond its IR: where MUI draws each layer. Its shells are files of their own,
 * written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * A drawn callout; its shells are the callouts' (`src/components/shared/alert.mjs`).
 */

import { alertMui } from './shared/alert.mjs';

export default {
  name: 'Alert Small',
  mui: alertMui('Alert Small'),
  flutter: {},
};
