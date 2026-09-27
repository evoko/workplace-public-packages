#!/usr/bin/env node
// Which SOLAR components have been approved, per platform, and which can be worked on.
//
//   npm run solar:status              every component's colour, and the lines to paste for each 🟡
//   npm run solar:status -- --check   fails where a recorded approval no longer holds (CI)
//
// Read-only: it writes nothing. spec/approvals.yaml is written by people alone; each line records
// the fingerprint and the date, never a person.
// First, before anything else loads: the Node this needs (.nvmrc).
import '../src/util/require-node.mjs';
import {
  check,
  colour,
  readApprovals,
  render,
  scan,
} from '../src/approvals/status.mjs';

let approvals;
try {
  approvals = readApprovals();
} catch (error) {
  // A record YAML cannot read: say where, in one line, and fail.
  process.stderr.write(
    `spec/approvals.yaml: ${String(error.message).split('\n')[0]}\n`,
  );
  process.exit(1);
}
const coloured = colour(await scan(), approvals);
if (process.argv.includes('--check')) {
  const problems = check(coloured, approvals);
  for (const problem of problems) process.stderr.write(`${problem}\n`);
  if (problems.length) process.exit(1);
  process.stdout.write('solar:status: every recorded approval holds.\n');
} else {
  process.stdout.write(
    render(coloured, { on: new Date().toISOString().slice(0, 10) }),
  );
}
