import type { Meta, StoryObj } from '@storybook/react-vite';
import { meta, playground, variants } from './solar.js';

// Storybook reads a story file statically, so the default export is an object literal here.
export default { title: 'SOLAR/Node End', ...meta('Node End') } satisfies Meta;
export const Playground: StoryObj = playground('Node End');
export const Variants: StoryObj = variants('Node End');
