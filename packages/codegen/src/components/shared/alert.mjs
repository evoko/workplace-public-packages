/**
 * What SOLAR's callouts share on the web, Alert and Alert Small: the MUI table of their drawn
 * layers. The two differ in size alone, which is the recipe's; their shells are files of their own.
 */

import { pascal } from '../../util/naming.mjs';
import { drawnResets } from './drawn.mjs';
import { targetArea } from './target.mjs';

/** Where MUI draws each layer: every layer drawn by the shell, the action a bare <button>. */
export function alertMui(name) {
  const P = `Solar${pascal(name)}`;
  return {
    slots: 'drawn',
    resets: drawnResets(name, {
      [`& button.${P}-action`]: {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'start',
      },
      // A 44 × 44 target around the action (target.mjs).
      ...targetArea(`& button.${P}-action`),
    }),
  };
}
