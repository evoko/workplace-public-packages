import type { Meta, StoryObj } from '@storybook/react-vite';
import { meta, playground, variants } from './solar.js';

// Storybook reads a story file statically, so the default export is an object literal here.
export default {
  title: 'SOLAR/Text Area',
  ...meta('Text Area'),
} satisfies Meta;
export const Playground: StoryObj = playground('Text Area');
export const Variants: StoryObj = variants('Text Area');
