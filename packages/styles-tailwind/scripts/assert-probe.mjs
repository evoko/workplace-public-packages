import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../dist/probe.css', import.meta.url), 'utf8');
const expected = [
  '--color-bwp-accent-default',
  'data-bwp-theme=',
  '.bwp-example',
  '.bg-bwp-accent-default',
  '.text-bwp-md',
  '.p-bwp-2',
  '.rounded-bwp-md',
  '.shadow-bwp-sm',
];
const missing = expected.filter((s) => !css.includes(s));
if (missing.length > 0) {
  console.error(`probe compile is missing: ${missing.join(', ')}`);
  process.exit(1);
}
console.log(`probe ok (${css.length} bytes)`);
