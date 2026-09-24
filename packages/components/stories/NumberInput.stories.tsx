import type { Meta, StoryObj } from '@storybook/react-vite';
import { meta, playground, variants } from './solar.js';

// Storybook reads a story file statically, so the default export is an object literal here.
export default {
  title: 'SOLAR/Number Input',
  ...meta('Number Input'),
} satisfies Meta;
export const Playground: StoryObj = playground('Number Input');
export const Variants: StoryObj = variants('Number Input');
