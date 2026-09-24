/**
 * SOLAR Avatar, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * Its colour is the caller's, any colour (design team, 2026-09-24): the overlay's `caller` rules
 * make it a prop, the background it is, and the initials' ink derived from it by the shells' ink
 * rule (`internal/ink.ts`, `solar_ink.dart`, owner decision 2026-09-24).
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { treeOf } from '../shells/drawn.mjs';

const requireApi = (spec) => {
  for (const prop of ['size', 'type'])
    if (!spec.api[prop]) throw new Error(`Avatar: the IR has no ${prop}`);
  if (spec.api.color?.type !== 'color')
    throw new Error('Avatar: the IR has no colour of the caller’s');
  if (spec.layers.initials?.type !== 'TEXT')
    throw new Error('Avatar: the IR has no initials text');
};

export default {
  name: 'Avatar',
  mui: {
    // MUI renders its children in the root; the shell wraps the initials in a span of their own,
    // so where a type hides them they are not there.
    slots: { root: '&', initials: '& .SolarAvatar-initials' },
    // MUI's Avatar is content-box, 40px, 1.25rem and grey by default; SOLAR's draws its border
    // inside the box it sizes, and the recipe gives the rest.
    resets: { boxSizing: 'border-box' },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireApi(spec);
      const api = Object.keys(spec.api).filter((p) => p !== 'color');
      return `/**
 * SOLAR Avatar.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarAvatarStyle\` in \`@bwp-web/styles/mui\`: each size, the initials' text style,
 * the border, and a logo's rounded square.
 *
 * It wraps MUI's Avatar, which draws the initials, or the picture (\`src\`) with the initials as its
 * fallback. Its \`color\` is the caller's, any colour: seed it from a stable hash of the person's ID,
 * never at random. The initials take that colour's hue, at a lightness that reads at WCAG AA
 * (\`internal/ink.ts\`), unless \`textColor\` gives theirs; with no colour it is SOLAR's neutral
 * avatar. It is named by \`name\`, always. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiAvatar, { type AvatarProps as MuiAvatarProps } from '@mui/material/Avatar';
import { forwardRef, type ReactNode } from 'react';
import {
  solarAvatarCompose,
  solarAvatarStyle,
  type SolarAvatarProps,
} from '@bwp-web/styles/mui';
import { inkOn } from './internal/ink.js';

export interface AvatarProps
  extends SolarAvatarProps,
    // MUI types it Ref<unknown>; the component's own ref, a <div>, comes from forwardRef.
    Omit<MuiAvatarProps, keyof SolarAvatarProps | 'variant' | 'children' | 'ref'> {
  /** Who or what it is, the accessible name: a person's full name, a company's. */
  name: string;
  /** The initials; by default, from \`name\`: its first and last words' first letters. */
  children?: ReactNode;
  /**
   * The initials' colour, where the ink rule's is not wanted, or \`color\` is one it cannot read (a
   * \`var()\`).
   */
  textColor?: string;
}

/** The initials of a name: its first and last words' first letters, capitals, without accents. */
export function initialsOf(name: string): string {
  const words = name
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .trim()
    .split(/\\s+/)
    .filter(Boolean);
  const first = words[0]?.[0] ?? '';
  const last = words.length > 1 ? words[words.length - 1][0] : (words[0]?.[1] ?? '');
  return (first + last).toUpperCase();
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(function Avatar(
  { ${api.join(', ')}, color, name, children, textColor, src, sx, ...rest },
  ref,
) {
  const parts = solarAvatarCompose({ ${api.join(', ')} });
  const picture = parts.root?.image === true;
  const ink = textColor ?? (color ? inkOn(color) : null);
  return (
    <MuiAvatar
      ref={ref}
      alt={name}
      src={picture ? src : undefined}
      // Initials are text a screen reader would spell out; the avatar is named instead.
      role={picture ? undefined : 'img'}
      aria-label={picture ? undefined : name}
      {...rest}
      slotProps={{
        ...rest.slotProps,
        // A photo fills the circle; a logo is centred, not cropped.
        img: { style: { objectFit: type === 'logo' ? 'contain' : 'cover' } },
      }}
      sx={[
        solarAvatarStyle({ ${api.join(', ')} }),
        color ? { backgroundColor: color } : null,
        ink ? { '& .SolarAvatar-initials': { color: ink } } : null,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {parts.initials?.present === false ? undefined : (
        <span className="SolarAvatar-initials">{children ?? initialsOf(name)}</span>
      )}
    </MuiAvatar>
  );
});
`;
    },
    flutter: (spec) => {
      requireApi(spec);
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([p, kids]) =>
            `    '${p}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      return `/// SOLAR Avatar.
///
/// Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
/// solar:codegen\`: change the template there, never this file. What it looks like is not here. That
/// is the recipe, [SolarAvatarRecipe]: each size, the initials' text style, the border, and a
/// logo's rounded square, read cell by cell.
///
/// Bespoke: CircleAvatar cannot draw a logo's rounded square, so it is drawn with [SolarLayers],
/// the picture ([image]) inside its border. Its [color] is the caller's, any colour: seed it from a
/// stable hash of the person's ID, never at random. The initials take that colour's hue, at a
/// lightness that reads at WCAG AA ([solarInkOn]), unless [textColor] gives theirs; with no colour
/// it is SOLAR's neutral avatar. It is named by [name], always.
library;

import 'package:flutter/material.dart';

import '../generated/components/avatar.dart';
import '../solar_ink.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

/// The initials of a name: its first and last words' first letters, in capitals.
String solarInitialsOf(String name) {
  final words = name.trim().split(RegExp(r'\\s+')).where((w) => w.isNotEmpty).toList();
  if (words.isEmpty) return '';
  final first = words.first.characters.first;
  final last = words.length > 1
      ? words.last.characters.first
      : words.first.characters.skip(1).take(1).string;
  return (first + last).toUpperCase();
}

class SolarAvatar extends StatelessWidget {
  const SolarAvatar({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('Avatar', prop, def)},`).join('\n')}
    required this.name,
    this.initials,
    this.textColor,
    this.image,
  });

${api.map(([prop, def]) => dartField('Avatar', prop, def)).join('\n')}

  /// Who or what it is, the accessible name: a person's full name, a company's.
  final String name;

  /// The initials; by default, from [name]: its first and last words' first letters.
  final String? initials;

  /// The initials' colour, where the ink rule's is not wanted.
  final Color? textColor;

  /// The photo or the logo, for those types.
  final ImageProvider? image;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarAvatarProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const states = <WidgetState>{};
    final fill = color;
    final ink = textColor ?? (fill == null ? null : solarInkOn(fill));
    final picture = SolarAvatarRecipe.lookup('root.image', p, states) == 'b:true';
    final mark = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarAvatarRecipe.lookup(c, p, states),
        dimension: (c) => SolarAvatarRecipe.dimension(c, p, states),
        color: (c) => switch (c) {
          'root.background' when fill != null => fill,
          'initials.color' when ink != null => ink,
          _ => SolarAvatarRecipe.color(t, c, p, states),
        },
        shadow: (c) => SolarAvatarRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarAvatarRecipe.textStyle(t, c, p, states),
        present: (l) => SolarAvatarRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: 'avatar',
      text: {'initials': initials ?? solarInitialsOf(name)},
      images: {
        if (picture && image != null)
          // A photo fills the circle; a logo is centred, not cropped.
          'root': DecorationImage(
            image: image!,
            fit: type == SolarAvatarType.logo ? BoxFit.contain : BoxFit.cover,
          ),
      },
    ).layer('root');
    return Semantics(
      label: name,
      image: true,
      child: ExcludeSemantics(child: mark),
    );
  }
}
`;
    },
  },
};
