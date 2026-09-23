#!/usr/bin/env node
// Scaffolds a component's hand-owned shell from its IR, once.
//
//   npm run solar:scaffold Button                      write packages/components/src/Button.tsx and
//                                                      stories/Button.stories.tsx, each if absent
//   npm run solar:scaffold -- --flutter Button         write solar_flutter's lib/src/components/solar_button.dart
//   npm run solar:scaffold Button -- --force           overwrite it (discards any hand edits)
//
// Deliberately separate from solar:codegen and never run in CI: the shell is owned by developers
// after this, and regenerating it would clobber the behaviour they added.
import * as stage from '../src/stages/components.mjs';
import {
  scaffold,
  scaffoldFlutter,
  scaffoldStory,
} from '../src/scaffold/index.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const flutter = args.includes('--flutter');
const names = args.filter((a) => !a.startsWith('--'));
if (names.length === 0) {
  console.error(
    'usage: npm run solar:scaffold <Component> [-- --flutter] [-- --force]',
  );
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
  const writes = flutter
    ? [scaffoldFlutter(found.spec, { force })]
    : [scaffold(found.spec, { force }), scaffoldStory(found.spec, { force })];
  for (const { status, file } of writes)
    if (status === 'exists')
      console.log(
        `${file} exists and is hand-owned; left alone. Pass --force to overwrite it.`,
      );
    else console.log(`${status} ${file}`);
}
