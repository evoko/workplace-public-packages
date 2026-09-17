import { readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import {
  MANIFEST_SUFFIX,
  identifier,
  parseManifest,
  type Manifest,
} from './components/manifest.js';
import { parseComponentCss } from './components/parse-component.js';
import { BASELINE_PROPERTIES } from './components/properties.js';
import { CONFIG_FILE, loadConfig, type DsConfig } from './config.js';
import { writeEntryCss } from './entry.js';
import { configFailed, Diagnostics } from './errors.js';
import { serializeIR, sourceHash, type SourceFile } from './ir/serialize.js';
import { IR_VERSION, type ComponentIR, type DesignIR } from './ir/types.js';
import { COMPONENTS_DIR, IR_FILE, TOKENS_DIR } from './paths.js';
import {
  listComponentDirs as listComponentDirNames,
  listDir,
  listTokenFiles as listTokenFileNames,
} from './sources.js';
import { parseTokenFile } from './tokens/parse-tokens.js';
import { resolveTokens } from './tokens/resolve-tokens.js';

export interface BuildResult {
  ir: DesignIR | null;
  /** The parsed config, or null when ds.config.json could not be loaded (DS-E001). */
  config: DsConfig | null;
  diagnostics: Diagnostics;
  sources: SourceFile[];
}

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

/** Flags every line containing the word TODO as DS-E050. */
export function scanTodo(file: string, text: string, diag: Diagnostics): void {
  text.split('\n').forEach((line, index) => {
    const at = line.search(/\bTODO\b/);
    if (at !== -1) {
      diag.add('DS-E050', `line contains TODO: ${line.trim()}`, {
        file,
        line: index + 1,
        column: at + 1,
      });
    }
  });
}

function checkBaseline(
  component: ComponentIR,
  manifest: Manifest,
  file: string,
  diag: Diagnostics,
): void {
  if (manifest.baseline === false) {
    return;
  }
  const required = manifest.baseline ?? BASELINE_PROPERTIES;
  const base = component.rules.find(
    (r) =>
      r.slot === 'root' &&
      Object.keys(r.axes).length === 0 &&
      r.states.length === 0,
  );
  const missing = required.filter((p) => !base || !(p in base.declarations));
  if (missing.length > 0) {
    diag.add(
      'DS-W001',
      `${component.name}: base root rule is missing ${missing.join(', ')}`,
      base?.source ?? { file, line: 1, column: 1 },
    );
  }
}

/**
 * The token CSS filenames from src/tokens (via the shared listing in
 * `./sources.js`, so this and the entry file agree on what a token source
 * is), flagging wrong-case extensions.
 */
function listTokenFiles(
  rootDir: string,
  tokensDir: string,
  diag: Diagnostics,
): string[] {
  const files: string[] = [];
  for (const name of listTokenFileNames(rootDir)) {
    if (name.endsWith('.css')) {
      files.push(name);
      continue;
    }
    if (/\.css$/i.test(name)) {
      diag.add(
        'DS-E017',
        `"${name}" is not a token category file: the extension must be lowercase ".css"`,
        {
          file: toPosix(relative(rootDir, join(tokensDir, name))),
          line: 1,
          column: 1,
        },
      );
    }
  }
  return files;
}

/**
 * The component directory names from src/components (via the shared listing
 * in `./sources.js`), reporting broken symlinks. The shared listing itself
 * silently excludes broken symlinks (it has no diagnostics to report them
 * with), so this walks the raw directory once more to flag them.
 */
function listComponentDirs(
  rootDir: string,
  componentsDir: string,
  diag: Diagnostics,
): string[] {
  for (const entry of listDir(componentsDir)) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    if (!entry.isSymbolicLink()) {
      continue;
    }
    try {
      statSync(join(componentsDir, entry.name));
    } catch {
      diag.add(
        'DS-E060',
        `${COMPONENTS_DIR}/${entry.name} is a broken symlink`,
        {
          file: toPosix(relative(rootDir, join(componentsDir, entry.name))),
          line: 1,
          column: 1,
        },
      );
    }
  }
  return listComponentDirNames(rootDir);
}

/** Parses everything under rootDir into an IR without writing anything. */
export function buildIR(rootDir: string): BuildResult {
  const diag = new Diagnostics();
  const sources: SourceFile[] = [];
  const config = loadConfig(rootDir, diag);
  if (!config) {
    return { ir: null, config: null, diagnostics: diag, sources };
  }
  sources.push({
    path: CONFIG_FILE,
    contents: readFileSync(join(rootDir, CONFIG_FILE), 'utf8'),
  });

  const tokensDir = join(rootDir, TOKENS_DIR);
  const tokenFiles = listTokenFiles(rootDir, tokensDir, diag);
  const raws = tokenFiles.flatMap((file) => {
    const abs = join(tokensDir, file);
    const rel = toPosix(relative(rootDir, abs));
    const css = readFileSync(abs, 'utf8');
    sources.push({ path: rel, contents: css });
    scanTodo(rel, css, diag);
    return parseTokenFile(rel, css, config, diag);
  });
  const tokens = resolveTokens(raws, config, diag);

  const components: Record<string, ComponentIR> = {};
  const componentsDir = join(rootDir, COMPONENTS_DIR);
  const names = listComponentDirs(rootDir, componentsDir, diag);

  if (tokenFiles.length === 0 && names.length === 0) {
    diag.add(
      'DS-W002',
      'No token files under src/tokens and no component directories under src/components were found',
      { file: CONFIG_FILE, line: 1, column: 1 },
    );
  }

  for (const name of names) {
    const dir = join(componentsDir, name);
    if (!identifier.safeParse(name).success) {
      diag.add('DS-E021', `component directory "${name}" must be kebab-case`, {
        file: toPosix(relative(rootDir, dir)),
        line: 1,
        column: 1,
      });
      continue;
    }
    const dirFiles = new Set(
      listDir(dir)
        .filter((e) => {
          if (e.isFile()) {
            return true;
          }
          if (e.isSymbolicLink()) {
            try {
              return statSync(join(dir, e.name)).isFile();
            } catch {
              return false;
            }
          }
          return false;
        })
        .map((e) => e.name),
    );
    const cssName = `${name}.css`;
    const manifestName = `${name}${MANIFEST_SUFFIX}`;
    const cssAbs = join(dir, cssName);
    const manifestAbs = join(dir, manifestName);
    const cssRel = toPosix(relative(rootDir, cssAbs));
    const manifestRel = toPosix(relative(rootDir, manifestAbs));
    if (!dirFiles.has(cssName) || !dirFiles.has(manifestName)) {
      const missing = !dirFiles.has(cssName) ? cssName : manifestName;
      diag.add('DS-E060', `${COMPONENTS_DIR}/${name} is missing ${missing}`, {
        file: toPosix(relative(rootDir, dir)),
        line: 1,
        column: 1,
      });
      continue;
    }
    const manifestText = readFileSync(manifestAbs, 'utf8');
    const css = readFileSync(cssAbs, 'utf8');
    sources.push({ path: manifestRel, contents: manifestText });
    sources.push({ path: cssRel, contents: css });
    scanTodo(manifestRel, manifestText, diag);
    scanTodo(cssRel, css, diag);

    let json: unknown;
    try {
      json = JSON.parse(manifestText);
    } catch (err) {
      diag.add('DS-E020', `not valid JSON: ${(err as Error).message}`, {
        file: manifestRel,
        line: 1,
        column: 1,
      });
      continue;
    }
    const manifest = parseManifest(json, manifestRel, name, diag);
    if (!manifest) {
      continue;
    }
    const component = parseComponentCss(
      cssRel,
      css,
      manifest,
      tokens,
      config,
      diag,
    );
    if (!component) {
      continue;
    }
    checkBaseline(component, manifest, cssRel, diag);
    components[name] = component;
  }

  if (diag.hasErrors()) {
    return { ir: null, config, diagnostics: diag, sources };
  }
  const ir: DesignIR = {
    irVersion: IR_VERSION,
    meta: {
      name: config.name,
      prefix: config.prefix,
      modes: config.modes,
      defaultMode: config.defaultMode,
      rootFontSize: config.rootFontSize,
      modeSelector: config.modeSelector,
      sourceHash: sourceHash(sources),
    },
    tokens,
    components,
  };
  return { ir, config, diagnostics: diag, sources };
}

export function writeIR(rootDir: string, ir: DesignIR): string {
  const out = join(rootDir, IR_FILE);
  writeFileSync(out, serializeIR(ir));
  return out;
}

/**
 * buildIR, plus always regenerating src/index.css (derived from layout
 * alone, so it is written even when the IR has errors) and writing
 * design.ir.json when there are no errors. Neither file is written when
 * ds.config.json itself could not be read (DS-E001).
 */
export function build(
  rootDir: string,
): BuildResult & { outFile?: string; entryFile?: string } {
  const result = buildIR(rootDir);
  if (configFailed(result.diagnostics)) {
    return result;
  }
  const entry = writeEntryCss(rootDir);
  if (!result.ir) {
    return { ...result, entryFile: entry.path };
  }
  return {
    ...result,
    outFile: writeIR(rootDir, result.ir),
    entryFile: entry.path,
  };
}
