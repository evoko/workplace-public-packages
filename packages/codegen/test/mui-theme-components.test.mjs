/**
 * The SOLAR MUI theme's components block (src/emit/mui-theme-components.mjs), from
 * spec/overlay/mui-theme.yaml: every stock MUI component it styles is a SOLAR component's recipe,
 * per MUI prop combination, and a decision naming what the IR does not have fails the build.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  loadMuiTheme,
  renderMuiThemeComponents,
} from '../src/emit/mui-theme-components.mjs';

const { built } = stage.build();
const specs = built.map((b) => b.spec);

describe('the MUI theme’s components', () => {
  const doc = loadMuiTheme(specs);
  const ts = renderMuiThemeComponents(specs, doc);

  it('styles each MUI prop combination with the recipe of the SOLAR axes it is', () => {
    // 3 variants × 2 colours × 3 sizes.
    expect(ts.match(/solarButtonStyle\(/g)).toHaveLength(18);
    expect(ts).toContain(
      'solarButtonStyle({"variant":"secondary","danger":true,"size":"sm"})',
    );
  });

  it('draws a stock component only, never a SOLAR shell on the same MUI base', () => {
    expect(ts).toContain(
      "const stock = (p: Props) => p['data-solar'] === undefined;",
    );
    expect(ts).toMatch(/props: \(p\) =>\s*stock\(p\) &&/);
  });

  it('moves a layer to where MUI’s own markup has it, and restates what MUI changes by state', () => {
    expect(ts).toContain('[["& .SolarIconButton-icon","& > svg"]]');
    expect(ts).toContain(
      '["boxShadow","borderWidth","borderStyle","borderColor"]',
    );
  });

  const refused = (yaml) => () => loadMuiTheme(specs, yaml);
  it('refuses a decision without a reason, or naming what the IR does not have', () => {
    expect(refused('MuiButton:\n  component: Button\n')).toThrow(
      /has no reason/,
    );
    expect(refused('MuiChip:\n  component: Nothing\n  reason: x\n')).toThrow(
      /Nothing, which is no generated component/,
    );
    expect(
      refused(
        'MuiButton:\n  component: Button\n  props:\n    size:\n      axis: size\n      values: { huge: xl }\n  reason: x\n',
      ),
    ).toThrow(/size xl, which its IR does not have/);
    expect(
      refused(
        "MuiIconButton:\n  component: Icon Button\n  slots: { nothing: '& > svg' }\n  reason: x\n",
      ),
    ).toThrow(/layer nothing, which its IR does not have/);
  });
});
