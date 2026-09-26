/** Node End's Playground: the dot, with or without its halo. */

import { NodeEnd } from '../../src/NodeEnd.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => <NodeEnd halo={p.flag('halo')} />,
} satisfies PlaygroundBuilder;
