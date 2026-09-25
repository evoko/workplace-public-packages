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
import { treeConsts, wrapDoc } from './drawn.mjs';

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
 * @param {string} [o.sizedBy] the context its rows read their size from, where it is another
 *   menu's (TimePicker Dropdown's Dropdown Items read Dropdown Menu's), given in its place
 * @param {string} [o.rowsFrom] the rows, a JSX expression the shell builds (TimePicker
 *   Dropdown's times), in place of the caller's children
 * @param {string} [o.props] more props, TypeScript interface members with their doc comments
 * @param {string[]} [o.own] more of the props taken apart (`value`, `step = 30`)
 * @param {string} [o.prelude] statements before the surface is drawn
 * @param {string} [o.imports] more import lines
 * @param {string} [o.react] more of React's exports it imports (`useRef`)
 * @param {string} [o.role] the list's role, where it is not a menu (`listbox`)
 * @param {string} [o.listRef] the ref the list is given, a name the prelude declares
 */
export function menuReact(spec, o) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.keys(spec.api);
  const args = `{ ${api.join(', ')} }`;
  const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: ${o.look}.`;
  const surface = `<Float
          anchorEl={anchorEl}
          anchorPosition={anchorPosition}
          open={open}
          onClose={onClose}
          keepFocus={keepFocus}
          popperProps={popperProps}
        >
          <Box
            ref={ref}
            {...rest}
            sx={[solar${P}Style(${args}), ...(Array.isArray(sx) ? sx : [sx])]}
          >
            {drawChildren('root', {
              prefix: 'Solar${P}',
              tree: TREE, slots: SLOTS,
              parts,
              content: { content: ${o.rowsFrom ?? 'children'} },
              // The content is the list the keyboard moves along; a floating one focuses its
              // first row as it opens.
              render: {
                content: ({ className, style, children: rows }) => (
                  <MenuList${
                    o.listRef
                      ? `
                    ref={${o.listRef}}`
                      : ''
                  }
                    className={className}
                    style={style}${
                      o.role
                        ? `
                    role="${o.role}"`
                        : ''
                    }
                    disablePadding
                    autoFocusItem={floating && open && !keepFocus}
                    onKeyDown={onKeyDown}
                    {...listProps}
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
import MenuList, { type MenuListProps } from '@mui/material/MenuList';
import {
${o.sized ? '  createContext,\n' : ''}  forwardRef,
${o.sized ? '  useContext,\n' : ''}${(o.react ?? []).map((r) => `  ${r},\n`).join('')}  type KeyboardEvent,${o.rowsFrom ? '' : '\n  type ReactNode,'}
} from 'react';
import {
  solar${P}Compose,
  solar${P}Style,
  type Solar${P}Props,
} from '@bwp-web/styles/mui';
${o.imports ? `${o.imports.trim()}\n` : ''}import { Float, floats, type Floating } from './internal/float.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}
${
  o.sized
    ? `
/** The menu's size, which its rows take; a picker that holds its own panel of rows gives it too. */
export const ${P}SizeContext = createContext<Solar${P}Props['size'] | undefined>(undefined);

/** The size of the ${P} around a row, which the row takes; undefined outside one. */
export const use${P}Size = () => useContext(${P}SizeContext);
`
    : ''
}
export interface ${P}Props
  extends Solar${P}Props,
    Floating,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof Solar${P}Props | keyof Floating | 'children' | ${o.rowsFrom ? "'onChange' | " : ''}'ref'> {${
      o.rowsFrom
        ? ''
        : `
  /** ${o.rows} */
  children: ReactNode;`
    }${
      o.props
        ? `\n${o.props
            .trim()
            .split('\n')
            .map((l) => `  ${l}`.trimEnd())
            .join('\n')}`
        : ''
    }
  /** More of the list's props: a combobox's listbox (\`role\`, \`id\`, its handlers). */
  listProps?: MenuListProps;
}

export const ${P} = forwardRef<HTMLDivElement, ${P}Props>(function ${P}(
  { ${[...api, ...(o.rowsFrom ? [] : ['children']), ...(o.own ?? []), 'anchorEl', 'anchorPosition', 'open', 'onClose', 'keepFocus', 'popperProps', 'listProps', 'sx', '...rest'].join(', ')} },
  ref,
) {
  const floating = floats({ anchorEl, anchorPosition });
  const parts = solar${P}Compose(${args});
${
  o.prelude
    ? `${o.prelude
        .trim()
        .split('\n')
        .map((l) => `  ${l}`.trimEnd())
        .join('\n')}\n`
    : ''
}  // Tab leaves a floating menu, as MUI's Menu does: it closes, and the focus moves on.
  const onKeyDown = (event: KeyboardEvent) => {
    if (floating && !keepFocus && event.key === 'Tab') {
      event.preventDefault();
      onClose?.();
    }
  };
  return (
    ${
      o.sized
        ? `<${P}SizeContext.Provider value={size ?? 'md'}>
        ${surface}
      </${P}SizeContext.Provider>`
        : o.sizedBy
          ? `<${o.sizedBy}.Provider value={size ?? 'md'}>
        ${surface}
      </${o.sizedBy}.Provider>`
          : surface
    }
  );
});
`;
}
