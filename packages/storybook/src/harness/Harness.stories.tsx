import type { Meta, StoryObj } from '@storybook/react-vite';

import { storiesConfig } from '../generated/config';
import { CompareGrid, parityPlay, type CompareSpec } from './index';

/**
 * A hand-written smoke test for the harness itself: the starter `example`
 * component compared between the css and tailwind cells only, with no MUI
 * column. It exercises the cells, the driver, both modes, and the diff path
 * without depending on the generated MUI package.
 */
const spec: CompareSpec = {
  name: 'example',
  displayName: 'Harness',
  rootElement: 'button',
  axes: [
    { name: 'tone', values: ['neutral', 'accent'], default: 'neutral' },
    { name: 'size', values: ['sm', 'md'], default: 'md' },
  ],
  states: [
    { name: 'hover', kind: 'hover' },
    { name: 'focus-visible', kind: 'focus-visible' },
    {
      name: 'disabled',
      kind: 'attribute',
      attributes: { disabled: '' },
      muiProp: 'disabled',
    },
  ],
  slots: [{ name: 'icon', element: 'span', content: 'plus' }],
  label: 'Example',
  labelSlot: 'label',
  labelElement: 'span',
  tailwind: true,
  mui: null,
};

const meta: Meta = {
  title: 'Styles/Harness',
  parameters: { layout: 'padded' },
};

export default meta;

export const Compare: StoryObj = {
  render: (_args, context) => (
    <CompareGrid
      spec={spec}
      config={storiesConfig}
      targets={context.globals.dsTargets}
    />
  ),
  play: (context) => parityPlay(context, spec, storiesConfig),
};
