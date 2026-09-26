/**
 * Alert's Playground: its type, variant (Figma's `style`), title, description and action from their
 * controls, each cleared part left out; the action's click is logged. It fills its container, the
 * width box.
 */

import { Alert, type AlertProps } from '../../src/Alert.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Alert
      type={p.choice<NonNullable<AlertProps['type']>>('type')}
      variant={p.choice<NonNullable<AlertProps['variant']>>('variant')}
      title={p.words('title')}
      description={p.words('description')}
      action={p.words('action')}
      onAction={() => p.log('onAction')}
    />
  ),
} satisfies PlaygroundBuilder;
