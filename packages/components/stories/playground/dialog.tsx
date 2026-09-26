/**
 * Dialog's Playground: an "Open" button opens it, as an app's trigger would, and the `open` extra
 * follows it (overlay.tsx); its close button, Escape, a click on the Scrim or either action closes
 * it. Its type follows from what it holds, as the shell's does: the picture (`modalImage`) makes the
 * image dialog, else the Stepper the wizard, else the default, its icon before its title. The image
 * dialog's title is `imageTitle` where that holds words, else `title`, since the shell draws one
 * title in either place. Its stepper and actions are samples: five steps, the second active; Cancel
 * and Continue in a full-width Button Group, as the README composes them. Its content is a neutral
 * placeholder, a SOLAR Skeleton, since the dialog gives its content no text style of its own.
 */

import { Button } from '../../src/Button.js';
import { ButtonGroup } from '../../src/ButtonGroup.js';
import { Dialog } from '../../src/Dialog.js';
import { Skeleton } from '../../src/Skeleton.js';
import { Stepper } from '../../src/Stepper.js';
import { overlayOf } from './overlay.js';
import { picture } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const overlay = overlayOf(p);
    const image = p.flag('modalImage');
    const imageTitle = p.words('imageTitle');
    const title = p.text('title');
    const stepper = p.child('stepper');
    const actions = p.child('actions');
    return (
      <>
        {overlay.trigger}
        <Dialog
          open={overlay.open}
          onClose={() => overlay.close()}
          title={(image && imageTitle) || title}
          icon={p.icon('icon')}
          image={image ? <img src={picture} alt="" /> : undefined}
          description={p.words('description')}
          stepper={
            stepper.shown ? (
              <Stepper
                type="line+text"
                steps={['Step', 'Step', 'Step', 'Step', 'Step']}
                activeStep={1}
              />
            ) : undefined
          }
          actions={
            actions.shown ? (
              <ButtonGroup type="full-width">
                <Button
                  prio="secondary"
                  size="lg"
                  onClick={() => overlay.close('actions', 'Cancel')}
                >
                  Cancel
                </Button>
                <Button
                  size="lg"
                  onClick={() => overlay.close('actions', 'Continue')}
                >
                  Continue
                </Button>
              </ButtonGroup>
            ) : undefined
          }
        >
          {p.flag('content') ? <Skeleton /> : undefined}
        </Dialog>
      </>
    );
  },
} satisfies PlaygroundBuilder;
