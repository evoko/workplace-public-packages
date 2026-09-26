/**
 * Coachmark's Playground: one step of a tour, about the "Open" button, which starts it, as an app's
 * tour starts at its element, and the `open` extra follows it (overlay.tsx); Escape or its close
 * button ends it (`onClose`). Its side, title, words and counter from their controls, a cleared
 * body or counter left out; its actions, shown by the `actions` toggle, Back and Next in a regular
 * Button Group of md Buttons, as Figma composes them, each press logged with its words (the tour is
 * the app's).
 */

import { useState } from 'react';
import { Button } from '../../src/Button.js';
import { ButtonGroup } from '../../src/ButtonGroup.js';
import { Coachmark, type CoachmarkProps } from '../../src/Coachmark.js';
import { overlayOf } from './overlay.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function CoachmarkPlayground({ p }: { p: Playground }) {
  const overlay = overlayOf(p);
  // The element the step is about: the trigger.
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const action = (name: string, prio: 'primary' | 'secondary') => (
    <Button size="md" prio={prio} onClick={() => p.log('onClick', name)}>
      {name}
    </Button>
  );
  return (
    <>
      <span ref={setAnchor} style={{ display: 'inline-block' }}>
        {overlay.trigger}
      </span>
      <Coachmark
        anchorEl={anchor}
        open={overlay.open}
        onClose={() => overlay.close()}
        side={p.choice<NonNullable<CoachmarkProps['side']>>('side')}
        title={p.text('title')}
        body={p.words('body')}
        counter={p.words('counter')}
        actions={
          p.child('actions').shown ? (
            <ButtonGroup orientation="horizontal" type="regular">
              {action('Back', 'secondary')}
              {action('Next', 'primary')}
            </ButtonGroup>
          ) : undefined
        }
      />
    </>
  );
}

export default {
  render: (p) => <CoachmarkPlayground p={p} />,
} satisfies PlaygroundBuilder;
