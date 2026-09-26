/**
 * ConfirmationDialog's Playground: an "Open" button opens it, as an app's trigger would, and the
 * `open` extra follows it (overlay.tsx); its intent, title and description from their controls.
 * Its own Buttons close it: Continue logged `onConfirm`, Cancel, Escape and a click on the Scrim
 * `onCancel`.
 */

import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from '../../src/ConfirmationDialog.js';
import { overlayOf } from './overlay.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const overlay = overlayOf(p);
    return (
      <>
        {overlay.trigger}
        <ConfirmationDialog
          open={overlay.open}
          intent={p.choice<NonNullable<ConfirmationDialogProps['intent']>>(
            'intent',
          )}
          title={p.text('title')}
          description={p.words('description')}
          onConfirm={() => overlay.close('onConfirm')}
          onCancel={() => overlay.close('onCancel')}
        />
      </>
    );
  },
} satisfies PlaygroundBuilder;
