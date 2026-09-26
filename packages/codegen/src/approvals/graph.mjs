/**
 * Each platform's components, the repository files each ships, and the components each uses: the
 * graph approvals follow (./status.mjs). A component is one with a shell on that platform; it
 * uses another when the other's shell is among the files it ships, however it got there (its own
 * import, or a runtime helper's). Shared helpers are never components: they count in the
 * fingerprint of every component that ships them. Every web component also ships what
 * `SolarProvider` installs, the MUI theme around it, since a change to that theme changes how
 * the component looks in an app.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { DESCRIPTORS } from '../components/index.mjs';
import {
  componentsSrc,
  flutterComponents,
  flutterFileOf,
  flutterLib,
  shellFileOf,
} from '../shells/index.mjs';
import { repoRoot } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { WORKSPACE_SOURCES } from '../util/workspace-sources.mjs';

export const PLATFORMS = ['web', 'flutter'];

/** A repository path, relative and with forward slashes, whatever the machine. */
export const rel = (path) => relative(repoRoot, path).split(sep).join('/');

/** Dart or TypeScript text with its block comments gone, for a pattern that reads code. */
const withoutBlockComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * The components with a shell on a platform, each with the file it starts from. A component checked
 * as another's state has none. A chart a library draws is listed where a wrapper ships it: on the
 * web its own file, in Flutter its widget in `lib/src/solar_<library>.dart`.
 */
export function nodesOf(platform) {
  const nodes = [];
  for (const d of DESCRIPTORS) {
    if (d.checkedAs) continue;
    if (platform === 'web') {
      const entry = join(componentsSrc, shellFileOf(d.name));
      if (d.library && !existsSync(entry)) continue;
      nodes.push({ name: d.name, entry });
    } else if (d.library) {
      const entry = join(flutterLib, 'src', `solar_${d.library}.dart`);
      if (!existsSync(entry)) continue;
      const widget = shellFileOf(d.name).slice(0, -'.tsx'.length);
      const code = withoutBlockComments(readFileSync(entry, 'utf8'));
      if (new RegExp(`\\bclass Solar${widget}\\b`).test(code))
        nodes.push({ name: d.name, entry });
    } else
      nodes.push({
        name: d.name,
        entry: join(flutterComponents, flutterFileOf(d.name)),
      });
  }
  return nodes;
}

/** What an app wraps every SOLAR component in: built beside the shells, never a component. */
const solarProvider = join(componentsSrc, 'SolarProvider.tsx');

/**
 * Every repository file each web component ships, from one esbuild pass over every shell and
 * `SolarProvider`: the files that put code in its bundle, and those of the MUI theme
 * `SolarProvider` installs, the workspace packages read from their sources, the app's packages
 * (React, MUI, Emotion) left out. Only the file set is used; esbuild's output is never hashed, so
 * an esbuild upgrade moves no fingerprint.
 */
export async function webClosures(nodes) {
  const { build } = await import('esbuild');
  const result = await build({
    entryPoints: [...nodes.map((n) => n.entry), solarProvider],
    absWorkingDir: repoRoot,
    bundle: true,
    write: false,
    metafile: true,
    format: 'esm',
    jsx: 'automatic',
    treeShaking: true,
    // esbuild needs a directory to name several entries' outputs by, even with `write: false`;
    // nothing is written there.
    outdir: join(repoRoot, '.solar-status'),
    alias: WORKSPACE_SOURCES,
    packages: 'external',
    loader: { '.css': 'empty', '.woff': 'empty', '.woff2': 'empty' },
    logLevel: 'error',
  });
  // An unmapped workspace import is external here, so its files would count for nothing.
  for (const [file, input] of Object.entries(result.metafile.inputs))
    for (const { path, external } of input.imports)
      if (external && path.startsWith('@bwp-web/'))
        throw new Error(
          `solar:status: ${file} imports ${path}, which WORKSPACE_SOURCES does not map`,
        );
  const byEntry = new Map();
  for (const output of Object.values(result.metafile.outputs)) {
    if (!output.entryPoint) continue;
    const files = Object.entries(output.inputs)
      .filter(([, input]) => input.bytesInOutput > 0)
      .map(([file]) => file);
    byEntry.set(output.entryPoint, new Set([output.entryPoint, ...files]));
  }
  const filesOf = (entry) => {
    const files = byEntry.get(rel(entry));
    if (!files)
      throw new Error(`solar:status: esbuild built nothing for ${rel(entry)}`);
    return files;
  };
  const provided = filesOf(solarProvider);
  return new Map(
    nodes.map((n) => [
      n.name,
      [...new Set([...filesOf(n.entry), ...provided])].sort(byCodeUnit),
    ]),
  );
}

const IMPORT = /^\s*(?:import|export|part)\s+['"]([^'"]+)['"]/gm;

/**
 * Every file each Flutter component ships: its widget and whatever it imports within
 * solar_flutter, followed file to file. Flutter, fl_chart and intl are the app's.
 */
export function flutterClosures(nodes, read = (p) => readFileSync(p, 'utf8')) {
  const imports = new Map();
  const importsOf = (file) => {
    if (!imports.has(file)) {
      const found = [];
      for (const [, target] of withoutBlockComments(read(file)).matchAll(
        IMPORT,
      )) {
        let path;
        if (target.startsWith('package:solar_flutter/'))
          path = join(
            flutterLib,
            target.slice('package:solar_flutter/'.length),
          );
        else if (/^(package|dart):/.test(target)) continue;
        else path = resolve(dirname(file), target);
        if (path.startsWith(flutterLib + sep) && existsSync(path))
          found.push(path);
      }
      imports.set(file, found);
    }
    return imports.get(file);
  };
  return new Map(
    nodes.map((n) => {
      const seen = new Set([n.entry]);
      const queue = [n.entry];
      while (queue.length)
        for (const next of importsOf(queue.shift()))
          if (!seen.has(next)) {
            seen.add(next);
            queue.push(next);
          }
      return [n.name, [...seen].map(rel).sort(byCodeUnit)];
    }),
  );
}

/** The components each one uses: those whose shell it ships, apart from its own entry's. */
export function usesOf(nodes, closures) {
  const entryOf = new Map(nodes.map((n) => [n.name, rel(n.entry)]));
  return new Map(
    nodes.map((n) => {
      const files = new Set(closures.get(n.name));
      const uses = nodes
        .filter(
          (m) =>
            entryOf.get(m.name) !== entryOf.get(n.name) &&
            files.has(entryOf.get(m.name)),
        )
        .map((m) => m.name)
        .sort(byCodeUnit);
      return [n.name, uses];
    }),
  );
}
