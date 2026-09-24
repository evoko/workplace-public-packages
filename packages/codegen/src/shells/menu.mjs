/**
 * What the menus' shells share (Dropdown Menu, Context Menu): the tallest a menu grows before its
 * rows scroll, and the resets of the list that holds them.
 *
 * ⚠️ Governance gap: `MENU_MAX_HEIGHT` is the one raw menu height in the web recipes, here, as
 * Dropdown Menu's description asks ("caps height at ~300px with internal scroll") and SOLAR
 * publishes no variable for it (owner decision 2026-09-24: cap at 300, flagged). `solar_flutter`'s
 * `solarMenuMaxHeight` is its Flutter twin. The design review asks for a variable.
 */

import { pascal } from '../util/naming.mjs';
import { treeOf, wrapDoc } from './drawn.mjs';

export const MENU_MAX_HEIGHT = '300px';

/**
 * A menu's resets beyond the drawn ones: its list (MUI's MenuList, the content layer) has none of
 * its own padding, focus outline or list style, and scrolls past MENU_MAX_HEIGHT, the surface
 * keeping its edge around it. A row spans the menu.
 */
export const menuResets = (name) => {
  const P = `Solar${pascal(name)}`;
  return {
    maxHeight: MENU_MAX_HEIGHT,
    [`& .${P}-content`]: {
      margin: '0',
      padding: '0',
      listStyle: 'none',
      outline: 'none',
      overflowY: 'auto',
      minHeight: '0',
    },
    [`& .${P}-content > *`]: { width: '100%' },
  };
};

/**
 * A menu's React shell: its surface drawn from Figma's layer tree, its content layer MUI's
 * MenuList holding the caller's rows, floating where it is anchored (`internal/float.tsx`).
 *
 * @param {object} spec the IR
 * @param {object} o
 * @param {string} o.look what the recipe holds, for the doc comment
 * @param {string} o.about the rest of the doc comment
 * @param {string} o.rows what its children are, for their doc comment
 * @param {boolean} [o.sized] whether its rows take its size, through a context it provides
 */
export function menuReact(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.keys(spec.api);
  const args = `{ ${api.join(', ')} }`;
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
  const surface = `<Float anchorEl={anchorEl} anchorPosition={anchorPosition} open={open} onClose={onClose}>
          <Box
            ref={ref}
            {...rest}
            sx={[solar${P}Style(${args}), ...(Array.isArray(sx) ? sx : [sx])]}
          >
            {drawChildren('root', {
              prefix: 'Solar${P}',
              tree: TREE,
              parts,
              content: { content: children },
              // The content is the list the keyboard moves along; a floating one focuses its
              // first row as it opens.
              render: {
                content: ({ className, style, children: rows }) => (
                  <MenuList
                    className={className}
                    style={style}
                    disablePadding
                    autoFocusItem={floating && open}
                    onKeyDown={onKeyDown}
                  >
                    {rows}
                  </MenuList>
                ),
              },
            })}
          </Box>
        </Float>`;
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${o.about.trim()} The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
import MenuList from '@mui/material/MenuList';
import {
${o.sized ? '  createContext,\n' : ''}  forwardRef,
${o.sized ? '  useContext,\n' : ''}  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  solar${P}Compose,
  solar${P}Style,
  type Solar${P}Props,
} from '@bwp-web/styles/mui';
import { Float, floats, type Floating } from './internal/float.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};
${
  o.sized
    ? `
const ${P}Context = createContext<Solar${P}Props['size'] | undefined>(undefined);

/** The size of the ${P} around a row, which the row takes; undefined outside one. */
export const use${P}Size = () => useContext(${P}Context);
`
    : ''
}
export interface ${P}Props
  extends Solar${P}Props,
    Floating,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof Solar${P}Props | keyof Floating | 'children' | 'ref'> {
  /** ${o.rows} */
  children: ReactNode;
}

export const ${P} = forwardRef<HTMLDivElement, ${P}Props>(function ${P}(
  { ${[...api, 'children', 'anchorEl', 'anchorPosition', 'open', 'onClose', 'sx', '...rest'].join(', ')} },
  ref,
) {
  const floating = floats({ anchorEl, anchorPosition });
  const parts = solar${P}Compose(${args});
  // Tab leaves a floating menu, as MUI's Menu does: it closes, and the focus moves on.
  const onKeyDown = (event: KeyboardEvent) => {
    if (floating && event.key === 'Tab') {
      event.preventDefault();
      onClose?.();
    }
  };
  return (
    ${
      o.sized
        ? `<${P}Context.Provider value={size ?? 'md'}>
        ${surface}
      </${P}Context.Provider>`
        : surface
    }
  );
});
`;
}
