/**
 * SOLAR Launch Card Full Screen, beyond its IR: where MUI draws each layer, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn page (`src/shells/drawn.mjs`), built with slots (owner decision 2026-09-25): an app's
 * image beside its App Icon and favourite, its name, an intro and up to three features, and its
 * action, the caller's Button.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const P = 'SolarLaunchCardFullScreen';
const FEATURES = ['feature', 'feature2', 'feature3'];

/** Whether the caller gives feature \`i\`, in Dart. */
const hasFeature = (i) =>
  i === 0 ? 'features.isNotEmpty' : `features.length > ${i}`;

const requireLayers = (spec) => {
  for (const slot of ['name', 'intro', 'appIcon', 'favourite', 'action'])
    if (!spec.slots[slot])
      throw new Error(`Launch Card Full Screen: the IR has no ${slot} slot`);
  for (const layer of ['image', ...FEATURES])
    if (!spec.layers[layer])
      throw new Error(`Launch Card Full Screen: the IR has no ${layer} layer`);
};

const ABOUT = `An app's page, where it is chosen from a launcher: its \`image\` beside its \`appIcon\`
and \`favourite\` (the caller's Icon Button, md, round and tertiary), its \`name\`, its \`intro\`, up
to three \`features\`, each a paragraph, and the caller's \`action\` (a SOLAR Button, md, "Open") at
the foot of its words.`;

export default {
  name: 'Launch Card Full Screen',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its words wrap, and the
    // picture fills the image, cut to its corners.
    slots: 'drawn',
    resets: drawnResets('Launch Card Full Screen', {
      display: 'flex',
      [`& .${P}-name, & .${P}-intro, ${FEATURES.map((f) => `& .${P}-${f}`).join(', ')}`]:
        {
          whiteSpace: 'normal',
          minWidth: '0',
        },
      [`& .${P}--image`]: { overflow: 'hidden', flexShrink: '0' },
      [`& .${P}--image > img`]: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
      [`& .${P}-appIcon > img`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
  shells: {
    label: 'name',
    slots: {
      name: { react: 'name', flutter: 'name' },
      intro: { react: 'intro', flutter: 'intro' },
      appIcon: { react: 'appIcon', flutter: 'appIcon' },
      favourite: { react: 'favourite', flutter: 'favourite' },
      action: { react: 'action', flutter: 'action' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return drawnReact(spec, {
        look: 'the page’s fill, radius and padding, its image’s frame, and its words’ ink',
        about: `${ABOUT} Bespoke: drawn from Figma's layer tree (\`internal/layers.tsx\`).`,
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** The app's name. */
name: ReactNode;
/** What the app is, its first paragraph. */
intro?: ReactNode;
/** What it does, up to three paragraphs, as Figma draws them. */
features?: readonly [ReactNode?, ReactNode?, ReactNode?];
/** The picture beside its words, by its address. */
image?: string;
/** The app's icon: an App Icon of the assets, as an image. */
appIcon?: ReactNode;
/** The caller's favourite: an Icon Button, md, round and tertiary. */
favourite?: ReactNode;
/** The caller's action: a SOLAR Button, md (“Open”). */
action?: ReactNode;`,
        own: [
          'name',
          'intro',
          'features',
          'image',
          'appIcon',
          'favourite',
          'action',
        ],
        text: `{ name, intro, ${FEATURES.map((f, i) => `${f}: features?.[${i}]`).join(', ')} }`,
        present: {
          intro: 'composed.intro?.present !== false && intro != null',
          ...Object.fromEntries(
            FEATURES.map((f, i) => [
              f,
              `composed.${f}?.present !== false && features?.[${i}] != null`,
            ]),
          ),
          appIcon: 'appIcon != null',
          favourite: 'favourite != null',
          action: 'action != null',
        },
        icons: `appIcon: <span>{appIcon}</span>, favourite: <span>{favourite}</span>, action: <span>{action}</span>`,
        content: `{ image: image != null ? <img src={image} alt="" /> : null }`,
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the page’s fill, radius and padding, its image’s frame, and its words’ ink, read cell by cell',
        about: `${ABOUT.replace(/`([a-zA-Z]+)`/g, '[$1]')} Bespoke: drawn from Figma's layer tree with [SolarLayers].`,
        params: `required this.name,
this.intro,
this.features = const [],
this.image,
this.appIcon,
this.favourite,
this.action,`,
        fields: `/// The app's name.
final String name;

/// What the app is, its first paragraph.
final String? intro;

/// What it does, up to three paragraphs, as Figma draws them.
final List<String> features;

/// The picture beside its words.
final ImageProvider? image;

/// The app's icon: an App Icon of the assets, as an image.
final Widget? appIcon;

/// The caller's favourite: an Icon Button, md, round and tertiary.
final Widget? favourite;

/// The caller's action: a SOLAR Button, md (“Open”).
final Widget? action;`,
        prelude:
          "assert(features.length <= 3, 'A page draws up to three features, as Figma does.');",
        text: `{
        'name': name,
        'intro': ?intro,
        ${FEATURES.map((f, i) => `'${f}': ?(${hasFeature(i)} ? features[${i}] : null)`).join(',\n        ')},
      }`,
        wraps: `const {
        'name': TextAlign.start,
        'intro': TextAlign.start,
        ${FEATURES.map((f) => `'${f}': TextAlign.start`).join(',\n        ')},
      }`,
        slots:
          "{'appIcon': ?appIcon, 'favourite': ?favourite, 'action': ?action}",
        present: (recipe) => `switch (l) {
          'intro' => intro != null && ${recipe},
          ${FEATURES.map((f, i) => `'${f}' => ${hasFeature(i)} && ${recipe}`).join(',\n          ')},
          'appIcon' => appIcon != null,
          'favourite' => favourite != null,
          'action' => action != null,
          _ => ${recipe},
        }`,
        clips: "const {'image'}",
        images:
          "{if (image != null) 'image': DecorationImage(image: image!, fit: BoxFit.cover)}",
      });
    },
  },
};
