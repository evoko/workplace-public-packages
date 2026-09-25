/**
 * SOLAR Image Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A tile of the card family (`src/shells/card.mjs`'s resets and states): an image, its title and
 * details, and a More menu; selectable by a SOLAR Checkbox, shown where it is selected and while
 * the pointer or the keyboard is on the tile, as Figma shows it hovered. Unfilled, the tile that
 * adds one. Pressable where it is given something to do.
 */

import { cardResets, cardStates } from '../shells/card.mjs';
import {
  dartIcon,
  iconsOf,
  reactIcon,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';

const P = 'SolarImageCard';

const requireLayers = (spec) => {
  for (const slot of ['title', 'subtitle', 'label'])
    if (!spec.slots[slot])
      throw new Error(`Image Card: the IR has no ${slot} slot`);
  for (const layer of ['image', 'checkbox', 'icon'])
    if (!spec.layers[layer])
      throw new Error(`Image Card: the IR has no ${layer} layer`);
  for (const prop of ['filled', 'selected'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Image Card: the IR has no ${prop} prop`);
};

const ABOUT = `An image in a grid of them: its \`image\`, its \`title\` and \`subtitle\`, and a More menu
of \`moreItems\`; or, not \`filled\`, the tile that adds one, a Plus over its \`label\`. Given
\`onSelectedChange\`, it is selectable by a SOLAR Checkbox (named by \`selectLabel\`), shown where it
is \`selected\` and while the pointer or the keyboard is on the tile. Given \`onClick\` or \`href\`, it
is pressable: its title (or label) is the button or link, and its hit area the whole tile, the
Checkbox and the More menu reachable above it; it is focused only then.`;

export default {
  name: 'Image Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs). The
    // image fills its frame, under the Checkbox, cut to the tile's corners.
    slots: 'drawn',
    resets: cardResets('Image Card', {
      wrap: ['title', 'subtitle', 'label'],
      more: 'iconControl',
      extra: {
        overflow: 'hidden',
        [`& .${P}--image`]: { position: 'relative' },
        [`& .${P}--image > img`]: {
          position: 'absolute',
          inset: '0',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        },
        [`& .${P}--checkbox`]: { position: 'relative' },
        [`& .${P}--iconControl`]: {
          margin: '0',
          background: 'none',
          border: '0',
        },
      },
    }),
    states: cardStates('Image Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      title: { react: 'title', flutter: 'title' },
      subtitle: { react: 'subtitle', flutter: 'subtitle' },
      label: { react: 'label', flutter: 'label' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solarImageCardStyle\` and \`solarImageCardCompose\` in \`@bwp-web/styles/mui\`: the tile's fill, edge, shadow and focus ring, the image's frame, its words' ink, the Checkbox it shows, and the unfilled tile's Plus.`;
      return `/**
 * SOLAR Image Card.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${ABOUT} Drawn from Figma's layer tree (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { ${icons.map((i) => i.react).join(', ')} } from '@bwp-web/assets';
import {
  forwardRef,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  solarImageCardCompose,
  solarImageCardStyle,
  type SolarImageCardProps,
} from '@bwp-web/styles/mui';
import type { CardMoreItem } from './Card.js';
import { Checkbox } from './Checkbox.js';
import { DropdownItem } from './DropdownItem.js';
import { DropdownMenu } from './DropdownMenu.js';
import { drawChildren, type DrawnLayer } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface ImageCardProps
  extends SolarImageCardProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<BoxProps, keyof SolarImageCardProps | 'title' | 'onClick' | 'ref'> {
  /** The image's name; its action's name where it is pressable. */
  title?: ReactNode;
  /** Its details (“Last modified 2h ago”). */
  subtitle?: ReactNode;
  /** What the unfilled tile adds (“Create new”); its action's name where it is pressable. */
  label?: ReactNode;
  /** The picture's address, filling the image's frame. */
  image?: string;
  /** Called with whether it is to be selected, by its Checkbox, which it then shows. */
  onSelectedChange?: (selected: boolean) => void;
  /** The Checkbox's accessible name. */
  selectLabel?: string;
  /** The More menu's actions: a button opens them. */
  moreItems?: CardMoreItem[];
  /** The More button's accessible name. */
  moreLabel?: string;
  /** Makes it pressable: its title is a button that calls it. */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  /** Makes it pressable: its title is a link here. */
  href?: string;
}

export const ImageCard = forwardRef<HTMLDivElement, ImageCardProps>(function ImageCard(
  {
    filled = true,
    selected = false,
    title,
    subtitle,
    label,
    image,
    onSelectedChange,
    selectLabel = 'Select',
    moreItems,
    moreLabel = 'More actions',
    onClick,
    href,
    className,
    sx,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    ...rest
  },
  ref,
) {
  const look = { filled, selected };
  const composed = solarImageCardCompose(look);
  const pressable = onClick != null || href != null;
  const menu = moreItems != null && moreItems.length > 0;
  // The Checkbox shows where the tile is selected, and while the pointer or the keyboard is on
  // it, as Figma draws it hovered.
  const [pointer, setPointer] = useState(false);
  const [within, setWithin] = useState(false);
  const selectable = filled && onSelectedChange != null;
  const parts = {
    ...composed,
    checkbox: { ...composed.checkbox, present: selectable && (selected || pointer || within) },
    icon: { ...composed.icon, present: composed.icon?.present !== false && menu },
    title: { ...composed.title, present: composed.title?.present !== false && title != null },
    subtitle: {
      ...composed.subtitle,
      present: composed.subtitle?.present !== false && subtitle != null,
    },
    label: { ...composed.label, present: composed.label?.present !== false && label != null },
  };
  const [open, setOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  // Pressable, its title (or the unfilled tile's label) is its action, stretched over the tile.
  const press = (words: ReactNode) =>
    pressable ? (
      <ButtonBase
        className="${P}-press"
        disableRipple
        {...(href != null ? { href } : {})}
        onClick={onClick}
      >
        {words}
      </ButtonBase>
    ) : (
      words
    );
  return (
    <>
      <Box
        ref={ref}
        className={[pressable ? '${P}-pressable' : null, className].filter(Boolean).join(' ') || undefined}
        {...rest}
        onMouseEnter={(e: MouseEvent<HTMLDivElement>) => {
          setPointer(true);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e: MouseEvent<HTMLDivElement>) => {
          setPointer(false);
          onMouseLeave?.(e);
        }}
        onFocus={(e: FocusEvent<HTMLDivElement>) => {
          setWithin(true);
          onFocus?.(e);
        }}
        onBlur={(e: FocusEvent<HTMLDivElement>) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setWithin(false);
          onBlur?.(e);
        }}
        sx={[solarImageCardStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE, slots: SLOTS,
          parts,
          text: { title: press(title), subtitle, label: press(label) },
          icons: { ${icons.map((i) => `${i.layer}: ${reactIcon(i, spec)}`).join(', ')} },
          render: {
            // The picture fills the image's frame, under the Checkbox.
            image: ({ className: c, style, children }: DrawnLayer) => (
              <span className={c} style={style}>
                {image != null ? <img src={image} alt="" /> : null}
                {children}
              </span>
            ),
            // The selection, a SOLAR Checkbox in its layer's element, named by selectLabel.
            checkbox: ({ className: c, style }: DrawnLayer) => (
              <span className={c} style={style}>
                <Checkbox
                  checked={selected}
                  onChange={(e) => onSelectedChange?.(e.target.checked)}
                  slotProps={{ input: { 'aria-label': selectLabel } }}
                />
              </span>
            ),
            // The More mark, Figma's drawing, is its menu's button.
            icon: ({ className: c, style, children }: DrawnLayer) => (
              <ButtonBase
                ref={moreRef}
                className={c}
                style={style}
                disableRipple
                aria-label={moreLabel}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => setOpen(true)}
              >
                {children}
              </ButtonBase>
            ),
          },
        })}
      </Box>
      {menu ? (
        <DropdownMenu anchorEl={moreRef.current} open={open} onClose={() => setOpen(false)}>
          {moreItems.map((item, i) => (
            <DropdownItem
              key={i}
              disabled={item.disabled}
              icon={item.icon}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
            >
              {item.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      ) : null}
    </>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarImageCardRecipe]: the tile's fill, edge, shadow and focus ring, the image's frame, its words' ink, the Checkbox it shows, and the unfilled tile's Plus, read cell by cell.`;
      const about = ABOUT.replace(/`([a-zA-Z]+)`/g, '[$1]')
        .replace('[onSelectedChange]', '[onSelectedChanged]')
        .replace('[onClick] or [href]', '[onPressed]')
        .replace(
          'its title (or label) is the button or link, and its hit area the whole tile, the\nCheckbox and the More menu reachable above it',
          'the whole tile is its button, named by its title (or label), and the Checkbox and the More\nmenu are controls of their own inside it',
        );
      return `/// SOLAR Image Card.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(`${about} Drawn from Figma's layer tree with [SolarLayers].`, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/image_card.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_card.dart';
import 'solar_checkbox.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';
import 'solar_theme_of.dart';

class SolarImageCard extends StatefulWidget {
  const SolarImageCard({
    super.key,
    this.filled = true,
    this.selected = false,
    this.title,
    this.subtitle,
    this.label,
    this.image,
    this.onSelectedChanged,
    this.selectLabel = 'Select',
    this.moreItems,
    this.moreLabel = 'More actions',
    this.onPressed,
    this.statesController,
  });

  /// An image's tile; false, the tile that adds one.
  final bool filled;

  final bool selected;

  /// The image's name; its name where it is pressable.
  final String? title;

  /// Its details (“Last modified 2h ago”).
  final String? subtitle;

  /// What the unfilled tile adds (“Create new”); its name where it is pressable.
  final String? label;

  /// The picture, filling the image's frame.
  final ImageProvider? image;

  /// Called with whether it is to be selected, by its Checkbox, which it then shows.
  final ValueChanged<bool>? onSelectedChanged;

  /// The Checkbox's accessible name.
  final String selectLabel;

  /// The More menu's actions: a button opens them.
  final List<SolarCardMoreItem>? moreItems;

  /// The More button's accessible name.
  final String moreLabel;

  /// Makes it pressable: the whole tile is a button that calls it.
  final VoidCallback? onPressed;

  /// Its states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  State<SolarImageCard> createState() => _SolarImageCardState();
}

class _SolarImageCardState extends State<SolarImageCard> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// The pointer or the keyboard on the tile, which shows its Checkbox.
  bool _pointer = false;
  bool _within = false;

  @override
  Widget build(BuildContext context) {
    final rows = widget.moreItems;
    if (rows == null || rows.isEmpty) return _tile(context, null);
    // Its own menu, under the More button.
    return SolarMenuAnchor(
      menu: SolarDropdownMenu(
        children: [
          for (final item in rows)
            Builder(
              builder: (context) => SolarDropdownItem(
                label: item.label,
                icon: item.icon,
                disabled: item.disabled,
                onPressed: () {
                  MenuController.maybeOf(context)?.close();
                  item.onSelected();
                },
              ),
            ),
        ],
      ),
      builder: (context, controller) => _tile(
        context,
        () => controller.isOpen ? controller.close() : controller.open(),
      ),
    );
  }

  Widget _tile(BuildContext context, VoidCallback? onMore) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarImageCardProps(filled: w.filled, selected: w.selected);
    final selectable = w.filled && w.onSelectedChanged != null;
    Widget draw(Set<WidgetState> states) {
      final shown =
          w.selected ||
          _pointer ||
          _within ||
          states.contains(WidgetState.hovered) ||
          states.contains(WidgetState.focused);
      return SolarLayers(
        recipe: SolarLayerRecipe(
          lookup: (c) => SolarImageCardRecipe.lookup(c, p, states),
          dimension: (c) => SolarImageCardRecipe.dimension(c, p, states),
          color: (c) => SolarImageCardRecipe.color(t, c, p, states),
          shadow: (c) => SolarImageCardRecipe.shadow(t, c, p, states),
          textStyle: (c) => SolarImageCardRecipe.textStyle(t, c, p, states),
          // The Checkbox shows where the tile is selected, and while the pointer or the keyboard
          // is on it; a slot left empty is not drawn.
          present: (l) => switch (l) {
            'checkbox' => selectable && shown,
            'icon' => onMore != null && SolarImageCardRecipe.present(l, p, states),
            'title' => w.title != null && SolarImageCardRecipe.present(l, p, states),
            'subtitle' =>
              w.subtitle != null && SolarImageCardRecipe.present(l, p, states),
            'label' => w.label != null && SolarImageCardRecipe.present(l, p, states),
            _ => SolarImageCardRecipe.present(l, p, states),
          },
          glyph: (l) => SolarImageCardRecipe.glyph(l, p, states),
        ),
        tree: _tree,
        keyPrefix: 'imageCard',
        text: {'title': ?w.title, 'subtitle': ?w.subtitle, 'label': ?w.label},
        wraps: const {
          'title': TextAlign.start,
          'subtitle': TextAlign.start,
          'label': TextAlign.center,
        },
        icons: const {${icons.map((i) => `'${i.layer}': ${dartIcon(i, spec)}`).join(', ')}},
        images: {
          if (w.image != null)
            'image': DecorationImage(image: w.image!, fit: BoxFit.cover),
        },
        clips: const {'root'},
        composed: {
          // The selection, a SOLAR Checkbox, named by selectLabel.
          'checkbox': SolarCheckbox(
            checked: w.selected,
            onChanged: w.onSelectedChanged,
            semanticLabel: w.selectLabel,
          ),
        },
        builders: {
          // The More mark, Figma's drawing, is its menu's button.
          'icon': (glyph) => SolarTarget.inside(
            child: Semantics(
              container: true,
              child: SolarPressable(
                onPressed: onMore,
                builder: (_, _) => Semantics(
                  label: w.moreLabel,
                  excludeSemantics: true,
                  child: glyph,
                ),
              ),
            ),
          ),
        },
      ).layer('root');
    }

    final Widget mark = w.onPressed != null
        ? SolarPressable(
            onPressed: w.onPressed,
            statesController: w.statesController,
            builder: (_, states) => draw(states),
          )
        : draw(const {});
    return Focus(
      canRequestFocus: false,
      skipTraversal: true,
      onFocusChange: (has) => setState(() => _within = has),
      child: MouseRegion(
        onEnter: (_) => setState(() => _pointer = true),
        onExit: (_) => setState(() => _pointer = false),
        child: Semantics(container: true, selected: w.selected, child: mark),
      ),
    );
  }
}
`;
    },
  },
};
