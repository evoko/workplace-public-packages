import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { manifestJsonSchema } from '../src/components/manifest.js';
import { stableStringify } from '../src/ir/serialize.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'schemas', 'manifest.schema.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${stableStringify(manifestJsonSchema())}\n`);
console.log(`wrote ${out}`);
