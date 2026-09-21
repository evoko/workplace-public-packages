// Generates css-contract.json, reference.css and grammar.json from figma-variables.json.
// Run: node docs/solar/tokens/build-derived.mjs
// The JSON inventory is the source of truth; never edit the generated files by hand.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const inv = JSON.parse(
  readFileSync(join(here, 'figma-variables.json'), 'utf8'),
);

// ---------- primitives: flatten to figmaPath -> value ----------
const prim = {};
for (const [grp, v] of Object.entries(inv.primitives)) {
  if (Array.isArray(v)) for (const x of v) prim[`${grp}/${x}`] = x;
  else for (const [k, x] of Object.entries(v)) prim[`${grp}/${k}`] = x;
}
const toCss = (val) => {
  if (val && typeof val === 'object' && 'hex' in val) {
    const r = parseInt(val.hex.slice(1, 3), 16),
      g = parseInt(val.hex.slice(3, 5), 16),
      b = parseInt(val.hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${val.a})`;
  }
  return val;
};
const resolveAlias = (s) => {
  const m = /^\{(.+)\}$/.exec(s);
  if (!m) return s;
  const v = prim[m[1]];
  if (v === undefined) throw new Error('unresolved alias ' + s);
  return v;
};
const cssVar = (docName) => '--solar-' + docName.replace(/[./]/g, '-');
const unitFor = (figmaPath) =>
  /font-weight|font-family|ease/.test(figmaPath)
    ? ''
    : /duration/.test(figmaPath)
      ? 'ms'
      : 'px';

const entries = [];
// primitives
for (const [path, val] of Object.entries(prim)) {
  const doc = path.replace(/\//g, '.');
  const css = cssVar(doc);
  const u = unitFor(path);
  const v = toCss(val);
  entries.push({
    collection: 'Primitives',
    tier: 'primitive',
    figma: path,
    doc,
    css,
    value: typeof v === 'number' ? `${v}${u}` : String(v),
  });
}
// color (Light | Dark)
for (const [name, [l, d]] of Object.entries(inv.color).filter(
  ([k]) => !k.startsWith('_'),
)) {
  const doc = 'color.' + name.replace(/\//g, '.');
  entries.push({
    collection: 'Color',
    tier: 'semantic',
    figma: name,
    doc,
    css: cssVar(doc),
    light: String(toCss(resolveAlias(l))),
    dark: String(toCss(resolveAlias(d))),
    lightAlias: l.slice(1, -1),
    darkAlias: d.slice(1, -1),
  });
}
// spatial
for (const [name, [alias, px]] of Object.entries(inv.spatial).filter(
  ([k]) => !k.startsWith('_'),
)) {
  const doc = name.replace(/\//g, '.');
  entries.push({
    collection: 'Spatial',
    tier: 'semantic',
    figma: name,
    doc,
    css: cssVar(doc),
    value: `${px}px`,
    alias: alias.slice(1, -1),
  });
}
// type (Desktop | Mobile) — CSS naming is proposed: --solar-type-<figma path>
for (const [name, [desk, mob]] of Object.entries(inv.type).filter(
  ([k]) => !k.startsWith('_'),
)) {
  const doc = 'type.' + name.replace(/\//g, '.');
  entries.push({
    collection: 'Type',
    tier: 'semantic',
    figma: name,
    doc,
    css: cssVar(doc),
    desktop: `${desk}px`,
    mobile: `${mob}px`,
    naming: 'proposed',
  });
}
// effect styles -> box-shadow composites, light and dark
const colorByName = Object.fromEntries(
  Object.entries(inv.color).filter(([k]) => !k.startsWith('_')),
);
const shadows = [];
for (const [name, layers] of Object.entries(inv.effectStyles).filter(
  ([k]) => !k.startsWith('_'),
)) {
  const mk = (mode) =>
    layers
      .map((L) => {
        const [l, d] = colorByName[L.colorVar];
        const c = toCss(resolveAlias(mode === 'light' ? l : d));
        return `${L.x}px ${L.y}px ${L.blur}px ${L.spread}px ${c}`;
      })
      .join(', ');
  const doc = name.replace(/\//g, '.');
  shadows.push({
    collection: 'EffectStyles',
    tier: 'semantic',
    figma: name,
    doc,
    css: cssVar(doc),
    light: mk('light'),
    dark: mk('dark'),
    layers,
  });
}
// text styles as composites
const textStyles = [];
for (const [name, [family, style, size, lh, ls]] of Object.entries(
  inv.textStyles,
).filter(([k]) => !k.startsWith('_') && !k.startsWith('.'))) {
  const weight = {
    Thin: 100,
    'Extra Light': 200,
    Light: 300,
    Regular: 400,
    Medium: 500,
    'Semi Bold': 600,
    SemiBold: 600,
    Bold: 700,
    'Extra Bold': 800,
    Black: 900,
  }[style];
  // find the Type collection variable this style binds to, by role/size in the name
  const parts = name.split('/');
  const role = parts[0];
  const sz = parts[1];
  const sizeVar = role === 'link' ? `size/body/${sz}` : `size/${role}/${sz}`;
  const lhVar =
    role === 'link' ? `line-height/body/${sz}` : `line-height/${role}/${sz}`;
  textStyles.push({
    figma: name,
    fontFamily: family,
    fontWeight: weight,
    sizeDesktop: size,
    lineHeightDesktop: lh,
    letterSpacing: ls,
    sizeVar: inv.type[sizeVar]
      ? cssVar('type.' + sizeVar.replace(/\//g, '.'))
      : null,
    lineHeightVar: inv.type[lhVar]
      ? cssVar('type.' + lhVar.replace(/\//g, '.'))
      : null,
    sizeMobile: inv.type[sizeVar] ? inv.type[sizeVar][1] : null,
    lineHeightMobile: inv.type[lhVar] ? inv.type[lhVar][1] : null,
  });
}

const contract = {
  _note:
    'Generated by build-derived.mjs from figma-variables.json. CSS names follow the SOLAR contract: --solar- prefix + path with hyphens. Color-collection names gain the color. category; Type names use a type. prefix (proposed, not yet ratified). Light/Dark are the resolved sRGB values; Desktop/Mobile are the resolved px.',
  generatedFrom: inv.source,
  variables: entries,
  effectStyles: shadows,
  textStyles,
  zIndex: {
    _note:
      'Seven fixed levels from the Agentic Reference and Elevation pages; not Figma variables.',
    base: 0,
    sticky: 100,
    dropdown: 200,
    overlay: 300,
    dialog: 400,
    toast: 500,
    tooltip: 600,
  },
};
writeFileSync(
  join(here, 'css-contract.json'),
  JSON.stringify(contract, null, 2) + '\n',
);

// ---------- reference.css ----------
let css = `/* SOLAR Foundations v1.0 — reference CSS custom properties.\n * Generated by docs/solar/tokens/build-derived.mjs from figma-variables.json. Do not edit.\n * Light mode is the default; Dark mode reassigns the same properties under [data-theme="dark"].\n * Type sizes switch at the sm viewport (768px) by reassigning --solar-type-* under a media query.\n */\n:root {\n`;
const line = (k, v) => `  ${k}: ${v};\n`;
css += '  /* primitives */\n';
for (const e of entries.filter((e) => e.tier === 'primitive'))
  css += line(e.css, e.value);
css += '  /* color (Light) */\n';
for (const e of entries.filter((e) => e.collection === 'Color'))
  css += line(e.css, e.light);
css += '  /* spatial */\n';
for (const e of entries.filter((e) => e.collection === 'Spatial'))
  css += line(e.css, e.value);
css += '  /* type (Desktop) */\n';
for (const e of entries.filter((e) => e.collection === 'Type'))
  css += line(e.css, e.desktop);
css += '  /* shadows (Light) */\n';
for (const s of shadows) css += line(s.css, s.light);
css += '  /* z-index */\n';
for (const [k, v] of Object.entries(contract.zIndex))
  if (!k.startsWith('_')) css += line('--solar-z-' + k, v);
css += '}\n\n:root[data-theme="dark"] {\n';
for (const e of entries.filter((e) => e.collection === 'Color'))
  css += line(e.css, e.dark);
for (const s of shadows) css += line(s.css, s.dark);
css += '}\n\n@media (max-width: 767.98px) {\n  :root {\n';
for (const e of entries.filter((e) => e.collection === 'Type'))
  css += '  ' + line(e.css, e.mobile);
css +=
  '  }\n}\n\n@media (prefers-reduced-motion: reduce) {\n  * {\n    transition-duration: 0ms !important;\n    transition-delay: 0ms !important;\n    scroll-behavior: auto !important;\n  }\n}\n';
writeFileSync(join(here, 'reference.css'), css);

// ---------- grammar.json ----------
const uniq = (arr) => [...new Set(arr)].sort();
const colorNames = Object.keys(colorByName);
const seg = (re, i = 1) =>
  uniq(
    colorNames
      .map((n) => {
        const m = re.exec(n);
        return m ? m[i] : null;
      })
      .filter(Boolean),
  );
const grammar = {
  _note:
    'Generated by build-derived.mjs. Enumerations are the values that actually exist in the Figma inventory. Use `patterns` (anchored regexes over the documentation dot-name) to validate token references; use `banned` to catch the most common naming mistakes.',
  separators: { figma: '/', docs: '.', css: '-', cssPrefix: '--solar-' },
  categories: {
    color: {
      surfaceVariants: seg(/^surface\/([^/]+)$/),
      feedbackSentiments: seg(/^surface\/feedback\/([^/]+)\//),
      feedbackSurfaceTones: seg(/^surface\/feedback\/[^/]+\/([^/]+)$/),
      textVariants: seg(/^text\/([^/]+)$/),
      textFeedback: seg(/^text\/feedback\/([^/]+)$/),
      linkStates: seg(/^text\/link\/([^/]+)$/),
      iconVariants: seg(/^icon\/([^/]+)$/),
      borderVariants: uniq([
        ...seg(/^border\/([^/]+)$/),
        ...seg(/^border\/(inverse\/[^/]+)$/),
      ]),
      borderFeedback: seg(/^border\/feedback\/([^/]+)\//),
      borderFeedbackTones: seg(/^border\/feedback\/[^/]+\/([^/]+)$/),
      shadowColors: uniq([
        ...seg(/^shadow\/([^/]+)$/),
        ...seg(/^shadow\/(feedback\/[^/]+)$/),
      ]),
      actionIntents: seg(/^action\/([^/]+)\//),
      actionProperties: seg(/^action\/[^/]+\/([^/]+)\//),
      actionStates: seg(/^action\/[^/]+\/[^/]+\/(?:danger\/)?([^/]+)$/),
      dataTypes: seg(/^data\/([^/]+)\//),
      dataCategoryIds: seg(/^data\/category\/([^/]+)\//),
      dataCategoryTones: seg(/^data\/category\/[^/]+\/([^/]+)$/),
      dataScaleSteps: seg(/^data\/scale\/([^/]+)$/),
      dataDelta: seg(/^data\/delta\/([^/]+)$/),
      brand: seg(/^brand\/([^/]+)$/),
      meter: seg(/^meter\/([^/]+)$/),
      controlKinds: seg(/^control\/([^/]+)\//),
    },
    spatial: {
      sizes: uniq(
        Object.keys(inv.spatial)
          .filter((k) => /^(inset|stack)\//.test(k))
          .map((k) => k.split('/')[1]),
      ),
      radius: uniq(
        Object.keys(inv.spatial)
          .filter((k) => k.startsWith('radius/'))
          .map((k) => k.split('/')[1]),
      ),
      borderWidth: uniq(
        Object.keys(inv.spatial)
          .filter((k) => k.startsWith('border/'))
          .map((k) => k.split('/')[1]),
      ),
      icon: uniq(
        Object.keys(inv.spatial)
          .filter((k) => k.startsWith('icon/'))
          .map((k) => k.split('/')[1]),
      ),
      scaleIndex: Object.keys(inv.primitives['spatial/scale']).map(Number),
      viewport: Object.keys(inv.primitives.viewport),
    },
    type: {
      roles: uniq(Object.keys(inv.type).map((k) => k.split('/')[1])),
      sizesByRole: Object.fromEntries(
        uniq(Object.keys(inv.type).map((k) => k.split('/')[1])).map((r) => [
          r,
          uniq(
            Object.keys(inv.type)
              .filter((k) => k.split('/')[1] === r)
              .map((k) => k.split('/')[2]),
          ),
        ]),
      ),
      weights: Object.keys(inv.primitives['type/font-weight']).map(Number),
      families: Object.keys(inv.primitives['type/font-family']),
    },
    motion: {
      duration: Object.keys(inv.primitives['motion/duration']),
      ease: Object.keys(inv.primitives['motion/ease']),
    },
    shadowEffects: Object.keys(inv.effectStyles)
      .filter((k) => !k.startsWith('_'))
      .map((k) => k.replace(/\//g, '.')),
    textStyles: Object.keys(inv.textStyles).filter(
      (k) => !k.startsWith('_') && !k.startsWith('.'),
    ),
  },
  patterns: {
    'color.surface':
      '^color\\.surface\\.(background|base|raised|overlay|dialog|scrim|muted|inverse|hover|active|feedback\\.(success|warning|danger|info|neutral)\\.(subtle|subtle-alpha|medium|strong))$',
    'color.text':
      '^color\\.text\\.(primary|secondary|tertiary|disabled|inverse|feedback\\.(success|warning|danger|info|neutral)|link\\.(default|hover|active|disabled))$',
    'color.icon':
      '^color\\.icon\\.(primary|secondary|tertiary|disabled|inverse|feedback\\.(success|warning|danger|info|neutral)|link\\.(default|hover|active|disabled))$',
    'color.border':
      '^color\\.border\\.(subtle|medium|strong|disabled|inverse|inverse\\.(subtle|strong)|surface|highlight|feedback\\.(focus|success|warning|danger|info|neutral)\\.(subtle|medium|strong))$',
    'color.shadow':
      '^color\\.shadow\\.(subtle|strong|feedback\\.(focus|danger|warning|success|info|neutral))$',
    'color.action':
      '^color\\.action\\.(primary|secondary|tertiary)\\.(bg|text|icon|border)\\.(danger\\.)?(default|hover|active|disabled)$',
    'color.action (docs form)':
      '^color\\.action\\.(primary|secondary|tertiary|primary-danger)\\.(bg|text|icon|border)\\.(default|hover|active|disabled)$',
    'color.data':
      '^color\\.data\\.(category\\.0[1-8]\\.(strong|subtle)|scale\\.[1-9]00|delta\\.(neutral|(negative|positive)-(100|300|500)))$',
    'color.brand': '^color\\.brand\\.(primary|secondary|tertiary)$',
    'color.meter': '^color\\.meter\\.(nominal|warning|peak)$',
    'color.control':
      '^color\\.control\\.(neutral|mute|solo|phantom|phase)\\.(bg|border|icon)\\.(default|hover|active|disabled)$',
    inset: '^inset\\.(none|2xs|xs|sm|md|lg|xl|2xl|3xl)$',
    stack: '^stack\\.(none|2xs|xs|sm|md|lg|xl|2xl|3xl)$',
    radius: '^radius\\.(none|subtle|control|container|dialog|pill)$',
    'border (width)': '^border\\.(none|default|strong|emphasis)$',
    'icon.size': '^icon\\.(size\\.)?(xs|sm|md|lg|xl|2xl)$',
    'spatial primitive':
      '^spatial\\.(scale\\.(\\d|1\\d|2[0-2])|border-width\\.(none|sm|md|lg)|border-radius\\.(none|sm|md|lg|xl|full))$',
    viewport: '^viewport\\.(xs|sm|md|lg|xl)$',
    motion:
      '^motion\\.(duration\\.(instant|fast|normal|slow|slower)|ease\\.(in|out|both))$',
    'shadow (effect)':
      '^shadow\\.(control|raised|overlay|dialog|strong|focus\\.(default|danger)|danger|warning)$',
    'text style':
      '^(display\\.(lg|md|sm|xs\\.(medium|semibold))|title\\.(lg|md|sm|xs|2xs)|body\\.(lg|md|sm|xs|2xs)\\.(regular|medium|semibold|bold)|label\\.(md|sm)|helper\\.(md|sm)|code\\.(lg|md)|caption\\.xs|link\\.(lg|md|sm|xs|2xs)\\.(default|hover))$',
    'type (semantic, proposed)':
      '^type\\.(size|line-height)\\.(display|title|body|label|helper|code|caption)\\.(lg|md|sm|xs|2xs)$',
    'css custom property': '^--solar-[a-z0-9]+(-[a-z0-9]+)*$',
    'product override': '^--(?!solar-)[a-z][a-z0-9]*-[a-z0-9-]+$',
  },
  primitivePatterns: {
    _note:
      'Primitive tokens. Valid names, but NEVER allowed in component code or design layers; a reference matching these should be flagged (CLR-002) unless it is inside a semantic token definition.',
    'color palette':
      '^color\\.(neutral|red|orange|yellow|green|turquoise|blue|purple|pink)\\.(50|100|200|300|400|500|600|700|800|900)$',
    'color brand/mono':
      '^color\\.(brand\\.(red|black|white|teal|light-blue|sand|saffron|plum)|mono\\.(black|white))$',
    'color alpha':
      '^color\\.alpha\\.(transparent|(black|white)-(05|10|20|30|40|50|60|70|80|90)|(red|orange|green|turquoise|blue)-(05|10|20|50)|(dark|light)-(red|orange|green|turquoise)-50)$',
    'color flow-accent':
      '^color\\.flow-accent\\.(teal|green|lime|cyan|blue|red|amber|magenta|aqua)$',
    'type primitive':
      '^type\\.(font-size|line-height)\\.(8|10|11|12|14|16|18|20|24|28|32|36|40|44|48|52|56|64|72|80|96|112|128)$|^type\\.font-family\\.(gotham|montserrat|inter|opensans|ibmplexmono|robotomono)$|^type\\.font-weight\\.[1-9]00$',
    'spatial primitive':
      '^spatial\\.(scale\\.(\\d|1\\d|2[0-2])|border-width\\.(none|sm|md|lg)|border-radius\\.(none|sm|md|lg|xl|full))$',
    viewport: '^viewport\\.(xs|sm|md|lg|xl)$',
    motion:
      '^motion\\.(duration\\.(instant|fast|normal|slow|slower)|ease\\.(in|out|both))$',
  },
  banned: {
    foreground: 'use text or icon',
    'background (action)': 'use bg',
    'color.icon.default': 'color.icon.primary',
    'color.text.danger': 'color.text.feedback.danger',
    'color.text.error': 'color.text.feedback.danger',
    'color.icon.success': 'color.icon.feedback.success',
    'color.surface.danger': 'color.surface.feedback.danger.<tone>',
    'color.border.error': 'color.border.feedback.danger.strong',
    'color.border.focus': 'color.border.feedback.focus.strong',
    'color.border.default':
      'color.border.subtle | medium | strong (no default variable exists)',
    'color.surface.secondary': 'phantom — flag, do not use',
    'color.surface.default': 'color.surface.base',
    'color.surface.subtle': 'color.surface.muted',
    'shadow.subtle (effect)':
      'shadow.raised (color.shadow.subtle is a color only)',
    'shadow.elevated': 'shadow.overlay',
    'shadow.medium': 'shadow.overlay',
    'shadow.strongest': 'shadow.dialog',
    'shadow.modal': 'shadow.dialog',
    'space.*': 'inset.* or stack.*',
    'gap.*': 'stack.* (or inset.* for padding)',
    'radius.xs': 'radius.subtle',
    'radius.sm|md|lg|xl (semantic)': 'radius.subtle|control|container|dialog',
    'radius.2xl': 'no such step',
    'opacity.disabled': 'no variable; use explicit disabled tokens',
    'viewport.breakpoint.*': 'viewport.xs…xl',
    'motion.easing.standard|enter|exit|linear': 'motion.ease.both|out|in',
    'raw hex / px / rem / ms / cubic-bezier in components': 'always a token',
  },
};
writeFileSync(
  join(here, 'grammar.json'),
  JSON.stringify(grammar, null, 2) + '\n',
);
console.log(
  'variables',
  entries.length,
  'shadows',
  shadows.length,
  'textStyles',
  textStyles.length,
  'css bytes',
  css.length,
);

// Keep generated files Prettier-clean so the repo format check passes after a regenerate.
execSync(
  'npx prettier --write docs/solar/tokens/css-contract.json docs/solar/tokens/reference.css docs/solar/tokens/grammar.json',
  { cwd: join(here, '..', '..', '..'), stdio: 'ignore' },
);
