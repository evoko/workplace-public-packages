/**
 * `solar:explain --propose` (src/explain/propose.mjs): each rule it proposes, pasted into the
 * component's overlay with a reason written, builds, and decides the finding it was proposed for.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse, stringify } from 'yaml';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  loadDefaults,
  overlayDir,
  overlayFileOf,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { buildOracle } from '../src/verify/oracle.mjs';
import { proposeRule } from '../src/explain/propose.mjs';

const contract = loadContract();
const names = tokenNames(contract);
const tokens = buildTokenSpec(contract).spec;
const catalog = loadWebCatalog();
const defaults = loadDefaults();

/** The component's overlay as written, changed by `change` (a section's rules removed). */
const overlayText = (component, change = () => {}) => {
  const doc = parse(
    readFileSync(join(overlayDir, overlayFileOf(component)), 'utf8'),
  );
  change(doc);
  return doc;
};

/** Everything the proposer reads, built from an overlay document. */
function build(component, doc) {
  const overlay = parseOverlay(stringify(doc), 'test.yaml');
  const loaded = loadComponent(catalog, component);
  const { spec, deviations } = buildComponentSpec(loaded, {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
  const oracle = buildOracle(loaded.set, spec, deviations, {
    tokens,
    names,
    overlay,
    fileVersion: catalog.fileVersion,
  });
  return { spec, deviations, oracle, tokens, overlay };
}

/** The proposal pasted: its uncommented rules merged into the overlay, each reason written. */
function paste(doc, proposal) {
  const rules = parse(proposal) ?? {};
  for (const [section, entries] of Object.entries(rules))
    for (const [at, rule] of Object.entries(entries)) {
      expect(rule.reason).toMatch(/^TODO\(reason\)/);
      (doc[section] ??= {})[at] = { ...rule, reason: 'Decided in a test.' };
    }
  return doc;
}

const decided = (ctx, token) =>
  ctx.deviations.find((d) => d.token === token)?.decision?.rule;

describe('solar:explain --propose', () => {
  it('proposes follows for a pattern of variants, which decides both findings', () => {
    const doc = overlayText('Button');
    const ctx = build('Button', doc);
    const proposal = proposeRule(ctx, { layer: 'root', cell: 'background' });
    expect(proposal).toMatch(
      /^follows:\n {2}root\.background:\n {4}axes: \[size, prio, state, danger\]/m,
    );
    const after = build('Button', paste(doc, proposal));
    for (const at of ['lg', 'sm'])
      expect(
        after.deviations.some(
          (d) =>
            d.token === `component.button.root.background@size=${at}` &&
            !d.decision,
        ),
      ).toBe(false);
  });

  it('proposes accept for a difference no variant draws, which decides it', () => {
    const doc = overlayText('Button');
    const ctx = build('Button', doc);
    const proposal = proposeRule(ctx, { layer: 'label', cell: 'color' });
    expect(proposal).toContain('what they draw does not');
    const after = build('Button', paste(doc, proposal));
    expect(decided(after, 'component.button.label.color@size=lg')).toBe(
      'accept',
    );
  });

  it('proposes bind where a token has the value, which round-trips', () => {
    // Section Nav Item's icon, with its bind removed: 16, which icon.sm is.
    const doc = overlayText('Section Nav Item', (d) => delete d.bind);
    const ctx = build('Section Nav Item', doc);
    const proposal = proposeRule(ctx, { layer: 'icon', cell: 'width' });
    expect(parse(proposal).bind['icon.width']).toMatchObject({
      literal: 16,
      token: 'icon.sm',
    });
    const after = build('Section Nav Item', paste(doc, proposal));
    expect(
      decided(after, 'component.section nav item.icon.width#unbound'),
    ).toBe('bind');
  });

  it('proposes one patterned rule where numbered siblings hold the same finding', () => {
    const doc = overlayText('Date Picker Open', (d) => {
      for (const at of Object.keys(d.set))
        if (/^dayGridDayCell\*/.test(at)) delete d.set[at];
    });
    const ctx = build('Date Picker Open', doc);
    const proposal = proposeRule(ctx, {
      layer: 'dayGridDayCell7',
      cell: 'width',
    });
    expect(Object.keys(parse(proposal).allowLiteral)).toEqual([
      'dayGridDayCell*.width',
    ]);
    const after = build('Date Picker Open', paste(doc, proposal));
    expect(
      after.deviations.filter(
        (d) =>
          /\.daygriddaycell\d*\.width#unbound$/.test(d.token) && !d.decision,
      ),
    ).toEqual([]);
  });

  it('proposes a set at the entry a variant reads, where no finding is open, which round-trips', () => {
    const doc = overlayText('Button');
    const ctx = build('Button', doc);
    const variant = ctx.oracle.variants.find(
      (v) => v.figma === 'size=md, prio=secondary, state=hover, danger=false',
    );
    const proposal = proposeRule(ctx, {
      layer: 'root',
      cell: 'shadow',
      variant,
    });
    const [address] = Object.keys(parse(proposal).set);
    // Figma's spelling, prio, not the code's variant.
    expect(address).toBe('root.base.shadow');
    const pasted = paste(doc, proposal);
    pasted.set[address].token = 'shadow.focus.default';
    expect(build('Button', pasted).spec.style.root.base.shadow).toMatchObject({
      token: 'shadow.focus.default',
      from: 'overlay',
    });
  });

  it('leaves the reason to a person: a pasted placeholder fails the build', () => {
    const doc = overlayText('Button');
    const ctx = build('Button', doc);
    const rules = parse(proposeRule(ctx, { layer: 'label', cell: 'color' }));
    doc.accept = { ...doc.accept, ...rules.accept };
    expect(() => parseOverlay(stringify(doc), 'test.yaml')).toThrow(
      /still the proposer's placeholder/,
    );
  });
});
