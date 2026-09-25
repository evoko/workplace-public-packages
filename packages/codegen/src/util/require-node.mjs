/**
 * Imported first by every CLI (`bin/`): stops before anything else loads, or any file is touched,
 * on a Node older than `.nvmrc` pins (util/node-version.mjs).
 */

import { nodeVersionProblem } from './node-version.mjs';

const problem = nodeVersionProblem();
if (problem) {
  process.stderr.write(`${problem}\n`);
  process.exit(1);
}
