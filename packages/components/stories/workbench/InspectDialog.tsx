/**
 * The workbench's Inspect dialog (docs/engineering/workflows.md, Fix a component in the viewer),
 * opened by the bar's Inspect (Bar.tsx): a full-screen layer over the page, drawn with SOLAR's own
 * components, since SOLAR's Dialog has no full-screen form. Its header names the component and
 * holds a Select per variant axis, Report, Close and any error; under it, three columns: the layers
 * as a tree, the variant in view drawn large with the selected layer outlined (preview.tsx; a click
 * on a part selects its layer), and the selected layer's properties ("<layer>: properties"), one
 * whole-row button per cell with its token, its value and where it comes from (a Tag, in the
 * tree's words). A cell chosen opens its editor right under its row ("<layer> · <cell>"): Apply to
 * first (each scope in plain words, how many of the component's variants a change there reaches,
 * the one today's value is set at marked, one a narrower rule decides here disabled), then Filter
 * tokens (starting at the current token's family) and Change to (at most 8 of the tokens it
 * matches, the current one marked, then the keywords and none), and why the cell is what it is.
 * A pending edit shows in a strip along the foot (pending.tsx, as the bar shows it); while one is
 * pending anywhere, or an action runs, only Close, Report and the strip take input, and the dialog
 * says why.
 *
 * It is a modal dialog: named "Inspect <component>", the focus kept inside it, Escape closing it
 * (Escape in an open Select closes that Select alone, MUI's menu stopping it there; in a filter
 * holding text, it clears the filter alone). The names and words its parts carry are the ones the
 * shared scenarios find them by (codegen/src/workbench/bar-scenarios.json, vocabulary.dialog),
 * which Widgetbook's dialog carries too.
 */

import Typography from '@mui/material/Typography';
import { IconClose } from '@bwp-web/assets';
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from '../../src/Button.js';
import { DropdownItem } from '../../src/DropdownItem.js';
import { IconButton } from '../../src/IconButton.js';
import { ListItem } from '../../src/ListItem.js';
import { Scrim } from '../../src/Scrim.js';
import { SearchField } from '../../src/SearchField.js';
import { Select } from '../../src/Select.js';
import { Tag } from '../../src/Tag.js';
import { TreeItem } from '../../src/TreeItem.js';
import type { Cell, Inspection, Origin, Pending, Scope } from './client.js';
import { alert, column, primary, row, secondary } from './pending.js';
import { Preview, type DrawVariant } from './preview.js';

type Layer = Inspection['layers'][number];

/** Where a cell's entry comes from, in the words the tree and the table both use. */
const ORIGIN: Record<Origin, string> = {
  figma: 'Figma',
  rule: 'rule',
  defaults: 'defaults',
};
const ORIGIN_STATUS = {
  figma: 'neutral',
  rule: 'info',
  defaults: 'warning',
} as const;

/** How many tokens Change to lists before it asks for a narrower filter. */
const SHOWN = 8;

/** "variants", or "variant" after the number 1. */
export const variantsAfter = (n: number) => (n === 1 ? 'variant' : 'variants');

/** Why a cell is what it is now, in one line: its origin, and a rule's scope and reason. */
export function whyText(cell: Cell) {
  const reason = cell.reason ? `: ${cell.reason}` : '';
  if (cell.origin === 'figma') return `Figma draws ${cell.entry}`;
  if (cell.origin === 'defaults')
    return `the shared defaults set ${cell.entry}${reason}`;
  const at = cell.scopes.find((s) => s.current)?.label ?? cell.at;
  return `a rule at ${at} sets ${cell.entry}${reason}`;
}

/** An Apply to option's words: the scope, how far it reaches, today's, or what decides here. */
export const scopeText = (s: Scope, total: number) =>
  `${s.label}: changes ${s.count} of ${total} ${variantsAfter(total)}${s.current ? ' (set here now)' : ''}`;

/** The narrowest scope nothing overrides here (the scopes run from every variant to the narrowest). */
const narrowestOf = (scopes: Scope[]) =>
  [...scopes].reverse().find((s) => !s.wins) ?? scopes.at(-1);

/** Whether an entry is a token's name (not none, a keyword, a raw value). */
const isToken = (entry: string) => /^[a-z][\w-]*(\.[\w-]+)+$/.test(entry);

/** The current token's family: its name less the last segment; empty for none, a keyword, a raw value. */
export const familyOf = (entry: string) =>
  isToken(entry) ? entry.split('.').slice(0, -1).join('.') : '';

/** The tokens a filter matches: by name or value, ignoring case. */
export const matching = (choices: Cell['choices'], filter: string) => {
  const f = filter.toLowerCase();
  return choices.filter(
    (c) =>
      c.name.toLowerCase().includes(f) || c.value.toLowerCase().includes(f),
  );
};

/**
 * Where Filter tokens starts: the current token's family where it matches a token the cell may
 * take, else nothing (a label's `color.action.primary.text` offers only `color.text.*`), as
 * Widgetbook's dialog starts it.
 */
export const startOf = (cell: Cell) => {
  const family = familyOf(cell.entry);
  return matching(cell.choices, family).length ? family : '';
};

/** A token's name, breakable after each dot (`color.` `border.` `medium`), never within a word. */
function Breakable({ text }: { text: string }) {
  const parts = text.split('.');
  return (
    <>
      {parts.map((part, i) => (
        // The parts of one name, in order: the position is their identity.
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <>
              .<wbr />
            </>
          )}
        </span>
      ))}
    </>
  );
}

/** Whether a value reads as a colour, for a swatch. */
const isColour = (value: string) => /^(#|rgba?\()/.test(value);

/** A token's CSS variable: `color.text.primary` → `--solar-color-text-primary`. */
const tokenVar = (token: string) => `var(--solar-${token.replace(/\./g, '-')})`;

/** A colour token's swatch, in the mode showing; nothing for any other value. */
function Swatch({ token, value }: { token: string; value: string }) {
  if (!isColour(value) || !isToken(token)) return null;
  return (
    <span aria-hidden style={{ ...swatch, background: tokenVar(token) }} />
  );
}

/** The layers in tree order, each with its depth: every layer under its parent, in the given order. */
function treeOf(layers: Layer[]) {
  const names = new Set(layers.map((l) => l.name));
  const children = new Map<string | null, Layer[]>();
  for (const l of layers) {
    const parent = l.parent && names.has(l.parent) ? l.parent : null;
    children.set(parent, [...(children.get(parent) ?? []), l]);
  }
  const out: { layer: Layer; depth: number }[] = [];
  const walk = (parent: string | null, depth: number) => {
    for (const l of children.get(parent) ?? []) {
      out.push({ layer: l, depth });
      walk(l.name, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** The elements Tab reaches in `root`, in order: enabled, shown, and outside the inert preview. */
function tabbable(root: HTMLElement) {
  return [
    ...root.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]',
    ),
  ].filter(
    (el) =>
      el.tabIndex >= 0 &&
      !(el as HTMLButtonElement).disabled &&
      !el.closest('[inert], [aria-hidden="true"]') &&
      el.getClientRects().length > 0,
  );
}

/**
 * The strip's first line: "<layer> · <cell>, for <scope> (<count> variants): <was> → <new>", the
 * scope the inspection's with the pending key; the key itself where the inspection has none.
 */
export function pendingSummary(pending: Pending, inspection: Inspection) {
  const layer = pending.key.split('.')[0];
  const cell = pending.key.split('.').at(-1);
  const scope = inspection.layers
    .flatMap((l) => l.cells)
    .flatMap((c) => c.scopes)
    .find((s) => s.key === pending.key);
  const where = scope
    ? `for ${scope.label} (${scope.count} ${variantsAfter(scope.count)})`
    : `at ${pending.key}`;
  const now = pending.deletes
    ? "Figma's value (the rule is removed)"
    : 'token' in pending.value
      ? pending.value.token
      : 'keyword' in pending.value
        ? pending.value.keyword
        : 'none';
  const was = !pending.deletes && pending.was ? `${pending.was} → ` : '';
  return `${layer} · ${cell}, ${where}: ${was}${now}`;
}

export function InspectDialog({
  component,
  inspection,
  layer,
  editable,
  working,
  busy,
  pending,
  otherPending,
  error,
  notice,
  strip,
  drawVariant,
  onLayer,
  onVariant,
  onSet,
  onReport,
  onClose,
}: {
  component: string;
  inspection: Inspection;
  /** The layer selected (the bar's, which a Report names). */
  layer: string;
  /** No edit is pending anywhere and no action runs: the dialog takes input. */
  editable: boolean;
  /** An action of this viewer's is running (the preview regenerates). */
  working: boolean;
  /** What the service is doing, where it is at work. */
  busy: string | null;
  /** This component's pending edit, which the strip shows. */
  pending: Pending | null;
  /** The component another pending edit is on, which leaves this one read-only. */
  otherPending: string | null;
  error: string | null;
  /** What the last action saved, where it saved something. */
  notice: ReactNode;
  /** The pending edit's strip (pending.tsx), where this component has one. */
  strip: ReactNode;
  drawVariant: DrawVariant;
  onLayer: (layer: string) => void;
  /** Reads the variant of this index. */
  onVariant: (index: number) => void;
  /** Change to: the cell, the scope's key and the value chosen (a token, a keyword or `none`). */
  onSet: (cell: string, scope: string, choice: string) => void;
  onReport: () => void;
  onClose: () => void;
}) {
  const title = useId();
  const panel = useRef<HTMLDivElement>(null);
  const layerRoot = useRef<HTMLDivElement>(null);
  // The cell chosen, of the layer it was chosen in.
  const [chosen, setChosen] = useState<{ layer: string; cell: string } | null>(
    null,
  );
  // The Apply to chosen (null: the narrowest) and the filter's text (null: the token's family).
  // Both start again on another variant, layer or cell, when the dialog closes (it unmounts), and
  // after an edit.
  const [scope, setScope] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  if (pending && (scope !== null || filter !== null)) {
    setScope(null);
    setFilter(null);
  }

  // The focus moves in as it opens, and back to where it was as it closes; it stays inside.
  useLayoutEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const keep = (event: FocusEvent) => {
      const root = layerRoot.current;
      if (root && event.target instanceof Node && !root.contains(event.target))
        panel.current?.focus();
    };
    document.addEventListener('focusin', keep);
    return () => {
      document.removeEventListener('focusin', keep);
      if (before?.isConnected) before.focus();
    };
  }, []);

  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || !panel.current) return;
    const all = tabbable(panel.current);
    const active = document.activeElement;
    if (!all.length) {
      event.preventDefault();
      return;
    }
    const first = all[0];
    const last = all[all.length - 1];
    if (event.shiftKey && (active === first || active === panel.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const shown =
    inspection.layers.find((l) => l.name === layer) ??
    inspection.layers.find((l) => l.name === 'root') ??
    inspection.layers[0];
  const cell =
    chosen && chosen.layer === shown?.name
      ? (shown.cells.find((c) => c.cell === chosen.cell) ?? null)
      : null;
  const parts =
    inspection.variants.find((v) => v.index === inspection.variant)?.parts ??
    {};
  /** The drawn variant with `value` on `axis` and the other axes as they are, if any. */
  const pairing = (axis: string, value: string) =>
    inspection.variants.find((v) =>
      inspection.axes.every((a) =>
        a.name === axis
          ? v.parts[a.name] === value
          : v.parts[a.name] === parts[a.name],
      ),
    );

  const restart = () => {
    setScope(null);
    setFilter(null);
  };
  const chooseLayer = (name: string) => {
    setChosen(null);
    restart();
    onLayer(name);
  };
  const chooseCell = (name: string) => {
    if (shown) setChosen({ layer: shown.name, cell: name });
    restart();
  };
  const chooseAxis = (axis: string, value: string) => {
    const found = pairing(axis, value);
    if (!found || found.index === inspection.variant) return;
    restart();
    onVariant(found.index);
  };

  /** Arrow keys across the tree's rows. */
  const treeKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="treeitem"]'),
    ];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const next = items[at + (event.key === 'ArrowDown' ? 1 : -1)];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  const disabled = !editable;
  const readOnly = pending
    ? 'One edit at a time: Keep or Undo the pending edit below first.'
    : otherPending
      ? `One edit at a time: Keep or Undo the pending edit in ${otherPending}'s Playground first.`
      : null;
  const dialog = (
    <div ref={layerRoot} style={layerStyle}>
      <Scrim />
      {/* The dialog's keys: Escape closes it, and Tab keeps the focus inside (a modal's own). */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title}
        tabIndex={-1}
        style={panelStyle}
        onKeyDown={keys}
      >
        <div style={header}>
          <Typography
            id={title}
            variant="titleSm"
            component="h2"
            style={primary}
          >
            Inspect {component}
          </Typography>
          {busy && (
            <Typography
              variant="bodyXsRegular"
              aria-live="polite"
              style={secondary}
            >
              {busy}
            </Typography>
          )}
          <div style={{ ...row, flex: 1 }}>
            {inspection.axes.map((axis) => (
              <Select
                key={axis.name}
                size="sm"
                label={axis.name}
                value={parts[axis.name] ?? ''}
                disabled={disabled}
                onChange={(_, v) => chooseAxis(axis.name, v)}
              >
                {axis.values.map((value) => (
                  <DropdownItem
                    key={value}
                    value={value}
                    disabled={!pairing(axis.name, value)}
                  >
                    {value}
                  </DropdownItem>
                ))}
              </Select>
            ))}
          </div>
          <Button size="sm" prio="tertiary" onClick={onReport}>
            Report
          </Button>
          <IconButton
            size="sm"
            prio="tertiary"
            aria-label="Close"
            icon={<IconClose />}
            onClick={onClose}
          />
          {error && (
            <Typography
              variant="bodyXsRegular"
              role="alert"
              style={{ ...alert, flexBasis: '100%' }}
            >
              {error}
            </Typography>
          )}
        </div>

        {readOnly && (
          <Typography variant="bodyXsRegular" style={secondary}>
            {readOnly}
          </Typography>
        )}

        <div style={columns}>
          <div
            role="tree"
            aria-label="Layers"
            tabIndex={-1}
            style={scroll}
            onKeyDown={treeKeys}
          >
            {treeOf(inspection.layers).map(({ layer: l, depth }) => {
              const rule = l.cells.some((c) => c.origin === 'rule');
              const marks = [
                ...(l.hidden ? ['hidden here'] : []),
                ...(rule ? [ORIGIN.rule] : []),
              ];
              return (
                <TreeItem
                  key={l.name}
                  aria-label={[l.name, ...marks].join(' ')}
                  aria-disabled={disabled || undefined}
                  label={
                    <span style={l.hidden ? secondary : undefined}>
                      {l.name}
                      {l.hidden ? ' · hidden here' : ''}
                    </span>
                  }
                  tag={
                    rule ? (
                      <Tag status={ORIGIN_STATUS.rule}>{ORIGIN.rule}</Tag>
                    ) : undefined
                  }
                  depth={depth}
                  expandable={false}
                  selected={l.name === shown?.name}
                  onSelect={disabled ? undefined : () => chooseLayer(l.name)}
                />
              );
            })}
          </div>

          <Preview
            inspection={inspection}
            layer={shown?.name ?? 'root'}
            drawVariant={drawVariant}
            regenerating={working || Boolean(busy)}
            onPoint={disabled ? undefined : chooseLayer}
          />

          <div style={{ ...scroll, ...column }}>
            <Typography variant="labelSm" component="h3" style={primary}>
              {shown?.name}: properties
            </Typography>
            <div role="table" aria-label="Properties" style={table}>
              <div role="row" style={headRow}>
                {['Cell', 'Token', 'Value', 'From'].map((h) => (
                  <Typography
                    key={h}
                    role="columnheader"
                    variant="labelSm"
                    data-column={h}
                    style={secondary}
                  >
                    {h}
                  </Typography>
                ))}
              </div>
              {(shown?.cells ?? []).map((c) => {
                const origin = ORIGIN[c.origin];
                const open = c.cell === cell?.cell;
                return (
                  <div key={c.cell} role="rowgroup" style={spanning}>
                    <div role="row" style={spanning}>
                      <div role="cell" style={spanning}>
                        <ListItem
                          selected={open}
                          disabled={disabled}
                          aria-label={`${c.cell} ${c.entry} ${c.value} ${origin}`}
                          aria-expanded={open}
                          onClick={() => chooseCell(c.cell)}
                          sx={rowButton}
                        >
                          <span style={spanning}>
                            <span data-column="Cell" style={cellName}>
                              {c.cell}
                            </span>
                            <span
                              data-column="Token"
                              style={{ ...wrapping, ...secondary }}
                            >
                              <Breakable text={c.entry} />
                            </span>
                            <span data-column="Value" style={valueCell}>
                              <Swatch token={c.entry} value={c.value} />
                              <span style={wrapping}>{c.value}</span>
                            </span>
                            <span data-column="From" style={fromCell}>
                              <Tag status={ORIGIN_STATUS[c.origin]}>
                                {origin}
                              </Tag>
                            </span>
                          </span>
                        </ListItem>
                      </div>
                    </div>
                    {open && cell && shown && (
                      <div role="row" style={spanning}>
                        <div role="cell" style={wholeRow}>
                          <Editor
                            layer={shown.name}
                            cell={cell}
                            scope={scope}
                            filter={filter}
                            disabled={disabled}
                            onScope={setScope}
                            onFilter={setFilter}
                            onSet={(key, choice) =>
                              onSet(cell.cell, key, choice)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {strip && (
          <div role="region" aria-label="Pending edit" style={stripStyle}>
            {strip}
          </div>
        )}
        {notice}
      </div>
    </div>
  );
  return createPortal(dialog, document.body);
}

/**
 * The chosen cell's editor, titled "<layer> · <cell>": Apply to, Filter tokens and Change to where
 * it offers a token, a keyword or none and a scope to key a rule on; else why it offers nothing (a
 * raw value the overlay allows, or nothing to choose: Report). Under them, why the cell is what it
 * is now.
 */
function Editor({
  layer,
  cell,
  scope,
  filter,
  disabled,
  onScope,
  onFilter,
  onSet,
}: {
  layer: string;
  cell: Cell;
  /** The Apply to chosen, or null for the narrowest. */
  scope: string | null;
  /** The filter's text, or null for the current token's family. */
  filter: string | null;
  disabled: boolean;
  onScope: (key: string) => void;
  onFilter: (text: string) => void;
  onSet: (scope: string, choice: string) => void;
}) {
  const applyTo =
    cell.scopes.find((s) => s.key === scope && !s.wins) ??
    narrowestOf(cell.scopes);
  const offers =
    cell.choices.length > 0 || cell.keywords.length > 0 || cell.none;
  const why = (
    <Typography variant="bodySmRegular" style={secondary}>
      {whyText(cell)}
    </Typography>
  );
  const heading = (
    <Typography variant="labelSm" style={primary}>
      {layer} · {cell.cell}
    </Typography>
  );
  const group = (children: ReactNode) => (
    <div role="group" aria-label={`${layer} · ${cell.cell}`} style={editor}>
      {heading}
      {children}
      {why}
    </div>
  );
  if (cell.note)
    return group(
      <Typography variant="bodySmRegular" style={secondary}>
        {cell.cell}: {cell.entry} ({cell.note})
      </Typography>,
    );
  if (!offers || !applyTo)
    return group(
      <Typography variant="bodySmRegular" style={secondary}>
        {cell.cell}: {cell.entry}. Nothing to change it to here: use Report.
      </Typography>,
    );
  const text = filter ?? startOf(cell);
  const matched = matching(cell.choices, text);
  const listed = matched.slice(0, SHOWN);
  const more = matched.length - listed.length;
  return group(
    <>
      <Select
        size="sm"
        label="Apply to"
        value={applyTo.key}
        disabled={disabled}
        onChange={(_, v) => onScope(v)}
      >
        {cell.scopes.map((s) => (
          <DropdownItem
            key={s.key}
            value={s.key}
            disabled={Boolean(s.wins)}
            helper={
              s.wins
                ? `a narrower rule (${s.winsLabel ?? s.wins}) decides this variant`
                : undefined
            }
          >
            {scopeText(s, cell.total)}
          </DropdownItem>
        ))}
      </Select>
      <SearchField
        size="sm"
        value={text}
        disabled={disabled}
        placeholder="Filter by name or value"
        inputProps={{ 'aria-label': 'Filter tokens' }}
        onChange={(event) => onFilter(event.target.value)}
        onKeyDown={(event) => {
          // Escape clears a filter holding text, and leaves the dialog open.
          if (event.key === 'Escape' && text) {
            event.preventDefault();
            event.stopPropagation();
            onFilter('');
          }
        }}
      />
      <Select
        size="sm"
        label="Change to"
        value=""
        placeholder="Choose a value"
        helper={
          matched.length
            ? `${matched.length} of ${cell.choices.length}`
            : 'No token matches'
        }
        disabled={disabled || matched.length === 0}
        onChange={(_, v) => onSet(applyTo.key, v)}
      >
        {[
          ...listed.map((c) => (
            <DropdownItem
              key={c.name}
              value={c.name}
              helper={c.name === cell.entry ? `${c.value} · current` : c.value}
              icon={
                isColour(c.value) ? (
                  <Swatch token={c.name} value={c.value} />
                ) : undefined
              }
            >
              {c.name}
            </DropdownItem>
          )),
          ...(more > 0
            ? [
                <DropdownItem key="…more" value="…more" disabled>
                  {`…and ${more} more: filter to narrow`}
                </DropdownItem>,
              ]
            : []),
          ...cell.keywords.map((k) => (
            <DropdownItem key={k} value={k}>
              {k}
            </DropdownItem>
          )),
          ...(cell.none
            ? [
                <DropdownItem key="none" value="none">
                  none
                </DropdownItem>,
              ]
            : []),
        ]}
      </Select>
    </>,
  );
}

const layerStyle = {
  position: 'fixed' as const,
  inset: 0,
  zIndex: 'var(--solar-z-dialog)',
};
const panelStyle = {
  position: 'absolute' as const,
  inset: 'var(--solar-inset-md)',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-md)',
  padding: 'var(--solar-inset-lg)',
  background: 'var(--solar-color-surface-dialog)',
  borderRadius: 'var(--solar-radius-dialog)',
  boxShadow: 'var(--solar-shadow-dialog)',
  overflow: 'auto',
  outline: 'none',
};
const header = {
  ...row,
  flexWrap: 'wrap' as const,
  gap: 'var(--solar-inset-sm)',
};
const columns = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr) minmax(0, 2fr)',
  gap: 'var(--solar-inset-md)',
  flex: 1,
  minHeight: 0,
};
const scroll = { overflow: 'auto', minHeight: 0 };
/**
 * The Properties table: one grid whose four column tracks every row shares (a subgrid at each level
 * down to the row button's words), so a row's Token, Value and From sit under their headings. The
 * Value track takes what is left, and a value wraps within it.
 */
const table = {
  display: 'grid',
  // The cell's name never breaks, so its track is at least the longest; a token breaks after a
  // dot and a value at a space, never within a word, so theirs are at least their longest part.
  gridTemplateColumns:
    'minmax(max-content, 1fr) minmax(min-content, 1.5fr) minmax(min-content, 2fr) max-content',
  columnGap: 'var(--solar-inset-sm)',
  rowGap: 0,
  alignItems: 'center',
};
/** A level of the table that spans every column and lays its children on the table's tracks. */
const spanning = {
  display: 'grid',
  gridTemplateColumns: 'subgrid',
  gridColumn: '1 / -1',
  columnGap: 'var(--solar-inset-sm)',
  alignItems: 'center',
};
/**
 * The editor's row: across every column, as wide as the rows make them, never widening them (its
 * width is contained, so its long Select values do not size the table's tracks).
 */
const wholeRow = {
  gridColumn: '1 / -1',
  minWidth: 0,
  contain: 'inline-size' as const,
};
const headRow = {
  ...spanning,
  // As the row button's own padding, so the headings sit over its words.
  padding:
    'var(--solar-inset-xs) var(--solar-inset-sm) var(--solar-inset-xs) var(--solar-inset-md)',
  borderBottom:
    'var(--solar-border-default) solid var(--solar-color-border-subtle)',
};
/** The row button, and its body and words, on the table's tracks; its words wrap. */
const rowButton = {
  ...spanning,
  minHeight: 'var(--solar-size-target-min)',
  '& .SolarListItem--body, & .SolarListItem--label': {
    ...spanning,
    whiteSpace: 'normal',
  },
};
/** Words that wrap at a space (or a token's dot, marked), never within a word. */
const wrapping = {
  overflowWrap: 'normal' as const,
  wordBreak: 'normal' as const,
};
const cellName = { ...primary, whiteSpace: 'nowrap' as const };
const valueCell = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--solar-inset-xs)',
  minWidth: 0,
};
const fromCell = { display: 'flex', justifySelf: 'start' as const };
const swatch = {
  display: 'inline-block',
  flex: 'none',
  width: 'var(--solar-icon-xs)',
  height: 'var(--solar-icon-xs)',
  borderRadius: 'var(--solar-radius-subtle)',
  border: 'var(--solar-border-default) solid var(--solar-color-border-medium)',
};
const editor = {
  ...column,
  margin: 'var(--solar-inset-xs) 0 var(--solar-inset-sm)',
  padding: 'var(--solar-inset-sm)',
  border: 'var(--solar-border-default) solid var(--solar-color-border-subtle)',
  borderRadius: 'var(--solar-radius-container)',
};
const stripStyle = {
  ...column,
  padding: 'var(--solar-inset-sm)',
  background: 'var(--solar-color-surface-muted)',
  borderRadius: 'var(--solar-radius-container)',
};
