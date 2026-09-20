import {
  diffComputed,
  formatDifferences,
  readComputed,
  type Difference,
} from './compare';
import { getDriver, type Driver } from './driver';
import { applyMode, clearMode, currentMode, nextFrame } from './mode';
import {
  cellId,
  rowKey,
  rowsFor,
  targetsFor,
  type CompareRow,
  type CompareSpec,
  type CompareState,
  type StoriesConfig,
  type TargetId,
} from './spec';

export interface ParityOptions {
  /** Properties left out of the comparison; keep the reason in the story. */
  ignore?: readonly string[];
}

export interface PlayContext {
  canvasElement: HTMLElement;
}

interface CellHandle {
  root: Element;
  /** Slot name to element (null when the cell lacks it). */
  slots: Record<string, Element | null>;
  sentinel: string;
  rootSelector: string;
  target: TargetId;
  /** `component | row | target`, for error messages. */
  where: string;
}

type Snapshot = Record<string, Record<string, string> | null>;

function slotNames(spec: CompareSpec): string[] {
  return [
    ...spec.slots.map((s) => s.name),
    ...(spec.labelSlot ? [spec.labelSlot] : []),
  ];
}

function cell(
  canvas: HTMLElement,
  spec: CompareSpec,
  config: StoriesConfig,
  target: TargetId,
  row: CompareRow,
): CellHandle {
  const id = cellId(target, row);
  const shadow = canvas.querySelector(`[data-parity-cell="${id}"]`)?.shadowRoot;
  if (!shadow) {
    throw new Error(`parity: cell ${id} did not mount`);
  }
  const rootClass =
    target === 'mui' && spec.mui
      ? spec.mui.rootClass
      : `${config.prefix}-${spec.name}`;
  const root = shadow.querySelector(`.${rootClass}`);
  if (!root) {
    throw new Error(
      `parity: cell ${id} has no element with class ${rootClass}`,
    );
  }
  const slots = Object.fromEntries(
    slotNames(spec).map((slot) => [
      slot,
      shadow.querySelector(
        target === 'mui' && spec.mui
          ? `.${spec.mui.slotClasses[slot]}`
          : `.${config.prefix}-${spec.name}__${slot}`,
      ),
    ]),
  );
  return {
    root,
    slots,
    sentinel: `[data-parity-sentinel="${id}"]`,
    rootSelector: `[data-parity-root="${id}"]`,
    target,
    where: `${spec.name} | ${rowKey(row)} | ${target}`,
  };
}

/** Root and slot computed values, keyed by element name (`root` or the slot). */
function snapshot(handle: CellHandle, properties: readonly string[]): Snapshot {
  const out: Snapshot = { root: readComputed(handle.root, properties) };
  for (const [slot, el] of Object.entries(handle.slots)) {
    out[slot] = el ? readComputed(el, properties) : null;
  }
  return out;
}

const PSEUDO: Record<Exclude<CompareState['kind'], 'attribute'>, string> = {
  hover: ':hover',
  active: ':active',
  'focus-visible': ':focus-visible',
};

/**
 * A row that never entered its state would pass vacuously, so the state is
 * confirmed on the element before anything is read.
 *
 * A pseudo-class must match on every cell: the browser, not the target,
 * decides it, so a cell that failed to enter `:hover` is a harness bug. An
 * attribute state is only asserted on the css cell, which the harness builds
 * itself; each other target is free to spell that state its own way (a
 * `Mui-disabled` class, `aria-disabled`, a prop that renders nothing), and
 * whether its rendering matches is what the computed values decide.
 */
function assertInState(handle: CellHandle, state: CompareState): void {
  if (state.kind === 'attribute') {
    if (handle.target !== 'css') {
      return;
    }
    for (const name of Object.keys(state.attributes)) {
      if (!handle.root.hasAttribute(name)) {
        throw new Error(
          `parity: ${handle.where} | ${state.name}: root is missing the ${name} attribute`,
        );
      }
    }
    return;
  }
  const pseudo = PSEUDO[state.kind];
  if (!handle.root.matches(pseudo)) {
    throw new Error(
      `parity: ${handle.where} | ${state.name}: root does not match ${pseudo}`,
    );
  }
}

async function enter(
  driver: Driver,
  state: CompareState,
  handle: CellHandle,
): Promise<void> {
  if (state.kind === 'hover') {
    await driver.hover(handle.rootSelector);
  } else if (state.kind === 'active') {
    await driver.mouseDown(handle.rootSelector);
  } else if (state.kind === 'focus-visible') {
    await driver.focusFrom(handle.sentinel);
  }
}

async function leave(
  driver: Driver,
  state: CompareState,
  neutral: string,
): Promise<void> {
  if (state.kind === 'active') {
    await driver.mouseUp();
  }
  if (state.kind === 'focus-visible') {
    await driver.blur();
  }
  await driver.hover(neutral);
}

/** Only one element can be hovered, pressed, or focused at a time, so cells in an interaction state are measured in turn. */
async function snapshotInState(
  driver: Driver,
  state: CompareState,
  handle: CellHandle,
  properties: readonly string[],
  neutral: string,
): Promise<Snapshot> {
  await enter(driver, state, handle);
  await nextFrame();
  assertInState(handle, state);
  const snap = snapshot(handle, properties);
  await leave(driver, state, neutral);
  return snap;
}

function collect(
  spec: CompareSpec,
  row: CompareRow,
  mode: string,
  target: TargetId,
  reference: Snapshot,
  candidate: Snapshot,
  properties: readonly string[],
  out: Difference[],
): void {
  for (const element of Object.keys(reference)) {
    const a = reference[element];
    const b = candidate[element];
    const base = {
      component: spec.name,
      row: rowKey(row),
      mode,
      target,
      element,
    };
    if (!a || !b) {
      out.push({
        ...base,
        property: '(element)',
        expected: a ? 'present' : 'missing',
        actual: b ? 'present' : 'missing',
      });
      continue;
    }
    for (const d of diffComputed(a, b, properties)) {
      out.push({ ...base, ...d });
    }
  }
}

/**
 * The rendered comparison. For every configured mode and every row: put the
 * css cell in the row's state and read the computed values of the listed
 * properties on its root and each slot, then do the same for every non-css
 * cell and record every difference (interaction states need the Vitest
 * browser driver and are skipped in the Storybook UI). One aggregated error
 * at the end lists them all; whatever mode was in force before the play is
 * restored, whether it throws or not.
 */
export async function parityPlay(
  context: PlayContext,
  spec: CompareSpec,
  config: StoriesConfig,
  options: ParityOptions = {},
): Promise<void> {
  const canvas = context.canvasElement;
  const driver = await getDriver();
  const ignore = new Set(options.ignore ?? []);
  const properties = config.parityProperties.filter((p) => !ignore.has(p));
  const neutral = `[data-parity-neutral="${spec.name}"]`;
  const candidates = targetsFor(spec).filter((t) => t !== 'css');
  const differences: Difference[] = [];
  const before = currentMode(config.mode);
  let skipped = 0;
  try {
    await nextFrame();
    for (const mode of config.modes) {
      applyMode(config.mode, mode);
      await nextFrame();
      for (const row of rowsFor(spec)) {
        const state = spec.states.find((s) => s.name === row.state);
        const interactive = state !== undefined && state.kind !== 'attribute';
        if (interactive && !driver) {
          skipped += 1;
          continue;
        }
        const reference = cell(canvas, spec, config, 'css', row);
        const read = async (handle: CellHandle): Promise<Snapshot> => {
          if (interactive && driver && state) {
            return snapshotInState(driver, state, handle, properties, neutral);
          }
          if (state) {
            assertInState(handle, state);
          }
          return snapshot(handle, properties);
        };
        // Read once, not once per candidate: the css cell is the reference
        // for every target in this row.
        const a = await read(reference);
        for (const target of candidates) {
          const b = await read(cell(canvas, spec, config, target, row));
          collect(spec, row, mode, target, a, b, properties, differences);
        }
      }
    }
  } finally {
    if (before === null) {
      clearMode(config.mode, config.modes);
    } else {
      applyMode(config.mode, before);
    }
  }
  if (skipped > 0) {
    // eslint-disable-next-line no-console -- deliberate: tells a Storybook UI user which rows were skipped
    console.info(
      `parity: ${spec.name}: ${skipped} interaction rows skipped outside Vitest browser mode`,
    );
  }
  if (differences.length > 0) {
    throw new Error(formatDifferences(differences));
  }
}
