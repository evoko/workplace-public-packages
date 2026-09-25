import oracle from '../../../../../spec/verify/coachmark.json';
import { Button } from '../../../src/Button.js';
import { ButtonGroup } from '../../../src/ButtonGroup.js';
import { Coachmark, type CoachmarkProps } from '../../../src/Coachmark.js';
import type { VisualCase } from './types.js';

// Each side with Figma's words, closable, so its close button is drawn; its actions the regular
// Button Group Figma composes, its tertiary hidden (the oracle's hides), each Button marked as the
// layer the group draws it in, so each is measured as the Button check measures one; in place.
export default {
  oracle,
  render: (v) => (
    <Coachmark
      {...(v.props as Pick<CoachmarkProps, 'side'>)}
      title="Title"
      body="Tutorial step text"
      counter="1 / 6 steps"
      onClose={() => {}}
      actions={
        <ButtonGroup orientation="horizontal" type="regular">
          <Button data-layer="secondaryCTA" size="md" prio="secondary">
            Label
          </Button>
          <Button data-layer="button3" size="md" prio="primary">
            Label
          </Button>
        </ButtonGroup>
      }
    />
  ),
} satisfies VisualCase;
