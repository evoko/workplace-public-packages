import oracle from '../../../../../spec/verify/emptystate.json';
import { Button } from '../../../src/Button.js';
import { EmptyState } from '../../../src/EmptyState.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every slot filled with Figma's own content: an icon probe, its words, and its sm secondary
// Button.
export default {
  oracle,
  render: () => (
    <EmptyState
      icon={icon}
      title="No items found"
      description="Try adjusting your search or filters."
      action={
        <Button size="sm" prio="secondary">
          Label
        </Button>
      }
    />
  ),
} satisfies VisualCase;
