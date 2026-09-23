#!/usr/bin/env node
// Scaffolds a component's hand-owned shell from its IR, once.
//
//   npm run solar:scaffold Button            write packages/components/src/Button.tsx if absent
//   npm run solar:scaffold Button -- --force overwrite it (discards any hand edits)
//
// Deliberately separate from solar:codegen and never run in CI: the shell is owned by developers
// after this, and regenerating it would clobber the behaviour they added.
import * as stage from '../src/stages/components.mjs';
import { scaffold } from '../src/scaffold/index.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const names = args.filter((a) => !a.startsWith('--'));
if (names.length === 0) {
  console.error('usage: npm run solar:scaffold <Component> [-- --force]');
  process.exit(2);
}

const { built } = stage.build();
for (const name of names) {
  const found = built.find((b) => b.spec.component === name);
  if (!found) {
    console.error(
      `no component spec for ${name}; generated: ${built.map((b) => b.spec.component).join(', ')}`,
    );
    process.exitCode = 1;
    continue;
  }
  const { status, file } = scaffold(found.spec, { force });
  if (status === 'exists')
    console.log(
      `${file} exists and is hand-owned; left alone. Pass --force to overwrite it.`,
    );
  else console.log(`${status} ${file}`);
}
