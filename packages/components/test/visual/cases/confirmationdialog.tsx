import oracle from '../../../../../spec/verify/confirmationdialog.json';
import {
  ConfirmationDialog,
  type ConfirmationDialogProps,
} from '../../../src/ConfirmationDialog.js';
import type { VisualCase } from './types.js';

// Each intent with Figma's words, its two Buttons marked as the layers the Button Group draws them
// in, so each is measured as the Button check measures one; in place.
export default {
  oracle,
  render: (v) => (
    <ConfirmationDialog
      {...(v.props as Pick<ConfirmationDialogProps, 'intent'>)}
      inline
      title="Are you sure?"
      description="This action will apply the changes you've made. You can modify them later."
      onConfirm={() => {}}
      onCancel={() => {}}
      cancelButtonProps={{ 'data-layer': 'tertiaryCTA' }}
      confirmButtonProps={{ 'data-layer': 'secondaryCTA' }}
    />
  ),
} satisfies VisualCase;
