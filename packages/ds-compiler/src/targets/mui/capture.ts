import { createRequire } from 'node:module';
import { join } from 'node:path';
import postcss, { type AtRule, type Rule as CssRule } from 'postcss';
import {
  Diagnostics,
  type DiagnosticCode,
  type SourceLocation,
} from '../../errors.js';
import { stableStringify } from '../../ir/serialize.js';
import type { ComponentIR, DesignIR } from '../../ir/types.js';
import { codeUnitCompare } from '../../sources.js';
import type { CapturedCatalog, PluginContext } from '../plugin.js';
import {
  CATALOG_AT,
  catalogHeaderText,
  catalogPathFor,
  resolveMuiPackage,
  type MuiCatalog,
  type MuiCatalogComponent,
  type MuiCatalogProp,
  type MuiCatalogRender,
  type MuiCatalogRule,
  type MuiFrameworkComponent,
  type MuiProbeFacts,
} from './catalog.js';
import { extractMuiProps } from './extract-props.js';
import { MUI_PACKAGE } from './framework.js';
import { muiMapping, type MuiScalar } from './hints.js';
import {
  PARITY_DEFAULT_PROPS,
  manifestLocation,
  planMapping,
  type MappingPlan,
} from './mapping.js';
import { axisPermutations, camelCase, muiThemeKeyFor } from './names.js';

/** Emotion cache key; every generated class is `c-<hash>[-<label>]`. */
const CACHE_KEY = 'c';
const EMOTION_CLASS = new RegExp(`^${CACHE_KEY}-[a-z0-9]+(?:-[A-Za-z0-9-]+)?$`);
const STYLE_TAG = /<style data-emotion="([^"]*)">([\s\S]*?)<\/style>/g;
const OPEN_TAG =
  /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s=>]+(?:="[^"]*")?)*)\s*\/?>/g;
const CLASS_ATTR = /\sclass="([^"]*)"/;
/** The DOM class every `ButtonBase`-rooted component's root carries. */
const BUTTON_BASE_ROOT_CLASS = 'MuiButtonBase-root';

/* Loosely typed views of the CJS modules loaded from the target package. */
type Element = unknown;
interface ReactModule {
  createElement(
    type: unknown,
    props: Record<string, unknown> | null,
    ...children: unknown[]
  ): Element;
}
interface Runtime {
  React: ReactModule;
  renderToStaticMarkup(element: Element): string;
  createCache(options: { key: string }): unknown;
  CacheProvider: unknown;
  ThemeProvider: unknown;
  createTheme(options: Record<string, unknown>): unknown;
  require: NodeJS.Require;
  muiDir: string;
  version: string;
}

function loadRuntime(outDir: string, diag: Diagnostics): Runtime | null {
  const require = createRequire(join(outDir, 'capture.cjs'));
  try {
    const React = require('react') as ReactModule;
    const { renderToStaticMarkup } = require('react-dom/server') as Pick<
      Runtime,
      'renderToStaticMarkup'
    >;
    const cacheModule = require('@emotion/cache') as
      | Runtime['createCache']
      | { default: Runtime['createCache'] };
    const createCache =
      typeof cacheModule === 'function' ? cacheModule : cacheModule.default;
    const { CacheProvider } = require('@emotion/react') as Pick<
      Runtime,
      'CacheProvider'
    >;
    const { ThemeProvider, createTheme } = require(
      `${MUI_PACKAGE}/styles`,
    ) as Pick<Runtime, 'ThemeProvider' | 'createTheme'>;
    const resolved = resolveMuiPackage(require);
    if (!resolved) {
      throw new Error(`cannot resolve ${MUI_PACKAGE}/package.json`);
    }
    return {
      React,
      renderToStaticMarkup,
      createCache,
      CacheProvider,
      ThemeProvider,
      createTheme,
      require,
      muiDir: resolved.muiDir,
      version: resolved.version,
    };
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: cannot load react, react-dom, @emotion/react, @emotion/cache, and ${MUI_PACKAGE} from ${outDir}: ${(err as Error).message}`,
      CATALOG_AT,
    );
    return null;
  }
}

interface LoadedComponent {
  Component: unknown;
  classes: Record<string, string>;
}

function loadComponent(
  runtime: Runtime,
  component: string,
  at: SourceLocation,
  diag: Diagnostics,
): LoadedComponent | null {
  const specifier = `${MUI_PACKAGE}/${component}`;
  let mod: Record<string, unknown>;
  try {
    mod = runtime.require(specifier) as Record<string, unknown>;
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: cannot load ${specifier}: ${(err as Error).message}`,
      at,
    );
    return null;
  }
  const Component = mod.default;
  const classes = mod[`${camelCase(component)}Classes`];
  if (
    Component === undefined ||
    classes === null ||
    typeof classes !== 'object' ||
    Object.values(classes as Record<string, unknown>).some(
      (v) => typeof v !== 'string',
    )
  ) {
    diag.add(
      'DS-E086',
      `mui: ${specifier} does not export a default component and ${camelCase(component)}Classes`,
      at,
    );
    return null;
  }
  const sorted = Object.fromEntries(
    Object.keys(classes as Record<string, string>)
      .sort(codeUnitCompare)
      .map((k) => [k, (classes as Record<string, string>)[k]]),
  );
  return { Component, classes: sorted };
}

interface DomElement {
  tag: string;
  classes: string[];
}

/** Every element start tag in the markup, with `<style>` blocks removed first. */
function elementsOf(html: string): DomElement[] {
  const withoutStyles = html.replace(STYLE_TAG, '');
  const out: DomElement[] = [];
  for (const m of withoutStyles.matchAll(OPEN_TAG)) {
    const classAttr = CLASS_ATTR.exec(m[2]);
    out.push({
      tag: m[1].toLowerCase(),
      classes: classAttr ? classAttr[1].split(/\s+/).filter(Boolean) : [],
    });
  }
  return out;
}

function emotionClassOf(el: DomElement): string | null {
  return el.classes.find((c) => EMOTION_CLASS.test(c)) ?? null;
}

/** The subset of `Diagnostics` that the rendering helpers need. */
export interface DiagSink {
  add(code: DiagnosticCode, message: string, location?: SourceLocation): void;
}

/**
 * Wraps `diag` so an identical (code, message) pair reported for more than
 * one axis permutation of the same component is recorded once: the DOM
 * structure MUI renders for an unmapped element or a missing root does not
 * depend on the axis values, so re-rendering every permutation would
 * otherwise repeat the same structural diagnostic once per permutation.
 */
function dedupingSink(diag: Diagnostics, seen: Set<string>): DiagSink {
  return {
    add(code, message, location) {
      const key = `${code}|${message}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      diag.add(code, message, location);
    },
  };
}

/** Prop names (sorted) whose declared `OverridableStringUnion` could not be
 * resolved to any string-literal member at all (an unresolvable import, an
 * exotic mapped type): MUI's own defaults for such a prop cannot be safely
 * disabled, because there is nothing to disable them *to*. */
export function unresolvedUnionProps(
  props: Record<string, MuiCatalogProp>,
): string[] {
  return Object.keys(props)
    .filter(
      (k) => props[k].kind === 'union' && (props[k].values?.length ?? 0) === 0,
    )
    .sort(codeUnitCompare);
}

export interface ConsoleCaptureResult {
  html: string;
  /** Distinct first lines of whatever `console.error` logged, in encounter order. */
  messages: string[];
}

/**
 * Runs `render`, replacing `console.error` with a collector for the
 * duration (restored in `finally`, even if `render` throws — the exception
 * still propagates to the caller), and returns the distinct first lines of
 * whatever it logged. React reports a prop-type mismatch or an unrecognised
 * DOM attribute this way rather than throwing, so a `defaultProps` value
 * that passes validation but that MUI does not actually consume would
 * otherwise render silently, leaking into the DOM without ever showing up
 * as a diagnostic.
 */
export function captureConsoleErrors(
  render: () => string,
): ConsoleCaptureResult {
  // eslint-disable-next-line no-console -- intentionally swapping the sink, not logging
  const original = console.error;
  const lines: string[] = [];
  // eslint-disable-next-line no-console -- collector, replaces the real console.error for the duration
  console.error = (...args: unknown[]) => {
    const text = typeof args[0] === 'string' ? args[0] : String(args[0]);
    lines.push(text.split('\n')[0]);
  };
  try {
    return { html: render(), messages: [...new Set(lines)] };
  } finally {
    // eslint-disable-next-line no-console -- restoring the real console.error
    console.error = original;
  }
}

/**
 * Reports an Emotion-classed element that is neither the root nor a mapped
 * slot. The suggested slot key is read only from classes namespaced to this
 * MUI component (`Mui<Component>-`); an element bearing only another
 * component's classes (a ripple's `MuiTouchRipple-root`) cannot be mapped
 * at all, so no key is suggested for it.
 */
function reportUnmappedElement(
  name: string,
  muiComponent: string,
  el: DomElement,
  at: SourceLocation,
  diag: DiagSink,
): void {
  const muiClasses = el.classes.filter((c) => /^Mui[A-Z]/.test(c));
  const prefix = `Mui${muiComponent}-`;
  const ownKey = muiClasses
    .filter((c) => c.startsWith(prefix))
    .map((c) => c.slice(prefix.length))
    .find((k) => k !== '' && k !== 'root');
  const message = ownKey
    ? `mui: ${name}: ${muiComponent} renders an element <${el.tag} class="${muiClasses.join(' ')}"> that no slot maps; add a slot mapped to "${ownKey}" or exclude the component`
    : `mui: ${name}: ${muiComponent} renders an element <${el.tag} class="${muiClasses.join(' ')}"> that belongs to another MUI component (${muiClasses.join(', ')}) and cannot be mapped`;
  diag.add('DS-E086', message, at);
}

/**
 * Turns the `<style data-emotion>` tags in rendered markup into catalog
 * rules relative to the root (`&`) and the mapped slots (`& .<MuiSlotClass>`).
 * `prefixes` maps an Emotion class to the selector prefix it stands for
 * (the root: `&`; a mapped slot: `& .<class>`). `ownUnmappedClasses` is the
 * set of the component's own utility classes that no slot maps (Chip's
 * `avatar`, `deleteIcon`): the root's own style tag sometimes nests a
 * selector that names one of those classes directly (`.<rootEmotion>
 * .MuiChip-avatar`), which would otherwise pass the prefix lookup (the
 * leading compound is still the root) and produce an unreachable
 * `& .MuiChip-avatar` rule, since no mapped slot ever renders that element;
 * such rules are dropped. Pure and exported so it can be unit-tested
 * without MUI.
 */
export function rulesFromMarkup(
  html: string,
  prefixes: ReadonlyMap<string, string>,
  ownUnmappedClasses: ReadonlySet<string>,
  name: string,
  component: string,
  at: SourceLocation,
  diag: DiagSink,
): MuiCatalogRule[] {
  const merged = new Map<string, MuiCatalogRule>();
  // A slot's own `<style>` tag and a nested selector for that same slot
  // inside the root's `<style>` tag both resolve to the same selector key
  // (`& .MuiButton-startIcon`) and collapse onto one rule here, later
  // declarations winning, in the order the style tags appear in the markup.
  const add = (media: string | null, selector: string, rule: CssRule): void => {
    const id = `${media ?? ''}|${selector}`;
    const entry = merged.get(id) ?? { media, selector, declarations: {} };
    rule.each((node) => {
      if (node.type === 'decl') {
        entry.declarations[node.prop] = node.value;
      }
    });
    merged.set(id, entry);
  };
  const handleRule = (rule: CssRule, media: string | null): void => {
    for (const raw of rule.selectors) {
      const m = /^\.([^\s.:[>+~]+)([\s\S]*)$/.exec(raw.trim());
      const prefix = m ? prefixes.get(m[1]) : undefined;
      if (!m || prefix === undefined) {
        // An intermediate Emotion class no element carries, or a selector
        // that does not start with an element we know: not applied.
        continue;
      }
      const descendant = /^\s+\.([^\s.:[>+~]+)/.exec(m[2]);
      if (descendant && ownUnmappedClasses.has(descendant[1])) {
        continue;
      }
      const rest = m[2].replaceAll(`.${m[1]}`, '&');
      add(media, `${prefix}${rest}`, rule);
    }
  };
  for (const styleTag of html.matchAll(STYLE_TAG)) {
    if (styleTag[1].startsWith(`${CACHE_KEY}-global`)) {
      continue;
    }
    const sheet = postcss.parse(styleTag[2]);
    sheet.each((node) => {
      if (node.type === 'rule') {
        handleRule(node, null);
      } else if (node.type === 'atrule' && node.name === 'media') {
        (node as AtRule).each((child) => {
          if (child.type === 'rule') {
            handleRule(child, node.params);
          } else if (child.type === 'atrule') {
            diag.add(
              'DS-E086',
              `mui: ${name}: ${component} emits @${child.name} nested in @media, which the catalog cannot represent`,
              at,
            );
          }
        });
      } else if (node.type === 'atrule') {
        diag.add(
          'DS-E086',
          `mui: ${name}: ${component} emits @${node.name}, which the catalog cannot represent`,
          at,
        );
      }
    });
  }
  return [...merged.values()];
}

/**
 * Renders `loaded.Component` bare (no explicit props) under a theme whose
 * only `defaultProps` are `defaultProps`, to learn two facts MUI's types do
 * not reliably state: the actual DOM tag of the root (Typography's types
 * default to `span`, but it renders `<p>` for `variant="body1"`), and
 * whether that root is a `ButtonBase` (relevant for parity ripple props on
 * a component, like a clickable Chip, that does not declare them itself).
 * `defaultProps` therefore must already include whichever manifest default
 * (`clickable: true`) makes that true for this mapping — these facts
 * belong to the mapping, not to the MUI component in the abstract.
 */
function probeComponent(
  runtime: Runtime,
  loaded: LoadedComponent,
  themeKey: string,
  defaultProps: Record<string, MuiScalar>,
  name: string,
  muiComponent: string,
  at: SourceLocation,
  diag: DiagSink,
): MuiProbeFacts | null {
  const { React } = runtime;
  let html: string;
  let consoleMessages: string[];
  try {
    const theme = runtime.createTheme({
      cssVariables: true,
      components: { [themeKey]: { defaultProps } },
    });
    const cache = runtime.createCache({ key: CACHE_KEY });
    const captured = captureConsoleErrors(() =>
      runtime.renderToStaticMarkup(
        React.createElement(
          runtime.CacheProvider,
          { value: cache },
          React.createElement(
            runtime.ThemeProvider,
            { theme },
            React.createElement(loaded.Component, null),
          ),
        ),
      ),
    );
    html = captured.html;
    consoleMessages = captured.messages;
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: ${name}: ${muiComponent} threw while rendering: ${(err as Error).message}`,
      at,
    );
    return null;
  }
  for (const msg of consoleMessages) {
    diag.add(
      'DS-E086',
      `mui: ${name}: React reported while rendering ${muiComponent}: ${msg}`,
      at,
    );
  }
  const root = elementsOf(html).find((el) =>
    el.classes.includes(loaded.classes.root),
  );
  if (!root) {
    diag.add(
      'DS-E086',
      `mui: ${name}: ${muiComponent} rendered no element with class "${loaded.classes.root}"`,
      at,
    );
    return null;
  }
  return {
    rootElement: root.tag,
    buttonBase: root.classes.includes(BUTTON_BASE_ROOT_CLASS),
  };
}

interface Rendered {
  rootTag: string;
  rules: MuiCatalogRule[];
}

/**
 * Renders one permutation and turns MUI's emitted CSS into rules relative
 * to the root (`&`) and the mapped slots (`& .<MuiSlotClass>`). Every
 * element carrying an Emotion class must be the root or a mapped slot.
 */
function renderPermutation(
  runtime: Runtime,
  loaded: LoadedComponent,
  component: ComponentIR,
  plan: MappingPlan,
  permutation: Record<string, string>,
  at: SourceLocation,
  diag: DiagSink,
): Rendered | null {
  const { React } = runtime;
  const props: Record<string, unknown> = {};
  for (const axis of component.axisOrder) {
    props[plan.axisMap[axis]] = permutation[axis];
  }
  for (const [slot, muiKey] of Object.entries(plan.slotMap)) {
    if (plan.children.kind === 'slot' && plan.children.slot === slot) {
      props[muiKey] = 'x';
    } else {
      props[muiKey] = React.createElement('i', { 'data-slot': slot }, 'x');
    }
  }
  const children = plan.children.kind === 'children' ? ['x'] : [];

  let html: string;
  let consoleMessages: string[];
  try {
    const theme = runtime.createTheme({
      cssVariables: true,
      components: { [plan.themeKey]: { defaultProps: plan.defaultProps } },
    });
    const cache = runtime.createCache({ key: CACHE_KEY });
    const captured = captureConsoleErrors(() =>
      runtime.renderToStaticMarkup(
        React.createElement(
          runtime.CacheProvider,
          { value: cache },
          React.createElement(
            runtime.ThemeProvider,
            { theme },
            React.createElement(loaded.Component, props, ...children),
          ),
        ),
      ),
    );
    html = captured.html;
    consoleMessages = captured.messages;
  } catch (err) {
    diag.add(
      'DS-E086',
      `mui: ${component.name}: ${plan.component} threw while rendering: ${(err as Error).message}`,
      at,
    );
    return null;
  }
  for (const msg of consoleMessages) {
    diag.add(
      'DS-E086',
      `mui: ${component.name}: React reported while rendering ${plan.component}: ${msg}`,
      at,
    );
  }

  const elements = elementsOf(html);
  const rootClassName = loaded.classes.root;
  const root = elements.find((el) => el.classes.includes(rootClassName));
  if (!root) {
    diag.add(
      'DS-E086',
      `mui: ${component.name}: ${plan.component} rendered no element with class "${rootClassName}"`,
      at,
    );
    return null;
  }
  const rootEmotion = emotionClassOf(root);
  /** Emotion class → selector prefix that stands for it. */
  const prefixes = new Map<string, string>();
  if (rootEmotion) {
    prefixes.set(rootEmotion, '&');
  }
  const accounted = new Set<DomElement>([root]);
  for (const [slot, muiClass] of Object.entries(plan.slotClasses)) {
    const el = elements.find((e) => e !== root && e.classes.includes(muiClass));
    if (!el) {
      diag.add(
        'DS-E086',
        `mui: ${component.name}: ${plan.component} rendered no element with class "${muiClass}" for slot "${slot}"`,
        at,
      );
      continue;
    }
    accounted.add(el);
    const emotion = emotionClassOf(el);
    if (emotion) {
      prefixes.set(emotion, `& .${muiClass}`);
    }
  }
  for (const el of elements) {
    if (accounted.has(el) || emotionClassOf(el) === null) {
      continue;
    }
    reportUnmappedElement(component.name, plan.component, el, at, diag);
  }

  const mappedSlotClasses = new Set(Object.values(plan.slotClasses));
  const ownUnmappedClasses = new Set(
    Object.keys(loaded.classes)
      .filter((key) => key !== 'root')
      .map((key) => loaded.classes[key])
      .filter((cls) => !mappedSlotClasses.has(cls)),
  );
  const rules = rulesFromMarkup(
    html,
    prefixes,
    ownUnmappedClasses,
    component.name,
    plan.component,
    at,
    diag,
  );
  return { rootTag: root.tag, rules };
}

/**
 * Renders every mapped component in every axis permutation with the
 * target package's own React, Emotion, and MUI, and records what MUI
 * styled. Returns the catalog file for `<rootDir>/catalogs/mui.json`, or
 * null after reporting DS-E086.
 */
export async function captureMuiDefaults(
  ir: DesignIR,
  ctx: PluginContext,
  diag: Diagnostics,
): Promise<CapturedCatalog | null> {
  const before = diag.errors.length;
  const runtime = loadRuntime(ctx.outDir, diag);
  if (!runtime) {
    return null;
  }
  const frameworkComponents: Record<string, MuiFrameworkComponent> = {};
  const components: Record<string, MuiCatalogComponent> = {};
  for (const name of Object.keys(ir.components).sort(codeUnitCompare)) {
    const component = ir.components[name];
    const hints = muiMapping(component);
    if (!hints) {
      continue;
    }
    const at = manifestLocation(component);
    // Loaded and extracted are two independent failure modes over the same
    // component: reported once each, never both for the same cause (a
    // component that fails to load never gets a second "cannot find an
    // interface" diagnostic on top of the load failure).
    const loaded = loadComponent(runtime, hints.component, at, diag);
    if (!loaded) {
      continue;
    }
    const extracted = extractMuiProps(runtime.muiDir, hints.component);
    if (!extracted) {
      diag.add(
        'DS-E086',
        `mui: ${name}: cannot find an interface ${hints.component}OwnProps or ${hints.component}Props in ${runtime.muiDir}/${hints.component}/${hints.component}.d.ts`,
        at,
      );
      continue;
    }

    // Structural and rendering issues (a missing root, an element no slot
    // maps, a React console.error, a root that varies with props) do not
    // depend on the axis values, so re-rendering every permutation would
    // otherwise repeat the same diagnostic; report each one once per
    // design-system component.
    const seen = new Set<string>();
    const sink = dedupingSink(diag, seen);

    for (const prop of unresolvedUnionProps(extracted.props)) {
      sink.add(
        'DS-E086',
        `mui: ${name}: the members of ${hints.component}.${prop} could not be read from its types, so MUI's defaults for it cannot be disabled`,
        at,
      );
    }

    let framework = frameworkComponents[hints.component];
    if (!framework) {
      framework = {
        themeKey: muiThemeKeyFor(hints.component),
        classes: loaded.classes,
        props: extracted.props,
      };
      frameworkComponents[hints.component] = framework;
    }

    // The probe's facts (root element, whether the root is a ButtonBase)
    // depend on this mapping's own defaultProps (a clickable Chip's
    // `clickable: true`), so they are computed per design-system
    // component, never cached on `framework`. The parity props declared
    // for this render are only the ones the MUI component's own types
    // already list, plus the manifest's own defaultProps — never the
    // buttonBase-widened set, which depends on this very probe's result.
    const declaredParity: Record<string, MuiScalar> = {};
    for (const [key, value] of Object.entries(PARITY_DEFAULT_PROPS)) {
      if (Object.hasOwn(extracted.props, key)) {
        declaredParity[key] = value;
      }
    }
    const probe = probeComponent(
      runtime,
      loaded,
      framework.themeKey,
      { ...declaredParity, ...hints.defaultProps },
      name,
      hints.component,
      at,
      sink,
    );
    if (!probe) {
      continue;
    }

    const plan = planMapping(component, hints, framework, probe, diag);
    if (!plan) {
      continue;
    }
    const renders: MuiCatalogRender[] = [];
    const permutationRootTags: string[] = [];
    for (const permutation of axisPermutations(component)) {
      const rendered = renderPermutation(
        runtime,
        loaded,
        component,
        plan,
        permutation,
        at,
        sink,
      );
      if (!rendered) {
        continue;
      }
      if (!permutationRootTags.includes(rendered.rootTag)) {
        permutationRootTags.push(rendered.rootTag);
      }
      renders.push({ axes: permutation, rules: rendered.rules });
    }
    if (new Set([probe.rootElement, ...permutationRootTags]).size > 1) {
      sink.add(
        'DS-E086',
        `mui: ${name}: ${hints.component} renders different root elements depending on its props (without axis props: ${probe.rootElement}; with axis values: ${permutationRootTags.join(', ')}); it cannot be mapped`,
        at,
      );
    }
    components[name] = {
      component: hints.component,
      axisMap: plan.axisMap,
      slotMap: plan.slotMap,
      defaultProps: plan.defaultProps,
      rootElement: probe.rootElement,
      buttonBase: probe.buttonBase,
      renders,
    };
  }
  if (diag.errors.length > before) {
    return null;
  }
  const catalog: MuiCatalog = {
    generated: catalogHeaderText(ctx.compilerVersion, runtime.version),
    framework: { name: MUI_PACKAGE, version: runtime.version },
    frameworkComponents,
    components,
  };
  return {
    path: catalogPathFor(ctx.rootDir),
    contents: `${stableStringify(catalog)}\n`,
  };
}
