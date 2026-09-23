/**
 * Scaffolds a component's hand-owned shell, once.
 *
 * The line between generated and owned is the line between look and behaviour. The recipe --
 * what a component looks like -- regenerates from Figma on every `solar:codegen` and is never
 * edited. The shell -- props, slots, loading, accessibility -- is written here one time from the
 * IR and then belongs to developers: this refuses to overwrite it unless told to, so a behaviour
 * someone added is never clobbered by a design change. That is why this is its own command and
 * never part of `solar:codegen` or CI.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { packagesDir, repoRoot } from '../util/paths.mjs';

export const componentsSrc = join(packagesDir, 'components', 'src');

/** The MUI prop each slot type becomes; a slot type with no entry here cannot be scaffolded. */
const MUI_SLOT_PROPS = { iconLeading: 'startIcon', iconTrailing: 'endIcon' };

/**
 * The shell templates, by component. A template is a function of the IR, so prop and slot names
 * come from Figma rather than being retyped, but its structure is written for the one MUI control
 * it wraps.
 */
export const TEMPLATES = {
  Button: (spec) => {
    const api = Object.keys(spec.api);
    const slots = spec.slots;
    for (const required of ['iconLeading', 'iconTrailing', 'label', 'counter'])
      if (!slots[required])
        throw new Error(`Button: the IR has no ${required} slot`);
    for (const [name] of Object.entries(MUI_SLOT_PROPS))
      if (slots[name].type !== 'icon')
        throw new Error(`Button: ${name} is not an icon slot`);

    return `/**
 * SOLAR Button.
 *
 * Scaffolded once by \`npm run solar:scaffold Button\` from spec/components/button.json, and owned
 * by developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * \`solarButtonStyle\` in \`@bwp-web/styles/mui\`, which regenerates from Figma on every
 * \`solar:codegen\`, so a design change reaches this component without anyone touching this file.
 * This file is behaviour: the props, the slots, loading, and accessibility.
 *
 * It wraps MUI's Button, which supplies focus handling, keyboard activation, the disabled and
 * loading states and their classes; the recipe restyles it. The app must load
 * \`@bwp-web/styles/tokens.css\`, since every recipe value is a \`var(--solar-*)\`.
 */

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { forwardRef, type ReactNode } from 'react';
import { solarButtonStyle, type SolarButtonProps } from '@bwp-web/styles/mui';

export interface ButtonProps
  extends SolarButtonProps,
    Omit<
      MuiButtonProps,
      keyof SolarButtonProps | 'color' | 'startIcon' | 'endIcon' | 'disableElevation'
    > {
  /** The icon before the label. It reinforces the action: a bin beside "Delete". */
  iconLeading?: ReactNode;
  /** The icon after the label. It indicates direction: an arrow beside "Continue". */
  iconTrailing?: ReactNode;
  /** A count shown after the label. */
  counter?: ReactNode;
}

// Through globalThis, because \`process\` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
${api.map((p) => `    ${p},`).join('\n')}
    iconLeading,
    iconTrailing,
    counter,
    children,
    sx,
    ...rest
  },
  ref,
) {
  // SOLAR: an icon-only button always needs an accessible name.
  if (DEV && !children && !rest['aria-label'] && !rest['aria-labelledby'])
    // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
    console.warn('SOLAR Button: an icon-only button needs an aria-label.');

  return (
    <MuiButton
      ref={ref}
      {...rest}
      disabled={disabled}
      loading={loading}
      startIcon={iconLeading}
      endIcon={iconTrailing}
      // SOLAR's states have their own colours; MUI's ripple and elevation would paint over them.
      disableRipple
      disableElevation
      sx={[
        solarButtonStyle({ ${api.join(', ')} }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      {counter != null && <span className="SolarButton-counter">{counter}</span>}
    </MuiButton>
  );
});
`;
  },
};

/** `Button` to `Button.tsx`. */
export const shellFileOf = (component) =>
  `${component.replace(/[^A-Za-z0-9]/g, '')}.tsx`;

/**
 * Writes the shell unless it exists. Returns what happened, so the CLI can say it and a test can
 * assert it. Also adds the export to the package entry if it is missing, and nothing else there.
 *
 * @returns {{status: 'written' | 'exists' | 'overwritten', file: string}}
 */
export function scaffold(spec, { force = false, dir = componentsSrc } = {}) {
  const template = TEMPLATES[spec.component];
  if (!template) throw new Error(`no shell template for ${spec.component}`);
  const file = join(dir, shellFileOf(spec.component));
  const existed = existsSync(file);
  const shown = relative(repoRoot, file);
  if (existed && !force) return { status: 'exists', file: shown };
  writeFileSync(file, template(spec));

  const index = join(dir, 'index.ts');
  const line = `export * from './${shellFileOf(spec.component).replace(/\.tsx$/, '.js')}';`;
  const current = existsSync(index) ? readFileSync(index, 'utf8') : '';
  if (!current.includes(line)) {
    // An empty package's entry is `export {};`, which has nothing left to do once it exports.
    const kept = current.replace(/^export \{\};\s*$/m, '').trimEnd();
    writeFileSync(index, `${kept ? `${kept}\n` : ''}${line}\n`);
  }
  return { status: existed ? 'overwritten' : 'written', file: shown };
}
