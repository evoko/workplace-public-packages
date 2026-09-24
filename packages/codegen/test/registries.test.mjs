/**
 * The lists every generated component is in (src/emit/registries.mjs), written from the component
 * list so adding a component edits none of them by hand.
 */

import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderRegistries } from '../src/emit/registries.mjs';
import { COMPONENTS } from '../src/stages/components.mjs';
import { packagesDir } from '../src/util/paths.mjs';

const files = (names) =>
  Object.fromEntries(renderRegistries(names).map((f) => [f.file, f.text]));

describe('renderRegistries', () => {
  const out = files(['Icon Button', 'Button', 'Calendar Day Cell']);

  it('lists each package’s shells, sorted, by the scaffolder’s file names', () => {
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
    const built = ['Button', 'Button Group', 'Icon Button', 'Spinner'];
    expect([...COMPONENTS].sort()).toEqual(built);
    for (const [file, text] of Object.entries(files(built))) {
      const path = join(packagesDir, file);
      expect(existsSync(path), file).toBe(true);
      expect(readFileSync(path, 'utf8'), file).toBe(text);
    }
  });
});
