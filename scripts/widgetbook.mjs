#!/usr/bin/env node
// Runs or builds solar_flutter's Widgetbook, the Flutter review surface. Also writes each
// component's approval circle beside the oracles, for the sidebar.
//
//   npm run widgetbook                       serve it in Chrome, with hot reload
//   node scripts/widgetbook.mjs build        build it for the web (CI), into widgetbook/build/web
//
// The app lays out the oracles, spec/verify/*.json. Flutter cannot bundle an asset from outside
// the app's own directory, so they are copied into widgetbook/assets/verify/ first, on every run:
// the copies are git-ignored and made fresh each time, so they cannot go stale, and a new
// component's oracle is picked up with no change to the app. The directory itself stays, kept in
// git by its .gitkeep: the pubspec declares it, and flutter analyze fails where it is missing.
import { spawnSync } from 'node:child_process';
import { copyFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(repoRoot, 'packages', 'solar_flutter', 'widgetbook');
const from = join(repoRoot, 'spec', 'verify');
const to = join(app, 'assets', 'verify');

for (const f of readdirSync(to)) if (f.endsWith('.json')) rmSync(join(to, f));
const oracles = readdirSync(from).filter((f) => f.endsWith('.json'));
for (const f of oracles) copyFileSync(join(from, f), join(to, f));
console.log(`widgetbook: ${oracles.length} oracles (${oracles.join(', ')})`);

// Each component's approval circle, for the sidebar. Beside the oracles, named so the app does not
// read it as one (it reads *.json there). Where the generator cannot load (the CI job that builds
// Widgetbook installs no npm packages), the app is built without circles.
try {
  const { circlesFor } =
    await import('../packages/codegen/src/approvals/status.mjs');
  writeFileSync(
    join(to, 'approvals.status'),
    JSON.stringify(await circlesFor('flutter')),
  );
  console.log('widgetbook: approval circles written');
} catch (error) {
  rmSync(join(to, 'approvals.status'), { force: true });
  console.log(
    `widgetbook: no approval circles (${error.message.split('\n')[0]})`,
  );
}

const flutter = (...args) => {
  const r = spawnSync('flutter', args, { cwd: app, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
flutter('pub', 'get');
if (process.argv[2] === 'build') flutter('build', 'web');
else flutter('run', '-d', 'chrome');
