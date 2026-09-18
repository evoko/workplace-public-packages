#!/usr/bin/env node
import { resolve } from 'node:path';
import { Command, Option } from 'commander';
import { build } from './build.js';
import { loadConfig, type DsConfig } from './config.js';
import { Diagnostics } from './errors.js';
import { UnknownTargetError, generate } from './generate.js';
import { lint } from './lint.js';
import { printDiagnostics } from './report.js';
import {
  ScaffoldError,
  scaffoldComponent,
  type ComponentScaffoldOptions,
} from './scaffold/component.js';
import { scaffoldTokens } from './scaffold/tokens.js';
import { TOKEN_CATEGORIES, isTokenCategory } from './tokens/categories.js';
import { verify } from './verify/index.js';
import { COMPILER_VERSION } from './version.js';

const program = new Command()
  .name('bwp-ds')
  .description(
    'Design-system compiler: CSS source of truth to IR and target theme layers',
  )
  .version(COMPILER_VERSION)
  .addOption(
    new Option('--root <dir>', 'source root containing ds.config.json').default(
      process.cwd(),
      'current directory',
    ),
  )
  .option('--json', 'machine-readable output', false);

interface GlobalOpts {
  root: string;
  json: boolean;
}

function globals(): GlobalOpts {
  const opts = program.opts<GlobalOpts>();
  return { root: resolve(opts.root), json: opts.json };
}

function requireConfig(root: string, json: boolean): DsConfig | null {
  const diag = new Diagnostics();
  const config = loadConfig(root, diag);
  if (!config) {
    printDiagnostics(diag, json);
    process.exitCode = 1;
  }
  return config;
}

/** Reports a command-specific failure: `{"error": message}` in JSON mode, else plain text on stderr. */
function commandFailure(message: string, json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ error: message }));
  } else {
    console.error(message);
  }
  process.exitCode = 1;
}

/** Reports scaffold success: `{"wrote": [...paths]}` in JSON mode, else one "wrote <path>" line each. */
function scaffoldSuccess(paths: readonly string[], json: boolean): void {
  if (json) {
    console.log(JSON.stringify({ wrote: paths }));
    return;
  }
  for (const path of paths) {
    console.log(`wrote ${path}`);
  }
}

program
  .command('lint')
  .description('Check authoring rules without writing files')
  .action(() => {
    const { root, json } = globals();
    const diag = lint(root);
    printDiagnostics(diag, json);
    process.exitCode = diag.hasErrors() ? 1 : 0;
  });

program
  .command('build')
  .description('Compile CSS and manifests into design.ir.json')
  .action(() => {
    const { root, json } = globals();
    const result = build(root);
    const extra: Record<string, unknown> = {};
    if (result.outFile) {
      extra.wrote = result.outFile;
    }
    if (result.entryFile) {
      extra.entry = result.entryFile;
    }
    printDiagnostics(result.diagnostics, json, extra);
    process.exitCode = result.ir ? 0 : 1;
  });

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

function splitList(value: string): string[] {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

program
  .command('generate')
  .description(
    "Write each target's files from the IR into its outDir (default: every registered target)",
  )
  .option('--target <id>', 'target id (repeatable)', collect, [])
  .action((opts: { target: string[] }) => {
    const { root, json } = globals();
    let result;
    try {
      result = generate(root, opts.target.length > 0 ? opts.target : undefined);
    } catch (err) {
      if (err instanceof UnknownTargetError) {
        commandFailure(err.message, json);
        return;
      }
      throw err;
    }
    printDiagnostics(result.diagnostics, json, {
      wrote: result.written,
      removed: result.removed,
    });
    process.exitCode = result.diagnostics.hasErrors() ? 1 : 0;
  });

program
  .command('verify')
  .description(
    'Lint, then drift, round-trip, and coverage checks for every registered target; writes the coverage report',
  )
  .action(() => {
    const { root, json } = globals();
    const result = verify(root);
    printDiagnostics(result.diagnostics, json, {
      steps: result.steps,
      coverageFile: result.coverageFile ?? '',
    });
    process.exitCode = result.diagnostics.hasErrors() ? 1 : 0;
  });

const scaffold = program
  .command('scaffold')
  .description(
    'Write files that already satisfy the authoring rules; also regenerates src/index.css',
  );

scaffold
  .command('tokens <category>')
  .description(
    `Create src/tokens/<category>.css; categories: ${TOKEN_CATEGORIES.join(', ')}`,
  )
  .action((category: string) => {
    const { root, json } = globals();
    const config = requireConfig(root, json);
    if (!config) {
      return;
    }
    if (!isTokenCategory(category)) {
      commandFailure(
        `"${category}" is not a token category. Allowed: ${TOKEN_CATEGORIES.join(', ')}`,
        json,
      );
      return;
    }
    try {
      const { path, entryPath } = scaffoldTokens(root, category, config);
      scaffoldSuccess(entryPath ? [path, entryPath] : [path], json);
    } catch (err) {
      commandFailure(
        err instanceof ScaffoldError ? err.message : String(err),
        json,
      );
    }
  });

/** Parses repeated `--axis name=value1,value2` specs into an axes record, or null on the first problem. */
function parseAxisSpecs(
  specs: readonly string[],
  json: boolean,
): Record<string, string[]> | null {
  const axes: Record<string, string[]> = {};
  for (const spec of specs) {
    const eq = spec.indexOf('=');
    const axis = eq === -1 ? '' : spec.slice(0, eq).trim();
    const valuesText = eq === -1 ? '' : spec.slice(eq + 1);
    const values = splitList(valuesText);
    if (axis === '' || values.length === 0) {
      commandFailure(
        `--axis expects name=value1,value2 but got "${spec}"`,
        json,
      );
      return null;
    }
    if (Object.hasOwn(axes, axis)) {
      commandFailure(`--axis "${axis}" was given more than once`, json);
      return null;
    }
    axes[axis] = values;
  }
  return axes;
}

scaffold
  .command('component <name>')
  .description(
    'Create src/components/<name>/<name>.css and <name>.manifest.json',
  )
  .option(
    '--axis <spec>',
    'axis as name=value1,value2 (repeatable); first value is the default',
    collect,
    [],
  )
  .option('--state <list>', 'comma-separated states', '')
  .option('--slot <list>', 'comma-separated slot names (root is implicit)', '')
  .option('--root-element <element>', 'HTML element of the root slot', 'div')
  .action(
    (
      name: string,
      opts: {
        axis: string[];
        state: string;
        slot: string;
        rootElement: string;
      },
    ) => {
      const { root, json } = globals();
      const config = requireConfig(root, json);
      if (!config) {
        return;
      }
      const axes = parseAxisSpecs(opts.axis, json);
      if (!axes) {
        return;
      }
      const options: ComponentScaffoldOptions = {
        axes,
        states: splitList(opts.state),
        slots: splitList(opts.slot),
        rootElement: opts.rootElement,
      };
      try {
        const out = scaffoldComponent(root, name, options, config);
        const paths = out.entryPath
          ? [out.manifestPath, out.cssPath, out.entryPath]
          : [out.manifestPath, out.cssPath];
        scaffoldSuccess(paths, json);
      } catch (err) {
        commandFailure(
          err instanceof ScaffoldError ? err.message : String(err),
          json,
        );
      }
    },
  );

program.parseAsync(process.argv).catch((err: unknown) => {
  const json = program.opts<GlobalOpts>().json;
  const message = err instanceof Error ? err.message : String(err);
  if (json) {
    console.log(JSON.stringify({ error: message }));
  } else {
    console.error(message);
  }
  process.exitCode = 1;
});
