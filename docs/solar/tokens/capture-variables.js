// Captures the SOLAR Foundations variable collections, text styles and effect styles into the
// shape of figma-variables.json. Figma Plugin API, read-only. Run it inside the Foundations
// file (key Y21OGpk2z6ig9cRMc5cl9L, or a content-identical copy): through the Figma MCP
// `use_figma` tool, or pasted into a scripter-style plugin. It exists because the REST
// variables endpoint needs the Enterprise-only file_variables:read scope.
//
// Output: the JSON text. It can exceed the 20 KB tool limit, so OFF/LIM select a slice; call
// repeatedly with OFF = 0, 14000, 28000, … and concatenate, then JSON.parse and compare with
// figma-variables.json (compare-capture.mjs does the semantic diff).
const OFF = typeof CAPTURE_OFF === 'number' ? CAPTURE_OFF : 0;
const LIM = typeof CAPTURE_LIM === 'number' ? CAPTURE_LIM : Infinity;

const hex = (c) =>
  '#' +
  [c.r, c.g, c.b]
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');
const round = (n) => Math.round(n * 1000) / 1000;
const colorVal = (c) =>
  c.a !== undefined && c.a < 1 ? { hex: hex(c), a: round(c.a) } : hex(c);

const collections = await figma.variables.getLocalVariableCollectionsAsync();
const byName = Object.fromEntries(collections.map((c) => [c.name, c]));
const need = ['Primitives', 'Color', 'Spatial', 'Type'];
for (const n of need)
  if (!byName[n]) throw new Error('collection missing: ' + n);
const varById = {};
for (const c of collections)
  for (const id of c.variableIds)
    varById[id] = await figma.variables.getVariableByIdAsync(id);
const nameOf = (id) => (varById[id] ? varById[id].name : id);
const modeId = (c, modeName) => c.modes.find((m) => m.name === modeName).modeId;
const alias = (v) => v && typeof v === 'object' && v.type === 'VARIABLE_ALIAS';
// resolve a value through aliases to its final primitive value (using the target's default mode)
const resolve = (v) => {
  let guard = 0;
  while (alias(v) && guard++ < 10) {
    const t = varById[v.id];
    if (!t) return v.id;
    const tc = collections.find((c) => c.id === t.variableCollectionId);
    v = t.valuesByMode[tc.defaultModeId];
  }
  return v;
};
const toVal = (v, type) =>
  type === 'COLOR' ? colorVal(v) : typeof v === 'number' ? round(v) : v;

// ---- primitives: grouped by path minus the last segment ----
const P = byName.Primitives;
const pm = modeId(P, P.modes[0].name);
const primitives = {};
for (const id of P.variableIds) {
  const v = varById[id];
  const parts = v.name.split('/');
  const key = parts.pop();
  const grp = parts.join('/');
  (primitives[grp] ||= {})[key] = toVal(
    resolve(v.valuesByMode[pm]),
    v.resolvedType,
  );
}
// groups where every key equals its value become plain arrays (font-size, line-height)
for (const [g, m] of Object.entries(primitives)) {
  const ks = Object.keys(m);
  if (ks.length > 3 && ks.every((k) => String(m[k]) === k))
    primitives[g] = ks.map(Number);
}

// ---- color: name -> [light alias, dark alias, scopes] ----
const C = byName.Color;
const [lm, dm] = [modeId(C, 'Light'), modeId(C, 'Dark')];
const ref = (v, type) => (alias(v) ? '{' + nameOf(v.id) + '}' : toVal(v, type));
const color = {
  _modes: ['Light', 'Dark'],
  _format: 'name: [light alias, dark alias, scopes]',
};
for (const id of C.variableIds) {
  const v = varById[id];
  color[v.name] = [
    ref(v.valuesByMode[lm], 'COLOR'),
    ref(v.valuesByMode[dm], 'COLOR'),
    v.scopes.join(','),
  ];
}

// ---- spatial: name -> [alias, resolved px, scopes] ----
const S = byName.Spatial;
const sm = S.defaultModeId;
const spatial = {
  _modes: S.modes.map((m) => m.name),
  _format: 'name: [alias, resolved px, scopes]',
};
for (const id of S.variableIds) {
  const v = varById[id];
  spatial[v.name] = [
    ref(v.valuesByMode[sm], 'FLOAT'),
    toVal(resolve(v.valuesByMode[sm]), 'FLOAT'),
    v.scopes.join(','),
  ];
}

// ---- type: name -> [desktop px, mobile px] ----
const T = byName.Type;
const [dk, mb] = [modeId(T, 'Desktop'), modeId(T, 'Mobile')];
const type = {
  _modes: ['Desktop', 'Mobile'],
  _format: 'name: [desktop px, mobile px]',
};
for (const id of T.variableIds) {
  const v = varById[id];
  type[v.name] = [
    toVal(resolve(v.valuesByMode[dk]), 'FLOAT'),
    toVal(resolve(v.valuesByMode[mb]), 'FLOAT'),
  ];
}

// ---- text styles: name -> [family, style, size, line-height, letter-spacing] ----
const ls = (x) =>
  x.unit === 'PERCENT' ? `${round(x.value)}%` : `${round(x.value)}px`;
const lh = (x) =>
  x.unit === 'AUTO'
    ? 'auto'
    : x.unit === 'PERCENT'
      ? `${round(x.value)}%`
      : round(x.value);
const textStyles = {
  _format:
    'name: [family, style, size px (Desktop mode), line-height px, letter-spacing]. Letter spacing is % of font size unless suffixed px. Sizes and line heights are bound to the Type collection and switch with the Desktop/Mobile mode.',
};
const tstyles = await figma.getLocalTextStylesAsync();
for (const s of tstyles)
  textStyles[s.name] = [
    s.fontName.family,
    s.fontName.style,
    round(s.fontSize),
    lh(s.lineHeight),
    ls(s.letterSpacing),
  ];

// ---- effect styles: name -> drop-shadow layers ----
const effectStyles = {
  _format:
    "name: list of drop-shadow layers {x, y, blur, spread, color variable, light-mode resolved rgba}. Colors are bound to the Color collection shadow/* variables and therefore change in Dark mode (see the 'color' section).",
};
const estyles = await figma.getLocalEffectStylesAsync();
for (const s of estyles)
  effectStyles[s.name] = s.effects
    .filter((e) => e.type === 'DROP_SHADOW' && e.visible !== false)
    .map((e) => {
      const c = e.color;
      const cv =
        e.boundVariables && e.boundVariables.color
          ? nameOf(e.boundVariables.color.id)
          : null;
      return {
        x: e.offset.x,
        y: e.offset.y,
        blur: e.radius,
        spread: e.spread || 0,
        colorVar: cv,
        light: `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${round(c.a)})`,
      };
    });

const paintStyles = (await figma.getLocalPaintStylesAsync()).length;
const out = {
  source: {
    figmaFile: figma.root.name,
    fileKey: figma.fileKey || null,
    exportedOn: new Date().toISOString().slice(0, 10),
    solarVersion: '1.0',
    collections: Object.fromEntries(
      collections.map((c) => [
        c.name,
        {
          id: c.id,
          modes: c.modes.map((m) => m.name),
          count: c.variableIds.length,
        },
      ]),
    ),
    textStyles: tstyles.length,
    effectStyles: estyles.length,
    paintStyles,
  },
  primitives,
  color,
  spatial,
  type,
  textStyles,
  effectStyles,
};
const text = JSON.stringify(out);
return { total: text.length, off: OFF, text: text.slice(OFF, OFF + LIM) };
