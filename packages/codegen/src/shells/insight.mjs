/**
 * What SOLAR's insight parts share (Insight Card, Insight Card Small): the StatusIndicator of
 * their severity, in its tile, named by the severity's word so the severity is read, not only
 * seen. Parts of a card's shells (`shells/card.mjs`).
 */

import { pascal } from '../util/naming.mjs';

export const insightIndicator = {
  props: [
    {
      name: 'severityLabel',
      kind: 'node',
      react: 'string',
      dart: 'String',
      doc: 'The severity’s name, which the StatusIndicator announces; its word by default.',
    },
  ],
  /** The shells' parts that draw the StatusIndicator of `name`'s severity, at `layer`. */
  parts: (name, layer = 'statusIndicator') => {
    const R = `Solar${pascal(name)}Recipe`;
    return {
      imports:
        "import { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator.js';",
      prelude: `const dot = composed.${layer};
// The severity is read as well as seen: its word, where the caller names it no other way.
const named = severityLabel ?? severity.charAt(0).toUpperCase() + severity.slice(1);`,
      render: `// The mark is a StatusIndicator, in the type the recipe names, in its layer's element, named by
// the severity's word.
${layer}: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <StatusIndicator
      type={dot['variant.type'] as StatusIndicatorProps['type']}
      size={dot['variant.size'] as StatusIndicatorProps['size']}
      label={named}
    />
  </span>
),`,
      importsDart: `import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';`,
      composed: `// The mark is a StatusIndicator, in the type the recipe names, named by the severity's word.
'${layer}': SolarStatusIndicator(
  type: SolarStatusIndicatorType.values.byName(
    ${R}.lookup('${layer}.variant.type', p, states)!.substring(2),
  ),
  size: SolarStatusIndicatorSize.values.byName(
    ${R}.lookup('${layer}.variant.size', p, states)!.substring(2),
  ),
  label: severityLabel ?? '\${severity.name[0].toUpperCase()}\${severity.name.substring(1)}',
),`,
    };
  },
};
