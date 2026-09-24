/**
 * SOLAR Breadcrumb Item, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): one segment of a Breadcrumbs trail, a link to an
 * ancestor, or the current page, which is no link. A focused link draws SOLAR's focus ring, which
 * Figma draws none of (as Nav Item's, owner decision 2026-09-24).
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarBreadcrumbItem';

const requireLayers = (spec) => {
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Breadcrumb Item: the IR has no label text');
  if (spec.api.type?.values?.join() !== 'link,current')
    throw new Error('Breadcrumb Item: its type is not link or current');
};

export default {
  name: 'Breadcrumb Item',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A link or a button, none of the browser's own look: no underline, no button face; a 44 × 44
    // target around one, which takes no room.
    resets: drawnResets('Breadcrumb Item', {
      display: 'flex',
      textDecoration: 'none',
      '&:is(button)': {
        appearance: 'none',
        font: 'inherit',
        margin: '0',
        padding: '0',
        border: '0',
        background: 'none',
        cursor: 'pointer',
      },
      outline: 'none',
      ...targetArea('&:is(a, button)'),
    }),
    // Hovered and focused as a link or a button is; disabled by the shell's class.
    states: {
      default: null,
      hover: '&:is(a, button):hover',
      focus: '&:is(a, button):focus-visible',
      disabled: `&.${P}-disabled`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'its words’ text style and ink by state',
        about: `Bespoke: one segment of a Breadcrumbs trail, drawn from Figma's layer tree
(\`internal/layers.tsx\`). A link to an ancestor page where it has an \`href\` (a button, given
\`onClick\` alone); the \`current\` page, the trail's last, as text announced as the current page, no
link, as its description says; a \`disabled\` one as text. A focused link draws SOLAR's focus ring.
Its words are its children. Use it inside Breadcrumbs.`,
        element: '{as}',
        refType: 'HTMLElement',
        react: ['type MouseEventHandler', 'type ReactNode'],
        props: `/** The page's name. */
children: ReactNode;
/** Where it goes: it is a link. */
href?: string;
/** Called when it is chosen, where it has no \`href\`: it is a button. */
onClick?: MouseEventHandler<HTMLElement>;`,
        own: ['children', 'href', 'onClick', 'className'],
        omit: ['onClick'],
        prelude: `// A link, a button, or the words alone: the current page, and a disabled link, are no control.
const current = type === 'current';
const control = !current && !disabled;
const as = !control ? 'span' : href !== undefined ? 'a' : 'button';`,
        attrs: `href={as === 'a' ? href : undefined}
type={as === 'button' ? 'button' : undefined}
onClick={control ? onClick : undefined}
aria-current={current ? 'page' : undefined}
aria-disabled={disabled || undefined}
className={[disabled ? '${P}-disabled' : null, className].filter(Boolean).join(' ') || undefined}`,
        text: '{ label: children }',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'its words’ text style and ink by state, read cell by cell',
        about: `Bespoke: one segment of a SolarBreadcrumbs trail, drawn from Figma's layer tree with [SolarLayers]. A link to an ancestor page, pressable and announced as a link, where it has [onPressed]; the current page, the trail's last, as text, no link, as its description says; a [disabled] one as text. A focused link draws SOLAR's focus ring. Use it inside a SolarBreadcrumbs.`,
        params: `required this.label,`,
        fields: `/// The page's name.
final String label;`,
        pressable: 'type == SolarBreadcrumbItemType.link && !disabled',
        link: true,
        text: "{'label': label}",
      });
    },
  },
};
