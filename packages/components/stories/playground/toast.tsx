/**
 * Toast's Playground: its status, message and action from their controls, a cleared action left
 * out, the action's click logged; its Tag shown by its toggle, with the `tag label` extra's words; a
 * chevron after the action while the `chevron` icon control shows one (the shell draws SOLAR's
 * chevron, whichever is picked). Where it appears, and for how long, is the app's Snackbar, so here
 * it is drawn in place.
 */

import { Toast, type ToastProps } from '../../src/Toast.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const tagLabel = p.text('tag label');
    return (
      <Toast
        status={p.choice<NonNullable<ToastProps['status']>>('status')}
        message={p.text('message')}
        tag={p.child('tag').shown ? tagLabel : undefined}
        action={p.words('action')}
        onAction={() => p.log('onAction')}
        chevron={p.icon('chevron') !== undefined}
      />
    );
  },
} satisfies PlaygroundBuilder;
