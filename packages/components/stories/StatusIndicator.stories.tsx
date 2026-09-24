import type { Meta, StoryObj } from '@storybook/react-vite';
import { meta, playground, variants } from './solar.js';

// Storybook reads a story file statically, so the default export is an object literal here.
export default {
  title: 'SOLAR/StatusIndicator',
  ...meta('StatusIndicator'),
} satisfies Meta;
export const Playground: StoryObj = playground('StatusIndicator');
export const Variants: StoryObj = variants('StatusIndicator');
