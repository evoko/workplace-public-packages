import oracle from '../../../../../spec/verify/toast.json';
import { Toast, type ToastProps } from '../../../src/Toast.js';
import type { VisualCase } from './types.js';

// Every slot filled, so each look is measured: the Tag with Figma's words, the message, and the
// action with its chevron.
export default {
  oracle,
  render: (v) => (
    <Toast
      {...(v.props as Pick<ToastProps, 'status'>)}
      tag="Label"
      message="Message goes here"
      action="Action"
      onAction={() => {}}
      chevron
    />
  ),
} satisfies VisualCase;
