/**
 * Approvals: which components a person has approved, per platform, against what each ships now.
 * 🟢 approved and every component it uses 🟢; 🟡 not approved and every component it uses 🟢,
 * ready to fix and review; 🔴 some component it uses not 🟢, not to be worked on. Read-only:
 * `spec/approvals.yaml` is written by people alone. `bin/solar-status.mjs` prints this; the
 * viewers show the circles.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { repoRoot, specDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { fingerprint, tokenValues, tokensCss } from './fingerprint.mjs';
import {
  flutterClosures,
  nodesOf,
  PLATFORMS,
  usesOf,
  webClosures,
} from './graph.mjs';

export const approvalsFile = join(specDir, 'approvals.yaml');
export const CIRCLES = { green: '🟢', yellow: '🟡', red: '🔴' };

/** The record, `{ <component>: { <platform>: { fingerprint, by, on } } }`; empty where it is. */
export function readApprovals(
  text = existsSync(approvalsFile) ? readFileSync(approvalsFile, 'utf8') : '',
) {
  return parse(text) ?? {};
}

const readRepo = (path) => readFileSync(join(repoRoot, path), 'utf8');

/**
 * Each platform's components, as `{ name, uses, files, fingerprint }`. `read` gives a repository
 * file's text for hashing (a test changes one in memory); which files each component ships is
 * always read from disk.
 */
export async function scan(platforms = PLATFORMS, { read = readRepo } = {}) {
  const tokens = tokenValues(read(tokensCss));
  const cache = new Map();
  const scanned = {};
  for (const platform of platforms) {
    const nodes = nodesOf(platform);
    const closures =
      platform === 'web' ? await webClosures(nodes) : flutterClosures(nodes);
    const uses = usesOf(nodes, closures);
    scanned[platform] = nodes.map((n) => ({
      name: n.name,
      uses: uses.get(n.name),
      files: closures.get(n.name),
      fingerprint: fingerprint(platform, closures.get(n.name), {
        read,
        tokens,
        cache,
      }),
    }));
  }
  return scanned;
}

/** A scan with each component's colour, and the components it waits on (those not 🟢). */
export function colour(scanned, approvals) {
  const coloured = {};
  for (const [platform, components] of Object.entries(scanned)) {
    const byName = new Map(components.map((c) => [c.name, c]));
    const memo = new Map();
    const of = (name, path = []) => {
      if (memo.has(name)) return memo.get(name);
      // A cycle can never be approved: the check names it.
      if (path.includes(name)) return 'red';
      const c = byName.get(name);
      const childrenGreen = c.uses.every(
        (k) => of(k, [...path, name]) === 'green',
      );
      const holds =
        approvals?.[name]?.[platform]?.fingerprint === c.fingerprint;
      const result = !childrenGreen ? 'red' : holds ? 'green' : 'yellow';
      memo.set(name, result);
      return result;
    };
    coloured[platform] = components.map((c) => ({
      ...c,
      colour: of(c.name),
      waitsOn: c.uses.filter((k) => of(k) !== 'green'),
    }));
  }
  return coloured;
}

const isMapping = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** What is wrong with the record, one sentence each; nothing where every approval holds. */
export function check(coloured, approvals) {
  const problems = [];
  const record = approvals ?? {};
  if (!isMapping(record))
    problems.push(
      'spec/approvals.yaml: expected a mapping of component to platforms.',
    );
  else
    for (const [name, platforms] of Object.entries(record)) {
      // A component with nothing under it records nothing.
      if (platforms === null) continue;
      if (!isMapping(platforms)) {
        problems.push(`${name}: expected a mapping of platform to approval.`);
        continue;
      }
      for (const [platform, approval] of Object.entries(platforms)) {
        if (!PLATFORMS.includes(platform)) {
          problems.push(
            `${name} (${platform}): ${platform} is no platform (${PLATFORMS.join(', ')}).`,
          );
          continue;
        }
        if (!isMapping(approval) || typeof approval.fingerprint !== 'string') {
          problems.push(
            `${name} (${platform}): expected { fingerprint, by, on }.`,
          );
          continue;
        }
        // A scan of one platform (a viewer's) has nothing to say about the other.
        if (!coloured[platform]) continue;
        const c = coloured[platform].find((x) => x.name === name);
        const many = c?.waitsOn.length > 1;
        if (!c)
          problems.push(
            `${name} (${platform}): approved, but ${platform} has no ${name}.`,
          );
        else if (approval.fingerprint !== c.fingerprint)
          problems.push(
            `${name} (${platform}): approved as ${approval.fingerprint}, but it now ships ` +
              `${c.fingerprint}: it, or a component it uses, changed. Review it again and paste ` +
              'its new line from `npm run solar:status`, or revert the change.',
          );
        else if (c.colour !== 'green')
          problems.push(
            `${name} (${platform}): approved while ${c.waitsOn.join(', ')} ` +
              `${many ? 'are' : 'is'} not; approve ${many ? 'those' : 'it'} first.`,
          );
      }
    }
  // A component uses every component whose shell it ships, however far down, so any cycle shows
  // as two components that use each other.
  for (const [platform, components] of Object.entries(coloured)) {
    const byName = new Map(components.map((c) => [c.name, c]));
    for (const c of components)
      for (const k of c.uses)
        if (byCodeUnit(c.name, k) < 0 && byName.get(k)?.uses.includes(c.name))
          problems.push(
            `${platform}: ${c.name} and ${k} use each other, so neither can ever be approved.`,
          );
  }
  return problems;
}

const quote = (text) => `'${String(text).replace(/'/g, "''")}'`;

/** A component's name as a YAML key: bare where YAML reads it back as that name, else quoted. */
const keyOf = (name) =>
  /^[A-Za-z][A-Za-z0-9 -]*$/.test(name) && !/^(null|true|false)$/i.test(name)
    ? name
    : quote(name);

/** The lines to paste into spec/approvals.yaml for each 🟡 component, by component. */
export function pasteFor(coloured, { by, on }) {
  const lines = new Map();
  for (const [platform, components] of Object.entries(coloured))
    for (const c of components)
      if (c.colour === 'yellow') {
        if (!lines.has(c.name)) lines.set(c.name, []);
        lines
          .get(c.name)
          .push(
            `  ${platform}: { fingerprint: '${c.fingerprint}', by: ${quote(by)}, on: ${on} }`,
          );
      }
  return [...lines]
    .sort(([a], [b]) => byCodeUnit(a, b))
    .map(
      ([name, platformLines]) => `${keyOf(name)}:\n${platformLines.join('\n')}`,
    )
    .join('\n');
}

/** The colours as the CLI prints them, and the lines to paste. */
export function render(coloured, { by, on }) {
  const titles = { web: 'Web', flutter: 'Flutter' };
  const out = [];
  for (const [platform, components] of Object.entries(coloured)) {
    const count = (k) => components.filter((c) => c.colour === k).length;
    out.push(
      `${titles[platform]}: ${CIRCLES.green} ${count('green')} · ${CIRCLES.yellow} ${count('yellow')} · ${CIRCLES.red} ${count('red')}`,
    );
    const colourOf = new Map(components.map((c) => [c.name, c.colour]));
    // Uses are transitive, so the yellow ones among waitsOn are exactly what is left to approve
    // before this component can be worked on; a red with none among them is only in a cycle.
    for (const c of components) {
      let suffix = '';
      if (c.colour === 'red') {
        const yellow = c.waitsOn.filter((k) => colourOf.get(k) === 'yellow');
        suffix = yellow.length
          ? ` (approve first: ${yellow.join(', ')})`
          : ' (in a cycle)';
      }
      out.push(`  ${CIRCLES[c.colour]} ${c.name}${suffix}`);
    }
    out.push('');
  }
  const paste = pasteFor(coloured, { by, on });
  if (paste)
    out.push(
      'To approve a 🟡 component once you have confirmed it, add its lines to spec/approvals.yaml',
      '(a component already there takes the platform line under its name):',
      '',
      paste,
    );
  return `${out.join('\n')}\n`;
}

/** Each component's circle on one platform, for a viewer's sidebar. */
export async function circlesFor(platform) {
  const coloured = colour(await scan([platform]), readApprovals())[platform];
  return Object.fromEntries(coloured.map((c) => [c.name, CIRCLES[c.colour]]));
}
