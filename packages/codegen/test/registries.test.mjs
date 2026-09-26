/**
 * The lists every generated component is in (src/emit/registries.mjs), and the Playground builder
 * registries (src/emit/playground.mjs), written from the component list so adding a component
 * edits none of them by hand.
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  playgroundFileOf,
  renderPlaygroundRegistries,
} from '../src/emit/playground.mjs';
import { renderRegistries } from '../src/emit/registries.mjs';
import { playgroundData } from '../src/playground/controls.mjs';
import { library, NAMES, shelled } from '../src/stages/components.mjs';
import { packagesDir } from '../src/util/paths.mjs';

const files = (names, o) =>
  Object.fromEntries(renderRegistries(names, o).map((f) => [f.file, f.text]));

describe('renderRegistries', () => {
  const out = files(['Icon Button', 'Button', 'Calendar Day Cell']);

  it('lists each package’s shells, sorted, by the shells’ file names', () => {
    expect(out['components/src/components.generated.ts']).toContain(
      "export * from './Button.js';\nexport * from './CalendarDayCell.js';\nexport * from './IconButton.js';\n",
    );
    expect(out['solar_flutter/lib/src/components/components.dart']).toContain(
      "export 'solar_button.dart';\nexport 'solar_calendar_day_cell.dart';\nexport 'solar_icon_button.dart';\n",
    );
  });

  it('registers each component’s visual case and variant builder, by its name', () => {
    const web = out['components/test/visual/cases/registry.generated.ts'];
    expect(web).toContain(
      "import calendarDayCell from './calendar-day-cell.js';",
    );
    expect(web).toContain("  'Calendar Day Cell': calendarDayCell,");
    expect(web).toContain('  Button: button,');
    const dart = out['solar_flutter/test/visual/cases/cases.dart'];
    expect(dart).toContain("import 'calendar_day_cell.dart';");
    expect(dart).toContain("  'Calendar Day Cell': calendarDayCellCase,");
    expect(out['solar_flutter/variants/lib/src/registry.dart']).toContain(
      "  'Icon Button': buildIconButton,",
    );
    // The library exports everything in order, as the analyzer's directive ordering wants.
    const library =
      out['solar_flutter/variants/lib/solar_flutter_variants.dart'];
    const exports = library.split('\n').filter((l) => l.startsWith('export '));
    expect(exports).toEqual([...exports].sort());
    expect(exports).toContain("export 'src/registry.dart';");
  });

  it('matches what is committed for today’s components', () => {
    // The stage writes them on every solar:codegen; CI's rebuild check holds them to it.
    // Autocomplete's props take its value's type, as the stage finds in its shell. A chart a
    // library draws has no shells and no visual case.
    const generic = (n) => n === 'Autocomplete';
    for (const [file, text] of Object.entries(
      files(
        NAMES.filter((n) => !library(n)),
        { shelled, generic, drawnByLibrary: NAMES.filter((n) => library(n)) },
      ),
    )) {
      const path = join(packagesDir, file);
      expect(existsSync(path), file).toBe(true);
      expect(readFileSync(path, 'utf8'), file).toBe(text);
    }
  });
});

describe('renderPlaygroundRegistries', () => {
  const { web, dart } = renderPlaygroundRegistries();
  const webDir = join(packagesDir, 'components', 'stories', 'playground');
  const dartDir = join(
    packagesDir,
    'solar_flutter',
    'widgetbook',
    'lib',
    'playground',
  );
  // Every component with a story: every one but a chart a library draws.
  const withStory = NAMES.filter((n) => !library(n)).sort();
  const keysOf = (text, entry) =>
    text
      .split('\n')
      .map((l) => entry.exec(l))
      .filter(Boolean)
      .map((m) => m[1] ?? m[2]);

  it('lists exactly the components with a Playground, on both platforms', () => {
    const playground = Object.keys(playgroundData().components).sort();
    expect(playground).toEqual(withStory);
    const webKeys = keysOf(web, /^ {2}(?:'([^']+)'|(\w+)): \w+,$/);
    const dartKeys = keysOf(dart, /^ {2}'([^']+)': \w+Playground,$/);
    expect(webKeys).toEqual(playground);
    expect(dartKeys).toEqual(playground);
  });

  it('imports each builder from a file that exists, named after its builder', () => {
    for (const name of withStory) {
      const { web: w, dart: d } = playgroundFileOf(name);
      expect(existsSync(join(webDir, w)), w).toBe(true);
      expect(existsSync(join(dartDir, d)), d).toBe(true);
      expect(web).toContain(`from './${w.replace(/\.tsx$/, '.js')}';`);
      expect(dart).toContain(`import '${d}';`);
    }
    expect(playgroundFileOf('DatePicker')).toEqual({
      web: 'date-picker.tsx',
      dart: 'date_picker.dart',
    });
    expect(playgroundFileOf('PIN Input').web).toBe('pin-input.tsx');
    expect(web).toContain("  'Text Input': textInput,");
    expect(dart).toContain("  'Text Input': textInputPlayground,");
  });

  it('matches what is committed', () => {
    expect(readFileSync(join(webDir, 'registry.generated.ts'), 'utf8')).toBe(
      web,
    );
    expect(readFileSync(join(dartDir, 'registry.dart'), 'utf8')).toBe(dart);
  });
});
