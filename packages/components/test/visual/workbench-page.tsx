/**
 * The workbench bar over a fake service, for workbench.spec.mjs, Button's bar in the state the
 * URL's hash names:
 *
 * - `#yellow` (the default), `#green`, `#locked` (🟡, approved on Flutter), `#red` (waits on a 🟡
 *   Counter), `#cycle` (waits on a 🔴 Dialog);
 * - `#pending` (a pending edit on Button), `#failing` (one whose checks fail), `#other` (a pending
 *   edit on Dialog);
 * - `#refused` (Approve refused, told as the service tells it: a `failed` event and the error),
 *   `#starting` (503 twice, then `#yellow`'s), `#none` (no service).
 *
 * Every action is recorded on `window.calls` and every read on `window.reads`, for the test to
 * read; `window.emit(type)` sends an event, and `window.setWeb(colour)` changes Button's circle on
 * the web as an approval would. Inspect is not read here (its dialog is the shared scenarios' and
 * workbench-dialog.spec.mjs's): the fake refuses it. The bar is drawn here alone: never on the visual checks' pages, nor in a static Storybook
 * (stories/playground/adapter.tsx).
 */

import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { createRoot } from 'react-dom/client';
import { SolarProvider } from '../../src/SolarProvider.js';
import { DrawnVariant } from '../../stories/variant-stage.js';
import { WorkbenchBar } from '../../stories/workbench/Bar.js';
import {
  WorkbenchRefusal,
  type Colour,
  type Pending,
  type Status,
  type WorkbenchClient,
  type WorkbenchEvent,
} from '../../stories/workbench/client.js';

const mode = location.hash.slice(1) || 'yellow';

interface Fake {
  calls: unknown[][];
  reads: unknown[][];
  emit: (type: WorkbenchEvent['type'], message?: string) => void;
  setWeb: (colour: Colour) => void;
}
const fake = window as unknown as Fake;
const calls: unknown[][] = (fake.calls = []);
const reads: unknown[][] = (fake.reads = []);

const pendingOn = (component: string, over: Partial<Pending> = {}) => ({
  component,
  key: 'root.base.radius',
  value: { token: 'radius.full' },
  was: null,
  deletes: false,
  previousReason: 'Figma rounds it fully',
  failing: null,
  borrowers: ['root.size=sm.radius'],
  ...over,
});

const LOCKS = {
  green: 'approved on web: undo its approval in Storybook to change it',
  locked: 'approved on Flutter: undo its approval in Widgetbook to change it',
} as Record<string, string>;

const status: Status = {
  busy: null,
  pending:
    mode === 'pending'
      ? pendingOn('Button')
      : mode === 'failing'
        ? pendingOn('Button', {
            failing: [
              {
                platform: 'web',
                variant: 'size=md',
                layer: 'root',
                property: 'radius',
                figma: 8,
                drawn: 9999,
              },
              { platform: 'flutter', layer: 'label' },
            ],
          })
        : mode === 'other'
          ? pendingOn('Dialog')
          : null,
  components: {
    Button: {
      web:
        mode === 'green'
          ? 'green'
          : mode === 'red' || mode === 'cycle'
            ? 'red'
            : 'yellow',
      flutter: mode === 'locked' ? 'green' : 'yellow',
      waitsOn: {
        web: mode === 'red' ? ['Counter'] : mode === 'cycle' ? ['Dialog'] : [],
        flutter: [],
      },
      editable: !(mode in LOCKS) && mode !== 'red' && mode !== 'cycle',
      locked: LOCKS[mode] ?? null,
    },
    Counter: {
      web: 'yellow',
      flutter: 'yellow',
      waitsOn: { web: [], flutter: [] },
      editable: true,
      locked: null,
    },
    Dialog: {
      web: 'red',
      flutter: 'red',
      waitsOn: { web: ['Button'], flutter: ['Button'] },
      editable: false,
      locked: 'waits on Button on web',
    },
  },
};

fake.setWeb = (colour) => {
  const button = status.components.Button;
  button.web = colour;
  button.editable = colour === 'yellow';
  button.locked = colour === 'green' ? LOCKS.green : null;
};

// The events, as the service long-polls them: answered at once where there is anything after
// `after`, else when the next is sent.
let seq = 0;
const sent: WorkbenchEvent[] = [];
let wake: (() => void) | null = null;
fake.emit = (type, message) => {
  seq += 1;
  sent.push({ seq, type, message });
  const w = wake;
  wake = null;
  w?.();
};

let starting = mode === 'starting' ? 2 : 0;

const client: WorkbenchClient = {
  health: async () => {
    reads.push(['health']);
    return mode !== 'none';
  },
  status: async () => {
    reads.push(['status']);
    if (starting > 0) {
      starting -= 1;
      throw new WorkbenchRefusal(503, 'the workbench is still starting');
    }
    // A new answer each time, as over HTTP.
    return structuredClone(status);
  },
  inspect: async (_, variant) => {
    reads.push(['inspect', variant]);
    throw new WorkbenchRefusal(404, 'Inspect is not read on this page');
  },
  set: async (b) => {
    calls.push(['set', b]);
    return status;
  },
  keep: async (c, r) => {
    calls.push(['keep', c, r]);
    return { ok: true };
  },
  undo: async (c) => {
    calls.push(['undo', c]);
    return status;
  },
  approve: async (c, p) => {
    calls.push(['approve', c, p]);
    if (mode === 'refused') {
      const why = 'Button waits on Icon: approve those first';
      fake.emit('failed', why);
      fake.emit('changed');
      throw new WorkbenchRefusal(409, why);
    }
    fake.setWeb('green');
    return { ok: true };
  },
  unapprovePreview: async () => ['Button', 'Dialog'],
  unapprove: async (c, p) => {
    calls.push(['unapprove', c, p]);
    fake.setWeb('yellow');
    return ['Button', 'Dialog'];
  },
  report: async (b) => {
    calls.push(['report', b]);
    return { file: 'spec/feedback/button-1.yaml' };
  },
  send: async (b) => {
    calls.push(['send', b]);
    return { file: 'spec/feedback/button-2.yaml' };
  },
  events: (after) =>
    new Promise((ok) => {
      const answer = () =>
        ok({ seq, events: sent.filter((e) => e.seq > after) });
      if (seq !== after) answer();
      else wake = answer;
    }),
};

/** How each component's states are marked, as Storybook's virtual:solar serves STATES (build.mjs). */
declare const __STATES__: Record<string, Record<string, string | null>>;

createRoot(document.getElementById('root')!).render(
  <SolarProvider>
    <WorkbenchBar
      component="Button"
      platform="web"
      controls={{ label: 'Label' }}
      client={client}
      drawVariant={(index, stage) => (
        <DrawnVariant
          component="Button"
          index={index}
          states={__STATES__.Button}
          {...stage}
        />
      )}
    />
    <p id="ready">ready</p>
  </SolarProvider>,
);
