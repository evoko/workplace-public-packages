import {
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
  type Dirent,
} from 'node:fs';
import { join, relative, sep } from 'node:path';
import {
  MANIFEST_SUFFIX,
  identifier,
  parseManifest,
  type Manifest,
} from './components/manifest.js';
import { parseComponentCss } from './components/parse-component.js';
import { BASELINE_PROPERTIES } from './components/properties.js';
import { CONFIG_FILE, loadConfig } from './config.js';
import { Diagnostics } from './errors.js';
import { serializeIR, sourceHash, type SourceFile } from './ir/serialize.js';
import { IR_VERSION, type ComponentIR, type DesignIR } from './ir/types.js';
import { parseTokenFile } from './tokens/parse-tokens.js';
import { resolveTokens } from './tokens/resolve-tokens.js';

export const IR_FILE = 'design.ir.json';
export const TOKENS_DIR = 'src/tokens';
export const COMPONENTS_DIR = 'src/components';

export interface BuildResult {
  ir: DesignIR | null;
  diagnostics: Diagnostics;
  sources: SourceFile[];
}

function toPosix(p: string): string {
  return p.split(sep).join('/');
}

/** Lists a directory's entries, or [] when it does not exist or is not a directory. */
function listDir(dir: string): Dirent[] {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      return [];
    }
    throw err;
  }
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

/** Collects the token CSS filenames from src/tokens, flagging wrong-case extensions. */
function listTokenFiles(
  rootDir: string,
  tokensDir: string,
  diag: Diagnostics,
): string[] {
  const files: string[] = [];
  for (const entry of listDir(tokensDir)) {
    if (!entry.isFile()) {
      continue;
    }
    if (entry.name.endsWith('.css')) {
      files.push(entry.name);
      continue;
    }
    if (/\.css$/i.test(entry.name)) {
      diag.add(
        'DS-E017',
        `"${entry.name}" is not a token category file: the extension must be lowercase ".css"`,
        {
          file: toPosix(relative(rootDir, join(tokensDir, entry.name))),
          line: 1,
          column: 1,
        },
      );
    }
  }
  return files.sort();
}

/** Collects component directory names from src/components, reporting broken symlinks. */
function listComponentDirs(
  rootDir: string,
  componentsDir: string,
  diag: Diagnostics,
): string[] {
  const names: string[] = [];
  for (const entry of listDir(componentsDir)) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }
    let isDir = entry.isDirectory();
    if (!isDir && entry.isSymbolicLink()) {
      try {
        isDir = statSync(join(componentsDir, entry.name)).isDirectory();
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
        continue;
      }
    }
    if (isDir) {
      names.push(entry.name);
    }
  }
  return names.sort();
}

/** Parses everything under rootDir into an IR without writing anything. */
export function buildIR(rootDir: string): BuildResult {
  const diag = new Diagnostics();
  const sources: SourceFile[] = [];
  const config = loadConfig(rootDir, diag);
  if (!config) {
    return { ir: null, diagnostics: diag, sources };
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
    return { ir: null, diagnostics: diag, sources };
  }
  const ir: DesignIR = {
    irVersion: IR_VERSION,
    meta: {
      name: config.name,
      prefix: config.prefix,
      modes: config.modes,
      defaultMode: config.defaultMode,
      rootFontSize: config.rootFontSize,
      sourceHash: sourceHash(sources),
    },
    tokens,
    components,
  };
  return { ir, diagnostics: diag, sources };
}

export function writeIR(rootDir: string, ir: DesignIR): string {
  const out = join(rootDir, IR_FILE);
  writeFileSync(out, serializeIR(ir));
  return out;
}

/** buildIR plus writing design.ir.json when there are no errors. */
export function build(rootDir: string): BuildResult & { outFile?: string } {
  const result = buildIR(rootDir);
  if (result.ir) {
    return { ...result, outFile: writeIR(rootDir, result.ir) };
  }
  return result;
}
