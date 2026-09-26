/**
 * Alert Small's Playground: as Alert's, the compact callout; its type, variant (Figma's `style`),
 * title, description and action from their controls, each cleared part left out, the action's click
 * logged. It fills its container, the width box.
 */

import { AlertSmall, type AlertSmallProps } from '../../src/AlertSmall.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <AlertSmall
      type={p.choice<NonNullable<AlertSmallProps['type']>>('type')}
      variant={p.choice<NonNullable<AlertSmallProps['variant']>>('variant')}
      title={p.words('title')}
      description={p.words('description')}
      action={p.words('action')}
      onAction={() => p.log('onAction')}
    />
  ),
} satisfies PlaygroundBuilder;
